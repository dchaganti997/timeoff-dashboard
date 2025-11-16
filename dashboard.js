const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6g7ERKVeOY4mBVpM-alFVM3ty4u_NL6ZAfJ4jSPMDnWnPRZCjP8cEN2k4_Y7vyYJF/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

function initDashboard() {
  const user = localStorage.getItem("managerUser");
  const loc  = localStorage.getItem("managerLocation");
  const token= localStorage.getItem("sessionToken");

  if (!user || !loc || !token) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("titleLocation").textContent = `${loc} — ${user}`;
  loadRows();
}

async function loadRows() {
  const tb = document.getElementById("tableBody");
  tb.innerHTML = `<tr><td colspan="9">Loading…</td></tr>`;

  const loc    = localStorage.getItem("managerLocation");
  const token  = localStorage.getItem("sessionToken");
  const filters = {
    status: document.getElementById("statusFilter").value,
    from:   document.getElementById("fromDate").value,
    to:     document.getElementById("toDate").value
  };

  const url =
    `${SCRIPT_URL}?token=${API_TOKEN}` +
    `&action=getRows` +
    `&location=${encodeURIComponent(loc)}` +
    `&sessionToken=${encodeURIComponent(token)}` +
    `&filters=${encodeURIComponent(JSON.stringify(filters))}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      tb.innerHTML = `<tr><td colspan="9">${data.error}</td></tr>`;
      return;
    }
    populateTable(data.rows || []);
  } catch (err) {
    tb.innerHTML = `<tr><td colspan="9">Error: ${err}</td></tr>`;
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

function populateTable(rows) {
  const tb = document.getElementById("tableBody");
  tb.innerHTML = "";

  if (!rows || !rows.length) {
    tb.innerHTML = `<tr><td colspan="9">No matching requests.</td></tr>`;
    return;
  }

  rows.forEach(r => {
    const tr = document.createElement("tr");
    const dates = `${new Date(r.startDate).toDateString()} → ${new Date(r.endDate || r.startDate).toDateString()}`;
    const statusClass = (r.status || "Pending").toLowerCase();

    tr.innerHTML = `
      <td>${r.employeeId || ""}</td>
      <td>${r.name || ""}<br><span class="small">${r.employeeEmail || ""}</span></td>
      <td>${dates}</td>
      <td>${r.type || ""}</td>
      <td>${r.comment || ""}</td>
      <td><span class="statusBadge ${statusClass}">${r.status || "Pending"}</span></td>
      <td>${r.manager || ""}</td>
      <td><textarea id="note_${r.requestId}" rows="1">${r.managerNote || ""}</textarea></td>
      <td>
        <button class="actionBtn approveBtn" onclick="updateStatus('${r.requestId}','Approved')">Approve</button>
        <button class="actionBtn rejectBtn"  onclick="updateStatus('${r.requestId}','Rejected')">Reject</button>
      </td>
    `;
    tb.appendChild(tr);
  });
}

async function updateStatus(requestId, status) {
  const note   = document.getElementById(`note_${requestId}`).value || "";
  const loc    = localStorage.getItem("managerLocation");
  const user   = localStorage.getItem("managerUser");
  const token  = localStorage.getItem("sessionToken");

  const payload = {
    sessionToken: token,
    location: loc,
    decisions: [
      {
        requestId,
        status,
        managerNote: note
      }
    ]
  };

  try {
    const res = await fetch(
      `${SCRIPT_URL}?token=${API_TOKEN}&action=setDecision`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const data = await res.json();
    if (data.error) {
      alert("Error: " + data.error);
    } else {
      alert("Updated " + (data.updated || 0) + " row(s).");
      loadRows();
    }
  } catch (err) {
    alert("Network error: " + err);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
