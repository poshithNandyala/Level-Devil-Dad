import type { CapacitorConfig } from '@capacitor/cli';

// Change appId to a reverse-domain you own before publishing to the stores.
const config: CapacitorConfig = {
  appId: 'com.poshith.leveldevildad',
  appName: 'Level Devil Dad',
  webDir: 'dist',
  backgroundColor: '#120f1c',
  android: {
    backgroundColor: '#120f1c',
    allowMixedContent: false,
  },
  ios: {
    backgroundColor: '#120f1c',
    contentInset: 'never',
    scrollEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: false,
      backgroundColor: '#120f1c',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
    },
  },
};

export default config;
