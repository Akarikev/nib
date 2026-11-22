import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ATMOSPHERES, Atmosphere, DESK_CAT, ITEMS, MILESTONES, MilestoneId, multiplier, Save } from '../game/game';
import { Button, C, Coins, Icon, IconName, Label, OwnedBadge } from './ui';
import { Notice, Toast } from './toast';
export function Shop({ open, onClose, save, busy, onItem, onAtmosphere, onAdopt, onMilestone, notice, onDismiss }: { open: boolean; onClose: () => void; save: Save; busy: boolean; onItem: (id: string) => void; onAtmosphere: (id: Atmosphere) => void; onAdopt: () => void; onMilestone: (id: MilestoneId) => void; notice: Notice; onDismiss: () => void }) {
 const insets = useSafeAreaInsets(); const { height } = useWindowDimensions(); const reduced = useReducedMotion();
 const [present, setPresent] = useState(open); const y = useSharedValue(1);
 useEffect(() => {
  if (open) { setPresent(true); y.set(reduced ? withTiming(0, { duration: 160 }) : withSpring(0, { duration: 300, dampingRatio: 1 })); }
  else y.set(withTiming(1, { duration: reduced ? 140 : 220, easing: Easing.bezier(.32, .72, 0, 1) }, finished => { if (finished) scheduleOnRN(setPresent, false); }));
 }, [open, reduced, y]);
 const sheetStyle = useAnimatedStyle(() => ({ opacity: reduced ? 1 - y.get() : 1, transform: [{ translateY: reduced ? 0 : y.get() * height }] }));
 const backdropStyle = useAnimatedStyle(() => ({ opacity: 1 - y.get() }));
 return <Modal visible={present} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
 <View style={{ flex: 1, justifyContent: 'flex-end' }}>
  <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: '#223F3850' }, backdropStyle]}><Pressable accessibilityRole="button" accessibilityLabel="Close upgrades" onPress={onClose} style={{ flex: 1 }} /></Animated.View>
  <Animated.View accessibilityViewIsModal style={[{ width: '100%', maxWidth: 560, alignSelf: 'center', maxHeight: height - insets.top - 36, backgroundColor: C.bg, borderTopLeftRadius: 34, borderTopRightRadius: 34, overflow: 'hidden', paddingBottom: insets.bottom }, sheetStyle]}>
   <View style={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#E4EADB', gap: 14 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><View style={{ gap: 4, flex: 1 }}><Label accessibilityRole="header" style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 29 }}>Little upgrades</Label><Label style={{ fontSize: 13, color: C.muted }}>Good things for your little corner.</Label></View><Pressable accessibilityRole="button" accessibilityLabel="Close upgrades" onPress={onClose} style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: '#E9EFDF', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={20} /></Pressable></View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7EDCE', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 17 }}><Label style={{ fontSize: 13, color: C.gold }}>Your coin jar</Label><Coins amount={save.coins} /></View>
   </View>
   <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 22, gap: 14, paddingBottom: 26 }}>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Icon name="award" size={20} /><Label accessibilityRole="header" style={{ fontFamily: 'Fredoka_500Medium', fontSize: 22 }}>Studio milestones</Label></View>
    <Label style={{ fontSize: 13, color: C.muted, marginTop: -7 }}>Small wins along the way. Collect a bonus coin jar once per milestone.</Label>
    {MILESTONES.map(m => {
     const claimed = (save.milestones ?? []).includes(m.id);
     const ready = !claimed && m.check(save);
     return <View key={m.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 23, padding: 16, gap: 11, borderWidth: 1, borderColor: ready ? '#D8BE82' : '#E6EBDD' }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
       <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: claimed ? '#E6EEDC' : ready ? '#F7EDCE' : '#F1F4EC', alignItems: 'center', justifyContent: 'center' }}><Icon name={claimed ? 'check' : 'award'} size={22} color={claimed ? C.green : ready ? C.gold : C.muted} /></View>
       <View style={{ flex: 1, gap: 2 }}><Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 15 }}>{m.name}</Label><Label style={{ fontSize: 12, color: C.muted }}>{m.detail}</Label></View>
       {claimed ? <View style={{ backgroundColor: '#E6EEDC', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 }}><Label style={{ fontSize: 10, color: C.green, fontFamily: 'Nunito_800ExtraBold' }}>Claimed</Label></View> : <Coins amount={m.reward} small />}
      </View>
      {ready && <Button icon="coin" disabled={busy} onPress={() => onMilestone(m.id)}>Claim {m.reward} coins</Button>}
     </View>;
    })}
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 }}><Icon name="keyboard" size={20} /><Label accessibilityRole="header" style={{ fontFamily: 'Fredoka_500Medium', fontSize: 22 }}>Desk essentials</Label></View><Label style={{ fontSize: 13, color: C.muted, marginTop: -7 }}>A happier setup. A little more from every project.</Label>
    {ITEMS.filter(i => i.slot === 'equipment').map(item => <ShopItem key={item.id} item={item} save={save} busy={busy} onPress={() => onItem(item.id)} />)}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 }}><Icon name="keyboard" size={14} color={C.green} /><Label style={{ fontSize: 12, color: C.muted }}>{multiplier(save).toFixed(2)}× earnings · Upgrades apply to your next project</Label></View>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 }}><Icon name="palette" size={20} /><Label accessibilityRole="header" style={{ fontFamily: 'Fredoka_500Medium', fontSize: 22 }}>Room decor</Label></View>
    <Label style={{ fontSize: 13, color: C.muted, marginTop: -7 }}>Pick a mood. Make yourself at home.</Label>
    <View style={{ flexDirection: 'row', gap: 8 }}>{ATMOSPHERES.map(a => { const selected = (save.atmosphere ?? 'sunny') === a.id; return <Pressable key={a.id} accessibilityRole="radio" accessibilityLabel={a.name} accessibilityState={{ checked: selected, disabled: busy }} disabled={busy} onPress={() => onAtmosphere(a.id)} style={({ pressed }) => ({ flex: 1, borderRadius: 19, padding: 13, gap: 10, alignItems: 'center', borderWidth: 1.5, borderColor: selected ? '#6E9078' : '#E1E7DA', backgroundColor: selected ? '#E5EEDC' : '#FFFFFF', opacity: pressed ? .7 : 1 })}><Icon name={a.icon as IconName} size={24} color={selected ? C.green : C.muted} /><Label style={{ fontSize: 12, textAlign: 'center', fontFamily: 'Nunito_800ExtraBold' }}>{a.name}</Label><Label style={{ fontSize: 10, color: C.muted }}>{selected ? 'Your mood' : 'Free'}</Label></Pressable>; })}</View>
    <View style={{ backgroundColor: '#F8EADC', borderRadius: 23, padding: 18, gap: 13, borderWidth: 1, borderColor: '#EED9C5' }}>
     <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><View style={{ width: 48, height: 48, borderRadius: 17, backgroundColor: '#F1D6BA', alignItems: 'center', justifyContent: 'center' }}><Icon name="cat" size={27} /></View><View style={{ flex: 1, gap: 4 }}><Label style={{ fontFamily: 'Nunito_800ExtraBold' }}>{DESK_CAT.name}</Label><Label style={{ fontSize: 12, color: C.muted }}>{DESK_CAT.description}</Label></View></View>
     {save.catOwned ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Icon name="heart" size={15} color={C.green} /><Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 12, color: C.green }}>Part of the family</Label></View> : <><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Coins amount={DESK_CAT.price} small /><Label style={{ fontSize: 11, color: C.muted }}>{save.coins < DESK_CAT.price ? `${DESK_CAT.price - save.coins} coins to go` : 'One little friend. Forever.'}</Label></View><Button disabled={busy || save.coins < DESK_CAT.price} onPress={onAdopt} icon="cat">Adopt desk cat</Button></>}
    </View>
    {ITEMS.filter(i => i.slot !== 'equipment').map(item => <ShopItem key={item.id} item={item} save={save} busy={busy} onPress={() => onItem(item.id)} />)}
   </ScrollView>
  </Animated.View>
  <Toast notice={notice} onDismiss={onDismiss} />
 </View></Modal>;
}
function ShopItem({ item, save, busy, onPress }: { item: typeof ITEMS[number]; save: Save; busy: boolean; onPress: () => void }) {
 const owned = save.owned.includes(item.id); const placed = save.decorated.includes(item.id); const equipment = item.slot === 'equipment'; const afford = save.coins >= item.price;
 return <View style={{ backgroundColor: '#FFFFFF', borderRadius: 23, padding: 16, gap: 13, borderWidth: 1, borderColor: '#E6EBDD' }}>
  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: equipment ? '#EAF0DE' : '#F7E5D4', borderRadius: 17 }}><Icon name={item.id as IconName} size={25} /></View><View style={{ flex: 1, gap: 4 }}><Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}>{item.name}</Label><Label style={{ fontSize: 12, color: C.muted }}>{item.description}</Label></View></View>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>{owned ? <OwnedBadge kind={equipment ? 'equipped' : placed ? 'placed' : 'owned'} /> : <Coins amount={item.price} small />}{!owned && !afford && <Label style={{ fontSize: 11, color: C.muted }}>{item.price - save.coins} coins to go</Label>}{owned && equipment && <Label style={{ fontSize: 12, color: C.green }}>Always active</Label>}</View>
  {!(owned && equipment) && <Button secondary={owned || !afford} disabled={busy || (!owned && !afford)} onPress={onPress} icon={owned ? placed ? 'package' : 'flower' : 'shop'}>{owned ? placed ? 'Put away' : 'Place in room' : `Buy ${item.name.toLowerCase()}`}</Button>}
 </View>;
}
