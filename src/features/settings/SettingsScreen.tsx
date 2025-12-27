import React, { useState } from 'react';
import { View, TouchableOpacity, Switch, ScrollView, Platform } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../core/theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { BackupService } from '../../services/backup/BackupService';
import { useIOSAlert } from '../../components/modals/IOSAlert';
import { AdMobService } from '../../services/ads/AdMobService';
import { PremiumSettings } from '../../components/premium/PremiumSettings';

interface SettingsRowProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
    iconColor?: string;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    showChevron = true,
    iconColor
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress && !rightElement}
            activeOpacity={onPress ? 0.7 : 1}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: colors.surface,
            }}
        >
            <View style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: iconColor || colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
            }}>
                <Icon name={icon} size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
                <AppText size="body">{title}</AppText>
                {subtitle && <AppText size="caption" secondary>{subtitle}</AppText>}
            </View>
            {rightElement}
            {showChevron && onPress && (
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            )}
        </TouchableOpacity>
    );
};

const SettingsDivider: React.FC = () => {
    const { colors } = useTheme();
    return <View style={{ height: 0.5, backgroundColor: colors.border, marginLeft: 60 }} />;
};

const SettingsSection: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
    const { colors } = useTheme();
    return (
        <View style={{ marginBottom: 24 }}>
            {title && (
                <AppText
                    size="caption"
                    secondary
                    style={{ marginLeft: 16, marginBottom: 8, textTransform: 'uppercase' }}
                >
                    {title}
                </AppText>
            )}
            <View style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                marginHorizontal: 16,
                overflow: 'hidden'
            }}>
                {children}
            </View>
        </View>
    );
};

export const SettingsScreen = () => {
    const { colors, isDark, toggleTheme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isExporting, setIsExporting] = useState(false);
    const { showAlert } = useIOSAlert();

    const handleShowInterstitialAd = async () => {
        try {
            await AdMobService.showInterstitial();
        } catch (error: any) {
            console.error('Interstitial ad error:', error);
            showAlert({
                title: 'Ad Error',
                message: error?.message || 'Failed to show interstitial ad.'
            });
        }
    };

    const handleShowRewardedAd = async () => {
        try {
            const reward = await AdMobService.showRewarded();
            if (reward) {
                showAlert({
                    title: 'Reward Earned',
                    message: `You earned ${reward.amount} ${reward.type}.`
                });
                return;
            }

            showAlert({
                title: 'No Reward',
                message: 'Ad closed before a reward was earned.'
            });
        } catch (error: any) {
            console.error('Rewarded ad error:', error);
            showAlert({
                title: 'Ad Error',
                message: error?.message || 'Failed to show rewarded ad.'
            });
        }
    };

    const handleExportBackup = async () => {
        setIsExporting(true);
        try {
            await BackupService.exportBackup();
            showAlert({ title: 'Success', message: 'Backup exported successfully!' });
        } catch (error) {
            console.error('Export error:', error);
            showAlert({ title: 'Error', message: 'Failed to export backup. Please try again.' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportBackup = async () => {
        try {
            const success = await BackupService.importBackup();
            if (success) {
                showAlert({ title: 'Success', message: 'Backup imported successfully! Restart the app to see changes.' });
            }
        } catch (error) {
            console.error('Import error:', error);
            showAlert({ title: 'Error', message: 'Failed to import backup. Please check the file format.' });
        }
    };

    return (
        <ScreenContainer>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12
            }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                    <Icon name="chevron-back" size={28} color={colors.primary} />
                    <AppText style={{ color: colors.primary, fontSize: 17 }}>Back</AppText>
                </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                <AppText size="title1" weight="bold">Settings</AppText>
            </View>

            <ScrollView>
                <PremiumSettings />

                <SettingsSection title="Appearance">
                    <SettingsRow
                        icon="moon"
                        title="Dark Mode"
                        iconColor="#5856D6"
                        showChevron={false}
                        rightElement={
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        }
                    />
                </SettingsSection>

                <SettingsSection title="Data">
                    <SettingsRow
                        icon="cloud-upload-outline"
                        title="Export Backup"
                        subtitle="Save all notes to a file"
                        iconColor="#34C759"
                        onPress={handleExportBackup}
                    />
                    <SettingsDivider />
                    <SettingsRow
                        icon="cloud-download-outline"
                        title="Import Backup"
                        subtitle="Restore notes from a file"
                        iconColor="#007AFF"
                        onPress={handleImportBackup}
                    />
                </SettingsSection>

                <SettingsSection title="About">
                    <SettingsRow
                        icon="information-circle"
                        title="Version"
                        subtitle="1.0.0"
                        iconColor="#8E8E93"
                        showChevron={false}
                    />
                    <SettingsDivider />
                    <SettingsRow
                        icon="document-text"
                        title="Privacy Policy"
                        iconColor="#FF9500"
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                    />
                    <SettingsDivider />
                    <SettingsRow
                        icon="heart"
                        title="Rate This App"
                        iconColor="#FF2D55"
                        onPress={() => showAlert({ title: 'Thank You!', message: 'We appreciate your support!' })}
                    />
                </SettingsSection>

                {Platform.OS === 'android' && (
                    <SettingsSection title="Ads">
                        <SettingsRow
                            icon="tv"
                            title="Show Interstitial Ad"
                            subtitle={__DEV__ ? 'Test ad' : 'Live ad'}
                            iconColor="#007AFF"
                            onPress={handleShowInterstitialAd}
                        />
                        <SettingsDivider />
                        <SettingsRow
                            icon="gift"
                            title="Show Rewarded Ad"
                            subtitle={__DEV__ ? 'Test ad' : 'Live ad'}
                            iconColor="#34C759"
                            onPress={handleShowRewardedAd}
                        />
                    </SettingsSection>
                )}
            </ScrollView>
        </ScreenContainer>
    );
};
