import React, { Component } from 'react';
import { RED_X, GREEN_HEART } from '@/constants/assets';

class YesOrNo extends Component {
  render() {
    const { onYes, onNo } = this.props;

    return (
      <footer className="yes-or-no">
        <button onClick={onNo}><img src={RED_X} /></button>
        <button onClick={onYes}><img src={GREEN_HEART} /></button>
      </footer>
    );
  }
}

export default YesOrNo;
