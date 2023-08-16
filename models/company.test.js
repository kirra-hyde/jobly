"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
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
  const newCompany = {
    handle: "new",
    name: "New",
    description: "New Description",
    numEmployees: 1,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.create(newCompany);
    expect(company).toEqual(newCompany);

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`);
    expect(result.rows).toEqual([
      {
        handle: "new",
        name: "New",
        description: "New Description",
        num_employees: 1,
        logo_url: "http://new.img",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Company.create(newCompany);
      await Company.create(newCompany);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });
});

/*
* Search by name with "anderson", get right results
* Search by name with "Anderson", get right results
* Search by name with "Thomas and Sons", get right results
* Search by name with "nderso", get right results
* Search by name with "kjdskflsjgkdsl", get no results
* Search by employee max 20, get right results (martinez-daniels)
* Search by employee min 990, get right results (scott-smith)
* Search by employee min 900 with name like ll, get right results (smith-llc, mueller-moore)
* Search by name anderson and max 20, get no results
*/

describe("find all with filters", function() {

  test("works: search name with C1", async function () {
    const filters = {name: "C1"};
    const results = await Company.findAll(filters);

    expect(results).toEqual([
      {
        handle: "c1",
			  name: "C1",
			  description: "Desc1",
			  numEmployees: 1,
			  logoUrl: "http://c1.img"
      }
    ]);
  });

  test("works: search name with c2", async function () {
    const filters = {name: "c2"};
    const results = await Company.findAll(filters);

    expect(results).toEqual([
      {
        handle: "c2",
			  name: "C2",
			  description: "Desc2",
			  numEmployees: 2,
			  logoUrl: "http://c2.img"
      }
    ]);
  });

  test("works: search name with nderso", async function () {
    const filters = {name: "nderso"};
    const results = await Company.findAll(filters);

    expect(results).toEqual([
      {
        handle: "anderson-arias-morrow",
			  name: "Anderson, Arias and Morrow",
			  description: "Somebody program how I. Face give away discussion view act inside. Your official relationship administration here.",
			  numEmployees: 245,
			  logoUrl: "/logos/logo3.png"
      }
    ]);
  });

  test("works: search name with arias and morrow", async function () {
    const filters = {name: "aria and marrow"};
    const results = await Company.findAll(filters);

    expect(results).toEqual([
      {
        handle: "anderson-arias-morrow",
			  name: "Anderson, Arias and Morrow",
			  description: "Somebody program how I. Face give away discussion view act inside. Your official relationship administration here.",
			  numEmployees: 245,
			  logoUrl: "/logos/logo3.png"
      }
    ]);
  });

  test("returns nothing: search name with sdfdssg", async function () {
    const filters = {name: "sdfdssg"};
    const results = await Company.findAll(filters);

    expect(results).toEqual([]);
  });

  test("works: Search by employee max 20", async function () {
    const filters = {name: "aria and marrow"};
    const results = await Company.findAll(filters);

    expect(results).toEqual([
      {
        "handle": "martinez-daniels",
        "name": "Martinez-Daniels",
        "description": "Five source market nation. Drop foreign raise pass.",
        "numEmployees": 12,
        "logoUrl": "/logos/logo4.png"
      }
    ]);
  });


});



/************************************** get */

describe("get", function () {
  test("works", async function () {
    let company = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Company.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});



/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.update("c1", updateData);
    expect(company).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: 10,
      logo_url: "http://new.img",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    let company = await Company.update("c1", updateDataSetNulls);
    expect(company).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Company.remove("c1");
    const res = await db.query(
        "SELECT handle FROM companies WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
