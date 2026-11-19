
/* ==========================================
   VOLTBRIDGE - KSRTC CHARGING MANAGEMENT
   BUILD FOR KSRTC BY MeshMango Technologies
========================================== */

// 1. DEMO ACCOUNT DATABASE

const accounts = {
    admin: [
        {
            username: "admin",
            password: "admin123",
            name: "Central Administrator",
            role: "admin",
            depot: null
        }
    ],

    depot: [
        {
            username: "kannur",
            password: "knr123",
            name: "Kannur Depot Manager",
            role: "depot",
            depot: "Kannur"
        },
        {
            username: "ernakulam",
            password: "ekm123",
            name: "Ernakulam Depot Manager",
            role: "depot",
            depot: "Ernakulam"
        },
        {
            username: "kozhikode",
            password: "kkd123",
            name: "Kozhikode Depot Manager",
            role: "depot",
            depot: "Kozhikode"
        },
        {
            username: "tvm",
            password: "tvm123",
            name: "Thiruvananthapuram Depot Manager",
            role: "depot",
            depot: "Thiruvananthapuram"
        },
        {
            username: "payyanur",
            password: "pnr123",
            name: "Payyanur Depot Manager",
            role: "depot",
            depot: "Payyanur"
        }
    ]
};


// 2. REGISTERED BUS DATABASE

const buses = {
    "KSRTC-KNR-2048": {
        busNumber: "KL-13-2048",
        depot: "Kannur"
    },

    "KSRTC-EKM-1172": {
        busNumber: "KL-07-1172",
        depot: "Ernakulam"
    },

    "KSRTC-TVM-3021": {
        busNumber: "KL-01-3021",
        depot: "Thiruvananthapuram"
    },

    "KSRTC-KKD-8810": {
        busNumber: "KL-11-8810",
        depot: "Kozhikode"
    },

    "KSRTC-PNR-0450": {
        busNumber: "KL-15-0450",
        depot: "Payyanur"
    },

    "KSRTC-PNR-8810": {
        busNumber: "KL-15-8810",
        depot: "Payyanur"
    }
};


const depotNames = [
    "Kannur",
    "Ernakulam",
    "Kozhikode",
    "Thiruvananthapuram",
    "Payyanur"
];


// 3. DATA STORAGE

function getInvoices() {
    try {
        const data = JSON.parse(
            localStorage.getItem("voltbridge_invoices") || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}


function saveInvoices(invoices) {
    localStorage.setItem(
        "voltbridge_invoices",
        JSON.stringify(invoices)
    );
}


// 4. LOGIN SYSTEM

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const selectedRole =
            document.getElementById("loginRole").value;

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        const error =
            document.getElementById("loginError");

        error.textContent = "";

        if (!accounts[selectedRole]) {
            error.textContent = "Please select a valid account type.";
            return;
        }

        const roleAccounts = accounts[selectedRole];

        const matchedAccount = roleAccounts.find(account =>
            account.username === username &&
            account.password === password
        );

        if (!matchedAccount) {
            error.textContent =
                "Invalid credentials for the selected account type.";
            return;
        }

        sessionStorage.setItem(
            "voltbridge_user",
            JSON.stringify(matchedAccount)
        );

        openDashboard(matchedAccount);
    });
}


// 5. DASHBOARD ACCESS

