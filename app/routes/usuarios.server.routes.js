var usuarios = require('../controllers/usuarios.server.controller');

module.exports = function(app) {
    app.route('/usuarios').get(usuarios.list);
    app.route('/usuarios/create').post(usuarios.create);
    app.route('/usuarios/listpop').get(usuarios.listpop);
    app.route('/usuarios/find/:id').get(usuarios.findById);
    app.route('/usuarios/update').post(usuarios.update);
    app.route('/usuarios/login').post(usuarios.login);
    app.route('/usuarios/profile/:_id').get(usuarios.profile);
    app.route('/usuarios/recoverpassword').post(usuarios.recoverpassword);
    app.route('/usuarios/resetpassword').post(usuarios.resetpassword);
};