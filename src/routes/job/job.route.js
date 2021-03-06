const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const knex = require("../../config/db");
const { default: logger } = require("../../logger");

const {
  createJobSchema,
  getJobSchema,
  getJobsSchema,
  deleteJobSchema,
  updateJobSchema,
} = require("../../schema/job.schema");

router.post("/create", createJobSchema, (req, res) => {
  const {
    companyId,
    jobLink,
    jobTitle,
    jobLocation,
    jobDescription,
    jobRequirement,
    jobExperienceLevel,
    jobType,
    jobSalaryRange,
    jobStatus,
  } = req.body;

  // generate uuid and add to db
  const id = uuidv4();
  const jobStatusBoolean = jobStatus === "true" ? true : false;

  knex("job")
    .insert({
      id,
      companyId,
      jobLink,
      jobTitle,
      jobLocation,
      jobDescription,
      jobRequirement,
      jobExperienceLevel,
      jobType,
      jobSalaryRange,
      jobStatus: jobStatusBoolean,
    })
    .then(() => {
      res.send({ message: "Job created" });
    })
    .catch((e) => {
      console.log(e);

      res.status(500);
      res.send("INTERNAL SERVER ERROR");
    });
});

router.get("/", getJobsSchema, (req, res) => {
  // get query out from req
  if (!req.query.offset) {
    logger.error("No offset in query!");

    res.status(400);
    res.send("/jobs request need a query for offset!");
    return;
  }
  const offset = req.query.offset;
  const limit = 10;

  // get result from db
  knex("job")
    .limit(limit)
    .offset(offset)
    .then((jobList) => {
      res.send(jobList);
    })
    .catch((e) => {
      logger.error(e);

      res.status(500);
      res.send("INTERNAL SERVER ERROR");
    });
});

router.get("/search", getJobsSchema, (req, res) => {
  // get query out from req
  const jobTitle = req.query.jobTitle;
  if (req.query.companyId) {
    // get result from db
    knex("job")
      .where("jobTitle", "ilike", `%${jobTitle}%`)
      .andWhere("companyId", `${req.query.companyId}`)
      .then((jobList) => {
        if (jobList.length) res.send(jobList.slice(0, 5));
        else res.send({ message: "job not found" });
      })
      .catch((e) => {
        logger.error(e);

        res.status(500);
        res.send("INTERNAL SERVER ERROR");
      });
  } else {
    // get result from db
    knex("job")
      .where("jobTitle", "ilike", `%${jobTitle}%`)

      .then((jobList) => {
        if (jobList.length) res.send(jobList.slice(0, 5));
        else res.send({ message: "job not found" });
      })
      .catch((e) => {
        logger.error(e);

        res.status(500);
        res.send("INTERNAL SERVER ERROR");
      });
  }
});

router.get("/lists", getJobsSchema, (req, res) => {
  // get query out from req
  if (!req.query.offset) {
    logger.error("No offset in query!");

    res.status(400);
    res.send("/jobs/lists request need a query for offset!");
    return;
  }
  const offset = req.query.offset;
  const limit = 10;

  // get result from db
  knex("job")
    .join("company", "job.companyId", "company.id")
    .select("job.*", "company.companyName")
    .limit(limit)
    .offset(offset)
    .then((jobList) => {
      res.send(jobList);
    })
    .catch((e) => {
      logger.error(e);

      res.status(500);
      res.send("INTERNAL SERVER ERROR");
    });
});

router.get("/:jobId", getJobSchema, (req, res) => {
  const jobId = req.params.jobId;
  logger.info(jobId);

  knex("job")
    .where({ id: jobId })
    .then((queryResult) => {
      const job = queryResult[0];

      if (job) {
        res.send(job);
      } else {
        res.status(400);
        res.send({ message: "job not found" });
      }
    })
    .catch((e) => {
      logger.error(e);

      res.status(500);
      res.send("INTERNAL SERVER ERROR");
    });
});

router.delete("/:jobId", deleteJobSchema, (req, res) => {
  const jobId = req.params.jobId;

  knex("job")
    .where({ id: jobId })
    .del()
    .catch((e) => {
      logger.error(e);

      res.status(500);
      res.send("INTERNAL SERVER ERROR");
    });

  res.send({ message: "job deleted" });
});

router.put("/:jobId", updateJobSchema, (req, res) => {
  const jobId = req.params.jobId;
  const {
    companyId,
    jobTitle,
    jobLink,
    jobLocation,
    jobDescription,
    jobRequirement,
    jobExperienceLevel,
    jobType,
    jobSalaryRange,
    jobStatus,
  } = req.body;
  // const jobStatusBoolean = jobStatus === "true" ? true : false;

  knex("job")
    .where({ id: jobId })
    .update({
      companyId,
      jobLink,
      jobTitle,
      jobLocation,
      jobDescription,
      jobRequirement,
      jobExperienceLevel,
      jobType,
      jobSalaryRange,
      jobStatus,
    })
    .then(() => {
      res.json({ message: "job updated" });
    })
    .catch((e) => {
      logger.error(e);

      res.status(500);
      res.send("INTERNAL SERVER ERROR");
    });
});

module.exports = router;
