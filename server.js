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

/**
 * @param page
 * /
 * /enemy
 * /pokemon
 * /battle
 */
app.post("/rec", upload.single("file"), (req, res) => {
  const { path } = req.file;
  console.log(`req from : ${req.body.page}`);
  const KALDI_PORT = req.body.page === "/battle" ? 8081 : 8080;
  const process = spawn("python3", [
    "production.py",
    "-u",
    `ws://localhost:${KALDI_PORT}/client/ws/speech`,
    "-r",
    "32000",
    path
  ]);
  process.stdout.once("data", data => {
    fs.unlink(path, err => {
      if (err) {
        console.error(err);
      }
    });
    res.status(200).send({ data: data.toString().trim() });
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Start server at port :", process.env.PORT || 5000);
});
