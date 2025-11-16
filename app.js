/*******************************
  CONFIG
*******************************/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxLbmLTcp6HcV-N8CdGxQ2yI7VhgQiIjf1c0GmvHGLDgKeEQ6klo3P_fr2aciw9DSSW/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

// Simple frontend login users
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
  const u = document.getElementById("username").value.trim().toLowerCase();
  const p = document.getElementById("password").value.trim();
  const loc = document.getElementById("location").value;
  const errEl = document.getElementById("error");

  errEl.textContent = "";

  if (!u || !p || !loc) {
    errEl.textContent = "Please fill all fields.";
    return;
  }

  if (!USERS[u]) {
    errEl.textContent = "Invalid username";
    return;
  }
  if (USERS[u].password !== p) {
    errEl.textContent = "Incorrect password";
    return;
  }
  if (USERS[u].location !== loc) {
    errEl.textContent = "Location mismatch for this user.";
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

  const title = document.getElementById("title");
  title.textContent = `${loc} — Manager (${u})`;

  loadRows();
}

/*******************************
  LOAD ROWS
*******************************/
async function loadRows() {
  const loc = localStorage.getItem("location");
  const tb  = document.getElementById("tableBody");

  tb.innerHTML = `<tr><td colspan="9">Loading…</td></tr>`;

  const filters = {
    status: document.getElementById("statusFilter")?.value || "all",
    from:   document.getElementById("fromDate")?.value || "",
    to:     document.getElementById("toDate")?.value   || ""
  };

  const url = `${SCRIPT_URL}?action=getRows` +
              `&location=${encodeURIComponent(loc)}` +
              `&token=${API_TOKEN}` +
              `&filters=${encodeURIComponent(JSON.stringify(filters))}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    populateTable(data.rows || []);
  } catch (err) {
    tb.innerHTML = `<tr><td colspan="9">Error loading: ${err}</td></tr>`;
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

  if (!rows || !rows.length) {
    tb.innerHTML = `<tr><td colspan="9">No records found.</td></tr>`;
    return;
  }

  rows.forEach(r => {
    const tr = document.createElement("tr");

    const dates = `${new Date(r.startDate).toDateString()} → ${new Date(r.endDate).toDateString()}`;
    const statusClass = (r.status || "").toLowerCase();

    tr.innerHTML = `
      <td>${r.employeeId || ""}</td>
      <td>
        ${r.name || ""}
        <br><span class="small">${r.employeeEmail || ""}</span>
      </td>
      <td>${dates}</td>
      <td>${r.type || ""}</td>
      <td>${r.comment || ""}</td>
      <td>
        <span class="badge badge-${statusClass}">${r.status || "Pending"}</span>
      </td>
      <td>${r.manager || ""}</td>
      <td>
        <textarea id="note_${r.requestId}" class="note-box" rows="1">${r.managerNote || ""}</textarea>
      </td>
      <td>
        <button class="btn btn-approve" onclick="updateStatus('${r.requestId}','Approved')">Approve</button>
        <button class="btn btn-reject" onclick="updateStatus('${r.requestId}','Rejected')">Reject</button>
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
  const note = document.getElementById(`note_${requestId}`).value || "";

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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(d => {
      if (d.error) {
        alert("Error: " + d.error);
      } else {
        alert("Updated successfully!");
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