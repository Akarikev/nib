const { APP_NAME } = require('./src/config.json');
export default {
 expo: {
  name: APP_NAME, slug: 'nib', owner: 'elormtsx', version: '1.2.0', orientation: 'default',
  icon: './assets/icon.png', userInterfaceStyle: 'light',
  ios: { supportsTablet: true, bundleIdentifier: 'com.nib.game' },
  android: {
   package: 'com.nib.game',
   permissions: [],
   blockedPermissions: [
    'android.permission.RECORD_AUDIO',
    'android.permission.CAMERA',
    'android.permission.READ_MEDIA_IMAGES',
    'android.permission.READ_MEDIA_VIDEO',
    'android.permission.READ_EXTERNAL_STORAGE',
   ],
   adaptiveIcon: { foregroundImage: './assets/icon.png', backgroundColor: '#E2EDE2' },
  },
  web: { favicon: './assets/favicon.png', name: APP_NAME, themeColor: '#E2EDE2' },
  plugins: [
   'expo-sharing',
   ['expo-audio', { microphonePermission: false }],
   [
    'expo-media-library',
    {
     savePhotosPermission: 'Allow Nib to save your Studio Card image to your photo gallery.',
     isAccessMediaLocationEnabled: false,
     granularPermissions: [],
    },
   ],
  ],
  updates: { url: 'https://u.expo.dev/b5ee4920-1b18-4ab4-8bd6-b6b275ccb61a' },
  runtimeVersion: { policy: 'appVersion' },
  extra: { eas: { projectId: 'b5ee4920-1b18-4ab4-8bd6-b6b275ccb61a' } },
 }
};
