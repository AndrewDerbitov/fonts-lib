// @flow
import React from 'react';
import { Box, PopupWhite, themes } from '@emulous/prototype';
import { ThemeProvider } from 'emotion-theming';
import type { TFontShort, TFonts, TFontsOrder } from '@emulous/types';

import Header from './Header';

import GoogleFonts from './GoogleFonts';
import WebSafeFonts from './WebSafeFonts';

const PREVIEW_MODE_TEXT = 'Quick fox jumps nightly';

type TProps = $ReadOnly<{|
	t: string => string,
	onClose: MouseEvent => void,
	onChange: TFontShort => void,
	activeFontFamily: string,
	recentlyFonts: TFonts,
|}>;

const wrapBoxSx = {
	display: 'flex',
	flexDirection: 'column',
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	paddingTop: '24px',
	paddingBottom: '12px',
};

const FontsLib = (props: TProps) => {
	const { t, onClose, onChange, recentlyFonts = [], activeFontFamily } = props;
	const [activeTab, setActiveTab] = React.useState('google-fonts');
	const [searchLine, setSearchLine] = React.useState<?string>(null);
	const [order, setOrder] = React.useState<TFontsOrder>('popularity');
	const [isMiniature, setIsMiniature] = React.useState<boolean>(false);
	const anchorRef = React.useRef(document.body);

	const initialRecentlyFonts = React.useRef(recentlyFonts);

	const handleOnChange = React.useCallback(
		font => {
			onChange(font);
		},
		[activeTab, onChange],
	);

	return (
		<ThemeProvider theme={themes.light}>
			<PopupWhite
				isOpen
				anchorEl={anchorRef}
				offsetLeft={7}
				offsetTop={54}
				onClose={onClose}
				mutex="fonts"
				width={348}
				height="full"
				isFixed={false}
				placement="right"
			>
				<Box sx={wrapBoxSx}>
					<Header
						t={t}
						setActiveTab={setActiveTab}
						setSearchLine={setSearchLine}
						activeTab={activeTab}
						setOrder={setOrder}
						order={order}
						setIsMiniature={setIsMiniature}
						isMiniature={isMiniature}
					/>
					{activeTab === 'google-fonts' && (
						<GoogleFonts
							t={t}
							onChange={handleOnChange}
							searchLine={searchLine}
							order={order}
							isMiniature={isMiniature}
							text={PREVIEW_MODE_TEXT}
							activeFontFamily={activeFontFamily}
							recentlyFonts={initialRecentlyFonts.current}
						/>
					)}
					{activeTab === 'web-safe' && (
						<WebSafeFonts
							t={t}
							onChange={handleOnChange}
							text={PREVIEW_MODE_TEXT}
							activeFontFamily={activeFontFamily}
						/>
					)}
				</Box>
			</PopupWhite>
		</ThemeProvider>
	);
};

export default React.memo<TProps>(FontsLib);
