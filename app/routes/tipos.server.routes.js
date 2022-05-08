var tipos = require('../controllers/tipos.server.controller');

module.exports = function(app) {
    app.route('/tipos/list').get(tipos.list);
    app.route('/tipos/create').post(tipos.create);
    app.route('/tipos/find/:id').get(tipos.findById);
    app.route('/tipos/bymodel/:modelo').get(tipos.findByModel);
    app.route('/tipos/listpop').get(tipos.listpop);
    app.route('/tipos/update').post(tipos.update);
    app.route('/tipos/delete/:_id').get(tipos.delete);
};