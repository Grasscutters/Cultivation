import { style } from '@vanilla-extract/css';

export const inputWrapper = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

export const input = style({
  textOverflow: 'ellipsis',
});

export const icon = style({
  height: 20,
  marginLeft: 1,
  filter:
    'invert(99%) sepia(0%) saturate(1188%) hue-rotate(186deg) brightness(97%) contrast(67%)',

  transition: 'filter 0.1s ease-in-out',

  ':hover': {
    cursor: 'pointer',
    filter:
      'invert(73%) sepia(0%) saturate(380%) hue-rotate(224deg) brightness(94%) contrast(90%)',
  },
});

export const iconImg = style({
  height: '100%',
});
