"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companyFilterSchema = require("../schemas/companyFilter.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: logged in and admin
 */

router.post(
  "/",
  [ensureLoggedIn, ensureAdmin],
  async function (req, res, next) {
    const validator = jsonschema.validate(
      req.body,
      companyNewSchema,
      {required: true}
    );
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  }
);

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  // convert string values to ints for validation
  // have to copy it b/c req.query is immutable
  const queryParams = req.query;
  if ("minEmployees" in queryParams) {
    queryParams.minEmployees = Number(queryParams.minEmployees);
  }
  if ("maxEmployees" in queryParams) {
    queryParams.maxEmployees = Number(queryParams.maxEmployees);
  }
  console.log("queryParams:", queryParams);
  // validate properties and individual values
  const validator = jsonschema.validate(
    queryParams,
    companyFilterSchema,
    {required:true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  // validate min <= max if provided
  if ("minEmployees" in queryParams && "maxEmployees" in queryParams) {
    if (queryParams.minEmployees > queryParams.maxEmployees) {
      throw new BadRequestError("minEmployees must be less than maxEmployees");
    }
  }

  const companies = await Company.findAll(queryParams);
  return res.json({ companies });
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  const company = await Company.get(req.params.handle);
  return res.json({ company });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: logged in and admin
 */

router.patch(
  "/:handle",
  [ensureLoggedIn, ensureAdmin],
  async function (req, res, next) {
    const validator = jsonschema.validate(
      req.body,
      companyUpdateSchema,
      {required:true}
    );
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  }
);

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: logged in and admin
 */

router.delete(
  "/:handle",
  [ensureLoggedIn, ensureAdmin],
  async function (req, res, next) {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  }
);


module.exports = router;
