// @flow

import type { TFonts, TFont, TFontsStyle } from '@emulous/types';
import { config } from '@emulous/constants';

const FONT_FACE_REGEX = /@font-face {([\s\S]*?)}/gm;
const FONT_FAMILY_REGEX = /font-family: ['"](.*?)['"]/;
const APP_ACCESS_KEY = config.apiGoogleFontsKey;
const GET_FONTS_TIMEOUT = 5000;
const APP_GOOGLE_FONTS_LIST_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';
const APP_FONT_BASE_URL = 'https://fonts.googleapis.com/css';

const previewFontsStylesheet = document.createElement('style');
document.head?.appendChild(previewFontsStylesheet);

/**
 * Get Id font from family
 * @param {*} family
 */
export const getIdFonts = (family: string): string => {
	return family.replace(/\s+/g, '-').toLowerCase();
};

/**
 *
 * @param {*} id
 * @param {*} isPreview
 * @param {*} variants
 */
const getIdElement = (
	id: string,
	isPreview: boolean,
	variants: $ReadOnlyArray<string>,
): string => {
	return `${id}${isPreview ? '-preview' : ''}-${variants.join(',')}`;
};

/**
 * Get All fonts with sort param
 *
 * @param {*} sort
 */
export const getAllFonts = async (sort: string = 'popularity') => {
	try {
		const url = `${APP_GOOGLE_FONTS_LIST_URL}?key=${APP_ACCESS_KEY}&sort=${sort}`;
		const response = await fetch(url, { mode: 'cors', timeout: GET_FONTS_TIMEOUT });
		return response.json();
	} catch (e) {
		return null;
	}
};
/**
 * Get style for connecting fonts but only for preview
 *
 * @param {*} fonts
 * @param {*} previewsOnly
 */
const getStylesheet = async (
	fonts: TFonts,
	previewsOnly: boolean,
	text?: string,
): Promise<string> => {
	try {
		const url = new URL(APP_FONT_BASE_URL);
		const familiesStr = fonts.map(
			(font): string =>
				`${font.family}:${
					font.variants.includes('regular')
						? 'regular'
						: font.variants.find(() => true) || ''
				}`,
		);
		url.searchParams.append('family', familiesStr.join('|'));

		// If previewsOnly: Only query the characters contained in the font names
		if (previewsOnly) {
			// Query only the identified characters
			url.searchParams.append('text', text || '');
		}

		// Tell browser to render fallback font immediately and swap in the new font once it's loaded
		url.searchParams.append('font-display', 'swap');

		// Fetch and return stylesheet
		const response = await fetch(url.href, {
			mode: 'cors',
			timeout: GET_FONTS_TIMEOUT,
		});
		return response.text();
	} catch (e) {
		return '';
	}
};

/**
 * Attach a new font stylesheet to the document head using the provided content
 *
 * @param {*} fontId
 * @param {*} isPreview
 */
const createStylesheet = (fontId: string, documentFrame: Document): void => {
	const fontStylesheet = documentFrame.getElementById(fontId);

	if (!fontStylesheet) {
		const stylesheetNode = documentFrame.createElement('style');
		stylesheetNode.id = fontId;
		documentFrame.head?.appendChild(stylesheetNode);
	}
};

/**
 * Add declaration for applying the specified preview font
 *
 * @param {*} previewFont
 * @param {*} selectorSuffix
 */
const applyFontPreview = (previewFont: TFont, selectorSuffix: string): void => {
	const fontId = getIdFonts(previewFont.family);
	const style = `
			#font-item-${fontId}${selectorSuffix} {
				font-family: "${previewFont.family}";
			}
		`;
	if (
		previewFontsStylesheet.textContent.indexOf(
			`#font-item-${fontId}${selectorSuffix} `,
		) === -1
	) {
		previewFontsStylesheet.appendChild(document.createTextNode(style));
	}
};

/**
 * Insert the provided styles in the font's <style> element (existing styles are replaced)
 *
 * @param {*} fontId
 * @param {*} styles
 */
const fillStylesheet = (
	fontId: string,
	styles: ?string,
	documentFrame: Document,
): void => {
	const stylesheetNode = documentFrame.getElementById(fontId);

	if (stylesheetNode && !stylesheetNode.textContent.length && styles) {
		stylesheetNode.textContent = styles;
	}
};

/**
 * Split list of css for each fonts => array
 *
 * @param {*} allFontStyles
 */
const extractFontStyles = (allFontStyles: string): TFontsStyle => {
	// Run Regex to separate font-face rules
	const rules = allFontStyles.matchAll(FONT_FACE_REGEX);
	// Assign font-face rules to fontIds
	const fontStyles: TFontsStyle = [...rules].map(rule => {
		const fontFamily = rule[0].match(FONT_FAMILY_REGEX);
		const fontId = getIdFonts(fontFamily[1]);

		return { [fontId]: rule[0] };
	});

	return fontStyles;
};

/**
 * Load css with connecting fonts to web page
 *
 * @param {*} fonts
 * @param {*} isFrame
 * @param {*} isPreview
 * @param {*} text
 * @param {*} selectorSuffix
 */
export const loadFonts = async (
	fonts: TFonts,
	isFrame?: boolean = false,
	isPreview?: boolean = false,
	text?: string = '',
	selectorSuffix?: string = '',
): Promise<void> => {
	const documentFrame: Document = isFrame
		? document.getElementsByTagName('iframe')[0].contentDocument
		: document;

	// checking fonts if before loading than no need action
	const notLoadedFonts = fonts.filter(font => {
		return (
			font.id &&
			font.family &&
			!documentFrame.getElementById(getIdElement(font.id, isPreview, font.variants))
		);
	});
	if (!notLoadedFonts.length) return;

	notLoadedFonts.forEach(({ id, variants }): void =>
		createStylesheet(getIdElement(id, isPreview, variants), documentFrame),
	);
	const styles = await getStylesheet(notLoadedFonts, isPreview, text);
	if (!styles) {
		return;
	}

	// Parse response and assign styles to the corresponding font
	const fontStyles = extractFontStyles(styles);
	// Create separate stylesheets for the fonts
	notLoadedFonts.forEach((font): void => {
		if (isPreview) applyFontPreview(font, selectorSuffix);
		const fontStyle =
			fontStyles
				?.filter(style => {
					return !!style?.[font.id];
				})
				?.map(style => style[font.id])
				?.join('') || '';

		fillStylesheet(
			getIdElement(font.id, isPreview, font.variants),
			fontStyle,
			documentFrame,
		);
	});
};

export default previewFontsStylesheet;
