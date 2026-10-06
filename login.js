import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyDJXii7FJiHRPQ1AQ1wK68Wg5G8q5ilmh8",
    authDomain: "debt-database-56dc1.firebaseapp.com",
    projectId: "debt-database-56dc1",
    storageBucket: "debt-database-56dc1.firebasestorage.app",
    messagingSenderId: "614043484002",
    appId: "1:614043484002:web:781b69d8955aa9b7bc363b",
    measurementId: "G-58YSEC2RED"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


document.getElementById("loginForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    try {

        await signInWithEmailAndPassword(auth, email, password);

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error(error);

        message.textContent = "Incorrect email or password.";

    }

});