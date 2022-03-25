const urlsForUser = (loginid, urlDatabase) => {
  let matchingURLS = {};
  console.log("loginid", loginid);
  for (const shorturl in urlDatabase) {
    console.log("inside urls for user", urlDatabase[shorturl].userID);
    if (urlDatabase[shorturl].userID == loginid) { //this is looking at an array vs a string
      matchingURLS[shorturl] = urlDatabase[shorturl];
    }
  }
  return matchingURLS;
};
const findUserByEmail = (loginemail, database) => {
  for (const userIDS in database) {
    if (database[userIDS].email === loginemail) {
      return database[userIDS];
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

module.exports = {
  findUserByEmail,
  urlsForUser,
  generateRandomString
};