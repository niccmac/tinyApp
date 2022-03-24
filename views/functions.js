//// maybe try exports. might have to add databases here too? Could just export and require in server?


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