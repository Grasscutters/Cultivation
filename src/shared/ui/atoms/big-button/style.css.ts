import { style } from '@vanilla-extract/css';

export const bigButton = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',

  padding: '0 30px',
  borderRadius: '5px',
  border: 'none',
  background: 'linear-gradient(#ffd326, #ffc61e)',
  color: '#704a1d',
  fontWeight: 'bold',

  fontSize: '20px',

  ':hover': {
    cursor: 'pointer',
    background: 'linear-gradient(#ffc61e, #ffd326)',
  },
});

export const disabled = style({
  background: 'linear-gradient(#9c9c9c, #949494)',
  color: 'rgb(226, 226, 226)',
  cursor: 'default',

  ':hover': {
    background: 'linear-gradient(#949494, #9c9c9c)',
  },
});

export const bigButtonText = style({
  fontSize: '12px',
});
