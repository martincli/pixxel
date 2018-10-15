import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from 'react-router-dom';
import Loading from './Loading';

export default function(ProtectedComponent) {
  class Auth extends Component {
    render() {
      if (this.props.user.loading) {
        return <Loading />;
      }
      if (this.props.user.email) {
        return <ProtectedComponent {...this.props} />;
      }
      return <Redirect to='/' />;
    }
  }

  function mapStateToProps(state) {
    return { user: state.user };
  }

  return connect(mapStateToProps)(Auth);
}