function openDashboard(user) {

    if (!user || !["admin", "depot"].includes(user.role)) {
        logout();
        return;
    }

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("dashboardScreen").classList.remove("hidden");

    document.getElementById("sidebarUser").textContent = user.name;

    document.getElementById("sidebarRole").textContent =
        user.role === "admin"
            ? "Central Admin"
            : user.depot + " Manager";

    document.getElementById("topbarUser").textContent = user.name;

    document.getElementById("userAvatar").textContent =
        user.name.charAt(0).toUpperCase();

    document.getElementById("welcomeTitle").textContent =
        "Welcome, " + user.name;

    document.getElementById("currentDate").textContent =
        new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    const isAdmin = user.role === "admin";

    document.getElementById("depotOverviewSection")
        .classList.toggle("hidden", !isAdmin);

    document.getElementById("chargingNav")
        .classList.toggle("hidden", !isAdmin);

    document.getElementById("dashboardEyebrow").textContent =
        isAdmin
            ? "CENTRAL ADMINISTRATION"
            : user.depot.toUpperCase() + " DEPOT";

    document.getElementById("dashboardTitle").textContent =
        isAdmin
            ? "Central Dashboard"
            : user.depot + " Depot Dashboard";

    document.getElementById("welcomeDescription").textContent =
        isAdmin
            ? "Monitor charging activity and payment status across all depots."
            : "Monitor charging invoices and payments assigned to your depot.";

    refreshDashboard();
    showPage("overview");
}


// 6. RESTORE EXISTING SESSION

const savedUser = sessionStorage.getItem("voltbridge_user");

if (savedUser) {
    try {
        const user = JSON.parse(savedUser);

        const validAccount =
            user &&
            accounts[user.role] &&
            accounts[user.role].some(account =>
                account.username === user.username &&
                account.role === user.role
            );

        if (validAccount) {
            openDashboard(user);
        } else {
            sessionStorage.removeItem("voltbridge_user");
        }
    } catch {
        sessionStorage.removeItem("voltbridge_user");
    }
}


// 7. LOGOUT

function logout() {

    sessionStorage.removeItem("voltbridge_user");

    document.getElementById("dashboardScreen").classList.add("hidden");
    document.getElementById("loginScreen").classList.remove("hidden");

    document.getElementById("loginForm").reset();
    document.getElementById("loginError").textContent = "";
}


// 8. PAGE NAVIGATION

function showPage(page) {

    const user = getCurrentUser();

    if (!user) return;

    if (page === "charging" && user.role !== "admin") {
        page = "overview";
    }

    const pages = [
        "overview",
        "pending",
        "paid",
        "charging"
    ];

    if (!pages.includes(page)) return;

    pages.forEach(name => {
        const element = document.getElementById(name + "Page");

        if (element) {
            element.classList.toggle("hidden", name !== page);
        }
    });

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("active");
    });

    const selectedButton = Array.from(
        document.querySelectorAll(".nav-button")
    ).find(button =>
        button.getAttribute("onclick") === `showPage('${page}')`
    );

    if (selectedButton) {
        selectedButton.classList.add("active");
    }

    const titles = {
        overview: "Overview",
        pending: "Pending Payments",
        paid: "Paid Invoices",
        charging: "Charging Records"
    };

    document.getElementById("dashboardTitle").textContent =
        titles[page];

    if (page === "pending") renderPendingPayments();
    if (page === "paid") renderPaidPayments();
    if (page === "overview") renderOverview();
    if (page === "charging") renderBusRegistry();
}


// 9. CURRENT USER AND DATA FILTERING

function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem("voltbridge_user"));
    } catch {
        return null;
    }
}


function getVisibleInvoices() {

    const user = getCurrentUser();

    if (!user) return [];

    const invoices = getInvoices();

    if (user.role === "admin") {
        return invoices;
    }

    return invoices.filter(invoice =>
        invoice.depot === user.depot
    );
}


// 10. AUTOMATIC INVOICE GENERATION

function completeCharging(busCode, energy, rate) {

    const user = getCurrentUser();

    if (!user || user.role !== "admin") {
        throw new Error("Unauthorized charging operation.");
    }

    const bus = buses[busCode];

    if (!bus) {
        throw new Error("Bus code is not registered.");
    }

    const energyValue = Number(energy);
    const rateValue = Number(rate);

    if (
        !Number.isFinite(energyValue) ||
        !Number.isFinite(rateValue) ||
        energyValue <= 0 ||
        rateValue <= 0
    ) {
        throw new Error("Enter valid charging values.");
    }

    const invoices = getInvoices();

    const invoice = {
        invoiceId: "INV-" + Date.now() + "-" +
            Math.random().toString(36).slice(2, 7).toUpperCase(),

        busCode: busCode,
        busNumber: bus.busNumber,
        depot: bus.depot,

        energyConsumed: energyValue,
        ratePerUnit: rateValue,

        totalCost: energyValue * rateValue,

        date: new Date().toLocaleString("en-IN"),

        paymentStatus: "Pending",
        paidAt: null
    };

    invoices.push(invoice);

    saveInvoices(invoices);

    refreshDashboard();

    return invoice;
}


