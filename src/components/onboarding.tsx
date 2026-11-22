import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVELOPER_STYLES, DeveloperStyle } from '../game/game';
import { MascotPreview } from './developer';
import { Button, C, Icon, Label } from './ui';
import { APP_NAME } from '../config';

const TOTAL_STEPS = 3;

export function Onboarding({
 open,
 initialName = '',
 initialStyle = 'curly',
 isReturningUpdate = false,
 onComplete,
}: {
 open: boolean;
 initialName?: string;
 initialStyle?: DeveloperStyle;
 isReturningUpdate?: boolean;
 onComplete: (profile: { name: string; style: DeveloperStyle }) => void;
}) {
 const insets = useSafeAreaInsets();
 const reduced = useReducedMotion();
 const [step, setStep] = useState(0);
 const [name, setName] = useState(initialName);
 const [style, setStyle] = useState<DeveloperStyle>(initialStyle);
 const slideY = useSharedValue(14);
 const opacity = useSharedValue(0);

 useEffect(() => {
  if (open) {
   setStep(0);
   setName(initialName);
   setStyle(initialStyle);
  }
 }, [open, initialName, initialStyle]);

 useEffect(() => {
  if (!open) return;
  if (reduced) {
   opacity.set(1);
   slideY.set(0);
   return;
  }
  opacity.set(0);
  slideY.set(14);
  opacity.set(withTiming(1, { duration: 220 }));
  slideY.set(withSpring(0, { duration: 280, dampingRatio: 0.92 }));
 }, [step, open, reduced, opacity, slideY]);

 const contentAnim = useAnimatedStyle(() => ({
  opacity: opacity.get(),
  transform: [{ translateY: slideY.get() }],
 }));

 if (!open) return null;

 const isLast = step === TOTAL_STEPS - 1;
 const handlePreview = name.trim() ? name.trim().toLowerCase().replace(/\s+/g, '-') : 'studio';

 function finish() {
  onComplete({ name: name.trim().slice(0, 24), style });
 }

 return (
  <Modal visible={open} animationType="fade" onRequestClose={finish}>
   <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={[s.screen, { paddingTop: Math.max(insets.top, 16) + 8 }]}
   >
    {/* Top Navigation Bar */}
    <View style={s.topBarWrap}>
     <View style={s.topBar}>
      <Label style={s.brand}>
       {APP_NAME}
       <Label style={{ color: '#D69F6A', fontSize: 30 }}>.</Label>
      </Label>

      <View style={s.dotsRow}>
       {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
        <View
         key={idx}
         style={[
          s.dot,
          idx === step ? { width: 26, backgroundColor: C.green } : { width: 8, backgroundColor: '#D6E0CF' },
         ]}
        />
       ))}
      </View>

      <Pressable
       accessibilityRole="button"
       accessibilityLabel="Skip onboarding"
       onPress={finish}
       style={({ pressed }) => [s.skipBtn, { opacity: pressed ? 0.65 : 1 }]}
      >
       <Label style={s.skipText}>Skip</Label>
      </Pressable>
     </View>
    </View>

    {/* Full-Screen Scrollable Step Body */}
    <ScrollView
     style={{ flex: 1, width: '100%' }}
     contentContainerStyle={s.scrollBody}
     showsVerticalScrollIndicator={false}
     keyboardShouldPersistTaps="handled"
    >
     <Animated.View style={[s.innerColumn, contentAnim]}>
      {step === 0 ? (
       <>
        <View style={{ gap: 8 }}>
         <Label style={s.eyebrow}>
          {isReturningUpdate ? 'NEW IN THIS UPDATE' : 'REMEMBER CODING BY HAND'}
         </Label>
         <Label style={s.title}>
          {isReturningUpdate ? 'Personalize your studio.' : 'What should we call you?'}
         </Label>
         <Label style={s.body}>
          {isReturningUpdate
           ? 'You can now put your own name on your studio terminal and pick a developer mascot. A nickname works great — or leave it blank.'
           : 'In a world of instant AI code, Nib is a quiet little corner to remember the craft. Pick a nickname for your terminal — no real name needed, and leaving it blank is totally fine.'}
         </Label>
        </View>

        <View style={s.terminalPreview}>
         <View style={s.termHeader}>
          <View style={s.termDots}>
           <View style={[s.termDot, { backgroundColor: '#E37A6F' }]} />
           <View style={[s.termDot, { backgroundColor: '#E4BF64' }]} />
           <View style={[s.termDot, { backgroundColor: '#6FA882' }]} />
          </View>
          <Label style={s.termTitle}>
           {name.trim() ? `${handlePreview}@studio` : 'studio'} · dev-server
          </Label>
          <View style={{ width: 28 }} />
         </View>
         <View style={s.termBody}>
          <View style={s.termLineRow}>
           <Label style={s.termPrompt}>{name.trim() ? `${handlePreview}:~$` : '$'}</Label>
           <Label style={s.termLine}>gh auth status → logged in as {handlePreview}</Label>
          </View>
          <View style={s.termLineRow}>
           <Label style={s.termBullet}>›</Label>
           <Label style={[s.termLine, { color: '#8AE0A4' }]}>studio ready · warm coffee poured</Label>
          </View>
         </View>
        </View>

        <View style={{ gap: 8 }}>
         <Label style={s.inputLabel}>Nickname (optional)</Label>
         <TextInput
          value={name}
          onChangeText={t => setName(t.slice(0, 24))}
          placeholder="e.g. cozydev, alex, sam"
          placeholderTextColor="#9AA99E"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={24}
          returnKeyType="next"
          onSubmitEditing={() => setStep(1)}
          style={s.input}
         />
         <Label style={{ fontSize: 12, color: C.muted, paddingHorizontal: 4 }}>
          Saved only on this device · Editable anytime in Settings
         </Label>
        </View>
       </>
      ) : step === 1 ? (
       <>
        <View style={{ gap: 8 }}>
         <Label style={s.eyebrow}>CHOOSE YOUR DEVELOPER</Label>
         <Label style={s.title}>Pick your studio mascot.</Label>
         <Label style={s.body}>
          Choose who sits at your desk. You can switch between any mascot anytime for free in Settings.
         </Label>
        </View>

        <View style={s.mascotGrid}>
         {DEVELOPER_STYLES.map(dev => {
          const selected = style === dev.id;
          return (
           <Pressable
            key={dev.id}
            accessibilityRole="radio"
            accessibilityLabel={`${dev.name}, ${dev.subtitle}, ${dev.tag}`}
            accessibilityState={{ checked: selected }}
            onPress={() => setStyle(dev.id)}
            style={({ pressed }) => [
             s.mascotCard,
             selected && s.mascotCardSelected,
             { opacity: pressed ? 0.85 : 1 },
            ]}
           >
            {selected && (
             <View style={s.checkBadge}>
              <Icon name="check" size={13} color="#FFFDF4" />
             </View>
            )}
            <MascotPreview style={dev.id} size={76} />
            <View style={{ alignItems: 'center', gap: 2 }}>
             <Label style={s.mascotName}>{dev.name}</Label>
             <Label style={s.mascotSub}>{dev.subtitle}</Label>
            </View>
            <View style={[s.tagPill, selected && { backgroundColor: '#DCEAD0' }]}>
             <Label style={[s.tagText, selected && { color: C.green }]}>{dev.tag}</Label>
            </View>
           </Pressable>
          );
         })}
        </View>
       </>
      ) : (
       <>
        <View style={s.heroReadyCard}>
         <MascotPreview style={style} size={104} />
         <View style={s.chip}>
          <Label style={s.chipText}>
           {name.trim() ? `${name.trim()}’s Studio · Ready` : '100% Offline · Zero Stress'}
          </Label>
         </View>
        </View>

        <View style={{ gap: 10 }}>
         <Label style={s.eyebrow}>SETTLE IN</Label>
         <Label style={s.title}>One small project at a time.</Label>
         <Label style={s.body}>
          Pick a coding project, let your developer type away offline while you go about your day, sip a coffee boost when you want a lift, and decorate your room with earned coins.
         </Label>
        </View>

        <View style={s.highlightsList}>
         {[
          { icon: 'terminal' as const, text: 'Tap the console pill or monitor to watch live code & logs' },
          { icon: 'coffee' as const, text: 'Coffee energy refills every 30 min — trim 25% off a timer' },
          { icon: 'cat' as const, text: 'Adopt a sleepy desk cat and tap them for cozy purrs' },
         ].map((item, idx) => (
          <View key={idx} style={s.highlightRow}>
           <View style={s.highlightIcon}>
            <Icon name={item.icon} size={17} color={C.green} />
           </View>
           <Label style={s.highlightText}>{item.text}</Label>
          </View>
         ))}
        </View>
       </>
      )}
     </Animated.View>
    </ScrollView>

    {/* Sticky Bottom Action Bar */}
    <View style={[s.footerWrap, { paddingBottom: Math.max(insets.bottom, 22) + 12 }]}>
     <View style={s.footerInner}>
      {step > 0 && (
       <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => setStep(prev => Math.max(0, prev - 1))}
        style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
       >
        <Icon name="back" size={19} color={C.ink} />
       </Pressable>
      )}
      <View style={{ flex: 1 }}>
       <Button
        icon={isLast ? 'check' : 'arrow'}
        onPress={() => {
         if (isLast) finish();
         else setStep(prev => prev + 1);
        }}
       >
        {isLast ? 'Enter my studio' : step === 0 ? (name.trim() ? 'Continue' : 'Continue without name') : 'Next'}
       </Button>
      </View>
     </View>
    </View>
   </KeyboardAvoidingView>
  </Modal>
 );
}

