import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, TextInput, Dimensions } from 'react-native';
import { AppText } from '../common/AppText';
import { useTheme } from '../../core/theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TextInputModalProps {
    visible: boolean;
    title: string;
    placeholder?: string;
    initialValue?: string;
    submitButtonText?: string;
    onClose: () => void;
    onSubmit: (value: string) => void;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
    visible,
    title,
    placeholder = '',
    initialValue = '',
    submitButtonText = 'Submit',
    onClose,
    onSubmit
}) => {
    const { colors, isDark } = useTheme();
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (visible) {
            setValue(initialValue);
        }
    }, [visible, initialValue]);

    const handleSubmit = () => {
        if (value.trim()) {
            onSubmit(value.trim());
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
                            {title}
                        </AppText>
                        
                        <TextInput
                            placeholder={placeholder}
                            placeholderTextColor={colors.textSecondary}
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)',
                                    color: colors.text,
                                    borderColor: borderColor
                                }
                            ]}
                            value={value}
                            onChangeText={setValue}
                            autoFocus
                            onSubmitEditing={handleSubmit}
                            returnKeyType="done"
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
                                {submitButtonText}
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
