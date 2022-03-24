const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const bodyParser = require("body-parser"); //Makes buffer data human readable - middleware.
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { get } = require("express/lib/response"); //Dont remember writing this line :(

//config
app.set("view engine", "ejs");





//
// MIDDLEWARE
//
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());




//
// DATABASES
//
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

const urlsForUser = (loginid) => {
  let matchingURLS = [];
  for (const shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === loginid) {
      matchingURLS.push(shorturl);
    }
  }
  return matchingURLS;
};

const findUserByEmail = (loginemail) => {
  for (const userIDS in users) {
    if (users[userIDS].email === loginemail) {
      return users[userIDS];
    }
  }
  return null;
};

const generateRandomString = () => {
  const chara = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let string = "";
  for (let i = 0; i < 6; i++) {
    string += chara.charAt(Math.floor(Math.random() * chara.length));
  }
  return string;
};





//
// ROUTES
//

//hello routes
app.get("/", (req, res) => {
  let email = req.cookies.email;
  const templateVars = {
    message: "Hello, welcome to TinyApp!",
    email: email
  };
  res.render("textpages", templateVars);
});

app.get("/hello", (req, res) => {
  let email = req.cookies.email;
  const templateVars = {
    message: "Hello World",
    email: email
  };
  res.render("textpages", templateVars);
});




//Register routes
app.get("/register", (req, res) => {
  let email = req.cookies.email;
  const templateVars = {
    email: email
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email === "" ||
      password === "") {
    const templateVars = {
      message: "Error: Status code 401. Please enter Email & Password.",
      email: email
    };
    res.render("textpages", templateVars);
  }
  for (const userIDS in users) {
    if (users[userIDS].email === email) {
      const templateVars = {
        message: "Error: Status code 401. Email is already registered.",
        email: email
      };
      res.render("textpages", templateVars);
    }
  }
  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email,
    password,
  };//Creates new user
  res.cookie("user_id", newID);//Creates cookie with id same as new user reg.
  res.redirect("/urls");
});

///login routes
app.get("/login", (req, res) => {
  let email = req.cookies.email;
  const templateVars = {
    email: email
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    const templateVars = {
      message: "Email or password cannot be blank. Error: Status code 401",
      email: null
    };
    res.render("textpages", templateVars);
  }
  const user = findUserByEmail(email);
  if (!user) {
    const templateVars = {
      message: "Error: Status code 401 Email not registered.",
      email: email
    };
    res.render("textpages", templateVars);
  }
  if (user.password !== password) {
    const templateVars = {
      message: "Error: Status code 401 Password.",
      email: email
    };
    res.render("textpages", templateVars);
  }
  
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

//login route
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});



///urls routes
app.get("/urls", (req, res) => {
  let userCoookieID = req.cookies.user_id;
  for (const knownID in users) {
    if (userCoookieID === knownID) {
      let email = users[userCoookieID].email;
      const templateVars = {
        urls: urlDatabase,
        email: email
      };
      return res.render("urlsIndex", templateVars);
    }
  }
  const templateVars = {
    message: "Must be logged in to view. Error: Status code 401.",
    email: null
  };
  res.render("textpages", templateVars);
});


app.post("/urls", (req, res) => {
  let newLong = req.body.longURL;
  if (!newLong) {
    return res.redirect("/urls/new");
  }
  let newShort = generateRandomString();
  urlDatabase[newShort] = {
    longURL: newLong,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${newShort}`);
});

//urls new routes

app.get('/urls/new', (req, res) => {
  let getID = req.cookies.user_id;
  if (!users[getID]) {
    const templateVars = {
      message: "Try logging in to create new TinyURL. Error: Status code 401.",
      email: null
    };
    res.render("textpages", templateVars);
  }
  let email = users[getID].email;
  if (findUserByEmail(email) === null) {
    const templateVars = {
      message: "Try logging in to create new TinyURL. Error: Status code 401.",
      email: null
    };
    res.render("textpages", templateVars);
  }
  const templateVars = {
    email: email
  };
  res.render("urlsNew", templateVars);
});



//urls short routes //this is catching users who try to login from the URLS page, dont know how to fix
app.get("/urls/:shortURL", (req, res) => {
  let getID = req.cookies.user_id;
  let tinyURL = req.params.shortURL;
  for (const knownID in users) {
    if (getID === knownID) {
      const templateVars = { shortURL: tinyURL, longURL: urlDatabase[tinyURL].longURL, email: users[getID].email};
      res.render("urlsShow", templateVars);
    }
  }
  const templateVars = {
    message: "Must be logged in to view... Error: Status code 401.",
    email: null
  };
  res.render("textpages", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  let url = urlDatabase[req.params.shortURL];
  if (!url) {
    return res.redirect("/*");
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: url.longURL};
  res.redirect(templateVars.longURL);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const { shortURL} = req.params;
  console.log("short url:", urlDatabase[shortURL]);
  const { newURL } = req.body;
  console.log("newURL", newURL);
  urlDatabase[shortURL].longURL = newURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUserID = req.cookies.user_id;
  const checkUserCanDelete = urlsForUser(currentUserID);
  for (const validURL of checkUserCanDelete) {
    if (validURL === req.params.shortURL) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    }
  }
  const templateVars = {
    message: "Error: Status code 403. Not authorised to this user.",
    email: null
  };
  res.render("textpages", templateVars);
});

//urls with json

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//catch error
app.get("/*", (req, res) => {
  res.render("error404");
});


//
// LISTENING
//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});