import React, { Component } from 'react';
import { TITLE } from '@/constants/assets';

class GameIntro extends Component {
  render() {
    return (
      <div className="game__intro">
        <img src={TITLE} />
        <p>The perfect way to break the ice ™️</p>
      </div>
    );
  }
}

export default GameIntro;
