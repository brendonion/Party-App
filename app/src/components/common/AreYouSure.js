import React, { Component } from 'react';
import { ALERT } from '@/constants/assets';

class AreYouSure extends Component {

  handleYes = () => {
    const { xCoords, onYes } = this.props;
    xCoords ? onYes() : onYes(true);
  }

  render() {
    return (
      <div className="are-you-sure">
        <div className="are-you-sure__modal">
          <img src={ALERT} />
          <h1>Wait... are you sure?</h1>
          <button onClick={this.handleYes}>Yes</button>
          <button onClick={this.props.onNo}>No</button>
        </div>
      </div>
    );
  }
}

export default AreYouSure;
