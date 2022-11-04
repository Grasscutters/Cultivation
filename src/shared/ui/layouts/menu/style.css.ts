import { globalStyle, style } from '@vanilla-extract/css';

export const menu = style({
  position: 'fixed',
  zIndex: 99,

  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  height: '70%',
  width: '60%',

  background: '#fff',
  padding: 20,
  borderRadius: 10,

  boxShadow: '0px 0px 5px 3px rgba(0, 0, 0, 0.2)',

  overflowY: 'auto',

  '::-webkit-scrollbar': {
    display: 'none',
  },
});

export const menuInner = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const menuHeading = style({
  fontSize: '2rem',
  margin: 16,
});

export const menuTop = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const menuExit = style({
  height: 30,
  margin: 20,

  ':hover': {
    cursor: 'pointer',
  },
});

/*
TODO: get rid of css breaking encapsulation
we should be good when all the ui is decomposed into self sustainable blocks
 */
globalStyle(`${menuExit} img`, {
  height: '100%',
});
