# Android Notes App — Complete Development Specification

**Project brief:** Build an Android note-taking app with an iOS iNote-style UX, attachments (images/videos/etc.), folders, dark mode, rich text formatting (100+ fonts support), Google Drive backup, AdMob ads and Firebase integration (latest SDKs). No explicit user authentication (see constraints & options below). Target: US market.

## Important constraints (must-read)

*   The app should use a modern React-based stack (React Native). The current stable React Native release is 0.82 (recommended baseline).
*   Recent Firebase Android releases raised the minimum Android API level and removed some legacy KTX modules; plan for `minSdkVersion >= 23` and follow the Firebase Android release notes when choosing BoM and library versions.
*   Use the **Android Storage Access Framework (SAF)** when you want the user to select a Google Drive location without implementing app-level OAuth; SAF provides a system file picker that can write directly to Drive using the device's document provider (this avoids implementing Google OAuth flows inside the app). If you require programmatic background syncing to a user's Drive folder, OAuth2 is required.
*   Apple’s San Francisco (SF Pro) family is proprietary and licensed for Apple platforms; bundling/redistributing SF Pro for Android is restricted and can create legal risk. Use a licensed substitute or obtain explicit license permission before embedding SF Pro.

---

## Table of contents

1.  [Goals & success criteria](#1-goals--success-criteria)
2.  [Target audience & distribution considerations (US market)](#2-target-audience--distribution-considerations-us-market)
3.  [High-level architecture & tech stack](#3-high-level-architecture--tech-stack)
4.  [Project Structure & Folder Organization](#4-project-structure--folder-organization)
5.  [Data model & storage strategy (Schema)](#5-data-model--storage-strategy-schema)
6.  [Key features (detailed)](#6-key-features-detailed)
7.  [UI / UX specifics, screens & interactions](#7-ui--ux-specifics-screens--interactions)
8.  [Offline behavior, backup & sync (Google Drive options)](#8-offline-behavior-backup--sync-google-drive-options)
9.  [Fonts strategy (100+ fonts) and licensing note](#9-fonts-strategy-100-fonts--licensing)
10. [Firebase & AdMob integration checklist (privacy & SDK notes)](#10-firebase--admob-integration-checklist-privacy--sdk-notes)
11. [Permissions & AndroidManifest requirements](#11-permissions--androidmanifest-essential)
12. [Security, privacy & compliance (US market)](#12-security-privacy--compliance-us-market)
13. [Testing, QA, and CI/CD handoff items](#13-testing-qa-and-cicd)
14. [Deliverables & acceptance criteria](#14-deliverables--acceptance-criteria)
15. [Implementation checklist (developer tasks & code pointers)](#15-implementation-checklist-developer-tasks--code-pointers)
16. [Appendix — sample component list, libraries & helpful links](#16-appendix--sample-component-list-libraries--helpful-links)

---

## 1 — Goals & success criteria

### Primary goals
*   A smooth, native-feeling Android note app with an iOS-like aesthetic (iNote look).
*   Rich note composition (images, video, attachments), folders, and dark mode.
*   Ability to back up / export notes to Google Drive without creating mandatory account sign-in UX friction for typical users.
*   Integrate Firebase (analytics, Crashlytics, optional cloud store) and AdMob with the latest SDKs.

### Success criteria
*   Create, edit, delete notes and folders reliably offline.
*   Attach images/videos to notes; attachments open, preview, and are stored and cleaned correctly.
*   Export/backup to Google Drive is possible via SAF or OAuth (whichever approach chosen), and user understands how syncing works.
*   Ads show using AdMob policies and Privacy opted where needed.
*   App passes Google Play checks for target audience and ad/privacy declarations.

## 2 — Target audience & distribution considerations (US)

*   **Targeting US Play Store:** prepare a clear privacy policy, in-app consent mechanisms for personalized ads (CCPA), and Play Store listing localized for US English.
*   If targeting minors or broad demographics, ensure compliance with COPPA and Play Store age policies.
*   **Ad personalization:** must support user opt-out (AdMob plus consent flow). See AdMob privacy requirements and SDK options.

## 3 — High-level architecture & tech stack

### Recommended stack
*   **Frontend:** React Native 0.82 (TypeScript) — native performance and wide plugin support.
*   **Native modules:** React Native CLI (bare) — for direct AdMob and Firebase native SDK integration (recommended vs managed Expo unless you use Expo prebuild + config plugins).
*   **Local DB:** SQLite (via `react-native-sqlite-storage` or better-performing Realm/WatermelonDB for large datasets). Use SQLite if deterministic migrations and lightweight size are desired.
*   **Attachment storage:** app private storage + `react-native-fs` (RNFS) or `expo-file-system` if using Expo. Use SAF for user-visible exports/backups.
*   **Rich editor:** WebView-based rich text editor (e.g., `react-native-pell-rich-editor`) or native Draft-like solution that supports inline images and formatting.
*   **Fonts deliver:** dynamic font download + caching (see Fonts strategy).
*   **Cloud:** Firebase (Analytics, Crashlytics, Remote Config, optional Firestore for cloud sync if you accept anonymous auth or added small friction auth).
*   **Ads:** Google Mobile Ads (AdMob) using the official SDK.
*   **CI/CD:** Fastlane + GitHub Actions (upload to internal test track / production).
*   **Testing:** Jest + Detox (E2E) or Android instrumentation.

### Why RN CLI (bare) not managed Expo?
AdMob & latest Firebase natives require up-to-date native SDKs and manual control over Gradle versions. Bare RN gives safer control for latest SDK compatibility and minSdk constraints. See Firebase & AdMob release notes (minSdk changes).

## 4 — Project Structure & Folder Organization

A scalable, feature-based directory structure allows for easier maintenance and testing.

```text
src/
├── assets/             # Static assets
│   ├── fonts/          # Bundled core fonts
│   └── images/         # App icons, placeholders
├── components/         # Shared UI components
│   ├── common/         # Generic (Button, Input, Card, Header)
│   ├── layout/         # Layout wrappers (ScreenContainer, SafeArea)
│   └── modals/         # Global modals (Alerts, BottomSheets)
├── core/               # Core application logic & config
│   ├── db/             # Database setup, migrations, schema
│   ├── i18n/           # Strings & Localization
│   └── theme/          # Design tokens, colors, typography (Light/Dark)
├── features/           # Feature-specific modules (Screen + Business Logic)
│   ├── notes/          # Note editor, Note list, Note hooks
│   ├── folders/        # Folder management screens
│   ├── search/         # Search screens and logic
│   ├── settings/       # Settings, Backup/Export screens
│   └── onboarding/     # First-launch experience
├── hooks/              # Global React hooks (useTheme, useDebounce, useOrientation)
├── navigation/         # React Navigation setup (Stacks, Tabs, Types)
├── services/           # External integration services
│   ├── admob/          # AdMob manager (Banner, Interstitial logic)
│   ├── drive/          # Google Drive (SAF/OAuth) logic
│   ├── fs/             # File system wrappers (saving attachments)
│   └── font-manager/   # Dynamic font downloader & cache
├── types/              # Global TypeScript definitions & DTOs
└── utils/              # Helper functions (date formatting, string ops, validations)
```

## 5 — Data model & storage strategy (Schema)

### Database: SQLite
We will use SQLite for its reliability and complex query support (FTS).

#### Table Definitions

```sql
-- 1. Folders
-- Grouping mechanism for notes.
CREATE TABLE Folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  orderIndex INTEGER DEFAULT 0, -- For custom sorting
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- 2. Notes
-- Core entity. Body stored as HTML or JSON Delta.
CREATE TABLE Notes (
  id TEXT PRIMARY KEY,
  folderId TEXT,
  title TEXT,
  bodyRichHtml TEXT,       -- Stored as HTML for portability & easy export
  plainTextPreview TEXT,   -- First ~100 chars, stripped of tags, for List View performance
  pinned INTEGER DEFAULT 0, -- Boolean (0=false, 1=true)
  archived INTEGER DEFAULT 0,
  isLocked INTEGER DEFAULT 0, -- For password/biometric protection
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY(folderId) REFERENCES Folders(id) ON DELETE SET NULL
);

-- 3. Attachments
-- Metadata for files. Actual binaries stored in App-Specific Storage (FS).
CREATE TABLE Attachments (
  id TEXT PRIMARY KEY,
  noteId TEXT NOT NULL,
  type TEXT NOT NULL,      -- 'IMAGE', 'VIDEO', 'FILE'
  uri TEXT NOT NULL,       -- Local file path (file://...)
  mimeType TEXT,
  fileSize INTEGER,
  thumbnailUri TEXT,       -- Path to generated thumbnail (for videos)
  createdAt INTEGER NOT NULL,
  FOREIGN KEY(noteId) REFERENCES Notes(id) ON DELETE CASCADE
);

-- 4. Sync Metadata (Optional/Future)
-- Tracks state for eventual Google Drive sync
CREATE TABLE SyncMetadata (
  entityId TEXT PRIMARY KEY,
  entityType TEXT NOT NULL, -- 'NOTE', 'FOLDER'
  lastSyncedAt INTEGER,
  remoteId TEXT,
  syncStatus TEXT DEFAULT 'DIRTY' -- 'SYNCED', 'DIRTY', 'CONFLICT'
);

-- 5. Search Index (FTS5)
-- Enables full-text search across titles and content
CREATE VIRTUAL TABLE NotesSearch USING fts5(
  title, 
  plainTextPreview, 
  content=Notes, 
  content_rowid=rowid
);
```

### Storage Principles
*   **Rich body:** Store as HTML. It's stable and easier to export to Drive/PDF than proprietary editor JSON states.
*   **Attachments:** Store in `Context.getFilesDir()` (internal) or `getExternalFilesDir()` (if large). **Never** store just the content URI from the gallery; copy the file to the app's private storage to prevent permissions loss on reboot.
*   **Backups:** JSON dump of these tables + Zip of the Attachment directory.

## 6 — Key features (detailed)

### Core note operations
*   **Create/Edit/Delete notes** with rich text features: bold, italic, underline, lists (ordered/unordered), headings, blockquote, code block, inline images, hyperlinks. Editor must support paste from clipboard and image insertion.
*   **Attachments:** pick from gallery/camera (images), file picker (arbitrary files), and record video. Show progress and handle large files gracefully.
*   **Folder management:** create/edit/delete folders, drag-and-drop notes to folders, folder-based filters.
*   **Search:** full-text search across titles and plain-text note bodies (use SQLite FTS).
*   **Pin/Archive:** quick-access pinned notes and archive.

### UI/UX
*   **iOS-like visual language (Inote):** rounded cards, subtle shadows, large title typography, bottom sheet actions. Provide both system light/dark themes and user toggle.
*   Use Android Material components adjusted to iOS look where appropriate. Provide an optional setting “iOS-style font” (see licensing caveat).

### Formatting & Fonts
*   Provide font picker with previews. Support 100+ fonts via on-demand download; do not bundle 100 fonts in the App bundle. Use a remote font store + caching strategy.

### Attachments & previews
*   Inline preview for images and thumbnails for videos. Provide “Open with” for attachments and an attachment viewer. Implement file size limits and compression option for images/videos before upload/backup.

### Google Drive backup & sync options
*   **Option A (no OAuth, minimal friction):** Use Storage Access Framework (SAF) for user-initiated export/backup. The user picks a Drive folder via system picker; app writes backup files there. This avoids implementing OAuth flows.
*   **Option B (full two-way sync):** Implement Google Drive REST API + OAuth2 for persistent programmatic sync.

### Ads & Monetization
*   **AdMob:** Banner, Interstitial, Rewarded. Respect AdMob policies, implement consent for personalized ads, and track ad revenue events in analytics.

## 7 — UI / UX specifics, screens & interactions

### Main screens
*   **Notes list (home):** folders filter, search bar, create button (FAB), layout toggle (list / grid), pinned section, ads placement.
*   **Note editor:** rich editor interface with toolbar. Full-screen compose.
*   **Folder manager:** create/rename/delete folders.
*   **Attachment viewer:** full-screen viewer.
*   **Settings:** theme, backup, font management, Privacy policy.
*   **Backup / Sync screen:** manual backup actions.

### Design guidelines
*   Keep closest to iOS visual cues: rounded note cards, iOS-like spacing.
*   **Accessibility:** ensure dynamic type (scaling) and contrast.

## 8 — Offline behavior, backup & sync (Google Drive options)

*   **Offline-first:** all notes and attachments are fully functional offline. Local DB is the canonical source.

### Backup flows
*   **Manual export via SAF:** generate a single backup file `notes-backup-yyyyMMdd-HHmmss.zip`.
*   **Automated sync (optional):** implement OAuth + Drive API.

### Conflict resolution
Use "last writer wins" by default.

## 9 — Fonts strategy (100+ fonts) & licensing

### Reality & constraints
Apple’s SF Pro is proprietary. Use licensed alternatives (Inter/Roboto).

### Recommended approach
*   **Default font:** System-like font (Inter).
*   **Font provider:** Host fonts on CDN. Download on demand.
*   **Font file size:** Don't bundle 100 fonts.

## 10 — Firebase & AdMob integration checklist (privacy & SDK notes)

### Firebase
*   Use Android BoM. `minSdkVersion >= 23`.
*   Integrate Crashlytics, Analytics, Remote Config.

### AdMob / Google Mobile Ads
*   Integrate Google Mobile Ads SDK. Use test IDs for dev.

### Privacy & Consent
*   Collect no personal data unless necessary. Implement consent (UMP SDK) for ads.

## 11 — Permissions & AndroidManifest (essential)

*   `INTERNET`, `CAMERA`, `READ/WRITE_EXTERNAL` (legacy), `FOREGROUND_SERVICE` (if sync needed).
*   Add AdMob meta-data and Firebase config.

## 12 — Security, privacy & compliance (US market)

*   Local encryption options.
*   Privacy policy URL.
*   AdMob consent flows.

## 13 — Testing, QA, and CI/CD

### Testing
*   Unit (Jest), E2E (Detox).
*   Crashlytics.

### CI/CD
*   GitHub Actions + Fastlane.

## 14 — Deliverables & acceptance criteria

### Deliverables
*   Source code, README, Keystore instructions, Assets.

### Acceptance criteria
*   Runs on API 23+, core flows work, AdMob works, Analytics reporting.

## 15 — Implementation checklist (developer tasks & code pointers)

### Project setup
1.  `npx react-native init InoteClone --version 0.82.0 --template react-native-template-typescript`
2.  Configure Android `minSdkVersion = 23`.

### Native dependencies & bridging
*   Firebase, AdMob, SQLite, RNFS, Permissions, Rich Editor.

### Example: save a note with attachment (pseudo TypeScript)

```typescript
// saveNote.ts (high-level)
async function saveNote(noteData: NoteCreateDto, attachments: AttachmentFile[]) {
  await db.transaction(async tx => {
    const noteId = await tx.insertNote(noteData);
    for (const att of attachments) {
      const savedPath = await fs.saveToAppStorage(att.tempPath);
      await tx.insertAttachment({ noteId, path: savedPath, mimeType: att.mimeType });
    }
  });
}
```

### Backup to Google Drive via SAF (Android)
Use `Intent.ACTION_OPEN_DOCUMENT_TREE` or `Intent.ACTION_CREATE_DOCUMENT` to let the user choose/create a file in Drive.

## 16 — Appendix — sample component list, libraries & helpful links

### Suggested libraries
*   React Native core 0.82.
*   `@react-native-firebase/*`
*   `react-native-google-mobile-ads`
*   `react-native-pell-rich-editor`
*   `react-native-sqlite-storage`
*   `react-native-fs`
*   `react-native-image-picker`

### Useful references
*   React Native versions.
*   Firebase Android release notes.
*   Google Mobile Ads SDK.
*   Android SAF.