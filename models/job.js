"use strict";

const { token } = require("morgan");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }

   * */

  static async create({ title, salary, equity, companyHandle}) {
    console.log("job.create called w/ object:",
      { title, salary, equity, companyHandle});
    const result = await db.query(`
                INSERT INTO jobs (title,
                                  salary,
                                  equity,
                                  company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`, [
        title, salary, equity, companyHandle
      ]
    );
    const job = result.rows[0];
    console.log("job result from insert:", job);
    return job;
  }


  /** Find all jobs with an optional set of filters
   * Supported filters are 'title', 'minSalary', 'hasEquity'
   * Filter object expected in format { filterName: value }
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

  static async findAll(filter) {

    // begin filtering logic
    let whereClause;
    let values = [];

    if (Object.keys(filter).length > 0) {
      console.log("filter was passed in:", filter)
      whereClause = 'WHERE ';
      let tokenNumber = 1;

      for (let column in filter) {
        let value = filter[column];

        if (column === 'hasEquity') {
          console.log("hasEquity filter found");
          console.log("filter['hasEquity']:", filter['hasEquity']);
        }

        switch(column) {
          case 'title':
            if (tokenNumber > 1) {
              whereClause += " AND ";
            }
            whereClause += `title ILIKE $${tokenNumber}`;
            values.push(`%${value}%`);
            break;
          case 'minSalary':
            if (tokenNumber > 1) {
              whereClause += " AND ";
            }
            whereClause += `salary >= $${tokenNumber}`;
            values.push(value);
            break;
          case 'hasEquity':
            // check if it's true or false
            if (filter['hasEquity'] === false) {
              // it's false, so we check if it's the only condition
              // if it is, then we clear out the where clause
              if (whereClause === 'WHERE ') whereClause = '';
            } else if (filter['hasEquity'] === true) {
              if (tokenNumber > 1) {
                whereClause += " AND ";
              }
              whereClause += `equity > 0`;
            }
            break;
        }
        tokenNumber++;
      }
    }
    // end filtering logic

    console.log("final where clause:", whereClause);
    console.log("final values:", values);

    const sqlStatement = `
      SELECT id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"
      FROM jobs
      ${whereClause || ''}
      ORDER BY title`

    console.log("sql statement:", sqlStatement);

    const jobsRes = await db.query(sqlStatement, values);
    return jobsRes.rows;
  }


/** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {

  }


  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {

  }


   /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {

  }

}

module.exports = Job;