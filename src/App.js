import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { connect } from "react-redux";
import { getUser } from "./Actions/UserActions";
import AuthRequired from './Components/AuthRequired';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Home from './Components/Home';
import Settings from './Components/Settings';
import Join from './Components/Join';
import Game from './Components/Game';
import './Styles/App.scss';
import 'font-awesome/css/font-awesome.min.css'; 

class App extends Component {
  componentWillMount() {
    this.props.getUser();
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/home" component={AuthRequired(Home)} />
          <Route path="/settings" component={AuthRequired(Settings)} />
          <Route path="/join" component={AuthRequired(Join)} />
          <Route path="/game/:id" component={AuthRequired(Game)} />
        </Switch>
      </Router>
    );
  }
}

export default connect(null, { getUser })(App);
