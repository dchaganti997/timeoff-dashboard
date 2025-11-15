const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwS-A6B_OpqyxDwqG7swgJb-4tCZcaFEvNwYf5T16HptLm4LMaLD7G2zJM2EKPzgw/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const location = document.getElementById("location").value.trim();
    const errorBox = document.getElementById("loginError");

    errorBox.innerText = "";

    if (!username || !password || !location) {
        errorBox.innerText = "All fields are required";
        return;
    }

    const payload = {
        action: "login",
        username,
        password
    };

    const url = `${SCRIPT_URL}?token=${API_TOKEN}&action=login`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.error) {
        errorBox.innerText = data.error;
        return;
    }

    // Save session
    localStorage.setItem("sessionToken", data.token);
    localStorage.setItem("username", username);
    localStorage.setItem("location", location);

    window.location.href = "dashboard.html";
}
