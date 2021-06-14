// server.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/:date", (req, res) => {
  const isUnix = /^[\d]{10,15}$/.test(req.params.date);
  const check = new Date(req.params.date).toUTCString();

  if (isUnix == true) {
    const unixDate = parseInt(req.params.date);
    const toUTC = new Date(unixDate).toUTCString();

    return res.json({
      unix: parseInt(req.params.date),
      utc: toUTC,
    });
  } else if (check !== "Invalid Date") {
    const toUnix = parseInt(new Date(check).getTime());

    return res.json({
      unix: toUnix,
      utc: check,
    });
  } else if (check == "Invalid Date") {
    return res.json({
      error: "Invalid Date",
    });
  }
});

app.get("/api", (req, res) => {
  const toUTC = new Date().toUTCString();
  const toUnix = parseInt(new Date().getTime());

  return res.json({
    unix: toUnix,
    utc: toUTC,
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
