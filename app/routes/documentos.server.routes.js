var documentos = require('../controllers/documentos.server.controller');

module.exports = function(app) {
    app.route('/documentos/list').get(documentos.list);
    app.route('/documentos/create').post(documentos.create);
    app.route('/documentos/find/:id').get(documentos.findById);
    app.route('/documentos/listpop').get(documentos.listpop);
    app.route('/documentos/update').post(documentos.update);
    app.route('/documentos/delete/:_id').get(documentos.delete);
    app.route('/documentos/findbytipo/:tipo').get(documentos.findByTipo);
    app.route('/documentos/buscaporvehiculocliente').post(documentos.buscaPorVehiculoCliente);
};