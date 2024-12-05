const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const secretKey = "yeK-terces-ym";

const isValid = (username) =>
  users.some((user) => user.username == username) ? false : true;

const authenticatedUser = (username, password) =>
  users.some((e) => e.username == username && e.password == password);

//only registered users can login
regd_users.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!authenticatedUser(username, password)) {
      const e = new Error();
      e.message = "Invalid credentials.";
      e.status = 404;
      throw e;
    }

    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    return res.status(200).json({ token });
  } catch (e) {
    return res.status(e.status).send(e.message);
  }
});



// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const token = req.headers["authorization"];
    const response = validateToken(token);
    if (!response) {
      const e = new Error();
      e.message = "Token missing.";
      e.status = 401;
      throw e;
    }
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) {
      const e = new Error();
      e.message = "Book not found.";
      e.status = 404;
      throw e;
    }
    book.reviews[response] = req.body.review;
    return res.status(203).send("The review has been updated");
  } catch (e) {
    return res.status(e.status).send(e.message);
  }
});

const validateToken = (token) => {
  if (token) {
    const result = jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return false;
      } else {
        // Token is valid, send welcome message with username
        return decoded.username;
      }
    });
    return result;
  }
};

regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const token = req.headers["authorization"];
    const response = validateToken(token);
    if (!response) {
      const e = new Error();
      e.message = "Token missing.";
      e.status = 401;
      throw e;
    }
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) {
      const e = new Error();
      e.message = "Book not found.";
      e.status = 404;
      throw e;
    }
    delete books[isbn].reviews[response];
    res.send("The review has been deleted.");
  } catch (e) {
    return res.status(e.status).send(e.message);
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
