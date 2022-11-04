import { style } from '@vanilla-extract/css';

export const section = style({
  display: 'inline-block',
  marginLeft: 20,
  verticalAlign: 'middle',
});

export const button = style({
  height: 20,
  filter: 'drop-shadow(0px 0px 5px rgb(0 0 0 / 20%))',

  ':hover': {
    cursor: 'pointer',
  },
});

export const image = style({
  height: '100%',
  filter:
    'invert(100%) sepia(2%) saturate(201%) hue-rotate(47deg) brightness(117%) contrast(100%)',
});
