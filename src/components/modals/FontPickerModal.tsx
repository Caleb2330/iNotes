import React from 'react';
import { View, Modal, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { AppText } from '../common/AppText';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { useTheme } from '../../core/theme/ThemeContext';
import { AVAILABLE_FONTS, Font } from '../../services/font-manager/types';
import { FontManagerService } from '../../services/font-manager/FontManagerService';

interface FontPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectFont: (font: Font) => void;
    currentFontFamily?: string;
}

export const FontPickerModal: React.FC<FontPickerModalProps> = ({
    visible,
    onClose,
    onSelectFont,
    currentFontFamily
}) => {
    const { colors } = useTheme();
    const [loadingFont, setLoadingFont] = React.useState<string | null>(null);

    const handleSelect = async (font: Font) => {
        try {
            setLoadingFont(font.family);
            // Preload font before selecting
            await FontManagerService.loadFont(font);
            onSelectFont(font);
            onClose();
        } catch (error) {
            console.error('Failed to load font:', error);
            // Optionally show error toast
        } finally {
            setLoadingFont(null);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{
                    backgroundColor: colors.background,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    height: '70%',
                    paddingTop: 16
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 }}>
                        <AppText size="title2" weight="bold">Select Font</AppText>
                        <Button title="Close" variant="ghost" onPress={onClose} />
                    </View>

                    <FlatList
                        data={AVAILABLE_FONTS}
                        keyExtractor={item => item.family}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        renderItem={({ item }) => {
                            const isSelected = currentFontFamily === item.family;
                            const isLoading = loadingFont === item.family;

                            return (
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 16,
                                        paddingHorizontal: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottomWidth: 0.5,
                                        borderBottomColor: colors.border
                                    }}
                                    onPress={() => handleSelect(item)}
                                    disabled={isLoading}
                                >
                                    <View>
                                        <AppText
                                            style={{
                                                fontSize: 18,
                                                // We can try to use the font family directly if loaded, 
                                                // but for the picker list itself, we might not want to load ALL 100 fonts immediately.
                                                // So we keep system font for the list, or maybe just load the top ones.
                                                // For now, let's keep system font for the name.
                                                color: isSelected ? colors.primary : colors.text
                                            }}
                                        >
                                            {item.family}
                                        </AppText>
                                        <AppText size="caption" secondary>{item.category}</AppText>
                                    </View>
                                    
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : isSelected ? (
                                        <Icon name="checkmark" size={24} color={colors.primary} />
                                    ) : null}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};
