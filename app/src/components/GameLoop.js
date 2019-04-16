import React, { Component } from 'react';
import { ME_1, ME_2, ME_3 } from '@/constants/assets';

import ProfileCard from './common/ProfileCard';
import ItsAMatch from './common/ItsAMatch';

class GameLoop extends Component {

  state = {
    prevImage: ME_1,
    currentImage: ME_1,
    isMatched: false,
    deltaPosition: {
      x: 0, 
      y: 0
    },
  }

  handleMatchClose = () => this.setState({ isMatched: false });

  handleDrag = (e, ui) => {
    const { x, y } = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      }
    });
  }

  handleStop = () => {
    const profileCard = document.getElementsByClassName('profile-card')[0];
    const currentPos = this.state.deltaPosition;
    if (currentPos.x >= (profileCard.clientWidth / 2)) {
      console.log("SWIPED RIGHT");
      // TODO: Set "random" image
      this.setState({ 
        isMatched: true,
        prevImage: this.state.currentImage,
        currentImage: ME_2,
        deltaPosition: {
          x: 0,
          y: 0,
        },
      });
    } else if (currentPos.x <= -(profileCard.clientWidth / 2)) {
      console.log("SWIPED LEFT");
      // TODO: 
      // Open a modal and ask if they are sure.
      // If no, then reset card, 
      // else continue the swipe for a few seconds
      // then move the card to the right
    } else {
      this.setState({
        deltaPosition: {
          x: 0,
          y: 0,
        }
      });
    }
  }

  render() {
    const { prevImage, currentImage, isMatched, deltaPosition } = this.state;

    return (
      <div className="game__loop">
        <ProfileCard
          image={currentImage}
          onDrag={this.handleDrag}
          onStop={this.handleStop}
          position={{...deltaPosition}}
        />
        {isMatched &&
          <ItsAMatch 
            image={prevImage} 
            onClose={this.handleMatchClose}
          />
        }
      </div>
    );
  }
}

export default GameLoop;
