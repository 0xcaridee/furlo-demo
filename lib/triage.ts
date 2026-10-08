// Scripted triage flow for the Furlo AI demo.
// Everything here is SAMPLE content to show the product design. It is not veterinary
// advice, and in a real product the red-flag rules and knowledge-base passages would
// be written and signed off by a vet.

export type StepKey =
  | 'redflags'
  | 'colour'
  | 'form'
  | 'count'
  | 'lastMeal'
  | 'recent'
  | 'appetite'
  | 'energy';

export type Option = {
  label: string;
  // Emergency red flag: stop asking and escalate straight away.
  redFlag?: boolean;
  // Not an emergency, but worth seeing a vet within 24 hours.
  vetSoon?: boolean;
  // Marks a "none of these" option that clears other selections.
  exclusive?: boolean;
  // Plain-English reason shown when this option triggers a flag.
  reason?: string;
  // Colour dot shown on the chip (used for the vomit-colour question).
  swatch?: string;
};

export type Step = {
  key: StepKey;
  question: (pet: string) => string;
  field: string; // label shown in the "what I understood" summary
  multi?: boolean;
  options: Option[];
};

export const STEPS: Step[] = [
  {
    key: 'redflags',
    field: 'Red flags',
    multi: true,
    question: (pet) =>
      `First, a quick safety check. Is ${pet} showing any of these right now? Select all that apply.`,
    options: [
      { label: 'Blood in the vomit', redFlag: true },
      { label: 'Retching but nothing comes up', redFlag: true },
      { label: 'Swollen or hard belly', redFlag: true },
      { label: 'Very weak or collapsed', redFlag: true },
      { label: 'May have eaten something toxic', redFlag: true },
      { label: 'None of these', exclusive: true },
    ],
  },
  {
    key: 'colour',
    field: 'Colour',
    question: () => 'What colour was the vomit?',
    options: [
      { label: 'Yellow', swatch: '#E5C23A' },
      { label: 'White or clear', swatch: '#F7F7F4' },
      { label: 'Same colour as food', swatch: '#B98B5E' },
      { label: 'Brown', swatch: '#6E4528' },
      { label: 'Green', swatch: '#6E8F3A' },
      { label: 'Pink or red streaks', redFlag: true, reason: 'pink or red streaks in the vomit', swatch: '#D45A6E' },
    ],
  },
  {
    key: 'form',
    field: 'Form',
    question: () => 'And what did it look like?',
    options: [
      { label: 'Foamy' },
      { label: 'Liquid' },
      { label: 'Undigested food' },
      { label: 'Partly digested food' },
      { label: 'Contains grass' },
      { label: 'Contains plastic, fabric or toy pieces', vetSoon: true, reason: 'pieces of plastic, fabric or toy in the vomit' },
    ],
  },
  {
    key: 'count',
    field: 'Times today',
    question: (pet) => `How many times has ${pet} vomited since this morning?`,
    options: [
      { label: 'Once' },
      { label: '2–3 times', vetSoon: true, reason: 'vomiting 2–3 times today' },
      { label: 'More than 3 times', redFlag: true, reason: 'vomiting more than 3 times today' },
    ],
  },
  {
    key: 'lastMeal',
    field: 'Last meal',
    question: (pet) => `When did ${pet} last eat before vomiting?`,
    options: [
      { label: "Last night's dinner (empty stomach)" },
      { label: "This morning's breakfast" },
      { label: 'Not sure' },
    ],
  },
  {
    key: 'recent',
    field: 'Recent changes',
    multi: true,
    question: (pet) =>
      `What did ${pet} eat or do yesterday or recently? Select all that apply.`,
    options: [
      { label: 'New food or treats' },
      { label: 'Table scraps or human food' },
      { label: 'Ate grass' },
      { label: 'Got into the rubbish', vetSoon: true, reason: 'getting into the rubbish' },
      { label: 'Chewed a toy or bone', vetSoon: true, reason: 'chewing a toy or bone (possible swallowed pieces)' },
      { label: 'Long walk or hike' },
      { label: 'Nothing unusual', exclusive: true },
    ],
  },
  {
    key: 'appetite',
    field: 'Eating & drinking',
    question: (pet) => `How is ${pet} eating and drinking now?`,
    options: [
      { label: 'Eating and drinking normally' },
      { label: 'Drinking but not eating', vetSoon: true, reason: 'not eating' },
      { label: 'Not eating or drinking', vetSoon: true, reason: 'not eating or drinking' },
    ],
  },
  {
    key: 'energy',
    field: 'Energy',
    question: (pet) => `Last one: how is ${pet}'s energy?`,
    options: [
      { label: 'Normal and playful' },
      { label: 'A bit quieter than usual' },
      { label: 'Lethargic, not themselves', vetSoon: true, reason: 'low energy' },
    ],
  },
];

