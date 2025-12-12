import React, { useState, useRef } from 'react';
import { View, FlatList, Dimensions, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { AppText } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../core/theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_KEY = '@onboarding_completed';

interface OnboardingSlide {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        title: 'Welcome to iNote',
        description: 'Your beautiful, powerful note-taking companion. Create, organize, and share your thoughts effortlessly.',
        icon: 'document-text-outline',
        color: '#007AFF',
    },
    {
        id: '2',
        title: 'Rich Text Editing',
        description: 'Format your notes with bold, italic, lists, headings, and more. Add images and attachments to bring your notes to life.',
        icon: 'create-outline',
        color: '#34C759',
    },
    {
        id: '3',
        title: 'Organize with Folders',
        description: 'Keep your notes tidy with custom folders. Pin important notes and archive ones you don\'t need right now.',
        icon: 'folder-outline',
        color: '#FF9500',
    },
    {
        id: '4',
        title: 'Secure & Private',
        description: 'Lock sensitive notes with biometric authentication. Your data stays on your device and can be backed up anytime.',
        icon: 'lock-closed-outline',
        color: '#FF3B30',
    },
    {
        id: '5',
        title: 'Ready to Start?',
        description: 'Create your first note and experience the joy of beautiful note-taking.',
        icon: 'rocket-outline',
        color: '#AF52DE',
    },
];

export const OnboardingScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            completeOnboarding();
        }
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            console.error('Error saving onboarding state:', error);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        }
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon as any} size={80} color={item.color} />
            </View>
            <AppText size="title1" weight="bold" style={styles.title}>
                {item.title}
            </AppText>
            <AppText style={[styles.description, { color: colors.textSecondary }]}>
                {item.description}
            </AppText>
        </View>
    );

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        {
                            backgroundColor: index === currentIndex ? colors.primary : colors.border,
                            width: index === currentIndex ? 24 : 8,
                        },
                    ]}
                />
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.skipContainer}>
                {currentIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={handleSkip}>
                        <AppText style={{ color: colors.primary, fontSize: 17 }}>Skip</AppText>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    setCurrentIndex(index);
                }}
            />

            {renderDots()}

            <View style={styles.buttonContainer}>
                <Button
                    title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                    onPress={handleNext}
                    style={{ minWidth: 200 }}
                />
            </View>
        </View>
    );
};

export const checkOnboardingCompleted = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        return value === 'true';
    } catch (error) {
        return false;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipContainer: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        alignItems: 'flex-end',
        minHeight: 100,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        textAlign: 'center',
        fontSize: 17,
        lineHeight: 24,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        paddingHorizontal: 40,
        paddingBottom: 50,
        alignItems: 'center',
    },
});
