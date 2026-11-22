import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, C, Icon, IconName, Label } from './ui';
import { APP_NAME } from '../config';

const SLIDES: { eyebrow: string; title: string; body: string; icon: IconName; accent: string; chip: string }[] = [
 {
  eyebrow: 'WELCOME TO NIB',
  title: 'Your quiet little coding studio.',
  body: 'Settle into a cozy corner. Start small timed coding projects, let your developer type away while you live your day, and come back to coins.',
  icon: 'terminal',
  accent: '#E5EEDC',
  chip: '100% Offline · Zero Stress',
 },
 {
  eyebrow: 'COFFEE & COMPANION',
  title: 'Sip a coffee boost & adopt a desk cat.',
  body: 'Your coffee energy refills every 30 minutes—even while offline. Spend a cup to trim 25% off a project’s timer, and save up 100 coins to adopt a sleepy ginger friend.',
  icon: 'cat',
  accent: '#F8EADC',
  chip: '3/3 Coffee Energy · Sleepy Cat',
 },
 {
  eyebrow: 'UPGRADES & MILESTONES',
  title: 'Claim milestones & shape your mood.',
  body: 'Tap the milestone award badge in the top header to collect bonus coin jars, equip cozy headphones or a warm desk lamp, and switch between Sunny, Rainy, and Moonlit moods.',
  icon: 'award',
  accent: '#F7EDCE',
  chip: 'Sunny · Rainy · Moonlit',
 },
];

export function Onboarding({ open, onComplete }: { open: boolean; onComplete: () => void }) {
 const insets = useSafeAreaInsets();
 const reduced = useReducedMotion();
 const [step, setStep] = useState(0);
 const scale = useSharedValue(0.94);
 const opacity = useSharedValue(0);

 useEffect(() => {
  if (open) {
   setStep(0);
   opacity.set(withTiming(1, { duration: 180 }));
   scale.set(reduced ? 1 : withSpring(1, { duration: 300, dampingRatio: 0.9 }));
  }
 }, [open, reduced, opacity, scale]);

 useEffect(() => {
  if (!open) return;
  scale.set(0.96);
  scale.set(reduced ? 1 : withSpring(1, { duration: 240, dampingRatio: 0.92 }));
 }, [step, open, reduced, scale]);

 const cardStyle = useAnimatedStyle(() => ({
  opacity: opacity.get(),
  transform: [{ scale: scale.get() }],
 }));

 if (!open) return null;
 const slide = SLIDES[step]!;
 const isLast = step === SLIDES.length - 1;

 return (
  <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={onComplete}>
   <View style={[s.backdrop, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
    <Animated.View accessibilityViewIsModal style={[s.card, cardStyle]}>
     <View style={s.topRow}>
      <Label style={s.brand}>
       {APP_NAME}
       <Label style={{ color: '#D69F6A', fontSize: 26 }}>.</Label>
      </Label>
      <Pressable
       accessibilityRole="button"
       accessibilityLabel="Skip onboarding tour"
       onPress={onComplete}
       style={({ pressed }) => [s.skipBtn, { opacity: pressed ? 0.65 : 1 }]}
      >
       <Label style={s.skipText}>Skip</Label>
      </Pressable>
     </View>

     <View style={[s.illustration, { backgroundColor: slide.accent }]}>
      <View style={s.iconCircle}>
       <Icon name={slide.icon} size={38} color={C.green} />
      </View>
      <View style={s.chip}>
       <Label style={s.chipText}>{slide.chip}</Label>
      </View>
     </View>

     <View style={{ gap: 8 }}>
      <Label style={s.eyebrow}>{slide.eyebrow}</Label>
      <Label style={s.title}>{slide.title}</Label>
      <Label style={s.body}>{slide.body}</Label>
     </View>

     <View style={s.dotsRow}>
      {SLIDES.map((_, idx) => (
       <View
        key={idx}
        style={[
         s.dot,
         idx === step ? { width: 24, backgroundColor: C.green } : { width: 8, backgroundColor: '#D6E0CF' },
        ]}
       />
      ))}
     </View>

     <View style={{ gap: 10 }}>
      <Button
       icon={isLast ? 'check' : 'arrow'}
       onPress={() => {
        if (isLast) onComplete();
        else setStep(s => s + 1);
       }}
      >
       {isLast ? 'Enter my studio' : 'Next'}
      </Button>
      {step > 0 && (
       <Pressable
        accessibilityRole="button"
        onPress={() => setStep(s => Math.max(0, s - 1))}
        style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 14 }}
       >
        <Label style={{ fontSize: 13, color: C.muted, fontFamily: 'Nunito_800ExtraBold' }}>Back</Label>
       </Pressable>
      )}
     </View>
    </Animated.View>
   </View>
  </Modal>
 );
}

const s = StyleSheet.create({
 backdrop: {
  flex: 1,
  backgroundColor: '#223F3866',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 22,
 },
 card: {
  width: '100%',
  maxWidth: 460,
  backgroundColor: C.bg,
  borderRadius: 32,
  padding: 24,
  gap: 20,
  borderWidth: 1,
  borderColor: '#E4EADB',
 },
 topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
 },
 brand: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 26,
  letterSpacing: -0.5,
 },
 skipBtn: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 14,
  backgroundColor: '#EEF3E7',
 },
 skipText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 12,
  color: C.muted,
 },
 illustration: {
  borderRadius: 26,
  paddingVertical: 28,
  paddingHorizontal: 20,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
 },
 iconCircle: {
  width: 78,
  height: 78,
  borderRadius: 26,
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
 },
 chip: {
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 13,
  paddingVertical: 6,
  borderRadius: 14,
 },
 chipText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 12,
  color: C.green,
 },
 eyebrow: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  letterSpacing: 1.5,
  color: C.muted,
 },
 title: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 26,
  color: C.ink,
  lineHeight: 32,
 },
 body: {
  fontSize: 14,
  lineHeight: 22,
  color: C.muted,
 },
 dotsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
 },
 dot: {
  height: 8,
  borderRadius: 4,
 },
});
