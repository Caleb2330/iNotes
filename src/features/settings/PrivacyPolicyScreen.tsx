import React from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../core/theme/ThemeContext';

export const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-back" size={28} color={colors.primary} />
                    <AppText style={{ color: colors.primary, fontSize: 17 }}>Back</AppText>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <AppText size="title1" weight="bold" style={styles.title}>
                    Privacy Policy
                </AppText>

                <AppText style={[styles.lastUpdated, { color: colors.textSecondary }]}>
                    Last updated: December 2024
                </AppText>

                <Section title="Introduction">
                    iNote lookalike ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                    explains how we collect, use, and safeguard your information when you use our mobile application.
                </Section>

                <Section title="Information We Collect">
                    <BulletPoint>
                        <Bold>Notes and Content:</Bold> All notes, attachments, and folders you create are stored 
                        locally on your device. We do not have access to this content.
                    </BulletPoint>
                    <BulletPoint>
                        <Bold>Usage Data:</Bold> We may collect anonymous usage statistics to improve the app 
                        experience. This data cannot be used to identify you personally.
                    </BulletPoint>
                    <BulletPoint>
                        <Bold>Device Information:</Bold> We may collect device type, operating system version, 
                        and app version for crash reporting and analytics.
                    </BulletPoint>
                </Section>

                <Section title="How We Use Your Information">
                    <BulletPoint>To provide and maintain our service</BulletPoint>
                    <BulletPoint>To improve user experience</BulletPoint>
                    <BulletPoint>To fix bugs and improve app stability</BulletPoint>
                    <BulletPoint>To display relevant advertisements (with your consent)</BulletPoint>
                </Section>

                <Section title="Data Storage">
                    All your notes and personal data are stored locally on your device. If you choose to use 
                    the backup feature, your data will be exported to a location of your choosing (such as 
                    Google Drive). We do not store your data on our servers.
                </Section>

                <Section title="Third-Party Services">
                    Our app may use third-party services that collect information:
                    <BulletPoint>Google AdMob for advertising</BulletPoint>
                    <BulletPoint>Firebase for analytics and crash reporting</BulletPoint>
                    These services have their own privacy policies governing their data practices.
                </Section>

                <Section title="Your Rights">
                    You have the right to:
                    <BulletPoint>Access all your data (stored locally on your device)</BulletPoint>
                    <BulletPoint>Delete your data by uninstalling the app</BulletPoint>
                    <BulletPoint>Opt-out of personalized advertising</BulletPoint>
                    <BulletPoint>Export your data using the backup feature</BulletPoint>
                </Section>

                <Section title="Children's Privacy">
                    Our app is not intended for children under 13. We do not knowingly collect personal 
                    information from children under 13.
                </Section>

                <Section title="Changes to This Policy">
                    We may update our Privacy Policy from time to time. We will notify you of any changes 
                    by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </Section>

                <Section title="Contact Us">
                    If you have any questions about this Privacy Policy, please contact us at:
                    {'\n\n'}calebiker7@gmail.com
                </Section>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenContainer>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const { colors } = useTheme();
    return (
        <View style={styles.section}>
            <AppText size="title3" weight="bold" style={styles.sectionTitle}>
                {title}
            </AppText>
            <AppText style={[styles.sectionContent, { color: colors.text }]}>
                {children}
            </AppText>
        </View>
    );
};

const BulletPoint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AppText style={styles.bulletPoint}>
        {'\n'}• {children}
    </AppText>
);

const Bold: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AppText weight="bold">{children}</AppText>
);

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        marginBottom: 8,
    },
    lastUpdated: {
        marginBottom: 24,
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 15,
        lineHeight: 22,
    },
    bulletPoint: {
        fontSize: 15,
        lineHeight: 22,
    },
});
