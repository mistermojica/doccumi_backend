var publicaciones = require("../controllers/publicaciones.server.controller");

module.exports = function (app) {
  app.route("/publicaciones/list").get(publicaciones.list);
  app.route("/publicaciones/create").post(publicaciones.create);
  app.route("/publicaciones/publish").post(publicaciones.publish);
  app.route("/publicaciones/loginrrss").post(publicaciones.loginrrss);
};
