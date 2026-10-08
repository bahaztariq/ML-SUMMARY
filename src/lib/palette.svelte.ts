/** Open/close state for the ⌘K command palette. */
class Palette {
	isOpen = $state(false);
	open = () => (this.isOpen = true);
	close = () => (this.isOpen = false);
	toggle = () => (this.isOpen = !this.isOpen);
}

export const palette = new Palette();
