import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { RootNavigator } from './navigation/RootNavigator';
import { ThemeProvider } from './core/theme/ThemeContext';
import { IOSAlertProvider } from './components/modals/IOSAlert';

import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';

// Enable native screens for better performance and smooth animations
enableScreens(true);

function App(): React.JSX.Element {
    React.useEffect(() => {
        if (Platform.OS !== 'android') {
            return;
        }

        mobileAds()
            .initialize()
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
