require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const urlparser = require("url");
const app = express();
const mongoose = require("mongoose");
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.error(err));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(
  express.urlencoded({
    extended: true,
  })
);

const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: Number,
});

let Url = mongoose.model("Url", urlSchema);

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
  try {
    let isValid = dns.lookup(
      urlparser.parse(req.body.url).hostname,
      (err, data) => {
        if (!data) {
          return res.json({
            error: "invalid url",
          });
        }
      }
    );

    let countData = await Url.find();
    let shortUrl = countData.length + 1;

    let data = await Url.create({
      original_url: req.body.url,
      short_url: shortUrl,
    });

    res.send({
      original_url: data.original_url,
      short_url: data.short_url,
    });
  } catch (err) {
    return res.json({
      error: err,
    });
  }
});

app.get("/api/shorturl/:sortUrl", async (req, res) => {
  try {
    let data = await Url.findOne({ short_url: req.params.sortUrl });

    return res.redirect(data.original_url);
  } catch (err) {
    return res.json({
      error: err.message,
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
