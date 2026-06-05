// Living Link v4 — ecosystems data
// The five zones of the zoo map. Order is the order they appear on the map.
// The first zone (recipient_relationship) is the "suggested" zone by default;
// see app.js for the (very small) screening-driven re-ranking.

window.LL_ECOSYSTEMS = [
  {
    id: 'recipient_relationship',
    title: 'Recipient relationship',
    what: 'These scenarios explore who the recipient is, the relationship between donor and recipient, and what each has said to the other about the situation.',
    sub_areas: [
      { id: 'spouse_partner', label: 'Spouse or partner' },
      { id: 'parent_child',   label: 'Parent or child' },
      { id: 'sibling_family', label: 'Sibling or extended family' },
      { id: 'close_friend',   label: 'Close friend' },
      { id: 'stranger',       label: 'Stranger / nondirected' },
      { id: 'paired_exchange',label: 'Paired exchange' },
    ],
  },
  {
    id: 'conversation',
    title: 'Social context',
    what: 'These scenarios explore the people and voices around you when donation is on the table, including family expectations, possible coercion, and social media.',
    sub_areas: [
      { id: 'family_pressure',  label: 'Family pressure' },
      { id: 'coercion',         label: 'Suspected coercion' },
      { id: 'social_media',     label: 'Social-media noise' },
      { id: 'identity',         label: 'Identity expectations' },
    ],
  },
  {
    id: 'eligibility',
    title: 'Medical eligibility',
    what: 'These scenarios explore who can donate, what medical and lifestyle requirements have to be met, and what activities may have to change after donation.',
    sub_areas: [
      { id: 'cutoffs',     label: 'BMI / BP / cutoffs' },
      { id: 'lifestyle',   label: 'Lifestyle changes' },
      { id: 'restrictions',label: 'Activity restrictions' },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistical problems',
    what: 'These scenarios explore the practical questions a willing donor faces, including lost wages, travel, caregiving, and the pace of evaluation.',
    sub_areas: [
      { id: 'money',       label: 'Money / lost wages' },
      { id: 'caregiving',  label: 'Caregiving load' },
      { id: 'pace',        label: 'Pace of evaluation' },
    ],
  },
  {
    id: 'long_term',
    title: 'Life on one kidney',
    what: 'These scenarios explore what life looks like after donation, including long-term health, meeting the recipient years later, and what happens when a transplant fails or follow-up ends.',
    sub_areas: [
      { id: 'health',      label: 'Long-term health' },
      { id: 'grief',       label: 'Donor grief / graft failure' },
      { id: 'meeting',     label: 'Meeting the recipient' },
    ],
  },
];

window.LL_STAGES = [
  { num:  1, key: 'stage_01', title: 'Hearing and learning',    hint: 'First encounter. Reading, asking, looking up other donors.' },
  { num:  2, key: 'stage_02', title: 'Thinking about it',       hint: 'Actively weighing on what terms, for whom, under what conditions.' },
  { num:  3, key: 'stage_03', title: 'Initial contact',         hint: 'Reaching out to a transplant hospital. Brief intake conversation.' },
  { num:  4, key: 'stage_04', title: 'Pre-evaluation screening',hint: 'Initial blood and urine work. Some programs combine this with stage 3.' },
  { num:  5, key: 'stage_05', title: 'Full evaluation',         hint: 'A two-day in-person workup. Psychosocial, ILDA meeting, imaging, labs.' },
  { num:  6, key: 'stage_06', title: 'Pathway determination',   hint: 'Direct match, paired exchange, specialised program, or not eligible.' },
  { num:  7, key: 'stage_07', title: 'The voluntary decision',  hint: 'The donor’s alone. Informed, voluntary, withdrawable at any time.' },
  { num:  8, key: 'stage_08', title: 'The transplant',          hint: 'Laparoscopic surgery, roughly four hours. Two or three nights in hospital.' },
  { num:  9, key: 'stage_09', title: 'Recovery',                hint: 'Restrictions ease over weeks. Driving around two weeks, full activity four to five.' },
  { num: 10, key: 'stage_10', title: 'Follow-up care',          hint: 'Required check-ins at 6, 12, 24 months. Annual self-care after that.' },
];
