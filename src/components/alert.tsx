import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Button, C, Icon, IconName, Label } from './ui';

export type AlertOption = {
 text: string;
 onPress?: () => void;
 style?: 'default' | 'cancel' | 'danger';
 icon?: IconName;
};

export type AlertConfig = {
 title: string;
 message?: string;
 icon?: IconName;
 iconColor?: string;
 options?: AlertOption[];
};

export function CustomAlert({
 config,
 visible,
 onClose,
}: {
 config: AlertConfig | null;
 visible: boolean;
 onClose: () => void;
}) {
 const { height } = useWindowDimensions();
 const reduced = useReducedMotion();
 const [present, setPresent] = useState(visible);
 const scale = useSharedValue(0.92);
 const opacity = useSharedValue(0);

 useEffect(() => {
  if (visible) {
   setPresent(true);
   opacity.set(withTiming(1, { duration: 180 }));
   scale.set(reduced ? withTiming(1, { duration: 180 }) : withSpring(1, { dampingRatio: 0.82, duration: 260 }));
  } else {
   opacity.set(withTiming(0, { duration: 150 }));
   scale.set(
    withTiming(0.92, { duration: 150, easing: Easing.in(Easing.cubic) }, finished => {
     if (finished) scheduleOnRN(setPresent, false);
    })
   );
  }
 }, [visible, reduced, scale, opacity]);

 const backdropStyle = useAnimatedStyle(() => ({
  opacity: opacity.get(),
 }));

 const dialogStyle = useAnimatedStyle(() => ({
  opacity: opacity.get(),
  transform: [{ scale: scale.get() }],
 }));

 if (!present || !config) return null;

 const options = config.options && config.options.length > 0 ? config.options : [{ text: 'OK', style: 'default' as const }];
 const sideBySide = options.length === 2 && options.every(o => o.text.length <= 13);
 const iconColor = config.iconColor ?? (options.some(o => o.style === 'danger') ? '#B65147' : C.green);

 return (
  <Modal visible={present} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
   <View style={s.overlay}>
    <Animated.View style={[s.backdrop, backdropStyle]}>
     <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" onPress={onClose} style={StyleSheet.absoluteFill} />
    </Animated.View>

    <Animated.View accessibilityViewIsModal accessibilityRole="alert" style={[s.dialog, dialogStyle]}>
     {config.icon && (
      <View style={[s.iconWrap, { backgroundColor: iconColor === '#B65147' ? '#F7E7E5' : '#E6EEDC' }]}>
       <Icon name={config.icon} size={28} color={iconColor} />
      </View>
     )}

     <View style={s.content}>
      <Label style={s.title}>{config.title}</Label>
      {config.message && <Label style={s.message}>{config.message}</Label>}
     </View>

     <View style={[s.buttons, sideBySide && { flexDirection: 'row', alignItems: 'stretch' }]}>
      {options.map((opt, idx) => {
       const isDanger = opt.style === 'danger';
       const isCancel = opt.style === 'cancel';
       return (
        <View key={idx} style={{ flex: sideBySide ? 1 : undefined, width: !sideBySide ? '100%' : undefined }}>
         <Button
          danger={isDanger}
          secondary={isCancel}
          icon={opt.icon}
          onPress={() => {
           onClose();
           if (opt.onPress) opt.onPress();
          }}
         >
          {opt.text}
         </Button>
        </View>
       );
      })}
     </View>
    </Animated.View>
   </View>
  </Modal>
 );
}

const s = StyleSheet.create({
 overlay: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 28,
 },
 backdrop: {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: '#223F3855',
 },
 dialog: {
  width: '100%',
  maxWidth: 380,
  backgroundColor: '#FFFFFF',
  borderRadius: 30,
  paddingHorizontal: 24,
  paddingTop: 26,
  paddingBottom: 22,
  alignItems: 'center',
  gap: 18,
  borderWidth: 1,
  borderColor: '#E6EBDD',
  shadowColor: '#203A32',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.16,
  shadowRadius: 28,
  elevation: 10,
 },
 iconWrap: {
  width: 58,
  height: 58,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
 },
 content: {
  alignItems: 'center',
  gap: 8,
  width: '100%',
 },
 title: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 22,
  textAlign: 'center',
  color: C.ink,
 },
 message: {
  fontSize: 14,
  textAlign: 'center',
  color: C.muted,
  lineHeight: 21,
 },
 buttons: {
  width: '100%',
  gap: 10,
  marginTop: 4,
 },
});
