import { combineReducers } from 'redux';
import UserReducer from './UserReducer';
import GameReducer from './GameReducer';
import UserGamesReducer from './UserGamesReducer';

import { LOGOUT } from '../Actions/UserActions';

const appReducer = combineReducers({
  user: UserReducer,
  game: GameReducer,
  userGames: UserGamesReducer
});

const rootReducer = (state, action) => {
  if (action.type === LOGOUT) {
    state = undefined;
  }
  return appReducer(state, action);
}

export default rootReducer;
