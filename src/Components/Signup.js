import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import Loading from './Loading';
import { createUser } from '../Actions/UserActions';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      passwordConfirm: '',
      error: ''
    };

    this.submitSignup = this.submitSignup.bind(this);
  }

  componentWillMount() {
    if (this.props.user.email) {
      this.props.history.push('/home');
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.user.email) {
      nextProps.history.push('/home');
    }
  }

  isValid() {
    const { email, password, passwordConfirm } = this.state;

    if (email === '' || password === '' || passwordConfirm === '' ) {
      this.setState({
        error: 'All fields are required.'
      });
      return false;
    }

    if (password !== passwordConfirm) {
      this.setState({
        error: 'Passwords do not match.'
      });
      return false;
    }

    return true;
  }

  submitSignup(ev) {
    ev.preventDefault();
    this.setState({ error: '' });

    if (!this.isValid()) {
      return;
    }

    this.props.createUser(this.state.email, this.state.password).then((userCredential) => {
      userCredential.user.updateProfile({
        displayName: this.state.email,
      }).then(() => {
        window.location.reload();
      });
    }).catch(error => {
      this.setState({
        error: error.message
      });
    });
  }

  render() {
    if (this.props.user.loading) {
      return <Loading />;
    }
    
    return (
      <div className="auth-page centered">
        <div className="title">PixxeL</div>
        <div className="intro content-box">A multiplayer drawing game that combines elements of Pictionary and Apples to Apples.</div>
        <form onSubmit={this.submitSignup}>
          <div className="form-element">
            <label htmlFor="email">Email</label>
            <input onChange={(ev) => this.setState({ email: ev.target.value, error: '' })} id="email" type="text" />
          </div>
          <div className="form-element">
            <label htmlFor="password">Password</label>
            <input onChange={(ev) => this.setState({ password: ev.target.value, error: '' })} id="password" type="password" />
          </div>
          <div className="form-element" style={{marginBottom: '10px'}}>
            <label htmlFor="password-confirm" className="small">Confirm Password</label>
            <input onChange={(ev) => this.setState({ passwordConfirm: ev.target.value })} id="password-confirm" type="password" />
          </div>
          <CSSTransition
            in={Boolean(this.state.error)}
            classNames="error"
            timeout={200}>
            <div className="error">{this.state.error}</div>
          </CSSTransition>
          <button type="submit">CREATE ACCOUNT</button>
        </form>
        <div className="footer content-box">Already have an account? <Link to="/">Log in here</Link>.</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps, { createUser })(Signup);
