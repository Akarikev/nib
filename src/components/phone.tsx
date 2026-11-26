import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import {
 ATMOSPHERES,
 Atmosphere,
 HOMES,
 RIDES,
 ResolvedAtmosphere,
 Save,
 developerRank,
 netWorth,
 passiveRatePerHour,
} from '../game/game';
import { playGlobalTap } from '../utils/sound';
import { Button, C, Icon, IconName, Label } from './ui';

type PhoneScreen = 'home' | 'messages' | 'calls' | 'arcade' | 'weather' | 'notes' | 'music' | 'wealth' | 'health';

type ChatMessage = { from: 'them' | 'me'; text: string; time: string };
type ChatStage = {
 replies: { label: string; reply: string }[];
};
type ChatThread = {
 id: string;
 name: string;
 initials: string;
 role: string;
 color: string;
 initial: ChatMessage[];
 stages: ChatStage[];
};

const CHAT_THREADS: ChatThread[] = [
 {
  id: 'mom',
  name: 'Mom',
  initials: 'M',
  role: 'Family',
  color: '#E69F82',
  initial: [{ from: 'them', text: 'Hey sweetie! Did you drink water today or just iced coffee again?', time: '9:41' }],
  stages: [
   {
    replies: [
     { label: 'Water AND coffee!', reply: 'Haha proud of you! Remember to stretch your shoulders too.' },
     { label: 'Just shipping v1...', reply: 'Classic you. Eat something warm when that build finishes!' },
    ],
   },
   {
    replies: [
     { label: 'Will do Mom, love you!', reply: 'Love you too! Send me a picture of that desk cat soon.' },
     { label: 'Making noodles next', reply: 'Good! Add an egg on top for me.' },
    ],
   },
  ],
 },
 {
  id: 'sam',
  name: 'Sam (Co-founder)',
  initials: 'SC',
  role: 'Indie Dev',
  color: '#5B9A77',
  initial: [{ from: 'them', text: 'Yo the new studio looks SO cozy. Are we shipping tonight or sleeping?', time: '10:12' }],
  stages: [
   {
    replies: [
     { label: 'Ship first, nap after!', reply: 'That is the spirit! Putting on lo-fi beats right now.' },
     { label: 'Taking a power nap', reply: 'Smart move — rested devs write half as many bugs.' },
    ],
   },
   {
    replies: [
     { label: 'Zero bugs on main!', reply: 'Wait… did you actually run the tests or are you manifesting?' },
     { label: 'Check the PR in 5m', reply: 'Say less, brewing espresso and opening GitHub.' },
    ],
   },
  ],
 },
 {
  id: 'barista',
  name: 'Corner Cafe',
  initials: 'CC',
  role: 'Oat Latte VIP',
  color: '#C79B58',
  initial: [{ from: 'them', text: 'Fresh Ethiopian roast just dropped! Saved a warm mug for you.', time: '11:05' }],
  stages: [
   {
    replies: [
     { label: 'On my way!', reply: 'Extra oat foam on the house whenever you stop by.' },
     { label: 'Save me two cups', reply: 'Got two iced espressos with your name on them!' },
    ],
   },
   {
    replies: [
     { label: 'You guys are the best', reply: 'Always fueling the local indie devs!' },
     { label: 'Got croissants too?', reply: 'Fresh butter croissants just came out of the oven!' },
    ],
   },
  ],
 },
 {
  id: 'duck',
  name: 'Rubber Duck',
  initials: 'RD',
  role: 'Senior Debugger',
  color: '#6E85C4',
  initial: [{ from: 'them', text: 'Quack. Have you checked if you forgot to await that async call?', time: '11:48' }],
  stages: [
   {
    replies: [
     { label: 'OH THAT WAS IT!', reply: 'Quack. My work here is done.' },
     { label: 'Still debugging...', reply: 'Quack. Explain line 42 out loud to me slowly.' },
    ],
   },
   {
    replies: [
     { label: 'Best senior dev ever', reply: 'Quack. That will be one breadcrumb please.' },
     { label: 'Found a missing ;', reply: 'Quack. It is ALWAYS a semicolon.' },
    ],
   },
  ],
 },
 {
  id: 'alex',
  name: 'Alex (Designer)',
  initials: 'AD',
  role: 'Pixel Pal',
  color: '#9A7FC2',
  initial: [{ from: 'them', text: 'Quick question: 18px or 20px border radius on the new cards?', time: '12:15' }],
  stages: [
   {
    replies: [
     { label: 'Definitely 20px!', reply: 'YES! Soft rounded corners make everything feel friendlier.' },
     { label: 'Let’s split it at 19px', reply: 'Chaotic neutral dev energy. I respect it.' },
    ],
   },
  ],
 },
];

const ENDLESS_CHAT_POOL: Record<string, { label: string; reply: string }[]> = {
 mom: [
  { label: 'How’s the weather there?', reply: 'Lovely and sunny! Hope you opened your studio window today.' },
  { label: 'Just shipped another feature!', reply: 'I don’t know what a git push is, sweetie, but I’m so proud of you!' },
  { label: 'Desk cat says hi', reply: 'Aww give that little orange kitty extra chin scratches from me!' },
  { label: 'Making dinner soon', reply: 'Send a photo! Don’t just eat toast over your keyboard.' },
  { label: 'Got a new room upgrade!', reply: 'Your little apartment is getting so fancy. Invite me over!' },
 ],
 sam: [
  { label: 'Dark mode or cozy cream?', reply: 'Cozy sage & cream all day. Tired of neon purple dashboards.' },
  { label: 'Found a weird edge case', reply: 'If nobody taps it twice in 0.1ms does it even exist? jk fix it haha' },
  { label: 'Should we add more Easter eggs?', reply: '100% yes. Hide a tiny secret inside the studio!' },
  { label: 'Coffee break?', reply: 'Already on cup #3. Let’s ship this and go for a drive.' },
  { label: 'Users are loving NibPhone!', reply: 'Wait till they try Bug Squash and Code Memory — total vibe.' },
 ],
 barista: [
  { label: 'What’s brewing today?', reply: 'Honey-processed Colombian pour-over + cinnamon oat cold brew!' },
  { label: 'Save me a corner table', reply: 'Window seat with the good outlet is already reserved for you.' },
  { label: 'Any pastries left?', reply: 'Two warm cardamom buns and one almond croissant left!' },
  { label: 'Need maximum caffeine', reply: 'Double shot cortado coming right up, boss.' },
 ],
 duck: [
  { label: 'Why is this state undefined?', reply: 'Quack. Log it right before the return statement and stare at it.' },
  { label: 'Tests all passed!!', reply: 'Quack! *happy wing flaps* Now don’t refactor anything for 5 minutes.' },
  { label: 'Should I rewrite it in Rust?', reply: 'Quack. Finish shipping first, rewrite later.' },
  { label: 'Tell me a dev joke', reply: 'Quack. Why do programmers prefer dark mode? Because light attracts bugs.' },
 ],
 alex: [
  { label: 'How’s the new palette?', reply: 'Warm cream, muted sage, and golden accents — chef’s kiss.' },
  { label: 'Should we tweak the spacing?', reply: 'Give everything 4px more breathing room and it instantly looks pro.' },
  { label: 'Check out the garage view!', reply: 'The little headlights flashing when you honk?? Obsessed.' },
  { label: 'Favorite font pairing?', reply: 'Fredoka for cozy headers + Nunito for crisp body text. Unbeatable.' },
 ],
};

