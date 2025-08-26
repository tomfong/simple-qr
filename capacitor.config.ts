import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tomfong.simpleqr',
  appName: 'Simple QR',
  webDir: 'www',
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
    },
    EdgeToEdge: {
      backgroundColor: '#000000',  // Opaque black
    },
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
