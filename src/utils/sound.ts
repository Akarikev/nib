import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { HomeId, ResolvedAtmosphere } from '../game/game';

const LOFI_SRC = require('../../assets/sounds/lofi-loop.wav');
const RAIN_SRC = require('../../assets/sounds/rain-loop.wav');
const BIRDS_SRC = require('../../assets/sounds/birds-loop.wav');
const CITY_SRC = require('../../assets/sounds/city-loop.wav');
const KEY_SRC = require('../../assets/sounds/key-click.wav');
const COIN_SRC = require('../../assets/sounds/coin-chime.wav');
const BUG_SRC = require('../../assets/sounds/bug-fix.wav');
const PURR_SRC = require('../../assets/sounds/cat-purr.wav');
const TAP_SRC = require('../../assets/sounds/ui-tap.wav');
const MAIL_SRC = require('../../assets/sounds/mail-ding.wav');
const BUY_SRC = require('../../assets/sounds/buy-chime.wav');
const VICTORY_SRC = require('../../assets/sounds/victory-fanfare.wav');
const RING_SRC = require('../../assets/sounds/phone-ring.wav');
const HORN_SRC = require('../../assets/sounds/horn-beep.wav');

let globalTapFn: (() => void) | null = null;
export function playGlobalTap() {
 globalTapFn?.();
}

export type StudioAudio = {
 playKey: () => void;
 playCoin: () => void;
 playBugFix: () => void;
 playPurr: () => void;
 playTap: () => void;
 playMail: () => void;
 playBuy: () => void;
 playVictory: () => void;
 playRing: () => void;
 playHorn: () => void;
 hapticLight: () => void;
 hapticMedium: () => void;
 hapticSuccess: () => void;
};

