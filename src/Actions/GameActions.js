import * as firebase from 'firebase';
import { db, games } from '../Firebase';
import { shuffle } from 'lodash';

export const GET_GAME = 'get_game';
export const GET_USER_GAMES = 'get_user_games';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/pixxel/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'vqb2ko26';

const gameListeners = {};
const userGamesListeners = {};

export function getGame(id) {
  return dispatch => games.doc(id).get().then(doc => {
    if(doc.exists) {
      dispatch({
        type: GET_GAME,
        payload: doc.data()
      });
    } else {
      dispatch({
        type: GET_GAME,
        payload: null
      });
    }
  });
}

export function getUserGames(uid) {
  return dispatch => games.where('playerIds', 'array-contains', uid).get().then(querySnapshot => {
    dispatch({
      type: GET_USER_GAMES,
      payload: querySnapshot.docs.map(doc => {
        return doc.data();
      })
    });
  });
}

export function attachGameListener(gameId) {
  return dispatch => {
    gameListeners[gameId] = games.doc(gameId).onSnapshot(doc => {
      dispatch({
        type: GET_GAME,
        payload: doc.data()
      });
    });
  };
}

export function detachGameListener(gameId) {
  return () => {
    if(gameListeners.gameId) {
      gameListeners[gameId]();
    };
  };
}

export function attachUserGamesListener(uid) {
  return dispatch => {
    userGamesListeners[uid] = games.where('playerIds', 'array-contains', uid).onSnapshot(querySnapshot => {
      dispatch({
        type: GET_USER_GAMES,
        payload: querySnapshot.docs.map(doc => {
          return doc.data();
        })
      });
    });
  }
}

export function detachUserGamesListener(uid) {
  return () => {
    if(userGamesListeners.uid) {
      userGamesListeners[uid]();
    };
  };
}

export function updateNames(uid, newName) {
  const batch = db.batch();
  return () => games.where('playerIds', 'array-contains', uid).get().then(querySnapshot => {
    querySnapshot.docs.forEach(doc => {
      if(doc.data().hostId === uid) {
        batch.update(doc.ref, {
          hostName: newName
        });
      }
      batch.update(doc.ref, {
        [`players.${uid}.name`]: newName
      });
    });
    batch.commit();
  });
}

export function joinGame(gameId, uid, userName) {
  return () => games.doc(gameId).get().then(doc => {
    if (doc.exists) {
      if (!doc.data().started) {
        doc.ref.update({
          playerIds: firebase.firestore.FieldValue.arrayUnion(uid),
          [`players.${uid}`]: {
            name: userName,
            points: 0,
            drawings: [],
            activeRound: 0
          }
        });
      } else {
        throw new Error('Game has already started.');
      }
    } else {
      throw new Error('Game does not exist.');
    }
  });
}

export function createGame(gameId, uid, userName) {
  return () => games.doc(gameId).set({ 
    id: gameId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    hostId: uid,
    hostName: userName,
    playerIds: [uid],
    players: {
      [uid]: {
        name: userName,
        points: 0,
        drawings: [],
        activeRound: 0
      }
    },
    started: false,
    ended: false,
    pointsToWin: 5,
    status: {
      round: 0,
      currentJudgeIndex: '',
      currentJudgeId: '',
      currentPhrase: '',
      haventSubmitted: []
    },
    roundData: []
  });
}

export function startGame(gameId) {
  return () => games.doc(gameId).get().then(doc => {
    const playerIds = shuffle(doc.data().playerIds);

    doc.ref.update({
      playerIds,
      status: {
        round: 0,
        currentJudgeIndex: 0,
        currentJudgeId: playerIds[0],
        currentPhrase: '',
        haventSubmitted: playerIds.slice(1)  
      },
      started: true
    });
  });
}

export function setPhrase(gameId, phrase) {
  return () => games.doc(gameId).update({ 
    'status.currentPhrase': phrase
  });
}

export function submitDrawing(uid, gameId, drawingData) {
  return () => {
    const formData = new FormData();
    formData.append('file', encodeURI(drawingData));
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    }).then(res => res.json()).then(data => {
      games.doc(gameId).update({
        [`players.${uid}.drawings`]: firebase.firestore.FieldValue.arrayUnion(data.secure_url),
        'status.haventSubmitted': firebase.firestore.FieldValue.arrayRemove(uid),
      });
    });
  };
}

export function chooseWinner(gameId, uid) {
  return () => db.runTransaction(transaction => {
    const ref = games.doc(gameId);
    return transaction.get(ref).then(doc => {
      const game = doc.data();
      const playerIds = game.playerIds;
      const judgeId = game.status.currentJudgeId;

      const newPoints = game.players[uid].points + 1;
      const newRound = game.status.round + 1;
      const newJudgeIndex = (game.status.currentJudgeIndex + 1) % game.playerIds.length;
      const newJudgeId = playerIds[newJudgeIndex];
      const newJudgeDrawings = game.players[judgeId].drawings.concat(''); // can't use arrayUnion because of multiple empty entries
      const newHaventSubmitted = playerIds.filter(id => { return id !== newJudgeId });

      const prevRound = {
        judgeId: judgeId,
        phrase: game.status.currentPhrase,
        winnerId: uid
      }
      const ended = (newPoints === game.pointsToWin) ? true : false;

      transaction.update(ref, {
        [`players.${judgeId}.drawings`]: newJudgeDrawings,
        [`players.${uid}.points`]: newPoints,
        ended,
        status: {
          round: newRound,
          currentJudgeIndex: newJudgeIndex,
          currentJudgeId: newJudgeId,
          currentPhrase: '',
          haventSubmitted: newHaventSubmitted
        },
        roundData: firebase.firestore.FieldValue.arrayUnion(prevRound),
      });
    });
  });
}

export function continueToNextRound(gameId, uid) {
  return () => games.doc(gameId).get().then(doc => {
    const newRound = doc.data().players[uid].activeRound + 1;

    doc.ref.update({
      [`players.${uid}.activeRound`]: newRound,
    });
  });
}
