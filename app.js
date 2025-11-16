/*******************************
  CONFIG
*******************************/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxLbmLTcp6HcV-N8CdGxQ2yI7VhgQiIjf1c0GmvHGLDgKeEQ6klo3P_fr2aciw9DSSW/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

/* Simple login accounts (username → password + location) */
const USERS = {
  "c4":  { password: "c4@123",  location: "C4" },
  "app": { password: "app@123", location: "Appalachian" },
  "ciw": { password: "ciw@123", location: "CIW" },
  "hin": { password: "hin@123", location: "Hinman" },
  "lib": { password: "lib@123", location: "Library" }
};

/*******************************
  LOGIN
*******************************/
function login() {
  const u   = document.getElementById("username").value.trim();
  const p   = document.getElementById("password").value.trim();
  const loc = document.getElementById("location").value;
  const err = document.getElementById("error");

  err.textContent = "";

  if (!USERS[u]) {
    err.textContent = "Invalid username.";
    return;
  }
  if (USERS[u].password !== p) {
    err.textContent = "Incorrect password.";
    return;
  }
  if (USERS[u].location !== loc) {
    err.textContent = "This user is not allowed for that location.";
    return;
  }

  localStorage.setItem("user", u);
  localStorage.setItem("location", loc);

  window.location.href = "dashboard.html";
}

/*******************************
  DASHBOARD INIT
*******************************/
function initDashboard() {
  const u   = localStorage.getItem("user");
  const loc = localStorage.getItem("location");

  if (!u || !loc) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("who").textContent  = `${loc} — Manager (${u})`;
  document.getElementById("pageTitle").textContent = `Time-Off Dashboard – ${loc}`;

  loadRows();
}

/*******************************
  LOAD / FILTER ROWS
*******************************/
async function loadRows() {
  const loc = localStorage.getItem("location");
  if (!loc) return;

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = `<tr><td colspan="10" class="center">Loading…</td></tr>`;

  const filters = {};
  const url = `${SCRIPT_URL}?action=getRows&location=${encodeURIComponent(loc)}&token=${API_TOKEN}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    populateTable(data.rows || []);
  } catch (e) {
    alert("Network error while loading rows: " + e);
  }
}

function applyFilters() {
  const loc = localStorage.getItem("location");
  if (!loc) return;

  const filters = {
    status: document.getElementById("statusFilter").value,
    from:   document.getElementById("fromDate").value,
    to:     document.getElementById("toDate").value
  };

  const url = `${SCRIPT_URL}?action=getRows&location=${encodeURIComponent(loc)}&token=${API_TOKEN}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = `<tr><td colspan="10" class="center">Filtering…</td></tr>`;

  fetch(url)
    .then(r => r.json())
    .then(d => populateTable(d.rows || []))
    .catch(err => alert("Network error while filtering: " + err));
}

function resetFilters() {
  document.getElementById("statusFilter").value = "all";
  document.getElementById("fromDate").value     = "";
  document.getElementById("toDate").value       = "";
  loadRows();
}

/*******************************
  TABLE RENDER
*******************************/
function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });
}

function populateTable(rows) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="center">No matching requests.</td></tr>`;
    return;
  }

  rows.forEach(r => {
    const tr = document.createElement("tr");
    const dates = `${fmtDate(r.startDate)} → ${fmtDate(r.endDate || r.startDate)}`;

    tr.innerHTML = `
      <td>${r.employeeId || ""}</td>
      <td>
        <div class="emp-name">${r.name || ""}</div>
        <div class="emp-mail">${r.employeeEmail || ""}</div>
      </td>
      <td>${dates}</td>
      <td>${r.type || ""}</td>
      <td>${r.comment || ""}</td>
      <td><span class="status-badge ${String(r.status || "Pending").toLowerCase()}">${r.status || "Pending"}</span></td>
      <td>${r.manager || ""}</td>
      <td>
        <textarea id="note_${r.requestId}" rows="1" class="note-input">${r.managerNote || ""}</textarea>
      </td>
      <td class="actions">
        <button class="btn approve" onclick="updateStatus('${r.requestId}','Approved')">Approve</button>
        <button class="btn reject"  onclick="updateStatus('${r.requestId}','Rejected')">Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/*******************************
  APPROVE / REJECT
*******************************/
function updateStatus(requestId, status) {
  const loc  = localStorage.getItem("location");
  const user = localStorage.getItem("user");
  if (!loc || !user) {
    alert("Session expired – please log in again.");
    window.location.href = "index.html";
    return;
  }

  const noteEl = document.getElementById(`note_${requestId}`);
  const note   = noteEl ? noteEl.value : "";

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

  // IMPORTANT: use text/plain to avoid CORS preflight (this fixed your “Failed to fetch”)
  fetch(`${SCRIPT_URL}?token=${API_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(resp => {
      if (resp.error) {
        alert("Backend error: " + resp.error);
      } else {
        alert("Updated successfully!");
        loadRows();
      }
    })
    .catch(err => {
      alert("Network error while updating: " + err);
    });
}

/*******************************
  LOGOUT
*******************************/
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}