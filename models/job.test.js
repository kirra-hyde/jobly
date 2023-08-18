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
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);

    expect(job).toEqual({
      id: job.id,
      title: "new",
      salary: 500,
      equity: "0.7",
      companyHandle: "c1"
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
        equity: "0.7",
        company_handle: "c1"
      }
    ]);
  });
});

/************************************** findAll */

//works: no filter
describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 't1',
        salary: 100000,
        equity: '0',
        companyHandle: 'c1'
      },
      {
        id: expect.any(Number),
        title: 't2',
        salary: 50000,
        equity: '0.1',
        companyHandle: 'c2'
      },
      {
        id: expect.any(Number),
        title: 't3',
        salary: 20000,
        equity: '0.3',
        companyHandle: 'c3'
      },
      {
        id: expect.any(Number),
        title: 't3',
        salary: 20000,
        equity: '0.3',
        companyHandle: 'c3'
      },
      {
        id: expect.any(Number),
        title: 't4',
        salary: null,
        equity: null,
        companyHandle: 'c1'
      },
    ]);
  });
});

/************************************** findAll with filters */

describe("find all with filters", function() {
  //works: search by title
  test("works: search by title t1", async function () {
    const filters = {title: "t1"};
    const results = await Job.findAll(filters);

    expect(results).toEqual([
      {
        id: expect.any(Number),
        title: 't1',
        salary: 100000,
        equity: '0',
        companyHandle: 'c1'
      }
    ]);
  });

//works: search by title case insensitivity
//works: search by part of title
//works: search with title with space in it
//returns nothing with bad data

//works: search by min salary
//works: search by min salary and title

//works: search by hasEquity === true
//works: search by hasEquity === false

//returns nothing all search filters where no match
});

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