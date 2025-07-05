const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Penting agar bisa diakses dari React di port 3000
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/", (req, res) => {
  res.json({ message: "Hello from Express backend!" });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
});
