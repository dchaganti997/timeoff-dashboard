const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxMlRApNGSoiZ-HuNAtrpoEPduBdcStUwdFmjDAf2P0CUBuW2E5ESQ2Bori9y6u9JK_/exec";
const API_TOKEN  = "DCHAGANTI_TIMEOFF_9A83B7X2";

function initDashboard() {
  const user = localStorage.getItem("managerUser");
  const loc  = localStorage.getItem("managerLocation");

  if (!user || !loc) {
    window.location.href = "index.html";
    return;
  }

  const titleEl = document.getElementById("titleLocation");
  titleEl.textContent = `${loc} — ${user}`;

  loadRows();
}

async function loadRows() {
  const tb = document.getElementById("tableBody");
  tb.innerHTML = `<tr><td colspan="9">Loading…</td></tr>`;

  const loc = localStorage.getItem("managerLocation");
  const session = localStorage.getItem("sessionToken");
  const filters = {
    status: document.getElementById("statusFilter").value,
    from:   document.getElementById("fromDate").value,
    to:     document.getElementById("toDate").value
  };

  const url = `${SCRIPT_URL}?token=${API_TOKEN}` +
              `&action=getRows` +
              `&location=${encodeURIComponent(loc)}` +
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

async function updateStatus(requestId, status) {
  const loc = localStorage.getItem("managerLocation");
  const user= localStorage.getItem("managerUser");
  const note= document.getElementById(`note_${requestId}`).value || "";

  const payload = [{
    requestId,
    status,
    managerNote: note
  }];

  const url = `${SCRIPT_URL}?token=${API_TOKEN}` +
              `&action=setDecision` +
              `&location=${encodeURIComponent(loc)}` +
              `&managerName=${encodeURIComponent(user)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (d.error) {
      alert("Error: " + d.error);
    } else {
      alert("Updated: " + (d.updated || 0));
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
