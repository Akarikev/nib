import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
 Easing,
 useAnimatedStyle,
 useReducedMotion,
 useSharedValue,
 withSequence,
 withTiming,
} from 'react-native-reanimated';
import { C, Icon, IconName, Label } from './ui';

export type FloatPopEvent = {
 id: number;
 text: string;
 icon: IconName;
 tone?: 'gold' | 'green' | 'peach';
} | null;

export function FloatPop({ event }: { event: FloatPopEvent }) {
 const reduced = useReducedMotion();
 const progress = useSharedValue(0);

 useEffect(() => {
  if (!event) return;
  progress.set(0);
  progress.set(
   withSequence(
    withTiming(1, { duration: reduced ? 120 : 220, easing: Easing.out(Easing.cubic) }),
    withTiming(2, { duration: reduced ? 600 : 1050, easing: Easing.out(Easing.quad) })
   )
  );
 }, [event?.id, reduced, progress]);

 const animStyle = useAnimatedStyle(() => {
  const p = progress.get();
  if (p === 0 || p >= 2) return { opacity: 0, transform: [{ translateY: 0 }, { scale: 0.9 }] };
  const fadeIn = Math.min(1, p);
  const fadeOut = p > 1.3 ? Math.max(0, 1 - (p - 1.3) / 0.7) : 1;
  const dy = reduced ? 0 : -p * 26;
  const sc = reduced ? 1 : p < 1 ? 0.88 + p * 0.14 : 1.02 - (p - 1) * 0.04;
  return {
   opacity: fadeIn * fadeOut,
   transform: [{ translateY: dy }, { scale: sc }],
  };
 });

 if (!event) return null;

 const bg =
  event.tone === 'gold' ? '#FDF5DF' : event.tone === 'peach' ? '#FDEFE6' : '#EBF4E5';
 const border =
  event.tone === 'gold' ? '#E7CFA0' : event.tone === 'peach' ? '#EBCBB9' : '#CBE0C2';
 const color =
  event.tone === 'gold' ? C.gold : event.tone === 'peach' ? '#C0664D' : C.green;

 return (
  <View pointerEvents="none" style={s.wrap}>
   <Animated.View style={[s.pill, { backgroundColor: bg, borderColor: border }, animStyle]}>
    <Icon name={event.icon} size={15} color={color} />
    <Label style={[s.text, { color }]}>{event.text}</Label>
   </Animated.View>
  </View>
 );
}

const s = StyleSheet.create({
 wrap: {
  position: 'absolute',
  bottom: 92,
  left: 0,
  right: 0,
  alignItems: 'center',
  zIndex: 20,
 },
 pill: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 99,
  borderWidth: 1.5,
  shadowColor: '#203A32',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.14,
  shadowRadius: 12,
  elevation: 5,
 },
 text: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 14,
 },
});
