import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { RootNavigator } from './navigation/RootNavigator';
import { ThemeProvider } from './core/theme/ThemeContext';
import { IOSAlertProvider } from './components/modals/IOSAlert';

// Enable native screens for better performance and smooth animations
enableScreens(true);

function App(): React.JSX.Element {
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
