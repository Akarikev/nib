import { IconName } from '../components/ui';

export type DevEventReward =
 | { kind: 'coins'; amount: number }
 | { kind: 'coffee'; amount: number }
 | { kind: 'speed'; percent: number };

export type DevEventChoice = {
 label: string;
 reward: DevEventReward;
 toast: string;
};

export type DevEvent = {
 id: string;
 title: string;
 message: string;
 icon: IconName;
 choices: DevEventChoice[];
};

export const DEV_EVENTS: DevEvent[] = [
 {
  id: 'hn-frontpage',
  title: 'Front page of Hacker News!',
  message: 'Your weekend side project just hit #1 on Hacker News and traffic is pouring in.',
  icon: 'trophy',
  choices: [
   { label: 'Scale (+80)', reward: { kind: 'coins', amount: 80 }, toast: 'Servers held up! +80 bonus coins.' },
   { label: 'Sip (+1 cup)', reward: { kind: 'coffee', amount: 1 }, toast: 'Read comments with a fresh cup. +1 coffee!' },
  ],
 },
 {
  id: 'so-7yr-fix',
  title: 'Ancient StackOverflow Fix',
  message: 'You found a 7-year-old thread with 3 upvotes and the exact one-line fix you needed.',
  icon: 'code',
  choices: [
   { label: 'Apply (-20%)', reward: { kind: 'speed', percent: 0.2 }, toast: 'Worked on the first try! Shaved 20% off.' },
  ],
 },
 {
  id: 'friday-deploy',
  title: 'Smooth Friday Deploy',
  message: 'Against all odds, your Friday afternoon push passed every check with zero alerts.',
  icon: 'check',
  choices: [
   { label: 'Celebrate (+65)', reward: { kind: 'coins', amount: 65 }, toast: 'Quiet weekend unlocked! +65 bonus coins.' },
  ],
 },
 {
  id: 'rubber-duck',
  title: 'Rubber Duck Breakthrough',
  message: 'Mid-sentence explaining the bug out loud, you spotted the missing return statement.',
  icon: 'brain',
  choices: [
   { label: 'Fix (-20%)', reward: { kind: 'speed', percent: 0.2 }, toast: 'Classic rubber duck moment! Shaved 20% off.' },
   { label: 'Log (+55)', reward: { kind: 'coins', amount: 55 }, toast: 'Clean commit pushed! +55 bonus coins.' },
  ],
 },
 {
  id: 'cafe-barista',
  title: 'Barista Surprise',
  message: 'The corner cafe barista recognized your hoodie and handed you an extra oat latte.',
  icon: 'coffee',
  choices: [
   { label: 'Accept (+1)', reward: { kind: 'coffee', amount: 1 }, toast: 'Free oat latte added! +1 coffee boost.' },
  ],
 },
 {
  id: 'gh-stars',
  title: 'Open-Source Star Surge',
  message: 'A cozy dev newsletter featured your repo and 400 developers just starred it overnight.',
  icon: 'mail',
  choices: [
   { label: 'Sponsor (+90)', reward: { kind: 'coins', amount: 90 }, toast: 'New GitHub sponsors arrived! +90 coins.' },
  ],
 },
];

export function pickRandomDevEvent(hasActiveRun: boolean): DevEvent {
 const pool = hasActiveRun ? DEV_EVENTS : DEV_EVENTS.filter(e => e.choices.some(c => c.reward.kind !== 'speed'));
 return pool[Math.floor(Math.random() * pool.length)] ?? DEV_EVENTS[0];
}
