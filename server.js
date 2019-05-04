const express = require("express");
const fs = require("fs");
const spawn = require("child_process").spawn;
const ffmpeg = require('fluent-ffmpeg');

const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(bodyParser());

const upload = multer({ dest: "upload" });

const mp3ToWav = (src,dest) => {
return new Promise((res) => {
  ffmpeg(src)
  .toFormat('wav')
  .audioFrequency(16000)
  .on('error', (err) => {
      console.log('An error occurred: ' + err.message);
  })
  .on('progress', (progress) => {
      // console.log(JSON.stringify(progress));
      console.log('Processing: ' + progress.targetSize + ' KB converted');
  })
  .on('end', () => {
      console.log('Processing finished !');
      res()
  })
  .save(dest);//path where you want to save your file

})
}

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

mp3ToWav('./filename.mp3', 'filename.wav')

// app.listen(process.env.PORT || 5000, () => {
//   console.log("Start server at port :", process.env.PORT || 5000);
// });
