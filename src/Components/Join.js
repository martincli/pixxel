import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { joinGame } from "../Actions/GameActions";
import NavBar from './NavBar';

class Join extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameId: '',
      error: ''
    };

    this.attemptJoin = this.attemptJoin.bind(this);
  }

  attemptJoin(ev) {
    ev.preventDefault();
    this.setState({ error: '' });
    const gameId = this.state.gameId;

    if (!gameId.match(/^[a-zA-Z0-9]+$/)) {
      this.setState({ error: 'Invalid game ID.' });
      return;
    }

    this.props.joinGame(
      this.state.gameId,
      this.props.user.uid,
      this.props.user.displayName
    ).then(() => { 
      this.props.history.push(`/game/${gameId}`); 
    }).catch(error => {
      this.setState({ error: error.message })
    });
  }

  render() {
    return (
      <div>
        <NavBar />
        <div className="join-page centered">
          <form onSubmit={this.attemptJoin}>
            <input onChange={(ev) => this.setState({ gameId: ev.target.value, error: '' })} id="game-id" type="text" placeholder="Enter Game ID" autoComplete="off"/>
            <CSSTransition
              in={Boolean(this.state.error)}
              classNames="error"
              timeout={200}>
              <div className="error">{this.state.error}</div>
            </CSSTransition>
            <button type="submit">JOIN GAME</button>
          </form>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { user: state.user }
}

export default connect(mapStateToProps, { joinGame })(Join);
