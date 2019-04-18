import React, { Component } from 'react';
import { RED_X, GREEN_HEART } from '@/constants/assets';

class YesOrNo extends Component {
  render() {
    const { onYes, onNo, disabled } = this.props;

    return (
      <footer className="yes-or-no">
        <button disabled={disabled} onClick={onNo}><img src={RED_X} /></button>
        <button disabled={disabled} onClick={onYes}><img src={GREEN_HEART} /></button>
      </footer>
    );
  }
}

export default YesOrNo;
