import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Label } from './ui';

type LogEntry = {
 id: number;
 prompt?: string;
 text: string;
 tone?: 'cmd' | 'ok' | 'info' | 'accent';
};

function buildProjectLogs(projectId: string, handle: string): { text: string; tone?: LogEntry['tone'] }[] {
 const user = handle || 'dev';
 switch (projectId) {
  case 'hello':
   return [
    { text: `gh auth status → logged in to github.com as ${user}`, tone: 'ok' },
    { text: 'git init hello-world && cd hello-world', tone: 'cmd' },
    { text: 'creating src/main.ts', tone: 'info' },
    { text: 'console.log("Hello, world!");', tone: 'accent' },
    { text: 'bun run main.ts → Hello, world! (4ms)', tone: 'ok' },
    { text: 'git commit -m "feat: first tiny program"', tone: 'cmd' },
    { text: 'pushing to origin/main... done!', tone: 'ok' },
   ];
  case 'bug':
   return [
    { text: 'git checkout -b fix/mystery-crash', tone: 'cmd' },
    { text: 'gh issue view #42 → "works on my machine"', tone: 'info' },
    { text: 'reproducing TypeError in parser.ts:118...', tone: 'info' },
    { text: 'aha! missing semicolon & null guard found', tone: 'accent' },
    { text: 'bun test → 18 passed, 0 failed (62ms)', tone: 'ok' },
    { text: 'git commit -m "fix: squash sneaky edge case"', tone: 'cmd' },
    { text: `gh pr create --assignee ${user} → PR #43 merged!`, tone: 'ok' },
   ];
  case 'playlist':
   return [
    { text: 'bun init lofi-beat-script', tone: 'cmd' },
    { text: 'loading soft_rain_loop.wav (44.1kHz stereo)', tone: 'info' },
    { text: 'tuning warm Rhodes piano chords @ 72 BPM', tone: 'accent' },
    { text: 'layering subtle vinyl crackle & room reverb', tone: 'info' },
    { text: 'crossfading loop seams → 0 clicks detected', tone: 'ok' },
    { text: 'rendering midnight-focus-mix.mp3...', tone: 'info' },
    { text: '✔ stream live · vibes verified', tone: 'ok' },
   ];
  case 'site':
   return [
    { text: `gh repo create ${user}/cozy-site --public`, tone: 'cmd' },
    { text: 'installing icons, fonts & warm sage palette', tone: 'info' },
    { text: 'building responsive hero & studio showcase', tone: 'info' },
    { text: 'running lighthouse audit → 100/100/100/100', tone: 'ok' },
    { text: 'git push origin main', tone: 'cmd' },
    { text: 'deploying edge preview URL... 200 OK', tone: 'accent' },
    { text: '✔ SSL active · cozy corner live on the web', tone: 'ok' },
   ];
  case 'bot':
   return [
    { text: 'initializing cozy-chatbot workspace', tone: 'cmd' },
    { text: 'loading pun_dataset_v2.json (4,096 dev jokes)', tone: 'info' },
    { text: 'tuning tone: friendly, helpful, 0% snark', tone: 'accent' },
    { text: 'eval: "why do devs prefer dark mode?" → pass', tone: 'ok' },
    { text: 'benchmarking response latency → 38ms p95', tone: 'ok' },
    { text: `connecting webhook for @${user}... connected`, tone: 'info' },
    { text: '✔ chatbot online & ready to greet visitors', tone: 'ok' },
   ];
  case 'app':
   return [
    { text: 'git checkout -b release/v1.0.0', tone: 'cmd' },
    { text: 'wiring offline-first storage & spring motion', tone: 'info' },
    { text: 'checking tablet & foldable adaptive layout', tone: 'info' },
    { text: 'tsc --noEmit → 0 type errors', tone: 'ok' },
    { text: 'bundling Hermes bytecode (2.8 MB)', tone: 'accent' },
    { text: 'signing release bundle & verifying checksums', tone: 'info' },
    { text: '✔ pocket app ready for launch!', tone: 'ok' },
   ];
  case 'game':
   return [
    { text: 'initializing 60fps SVG studio renderer', tone: 'cmd' },
    { text: 'spawning developer mascot & sleepy desk cat', tone: 'accent' },
    { text: 'balancing coin jar & coffee energy timers', tone: 'info' },
    { text: 'baking sunny, rainy & moonlit window moods', tone: 'info' },
    { text: 'playtest session: cozy factor 10/10', tone: 'ok' },
    { text: `git tag v1.0.0 && git push --tags (${user})`, tone: 'cmd' },
    { text: '✔ indie game gold master ready!', tone: 'ok' },
   ];
  case 'os':
   return [
    { text: 'nasm -f bin boot/stage1.asm -o boot.bin', tone: 'cmd' },
    { text: 'switching CPU into 32-bit protected mode', tone: 'info' },
    { text: 'initializing kernel heap & page tables', tone: 'info' },
    { text: 'writing cozy VGA text-mode framebuffer', tone: 'accent' },
    { text: 'implementing round-robin task scheduler', tone: 'info' },
    { text: 'mounting tiny RAM filesystem (/home/studio)', tone: 'ok' },
    { text: `✔ kernel booted in 14ms · welcome ${user}`, tone: 'ok' },
   ];
  default:
   return [
    { text: `logged in as ${user} · studio calm & offline`, tone: 'ok' },
    { text: 'tip: unclench your jaw & sip some water', tone: 'info' },
    { text: 'coffee status: 78°C · aroma nominal', tone: 'accent' },
    { text: 'git status → nothing to commit, vibes clean', tone: 'info' },
    { text: 'pick a project in Projects whenever you’re ready', tone: 'info' },
   ];
 }
}

