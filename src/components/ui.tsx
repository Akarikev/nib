import React from 'react';
import { Pressable, StyleSheet, Text, TextProps, View } from 'react-native';
import { default as ArrowRight } from 'lucide-react-native/icons/arrow-right';
import { default as Armchair } from 'lucide-react-native/icons/armchair';
import { default as Badge } from 'lucide-react-native/icons/badge';
import { default as Bug } from 'lucide-react-native/icons/bug';
import { default as CircleDollarSign } from 'lucide-react-native/icons/circle-dollar-sign';
import { default as Clock3 } from 'lucide-react-native/icons/clock-3';
import { default as Code2 } from 'lucide-react-native/icons/code-xml';
import { default as Flower2 } from 'lucide-react-native/icons/flower-2';
import { default as Gamepad2 } from 'lucide-react-native/icons/gamepad-2';
import { default as Heart } from 'lucide-react-native/icons/heart';
import { default as Keyboard } from 'lucide-react-native/icons/keyboard';
import { default as Leaf } from 'lucide-react-native/icons/leaf';
import { default as Monitor } from 'lucide-react-native/icons/monitor';
import { default as MoonStar } from 'lucide-react-native/icons/moon-star';
import { default as Package } from 'lucide-react-native/icons/package';
import { default as Palette } from 'lucide-react-native/icons/palette';
import { default as ShoppingBag } from 'lucide-react-native/icons/shopping-bag';
import { default as Brain } from 'lucide-react-native/icons/brain';
import { default as CircleAlert } from 'lucide-react-native/icons/circle-alert';
import { default as Sun } from 'lucide-react-native/icons/sun';
import { default as Terminal } from 'lucide-react-native/icons/terminal';
import { default as Trophy } from 'lucide-react-native/icons/trophy';
import { default as X } from 'lucide-react-native/icons/x';
import { default as CloudRain } from 'lucide-react-native/icons/cloud-rain';
import { default as Cat } from 'lucide-react-native/icons/cat';
import { default as Coffee } from 'lucide-react-native/icons/coffee';
import { default as LampDesk } from 'lucide-react-native/icons/lamp-desk';
import { default as Award } from 'lucide-react-native/icons/award';
import { default as Check } from 'lucide-react-native/icons/check';
import type { LucideIcon } from 'lucide-react-native';
export const C = { ink: '#354F47', muted: '#788A7E', bg: '#F8FAF2', green: '#426E5C', mint: '#E5EEDC', peach: '#F4D0B4', gold: '#A47A2A' };
const icons = { coffee: Coffee, cat: Cat, lamp: LampDesk, award: Award, check: Check, arrow: ArrowRight, rug: Armchair, badge: Badge, bug: Bug, coin: CircleDollarSign, clock: Clock3, code: Code2, plant: Leaf, game: Gamepad2, heart: Heart, keyboard: Keyboard, monitor: Monitor, poster: MoonStar, package: Package, palette: Palette, shop: ShoppingBag, brain: Brain, alert: CircleAlert, sun: Sun, terminal: Terminal, trophy: Trophy, close: X, flower: Flower2, rain: CloudRain } satisfies Record<string, LucideIcon>;
export type IconName = keyof typeof icons;
export function Icon({ name, size = 22, color = C.ink }: { name: IconName; size?: number; color?: string }) { const Component = icons[name]; return <Component size={size} color={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" accessible={process.env.EXPO_OS === 'web' ? undefined : false} />; }
export function Label({ style, ...props }: TextProps) { return <Text {...props} style={[styles.text, style]} />; }
export function Button({ children, onPress, disabled = false, secondary = false, icon }: { children: React.ReactNode; onPress: () => void; disabled?: boolean; secondary?: boolean; icon?: IconName }) {
 const color = secondary ? C.green : '#FFFDF4';
 return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && { backgroundColor: C.mint }, disabled && { opacity: .48 }, pressed && { opacity: .75 }]}><Label style={{ fontFamily: 'Nunito_800ExtraBold', color, textAlign: 'center', flexShrink: 1 }}>{children}</Label>{icon && <Icon name={icon} color={color} size={18} />}</Pressable>;
}
export function Coins({ amount, small = false }: { amount: number; small?: boolean }) { return <View accessibilityLabel={`${amount} coins`} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Icon name="coin" color={C.gold} size={small ? 15 : 22} /><Label style={{ fontFamily: small ? 'Nunito_800ExtraBold' : 'Fredoka_600SemiBold', color: small ? C.gold : C.ink, fontSize: small ? 13 : 21, fontVariant: ['tabular-nums'] }}>{amount.toLocaleString()}</Label></View>; }
export function OwnedBadge({ kind }: { kind: 'equipped' | 'placed' | 'owned' }) { return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: kind === 'owned' ? '#EEEDE6' : '#E6EEDC', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 }}><Icon name={kind === 'equipped' ? 'keyboard' : kind === 'placed' ? 'flower' : 'package'} size={12} color={C.green} /><Label style={{ fontSize: 10, color: C.green, fontFamily: 'Nunito_800ExtraBold' }}>{kind === 'equipped' ? 'Equipped' : kind === 'placed' ? 'In your room' : 'Yours'}</Label></View>; }
const styles = StyleSheet.create({ text: { fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: C.ink }, button: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.green, padding: 14, borderRadius: 17, minHeight: 48, justifyContent: 'center' } });