export function useStudioAudio({
 soundEnabled,
 hapticsEnabled,
 atmosphere,
 activeHome = 'bedroom',
 working = false,
 hasClickyKeyboard = false,
}: {
 soundEnabled: boolean;
 hapticsEnabled: boolean;
 atmosphere: ResolvedAtmosphere;
 activeHome?: HomeId;
 working?: boolean;
 hasClickyKeyboard?: boolean;
}): StudioAudio {
 const lofi = useAudioPlayer(LOFI_SRC);
 const rain = useAudioPlayer(RAIN_SRC);
 const birds = useAudioPlayer(BIRDS_SRC);
 const city = useAudioPlayer(CITY_SRC);
 const keySfx = useAudioPlayer(KEY_SRC);
 const coinSfx = useAudioPlayer(COIN_SRC);
 const bugSfx = useAudioPlayer(BUG_SRC);
 const purrSfx = useAudioPlayer(PURR_SRC);
 const tapSfx = useAudioPlayer(TAP_SRC);
 const mailSfx = useAudioPlayer(MAIL_SRC);
 const buySfx = useAudioPlayer(BUY_SRC);
 const victorySfx = useAudioPlayer(VICTORY_SRC);
 const ringSfx = useAudioPlayer(RING_SRC);
 const hornSfx = useAudioPlayer(HORN_SRC);

 const soundRef = useRef(soundEnabled);
 const hapticsRef = useRef(hapticsEnabled);
 const activeAppRef = useRef(AppState.currentState === 'active');

 soundRef.current = soundEnabled;
 hapticsRef.current = hapticsEnabled;

 useEffect(() => {
  if (Platform.OS === 'web') return;
  setAudioModeAsync({
   playsInSilentMode: false,
   shouldPlayInBackground: false,
   interruptionMode: 'mixWithOthers',
  }).catch(() => {});
 }, []);

 useEffect(() => {
  const isCityHome = activeHome === 'loft' || activeHome === 'sf' || activeHome === 'tokyo';
  const syncAmbience = () => {
   try {
    lofi.loop = true;
    lofi.volume = 0.2;
    rain.loop = true;
    rain.volume = 0.11;
    city.loop = true;
    city.volume = 0.12;

    if (soundEnabled && activeAppRef.current) {
     lofi.play();
     if (atmosphere === 'rainy') rain.play();
     else rain.pause();
     if (isCityHome) city.play();
     else city.pause();
    } else {
     lofi.pause();
     rain.pause();
     city.pause();
    }
   } catch {}
  };

  syncAmbience();
  const sub = AppState.addEventListener('change', state => {
   activeAppRef.current = state === 'active';
   syncAmbience();
  });
  return () => {
   sub.remove();
   try {
    lofi.pause();
    rain.pause();
    city.pause();
   } catch {}
  };
 }, [lofi, rain, city, soundEnabled, atmosphere, activeHome]);

 // Occasional natural morning birds in Sunny mood (NOT a constant loop!)
 useEffect(() => {
  if (!soundEnabled || atmosphere !== 'sunny') {
   try { birds.pause(); } catch {}
   return;
  }
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const scheduleChirp = () => {
   const delay = 14_000 + Math.floor(Math.random() * 14_000);
   timer = setTimeout(async () => {
    if (cancelled) return;
    if (soundRef.current && activeAppRef.current) {
     try {
      birds.loop = false;
      birds.volume = 0.09;
      await birds.seekTo(0);
      birds.play();
     } catch {}
    }
    if (!cancelled) scheduleChirp();
   }, delay);
  };
  scheduleChirp();
  return () => {
   cancelled = true;
   if (timer) clearTimeout(timer);
   try { birds.pause(); } catch {}
  };
 }, [birds, soundEnabled, atmosphere]);

 // Subtle, natural mechanical Clicky Keyboard typing bursts while working
 useEffect(() => {
  if (!soundEnabled || !working || !hasClickyKeyboard) return;
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const clickOnce = async (vol: number) => {
   if (cancelled || !soundRef.current || !activeAppRef.current) return;
   try {
    keySfx.volume = vol;
    await keySfx.seekTo(0);
    keySfx.play();
   } catch {}
  };
  const scheduleBurst = () => {
   const pause = 2200 + Math.floor(Math.random() * 2400);
   timers.push(
    setTimeout(() => {
     if (cancelled) return;
     const keys = 2 + Math.floor(Math.random() * 3); // 2..4 crisp taps
     let offset = 0;
     for (let k = 0; k < keys; k++) {
      const vol = 0.22 + Math.random() * 0.1;
      timers.push(setTimeout(() => void clickOnce(vol), offset));
      offset += 85 + Math.floor(Math.random() * 130);
     }
     timers.push(setTimeout(() => { if (!cancelled) scheduleBurst(); }, offset + 200));
    }, pause)
   );
  };
  scheduleBurst();
  return () => {
   cancelled = true;
   for (const t of timers) clearTimeout(t);
  };
 }, [keySfx, soundEnabled, working, hasClickyKeyboard]);

 const triggerSfx = useCallback((player: ReturnType<typeof useAudioPlayer>, volume = 0.72) => {
  if (!soundRef.current) return;
  (async () => {
   try {
    player.volume = volume;
    await player.seekTo(0);
    player.play();
   } catch {
    try {
     player.play();
    } catch {}
   }
  })();
 }, []);

 const hapticLight = useCallback(() => {
  if (!hapticsRef.current || Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
 }, []);

 const hapticMedium = useCallback(() => {
  if (!hapticsRef.current || Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
 }, []);

 const hapticSuccess = useCallback(() => {
  if (!hapticsRef.current || Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
 }, []);

 const playKey = useCallback(() => {
  triggerSfx(keySfx, 0.7);
  hapticLight();
 }, [keySfx, triggerSfx, hapticLight]);

 const playCoin = useCallback(() => {
  triggerSfx(coinSfx, 0.85);
  hapticSuccess();
 }, [coinSfx, triggerSfx, hapticSuccess]);

 const playBugFix = useCallback(() => {
  triggerSfx(bugSfx, 0.8);
  hapticMedium();
 }, [bugSfx, triggerSfx, hapticMedium]);

 const playPurr = useCallback(() => {
  triggerSfx(purrSfx, 0.85);
  hapticLight();
 }, [purrSfx, triggerSfx, hapticLight]);

 const playTap = useCallback(() => {
  triggerSfx(tapSfx, 0.68);
  hapticLight();
 }, [tapSfx, triggerSfx, hapticLight]);

 const playMail = useCallback(() => {
  triggerSfx(mailSfx, 0.78);
  hapticLight();
 }, [mailSfx, triggerSfx, hapticLight]);

 const playBuy = useCallback(() => {
  triggerSfx(buySfx, 0.82);
  hapticMedium();
 }, [buySfx, triggerSfx, hapticMedium]);

 const playVictory = useCallback(() => {
  triggerSfx(victorySfx, 0.88);
  hapticSuccess();
 }, [victorySfx, triggerSfx, hapticSuccess]);

 const playRing = useCallback(() => {
  triggerSfx(ringSfx, 0.8);
  hapticMedium();
 }, [ringSfx, triggerSfx, hapticMedium]);

 const playHorn = useCallback(() => {
  triggerSfx(hornSfx, 0.72);
  hapticMedium();
 }, [hornSfx, triggerSfx, hapticMedium]);

 useEffect(() => {
  globalTapFn = playTap;
  return () => {
   if (globalTapFn === playTap) globalTapFn = null;
  };
 }, [playTap]);

 return {
  playKey,
  playCoin,
  playBugFix,
  playPurr,
  playTap,
  playMail,
  playBuy,
  playVictory,
  playRing,
  playHorn,
  hapticLight,
  hapticMedium,
  hapticSuccess,
 };
}
