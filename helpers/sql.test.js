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

  // test("Fails: Empty update object (BadRequestError)", function () {
  //   const dataToUpdate = {};
  //   const jsToSql = {};
  //   expect(() => {
  //     sqlForPartialUpdate(dataToUpdate, jsToSql)
  //   }).toThrow(BadRequestError);
  // });

  test("Fails: Empty update object (BadRequestError)", function() {
    try {
      const dataToUpdate = {};
      const jsToSql = {};
      sqlForPartialUpdate(dataToUpdate, jsToSql);
      throw new Error("fail test, you shouldn't get here");  //TODO: What happens if no expect triggered.
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();  //TODO: Ask about toBeTruthy
    }
  })

  test("Fails: Argument missing (TypeError)", function () {
    try{
      const dataToUpdate = {firstName: 'Aliya', age: 32};
      sqlForPartialUpdate(dataToUpdate);
      throw new Error("fail test, you shouldn't get here");

    } catch (err) {
      expect(err instanceof TypeError).toBeTruthy();
    }
  });
});
