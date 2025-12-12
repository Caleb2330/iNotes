import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { typography } from '../../core/theme/typography';

interface AppTextProps extends TextProps {
    size?: keyof typeof typography.sizes;
    weight?: keyof typeof typography.weights;
    color?: string; // Explicit color override
    secondary?: boolean; // Use secondary text color
}

export const AppText: React.FC<AppTextProps> = ({
    style,
    size = 'body',
    weight = 'regular',
    color,
    secondary,
    children,
    ...props
}) => {
    const { colors } = useTheme();

    const textStyle: TextStyle = {
        fontSize: typography.sizes[size],
        fontWeight: typography.weights[weight] as TextStyle['fontWeight'],
        color: color || (secondary ? colors.textSecondary : colors.text),
    };

    return (
        <Text style={[textStyle, style]} {...props}>
            {children}
        </Text>
    );
};
