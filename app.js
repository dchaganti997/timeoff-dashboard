const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwS-A6B_OpqyxDwqG7swgJb-4tCZcaFEvNwYf5T16HptLm4LMaLD7G2zJM2EKPzgw/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

// ---------------------- LOAD DATA ---------------------- //
async function loadRows() {
    document.getElementById("tableBody").innerHTML =
        `<tr><td colspan="10">Loading…</td></tr>`;

    const url = `${SCRIPT_URL}?action=getRows&token=${API_TOKEN}`;

    const res = await fetch(url);
    const data = await res.json();
    populateTable(data.rows);
}

function applyFilters() {
    const status = document.getElementById("statusFilter").value;
    const from   = document.getElementById("fromDate").value;
    const to     = document.getElementById("toDate").value;

    const filters = { status, from, to };

    const url = `${SCRIPT_URL}?action=getRows&token=${API_TOKEN}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

    document.getElementById("tableBody").innerHTML =
        `<tr><td colspan="10">Loading…</td></tr>`;

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

// ---------------------- TABLE RENDER ---------------------- //
function populateTable(rows) {
    const tb = document.getElementById("tableBody");
    tb.innerHTML = "";

    if (!rows || rows.length === 0) {
        tb.innerHTML = `<tr><td colspan="10">No matching requests.</td></tr>`;
        return;
    }

    rows.forEach(r => {
        const tr = document.createElement("tr");

        const dates = `${new Date(r.startDate).toDateString()} → ${new Date(r.endDate).toDateString()}`;
        const statusHTML = `<span class="statusBadge ${r.status}">${r.status}</span>`;

        tr.innerHTML = `
            <td>${r.employeeId}</td>
            <td>${r.name}<br><span class="small">${r.employeeEmail}</span></td>
            <td>${dates}</td>
            <td>${r.type}</td>
            <td>${r.comment}</td>
            <td>${statusHTML}</td>
            <td>${r.manager || ""}</td>
            <td><textarea id="note_${r.requestId}" rows="1">${r.managerNote || ""}</textarea></td>
            <td>
                <button class="actionBtn approveBtn" onclick="updateStatus('${r.requestId}','Approved')">Approve</button>
                <button class="actionBtn rejectBtn" onclick="updateStatus('${r.requestId}','Rejected')">Reject</button>
            </td>
        `;

        tb.appendChild(tr);
    });
}

// ---------------------- UPDATE STATUS ---------------------- //
function updateStatus(requestId, status) {
    const note = document.getElementById(`note_${requestId}`).value;

    const decisions = [{
        requestId,
        status,
        managerNote: note
    }];

    const url =
        `${SCRIPT_URL}?action=setDecision` +
        `&token=${API_TOKEN}` +
        `&decisions=${encodeURIComponent(JSON.stringify(decisions))}`;

    fetch(url)
        .then(r => r.json())
        .then(d => {
            console.log("Update response:", d);
            if (d.error) {
                alert("Error: " + d.error);
                return;
            }
            alert("Updated successfully!");
            loadRows(); // reload table
        })
        .catch(err => alert("Network error: " + err));
}
