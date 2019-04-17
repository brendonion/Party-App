import React, { Component } from 'react';
import { TITLE } from '@/constants/assets';

class GameIntro extends Component {
  render() {
    return (
      <div className="game__intro">
        <img src={TITLE} />
      </div>
    );
  }
}

export default GameIntro;
