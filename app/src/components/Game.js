import React, { Component } from 'react';

import Header from './common/Header';
import GameIntro from './GameIntro';
import GameLoop from './GameLoop';
import GameOver from './GameOver';

class Game extends Component {

  state = {
    step: 0,
  }

  componentDidMount() {
    setTimeout(() => this.setState({step: this.state.step + 1}), 3000);
  }

  render() {
    const { step } = this.state;

    return (
      <main className="game">
        {step ? <Header /> : null}
        {{
          0: <GameIntro />,
          1: <GameLoop />,
          2: <GameOver />,
        }[step]}
      </main>
    );
  }
}

export default Game;
