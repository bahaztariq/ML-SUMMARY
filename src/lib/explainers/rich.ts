import { resolve } from '$app/paths';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Tiny, safe inline formatter for narration: escapes HTML first, then applies
 * **bold**, *em*, `code`, [label](concept:id), blank-line paragraphs and
 * paragraphs made only of `1.` or `-` lines as lists.
 */
export function rich(text: string): string {
	return text
		.trim()
		.split(/\n\s*\n/)
		.map((para) => {
			const lines = para.trim().split('\n');
			if (lines.every((l) => /^\s*(\d+\.|-)\s/.test(l))) {
				const tag = /^\s*\d/.test(lines[0]) ? 'ol' : 'ul';
				return `<${tag}>${lines.map((l) => `<li>${inline(l.replace(/^\s*(\d+\.|-)\s/, ''))}</li>`).join('')}</${tag}>`;
			}
			return `<p>${inline(para)}</p>`;
		})
		.join('');
}

function inline(text: string): string {
	return esc(text)
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\*([^*]+)\*/g, '<em>$1</em>')
		.replace(
			/\[([^\]]+)\]\(concept:([a-z0-9-]+)\)/g,
			(_, label, id) => `<a class="concept-link" href="${resolve('/concept/[id]', { id })}">${label}</a>`
		);
}
