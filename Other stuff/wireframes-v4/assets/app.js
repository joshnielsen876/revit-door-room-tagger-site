/* Living Link v4 — application module
 *
 * Static, no-build, single-file app. Plain ES5/ES2017 only so it works
 * on file:// without a bundler. State persists to localStorage. Data is
 * provided by sibling modules attached to window:
 *   - window.LL_ECOSYSTEMS, window.LL_STAGES   (data/ecosystems.js)
 *   - window.LL_SCENARIOS                       (data/scenarios.js)
 *   - window.LL_GLOSSARY                        (data/glossary.js)
 *   - window.LL_LIBRARY                         (data/library.js)
 *
 * Pages opt into behaviours via small data attributes on <body>:
 *   data-page="welcome|journey|map|ecosystem|scenario|summary|today|notes|library|article|screening|index"
 *   data-scenario-id="scn_..."
 *   data-ecosystem-id="recipient_relationship"
 *   data-article-id="..."
 *
 * The module exposes a small public surface (window.LL) for in-page
 * snippets that need to call into the state — e.g. the journal sheet's
 * Save button, the toggle on the Summary screen.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------- Store

  var STORE_KEY = 'living-link-v4:session';
  var DEFAULT_STATE = {
    version: 1,
    started_at: null,
    last_active_at: null,
    last_scenario_id: null,
    summary_axis: 'stage', // 'stage' | 'stance'
    screening: {},         // { 'recipient_type': 'specific', 'concern': 'relationship', ... }
    responses: {},         // { 'stmt_1_1': { value:'agree'|'disagree'|'unsure', at:Date, scenarioId } }
    journal: [],           // [{ id, scenario_id|null, text, at }]
    visited_scenarios: {}, // { scn_x: true }
    visited_articles: {},  // { article_id: true }
    seen_glossary_terms: {}, // first-encounter tracking
  };

  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return Object.assign({}, DEFAULT_STATE, { started_at: new Date().toISOString() });
      var parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_STATE, parsed);
    } catch (e) {
      console.warn('Could not read session; starting fresh.', e);
      return Object.assign({}, DEFAULT_STATE, { started_at: new Date().toISOString() });
    }
  }

  function saveState() {
    state.last_active_at = new Date().toISOString();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('Could not persist session.', e); }
  }

  function resetState(keepBackup) {
    if (keepBackup) {
      try { localStorage.setItem(STORE_KEY + ':prior', localStorage.getItem(STORE_KEY) || ''); }
      catch (e) { /* ignore */ }
    }
    state = Object.assign({}, DEFAULT_STATE, { started_at: new Date().toISOString() });
    saveState();
  }

  var state = loadState();

  // ---------------------------------------------------------- Data helpers

  function byId(coll, id) {
    for (var i = 0; i < coll.length; i++) { if (coll[i].id === id) return coll[i]; }
    return null;
  }
  function ecosystem(id)   { return byId(window.LL_ECOSYSTEMS, id); }
  function scenario(id)    { return byId(window.LL_SCENARIOS, id); }
  function article(id)     { return byId(window.LL_LIBRARY, id); }
  function glossaryTerm(id){ return byId(window.LL_GLOSSARY, id); }
  function stageByNum(num) {
    for (var i = 0; i < window.LL_STAGES.length; i++) if (window.LL_STAGES[i].num === num) return window.LL_STAGES[i];
    return null;
  }
  function scenariosByEcosystem(eid) {
    return window.LL_SCENARIOS.filter(function (s) {
      return s.ecosystem === eid;
    });
  }
  function scenariosForSubarea(eid, subId) {
    if (!subId || subId === 'all') return scenariosByEcosystem(eid);
    return scenariosByEcosystem(eid).filter(function (s) {
      return (s.sub_areas || []).indexOf(subId) !== -1;
    });
  }

  function responsesForScenario(scn) {
    var out = {};
    if (!scn) return out;
    scn.statements.forEach(function (st) {
      if (state.responses[st.id]) out[st.id] = state.responses[st.id];
    });
    return out;
  }
  function answeredStatements() {
    var ids = Object.keys(state.responses);
    return ids.map(function (sid) {
      var r = state.responses[sid];
      var scn = scenario(r.scenarioId);
      if (!scn) return null;
      var st = null;
      for (var i = 0; i < scn.statements.length; i++) if (scn.statements[i].id === sid) { st = scn.statements[i]; break; }
      if (!st) return null;
      return { statement: st, scenario: scn, response: r };
    }).filter(Boolean);
  }

  // ------------------------------------------------------ Summary derivation

  function summaryByStage() {
    var groups = {};
    answeredStatements().forEach(function (entry) {
      if (entry.response.value === 'unsure') return;       // open items handled below
      var stg = entry.scenario.stage;
      if (!groups[stg]) groups[stg] = [];
      groups[stg].push(entry);
    });
    state.journal.forEach(function (note) {
      if (!note.scenario_id) return;
      var scn = scenario(note.scenario_id);
      if (!scn) return;
      var stg = scn.stage;
      if (!groups[stg]) groups[stg] = [];
      groups[stg].push({ journal: note, scenario: scn });
    });
    var orderedKeys = Object.keys(groups).map(Number).sort(function (a, b) { return a - b; });
    return orderedKeys.map(function (k) { return { stage: stageByNum(k), entries: groups[k] }; });
  }

  function summaryByStance() {
    var groups = { will: [], wont: [], condition: [] };
    answeredStatements().forEach(function (entry) {
      if (entry.response.value === 'unsure') return;
      var stance = mappedStance(entry.statement, entry.response.value);
      if (groups[stance]) groups[stance].push(entry);
    });
    return [
      { key: 'will',      title: 'Conditions under which I’d donate',     entries: groups.will },
      { key: 'condition', title: 'Conditions I would set',                 entries: groups.condition },
      { key: 'wont',      title: 'Things that would stop me',              entries: groups.wont },
    ].filter(function (g) { return g.entries.length > 0; });
  }

  // Map a (statement.stance, user-response) to the summary's stance bucket.
  // statement.stance describes the polarity of the statement itself.
  // If the user agrees, the bucket follows the statement's stance.
  // If the user disagrees, the bucket flips.
  function mappedStance(statement, value) {
    var s = statement.stance;
    if (value === 'agree') return s === 'wont' ? 'wont' : (s === 'condition' ? 'condition' : 'will');
    if (value === 'disagree') {
      if (s === 'will')      return 'wont';
      if (s === 'wont')      return 'will';
      if (s === 'condition') return 'condition'; // disagreeing with a condition is still a conditional position
    }
    return 'condition';
  }

  function openQuestions() {
    var out = [];
    answeredStatements().forEach(function (entry) {
      if (entry.response.value !== 'unsure') return;
      out.push(entry);
    });
    return out;
  }

  function coverage() {
    var counts = {};
    window.LL_ECOSYSTEMS.forEach(function (e) { counts[e.id] = { seen: 0, total: scenariosByEcosystem(e.id).length }; });
    Object.keys(state.visited_scenarios).forEach(function (sid) {
      var scn = scenario(sid); if (!scn) return;
      counts[scn.ecosystem].seen += 1;
    });
    return counts;
  }

  // ------------------------------------------------------------- Responses

  function setResponse(scenarioId, statementId, value) {
    state.responses[statementId] = { value: value, at: new Date().toISOString(), scenarioId: scenarioId };
    state.visited_scenarios[scenarioId] = true;
    state.last_scenario_id = scenarioId;
    saveState();
  }

  // ------------------------------------------------------------- Journal

  function addJournalNote(text, scenarioId) {
    text = (text || '').trim();
    if (!text) return null;
    var note = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      scenario_id: scenarioId || null,
      text: text,
      at: new Date().toISOString(),
    };
    state.journal.unshift(note);
    saveState();
    return note;
  }
  function deleteJournalNote(id) {
    state.journal = state.journal.filter(function (n) { return n.id !== id; });
    saveState();
  }
  function journalForScenario(scenarioId) {
    return state.journal.filter(function (n) { return n.scenario_id === scenarioId; });
  }

  // -------------------------------------------------------- Glossary helpers

  // Linkify a stem string: wrap aliases of glossary terms in <button> footnotes.
  // Only the first occurrence of each term gets a footnote, to keep the prose calm.
  function linkifyStem(stem, termIds) {
    if (!termIds || !termIds.length) return escapeHtml(stem).replace(/\n/g, '<br><br>');
    var html = escapeHtml(stem);
    termIds.forEach(function (tid) {
      var t = glossaryTerm(tid); if (!t) return;
      // Try each alias longest-first, case-insensitive, first-occurrence only.
      var aliases = (t.aliases || [t.term]).slice().sort(function (a, b) { return b.length - a.length; });
      var matched = false;
      aliases.forEach(function (alias) {
        if (matched) return;
        var re = new RegExp('\\b(' + alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'i');
        var m = html.match(re);
        if (!m) return;
        var btn = '<button type="button" class="footnote" data-glossary="' + t.id + '" aria-label="Show definition of ' + escapeAttr(t.term) + '">' + m[1] + '</button>';
        html = html.replace(re, btn);
        matched = true;
      });
    });
    return html.replace(/\n/g, '<br><br>');
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ---------------------------------------------------------------- Toast

  var toastTimer = null;
  function showToast(msg, href, label) {
    var t = document.getElementById('toast');
    if (!t) return;
    var text = t.querySelector('.toast__text');
    var link = t.querySelector('.toast__link');
    if (text) text.textContent = msg;
    if (link) {
      if (href) {
        link.setAttribute('href', href);
        link.textContent = label || 'See it';
        link.style.display = '';
      } else {
        link.style.display = 'none';
      }
    }
    t.setAttribute('data-open', 'true');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.setAttribute('data-open', 'false'); }, 3200);
  }

  // ------------------------------------------------------ Glossary popover

  function ensurePopover() {
    var p = document.getElementById('glossary-popover');
    if (p) return p;
    p = document.createElement('div');
    p.id = 'glossary-popover';
    p.className = 'glossary-popover';
    p.setAttribute('role', 'dialog');
    p.innerHTML = ''
      + '<p class="glossary-popover__term"></p>'
      + '<p class="glossary-popover__def"></p>'
      + '<div class="glossary-popover__actions">'
      +   '<a class="glossary-popover__read" href="#">Read more in the library</a>'
      +   '<button class="button button--quiet glossary-popover__close" type="button">Close</button>'
      + '</div>';
    document.body.appendChild(p);
    p.querySelector('.glossary-popover__close').addEventListener('click', hidePopover);
    document.addEventListener('click', function (e) {
      if (!p.matches('[data-open="true"]')) return;
      if (e.target.closest('#glossary-popover') || e.target.closest('.footnote')) return;
      hidePopover();
    });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') hidePopover(); });
    window.addEventListener('resize', hidePopover);
    return p;
  }
  function hidePopover() {
    var p = document.getElementById('glossary-popover');
    if (p) p.setAttribute('data-open', 'false');
  }
  function showPopover(anchorBtn, term) {
    var p = ensurePopover();
    p.querySelector('.glossary-popover__term').textContent = term.term;
    p.querySelector('.glossary-popover__def').textContent = term.short_def;
    var read = p.querySelector('.glossary-popover__read');
    if (term.library_article_id) {
      read.style.display = '';
      read.setAttribute('href', '09-article.html?id=' + encodeURIComponent(term.library_article_id));
    } else {
      read.style.display = 'none';
    }
    // Position above the anchor on desktop; bottom sheet on phone widths.
    p.setAttribute('data-open', 'true');
    if (window.innerWidth < 520) {
      p.style.left = '8px'; p.style.right = '8px'; p.style.top = 'auto'; p.style.bottom = '12px';
      p.style.maxWidth = 'none';
    } else {
      var rect = anchorBtn.getBoundingClientRect();
      var top = rect.top + window.scrollY - 12;
      var left = rect.left + window.scrollX - 8;
      p.style.maxWidth = '360px';
      p.style.left = Math.max(8, Math.min(left, window.innerWidth - 380)) + 'px';
      p.style.top = (top - 140) + 'px';
      p.style.bottom = 'auto'; p.style.right = 'auto';
    }
  }

  // --------------------------------------------------- Mandated-reading drawer

  function ensureDrawer() {
    if (document.getElementById('drawer-overlay')) return;
    var overlay = document.createElement('div');
    overlay.id = 'drawer-overlay';
    overlay.className = 'drawer-overlay';
    overlay.addEventListener('click', closeDrawer);
    document.body.appendChild(overlay);

    var drawer = document.createElement('aside');
    drawer.id = 'drawer';
    drawer.className = 'drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-labelledby', 'drawer-title');
    drawer.innerHTML = ''
      + '<div class="drawer__handle"></div>'
      + '<header class="drawer__header">'
      +   '<div>'
      +     '<p class="drawer__eyebrow">Worth reading before you respond</p>'
      +     '<h2 class="drawer__title" id="drawer-title">Article</h2>'
      +   '</div>'
      +   '<button type="button" class="button button--quiet drawer__close" aria-label="Close">×</button>'
      + '</header>'
      + '<div class="drawer__body" tabindex="-1"></div>'
      + '<footer class="drawer__footer">'
      +   '<span class="drawer__ack">When you’re ready, you can return to the story.</span>'
      +   '<span style="flex:1"></span>'
      +   '<button type="button" class="button button--primary drawer__done">Got it — back to the story</button>'
      + '</footer>';
    document.body.appendChild(drawer);
    drawer.querySelector('.drawer__close').addEventListener('click', closeDrawer);
    drawer.querySelector('.drawer__done').addEventListener('click', closeDrawer);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  }
  var drawerCloseCallback = null;
  function openArticleDrawer(articleId, opts) {
    ensureDrawer();
    var a = article(articleId); if (!a) return;
    state.visited_articles[a.id] = true; saveState();
    drawerCloseCallback = (opts && typeof opts.onClose === 'function') ? opts.onClose : null;
    var d = document.getElementById('drawer');
    d.querySelector('.drawer__title').textContent = a.title;
    var body = d.querySelector('.drawer__body');
    body.innerHTML = articleBodyHtml(a);
    document.getElementById('drawer-overlay').setAttribute('data-open', 'true');
    d.setAttribute('data-open', 'true');
    setTimeout(function () { body.focus(); }, 60);
  }
  function closeDrawer() {
    var d = document.getElementById('drawer');
    var o = document.getElementById('drawer-overlay');
    if (d) d.setAttribute('data-open', 'false');
    if (o) o.setAttribute('data-open', 'false');
    var cb = drawerCloseCallback; drawerCloseCallback = null;
    if (cb) cb();
  }
  function articleBodyHtml(a) {
    var html = '';
    if (a.summary) html += '<p class="article__summary">' + escapeHtml(a.summary) + '</p>';
    a.body.forEach(function (section) {
      if (section.heading) html += '<h3>' + escapeHtml(section.heading) + '</h3>';
      section.paragraphs.forEach(function (p) { html += '<p>' + escapeHtml(p) + '</p>'; });
    });
    html += '<p class="article__status">Status: ' + escapeHtml(a.review_status || 'pending review') + '. Not authoritative outside the prototype.</p>';
    return html;
  }

  // -------------------------------------------------------- Journal sheet

  function ensureJournalSheet() {
    if (document.getElementById('journal-overlay')) return;
    var overlay = document.createElement('div');
    overlay.id = 'journal-overlay';
    overlay.className = 'drawer-overlay';
    overlay.addEventListener('click', closeJournalSheet);
    document.body.appendChild(overlay);

    var sheet = document.createElement('aside');
    sheet.id = 'journal-sheet';
    sheet.className = 'drawer drawer--journal';
    sheet.setAttribute('role', 'dialog');
    sheet.innerHTML = ''
      + '<div class="drawer__handle"></div>'
      + '<header class="drawer__header">'
      +   '<div>'
      +     '<p class="drawer__eyebrow"><span class="js-journal-context">Take a note</span></p>'
      +     '<h2 class="drawer__title">A note in your own words</h2>'
      +   '</div>'
      +   '<button type="button" class="button button--quiet drawer__close" aria-label="Close">×</button>'
      + '</header>'
      + '<div class="drawer__body">'
      +   '<label class="visually-hidden" for="journal-textarea">Your note</label>'
      +   '<textarea id="journal-textarea" class="notes-area" placeholder="Anything that came up while you were reading. The note is yours; it appears in your summary alongside the story it came from."></textarea>'
      + '</div>'
      + '<footer class="drawer__footer">'
      +   '<label class="journal-tag"><input type="checkbox" class="js-journal-tag" checked> Tag to this story</label>'
      +   '<span style="flex:1"></span>'
      +   '<button type="button" class="button button--ghost drawer__close">Cancel</button>'
      +   '<button type="button" class="button button--primary js-journal-save">Save note</button>'
      + '</footer>';
    document.body.appendChild(sheet);
    sheet.querySelectorAll('.drawer__close').forEach(function (b) { b.addEventListener('click', closeJournalSheet); });
    sheet.querySelector('.js-journal-save').addEventListener('click', function () {
      var ta = sheet.querySelector('#journal-textarea');
      var tag = sheet.querySelector('.js-journal-tag');
      var sid = sheet.getAttribute('data-scenario-id');
      var note = addJournalNote(ta.value, (tag && tag.checked) ? sid : null);
      if (note) {
        closeJournalSheet();
        showToast('Note saved to your summary', '06-summary.html', 'See it');
      }
    });
  }
  function openJournalSheet(scenarioId) {
    ensureJournalSheet();
    var sheet = document.getElementById('journal-sheet');
    var overlay = document.getElementById('journal-overlay');
    sheet.setAttribute('data-scenario-id', scenarioId || '');
    var ctx = sheet.querySelector('.js-journal-context');
    var tag = sheet.querySelector('.js-journal-tag');
    var tagLabel = sheet.querySelector('.journal-tag');
    if (scenarioId) {
      var scn = scenario(scenarioId);
      ctx.textContent = 'While reading ' + (scn ? scn.protagonist : 'this story');
      if (tag) tag.checked = true;
      if (tagLabel) tagLabel.style.display = '';
    } else {
      ctx.textContent = 'A free note';
      if (tag) tag.checked = false;
      if (tagLabel) tagLabel.style.display = 'none';
    }
    var ta = sheet.querySelector('#journal-textarea'); if (ta) ta.value = '';
    overlay.setAttribute('data-open', 'true');
    sheet.setAttribute('data-open', 'true');
    setTimeout(function () { if (ta) ta.focus(); }, 80);
  }
  function closeJournalSheet() {
    var sheet = document.getElementById('journal-sheet');
    var overlay = document.getElementById('journal-overlay');
    if (sheet) sheet.setAttribute('data-open', 'false');
    if (overlay) overlay.setAttribute('data-open', 'false');
  }

  // ----------------------------------------------------- Tab-bar coverage

  function updateTabbar() {
    var bar = document.querySelector('.tab-bar');
    if (!bar) return;
    var summary = bar.querySelector('[data-tab="summary"]');
    if (summary) {
      if (Object.keys(state.responses).length === 0 && state.journal.length === 0) {
        summary.setAttribute('aria-disabled', 'true');
      } else {
        summary.removeAttribute('aria-disabled');
      }
    }
  }

  // ============================================================ RENDERERS

  // -- Welcome ------------------------------------------------------------

  function renderWelcome() {
    var cta = document.querySelector('[data-welcome-cta]');
    if (!cta) return;
    var hasState = Object.keys(state.responses).length > 0 || state.journal.length > 0;
    if (hasState) {
      cta.textContent = 'Pick up where you left off \u2192';
      cta.setAttribute('href', '07-today.html');
    }

    var intentGroup = document.querySelector('[data-screening-q="intent"]');
    if (intentGroup) {
      intentGroup.addEventListener('click', function (e) {
        var btn = e.target.closest('.choice'); if (!btn) return;
        var val = btn.getAttribute('data-value');
        state.screening.intent = val;
        saveState();
        intentGroup.querySelectorAll('.choice').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
      });
      var saved = state.screening.intent;
      if (saved) {
        var btn = intentGroup.querySelector('.choice[data-value="' + saved + '"]');
        if (btn) btn.setAttribute('aria-pressed', 'true');
      }
    }
  }

  // -- Screening ----------------------------------------------------------

  function renderScreening() {
    // Wire all the choice buttons as a tiny state machine that writes to
    // state.screening on every change. Form submit redirects to map.
    var groups = document.querySelectorAll('[data-screening-q]');
    groups.forEach(function (g) {
      var key = g.getAttribute('data-screening-q');
      g.addEventListener('click', function (e) {
        var btn = e.target.closest('.choice'); if (!btn) return;
        var val = btn.getAttribute('data-value');
        var multi = g.getAttribute('data-multi') === 'true';
        if (multi) {
          var existing = state.screening[key] || [];
          if (existing.indexOf(val) === -1) existing.push(val); else existing = existing.filter(function (v) { return v !== val; });
          state.screening[key] = existing;
          btn.setAttribute('aria-pressed', existing.indexOf(val) !== -1 ? 'true' : 'false');
        } else {
          state.screening[key] = val;
          g.querySelectorAll('.choice').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        }
        saveState();
      });
      // Restore from state
      var saved = state.screening[key];
      if (!saved) return;
      var values = Array.isArray(saved) ? saved : [saved];
      values.forEach(function (v) {
        var btn = g.querySelector('.choice[data-value="' + v + '"]');
        if (btn) btn.setAttribute('aria-pressed', 'true');
      });
    });
  }

  // -- Map ----------------------------------------------------------------

  function renderMap() {
    // The exhibit-hall tiles get counts and a "seen X/Y" badge from state.
    document.querySelectorAll('.zone').forEach(function (zone) {
      var eid = zone.getAttribute('data-ecosystem-id');
      var c = coverage()[eid];
      if (!c) return;
      var countEl = zone.querySelector('.zone__count strong');
      if (countEl) countEl.textContent = c.total + ' stories';
      if (c.seen > 0) {
        var meta = zone.querySelector('.zone__count');
        if (meta) meta.innerHTML = '<strong>' + c.total + ' stories</strong> · ' + c.seen + ' read';
      }
    });
    var intent = state.screening.intent;
    document.querySelectorAll('.zone').forEach(function (zone) {
      var eid = zone.getAttribute('data-ecosystem-id');
      if (intent === 'specific' && eid === 'recipient_relationship') {
        zone.classList.add('zone--suggested');
      } else if (intent === 'exploring') {
        zone.classList.remove('zone--suggested');
      } else if (!intent && eid === 'recipient_relationship') {
        zone.classList.add('zone--suggested');
      } else {
        zone.classList.remove('zone--suggested');
      }
    });
  }

  // -- Ecosystem detail ---------------------------------------------------

  function renderEcosystem() {
    var eid = document.body.getAttribute('data-ecosystem-id');
    var eco = ecosystem(eid); if (!eco) return;
    document.querySelectorAll('[data-eco-title]').forEach(function (el) {
      el.textContent = eco.title;
    });
    document.querySelectorAll('[data-eco-what]').forEach(function (el) {
      el.textContent = eco.what;
    });

    // Sub-area chips
    var chips = document.querySelector('[data-subarea-chips]');
    if (chips) {
      var current = chips.getAttribute('data-current') || 'all';
      var html = '<li><a href="#" data-sub="all" aria-pressed="' + (current === 'all' ? 'true' : 'false') + '">All <span class="count">' + scenariosByEcosystem(eid).length + '</span></a></li>';
      eco.sub_areas.forEach(function (sa) {
        var n = scenariosForSubarea(eid, sa.id).length;
        if (n === 0) return;
        html += '<li><a href="#" data-sub="' + sa.id + '" aria-pressed="' + (current === sa.id ? 'true' : 'false') + '">' + escapeHtml(sa.label) + ' <span class="count">' + n + '</span></a></li>';
      });
      chips.innerHTML = html;
      chips.addEventListener('click', function (e) {
        var a = e.target.closest('a[data-sub]'); if (!a) return;
        e.preventDefault();
        chips.setAttribute('data-current', a.getAttribute('data-sub'));
        renderEcosystem();
      });
    }

    var current = chips ? chips.getAttribute('data-current') || 'all' : 'all';
    var list = document.querySelector('[data-story-list]');
    if (!list) return;
    var stories = scenariosForSubarea(eid, current);
    if (stories.length === 0) {
      list.innerHTML = '<li class="muted" style="padding:1rem 0">No stories yet in this sub-area.</li>';
      return;
    }
    list.innerHTML = stories.map(function (s) {
      var seen = state.visited_scenarios[s.id];
      var stCount = s.statements.length + ' statement' + (s.statements.length === 1 ? '' : 's');
      return ''
        + '<li>'
        +   '<a class="story-row" href="05-scenario.html?id=' + encodeURIComponent(s.id) + '">'
        +     '<div>'
        +       '<p class="story-row__title">' + escapeHtml(s.title) + '</p>'
        +       '<ul class="story-row__tags">'
        +         (s.sub_areas || []).map(function (sa) {
                    var subLabel = (eco.sub_areas.find(function (x) { return x.id === sa; }) || {}).label || sa;
                    return '<li>' + escapeHtml(subLabel) + '</li>';
                  }).join('')
        +       '</ul>'
        +     '</div>'
        +     '<div class="story-row__state' + (seen ? ' story-row__state--seen' : '') + '">' + (seen ? '✓ Read' : stCount) + '</div>'
        +   '</a>'
        + '</li>';
    }).join('');
  }

  // -- Scenario card ------------------------------------------------------

  function renderScenario() {
    var sid = qsParam('id') || document.body.getAttribute('data-scenario-id');
    var scn = scenario(sid);
    if (!scn) {
      var main = document.querySelector('.app-main');
      if (main) main.innerHTML = '<p>Story not found. <a href="03-map.html">Back to the map</a>.</p>';
      return;
    }

    state.last_scenario_id = scn.id;
    state.visited_scenarios[scn.id] = true;
    saveState();

    // Header context
    var sub = document.querySelector('.brand__sub');
    if (sub) {
      var idx = window.LL_SCENARIOS.indexOf(scn) + 1;
      sub.textContent = 'Story ' + idx + ' of ' + window.LL_SCENARIOS.length + ' · ' + ecosystem(scn.ecosystem).title;
    }
    // Crumbs
    var crumbs = document.querySelector('[data-crumbs]');
    if (crumbs) {
      crumbs.innerHTML = ''
        + '<a href="03-map.html">Map</a>'
        + '<span class="crumbs__sep">›</span>'
        + '<a href="04-ecosystem.html?id=' + encodeURIComponent(scn.ecosystem) + '">' + escapeHtml(ecosystem(scn.ecosystem).title) + '</a>'
        + '<span class="crumbs__sep">›</span>'
        + '<span class="crumbs__current">' + escapeHtml(scn.protagonist) + '</span>';
    }

    var card = document.querySelector('[data-component="scenario"]');
    if (!card) return;

    var subAreaLabel = scn.sub_areas && scn.sub_areas[0]
      ? ((ecosystem(scn.ecosystem).sub_areas.find(function (x) { return x.id === scn.sub_areas[0]; }) || {}).label || scn.sub_areas[0])
      : '';
    var stage = stageByNum(scn.stage);
    var mandated = scn.mandated_read_article_id ? article(scn.mandated_read_article_id) : null;

    var mandatedAcknowledged = !mandated || !!state.visited_articles[mandated.id];

    card.innerHTML = ''
      + '<p class="scenario__eyebrow">'
      +   '<span class="stage">Stage ' + scn.stage + '</span>'
      +   '<span>' + escapeHtml(stage ? stage.title : '') + '</span>'
      +   (subAreaLabel ? '<span class="sep">·</span><span>' + escapeHtml(subAreaLabel) + '</span>' : '')
      + '</p>'
      + '<h1 class="scenario__protagonist">' + escapeHtml(scn.protagonist) + '</h1>'
      + '<p class="scenario__stem">' + linkifyStem(scn.stem, scn.glossary_term_ids) + '</p>'
      + (mandated
          ? '<button type="button" class="mandated-call' + (mandatedAcknowledged ? ' mandated-call--done' : ' mandated-call--required') + '" data-article="' + escapeAttr(mandated.id) + '">'
          +   '<span class="mandated-call__eyebrow">' + (mandatedAcknowledged ? '\u2713 You\u2019ve read this' : 'Read before you respond') + '</span>'
          +   '<span class="mandated-call__title">' + escapeHtml(mandated.title) + ' \u2192</span>'
          + '</button>'
          : '')
      + (mandated && !mandatedAcknowledged
          ? '<div class="mandated-gate" role="status">Open the article above before you respond to the statements.</div>'
          : '')
      + '<p class="scenario__prompt"' + (mandated && !mandatedAcknowledged ? ' hidden' : '') + '>'
      +   '<span>Where do you stand?</span>'
      +   '<span class="pip" aria-hidden="true">'
      +     scn.statements.map(function () { return '<span></span>'; }).join('')
      +   '</span>'
      + '</p>'
      + scn.statements.map(function (st, i) {
          var hidden = (mandated && !mandatedAcknowledged) || i !== 0;
          return ''
            + '<div class="statement" data-statement-id="' + escapeAttr(st.id) + '"' + (hidden ? ' hidden' : '') + '>'
            +   '<p class="statement__text">' + escapeHtml(st.text) + '</p>'
            +   '<div class="choices" role="radiogroup" aria-label="Response to statement ' + (i + 1) + '">'
            +     '<button class="choice" type="button" data-value="agree" aria-pressed="false">Agree</button>'
            +     '<button class="choice" type="button" data-value="disagree" aria-pressed="false">Disagree</button>'
            +     '<button class="choice" type="button" data-value="unsure" aria-pressed="false">Not sure yet</button>'
            +   '</div>'
            + '</div>';
        }).join('')
      + '<div class="whats-next" hidden>'
      +   '<p class="whats-next__title">What’s next?</p>'
      +   '<div class="whats-next__options">'
      +     '<a class="whats-next__option" href="' + nextScenarioHref(scn) + '">'
      +       '<strong>Another story like this</strong><span class="hint">Stay in ' + escapeHtml(ecosystem(scn.ecosystem).title) + '.</span>'
      +     '</a>'
      +     '<a class="whats-next__option" href="03-map.html">'
      +       '<strong>A different kind of question</strong><span class="hint">Back to the map.</span>'
      +     '</a>'
      +     '<a class="whats-next__option" href="06-summary.html">'
      +       '<strong>See your summary</strong><span class="hint">Your words so far.</span>'
      +     '</a>'
      +     (function () {
          var hasUnread = unreadScenarios(scn.id).length > 0;
          return ''
            + '<button class="whats-next__option" type="button" data-pick-next-scenario'
            +   (hasUnread ? '' : ' disabled aria-disabled="true"')
            + '>'
            +   '<strong>Choose the next scenario for me</strong>'
            +   '<span class="hint">' + (hasUnread ? 'A random story you haven\u2019t read yet.' : 'You\u2019ve read every story.') + '</span>'
            + '</button>';
        })()
      +   '</div>'
      + '</div>'
      + '<button class="note-pill" type="button" data-journal-open>'
      +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h5"/></svg>'
      +   'Add a note about ' + escapeHtml(scn.protagonist)
      + '</button>';

    // Restore prior responses
    var existing = responsesForScenario(scn);
    var statementsEls = card.querySelectorAll('.statement');
    var lastAnsweredIdx = -1;
    statementsEls.forEach(function (el, i) {
      var sid = el.getAttribute('data-statement-id');
      var r = existing[sid];
      if (r) {
        el.classList.add('is-answered');
        var btn = el.querySelector('.choice[data-value="' + r.value + '"]');
        if (btn) btn.setAttribute('aria-pressed', 'true');
        el.hidden = false;
        lastAnsweredIdx = i;
      }
    });
    // Reveal next statement after last answered (or first if none)
    var nextIdx = lastAnsweredIdx + 1;
    if (nextIdx < statementsEls.length) statementsEls[nextIdx].hidden = false;
    paintPip(card, lastAnsweredIdx + 1);
    if (lastAnsweredIdx === statementsEls.length - 1) {
      var wn = card.querySelector('.whats-next'); if (wn) wn.hidden = false;
    }

    // Wire interactions
    card.addEventListener('click', onScenarioClick);
  }

  function onScenarioClick(e) {
    var card = e.currentTarget;

    var pickNextBtn = e.target.closest('[data-pick-next-scenario]');
    if (pickNextBtn) {
      if (pickNextBtn.disabled) return;
      var currentId = qsParam('id') || document.body.getAttribute('data-scenario-id');
      var next = pickRandomUnreadScenario(currentId);
      if (next) location.href = '05-scenario.html?id=' + encodeURIComponent(next.id);
      return;
    }

    var noteBtn = e.target.closest('[data-journal-open]');
    if (noteBtn) {
      var sid = qsParam('id') || document.body.getAttribute('data-scenario-id');
      openJournalSheet(sid);
      return;
    }

    var mandated = e.target.closest('.mandated-call');
    if (mandated) {
      openArticleDrawer(mandated.getAttribute('data-article'), { onClose: function () {
        renderScenario();
      } });
      return;
    }

    var foot = e.target.closest('.footnote');
    if (foot) {
      e.preventDefault();
      var term = glossaryTerm(foot.getAttribute('data-glossary'));
      if (term) showPopover(foot, term);
      return;
    }

    var btn = e.target.closest('.choice');
    if (!btn) return;
    var st = btn.closest('.statement');
    var stmtId = st.getAttribute('data-statement-id');
    var value = btn.getAttribute('data-value');
    var scnId = qsParam('id') || document.body.getAttribute('data-scenario-id');

    // Toggle aria-pressed
    st.querySelectorAll('.choice').forEach(function (c) { c.setAttribute('aria-pressed', c === btn ? 'true' : 'false'); });
    st.classList.add('is-answered');

    setResponse(scnId, stmtId, value);

    var msg = value === 'unsure'
      ? 'Added to your next-conversation agenda'
      : 'Added to your summary';
    showToast(msg, '06-summary.html', 'See it');

    // Advance to next statement
    var statements = Array.prototype.slice.call(card.querySelectorAll('.statement'));
    var idx = statements.indexOf(st);
    var next = statements[idx + 1];
    if (next && next.hidden) {
      setTimeout(function () {
        next.hidden = false;
        next.classList.add('is-entering');
        requestAnimationFrame(function () { next.classList.remove('is-entering'); });
        paintPip(card, idx + 1);
        next.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    } else {
      paintPip(card, idx + 1);
      if (idx === statements.length - 1) {
        var wn = card.querySelector('.whats-next');
        if (wn) {
          setTimeout(function () { wn.hidden = false; wn.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 220);
        }
      }
    }
    updateTabbar();
  }

  function paintPip(card, currentIdx) {
    var pip = card.querySelector('.scenario__prompt .pip');
    if (!pip) return;
    var dots = pip.querySelectorAll('span');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.remove('is-current', 'is-done');
      if (i < currentIdx) dots[i].classList.add('is-done');
      else if (i === currentIdx) dots[i].classList.add('is-current');
    }
  }

  function nextScenarioHref(scn) {
    var siblings = scenariosByEcosystem(scn.ecosystem);
    var unseen = siblings.filter(function (s) { return s.id !== scn.id && !state.visited_scenarios[s.id]; });
    if (unseen.length) return '05-scenario.html?id=' + encodeURIComponent(unseen[0].id);
    var idx = siblings.indexOf(scn);
    var next = siblings[(idx + 1) % siblings.length];
    return '05-scenario.html?id=' + encodeURIComponent(next.id);
  }

  function unreadScenarios(excludeId) {
    return window.LL_SCENARIOS.filter(function (s) {
      return s.id !== excludeId && !state.visited_scenarios[s.id];
    });
  }

  function pickRandomUnreadScenario(excludeId) {
    var unread = unreadScenarios(excludeId);
    if (!unread.length) return null;
    return unread[Math.floor(Math.random() * unread.length)];
  }

  // -- Summary ------------------------------------------------------------

  function renderSummary() {
    renderSummaryBody();

    var toggle = document.querySelector('[data-component="axis-toggle"]');
    if (toggle) {
      toggle.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-axis') === state.summary_axis ? 'true' : 'false');
      });
      toggle.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        state.summary_axis = b.getAttribute('data-axis');
        saveState();
        toggle.querySelectorAll('button').forEach(function (x) {
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        renderSummaryBody();
      });
    }

    // Export wiring
    document.querySelectorAll('[data-export]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var kind = a.getAttribute('data-export');
        if (kind === 'pdf') { e.preventDefault(); window.print(); }
        else if (kind === 'text') { e.preventDefault(); exportPlainText(); }
        else if (kind === 'json') { e.preventDefault(); exportJson(); }
        else if (kind === 'import') { e.preventDefault(); importJson(); }
      });
    });
  }

  function renderCoverage() {
    var holder = document.querySelector('[data-summary-coverage]');
    if (!holder) return;
    var counts = coverage();
    var parts = window.LL_ECOSYSTEMS.map(function (e) {
      var c = counts[e.id];
      return escapeHtml(e.title) + ' ' + c.seen + '/' + c.total;
    });
    var totalSeen = Object.keys(state.visited_scenarios).length;
    var totalAll = window.LL_SCENARIOS.length;
    var pct = totalAll > 0 ? Math.round(100 * totalSeen / totalAll) : 0;
    holder.innerHTML = ''
      + '<div><strong>Coverage.</strong> ' + parts.join(' · ') + '. <a href="03-map.html">Back to the map</a> to keep going.</div>'
      + '<div class="bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div>';
  }

  function renderSummaryBody() {
    var holder = document.querySelector('[data-summary-body]');
    if (!holder) return;

    var hasAny = Object.keys(state.responses).length > 0 || state.journal.length > 0;
    if (!hasAny) {
      holder.innerHTML = ''
        + '<div class="summary-empty">'
        +   '<p>Your summary fills in as you read stories and respond to statements. <a href="03-map.html">Start on the map</a>.</p>'
        + '</div>';
      return;
    }

    var buckets = { agree: [], disagree: [], unsure: [] };
    answeredStatements().forEach(function (entry) {
      var v = entry.response.value;
      if (buckets[v]) buckets[v].push(entry);
    });

    var groups = [
      { key: 'agree',    title: 'Statements you agreed with',           entries: buckets.agree },
      { key: 'disagree', title: 'Statements you disagreed with',        entries: buckets.disagree },
      { key: 'unsure',   title: 'Statements you are still working out', entries: buckets.unsure },
    ];

    var html = groups.filter(function (g) { return g.entries.length > 0; })
      .map(function (g) {
        return ''
          + '<section class="summary-group summary-group--' + g.key + '">'
          +   '<h2 class="summary-group__title">' + escapeHtml(g.title) + '</h2>'
          +   '<ul class="summary-group__list">'
          +     g.entries.map(summaryLineHtml).join('')
          +   '</ul>'
          + '</section>';
      }).join('');

    if (state.journal.length) {
      html += ''
        + '<section class="summary-group summary-group--notes">'
        +   '<h2 class="summary-group__title">Your notes</h2>'
        +   '<ul class="summary-group__list">'
        +     state.journal.map(function (n) {
                var scn = n.scenario_id ? scenario(n.scenario_id) : null;
                return ''
                  + '<li class="summary-line summary-line--note">'
                  +   '<p class="summary-line__text">' + escapeHtml(n.text) + '</p>'
                  +   (scn
                        ? '<a class="summary-line__source" href="05-scenario.html?id=' + encodeURIComponent(scn.id) + '">' + escapeHtml(scn.protagonist) + '</a>'
                        : '')
                  + '</li>';
              }).join('')
        +   '</ul>'
        + '</section>';
    }

    holder.innerHTML = html;
  }

  function summaryLineHtml(entry) {
    return ''
      + '<li class="summary-line">'
      +   '<p class="summary-line__text">' + escapeHtml(entry.statement.text) + '</p>'
      +   '<a class="summary-line__source" href="05-scenario.html?id=' + encodeURIComponent(entry.scenario.id) + '">' + escapeHtml(entry.scenario.protagonist) + '</a>'
      + '</li>';
  }

  function voiceHtml(entry) {
    var cls = 'voice voice--' + (mappedStance(entry.statement, entry.response.value) || 'will');
    return ''
      + '<div class="' + cls + '">'
      +   '<div class="voice__rule"></div>'
      +   '<div class="voice__body">'
      +     '<p class="voice__text">' + escapeHtml(restateAsPolicy(entry.statement, entry.response.value)) + '</p>'
      +     '<p class="voice__byline">From <em>' + escapeHtml(entry.scenario.protagonist) + '</em> · ' + escapeHtml(ecosystem(entry.scenario.ecosystem).title) + '</p>'
      +   '</div>'
      + '</div>';
  }

  function userVoiceHtml(note, scn) {
    var when = scn ? ('in your words, while reading ' + scn.protagonist) : 'in your words';
    return ''
      + '<div class="voice voice--user">'
      +   '<div class="voice__rule"></div>'
      +   '<div class="voice__body">'
      +     '<p class="voice__text">' + escapeHtml(note.text) + '</p>'
      +     '<p class="voice__byline">' + escapeHtml(when) + '</p>'
      +   '</div>'
      + '</div>';
  }

  // Disagreeing with "I would X" becomes "I would not X". The statement
  // bank uses canonical first-person sentences, so a small set of rewrites
  // covers most cases.
  function restateAsPolicy(stmt, value) {
    if (value === 'agree') return stmt.text;
    if (value === 'unsure') return 'Whether ' + lowerFirst(stmt.text.replace(/\.$/, '')) + '.';
    var t = stmt.text;
    if (/^I would not\b/.test(t))   return t.replace(/^I would not\b/, 'I would');
    if (/^I would\b/.test(t))       return t.replace(/^I would\b/, 'I would not');
    if (/^I’d not\b/.test(t))       return t.replace(/^I’d not\b/, 'I would');
    if (/^I’d\b/.test(t))           return t.replace(/^I’d\b/, 'I would not');
    if (/^Having\b/.test(t))        return 'It is not true for me that ' + lowerFirst(t);
    if (/^Religious or ethical/.test(t)) return 'I disagree that ' + lowerFirst(t);
    return 'I disagree: ' + t;
  }
  function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function asAgendaQuestion(text) {
    var clean = text.replace(/\.$/, '');
    if (/^I would not\b/.test(clean)) clean = 'whether ' + lowerFirst(clean.replace(/^I would not\b/, 'I would'));
    else if (/^I would\b/.test(clean)) clean = 'whether ' + lowerFirst(clean);
    else clean = 'whether ' + lowerFirst(clean);
    return clean.charAt(0).toUpperCase() + clean.slice(1) + '.';
  }
  function padNum(n) { return n < 10 ? '0' + n : '' + n; }

  // -- Today --------------------------------------------------------------

  function renderToday() {
    var pickup = document.querySelector('[data-pickup-resume]');
    var explore = document.querySelector('[data-pickup-explore]');
    if (pickup) {
      var last = state.last_scenario_id ? scenario(state.last_scenario_id) : null;
      var unseen = last ? scenariosByEcosystem(last.ecosystem).filter(function (s) { return !state.visited_scenarios[s.id]; }) : [];
      var target = unseen[0] || null;
      if (last && target) {
        pickup.setAttribute('href', '05-scenario.html?id=' + encodeURIComponent(target.id));
        pickup.querySelector('.pickup__title').textContent = target.title;
        pickup.querySelector('.pickup__why').textContent = 'You were partway through ' + ecosystem(last.ecosystem).title + '. ' + target.statements.length + ' statements.';
      } else {
        // Either no last scenario, or every scenario in that ecosystem read.
        var any = window.LL_SCENARIOS.filter(function (s) { return !state.visited_scenarios[s.id]; })[0];
        if (any) {
          pickup.setAttribute('href', '05-scenario.html?id=' + encodeURIComponent(any.id));
          pickup.querySelector('.pickup__title').textContent = any.title;
          pickup.querySelector('.pickup__why').textContent = 'A story you haven’t read yet. ' + any.statements.length + ' statements.';
        } else {
          pickup.querySelector('.pickup__title').textContent = 'You’ve read every story.';
          pickup.querySelector('.pickup__why').textContent = 'Open your summary to see what you’ve worked out.';
          pickup.setAttribute('href', '06-summary.html');
        }
      }
    }
    if (explore) {
      var unvisitedEco = window.LL_ECOSYSTEMS.find(function (e) {
        var inEco = scenariosByEcosystem(e.id);
        return inEco.every(function (s) { return !state.visited_scenarios[s.id]; });
      });
      if (unvisitedEco) {
        explore.setAttribute('href', '04-ecosystem.html?id=' + encodeURIComponent(unvisitedEco.id));
        explore.querySelector('.pickup__title').textContent = unvisitedEco.title;
        explore.querySelector('.pickup__why').textContent = 'An area you haven’t visited. ' + scenariosByEcosystem(unvisitedEco.id).length + ' stories.';
      } else {
        explore.style.display = 'none';
      }
    }

    // Compact summary on the Today page reuses the renderer
    var holder = document.querySelector('[data-summary-body]');
    if (holder) renderSummaryBody();

    var resetBtn = document.querySelector('[data-action="reset"]');
    if (resetBtn) resetBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (confirm('Start fresh? Your current summary will be kept on the device as a backup.')) {
        resetState(true);
        location.href = '01-welcome.html';
      }
    });
  }

  // -- Notes (journal) page ----------------------------------------------

  function renderNotes() {
    var list = document.querySelector('[data-journal-list]');
    if (!list) return;
    if (!state.journal.length) {
      list.innerHTML = '<div class="card card--quiet"><p class="card__eyebrow">No notes yet</p><p>Notes you take while reading appear here. The pill at the foot of a scenario card opens a small sheet that pre-tags the note to that story.</p></div>';
    } else {
      list.innerHTML = state.journal.map(function (n) {
        var scn = n.scenario_id ? scenario(n.scenario_id) : null;
        return ''
          + '<article class="note-card">'
          +   '<header>'
          +     '<p class="note-card__when">' + escapeHtml(formatDate(n.at)) + (scn ? ' · while reading <a href="05-scenario.html?id=' + encodeURIComponent(scn.id) + '">' + escapeHtml(scn.protagonist) + '</a>' : ' · free note') + '</p>'
          +     '<button class="button button--quiet" type="button" data-delete-note="' + escapeAttr(n.id) + '">Delete</button>'
          +   '</header>'
          +   '<p class="note-card__text">' + escapeHtml(n.text) + '</p>'
          + '</article>';
      }).join('');
      list.addEventListener('click', function (e) {
        var b = e.target.closest('[data-delete-note]'); if (!b) return;
        var id = b.getAttribute('data-delete-note');
        if (confirm('Delete this note?')) { deleteJournalNote(id); renderNotes(); }
      });
    }

    var addBtn = document.querySelector('[data-action="add-note"]');
    if (addBtn) addBtn.addEventListener('click', function (e) { e.preventDefault(); openJournalSheet(null); });
  }
  function formatDate(iso) {
    try { return new Date(iso).toLocaleString(); } catch (e) { return iso; }
  }

  // -- Library index & article -------------------------------------------

  function renderLibraryIndex() {
    var list = document.querySelector('[data-library-list]');
    if (!list) return;
    // Group articles by topic
    var topics = {};
    window.LL_LIBRARY.forEach(function (a) {
      (a.topics || ['general']).forEach(function (t) {
        if (!topics[t]) topics[t] = [];
        topics[t].push(a);
      });
    });
    var topicLabels = {
      payment_and_law: 'Money and the law',
      travel_and_lodging: 'Travel and lodging help',
      wage_replacement: 'Help with lost wages',
      paired_exchange: 'Paired exchange and chains',
      evaluation_process: 'How evaluation works',
      donor_advocacy: 'Donor advocacy',
      long_term_outcomes: 'Long-term outcomes',
      donor_experience: 'Donor experience',
      surgical_risk: 'Surgical risk',
      donor_safety: 'Donor safety',
      nondirected_donation: 'Nondirected donation',
      anonymity: 'Anonymity',
      family_conversations: 'Family conversations',
      religious_perspectives: 'Religious and ethical frames',
      ethics: 'Ethics',
      general: 'General',
    };
    var order = ['evaluation_process','donor_advocacy','long_term_outcomes','surgical_risk','paired_exchange','nondirected_donation','anonymity','family_conversations','religious_perspectives','payment_and_law','travel_and_lodging','wage_replacement','ethics','donor_experience','donor_safety','general'];
    var html = '';
    order.forEach(function (t) {
      if (!topics[t]) return;
      var seen = {};
      var items = topics[t].filter(function (a) { if (seen[a.id]) return false; seen[a.id] = true; return true; });
      html += '<section class="library-section">'
        + '<h2 class="library-section__title">' + escapeHtml(topicLabels[t] || t) + '</h2>'
        + '<ul class="library-list">'
        + items.map(function (a) {
            return '<li class="library-item">'
              + '<a class="library-item__link" href="09-article.html?id=' + encodeURIComponent(a.id) + '">'
              +   '<p class="library-item__title">' + escapeHtml(a.title) + '</p>'
              +   '<p class="library-item__summary">' + escapeHtml(a.summary || '') + '</p>'
              +   '<p class="library-item__meta"><span class="chip chip--review">' + escapeHtml(a.review_status || 'pending review') + '</span>' + (state.visited_articles[a.id] ? ' <span class="chip chip--seen">read</span>' : '') + '</p>'
              + '</a>'
              + '</li>';
          }).join('')
        + '</ul>'
        + '</section>';
    });
    list.innerHTML = html;
  }

  function renderArticlePage() {
    var aid = qsParam('id');
    var a = article(aid);
    var holder = document.querySelector('[data-article-body]');
    if (!holder) return;
    if (!a) {
      holder.innerHTML = '<p>Article not found. <a href="08-library.html">Back to the library</a>.</p>';
      return;
    }
    state.visited_articles[a.id] = true; saveState();
    var sub = document.querySelector('.brand__sub'); if (sub) sub.textContent = 'Library';
    holder.innerHTML = ''
      + '<h1 class="display" style="font-family:var(--font-serif); font-weight:500; font-size:2rem; letter-spacing:-0.015em; margin:0 0 0.5rem;">' + escapeHtml(a.title) + '</h1>'
      + '<p class="muted" style="margin-bottom:1.4rem">' + escapeHtml(a.summary || '') + '</p>'
      + '<div class="article-body">' + a.body.map(function (s) {
          return (s.heading ? '<h2>' + escapeHtml(s.heading) + '</h2>' : '')
            + s.paragraphs.map(function (p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('');
        }).join('') + '</div>'
      + (a.related_article_ids && a.related_article_ids.length
          ? '<div class="related"><h3>Related</h3><ul>' + a.related_article_ids.map(function (rid) {
              var r = article(rid); if (!r) return '';
              return '<li><a href="09-article.html?id=' + encodeURIComponent(r.id) + '">' + escapeHtml(r.title) + '</a></li>';
            }).join('') + '</ul></div>'
          : '')
      + '<p class="disclaimer">Status: ' + escapeHtml(a.review_status || 'pending review') + '. Library content is not authoritative outside the prototype.</p>';
  }

  // -------------------------------------------------------------- Exports

  function exportPlainText() {
    var lines = [];
    lines.push('WILD: my donation policy');
    if (state.last_active_at) lines.push('Last edited: ' + state.last_active_at);
    lines.push('');

    var buckets = { agree: [], disagree: [], unsure: [] };
    answeredStatements().forEach(function (entry) {
      var v = entry.response.value;
      if (buckets[v]) buckets[v].push(entry);
    });

    function block(title, entries) {
      if (!entries.length) return;
      lines.push(title);
      entries.forEach(function (e) {
        lines.push('  - ' + e.statement.text + '  (' + e.scenario.protagonist + ')');
      });
      lines.push('');
    }

    block('Statements you agreed with', buckets.agree);
    block('Statements you disagreed with', buckets.disagree);
    block('Statements you are still working out', buckets.unsure);

    if (state.journal.length) {
      lines.push('Your notes');
      state.journal.forEach(function (n) {
        var scn = n.scenario_id ? scenario(n.scenario_id) : null;
        lines.push('  - ' + n.text + (scn ? '  (' + scn.protagonist + ')' : ''));
      });
      lines.push('');
    }

    downloadText(lines.join('\n'), 'wild-summary.txt', 'text/plain');
  }

  function exportJson() {
    downloadText(JSON.stringify(state, null, 2), 'wild-session.json', 'application/json');
  }

  function downloadText(content, filename, mime) {
    var blob = new Blob([content], { type: mime + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  }

  function importJson() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', function () {
      var f = input.files && input.files[0]; if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(String(reader.result));
          if (!data || typeof data !== 'object') throw new Error('bad shape');
          state = Object.assign({}, DEFAULT_STATE, data);
          saveState();
          location.reload();
        } catch (e) { alert('Could not import this file.'); }
      };
      reader.readAsText(f);
    });
    input.click();
  }

  // ----------------------------------------------------------- URL helpers

  function qsParam(name) {
    var m = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  // -------------------------------------------------------------- Public

  window.LL = {
    state: function () { return state; },
    openJournalSheet: openJournalSheet,
    openArticleDrawer: openArticleDrawer,
    showToast: showToast,
    reset: function () { resetState(true); },
  };

  // --------------------------------------------------------------- Boot

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page');
    updateTabbar();

    switch (page) {
      case 'welcome':   renderWelcome();   break;
      case 'screening': renderScreening(); break;
      case 'map':       renderMap();       break;
      case 'ecosystem': renderEcosystem(); break;
      case 'scenario':  renderScenario();  break;
      case 'summary':   renderSummary();   break;
      case 'today':     renderToday();     break;
      case 'notes':     renderNotes();     break;
      case 'library':   renderLibraryIndex(); break;
      case 'article':   renderArticlePage();  break;
      default: /* index/journey: nothing dynamic */ break;
    }
  });
})();
