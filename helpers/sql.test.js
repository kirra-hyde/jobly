"use strict";

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {

  /**
   * TESTS:
   * Works: Valid update object, key mapping
   * Fails: Empty update object (BadRequestError)
   * Fails: Argument missing (TypeError)
   */

  test("Works: Valid update object, key mapping", function () {
    const dataToUpdate = {firstName: 'Aliya', age: 32};
    const jsToSql = { firstName: 'first_name' };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual({
      setCols: `"first_name"=$1, "age"=$2`,
      values: ['Aliya', 32]
    });
  });

  test("Works: No jsToSql passed in", function () {
    const dataToUpdate = {firstName: 'Aliya', age: 32};
    const result = sqlForPartialUpdate(dataToUpdate);
    expect(result).toEqual({
      setCols: `"firstName"=$1, "age"=$2`,
      values: ['Aliya', 32]
    });
  });

  test("Fails: Empty update object (BadRequestError)", function() {
    try {
      const dataToUpdate = {};
      const jsToSql = {};
      sqlForPartialUpdate(dataToUpdate, jsToSql);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })
});
