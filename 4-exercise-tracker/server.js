const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
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

app.use(cors());
app.use(express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  count: Number,
  log: [exerciseSchema],
});

let Exercise = mongoose.model("Exercise", exerciseSchema);
let User = mongoose.model("User", userSchema);

app.post("/api/users", async (req, res) => {
  try {
    let check = await User.find({ username: req.body.username });

    if (check.length > 0) {
      return res.send("Username aleardy taken");
    }

    let data = await User.create(req.body);

    return res.json({
      username: data.username,
      _id: data._id,
    });
  } catch (err) {
    return res.json({
      error: err.message,
    });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    let data = await User.find();

    if (data.length == 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.send(data);
  } catch (err) {
    return (
      res,
      status(500).json({
        error: err.message,
      })
    );
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    let user = await User.find({ _id: req.params._id });

    let isValid = new Date(req.body.date).toDateString();

    if (isValid == "Invalid Date") {
      isValid = new Date().toDateString();
    }

    let addExercise = {
      description: req.body.description,
      duration: req.body.duration,
      date: isValid,
    };

    let createExercise = await Exercise.create(addExercise);

    let updatedUser = await User.findByIdAndUpdate(
      req.params._id,
      { $push: { log: addExercise } },
      { new: true }
    );

    return res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      date: createExercise.date,
      duration: createExercise.duration,
      description: createExercise.description,
    });
  } catch (err) {
    return res.json({
      error: err.message,
    });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params._id });

    let updatedUser = await User.findByIdAndUpdate(
      req.params._id,
      { count: user.log.length },
      { new: true }
    );

    if (req.query.from || req.query.to) {
      let fromDate = new Date(0).getTime();
      let toDate = new Date().getTime();

      if (req.query.from) {
        fromDate = new Date(req.query.from).getTime();
      }

      if (req.query.to) {
        toDate = new Date(req.query.to).getTime();
      }

      let filterLogs = [];

      for (let i = 0; i < user.log.length; i++) {
        let logDate = new Date(user.log[i].date).getTime();

        if (logDate >= fromDate && logDate <= toDate) {
          filterLogs.push(user.log[i]);
        }
      }

      filterLogs = updatedUser.log;
    }

    if (req.query.limit) {
      updatedUser.log = updatedUser.log.slice(0, req.query.limit);
    }

    return res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      count: updatedUser.count,
      log: updatedUser.log,
    });
  } catch (err) {
    return res.json({
      error: err.message,
    });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
