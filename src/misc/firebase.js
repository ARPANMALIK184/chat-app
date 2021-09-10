import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database'; // to interact with the firebase database
import 'firebase/storage';

const config = {
    apiKey: 'AIzaSyCJ3Yv3jtRjfSA1VXAE6McOFJcy5B64xDE',
    authDomain: 'chat-web-app-b20c4.firebaseapp.com',
    databaseURL:
        'https://chat-web-app-b20c4-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'chat-web-app-b20c4',
    storageBucket: 'chat-web-app-b20c4.appspot.com',
    messagingSenderId: '311378574488',
    appId: '1:311378574488:web:35baacb488b89186fe24ed',
};

const app = firebase.initializeApp(config);

export const auth = app.auth(); // auth object to interact with firebase

export const database = app.database(); // database object to interact with firebase database

export const storage = app.storage(); // to access firebase storage
