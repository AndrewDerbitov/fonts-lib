// @flow

import type { TSx } from '@emulous/types';

const scrollSx = ({ radii, colors }: { [string]: { [string]: TSx } }) => {
	return {
		overflowY: 'auto',
		overflowX: 'hidden',
		position: 'relative',
		flex: 1,
		outline: 'none',

		'::-webkit-scrollbar': {
			width: '6px',
			backgroundColor: 'transparent',
		},
		'::-webkit-scrollbar-button': {
			display: 'none',
		},
		'::-webkit-scrollbar-track': {
			backgroundColor: 'transparent',
			borderRadius: radii.md.all,
		},
		'::-webkit-scrollbar-track:hover': {
			backgroundColor: colors.bg.primaryaltplus,
		},
		'::-webkit-scrollbar-thumb': {
			backgroundColor: 'transparent',
			borderRadius: radii.md.all,
		},
		':hover::-webkit-scrollbar-thumb': {
			backgroundColor: colors.bg.secondaryminus,
		},
		'::-webkit-scrollbar-thumb:hover': {
			backgroundColor: colors.text.tertiary,
		},
	};
};

export default scrollSx;
