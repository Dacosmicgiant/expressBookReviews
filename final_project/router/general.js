const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const jwt = require('jsonwebtoken');

// New route to fetch books from an external API using Axios
public_users.get('/fetch-books', async (req, res) => {
    try {
        // Use Axios to fetch books from an external API (simulated URL)
        const response = await axios.get('https://api.example.com/books');
        const externalBooks = response.data;

        // Handle the response and send the books list to the client
        return res.status(200).json({
            message: 'Books fetched successfully',
            books: externalBooks
        });
    } catch (error) {
        // Handle any errors that occur during the API request
        return res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
});

// New route to fetch book details by ISBN using Axios
public_users.get('/fetch-book/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        // Use Axios to fetch book details from an external API (simulated URL)
        const response = await axios.get(`https://api.example.com/books/${isbn}`);
        const bookDetails = response.data;

        // Handle the response and send the book details to the client
        return res.status(200).json({
            message: 'Book details fetched successfully',
            book: bookDetails
        });
    } catch (error) {
        // Handle any errors that occur during the API request
        return res.status(500).json({ message: 'Error fetching book details', error: error.message });
    }
});

// New route to fetch books by author using Axios
public_users.get('/fetch-books-by-author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        // Use Axios to fetch books by author from an external API (simulated URL)
        const response = await axios.get(`https://api.example.com/books?author=${author}`);
        const booksByAuthor = response.data;

        // If books are found, send them to the client
        if (booksByAuthor.length > 0) {
            return res.status(200).json({
                message: 'Books by this author fetched successfully',
                books: booksByAuthor
            });
        } else {
            return res.status(404).json({ message: 'No books found by this author' });
        }
    } catch (error) {
        // Handle any errors that occur during the API request
        return res.status(500).json({ message: 'Error fetching books by author', error: error.message });
    }
});

// New route to fetch books by title using Axios
public_users.get('/fetch-books-by-title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        // Use Axios to fetch books by title from an external API (simulated URL)
        const response = await axios.get(`https://api.example.com/books?title=${title}`);
        const booksByTitle = response.data;

        // If books are found, send them to the client
        if (booksByTitle.length > 0) {
            return res.status(200).json({
                message: 'Books with this title fetched successfully',
                books: booksByTitle
            });
        } else {
            return res.status(404).json({ message: 'No books found with this title' });
        }
    } catch (error) {
        // Handle any errors that occur during the API request
        return res.status(500).json({ message: 'Error fetching books by title', error: error.message });
    }
});


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const newUser = { username, password };
    users.push(newUser);

    // Generate JWT token for the new user
    const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });

    // Store the token in the session
    req.session.authorization = { accessToken: token };

    return res.status(201).json({
        "message": 'User registered successfully',
        "session": "Token stored in session successfully"
    });
});


public_users.get('/', function (req, res) {
    try {
        // Use JSON.stringify to display the books neatly
        return res.status(200).send(JSON.stringify(books, null, 2));
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving books', error: error.message });
    }
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const bookDetails = books[isbn];
        if (bookDetails) {
            // If book details are found, return them as a JSON response
            return res.status(200).json(bookDetails);
        } else {
            // If book details are not found, return an appropriate message
            return res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error fetching book details', error: error.message });
    }
});
  
// Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        // Iterate through the books
        for (const bookKey of Object.keys(books)) {
            const book = books[bookKey];
            if (book.author === author) {
                // Found a book by the specified author
                return res.status(200).json(book);
            }
        }
        // If no book is found by the specified author
        return res.status(404).json({ message: 'No book found for this author' });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching book details', error: error.message });
    }
});

// Get all books based on title using async-await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        // Iterate through the books
        for (const bookKey of Object.keys(books)) {
            const book = books[bookKey];
            if (book.title === title) {
                // Found a book with the specified title
                return res.status(200).json(book);
            }
        }
        // If no book is found with the specified title
        return res.status(404).json({ message: 'No book with this title' });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching book details', error: error.message });
    }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
   

    const bookDetails = books[isbn]; 
    if (bookDetails) {
        // If book details are found, return them as a JSON response
        return res.status(200).json(bookDetails.reviews);
      } else {
        // If book details are not found, return an appropriate message
        return res.status(404).json({ message: 'Book not found' });
      }
});



module.exports.general = public_users;
