import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
 ATMOSPHERES,
 Atmosphere,
 COFFEE_REFILL_PRICE,
 DESK_CAT,
 ENERGY_CAP,
 ENERGY_MAX_STOCK,
 HomeId,
 HOMES,
 ITEMS,
 MILESTONES,
 MilestoneId,
 multiplier,
 netWorth,
 passiveRatePerHour,
 pendingPassiveCoins,
 RideId,
 RIDES,
 Save,
 VentureId,
 VENTURES,
} from '../game/game';
import { Button, C, Coins, Icon, IconName, Label, OwnedBadge } from './ui';
import { Notice, Toast } from './toast';

type ShopTab = 'homes' | 'rides' | 'income' | 'studio' | 'milestones';

export function Shop({
 open,
 onClose,
 save,
 busy,
 energyCount,
 onItem,
 onAtmosphere,
 onAdopt,
 onMilestone,
 onHome,
 onRide,
 onBuyCoffee,
 onVenture,
 onCollectPassive,
 notice,
 onDismiss,
}: {
 open: boolean;
 onClose: () => void;
 save: Save;
 busy: boolean;
 energyCount: number;
 onItem: (id: string) => void;
 onAtmosphere: (id: Atmosphere) => void;
 onAdopt: () => void;
 onMilestone: (id: MilestoneId) => void;
 onHome: (id: HomeId) => void;
 onRide: (id: RideId) => void;
 onBuyCoffee: () => void;
 onVenture: (id: VentureId) => void;
 onCollectPassive: () => void;
 notice: Notice;
 onDismiss: () => void;
}) {
 const insets = useSafeAreaInsets();
 const { height } = useWindowDimensions();
 const reduced = useReducedMotion();
 const [present, setPresent] = useState(open);
 const [tab, setTab] = useState<ShopTab>('homes');
 const y = useSharedValue(1);

 const readyMilestones = MILESTONES.filter(m => !(save.milestones ?? []).includes(m.id) && m.check(save)).length;

 useEffect(() => {
  if (open) {
   setPresent(true);
   if (readyMilestones > 0) setTab('milestones');
   y.set(reduced ? withTiming(0, { duration: 160 }) : withSpring(0, { duration: 300, dampingRatio: 1 }));
  } else {
   y.set(
    withTiming(1, { duration: reduced ? 140 : 220, easing: Easing.bezier(0.32, 0.72, 0, 1) }, finished => {
     if (finished) scheduleOnRN(setPresent, false);
    })
   );
  }
 }, [open, reduced, y]);

 const sheetStyle = useAnimatedStyle(() => ({
  opacity: reduced ? 1 - y.get() : 1,
  transform: [{ translateY: reduced ? 0 : y.get() * height }],
 }));
 const backdropStyle = useAnimatedStyle(() => ({ opacity: 1 - y.get() }));

 const ownedHomes: HomeId[] = save.homes?.length ? save.homes : ['bedroom'];
 const currentHome: HomeId = save.activeHome ?? 'bedroom';
 const ownedRides: RideId[] = save.rides ?? [];
 const currentRide: RideId | undefined = save.activeRide;

 return (
  <Modal visible={present} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
   <View style={{ flex: 1, justifyContent: 'flex-end' }}>
    <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: '#223F3850' }, backdropStyle]}>
     <Pressable accessibilityRole="button" accessibilityLabel="Close upgrades" onPress={onClose} style={{ flex: 1 }} />
    </Animated.View>
    <Animated.View
     accessibilityViewIsModal
     style={[
      {
       width: '100%',
       maxWidth: 560,
       alignSelf: 'center',
       maxHeight: height - insets.top - 28,
       backgroundColor: C.bg,
       borderTopLeftRadius: 34,
       borderTopRightRadius: 34,
       overflow: 'hidden',
       paddingBottom: insets.bottom,
      },
      sheetStyle,
     ]}
    >
     {/* Header */}
     <View style={s.header}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
       <View style={{ gap: 2, flex: 1 }}>
        <Label accessibilityRole="header" style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 28 }}>
         Studio & lifestyle
        </Label>
        <Label style={{ fontSize: 12.5, color: C.muted }}>
         Move to new cities, collect dream rides &amp; upgrade your desk.
        </Label>
       </View>
       <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close upgrades"
        onPress={onClose}
        style={s.closeBtn}
       >
        <Icon name="close" size={20} />
       </Pressable>
      </View>

      {/* Balance + Net Worth */}
      <View style={s.balanceBar}>
       <View style={{ gap: 1 }}>
        <Label style={{ fontSize: 11, color: C.gold, fontFamily: 'Nunito_800ExtraBold' }}>COIN JAR</Label>
        <Coins amount={save.coins} />
       </View>
       <View style={{ alignItems: 'flex-end', gap: 1 }}>
        <Label style={{ fontSize: 11, color: C.muted, fontFamily: 'Nunito_800ExtraBold' }}>NET WORTH</Label>
        <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 17, color: C.ink }}>
         {netWorth(save).toLocaleString()} · {multiplier(save).toFixed(2)}×
        </Label>
       </View>
      </View>

      {/* 5-Tab Pill Switcher */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
       {(
        [
         ['homes', 'Homes', 'pin'],
         ['rides', 'Rides', 'car'],
         ['income', 'Income', 'trending'],
         ['studio', 'Studio', 'keyboard'],
         ['milestones', 'Goals', 'award'],
        ] as const
       ).map(([id, label, icon]) => {
        const active = tab === id;
        const passiveReady = id === 'income' ? pendingPassiveCoins(save, Date.now()) : 0;
        return (
         <Pressable
          key={id}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          onPress={() => setTab(id)}
          style={[s.tabPill, { flex: undefined, paddingHorizontal: 12 }, active && s.tabPillActive]}
         >
          <Icon name={icon} size={15} color={active ? C.green : C.muted} />
          <Label style={[s.tabPillText, active && { color: C.green }]}>{label}</Label>
          {id === 'milestones' && readyMilestones > 0 && (
           <View style={s.tabCountBadge}>
            <Label style={s.tabCountText}>{readyMilestones}</Label>
           </View>
          )}
          {id === 'income' && passiveReady > 0 && (
           <View style={[s.tabCountBadge, { backgroundColor: C.green }]}>
            <Label style={s.tabCountText}>+</Label>
           </View>
          )}
         </Pressable>
        );
       })}
      </ScrollView>
     </View>

     <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 28 }}>
      {tab === 'homes' && (
       <>
        <Label style={{ fontSize: 13, color: C.muted, marginTop: -4 }}>
         Buy a new home to move cities — your studio window, walls, and terminal host transform live!
        </Label>
        {HOMES.map(home => {
         const owned = ownedHomes.includes(home.id);
         const active = currentHome === home.id;
         const afford = save.coins >= home.price;
         return (
          <View
           key={home.id}
           style={[s.card, active && { borderColor: '#6E9078', backgroundColor: '#F3F8EE' }]}
          >
           <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={[s.iconBox, { backgroundColor: active ? '#DCEAD0' : '#EAF0DE' }]}>
             <Icon
              name={home.id === 'cabin' ? 'mountain' : home.id === 'bedroom' ? 'house' : 'pin'}
              size={24}
              color={C.green}
             />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}>{home.name}</Label>
              <View style={s.cityChip}>
               <Label style={s.cityChipText}>{home.city}</Label>
              </View>
             </View>
             <Label style={{ fontSize: 12, color: C.muted }}>{home.description}</Label>
            </View>
           </View>

           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {owned ? (
             <OwnedBadge kind={active ? 'placed' : 'owned'} />
            ) : (
             <Coins amount={home.price} small />
            )}
            <Label style={{ fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: C.green }}>
             {home.bonus > 0 ? `+${Math.round(home.bonus * 100)}% earnings` : 'Home base'}
            </Label>
           </View>

           {!active && (
            <Button
             secondary={owned || !afford}
             disabled={busy || (!owned && !afford)}
             onPress={() => onHome(home.id)}
             icon={owned ? 'house' : 'key'}
            >
             {owned
              ? `Move to ${home.city}`
              : afford
              ? `Buy & move to ${home.city}`
              : `${(home.price - save.coins).toLocaleString()} coins to go`}
            </Button>
           )}
          </View>
         );
        })}
       </>
      )}

      {tab === 'rides' && (
       <>
        <Label style={{ fontSize: 13, color: C.muted, marginTop: -4 }}>
         Build your dream garage! Every ride permanently boosts your coding earnings and shows up in your studio &amp; terminal.
        </Label>
        {RIDES.map(ride => {
         const owned = ownedRides.includes(ride.id);
         const active = currentRide === ride.id;
         const afford = save.coins >= ride.price;
         return (
          <View
           key={ride.id}
           style={[s.card, active && { borderColor: '#6E9078', backgroundColor: '#F3F8EE' }]}
          >
           <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={[s.iconBox, { backgroundColor: active ? '#DCEAD0' : '#F7E5D4' }]}>
             <Icon
              name={ride.id === 'bike' || ride.id === 'vespa' ? 'bike' : 'car'}
              size={24}
              color={active ? C.green : C.ink}
             />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
             <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}>{ride.name}</Label>
             <Label style={{ fontSize: 12, color: C.muted }}>{ride.description}</Label>
            </View>
           </View>

           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {owned ? (
             <OwnedBadge kind={active ? 'equipped' : 'owned'} />
            ) : (
             <Coins amount={ride.price} small />
            )}
            <Label style={{ fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: C.green }}>
             +{Math.round(ride.bonus * 100)}% earnings
            </Label>
           </View>

           {!active && (
            <Button
             secondary={owned || !afford}
             disabled={busy || (!owned && !afford)}
             onPress={() => onRide(ride.id)}
             icon={owned ? 'car' : 'key'}
            >
             {owned
              ? 'Take out for a spin'
              : afford
              ? `Buy ${ride.name.toLowerCase()}`
              : `${(ride.price - save.coins).toLocaleString()} coins to go`}
            </Button>
           )}
          </View>
         );
        })}
       </>
      )}

      {tab === 'income' && (
       <>
        <Label style={s.sectionIntro}>
         Invest coins into cozy indie side projects that quietly earn offline coins while you code or rest (up to 24h banked).
        </Label>
        {(() => {
         const rate = passiveRatePerHour(save);
         const pending = pendingPassiveCoins(save, Date.now());
         return (
          <View style={[s.card, { backgroundColor: '#F2F7EB', borderColor: '#DCE6D1' }]}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 2 }}>
             <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}>Side-project coin jar</Label>
             <Label style={{ fontSize: 12, color: C.muted }}>
              {rate > 0 ? `Earning +${rate.toLocaleString()} coins/hr offline` : 'Launch a side project below to start earning'}
             </Label>
            </View>
            <Coins amount={pending} small />
           </View>
           <Button
            icon="coin"
            secondary={pending <= 0}
            disabled={busy || pending <= 0}
            onPress={onCollectPassive}
           >
            {pending > 0 ? `Collect ${pending.toLocaleString()} coins` : 'Accumulating offline...'}
           </Button>
          </View>
         );
        })()}
        {VENTURES.map(v => {
         const owned = (save.ventures ?? []).includes(v.id);
         const afford = save.coins >= v.price;
         return (
          <View key={v.id} style={[s.card, owned && s.cardActive]}>
           <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={[s.iconBox, { backgroundColor: owned ? '#DDEBD4' : '#F3EFE4' }]}>
             <Icon name="trending" size={22} color={owned ? C.green : C.gold} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
             <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}>{v.name}</Label>
             <Label style={{ fontSize: 12, color: C.muted }}>{v.description}</Label>
            </View>
           </View>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={s.bonusPill}>
             <Label style={s.bonusText}>+{v.coinsPerHour} coins / hr</Label>
            </View>
            {owned ? <OwnedBadge kind="equipped" /> : <Coins amount={v.price} small />}
           </View>
           {!owned && (
            <Button
             secondary={!afford}
             disabled={busy || !afford}
             onPress={() => onVenture(v.id)}
             icon="trending"
            >
             {afford ? `Launch ${v.name.toLowerCase()}` : `${(v.price - save.coins).toLocaleString()} coins to go`}
            </Button>
           )}
          </View>
         );
        })}
       </>
      )}

      {tab === 'studio' && (
       <>
        {/* Corner Cafe Instant Coffee Refill */}
        <View style={[s.card, { backgroundColor: '#F2F7EB', borderColor: '#DCE6D1' }]}>
         <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={[s.iconBox, { backgroundColor: '#E1ECD5' }]}>
           <Icon name="coffee" size={24} color={C.green} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
           <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}>Corner cafe espresso</Label>
           <Label style={{ fontSize: 12, color: C.muted }}>
            Buy an extra cup anytime ({energyCount} in stock · free refills up to {ENERGY_CAP}, max {ENERGY_MAX_STOCK}).
           </Label>
          </View>
          <Coins amount={COFFEE_REFILL_PRICE} small />
         </View>
         <Button
          secondary={energyCount >= ENERGY_MAX_STOCK || save.coins < COFFEE_REFILL_PRICE}
          disabled={busy || energyCount >= ENERGY_MAX_STOCK || save.coins < COFFEE_REFILL_PRICE}
          onPress={onBuyCoffee}
          icon="coffee"
         >
          {energyCount >= ENERGY_MAX_STOCK
           ? 'Coffee stash full (max 9)'
           : save.coins < COFFEE_REFILL_PRICE
           ? `${COFFEE_REFILL_PRICE - save.coins} coins to go`
           : 'Buy +1 coffee boost'}
         </Button>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
         <Icon name="keyboard" size={20} />
         <Label accessibilityRole="header" style={{ fontFamily: 'Fredoka_500Medium', fontSize: 22 }}>
          Desk essentials
         </Label>
        </View>
        {ITEMS.filter(i => i.slot === 'equipment').map(item => (
         <ShopItem key={item.id} item={item} save={save} busy={busy} onPress={() => onItem(item.id)} />
        ))}

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 10 }}>
         <Icon name="palette" size={20} />
         <Label accessibilityRole="header" style={{ fontFamily: 'Fredoka_500Medium', fontSize: 22 }}>
          Room decor &amp; companion
         </Label>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
         {ATMOSPHERES.map(a => {
          const selected = (save.atmosphere ?? 'sunny') === a.id;
          return (
           <Pressable
            key={a.id}
            accessibilityRole="radio"
            accessibilityLabel={a.name}
            accessibilityState={{ checked: selected, disabled: busy }}
            disabled={busy}
            onPress={() => onAtmosphere(a.id)}
            style={({ pressed }) => ({
             flex: 1,
             borderRadius: 19,
             padding: 13,
             gap: 10,
             alignItems: 'center',
             borderWidth: 1.5,
             borderColor: selected ? '#6E9078' : '#E1E7DA',
             backgroundColor: selected ? '#E5EEDC' : '#FFFFFF',
             opacity: pressed ? 0.7 : 1,
            })}
           >
            <Icon name={a.icon as IconName} size={24} color={selected ? C.green : C.muted} />
            <Label style={{ fontSize: 12, textAlign: 'center', fontFamily: 'Nunito_800ExtraBold' }}>
             {a.name}
            </Label>
            <Label style={{ fontSize: 10, color: C.muted }}>{selected ? 'Your mood' : 'Free'}</Label>
           </Pressable>
          );
         })}
        </View>

        <View style={{ backgroundColor: '#F8EADC', borderRadius: 23, padding: 18, gap: 13, borderWidth: 1, borderColor: '#EED9C5' }}>
         <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, borderRadius: 17, backgroundColor: '#F1D6BA', alignItems: 'center', justifyContent: 'center' }}>
           <Icon name="cat" size={27} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
           <Label style={{ fontFamily: 'Nunito_800ExtraBold' }}>{DESK_CAT.name}</Label>
           <Label style={{ fontSize: 12, color: C.muted }}>{DESK_CAT.description}</Label>
          </View>
         </View>
         {save.catOwned ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
           <Icon name="heart" size={15} color={C.green} />
           <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 12, color: C.green }}>
            Part of the family · Tap cat in studio to pet!
           </Label>
          </View>
         ) : (
          <>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Coins amount={DESK_CAT.price} small />
            <Label style={{ fontSize: 11, color: C.muted }}>
             {save.coins < DESK_CAT.price ? `${DESK_CAT.price - save.coins} coins to go` : 'One little friend. Forever.'}
            </Label>
           </View>
           <Button disabled={busy || save.coins < DESK_CAT.price} onPress={onAdopt} icon="cat">
            Adopt desk cat
           </Button>
          </>
         )}
        </View>

        {ITEMS.filter(i => i.slot !== 'equipment').map(item => (
         <ShopItem key={item.id} item={item} save={save} busy={busy} onPress={() => onItem(item.id)} />
        ))}
       </>
      )}

      {tab === 'milestones' && (
       <>
        <Label style={{ fontSize: 13, color: C.muted, marginTop: -4 }}>
         Small wins along the way. Claim a bonus coin jar once per milestone!
        </Label>
        {MILESTONES.map(m => {
         const claimed = (save.milestones ?? []).includes(m.id);
         const ready = !claimed && m.check(save);
         return (
          <View
           key={m.id}
           style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 23,
            padding: 16,
            gap: 11,
            borderWidth: 1,
            borderColor: ready ? '#D8BE82' : '#E6EBDD',
           }}
          >
           <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View
             style={{
              width: 44,
              height: 44,
              borderRadius: 15,
              backgroundColor: claimed ? '#E6EEDC' : ready ? '#F7EDCE' : '#F1F4EC',
              alignItems: 'center',
              justifyContent: 'center',
             }}
            >
             <Icon name={claimed ? 'check' : 'award'} size={22} color={claimed ? C.green : ready ? C.gold : C.muted} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
             <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 15 }}>{m.name}</Label>
             <Label style={{ fontSize: 12, color: C.muted }}>{m.detail}</Label>
            </View>
            {claimed ? (
             <View style={{ backgroundColor: '#E6EEDC', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 }}>
              <Label style={{ fontSize: 10, color: C.green, fontFamily: 'Nunito_800ExtraBold' }}>Claimed</Label>
             </View>
            ) : (
             <Coins amount={m.reward} small />
            )}
           </View>
           {ready && (
            <Button icon="coin" disabled={busy} onPress={() => onMilestone(m.id)}>
             Claim {m.reward} coins
            </Button>
           )}
          </View>
         );
        })}
       </>
      )}
     </ScrollView>
    </Animated.View>
    <Toast notice={notice} onDismiss={onDismiss} />
   </View>
  </Modal>
 );
}

