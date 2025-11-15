const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwS-A6B_OpqyxDwqG7swgJb-4tCZcaFEvNwYf5T16HptLm4LMaLD7G2zJM2EKPzgw/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

function initDashboard() {
    const token = localStorage.getItem("sessionToken");
    const location = localStorage.getItem("location");
    const username = localStorage.getItem("username");

    if (!token || !location || !username) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("titleLocation").innerText =
        `Dashboard — ${location}`;

    loadRows();
}

async function loadRows() {
    const token = localStorage.getItem("sessionToken");
    const location = localStorage.getItem("location");

    const filters = {};

    const url = `${SCRIPT_URL}?action=getRows&token=${API_TOKEN}&sessionToken=${token}&location=${encodeURIComponent(location)}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

    const res = await fetch(url);
    const data = await res.json();

    populateTable(data.rows);
}

function applyFilters() {
    const token = localStorage.getItem("sessionToken");
    const location = localStorage.getItem("location");

    const filters = {
        status: document.getElementById("statusFilter").value,
        from: document.getElementById("fromDate").value,
        to: document.getElementById("toDate").value
    };

    const url = `${SCRIPT_URL}?action=getRows&token=${API_TOKEN}&sessionToken=${token}&location=${encodeURIComponent(location)}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

    document.getElementById("tableBody").innerHTML = `<tr><td colspan="10">Loading…</td></tr>`;

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

function populateTable(rows) {
    const tb = document.getElementById("tableBody");
    tb.innerHTML = "";

    if (!rows.length) {
        tb.innerHTML = `<tr><td colspan="10">No matching requests.</td></tr>`;
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
            <td><span class="statusBadge ${r.status}">${r.status}</span></td>
            <td>${r.manager || ""}</td>
            <td><textarea id="note_${r.requestId}">${r.managerNote || ""}</textarea></td>
            <td>
                <button class="actionBtn approveBtn" onclick="updateStatus('${r.requestId}','Approved')">Approve</button>
                <button class="actionBtn rejectBtn" onclick="updateStatus('${r.requestId}','Rejected')">Reject</button>
            </td>
        `;
        tb.appendChild(tr);
    });
}

function updateStatus(requestId, status) {
    const note = document.getElementById(`note_${requestId}`).value;

    const token = localStorage.getItem("sessionToken");
    const location = localStorage.getItem("location");

    const payload = {
        sessionToken: token,
        location,
        action: "setDecision",
        decisions: [{
            requestId,
            status,
            managerNote: note
        }]
    };

    fetch(`${SCRIPT_URL}?token=${API_TOKEN}&action=setDecision`, {
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

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
