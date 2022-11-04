import { style } from '@vanilla-extract/css';

export const section = style({
  overflow: 'hidden',
  width: '100%',

  margin: '6px 0px',
});

export const span = style({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',

  width: '100%',
});

export const title = style({
  display: 'flex',
  flexDirection: 'row',
});

export const path = style({
  textOverflow: 'ellipsis',
  width: 250,
  overflow: 'hidden',
});

export const status = style({
  textAlign: 'right',
});
