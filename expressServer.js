const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const bodyParser = require("body-parser"); //Makes buffer data human readable - middleware.
const morgan = require('morgan'); //records gets and pushes
const cookieSession = require('cookie-session'); //encryps cookies res, req and "limits session"
const bcrypt = require('bcryptjs'); //used to hash passwords
const salt = bcrypt.genSaltSync(10); //creates salt to SUPER hash password using append salt.
const { urlsForUser, findUserByEmail, generateRandomString } = require("./helper");


//config
app.set("view engine", "ejs"); //Just so we can use ejs files




//
// MIDDLEWARE
//
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ["password", "cookie", "lighthouse", "other", "otherother"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


//
//FUNCTION THAT I CANT EXPORT CORRECTLY
//
// const generateRandomString = () => {
//   const chara = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   let string = "";
//   for (let i = 0; i < 6; i++) {
//     string += chara.charAt(Math.floor(Math.random() * chara.length));
//   }
//   return string;
// };


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
    password: bcrypt.hashSync("123", salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", salt)
  }
};






//
// ROUTES
//

//hello routes
app.get("/", (req, res) => {
  let email = req.session.email;
  const templateVars = {
    message: "Hello, welcome to TinyApp!",
    email: email
  };
  res.render("textpages", templateVars);
});

app.get("/hello", (req, res) => {
  let email = req.session.email;
  const templateVars = {
    message: "Hello World",
    email: email
  };
  res.render("textpages", templateVars);
});




//Register routes
app.get("/register", (req, res) => {
  let email = req.session.email;
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
      email: null
    };
    return res.render("textpages", templateVars);
  }
  for (const userIDS in users) {
    if (users[userIDS].email === email) {
      const templateVars = {
        message: "Error: Status code 401. Email is already registered.",
        email: null
      };
      return res.render("textpages", templateVars);
    }
  }
  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email,
    password: bcrypt.hashSync(password, salt)
  };//Creates new user
  req.session.userId = (newID);//Creates session cookie with id same as new user reg.
  res.redirect("/urls");
});

///login routes
app.get("/login", (req, res) => {
  if (req.session) {
    let email = req.session.email;
    const templateVars = {
      email: email
    };
    return res.render("login", templateVars);
  }
  const templateVars = {
    email: null
  };
  res.render("login", templateVars);
  
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  if (!email || !password) {
    const templateVars = {
      message: "Email or password cannot be blank. Error: Status code 401",
      email: null
    };
    res.render("textpages", templateVars);
  }
  if (!user) {
    const templateVars = {
      message: "Error: Status code 401 Email not registered. Might not show this message in real life, indicates user exists.",
      email: null
    };
    res.render("textpages", templateVars);
  }
  if (!bcrypt.compareSync(password, user.password)) {
    const templateVars = {
      message: "Error: Status code 401 Password. In real life situations would not indicate they had the correct email.",
      email: null
    };
    return res.render("textpages", templateVars);
  }
  
  req.session.userId = user.id;//sending back encrypted cookie and sets it for this session
  res.redirect('/urls');
});

//logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});



///urls routes
app.get("/urls", (req, res) => {
  if (req.session.userId) {
    let userCoookieID = req.session.userId;
    const urlsList = urlsForUser([userCoookieID], urlDatabase);
    let email = users[userCoookieID].email;
    const templateVars = {
      urls: urlsList,
      email: email};
    return res.render("urlsIndex", templateVars);
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
    userID: req.session.userId
  };
  res.redirect(`/urls/${newShort}`);
});

//urls new routes

app.get('/urls/new', (req, res) => {
  let getID = req.session.userId;
  if (req.session.userId) {
    const user = users[req.session.userId];
    const templateVars = {
      email: user.email
    };
    res.render("urlsNew", templateVars);
  } else {
    const templateVars = {
      message: "Error: Status code 403. PLease login to view.",
      email: null
    };
    res.render("textpages", templateVars);
  }
});
app.post("/urls/:shortURL/edit", (req, res) => {

  //TODO: Check session id

  const { shortURL} = req.params;
  const { newURL } = req.body;
  urlDatabase[shortURL].longURL = newURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("form attempted submit - error in server");
  const currentUserID = req.session.userId;
  const { shortURL } = req.params;
  const shortID = urlDatabase[shortURL].userID;
  if (shortID === currentUserID) {
    delete urlDatabase[shortURL];
    return  res.redirect("/urls");
  }
  const templateVars = {
    message: "Error: Status code 403. Not authorised to this user.",
    email: null
  };
  res.render("textpages", templateVars);
});


//urls short routes //DO have to be logged in to view
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.userId) {
    let { userId: userId } = req.session;
    let { shortURL } = req.params;
    let email = users[userId].email;
    if (!urlDatabase[shortURL]) {
      const templateVars = {
        message: "This URL does not exist. Error: Status code 404.",
        email
      };
      res.render("textpages", templateVars);
    } else if (urlDatabase[shortURL].userID !== userId) {
      const templateVars = {
        message: "Cannot access URL. Error: Status code 401.",
        email
      };
      res.render("textpages", templateVars);
    } else {
      const templateVars = {
        shortURL: shortURL,
        longURL: urlDatabase[shortURL].longURL,
        email
      };
      return res.render("urlsShow", templateVars);
    }
  }
  const templateVars = {
    email: null
  };
  return res.render("login", templateVars);
  
});


app.get("/u/:shortURL", (req, res) => {
  let url = urlDatabase[req.params.shortURL];
  if (!url) {
    return res.redirect("/*");
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: url.longURL};
  return res.redirect(templateVars.longURL);
  
});



//urls with json

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//js object notation global standard for sending data over http object to string
// Returns
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