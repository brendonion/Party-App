import React, { Component } from 'react';
import { ME_1, ME_2, ME_3, ME_4, ME_5, ME_6, ME_7, ME_8, ME_9, ME_10 } from '@/constants/assets';

import ProfileCard from './common/ProfileCard';
import ItsAMatch from './common/ItsAMatch';
import YesOrNo from './common/YesOrNo';
import AreYouSure from './common/AreYouSure';

class GameLoop extends Component {

  state = {
    prevImage: null,
    currentImage: null,
    isMatched: false,
    isRejected: false,
    isDraggable: true,
    deltaPosition: {
      x: 0, 
      y: 0,
    },
  }

  componentWillMount() {
    const firstImage = this.pickRandomImage();
    this.setState({
      prevImage: firstImage,
      currentImage: firstImage,
    });
  }

  pickRandomImage() {
    const images = [ME_1, ME_2, ME_3, ME_4, ME_5, ME_6, ME_7, ME_8, ME_9, ME_10];
    const random = images[Math.floor(Math.random() * images.length)];
    if (random !== this.state.currentImage) {
      return random;
    } else {
      return this.pickRandomImage();
    }
  }

  handleYes = () => {
    this.setState({ 
      isMatched: true,
      prevImage: this.state.currentImage,
      currentImage: this.pickRandomImage(),
      deltaPosition: {
        x: 0,
        y: 0,
      },
    });
  }

  handleNo = () => {
    this.setState({ isUnsure: true });
  }

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
    const { x } = this.state.deltaPosition;
    if (x >= (profileCard.clientWidth / 2)) {
      this.handleYes();
    } else if (x <= -(profileCard.clientWidth / 2)) {
      this.handleNo();
    } else {
      this.handleReset();
    }
  }

  handleReset = (resetCoords = true) => {
    const { x, y } = this.state.deltaPosition;
    this.setState({ 
      isMatched: false, 
      isUnsure: false,
      deltaPosition: {
        x: resetCoords ? 0 : x,
        y: resetCoords ? 0 : y,
      },
    });
  }

  handleRejection = async (resetX = false) => {
    this.handleReset(false);
    this.toggleDisable();
    
    const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
    const profileCard = document.getElementsByClassName('profile-card')[0];
    
    this.setState({
      deltaPosition: {
        x: !resetX ? -profileCard.clientWidth * 1.5 : 0,
        y: 0,
      }
    });
    
    await delay(500);
    
    let newX = this.state.deltaPosition.x;
    while (newX <= profileCard.clientWidth * 1.5) {
      newX += 5;
      await delay(10);
      this.setState({ 
        deltaPosition: {
          x: newX,
          y: 0,
        }
      });
    }

    this.handleYes();
    this.toggleDisable();
  }

  toggleDisable = () => {
    this.setState({ isDraggable: !this.state.isDraggable });
  }

  render() {
    const { prevImage, currentImage, isMatched, isUnsure, isDraggable, deltaPosition } = this.state;

    return (
      <div className="game__loop">
        <ProfileCard
          image={currentImage}
          onDrag={this.handleDrag}
          onStop={this.handleStop}
          position={{...deltaPosition}}
          disabled={!isDraggable}
        />
        <YesOrNo 
          onYes={this.handleYes}
          onNo={this.handleNo}
          disabled={!isDraggable}
        />
        {isMatched &&
          <ItsAMatch 
            image={prevImage} 
            onClose={this.handleReset}
          />
        }
        {isUnsure &&
          <AreYouSure
            onYes={this.handleRejection}
            onNo={this.handleReset}
            xCoords={deltaPosition.x}
          />
        }
      </div>
    );
  }
}

export default GameLoop;
