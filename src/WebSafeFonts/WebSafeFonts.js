// @flow

import React, { memo, useMemo } from 'react';
import _ from 'lodash/fp';
import { Box } from '@emulous/prototype';
import { ClassNames } from '@emotion/core';
import { listForFontsLib } from '@emulous/constants';
import type { TFontShort } from '@emulous/types';
import FontItem from '../FontItem';
import { getIdFonts } from '../GoogleFonts/driver';
import scrollSx from '../elements';

type TProps = $ReadOnly<{|
	t: string => string,
	text: string,
	onChange: TFontShort => void,
	activeFontFamily: string,
|}>;

const scrollContainerSx = {
	margin: '18px 0 30px 0',
};

function WebSafeFonts({ t, onChange = () => {}, text, activeFontFamily }: TProps) {
	const listFonts = useMemo(() => _.orderBy(['family'], ['asc'], listForFontsLib), []);

	const onChangeHandle = React.useCallback(
		dataFont => {
			const { family, variants } = dataFont;
			onChange({ family, variants });
		},
		[onChange],
	);

	return (
		<ClassNames>
			{({ css, theme }) => (
				<Box className={css(scrollSx(theme))}>
					<Box sx={scrollContainerSx}>
						{listFonts.map(({ family, name, variants }, key) => {
							const id = getIdFonts(family);
							const dataFont = {
								family,
								id,
								category: 'WebSafe',
								scripts: [], // TODO добавить в константу
								variants,
							};

							return (
								<FontItem
									dataFont={dataFont}
									familyCss={name}
									key={id}
									onChange={onChangeHandle}
									isMiniature={false}
									t={t}
									text={text}
									activeFontFamily={activeFontFamily}
									isLast={key === listFonts.length - 1}
								/>
							);
						})}
					</Box>
				</Box>
			)}
		</ClassNames>
	);
}

export default memo<TProps>(WebSafeFonts);
