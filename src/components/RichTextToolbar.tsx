import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { Icon } from './common/Icon';
import { AppText } from './common/AppText';
import { useTheme } from '../core/theme/ThemeContext';
// @ts-ignore
import { actions } from 'react-native-pell-rich-editor';

interface RichTextToolbarProps {
    editor: any;
    onSelectFont?: () => void;
    onInsertLink?: () => void;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
    editor,
    onSelectFont,
    onInsertLink
}) => {
    const { colors } = useTheme();
    const [showHeadingPicker, setShowHeadingPicker] = useState(false);

    const sendAction = (action: string, data?: string) => {
        editor?.sendAction(action, 'result', data);
    };

    const toolbarItems = [
        { icon: 'logo-html5', action: actions.setBold, label: 'B', isText: true },
        { icon: 'logo-html5', action: actions.setItalic, label: 'I', isText: true },
        { icon: 'logo-html5', action: actions.setUnderline, label: 'U', isText: true },
        { icon: 'logo-html5', action: actions.setStrikethrough, label: 'S', isText: true },
    ];

    const listItems = [
        { icon: 'list-outline', action: actions.insertBulletsList, label: 'Bullet List' },
        { icon: 'reorder-four-outline', action: actions.insertOrderedList, label: 'Numbered List' },
        { icon: 'checkbox-outline', action: actions.checkboxList, label: 'Checklist' },
    ];

    const alignItems = [
        { icon: 'menu-outline', action: actions.alignLeft, label: 'Align Left' },
        { icon: 'reorder-three-outline', action: actions.alignCenter, label: 'Align Center' },
        { icon: 'menu-outline', action: actions.alignRight, label: 'Align Right' },
    ];

    const headings = [
        { label: 'Heading 1', value: 'h1', action: actions.heading1 },
        { label: 'Heading 2', value: 'h2', action: actions.heading2 },
        { label: 'Heading 3', value: 'h3', action: actions.heading3 },
        { label: 'Heading 4', value: 'h4', action: actions.heading4 },
        { label: 'Paragraph', value: 'p', action: actions.setParagraph },
    ];

    const applyHeading = (heading: typeof headings[0]) => {
        if (heading.action) {
            sendAction(heading.action);
        } else {
            // Fallback: use formatBlock for paragraph
            editor?.commandDOM(`document.execCommand('formatBlock', false, '${heading.value}')`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Text Formatting */}
                {toolbarItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.button}
                        onPress={() => sendAction(item.action)}
                    >
                        <AppText style={{ 
                            fontSize: 18, 
                            fontWeight: item.label === 'B' ? 'bold' : 'normal',
                            fontStyle: item.label === 'I' ? 'italic' : 'normal',
                            textDecorationLine: item.label === 'U' ? 'underline' : item.label === 'S' ? 'line-through' : 'none',
                            color: colors.text 
                        }}>
                            {item.label}
                        </AppText>
                    </TouchableOpacity>
                ))}

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Heading Picker */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setShowHeadingPicker(true)}
                >
                    <AppText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>H</AppText>
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Lists */}
                {listItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.button}
                        onPress={() => sendAction(item.action)}
                    >
                        <Icon name={item.icon as any} size={22} color={colors.text} />
                    </TouchableOpacity>
                ))}

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Alignment */}
                {alignItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.button}
                        onPress={() => sendAction(item.action)}
                    >
                        <Icon name={item.icon as any} size={22} color={colors.text} />
                    </TouchableOpacity>
                ))}

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Additional Actions */}
                <TouchableOpacity style={styles.button} onPress={onInsertLink}>
                    <Icon name="link" size={22} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={onSelectFont}>
                    <Icon name="text" size={22} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => sendAction(actions.code)}>
                    <Icon name="code-slash" size={22} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => sendAction(actions.blockquote)}>
                    <Icon name="chatbox-outline" size={22} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => sendAction(actions.undo)}>
                    <Icon name="arrow-undo" size={22} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => sendAction(actions.redo)}>
                    <Icon name="arrow-redo" size={22} color={colors.text} />
                </TouchableOpacity>
            </ScrollView>

            {/* Heading Picker Modal */}
            <Modal visible={showHeadingPicker} animationType="fade" transparent>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowHeadingPicker(false)}
                >
                    <View style={[styles.headingPicker, { backgroundColor: colors.surface }]}>
                        {headings.map((heading, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.headingItem, { borderBottomColor: colors.border }]}
                                onPress={() => {
                                    applyHeading(heading);
                                    setShowHeadingPicker(false);
                                }}
                            >
                                <AppText style={{ fontSize: heading.value === 'h1' ? 24 : heading.value === 'h2' ? 20 : heading.value === 'h3' ? 18 : 16 }}>
                                    {heading.label}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 0.5,
        paddingVertical: 8,
    },
    scrollContent: {
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    button: {
        padding: 8,
        marginHorizontal: 4,
    },
    divider: {
        width: 1,
        height: 24,
        marginHorizontal: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headingPicker: {
        borderRadius: 12,
        padding: 8,
        minWidth: 200,
    },
    headingItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
    },
});
