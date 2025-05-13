
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.spendsense',
  appName: 'spend-sense-notify',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'app', // Custom hostname instead of localhost
  },
  // Add iOS specific configuration
  ios: {
    contentInset: 'always',
  },
  // Add Android specific configuration
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: true,  // Allow mixed content (HTTP and HTTPS)
    captureInput: true,
    webContentsDebuggingEnabled: true,  // Enable web debugging for development
  }
};

export default config;
