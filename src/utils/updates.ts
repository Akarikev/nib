import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { APP_VERSION, PLAY_STORE_URL, VERSION_URL } from '../config';

export type UpdateKind = 'none' | 'ota-ready' | 'store-available';

export type UpdateState = {
 kind: UpdateKind;
 checking: boolean;
 latestVersion: string;
 storeUrl: string;
 releaseNotes?: string;
 statusText: string;
 checkNow: (manual?: boolean) => Promise<void>;
 applyUpdate: () => Promise<void>;
 dismissBanner: () => void;
 bannerVisible: boolean;
};

function isNewerVersion(current: string, remote: string): boolean {
 const c = current.split('.').map(n => parseInt(n, 10) || 0);
 const r = remote.split('.').map(n => parseInt(n, 10) || 0);
 for (let i = 0; i < 3; i++) {
  if ((r[i] ?? 0) > (c[i] ?? 0)) return true;
  if ((r[i] ?? 0) < (c[i] ?? 0)) return false;
 }
 return false;
}

export function useAppUpdates(onNotify?: (msg: string) => void): UpdateState {
 const [kind, setKind] = useState<UpdateKind>('none');
 const [checking, setChecking] = useState(false);
 const [latestVersion, setLatestVersion] = useState(APP_VERSION);
 const [storeUrl, setStoreUrl] = useState(PLAY_STORE_URL);
 const [releaseNotes, setReleaseNotes] = useState<string | undefined>(undefined);
 const [statusText, setStatusText] = useState(`Version ${APP_VERSION} · Up to date`);
 const [dismissed, setDismissed] = useState(false);

 const checkNow = useCallback(
  async (manual = false) => {
   setChecking(true);
   let found: UpdateKind = 'none';
   try {
    // 1. Check EAS Update (OTA) on native builds when enabled
    if (Platform.OS !== 'web' && Updates.isEnabled) {
     try {
      const res = await Updates.checkForUpdateAsync();
      if (res.isAvailable) {
       await Updates.fetchUpdateAsync();
       found = 'ota-ready';
       setKind('ota-ready');
       setDismissed(false);
       setStatusText('New studio update downloaded · Ready to reload');
       if (manual && onNotify) onNotify('Update downloaded! Tap to reload your studio.');
      }
     } catch {
      // Ignore OTA check error in offline or dev mode
     }
    }

    // 2. Check remote version.json for full Play Store / Web release
    if (found === 'none') {
     try {
      const endpoint = Platform.OS === 'web' ? '/version.json' : VERSION_URL;
      const resp = await fetch(`${endpoint}?t=${Date.now()}`);
      if (resp.ok) {
       const data = await resp.json();
       if (data && typeof data.latestVersion === 'string') {
        setLatestVersion(data.latestVersion);
        if (typeof data.storeUrl === 'string') setStoreUrl(data.storeUrl);
        if (typeof data.releaseNotes === 'string') setReleaseNotes(data.releaseNotes);
        if (isNewerVersion(APP_VERSION, data.latestVersion)) {
         found = 'store-available';
         setKind('store-available');
         setDismissed(false);
         setStatusText(`New version ${data.latestVersion} available`);
         if (manual && onNotify) onNotify(`Version ${data.latestVersion} is ready to install!`);
        }
       }
      }
     } catch {
      // Offline-first: silently ignore network errors on background checks
     }
    }

    if (found === 'none') {
     setStatusText(`Version ${APP_VERSION} · Up to date`);
     if (manual && onNotify) onNotify(`You’re on the latest version (${APP_VERSION}).`);
    }
   } finally {
    setChecking(false);
   }
  },
  [onNotify]
 );

 useEffect(() => {
  checkNow(false);
 }, [checkNow]);

 const applyUpdate = useCallback(async () => {
  if (kind === 'ota-ready') {
   try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
     window.location.reload();
     return;
    }
    await Updates.reloadAsync();
   } catch {
    if (onNotify) onNotify('Please close and reopen the app to finish updating.');
   }
  } else if (kind === 'store-available') {
   try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
     window.location.reload();
     return;
    }
    await Linking.openURL(storeUrl);
   } catch {
    if (onNotify) onNotify('Visit Google Play to download the newest update.');
   }
  }
 }, [kind, storeUrl, onNotify]);

 return {
  kind,
  checking,
  latestVersion,
  storeUrl,
  releaseNotes,
  statusText,
  checkNow,
  applyUpdate,
  dismissBanner: () => setDismissed(true),
  bannerVisible: kind !== 'none' && !dismissed,
 };
}
