const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const bodyParser = require("body-parser"); //Makes buffer data human readable - middleware.
const morgan = require('morgan');
const cookieParser = require('cookie-parser');


//
// MIDDLEWARE
//
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());

//
// DATABASE
//
app.set("view engine", "ejs"); //fix
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//
//USER DATABASE
//
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


//
// ROUTES
//
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></htmml>\n");
});

app.get("/register", (req, res) => {
  let email = req.cookies.email;
  const templateVars = {
    email: email
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let email = req.cookies.email;
  const templateVars = {
    email: email
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  let getID = req.cookies.user_id;
  
  console.log("get id", getID);
  console.log("users", users);
  console.log("get usersid", users[getID]);
  
  const templateVars = {
    urls: urlDatabase,
    email: users[getID].email
  };

  res.render("urlsIndex", templateVars);
});

app.get('/urls/new', (req, res) => {
  let getID = req.cookies.user_id;
  const templateVars = {
    email: users[getID].email
  };
  res.render("urlsNew", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let getID = req.cookies.user_id;
  console.log(`getID`, getID);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], email: users[getID].email};
  res.render("urlsShow", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let url = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: url};
  res.redirect(templateVars.longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/*", (req, res) => {
  res.render("error404");
});


//
// CREATE
//

const generateRandomString = () => {
  const chara = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let string = "";
  for (let i = 0; i < 6; i++) {
    string += chara.charAt(Math.floor(Math.random() * chara.length));
  }
  return string;
};
app.post("/urls", (req, res) => {
  let newLong = req.body.longURL;
  let newShort = generateRandomString();
  urlDatabase[newShort] = newLong;
  res.redirect(`/urls/${newShort}`);
});

//
//UPDATE
//
app.post("/urls/:shortURL/edit", (req, res) => {
  const { shortURL} = req.params;
  const { newURL } = req.body;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});
//REGISTER NEW USER
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email === "" ||
      password === "") {
    res.redirect("/*");
  } //Checks if both form feilds are filled
  for (const userIDS in users) {
    if (users[userIDS].email === email) {
      res.redirect("/*");
    }
  }//Checks if email already exisits
  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email,
    password,
  };//Creates new user
  res.cookie("user_id", newID);//Creates cookie with id same as new user reg.
  res.redirect("/urls");
});

//
//DELETE
//
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//
// LISTENING
//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});