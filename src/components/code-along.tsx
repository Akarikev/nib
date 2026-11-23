import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, C, Icon, Label } from './ui';

type BugChallenge = {
 file: string;
 lines: string[];
 bugLineIndex: number;
 options: string[];
 answerIndex: number;
 hint: string;
};

const BUG_CHALLENGES: BugChallenge[] = [
 {
  file: 'coffee.ts',
  lines: ['function brew(cups: number) {', '  const hot = true', '  return cups * 2;'],
  bugLineIndex: 1,
  options: ['Add missing ;', 'Delete return', 'Make cups = 0'],
  answerIndex: 0,
  hint: 'Missing semicolon on line 2!',
 },
 {
  file: 'ship.ts',
  lines: ['const ready = true;', 'if (ready = false) {', '  deploy();'],
  bugLineIndex: 1,
  options: ['Use === instead of =', 'Remove if()', 'Add console.warn'],
  answerIndex: 0,
  hint: 'Assignment inside an if-check!',
 },
 {
  file: 'list.ts',
  lines: ['const tasks = ["ui", "api"];', 'const count = tasks.lenght;', 'return count;'],
  bugLineIndex: 1,
  options: ['Fix .lenght → .length', 'Use tasks.size', 'Wrap in try/catch'],
  answerIndex: 0,
  hint: 'Classic .lenght typo!',
 },
 {
  file: 'greet.ts',
  lines: ['export function hi(name: string) {', '  retun `Hey ${name}!`;', '}'],
  bugLineIndex: 1,
  options: ['Fix retun → return', 'Change backticks', 'Remove export'],
  answerIndex: 0,
  hint: 'Typo in the return keyword!',
 },
 {
  file: 'theme.ts',
  lines: ['cosnt mood = "rainy";', 'applyTheme(mood);', 'saveStudio();'],
  bugLineIndex: 0,
  options: ['Fix cosnt → const', 'Delete mood', 'Use mood = 1'],
  answerIndex: 0,
  hint: 'Fast-finger typo: cosnt!',
 },
 {
  file: 'debug.ts',
  lines: ['const ok = checkBuild();', 'consol.log("build:", ok);', 'return ok;'],
  bugLineIndex: 1,
  options: ['Fix consol → console', 'Remove quotes', 'Return false'],
  answerIndex: 0,
  hint: 'Missing the "e" in console.log!',
 },
 {
  file: 'cat.ts',
  lines: ['const sleepy = flase;', 'if (!sleepy) purr();', 'nap();'],
  bugLineIndex: 0,
  options: ['Fix flase → false', 'Remove !sleepy', 'Call nap(0)'],
  answerIndex: 0,
  hint: 'Boolean typo: flase!',
 },
 {
  file: 'math.ts',
  lines: ['const bonus = 1.5;', 'const total = reward * bouns;', 'return total;'],
  bugLineIndex: 1,
  options: ['Fix bouns → bonus', 'Divide by 0', 'Remove const'],
  answerIndex: 0,
  hint: 'Variable name mismatch: bouns!',
 },
 {
  file: 'array.ts',
  lines: ['const items = ["lamp", "rug"];', 'items.pus("tv");', 'renderRoom();'],
  bugLineIndex: 1,
  options: ['Fix .pus → .push', 'Use .pop()', 'Clear array'],
  answerIndex: 0,
  hint: 'Missing "h" in array.push!',
 },
 {
  file: 'timer.ts',
  lines: ['const ms = 4000;', 'setTimout(finish, ms);', 'updateUI();'],
  bugLineIndex: 1,
  options: ['Fix setTimout → setTimeout', 'Set ms = -1', 'Delete finish'],
  answerIndex: 0,
  hint: 'Typo in setTimeout!',
 },
];

const FLOW_LINES = [
 'const studio = initCozyEnv({ offline: true });',
 'await compileModules({ minify: true, warnings: 0 });',
 'const assets = preloadSprites(["cat", "mug", "lamp"]);',
 'assert(build.errors === 0, "clean build!");',
 'saveCheckpoint({ coins: jar.total, safe: true });',
 'renderFrame({ fps: 60, smooth: true });',
 'shipRelease({ target: "pocket-studio", ready: true });',
];

