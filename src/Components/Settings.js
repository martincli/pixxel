import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import NavBar from './NavBar';
import { editProfile } from '../Actions/UserActions';
import { updateNames } from '../Actions/GameActions';

class Settings extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      selected: 'profile',
      displayName: this.props.user.displayName,
      displayNameError: '',
      displayNameSuccess: false
    };

    this.submitEdit = this.submitEdit.bind(this);
  }

  submitEdit(ev) {
    ev.preventDefault();
    this.setState({ displayNameError: '' });

    if(this.state.displayName.length > 20) {
      this.setState({ displayNameError: 'Name is too long.'});
      return;
    }
    
    if(!this.state.displayName.match(/^[a-zA-Z0-9]+$/)) {
      this.setState({ displayNameError: 'Name contains invalid characters.' });
      return;
    }

    this.props.editProfile(this.state.displayName).then(() => {
      this.props.updateNames(this.props.user.uid, this.state.displayName);
    }).then(() => {
      this.setState({ displayNameSuccess: true })
    }).catch(error => {
      this.setState({ displayNameError: error });
    });
  }

  render() {
    return (
      <div>
        <NavBar />
        <div className="settings-page centered">
          <div className="sidebar">
            <div className={this.state.selected === 'profile' ? 'selected' : undefined} onClick={() => this.setState({ selected: 'profile', displayNameError: '', displayNameSuccess: false })}>Profile Settings</div>
            <div className={this.state.selected === 'game' ? 'selected' : undefined} onClick={() => this.setState({ selected: 'game', displayNameError: '', displayNameSuccess: false })}>Game Settings</div>
          </div>
          <div className="main">
            {this.state.selected === 'profile' && 
              <form onSubmit={this.submitEdit}>
                <div className="form-element">
                  <label htmlFor="name">Email</label>
                  <input disabled id="email" type="text" value={this.props.user.email} />
                </div>
                <div className="form-element" style={{marginBottom: '20px'}}>
                  <label htmlFor="display-name">Display Name</label>
                  <input onChange={(ev) => this.setState({ displayName: ev.target.value, displayNameError: '', displayNameSuccess: false })} id="display-name" type="text" value={this.state.displayName} autoComplete="off" />
                </div>
                <CSSTransition
                  in={Boolean(this.state.displayNameError)}
                  classNames="error"
                  timeout={200}>
                  <div className="error">{this.state.displayNameError}</div>
                </CSSTransition>
                <CSSTransition
                  in={Boolean(this.state.displayNameSuccess)}
                  classNames="success"
                  timeout={200}>
                  <div className="success">Name successfully changed!</div>
                </CSSTransition>
                <button type="submit" disabled={!this.state.displayName || this.state.displayName === this.props.user.displayName}>Submit</button>
              </form>
            }
            {this.state.selected === 'game' && 
              <div className="todo centered">
                <i className="fa fa-exclamation-triangle"></i> Coming soon.
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { user: state.user }
}

export default connect(mapStateToProps, { editProfile, updateNames })(Settings);
