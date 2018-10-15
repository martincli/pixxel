import { GET_GAME } from '../Actions/GameActions';

export default function (state = {}, action) {
  switch (action.type) {
    case GET_GAME:
      return action.payload;
    default:
      return state;
  }
}
