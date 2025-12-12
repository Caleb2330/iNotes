import * as Font from 'expo-font';
import * as FileSystem from 'expo-file-system/legacy';
import { AVAILABLE_FONTS, Font as FontType } from './types';

export class FontManagerService {
    private static getFontsDir(): string {
        return ((FileSystem as any).documentDirectory || '') + 'fonts/';
    }

    static async init() {
        // Ensure fonts directory exists
        const fontsDir = this.getFontsDir();
        const dirInfo = await FileSystem.getInfoAsync(fontsDir);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(fontsDir, { intermediates: true });
        }
    }

    static async isFontLoaded(fontFamily: string): Promise<boolean> {
        return Font.isLoaded(fontFamily);
    }

    static async loadFont(font: FontType): Promise<void> {
        if (Font.isLoaded(font.family)) {
            return;
        }

        try {
            await this.init(); // Ensure dir exists
            
            const fontFileName = `${font.family.replace(/\s+/g, '')}.ttf`;
            const localUri = this.getFontsDir() + fontFileName;

            // Check if file exists locally
            const fileInfo = await FileSystem.getInfoAsync(localUri);
            
            if (!fileInfo.exists) {
                // Download font
                console.log(`Downloading font ${font.family} from ${font.url}...`);
                const downloadResult = await FileSystem.downloadAsync(font.url, localUri);
                
                // Check if download was successful
                if (downloadResult.status !== 200) {
                    throw new Error(`Failed to download font: HTTP ${downloadResult.status}`);
                }
                
                // Verify file was created and has content
                const newFileInfo = await FileSystem.getInfoAsync(localUri);
                if (!newFileInfo.exists || (newFileInfo as any).size < 1000) {
                    // Delete corrupted file
                    await FileSystem.deleteAsync(localUri, { idempotent: true });
                    throw new Error('Downloaded font file is invalid or empty');
                }
            }

            // Load font into Expo
            await Font.loadAsync({
                [font.family]: localUri
            });
            console.log(`Font ${font.family} loaded successfully.`);
        } catch (error) {
            console.error(`Error loading font ${font.family}:`, error);
            throw error;
        }
    }

    static async clearCachedFonts(): Promise<void> {
        try {
            const fontsDir = this.getFontsDir();
            const dirInfo = await FileSystem.getInfoAsync(fontsDir);
            if (dirInfo.exists) {
                await FileSystem.deleteAsync(fontsDir, { idempotent: true });
                console.log('Font cache cleared');
            }
        } catch (error) {
            console.error('Error clearing font cache:', error);
        }
    }

    static async getFontCss(font: FontType): Promise<string> {
        try {
            await this.loadFont(font); // Ensure downloaded
            
            const fontFileName = `${font.family.replace(/\s+/g, '')}.ttf`;
            const localUri = this.getFontsDir() + fontFileName;
            
            const fileContent = await FileSystem.readAsStringAsync(localUri, { encoding: 'base64' });
            
            return `
                @font-face {
                    font-family: '${font.family}';
                    src: url('data:font/ttf;base64,${fileContent}') format('truetype');
                }
            `;
        } catch (error) {
            console.error(`Error generating CSS for font ${font.family}:`, error);
            return '';
        }
    }

    static async loadAllFonts(): Promise<void> {
        // Loading all fonts at once might be heavy. 
        // We will load them on demand or letting the user pick one triggers load.
    }
}
