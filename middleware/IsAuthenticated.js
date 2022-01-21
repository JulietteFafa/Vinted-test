const User = require("../models/User");

//Je crée une fonction middleware du nom de isAuthenticated
//Cette fonction prend  3 paramètres
// req => la request
// res => la response
// next => pour permettre sortir de cette fonction

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const isTokenValid = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    if (!isTokenValid) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = isTokenValid;
      // On crée une clé "user" dans req. La route dans laquelle le middleware est appelé  pourra avoir accès à req.user
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
