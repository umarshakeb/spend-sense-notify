
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize the app
const initApp = async () => {
  // Check if we're running on a mobile device
  let isCapacitorApp = false;
  
  try {
    // Dynamic import to avoid issues in browsers that don't support Capacitor
    const { Capacitor } = await import('@capacitor/core');
    isCapacitorApp = Capacitor.isNativePlatform();
    
    if (isCapacitorApp) {
      // Set up any mobile-specific functionality here
      console.log('Running as a native app on', Capacitor.getPlatform());
      
      // Example: Set status bar color on iOS/Android using the correct import
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        StatusBar.setBackgroundColor({ color: '#ffffff' });
        StatusBar.setStyle({ style: Style.Dark });
        
        // For Android, add some additional configurations to help with SSL issues
        if (Capacitor.getPlatform() === 'android') {
          console.log('Configuring Android for web content');
          
          // Force SSL connections to be accepted even with certificate issues (for development only)
          const { WebView } = await import('@capacitor/core');
          if (WebView) {
            console.log('Setting up WebView debugging');
          }
        }
      } catch (err) {
        console.log('Status bar plugin not available', err);
      }
    }
  } catch (err) {
    console.log('Not running on Capacitor', err);
  }
  
  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
};

initApp();
