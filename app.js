
const API_TOKEN = "DCHAGANTI_TIMEOFF_9A83B7X2";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwS-A6B_OpqyxDwqG7swgJb-4tCZcaFEvNwYf5T16HptLm4LMaLD7G2zJM2EKPzgw/exec";
const MANAGERS = {
  "c4_manager": {
    password: "C4admin@2025",
    locations: ["C4"]
  },
  "ciw_manager": {
    password: "CIWadmin@2025",
    locations: ["CIW"]
  },
  "multi_manager": {
    password: "AllAccess@2025",
    locations: ["all"]
  }
};

function login() {
  let u = document.getElementById("username").value.trim();
  let p = document.getElementById("password").value.trim();

  if (!MANAGERS[u] || MANAGERS[u].password !== p) {
    document.getElementById("loginError").innerText = "Invalid login";
    return;
  }

  localStorage.setItem("user", u);
  localStorage.setItem("locations", JSON.stringify(MANAGERS[u].locations));

  window.location.href = "dashboard.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

async function loadRows() {
  let locs = JSON.parse(localStorage.getItem("locations"));
  let location = locs[0];

  const url = `${SCRIPT_URL}?token=${API_TOKEN}&action=getRows&location=${location}&sessionToken=fake`;

  let res = await fetch(url);
  let data = await res.json();
  populateTable(data.rows);
}

function populateTable(rows) {
  const tb = document.getElementById("tableBody");
  tb.innerHTML = "";

  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.employeeId}</td>
      <td>${r.name}<br>${r.employeeEmail}</td>
      <td>${r.startDate} → ${r.endDate}</td>
      <td>${r.type}</td>
      <td>${r.comment}</td>
      <td>${r.status}</td>
      <td>${r.manager || ""}</td>
      <td><textarea id="note_${r.requestId}">${r.managerNote || ""}</textarea></td>
      <td>
        <button class="approveBtn" onclick="updateStatus('${r.requestId}', 'Approved')">Approve</button>
        <button class="rejectBtn" onclick="updateStatus('${r.requestId}', 'Rejected')">Reject</button>
      </td>
    `;
    tb.appendChild(tr);
  });
}

function updateStatus(id, status) {
  alert("Status updated (frontend demo)");
}
