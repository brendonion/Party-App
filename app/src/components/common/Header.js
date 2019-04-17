import React, { Component } from 'react';
import { LOGO } from '@/constants/assets';

class Header extends Component {
  render() {
    return (
      <header className="header">
        <img className="header__logo" src={LOGO} />
      </header>
    );
  }
}

export default Header;
