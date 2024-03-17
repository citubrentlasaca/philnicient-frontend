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

const firebaseConfig2 = {
    apiKey: "AIzaSyCqN8XuVuVQQRM1WYwZf5kXBXZtZfqLJOA",
    authDomain: "philnits-fe-proficiency-db.firebaseapp.com",
    projectId: "philnits-fe-proficiency-db",
    storageBucket: "philnits-fe-proficiency-db.appspot.com",
    messagingSenderId: "1025918236480",
    appId: "1:1025918236480:web:8e13af2122eefb98372ca5",
    measurementId: "G-YBVXRRQYMR"
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseApp2 = initializeApp(firebaseConfig2, 'secondFirebase');

const firestore = getFirestore(firebaseApp);
const firestore2 = getFirestore(firebaseApp2);

export { firestore, firestore2 };
