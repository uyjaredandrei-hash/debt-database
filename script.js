let debts = JSON.parse(localStorage.getItem("debts")) || [];

let selectedDebt = null;


// ============================
// SAVE DATABASE
// ============================

function saveData() {
    localStorage.setItem("debts", JSON.stringify(debts));
}


// ============================
// ADD NEW DEBT
// ============================

function addDebt() {

    let name = document.getElementById("name").value.trim();
    let amount = Number(document.getElementById("amount").value);
    let date = document.getElementById("date").value;

    if (name === "" || amount <= 0 || date === "") {
        alert("Please complete all fields.");
        return;
    }

    let debt = {
        id: Date.now(),
        name: name,
        amount: amount,
        paid: 0,
        date: date
    };

    debts.push(debt);

    saveData();
    displayDebts();

    document.getElementById("name").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";

    closeModal();
}


// ============================
// DISPLAY DEBTS
// ============================

function displayDebts() {

    let list = document.getElementById("debtList");

    let search = document
        .getElementById("search")
        .value
        .toLowerCase();

    list.innerHTML = "";

    let totalDebt = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let count = 0;

    debts.forEach((debt, index) => {

        if (!debt.name.toLowerCase().includes(search)) {
            return;
        }

        count++;

        let remaining =
            Number(debt.amount) - Number(debt.paid);

        totalDebt += Number(debt.amount);
        totalPaid += Number(debt.paid);
        totalRemaining += remaining;

        let status = "Unpaid";
        let statusClass = "unpaid";

        if (debt.paid >= debt.amount) {
            status = "Paid";
            statusClass = "paid";
        } else if (debt.paid > 0) {
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
                    ₱${Number(debt.amount).toFixed(2)}
                </td>

                <td>
                    ₱${Number(debt.paid).toFixed(2)}
                </td>

                <td>
                    <strong>
                        ₱${remaining.toFixed(2)}
                    </strong>
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
                        `<button
                            class="action-btn pay"
                            onclick="openPaymentModal(${index})">
                            Pay
                        </button>`
                        :
                        ""
                    }

                    <button
                        class="action-btn delete"
                        onclick="deleteDebt(${index})">
                        Delete
                    </button>

                </td>

            </tr>
        `;
    });

    document.getElementById("records").textContent = count;

    document.getElementById("totalDebt").textContent =
        totalDebt.toFixed(2);

    document.getElementById("totalPaid").textContent =
        totalPaid.toFixed(2);

    document.getElementById("remaining").textContent =
        totalRemaining.toFixed(2);
}


// ============================
// OPEN ADD MODAL
// ============================

function openModal() {
    document.getElementById("modal").style.display = "flex";
}


// ============================
// CLOSE ADD MODAL
// ============================

function closeModal() {
    document.getElementById("modal").style.display = "none";
}


// ============================
// OPEN PAYMENT MODAL
// ============================

function openPaymentModal(index) {

    selectedDebt = index;

    let debt = debts[index];

    let remaining =
        Number(debt.amount) - Number(debt.paid);

    document.getElementById("currentBalance").textContent =
        remaining.toFixed(2);

    document.getElementById("paymentAmount").value = "";

    document.getElementById("paymentModal").style.display = "flex";
}


// ============================
// CLOSE PAYMENT MODAL
// ============================

function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}


// ============================
// MAKE PAYMENT
// ============================

function makePayment() {

    let payment =
        Number(document.getElementById("paymentAmount").value);

    let debt = debts[selectedDebt];

    let remaining =
        Number(debt.amount) - Number(debt.paid);

    if (payment <= 0) {
        alert("Please enter a valid payment.");
        return;
    }

    if (payment > remaining) {
        alert(
            "Payment cannot be greater than the remaining balance."
        );
        return;
    }

    debt.paid += payment;

    saveData();
    displayDebts();

    closePaymentModal();
}


// ============================
// DELETE DEBT
// ============================

function deleteDebt(index) {

    let confirmDelete =
        confirm("Delete this debt record?");

    if (confirmDelete) {

        debts.splice(index, 1);

        saveData();
        displayDebts();
    }
}


// ============================
// LOAD DATABASE
// ============================

displayDebts();