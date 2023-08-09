// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtLTlXg_FUUQYU_Zp_MsXUDrF5MOjQtSA", //webapp
  //apiKey: "AIzaSyDIe20j9y7FeLjQrU9JFCV66hcmAXLOeo0", //android
  authDomain: "rn-fresh-bear-near-me.firebaseapp.com",
  projectId: "rn-fresh-bear-near-me",
  storageBucket: "rn-fresh-bear-near-me.appspot.com",
  messagingSenderId: "224041714031",
  appId: "1:224041714031:web:4e71cefa00f58fc9bca89a",
};

// if firebase app length got smth, use firebaseconfig, else use this app
// !firebase.apps.length ?  firebase.initializeApp(firebaseConfig) : firebase.app();


// Initialise firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);

