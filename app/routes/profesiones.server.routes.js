var controlador = require("../controllers/profesiones.server.controller");

module.exports = function (app) {
  app.route("/profesiones/list").get(controlador.list);
  app.route("/profesiones/create").post(controlador.create);
  app.route("/profesiones/find/:id").get(controlador.findById);
  app.route("/profesiones/listpop").get(controlador.listpop);
  app.route("/profesiones/update").post(controlador.update);
  app.route("/profesiones/delete/:_id").get(controlador.delete);
};
