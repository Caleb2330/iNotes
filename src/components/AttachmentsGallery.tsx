import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { AppText } from './common/AppText';
import { useTheme } from '../core/theme/ThemeContext';
import { Attachment } from '../features/notes/types_attachment';
import { ImageViewerModal } from './modals/ImageViewerModal';
import { ShareService } from '../services/share/ShareService';

interface AttachmentsGalleryProps {
    attachments: Attachment[];
    onDeleteAttachment?: (id: string) => void;
}

export const AttachmentsGallery: React.FC<AttachmentsGalleryProps> = ({
    attachments,
    onDeleteAttachment
}) => {
    const { colors } = useTheme();
    const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

    const imageAttachments = attachments.filter(a => a.type === 'image');

    if (imageAttachments.length === 0) {
        return null;
    }

    const handleShare = async () => {
        if (selectedAttachment) {
            try {
                await ShareService.shareFile(selectedAttachment.uri);
            } catch (error) {
                console.error('Share failed', error);
            }
        }
    };

    const handleDelete = () => {
        if (selectedAttachment && onDeleteAttachment) {
            // Close modal first to avoid modal stacking issues with the alert
            const idToDelete = selectedAttachment.id;
            setSelectedAttachment(null);
            // Small delay to allow modal to close smoothly
            setTimeout(() => {
                onDeleteAttachment(idToDelete);
            }, 300);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <AppText size="caption" style={{ color: colors.textSecondary }}>
                    Attachments ({imageAttachments.length})
                </AppText>
            </View>
            
            <View style={{ height: 90 }}>
                <ScrollView 
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    style={{ flex: 1 }}
                >
                    {imageAttachments.map((attachment) => (
                        <TouchableOpacity
                            key={attachment.id}
                            style={[styles.thumbnailContainer, { borderColor: colors.border }]}
                            onPress={() => setSelectedAttachment(attachment)}
                            onLongPress={() => onDeleteAttachment?.(attachment.id)}
                        >
                            <Image
                                source={{ uri: attachment.uri }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ImageViewerModal
                visible={selectedAttachment !== null}
                imageUri={selectedAttachment?.uri || ''}
                onClose={() => setSelectedAttachment(null)}
                onShare={handleShare}
                onDelete={onDeleteAttachment ? handleDelete : undefined}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
    },
    headerContainer: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
    thumbnailContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 8,
        borderWidth: 1,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
});
