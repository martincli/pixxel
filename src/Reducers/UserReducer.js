import { GET_USER, UPDATE_USER } from '../Actions/UserActions';

export default function (state = { loading: true }, action) {
  switch (action.type) {
    case GET_USER:
      return { loading: false, ...action.payload };
    case UPDATE_USER:
      return { loading: false, ...action.payload };
    default:
      return state;
  }
}
