import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import { useTheme } from '../../core/theme/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { FolderRepository } from '../folders/FolderRepository';
import { NoteRepository } from '../notes/NoteRepository';
import { Folder } from '../folders/types';
import { TextInputModal } from '../../components/modals/TextInputModal';
import { AdMobService } from '../../services/ads/AdMobService';

interface FolderWithCount extends Folder {
    noteCount: number;
}

export const HomeScreen = () => {
    const [folders, setFolders] = useState<FolderWithCount[]>([]);
    const [totalNotes, setTotalNotes] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { colors, toggleTheme } = useTheme();
    const folderRepo = new FolderRepository();
    const noteRepo = new NoteRepository();

    const [pinnedCount, setPinnedCount] = useState(0);
    const [archivedCount, setArchivedCount] = useState(0);

    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const loadData = async () => {
        const allFolders = await folderRepo.getAll();
        const allNotes = await noteRepo.getAll();

        // Active notes are those not archived
        const activeNotes = allNotes.filter(n => !n.archived);
        const archivedNotes = allNotes.filter(n => n.archived);

        // Count notes per folder (only active notes)
        const foldersWithCount: FolderWithCount[] = allFolders.map(f => ({
            ...f,
            noteCount: activeNotes.filter(n => n.folderId === f.id).length
        }));

        setFolders(foldersWithCount);
        setTotalNotes(activeNotes.length);
        setPinnedCount(activeNotes.filter(n => n.pinned).length);
        setArchivedCount(archivedNotes.length);
    };

    const handleCreateFolder = async (name?: string) => {
        const folderName = name || newFolderName;
        if (!folderName.trim()) return;
        
        await folderRepo.create(folderName.trim());
        setNewFolderName('');
        setShowCreateFolderModal(false);
        loadData();
    };

    useEffect(() => {
        // Show interstitial ad when component first mounts (after onboarding)
        setTimeout(() => {
            AdMobService.showInterstitial().catch(console.error);
        }, 1000);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
            // Show interstitial ad when user returns to home screen
            // Add a small delay to ensure the screen is fully loaded
            setTimeout(() => {
                AdMobService.showInterstitial().catch(console.error);
            }, 500);
        }, [])
    );

    const SmartFolder: React.FC<{
        icon: string;
        iconColor: string;
        iconBg: string;
        title: string;
        count: number;
        onPress: () => void;
    }> = ({ icon, iconColor, iconBg, title, count, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                margin: 4,
                minWidth: '45%'
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: iconBg,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon name={icon} size={20} color={iconColor} />
                </View>
                <AppText size="title1" weight="bold">{count}</AppText>
            </View>
            <AppText size="body" weight="medium" style={{ marginTop: 8 }}>{title}</AppText>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                paddingHorizontal: 16,
                paddingTop: 8
            }}>
                <TouchableOpacity
                    style={{ padding: 8 }}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Icon name="settings-outline" size={26} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <AppText size="title1" weight="bold" style={{ fontSize: 34 }}>Folders</AppText>
            </View>

            {/* Search Bar */}
            <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(118, 118, 128, 0.12)',
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 8
                    }}
                >
                    <Icon name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor={colors.textSecondary}
                        style={{ flex: 1, marginLeft: 8, fontSize: 17, color: colors.text }}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        onSubmitEditing={() => {
                            if (searchQuery.trim()) {
                                navigation.navigate('NoteList', { searchQuery: searchQuery.trim() });
                            }
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Smart Folders Grid */}
            <View style={{ paddingHorizontal: 12, marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    <SmartFolder
                        icon="document-text"
                        iconColor="#FFFFFF"
                        iconBg={colors.primary}
                        title="All Notes"
                        count={totalNotes}
                        onPress={() => navigation.navigate('NoteList', { folderId: undefined })}
                    />
                    <SmartFolder
                        icon="pin"
                        iconColor="#FFFFFF"
                        iconBg="#FF9500"
                        title="Pinned"
                        count={pinnedCount}
                        onPress={() => navigation.navigate('NoteList', { folderId: 'pinned' })}
                    />
                    <SmartFolder
                        icon="archive-outline"
                        iconColor="#FFFFFF"
                        iconBg="#34C759"
                        title="Archive"
                        count={archivedCount}
                        onPress={() => navigation.navigate('NoteList', { folderId: 'archived' })}
                    />
                </View>
            </View>

            {/* Folders Section Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                marginBottom: 12
            }}>
                <AppText size="title3" weight="bold">My Folders</AppText>
                <TouchableOpacity onPress={() => navigation.navigate('FolderList')}>
                    <AppText style={{ color: colors.primary }}>Edit</AppText>
                </TouchableOpacity>
            </View>

            {/* Folders List */}
            <View style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                marginHorizontal: 16,
                overflow: 'hidden'
            }}>
                <FlatList
                    data={folders}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 0.5, backgroundColor: colors.border, marginLeft: 56 }} />
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('NoteList', { folderId: item.id })}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                paddingHorizontal: 16
                            }}
                        >
                            <Icon name="folder" size={24} color={colors.primary} />
                            <AppText style={{ flex: 1, marginLeft: 12, fontSize: 17 }}>{item.name}</AppText>
                            <AppText secondary style={{ marginRight: 8 }}>{item.noteCount}</AppText>
                            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <AppText secondary>No folders yet</AppText>
                        </View>
                    }
                />
            </View>

            {/* Bottom Create Folder FAB */}
            <View style={{
                position: 'absolute',
                bottom: 80, // Increased to avoid navigation bar overlap
                right: 24
            }}>
                <TouchableOpacity
                    onPress={() => setShowCreateFolderModal(true)}
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 8
                    }}
                >
                    <Icon name="folder-open-outline" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Create Folder Modal */}
            <TextInputModal
                visible={showCreateFolderModal}
                title="New Folder"
                placeholder="Folder Name"
                initialValue={newFolderName}
                submitButtonText="Create"
                onClose={() => {
                    setShowCreateFolderModal(false);
                    setNewFolderName('');
                }}
                onSubmit={(name) => handleCreateFolder(name)}
            />
        </ScreenContainer>
    );
};
