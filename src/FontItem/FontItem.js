// @flow

import React, { memo } from 'react';
import styled from '@emotion/styled';
import { Box, Text } from '@emulous/prototype';
import type { TFont, TSx } from '@emulous/types';

const TextFont = styled(Text)`
	${({ familyCss }) => (familyCss ? `font-family: ${familyCss}` : '')};
	position: relative;
	top: 36px;
	font-size: 24px;
	line-height: 42px;
	height: 42px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const TextFontFamily = styled(Text)`
	left: 24px;
	position: absolute;
	top: 12px;
`;

const TextFontStyles = styled(Text)`
	position: absolute;
	right: 24px;
	top: 12px;
	opacity: 0;
	transition: opacity 0.15s ease-in;
`;

const WrapFont = styled(Box)`
	border-bottom: 1px solid
		${({ theme, isLast, isLastRecently }) => {
			if (isLast) return 'transparent';
			if (isLastRecently) return theme.colors.bg.primaryaltminus;
			return theme.colors.bg.primaryalt;
		}};
	transition: background-color 0.15s ease-in;
	position: relative;
	height: ${({ isMiniature }) => (isMiniature ? 95 : 42)}px;

	&:hover {
		background-color: white;
		cursor: pointer;

		${TextFontStyles} {
			opacity: 1;
		}
	}

	${TextFontFamily}, ${TextFont} {
		color: ${({ activeFont, theme }) =>
			activeFont ? theme.colors.text.accent : theme.colors.text.primaryalt};
	}
`;

type TProps = $ReadOnly<{|
	dataFont: TFont,
	isMiniature: boolean,
	text: string,
	t: string => string,
	onChange: TFont => void,
	activeFontFamily: string,
	sx?: TSx,
	isLast?: boolean,
	familyCss?: string,
|}>;

function FontItem({
	isMiniature,
	t,
	dataFont,
	text,
	onChange = () => {},
	activeFontFamily,
	sx = {},
	isLast = false,
	familyCss,
}: TProps) {
	const { family, id, variants, isLastRecently } = dataFont;

	const handleOnChange = React.useCallback(() => {
		onChange(dataFont);
	}, [onChange, dataFont]);

	return (
		<WrapFont
			key={id}
			onClick={handleOnChange}
			isMiniature={isMiniature}
			sx={sx}
			isLast={isLast}
			activeFont={activeFontFamily === family}
			isLastRecently={isLastRecently}
		>
			<TextFontFamily variant="bodysm">{family}</TextFontFamily>
			{variants?.length > 0 && (
				<TextFontStyles variant="bodysm" color="text.tertiary">
					{variants?.length} {t('Styles')}
				</TextFontStyles>
			)}
			{isMiniature && (
				<TextFont id={`font-item-${id}`} familyCss={familyCss}>
					{text}
				</TextFont>
			)}
		</WrapFont>
	);
}

export default memo<TProps>(FontItem);
