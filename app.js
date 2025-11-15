// BACKEND CONFIG
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwS-A6B_OpqyxDwqG7swgJb-4tCZcaFEvNwYf5T16HptLm4LMaLD7G2zJM2EKPzgw/exec";

const API_TOKEN = "DCHAGANTI_TIMEOFF_9A83B7X2";

// SESSION DATA FROM LOGIN
const sessionUser = localStorage.getItem("sessionUser");
const sessionLocation = localStorage.getItem("sessionLocation");

// If no login → redirect
if (!sessionUser || !sessionLocation) {
    window.location.href = "login.html";
}

// Set title
document.getElementById("locationTitle").innerText =
    `Dashboard — ${sessionLocation}`;

// -------------------------------------------------------
// LOAD INITIAL DATA
// -------------------------------------------------------
async function loadRows() {
    document.getElementById("tableBody").innerHTML =
        `<tr><td colspan="10">Loading…</td></tr>`;

    const url =
        `${SCRIPT_URL}?action=getRows&token=${API_TOKEN}&location=${sessionLocation}`;

    const res = await fetch(url);
    const data = await res.json();

    populateTable(data.rows);
}

// -------------------------------------------------------
// FILTERS
// -------------------------------------------------------
function applyFilters() {
    const status = document.getElementById("statusFilter").value;
    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    const filters = {
        status,
        from,
        to,
        location: sessionLocation
    };

    const url =
        `${SCRIPT_URL}?action=getRows&token=${API_TOKEN}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

    document.getElementById("tableBody").innerHTML =
        `<tr><td colspan="10">Loading…</td></tr>`;

    fetch(url)
        .then(r => r.json())
        .then(d => populateTable(d.rows));
}

// Reset filters
function resetFilters() {
    document.getElementById("statusFilter").value = "all";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
    loadRows();
}

// -------------------------------------------------------
// TABLE RENDER
// -------------------------------------------------------
function populateTable(rows) {
    const tb = document.getElementById("tableBody");
    tb.innerHTML = "";

    if (!rows || rows.length === 0) {
        tb.innerHTML = `<tr><td colspan="10">No records found.</td></tr>`;
        return;
    }

    rows.forEach(r => {
        const tr = document.createElement("tr");

        const dates =
            `${new Date(r.startDate).toDateString()} → ${new Date(r.endDate).toDateString()}`;

        tr.innerHTML = `
        <td>${r.employeeId}</td>
        <td>${r.name}<br><span class="small">${r.employeeEmail}</span></td>
        <td>${dates}</td>
        <td>${r.type}</td>
        <td>${r.comment}</td>
        <td><span class="statusBadge ${r.status}">${r.status}</span></td>
        <td>${r.manager || ""}</td>
        <td><textarea id="note_${r.requestId}" rows="1">${r.managerNote || ""}</textarea></td>
        <td>
            <button class="actionBtn approveBtn"
                onclick="updateStatus('${r.requestId}', 'Approved')">Approve</button>

            <button class="actionBtn rejectBtn"
                onclick="updateStatus('${r.requestId}', 'Rejected')">Reject</button>
        </td>
        `;

        tb.appendChild(tr);
    });
}

// -------------------------------------------------------
// UPDATE STATUS
// -------------------------------------------------------
function updateStatus(requestId, status) {

    const note = document.getElementById(`note_${requestId}`).value;

    const payload = [{
        requestId,
        status,
        managerNote: note,
        location: sessionLocation  // <── IMPORTANT
    }];

    fetch(`${SCRIPT_URL}?action=setDecision&token=${API_TOKEN}`, {
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

// -------------------------------------------------------
// LOGOUT
// -------------------------------------------------------
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// Auto-load rows
loadRows();
