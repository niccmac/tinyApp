//// maybe try exports. might have to add databases here too? Could just export and require in server?


const urlsForUser = (loginid, urlDatabase) => {
  let matchingURLS = [];
  for (const shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === loginid) {
      matchingURLS.push(shorturl);
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

module.exports = {
  findUserByEmail,
  urlsForUser
};