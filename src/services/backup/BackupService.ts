import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { dbService } from '../../core/db/database';
import { TABLE_NOTES, TABLE_FOLDERS, TABLE_ATTACHMENTS } from '../../core/db/schema';

interface BackupData {
    version: number;
    exportedAt: number;
    notes: any[];
    folders: any[];
    attachments: any[];
}

export class BackupService {
    private static readonly BACKUP_VERSION = 1;

    static async exportBackup(): Promise<void> {
        const db = await dbService.getDB();

        // Fetch all data
        const notes = await db.getAllAsync(`SELECT * FROM ${TABLE_NOTES}`);
        const folders = await db.getAllAsync(`SELECT * FROM ${TABLE_FOLDERS}`);
        const attachments = await db.getAllAsync(`SELECT * FROM ${TABLE_ATTACHMENTS}`);

        const backupData: BackupData = {
            version: this.BACKUP_VERSION,
            exportedAt: Date.now(),
            notes,
            folders,
            attachments
        };

        // Create backup file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `notes-backup-${timestamp}.json`;
        const filePath = ((FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '') + filename;

        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));

        // Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath, {
                mimeType: 'application/json',
                dialogTitle: 'Export Notes Backup'
            });
        }
    }

    static async importBackup(): Promise<boolean> {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true
        });

        if (result.canceled || !result.assets?.[0]) {
            return false;
        }

        const fileUri = result.assets[0].uri;
        const content = await FileSystem.readAsStringAsync(fileUri);
        const backupData: BackupData = JSON.parse(content);

        if (!backupData.version || !backupData.notes) {
            throw new Error('Invalid backup file format');
        }

        const db = await dbService.getDB();

        // Import folders first (notes depend on them)
        for (const folder of backupData.folders || []) {
            try {
                await db.runAsync(
                    `INSERT OR REPLACE INTO ${TABLE_FOLDERS} (id, name, color, orderIndex, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
                    [folder.id, folder.name, folder.color, folder.orderIndex, folder.createdAt, folder.updatedAt]
                );
            } catch (e) {
                console.warn('Failed to import folder:', folder.id, e);
            }
        }

        // Import notes
        for (const note of backupData.notes || []) {
            try {
                await db.runAsync(
                    `INSERT OR REPLACE INTO ${TABLE_NOTES} (id, folderId, title, bodyRichHtml, plainTextPreview, pinned, archived, isLocked, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [note.id, note.folderId, note.title, note.bodyRichHtml, note.plainTextPreview, note.pinned, note.archived, note.isLocked, note.createdAt, note.updatedAt]
                );
            } catch (e) {
                console.warn('Failed to import note:', note.id, e);
            }
        }

        // Import attachments (metadata only - actual files would need separate handling)
        for (const att of backupData.attachments || []) {
            try {
                await db.runAsync(
                    `INSERT OR REPLACE INTO ${TABLE_ATTACHMENTS} (id, noteId, type, uri, mimeType, fileSize, thumbnailUri, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [att.id, att.noteId, att.type, att.uri, att.mimeType, att.fileSize, att.thumbnailUri, att.createdAt]
                );
            } catch (e) {
                console.warn('Failed to import attachment:', att.id, e);
            }
        }

        return true;
    }
}
