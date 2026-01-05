export interface Folder {
    id: string;
    name: string;
    color?: string;
    parentId?: string | null;
    orderIndex: number;
    createdAt: number;
    updatedAt: number;
}
