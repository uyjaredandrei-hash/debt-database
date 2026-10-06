import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


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
const db = getFirestore(app);

let debts = [];
let selectedDebt = null;


// LISTEN FOR DATABASE CHANGES
onSnapshot(collection(db, "debts"), (snapshot) => {

    debts = [];

    snapshot.forEach((docSnapshot) => {
        debts.push({
            id: docSnapshot.id,
            ...docSnapshot.data()
        });
    });

    displayDebts();
});


// ADD DEBT
async function addDebt() {

    let name = document.getElementById("name").value.trim();
    let amount = Number(document.getElementById("amount").value);
    let date = document.getElementById("date").value;

    if (name === "" || amount <= 0 || date === "") {
        alert("Please complete all fields.");
        return;
    }

    try {

        await addDoc(collection(db, "debts"), {
            name: name,
            amount: amount,
            paid: 0,
            date: date
        });

        document.getElementById("name").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("date").value = "";

        closeModal();

    } catch (error) {

        console.error(error);
        alert("Error adding debt: " + error.message);

    }
}


// DISPLAY DEBTS
function displayDebts() {

    let list = document.getElementById("debtList");
    let search = document.getElementById("search").value.toLowerCase();

    list.innerHTML = "";

    let totalDebt = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let count = 0;

    debts.forEach((debt) => {

        if (!debt.name.toLowerCase().includes(search)) {
            return;
        }

        count++;

        let amount = Number(debt.amount);
        let paid = Number(debt.paid);

        let remaining = amount - paid;

        totalDebt += amount;
        totalPaid += paid;
        totalRemaining += remaining;


        let status = "Unpaid";
        let statusClass = "unpaid";

        if (paid >= amount) {
            status = "Paid";
            statusClass = "paid";
        }
        else if (paid > 0) {
            status = "Partially Paid";
            statusClass = "partial";
        }


        list.innerHTML += `
            <tr>

                <td>${count}</td>

                <td>
                    <strong>${debt.name}</strong>
                </td>

                <td>
                    ₱${amount.toFixed(2)}
                </td>

                <td>
                    ₱${paid.toFixed(2)}
                </td>

                <td>
                    <strong>₱${remaining.toFixed(2)}</strong>
                </td>

                <td>
                    ${debt.date}
                </td>

                <td>
                    <span class="badge ${statusClass}">
                        ${status}
                    </span>
                </td>

                <td>

                    ${
                        remaining > 0
                        ?
                        `<button class="action-btn pay" onclick="openPaymentModal('${debt.id}')">
                            Pay
                        </button>`
                        :
                        ""
                    }

                    <button class="action-btn delete"
                        onclick="deleteDebt('${debt.id}')">
                        Delete
                    </button>

                </td>

            </tr>
        `;
    });


    document.getElementById("records").textContent = count;
    document.getElementById("totalDebt").textContent = totalDebt.toFixed(2);
    document.getElementById("totalPaid").textContent = totalPaid.toFixed(2);
    document.getElementById("remaining").textContent = totalRemaining.toFixed(2);
}


// OPEN ADD DEBT MODAL
function openModal() {
    document.getElementById("modal").style.display = "flex";
}


// CLOSE ADD DEBT MODAL
function closeModal() {
    document.getElementById("modal").style.display = "none";
}


// OPEN PAYMENT MODAL
function openPaymentModal(id) {

    selectedDebt = id;

    let debt = debts.find(d => d.id === id);

    if (!debt) return;

    let remaining =
        Number(debt.amount) - Number(debt.paid);

    document.getElementById("currentBalance").textContent =
        remaining.toFixed(2);

    document.getElementById("paymentAmount").value = "";

    document.getElementById("paymentModal").style.display = "flex";
}


// CLOSE PAYMENT MODAL
function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}


// MAKE PAYMENT
async function makePayment() {

    let payment =
        Number(document.getElementById("paymentAmount").value);

    let debt =
        debts.find(d => d.id === selectedDebt);

    if (!debt) return;


    let remaining =
        Number(debt.amount) - Number(debt.paid);


    if (payment <= 0) {

        alert("Please enter a valid payment.");
        return;

    }


    if (payment > remaining) {

        alert("Payment cannot be greater than the remaining balance.");
        return;

    }


    try {

        await updateDoc(
            doc(db, "debts", selectedDebt),
            {
                paid: Number(debt.paid) + payment
            }
        );

        closePaymentModal();

    } catch (error) {

        console.error(error);
        alert("Error making payment: " + error.message);

    }
}


// DELETE DEBT
async function deleteDebt(id) {

    let confirmDelete =
        confirm("Delete this debt record?");

    if (!confirmDelete) return;


    try {

        await deleteDoc(
            doc(db, "debts", id)
        );

    } catch (error) {

        console.error(error);
        alert("Error deleting debt: " + error.message);

    }
}


// SEARCH
document.getElementById("search").addEventListener("input", displayDebts);


// MAKE FUNCTIONS AVAILABLE TO HTML
window.addDebt = addDebt;
window.openModal = openModal;
window.closeModal = closeModal;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.makePayment = makePayment;
window.deleteDebt = deleteDebt;