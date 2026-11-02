/** Fired by the navbar's search button; Ctrl/⌘+K also opens the menu (src/components/CommandMenu.tsx). */
export const OPEN_COMMAND_MENU = "open-command-menu";
export const openCommandMenu = () => window.dispatchEvent(new Event(OPEN_COMMAND_MENU));
