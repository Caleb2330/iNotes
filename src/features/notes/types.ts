export interface Note {
    id: string;
    folderId?: string | null;
    title?: string;
    bodyRichHtml?: string;
    plainTextPreview?: string;
    pinned: boolean; // boolean stored as 0/1 in SQLite
    archived: boolean;
    isLocked: boolean;
    fontFamily?: string;
    createdAt: number;
    updatedAt: number;
}