export function CodeAlongModal({
 visible,
 projectName,
 remainingLabel,
 progressPct,
 isReady,
 onClose,
 onTypeLine,
 onFixBug,
 onShip,
}: {
 visible: boolean;
 projectName: string;
 remainingLabel: string;
 progressPct: number;
 isReady: boolean;
 onClose: () => void;
 onTypeLine: () => void;
 onFixBug: () => void;
 onShip: () => void;
}) {
 const insets = useSafeAreaInsets();
 const [bugIdx, setBugIdx] = useState(() => Math.floor(Math.random() * BUG_CHALLENGES.length));
 const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
 const [typedLines, setTypedLines] = useState<string[]>([
  '// Flow mode active — fix a bug (-10s) or type lines (-4s)',
 ]);

 const challenge = useMemo(() => BUG_CHALLENGES[bugIdx % BUG_CHALLENGES.length], [bugIdx]);

 function pickOption(i: number) {
  if (isReady) return;
  if (i === challenge.answerIndex) {
   onFixBug();
   setFeedback({ text: 'Bug squashed! -10s off timer', ok: true });
   setTypedLines(prev => [...prev.slice(-4), `✓ fixed ${challenge.file}: ${challenge.options[i]}`]);
   setBugIdx(prev => (prev + 1 + Math.floor(Math.random() * 3)) % BUG_CHALLENGES.length);
  } else {
   setFeedback({ text: `Not quite — hint: ${challenge.hint}`, ok: false });
  }
 }

 function handleTypeLine() {
  if (isReady) return;
  onTypeLine();
  const nextLine = FLOW_LINES[typedLines.length % FLOW_LINES.length];
  setTypedLines(prev => [...prev.slice(-4), `> ${nextLine}`]);
  setFeedback({ text: 'Line written! -4s off timer', ok: true });
 }

 return (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
   <View style={s.backdrop}>
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
    <View style={[s.sheet, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
     {/* Top bar */}
     <View style={s.header}>
      <View style={s.dots}>
       <View style={[s.dot, { backgroundColor: '#E37A6F' }]} />
       <View style={[s.dot, { backgroundColor: '#E4BF64' }]} />
       <View style={[s.dot, { backgroundColor: '#6FA882' }]} />
      </View>
      <Label style={s.headerTitle} numberOfLines={1}>
       Code Along · {projectName}
      </Label>
      <Pressable onPress={onClose} style={s.closeBtn} accessibilityRole="button" accessibilityLabel="Close code along">
       <Icon name="close" size={16} color="#BFD4C8" />
      </Pressable>
     </View>

     {/* Progress bar */}
     <View style={s.progressWrap}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
       <Label style={s.progressText}>{isReady ? 'Build finished!' : `Time left · ${remainingLabel}`}</Label>
       <Label style={s.progressPct}>{Math.round(progressPct * 100)}%</Label>
      </View>
      <View style={s.track}>
       <View style={[s.fill, { width: `${Math.min(100, Math.max(4, progressPct * 100))}%` }]} />
      </View>
     </View>

     <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
      {isReady ? (
       <View style={s.doneCard}>
        <Icon name="check" size={28} color="#8AE0A4" />
        <Label style={s.doneTitle}>Project ready to ship!</Label>
        <Label style={s.doneSub}>Awesome flow session. Collect your coins back in the studio.</Label>
        <View style={{ width: '100%', marginTop: 6 }}>
         <Button
          icon="coin"
          onPress={() => {
           onClose();
           onShip();
          }}
         >
          Ship & collect coins
         </Button>
        </View>
       </View>
      ) : (
       <>
        {/* Bug Spotter Card */}
        <View style={s.editorCard}>
         <View style={s.fileTab}>
          <Icon name="code" size={13} color="#8AE0A4" />
          <Label style={s.fileTabText}>{challenge.file}</Label>
          <View style={s.badge}>
           <Label style={s.badgeText}>Spot the bug · -10s</Label>
          </View>
         </View>

         <View style={s.codeBox}>
          {challenge.lines.map((line, idx) => (
           <View
            key={idx}
            style={[s.codeRow, idx === challenge.bugLineIndex && s.codeRowBug]}
           >
            <Label style={s.lineNum}>{idx + 1}</Label>
            <Label style={[s.codeLine, idx === challenge.bugLineIndex && { color: '#FFD2B8' }]}>
             {line}
            </Label>
           </View>
          ))}
         </View>

         <View style={{ gap: 8 }}>
          {challenge.options.map((opt, idx) => (
           <Pressable
            key={idx}
            accessibilityRole="button"
            onPress={() => pickOption(idx)}
            style={({ pressed }) => [s.optBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }]}
           >
            <Label style={s.optText}>{opt}</Label>
            <Icon name="arrow" size={14} color="#8AE0A4" />
           </Pressable>
          ))}
         </View>
        </View>

        {feedback && (
         <View style={[s.feedbackPill, { backgroundColor: feedback.ok ? '#264538' : '#4A312C' }]}>
          <Label style={{ fontSize: 12, color: feedback.ok ? '#9EE5B3' : '#F6B8A8', fontWeight: '700' }}>
           {feedback.text}
          </Label>
         </View>
        )}

        {/* Quick Type-a-Line buffer */}
        <View style={s.bufferCard}>
         <View style={{ gap: 4 }}>
          {typedLines.map((ln, i) => (
           <Label key={i} style={s.bufferLine} numberOfLines={1}>
            {ln}
           </Label>
          ))}
         </View>
         <Pressable
          accessibilityRole="button"
          onPress={handleTypeLine}
          style={({ pressed }) => [s.typeBtn, pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] }]}
         >
          <Icon name="zap" size={16} color="#182722" />
          <Label style={s.typeBtnText}>Type a line · -4s</Label>
         </Pressable>
        </View>
       </>
      )}
     </ScrollView>
    </View>
   </View>
  </Modal>
 );
}

