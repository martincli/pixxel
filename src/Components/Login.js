import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import Loading from './Loading';
import { login } from '../Actions/UserActions';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: ''
    };

    this.submitLogin = this.submitLogin.bind(this);
  }

  componentDidMount() {
    if (this.props.user.email) {
      this.props.history.replace('/home');
    }
  }
  
  componentDidUpdate() {
    if (this.props.user.email) {
      this.props.history.replace('/home');
    }
  }

  submitLogin(ev) {
    ev.preventDefault();
    this.setState({ error: '' });
    this.props.login(this.state.email, this.state.password).catch(error => {
      this.setState({ error });
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
        <form onSubmit={this.submitLogin}>
          <div className="form-element">
            <label htmlFor="email">Email</label>
            <input onChange={(ev) => this.setState({ email: ev.target.value, error: '' })} id="email" type="text" />
          </div>
          <div className="form-element" style={{marginBottom: '10px'}}>
            <label htmlFor="password">Password</label>
            <input onChange={(ev) => this.setState({ password: ev.target.value, error: '' })} id="password" type="password" />
          </div>
          <CSSTransition
            in={Boolean(this.state.error)}
            classNames="error"
            timeout={200}>
            <div className="error">Invalid username or password.</div>
          </CSSTransition>
          <button type="submit">LOG IN</button>
        </form>
        <div className="footer content-box">Don't have an account? <Link to="/signup">Sign up here</Link>.</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps, { login })(Login);
