import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Share } from 'react-native';

export class ShareService {
    static async shareText(title: string, content: string): Promise<void> {
        try {
            const message = title ? `${title}\n\n${content}` : content;
            
            await Share.share({
                message,
                title: title || 'Shared Note',
            });
        } catch (error) {
            console.error('Error sharing text:', error);
            throw new Error('Failed to share note.');
        }
    }

    static async shareAsHtmlFile(title: string, htmlContent: string): Promise<void> {
        try {
            const fileName = `${(title || 'note').replace(/[^a-zA-Z0-9]/g, '_')}.html`;
            const filePath = ((FileSystem as any).cacheDirectory || '') + fileName;

            const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Note'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
        }
        h1 { font-size: 24px; margin-bottom: 16px; }
    </style>
</head>
<body>
    ${title ? `<h1>${title}</h1>` : ''}
    ${htmlContent}
</body>
</html>`;

            await FileSystem.writeAsStringAsync(filePath, fullHtml);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath, {
                    mimeType: 'text/html',
                    dialogTitle: 'Share Note',
                    UTI: 'public.html'
                });
            } else {
                throw new Error('Sharing is not available on this device.');
            }
        } catch (error: any) {
            console.error('Error sharing HTML file:', error);
            throw new Error(error.message || 'Failed to share note as file.');
        }
    }

    static async shareAsTextFile(title: string, content: string): Promise<void> {
        try {
            const fileName = `${(title || 'note').replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
            const filePath = ((FileSystem as any).cacheDirectory || '') + fileName;

            const fullContent = title ? `${title}\n${'='.repeat(title.length)}\n\n${content}` : content;

            await FileSystem.writeAsStringAsync(filePath, fullContent);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath, {
                    mimeType: 'text/plain',
                    dialogTitle: 'Share Note',
                    UTI: 'public.plain-text'
                });
            } else {
                throw new Error('Sharing is not available on this device.');
            }
        } catch (error: any) {
            console.error('Error sharing text file:', error);
            throw new Error(error.message || 'Failed to share note as file.');
        }
    }

    static async shareFile(uri: string, mimeType: string = 'image/jpeg', dialogTitle: string = 'Share File'): Promise<void> {
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType,
                    dialogTitle,
                    UTI: mimeType === 'image/png' ? 'public.png' : 'public.jpeg' // Simple heuristic
                });
            } else {
                throw new Error('Sharing is not available on this device.');
            }
        } catch (error: any) {
            console.error('Error sharing file:', error);
            throw new Error(error.message || 'Failed to share file.');
        }
    }
}
