
async function initWeek() {
  await fetch("/init-week", { method: "POST" });
  load();
}

async function load() {
  const res = await fetch("/data");
  const data = await res.json();

  document.getElementById("balance").textContent = data.balance;

  let html = "";

  data.records.forEach(r => {
    html += `
      <div class="card">
        <div class="title">${r.label}</div>
        <div class="status ${r.status}">
          ₱250 ${r.status === "done" ? "✅ Done" : "❌ Pending"}
        </div>

        ${r.status !== "done"
          ? `<button class="weekBtn" onclick="completeWeek('${r.weekId}')">Mark Done</button>`
          : ""
        }
      </div>
    `;
  });

  document.getElementById("records").innerHTML = html;
}

async function completeWeek(weekId) {
  const received = confirm("Did you receive this ₱250 in real life?");

  await fetch("/complete-week", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      weekId,
      addToBalance: received
    })
  });

  load();
}

async function spend() {
  const amount = parseInt(document.getElementById("spendAmount").value);

  await fetch("/spend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  });

  load();
}

initWeek();
