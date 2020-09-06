import React, { Fragment } from 'react';
import { Wrapper, WrapperVariant } from './Wrapper';
import { NavBar } from './NavBar';

interface LayoutProps {
  variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <Fragment>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </Fragment>
  );
};
