import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tomfong.simpleqr',
  appName: 'Simple QR',
  webDir: 'www',
  bundledWebRuntime: false,
  android: {
    initialFocus: false
  },
  plugins: {
    SplashScreen: {
      useDialog: false,
      androidScaleType: "CENTER_CROP",
      backgroundColor: '#00a5aa',
      launchAutoHide: false,
      androidSplashResourceName: "splash",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
    }
  },
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      orientation: 'portrait'
    }
  },
  server: {
    iosScheme: "ionic"
  }
};

export default config;