export type Answers = Partial<Record<StepKey, string[]>>;

export type Urgency = 'emergency' | 'vet24' | 'monitor';

export const URGENCY_META: Record<Urgency, { label: string; colour: string; bg: string }> = {
  emergency: { label: 'Emergency: contact a vet now', colour: '#c62828', bg: '#fdecea' },
  vet24: { label: 'See a vet within 24 hours', colour: '#b26a00', bg: '#fff4e5' },
  monitor: { label: 'Monitor at home', colour: '#2e7d32', bg: '#edf7ed' },
};

// The "rules layer": deterministic checks that run BEFORE any AI-written answer.
export const RED_FLAG_RULE_COUNT = STEPS.reduce(
  (n, s) => n + s.options.filter((o) => o.redFlag).length,
  0,
);

function findOption(step: Step, label: string): Option | undefined {
  return step.options.find((o) => o.label === label);
}

export function triggeredFlags(answers: Answers) {
  const red: string[] = [];
  const soon: string[] = [];
  for (const step of STEPS) {
    for (const label of answers[step.key] || []) {
      const opt = findOption(step, label);
      const why = opt?.reason || label.toLowerCase();
      if (opt?.redFlag) red.push(why);
      if (opt?.vetSoon) soon.push(why);
    }
  }
  return { red, soon };
}

export function decideUrgency(answers: Answers): Urgency {
  const { red, soon } = triggeredFlags(answers);
  if (red.length) return 'emergency';
  if (soon.length) return 'vet24';
  return 'monitor';
}

export type Passage = { id: number; title: string; summary: string };

// Sample "vet-approved knowledge base" entries the demo pretends to retrieve.
const KB = {
  bile: {
    title: 'Vomiting in dogs: yellow, foamy vomit on an empty stomach',
    summary:
      'Yellow, foamy vomit is usually bile. It often appears when the stomach has been empty for a long time, for example first thing in the morning.',
  },
  grass: {
    title: 'Dogs eating grass',
    summary: 'Some dogs eat grass and bring it back up shortly after. One episode on its own is common.',
  },
  diet: {
    title: 'Diet changes and upset stomachs',
    summary: 'New foods, treats or table scraps are a common cause of a one-off upset stomach.',
  },
  whenVet: {
    title: 'When vomiting needs a vet',
    summary:
      'Repeated vomiting, refusing food or water, low energy, or possibly swallowing an object are reasons to see a vet.',
  },
  emergency: {
    title: 'Emergency signs in dogs',
    summary:
      'Blood in vomit, unproductive retching, a swollen belly, collapse or suspected poisoning need urgent veterinary care.',
  },
  monitor: {
    title: 'Monitoring a dog after a single episode of vomiting',
    summary:
      'After one episode, keep fresh water available, avoid treats and new foods, and watch for further vomiting or changes in behaviour.',
  },
};