const s = StyleSheet.create({
 screen: {
  flex: 1,
  backgroundColor: C.bg,
  alignItems: 'center',
 },
 topBarWrap: {
  width: '100%',
  paddingHorizontal: 22,
  paddingBottom: 10,
  alignItems: 'center',
 },
 topBar: {
  width: '100%',
  maxWidth: 520,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
 },
 brand: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 30,
  letterSpacing: -0.6,
 },
 dotsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
 },
 dot: {
  height: 8,
  borderRadius: 4,
 },
 skipBtn: {
  paddingHorizontal: 13,
  paddingVertical: 7,
  borderRadius: 14,
  backgroundColor: '#EEF3E7',
 },
 skipText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 12,
  color: C.muted,
 },
 scrollBody: {
  flexGrow: 1,
  paddingHorizontal: 24,
  paddingTop: 14,
  paddingBottom: 24,
  alignItems: 'center',
  justifyContent: 'center',
 },
 innerColumn: {
  width: '100%',
  maxWidth: 480,
  gap: 22,
 },
 eyebrow: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10.5,
  letterSpacing: 1.6,
  color: C.green,
 },
 title: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 31,
  color: C.ink,
  lineHeight: 37,
 },
 body: {
  fontSize: 15,
  lineHeight: 23,
  color: C.muted,
 },
 terminalPreview: {
  backgroundColor: '#22332E',
  borderRadius: 22,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#3D544C',
 },
 termHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 14,
  paddingVertical: 9,
  backgroundColor: '#1B2824',
 },
 termDots: {
  flexDirection: 'row',
  gap: 5,
  width: 28,
 },
 termDot: {
  width: 7.5,
  height: 7.5,
  borderRadius: 4,
 },
 termTitle: {
  fontSize: 10.5,
  fontFamily: 'Nunito_800ExtraBold',
  color: '#98B3A7',
 },
 termBody: {
  paddingHorizontal: 16,
  paddingVertical: 15,
  gap: 6,
 },
 termLineRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 7,
 },
 termPrompt: {
  fontSize: 12.5,
  fontFamily: 'Nunito_800ExtraBold',
  color: '#7AC993',
 },
 termBullet: {
  fontSize: 12.5,
  fontFamily: 'Nunito_800ExtraBold',
  color: '#6E8F81',
 },
 termLine: {
  flex: 1,
  fontSize: 12.5,
  fontFamily: 'Nunito_600SemiBold',
  color: '#D4E6DC',
 },
 inputLabel: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 13,
  color: C.ink,
  paddingHorizontal: 4,
 },
 input: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1.5,
  borderColor: '#D6E2CC',
  borderRadius: 19,
  paddingHorizontal: 18,
  paddingVertical: 15,
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 16,
  color: C.ink,
 },
 mascotGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
 },
 mascotCard: {
  width: '48%',
  flexGrow: 1,
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  paddingVertical: 18,
  paddingHorizontal: 12,
  alignItems: 'center',
  gap: 10,
  borderWidth: 1.5,
  borderColor: '#E3E9DC',
  position: 'relative',
 },
 mascotCardSelected: {
  borderColor: C.green,
  backgroundColor: '#EEF5E8',
 },
 checkBadge: {
  position: 'absolute',
  top: 11,
  right: 11,
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: C.green,
  alignItems: 'center',
  justifyContent: 'center',
 },
 mascotName: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 18,
  color: C.ink,
 },
 mascotSub: {
  fontSize: 12,
  color: C.muted,
 },
 tagPill: {
  backgroundColor: '#F3F6EE',
  borderRadius: 10,
  paddingHorizontal: 10,
  paddingVertical: 4,
 },
 tagText: {
  fontSize: 10.5,
  fontFamily: 'Nunito_800ExtraBold',
  color: C.muted,
 },
 heroReadyCard: {
  backgroundColor: '#F4EAE0',
  borderRadius: 30,
  paddingVertical: 28,
  paddingHorizontal: 20,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  borderWidth: 1,
  borderColor: '#EADACA',
 },
 chip: {
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 14,
  paddingVertical: 7,
  borderRadius: 14,
 },
 chipText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 12.5,
  color: C.green,
 },
 highlightsList: {
  gap: 10,
 },
 highlightRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E6EBDD',
  borderRadius: 18,
  paddingHorizontal: 14,
  paddingVertical: 12,
 },
 highlightIcon: {
  width: 34,
  height: 34,
  borderRadius: 12,
  backgroundColor: '#EAF0DE',
  alignItems: 'center',
  justifyContent: 'center',
 },
 highlightText: {
  flex: 1,
  fontSize: 13,
  lineHeight: 18,
  color: C.ink,
 },
 footerWrap: {
  width: '100%',
  backgroundColor: C.bg,
  borderTopWidth: 1,
  borderTopColor: '#E8EDE0',
  paddingHorizontal: 22,
  paddingTop: 14,
  alignItems: 'center',
 },
 footerInner: {
  width: '100%',
  maxWidth: 480,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
 },
 backBtn: {
  width: 50,
  height: 50,
  borderRadius: 17,
  backgroundColor: '#E9EFDF',
  alignItems: 'center',
  justifyContent: 'center',
 },
});
