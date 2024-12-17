const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware setup
app.use(express.json());
app.use(session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware for protected routes
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) { // Get the authorization object stored in the session
        const token = req.session.authorization['accessToken']; // Retrieve the token from authorization object
        jwt.verify(token, "your_jwt_secret", (err, user) => { // Use JWT to verify token
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Route for adding or modifying a review
app.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Retrieve the username from session
    const username = req.session.username; // Assuming username is stored in session

    if (!username) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update the review
    if (!books[isbn].reviews) {
        books[isbn].reviews = {}; // Initialize reviews if not present
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added or modified successfully",
        reviews: books[isbn].reviews
    });
});

// Test user registration and setting session (for testing purpose)
app.post("/register", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    // Set the username in the session
    req.session.username = username;
    return res.status(201).json({ message: 'User registered successfully' });
});

app.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username; // Assuming username is stored in session

    if (!username) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});

// Route setups
app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log("Server is running"));
