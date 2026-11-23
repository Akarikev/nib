export type MailCategory = 'Tech' | 'Promo' | 'GitHub' | 'Cafe' | 'Founder';

export type MailReplyOption = {
 label: string;
 response: string;
 rewardCoins?: number;
 rewardEnergy?: number;
};

export type MailTemplate = {
 id: string;
 sender: string;
 senderInitials: string;
 avatarBg: string;
 category: MailCategory;
 subject: string;
 preview: string;
 body: string;
 replies: MailReplyOption[];
};

export const MAIL_TEMPLATES: MailTemplate[] = [
 {
  id: 'welcome-nib',
  sender: 'Nib Studio Post',
  senderInitials: 'NS',
  avatarBg: '#DDEBD6',
  category: 'Tech',
  subject: 'Welcome to your quiet coding corner',
  preview: 'No sprint standups, no Jira tickets, just you and your code.',
  body: 'Hey there!\n\nWelcome to your new studio inbox. As you ship projects, move cities, and collect gear, fun tech notes, repo alerts, and goofy promos will land right here.\n\nTake it slow, sip your coffee, and enjoy coding by hand.',
  replies: [
   { label: 'Feels good to be here', response: 'Your inbox is officially cozy! +20 coins.', rewardCoins: 20 },
  ],
 },
 {
  id: 'gh-100-stars',
  sender: 'GitHub',
  senderInitials: 'GH',
  avatarBg: '#E3E7F0',
  category: 'GitHub',
  subject: 'Your weekend repo just hit 100 stars!',
  preview: 'People on the internet actually read your README.',
  body: 'Congrats! That tiny side project you pushed late last night just crossed 100 stars on GitHub. Even better: someone opened a PR fixing a typo instead of arguing in the comments.',
  replies: [
   { label: 'Merge & thank them', response: 'Community love! +40 coins in your jar.', rewardCoins: 40 },
   { label: 'Ship a tiny v1.0.1', response: 'Clean release shipped! +25 coins.', rewardCoins: 25 },
  ],
 },
 {
  id: 'hn-frontpage',
  sender: 'Hacker News Digest',
  senderInitials: 'HN',
  avatarBg: '#F9E1CC',
  category: 'Founder',
  subject: 'Show HN: Your tiny app is #3 on the front page',
  preview: 'The comment thread is surprisingly wholesome today.',
  body: 'Whoa — someone shared your little studio project on Hacker News and it climbed to #3! Your tiny server is holding steady at 12% CPU and folks love that it works 100% offline.',
  replies: [
   { label: 'Answer comments', response: 'Great discussion! +55 coins.', rewardCoins: 55 },
   { label: 'Sip coffee & watch', response: 'Calm founder energy. +1 coffee boost!', rewardEnergy: 1 },
  ],
 },
 {
  id: 'so-accepted',
  sender: 'StackOverflow',
  senderInitials: 'SO',
  avatarBg: '#F7E7C8',
  category: 'Tech',
  subject: 'Someone accepted your answer from 2019!',
  preview: '+15 imaginary reputation and real nostalgic joy.',
  body: 'Remember that obscure bug you spent 4 hours debugging years ago? You left a clear 3-line answer just in case — and today it saved a fellow developer’s entire afternoon.',
  replies: [
   { label: 'Worth every minute', response: 'Good dev karma! +35 coins.', rewardCoins: 35 },
  ],
 },
 {
  id: 'promo-oat-latte',
  sender: 'Bean & Byte Roasters',
  senderInitials: 'BB',
  avatarBg: '#F3DFD3',
  category: 'Promo',
  subject: 'FLASH SALE: 99% off imaginary oat-milk lattes',
  preview: 'Freshly roasted digital beans delivered at 60fps.',
  body: 'LIMITED TIME ONLY!\n\nUpgrade your morning routine with our hand-crafted single-origin pixel roast. Pairs best with rainy afternoons, mechanical keyboards, and zero meetings.',
  replies: [
   { label: 'Claim free sample', response: 'Delicious! +1 coffee boost poured.', rewardEnergy: 1 },
   { label: 'Unsubscribe politely', response: 'Inbox zero feels nice. +15 coins.', rewardCoins: 15 },
  ],
 },
 {
  id: 'cloud-invoice-zero',
  sender: 'CloudBillz Hosting',
  senderInitials: 'CB',
  avatarBg: '#DFECF2',
  category: 'Promo',
  subject: 'Your monthly invoice is ready ($0.00)',
  preview: 'Breathe easy — no runaway serverless loops this month.',
  body: 'Good news! Your total cloud bill for this month is $0.00. Because your app is offline-first, you didn’t accidentally rack up a $4,000 bandwidth bill overnight.',
  replies: [
   { label: 'Phew! Frame this bill', response: 'Offline-first wins again! +30 coins.', rewardCoins: 30 },
  ],
 },
 {
  id: 'tiny-vc-offer',
  sender: 'Tiny VC Partners',
  senderInitials: 'VC',
  avatarBg: '#ECE4F5',
  category: 'Founder',
  subject: 'Quick chat about your "Hello, world" script?',
  preview: 'We love the minimal footprint and bold semicolon usage.',
  body: 'Hi founder,\n\nWe saw your latest commit and loved the vision. Have you considered adding a blockchain and 14 microservices to your 15-second Hello World script? Let’s grab a Zoom!',
  replies: [
   { label: 'Stay indie & offline!', response: 'Bootstrapped pride! +60 coins.', rewardCoins: 60 },
   { label: 'Politely decline', response: 'Saved 4 hours of meetings. +30 coins.', rewardCoins: 30 },
  ],
 },
 {
  id: 'cat-quarterly',
  sender: 'Cat Behavior Weekly',
  senderInitials: 'CW',
  avatarBg: '#F8E3CE',
  category: 'Promo',
  subject: 'Why your ginger cat naps on the Escape key',
  preview: 'Science confirms: they are trying to tell you to take a break.',
  body: 'Top story this week: researchers found that desk cats sit near warm keyboards specifically to remind humans to stretch their shoulders and stop refactoring code that already works.',
  replies: [
   { label: 'Pet the cat immediately', response: 'Purr-fect advice! +25 coins.', rewardCoins: 25 },
  ],
 },
 {
  id: 'cafe-loyalty',
  sender: 'Corner Cafe',
  senderInitials: 'CC',
  avatarBg: '#E4EFE0',
  category: 'Cafe',
  subject: 'Your punch card is full — free espresso!',
  preview: 'You earned a fresh cup on the house.',
  body: 'Hey regular!\n\nYou’ve stamped all 10 spots on your Corner Cafe card. Stop by the counter (or just tap below) to grab a warm cup of coffee on us.',
  replies: [
   { label: 'Claim free coffee!', response: 'Fresh cup added to your energy! +1 coffee.', rewardEnergy: 1 },
  ],
 },
 {
  id: 'domain-hoarders',
  sender: 'Domain Hoarders Club',
  senderInitials: 'DH',
  avatarBg: '#E7E4F2',
  category: 'Promo',
  subject: 'Still thinking about buying cozydev.io?',
  preview: 'Your 14 other unused domains are waiting for a friend.',
  body: 'We noticed you searched for cozydev.io at 2:14 AM! Don’t worry, we won’t judge the 14 other side-project domains sitting on a default parking page.',
  replies: [
   { label: 'Resist the urge!', response: 'Wallet saved! +35 coins.', rewardCoins: 35 },
   { label: 'Maybe next weekend…', response: 'Classic dev move. +15 coins.', rewardCoins: 15 },
  ],
 },
 {
  id: 'theme-police',
  sender: 'Editor Theme Guild',
  senderInitials: 'ET',
  avatarBg: '#DDE8E6',
  category: 'Tech',
  subject: 'You switched color themes 4 times today',
  preview: 'Sage Dark, Warm Cream, Catppuccin… we respect the craft.',
  body: 'Friendly check-in: spending 40 minutes tweaking your editor font ligatures and color palette totally counts as productive engineering work. Carry on.',
  replies: [
   { label: 'Aesthetics matter!', response: 'Syntax highlighting looks crisp! +25 coins.', rewardCoins: 25 },
  ],
 },
 {
  id: 'old-teammate-sam',
  sender: 'Sam (Old Teammate)',
  senderInitials: 'SM',
  avatarBg: '#F2E7D5',
  category: 'Tech',
  subject: 'Remember that Friday 5 PM deploy?',
  preview: 'Still can’t believe it worked on the first try.',
  body: 'Hey! Just saw your latest project online and it reminded me of the old days when we wrote every CSS rule by hand and celebrated whenever a build turned green. Hope your studio is cozy!',
  replies: [
   { label: 'Send a warm reply', response: 'Good memories! +40 coins.', rewardCoins: 40 },
  ],
 },
 {
  id: 'keyboard-groupbuy',
  sender: 'Clicky Switch Co.',
  senderInitials: 'CS',
  avatarBg: '#F6E0E3',
  category: 'Promo',
  subject: 'Restock: Marshmallow Tactile Switches',
  preview: 'Sounds like gentle raindrops on a wooden desk.',
  body: 'Our softest, thockiest keycaps are back in stock! Engineered for maximum late-night focus without waking up the napping ginger cat beside your monitor.',
  replies: [
   { label: 'Add to wishlist', response: 'Thocky dreams! +20 coins.', rewardCoins: 20 },
  ],
 },
 {
  id: 'rubber-duck',
  sender: 'Rubber Duck Support',
  senderInitials: 'RD',
  avatarBg: '#FAF0C8',
  category: 'Tech',
  subject: 'Quarterly check-in from your desk duck',
  preview: 'Quack. Have you tried explaining the bug out loud?',
  body: 'Hello developer,\n\nI am writing to remind you that 83% of bugs solve themselves halfway through explaining them to a small yellow duck. My schedule is wide open.',
  replies: [
   { label: 'Explain the bug', response: 'Aha! Found it mid-sentence. +30 coins.', rewardCoins: 30 },
  ],
 },
 {
  id: 'design-weekly',
  sender: 'Cozy UI Weekly',
  senderInitials: 'CU',
  avatarBg: '#E3EFE4',
  category: 'Promo',
  subject: 'Are rounded corners too cozy? (Short answer: No)',
  preview: 'Why warm palettes beat sterile grey dashboards every time.',
  body: 'This week’s essay explores why software feels more human when it has warm paper tones, soft corners, and small thoughtful animations instead of endless notification popups.',
  replies: [
   { label: 'Bookmark & read', response: 'Design inspiration! +25 coins.', rewardCoins: 25 },
  ],
 },
 {
  id: 'real-estate-sf',
  sender: 'Bay View Realty',
  senderInitials: 'BV',
  avatarBg: '#DFEBF2',
  category: 'Promo',
  subject: 'Golden Gate view loft just listed!',
  preview: 'Floor-to-ceiling windows, sunlit oak floors, great coffee nearby.',
  body: 'Thinking of upgrading from your Starter Bedroom? Check the Homes tab in your studio shop — Brooklyn, San Francisco, Tokyo, and the Swiss Alps are waiting whenever your coin jar is ready!',
  replies: [
   { label: 'Keep saving coins!', response: 'Motivation unlocked! +25 coins.', rewardCoins: 25 },
  ],
 },
 {
  id: 'midnight-guild',
  sender: 'Midnight Deployers',
  senderInitials: 'MD',
  avatarBg: '#DCE0EF',
  category: 'Founder',
  subject: 'Invitation: Quiet Night Owls Club',
  preview: 'No hustle culture. Just lo-fi beats and clean commits.',
  body: 'You’ve been invited to the Quiet Night Owls Club. Our only rule: build small things you’re proud of, switch to Moonlit mood when the stars come out, and never skip sleep for a deadline.',
  replies: [
   { label: 'Accept invite', response: 'Welcome to the club! +45 coins.', rewardCoins: 45 },
  ],
 },
 {
  id: 'hydrate-bot',
  sender: 'Studio Care Bot',
  senderInitials: 'SC',
  avatarBg: '#E1F0EA',
  category: 'Cafe',
  subject: 'Quick check: shoulders down & sip water',
  preview: 'Your posture just improved by 12% reading this subject line.',
  body: 'Tiny studio reminder:\n1. Drop your shoulders.\n2. Unclench your jaw.\n3. Take a sip of water or warm coffee.\n\nOkay, back to shipping great things!',
  replies: [
   { label: 'Stretched & hydrated!', response: 'Refreshed and ready! +1 coffee boost.', rewardEnergy: 1 },
  ],
 },
];

export function getMailTemplate(id: string): MailTemplate | undefined {
 return MAIL_TEMPLATES.find(m => m.id === id);
}
