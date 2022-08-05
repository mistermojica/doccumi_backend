var campos = require("../controllers/campos.server.controller");

module.exports = function (app) {
  app.route("/campos/list").get(campos.list);
  app.route("/campos/create").post(campos.create);
  app.route("/campos/find/:id").get(campos.findById);
  app.route("/campos/listpop").get(campos.listpop);
  app.route("/campos/update").post(campos.update);
  app.route("/campos/delete/:_id").get(campos.delete);
  app.route("/campos/listapordueno/:dueno").get(campos.findByDueno);
  app.route("/campos/listaporduenoprivado/:dueno").get(campos.findByDuenoPrivado);
};
