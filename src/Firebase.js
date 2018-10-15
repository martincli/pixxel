import * as firebase from 'firebase';

const config = {
  apiKey: "AIzaSyAUWHUH71tjGtE6W44NwPmqmMbOOY5o-II",
  authDomain: "pixxel-5b12e.firebaseapp.com",
  databaseURL: "https://pixxel-5b12e.firebaseio.com",
  projectId: "pixxel-5b12e",
  storageBucket: "pixxel-5b12e.appspot.com",
  messagingSenderId: "977966340794"
};
firebase.initializeApp(config);

export const db = firebase.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

export const games = db.collection('games'); 
export const auth = firebase.auth();
