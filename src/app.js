//초기 진입, 서버, 라우터

require("dotenv").config();
const express = require("express");

const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const analysisRoutes = require("./routes/analysis");
const libraryRoutes = require("./routes/library");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/library", libraryRoutes);

app.get("/", (req, res) => res.json({ message: "My Smart Library API" }));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
