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
        title: 't 2',
        salary: 50000,
        equity: '0.1',
        companyHandle: 'c2'
      },
      {
        id: expect.any(Number),
        title: 't1',
        salary: 100000,
        equity: '0',
        companyHandle: 'c1'
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

describe("find all with filters", function () {
  //works: search by title
  test("works: search by title t1", async function () {
    const filters = { title: "t1" };
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
  test("works: search by title T1", async function () {
    const filters = { title: "T1" };
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

  //works: search by part of title
  test("works: search by title for 1", async function () {
    const filters = { title: "1" };
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

  //works: search with title with space in it
  test("works: search by title with space", async function () {
    const filters = { title: "t 2" };
    const results = await Job.findAll(filters);

    expect(results).toEqual([
      {
        id: expect.any(Number),
        title: 't 2',
        salary: 50000,
        equity: '0.1',
        companyHandle: 'c2'
      }
    ]);
  });
  //returns nothing with bad data
  test("returns nothing with bad data", async function () {
    const filters = { title: "foobar" };
    const results = await Job.findAll(filters);

    expect(results).toEqual([]);
  });

  //works: search by min salary
  test("works: search by min salary", async function () {
    const filters = { minSalary: 90000 };
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

  //works: search by min salary and title
  test("works: search by min salary and title", async function () {
    const filters = { minSalary: 20000, title: "1" };
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

  //works: search by hasEquity === true
  test("works: search by hasEquity === true", async function () {
    const filters = { hasEquity: true };
    const results = await Job.findAll(filters);

    expect(results).toEqual([
      {
        id: expect.any(Number),
        title: 't 2',
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
    ]);
  });

  //works: search by hasEquity === false
  test("works: search by hasEquity === false", async function () {
    const filters = { hasEquity: false };
    const results = await Job.findAll(filters);

    expect(results).toEqual([
      {
        id: expect.any(Number),
        title: 't 2',
        salary: 50000,
        equity: '0.1',
        companyHandle: 'c2'
      },
      {
        id: expect.any(Number),
        title: 't1',
        salary: 100000,
        equity: '0',
        companyHandle: 'c1'
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

  //returns nothing all search filters where no match
  test("returns nothing all search filters where no match", async function () {
    const filters = { title: "3", minSalary: 90000, hasEquity: false };
    const results = await Job.findAll(filters);

    expect(results).toEqual([]);
  });
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