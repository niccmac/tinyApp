const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const bodyParser = require("body-parser"); //Makes buffer data human readable - middleware.
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { get } = require("express/lib/response");


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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};

//
//USER DATABASE
//
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123"
  }
};
//
//Functions
//
const findUserByEmail = (loginemail) => {
  for (const userIDS in users) {
    if (users[userIDS].email === loginemail) {
      return users[userIDS];
    }
  }
  return null;
};//Checks if email already exisits


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
  let userCoookieID = req.cookies.user_id;
  if (!userCoookieID) {
    return res.redirect("/401");
  }

  let email = users[userCoookieID].email;
  const templateVars = {
    urls: urlDatabase,
    email: email
  };
  res.render("urlsIndex", templateVars);
});

app.get('/urls/new', (req, res) => {
  let getID = req.cookies.user_id;
  if (!users[getID]) {
    return res.redirect("/401");
  }
  let email = users[getID].email;
  if (findUserByEmail(email) === null) {
    return res.redirect("/login");
  }
  const templateVars = {
    email: email
  };
  res.render("urlsNew", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let getID = req.cookies.user_id;
  let tinyURL = req.params.shortURL;
  console.log("rulDSURL", urlDatabase[tinyURL]);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[tinyURL].longURL, email: users[getID].email};
  res.render("urlsShow", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let url = urlDatabase[req.params.shortURL];
  if (!url) {
    return res.redirect("/*");
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: url.longURL};
  res.redirect(templateVars.longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/401", (req, res) => {
  res.render("error401");
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
  if (!newLong) {
    // res.send("Must enter URL.");
    return res.redirect("/urls/new");
  }
  let newShort = generateRandomString();
  urlDatabase[newShort] = {
    longURL: newLong,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${newShort}`);
});

//
//UPDATE
//
app.post("/urls/:shortURL/edit", (req, res) => {
  const { shortURL} = req.params;
  console.log("short url:", urlDatabase[shortURL]);
  const { newURL } = req.body;
  console.log("newURL", newURL);
  urlDatabase[shortURL].longURL = newURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.send("Email or password cannot be blank. Error: Status code 403");
  }
  const user = findUserByEmail(email);
  if (!user) {
    return res.send("Error: Status code 403 E");
  }
  if (user.password !== password) {
    return res.send("Error: Status code 403 P.");
  }
  
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
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
  }//Checks if email already exisits  should use function ****FIX LATER
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