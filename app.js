const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwS-A6B_OpqyxDwqG7swgJb-4tCZcaFEvNwYf5T16HptLm4LMaLD7G2zJM2EKPzgw/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2"; 

// MULTI-LOCATION SHEET MAP
const SHEETS = {
  "C4": "1J99tJNmQQWSibI-tyaU9LeFMfcev4FKY3ZZW6pUOI-c",
  "Appalachian": "18SCtJHCAfG7x1f3TWhv6FyekeyyGpaOyI9K1civPYM0",
  "CIW": "17uckeJG2gIXdNRlEZVmEKa2cjEsZNAF2Lhy8qoutIXA",
  "Hinman": "1J3g3mKkCc2vDLiA_NQdnutitWJlK_MU7uonMEht6asE",
  "Food Trucks": "1ADdVHSb3wh33MzZ0-1JfImRbQt6lMDm0VNJgucOq7Qc",
  "Einstein": "1cV8CYmBjySLM3aV3t6HqfXn1cgF8qOMw_yo7-QYHaHA",
  "Library": "1zKjFZilK13iVtrTKC7IpEt_x0BjKEn2uG71aqV_tjpg",
  "Dunkin": "1XmGbySoSovhhsFg_JInB2FWghLEaOdDik15nsp7ydYE",
  "Market Place": "1zBTXaGcpK0tGQ1RhOLl5REvtRtNMqBk61D99u62VcIY",
  "Health Sciences": "1JIeX44zeI2bB8PslvUw6oMSrUK6HDBbUHkh786gb_LI",
  "Starbucks": "1LR35Td_F4avhBa2g9VhDCqez-n5zy4vnHIEF6DdSIjQ",
  "Garbanzos": "1LBPkdTv_hPcvEDWLCRzVjP7nvHV733sSSglT63nSkx8"
};

function initDashboard() {
    const email = localStorage.getItem("managerEmail");
    const location = localStorage.getItem("location");

    if (!email || email.toLowerCase() !== "mgroski@binghamton.edu") {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("titleLocation").innerText =
        `Dashboard — ${location}`;

    loadRows();
}

// LOAD ROWS
async function loadRows() {
    const statusBody = document.getElementById("tableBody");
    statusBody.innerHTML = `<tr><td colspan="10">Loading…</td></tr>`;

    const filters = {};
    const url = `${SCRIPT_URL}?action=getRows&token=${API_TOKEN}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

    const res = await fetch(url);
    const data = await res.json();

    populateTable(data.rows);
}

function applyFilters() {
    const filters = {
        status: document.getElementById("statusFilter").value,
        from: document.getElementById("fromDate").value,
        to: document.getElementById("toDate").value
    };

    const url = `${SCRIPT_URL}?action=getRows&token=${API_TOKEN}&filters=${encodeURIComponent(JSON.stringify(filters))}`;

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

    const payload = [{
        requestId,
        status,
        managerNote: note
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

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
