import { style } from '@vanilla-extract/css';

export const divider = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',

  width: '100%',

  margin: 20,
});

export const dividerLine = style({
  width: '60%',
  borderTop: '1px solid #ccc',
});
