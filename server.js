const express = require("express");
const app = express(); // Setup Express

app.use((req, res, next) => { // Middleware Set Headers
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
    next();
});

const jwt = require("jsonwebtoken"); // Imports
const { expressjwt: expressJwt } = require('express-jwt');
const bodyParser = require("body-parser");
const path = require("path");

app.use(bodyParser.json()); // Parse Requests
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;
const secretKey = "1234567890";

const jwtMW = expressJwt({ // Middleware Encryption
    secret: secretKey,
    algorithms: ["HS256"]
});

let users = [ // User Data
    {
        id: 1, username: "andre", password: "123"
    },
    {
        id: 2, username: "lambro", password: "456"
    },
];

app.post("/api/login", (req, res) => { // Login Route (Authentication)
    const { username, password } = req.body;

    let userFound = false; 
    
    for (let user of users) {
        if (user.username === username && user.password === password) {
            userFound = true; 
            let token = jwt.sign({id: user.id, username: user.username, password: user.password}, secretKey, { expiresIn: "3m" });

                res.json({
                    success: true,
                    err: null,
                    token
                });
            break;
        }
    }
    if (!userFound) {
        res.status(401).json({
            success: false,
            token: null,
            err: "Username or password is incorrect"
        });
    }
});

app.get("/api/dashboard", jwtMW, (req, res) => { // Dashboard Route
    res.json({
        success: true,
        myContent: "Secret content."
    });
});

app.get("/api/settings", jwtMW, (req, res) => { // Settings Route
    res.json({
        success: true,
        settingContent: "Secret Setting content."
    });
});

app.get("/", (req, res) => { // Home Route
    res.sendFile(path.join(__dirname, "index.html"))
});

app.use(function(err, req, res, next) { // Authorization
    if(err.name === "UnauthorizedError") {
        res.status(401).json({
            success: false,
            officialError: err,
            err: "Username or password is incorrect 2",
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {   
  console.log(`Server on port ${PORT}.`);
});