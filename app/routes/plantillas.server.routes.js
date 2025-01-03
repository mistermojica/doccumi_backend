var plantillas = require("../controllers/plantillas.server.controller");

module.exports = function (app) {
  app.route("/plantillas/list").get(plantillas.list);
  app.route("/plantillas/create").post(plantillas.create);
  app.route("/plantillas/find/:id").get(plantillas.findById);
  app.route("/plantillas/listpop").get(plantillas.listpop);
  app.route("/plantillas/update").post(plantillas.update);
  app.route("/plantillas/delete/:_id").get(plantillas.delete);
  app.route("/plantillas/findbytipo/:tipo").get(plantillas.findByTipo);
  app.route("/plantillas/findbyidtipo/:tipoid").get(plantillas.findByIdTipo);
  app.route("/plantillas/findbytipodueno/:tipo/:dueno").get(plantillas.findByTipoDueno);
  app.route("/plantillas/listapordueno/:dueno").get(plantillas.findByDueno);
  app.route("/plantillas/duplicate/:_id").get(plantillas.duplicate);
};
