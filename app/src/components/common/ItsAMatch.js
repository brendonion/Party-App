import React, { Component, Fragment } from 'react';
import { YOU, ALERT, VERIFIED } from '@/constants/assets';
import { EMAIL_TOKEN, TO_EMAIL, FROM_EMAIL } from '@/constants/keys';

class ItsAMatch extends Component {

  state = {
    isConfirmed: false,
    isEmailSent: false,
    name: '',
    phone: '',
  }

  handleSendMessage = () => {
    this.setState({ isConfirmed: true });
  }

  handleChange = (type) => (e) => {
    this.setState({ [type]: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { name, phone } = this.state;
    
    this.setState({ isEmailSent: true });
    Email.send({
      SecureToken: EMAIL_TOKEN,
      To: TO_EMAIL,
      From: FROM_EMAIL,
      Subject: 'It\'s A Match!',
      Body: `Name: ${name}, Phone: ${phone}`,
    });
  }

  render() {
    const { isConfirmed, isEmailSent, name, phone } = this.state;
    const { image, onClose } = this.props;

    return (
      <div className="match">
        {!isConfirmed &&
          <Fragment>
            <div className="match__prompt">
              <h1>It's A Match!</h1>
              <p>You and Brendan have liked each other.</p>
            </div>
            <div className="match__images">
              <img src={image} />
              <img src={YOU} />
            </div>
            <div className="match__options">
              <button onClick={this.handleSendMessage}>Send a Message</button>
              <button onClick={onClose}>Keep Playing</button>
            </div>
          </Fragment>
        }
        {isConfirmed &&
          <div className="match__form">
            <form onSubmit={this.handleSubmit} className="match__form__modal">
              {!isEmailSent &&
                <Fragment>
                  <img key={1} src={ALERT} />
                  <h2>Your account needs to be verified</h2>
                  <p>Enter your name and phone number:</p>
                  <input required placeholder="Name" onChange={this.handleChange('name')} />
                  <input required type="tel" placeholder="Phone number" onChange={this.handleChange('phone')} />
                  <button>Submit</button>
                </Fragment>
              }
              {isEmailSent &&
                <Fragment>
                  <img key={2} src={VERIFIED} />
                  <h2>Thanks! 😉</h2>
                  <p className="match__form__hidden-text">Name: {name}, Phone: {phone}</p>
                </Fragment>
              }
            </form>
          </div>
        }
      </div>
    );
  }
}

export default ItsAMatch;
