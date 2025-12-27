import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, TouchableOpacity, TextInput } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import { NoteCard } from '../../components/NoteCard';
import { NoteRepository } from './NoteRepository';
import { Note } from './types';
import { useNavigation, useRoute, RouteProp, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../core/theme/ThemeContext';
import { useDebounce } from '../../hooks/useDebounce';
import { BiometricService } from '../../services/auth/BiometricService';

type NoteListRouteProp = RouteProp<RootStackParamList, 'NoteList'>;

export const NoteListScreen = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<NoteListRouteProp>();
    const noteRepo = new NoteRepository();
    const { colors } = useTheme();

    const { folderId, searchQuery: initialSearchQuery } = route.params || {};
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const loadNotes = async () => {
        let fetched: Note[] = [];

        if (debouncedSearchQuery.trim().length > 0) {
            fetched = await noteRepo.search(debouncedSearchQuery);

            // Search scoping
            if (folderId === 'archived') {
                fetched = fetched.filter(n => n.archived);
            } else if (folderId === 'pinned') {
                fetched = fetched.filter(n => n.pinned && !n.archived);
            } else if (folderId) {
                fetched = fetched.filter(n => n.folderId === folderId && !n.archived);
            } else {
                // All Notes search - traditionally searches everything or just active?
                // Let's search EVERYTHING for global search, but maybe sort active first?
                // For now, let's include archived in global search results as it is useful.
            }
        } else {
            fetched = await noteRepo.getAll();

            if (folderId === 'archived') {
                fetched = fetched.filter(n => n.archived);
            } else if (folderId === 'pinned') {
                fetched = fetched.filter(n => n.pinned && !n.archived);
            } else if (folderId) {
                fetched = fetched.filter(n => n.folderId === folderId && !n.archived);
            } else {
                // All Notes (Inbox) - exclude archived
                fetched = fetched.filter(n => !n.archived);
            }
        }
        setNotes(fetched);
    };

    // Load notes when screen is focused or search/folder changes
    useFocusEffect(
        useCallback(() => {
            loadNotes();
        }, [folderId, debouncedSearchQuery])
    );

    const getScreenTitle = () => {
        if (debouncedSearchQuery.trim().length > 0) return 'Search Results';
        if (folderId === 'archived') return 'Archive';
        if (folderId === 'pinned') return 'Pinned';
        if (folderId) return 'Folder Notes';
        return 'All Notes';
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // If we can't go back (we are at root), reset to Home (Folders)
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                })
            );
        }
    };

    const handleNotePress = async (note: Note) => {
        if (note.isLocked) {
            const authenticated = await BiometricService.authenticate('Authenticate to view locked note');
            if (authenticated) {
                navigation.navigate('NoteDetail', { noteId: note.id });
            } else {
                // Authentication failed or cancelled
            }
        } else {
            navigation.navigate('NoteDetail', { noteId: note.id });
        }
    };

    return (
        <ScreenContainer style={{ padding: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
                <TouchableOpacity onPress={handleBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="chevron-back" size={28} color={colors.primary} />
                    <AppText style={{ color: colors.primary, fontSize: 17 }}>Folders</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
                    <Icon name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                <AppText size="title1" weight="bold" style={{ fontSize: 34 }}>{getScreenTitle()}</AppText>
            </View>

            {/* Search Bar */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(118, 118, 128, 0.12)',
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 8
                }}>
                    <Icon name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor={colors.textSecondary}
                        style={{ flex: 1, marginLeft: 8, fontSize: 17, color: colors.text, paddingVertical: 0 }}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={!!initialSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <AppText size="title2" weight="bold" style={{ marginBottom: 8, marginLeft: 4 }}>Notes</AppText>

                {viewMode === 'list' ? (
                    <View style={{
                        backgroundColor: colors.surface,
                        borderRadius: 10,
                        overflow: 'hidden'
                    }}>
                        <FlatList
                            data={notes}
                            keyExtractor={item => item.id}
                            scrollEnabled={true}
                            ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: colors.border, marginLeft: 16 }} />}
                            renderItem={({ item }) => (
                                <NoteCard
                                    note={item}
                                    onPress={() => handleNotePress(item)}
                                    style={{
                                        borderRadius: 0,
                                        backgroundColor: 'transparent',
                                        marginBottom: 0,
                                        shadowOpacity: 0,
                                        elevation: 0
                                    }}
                                />
                            )}
                            ListEmptyComponent={
                                <View style={{ alignItems: 'center', padding: 24 }}>
                                    <AppText secondary>No notes found</AppText>
                                </View>
                            }
                        />
                    </View>
                ) : (
                    <FlatList
                        data={notes}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        renderItem={({ item }) => (
                            <NoteCard
                                note={item}
                                onPress={() => handleNotePress(item)}
                                style={{
                                    width: '48%',
                                    marginBottom: 12,
                                }}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', padding: 24 }}>
                                <AppText secondary>No notes found</AppText>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Bottom Toolbar */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderTopWidth: 0.5,
                borderTopColor: colors.border,
                backgroundColor: colors.background
            }}>
                <View style={{ flex: 1 }} />
                <AppText size="caption" style={{ flex: 2, textAlign: 'center' }}>
                    {notes.length} Notes
                </AppText>
                <TouchableOpacity
                    style={{ flex: 1, alignItems: 'flex-end' }}
                    onPress={() => {
                        const { AdMobService } = require('../../services/ads/AdMobService');
                        AdMobService.showRewarded();
                        navigation.navigate('NoteDetail', { noteId: undefined });
                    }}
                >
                    <Icon name="create-outline" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
};
