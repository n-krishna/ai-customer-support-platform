const express = require("express");
const cors = require("cors");

require("dotenv").config({
  path: __dirname + "/.env",
});

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SupportAI backend is running");
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});