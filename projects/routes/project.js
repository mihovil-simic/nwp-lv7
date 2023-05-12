var express = require("express");
var router = express.Router();
var Project = require("../models/project");
const User = require("../models/user");

router.post("/projects", (req, res) => {
  const project = new Project(req.body);
  project.save((err, result) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(result);
    }
  });
});

router.get("/projects", (req, res) => {
  Project.find((err, result) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(result);
    }
  });
});

router.get("/projects/:id", (req, res) => {
  Project.findById(req.params.id, (err, result) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(result);
    }
  });
});

router.put("/projects/:id", (req, res) => {
  Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, result) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.send(result);
      }
    }
  );
});

router.delete("/projects/:id", (req, res) => {
  Project.findByIdAndDelete(req.params.id, (err, result) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(result);
    }
  });
});

router.post("/projects/:id/team-members", (req, res) => {
  const { firstName, lastName, email } = req.body;
  User.findOne({ email }, (err, existingUser) => {
    if (err) {
      res.send("An error occurred during registration. Please try again.");
      return;
    }

    if (!existingUser) {
      res.send("User not found.");
      return;
    }
  });

  Project.findById(req.params.id, (err, project) => {
    if (err) {
      res.status(400).send(err);
    } else {
      project.teamMembers.push({ firstName, lastName, email });
      project.save((err, updatedProject) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(updatedProject);
        }
      });
    }
  });
});

router.get("/projects/manager", function (req, res) {
  Project.find({ manager: req.user._id }, function (err, projects) {
    if (err) throw err;
    res.send({ projects: projects });
  });
});

router.get("/projects/member", function (req, res) {
  Project.find(
    { teamMembers: { $in: [req.user._id] } },
    function (err, projects) {
      if (err) throw err;
      res.send({ projects: projects });
    }
  );
});

router.put("/projects/updateDone/:id", function (req, res) {
  Project.findById(req.params.id, function (err, project) {
    if (err) throw err;
    if (project.teamMembers.includes(req.user._id)) {
      project.jobs = req.body.jobs;
      project.save(function (err) {
        if (err) throw err;
        res.send("Project is successfully updated.!");
      });
    } else {
      res.send("You don't have permission for this project!");
    }
  });
});

app.get("/projects/archive", function (req, res) {
  Project.find(
    {
      $and: [
        {
          $or: [
            { manager: req.user._id },
            { teamMembers: { $in: [req.user._id] } },
          ],
        },
        { isArchived: true },
      ],
    },
    function (err, projects) {
      if (err) throw err;
      res.send({ projects: projects });
    }
  );
});

module.exports = router;
