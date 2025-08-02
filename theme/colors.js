export const colors = {
    // Main theme colors
    primary: '#ff4b6e',       // Vibrant coral pink
    secondary: '#4ecdc4',     // Fresh mint
    accent: '#ffe66d',        // Sunny yellow
    
    // Background variations
    background: '#f8f9ff',    // Cool light background
    surfacePrimary: '#ffffff', // Primary surface
    surfaceSecondary: '#f1f3fa', // Secondary surface
    
    // Text colors
    text: '#1a1b25',         // Near black
    textSecondary: '#646e82', // Steel gray
    textLight: '#ffffff',     // White text
    
    // Status colors
    error: '#ff6b6b',        // Soft red
    success: '#2ecc71',      // Emerald green
    warning: '#ffa502',      // Warm orange
    info: '#45aaf2',         // Sky blue
    
    // UI elements
    divider: '#e4e8f3',      // Subtle divider
    disabled: '#c8d0e0',     // Disabled state
    placeholder: '#a0a8b9',   // Placeholder text
    
    // Shadows and overlays
    shadowLight: 'rgba(0, 0, 0, 0.06)', // Light shadow
    shadowMedium: 'rgba(0, 0, 0, 0.12)', // Medium shadow
    overlay: 'rgba(26, 27, 37, 0.5)',    // Modal overlay
    
    // Card variations
    cardGradientStart: '#ffffff',
    cardGradientEnd: '#f8f9ff'
};

export const gradients = {
    primary: ['#FF4B6E', '#FF8097'],    // Coral gradient
    secondary: ['#4ECDC4', '#45D4A6'],   // Mint gradient
    accent: ['#FFE66D', '#FFD93D'],      // Yellow gradient
    card: ['#FFFFFF', '#F8F9FF'],        // Subtle card gradient
    surface: ['#F1F3FA', '#E4E8F3']      // Background gradient
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6
    }
};
