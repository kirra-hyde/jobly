"use strict";

const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
// For companies ...
// jsToSql is always { numEmployees: "num_employees", logoUrl: "logo_url", }
// For users ...
// jsToSql is { firstName: "first_name", lastName: "last_name", isAdmin: "is_admin", }

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // grab all of the keys which represent column names and put in an array
  const keys = Object.keys(dataToUpdate);
  // if there are no keys / columns to update, this is a bad request
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  // for each key (which is a column name), grab that name as colName
  // and grab the index of that column
  // convert to a partial SQL statement for setting the value of that col

  // TODO: We could refactor this to use our camelCase to snake_case function
  // instead of requiring a mapping be passed in by the calling function
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    // this turns ['"first_name"=$1', '"age"=$2']
    // into the string "first_name"=$1, "age"=$2
    setCols: cols.join(", "),
    // put the values in an array like ['Aliya', 32]
    // db.query("... some update statement with $tokens ...", ['Aliya', 32])
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