type PhoneBannerNotif = {
 app: string;
 title: string;
 text: string;
 icon: IconName;
 color: string;
 target: PhoneScreen | 'mail';
 threadId?: string;
};

const RANDOM_APP_NOTIFS: PhoneBannerNotif[] = [
 { app: 'Messages', title: 'Sam (Co-founder)', text: 'Just saw someone post your Studio Card on X!!', icon: 'message', color: '#34C759', target: 'messages', threadId: 'sam' },
 { app: 'Messages', title: 'Mom', text: 'Don’t forget to drink water and look out the window!', icon: 'message', color: '#34C759', target: 'messages', threadId: 'mom' },
 { app: 'Health', title: 'Studio Health', text: 'Time for a 10-second shoulder roll & water sip!', icon: 'heart', color: '#FF4F6D', target: 'health' },
 { app: 'Wealth', title: 'Studio Wealth', text: 'Your indie portfolio is trending up +4.2% today!', icon: 'trending', color: '#283633', target: 'wealth' },
 { app: 'Weather', title: 'Studio Weather', text: 'Cozy vibes ahead — perfect weather for shipping.', icon: 'cloudSun', color: '#4FA3D1', target: 'weather' },
 { app: 'Mail', title: 'Nib Mail', text: 'A new developer note just landed in your inbox.', icon: 'mail', color: '#2E89FF', target: 'mail' },
];

type SimulatedCall = {
 id: string;
 caller: string;
 subtitle: string;
 color: string;
 script: string[];
};

const SIMULATED_CALLS: SimulatedCall[] = [
 {
  id: 'mentor',
  caller: 'Maya (Mentor)',
  subtitle: 'Mobile · Studio Check-in',
  color: '#5D8F76',
  script: [
   '“Hey! Just checking in on your cozy studio.”',
   '“Small daily commits beat marathon crunch nights every single time.”',
   '“Keep shipping at your own pace — you’re doing awesome!”',
  ],
 },
 {
  id: 'recruiter',
  caller: 'Tech Recruiter',
  subtitle: 'Unknown · San Francisco',
  color: '#C78A52',
  script: [
   '“Hi! Are you interested in a 10x AI-Blockchain-Synergy role?”',
   '“Wait… you’re building cozy offline apps by hand? Honestly respect.”',
   '“Okay keep doing your thing, goodbye!”',
  ],
 },
 {
  id: 'pizza',
  caller: 'Noodle & Dumpling',
  subtitle: 'Local Delivery',
  color: '#C96F5B',
  script: [
   '“Your late-night ramen order is warm and ready!”',
   '“Leaving it right outside your studio door so we don’t disturb the cat.”',
  ],
 },
];

function PhoneWallpaper({ mood }: { mood: ResolvedAtmosphere }) {
 const sky = mood === 'moonlit' ? '#253147' : mood === 'rainy' ? '#6D8A96' : '#A9D6DF';
 const hillBack = mood === 'moonlit' ? '#364A5E' : mood === 'rainy' ? '#58787C' : '#85B8A1';
 const hillFront = mood === 'moonlit' ? '#2B3E47' : mood === 'rainy' ? '#496A68' : '#659B82';
 return (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
   <Svg viewBox="0 0 360 640" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <Rect width="360" height="640" fill={sky} />
    {mood === 'moonlit' ? (
     <G>
      <Circle cx="285" cy="115" r="28" fill="#FAF0CA" />
      <Circle cx="297" cy="108" r="24" fill={sky} />
      {[[55, 85], [115, 62], [190, 96], [240, 68], [80, 150], [315, 175]].map(([x, y], i) => (
       <Circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 2.2 : 1.5} fill="#FFF8DC" opacity="0.85" />
      ))}
     </G>
    ) : (
     <G>
      <Circle cx="275" cy="118" r="34" fill={mood === 'rainy' ? '#D6E2E5' : '#FFF1B8'} opacity="0.92" />
      <Ellipse cx="96" cy="112" rx="46" ry="18" fill="#FFFFFF" opacity={mood === 'rainy' ? 0.35 : 0.65} />
      <Ellipse cx="128" cy="106" rx="30" ry="14" fill="#FFFFFF" opacity={mood === 'rainy' ? 0.35 : 0.65} />
      <Ellipse cx="245" cy="168" rx="38" ry="14" fill="#FFFFFF" opacity={mood === 'rainy' ? 0.3 : 0.55} />
     </G>
    )}
    <Path d="M0 420 Q95 340 205 395 Q295 440 360 365 V640 H0 Z" fill={hillBack} />
    <Path d="M0 495 Q115 430 225 480 Q305 515 360 465 V640 H0 Z" fill={hillFront} />
   </Svg>
  </View>
 );
}

