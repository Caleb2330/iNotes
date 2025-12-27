import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Platform } from 'react-native';
import { RootStackParamList } from './types';
import { HomeScreen } from '../features/home/HomeScreen';
import { NoteListScreen } from '../features/notes/NoteListScreen';
import { NoteDetailScreen } from '../features/notes/NoteDetailScreen';
import { FolderListScreen } from '../features/folders/FolderListScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { OnboardingScreen, checkOnboardingCompleted } from '../features/onboarding/OnboardingScreen';
import { PrivacyPolicyScreen } from '../features/settings/PrivacyPolicyScreen';
import { useTheme } from '../core/theme/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        const completed = await checkOnboardingCompleted();
        setShowOnboarding(!completed);
        setIsLoading(false);
    };

    const navigationTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.error,
        },
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <NavigationContainer theme={navigationTheme}>
                <Stack.Navigator
                    initialRouteName={showOnboarding ? "Onboarding" : "Home"}
                    screenOptions={{
                        headerShown: false,
                        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
                        gestureEnabled: true,
                        animationTypeForReplace: 'push',
                        presentation: 'card',
                        contentStyle: { backgroundColor: colors.background },
                    }}
                >
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="NoteList" component={NoteListScreen} />
                    <Stack.Screen name="FolderList" component={FolderListScreen} />
                    <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
};
