import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
// @ts-ignore
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../core/theme/ThemeContext';

interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: ViewStyle | TextStyle;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color, style }) => {
    const { colors } = useTheme();
    return <Ionicons name={name as any} size={size} color={color || colors.text} style={style} />;
};
