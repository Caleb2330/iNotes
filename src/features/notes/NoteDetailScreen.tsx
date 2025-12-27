import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppText } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { NoteRepository } from './NoteRepository';
import { FolderRepository } from '../folders/FolderRepository';
import { Folder } from '../folders/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../core/theme/ThemeContext';
// @ts-ignore
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { Icon } from '../../components/common/Icon';
import * as ImagePicker from 'expo-image-picker';
import { AttachmentRepository } from './AttachmentRepository';
import { FileStorageService } from '../../core/fs/FileStorageService';
import { formatFullDate } from '../../utils/dateUtils';
import { FontPickerModal } from '../../components/modals/FontPickerModal';
import { FontManagerService } from '../../services/font-manager/FontManagerService';
import { Font, AVAILABLE_FONTS } from '../../services/font-manager/types';
import { AttachmentsGallery } from '../../components/AttachmentsGallery';
import { Attachment } from './types_attachment';
import { RichTextToolbar } from '../../components/RichTextToolbar';
import { ShareService } from '../../services/share/ShareService';
import { useIOSAlert } from '../../components/modals/IOSAlert';
import { LinkInputModal } from '../../components/modals/LinkInputModal';

type NoteDetailRouteProp = RouteProp<RootStackParamList, 'NoteDetail'>;

