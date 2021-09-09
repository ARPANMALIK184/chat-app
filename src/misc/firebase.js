import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database'; // to interact with the firebase database
import 'firebase/storage';

const config = {
    apiKey: 'AIzaSyBtM3BKBOWlJ3cr6Gx3ygqBxaidl3MEHHs',
    authDomain: 'chat-web-app-c9264.firebaseapp.com',
    projectId: 'chat-web-app-c9264',
    storageBucket: 'chat-web-app-c9264.appspot.com',
    messagingSenderId: '164647008829',
    appId: '1:164647008829:web:69beb663e4954c2aea8854',
};

const app = firebase.initializeApp(config);

export const auth = app.auth(); // auth object to interact with firebase

export const database = app.database(); // database object to interact with firebase database

export const storage = app.storage(); // to access firebase storage
