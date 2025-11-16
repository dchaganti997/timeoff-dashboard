<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title id="pageTitle">Time-Off Dashboard</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body class="dash-body" onload="initDashboard()">

  <header class="top-bar">
    <div class="top-left">
      <span class="top-title">Time-Off Dashboard</span>
      <span id="who" class="top-sub"></span>
    </div>
    <button class="btn subtle" onclick="logout()">Logout</button>
  </header>

  <main class="container">
    <section class="filters">
      <div class="field">
        <label for="statusFilter">Status</label>
        <select id="statusFilter">
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div class="field">
        <label for="fromDate">From</label>
        <input id="fromDate" type="date" />
      </div>

      <div class="field">
        <label for="toDate">To</label>
        <input id="toDate" type="date" />
      </div>

      <div class="filter-buttons">
        <button class="btn primary" onclick="applyFilters()">Apply</button>
        <button class="btn subtle" onclick="resetFilters()">Reset</button>
      </div>
    </section>

    <section class="table-card">
      <table class="requests-table">
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Employee</th>
            <th>Dates</th>
            <th>Type</th>
            <th>Comment</th>
            <th>Status</th>
            <th>Manager</th>
            <th>Manager Note</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          <!-- Filled by JS -->
        </tbody>
      </table>
    </section>
  </main>

  <script src="app.js"></script>
</body>
</html>
