import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyB0Wr84A1LvEph8eHo30S-1fIQ1aMvH6Do",
  authDomain: "vendorsendbazar-d065a.firebaseapp.com",
  projectId: "vendorsendbazar-d065a",
  storageBucket: "vendorsendbazar-d065a.firebasestorage.app",
  messagingSenderId: "899276570401",
  appId: "1:899276570401:web:79ab97085306fe6f104860",
  measurementId: "G-CJZFX9BEKP"
};

export const app = initializeApp(firebaseConfig);
console.log(app);
const analytics = getAnalytics(app);
