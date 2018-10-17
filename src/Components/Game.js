import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { shuffle } from 'lodash';
import { 
  getGame,
  joinGame,
  startGame,
  setPhrase,
  submitDrawing,
  chooseWinner,
  continueToNextRound,
  attachGameListener,
  detachGameListener
} from "../Actions/GameActions";
import NavBar from './NavBar';
import Canvas from './Canvas';
import PlayerList from './PlayerList';
import Loading from './Loading';

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      submitting: false,
      gameIdCopied: false,
      drawings: [],
      currDrawing: 0,
      phrase: '',
      error: ''
    };

    this.joinGame = this.joinGame.bind(this);
    this.startGame = this.startGame.bind(this);
    this.copyGameId = this.copyGameId.bind(this);
    this.attemptSetPhrase = this.attemptSetPhrase.bind(this);
    this.attemptSubmitDrawing = this.attemptSubmitDrawing.bind(this);
    this.chooseWinner = this.chooseWinner.bind(this);
    this.continueToNextRound = this.continueToNextRound.bind(this);
  }

  componentWillMount() {
    this.props.getGame(this.props.match.params.id).then(() => {
      this.setState({ loading: false });
      this.props.attachGameListener(this.props.game.id, this.props.history);
    });
  }

  componentWillReceiveProps() {
    const game = this.props.game;
    if (game.started) {
      const activeRound = game.players[this.props.user.uid].activeRound;
      const judgeId = (activeRound === game.status.round) ? game.status.currentJudgeId : game.roundData[activeRound].judgeId;

      let drawings = shuffle(Object.entries(this.props.game.players))
        .filter(([uid,playerData]) => { return uid !== judgeId })
        .map(([uid,playerData]) => { return [uid, playerData.name, playerData.drawings[activeRound]] });

      this.setState({ drawings });
    }
  }

  componentDidUpdate() {
    const game = this.props.game;
    if (game.started) {
      const activeRound = game.players[this.props.user.uid].activeRound;

      // set current drawing to winning drawing on round end page
      if (activeRound < game.status.round) {
        this.state.drawings.forEach((drawing, index) => {
          if (game.roundData[activeRound].winnerId === drawing[0]) {
            if (this.state.currDrawing !== index) {
              this.setState({ currDrawing: index });
            }
          }
        });
      }
    }
  }

  componentWillUnmount() {
    this.props.detachGameListener(this.props.game.id);
  }

  joinGame() {
    this.props.joinGame(
      this.props.game.id,
      this.props.user.uid,
      this.props.user.displayName
    );
  }

  startGame() {
    this.props.startGame(this.props.game.id);
  }

  copyGameId() {
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.setAttribute('id', 'dummy');
    document.getElementById('dummy').value = this.props.game.id;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);

    this.setState({ gameIdCopied: true });
    setTimeout(() => {
      this.setState({ gameIdCopied: false });
    }, 2000);
  }

  attemptSetPhrase(ev) {
    ev.preventDefault();
    this.setState({ error: '' });
    const phrase = this.state.phrase;

    if (!phrase || !phrase.match(/^[a-zA-Z0-9 ]+$/)) {
      this.setState({ error: 'Invalid phrase.' });
      return;
    }

    if (phrase.length > 30) {
      this.setState({ error: 'Phrase is too long.' });
      return;
    }

    this.props.setPhrase(
      this.props.game.id,
      this.state.phrase
    ).then(() => { 
      this.props.history.push(`/`); 
      this.props.history.push(`/game/${this.props.game.id}`);
    }).catch(error => {
      this.setState({ error: error.message })
    });
  }

  attemptSubmitDrawing() {
    this.setState({ submitting: true });
    this.props.submitDrawing(this.props.user.uid, this.props.game.id, this.canvasWrapper.canvas.toDataURL());
  }

  changeDrawing(direction) {
    if (direction === 'prev') {
      if (this.state.currDrawing === 0) {
        this.setState({ currDrawing: this.state.drawings.length - 1 }); 
      } else {
        this.setState({ currDrawing: this.state.currDrawing - 1 })
      }
    }

    if (direction === 'next') {
      if (this.state.currDrawing === this.state.drawings.length - 1) {
        this.setState({ currDrawing: 0 }); 
      } else {
        this.setState({ currDrawing: this.state.currDrawing + 1 })
      }
    }
  }

  chooseWinner() {
    const gameId = this.props.game.id;
    const drawing = this.state.drawings[this.state.currDrawing];
    const uid = drawing[0];
    this.props.chooseWinner(gameId, uid);
  }

  continueToNextRound() {
    this.props.continueToNextRound(this.props.game.id, this.props.user.uid);
  }

  render() {
    if (this.state.loading) {
      return (
        <div>
          <NavBar />
        </div>
      );
    }
    if (this.props.game) {
      const game = this.props.game;

      // game started
      if (game.started) {

        // user not in game
        if (!game.playerIds.includes(this.props.user.uid)) {
          return <Redirect to='/home' />;
        }
        const activeRound = game.players[this.props.user.uid].activeRound;

        // completed round
        if (game.status.round > activeRound) {
          return (
            <div>
              <NavBar />
              {this.state.drawings.length > 0 &&
                <div className="round-end-page centered">
                  <div className="message-wrapper">
                    <div>The phrase this round was <span style={{fontWeight: 'bold'}}>{game.roundData[activeRound].phrase}</span>.</div>
                    <div>The winner was <span style={{fontWeight: 'bold'}}>{game.players[game.roundData[activeRound].winnerId].name}</span>.</div>
                    {game.ended && <div className="game-end-message">{game.players[game.roundData[activeRound].winnerId].name} has won the game!</div>}
                  </div>

                  <div className="drawing-wrapper">
                    {this.state.drawings.length > 0 && <img className="drawing" src={this.state.drawings[this.state.currDrawing][2]} alt="" />}
                    <div className="nav">
                      <a onClick={this.changeDrawing.bind(this,'prev')}><i className="fa fa-caret-left"></i> Prev</a>
                      <div className="page">{`${this.state.drawings[this.state.currDrawing][1]}'s drawing`}</div>
                      <a onClick={this.changeDrawing.bind(this,'next')}>Next <i className="fa fa-caret-right"></i></a>
                    </div>
                  </div>

                  {game.ended ?
                    <button onClick={() => this.props.history.push('/home')}>LEAVE GAME</button>
                  :
                    <button onClick={this.continueToNextRound}>CONTINUE</button>
                  }

                  <PlayerList 
                    players={game.players}
                    judgeId={game.roundData[activeRound].judgeId}
                  />
                </div>
              }
            </div>
          );
        }

        // user is judge
        if (game.status.currentJudgeId === this.props.user.uid) {

          // phrase not set
          if (!game.status.currentPhrase) {
            return (
              <div>
                <NavBar />
                <div className="set-phrase-page centered">
                  <div className="short-message">
                    <div>You are the judge this round.</div>
                    <div>Set the phrase for the other players to draw.</div>
                  </div>
                  <form onSubmit={this.attemptSetPhrase}>
                  <input onChange={(ev) => this.setState({ phrase: ev.target.value, error: '' })} id="phrase" type="text" placeholder="Enter Phrase" autoComplete="off"/>
                  <CSSTransition
                    in={Boolean(this.state.error)}
                    classNames="error"
                    timeout={200}>
                    <div className="error">{this.state.error}</div>
                  </CSSTransition>
                  <button type="submit">SET PHRASE</button>
                </form>
                </div>
              </div>
            )
          }

          // waiting for drawings
          if (game.status.haventSubmitted.length > 0) {
            return (
              <div>
                <NavBar />
                <div className="message-page centered">
                  <div className="short-message content-box">
                    <div>You are the judge this round.</div>
                    <div>Waiting for players to submit their drawings.</div>
                  </div>
                </div>
              </div>
            );
          }

          // judging screen
          return (
            <div>
              <NavBar />
              {this.state.drawings.length > 0 &&
                <div className="judging-page centered">
                  <div className="phrase-wrapper">
                    <div className="label">Choose the winning drawing!</div>
                    <div className="phrase">{game.status.currentPhrase}</div>
                  </div>
                  
                  <div className="drawing-wrapper">
                    <img className="drawing" src={this.state.drawings[this.state.currDrawing][2]} alt="" />
                    <div className="nav">
                      <a onClick={this.changeDrawing.bind(this,'prev')}><i className="fa fa-caret-left"></i> Prev</a>
                      <div className="page">{this.state.currDrawing+1} / {this.state.drawings.length}</div>
                      <a onClick={this.changeDrawing.bind(this,'next')}>Next <i className="fa fa-caret-right"></i></a>
                    </div>
                  </div>
                
                  <button onClick={this.chooseWinner}>CHOOSE THIS DRAWING</button>

                  <PlayerList 
                    players={game.players}
                    judgeId={game.status.currentJudgeId}
                  />
                </div>
              }
            </div>
          );
        }

        // user is not judge, phrase not set
        if (!game.status.currentPhrase) {
          return (
            <div>
              <NavBar />
              <div className="message-page centered">
                <div className="short-message content-box">
                  <div>You are drawing this round.</div>
                  <div>Waiting for the judge to set the phrase.</div>
                </div>
              </div>
            </div>
          );
        }

        // user is not judge, phrase is set, drawing not submitted
        if (game.status.haventSubmitted.includes(this.props.user.uid)) {
          return (
            <div style={{ height: '100%' }}>
              <NavBar />

              {this.state.submitting ? 
                <Loading />
              :
                <div className="drawing-page centered">
                  <div className="phrase-wrapper">
                    <div className="label">Draw this:</div>
                    <div className="phrase">{game.status.currentPhrase}</div>
                  </div>
                  <Canvas ref={(node) => { this.canvasWrapper = node }} />
                  <div className="buttons">
                    <button className="reset-button" onClick={() => this.canvasWrapper.reset()}>RESET</button>
                    <button className="submit-button" onClick={this.attemptSubmitDrawing}>SUBMIT</button>
                  </div>
                  <PlayerList 
                    players={game.players}
                    judgeId={game.status.currentJudgeId}
                  />
                </div>
              }    
            </div>
          )
        }

        // user is not judge, phrase is set, drawing submitted
        if (game.status.haventSubmitted.length > 0) {
          return (
            <div>
              <NavBar />
              <div className="message-page centered">
                <div className="short-message content-box">
                  <div>You have submitted your drawing.</div>
                  <div>Waiting for other players to submit their drawings.</div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div>
            <NavBar />
            <div className="message-page centered">
              <div className="short-message content-box">
                <div>You have submitted your drawing.</div>
                <div>Waiting for the judge to choose a winner.</div>
              </div>
            </div>
          </div>
        );
      }

      // game not started
      return (
        <div>
          <NavBar />
          <div className="pregame-page centered">
            <div className="game-data-wrapper">
              <div className="header">Game Info</div>
              <div className="game-data content-box">
                <div><span className="label">Game ID:</span> <span style={{fontWeight: 'bold', color: '#134aa3'}}>{game.id}</span></div>
                <div><span className="label">Host:</span> {game.hostName}</div>
                <div><span className="label">Created:</span> {(new Date(game.createdAt.seconds*1000)).toLocaleString('en-US')}</div>
                <div><span className="label">Game Mode:</span> First to 5 Points</div>
              </div>
            </div>

            <div className="player-list-wrapper">
              <div className="header">Players</div>
              <div className="player-list content-box">
                {Object.entries(game.players).map(([uid,playerData]) => {
                  return <div key={uid}>{playerData.name} {uid === game.hostId && <i className="fa fa-user-circle"></i>}</div>
                })}
              </div>
            </div>

            {!game.playerIds.includes(this.props.user.uid) ?
              <div className="footer">
                <button onClick={this.joinGame}>JOIN GAME</button>
              </div>
            :
              <div className="footer">
                {game.hostId === this.props.user.uid ? 
                  <div>
                    <CSSTransition
                      in={Boolean(this.state.gameIdCopied)}
                      classNames="success"
                      timeout={200}>
                      <div className="success">Game ID copied!</div>
                    </CSSTransition>
                    <button onClick={this.copyGameId}>COPY GAME ID</button>
                    <button onClick={this.startGame} disabled={Object.keys(game.players).length < 3}>START GAME</button>
                    <div className="message" style={{display: Object.keys(game.players).length < 3 ? 'block' : 'none'}}>( At least 3 players are required to start the game. )</div>
                  </div>
                :
                  'Waiting for host to start the game...'
                }
              </div>
            }
          </div>
        </div>
      );
    }

    // invalid game
    return <Redirect to='/home' />;
  }
}

function mapStateToProps(state) {
  return { 
    user: state.user,
    game: state.game
  }
}

export default connect(mapStateToProps, { 
  getGame,
  joinGame,
  startGame,
  setPhrase,
  submitDrawing,
  chooseWinner,
  continueToNextRound,
  attachGameListener,
  detachGameListener
})(Game);
