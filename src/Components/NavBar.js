import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import { logout } from '../Actions/UserActions';
import { Link } from 'react-router-dom';

class NavBar extends Component {
  render() {
    return (
      <div className="navbar">
        <div className="navbar-inner">
          <Link to="/home" className="title">PixxeL</Link>
          <div className="menu">
            <a className="menu-item desktop" onClick={() => this.props.history.push('/settings')}>{this.props.user.displayName}</a>
            <a className="menu-item desktop" onClick={this.props.logout}>Log Out <i className="fa fa-sign-out"></i></a>
            <a className="menu-item mobile" onClick={() => this.props.history.push('/settings')}><i className="fa fa-cog"></i></a>
            <a className="menu-item mobile" onClick={this.props.logout}><i className="fa fa-sign-out"></i></a>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { user: state.user };
}

export default withRouter(connect(mapStateToProps, { logout })(NavBar));
