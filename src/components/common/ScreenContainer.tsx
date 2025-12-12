import React from 'react';
import { View, ViewStyle, StatusBar } from 'react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }, style]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            {children}
        </SafeAreaView>
    );
};
