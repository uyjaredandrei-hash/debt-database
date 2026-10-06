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

import {
    getAuth,
    onAuthStateChanged,
    signOut
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

const db = getFirestore(app);

const auth = getAuth(app);


let debts = [];

let selectedDebtId = null;

let deleteDebtId = null;


// =========================
// AUTHENTICATION PROTECTION
// =========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "index.html";

        return;

    }


    document.getElementById("userEmail").textContent =
        user.email;

    document.getElementById("userName").textContent =
        user.email.split("@")[0];


    const avatar =
        user.email.charAt(0).toUpperCase();

    document.querySelector(".user-avatar").textContent =
        avatar;

});


// =========================
// FIREBASE REAL-TIME DATA
// =========================

onSnapshot(
    collection(db, "debts"),
    (snapshot) => {

        debts = snapshot.docs.map((item) => ({

            id: item.id,

            ...item.data()

        }));

        renderAll();

    },
    (error) => {

        console.error(error);

        showToast(
            "Unable to load debt records.",
            "error"
        );

    }
);


// =========================
// FORMAT MONEY
// =========================

function money(value) {

    return "₱" +
        Number(value || 0).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// =========================
// STATUS
// =========================

function getStatus(debt) {

    const total =
        Number(debt.totalDebt || 0);

    const paid =
        Number(debt.paid || 0);


    if (paid >= total && total > 0) {

        return "Paid";

    }

    if (paid > 0) {

        return "Partially Paid";

    }

    return "Unpaid";

}


// =========================
// DASHBOARD STATS
// =========================

function updateStats() {

    let totalDebt = 0;

    let totalPaid = 0;

    let paidCount = 0;

    let partialCount = 0;

    let unpaidCount = 0;


    debts.forEach((debt) => {

        totalDebt +=
            Number(debt.totalDebt || 0);

        totalPaid +=
            Number(debt.paid || 0);


        const status =
            getStatus(debt);


        if (status === "Paid") {

            paidCount++;

        } else if (
            status === "Partially Paid"
        ) {

            partialCount++;

        } else {

            unpaidCount++;

        }

    });


    const remaining =
        Math.max(totalDebt - totalPaid, 0);


    document.getElementById("totalRecords")
        .textContent = debts.length;

    document.getElementById("totalDebt")
        .textContent = money(totalDebt);

    document.getElementById("totalPaid")
        .textContent = money(totalPaid);

    document.getElementById("remainingBalance")
        .textContent = money(remaining);


    document.getElementById("paidCount")
        .textContent = paidCount;

    document.getElementById("partialCount")
        .textContent = partialCount;

    document.getElementById("unpaidCount")
        .textContent = unpaidCount;


    updateReports(
        totalDebt,
        totalPaid,
        paidCount,
        unpaidCount,
        partialCount
    );

}


// =========================
// RENDER TABLE
// =========================

function renderTable() {

    const tbody =
        document.getElementById("debtTableBody");

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();

    const status =
        document.getElementById("statusFilter")
            .value;

    const sort =
        document.getElementById("sortFilter")
            .value;


    let filtered =
        debts.filter((debt) => {

            const name =
                String(
                    debt.debtorName || ""
                ).toLowerCase();

            const matchesSearch =
                name.includes(search);

            const matchesStatus =
                status === "all" ||
                getStatus(debt) === status;

            return (
                matchesSearch &&
                matchesStatus
            );

        });


    filtered.sort((a, b) => {

        if (sort === "highest") {

            return (
                Number(b.totalDebt || 0) -
                Number(a.totalDebt || 0)
            );

        }

        if (sort === "lowest") {

            return (
                Number(a.totalDebt || 0) -
                Number(b.totalDebt || 0)
            );

        }

        if (sort === "name") {

            return String(
                a.debtorName || ""
            ).localeCompare(
                String(b.debtorName || "")
            );

        }

        if (sort === "oldest") {

            return String(a.date || "")
                .localeCompare(
                    String(b.date || "")
                );

        }

        return String(b.date || "")
            .localeCompare(
                String(a.date || "")
            );

    });


    tbody.innerHTML = "";


    document
        .getElementById("emptyRecords")
        .classList.toggle(
            "hidden",
            filtered.length !== 0
        );


    filtered.forEach((debt, index) => {

        const total =
            Number(debt.totalDebt || 0);

        const paid =
            Number(debt.paid || 0);

        const balance =
            Math.max(total - paid, 0);

        const status =
            getStatus(debt);


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${index + 1}</td>

            <td>
                <strong>
                    ${escapeHTML(
                        debt.debtorName || "Unknown"
                    )}
                </strong>
            </td>

            <td>${money(total)}</td>

            <td>${money(paid)}</td>

            <td>
                <strong>
                    ${money(balance)}
                </strong>
            </td>

            <td>
                ${formatDate(debt.date)}
            </td>

            <td>
                <span class="status-badge ${statusClass(status)}">
                    ${status}
                </span>
            </td>

            <td>

                <div class="action-buttons">

                    ${
                        status !== "Paid"
                        ?
                        `
                        <button
                            class="action-btn payment"
                            data-payment="${debt.id}"
                            title="Make Payment"
                        >
                            💵
                        </button>
                        `
                        :
                        ""
                    }

                    <button
                        class="action-btn history"
                        data-history="${debt.id}"
                        title="Payment History"
                    >
                        📜
                    </button>

                    <button
                        class="action-btn delete"
                        data-delete="${debt.id}"
                        title="Delete"
                    >
                        🗑️
                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });


    attachActionEvents();

}


// =========================
// RECENT RECORDS
// =========================

function renderRecentRecords() {

    const container =
        document.getElementById("recentRecords");


    const recent =
        [...debts]
            .sort(
                (a, b) =>
                    String(b.date || "")
                        .localeCompare(
                            String(a.date || "")
                        )
            )
            .slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                No debt records yet.
            </div>`;

        return;

    }


    container.innerHTML =
        recent.map((debt) => {

            const balance =
                Math.max(
                    Number(debt.totalDebt || 0) -
                    Number(debt.paid || 0),
                    0
                );


            return `

                <div class="recent-item">

                    <div class="recent-avatar">
                        ${
                            String(
                                debt.debtorName || "?"
                            )
                            .charAt(0)
                            .toUpperCase()
                        }
                    </div>

                    <div class="recent-info">

                        <strong>
                            ${escapeHTML(
                                debt.debtorName || "Unknown"
                            )}
                        </strong>

                        <small>
                            ${formatDate(debt.date)}
                        </small>

                    </div>

                    <div class="recent-amount">

                        <strong>
                            ${money(balance)}
                        </strong>

                        <span class="${statusClass(
                            getStatus(debt)
                        )}">
                            ${getStatus(debt)}
                        </span>

                    </div>

                </div>

            `;

        })
        .join("");

}


// =========================
// REPORTS
// =========================

function updateReports(
    totalDebt,
    totalPaid,
    paidCount,
    unpaidCount,
    partialCount
) {

    const remaining =
        Math.max(
            totalDebt - totalPaid,
            0
        );


    const rate =
        totalDebt > 0
            ?
            Math.min(
                (totalPaid / totalDebt) * 100,
                100
            )
            :
            0;


    document.getElementById(
        "reportOutstanding"
    ).textContent =
        money(remaining);


    document.getElementById(
        "collectionRate"
    ).textContent =
        rate.toFixed(1) + "%";


    document.getElementById(
        "reportPaidRecords"
    ).textContent =
        paidCount;


    document.getElementById(
        "reportUnpaidRecords"
    ).textContent =
        unpaidCount;


    document.getElementById(
        "financialDebt"
    ).textContent =
        money(totalDebt);


    document.getElementById(
        "financialPaid"
    ).textContent =
        money(totalPaid);


    document.getElementById(
        "financialRemaining"
    ).textContent =
        money(remaining);


    const totalRecords =
        debts.length || 1;


    const bars =
        document.getElementById("reportBars");


    bars.innerHTML = `

        ${createReportBar(
            "Paid",
            paidCount,
            totalRecords
        )}

        ${createReportBar(
            "Partially Paid",
            partialCount,
            totalRecords
        )}

        ${createReportBar(
            "Unpaid",
            unpaidCount,
            totalRecords
        )}

    `;

}


function createReportBar(
    name,
    count,
    total
) {

    const percentage =
        (count / total) * 100;


    return `

        <div class="report-bar-row">

            <div class="report-bar-label">

                <span>
                    ${name}
                </span>

                <strong>
                    ${count}
                </strong>

            </div>

            <div class="report-bar">

                <div
                    class="report-bar-fill"
                    style="width:${percentage}%"
                ></div>

            </div>

        </div>

    `;

}


// =========================
// ADD DEBT
// =========================

document
    .getElementById("debtForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();


        const name =
            document
                .getElementById("debtorName")
                .value
                .trim();

        const amount =
            Number(
                document
                    .getElementById("debtAmount")
                    .value
            );

        const date =
            document
                .getElementById("debtDate")
                .value;


        if (!name || amount <= 0 || !date) {

            showToast(
                "Please complete all fields.",
                "error"
            );

            return;

        }


        try {

            await addDoc(
                collection(db, "debts"),
                {

                    debtorName: name,

                    totalDebt: amount,

                    paid: 0,

                    date: date,

                    paymentHistory: [],

                    createdAt:
                        new Date().toISOString()

                }
            );


            closeModal("debtModal");

            document
                .getElementById("debtForm")
                .reset();


            showToast(
                "Debt record added successfully.",
                "success"
            );


        } catch (error) {

            console.error(error);

            showToast(
                "Unable to add debt record.",
                "error"
            );

        }

    });


// =========================
// OPEN PAYMENT
// =========================

function openPayment(id) {

    const debt =
        debts.find(
            item => item.id === id
        );


    if (!debt) return;


    selectedDebtId = id;


    const total =
        Number(debt.totalDebt || 0);

    const paid =
        Number(debt.paid || 0);

    const balance =
        Math.max(total - paid, 0);


    document.getElementById(
        "paymentDebtorName"
    ).textContent =
        debt.debtorName;


    document.getElementById(
        "paymentTotal"
    ).textContent =
        money(total);


    document.getElementById(
        "paymentCurrent"
    ).textContent =
        money(paid);


    document.getElementById(
        "paymentBalance"
    ).textContent =
        money(balance);


    document.getElementById(
        "paymentAmount"
    ).value = "";


    document.getElementById(
        "paymentAmount"
    ).max = balance;


    document.getElementById(
        "paymentModal"
    ).style.display = "flex";

}


// =========================
// MAKE PAYMENT
// =========================

document
    .getElementById("paymentForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();


        if (!selectedDebtId) return;


        const debt =
            debts.find(
                item =>
                    item.id === selectedDebtId
            );


        if (!debt) return;


        const payment =
            Number(
                document
                    .getElementById("paymentAmount")
                    .value
            );


        const total =
            Number(debt.totalDebt || 0);

        const currentPaid =
            Number(debt.paid || 0);

        const balance =
            Math.max(
                total - currentPaid,
                0
            );


        if (
            payment <= 0 ||
            payment > balance
        ) {

            showToast(
                "Payment cannot be greater than the remaining balance.",
                "error"
            );

            return;

        }


        const newPaid =
            currentPaid + payment;


        const history =
            Array.isArray(
                debt.paymentHistory
            )
            ?
            [...debt.paymentHistory]
            :
            [];


        history.push({

            amount: payment,

            date:
                new Date()
                    .toISOString()
                    .split("T")[0]

        });


        try {

            await updateDoc(
                doc(db, "debts", selectedDebtId),
                {

                    paid: newPaid,

                    paymentHistory: history

                }
            );


            closeModal("paymentModal");

            showToast(
                "Payment recorded successfully.",
                "success"
            );


        } catch (error) {

            console.error(error);

            showToast(
                "Unable to record payment.",
                "error"
            );

        }

    });


// =========================
// PAYMENT HISTORY
// =========================

function openHistory(id) {

    const debt =
        debts.find(
            item => item.id === id
        );


    if (!debt) return;


    document.getElementById(
        "historyDebtorName"
    ).textContent =
        debt.debtorName;


    const container =
        document.getElementById(
            "paymentHistory"
        );


    const history =
        Array.isArray(
            debt.paymentHistory
        )
        ?
        debt.paymentHistory
        :
        [];


    if (history.length === 0) {

        container.innerHTML =
            `
            <div class="empty-state">
                No payments recorded yet.
            </div>
            `;

    } else {

        container.innerHTML =
            [...history]
                .reverse()
                .map((payment) => {

                    return `

                        <div class="history-item">

                            <div>

                                <strong>
                                    ${money(
                                        payment.amount
                                    )}
                                </strong>

                                <small>
                                    Payment
                                </small>

                            </div>

                            <span>
                                ${formatDate(
                                    payment.date
                                )}
                            </span>

                        </div>

                    `;

                })
                .join("");

    }


    document.getElementById(
        "historyModal"
    ).style.display = "flex";

}


// =========================
// DELETE
// =========================

function openDelete(id) {

    deleteDebtId = id;

    document.getElementById(
        "deleteModal"
    ).style.display = "flex";

}


document
    .getElementById("confirmDelete")
    .addEventListener("click", async () => {

        if (!deleteDebtId) return;


        try {

            await deleteDoc(
                doc(db, "debts", deleteDebtId)
            );


            closeModal("deleteModal");

            showToast(
                "Debt record deleted.",
                "success"
            );


            deleteDebtId = null;


        } catch (error) {

            console.error(error);

            showToast(
                "Unable to delete record.",
                "error"
            );

        }

    });


document
    .getElementById("cancelDelete")
    .addEventListener("click", () => {

        closeModal("deleteModal");

        deleteDebtId = null;

    });


// =========================
// ACTION BUTTONS
// =========================

function attachActionEvents() {

    document
        .querySelectorAll("[data-payment]")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openPayment(
                        button.dataset.payment
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-history]")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openHistory(
                        button.dataset.history
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-delete]")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openDelete(
                        button.dataset.delete
                    );

                }
            );

        });

}


// =========================
// NAVIGATION
// =========================

document
    .querySelectorAll(".nav-item")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                showSection(
                    button.dataset.section
                );

                document
                    .querySelectorAll(".nav-item")
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                closeSidebar();

            }
        );

    });


function showSection(sectionId) {

    document
        .querySelectorAll(".content-section")
        .forEach(
            section =>
                section.classList.remove(
                    "active-section"
                )
        );


    document
        .getElementById(sectionId)
        .classList.add(
            "active-section"
        );


    const titles = {

        dashboardSection: [
            "Dashboard",
            "Overview of your debt records"
        ],

        recordsSection: [
            "Debt Records",
            "Track and manage all debt records"
        ],

        reportsSection: [
            "Reports",
            "View your debt management summary"
        ]

    };


    const info =
        titles[sectionId];


    document.getElementById(
        "pageTitle"
    ).textContent =
        info[0];


    document.getElementById(
        "pageSubtitle"
    ).textContent =
        info[1];

}


// =========================
// BUTTON NAVIGATION
// =========================

document
    .getElementById("dashboardAddBtn")
    .addEventListener(
        "click",
        () => openModal("debtModal")
    );


document
    .getElementById("addDebtBtn")
    .addEventListener(
        "click",
        () => openModal("debtModal")
    );


document
    .getElementById("viewRecordsBtn")
    .addEventListener(
        "click",
        () => {

            showSection(
                "recordsSection"
            );

            document
                .querySelectorAll(".nav-item")
                .forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

            document
                .querySelector(
                    '[data-section="recordsSection"]'
                )
                .classList.add("active");

        }
    );


// =========================
// SEARCH / FILTER
// =========================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        renderTable
    );


document
    .getElementById("statusFilter")
    .addEventListener(
        "change",
        renderTable
    );


document
    .getElementById("sortFilter")
    .addEventListener(
        "change",
        renderTable
    );


// =========================
// MODALS
// =========================

function openModal(id) {

    document.getElementById(id)
        .style.display = "flex";

}


function closeModal(id) {

    document.getElementById(id)
        .style.display = "none";

}


document
    .getElementById("closeDebtModal")
    .addEventListener(
        "click",
        () => closeModal("debtModal")
    );


document
    .getElementById("closePaymentModal")
    .addEventListener(
        "click",
        () => closeModal("paymentModal")
    );


document
    .getElementById("closeHistoryModal")
    .addEventListener(
        "click",
        () => closeModal("historyModal")
    );


window.addEventListener("click", (e) => {

    if (
        e.target.classList.contains("modal")
    ) {

        e.target.style.display = "none";

    }

});


// =========================
// LOGOUT
// =========================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "index.html";

            } catch (error) {

                console.error(error);

                showToast(
                    "Unable to logout.",
                    "error"
                );

            }

        }
    );


// =========================
// DARK MODE
// =========================

const savedTheme =
    localStorage.getItem("debttrack-theme");


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    document.getElementById(
        "themeBtn"
    ).textContent = "☀️";

}


document
    .getElementById("themeBtn")
    .addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            );


            const dark =
                document.body.classList.contains(
                    "dark-mode"
                );


            localStorage.setItem(
                "debttrack-theme",
                dark ? "dark" : "light"
            );


            document.getElementById(
                "themeBtn"
            ).textContent =
                dark ? "☀️" : "🌙";

        }
    );


// =========================
// MOBILE SIDEBAR
// =========================

document
    .getElementById("menuBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("sidebar")
                .classList.toggle(
                    "sidebar-open"
                );

        }
    );


function closeSidebar() {

    document
        .getElementById("sidebar")
        .classList.remove(
            "sidebar-open"
        );

}


// =========================
// TOAST
// =========================

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById("toast");

    const icon =
        document.getElementById("toastIcon");

    const text =
        document.getElementById("toastMessage");


    text.textContent = message;

    icon.textContent =
        type === "error"
            ? "!"
            : "✓";


    toast.className =
        "toast " + type;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}


// =========================
// HELPERS
// =========================

function statusClass(status) {

    if (status === "Paid") {

        return "status-paid";

    }

    if (status === "Partially Paid") {

        return "status-partial";

    }

    return "status-unpaid";

}


function formatDate(date) {

    if (!date) return "—";


    const parts =
        String(date).split("-");


    if (parts.length !== 3) {

        return date;

    }


    return `${parts[1]}/${parts[2]}/${parts[0]}`;

}


function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =========================
// RENDER EVERYTHING
// =========================

function renderAll() {

    updateStats();

    renderTable();

    renderRecentRecords();

}