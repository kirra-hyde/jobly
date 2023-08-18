"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

function next(err) {
  if (err) throw new Error("Got error from middleware");
}


describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  // TODO: Ask why this doesn't have any expect() calls
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });
});

//Throws unauthorized error when user is not admin.
//Does nothing when user is admin.

describe("ensureAdmin", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: true } } };
    ensureAdmin(req, res, next);
  });

  test("unauth if not an admin", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: false } } };
    expect(() => ensureAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

});

describe("ensureCorrectUserOrAdmin", function () {
  test("works, user for route is user", function () {
    const req = { params: { username: "testUsername" } };
    const res = { locals: { user: {
      username: "testUsername",
      isAdmin: false
    } } };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("works, user is admin", function () {
    const req = { params: { username: "testUsername" } };
    const res = { locals: { user: {
      username: "adminUsername",
      isAdmin: true
    } } };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("works, user is admin and user for route", function () {
    const req = { params: { username: "testUsername" } };
    const res = { locals: { user: {
      username: "testUsername",
      isAdmin: true
    } } };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("fails, user neither admin not user for route", function () {
    const req = { params: { username: "testUsername1" } };
    const res = { locals: { user: {
      username: "testUsername2",
      isAdmin: false
    } } };
    expect(() => ensureCorrectUserOrAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

});
