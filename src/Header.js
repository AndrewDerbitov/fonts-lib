// @flow
import React from 'react';
import styled from '@emotion/styled';
import _ from 'lodash/fp';

import type { TFontsOrder } from '@emulous/types';
import { Text, ButtonGroup, Input, Icon, Box, PopupMenu, Button } from '@emulous/prototype';
import { ReactComponent as ViewFontIconSvg } from './icon/preview.svg';

type TProps = $ReadOnly<{|
	t: string => string,
	setActiveTab: string => void,
	setSearchLine: (?string) => void,
	setOrder: TFontsOrder => void,
	activeTab: string,
	order: TFontsOrder,
	setIsMiniature: boolean => void,
	isMiniature: boolean,
|}>;

const Title = styled(Text)`
	margin-left: 24px;
	cursor: default;
`;

const Tabs = styled(ButtonGroup)`
	margin-top: 30px;
`;

const iconSearchSx = {
	position: 'absolute',
	left: 0,
	top: 0,
	margin: '6px 10px',
};

const StyledInput = styled(Input)`
	height: 30px;
	line-height: 30px;
	width: 100%;
	padding-left: 33px;
`;
const ChangeViewFontsBox = styled(Button)`
	position: absolute;
	right: 24px;
	top: 0;
	svg {
		fill: ${({ theme, isMiniature }) =>
			!isMiniature ? theme.colors.text.secondary : theme.colors.text.accent};
	}
`;

const WrapInput = styled.div`
	padding-right: 66px;
`;

const WrapSearch = styled(Box)`
	position: relative;
	margin: 24px 24px 12px;
`;

const popupOrderSx = {
	position: 'absolute',
	right: '-6px',
	top: 0,
};

const Header = ({
	t,
	setActiveTab,
	setSearchLine,
	activeTab,
	setOrder,
	order,
	setIsMiniature,
	isMiniature,
}: TProps) => {
	const searchInp = React.useRef();
	const orderButton = React.useMemo(
		() => ({
			variant: 'flat',
			colors: 'secondary',
			icons: 'filter',
			isActive: order !== 'popularity',
			title: t('Order'),
			sx: {
				width: '30px',
			},
		}),
		[order, t],
	);

	const tabList = React.useMemo(
		() => [
			{ label: t('Google Fonts'), name: 'google-fonts' },
			{ label: t('Web Safe'), name: 'web-safe' },
		],
		[t],
	);

	const menuOrders = React.useMemo(
		() => ({
			colors: 'primaryflat',
			activeColors: 'accentflat',
			items: [
				{ label: t('Most Popular'), name: 'popularity' },
				{ label: t('Trending'), name: 'trending' },
				{ label: t('Newest'), name: 'date' },
				{ label: t('Name'), name: 'alpha' },
			],
			active: order,
		}),
		[order, t],
	);

	const clickBound = React.useCallback(
		(e, name) => {
			if (typeof name === 'string') {
				setActiveTab(name);
				setIsMiniature(false);
				setSearchLine(null);
			}
		},
		[setActiveTab, setIsMiniature, setSearchLine],
	);

	const onSearch = React.useMemo(
		() =>
			_.debounce(1000, () => {
				setSearchLine(
					searchInp.current?.value && searchInp.current?.value.trim().length > 2
						? searchInp.current?.value.trim()
						: null,
				);
			}),
		[setSearchLine],
	);

	const focusSearchInput = React.useCallback(() => {
		searchInp.current?.focus();
	}, []);

	const handleChangeViewFonts = React.useCallback(() => {
		setIsMiniature(!isMiniature);
	}, [isMiniature, setIsMiniature]);

	const handleOrderAction = React.useCallback(
		(e, action) => {
			if (!action || typeof action !== 'string') return;

			const wanted: TFontsOrder =
				['alpha', 'date', 'popularity', 'style', 'trending'].find(
					i => i === action,
				) || 'popularity';

			setOrder(wanted);
		},
		[setOrder],
	);

	return (
		<>
			<Title variant="title3" color="text.primaryalt">
				{t('Fonts')}
			</Title>
			<Tabs
				behavior="radio"
				active={activeTab}
				buttons={tabList}
				shape="underlined"
				variant="flat"
				size="sm"
				colors="secondaryflat"
				activeColors="accentflat"
				onClick={clickBound}
			/>
			{activeTab === 'google-fonts' && (
				<WrapSearch>
					<WrapInput onClick={focusSearchInput}>
						<Icon
							name="search"
							colors="tertiaryflat"
							size="xxsm"
							sx={iconSearchSx}
						/>
						<StyledInput
							ref={searchInp}
							type="text"
							variant="input.sm"
							placeholder="Search"
							onChange={onSearch}
						/>
					</WrapInput>
					<ChangeViewFontsBox
						variant="secondaryflat.icon.sm"
						onClick={handleChangeViewFonts}
						isMiniature={isMiniature}
					>
						<ViewFontIconSvg />
					</ChangeViewFontsBox>
					<PopupMenu
						button={orderButton}
						list={menuOrders}
						onClick={handleOrderAction}
						sx={popupOrderSx}
					/>
				</WrapSearch>
			)}
		</>
	);
};

export default React.memo<TProps>(Header);
