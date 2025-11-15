/*******************************
  CONFIG
*******************************/
const SCRIPT_URL = "YOUR_DEPLOYED_APPS_SCRIPT_URL";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

// Default LOGIN (Option B)
const USERS = {
   "c4":  { password:"c4@123",  location:"C4" },
   "app": { password:"app@123", location:"Appalachian" },
   "ciw": { password:"ciw@123", location:"CIW" },
   "hin": { password:"hin@123", location:"Hinman" },
   "lib": { password:"lib@123", location:"Library" }
};

/*******************************
  LOGIN
*******************************/
function login() {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const loc = document.getElementById("location").value;

    if (!USERS[u]) {
        document.getElementById("error").innerText = "Invalid username";
        return;
    }
    if (USERS[u].password !== p) {
        document.getElementById("error").innerText = "Incorrect password";
        return;
    }
    if (USERS[u].location !== loc) {
        document.getElementById("error").innerText = "Location mismatch";
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
    const u = localStorage.getItem("user");
    const loc = localStorage.getItem("location");

    if (!u || !loc) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("title").innerText =
        `Dashboard — ${loc}`;

    loadRows();
}

/*******************************
  LOAD ROWS
*******************************/
async function loadRows() {
    const loc = localStorage.getItem("location");

    document.getElementById("tableBody").innerHTML =
        `<tr><td colspan="10">Loading…</td></tr>`;

    const filters = {};
    const url = `${SCRIPT_URL}?action=getRows&location=${encodeURIComponent(loc)}&token=${API_TOKEN}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

    const res = await fetch(url);
    const data = await res.json();

    populateTable(data.rows);
}

function applyFilters() {
    const loc = localStorage.getItem("location");

    const filters = {
        status: document.getElementById("statusFilter").value,
        from:   document.getElementById("fromDate").value,
        to:     document.getElementById("toDate").value
    };

    const url = `${SCRIPT_URL}?action=getRows&location=${loc}&token=${API_TOKEN}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

    document.getElementById("tableBody").innerHTML =
        `<tr><td colspan="10">Filtering…</td></tr>`;

    fetch(url)
        .then(r => r.json())
        .then(d => populateTable(d.rows));
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

        const dates = `${new Date(r.startDate).toDateString()} → ${new Date(r.endDate).toDateString()}`;

        tr.innerHTML = `
            <td>${r.employeeId}</td>
            <td>${r.name}<br><span class="small">${r.employeeEmail}</span></td>
            <td>${dates}</td>
            <td>${r.type}</td>
            <td>${r.comment}</td>
            <td><span class="badge ${r.status}">${r.status}</span></td>
            <td>${r.manager || ""}</td>
            <td><textarea id="note_${r.requestId}">${r.managerNote || ""}</textarea></td>
            <td>
                <button onclick="updateStatus('${r.requestId}','Approved')">Approve</button>
                <button onclick="updateStatus('${r.requestId}','Rejected')">Reject</button>
            </td>
        `;
        tb.appendChild(tr);
    });
}

/*******************************
  APPROVE / REJECT
*******************************/
function updateStatus(requestId, status) {
    const loc = localStorage.getItem("location");
    const user = localStorage.getItem("user");

    const note = document.getElementById(`note_${requestId}`).value;

    const payload = {
        action: "setDecision",
        location: loc,
        decisions: [{
            requestId,
            status,
            managerNote: note
        }],
        managerUsername: user
    };

    fetch(`${SCRIPT_URL}?token=${API_TOKEN}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
    })
        .then(r => r.json())
        .then(() => {
            alert("Updated!");
            loadRows();
        });
}

/*******************************
  LOGOUT
*******************************/
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
