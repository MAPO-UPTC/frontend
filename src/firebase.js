import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    "apiKey": "AIzaSyDCyRrTCoKhf8Mdie8M45oPK2ViZIniK9I",
    "authDomain": "mapo-c59b6.firebaseapp.com",
    "projectId": "mapo-c59b6",
    "storageBucket": "mapo-c59b6.appspot.com",
    "messagingSenderId": "888526418042",
    "appId": "1:888526418042:web:07faf8987ffd17c13f0bc3",
    "measurementId": "G-ZFPK0K0DHW",
    "databaseURL": ""
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();