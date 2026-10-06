import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


const firebaseConfig = {

    apiKey: "AIzaSyDJXii7FJiHRPQ1AQ1wK68Wg5G8q5ilmh8",

    authDomain:
        "debt-database-56dc1.firebaseapp.com",

    projectId:
        "debt-database-56dc1",

    storageBucket:
        "debt-database-56dc1.firebasestorage.app",

    messagingSenderId:
        "614043484002",

    appId:
        "1:614043484002:web:781b69d8955aa9b7bc363b",

    measurementId:
        "G-58YSEC2RED"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


// =========================
// LOGIN
// =========================

document
    .getElementById("loginForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("loginMessage");

        message.textContent = "Signing in...";

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error(error);

            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message.textContent =
                    "Incorrect email or password.";

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message.textContent =
                    "Please enter a valid email.";

            } else {

                message.textContent =
                    "Unable to sign in. Please try again.";

            }

        }

    });


// =========================
// SHOW PASSWORD
// =========================

document
    .getElementById("showPassword")
    .addEventListener("click", () => {

        const input =
            document.getElementById("password");

        if (input.type === "password") {

            input.type = "text";

        } else {

            input.type = "password";

        }

    });


// =========================
// SIGN UP MODAL
// =========================

document
    .getElementById("showSignup")
    .addEventListener("click", (e) => {

        e.preventDefault();

        document
            .getElementById("signupModal")
            .style.display = "flex";

    });


document
    .getElementById("closeSignup")
    .addEventListener("click", () => {

        document
            .getElementById("signupModal")
            .style.display = "none";

    });


// =========================
// SIGN UP PASSWORD
// =========================

document
    .getElementById("showSignupPassword")
    .addEventListener("click", () => {

        const input =
            document.getElementById("signupPassword");

        if (input.type === "password") {

            input.type = "text";

        } else {

            input.type = "password";

        }

    });


// =========================
// SIGN UP
// =========================

document
    .getElementById("signupForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document
                .getElementById("signupEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("signupPassword")
                .value;

        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;

        const message =
            document
                .getElementById("signupMessage");


        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            return;

        }


        if (password.length < 6) {

            message.textContent =
                "Password must be at least 6 characters.";

            return;

        }


        message.textContent =
            "Creating account...";


        try {

            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.href =
                "dashboard.html";

        } catch (error) {

            console.error(error);

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                message.textContent =
                    "This email is already registered.";

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message.textContent =
                    "Please enter a valid email.";

            } else if (
                error.code ===
                "auth/weak-password"
            ) {

                message.textContent =
                    "Password must be at least 6 characters.";

            } else {

                message.textContent =
                    "Unable to create account.";

            }

        }

    });


// =========================
// FORGOT PASSWORD
// =========================

document
    .getElementById("forgotPassword")
    .addEventListener("click", (e) => {

        e.preventDefault();

        document
            .getElementById("forgotModal")
            .style.display = "flex";

    });


document
    .getElementById("closeForgot")
    .addEventListener("click", () => {

        document
            .getElementById("forgotModal")
            .style.display = "none";

    });


document
    .getElementById("forgotForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document
                .getElementById("forgotEmail")
                .value
                .trim();

        const message =
            document
                .getElementById("forgotMessage");


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );

            message.textContent =
                "Password reset email sent.";

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to send reset email.";

        }

    });


// =========================
// CLOSE MODALS BY BACKGROUND
// =========================

window.addEventListener("click", (e) => {

    if (
        e.target ===
        document.getElementById("signupModal")
    ) {

        document
            .getElementById("signupModal")
            .style.display = "none";

    }

    if (
        e.target ===
        document.getElementById("forgotModal")
    ) {

        document
            .getElementById("forgotModal")
            .style.display = "none";

    }

});