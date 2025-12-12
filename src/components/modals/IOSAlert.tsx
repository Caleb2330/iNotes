import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { AppText } from '../common/AppText';
import { useTheme } from '../../core/theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
    title: string;
    message?: string;
    buttons?: AlertButton[];
}

interface AlertContextType {
    showAlert: (config: AlertConfig) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useIOSAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useIOSAlert must be used within an IOSAlertProvider');
    }
    return context;
};

export const IOSAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AlertConfig>({ title: '' });
    const { colors, isDark } = useTheme();

    const showAlert = useCallback((alertConfig: AlertConfig) => {
        setConfig(alertConfig);
        setVisible(true);
    }, []);

    const hideAlert = useCallback(() => {
        setVisible(false);
    }, []);

    const handleButtonPress = (button: AlertButton) => {
        hideAlert();
        if (button.onPress) {
            setTimeout(() => button.onPress?.(), 100);
        }
    };

    const buttons = config.buttons || [{ text: 'OK', style: 'default' }];
    const cancelButton = buttons.find(button => button.style === 'cancel');
    const primaryButtons = cancelButton
        ? buttons.filter(button => button !== cancelButton)
        : buttons;
    const borderColor = isDark ? 'rgba(84, 84, 88, 0.65)' : 'rgba(60, 60, 67, 0.18)';
    const hasMultipleButtons = primaryButtons.length > 1;

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={hideAlert}
            >
                <View style={styles.overlay}>
                    <View style={styles.sheetWrapper}>
                        <View style={[
                            styles.sheetContainer,
                            { backgroundColor: isDark ? 'rgba(28, 28, 30, 0.96)' : 'rgba(242, 242, 247, 0.98)' }
                        ]}>
                            {(config.title || config.message) && (
                                <View style={styles.contentContainer}>
                                    {config.title && (
                                        <AppText weight="bold" style={[styles.title, { color: colors.text }]}>
                                            {config.title}
                                        </AppText>
                                    )}
                                    {config.message && (
                                        <AppText style={[styles.message, { color: colors.textSecondary }]}>
                                            {config.message}
                                        </AppText>
                                    )}
                                </View>
                            )}

                            <View style={[
                                styles.actionsContainer,
                                { borderTopColor: borderColor }
                            ]}>
                                {primaryButtons.map((button, index) => {
                                    const isDestructive = button.style === 'destructive';

                                    return (
                                        <React.Fragment key={`${button.text}-${index}`}>
                                            {index > 0 && (
                                                <View style={[
                                                    styles.actionDivider,
                                                    { backgroundColor: borderColor }
                                                ]} />
                                            )}
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                activeOpacity={0.85}
                                                onPress={() => handleButtonPress(button)}
                                            >
                                                <AppText
                                                    weight="medium"
                                                    style={[
                                                        styles.actionText,
                                                        {
                                                            color: isDestructive ? '#FF3B30' : '#0A84FF'
                                                        }
                                                    ]}
                                                >
                                                    {button.text}
                                                </AppText>
                                            </TouchableOpacity>
                                        </React.Fragment>
                                    );
                                })}
                            </View>
                        </View>

                        {cancelButton && (
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[
                                    styles.cancelButton,
                                    { backgroundColor: isDark ? 'rgba(44, 44, 46, 0.95)' : '#FFFFFF' }
                                ]}
                                onPress={() => handleButtonPress(cancelButton)}
                            >
                                <AppText weight="bold" style={[styles.cancelText, { color: '#0A84FF' }]}>
                                    {cancelButton.text}
                                </AppText>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetWrapper: {
        width: SCREEN_WIDTH * 0.85,
    },
    sheetContainer: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 8,
        borderColor: 'rgba(60, 60, 67, 0.29)',
        borderWidth: 0.5,
    },
    contentContainer: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 12,
        alignItems: 'center',
    },
    actionsContainer: {
        borderTopWidth: 0.5,
    },
    actionButton: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionDivider: {
        height: 0.5,
    },
    title: {
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 2,
    },
    actionText: {
        fontSize: 17,
    },
    cancelButton: {
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(60, 60, 67, 0.18)',
    },
    cancelText: {
        fontSize: 18,
    },
});
