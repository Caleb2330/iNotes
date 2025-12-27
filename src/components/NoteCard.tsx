import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { AppText } from './common/AppText';
import { Icon } from './common/Icon';
import { useTheme } from '../core/theme/ThemeContext';
import { Note } from '../features/notes/types';
import { formatNoteDate } from '../utils/dateUtils';

interface NoteCardProps {
    note: Note;
    onPress: () => void;
    style?: ViewStyle;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, style }) => {
    const { colors } = useTheme();
    const dateStr = formatNoteDate(note.updatedAt);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                // iOS Shadow
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                // Android Shadow
                elevation: 3,
            }, style]}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                {note.pinned && (
                    <Icon name="pin" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                )}
                {note.isLocked && (
                    <Icon name="lock-closed" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                )}
                <AppText size="body" weight="bold" numberOfLines={1} style={{ flex: 1 }}>
                    {note.title || 'Untitled'}
                </AppText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText
                    size="caption"
                    style={{ color: colors.textSecondary, flex: 1, marginRight: 8 }}
                    numberOfLines={2}
                >
                    {note.isLocked ? 'This note is locked' : (note.plainTextPreview || 'No additional text')}
                </AppText>
                <AppText size="caption" style={{ color: colors.textSecondary }}>
                    {dateStr}
                </AppText>
            </View>
        </TouchableOpacity>
    );
};
