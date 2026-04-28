const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const DB_FILE = "database.txt";

/* ---------- DATE HELPERS ---------- */

function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeekId() {
  return getMonday().toISOString().split("T")[0];
}

/* ---------- DB ---------- */

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    const data = { balance: 912, records: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return data;
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* ---------- INIT WEEK ---------- */

app.post("/init-week", (req, res) => {
  let data = loadData();

  const weekId = getWeekId();
  const exists = data.records.find(r => r.weekId === weekId);

  if (!exists) {
    const monday = getMonday();

    data.records.push({
      weekId,
      label: "Week of " + monday.toDateString(),
      status: "pending",
      received: 0
    });

    saveData(data);
  }

  res.json(data);
});

/* ---------- COMPLETE WEEK ---------- */

app.post("/complete-week", (req, res) => {
  const { weekId, addToBalance } = req.body;
  let data = loadData();

  const week = data.records.find(r => r.weekId === weekId);
  if (!week) return res.status(404).send("Not found");

  week.status = "done";
  week.received = 250;

  if (addToBalance) data.balance += 250;

  saveData(data);
  res.json(data);
});

/* ---------- SPEND ---------- */

app.post("/spend", (req, res) => {
  let data = loadData();
  const amount = req.body.amount;

  if (amount > data.balance) {
    return res.status(400).json({ error: "Not enough balance" });
  }

  data.balance -= amount;
  saveData(data);
  res.json(data);
});

/* ---------- DATA ---------- */

app.get("/data", (req, res) => {
  res.json(loadData());
});

/* ---------- START ---------- */

app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
