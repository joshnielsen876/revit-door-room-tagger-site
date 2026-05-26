// Living Link v4 — library content
// Mirror of data files/library-content.json. Source of truth in production
// is the JSON file. All articles at pending_review status; not authoritative
// outside the prototype.

window.LL_LIBRARY = [

  {
    id: 'mand_read_US_voluntary_not_sale_v1',
    title: 'Donating a kidney in the U.S.: a gift, not a sale',
    summary: 'Why U.S. law treats living kidney donation as a voluntary gift and not a transaction, and how legitimate reimbursement programs differ from payment.',
    topics: ['payment_and_law'],
    eligible_as_mandated_read: true,
    review_status: 'pending_legal_review',
    related_article_ids: ['nldac_travel_reimbursement_v1', 'american_living_organ_donor_fund_v1', 'independent_donor_advocate_v1'],
    body: [
      { heading: 'Why you are seeing this', paragraphs: [
        'The story you were just reading touched on money or payment around organ donation. This is general information about how this works in the United States. It is not legal advice, and it is not specific to your situation. If you have legal questions about your circumstances, talk with an attorney; if you have program questions, talk with a transplant program.',
      ]},
      { heading: 'Organs are donated, not sold', paragraphs: [
        'U.S. federal law treats living kidney donation as a voluntary gift. The National Organ Transplant Act, passed in 1984, makes it a crime to buy or sell a human organ for transplant. That law applies whether the buyer is a recipient, a hospital, a broker, or anyone else.',
        'This is the rule even when the people involved have good motives. A family member who offers a donor a large sum of money for their kidney would be breaking the law, and so would a donor who agreed to it. The rule is meant to protect donors from pressure to donate for money and to keep the system from becoming a market.',
      ]},
      { heading: 'Reimbursement is different from payment', paragraphs: [
        'The law does allow donors to be reimbursed for actual costs related to donating. That can include travel, lodging, meals during evaluation and recovery, and in some cases lost wages. The reimbursement covers what the donation cost the donor; it is not payment for the kidney itself.',
        'There are programs that exist specifically to help with these costs. The National Living Donor Assistance Center can help with travel and lodging for donors who qualify, and the American Living Organ Donor Fund can help with lost wages. These programs are described in their own articles in the library.',
      ]},
      { heading: 'What this means for your decision', paragraphs: [
        'Knowing what the law allows is part of being confidently informed. It does not tell you whether you would want to donate; that part is yours. If you would not donate under conditions that involve payment for your kidney, that is your decision to make and the law is on the same side of that line. If money is a real concern for you in deciding whether to donate, the reimbursement programs are worth learning about; they exist for that reason.',
        'Your transplant program will be able to walk you through what is and is not covered for your specific case, and your independent donor advocate (described in another article) is there to look out for your interests as you work through these questions.',
      ]},
    ],
  },

  {
    id: 'nldac_travel_reimbursement_v1',
    title: 'NLDAC: travel and lodging help for living donors',
    summary: 'The National Living Donor Assistance Center can help eligible living donors with travel, lodging, and meal expenses during evaluation, surgery, and recovery.',
    topics: ['travel_and_lodging', 'payment_and_law'],
    eligible_as_mandated_read: false,
    review_status: 'pending_review',
    related_article_ids: ['american_living_organ_donor_fund_v1', 'mand_read_US_voluntary_not_sale_v1'],
    body: [
      { heading: 'What NLDAC is', paragraphs: [
        'The National Living Donor Assistance Center, often called NLDAC, is a federally funded program that helps living donors with the costs of travel, lodging, and meals during the donation process. NLDAC was created to remove a real barrier: donors who lived far from a transplant centre sometimes had to pay thousands of dollars out of pocket just to get to their evaluations and surgeries. NLDAC pays those costs directly when a donor qualifies.',
      ]},
      { heading: 'What NLDAC can cover', paragraphs: [
        'NLDAC can cover travel to and from the transplant centre for the donor’s evaluation, surgery, and follow-up appointments. It can cover lodging for the donor and a companion when overnight stays are needed. It can cover meals while travelling. It can also cover certain other incidental costs like parking and ground transportation.',
        'The exact list of covered expenses, the amounts covered, and the way reimbursement is paid are set by the program and can change. The transplant program’s living donor coordinator can walk a prospective donor through the current rules.',
      ]},
      { heading: 'Who qualifies', paragraphs: [
        'Eligibility is based on income. NLDAC compares the donor’s household income to the recipient’s household income; donors at or below a certain percentage of the recipient’s income are eligible. There are also rules about insurance status and about whether other reimbursement is available.',
        'Eligibility rules change over time. Asking the transplant program’s living donor coordinator early in the process is the most reliable way to find out whether a particular donor qualifies. Applying through the transplant program is also the standard route; donors typically do not apply to NLDAC directly.',
      ]},
      { heading: 'What NLDAC does not cover', paragraphs: [
        'NLDAC is for travel, lodging, and meal expenses. It does not replace lost wages. Donors who need help with lost income during recovery can look into the American Living Organ Donor Fund (described in its own article), which is a separate program with separate rules.',
        'NLDAC is also not payment for the kidney. It is reimbursement for actual costs the donor incurs. This distinction is the same one described in the article on U.S. organ donation law.',
      ]},
    ],
  },

  {
    id: 'american_living_organ_donor_fund_v1',
    title: 'American Living Organ Donor Fund: help with lost wages',
    summary: 'A nonprofit that helps living donors replace income lost while recovering from donation surgery and during evaluation appointments.',
    topics: ['wage_replacement', 'payment_and_law'],
    eligible_as_mandated_read: false,
    review_status: 'pending_review',
    related_article_ids: ['nldac_travel_reimbursement_v1', 'mand_read_US_voluntary_not_sale_v1'],
    body: [
      { heading: 'What the fund is', paragraphs: [
        'The American Living Organ Donor Fund is a nonprofit organisation that helps living donors with money they lose because of the donation process. The most common need it addresses is wages lost during surgery recovery, which typically takes four to six weeks for the donor. Many employers do not offer that much paid leave, and the fund exists to help fill that gap.',
      ]},
      { heading: 'What the fund can help with', paragraphs: [
        'The fund can help with lost wages while the donor is unable to work. It can also help with childcare and dependent care during the donor’s recovery, with COBRA or other insurance premiums during recovery, and with certain other expenses related to donation that are not covered by insurance or by the transplant program.',
        'The exact mix of what the fund supports, and the amounts, depend on the fund’s current resources and on the donor’s specific situation. The fund’s website is the place to start, and the transplant program’s living donor coordinator can also help connect a donor with the fund.',
      ]},
      { heading: 'How it differs from NLDAC', paragraphs: [
        'The fund and NLDAC are different programs and they cover different things. NLDAC covers travel, lodging, and meal expenses; it does not cover lost wages. The fund covers lost wages and certain other costs; it does not run the same federally funded travel program. Donors can be eligible for both at the same time, since the two programs cover different categories of cost.',
        'Both programs are reimbursement programs in the sense that they help with actual costs the donor incurs. Neither is payment for the kidney.',
      ]},
      { heading: 'How to learn more', paragraphs: [
        'The fund’s website lists current eligibility rules and the application process. Eligibility is based on financial need and on the specifics of the donation. The transplant program’s social worker or living donor coordinator can help a prospective donor understand whether the fund is likely to be a good fit for their situation.',
      ]},
    ],
  },

  {
    id: 'paired_exchange_basics_v1',
    title: 'Paired exchange and donation chains: how they work',
    summary: 'When a willing donor is not a biological match for their intended recipient, paired exchange lets them donate to another compatible person while their loved one receives a kidney from someone else.',
    topics: ['paired_exchange', 'evaluation_process'],
    eligible_as_mandated_read: false,
    review_status: 'pending_clinical_review',
    related_article_ids: ['independent_donor_advocate_v1'],
    body: [
      { heading: 'The basic idea', paragraphs: [
        'Sometimes a person is willing and able to donate a kidney, but their intended recipient is not a good biological match for their kidney. The two could give up at that point. Paired exchange is a way around this. Two donor-recipient pairs are matched: the donor in pair A gives a kidney to the recipient in pair B, and the donor in pair B gives a kidney to the recipient in pair A. Both recipients get a kidney that is a better match than they would have had through their original pair.',
        'The same idea can extend to chains of three, four, or even more pairs. Chains often start with a nondirected donor, sometimes called a Good Samaritan donor, who gives a kidney without a specific recipient in mind. That single donation can set off a chain that ends with several people receiving transplants.',
      ]},
      { heading: 'How matches are found', paragraphs: [
        'Computer matching programs look across registries of donor-recipient pairs and find combinations that work. Several networks run paired exchange programs in the United States, including the National Kidney Registry and the United Network for Organ Sharing’s kidney paired donation program. Some transplant centres also run their own paired exchange programs. The centre where the donor is being evaluated can describe the specific options available.',
      ]},
      { heading: 'What can change during the process', paragraphs: [
        'Matches in paired exchange are arranged in advance, but the situation can change. A donor or a recipient in another pair might become unable to proceed, for medical reasons or by their own choice. When that happens, the original pair has options: continue donating into the pool with a different match, with the intended recipient being placed for another match; or step away. The transplant program will explain the options in plain language if a change happens.',
        'Some prospective donors want to know up front what will happen if their loved one ends up not receiving a kidney through the chain, and the transplant program can talk through the program’s specific commitments and protections in that situation.',
      ]},
    ],
  },

  {
    id: 'psychosocial_evaluation_v1',
    title: 'Psychosocial evaluation: what to expect',
    summary: 'Every prospective living donor meets with a social worker or psychologist as part of the evaluation. The conversation covers motivation, support, mental health, finances, and pressure.',
    topics: ['evaluation_process', 'donor_advocacy'],
    eligible_as_mandated_read: false,
    review_status: 'pending_clinical_review',
    related_article_ids: ['independent_donor_advocate_v1'],
    body: [
      { heading: 'Why this evaluation exists', paragraphs: [
        'Donor evaluation includes more than blood tests and scans. It also includes a conversation with a social worker or psychologist trained in transplant. The purpose is to make sure the donor is making the decision freely, with a realistic picture of what is involved, and with the support they will need during recovery. It is also a chance for the donor to talk through worries that they may not have raised with anyone else.',
        'This evaluation is required by federal regulation for transplant programs in the United States. It exists to protect the donor.',
      ]},
      { heading: 'What gets discussed', paragraphs: [
        'Topics typically include why the donor is considering donating, their relationship with the recipient, their support system at home and at work, their mental health history and current state, their financial situation and how the recovery period would work, and whether anyone is pressuring them. The evaluator may also ask about substance use and about past major life decisions to get a sense of how the donor approaches choices like this one.',
        'The conversation is private. What the donor shares with the evaluator stays between them and the evaluator, with limited exceptions for safety. The evaluator does not share details with the recipient or the recipient’s family.',
      ]},
      { heading: 'What happens after the conversation', paragraphs: [
        'The evaluator writes a report that goes to the transplant team. The report describes the donor’s readiness for donation. It is one piece of the overall evaluation; medical eligibility is decided separately based on the medical workup.',
        'If the evaluator has concerns, those concerns are discussed with the donor. The donor may be asked to take more time to think things through, or to come back after addressing a specific issue (such as setting up better support at home). A pause is not a rejection; it is the program doing its job to make sure the donation will go well for the donor as well as the recipient.',
      ]},
      { heading: 'If the donor is feeling pressured', paragraphs: [
        'Pressure to donate, whether from a family member, a partner, or a community, is exactly the kind of thing this evaluation is designed to surface. Donors who feel pressured can say so to the evaluator, in private, and the evaluator will help them figure out what to do next. Walking away from donation is always an option, and transplant programs are set up to give donors a graceful, private way to do that without explanation if needed.',
        'The independent donor advocate (described in another article) is also a person the donor can talk with about pressure or any concern, separately from the recipient’s care team.',
      ]},
    ],
  },

  {
    id: 'independent_donor_advocate_v1',
    title: 'The independent donor advocate: someone whose only job is you',
    summary: 'Federal regulation requires every transplant program to have a person whose sole responsibility is the living donor’s interests, separate from the recipient’s care team.',
    topics: ['donor_advocacy', 'evaluation_process'],
    eligible_as_mandated_read: false,
    review_status: 'pending_review',
    related_article_ids: ['psychosocial_evaluation_v1'],
    body: [
      { heading: 'What the role is', paragraphs: [
        'Every U.S. transplant program is required by federal regulation to have an independent donor advocate, sometimes called a living donor advocate. This is a person whose only role in the donation process is to look out for the donor’s interests. They are separate from the recipient’s care team, and their loyalty is to the donor.',
        'The role exists because the medical team caring for the recipient has a job that is naturally focused on getting the recipient a kidney. The donor advocate is the person whose job is naturally focused on making sure the donor is being treated right and is not being pushed into anything.',
      ]},
      { heading: 'What the donor advocate does', paragraphs: [
        'The advocate meets with the donor during evaluation and is available throughout the process. They help the donor understand what is being asked of them at each step. They listen for concerns. They make sure the donor knows that walking away is always an option. They help the donor think through pressure or worries that the donor may not feel comfortable raising with the recipient or the recipient’s care team.',
        'The donor advocate keeps conversations with the donor confidential within professional limits. They do not share what the donor tells them with the recipient, the recipient’s family, or the medical team caring for the recipient.',
      ]},
      { heading: 'When to talk with the donor advocate', paragraphs: [
        'The donor advocate is available before, during, and after donation. The donor can ask to speak with them at any point. Common reasons donors reach out include feeling pressured, having second thoughts, wanting a second opinion on something the medical team said, or just wanting to talk through the decision with someone who is not part of the recipient’s life.',
        'There is no penalty for asking to speak with the donor advocate, and there is no need for a specific reason. The role exists for exactly this kind of use.',
      ]},
    ],
  },

  {
    id: 'long_term_outcomes_v1',
    title: 'Living with one kidney: what the long-term studies show',
    summary: 'Long-term outcomes for living kidney donors, including the modest elevation in blood pressure risk and the rare but real risk of reduced kidney function over time.',
    topics: ['long_term_outcomes', 'donor_experience'],
    eligible_as_mandated_read: false,
    review_status: 'pending_clinical_review',
    related_article_ids: ['perioperative_mortality_v1', 'psychosocial_evaluation_v1', 'independent_donor_advocate_v1'],
    body: [
      { heading: 'Why this article exists', paragraphs: [
        'The biggest question many prospective donors have is also the hardest one to answer in a single sentence: what is donating a kidney going to do to me over the next thirty years? This article describes what is known from long-term studies of donors. It is not a substitute for the conversation a donor will have with their own transplant team about their own situation, but it is the honest summary at a level that a person can hold in their head.',
      ]},
      { heading: 'Most donors do well', paragraphs: [
        'Studies that follow donors for years and decades after donation consistently find that most donors live healthy lives with one kidney. Kidney function drops sharply right after surgery, because the donor has lost about half of their filtering tissue, and then the remaining kidney compensates by working harder. Over time the function partially recovers. Most donors never notice a day-to-day difference in how their body works.',
        'Living with one kidney has not been found to shorten a donor’s life. Several large studies have compared donors to similarly healthy people who did not donate and found that survival is similar between the two groups.',
      ]},
      { heading: 'What can change over the long term', paragraphs: [
        'Blood pressure is the most commonly studied long-term issue. Some studies find that donors develop high blood pressure at roughly the same rate as similarly healthy non-donors. Others find that donors develop it somewhat more often. Where the elevation does appear, it is usually well controlled with the standard blood pressure medications that many adults take anyway. Risk factors that make post-donation high blood pressure more likely include higher body mass index, higher baseline blood pressure, and older age at donation.',
        'Reduced kidney function over time is a smaller but real consideration. End-stage kidney disease (the level of kidney failure that requires dialysis or a transplant) remains rare among donors in absolute terms. Some studies do find that the rate is higher in donors than in carefully matched non-donors, which is why transplant programs screen prospective donors so thoroughly for risk factors before approving donation.',
        'A small amount of protein in the urine is found somewhat more often in donors than in non-donors. In most cases the amount is small and does not affect daily life or require treatment.',
      ]},
      { heading: 'What donors describe in their own words', paragraphs: [
        'The clinical statistics describe the body. Donors who have spoken about their long-term experience often describe something different alongside the statistics: small everyday reminders that they donated. Taking a daily blood pressure medication. Checking in with a nephrologist once a year for labs. Being asked at every new medical appointment whether they have any chronic conditions, and answering, more carefully than most people, that they have one kidney. None of this is a complication. It is part of what living with the choice looks like.',
        'Some donors find these reminders meaningful. Others find them uncomfortable. Both responses are normal. Talking with a previous donor before deciding can give a prospective donor a much clearer picture than statistics alone of what the long-term experience is actually like.',
      ]},
      { heading: 'How to learn more for your situation', paragraphs: [
        'Transplant programs increasingly run donor-mentor programs that connect prospective donors with people who have already donated. The transplant program’s living donor coordinator can usually arrange this. Some donor-led nonprofits also organise peer connections.',
        'Programs are also required to share long-term follow-up data with the federal Organ Procurement and Transplantation Network. Donors who want to see the published outcomes for their own program can ask the coordinator for those numbers.',
      ]},
    ],
  },

  {
    id: 'perioperative_mortality_v1',
    title: 'How risky is the surgery itself? What the data show.',
    summary: 'The accepted figure for perioperative mortality in living kidney donation in the U.S. is about 3 deaths per 10,000 donations. The figure has been stable for thirty years.',
    topics: ['surgical_risk', 'donor_safety'],
    eligible_as_mandated_read: false,
    review_status: 'pending_clinical_review',
    related_article_ids: ['long_term_outcomes_v1', 'psychosocial_evaluation_v1', 'independent_donor_advocate_v1'],
    body: [
      { heading: 'Why this article exists', paragraphs: [
        'Some prospective donors have read or heard that a donor once died during kidney donation surgery. That fact, on its own, is true and important. This article gives that fact its proper context: how often this happens, how stable that rate has been over decades of donations, and what that means for someone deciding.',
      ]},
      { heading: 'The number', paragraphs: [
        'The perioperative mortality rate for living kidney donors in the United States is approximately three deaths per ten thousand donations. In percentage terms, this is 0.03 percent. The figure is drawn from large-scale review of every living kidney donation tracked through the national transplant data system over more than three decades.',
        'Different studies cite the figure in different ways. Some say roughly three per ten thousand, some say one in three thousand, some say 0.03 percent. These are all describing the same range of risk.',
      ]},
      { heading: 'What stable means', paragraphs: [
        'Across thirty years of data, the rate has been remarkably consistent. Surgical techniques have improved, donor selection has become more careful, and the overall volume of donations has grown, but the perioperative mortality figure has stayed in the same range. This consistency is part of why programs and ethics committees treat the risk as well-understood rather than as a moving target.',
      ]},
      { heading: 'Two true things at once', paragraphs: [
        'Three deaths per ten thousand is not zero. A small number of donors have lost their lives. The transplant community treats every one of those losses as significant, and each one has been studied for what it could teach about making the procedure safer.',
        'Three deaths per ten thousand also means that 9,997 of every 10,000 donors come home from surgery. For comparison, the perioperative mortality risk of donation is lower than the risk of many surgeries that are routinely undertaken for the donor’s own benefit, such as gallbladder removal.',
        'Both of these statements are true and a prospective donor is allowed to hold either of them as the more meaningful one for their own decision.',
      ]},
      { heading: 'What programs do to keep the rate low', paragraphs: [
        'Transplant programs screen prospective donors for the medical risk factors that have been associated with worse perioperative outcomes. A prospective donor whose medical workup raises concerns about anesthesia or surgical risk is told so, and is typically advised against proceeding for their own safety. This screening is part of why the published rate, drawn from donors who actually proceeded to surgery, is as low as it is.',
        'The transplant program will walk a prospective donor through their own specific risk profile during evaluation. Programs and donor advocates are also available to discuss perioperative mortality in plain language for anyone who wants to understand what their own number looks like, separately from the population average.',
      ]},
    ],
  },

  {
    id: 'anonymity_and_meeting_recipient_v1',
    title: 'Anonymity in nondirected donation, and what happens if both sides want to meet',
    summary: 'Nondirected donations in the U.S. are anonymous by default. Meeting between donor and recipient years later is possible when both sides want it, and it is arranged through the transplant centre.',
    topics: ['nondirected_donation', 'anonymity'],
    eligible_as_mandated_read: false,
    review_status: 'pending_review',
    related_article_ids: ['paired_exchange_basics_v1', 'independent_donor_advocate_v1'],
    body: [
      { heading: 'How anonymity works', paragraphs: [
        'When a donor gives a kidney without a specific recipient in mind, the donation is called nondirected. Sometimes the same term used is altruistic donation. In the United States, these donations are anonymous by default. The donor does not learn the recipient’s name, and the recipient does not learn the donor’s name. Identifying information stays inside the transplant centre.',
        'Anonymity exists to protect both sides. The donor is not exposed to feelings of obligation or to requests from a recipient who may be deeply grateful but a stranger. The recipient is not put in a position of feeling they owe the donor a specific kind of relationship. The decision to donate and the decision to receive are kept clean of social weight that neither person agreed to take on.',
      ]},
      { heading: 'Anonymous can still mean connected', paragraphs: [
        'Anonymity is not the same as silence. Many transplant centres will pass an anonymous note or card from a recipient to a donor, or from a donor to a recipient, with identifying details removed. Recipients sometimes write to thank the donor without ever knowing the donor’s name. Donors sometimes write to wish the recipient well. The transplant centre is the intermediary, the way an adoption agency once handled letters between birth and adoptive families.',
        'This kind of contact can continue for many years. There are recipients and donors who have exchanged anniversary or holiday cards through the transplant centre for a decade or longer without ever meeting in person.',
      ]},
      { heading: 'If both sides want to meet', paragraphs: [
        'Meeting happens when both sides want it to. Either the donor or the recipient can express interest in meeting, through the transplant centre. The centre checks whether the other side is also interested. If both are, the centre can connect them, often gradually: first a phone call, sometimes a video call, eventually an in-person meeting if both still want one.',
        'Not all meetings happen, and that is normal. Some recipients prefer to know their donor is well and not seek more. Some donors prefer to leave the gift unmarked by personal contact. A donor who later changes their mind, in either direction, can let the transplant centre know. The centre is set up to handle the question gently from either side.',
      ]},
    ],
  },

  {
    id: 'family_conversations_about_donation_v1',
    title: 'Talking with the people who live with you about donating',
    summary: 'How transplant programs approach donors whose decision affects partners, children, and other immediate family. Practical guidance on the conversations that happen before evaluation, during recovery, and afterward.',
    topics: ['family_conversations', 'evaluation_process'],
    eligible_as_mandated_read: false,
    review_status: 'pending_clinical_review',
    related_article_ids: ['psychosocial_evaluation_v1', 'independent_donor_advocate_v1', 'long_term_outcomes_v1'],
    body: [
      { heading: 'Donation is rarely a one-person decision in practice', paragraphs: [
        'A prospective donor is the one whose body is involved, and the decision is legally and ethically theirs alone. In daily life, though, the decision touches the people who live with the donor. A partner will see the recovery up close. A child will notice the parent’s reduced activity for a few weeks. A roommate or a caregiver may need to take on tasks the donor usually handles. Transplant programs know this and approach the family conversation as part of getting a donor ready, not as an obstacle to evaluation.',
      ]},
      { heading: 'What the program looks at', paragraphs: [
        'During psychosocial evaluation, the program will ask about the donor’s home situation and support system. The goal is not to require any particular family arrangement; it is to make sure recovery will be manageable. A donor who lives alone is not disqualified, but the program will want to talk about who will help during the early recovery period, when lifting and driving are restricted.',
        'If a partner or spouse is uncomfortable with the donation, the program will sometimes ask the donor whether bringing the partner into a conversation with the team would help. That is offered as a resource, not a requirement.',
      ]},
      { heading: 'Children at home', paragraphs: [
        'Donors with young children sometimes worry that their kids are a reason not to donate. There is no clinical position that says donors with young children should not donate; many donors have young children, and the long-term outcome data are favorable. The practical question is the recovery period: who will pick up the children from school, do bath time, manage a tantrum, while the donor is recovering. A specific plan, written down before the surgery, makes the recovery period much easier for everyone in the house.',
        'Donors with older children sometimes worry about a different question: whether they are spending a kidney that one of their own children might need someday. The probability of a healthy child of a healthy donor needing a kidney transplant in their lifetime is low, but it is not zero, and donors who hold this worry should talk it through with the transplant team and with the independent donor advocate.',
      ]},
      { heading: 'When more than one person in the home wants to donate', paragraphs: [
        'Sometimes both partners in a household consider donating, either to the same recipient or to different ones over time. Programs evaluate each donor separately on their own medical and psychosocial readiness. A research study published in 2025 looked at married couples in Israel where both partners had donated kidneys to strangers; the study found that the couples generally described the donations as expressions of shared values, with each partner reaching their own decision rather than being talked into it by the other.',
        'If a partner is donating only because the other partner did, transplant programs treat that as a reason for closer evaluation, not for automatic approval. The independent donor advocate is the person to talk with if the second partner has any uncertainty about whether they would have made the decision on their own.',
      ]},
    ],
  },

  {
    id: 'religious_and_ethical_frames_v1',
    title: 'Religious and ethical frames for living donation',
    summary: 'Overview of how several religious and secular ethical traditions discuss living organ donation. This article does not advocate for any tradition or for donation itself.',
    topics: ['religious_perspectives', 'ethics'],
    eligible_as_mandated_read: false,
    review_status: 'pending_editorial_and_religious_review',
    related_article_ids: ['psychosocial_evaluation_v1', 'independent_donor_advocate_v1'],
    body: [
      { heading: 'Why this article exists, and what it is not', paragraphs: [
        'Many prospective donors think about donation in religious or ethical terms. Others do not. This article is for the donor who wants to know what their tradition, or a tradition they encounter, says about living organ donation. It is a starting point, not a substitute for talking with a person trained in the tradition.',
        'This article does not take a position on whether donation is a religious obligation, a permitted act, or a personal choice. Different traditions answer that question differently, and individual donors within any tradition also reach different conclusions.',
      ]},
      { heading: 'Jewish traditions', paragraphs: [
        'Living organ donation has been the subject of substantial discussion in Jewish religious law over the past several decades. The general direction of contemporary discussion across many Jewish authorities has been to permit and in some cases to praise living donation as an expression of pikuach nefesh (saving a life) and chesed (loving kindness). Some teachers also describe donation in the language of tikkun olam (repair of the world).',
        'There is real diversity within Jewish tradition on the specifics. Prospective donors who want to know what their own community’s teachers say should ask them directly.',
      ]},
      { heading: 'Christian traditions', paragraphs: [
        'Most major Christian denominations have either explicitly endorsed living organ donation or treated it as a permissible expression of charity. The Catholic Church describes living donation as a morally praiseworthy act when undertaken freely. Many Protestant denominations have made similar statements. The Eastern Orthodox tradition has been more cautious in some quarters and supportive in others; practice varies.',
        'Within all of these, the emphasis is typically on the donor’s free choice and on appropriate care for the donor’s own life and health. Donation under coercion is consistently treated as morally different from donation freely undertaken.',
      ]},
      { heading: 'Muslim traditions', paragraphs: [
        'Living organ donation is permitted in Islamic law by most contemporary scholars, particularly when the donation is to save a life. Major fatwa councils in several countries have issued opinions to this effect. There is variation across schools of thought, and some prospective donors find it useful to ask a local imam or scholar about how their particular tradition handles the specifics.',
      ]},
      { heading: 'Other traditions and secular ethics', paragraphs: [
        'Many other religious traditions (Hindu, Buddhist, Sikh, Bahá’í, Latter-day Saint, and others) have public-facing statements or teachings about living organ donation. Most are supportive of donation as an expression of compassion or service, with the same standard cautions about the donor’s free choice and well-being.',
        'Secular ethical traditions take a similar shape. Most contemporary frameworks describe living donation as morally good and morally optional: a praiseworthy act that no one is obligated to undertake, and that no one should be pressured into.',
      ]},
      { heading: 'If religion is not part of your decision', paragraphs: [
        'Donors who do not find religious or ethical traditions relevant to their decision are not unusual. Donation has a long history as a secular act of personal choice, and transplant programs do not ask donors about their religious motivations except in the gentle, optional way that comes up during psychosocial evaluation. If a donor wants to leave religion out of the conversation entirely, that is fully respected by transplant programs and is the donor’s right.',
      ]},
    ],
  },

];
