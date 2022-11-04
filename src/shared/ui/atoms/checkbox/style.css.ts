import { style } from '@vanilla-extract/css';

export const input = style({
  display: 'none',
});

export const display = style({
  height: '20px',
  width: '20px',

  border: '2px solid #cecece',
  borderRadius: '4px',

  ':hover': {
    cursor: 'pointer',
    borderColor: '#aaaaaa',
  },
});

export const image = style({
  height: '100%',
  filter:
    'invert(99%) sepia(0%) saturate(1188%) hue-rotate(186deg) brightness(97%) contrast(67%)',
});

export const disableFilter = style({
  filter: 'none',
});

export const label = style({
  display: 'flex',
  flexDirection: 'row',
});
