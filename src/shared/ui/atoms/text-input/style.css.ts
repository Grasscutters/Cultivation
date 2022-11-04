import { style } from '@vanilla-extract/css';

export const input = style({
  border: 'none',
  borderBottom: '2px solid #cecece',

  paddingRight: 16,

  transition: 'border-bottom-color 0.1s ease-in-out',

  ':focus': {
    outline: 'none',
    borderBottomColor: '#ffd326',
  },
});

export const clear = style({
  height: 10,
  display: 'inline-block',
  position: 'absolute',
  right: '16%',

  filter:
    'invert(99%) sepia(0%) saturate(1188%) hue-rotate(186deg) brightness(97%) contrast(67%)',

  ':hover': {
    cursor: 'pointer',
    filter:
      'invert(73%) sepia(0%) saturate(380%) hue-rotate(224deg) brightness(94%) contrast(90%)',
  },
});

export const inputClear = style({
  height: '100%',
});
