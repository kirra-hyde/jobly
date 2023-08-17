"use strict";

const { BadRequestError } = require("../expressError");

/**Take unvalidated data object from findAll query params.
 * -Ex. ({name: "anderson"})
 * Test whether data is valid.
 * Throws error if it's invalid.
 * If it's valid, returns true.
 */

function isDataValid(data) {
  if ("minEmployees" in data && "maxEmployees" in data) {
    if (data.minEmployees > data.maxEmployees) {
      throw new BadRequestError();
    }
  }
  const allowedFilters = ["name", "minEmployees", "maxEmployees"];
  for (let key in data) {
    if (!allowedFilters.includes(key)) {
      throw new BadRequestError();
    }
  }
  return true;
}

module.exports = isDataValid;