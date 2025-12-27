export const TABLE_FOLDERS = 'Folders';
export const TABLE_NOTES = 'Notes';
export const TABLE_ATTACHMENTS = 'Attachments';
export const TABLE_SYNC_METADATA = 'SyncMetadata';

export const SCHEMA_V1 = [
    `CREATE TABLE IF NOT EXISTS ${TABLE_FOLDERS} (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    orderIndex INTEGER DEFAULT 0,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );`,

    `CREATE TABLE IF NOT EXISTS ${TABLE_NOTES} (
    id TEXT PRIMARY KEY,
    folderId TEXT,
    title TEXT,
    bodyRichHtml TEXT,
    plainTextPreview TEXT,
    pinned INTEGER DEFAULT 0,
    archived INTEGER DEFAULT 0,
    isLocked INTEGER DEFAULT 0,
    fontFamily TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY(folderId) REFERENCES ${TABLE_FOLDERS}(id) ON DELETE SET NULL
  );`,

    // Migration for existing databases to add fontFamily
    `ALTER TABLE ${TABLE_NOTES} ADD COLUMN fontFamily TEXT;`,

    `CREATE TABLE IF NOT EXISTS ${TABLE_ATTACHMENTS} (
    id TEXT PRIMARY KEY,
    noteId TEXT NOT NULL,
    type TEXT NOT NULL,
    uri TEXT NOT NULL,
    name TEXT,
    mimeType TEXT,
    fileSize INTEGER,
    thumbnailUri TEXT,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY(noteId) REFERENCES ${TABLE_NOTES}(id) ON DELETE CASCADE
  );`,

    `CREATE TABLE IF NOT EXISTS ${TABLE_SYNC_METADATA} (
    entityId TEXT PRIMARY KEY,
    entityType TEXT NOT NULL,
    lastSyncedAt INTEGER,
    remoteId TEXT,
    syncStatus TEXT DEFAULT 'DIRTY'
  );`,

    `CREATE VIRTUAL TABLE IF NOT EXISTS NotesSearch USING fts5(
    title, 
    plainTextPreview, 
    content=${TABLE_NOTES}, 
    content_rowid=rowid
  );`,

    // Triggers to keep FTS index up to date
    `CREATE TRIGGER IF NOT EXISTS Notes_ai AFTER INSERT ON ${TABLE_NOTES} BEGIN
    INSERT INTO NotesSearch(rowid, title, plainTextPreview) VALUES (new.rowid, new.title, new.plainTextPreview);
  END;`,

    `CREATE TRIGGER IF NOT EXISTS Notes_ad AFTER DELETE ON ${TABLE_NOTES} BEGIN
    INSERT INTO NotesSearch(NotesSearch, rowid, title, plainTextPreview) VALUES('delete', old.rowid, old.title, old.plainTextPreview);
  END;`,

    `CREATE TRIGGER IF NOT EXISTS Notes_au AFTER UPDATE ON ${TABLE_NOTES} BEGIN
    INSERT INTO NotesSearch(NotesSearch, rowid, title, plainTextPreview) VALUES('delete', old.rowid, old.title, old.plainTextPreview);
    INSERT INTO NotesSearch(rowid, title, plainTextPreview) VALUES (new.rowid, new.title, new.plainTextPreview);
  END;`
];