export function retrievePassages(answers: Answers, urgency: Urgency): Passage[] {
  const picks: (keyof typeof KB)[] = [];
  const has = (k: StepKey, label: string) => (answers[k] || []).includes(label);
  if (urgency === 'emergency') picks.push('emergency');
  if (has('colour', 'Yellow') || has('form', 'Foamy')) picks.push('bile');
  if (has('form', 'Contains grass') || has('recent', 'Ate grass')) picks.push('grass');
  if (
    has('recent', 'New food or treats') ||
    has('recent', 'Table scraps or human food')
  )
    picks.push('diet');
  if (urgency === 'vet24') picks.push('whenVet');
  if (urgency === 'monitor') picks.push('monitor');
  const unique = Array.from(new Set(picks)).slice(0, 3);
  return unique.map((k, i) => ({ id: i + 1, ...KB[k] }));
}

export type Advice = { headline: string; body: string; doNow: string[]; callVetIf: string[] };

export function buildAdvice(pet: string, answers: Answers, urgency: Urgency, passages: Passage[]): Advice {
  const { red, soon } = triggeredFlags(answers);
  const cite = (title: string) => {
    const p = passages.find((x) => x.title === KB[title as keyof typeof KB]?.title);
    return p ? ` [${p.id}]` : '';
  };

  if (urgency === 'emergency') {
    return {
      headline: `Please contact a vet or 24-hour animal hospital now.`,
      body: `You told me about ${red.join(', ')}. ${red.length > 1 ? 'These are' : 'That is'} on the vet-written red-flag list, so I won't try to assess this myself.${cite('emergency')}`,
      doNow: [
        'Call your vet or the nearest 24-hour animal hospital',
        `Bring a photo of the vomit and anything ${pet} may have eaten`,
        'Don’t give food or medication unless a vet tells you to',
      ],
      callVetIf: [],
    };
  }

  if (urgency === 'vet24') {
    return {
      headline: `It’s worth having ${pet} checked by a vet within 24 hours.`,
      body: `Nothing you described is an emergency, but ${soon.length > 1 ? 'a few things are reasons' : 'one thing is a reason'} to get ${pet} seen: ${soon.join('; ')}.${cite('whenVet')}`,
      doNow: [
        'Book a vet appointment for today or tomorrow',
        'Keep fresh water available',
        'Hold off on treats and new foods',
      ],
      callVetIf: [
        'More vomiting, or you see blood',
        `${pet} becomes weak or won’t drink`,
      ],
    };
  }

  const emptyStomach = (answers.lastMeal || []).some((l) => l.startsWith("Last night's"));
  const yellowFoam =
    (answers.colour || []).includes('Yellow') || (answers.form || []).includes('Foamy');
  const ateGrass =
    (answers.recent || []).includes('Ate grass') || (answers.form || []).includes('Contains grass');
  const dietChange = (answers.recent || []).some(
    (l) => l === 'New food or treats' || l === 'Table scraps or human food',
  );
  let body =
    yellowFoam && emptyStomach
      ? `Yellow, foamy vomit first thing in the morning on an empty stomach is often bile, and a single episode in an otherwise bright, eating dog is common.${cite('bile')}`
      : `A single episode in a dog that’s eating, drinking and playful is common and often settles on its own.${cite('monitor')}`;
  if (ateGrass) body += ` Eating grass yesterday may also have played a part.${cite('grass')}`;
  if (dietChange) body += ` A recent change in food or treats is another common trigger.${cite('diet')}`;
  return {
    headline: `This sounds mild. Monitor ${pet} at home today.`,
    body,
    doNow: [
      'Keep fresh water available',
      'Hold off on treats and new foods today',
      `Log this in ${pet}’s health record so your vet can see the pattern`,
      'If it keeps happening in the mornings, ask your vet about meal timing',
    ],
    callVetIf: [
      `${pet} vomits again today`,
      'You see blood, or the vomit looks dark like coffee grounds',
      `${pet} stops eating or drinking, or seems lethargic`,
    ],
  };
}
