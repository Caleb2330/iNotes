import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { RootNavigator } from './navigation/RootNavigator';
import { ThemeProvider } from './core/theme/ThemeContext';
import { IOSAlertProvider } from './components/modals/IOSAlert';

import { AdMobService } from './services/ads/AdMobService';

// Enable native screens for better performance and smooth animations
enableScreens(true);

function App(): React.JSX.Element {
    React.useEffect(() => {
        // Initialize and pre-load ads in the background. Never show an
        // interstitial on app launch — Google AdMob explicitly forbids it
        // (only App Open Ads are allowed at launch, and we don't use them).
        AdMobService.initialize();
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
