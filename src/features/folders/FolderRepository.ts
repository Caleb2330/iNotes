import { dbService } from '../../core/db/database';
import { Folder } from './types';
import { TABLE_FOLDERS } from '../../core/db/schema';

export class FolderRepository {
    async getAll(): Promise<Folder[]> {
        const results = await dbService.getAllAsync<Folder>(`SELECT * FROM ${TABLE_FOLDERS} ORDER BY orderIndex ASC, createdAt DESC`);
        return results;
    }

    async create(name: string, color?: string): Promise<Folder> {
        const id = Date.now().toString(); // Simple ID generation
        const now = Date.now();
        const folder: Folder = {
            id,
            name,
            color,
            orderIndex: 0,
            createdAt: now,
            updatedAt: now,
        };

        await dbService.runAsync(
            `INSERT INTO ${TABLE_FOLDERS} (id, name, color, orderIndex, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [folder.id, folder.name, folder.color || null, folder.orderIndex, folder.createdAt, folder.updatedAt]
        );

        return folder;
    }

    async update(id: string, updates: Partial<Folder>): Promise<void> {
        const now = Date.now();

        const fields: string[] = [];
        const values: any[] = [];

        Object.keys(updates).forEach(key => {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push((updates as any)[key]);
            }
        });

        if (fields.length === 0) return;

        fields.push('updatedAt = ?');
        values.push(now);
        values.push(id);

        await dbService.runAsync(
            `UPDATE ${TABLE_FOLDERS} SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
    }

    async delete(id: string): Promise<void> {
        await dbService.runAsync(`DELETE FROM ${TABLE_FOLDERS} WHERE id = ?`, [id]);
    }
}
