
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
      } catch (err) {
        console.log('Status bar plugin not available');
      }
    }
  } catch (err) {
    console.log('Not running on Capacitor');
  }
  
  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
};

initApp();
