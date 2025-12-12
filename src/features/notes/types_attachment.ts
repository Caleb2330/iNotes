export interface Attachment {
    id: string;
    noteId: string;
    type: 'image' | 'file';
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
    createdAt: number;
}
