const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwS-A6B_OpqyxDwqG7swgJb-4tCZcaFEvNwYf5T16HptLm4LMaLD7G2zJM2EKPzgw/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

/***** MANAGER CREDENTIALS (JS ONLY) *****/
const MANAGERS = {
  "c4_manager":        { password: "C4admin@2025",       locations: ["C4"] },
  "app_manager":       { password: "Appadmin@2025",      locations: ["Appalachian"] },
  "ciw_manager":       { password: "CIWadmin@2025",      locations: ["CIW"] },
  "hinman_manager":    { password: "Hinadmin@2025",      locations: ["Hinman"] },
  "trucks_manager":    { password: "Trucks@2025",        locations: ["Food Trucks"] },
  "einstein_manager":  { password: "Eins@2025",          locations: ["Einstein"] },
  "library_manager":   { password: "Lib@2025",           locations: ["Library"] },
  "dunkin_manager":    { password: "Dunk@2025",          locations: ["Dunkin"] },
  "market_manager":    { password: "Market@2025",        locations: ["Market Place"] },
  "hs_manager":        { password: "HS@2025",            locations: ["Health Sciences"] },
  "starbucks_manager": { password: "Star@2025",          locations: ["Starbucks"] },
  "garb_manager":      { password: "Garb@2025",          locations: ["Garbanzos"] },

  // SUPER ADMIN - access all locations
  "deepak":            { password: "Deepak@2025",        locations: ["all"] }
};

// ALL locations (for super admin dropdown)
const ALL_LOCATIONS = [
  "C4","Appalachian","CIW","Hinman","Food Trucks",
  "Einstein","Library","Dunkin","Market Place",
  "Health Sciences","Starbucks","Garbanzos"
];

/************ LOGIN PAGE LOGIC ************/

function onUsernameChange() {
  const u = (document.getElementById("username").value || "").trim();
  const locSelect = document.getElementById("location");
  const defOpt = "<option>Select username first</option>";

  const mgr = MANAGERS[u];

  if (!mgr) {
    locSelect.innerHTML = "<option>Invalid username</option>";
    locSelect.disabled = true;
    return;
  }

  locSelect.disabled = false;
  locSelect.innerHTML = "";

  let allowed = mgr.locations;
  if (allowed.includes("all")) {
    ALL_LOCATIONS.forEach(loc => {
      locSelect.innerHTML += `<option value="${loc}">${loc}</option>`;
    });
  } else {
    allowed.forEach(loc => {
      locSelect.innerHTML += `<option value="${loc}">${loc}</option>`;
    });
  }
}

function login() {
  const u = (document.getElementById("username").value || "").trim();
  const p = (document.getElementById("password").value || "");
  const loc = (document.getElementById("location").value || "").trim();
  const err = document.getElementById("loginError");

  const mgr = MANAGERS[u];
  if (!mgr) {
    err.textContent = "Invalid username.";
    return;
  }
  if (!loc) {
    err.textContent = "Please select a location.";
    return;
  }
  if (mgr.password !== p) {
    err.textContent = "Incorrect password.";
    return;
  }
  if (!mgr.locations.includes("all") && !mgr.locations.includes(loc)) {
    err.textContent = "You are not allowed for this location.";
    return;
  }

  // success
  localStorage.setItem("managerUser", u);
  localStorage.setItem("managerLocation", loc);
  err.textContent = "";

  window.location.href = "dashboard.html";
}

/************ DASHBOARD LOGIC ************/

function initDashboard() {
  const user = localStorage.getItem("managerUser");
  const location = localStorage.getItem("managerLocation");

  if (!user || !location) {
    window.location.href = "index.html";
    return;
  }

  const titleLoc = document.getElementById("titleLocation");
  if (titleLoc) {
    titleLoc.textContent = location + " • Logged in as " + user;
  }

  loadRows();
}

function logout() {
  localStorage.removeItem("managerUser");
  localStorage.removeItem("managerLocation");
  window.location.href = "index.html";
}

/************ LOAD & FILTER ROWS ************/

async function loadRows() {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="9">Loading…</td></tr>`;

  const location = localStorage.getItem("managerLocation");
  if (!location) {
    tbody.innerHTML = `<tr><td colspan="9">Missing location in session. Please log in again.</td></tr>`;
    return;
  }

  const filters = {
    status: document.getElementById("statusFilter")
               ? document.getElementById("statusFilter").value
               : "all",
    from: document.getElementById("fromDate")
               ? document.getElementById("fromDate").value
               : "",
    to: document.getElementById("toDate")
               ? document.getElementById("toDate").value
               : ""
  };

  const url =
    `${SCRIPT_URL}?action=getRows` +
    `&token=${encodeURIComponent(API_TOKEN)}` +
    `&location=${encodeURIComponent(location)}` +
    `&filters=${encodeURIComponent(JSON.stringify(filters))}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    populateTable(data.rows || []);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9">Error loading data: ${err}</td></tr>`;
  }
}

function applyFilters() {
  loadRows();
}

function resetFilters() {
  const sf = document.getElementById("statusFilter");
  const fd = document.getElementById("fromDate");
  const td = document.getElementById("toDate");
  if (sf) sf.value = "all";
  if (fd) fd.value = "";
  if (td) td.value = "";
  loadRows();
}

/************ TABLE RENDER ************/

function safeDateToLabel(v) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric"
  });
}

function populateTable(rows) {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">No matching requests.</td></tr>`;
    return;
  }

  rows.forEach(r => {
    const tr = document.createElement("tr");

    const dateLabel = `${safeDateToLabel(r.startDate)} → ${safeDateToLabel(r.endDate)}`;
    const statusClass = `statusBadge ${r.status || "Pending"}`;

    tr.innerHTML = `
      <td>${r.employeeId || ""}</td>
      <td>
        ${r.name || ""}<br>
        <span class="smallText">${r.employeeEmail || ""}</span>
      </td>
      <td>${dateLabel}</td>
      <td>${r.type || ""}</td>
      <td>${r.comment || ""}</td>
      <td><span class="${statusClass}">${r.status || "Pending"}</span></td>
      <td>${r.manager || ""}</td>
      <td>
        <textarea id="note_${r.requestId}">${r.managerNote || ""}</textarea>
      </td>
      <td class="actionCell">
        <button class="actionBtn approveBtn"
          onclick="updateStatus('${r.requestId}','Approved')">Approve</button>
        <button class="actionBtn rejectBtn"
          onclick="updateStatus('${r.requestId}','Rejected')">Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/************ APPROVE / REJECT ************/

function updateStatus(requestId, status) {
  const location = localStorage.getItem("managerLocation");
  if (!location) {
    alert("Session expired. Please log in again.");
    window.location.href = "index.html";
    return;
  }

  const noteEl = document.getElementById(`note_${requestId}`);
  const managerNote = noteEl ? noteEl.value : "";

  const payload = [{
    requestId,
    status,
    managerNote
  }];

  const url =
    `${SCRIPT_URL}?action=setDecision` +
    `&token=${encodeURIComponent(API_TOKEN)}` +
    `&location=${encodeURIComponent(location)}`;

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(d => {
    if (d && d.updated >= 1) {
      alert("Updated successfully.");
      loadRows();
    } else if (d && d.error) {
      alert("Error from server: " + d.error);
    } else {
      alert("No rows updated. Check Request ID.");
    }
  })
  .catch(err => {
    alert("Network error: " + err);
  });
}
