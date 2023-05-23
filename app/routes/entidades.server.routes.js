var entidades = require("../controllers/entidades.server.controller");

module.exports = function (app) {
  app.route("/entidades/list").get(entidades.list);
  app.route("/entidades/create").post(entidades.create);
  app.route("/entidades/find/:id").get(entidades.findById);
  app.route("/entidades/listpop").get(entidades.listpop);
  app.route("/entidades/update").post(entidades.update);
  app.route("/entidades/delete/:_id").get(entidades.delete);
  app.route("/entidades/dashboard/:dueno").get(entidades.dashboard);
  app.route("/entidades/listapordueno/:dueno").get(entidades.findByDueno);
};
