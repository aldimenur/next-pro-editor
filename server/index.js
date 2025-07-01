const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Penting agar bisa diakses dari React di port 3000
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello from Express backend!" });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Backend API running at http://localhost:${PORT}`);
});
