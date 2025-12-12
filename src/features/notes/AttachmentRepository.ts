import { DatabaseService } from '../../core/db/database';
import { TABLE_ATTACHMENTS } from '../../core/db/schema';
import { Attachment } from './types_attachment';

export class AttachmentRepository {
    private dbService: DatabaseService;

    constructor() {
        this.dbService = DatabaseService.getInstance();
    }

    async create(noteId: string, type: 'image' | 'file', uri: string, name: string, mimeType?: string, size?: number): Promise<string> {
        const id = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
        const now = Date.now();

        await this.dbService.runAsync(
            `INSERT INTO ${TABLE_ATTACHMENTS} (id, noteId, type, uri, name, mimeType, fileSize, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, noteId, type, uri, name, mimeType || null, size || 0, now]
        );

        return id;
    }

    async getByNoteId(noteId: string): Promise<Attachment[]> {
        const results = await this.dbService.getAllAsync<{
            id: string;
            noteId: string;
            type: string;
            uri: string;
            name: string;
            mimeType?: string;
            fileSize?: number;
            createdAt: number;
        }>(
            `SELECT * FROM ${TABLE_ATTACHMENTS} WHERE noteId = ? ORDER BY createdAt ASC`,
            [noteId]
        );

        return results.map(row => ({
            id: row.id,
            noteId: row.noteId,
            type: row.type as 'image' | 'file',
            uri: row.uri,
            name: row.name,
            mimeType: row.mimeType,
            size: row.fileSize,
            createdAt: row.createdAt
        }));
    }

    async delete(id: string): Promise<void> {
        await this.dbService.runAsync(
            `DELETE FROM ${TABLE_ATTACHMENTS} WHERE id = ?`,
            [id]
        );
    }
}
