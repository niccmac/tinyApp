const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080
const bodyParser = require("body-parser"); //Makes buffer data human readable - middleware.
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.post("/urls/:shortURL/edit", (req, res) => {
  console.log(res);
  console.log(req.body);
  // urlDatabase[req.params.shortURL] 
});

app.get('/urls/new', (req, res) => {
  res.render("urlsNew");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></htmml>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  res.render("urlsIndex", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urlsShow", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  let url = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: url };
  res.redirect(templateVars.longURL);
});