export function NibPhoneModal({
 visible,
 save,
 resolvedAtmosphere,
 unreadMailCount,
 onClose,
 onOpenMail,
 onOpenCard,
 onAtmosphere,
 onToggleSound,
 onArcadeReward,
 onPlayRing,
 onPlayBugSquash,
 onPlayMail,
}: {
 visible: boolean;
 save: Save;
 resolvedAtmosphere: ResolvedAtmosphere;
 unreadMailCount: number;
 onClose: () => void;
 onOpenMail: () => void;
 onOpenCard: () => void;
 onAtmosphere: (id: Atmosphere) => void;
 onToggleSound: () => void;
 onArcadeReward: (coins: number) => void;
 onPlayRing: () => void;
 onPlayBugSquash: () => void;
 onPlayMail: () => void;
}) {
 const insets = useSafeAreaInsets();
 const { width, height } = useWindowDimensions();
 const [screen, setScreen] = useState<PhoneScreen>('home');
 const [activeChatId, setActiveChatId] = useState<string | null>(null);
 const [typingInChat, setTypingInChat] = useState(false);
 const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>(() => {
  const map: Record<string, ChatMessage[]> = {};
  for (const t of CHAT_THREADS) map[t.id] = [...t.initial];
  return map;
 });
 const [chatStageIdx, setChatStageIdx] = useState<Record<string, number>>({});
 const [unreadChatMap, setUnreadChatMap] = useState<Record<string, boolean>>({
  mom: true,
  sam: true,
 });
 const [bannerNotif, setBannerNotif] = useState<PhoneBannerNotif | null>(null);

 // Health app state
 const [waterCups, setWaterCups] = useState(3);
 const [stepsCount, setStepsCount] = useState(2840);

 // Notes scratchpad state
 const [notes, setNotes] = useState<string[]>([
  'Ship one cozy feature today',
  'Save up for San Francisco Bay View',
  'Pet the desk cat between builds',
 ]);
 const [draftNote, setDraftNote] = useState('');

 // Call simulation state
 const [activeCall, setActiveCall] = useState<SimulatedCall | null>(null);
 const [callConnected, setCallConnected] = useState(false);

 // Arcade Hub state (icon grid -> game details -> play)
 const [arcadeGame, setArcadeGame] = useState<'menu' | 'bugs-info' | 'bugs' | 'memory-info' | 'memory'>('menu');
 const [arcadeActive, setArcadeActive] = useState(false);
 const [arcadeTime, setArcadeTime] = useState(15);
 const [arcadeScore, setArcadeScore] = useState(0);
 const [bugCell, setBugCell] = useState(4);
 const [arcadeClaimed, setArcadeClaimed] = useState(false);

 // Code Memory (Simon Says) state
 const [memSeq, setMemSeq] = useState<number[]>([]);
 const [memStep, setMemStep] = useState(0);
 const [memLit, setMemLit] = useState<number | null>(null);
 const [memShowing, setMemShowing] = useState(false);
 const [memRound, setMemRound] = useState(0);
 const [memStatus, setMemStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');

 const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 const chatScrollRef = useRef<ScrollView>(null);
 const [lastLabelMap, setLastLabelMap] = useState<Record<string, string>>({});

 useEffect(() => {
  if (!visible) {
   setScreen('home');
   setActiveChatId(null);
   setActiveCall(null);
   setCallConnected(false);
   setArcadeActive(false);
   setArcadeGame('menu');
   setBannerNotif(null);
   return;
  }
  // Periodic random multi-app iOS notifications while phone is open!
  let cancelled = false;
  let nextTimer: ReturnType<typeof setTimeout> | null = null;
  const scheduleNotif = (first: boolean) => {
   const delay = first ? 3500 + Math.floor(Math.random() * 2500) : 11_000 + Math.floor(Math.random() * 6000);
   nextTimer = setTimeout(() => {
    if (cancelled) return;
    const pick = RANDOM_APP_NOTIFS[Math.floor(Math.random() * RANDOM_APP_NOTIFS.length)]!;
    if (pick.threadId) {
     const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
     setChatHistory(prev => ({
      ...prev,
      [pick.threadId!]: [...(prev[pick.threadId!] ?? []), { from: 'them', text: pick.text, time: nowStr }],
     }));
     setUnreadChatMap(prev => ({ ...prev, [pick.threadId!]: true }));
    }
    setBannerNotif(pick);
    onPlayMail();
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => setBannerNotif(null), 4600);
    if (!cancelled) scheduleNotif(false);
   }, delay);
  };
  scheduleNotif(true);
  return () => {
   cancelled = true;
   if (nextTimer) clearTimeout(nextTimer);
   if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
  };
 }, [visible, onPlayMail]);

 // Arcade countdown timer
 useEffect(() => {
  if (!arcadeActive) return;
  const timer = setInterval(() => {
   setArcadeTime(prev => {
    if (prev <= 1) {
     setArcadeActive(false);
     return 0;
    }
    return prev - 1;
   });
  }, 1000);
  return () => clearInterval(timer);
 }, [arcadeActive]);

 const clockText = useMemo(() => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
 }, [visible, screen]);

 const dateText = useMemo(() => {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
 }, [visible]);

 const unreadChats = Object.values(unreadChatMap).filter(Boolean).length;
 const activeHome = HOMES.find(h => h.id === (save.activeHome ?? 'bedroom')) ?? HOMES[0];
 const isCityHome = activeHome.id === 'loft' || activeHome.id === 'sf' || activeHome.id === 'tokyo';
 const activeRide = RIDES.find(r => r.id === save.activeRide);

 function openChatThread(id: string) {
  playGlobalTap();
  setActiveChatId(id);
  setScreen('messages');
  setUnreadChatMap(prev => ({ ...prev, [id]: false }));
  setBannerNotif(null);
 }

 function sendQuickReply(thread: ChatThread, label: string, replyText: string) {
  playGlobalTap();
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  setLastLabelMap(prev => ({ ...prev, [thread.id]: label }));
  setChatHistory(prev => ({
   ...prev,
   [thread.id]: [...(prev[thread.id] ?? []), { from: 'me', text: label, time: nowStr }],
  }));
  setChatStageIdx(prev => ({ ...prev, [thread.id]: (prev[thread.id] ?? 0) + 1 }));
  setTypingInChat(true);
  setTimeout(() => {
   setTypingInChat(false);
   onPlayMail();
   setChatHistory(prev => ({
    ...prev,
    [thread.id]: [...(prev[thread.id] ?? []), { from: 'them', text: replyText, time: nowStr }],
   }));
  }, 680);
 }

 function startArcade() {
  playGlobalTap();
  setArcadeScore(0);
  setArcadeTime(15);
  setArcadeClaimed(false);
  setBugCell(Math.floor(Math.random() * 9));
  setArcadeActive(true);
 }

 function tapArcadeCell(idx: number) {
  if (!arcadeActive || idx !== bugCell) return;
  onPlayBugSquash();
  setArcadeScore(s => s + 1);
  let next = Math.floor(Math.random() * 9);
  if (next === idx) next = (idx + 3) % 9;
  setBugCell(next);
 }

 function playMemorySequence(seq: number[]) {
  setMemShowing(true);
  setMemStep(0);
  seq.forEach((pad, i) => {
   setTimeout(() => {
    setMemLit(pad);
    playGlobalTap();
    setTimeout(() => setMemLit(null), 320);
   }, i * 520 + 250);
  });
  setTimeout(() => setMemShowing(false), seq.length * 520 + 350);
 }

 function startMemoryGame() {
  const initial = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
  setMemSeq(initial);
  setMemRound(1);
  setMemStatus('playing');
  playMemorySequence(initial);
 }

 function tapMemoryPad(pad: number) {
  if (memShowing || memStatus !== 'playing') return;
  setMemLit(pad);
  setTimeout(() => setMemLit(null), 180);
  if (pad !== memSeq[memStep]) {
   setMemStatus('lost');
   return;
  }
  onPlayBugSquash();
  if (memStep + 1 >= memSeq.length) {
   // Cleared round!
   if (memRound >= 3) {
    setMemStatus('won');
    onArcadeReward(45);
   } else {
    const nextSeq = [...memSeq, Math.floor(Math.random() * 4)];
    setMemSeq(nextSeq);
    setMemRound(r => r + 1);
    setTimeout(() => playMemorySequence(nextSeq), 450);
   }
  } else {
   setMemStep(st => st + 1);
  }
 }

 function goHome() {
  playGlobalTap();
  setScreen('home');
  setActiveChatId(null);
  setActiveCall(null);
  setCallConnected(false);
  setArcadeActive(false);
 }

 const activeThread = CHAT_THREADS.find(t => t.id === activeChatId);
 const activeStageNum = activeThread ? chatStageIdx[activeThread.id] ?? 0 : 0;
 const replyChoices = useMemo(() => {
  if (!activeThread) return [];
  const scripted = activeThread.stages[activeStageNum];
  if (scripted) return scripted.replies;
  const pool = (ENDLESS_CHAT_POOL[activeThread.id] ?? []).filter(r => r.label !== lastLabelMap[activeThread.id]);
  if (pool.length <= 2) return pool;
  const firstIdx = activeStageNum % pool.length;
  const secondIdx = (firstIdx + 1 + (activeStageNum % Math.max(1, pool.length - 1))) % pool.length;
  return [pool[firstIdx]!, pool[secondIdx === firstIdx ? (firstIdx + 1) % pool.length : secondIdx]!];
 }, [activeThread, activeStageNum, lastLabelMap]);
 const soundOn = save.soundEnabled ?? true;

 const phoneWidth = Math.min(width - 22, 384);
 const phoneHeight = Math.min(height - insets.top - insets.bottom - 28, 710);

 return (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
   <View style={s.backdrop}>
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

    {/* Tall, Realistic iPhone-Style Bezel */}
    <View style={[s.phoneBezel, { width: phoneWidth, height: phoneHeight }]}>
     {/* Top Status Bar + Dynamic Island */}
     <View style={s.statusBar}>
      <Label style={s.clock}>{clockText}</Label>
      <View style={s.island}>
       <View style={s.cameraDot} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
       <Label style={s.batteryText}>100%</Label>
       <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Put phone down">
        <Icon name="close" size={16} color="#E6F2EB" />
       </Pressable>
      </View>
     </View>

     {/* Phone Screen Area */}
     <View style={s.screen}>
      {/* Live Multi-App iOS Notification Banner */}
      {bannerNotif && (
       <Pressable
        onPress={() => {
         const target = bannerNotif.target;
         const tid = bannerNotif.threadId;
         setBannerNotif(null);
         if (target === 'mail') {
          onClose();
          onOpenMail();
         } else if (target === 'messages' && tid) {
          openChatThread(tid);
         } else {
          playGlobalTap();
          setScreen(target);
         }
        }}
        style={s.notifBanner}
       >
        <View style={[s.notifIcon, { backgroundColor: bannerNotif.color }]}>
         <Icon name={bannerNotif.icon} size={14} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
         <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Label style={s.notifTitle}>{bannerNotif.title}</Label>
          <Label style={s.notifNow}>now</Label>
         </View>
         <Label style={s.notifText} numberOfLines={1}>
          {bannerNotif.text}
         </Label>
        </View>
       </Pressable>
      )}

      {/* HOME SCREEN WITH ILLUSTRATED WALLPAPER */}
      {screen === 'home' && (
       <View style={s.homeWrap}>
        <PhoneWallpaper mood={resolvedAtmosphere} />

        {/* Clean iOS-style transparent Lock/Home Clock over Wallpaper */}
        <View style={s.homeClockBlock}>
         <Label style={s.homeDateText}>{dateText}</Label>
         <Label style={s.homeBigClock}>{clockText}</Label>
        </View>

        {/* 3x3 App Icon Grid */}
        <View style={s.appGrid}>
         {[
          {
           id: 'mail',
           label: 'Mail',
           icon: 'mail' as IconName,
           bg: '#2E89FF',
           badge: unreadMailCount,
           onPress: () => {
            playGlobalTap();
            onClose();
            onOpenMail();
           },
          },
          {
           id: 'messages',
           label: 'Messages',
           icon: 'message' as IconName,
           bg: '#34C759',
           badge: unreadChats,
           onPress: () => {
            playGlobalTap();
            setScreen('messages');
           },
          },
          {
           id: 'calls',
           label: 'Phone',
           icon: 'phone' as IconName,
           bg: '#30B556',
           badge: 0,
           onPress: () => {
            playGlobalTap();
            setScreen('calls');
           },
          },
          {
           id: 'arcade',
           label: 'Arcade',
           icon: 'game' as IconName,
           bg: '#E89B3C',
           badge: 0,
           onPress: () => {
            playGlobalTap();
            setArcadeGame('menu');
            setScreen('arcade');
           },
          },
          {
           id: 'health',
           label: 'Health',
           icon: 'heart' as IconName,
           bg: '#FF4F6D',
           badge: 0,
           onPress: () => {
            playGlobalTap();
            setScreen('health');
           },
          },
          {
           id: 'weather',
           label: 'Weather',
           icon: 'cloudSun' as IconName,
           bg: '#4FA3D1',
           badge: 0,
           onPress: () => {
            playGlobalTap();
            setScreen('weather');
           },
          },
          {
           id: 'notes',
           label: 'Notes',
           icon: 'book' as IconName,
           bg: '#E5B946',
           badge: 0,
           onPress: () => {
            playGlobalTap();
            setScreen('notes');
           },
          },
          {
           id: 'wealth',
           label: 'Wealth',
           icon: 'trending' as IconName,
           bg: '#283633',
           badge: 0,
           onPress: () => {
            playGlobalTap();
            setScreen('wealth');
           },
          },
          {
           id: 'card',
           label: 'Card',
           icon: 'share' as IconName,
           bg: '#8C74C4',
           badge: 0,
           onPress: () => {
            playGlobalTap();
            onClose();
            onOpenCard();
           },
          },
         ].map(app => (
          <Pressable
           key={app.id}
           accessibilityRole="button"
           accessibilityLabel={app.label}
           onPress={app.onPress}
           style={({ pressed }) => [s.appCell, pressed && { transform: [{ scale: 0.91 }] }]}
          >
           <View style={[s.appIcon, { backgroundColor: app.bg }]}>
            <Icon name={app.icon} size={26} color="#FFFFFF" />
            {app.badge > 0 && (
             <View style={s.appBadge}>
              <Label style={s.appBadgeText}>{app.badge}</Label>
             </View>
            )}
           </View>
           <Label style={s.appLabel}>{app.label}</Label>
          </Pressable>
         ))}
        </View>

        {/* Translucent iOS Glass Bottom Dock */}
        <View style={s.dock}>
         <Pressable onPress={() => { playGlobalTap(); setScreen('calls'); }} style={[s.dockBtn, { backgroundColor: '#30B556' }]}>
          <Icon name="phone" size={22} color="#FFFFFF" />
         </Pressable>
         <Pressable onPress={() => { playGlobalTap(); setScreen('messages'); }} style={[s.dockBtn, { backgroundColor: '#34C759' }]}>
          <Icon name="message" size={22} color="#FFFFFF" />
         </Pressable>
         <Pressable onPress={() => { playGlobalTap(); onClose(); onOpenMail(); }} style={[s.dockBtn, { backgroundColor: '#2E89FF' }]}>
          <Icon name="mail" size={22} color="#FFFFFF" />
         </Pressable>
         <Pressable onPress={() => { playGlobalTap(); setScreen('music'); }} style={[s.dockBtn, { backgroundColor: '#E35B6B' }]}>
          <Icon name="music" size={22} color="#FFFFFF" />
         </Pressable>
        </View>
       </View>
      )}

      {/* IPHONE-STYLE MESSAGES APP */}
      {screen === 'messages' && (
       <View style={[s.appScreen, { backgroundColor: '#FFFFFF' }]}>
        <View style={s.iosNav}>
         <Pressable
          onPress={() => {
           playGlobalTap();
           activeChatId ? setActiveChatId(null) : setScreen('home');
          }}
          style={s.iosBackBtn}
         >
          <Icon name="back" size={17} color="#007AFF" />
          <Label style={{ fontSize: 13, fontWeight: '700', color: '#007AFF' }}>
           {activeThread ? 'Messages' : 'Home'}
          </Label>
         </Pressable>
         <Label style={s.iosNavTitle}>{activeThread ? activeThread.name : 'Messages'}</Label>
         <View style={{ width: 64 }} />
        </View>

        {!activeThread ? (
         <ScrollView contentContainerStyle={{ paddingBottom: 14 }}>
          {CHAT_THREADS.map(t => {
           const msgs = chatHistory[t.id] ?? [];
           const last = msgs[msgs.length - 1];
           const unread = !!unreadChatMap[t.id];
           return (
            <Pressable key={t.id} onPress={() => openChatThread(t.id)} style={s.iosChatRow}>
             <View style={s.iosUnreadCol}>{unread && <View style={s.iosBlueDot} />}</View>
             <View style={[s.avatarDot, { backgroundColor: t.color }]}>
              <Label style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>{t.initials}</Label>
             </View>
             <View style={s.iosChatMeta}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
               <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14.5, color: '#1C1C1E' }}>{t.name}</Label>
               <Label style={{ fontSize: 11, color: '#8E8E93' }}>{last?.time ?? 'now'}</Label>
              </View>
              <Label style={{ fontSize: 12.5, color: '#6E6E73' }} numberOfLines={2}>
               {last?.text}
              </Label>
             </View>
             <Icon name="chevron" size={15} color="#C7C7CC" />
            </Pressable>
           );
          })}
         </ScrollView>
        ) : (
         <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <ScrollView
           ref={chatScrollRef}
           onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
           contentContainerStyle={{ gap: 8, paddingVertical: 8, paddingHorizontal: 4 }}
          >
           <Label style={{ textAlign: 'center', fontSize: 11, color: '#8E8E93', marginBottom: 4 }}>
            iMessage · Today
           </Label>
           {(chatHistory[activeThread.id] ?? []).map((m, i) => (
            <View key={i} style={[s.imsgBubble, m.from === 'me' ? s.imsgMe : s.imsgThem]}>
             <Label style={{ fontSize: 13.5, color: m.from === 'me' ? '#FFFFFF' : '#1C1C1E', lineHeight: 19 }}>
              {m.text}
             </Label>
            </View>
           ))}
           {typingInChat && (
            <View style={[s.imsgBubble, s.imsgThem, { paddingHorizontal: 14 }]}>
             <Label style={{ fontSize: 14, color: '#8E8E93', letterSpacing: 3 }}>•••</Label>
            </View>
           )}
          </ScrollView>

          <View style={s.imsgComposer}>
           {!typingInChat && replyChoices.length > 0 ? (
            <View style={{ gap: 6 }}>
             <Label style={{ fontSize: 11, color: '#8E8E93', textAlign: 'center' }}>Tap a quick reply</Label>
             {replyChoices.map((r, i) => (
              <Pressable
               key={`${activeStageNum}-${i}`}
               onPress={() => sendQuickReply(activeThread, r.label, r.reply)}
               style={({ pressed }) => [s.imsgReplyPill, pressed && { opacity: 0.78 }]}
              >
               <Label style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>{r.label}</Label>
               <Icon name="send" size={13} color="#FFFFFF" />
              </Pressable>
             ))}
            </View>
           ) : (
            <Label style={{ textAlign: 'center', fontSize: 11.5, color: '#8E8E93', paddingVertical: 6 }}>
             {`${activeThread.name} is typing…`}
            </Label>
           )}
          </View>
         </View>
        )}
       </View>
      )}

      {/* CALLS APP */}
      {screen === 'calls' && (
       <View style={s.appScreen}>
        <View style={s.appHeader}>
         <Pressable onPress={() => { playGlobalTap(); activeCall ? (setActiveCall(null), setCallConnected(false)) : setScreen('home'); }} style={s.backChip}>
          <Icon name="back" size={16} color={C.ink} />
         </Pressable>
         <Label style={s.appTitle}>Phone</Label>
         <View style={{ width: 32 }} />
        </View>

        {!activeCall ? (
         <ScrollView contentContainerStyle={{ gap: 10 }}>
          <Label style={{ fontSize: 12, color: C.muted }}>Favorites & recent studio calls:</Label>
          {SIMULATED_CALLS.map(c => (
           <Pressable
            key={c.id}
            onPress={() => {
             onPlayRing();
             setActiveCall(c);
             setCallConnected(false);
            }}
            style={s.chatRow}
           >
            <View style={[s.avatarDot, { backgroundColor: c.color }]}>
             <Icon name="phone" size={16} color="#FFFDF7" />
            </View>
            <View style={{ flex: 1 }}>
             <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14 }}>{c.caller}</Label>
             <Label style={{ fontSize: 11.5, color: C.muted }}>{c.subtitle}</Label>
            </View>
            <View style={s.callChip}>
             <Label style={{ fontSize: 11, fontWeight: '800', color: C.green }}>Call</Label>
            </View>
           </Pressable>
          ))}
         </ScrollView>
        ) : (
         <View style={s.callCard}>
          <View style={[s.callAvatar, { backgroundColor: activeCall.color }]}>
           <Icon name="phone" size={30} color="#FFFDF7" />
          </View>
          <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 22 }}>{activeCall.caller}</Label>
          <Label style={{ fontSize: 12.5, color: C.muted }}>
           {callConnected ? 'Connected · 0:08' : 'Ringing...'}
          </Label>

          {callConnected && (
           <View style={{ width: '100%', gap: 8, marginVertical: 10 }}>
            {activeCall.script.map((line, i) => (
             <View key={i} style={s.bubbleThem}>
              <Label style={{ fontSize: 13, color: C.ink, lineHeight: 19 }}>{line}</Label>
             </View>
            ))}
           </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 }}>
           {!callConnected && (
            <View style={{ flex: 1 }}>
             <Button icon="phone" onPress={() => setCallConnected(true)}>
              Answer
             </Button>
            </View>
           )}
           <View style={{ flex: 1 }}>
            <Button
             danger
             icon="phoneOff"
             onPress={() => {
              setActiveCall(null);
              setCallConnected(false);
             }}
            >
             Hang up
            </Button>
           </View>
          </View>
         </View>
        )}
       </View>
      )}

      {/* ARCADE HUB: ICON GRID -> GAME DETAILS -> PLAY */}
      {screen === 'arcade' && (
       <View style={s.appScreen}>
        <View style={s.appHeader}>
         <Pressable
          onPress={() => {
           playGlobalTap();
           setArcadeActive(false);
           if (arcadeGame === 'bugs' || arcadeGame === 'bugs-info' || arcadeGame === 'memory' || arcadeGame === 'memory-info') {
            setArcadeGame('menu');
           } else {
            setScreen('home');
           }
          }}
          style={s.backChip}
         >
          <Icon name="back" size={16} color={C.ink} />
         </Pressable>
         <Label style={s.appTitle}>
          {arcadeGame.startsWith('bugs') ? 'Bug Squash' : arcadeGame.startsWith('memory') ? 'Code Memory' : 'Nib Arcade'}
         </Label>
         <Label style={{ fontSize: 13, fontWeight: '800', color: C.gold }}>
          {arcadeGame === 'bugs' ? `${arcadeTime}s` : arcadeGame === 'memory' ? `R${memRound}/3` : ''}
         </Label>
        </View>

        {arcadeGame === 'menu' ? (
         <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18, paddingTop: 12, justifyContent: 'space-around' }}>
          {[
           { id: 'bugs-info' as const, label: 'Bug Squash', icon: 'bug' as IconName, bg: '#D9755A' },
           { id: 'memory-info' as const, label: 'Code Memory', icon: 'brain' as IconName, bg: '#6C8CC4' },
          ].map(g => (
           <Pressable
            key={g.id}
            onPress={() => {
             playGlobalTap();
             setArcadeGame(g.id);
            }}
            style={({ pressed }) => [{ alignItems: 'center', gap: 8, width: '42%' }, pressed && { transform: [{ scale: 0.93 }] }]}
           >
            <View style={[s.arcadeAppIcon, { backgroundColor: g.bg }]}>
             <Icon name={g.icon} size={36} color="#FFFFFF" />
            </View>
            <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 13.5, color: C.ink }}>{g.label}</Label>
           </Pressable>
          ))}
         </View>
        ) : arcadeGame === 'bugs-info' ? (
         <View style={s.gameDetailCard}>
          <View style={[s.arcadeAppIcon, { backgroundColor: '#D9755A' }]}>
           <Icon name="bug" size={38} color="#FFFFFF" />
          </View>
          <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 22, color: C.ink }}>Bug Squash</Label>
          <Label style={{ fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 }}>
           Tap the mischievous bugs as fast as you can in a 15-second sprint! Every bug you squash pays +4 coins straight to your jar.
          </Label>
          <View style={s.callChip}>
           <Label style={{ fontSize: 12, fontWeight: '800', color: C.green }}>Reward: +4 coins / bug</Label>
          </View>
          <View style={{ width: '100%', marginTop: 8 }}>
           <Button
            icon="game"
            onPress={() => {
             setArcadeGame('bugs');
             startArcade();
            }}
           >
            Play Bug Squash
           </Button>
          </View>
         </View>
        ) : arcadeGame === 'memory-info' ? (
         <View style={s.gameDetailCard}>
          <View style={[s.arcadeAppIcon, { backgroundColor: '#6C8CC4' }]}>
           <Icon name="brain" size={38} color="#FFFFFF" />
          </View>
          <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 22, color: C.ink }}>Code Memory</Label>
          <Label style={{ fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 }}>
           Watch the 4 cozy studio pads light up, then repeat the exact sequence across 3 rounds to earn a crisp +45 coin bonus!
          </Label>
          <View style={s.callChip}>
           <Label style={{ fontSize: 12, fontWeight: '800', color: C.green }}>Reward: +45 coins</Label>
          </View>
          <View style={{ width: '100%', marginTop: 8 }}>
           <Button
            icon="brain"
            onPress={() => {
             setArcadeGame('memory');
             startMemoryGame();
            }}
           >
            Play Code Memory
           </Button>
          </View>
         </View>
        ) : arcadeGame === 'bugs' ? (
         <>
          <View style={s.arcadeStats}>
           <Label style={{ fontSize: 13, fontWeight: '800', color: C.ink }}>Squashed: {arcadeScore}</Label>
           <Label style={{ fontSize: 13, fontWeight: '800', color: C.gold }}>+{arcadeScore * 4} coins</Label>
          </View>
          <View style={s.arcadeGrid}>
           {[0, 1, 2].map(row => (
            <View key={row} style={{ flexDirection: 'row', gap: 10 }}>
             {[0, 1, 2].map(col => {
              const idx = row * 3 + col;
              const hasBug = arcadeActive && idx === bugCell;
              return (
               <Pressable
                key={idx}
                onPress={() => tapArcadeCell(idx)}
                style={[s.arcadeCell, hasBug && s.arcadeCellBug]}
               >
                {hasBug && <Icon name="bug" size={30} color="#FFFDF7" />}
               </Pressable>
              );
             })}
            </View>
           ))}
          </View>
          {!arcadeActive && arcadeTime === 0 && arcadeScore > 0 && !arcadeClaimed ? (
           <Button
            icon="coin"
            onPress={() => {
             const reward = arcadeScore * 4;
             setArcadeClaimed(true);
             onArcadeReward(reward);
            }}
           >
            Claim +{arcadeScore * 4} coins!
           </Button>
          ) : (
           <Button disabled={arcadeActive} icon="game" onPress={startArcade}>
            {arcadeActive ? 'Tap the bugs!' : arcadeTime === 0 ? 'Play again' : 'Start 15s round'}
           </Button>
          )}
         </>
        ) : (
         <View style={{ flex: 1, justifyContent: 'space-between', gap: 12 }}>
          <View style={s.arcadeStats}>
           <Label style={{ fontSize: 13, fontWeight: '800', color: C.ink }}>
            {memShowing
             ? 'Watch the pattern...'
             : memStatus === 'won'
             ? 'All 3 rounds cleared! +45 coins'
             : memStatus === 'lost'
             ? 'Oops! Wrong pad — try again'
             : memStatus === 'playing'
             ? 'Your turn — repeat it!'
             : 'Watch & repeat 3 rounds'}
           </Label>
          </View>
          <View style={{ gap: 12, flex: 1, justifyContent: 'center' }}>
           {[
            [
             { idx: 0, bg: '#5B9A77', lit: '#8AE8B2', icon: 'code' as IconName },
             { idx: 1, bg: '#E5A94C', lit: '#FFE08A', icon: 'coffee' as IconName },
            ],
            [
             { idx: 2, bg: '#D9755A', lit: '#FFAD96', icon: 'flame' as IconName },
             { idx: 3, bg: '#6C8CC4', lit: '#A8C7FF', icon: 'terminal' as IconName },
            ],
           ].map((row, rIdx) => (
            <View key={rIdx} style={{ flexDirection: 'row', gap: 12 }}>
             {row.map(p => (
              <Pressable
               key={p.idx}
               onPress={() => tapMemoryPad(p.idx)}
               style={{
                flex: 1,
                aspectRatio: 1,
                borderRadius: 24,
                backgroundColor: memLit === p.idx ? p.lit : p.bg,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: memLit === p.idx ? 1.05 : 1 }],
               }}
              >
               <Icon name={p.icon} size={32} color="#FFFFFF" />
              </Pressable>
             ))}
            </View>
           ))}
          </View>
          <Button icon="brain" disabled={memShowing} onPress={startMemoryGame}>
           {memStatus === 'playing' ? 'Restart sequence' : 'Start Code Memory'}
          </Button>
         </View>
        )}
       </View>
      )}

      {/* HEALTH APP */}
      {screen === 'health' && (
       <View style={s.appScreen}>
        <View style={s.appHeader}>
         <Pressable onPress={() => { playGlobalTap(); setScreen('home'); }} style={s.backChip}>
          <Icon name="back" size={16} color={C.ink} />
         </Pressable>
         <Label style={s.appTitle}>Studio Health</Label>
         <View style={{ width: 32 }} />
        </View>
        <View style={[s.weatherHero, { backgroundColor: '#E8536B' }]}>
         <Icon name="heart" size={28} color="#FFFFFF" />
         <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 30, color: '#FFFFFF' }}>
          {stepsCount.toLocaleString()}
         </Label>
         <Label style={{ fontSize: 12, color: '#FFE3E8', fontWeight: '700' }}>Studio steps today · Great posture!</Label>
        </View>
        <View style={s.chatRow}>
         <Icon name="coffee" size={20} color="#4FA3D1" />
         <View style={{ flex: 1 }}>
          <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14 }}>Hydration</Label>
          <Label style={{ fontSize: 12, color: C.muted }}>{waterCups} / 8 glasses of water today</Label>
         </View>
         <Pressable
          onPress={() => {
           playGlobalTap();
           setWaterCups(w => Math.min(12, w + 1));
           setStepsCount(st => st + 35);
          }}
          style={s.callChip}
         >
          <Label style={{ fontSize: 12, fontWeight: '800', color: C.green }}>+1 glass</Label>
         </Pressable>
        </View>
        <View style={s.chatRow}>
         <Icon name="flame" size={20} color={C.gold} />
         <View style={{ flex: 1 }}>
          <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14 }}>Coding Streak</Label>
          <Label style={{ fontSize: 12, color: C.muted }}>{save.streak?.count ?? 0} consecutive cozy days</Label>
         </View>
        </View>
       </View>
      )}

      {/* WEATHER APP */}
      {screen === 'weather' && (
       <View style={s.appScreen}>
        <View style={s.appHeader}>
         <Pressable onPress={() => { playGlobalTap(); setScreen('home'); }} style={s.backChip}>
          <Icon name="back" size={16} color={C.ink} />
         </Pressable>
         <Label style={s.appTitle}>Weather</Label>
         <View style={{ width: 32 }} />
        </View>
        <View style={s.weatherHero}>
         <Label style={{ fontSize: 12, fontWeight: '700', color: '#E3F2F7' }}>{activeHome.city.toUpperCase()}</Label>
         <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 34, color: '#FFFFFF' }}>
          {resolvedAtmosphere === 'rainy' ? '18°' : resolvedAtmosphere === 'moonlit' ? '15°' : '23°'}
         </Label>
         <Label style={{ fontSize: 12.5, color: '#EBF6FA' }}>
          {resolvedAtmosphere === 'rainy'
           ? 'Soft Rain · Cozy Patter'
           : resolvedAtmosphere === 'moonlit'
           ? 'Clear Night · Starry Sky'
           : 'Sunny · Morning Birds'}
         </Label>
        </View>
        <View style={{ gap: 8 }}>
         {ATMOSPHERES.map(a => {
          const selected = (save.atmosphere ?? 'auto') === a.id;
          return (
           <Pressable
            key={a.id}
            onPress={() => {
             playGlobalTap();
             onAtmosphere(a.id);
            }}
            style={[s.chatRow, selected && { backgroundColor: '#EAF3E4', borderColor: C.green }]}
           >
            <Icon name={a.icon as IconName} size={18} color={selected ? C.green : C.muted} />
            <View style={{ flex: 1 }}>
             <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14 }}>{a.name}</Label>
             <Label style={{ fontSize: 11.5, color: C.muted }}>{a.description}</Label>
            </View>
            {selected && <Icon name="check" size={16} color={C.green} />}
           </Pressable>
          );
         })}
        </View>
       </View>
      )}

      {/* NOTES APP */}
      {screen === 'notes' && (
       <View style={s.appScreen}>
        <View style={s.appHeader}>
         <Pressable onPress={() => { playGlobalTap(); setScreen('home'); }} style={s.backChip}>
          <Icon name="back" size={16} color={C.ink} />
         </Pressable>
         <Label style={s.appTitle}>Dev Notes</Label>
         <View style={{ width: 32 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
         <TextInput
          value={draftNote}
          onChangeText={t => setDraftNote(t.slice(0, 60))}
          placeholder="Jot a quick studio idea..."
          placeholderTextColor="#9AA99E"
          style={s.noteInput}
         />
         <Pressable
          onPress={() => {
           if (!draftNote.trim()) return;
           playGlobalTap();
           setNotes(prev => [draftNote.trim(), ...prev.slice(0, 8)]);
           setDraftNote('');
          }}
          style={s.noteAddBtn}
         >
          <Label style={{ color: '#FFFDF7', fontWeight: '800', fontSize: 13 }}>Add</Label>
         </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ gap: 8 }}>
         {notes.map((n, i) => (
          <View key={i} style={s.noteCard}>
           <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5B946' }} />
           <Label style={{ flex: 1, fontSize: 13, color: C.ink }}>{n}</Label>
          </View>
         ))}
        </ScrollView>
       </View>
      )}

      {/* LO-FI RADIO / MUSIC APP */}
      {screen === 'music' && (
       <View style={s.appScreen}>
        <View style={s.appHeader}>
         <Pressable onPress={() => { playGlobalTap(); setScreen('home'); }} style={s.backChip}>
          <Icon name="back" size={16} color={C.ink} />
         </Pressable>
         <Label style={s.appTitle}>Nib Radio</Label>
         <View style={{ width: 32 }} />
        </View>
        <View style={s.radioArt}>
         <Icon name="music" size={44} color="#FFFDF7" />
         <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 19, color: '#FFFDF7', marginTop: 8 }}>
          Cozy Coding Beats
         </Label>
         <Label style={{ fontSize: 12, color: '#F7D8DD' }}>75 BPM Lo-Fi Rhodes · Offline</Label>
        </View>
        <View style={s.chatRow}>
         <View style={{ flex: 1, gap: 4 }}>
          <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 13 }}>Active ambient layers</Label>
          <Label style={{ fontSize: 12, color: C.muted }}>
           {[
            'Lo-Fi Beat',
            resolvedAtmosphere === 'sunny' ? 'Morning Birds' : null,
            resolvedAtmosphere === 'rainy' ? 'Rain Patter' : null,
            isCityHome ? `${activeHome.city} Street Cars` : null,
           ]
            .filter(Boolean)
            .join(' · ')}
          </Label>
         </View>
        </View>
        <Button icon={soundOn ? 'volumeOff' : 'volumeOn'} secondary={!soundOn} onPress={onToggleSound}>
         {soundOn ? 'Pause studio audio' : 'Resume studio audio'}
        </Button>
       </View>
      )}

      {/* STUDIO WEALTH / PORTFOLIO APP */}
      {screen === 'wealth' && (
       <View style={s.appScreen}>
        <View style={s.appHeader}>
         <Pressable onPress={() => { playGlobalTap(); setScreen('home'); }} style={s.backChip}>
          <Icon name="back" size={16} color={C.ink} />
         </Pressable>
         <Label style={s.appTitle}>Studio Wealth</Label>
         <View style={{ width: 32 }} />
        </View>
        <View style={[s.weatherHero, { backgroundColor: '#253B34' }]}>
         <Label style={{ fontSize: 11, fontWeight: '800', color: '#9CCBB1' }}>TOTAL NET WORTH</Label>
         <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 32, color: '#FFFFFF' }}>
          {netWorth(save).toLocaleString()}
         </Label>
         <Label style={{ fontSize: 12, color: '#8AE0A4', fontWeight: '700' }}>
          {developerRank(save.completed)} · +{passiveRatePerHour(save)}/hr passive
         </Label>
        </View>
        <View style={{ gap: 8 }}>
         <View style={s.chatRow}>
          <Icon name="coin" size={18} color={C.gold} />
          <Label style={{ flex: 1, fontSize: 13.5, fontWeight: '700' }}>Coin Jar</Label>
          <Label style={{ fontSize: 14, fontWeight: '800', color: C.ink }}>{save.coins.toLocaleString()}</Label>
         </View>
         <View style={s.chatRow}>
          <Icon name="pin" size={18} color={C.green} />
          <Label style={{ flex: 1, fontSize: 13.5, fontWeight: '700' }}>Home</Label>
          <Label style={{ fontSize: 13, color: C.muted }}>{activeHome.city}</Label>
         </View>
         <View style={s.chatRow}>
          <Icon name="car" size={18} color={C.gold} />
          <Label style={{ flex: 1, fontSize: 13.5, fontWeight: '700' }}>Garage</Label>
          <Label style={{ fontSize: 13, color: C.muted }}>{activeRide ? activeRide.name : 'Walking'}</Label>
         </View>
        </View>
       </View>
      )}
     </View>

     {/* Bottom Home Indicator Pill */}
     <Pressable onPress={goHome} style={s.homeBarArea} accessibilityRole="button" accessibilityLabel="Phone home button">
      <View style={s.homeBar} />
     </Pressable>
    </View>
   </View>
  </Modal>
 );
}

