const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6g7ERKVeOY4mBVpM-alFVM3ty4u_NL6ZAfJ4jSPMDnWnPRZCjP8cEN2k4_Y7vyYJF/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

const ALL_LOCATIONS = [
  "C4","Appalachian","CIW","Hinman","Food Trucks","Einstein",
  "Library","Dunkin","Market Place","Health Sciences","Starbucks","Garbanzos"
];

function onUsernameChange() {
  const u = (document.getElementById("username").value || "").trim().toLowerCase();
  const locSelect = document.getElementById("location");
  locSelect.disabled = true;
  locSelect.innerHTML = "<option>Loading...</option>";

  if (!u) {
    locSelect.innerHTML = "<option>Select username first</option>";
    return;
  }

  const url = `${SCRIPT_URL}?token=${API_TOKEN}&action=getManagerInfo&username=${encodeURIComponent(u)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        locSelect.innerHTML = `<option>${data.error}</option>`;
        return;
      }
      const allowed = data.locations || [];
      locSelect.innerHTML = "";
      if (allowed.includes("all")) {
        ALL_LOCATIONS.forEach(loc => {
          locSelect.innerHTML += `<option value="${loc}">${loc}</option>`;
        });
      } else {
        allowed.forEach(loc => {
          locSelect.innerHTML += `<option value="${loc}">${loc}</option>`;
        });
      }
      locSelect.disabled = false;
    })
    .catch(err => {
      locSelect.innerHTML = `<option>Error loading</option>`;
    });
}

function login() {
  const u = (document.getElementById("username").value || "").trim().toLowerCase();
  const p = (document.getElementById("password").value || "");
  const loc = document.getElementById("location").value;
  const errEl = document.getElementById("loginError");

  errEl.textContent = "";

  if (!u || !p || !loc) {
    errEl.textContent = "All fields are required.";
    return;
  }

  const payload = { username: u, password: p, location: loc };

  fetch(`${SCRIPT_URL}?token=${API_TOKEN}&action=login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        errEl.textContent = data.error;
      } else {
        localStorage.setItem("sessionToken", data.token);
        localStorage.setItem("managerUser", u);
        localStorage.setItem("managerLocation", loc);
        window.location.href = "dashboard.html";
      }
    })
    .catch(err => {
      errEl.textContent = "Network error: " + err;
    });
}
