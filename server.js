import express from "express";

const app = express();
app.use(express.json());

app.post("/api", (req, res) => {
  res.status(200).json(req.body);
});

const PORT = process.argv[2] || 3000;
app.listen(PORT, () => {
  console.log(`Application API instance running on port ${PORT}`);
});