const s = StyleSheet.create({
 backdrop: {
  flex: 1,
  backgroundColor: '#12201C99',
  justifyContent: 'flex-end',
 },
 sheet: {
  backgroundColor: '#1B2B26',
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  paddingHorizontal: 18,
  paddingTop: 14,
  maxHeight: '86%',
  borderTopWidth: 1,
  borderColor: '#314940',
  gap: 12,
 },
 header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
 },
 dots: { flexDirection: 'row', gap: 5 },
 dot: { width: 9, height: 9, borderRadius: 5 },
 headerTitle: {
  flex: 1,
  textAlign: 'center',
  fontSize: 13,
  fontWeight: '700',
  color: '#D8EBE0',
 },
 closeBtn: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#273D36',
  alignItems: 'center',
  justifyContent: 'center',
 },
 progressWrap: {
  gap: 6,
  backgroundColor: '#223630',
  borderRadius: 14,
  padding: 12,
  borderWidth: 1,
  borderColor: '#2E473F',
 },
 progressText: { fontSize: 12, color: '#B7D0C2', fontWeight: '600' },
 progressPct: { fontSize: 12, color: '#8AE0A4', fontWeight: '800' },
 track: {
  height: 8,
  borderRadius: 99,
  backgroundColor: '#162420',
  overflow: 'hidden',
 },
 fill: {
  height: '100%',
  borderRadius: 99,
  backgroundColor: '#7AC993',
 },
 editorCard: {
  backgroundColor: '#21342E',
  borderRadius: 18,
  padding: 14,
  gap: 12,
  borderWidth: 1,
  borderColor: '#304941',
 },
 fileTab: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
 },
 fileTabText: { fontSize: 12, color: '#D4E8DC', fontWeight: '700', flex: 1 },
 badge: {
  backgroundColor: '#2E4C40',
  paddingHorizontal: 9,
  paddingVertical: 3,
  borderRadius: 99,
 },
 badgeText: { fontSize: 11, color: '#9EE5B3', fontWeight: '700' },
 codeBox: {
  backgroundColor: '#14221E',
  borderRadius: 12,
  padding: 10,
  gap: 6,
 },
 codeRow: {
  flexDirection: 'row',
  gap: 10,
  paddingHorizontal: 6,
  paddingVertical: 3,
  borderRadius: 6,
 },
 codeRowBug: {
  backgroundColor: '#4A2B26',
 },
 lineNum: { fontSize: 12, color: '#617C71', width: 14, fontFamily: 'monospace' },
 codeLine: { fontSize: 12.5, color: '#D6EADF', flex: 1, fontFamily: 'monospace' },
 optBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#294139',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 11,
  borderWidth: 1,
  borderColor: '#3A594E',
 },
 optText: { fontSize: 13, color: '#ECF6F0', fontWeight: '700' },
 feedbackPill: {
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 8,
  alignItems: 'center',
 },
 bufferCard: {
  backgroundColor: '#14221E',
  borderRadius: 16,
  padding: 12,
  gap: 10,
  borderWidth: 1,
  borderColor: '#2A4038',
 },
 bufferLine: {
  fontSize: 11.5,
  color: '#8BB39E',
  fontFamily: 'monospace',
 },
 typeBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  backgroundColor: '#8AE0A4',
  borderRadius: 14,
  paddingVertical: 12,
 },
 typeBtnText: {
  fontSize: 14,
  color: '#182722',
  fontWeight: '800',
 },
 doneCard: {
  backgroundColor: '#223630',
  borderRadius: 20,
  padding: 20,
  alignItems: 'center',
  gap: 8,
 },
 doneTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 20, color: '#ECF6F0' },
 doneSub: { fontSize: 13, color: '#B7D0C2', textAlign: 'center', lineHeight: 19 },
});
