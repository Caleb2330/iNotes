export type RootStackParamList = {
    Onboarding: undefined;
    Home: undefined;
    NoteList: { folderId?: string; searchQuery?: string } | undefined;
    NoteDetail: { noteId?: string };
    FolderList: undefined;
    Settings: undefined;
    PrivacyPolicy: undefined;
};
