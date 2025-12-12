export const lightPalette = {
    background: '#F2F2F7', // iOS System Gray 6 (Grouped Background)
    surface: '#FFFFFF',
    surfaceHighlight: '#E5E5EA',
    text: '#000000',
    textSecondary: '#8E8E93',
    primary: '#EEB210', // iOS Notes Gold/Yellow
    secondary: '#5856D6',
    error: '#FF3B30',
    border: '#C6C6C8',
    success: '#34C759',
    warning: '#FFCC00',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
};

export const darkPalette = {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceHighlight: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    primary: '#FFD60A', // iOS System Yellow (Brighter Gold)
    secondary: '#5E5CE6',
    error: '#FF453A',
    border: '#38383A',
    success: '#32D74B',
    warning: '#FFD60A',
    cardShadow: 'rgba(0, 0, 0, 0.5)',
};

export type ThemeColors = typeof lightPalette;
