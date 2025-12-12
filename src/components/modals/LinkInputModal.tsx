import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, TextInput, Dimensions } from 'react-native';
import { AppText } from '../common/AppText';
import { useTheme } from '../../core/theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LinkInputModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (url: string, title?: string) => void;
    initialUrl?: string;
    initialTitle?: string;
}

export const LinkInputModal: React.FC<LinkInputModalProps> = ({
    visible,
    onClose,
    onSubmit,
    initialUrl = '',
    initialTitle = ''
}) => {
    const { colors, isDark } = useTheme();
    const [url, setUrl] = useState(initialUrl);
    const [title, setTitle] = useState(initialTitle);

    useEffect(() => {
        if (visible) {
            setUrl(initialUrl);
            setTitle(initialTitle);
        }
    }, [visible, initialUrl, initialTitle]);

    const handleSubmit = () => {
        if (url.trim()) {
            let finalUrl = url.trim();
            if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                finalUrl = 'https://' + finalUrl;
            }
            onSubmit(finalUrl, title.trim() || undefined);
        }
        onClose();
    };

    const borderColor = isDark ? 'rgba(84, 84, 88, 0.65)' : 'rgba(60, 60, 67, 0.18)';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[
                    styles.container,
                    { backgroundColor: isDark ? 'rgba(44, 44, 46, 0.95)' : 'rgba(255, 255, 255, 0.98)' }
                ]}>
                    <View style={styles.contentContainer}>
                        <AppText weight="bold" style={[styles.title, { color: colors.text }]}>
                            Insert Link
                        </AppText>
                        
                        <TextInput
                            placeholder="URL"
                            placeholderTextColor={colors.textSecondary}
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)',
                                    color: colors.text,
                                    borderColor: borderColor
                                }
                            ]}
                            value={url}
                            onChangeText={setUrl}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                            autoFocus
                        />
                        
                        <TextInput
                            placeholder="Title (optional)"
                            placeholderTextColor={colors.textSecondary}
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)',
                                    color: colors.text,
                                    borderColor: borderColor
                                }
                            ]}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={[styles.buttonContainer, { borderTopColor: borderColor }]}>
                        <TouchableOpacity
                            style={[styles.button, { borderRightWidth: 0.5, borderRightColor: borderColor }]}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <AppText weight="regular" style={[styles.buttonText, { color: '#0A84FF' }]}>
                                Cancel
                            </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            activeOpacity={0.7}
                        >
                            <AppText weight="bold" style={[styles.buttonText, { color: '#0A84FF' }]}>
                                Insert
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: SCREEN_WIDTH * 0.75,
        maxWidth: 300,
        borderRadius: 14,
        overflow: 'hidden',
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 16,
    },
    input: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 17,
    },
});
