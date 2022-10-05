var soportes = require('../controllers/soportes.server.controller');

module.exports = function(app) {
    app.route('/soportes/list').get(soportes.list);
    app.route('/soportes/create').post(soportes.create);
    app.route('/soportes/find/:id').get(soportes.findById);
    app.route('/soportes/buscaportipo/:tipo').get(soportes.findByTipo);
    app.route('/soportes/buscaportipodueno/:tipo/:dueno').get(soportes.findByTipoDueno);
    app.route("/soportes/buscapordueno/:dueno").get(soportes.findByDueno);
    app.route('/soportes/listpop').get(soportes.listpop);
    app.route('/soportes/update').post(soportes.update);
    app.route('/soportes/delete/:id').get(soportes.delete);
};