const s = StyleSheet.create({
 backdrop: {
  flex: 1,
  backgroundColor: '#12201CB8',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 10,
 },
 phoneBezel: {
  backgroundColor: '#1A2522',
  borderRadius: 48,
  padding: 11,
  borderWidth: 3.5,
  borderColor: '#3A4E47',
  shadowColor: '#0A1210',
  shadowOffset: { width: 0, height: 22 },
  shadowOpacity: 0.42,
  shadowRadius: 36,
  elevation: 18,
 },
 statusBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingTop: 5,
  paddingBottom: 9,
 },
 clock: { fontSize: 12.5, fontWeight: '800', color: '#E8F3EC' },
 island: {
  width: 86,
  height: 22,
  borderRadius: 11,
  backgroundColor: '#0A100E',
  alignItems: 'flex-end',
  justifyContent: 'center',
  paddingRight: 9,
 },
 cameraDot: { width: 7.5, height: 7.5, borderRadius: 4, backgroundColor: '#243833' },
 batteryText: { fontSize: 11, fontWeight: '700', color: '#C5D8CD' },
 screen: {
  flex: 1,
  backgroundColor: '#F5F8EE',
  borderRadius: 34,
  overflow: 'hidden',
  position: 'relative',
 },
 notifBanner: {
  position: 'absolute',
  top: 10,
  left: 10,
  right: 10,
  zIndex: 30,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  backgroundColor: '#FFFFFFF5',
  borderRadius: 20,
  padding: 11,
  shadowColor: '#0E1C18',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.22,
  shadowRadius: 14,
  elevation: 8,
  borderWidth: 1,
  borderColor: '#E2E9DC',
 },
 notifIcon: {
  width: 30,
  height: 30,
  borderRadius: 9,
  backgroundColor: '#34C759',
  alignItems: 'center',
  justifyContent: 'center',
 },
 notifTitle: { fontSize: 12.5, fontWeight: '800', color: '#1C1C1E' },
 notifNow: { fontSize: 10.5, color: '#8E8E93' },
 notifText: { fontSize: 12, color: '#3A3A3C' },
 homeWrap: {
  flex: 1,
  paddingHorizontal: 18,
  paddingTop: 22,
  paddingBottom: 14,
  justifyContent: 'space-between',
 },
 homeClockBlock: {
  alignItems: 'center',
  marginTop: 4,
 },
 homeDateText: {
  fontSize: 12.5,
  fontWeight: '700',
  color: '#FFFFFFEE',
  textShadowColor: '#00000033',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
 },
 homeBigClock: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 44,
  color: '#FFFFFF',
  lineHeight: 50,
  textShadowColor: '#00000033',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 6,
 },
 appGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  rowGap: 18,
  paddingHorizontal: 4,
 },
 appCell: {
  width: '30%',
  alignItems: 'center',
  gap: 5,
 },
 appIcon: {
  width: 60,
  height: 60,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#0F201B',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.22,
  shadowRadius: 8,
  elevation: 4,
 },
 appBadge: {
  position: 'absolute',
  top: -5,
  right: -5,
  minWidth: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: '#FF3B30',
  borderWidth: 2,
  borderColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 4,
 },
 appBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
 appLabel: {
  fontSize: 11.5,
  fontWeight: '700',
  color: '#FFFFFF',
  textAlign: 'center',
  textShadowColor: '#00000055',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
 },
 dock: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: '#FFFFFF45',
  borderRadius: 26,
  paddingVertical: 11,
  paddingHorizontal: 10,
  borderWidth: 1,
  borderColor: '#FFFFFF44',
 },
 dockBtn: {
  width: 48,
  height: 48,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
 },
 appScreen: {
  flex: 1,
  padding: 15,
  gap: 12,
 },
 iosNav: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E5EA',
 },
 iosBackBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 3,
  width: 78,
 },
 iosNavTitle: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 17,
  color: '#1C1C1E',
 },
 iosChatRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 11,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F3',
  gap: 10,
 },
 iosUnreadCol: {
  width: 10,
  alignItems: 'center',
 },
 iosBlueDot: {
  width: 9,
  height: 9,
  borderRadius: 5,
  backgroundColor: '#007AFF',
 },
 iosChatMeta: {
  flex: 1,
  gap: 2,
 },
 imsgBubble: {
  maxWidth: '82%',
  paddingHorizontal: 13,
  paddingVertical: 9,
  borderRadius: 18,
 },
 imsgMe: {
  alignSelf: 'flex-end',
  backgroundColor: '#007AFF',
  borderBottomRightRadius: 4,
 },
 imsgThem: {
  alignSelf: 'flex-start',
  backgroundColor: '#E9E9EB',
  borderBottomLeftRadius: 4,
 },
 imsgComposer: {
  borderTopWidth: 1,
  borderTopColor: '#E5E5EA',
  paddingTop: 10,
 },
 imsgReplyPill: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#007AFF',
  borderRadius: 18,
  paddingHorizontal: 14,
  paddingVertical: 10,
 },
 appHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
 },
 backChip: {
  width: 34,
  height: 34,
  borderRadius: 12,
  backgroundColor: '#E7EFE0',
  alignItems: 'center',
  justifyContent: 'center',
 },
 appTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 19, color: C.ink },
 chatRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 12,
  borderWidth: 1,
  borderColor: '#E4ECDC',
 },
 avatarDot: {
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
 },
 bubbleThem: {
  alignSelf: 'flex-start',
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E4ECDC',
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 8,
 },
 callChip: {
  backgroundColor: '#E6F1E0',
  paddingHorizontal: 11,
  paddingVertical: 5,
  borderRadius: 10,
 },
 callCard: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
 },
 callAvatar: {
  width: 72,
  height: 72,
  borderRadius: 36,
  alignItems: 'center',
  justifyContent: 'center',
 },
 arcadeAppIcon: {
  width: 78,
  height: 78,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#0F201B',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 4,
 },
 gameDetailCard: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  paddingHorizontal: 10,
 },
 arcadeStats: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 9,
  borderWidth: 1,
  borderColor: '#E4ECDC',
 },
 arcadeGrid: {
  flex: 1,
  justifyContent: 'center',
  gap: 10,
 },
 arcadeCell: {
  flex: 1,
  aspectRatio: 1,
  borderRadius: 20,
  backgroundColor: '#E8EFE2',
  borderWidth: 1,
  borderColor: '#D6E2CE',
  alignItems: 'center',
  justifyContent: 'center',
 },
 arcadeCellBug: {
  backgroundColor: '#D9755A',
  borderColor: '#B85A42',
 },
 weatherHero: {
  backgroundColor: '#4B8FB3',
  borderRadius: 22,
  padding: 18,
  alignItems: 'center',
  gap: 3,
 },
 noteInput: {
  flex: 1,
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#DCE5D3',
  paddingHorizontal: 12,
  paddingVertical: 9,
  fontSize: 13.5,
  color: C.ink,
 },
 noteAddBtn: {
  backgroundColor: C.green,
  borderRadius: 14,
  paddingHorizontal: 14,
  justifyContent: 'center',
 },
 noteCard: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  backgroundColor: '#FFFDF5',
  borderRadius: 14,
  padding: 12,
  borderWidth: 1,
  borderColor: '#EFE6C8',
 },
 radioArt: {
  backgroundColor: '#C95466',
  borderRadius: 24,
  paddingVertical: 30,
  alignItems: 'center',
  justifyContent: 'center',
 },
 homeBarArea: {
  alignItems: 'center',
  paddingTop: 10,
  paddingBottom: 3,
 },
 homeBar: {
  width: 112,
  height: 4.5,
  borderRadius: 3,
  backgroundColor: '#778F85',
 },
});
