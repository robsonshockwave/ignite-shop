import { styled } from '..';

export const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  minHeight: '100vh',
});

export const Header = styled('header', {
  padding: '0 2rem',
  width: '100%',
  maxWidth: 1180,
  margin: '0 auto',
});
