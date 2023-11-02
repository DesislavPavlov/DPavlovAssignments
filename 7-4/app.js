// Constants
const routes = {
    '/login': { templateId: 'login', title: "Login"},
    '/dashboard': { templateId: 'dashboard', title: "Dashboard", init: updateDashboard},
};
const apiUrl = "//localhost:5000/api/accounts/";
const storageKey = "savedAccount";

// Variables
let state = Object.freeze({
    account: null,
});


// Functions
// Navigation
function navigate(path) {
    window.history.pushState({}, path, path);
    updateRoute();
}

function updateRoute() {
    // Get path
    const path = window.location.pathname;
    const route = routes[path];

    // Error handler
    if(!route) {
        return navigate("/dasboard");
    }
    
    // Display template
    document.title = route.title;
    const template = document.getElementById(route.templateId);
    const view = template.content.cloneNode(true);
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(view);

    // Update dashboard
    if(typeof route.init === "function") {
        route.init();
    }
}

// Account management
async function login() {
    const loginForm = document.getElementById("loginForm");
    const user = loginForm.username.value;

    const accountData = await sendRequest("get", user);

    if (accountData.error) {
        return updateElement("loginError", accountData.error);
    }

    updateState("account", accountData);
    navigate("/dashboard");
}

async function register() {
    const registerForm = document.getElementById("registerForm");
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);
    const jsonData = JSON.stringify(data);
    const accountData = await sendRequest("post", jsonData);

    if (accountData.error) {
        return updateElement("registerError", accountData.error);
    }
    
    console.log('Account created!', accountData);
    
    updateState("account", accountData);
    navigate("/dashboard");
}

function logout() {
    updateState("account", null);
    navigate("/login");
}

async function sendRequest(method, data) {
    let response;
    try {
        if(method === "get") {
            // data = username
            response = await fetch(apiUrl + encodeURIComponent(data));
        }
        else if(method === "post") {
            // data = account (json)
            response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: data
            });
        }
        else if(method === "postTransaction") {
            // data = user & account (json)
            response = await fetch(`http://localhost:5000/api/accounts/${data.user}/transactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: data.newTransaction
            });
        }
        
        return await response.json();
    } catch (error) {
        return { error: error.message || "Unknown error" };
    }
}

// Update html
function updateElement(id, textOrNode) {
    const element = document.getElementById(id);
    element.textContent = "";
    element.append(textOrNode);
}

async function updateDashboard() {
    await updateAccountData();

    const account = state.account;

    if(!account) {
        return logout();
    }

    updateElement("balance", account.balance);
    updateElement("currency", account.currency);
    updateElement("description", account.description);

    const transactionRows = document.createDocumentFragment();
    for (const transaction of account.transactions) {
        const transactionRow = createTransactionRow(transaction);
        transactionRows.appendChild(transactionRow);
    }

    updateElement("transactions", transactionRows);
}

async function updateAccountData() {
    const account = state.account;
    if(!account){
        return logout();
    }

    const newAccountData = await sendRequest("get", account.user);
    if(newAccountData.error) {
        return logout();
    }

    updateState("account", newAccountData);
}

function updateState(property, newData) {
    state = Object.freeze({
        ...state,
        [property]: newData,
    });

    window.localStorage.setItem(storageKey, JSON.stringify(state.account));
}

// Transactions
function createTransactionRow(transaction) {
    const template = document.getElementById("transaction");
    const transactionRow = template.content.cloneNode(true);
    const tr = transactionRow.querySelector("tr");
    tr.children[0].textContent = transaction.date;
    tr.children[1].textContent = transaction.object;
    tr.children[2].textContent = transaction.amount.toFixed(2);
    return transactionRow;
}

function toggleTransactionDialog() {
    const transactionDialog = document.getElementById("transactionDialog");
    if(!transactionDialog.open) {
        transactionDialog.showModal();
    }
    else {
        transactionDialog.close();
    }
}

async function createNewTransaction() {
    const accountData = await sendRequest("get", state.account.user);
    const id = accountData.transactions.length;

    const form = document.getElementById("newTransactionForm");
    const formData = new FormData(form);
    const objectData = Object.fromEntries(formData);
    const jsonData = JSON.stringify(objectData);

    const newAccountData = await sendRequest("postTransaction", { user: state.account.user, newTransaction: jsonData });
    updateDashboard();
    toggleTransactionDialog();
}


// Initialization
function init() {
    const savedAccount = localStorage.getItem(storageKey);
    if(savedAccount) {
        updateState("account", JSON.parse(savedAccount));
    }

    window.onpopstate = () => updateRoute();
    updateRoute();
}

init();