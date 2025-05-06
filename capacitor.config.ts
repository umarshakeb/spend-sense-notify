
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.833ac519c5944587b603b7e2e8746851',
  appName: 'spend-sense-notify',
  webDir: 'dist',
  server: {
    url: 'https://833ac519-c594-4587-b603-b7e2e8746851.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // Add iOS specific configuration
  ios: {
    contentInset: 'always',
  },
  // Add Android specific configuration
  android: {
    backgroundColor: "#ffffff"
  }
};

export default config;
