import React, { Component } from 'react';

import Header from './common/Header';
import GameIntro from './GameIntro';
import GameLoop from './GameLoop';
import GameOver from './GameOver';

class Game extends Component {

  state = {
    stage: 1,
  }

  // componentDidMount() {
  //   setTimeout(() => this.setState({step: this.state.stage + 1}), 3000);
  // }

  render() {
    const { stage } = this.state;

    return (
      <main className="game">
        {stage ? <Header /> : null}
        {{
          0: <GameIntro />,
          1: <GameLoop />,
          2: <GameOver />,
        }[stage]}
      </main>
    );
  }
}

export default Game;
