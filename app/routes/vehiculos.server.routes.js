var vehiculos = require("../controllers/vehiculos.server.controller");

module.exports = function (app) {
  app.route("/vehiculos/list").get(vehiculos.list);
  app.route("/vehiculos/create").post(vehiculos.create);
  app.route("/vehiculos/find/:id").get(vehiculos.findById);
  app.route("/vehiculos/listpop").get(vehiculos.listpop);
  app.route("/vehiculos/update").post(vehiculos.update);
  app.route("/vehiculos/delete/:_id").get(vehiculos.delete);
  app.route("/vehiculos/dashboard/:dueno").get(vehiculos.dashboard);
  app.route("/vehiculos/listapordueno/:dueno").get(vehiculos.findByDueno);
};
