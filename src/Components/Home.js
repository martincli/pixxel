import React, { Component } from 'react';
import { connect } from 'react-redux';
import Hashids from 'hashids';
import NavBar from './NavBar';
import {
  getUserGames,
  createGame,
  attachUserGamesListener,
  detachUserGamesListener
} from '../Actions/GameActions';

class Home extends Component {
  constructor(props) {
    super(props);
    this.createGame = this.createGame.bind(this);
  }

  componentWillMount() {
    this.props.getUserGames(this.props.user.uid);
    this.props.attachUserGamesListener(this.props.user.uid);
  }

  componentWillUnmount() {
    this.props.detachUserGamesListener(this.props.user.uid);
  }

  createGame() {
    const gameId = (new Hashids()).encode(Date.now() + Date.parse(this.props.user.metadata.creationTime));
    this.props.createGame(gameId, this.props.user.uid, this.props.user.displayName).then(() => {
      this.props.history.push(`/game/${gameId}`);
    });
  }

  renderStatus(game) {
    const uid = this.props.user.uid;

    if (!game.started) {
      return 'Game Not Started';
    }
    if (game.players[uid].activeRound < game.status.round) {
      return 'End of Round';
    }
    if (uid === game.status.currentJudgeId) {
      if (!game.status.currentPhrase) {
        return 'Setting Phrase';
      }
      if (game.status.haventSubmitted.length > 0) {
        return 'Waiting for Drawings';
      }
      return 'Judging Drawings';
    }
    if (!game.status.currentPhrase) {
      return 'Waiting for Phrase';
    }
    if (game.status.haventSubmitted.includes(uid)) {
      return 'Drawing';
    }
    if (game.status.haventSubmitted.length > 0) {
      return 'Waiting for Other Drawings';
    }
    return 'Waiting for Judging';
  }

  render() {
    return (
      <div>
        <NavBar />
        <div className="home-page centered">
          <div className="header">Active Games</div>
          <div className="games-list content-box">
            <table>
              <thead>
                <tr>
                  <th className="id">Game ID</th>
                  <th className="host">Host</th>
                  <th className="status">Status</th>
                </tr>
              </thead>
              {this.props.userGames.length > 0 && 
                <tbody>
                  {this.props.userGames.filter(game => {
                    return game.ended !== true;
                  }).map(game => {
                    return (
                      <tr key={game.id} onClick={() => this.props.history.push(`/game/${game.id}`)}>
                        <td className="id">{game.id}</td>
                        <td className="host">{game.hostId === this.props.user.uid ? '( You )' : game.hostName}</td>
                        <td className="status">{this.renderStatus(game)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              }
            </table>
          </div>
          <div className="buttons">
            <button onClick={() => this.props.history.push('/join')}>JOIN GAME</button>
            <button onClick={this.createGame}>CREATE GAME</button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { 
    user: state.user,
    userGames: state.userGames 
  };
}

export default connect(mapStateToProps, { 
  getUserGames,
  createGame,
  attachUserGamesListener,
  detachUserGamesListener
})(Home);
