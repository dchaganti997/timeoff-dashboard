function loginManager() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!MANAGER_CREDENTIALS[username]) {
        alert("Invalid Username");
        return;
    }

    const record = MANAGER_CREDENTIALS[username];

    if (password !== record.password) {
        alert("Incorrect Password");
        return;
    }

    localStorage.setItem("sessionUser", username);
    localStorage.setItem("sessionLocation", record.location);

    window.location.href = "dashboard.html";
}
