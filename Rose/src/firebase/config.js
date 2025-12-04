import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCwDlSDJwLgTleetPH5iCfEH01JiPyCRoQ",
  authDomain: "my-game-6273c.firebaseapp.com",
  databaseURL: "https://my-game-6273c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-game-6273c",
  storageBucket: "my-game-6273c.firebasestorage.app",
  messagingSenderId: "407172408466",
  appId: "1:407172408466:web:c7dbed948732b91d1db24b",
  measurementId: "G-RFHNTER82D"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
