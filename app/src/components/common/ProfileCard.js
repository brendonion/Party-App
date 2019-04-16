import React, { Component } from 'react';
import Draggable from 'react-draggable';

class ProfileCard extends Component {

  render() {
    const { image, onDrag, onStop, position } = this.props;

    return (
      <Draggable
        onDrag={onDrag}
        onStop={onStop}
        position={position}
      >
        <div className="profile-card">
          <img className="profile-card__img" src={image} />
          <p className="profile-card__info">Name, Age</p>
        </div>
      </Draggable>
    );
  }
}

export default ProfileCard;
