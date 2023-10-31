const routes = {
    '/login': { templateId: 'login', title: "Log in!"},
    '/dashboard': { templateId: 'dashboard', title: "Dashboard" },  
    '/thomas': { templateId: 'thomas', title: "hihi"},
  };



function updateRoute() {
    const path = window.location.pathname;
    const route = routes[path];

    if(!route) {
        return navigate("/login");
    }
    
    document.title = route.title;
    const template = document.getElementById(route.templateId);
    const view = template.content.cloneNode(true);
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(view);

    extraCode(route.templateId);
}

function navigate(path) {
    window.history.pushState({}, path, path);
    updateRoute();
}

function onLinkClick(e) {
    e.preventDefault();
    navigate(e.target.href);
}

function extraCode(templateId) {
    switch (templateId) {
        case "dashboard":
            console.log("Dashboard is shown");
            break;
    
        case "thomas":
            alert("Unchain the beast?");
            break;
        default:
            break;
    }
}

window.onpopstate = () => updateRoute();
updateRoute();