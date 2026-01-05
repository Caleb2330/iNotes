import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import { FolderRepository } from './FolderRepository';
import { Folder } from './types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../core/theme/ThemeContext';
import { useIOSAlert } from '../../components/modals/IOSAlert';

export const FolderListScreen = () => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [showParentPicker, setShowParentPicker] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { colors } = useTheme();
    const folderRepo = new FolderRepository();
    const { showAlert } = useIOSAlert();

    const loadFolders = async () => {
        const fetched = await folderRepo.getAll();
        setFolders(fetched);
    };

    useEffect(() => {
        loadFolders();
    }, []);

    const handleCreate = async () => {
        if (!newFolderName.trim()) {
            setIsCreating(false);
            return;
        }
        await folderRepo.create(newFolderName.trim(), undefined, selectedParentId);
        setNewFolderName('');
        setSelectedParentId(null);
        setIsCreating(false);
        loadFolders();
    };

    const handleUpdate = async () => {
        if (!newFolderName.trim() || !editingFolderId) {
            setEditingFolderId(null);
            setNewFolderName('');
            setSelectedParentId(null);
            return;
        }
        await folderRepo.update(editingFolderId, { name: newFolderName.trim(), parentId: selectedParentId });
        setEditingFolderId(null);
        setNewFolderName('');
        setSelectedParentId(null);
        loadFolders();
    };

    const startEditing = (folder: Folder) => {
        setNewFolderName(folder.name);
        setSelectedParentId(folder.parentId ?? null);
        setEditingFolderId(folder.id);
        setIsCreating(false); // Ensure we aren't in create mode
    };

    const handleDelete = (id: string) => {
        showAlert({
            title: "Delete Folder",
            message: "Are you sure? Notes in this folder will not be deleted but will appear in 'All Notes'.",
            buttons: [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await folderRepo.delete(id);
                        loadFolders();
                    }
                }
            ]
        });
    };

    const flatHierarchy = useMemo(() => {
        const map = new Map<string, Folder & { children: Folder[] }>();
        folders.forEach(f => map.set(f.id, { ...f, children: [] }));
        const roots: (Folder & { children: Folder[] })[] = [];
        map.forEach(f => {
            if (f.parentId && map.has(f.parentId)) {
                map.get(f.parentId)!.children.push(f);
            } else {
                roots.push(f);
            }
        });

        const result: (Folder & { depth: number })[] = [];
        const traverse = (node: Folder & { children: Folder[] }, depth: number) => {
            result.push({ ...node, depth });
            node.children
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(child => traverse({ ...child, children: map.get(child.id)?.children || [] } as any, depth + 1));
        };
        roots.sort((a, b) => a.name.localeCompare(b.name)).forEach(r => traverse({ ...r, children: r.children } as any, 0));
        return result;
    }, [folders]);

    const availableParents = useMemo(() => {
        if (!editingFolderId) return flatHierarchy;
        // prevent selecting self as parent
        return flatHierarchy.filter(f => f.id !== editingFolderId);
    }, [flatHierarchy, editingFolderId]);

    return (
        <ScreenContainer style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <AppText size="title1" weight="bold">Folders</AppText>
                <TouchableOpacity onPress={() => { setIsCreating(true); setEditingFolderId(null); }}>
                    <Icon name="add-circle-outline" size={32} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {(isCreating || editingFolderId) && (
                <View style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'center' }}>
                    <Icon name="folder-outline" size={24} color={colors.textSecondary} />
                    <TextInput
                        autoFocus
                        placeholder="Folder Name"
                        placeholderTextColor={colors.textSecondary}
                        style={{
                            flex: 1,
                            marginLeft: 12,
                            fontSize: 17,
                            color: colors.text,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.primary,
                            paddingVertical: 8
                        }}
                        value={newFolderName}
                        onChangeText={setNewFolderName}
                        onSubmitEditing={editingFolderId ? handleUpdate : handleCreate}
                        onBlur={editingFolderId ? handleUpdate : handleCreate}
                    />
                    <TouchableOpacity onPress={() => setShowParentPicker(true)} style={{ marginLeft: 8 }}>
                        <Icon name="chevron-down" size={22} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={flatHierarchy}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('NoteList', { folderId: item.id })}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 12,
                            borderBottomWidth: 0.5,
                            borderBottomColor: colors.border
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: (item as any).depth * 12 }}>
                                <Icon name="folder" size={22} color={colors.primary} />
                                <AppText style={{ marginLeft: 10, fontSize: 16 }}>{item.name}</AppText>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity style={{ padding: 4 }} onPress={(e) => { e.stopPropagation(); startEditing(item); }}>
                                    <Icon name="pencil-outline" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={{ padding: 4 }} onPress={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                                    <Icon name="trash-outline" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={!isCreating && !editingFolderId ? <AppText secondary>No folders yet.</AppText> : null}
            />

            {/* Parent picker modal */}
            <Modal visible={showParentPicker} transparent animationType="fade" onRequestClose={() => setShowParentPicker(false)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setShowParentPicker(false)}>
                    <View style={{ marginTop: 100, marginHorizontal: 24, backgroundColor: colors.surface, borderRadius: 10, maxHeight: 400, padding: 12 }}>
                        <AppText size="title3" weight="bold" style={{ marginBottom: 8 }}>Choose Parent Folder</AppText>
                        <ScrollView>
                            <TouchableOpacity
                                style={{ paddingVertical: 10 }}
                                onPress={() => { setSelectedParentId(null); setShowParentPicker(false); }}>
                                <AppText>(No parent)</AppText>
                            </TouchableOpacity>
                            {availableParents.map(f => (
                                <TouchableOpacity
                                    key={f.id}
                                    style={{ paddingVertical: 10, paddingLeft: 12 + (f.depth || 0) * 12, flexDirection: 'row', alignItems: 'center' }}
                                    onPress={() => { setSelectedParentId(f.id); setShowParentPicker(false); }}>
                                    <Icon name="folder" size={18} color={colors.primary} />
                                    <AppText style={{ marginLeft: 8 }}>{f.name}</AppText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </ScreenContainer>
    );
};
