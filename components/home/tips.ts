import { type IconName } from '@/components/ui';

export type FieldTip = { icon: IconName; title: string; text: string };

export const FIELD_TIPS: readonly FieldTip[] = [
  {
    icon: 'hardness',
    title: 'Scratch test',
    text: 'A steel knife blade is about 5.5 on the Mohs scale. If it scratches your rock, the rock is softer than that.',
  },
  {
    icon: 'streak',
    title: 'Check the streak',
    text: 'Rub a mineral across unglazed porcelain. The powder color is often truer than the surface color.',
  },
  {
    icon: 'composition',
    title: 'Fizz test',
    text: 'A drop of vinegar bubbles on calcite and limestone, and does nothing on quartz.',
  },
  {
    icon: 'luster',
    title: 'Fresh surface',
    text: 'Weathering hides color and luster. Photograph a fresh break when you can.',
  },
  {
    icon: 'spore',
    title: 'Take a spore print',
    text: 'Leave a cap gills-down on paper for a few hours. The spore color is a key identification clue.',
  },
  {
    icon: 'stem',
    title: 'Photograph the base',
    text: 'Dig up the whole mushroom. The stem base can hide a cup or sac that marks deadly Amanitas.',
  },
  {
    icon: 'shield',
    title: 'Never eat on a hunch',
    text: 'No app can confirm a mushroom is safe. Have a local expert check it before you eat any wild mushroom.',
  },
  {
    icon: 'habitat',
    title: 'Note the surroundings',
    text: 'Mushrooms depend on their host: tree species, wood or soil. Mention it in your notes.',
  },
  {
    icon: 'cap',
    title: 'Use a basket',
    text: 'Carry mushrooms in a basket, not a plastic bag. They spoil fast without airflow.',
  },
  {
    icon: 'camera',
    title: 'Give it scale',
    text: 'Put a coin or ruler next to the specimen. Size narrows the options a lot.',
  },
  {
    icon: 'luster',
    title: 'Soft light wins',
    text: 'Shoot in open shade. Harsh sun washes out luster, color and gill detail.',
  },
];

const DAY_MS = 86_400_000;

/** One tip per local calendar day, cycling through the list. */
export function tipOfTheDay(now = new Date()): FieldTip {
  const localDays = Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / DAY_MS);
  return FIELD_TIPS[localDays % FIELD_TIPS.length] ?? FIELD_TIPS[0]!;
}
