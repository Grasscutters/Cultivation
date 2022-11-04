import { globalStyle, style } from '@vanilla-extract/css';

export const mainProgressBarWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',

  color: '#fff',
  textShadow: '1px 1px 14px black',

  ':hover': {
    cursor: 'pointer',
  },
});

const baseProgress = style({
  borderRadius: 4,
});

export const wrapper = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

export const bar = style([
  baseProgress,
  {
    height: 20,
    width: '100%',
    backgroundColor: 'rgba(204, 204, 204, 0.5)',
    color: '#c5c5c5',

    border: '1px solid #ccc',

    selectors: {
      [`${mainProgressBarWrapper} &`]: {
        boxShadow: '0px 0px 5px 4px rgb(0 0 0 / 20%)',
      },
      [`${wrapper} &`]: {
        border: 'none',
      },
    },
  },
]);

export const inner = style([
  baseProgress,
  {
    height: '100%',
    backgroundColor: '#fff',

    selectors: {
      [`${wrapper} &`]: {
        backgroundColor: '#ffc61e',
      },
    },
  },
]);

export const progressText = style({
  color: '#c5c5c5',
  padding: '0px 10px',
  width: '30%',
});

export const mainProgressText = style([
  progressText,
  {
    width: '80%',

    selectors: {
      [`${mainProgressBarWrapper} &`]: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff !important',
      },
    },
  },
]);

export const downloadControls = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',

  marginLeft: 10,
});

globalStyle(`${wrapper} div`, {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

globalStyle(`${downloadControls} div`, {
  height: 20,
});

globalStyle(`${downloadControls} div img`, {
  height: '100%',
});

export const downloadStop = style({
  ':hover': {
    cursor: 'pointer',
  },
});
