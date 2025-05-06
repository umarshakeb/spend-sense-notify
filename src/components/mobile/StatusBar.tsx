
import { useEffect } from 'react';

export function useStatusBar() {
  useEffect(() => {
    const setupStatusBar = async () => {
      try {
        // Dynamic import to avoid issues in browsers that don't support Capacitor
        const { Capacitor } = await import('@capacitor/core');
        
        if (Capacitor.isNativePlatform()) {
          try {
            // Import the StatusBar plugin correctly
            const { StatusBar, Style } = await import('@capacitor/status-bar');
            
            // Set status bar with light text for dark backgrounds
            await StatusBar.setStyle({ style: Style.Dark });
            
            // Make status bar translucent on Android
            if (Capacitor.getPlatform() === 'android') {
              await StatusBar.setBackgroundColor({ color: '#000000' });
            }
          } catch (err) {
            console.error('Status bar configuration failed:', err);
          }
        }
      } catch (err) {
        console.log('Not running on Capacitor');
      }
    };
    
    setupStatusBar();
  }, []);
}
