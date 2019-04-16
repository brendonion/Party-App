import React, { Component } from 'react';

class AreYouSure extends Component {
  render() {
    const { onYes, onNo } = this.props;

    return (
      <div className="are-you-sure">
        <div className="are-you-sure__modal">
          <h1>Wait... are you sure?</h1>
          <button onClick={onYes}>Yes</button>
          <button onClick={onNo}>No</button>
        </div>
      </div>
    );
  }
}

export default AreYouSure;
