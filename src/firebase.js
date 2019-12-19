import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

  var firebaseConfig = {
    apiKey: "AIzaSyAH8NKKy9JUd5AnmUv1EnU26nIUBU9eBxs",
    authDomain: "react-slack-web.firebaseapp.com",
    databaseURL: "https://react-slack-web.firebaseio.com",
    projectId: "react-slack-web",
    storageBucket: "react-slack-web.appspot.com",
    messagingSenderId: "1052265116550",
    appId: "1:1052265116550:web:7e535711a9968e83a4f207",
    measurementId: "G-JER7M25L59"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase; 