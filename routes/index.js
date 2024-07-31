var express = require("express");
var router = express.Router();
let crypto = require("crypto");
/* 2. Cargue los modelos de acuerdo con la configuración de la conexión */
var initModels = require("../models/init-models");
const sequelize = require("../models/index.js").sequelize;
var models = initModels(sequelize);

router.get("/", function (req, res, next) {
  res.render("index");
});
router.post("/login", async function (req, res, next) {
  /* 4. Desestructure los elementos en el cuerpo del requerimiento */
  let { username, password } = req.body;

  /* 5. Verifique que username sea diferente de null, y que password sea diferente de null. */
  if (username != null && password != null) {
    try {
      /* 6. 
        Del modelo users, use el método findOne para encontrar un registro
        cuyo campo name sea igual que username
      */
      let userData = await models.users.findOne({
        where: {
          name: username,
        },
        include: { all: true, nested: true },
        raw: true,
        nest: true

    });
    /*Agregando rol de usuario a al sesion*/ 
    req.session.loggedin = true;
    req.session.username = username;
    req.session.role = userData.users_roles.roles_idrole_role.name

/* 7. Verifique que userData sea diferente de null, y que userData.password sea diferente de null. */
if (userData != null && userData.password != null) {
  /* 8. Divida userData.password por el símbolo "$", y use el primer elemento como SALT. */
  let salt = userData.password.split("$")[0];
  let hash = crypto
    .createHmac("sha512", salt)
    .update(password)
    .digest("base64");
  let passwordHash = salt + "$" + hash;

  /* 9. Compare passwordHash y userData.password que sean iguales. */
  if (passwordHash === userData.password) {
    /* 10. En caso de éxito, redirija a '/users' */
    /*configuracion cookie*/
    const options = {
      expires: new Date(Date.now() + 60 * 1000),
    };
    res.cookie("username", username, options);
    req.session.loggedin = true;
    req.session.username = username;
    res.redirect("/users");
  } else {
    /* 11. En caso de fallo, redirija a '/' */
    res.redirect("/");
  }
} else {
  res.redirect("/");
}
    } catch (error) {
  /* 12. En caso de error, retorne el estado 400 y el objeto error */
  res.status(400).send(error);
}
  } else {
  res.redirect("/");
}
});
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.render('index');
});

module.exports = router;
