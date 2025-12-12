import * as SQLite from 'expo-sqlite';
import { SCHEMA_V1 } from './schema';

const DB_NAME = 'InoteClone.db';

export class DatabaseService {
    private static instance: DatabaseService;
    private db: SQLite.SQLiteDatabase | null = null;
    private isInitializing: boolean = false;
    private initPromise: Promise<void> | null = null;

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async getDB(): Promise<SQLite.SQLiteDatabase> {
        // If already initializing, wait for it
        if (this.initPromise) {
            await this.initPromise;
        }

        if (this.db) {
            // Verify database is still healthy
            try {
                await this.db.runAsync('SELECT 1');
                return this.db;
            } catch (error) {
                console.warn('Database health check failed, reinitializing...', error);
                this.db = null;
            }
        }

        await this.init();
        if (!this.db) throw new Error('Database initialization failed');
        return this.db;
    }

    public async init(): Promise<void> {
        // Prevent concurrent initialization
        if (this.isInitializing) {
            if (this.initPromise) {
                return this.initPromise;
            }
            return;
        }

        this.isInitializing = true;
        this.initPromise = this.doInit();
        
        try {
            await this.initPromise;
        } finally {
            this.isInitializing = false;
            this.initPromise = null;
        }
    }

    private async doInit(): Promise<void> {
        try {
            this.db = await SQLite.openDatabaseAsync(DB_NAME);
            await this.runMigrations();
        } catch (error: any) {
            console.error('Failed to open database', error);
            
            const errorMsg = error?.message || '';
            if (errorMsg.includes('malformed') || errorMsg.includes('corrupt') || errorMsg.includes('NullPointer')) {
                console.warn('Database issue detected, attempting recovery...');
                await this.recoverFromCorruption();
            } else {
                throw error;
            }
        }
    }

    private async recoverFromCorruption(): Promise<void> {
        try {
            // Close existing connection properly before deletion
            if (this.db) {
                try {
                    await this.db.closeAsync();
                } catch (closeError) {
                    console.warn('Error closing database:', closeError);
                }
                this.db = null;
            }
            
            // Delay to ensure file handle is released
            await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
            
            // Delete the corrupted database
            try {
                await SQLite.deleteDatabaseAsync(DB_NAME);
                console.log('Corrupted database deleted');
            } catch (deleteError) {
                console.warn('Could not delete database:', deleteError);
            }
            
            // Another delay before reopening
            await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
            
            // Reinitialize with fresh database
            this.db = await SQLite.openDatabaseAsync(DB_NAME);
            await this.runMigrations();
            console.log('Database recovered with fresh instance');
        } catch (recoveryError) {
            console.error('Database recovery failed', recoveryError);
            throw recoveryError;
        }
    }

    private async runMigrations(): Promise<void> {
        if (!this.db) {
            console.warn('Cannot run migrations: database is null');
            return;
        }

        for (const statement of SCHEMA_V1) {
            try {
                if (this.db) {
                    await this.db.runAsync(statement);
                }
            } catch (error: any) {
                // Only log if it's not a "table already exists" type error
                const msg = error?.message || '';
                if (!msg.includes('already exists') && !msg.includes('duplicate')) {
                    console.warn(`Migration warning: ${statement.substring(0, 50)}...`, error?.message);
                }
            }
        }
    }

    public async close(): Promise<void> {
        if (this.db) {
            try {
                await this.db.closeAsync();
            } catch (e) {
                console.warn('Error closing database:', e);
            }
            this.db = null;
        }
    }

    public invalidate(): void {
        this.db = null;
    }

    public async runAsync(sql: string, params: any[] = []): Promise<SQLite.SQLiteRunResult> {
        return this.executeWithRetry(async (db) => await db.runAsync(sql, params));
    }

    public async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        return this.executeWithRetry(async (db) => await db.getAllAsync<T>(sql, params));
    }

    private async executeWithRetry<T>(operation: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
        try {
            const db = await this.getDB();
            return await operation(db);
        } catch (error: any) {
            const msg = error?.message || '';
            if (msg.includes('NullPointer') || msg.includes('prepareAsync') || msg.includes('closed') || msg.includes('malformed') || msg.includes('corrupt')) {
                console.warn('Database error detected during operation, retrying...', msg);
                
                this.invalidate();
                
                // If it looks like corruption, try to recover fully
                if (msg.includes('malformed') || msg.includes('corrupt')) {
                    await this.recoverFromCorruption();
                }

                // Retry once
                const db = await this.getDB();
                return await operation(db);
            }
            throw error;
        }
    }
}

export const dbService = DatabaseService.getInstance();
