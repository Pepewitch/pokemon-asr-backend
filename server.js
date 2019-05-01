const express = require("express");
const fs = require("fs");
const spawn = require("child_process").spawn;

const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(bodyParser());

const upload = multer({ dest: "upload" });

app.post("/rec", upload.single("file"), (req, res) => {
  const { path } = req.file;
  const process = spawn("python3", [
    "production.py",
    "-u",
    "ws://localhost:8080/client/ws/speech",
    "-r",
    "32000",
    path
  ]);
  process.stdout.once("data", data => {
    res.status(200).send({ data: data.toString().trim() });
  });
});

app.listen(5000);
