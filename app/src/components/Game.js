import React, { Component, Fragment } from 'react';

import Header from './common/Header';
import GameIntro from './GameIntro';
import GameLoop from './GameLoop';

class Game extends Component {

  state = {
    gameStarted: true,
  }

  // componentDidMount() {
  //   setTimeout(() => this.setState({step: this.state.stage + 1}), 3000);
  // }

  render() {
    const { gameStarted } = this.state;

    return (
      <main className="game">
        {!gameStarted && <GameIntro />}
        {gameStarted && 
          <Fragment>
            <Header />
            <GameLoop />
          </Fragment>
        }
      </main>
    );
  }
}

export default Game;
