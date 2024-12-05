const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  try {
    console.log(users);

    const { username, password } = req.body;

    console.log(isValid(username));

    if (!isValid(username)) {
      const e = new Error();
      e.message = "Already registered user.";
      e.status = 401;
      throw e;
    }

    if (!username || !password) {
      const e = new Error();
      e.message = "username and password required.";
      e.status = 404;
      throw e;
    }

    users.push({ username, password });

    return (
      res
        .status(201)
        // .json({ message: `The user ${username} has been registered.` });
        .json(users)
    );
  } catch (e) {
    return res.status(e.status).send(e.message);
  }
});

// Get the book list available in the shop
public_users.get("/", async (_req, res) => res.status(200).json(books));

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const { isbn } = req.params;
    const book = books[isbn];

    if (!book) {
      const e = new Error();
      e.message = "Book not found.";
      e.status = 404;
      throw e;
    }

    return res.status(200).json(book);
  } catch (e) {
    return res.status(e.status).send(e.message);
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  try {
    const { author } = req.params;
    let filteredBook = Object.values(books).filter(
      (book) => book.author == author
    );

    if (filteredBook.length < 1) {
      const e = new Error();
      e.message = "Book not found.";
      e.status = 404;
      throw e;
    }

    return res.status(200).json(filteredBook);
  } catch (e) {
    return res.status(e.status).send(e.message);
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  try {
    const { title } = req.params;
    let filteredBook = Object.values(books).filter(
      (book) => book.title == title
    );

    if (filteredBook.length < 1) {
      const e = new Error();
      e.message = "Book not found.";
      e.status = 404;
      throw e;
    }

    return res.status(200).json(filteredBook);
  } catch (e) {
    return res.status(e.status).send(e.message);
  }
});

//  Get book review
public_users.get("/review/:isbn", async (req, res) => {
  try {
    const { isbn } = req.params;
    const book = books[isbn];

    if (!book) {
      const e = new Error();
      e.message = "Book not found.";
      e.status = 404;
      throw e;
    }

    return res.status(200).json(book.reviews);
  } catch (e) {
    return res.status(e.status).send(e.message);
  }
});

module.exports.general = public_users;
