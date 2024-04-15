import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBYslsNBGdOWBWDTKQDYqfmfxlF2wWm6aY",
    authDomain: "philnits-recommendation-system.firebaseapp.com",
    projectId: "philnits-recommendation-system",
    storageBucket: "philnits-recommendation-system.appspot.com",
    messagingSenderId: "179273781052",
    appId: "1:179273781052:web:37bec31b5751d7a8bd5839",
    measurementId: "G-ZJC36WWJWH"
};

const firebaseApp = initializeApp(firebaseConfig);

const firestore = getFirestore(firebaseApp);

export { firestore };
