// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQvuY42kZ7cbZ6FGB9GTmsYDP0tbfvqyk",
  authDomain: "bball-stats-app.firebaseapp.com",
  projectId: "bball-stats-app",
  storageBucket: "bball-stats-app.firebasestorage.app",
  messagingSenderId: "790566038888",
  appId: "1:790566038888:web:b508ea6a9a824e0665badd",
  measurementId: "G-92KY2T22SV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const auth = getAuth(app);