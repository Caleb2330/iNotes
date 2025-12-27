import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, TouchableOpacity } from 'react-native';
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
        await folderRepo.create(newFolderName.trim());
        setNewFolderName('');
        setIsCreating(false);
        loadFolders();
    };

    const handleUpdate = async () => {
        if (!newFolderName.trim() || !editingFolderId) {
            setEditingFolderId(null);
            setNewFolderName('');
            return;
        }
        await folderRepo.update(editingFolderId, { name: newFolderName.trim() });
        setEditingFolderId(null);
        setNewFolderName('');
        loadFolders();
    };

    const startEditing = (folder: Folder) => {
        setNewFolderName(folder.name);
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

    return (
        <ScreenContainer style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <AppText size="title1" weight="bold">Folders</AppText>
                <TouchableOpacity onPress={() => setIsCreating(true)}>
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
                </View>
            )}

            <FlatList
                data={folders}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('NoteList', { folderId: item.id })}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            backgroundColor: colors.surface,
                            borderRadius: 12,
                            marginTop: 8,
                            marginHorizontal: 4,
                            // iOS Shadow
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            // Android Shadow
                            elevation: 2,
                        }}>
                            <Icon name="folder" size={28} color={colors.primary} />
                            <AppText style={{ flex: 1, marginLeft: 16, fontSize: 17, fontWeight: '500' }}>{item.name}</AppText>
                            <TouchableOpacity style={{ padding: 4, marginRight: 8 }} onPress={(e) => { e.stopPropagation(); startEditing(item); }}>
                                <Icon name="pencil-outline" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ padding: 4 }} onPress={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                                <Icon name="trash-outline" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={!isCreating && !editingFolderId ? <AppText secondary>No folders yet.</AppText> : null}
            />
        </ScreenContainer>
    );
};
