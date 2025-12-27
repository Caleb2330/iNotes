import { dbService } from '../../core/db/database';
import { Note } from './types';
import { TABLE_NOTES, TABLE_ATTACHMENTS } from '../../core/db/schema';
import { FileStorageService } from '../../core/fs/FileStorageService';

export class NoteRepository {
    async getAll(): Promise<Note[]> {
        // Use wrapper for auto-retry
        const results = await dbService.getAllAsync<any>(`SELECT * FROM ${TABLE_NOTES} ORDER BY pinned DESC, updatedAt DESC`);

        return results.map(item => ({
            ...item,
            pinned: item.pinned === 1,
            archived: item.archived === 1,
            isLocked: item.isLocked === 1
        }));
    }

    async create(note: Omit<Note, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }): Promise<Note> {
        const id = note.id || Date.now().toString();
        const now = Date.now();

        const isLocked = note.isLocked || false;
        // If locked, do not store plain text preview for privacy
        const plainTextPreview = isLocked ? '' : (note.plainTextPreview ?? '');

        const newNote: Note = {
            id,
            folderId: note.folderId,
            title: note.title,
            bodyRichHtml: note.bodyRichHtml,
            plainTextPreview: plainTextPreview,
            pinned: note.pinned || false,
            archived: note.archived || false,
            isLocked: isLocked,
            fontFamily: note.fontFamily,
            createdAt: now,
            updatedAt: now,
        };

        await dbService.runAsync(
            `INSERT INTO ${TABLE_NOTES} (id, folderId, title, bodyRichHtml, plainTextPreview, pinned, archived, isLocked, fontFamily, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newNote.id,
                newNote.folderId ?? null,
                newNote.title ?? '',
                newNote.bodyRichHtml ?? '',
                newNote.plainTextPreview ?? '',
                newNote.pinned ? 1 : 0,
                newNote.archived ? 1 : 0,
                newNote.isLocked ? 1 : 0,
                newNote.fontFamily || null,
                newNote.createdAt,
                newNote.updatedAt
            ]
        );

        return newNote;
    }

    async update(id: string, note: Partial<Note>): Promise<void> {
        const updates: string[] = [];
        const values: any[] = [];

        if (note.title !== undefined) { updates.push('title = ?'); values.push(note.title); }
        if (note.bodyRichHtml !== undefined) { updates.push('bodyRichHtml = ?'); values.push(note.bodyRichHtml); }
        
        // Special handling for preview regarding lock status
        if (note.plainTextPreview !== undefined) { 
            let preview = note.plainTextPreview;
            if (note.isLocked === true) {
                preview = '';
            }
            updates.push('plainTextPreview = ?'); values.push(preview); 
        }
        
        if (note.pinned !== undefined) { updates.push('pinned = ?'); values.push(note.pinned ? 1 : 0); }
        if (note.archived !== undefined) { updates.push('archived = ?'); values.push(note.archived ? 1 : 0); }
        if (note.isLocked !== undefined) { updates.push('isLocked = ?'); values.push(note.isLocked ? 1 : 0); }
        if (note.folderId !== undefined) { updates.push('folderId = ?'); values.push(note.folderId); }
        if (note.fontFamily !== undefined) { updates.push('fontFamily = ?'); values.push(note.fontFamily); }

        updates.push('updatedAt = ?'); values.push(Date.now());

        values.push(id);

        if (updates.length > 1) { // At least one field + updatedAt
            await dbService.runAsync(`UPDATE ${TABLE_NOTES} SET ${updates.join(', ')} WHERE id = ?`, values);
        }
    }

    async delete(id: string): Promise<void> {
        // Get attachments to delete files
        try {
            const attachments = await dbService.getAllAsync<any>(`SELECT * FROM ${TABLE_ATTACHMENTS} WHERE noteId = ?`, [id]);
            for (const att of attachments) {
                if (att.uri) {
                    await FileStorageService.deleteFile(att.uri).catch(err => console.log('Error deleting file:', err));
                }
            }
        } catch (error) {
            console.log('Error fetching attachments for deletion:', error);
        }

        await dbService.runAsync(`DELETE FROM ${TABLE_NOTES} WHERE id = ?`, [id]);
    }

    async search(query: string): Promise<Note[]> {
        // Sanitize query - remove special FTS characters
        const sanitizedQuery = query.replace(/['"*()]/g, '').trim();
        
        if (!sanitizedQuery) {
            return this.getAll();
        }

        try {
            // FTS5 query with prefix matching
            const results = await dbService.getAllAsync<any>(
                `SELECT n.* FROM ${TABLE_NOTES} n
                 JOIN NotesSearch ns ON n.rowid = ns.rowid
                 WHERE NotesSearch MATCH ?
                 ORDER BY n.pinned DESC, n.updatedAt DESC`,
                [`${sanitizedQuery}*`]
            );

            return results.map(item => ({
                ...item,
                pinned: item.pinned === 1,
                archived: item.archived === 1,
                isLocked: item.isLocked === 1
            }));
        } catch (error) {
            console.error('FTS search error, falling back to LIKE search:', error);
            // Fallback to simple LIKE search if FTS fails
            const likeQuery = `%${sanitizedQuery}%`;
            const results = await dbService.getAllAsync<any>(
                `SELECT * FROM ${TABLE_NOTES} 
                 WHERE title LIKE ? OR plainTextPreview LIKE ?
                 ORDER BY pinned DESC, updatedAt DESC`,
                [likeQuery, likeQuery]
            );

            return results.map(item => ({
                ...item,
                pinned: item.pinned === 1,
                archived: item.archived === 1,
                isLocked: item.isLocked === 1
            }));
        }
    }
}
