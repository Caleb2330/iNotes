export interface Font {
    family: string;
    url: string; // URL to the .ttf or .otf file
    category: string; // e.g., 'sans-serif', 'serif', 'monospace', 'handwriting'
}

// Using reliable CDN URLs from fontsource/jsDelivr
export const AVAILABLE_FONTS: Font[] = [
    // Sans-Serif fonts
    { family: 'Roboto', url: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Open Sans', url: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Lato', url: 'https://cdn.jsdelivr.net/fontsource/fonts/lato@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Montserrat', url: 'https://cdn.jsdelivr.net/fontsource/fonts/montserrat@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Oswald', url: 'https://cdn.jsdelivr.net/fontsource/fonts/oswald@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Poppins', url: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Raleway', url: 'https://cdn.jsdelivr.net/fontsource/fonts/raleway@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Ubuntu', url: 'https://cdn.jsdelivr.net/fontsource/fonts/ubuntu@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Nunito', url: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Inter', url: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Quicksand', url: 'https://cdn.jsdelivr.net/fontsource/fonts/quicksand@latest/latin-400-normal.ttf', category: 'sans-serif' },
    { family: 'Rubik', url: 'https://cdn.jsdelivr.net/fontsource/fonts/rubik@latest/latin-400-normal.ttf', category: 'sans-serif' },
    
    // Serif fonts
    { family: 'Merriweather', url: 'https://cdn.jsdelivr.net/fontsource/fonts/merriweather@latest/latin-400-normal.ttf', category: 'serif' },
    { family: 'Playfair Display', url: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-normal.ttf', category: 'serif' },
    { family: 'Lora', url: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf', category: 'serif' },
    { family: 'PT Serif', url: 'https://cdn.jsdelivr.net/fontsource/fonts/pt-serif@latest/latin-400-normal.ttf', category: 'serif' },
    { family: 'Libre Baskerville', url: 'https://cdn.jsdelivr.net/fontsource/fonts/libre-baskerville@latest/latin-400-normal.ttf', category: 'serif' },
    { family: 'EB Garamond', url: 'https://cdn.jsdelivr.net/fontsource/fonts/eb-garamond@latest/latin-400-normal.ttf', category: 'serif' },
    { family: 'Bitter', url: 'https://cdn.jsdelivr.net/fontsource/fonts/bitter@latest/latin-400-normal.ttf', category: 'serif' },
    { family: 'Spectral', url: 'https://cdn.jsdelivr.net/fontsource/fonts/spectral@latest/latin-400-normal.ttf', category: 'serif' },
    
    // Monospace fonts
    { family: 'Inconsolata', url: 'https://cdn.jsdelivr.net/fontsource/fonts/inconsolata@latest/latin-400-normal.ttf', category: 'monospace' },
    { family: 'Source Code Pro', url: 'https://cdn.jsdelivr.net/fontsource/fonts/source-code-pro@latest/latin-400-normal.ttf', category: 'monospace' },
    { family: 'Fira Code', url: 'https://cdn.jsdelivr.net/fontsource/fonts/fira-code@latest/latin-400-normal.ttf', category: 'monospace' },
    { family: 'JetBrains Mono', url: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf', category: 'monospace' },
    { family: 'Roboto Mono', url: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto-mono@latest/latin-400-normal.ttf', category: 'monospace' },
    { family: 'IBM Plex Mono', url: 'https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@latest/latin-400-normal.ttf', category: 'monospace' },
    { family: 'Space Mono', url: 'https://cdn.jsdelivr.net/fontsource/fonts/space-mono@latest/latin-400-normal.ttf', category: 'monospace' },
    
    // Handwriting fonts
    { family: 'Pacifico', url: 'https://cdn.jsdelivr.net/fontsource/fonts/pacifico@latest/latin-400-normal.ttf', category: 'handwriting' },
    { family: 'Dancing Script', url: 'https://cdn.jsdelivr.net/fontsource/fonts/dancing-script@latest/latin-400-normal.ttf', category: 'handwriting' },
    { family: 'Caveat', url: 'https://cdn.jsdelivr.net/fontsource/fonts/caveat@latest/latin-400-normal.ttf', category: 'handwriting' },
    { family: 'Indie Flower', url: 'https://cdn.jsdelivr.net/fontsource/fonts/indie-flower@latest/latin-400-normal.ttf', category: 'handwriting' },
    { family: 'Great Vibes', url: 'https://cdn.jsdelivr.net/fontsource/fonts/great-vibes@latest/latin-400-normal.ttf', category: 'handwriting' },
    { family: 'Satisfy', url: 'https://cdn.jsdelivr.net/fontsource/fonts/satisfy@latest/latin-400-normal.ttf', category: 'handwriting' },
    { family: 'Lobster', url: 'https://cdn.jsdelivr.net/fontsource/fonts/lobster@latest/latin-400-normal.ttf', category: 'handwriting' },
    { family: 'Cookie', url: 'https://cdn.jsdelivr.net/fontsource/fonts/cookie@latest/latin-400-normal.ttf', category: 'handwriting' },
    { family: 'Permanent Marker', url: 'https://cdn.jsdelivr.net/fontsource/fonts/permanent-marker@latest/latin-400-normal.ttf', category: 'handwriting' },
    { family: 'Sacramento', url: 'https://cdn.jsdelivr.net/fontsource/fonts/sacramento@latest/latin-400-normal.ttf', category: 'handwriting' },
    
    // Display fonts
    { family: 'Bebas Neue', url: 'https://cdn.jsdelivr.net/fontsource/fonts/bebas-neue@latest/latin-400-normal.ttf', category: 'display' },
    { family: 'Abril Fatface', url: 'https://cdn.jsdelivr.net/fontsource/fonts/abril-fatface@latest/latin-400-normal.ttf', category: 'display' },
    { family: 'Comfortaa', url: 'https://cdn.jsdelivr.net/fontsource/fonts/comfortaa@latest/latin-400-normal.ttf', category: 'display' },
    { family: 'Righteous', url: 'https://cdn.jsdelivr.net/fontsource/fonts/righteous@latest/latin-400-normal.ttf', category: 'display' },
    { family: 'Bangers', url: 'https://cdn.jsdelivr.net/fontsource/fonts/bangers@latest/latin-400-normal.ttf', category: 'display' },
    { family: 'Alfa Slab One', url: 'https://cdn.jsdelivr.net/fontsource/fonts/alfa-slab-one@latest/latin-400-normal.ttf', category: 'display' },
    { family: 'Bungee', url: 'https://cdn.jsdelivr.net/fontsource/fonts/bungee@latest/latin-400-normal.ttf', category: 'display' },
    { family: 'Russo One', url: 'https://cdn.jsdelivr.net/fontsource/fonts/russo-one@latest/latin-400-normal.ttf', category: 'display' },
    { family: 'Cinzel', url: 'https://cdn.jsdelivr.net/fontsource/fonts/cinzel@latest/latin-400-normal.ttf', category: 'display' },
    { family: 'Press Start 2P', url: 'https://cdn.jsdelivr.net/fontsource/fonts/press-start-2p@latest/latin-400-normal.ttf', category: 'display' },
];
