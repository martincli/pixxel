import { auth } from '../Firebase';

export const GET_USER = 'get_user';
export const UPDATE_USER = 'update_user';
export const LOGOUT = 'logout';

export function getUser() {
  return dispatch => {
    auth.onAuthStateChanged(user => {
      dispatch({
        type: GET_USER,
        payload: user
      });
    });
  };
}

export function createUser(email, password) {
  return dispatch => auth.createUserWithEmailAndPassword(email, password);
}

export function login(email, password) {
  return dispatch => auth.signInWithEmailAndPassword(email, password);
}

export function logout() {
  return dispatch => auth.signOut().then(() => {
    dispatch({
      type: LOGOUT,
      payload: null
    });
  });
}

export function editProfile(displayName) {
  return dispatch => auth.currentUser.updateProfile({ displayName }).then(() => {
    dispatch({
      type: UPDATE_USER,
      payload: auth.currentUser
    });
  }); 
}
