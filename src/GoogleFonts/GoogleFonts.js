// @flow

import React, { memo, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { ClassNames } from '@emotion/core';
import _ from 'lodash/fp';
import { Text, LoaderIcon as Loader, Box } from '@emulous/prototype';
import { AutoSizer, List } from 'react-virtualized';
import type { TFonts, TFontShort, TFontsOrder } from '@emulous/types';

import { loadFonts as loadFontPreviews, getAllFonts, getIdFonts } from './driver';
import FontItem from '../FontItem';
import scrollSx from '../elements';

const WrapProcess = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
`;

const TextStyled = styled(Text)`
	margin-bottom: 12px;
`;
const fontItemSx = { padding: '0 24px' };

const wrapFontsSx = {
	height: '100%',
};

type TProps = $ReadOnly<{|
	searchLine?: ?string,
	order: TFontsOrder,
	text: string,
	isMiniature: boolean,
	t: string => string,
	onChange: TFontShort => void,
	activeFontFamily: string,
	recentlyFonts: TFonts,
|}>;

function GoogleFonts({
	searchLine = null,
	order,
	text,
	isMiniature,
	t,
	onChange,
	activeFontFamily,
	recentlyFonts,
}: TProps) {
	const recentlyList: TFonts = useMemo(
		() =>
			_.map.convert({ cap: false })(
				({ id, variants, family }, key, arr) => ({
					id,
					variants,
					family,
					...(key === arr.length - 1 ? { isLastRecently: true } : {}),
				}),
				recentlyFonts,
			),
		[recentlyFonts],
	);

	const [listFonts, setListFonts] = useState<TFonts>([]);
	const isProcessing = useRef<boolean>(true);
	const [isWarn, setIsWarn] = useState<boolean>(false);
	const orderRef = useRef<TFontsOrder>(order);
	const realListFonts = useRef<?TFonts>(null);
	const cacheNumberFonts = useRef<number>(0);
	const currentIsMiniature = useRef<boolean>(false);

	// change active for panel
	const onChangeHandle = React.useCallback(
		dataFont => {
			onChange(_.defaults({ family: '', variant: [] }, dataFont));
		},
		[onChange],
	);

	// loading fonts
	useEffect(() => {
		let isMounted: boolean = true;
		isProcessing.current = true;

		(async () => {
			try {
				if (!isMounted) {
					return;
				}

				setListFonts([]);
				// if change order or mount component
				if (!realListFonts.current || orderRef.current !== order) {
					orderRef.current = order;
					const fontsOriginal = await getAllFonts(order);
					if (!fontsOriginal?.items.length) {
						throw new Error('Some problem with google font');
					}

					realListFonts.current = fontsOriginal.items.map(font => {
						const { family, subsets, ...others } = font;
						return {
							...others,
							family,
							id: getIdFonts(family),
							scripts: subsets,
						};
					});
				}

				let listFontsTmp: TFonts = [];
				// if line for search isn't empty
				if (searchLine) {
					listFontsTmp =
						realListFonts.current?.filter(({ family }) =>
							family.toLowerCase().includes(searchLine.toLowerCase()),
						) || [];
				} else {
					listFontsTmp =
						_.uniqBy(font => font.id, [
							...recentlyList,
							...realListFonts.current,
						]) || [];
				}
				isProcessing.current = false;
				cacheNumberFonts.current = 0;
				setIsWarn(false);
				// this unlogicaly moment need for rerender virtulize component
				_.delay(100, () => setListFonts(listFontsTmp));
			} catch (e) {
				setIsWarn(true);
				if (!isMounted) {
					return;
				}

				isProcessing.current = false;
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [order, searchLine, text, isMiniature, recentlyList]);

	// loading previews of fonts when font showed in viewport
	const loadPreview = useCallback(
		({ overscanStopIndex }) => {
			if (currentIsMiniature.current !== isMiniature) {
				currentIsMiniature.current = isMiniature;
				cacheNumberFonts.current = 0;
			}

			if (cacheNumberFonts.current < overscanStopIndex && !isProcessing.current) {
				const listFontsTmp: ?TFonts = listFonts?.slice(
					cacheNumberFonts.current,
					overscanStopIndex + 1,
				);
				(async () => {
					if (listFontsTmp && isMiniature) {
						await loadFontPreviews(listFontsTmp, false, true, text, '');
					}
				})();
				cacheNumberFonts.current = overscanStopIndex;
			}
		},
		[isMiniature, listFonts, text],
	);

	// render item of font
	const rowRenderer = useCallback(
		({ key, index, style }) => {
			const dataFont = listFonts?.[index] || {};

			return (
				<div key={key} style={style}>
					<FontItem
						dataFont={dataFont}
						onChange={onChangeHandle}
						isMiniature={isMiniature}
						t={t}
						text={text}
						activeFontFamily={activeFontFamily}
						sx={fontItemSx}
						isLast={index === listFonts.length - 1}
					/>
				</div>
			);
		},
		[activeFontFamily, isMiniature, listFonts, onChangeHandle, t, text],
	);

	return (
		<>
			{listFonts.length > 0 && (
				<Box sx={wrapFontsSx}>
					<AutoSizer>
						{({ height, width }) => (
							<ClassNames>
								{({ css, theme }) => (
									<List
										className={css(scrollSx(theme))}
										width={width}
										height={height}
										rowCount={listFonts?.length || 0}
										rowHeight={isMiniature ? 95 : 42}
										rowRenderer={rowRenderer}
										onRowsRendered={loadPreview}
									/>
								)}
							</ClassNames>
						)}
					</AutoSizer>
				</Box>
			)}
			{!listFonts.length && (
				<WrapProcess>
					{!isProcessing.current && !isWarn && !listFonts.length && searchLine && (
						<>
							<TextStyled variant="headlinemd" color="text.primary">
								{t('Sorry, no fonts found')}
							</TextStyled>
							<Text variant="bodysm" color="text.secondary">
								{t('Try another name')}
							</Text>
						</>
					)}
					{((isProcessing.current && !listFonts.length) || isWarn) && (
						<>
							<TextStyled variant="headlinemd" color="text.primary">
								{isWarn ? (
									t('Please try later')
								) : (
									<Loader size={30} color="bg.accent" />
								)}
							</TextStyled>
							{isWarn && (
								<Text variant="bodysm" color="text.secondary">
									{t('Cant’t grab fonts\nfrom external service')}
								</Text>
							)}
						</>
					)}
				</WrapProcess>
			)}
		</>
	);
}

export default memo<TProps>(GoogleFonts);