function ShopItem({ item, save, busy, onPress }: { item: typeof ITEMS[number]; save: Save; busy: boolean; onPress: () => void }) {
 const owned = save.owned.includes(item.id);
 const placed = save.decorated.includes(item.id);
 const equipment = item.slot === 'equipment';
 const afford = save.coins >= item.price;
 return (
  <View style={s.card}>
   <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
    <View style={[s.iconBox, { backgroundColor: equipment ? '#EAF0DE' : '#F7E5D4' }]}>
     <Icon name={item.id as IconName} size={25} />
    </View>
    <View style={{ flex: 1, gap: 4 }}>
     <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}>{item.name}</Label>
     <Label style={{ fontSize: 12, color: C.muted }}>{item.description}</Label>
    </View>
   </View>
   <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    {owned ? <OwnedBadge kind={equipment ? 'equipped' : placed ? 'placed' : 'owned'} /> : <Coins amount={item.price} small />}
    {!owned && !afford && <Label style={{ fontSize: 11, color: C.muted }}>{item.price - save.coins} coins to go</Label>}
    {owned && equipment && <Label style={{ fontSize: 12, color: C.green }}>Always active</Label>}
   </View>
   {!(owned && equipment) && (
    <Button
     secondary={owned || !afford}
     disabled={busy || (!owned && !afford)}
     onPress={onPress}
     icon={owned ? (placed ? 'package' : 'flower') : 'shop'}
    >
     {owned ? (placed ? 'Put away' : 'Place in room') : `Buy ${item.name.toLowerCase()}`}
    </Button>
   )}
  </View>
 );
}