export const NoteDetailScreen = () => {
    const route = useRoute<NoteDetailRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { noteId } = route.params || {};
    const { colors } = useTheme();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [currentFont, setCurrentFont] = useState('System');
    const [noteCreatedAt, setNoteCreatedAt] = useState<number>(Date.now());
    const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
    const pendingAttachmentsRef = useRef<Attachment[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const { showAlert } = useIOSAlert();
    const isSavingRef = useRef(false);
    const isDeletingRef = useRef(false);

    const richText = useRef<RichEditor>(null);
    const noteRepo = new NoteRepository();
    const folderRepo = new FolderRepository();
    const attachmentRepo = new AttachmentRepository();

    // Keep ref in sync with state
    useEffect(() => {
        pendingAttachmentsRef.current = pendingAttachments;
    }, [pendingAttachments]);

    useEffect(() => {
        loadFolders();
        if (noteId) {
            loadNote(noteId);
            loadAttachments(noteId);
        }
    }, [noteId]);

    const loadAttachments = async (id: string) => {
        const fetched = await attachmentRepo.getByNoteId(id);
        setAttachments(fetched);
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        showAlert({
            title: 'Delete Attachment',
            message: 'Are you sure you want to delete this attachment?',
            buttons: [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (attachmentId.startsWith('pending-')) {
                            setPendingAttachments(prev => prev.filter(a => a.id !== attachmentId));
                        } else {
                            await attachmentRepo.delete(attachmentId);
                            setAttachments(prev => prev.filter(a => a.id !== attachmentId));
                        }
                    }
                }
            ]
        });
    };

    const loadNote = async (id: string) => {
        const allNotes = await noteRepo.getAll();
        const note = allNotes.find(n => n.id === id);
        if (note) {
            setTitle(note.title || '');
            setBody(note.bodyRichHtml || '');
            setSelectedFolderId(note.folderId || null);
            setIsPinned(note.pinned);
            setIsArchived(note.archived);
            setIsLocked(note.isLocked);
            setNoteCreatedAt(note.createdAt);

            if (note.fontFamily) {
                setCurrentFont(note.fontFamily);
            }

            setTimeout(async () => {
                richText.current?.setContentHTML(note.bodyRichHtml || '');

                // Restore saved font
                if (note.fontFamily && note.fontFamily !== 'System') {
                    const font = AVAILABLE_FONTS.find(f => f.family === note.fontFamily);
                    if (font) {
                        try {
                            const css = await FontManagerService.getFontCss(font);
                            if (css) {
                                const escapedCss = css.replace(/'/g, "\\'").replace(/\n/g, ' ');
                                richText.current?.injectJavascript(`
                                    (function() {
                                        var style = document.getElementById('custom-font-style');
                                        if (!style) {
                                            style = document.createElement('style');
                                            style.id = 'custom-font-style';
                                            document.head.appendChild(style);
                                        }
                                        style.textContent = '${escapedCss}';
                                        document.body.style.fontFamily = "${font.family}";
                                        document.querySelectorAll('*').forEach(function(el) {
                                            el.style.fontFamily = "${font.family}";
                                        });
                                    })();
                                `);
                            }
                        } catch (e) {
                            console.error('Error restoring font:', e);
                        }
                    }
                }
            }, 500);
        }
    };

    const loadFolders = async () => {
        const fetched = await folderRepo.getAll();
        setFolders(fetched);
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
            if (isSavingRef.current || isDeletingRef.current) {
                return;
            }

            const hasContent = title.trim().length > 0 || body.trim().length > 0 || pendingAttachmentsRef.current.length > 0;

            if (!hasContent && !noteId) {
                return;
            }

            // Prevent default behavior of leaving the screen
            e.preventDefault();

            // Save asynchronously
            await handleSave(true);

            // Manually dispatch the action to continue navigation
            // We set isSavingRef to true to prevent the listener from blocking again
            isSavingRef.current = true;
            navigation.dispatch(e.data.action);
        });

        return unsubscribe;
    }, [navigation, title, body, isPinned, isArchived, isLocked, selectedFolderId, noteId, currentFont]);

    const handleSave = async (silent: boolean = false): Promise<boolean> => {
        isSavingRef.current = true;
        try {
            // Use body state directly instead of async WebView query
            // This ensures we can save even if the component is unmounting
            const html = body;
            const plainText = html.replace(/<[^>]+>/g, '');

            const noteData = {
                title,
                bodyRichHtml: html || '',
                plainTextPreview: plainText.substring(0, 100),
                pinned: isPinned,
                archived: isArchived,
                isLocked: isLocked,
                folderId: selectedFolderId || null,
                fontFamily: currentFont
            };

            let targetNoteId = noteId;

            // Use ref to ensure we have the latest pending attachments during navigation
            const currentPending = pendingAttachmentsRef.current;
            const hasContent = noteData.title || noteData.plainTextPreview;
            const hasAttachments = currentPending.length > 0;

            if (noteId) {
                await noteRepo.update(noteId, noteData);
            } else {
                if (hasContent || hasAttachments) {
                    // Create default title if empty but has attachments
                    if (!noteData.title && hasAttachments) {
                        noteData.title = "Image Note";
                    }
                    const newNote = await noteRepo.create(noteData);
                    targetNoteId = newNote.id;
                }
            }

            if (targetNoteId && currentPending.length > 0) {
                for (const att of currentPending) {
                    await attachmentRepo.create(targetNoteId, att.type, att.uri, att.name || 'Image');
                }
                setPendingAttachments([]);
                pendingAttachmentsRef.current = [];
            }

            if (!silent) {
                navigation.goBack();
            }
            return true;
        } catch (error) {
            console.error("Auto-save failed", error);
            if (!silent) {
                showAlert({ title: 'Error', message: 'Failed to save note.' });
            }
            return false;
        } finally {
            isSavingRef.current = false;
        }
    };

    const handleDelete = async () => {
        if (!noteId) return;
        showAlert({
            title: "Delete Note",
            message: "Are you sure you want to delete this note?",
            buttons: [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        isDeletingRef.current = true;
                        await noteRepo.delete(noteId);
                        navigation.goBack();
                    }
                }
            ]
        });
    };

    const handleShare = () => {
        const plainText = body.replace(/<[^>]+>/g, '');
        showAlert({
            title: 'Share Note',
            message: 'Choose how to share',
            buttons: [
                { text: 'Share as Text', onPress: () => ShareService.shareText(title, plainText), style: 'default' },
                { text: 'Share as HTML File', onPress: () => ShareService.shareAsHtmlFile(title, body), style: 'default' },
                { text: 'Share as Text File', onPress: () => ShareService.shareAsTextFile(title, plainText), style: 'default' },
                { text: 'Cancel', style: 'cancel' }
            ]
        });
    };

    const handleAttachmentOptions = () => {
        showAlert({
            title: 'Add Attachment',
            message: 'Choose an option',
            buttons: [
                { text: 'Take Photo', onPress: handleTakePhoto, style: 'default' },
                { text: 'Choose from Library', onPress: handlePickImage, style: 'default' },
                { text: 'Cancel', style: 'cancel' }
            ]
        });
    };

    const processImageResult = async (result: ImagePicker.ImagePickerResult) => {
        if (!result.canceled && result.assets[0].uri) {
            setIsUploading(true);
            try {
                const uri = result.assets[0].uri;
                const savedPath = await FileStorageService.saveFile(uri);

                const newAttachment: Attachment = {
                    id: noteId ? '' : `pending-${Date.now()}`,
                    noteId: noteId || '',
                    type: 'image',
                    uri: savedPath,
                    name: 'Image',
                    createdAt: Date.now()
                };

                if (noteId) {
                    const newId = await attachmentRepo.create(noteId, 'image', savedPath, 'Image');
                    newAttachment.id = newId;
                    setAttachments(prev => [...prev, newAttachment]);
                } else {
                    setPendingAttachments(prev => [...prev, newAttachment]);
                }
            } catch (error) {
                console.error('Error uploading attachment:', error);
                showAlert({ title: 'Error', message: 'Failed to upload attachment.' });
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                showAlert({ title: 'Permission Required', message: 'We need camera permissions to take photos!' });
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            await processImageResult(result);
        } catch (error) {
            console.error('Camera error', error);
            setIsUploading(false);
        }
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showAlert({ title: 'Permission Required', message: 'We need camera roll permissions to add images!' });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            await processImageResult(result);
        } catch (error) {
            console.error('Image picker error', error);
            setIsUploading(false);
        }
    };

    const handleInsertLink = (url: string, title?: string) => {
        if (title) {
            richText.current?.insertLink(title, url);
        } else {
            richText.current?.insertLink(url, url);
        }
    };

    const handleSelectFont = async (font: Font) => {
        try {
            // For the rich editor, we inject CSS and set font via JavaScript
            const css = await FontManagerService.getFontCss(font);

            if (css) {
                // Inject the @font-face CSS and apply the font family
                const escapedCss = css.replace(/'/g, "\\'").replace(/\n/g, ' ');
                richText.current?.injectJavascript(`
                    (function() {
                        var style = document.getElementById('custom-font-style');
                        if (!style) {
                            style = document.createElement('style');
                            style.id = 'custom-font-style';
                            document.head.appendChild(style);
                        }
                        style.textContent = '${escapedCss}';
                        document.body.style.fontFamily = "${font.family}";
                        document.querySelectorAll('*').forEach(function(el) {
                            el.style.fontFamily = "${font.family}";
                        });
                    })();
                `);
                setCurrentFont(font.family);
            }
        } catch (error) {
            console.error('Error applying font:', error);
            showAlert({ title: 'Error', message: 'Failed to apply font.' });
        }
    };

    const allAttachments = [...attachments, ...pendingAttachments];

    return (
        <ScreenContainer style={{ flex: 1 }}>
            <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Icon name="chevron-back" size={28} color={colors.primary} />
                        <AppText style={{ color: colors.primary, fontSize: 17 }}>Folders</AppText>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={{ marginLeft: 16 }} onPress={handleDelete}>
                            <Icon name="trash-outline" size={24} color={colors.error} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 16 }} onPress={handleShare}>
                            <Icon name="share-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => setShowOptionsModal(true)}>
                            <Icon name="ellipsis-horizontal-circle" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <AppText size="caption" style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 16 }}>
                    {formatFullDate(noteCreatedAt)}
                </AppText>

                <TextInput
                    placeholder="Title"
                    placeholderTextColor={colors.textSecondary}
                    style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8, marginTop: 8 }}
                    value={title}
                    onChangeText={setTitle}
                />
            </View>

            <ScrollView style={{ flex: 1 }}>
                <RichEditor
                    ref={richText}
                    onChange={setBody}
                    placeholder="Start typing..."
                    initialContentHTML={body}
                    editorStyle={{
                        backgroundColor: colors.background,
                        color: colors.text,
                        placeholderColor: colors.textSecondary,
                        contentCSSText: `font-family: ${currentFont}; font-size: 17px; color: ${colors.text};`,
                    }}
                    style={{ flex: 1, minHeight: 400 }}
                />

                {/* Attachments Gallery */}
                {(allAttachments.length > 0 || isUploading) && (
                    <View style={{ marginBottom: 20 }}>
                        {isUploading && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 }}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <AppText style={{ marginLeft: 8, color: colors.textSecondary }}>Uploading...</AppText>
                            </View>
                        )}
                        <AttachmentsGallery
                            attachments={allAttachments}
                            onDeleteAttachment={handleDeleteAttachment}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Formatting Toolbar */}
            {showFormattingToolbar && (
                <RichTextToolbar
                    editor={richText.current}
                    onSelectFont={() => setShowFontPicker(true)}
                    onInsertLink={() => setShowLinkModal(true)}
                />
            )}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 16,
                    borderTopWidth: 0.5,
                    borderTopColor: colors.border,
                    backgroundColor: colors.background
                }}>
                    <TouchableOpacity onPress={() => richText.current?.sendAction(actions.checkboxList, 'result')}>
                        <Icon name="checkbox-outline" size={26} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAttachmentOptions}>
                        <Icon name="camera-outline" size={26} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowFormattingToolbar(!showFormattingToolbar)}>
                        <Icon name="options-outline" size={26} color={showFormattingToolbar ? colors.primary : colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowFontPicker(true)}>
                        <Icon name="text" size={26} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        const { AdMobService } = require('../../services/ads/AdMobService');
                        AdMobService.showRewarded();
                        handleSave().then(() => {
                            navigation.push('NoteDetail', { noteId: undefined });
                        });
                    }}>
                        <Icon name="create-outline" size={26} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <Modal visible={showFolderModal} animationType="slide" transparent>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: colors.background, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '50%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                            <AppText size="title2" weight="bold">Select Folder</AppText>
                            <Button title="Close" variant="ghost" onPress={() => setShowFolderModal(false)} />
                        </View>
                        <FlatList
                            data={[{ id: 'null', name: 'Uncategorized' } as any, ...folders]}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{ paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border }}
                                    onPress={() => {
                                        setSelectedFolderId(item.id === 'null' ? null : item.id);
                                        setShowFolderModal(false);
                                    }}
                                >
                                    <AppText style={{ color: item.id === (selectedFolderId || 'null') ? colors.primary : colors.text }}>
                                        {item.name}
                                    </AppText>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <FontPickerModal
                visible={showFontPicker}
                onClose={() => setShowFontPicker(false)}
                onSelectFont={handleSelectFont}
                currentFontFamily={currentFont}
            />

            <LinkInputModal
                visible={showLinkModal}
                onClose={() => setShowLinkModal(false)}
                onSubmit={handleInsertLink}
            />

            <Modal visible={showOptionsModal} animationType="slide" transparent>
                <TouchableOpacity
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    activeOpacity={1}
                    onPress={() => setShowOptionsModal(false)}
                >
                    <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 32 }}>
                        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                            <View style={{ width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2 }} />
                        </View>

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
                            onPress={() => {
                                setIsPinned(!isPinned);
                                setShowOptionsModal(false);
                            }}
                        >
                            <Icon name={isPinned ? 'pin' : 'pin-outline'} size={24} color={colors.primary} />
                            <AppText style={{ marginLeft: 12, fontSize: 17 }}>
                                {isPinned ? 'Unpin Note' : 'Pin Note'}
                            </AppText>
                        </TouchableOpacity>

                        <View style={{ height: 0.5, backgroundColor: colors.border, marginLeft: 52 }} />

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
                            onPress={() => {
                                setIsArchived(!isArchived);
                                setShowOptionsModal(false);
                            }}
                        >
                            <Icon name={isArchived ? 'arrow-undo-outline' : 'archive-outline'} size={24} color={colors.primary} />
                            <AppText style={{ marginLeft: 12, fontSize: 17 }}>
                                {isArchived ? 'Unarchive Note' : 'Archive Note'}
                            </AppText>
                        </TouchableOpacity>

                        <View style={{ height: 0.5, backgroundColor: colors.border, marginLeft: 52 }} />

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
                            onPress={() => {
                                setIsLocked(!isLocked);
                                setShowOptionsModal(false);
                            }}
                        >
                            <Icon name={isLocked ? 'lock-open-outline' : 'lock-closed-outline'} size={24} color={colors.primary} />
                            <AppText style={{ marginLeft: 12, fontSize: 17 }}>
                                {isLocked ? 'Unlock Note' : 'Lock Note'}
                            </AppText>
                        </TouchableOpacity>

                        <View style={{ height: 0.5, backgroundColor: colors.border, marginLeft: 52 }} />

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
                            onPress={() => {
                                setShowOptionsModal(false);
                                setShowFolderModal(true);
                            }}
                        >
                            <Icon name="folder-outline" size={24} color={colors.primary} />
                            <AppText style={{ marginLeft: 12, fontSize: 17 }}>Move to Folder</AppText>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScreenContainer>
    );
};
