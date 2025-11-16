/*******************************
  CONFIG
*******************************/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6g7ERKVeOY4mBVpM-alFVM3ty4u_NL6ZAfJ4jSPMDnWnPRZCjP8cEN2k4_Y7vyYJF/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

// Simple frontend LOGIN (Option B)
const USERS = {
   "c4":  { password:"c4@123",  location:"C4" },
   "app": { password:"app@123", location:"Appalachian" },
   "ciw": { password:"ciw@123", location:"CIW" },
   "hin": { password:"hin@123", location:"Hinman" },
   "lib": { password:"lib@123", location:"Library" },
   "ft":  { password:"ft@123",  location:"Food Trucks" },
   "ein": { password:"ein@123", location:"Einstein" },
   "dunk":{ password:"dunk@123",location:"Dunkin" },
   "mp":  { password:"mp@123",  location:"Market Place" },
   "hs":  { password:"hs@123",  location:"Health Sciences" },
   "sb":  { password:"sb@123",  location:"Starbucks" },
   "garb":{ password:"garb@123",location:"Garbanzos" }
};

/*******************************
  LOGIN
*******************************/
function login() {
    const u   = document.getElementById("username").value.trim();
    const p   = document.getElementById("password").value.trim();
    const loc = document.getElementById("location").value;
    const err = document.getElementById("error");

    err.innerText = "";

    if (!u || !p || !loc) {
        err.innerText = "Please fill all fields.";
        return;
    }

    const user = USERS[u];
    if (!user) {
        err.innerText = "Invalid username.";
        return;
    }
    if (user.password !== p) {
        err.innerText = "Incorrect password.";
        return;
    }
    if (user.location !== loc) {
        err.innerText = "Location mismatch for this user.";
        return;
    }

    localStorage.setItem("user", u);
    localStorage.setItem("location", loc);

    window.location.href = "dashboard.html";
}

/*******************************
  DASHBOARD INITIALIZE
*******************************/
function initDashboard() {
    const u   = localStorage.getItem("user");
    const loc = localStorage.getItem("location");

    if (!u || !loc) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("title").innerText = `Dashboard — ${loc}`;
    loadRows();
}

/*******************************
  LOAD ROWS
*******************************/
async function loadRows() {
    const loc = localStorage.getItem("location");
    const body = document.getElementById("tableBody");

    body.innerHTML = `<tr><td colspan="10">Loading…</td></tr>`;

    const filters = {
        status: document.getElementById("statusFilter")?.value || "all",
        from:   document.getElementById("fromDate")?.value || "",
        to:     document.getElementById("toDate")?.value || ""
    };

    const url =
      `${SCRIPT_URL}?action=getRows` +
      `&location=${encodeURIComponent(loc)}` +
      `&token=${API_TOKEN}` +
      `&filters=${encodeURIComponent(JSON.stringify(filters))}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        populateTable(data.rows || []);
    } catch (err) {
        body.innerHTML = `<tr><td colspan="10">Error: ${err}</td></tr>`;
    }
}

function applyFilters() {
    loadRows();
}

function resetFilters() {
    document.getElementById("statusFilter").value = "all";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
    loadRows();
}

/*******************************
  TABLE RENDER
*******************************/
function populateTable(rows) {
    const tb = document.getElementById("tableBody");
    tb.innerHTML = "";

    if (!rows.length) {
        tb.innerHTML = `<tr><td colspan="10">No records found</td></tr>`;
        return;
    }

    rows.forEach(r => {
        const tr = document.createElement("tr");

        const start = r.startDate ? new Date(r.startDate).toDateString() : "";
        const end   = r.endDate   ? new Date(r.endDate).toDateString()   : "";
        const dates = `${start} → ${end}`;

        tr.innerHTML = `
            <td>${r.employeeId}</td>
            <td>${r.name}<br><span class="small">${r.employeeEmail}</span></td>
            <td>${dates}</td>
            <td>${r.type}</td>
            <td>${r.comment || ""}</td>
            <td><span class="badge ${r.status}">${r.status}</span></td>
            <td>${r.manager || ""}</td>
            <td><textarea id="note_${r.requestId}" class="noteBox">${r.managerNote || ""}</textarea></td>
            <td>
                <button class="approveBtn" onclick="updateStatus('${r.requestId}','Approved')">Approve</button>
                <button class="rejectBtn" onclick="updateStatus('${r.requestId}','Rejected')">Reject</button>
            </td>
        `;
        tb.appendChild(tr);
    });
}

/*******************************
  APPROVE / REJECT
*******************************/
function updateStatus(requestId, status) {
    const loc  = localStorage.getItem("location");
    const user = localStorage.getItem("user");
    const note = document.getElementById(`note_${requestId}`).value;

    const payload = {
        action: "setDecision",
        location: loc,
        managerUsername: user,
        decisions: [{
            requestId,
            status,
            managerNote: note
        }]
    };

    fetch(`${SCRIPT_URL}?token=${API_TOKEN}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
    })
    .then(r => r.json())
    .then(d => {
        if (d.error) {
            alert("Error: " + d.error);
        } else {
            alert("Updated!");
            loadRows();
        }
    })
    .catch(err => {
        alert("Network error: " + err);
    });
}

/*******************************
  LOGOUT
*******************************/
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
