import { GET_USER_GAMES } from '../Actions/GameActions';

export default function (state = [], action) {
  switch (action.type) {
    case GET_USER_GAMES:
      return action.payload;
    default:
      return state;
  }
}
