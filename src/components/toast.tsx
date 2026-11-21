import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, FadeInUp, FadeOutUp, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, Icon, Label } from './ui';
export type Notice = { id: number; text: string; error?: boolean; icon?: 'brain' | 'coin' } | null;
export function Toast({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
 const insets = useSafeAreaInsets(); const reduced = useReducedMotion();
 useEffect(() => { if (!notice) return; const timer = setTimeout(onDismiss, notice.error ? 7000 : 3800); return () => clearTimeout(timer); }, [notice?.id, onDismiss]);
 return <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 12, left: 18, right: 18, alignItems: 'center', zIndex: 50 }}>
 {notice && <Animated.View key={notice.id} entering={reduced ? FadeIn.duration(160) : FadeInUp.duration(250).easing(Easing.bezier(.23, 1, .32, 1))} exiting={reduced ? FadeOut.duration(140) : FadeOutUp.duration(200)} style={{ width: '100%', maxWidth: 420, backgroundColor: notice.error ? '#F7E3D8' : '#F7EDCE', borderRadius: 26, borderWidth: 1, borderColor: notice.error ? '#E8CABB' : '#ECDDAD', boxShadow: '0 6px 24px #354F4720', paddingLeft: 15, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
 <View style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: notice.error ? '#F0D4C3' : '#EEDDAD' }}><Icon name={notice.error ? 'alert' : notice.icon ?? 'brain'} size={19} color={C.gold} /></View>
 <Label accessibilityLiveRegion={notice.error ? 'assertive' : 'polite'} style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 13, flex: 1, lineHeight: 18 }}>{notice.text}</Label>
 <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notification" onPress={onDismiss} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16} color={C.gold} /></Pressable>
 </Animated.View>}
 </View>;
}
