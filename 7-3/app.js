// Constants
const routes = {
    '/login': { templateId: 'login', title: "Login"},
    '/dashboard': { templateId: 'dashboard', title: "Dashboard", init: updateDashboard},
};


// Variables
let account = null;


// Functions
// Handle links
function onLinkClick(e) {
    e.preventDefault();
    navigate(e.target.href);
}

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
        return navigate("/login");
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

    const accountData = await getOrPostAccount("get", user);

    if (accountData.error) {
        return updateElement("loginError", accountData.error);
    }

    account = accountData;
    navigate("/dashboard");
}

async function register() {
    const registerForm = document.getElementById("registerForm");
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);
    const jsonData = JSON.stringify(data);
    const accountData = await getOrPostAccount("post", jsonData);

    if (accountData.error) {
        return updateElement("registerError", accountData.error);
    }
    
    console.log('Account created!', accountData);
    
    account = accountData;
    navigate("/dashboard");
}

async function getOrPostAccount(method, data) {
    const apiUrl = "//localhost:5000/api/accounts/";
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

function updateDashboard() {
    if(!account) {
        return navigate("/login");
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

function createTransactionRow(transaction) {
    const template = document.getElementById("transaction");
    const transactionRow = template.content.cloneNode(true);
    const tr = transactionRow.querySelector("tr");
    tr.children[0].textContent = transaction.date;
    tr.children[1].textContent = transaction.object;
    tr.children[2].textContent = transaction.amount.toFixed(2);
    return transactionRow;
}


// Begin
window.onpopstate = () => updateRoute();
updateRoute();