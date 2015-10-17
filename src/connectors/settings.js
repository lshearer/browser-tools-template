export const shortcutKeys = {
  // Key combinations for toggling the inspector iframe wrapper.
  // Any combination of `h`, `ctrl`, and `alt/shift` should toggle the inspector.
  // Not using ⌘ combos for mac because too many are already browser or system shortcuts
  // Also not using `alt+shift+h` because by default it creates a Ó character on mac,
  // which we shouldn't overwrite.
  toggleIFrame: 'alt+ctrl+h, ctrl+shift+h, alt+ctrl+shift+h',
};
