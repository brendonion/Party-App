import React, { Component } from 'react';
import { YOU } from '@/constants/assets';

class ItsAMatch extends Component {
  render() {
    const { image, onClose } = this.props;

    return (
      <div className="match">
        <div className="match__prompt">
          <h1>It's A Match!</h1>
          <p>You and Brendan have liked each other.</p>
        </div>
        <div className="match__images">
          <img src={image} />
          <img src={YOU} />
        </div>
        <div className="match__options">
          <a href="tel:2508572365">Send a Message</a>
          <button onClick={onClose}>Keep Playing</button>
        </div>
      </div>
    );
  }
}

export default ItsAMatch;
