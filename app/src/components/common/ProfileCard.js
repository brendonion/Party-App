import React, { Component } from 'react';
import { ME_1 } from '@/constants/assets';

class ProfileCard extends Component {
  render() {
    return (
      <div className="profile-card">
        <img className="profile-card__img" src={ME_1} />
        <p className="profile-card__info">Name, Age</p>
      </div>
    );
  }
}

export default ProfileCard;