const s = StyleSheet.create({
 header: {
  paddingHorizontal: 22,
  paddingTop: 18,
  paddingBottom: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#E4EADB',
  gap: 12,
 },
 closeBtn: {
  width: 42,
  height: 42,
  borderRadius: 15,
  backgroundColor: '#E9EFDF',
  alignItems: 'center',
  justifyContent: 'center',
 },
 balanceBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#F7EDCE',
  paddingHorizontal: 15,
  paddingVertical: 11,
  borderRadius: 17,
 },
 tabRow: {
  flexDirection: 'row',
  backgroundColor: '#EEF3E7',
  borderRadius: 16,
  padding: 4,
  gap: 4,
 },
 tabPill: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
  paddingVertical: 8,
  borderRadius: 12,
 },
 tabPillActive: {
  backgroundColor: '#FFFFFF',
 },
 tabPillText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 12,
  color: C.muted,
 },
 tabCountBadge: {
  backgroundColor: C.gold,
  minWidth: 17,
  height: 17,
  borderRadius: 9,
  paddingHorizontal: 4,
  alignItems: 'center',
  justifyContent: 'center',
 },
 tabCountText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  color: '#FFFDF4',
 },
 card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 23,
  padding: 16,
  gap: 12,
  borderWidth: 1,
  borderColor: '#E6EBDD',
 },
 iconBox: {
  width: 48,
  height: 48,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 17,
 },
 cityChip: {
  backgroundColor: '#EEF3E7',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 8,
 },
 cityChipText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10.5,
  color: C.green,
 },
 sectionIntro: {
  fontSize: 12.5,
  color: C.muted,
  lineHeight: 18,
 },
 cardActive: {
  borderColor: '#BFD3B9',
  backgroundColor: '#FAFDF6',
 },
 bonusPill: {
  backgroundColor: '#E8F2E2',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 10,
 },
 bonusText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 12,
  color: C.green,
 },
});
