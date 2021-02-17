// @flow

import { useEffect, useMemo } from 'react';
import { listForFontsLib } from '@emulous/constants';
import type { TFonts } from '@emulous/types';
import { loadFonts } from '../GoogleFonts/driver';

type TOptions = $ReadOnly<{|
	isFrame?: boolean,
|}>;

const useGoogleFonts = (fonts: ?TFonts, { isFrame = false }: TOptions) => {
	const fontsGoogle = useMemo(
		() =>
			fonts &&
			fonts.filter(
				font =>
					font.family &&
					!listForFontsLib.find(
						conf => conf.name === font.family || conf.family === font.family,
					),
			),
		[fonts],
	);

	useEffect(() => {
		if (fontsGoogle) loadFonts(fontsGoogle, isFrame);
	}, [fontsGoogle, isFrame]);
};

export default useGoogleFonts;
