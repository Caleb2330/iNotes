import React from 'react';
import { TouchableOpacity, StyleProp, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { AppText } from './AppText';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    style,
    disabled
}) => {
    const { colors } = useTheme();

    let bg = colors.primary;
    let fg = colors.text;

    if (variant === 'secondary') {
        bg = colors.surfaceHighlight;
        fg = colors.text;
    } else if (variant === 'ghost') {
        bg = 'transparent';
        fg = colors.primary;
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                {
                    backgroundColor: bg,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.6 : 1
                },
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={fg} />
            ) : (
                <AppText weight="medium" style={{ color: fg }}>{title}</AppText>
            )}
        </TouchableOpacity>
    );
};
