import * as FileSystem from 'expo-file-system/legacy';

export class FileStorageService {
    // @ts-ignore
    private static readonly ATTACHMENTS_DIR = (FileSystem.documentDirectory || '') + 'attachments/';

    static async initialize() {
        const dirInfo = await FileSystem.getInfoAsync(this.ATTACHMENTS_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(this.ATTACHMENTS_DIR, { intermediates: true });
        }
    }

    static async saveFile(uri: string): Promise<string> {
        await this.initialize();
        const filename = uri.split('/').pop() || `file_${Date.now()}`;
        const newPath = this.ATTACHMENTS_DIR + filename;

        await FileSystem.copyAsync({
            from: uri,
            to: newPath
        });

        return newPath;
    }

    static async deleteFile(uri: string): Promise<void> {
        try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch (error) {
            console.warn('Failed to delete file:', uri, error);
        }
    }
}
