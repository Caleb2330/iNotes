import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { RootNavigator } from './navigation/RootNavigator';
import { ThemeProvider } from './core/theme/ThemeContext';
import { IOSAlertProvider } from './components/modals/IOSAlert';

import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { AdMobService } from './services/ads/AdMobService';

// Enable native screens for better performance and smooth animations
enableScreens(true);

function App(): React.JSX.Element {
    React.useEffect(() => {
        if (Platform.OS !== 'android') {
            return;
        }

        mobileAds()
            .initialize()
            .then(() => {
                // Show ad on first cold start after initialization
                AdMobService.showInterstitial();
            })
            .catch(() => undefined);
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <IOSAlertProvider>
                    <RootNavigator />
                </IOSAlertProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

export default App;
