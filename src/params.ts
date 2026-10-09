import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	/** Non-default languages get a URL prefix (/fr, /ar); English lives at the root. */
	lang: (param: string) => (param === 'fr' || param === 'ar' ? param : undefined)
});
