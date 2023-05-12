var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

router.get("/home", (req, res) => {
  const userId = req.cookies.userId;
  if (userId) {
    User.findById(userId, (err, user) => {
      if (err || !user) {
        res.send("Error retrieving user data.");
        return;
      }
      res.send(`Welcome back, ${user.username}!`);
    });
  } else {
    res.send("Welcome! Please login or register.");
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username }, (err, user) => {
    if (err || !user) {
      res.send("Invalid credentials. Please try again.");
      return;
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        res.send("Invalid credentials. Please try again.");
        return;
      }

      res.cookie("userId", user._id.toString(), {
        maxAge: 3600000,
        httpOnly: true,
      });
      res.send(
        `Welcome, ${user.username}! You have been logged in successfully.`
      );
    });
  });
});

router.post("/register", (req, res) => {
  const { username, password, email } = req.body;

  User.findOne({ username }, (err, existingUser) => {
    if (err) {
      res.send("An error occurred during registration. Please try again.");
      return;
    }

    if (existingUser) {
      res.send("Username already exists. Please choose a different username.");
      return;
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        res.send("An error occurred during registration. Please try again.");
        return;
      }

      const newUser = new User({
        username,
        password: hashedPassword,
        email,
      });

      newUser.save((err, savedUser) => {
        if (err) {
          res.send("An error occurred during registration. Please try again.");
          return;
        }

        res.cookie("userId", savedUser._id.toString(), {
          maxAge: 3600000,
          httpOnly: true,
        });
        res.send(`Registration successful! Welcome, ${savedUser.username}!`);
      });
    });
  });
});

module.exports = router;
