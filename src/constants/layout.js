const BOTTOM_MARGIN = 160;

// Layout constants for consistent spacing and sizing
export const LAYOUT_CONSTANTS = {
  // Bottom margin for typing area to account for fixed elements
  TYPING_AREA_BOTTOM_MARGIN: BOTTOM_MARGIN,

  // Maximum height for the lines history container
  // Accounts for: header, controls, input section, help text, and some buffer
  LINES_HISTORY_MAX_HEIGHT: 'calc(100vh - 400px)',

  // Spacing values that might be used across components
  SPACING: {
    BOTTOM_MARGIN,
    CONTAINER_PADDING: 'var(--spacing-lg)',
    LINE_GAP: 'var(--spacing-md)',
    LINE_PADDING: 'var(--spacing-sm)',
  },
};
