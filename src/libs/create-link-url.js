// @flow
import type { TFonts, TFont } from '@emulous/types';
import { listForFontsLib } from '@emulous/constants';

const APP_FONT_BASE_URL = 'https://fonts.googleapis.com/css';
const APP_FONT_DISPLAY_PARAM = '&display=swap';

const createLinkUrl = (fonts: TFonts) => {
	const fontsGoogle = fonts.filter(
		font =>
			font.family &&
			!listForFontsLib.find(
				conf => conf.name === font.family || conf.family === font.family,
			),
	);

	const families = fontsGoogle
		.reduce((acc, font: TFont) => {
			const family = font.family.replace(/ +/g, '+');
			const variants = (font.variants || []).join(',');

			return [...acc, family + (variants && `:${variants}`)];
		}, [])
		.join('|');

	const familyParam = `?family=${families}`;

	return families && `${APP_FONT_BASE_URL}${familyParam}${APP_FONT_DISPLAY_PARAM}`;
};

export default createLinkUrl;