const LIVE_HEARTBEATS = [
 'hmr: updated module in 11ms',
 'typecheck: 0 errors · 0 warnings',
 'git fetch origin → up to date',
 'bundle size optimal · memory 41 MB',
 'eslint & formatting check → clean',
 'saving local checkpoint... ok',
];

export function TerminalOverlay({
 projectId,
 working,
 ready,
 progress,
 playerName,
 rank,
 streak,
 completed,
 onOpenProjects,
}: {
 projectId?: string;
 working: boolean;
 ready: boolean;
 progress: number;
 playerName?: string;
 rank: string;
 streak: number;
 completed: number;
 onOpenProjects: () => void;
}) {
 const [expanded, setExpanded] = useState(false);
 const [entries, setEntries] = useState<LogEntry[]>([]);
 const nextId = useRef(1);
 const stepRef = useRef(0);
 const heartbeatRef = useRef(0);
 const lastKeyRef = useRef<string>('');
 const scrollRef = useRef<ScrollView>(null);

 const handle = playerName?.trim() ? playerName.trim().toLowerCase().replace(/\s+/g, '-') : '';
 const displayHost = handle ? `${handle}@studio` : 'studio';
 const promptStr = handle ? `${handle}:~$` : '$';

 function pushEntry(text: string, tone: LogEntry['tone'] = 'info', prompt?: string) {
  setEntries(prev => {
   const next = [...prev, { id: nextId.current++, text, tone, prompt }];
   return next.slice(-18);
  });
 }

 // Reset queue ONLY when the active project or working/idle session actually changes (never on expand/collapse!)
 useEffect(() => {
  const sessionKey = `${projectId ?? 'idle'}:${working ? 'w' : ready ? 'r' : 'i'}`;
  if (lastKeyRef.current === sessionKey) return;
  lastKeyRef.current = sessionKey;
  stepRef.current = 0;

  if (ready) {
   pushEntry('✔ build succeeded! Ready to collect coins', 'ok', promptStr);
   return;
  }

  const script = buildProjectLogs(working && projectId ? projectId : 'idle', handle);
  const first = script[0];
  if (first) {
   stepRef.current = 1;
   pushEntry(first.text, first.tone, first.tone === 'cmd' ? promptStr : undefined);
  }
 }, [projectId, working, ready, handle, promptStr]);

 // Advance through project logs without repeating from the start
 useEffect(() => {
  if (ready) return;
  const script = buildProjectLogs(working && projectId ? projectId : 'idle', handle);
  const interval = setInterval(() => {
   if (stepRef.current < script.length) {
    const item = script[stepRef.current]!;
    stepRef.current += 1;
    pushEntry(item.text, item.tone, item.tone === 'cmd' ? promptStr : undefined);
   } else if (working) {
    const beat = LIVE_HEARTBEATS[heartbeatRef.current % LIVE_HEARTBEATS.length]!;
    heartbeatRef.current += 1;
    pushEntry(beat, 'info');
   }
  }, working ? 3400 : 7500);
  return () => clearInterval(interval);
 }, [projectId, working, ready, handle, promptStr]);

 useEffect(() => {
  if (expanded) {
   setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 40);
  }
 }, [entries.length, expanded]);

 function runQuickCmd(cmd: 'status' | 'whoami' | 'coffee' | 'clear') {
  if (cmd === 'clear') {
   setEntries([{ id: nextId.current++, text: 'console cleared · ready', tone: 'info' }]);
   return;
  }
  if (cmd === 'status') {
   pushEntry('git status', 'cmd', promptStr);
   pushEntry(
    ready
     ? 'branch main · build complete, ready to ship!'
     : working
     ? `on branch feat/${projectId} · ${Math.round(progress * 100)}% compiled`
     : 'on branch main · working tree clean',
    ready ? 'ok' : 'accent'
   );
   return;
  }
  if (cmd === 'whoami') {
   pushEntry('whoami', 'cmd', promptStr);
   pushEntry(
    `${handle || 'cozy-dev'} · ${rank} · ${completed} shipped · ${streak}d streak`,
    'ok'
   );
   return;
  }
  if (cmd === 'coffee') {
   pushEntry('brew --check', 'cmd', promptStr);
   pushEntry('mug temp: 76°C · studio vibes: immaculate', 'accent');
  }
 }

 const pillLabel = handle
  ? `${handle} · ${working ? 'coding…' : ready ? 'ready!' : 'console'}`
  : working
  ? 'console · coding…'
  : ready
  ? 'console · ready!'
  : 'console';

 if (!expanded) {
  return (
   <Pressable
    accessibilityRole="button"
    accessibilityLabel="Open live dev console"
    onPress={() => setExpanded(true)}
    style={({ pressed }) => [s.collapsedPill, pressed && { opacity: 0.85 }]}
   >
    <View style={s.windowDotsMini}>
     <View style={[s.dotMini, { backgroundColor: '#E37A6F' }]} />
     <View style={[s.dotMini, { backgroundColor: '#E4BF64' }]} />
     <View style={[s.dotMini, { backgroundColor: '#6FA882' }]} />
    </View>
    <Label style={s.collapsedTitle}>{pillLabel}</Label>
    <Icon name="code" size={13} color="#7AC993" />
   </Pressable>
  );
 }

 return (
  <View style={s.container}>
   <View style={s.header}>
    <View style={s.windowDots}>
     <View style={[s.dot, { backgroundColor: '#E37A6F' }]} />
     <View style={[s.dot, { backgroundColor: '#E4BF64' }]} />
     <View style={[s.dot, { backgroundColor: '#6FA882' }]} />
    </View>
    <View style={s.tabTitleWrap}>
     <Icon name="terminal" size={11} color="#6FA882" />
     <Label style={s.tabTitle}>
      {displayHost} · {working ? 'dev-server' : ready ? 'finished' : 'shell'}
     </Label>
    </View>
    <Pressable
     accessibilityRole="button"
     accessibilityLabel="Close dev console"
     onPress={() => setExpanded(false)}
     style={s.minimizeBtn}
    >
     <Icon name="close" size={13} color="#98B3A7" />
    </Pressable>
   </View>

   <ScrollView
    ref={scrollRef}
    style={s.logScroll}
    contentContainerStyle={s.body}
    showsVerticalScrollIndicator={false}
   >
    {entries.map(item => (
     <View key={item.id} style={s.logRow}>
      {item.prompt ? (
       <Label style={s.prompt}>{item.prompt}</Label>
      ) : (
       <Label style={s.bullet}>›</Label>
      )}
      <Label
       style={[
        s.logText,
        item.tone === 'ok' && { color: '#8AE0A4' },
        item.tone === 'accent' && { color: '#F6D98B' },
        item.tone === 'cmd' && { color: '#FFFFFF', fontFamily: 'Nunito_800ExtraBold' },
       ]}
      >
       {item.text}
      </Label>
     </View>
    ))}
   </ScrollView>

   {/* Interactive Quick Commands */}
   <View style={s.cmdBar}>
    {(
     [
      ['status', 'git status'],
      ['whoami', 'whoami'],
      ['coffee', 'coffee'],
      ['clear', 'clear'],
     ] as const
    ).map(([id, label]) => (
     <Pressable
      key={id}
      accessibilityRole="button"
      onPress={() => runQuickCmd(id)}
      style={({ pressed }) => [s.cmdChip, pressed && { opacity: 0.7 }]}
     >
      <Label style={s.cmdChipText}>{label}</Label>
     </Pressable>
    ))}
   </View>

   {working && (
    <Pressable onPress={onOpenProjects} style={s.progressFooter}>
     <View style={s.progressBar}>
      <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
     </View>
     <Label style={s.percentText}>{Math.round(progress * 100)}%</Label>
    </Pressable>
   )}
  </View>
 );
}

