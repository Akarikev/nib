import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MailMessage, Save } from '../game/game';
import { getMailTemplate, MailCategory } from '../game/mail';
import { Button, C, Icon, Label } from './ui';
import { Notice, Toast } from './toast';

const CATEGORY_COLORS: Record<MailCategory, { bg: string; fg: string }> = {
 Tech: { bg: '#E6EEDC', fg: '#426E5C' },
 GitHub: { bg: '#E4E9F4', fg: '#455A82' },
 Promo: { bg: '#F9E6D4', fg: '#A36235' },
 Cafe: { bg: '#F7EDCE', fg: '#9C7122' },
 Founder: { bg: '#EFE6F7', fg: '#6B4E8A' },
};

function formatTimeAgo(ms: number, now: number): string {
 const diff = Math.max(0, Math.floor((now - ms) / 1000));
 if (diff < 60) return 'just now';
 if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
 if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
 return `${Math.floor(diff / 86400)}d ago`;
}

export function MailModal({
 open,
 onClose,
 save,
 busy,
 now,
 onOpenMail,
 onReplyMail,
 onDeleteMail,
 onClearRead,
 onMarkAllRead,
 onCheckMail,
 notice,
 onDismiss,
}: {
 open: boolean;
 onClose: () => void;
 save: Save;
 busy: boolean;
 now: number;
 onOpenMail: (id: string) => void;
 onReplyMail: (id: string, optionIndex: number) => void;
 onDeleteMail: (id: string) => void;
 onClearRead: () => void;
 onMarkAllRead: () => void;
 onCheckMail: () => void;
 notice: Notice;
 onDismiss: () => void;
}) {
 const insets = useSafeAreaInsets();
 const { height } = useWindowDimensions();
 const reduced = useReducedMotion();
 const [present, setPresent] = useState(open);
 const [selectedId, setSelectedId] = useState<string | null>(null);
 const y = useSharedValue(1);

 useEffect(() => {
  if (open) {
   setPresent(true);
   y.set(reduced ? withTiming(0, { duration: 160 }) : withSpring(0, { duration: 300, dampingRatio: 1 }));
  } else {
   setSelectedId(null);
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

 const inbox = save.inbox ?? [];
 const unreadCount = inbox.filter(m => !m.read).length;
 const readCount = inbox.filter(m => m.read).length;
 const selectedMsg: MailMessage | undefined = selectedId ? inbox.find(m => m.id === selectedId) : undefined;
 const selectedTpl = selectedMsg ? getMailTemplate(selectedMsg.templateId) : undefined;

 return (
  <Modal visible={present} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
   <View style={{ flex: 1, justifyContent: 'flex-end' }}>
    <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: '#223F3850' }, backdropStyle]}>
     <Pressable accessibilityRole="button" accessibilityLabel="Close Nib Mail" onPress={onClose} style={{ flex: 1 }} />
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
       {selectedMsg && selectedTpl ? (
        <Pressable
         accessibilityRole="button"
         accessibilityLabel="Back to inbox"
         onPress={() => setSelectedId(null)}
         style={s.backPill}
        >
         <Icon name="back" size={17} color={C.ink} />
         <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 13 }}>Inbox</Label>
        </Pressable>
       ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
         <View style={s.mailBrandIcon}>
          <Icon name="mail" size={22} color={C.green} />
         </View>
         <View style={{ flex: 1 }}>
          <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 26 }}>Nib Mail</Label>
          <Label style={{ fontSize: 12, color: C.muted }}>
           {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up · Inbox calm'}
          </Label>
         </View>
        </View>
       )}

       <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close mail"
        onPress={onClose}
        style={s.closeBtn}
       >
        <Icon name="close" size={20} />
       </Pressable>
      </View>

      {/* Inbox Action Chips */}
      {!selectedMsg && (
       <View style={s.actionRow}>
        <Pressable
         accessibilityRole="button"
         disabled={busy}
         onPress={onCheckMail}
         style={({ pressed }) => [s.actionChip, { backgroundColor: '#E5EEDC' }, pressed && { opacity: 0.7 }]}
        >
         <Icon name="refresh" size={13} color={C.green} />
         <Label style={[s.actionChipText, { color: C.green }]}>Check mail</Label>
        </Pressable>
        {unreadCount > 0 && (
         <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onMarkAllRead}
          style={({ pressed }) => [s.actionChip, pressed && { opacity: 0.7 }]}
         >
          <Icon name="mailOpen" size={13} color={C.ink} />
          <Label style={s.actionChipText}>Mark all read</Label>
         </Pressable>
        )}
        {readCount > 0 && (
         <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onClearRead}
          style={({ pressed }) => [s.actionChip, pressed && { opacity: 0.7 }]}
         >
          <Icon name="close" size={13} color={C.muted} />
          <Label style={s.actionChipText}>Clear read</Label>
         </Pressable>
        )}
       </View>
      )}
     </View>

     <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 30 }}>
      {selectedMsg && selectedTpl ? (
       /* Reader View */
       <View style={s.letterCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
         <View style={[s.avatar, { backgroundColor: selectedTpl.avatarBg }]}>
          <Label style={s.avatarText}>{selectedTpl.senderInitials}</Label>
         </View>
         <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
           <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 15 }}>{selectedTpl.sender}</Label>
           <View style={[s.catPill, { backgroundColor: CATEGORY_COLORS[selectedTpl.category].bg }]}>
            <Label style={[s.catText, { color: CATEGORY_COLORS[selectedTpl.category].fg }]}>
             {selectedTpl.category}
            </Label>
           </View>
          </View>
          <Label style={{ fontSize: 11.5, color: C.muted }}>
           to {save.playerName?.trim() || 'you'}@nib.studio · {formatTimeAgo(selectedMsg.receivedAt, now)}
          </Label>
         </View>
        </View>

        <Label style={s.letterSubject}>{selectedTpl.subject}</Label>
        <View style={s.letterDivider} />
        <Label style={s.letterBody}>{selectedTpl.body}</Label>

        {/* Quick Reply Section */}
        <View style={s.replyBox}>
         {selectedMsg.replied ? (
          <View style={s.repliedBanner}>
           <Icon name="check" size={16} color={C.green} />
           <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: C.green }}>
            Reply sent! Reward collected.
           </Label>
          </View>
         ) : (
          <>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="reply" size={15} color={C.muted} />
            <Label style={{ fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: C.muted }}>
             QUICK REPLY
            </Label>
           </View>
           {selectedTpl.replies.map((opt, idx) => (
            <Button
             key={idx}
             secondary={idx > 0}
             icon="send"
             disabled={busy}
             onPress={() => onReplyMail(selectedMsg.id, idx)}
            >
             {opt.label}
             {opt.rewardCoins ? ` (+${opt.rewardCoins} coins)` : opt.rewardEnergy ? ` (+${opt.rewardEnergy} coffee)` : ''}
            </Button>
           ))}
          </>
         )}

         <Pressable
          accessibilityRole="button"
          onPress={() => {
           const id = selectedMsg.id;
           setSelectedId(null);
           onDeleteMail(id);
          }}
          style={({ pressed }) => [s.deleteLink, pressed && { opacity: 0.6 }]}
         >
          <Label style={{ fontSize: 12.5, fontFamily: 'Nunito_800ExtraBold', color: '#B65147' }}>
           Delete email
          </Label>
         </Pressable>
        </View>
       </View>
      ) : inbox.length === 0 ? (
       /* Empty Inbox */
       <View style={s.emptyState}>
        <View style={[s.mailBrandIcon, { width: 62, height: 62, borderRadius: 22 }]}>
         <Icon name="mailOpen" size={30} color={C.green} />
        </View>
        <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 22 }}>Inbox Zero!</Label>
        <Label style={{ fontSize: 13.5, color: C.muted, textAlign: 'center', lineHeight: 20 }}>
         Every email cleared. Ship a project or tap “Check mail” above for fresh tech notes &amp; silly promos!
        </Label>
       </View>
      ) : (
       /* Inbox List */
       inbox.map(msg => {
        const tpl = getMailTemplate(msg.templateId);
        if (!tpl) return null;
        const cat = CATEGORY_COLORS[tpl.category];
        return (
         <Pressable
          key={msg.id}
          accessibilityRole="button"
          accessibilityLabel={`${msg.read ? 'Read' : 'Unread'} email from ${tpl.sender}: ${tpl.subject}`}
          onPress={() => {
           setSelectedId(msg.id);
           if (!msg.read) onOpenMail(msg.id);
          }}
          style={({ pressed }) => [
           s.mailRow,
           !msg.read && s.mailRowUnread,
           pressed && { opacity: 0.8 },
          ]}
         >
          <View style={[s.avatar, { backgroundColor: tpl.avatarBg }]}>
           <Label style={s.avatarText}>{tpl.senderInitials}</Label>
           {!msg.read && <View style={s.unreadDot} />}
          </View>
          <View style={{ flex: 1, gap: 3 }}>
           <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
             <Label
              numberOfLines={1}
              style={{
               fontFamily: msg.read ? 'Nunito_600SemiBold' : 'Nunito_800ExtraBold',
               fontSize: 13.5,
               color: C.ink,
               flexShrink: 1,
              }}
             >
              {tpl.sender}
             </Label>
             <View style={[s.catPill, { backgroundColor: cat.bg }]}>
              <Label style={[s.catText, { color: cat.fg }]}>{tpl.category}</Label>
             </View>
            </View>
            <Label style={{ fontSize: 10.5, color: C.muted }}>{formatTimeAgo(msg.receivedAt, now)}</Label>
           </View>
           <Label
            numberOfLines={1}
            style={{
             fontFamily: msg.read ? 'Nunito_600SemiBold' : 'Nunito_800ExtraBold',
             fontSize: 14.5,
             color: C.ink,
            }}
           >
            {tpl.subject}
           </Label>
           <Label numberOfLines={1} style={{ fontSize: 12, color: C.muted }}>
            {msg.replied ? '✓ Replied · ' : ''}
            {tpl.preview}
           </Label>
          </View>
         </Pressable>
        );
       })
      )}
     </ScrollView>
    </Animated.View>
    <Toast notice={notice} onDismiss={onDismiss} />
   </View>
  </Modal>
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
 mailBrandIcon: {
  width: 44,
  height: 44,
  borderRadius: 16,
  backgroundColor: '#E6EEDC',
  alignItems: 'center',
  justifyContent: 'center',
 },
 closeBtn: {
  width: 42,
  height: 42,
  borderRadius: 15,
  backgroundColor: '#E9EFDF',
  alignItems: 'center',
  justifyContent: 'center',
 },
 backPill: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: '#E9EFDF',
  paddingHorizontal: 13,
  paddingVertical: 9,
  borderRadius: 15,
 },
 actionRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
 },
 actionChip: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E1E7DA',
  paddingHorizontal: 11,
  paddingVertical: 7,
  borderRadius: 13,
 },
 actionChipText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 11.5,
  color: C.ink,
 },
 mailRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  backgroundColor: '#FFFFFF',
  borderRadius: 22,
  padding: 14,
  borderWidth: 1,
  borderColor: '#E8EDE0',
 },
 mailRowUnread: {
  backgroundColor: '#FDFBF2',
  borderColor: '#E4D5A9',
 },
 avatar: {
  width: 46,
  height: 46,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
 },
 avatarText: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 16,
  color: C.ink,
 },
 unreadDot: {
  position: 'absolute',
  top: -3,
  right: -3,
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: '#D9755A',
  borderWidth: 2,
  borderColor: '#FDFBF2',
 },
 catPill: {
  paddingHorizontal: 7,
  paddingVertical: 2,
  borderRadius: 8,
 },
 catText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 9.5,
 },
 letterCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 26,
  padding: 20,
  gap: 14,
  borderWidth: 1,
  borderColor: '#E6EBDD',
 },
 letterSubject: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 22,
  color: C.ink,
  lineHeight: 28,
 },
 letterDivider: {
  height: 1,
  backgroundColor: '#EDF2E7',
 },
 letterBody: {
  fontSize: 14.5,
  lineHeight: 22,
  color: C.ink,
 },
 replyBox: {
  marginTop: 6,
  paddingTop: 14,
  borderTopWidth: 1,
  borderTopColor: '#EDF2E7',
  gap: 10,
 },
 repliedBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  backgroundColor: '#E6EEDC',
  paddingVertical: 12,
  borderRadius: 16,
 },
 deleteLink: {
  alignSelf: 'center',
  paddingVertical: 6,
  paddingHorizontal: 14,
 },
 emptyState: {
  alignItems: 'center',
  paddingVertical: 42,
  paddingHorizontal: 20,
  gap: 12,
 },
});
