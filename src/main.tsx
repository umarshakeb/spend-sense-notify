
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { toast } from 'sonner';

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
      
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        StatusBar.setBackgroundColor({ color: '#ffffff' });
        StatusBar.setStyle({ style: Style.Dark });
        
        // For Android, add some additional configurations to help with SSL issues
        if (Capacitor.getPlatform() === 'android') {
          console.log('Configuring Android for web content');
          
          // Add custom error handler for SSL errors
          window.addEventListener('error', (event) => {
            if (event.message && (
              event.message.includes('SSL') || 
              event.message.includes('certificate') || 
              event.message.includes('ERR_SSL_PROTOCOL_ERROR')
            )) {
              console.warn('SSL error detected:', event.message);
              toast.error("Connection error. Please check your internet connection.");
              
              // Prevent the default error handling
              event.preventDefault();
              return true;
            }
            return false;
          });
        }
      } catch (err) {
        console.log('Status bar plugin not available', err);
      }
      
      // Show initial permission request on first app launch
      // We'll check if this is the first launch
      if (!localStorage.getItem('app_first_launch')) {
        localStorage.setItem('app_first_launch', 'true');
        // In a real app, we would request SMS permissions here using a Capacitor plugin
        // For now, just set a flag that we'll check in the SMSPermissionRequest component
        console.log('First app launch, ready to request SMS permissions');
      }
    }
  } catch (err) {
    console.log('Not running on Capacitor', err);
  }
  
  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
};

initApp();
