"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 500,
    equity: .7,
    company_handle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);

    expect(job).toEqual({
      id: job.id,
      title: "new",
      salary: 500,
      equity: .7,
      company_handle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
      FROM jobs
      WHERE id = '${job.id}'`);
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "new",
        salary: 500,
        equity: .7,
        company_handle: "c1"
      }
    ]);
  });
});

/************************************** findAll */

//works: no filter

/************************************** findAll with filters */

//works: search by title
//works: search by title case insensitivity
//works: search by part of title
//works: search with title with space in it
//returns nothing with bad data

//works: search by min salary
//works: search by min salary and title

//works: search by hasEquity === true
//works: search by hasEquity === false

//returns nothing all search filters where no match

/************************************** get */

//works
//not found if no such job

/************************************** update */

//works
//works: null fields (salary and equity)
//not found if no such job
//bad request with no data

/************************************** remove */

//works
//not found if no such job