const s = StyleSheet.create({
 collapsedPill: {
  position: 'absolute',
  top: 14,
  left: 14,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  backgroundColor: '#263833EE',
  borderWidth: 1,
  borderColor: '#3D544CEE',
  borderRadius: 16,
  paddingHorizontal: 11,
  paddingVertical: 6,
  shadowColor: '#12211C',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.16,
  shadowRadius: 6,
  elevation: 3,
 },
 windowDotsMini: {
  flexDirection: 'row',
  gap: 3.5,
 },
 dotMini: {
  width: 5.5,
  height: 5.5,
  borderRadius: 3,
 },
 collapsedTitle: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  color: '#D4E6DC',
  letterSpacing: 0.2,
 },
 minimizeBtn: {
  width: 26,
  height: 22,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  backgroundColor: '#263833',
 },
 container: {
  position: 'absolute',
  top: 12,
  left: 12,
  right: 12,
  backgroundColor: '#22332EF5',
  borderRadius: 18,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#3D544C',
  shadowColor: '#12211C',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.24,
  shadowRadius: 12,
  elevation: 6,
 },
 header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 12,
  paddingVertical: 7,
  backgroundColor: '#1B2824',
  borderBottomWidth: 1,
  borderBottomColor: '#2E413A',
 },
 windowDots: {
  flexDirection: 'row',
  gap: 5,
  width: 34,
 },
 dot: {
  width: 7,
  height: 7,
  borderRadius: 4,
 },
 tabTitleWrap: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
 },
 tabTitle: {
  fontSize: 10,
  fontFamily: 'Nunito_800ExtraBold',
  color: '#98B3A7',
  letterSpacing: 0.3,
 },
 logScroll: {
  maxHeight: 112,
 },
 body: {
  paddingHorizontal: 13,
  paddingVertical: 9,
  gap: 4,
 },
 logRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 6,
 },
 prompt: {
  fontSize: 11,
  fontFamily: 'Nunito_800ExtraBold',
  color: '#7AC993',
 },
 bullet: {
  fontSize: 11,
  fontFamily: 'Nunito_800ExtraBold',
  color: '#6E8F81',
 },
 logText: {
  flex: 1,
  fontSize: 11,
  lineHeight: 15,
  fontFamily: 'Nunito_600SemiBold',
  color: '#CBE0D4',
 },
 cmdBar: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 6,
  paddingHorizontal: 12,
  paddingVertical: 7,
  backgroundColor: '#1C2A26',
  borderTopWidth: 1,
  borderTopColor: '#2E413A',
 },
 cmdChip: {
  backgroundColor: '#2B3E38',
  borderWidth: 1,
  borderColor: '#3E574F',
  borderRadius: 9,
  paddingHorizontal: 9,
  paddingVertical: 4,
 },
 cmdChipText: {
  fontSize: 10,
  fontFamily: 'Nunito_800ExtraBold',
  color: '#B9D6C7',
 },
 progressFooter: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: 13,
  paddingVertical: 6,
  backgroundColor: '#192521',
 },
 progressBar: {
  flex: 1,
  height: 4,
  backgroundColor: '#354B43',
  borderRadius: 2,
  overflow: 'hidden',
 },
 progressFill: {
  height: '100%',
  backgroundColor: '#7AC993',
  borderRadius: 2,
 },
 percentText: {
  fontSize: 10,
  fontFamily: 'Nunito_800ExtraBold',
  color: '#89A89A',
  fontVariant: ['tabular-nums'],
 },
});
