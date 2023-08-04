// Import the functions you need from the SDKs you need
import { firebase } from 'firebase';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtLTlXg_FUUQYU_Zp_MsXUDrF5MOjQtSA",
  authDomain: "rn-fresh-bear-near-me.firebaseapp.com",
  projectId: "rn-fresh-bear-near-me",
  storageBucket: "rn-fresh-bear-near-me.appspot.com",
  messagingSenderId: "224041714031",
  appId: "1:224041714031:web:4e71cefa00f58fc9bca89a",
};

// if firebase app length got smth, use firebaseconfig, else use this app
!firebase.apps.length ?  firebase.initializeApp(firebaseConfig) : firebase.app();


// Initialise firebase
export default firebase



