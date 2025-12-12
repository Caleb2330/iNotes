import React from 'react';
import { View, Modal, TouchableOpacity, Image, Dimensions, StyleSheet, StatusBar } from 'react-native';
import { Icon } from '../common/Icon';
import { useTheme } from '../../core/theme/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerModalProps {
    visible: boolean;
    imageUri: string;
    onClose: () => void;
    onDelete?: () => void;
    onShare?: () => void;
    onSave?: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
    visible,
    imageUri,
    onClose,
    onDelete,
    onShare,
    onSave
}) => {
    const { colors } = useTheme();

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <StatusBar hidden />
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <View style={styles.closeButtonBackground}>
                        <Icon name="close" size={28} color="#fff" />
                    </View>
                </TouchableOpacity>

                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.bottomBar}>
                    {onShare && (
                        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                            <Icon name="share-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onSave && (
                        <TouchableOpacity style={styles.actionButton} onPress={onSave}>
                            <Icon name="download-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                            <Icon name="trash-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    closeButtonBackground: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    actionButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        padding: 12,
        marginHorizontal: 16,
    },
});
