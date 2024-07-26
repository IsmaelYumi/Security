var express = require("express");
var router = express.Router();
let crypto = require("crypto");

/* 1. Cargue los modelos de acuerdo con la configuración de la conexión */
const sequelize = require("../models/index.js").sequelize;
var initModels = require("../models/init-models");
const roles = require("../models/roles.js");
var models = initModels(sequelize);
/*Get user Listening*/
router.get("/", async function (req, res, next) {
  let usersCollection = await models.users.findAll({
    /* 3.1. Including everything */
    include: { all: true, nested: true }, 
    /* 3.2. Raw Queries */
    raw: true,
    nest: true,
  });
  let rolesColection= await models.roles.findAll({});
  res.render("crud", {
    title: "Crud whith users",
    usersArray: usersCollection,
    rolesArray: rolesColection,
  });

});
router.post("/", async (req, res) => {
  /* 3. Desestructure los elementos en el cuerpo del requerimiento */
  let { name, password, idrole } = req.body;
  try {
    /* 4. Utilice la variable SALT para encriptar la variable password. */
    let salt = process.env.SALT;
    let hash = crypto
      .createHmac("sha512", salt)
      .update(password)
      .digest("base64");
    let passwordHash = salt + "$" + hash;
    /* 5. Guarde el registro mediante el método create */
    let user = await models.users.create({
      name: name,
      password: passwordHash,
    }) ;
    let usr=await models.users_roles.create({ users_iduser: user.iduser, roles_idrole: idrole })
    /* 6. Redireccione a la ruta con la vista principal '/users' */
    res.redirect("/users");
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports = router;