// 11. CHARGING FORM SUBMISSION

const chargingForm = document.getElementById("chargingForm");

if (chargingForm) {

    chargingForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const code = document.getElementById("busCode")
            .value.trim().toUpperCase();

        const energy = document.getElementById("energyConsumed").value;

        const rate = document.getElementById("ratePerUnit").value;

        const error = document.getElementById("chargingError");

        error.textContent = "";

        try {

            const invoice = completeCharging(code, energy, rate);

            alert(
                "Charging completed successfully!\n\n" +
                "Invoice: " + invoice.invoiceId + "\n" +
                "Bus: " + invoice.busNumber + "\n" +
                "Depot: " + invoice.depot + "\n" +
                "Energy: " + invoice.energyConsumed + " kWh\n" +
                "Total: ₹" + invoice.totalCost.toFixed(2) +
                "\n\nInvoice automatically added to " +
                invoice.depot + " Depot Pending Payments."
            );

            this.reset();

            document.getElementById("ratePerUnit").value = "25";

            showPage("overview");

        } catch (err) {

            error.textContent = err.message;

        }
    });
}


// 12. PENDING PAYMENTS

function renderPendingPayments() {

    const invoices = getVisibleInvoices().filter(invoice =>
        invoice.paymentStatus === "Pending"
    );

    const table = document.getElementById("pendingTable");

    if (!table) return;

    if (invoices.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    No pending payments found.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = invoices.map(invoice => `

        <tr>
            <td><strong>${escapeHTML(invoice.invoiceId)}</strong></td>
            <td>${escapeHTML(invoice.busNumber)}</td>
            <td>${escapeHTML(invoice.depot)}</td>
            <td>${Number(invoice.energyConsumed).toFixed(2)} kWh</td>
            <td><strong>${formatCurrency(invoice.totalCost)}</strong></td>
            <td>${escapeHTML(invoice.date)}</td>

            <td>
                <button class="action-button"
                    onclick="markAsPaid('${encodeURIComponent(invoice.invoiceId)}')">
                    Mark as Paid
                </button>
            </td>
        </tr>

    `).join("");
}


// 13. MARK INVOICE AS PAID

function markAsPaid(encodedInvoiceId) {

    const invoiceId = decodeURIComponent(encodedInvoiceId);

    const user = getCurrentUser();

    if (!user) return;

    const invoices = getInvoices();

    const invoice = invoices.find(item =>
        item.invoiceId === invoiceId
    );

    if (!invoice) {
        alert("Invoice not found.");
        return;
    }

    if (user.role === "depot" && invoice.depot !== user.depot) {
        alert("You are not authorized to update this invoice.");
        return;
    }

    if (invoice.paymentStatus === "Paid") {
        alert("This invoice has already been paid.");
        return;
    }

    const confirmed = confirm(
        "Confirm payment of " +
        formatCurrency(invoice.totalCost) +
        " for invoice " + invoice.invoiceId + "?"
    );

    if (!confirmed) return;

    invoice.paymentStatus = "Paid";

    invoice.paidAt = new Date().toLocaleString("en-IN");

    saveInvoices(invoices);

    refreshDashboard();

    showPage("pending");
}


// 14. PAID INVOICES

function renderPaidPayments() {

    const invoices = getVisibleInvoices().filter(invoice =>
        invoice.paymentStatus === "Paid"
    );

    const table = document.getElementById("paidTable");

    if (!table) return;

    if (invoices.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No paid invoices found.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = invoices.map(invoice => `

        <tr>
            <td><strong>${escapeHTML(invoice.invoiceId)}</strong></td>
            <td>${escapeHTML(invoice.busNumber)}</td>
            <td>${escapeHTML(invoice.depot)}</td>
            <td>${Number(invoice.energyConsumed).toFixed(2)} kWh</td>
            <td><strong>${formatCurrency(invoice.totalCost)}</strong></td>
            <td>${escapeHTML(invoice.paidAt || "-")}</td>
        </tr>

    `).join("");
}


// 15. DASHBOARD OVERVIEW

function renderOverview() {

    const invoices = getVisibleInvoices();

    const pending = invoices.filter(invoice =>
        invoice.paymentStatus === "Pending"
    );

    const paid = invoices.filter(invoice =>
        invoice.paymentStatus === "Paid"
    );

    const totalCost = invoices.reduce(
        (sum, invoice) => sum + Number(invoice.totalCost || 0),
        0
    );

    document.getElementById("totalInvoices").textContent =
        invoices.length;

    document.getElementById("totalPending").textContent =
        pending.length;

    document.getElementById("totalPaid").textContent =
        paid.length;

    document.getElementById("totalCost").textContent =
        formatCurrency(totalCost);

    document.getElementById("pendingBadge").textContent =
        pending.length;

    const user = getCurrentUser();

    if (user && user.role === "admin") {
        renderDepotOverview();
    }

    const recent = [...invoices].reverse().slice(0, 6);

    const table = document.getElementById("recentInvoicesTable");

    if (!table) return;

    if (recent.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No charging records available yet.
                </td>
            </tr>
        `;

    } else {

        table.innerHTML = recent.map(invoice => `

            <tr>
                <td><strong>${escapeHTML(invoice.invoiceId)}</strong></td>
                <td>${escapeHTML(invoice.busNumber)}</td>
                <td>${escapeHTML(invoice.depot)}</td>
                <td>${formatCurrency(invoice.totalCost)}</td>

                <td>
                    <span class="status ${invoice.paymentStatus.toLowerCase()}">
                        ${escapeHTML(invoice.paymentStatus)}
                    </span>
                </td>
            </tr>

        `).join("");

    }
}


// 16. CENTRAL ADMIN - ALL DEPOT OVERVIEW

function renderDepotOverview() {

    const invoices = getInvoices();

    const table = document.getElementById("depotOverviewTable");

    if (!table) return;

    table.innerHTML = depotNames.map(depot => {

        const depotInvoices = invoices.filter(invoice =>
            invoice.depot === depot
        );

        const pending = depotInvoices.filter(invoice =>
            invoice.paymentStatus === "Pending"
        );

        const paid = depotInvoices.filter(invoice =>
            invoice.paymentStatus === "Paid"
        );

        const total = depotInvoices.reduce(
            (sum, invoice) => sum + Number(invoice.totalCost || 0),
            0
        );

        return `
            <tr>
                <td><strong>${escapeHTML(depot)}</strong></td>
                <td>${depotInvoices.length}</td>
                <td>${pending.length}</td>
                <td>${paid.length}</td>
                <td><strong>${formatCurrency(total)}</strong></td>
            </tr>
        `;

    }).join("");
}


// 17. BUS REGISTRY

function renderBusRegistry() {

    const table = document.getElementById("busRegistryTable");

    if (!table) return;

    table.innerHTML = Object.entries(buses).map(([code, bus]) => `

        <tr>
            <td><strong>${escapeHTML(code)}</strong></td>
            <td>${escapeHTML(bus.busNumber)}</td>
            <td>${escapeHTML(bus.depot)}</td>
        </tr>

    `).join("");
}


// 18. REFRESH ALL DASHBOARD DATA

function refreshDashboard() {

    renderOverview();

    renderPendingPayments();

    renderPaidPayments();

    renderBusRegistry();
}


// 19. UTILITIES

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}


function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[character]);

}
