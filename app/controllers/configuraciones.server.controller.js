var mofac = require('../../config/ModelFactory');
var db = mofac("doccumi");
var entityName = "Configuración(es)";
var _ = require('underscore');
const strMgr = require("../utils/strManager");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
    appInfo: { // For sample support and debugging, not required for production:
      name: "stripe-samples/subscription-use-cases/fixed-price",
      version: "0.0.1",
      url: "https://github.com/stripe-samples/subscription-use-cases/fixed-price"
    }
  });

exports.create = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    console.log("create() || req.body:", req.body);

    var entity = new db.Configuraciones(req.body);
    entity.save(function(err) {
        if (err) {
            console.log(__filename + ' >> .create: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error en la creación del ${entityName}.`, data: err});
        }
        else {
            res.json({status: "SUCCESS", message: `${entityName} creado exitosamente.`, data: entity});
        }
    });
};

exports.update = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Configuraciones.
    findOne({_id: req.body._id}).
    where("conEstado").ne("borrado").
    exec(function(err, entitydb) {
        if (err) {
            console.log(__filename + ' >> .update: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener ${entityName}.`, data: {}});
        }
        else {
            _.each(req.body, function (value, key) {
                console.log(key, value);
                entitydb[key] = req.body[key];
            });

            entitydb.plaFechaModificacion   = new Date();

            entitydb.save(function(err) {
                if (err) {
                    console.log(__filename + ' >> .update: ' + JSON.stringify(err));
                    res.json({status: "FAILED", message: `Error en la actualización de ${entityName}.`, data: {}});
                }
                else {
                    res.json({status: "SUCCESS", message: `${entityName} se actualizó exitosamente.`, data: entitydb});
                }
            });
        }
    });
};

exports.delete = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Configuraciones.
    deleteOne({_id: req.params._id}, function(err){
        if (err) {
            console.log(__filename + ' >> .delete: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al eliminar ${entityName}.`, data: {}});
        }
        else {
            res.json({status: "SUCCESS", message: `${entityName} se eliminó exitosamente.`, data: {}});
        }
    });
};

exports.findById = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Configuraciones.
    findOne({_id: req.params.id}).
    select("-__v").
    where("conEstado").ne("borrado").
    populate({
        path: "_estado_", 
        select: "codigo nombre -_id",
        match: {isActive: true}
    }).
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .findById: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: {}});
        }
        else {
            res.json({status: "SUCCESS", message: `${entityName} encontrado exitosamente.`, data: data});
        }
    });
};

exports.findByDueno = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );

    let dueno = req.params.dueno === "null" ? null : req.params.dueno;

    db.Configuraciones.find({ $or: [{ conDueno: dueno }] })
      .select("-__v")
      .where("conEstado")
      .ne("borrado")
      .populate({
        path: "_estado_",
        select: "codigo nombre -_id",
        match: { isActive: true },
      })
      .exec(function (err, data) {
        strMgr.mlCL("findByDueno() || data:", data);
        if (err) {
          console.log(__filename + " >> .findByDueno: " + JSON.stringify(err));
          res.json({
            status: "FAILED",
            message: `Error al obtener el ${entityName}.`,
            data: {},
          });
        } else {
          res.json({
            status: "SUCCESS",
            message: `${entityName} encontrado exitosamente.`,
            data: data,
          });
        }
      });
};

exports.listpop = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Configuraciones.
    find({}).
    select("-__v").
    where("conEstado").ne("borrado").
    sort({orden: 1}).
    lean().
    populate({
        path: "_estado_",
        select: "codigo nombre"
    }).
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .findById: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener la lista de ${entityName}.`, data: err});
        }
        else {
            res.json({status: "SUCCESS", message: `Lista de ${entityName} generada exitosamente.`, data: data});
        }
    });
};

exports.config = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const STRIPE_PUBLISHABLE_KEY = req.headers.host.indexOf("localhost") > -1 ? process.env.DEV_STRIPE_PUBLISHABLE_KEY : process.env.STRIPE_PUBLISHABLE_KEY;

    let prices = [];
    stripe.prices.list({
    // lookup_keys: ['sample_basic', 'sample_premium'],
    // expand: ['data.product'],
    limit: 3
    }).then((resPrices) => {
        prices = resPrices;
        console.log({resPrices});
        const result = {
            publishableKey: STRIPE_PUBLISHABLE_KEY,
            prices: prices.data,
        };
        console.log({result});
        res.send(result);
    })
    .catch((error) => {
        console.error(error)
    });
};

exports.configformularios = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const configuraciones = {
        Categorias: [
            {id: 1, nombre: 'Coupé/Deportivo', valor: 'Coupé/Deportivo'},
            {id: 2, nombre: 'Sedán', valor: 'Sedán'},
            {id: 3, nombre: 'Hatchback', valor: 'Hatchback'},
            {id: 5, nombre: 'Furgoneta', valor: 'Furgoneta'},
            {id: 7, nombre: 'StationWagon', valor: 'StationWagon'},
            {id: 11, nombre: 'MiniVán', valor: 'MiniVán'},
            {id: 12, nombre: 'Convertible', valor: 'Convertible'},
            {id: 16, nombre: 'Jeepeta', valor: 'Jeepeta'},
            {id: 17, nombre: 'Jeep', valor: 'Jeep'},
            {id: 18, nombre: 'Limusina', valor: 'Limusina'},
            {id: 20, nombre: 'Camioneta', valor: 'Camioneta'},
            {id: 29, nombre: 'Coupé', valor: 'Coupé'},
            {id: 10, nombre: 'Four Wheel', valor: 'Four Wheel'},
            {id: 15, nombre: 'Motocicleta', valor: 'Motocicleta'},
            {id: 37, nombre: 'Pasola', valor: 'Pasola'},
            {id: 19, nombre: 'Bote', valor: 'Bote'},
            {id: 24, nombre: 'JetSki', valor: 'JetSki'},
            {id: 9, nombre: 'Autobús', valor: 'Autobús'},
            {id: 13, nombre: 'Camión', valor: 'Camión'},
            {id: 22, nombre: 'Pala Mecánica', valor: 'Pala Mecánica'},
            {id: 23, nombre: 'Tractor', valor: 'Tractor'},
            {id: 25, nombre: 'Motoneta', valor: 'Motoneta'},
            {id: 28, nombre: 'Grua', valor: 'Grua'},
            {id: 31, nombre: 'Rodillo', valor: 'Rodillo'},
            {id: 32, nombre: 'Monta Carga', valor: 'Monta Carga'},
            {id: 39, nombre: 'Retroexcavadora', valor: 'Retroexcavadora'},
            {id: 43, nombre: 'Retropala', valor: 'Retropala'},
            {id: 27, nombre: 'Planta Electrica', valor: 'Planta Electrica'},
            {id: 36, nombre: 'Buggy', valor: 'Buggy'},
            {id: 38, nombre: 'Carro de Golf', valor: 'Carro de Golf'},
            {id: 53, nombre: 'Trailer', valor: 'Trailer'},
            {id: 57, nombre: 'Volteo', valor: 'Volteo'},
            {id: 63, nombre: 'Minibus', valor: 'Minibus'},
            {id: 64, nombre: 'Minitruck (Camioncito)', valor: 'Minitruck (Camioncito)'},
        ],
        Condiciones: [
            {id: 1, nombre: "Nuevo", valor: "nuevo"},
            {id: 2, nombre: "Usado", valor: "usado"}
        ],
        Precios: [
            0,
            25000,
            50000,
            75000,
            100000,
            150000,
            200000,
            250000,
            300000,
            350000,
            400000,
            500000,
            600000,
            700000,
            800000,
            1000000,
            1500000,
            2000000,
            2500000,
            3000000,
            3500000,
            4000000,
            4500000,
            5000000
        ],
        Anos: [1970, new Date().getFullYear() + 1],
        Cilindros: [
            {id: 1, nombre: "1 Cilindro", valor: "1cilindro"},
            {id: 2, nombre: "2 Cilindros", valor: "2cilindros"},
            {id: 3, nombre: "3 Cilindros", valor: "3cilindros"},
            {id: 4, nombre: "4 Cilindros", valor: "4cilindros"},
            {id: 5, nombre: "5 Cilindros", valor: "5cilindros"},
            {id: 6, nombre: "6 Cilindros", valor: "6cilindros"},
            {id: 7, nombre: "8 Cilindros", valor: "8cilindros"},
            {id: 8, nombre: "10 Cilindros", valor: "10cilindros"},
            {id: 9, nombre: "12 Cilindros", valor: "12cilindros"}
        ],
        Colores: [
            {id: 526, nombre: 'Amarillo', valor: 'Amarillo'},
            {id: 516, nombre: 'Azul', valor: 'Azul'},
            {id: 529, nombre: 'Azul Agua', valor: 'Azul Agua'},
            {id: 518, nombre: 'Azul Cielo', valor: 'Azul Cielo'},
            {id: 509, nombre: 'Azul claro', valor: 'Azul claro'},
            {id: 520, nombre: 'Azul Marino', valor: 'Azul Marino'},
            {id: 513, nombre: 'Azul/Grís', valor: 'Azul/Grís'},
            {id: 505, nombre: 'Beige', valor: 'Beige'},
            {id: 512, nombre: 'Blanco', valor: 'Blanco'},
            {id: 533, nombre: 'Blanco perla', valor: 'Blanco perla'},
            {id: 535, nombre: 'Bronce', valor: 'Bronce'},
            {id: 527, nombre: 'Champang', valor: 'Champang'},
            {id: 502, nombre: 'Crema', valor: 'Crema'},
            {id: 501, nombre: 'Dorado', valor: 'Dorado'},
            {id: 510, nombre: 'Gris', valor: 'Gris'},
            {id: 511, nombre: 'Gris oscuro', valor: 'Gris oscuro'},
            {id: 519, nombre: 'Gris Plata', valor: 'Gris Plata'},
            {id: 525, nombre: 'Ladrillo', valor: 'Ladrillo'},
            {id: 517, nombre: 'Marrón', valor: 'Marrón'},
            {id: 521, nombre: 'Morado', valor: 'Morado'},
            {id: 531, nombre: 'Morado/Gris', valor: 'Morado/Gris'},
            {id: 534, nombre: 'Naranja', valor: 'Naranja'},
            {id: 504, nombre: 'Negro', valor: 'Negro'},
            {id: 506, nombre: 'Negro/Crema', valor: 'Negro/Crema'},
            {id: 507, nombre: 'Negro/Gris', valor: 'Negro/Gris'},
            {id: 514, nombre: 'Negro/Gris', valor: 'Negro/Gris'},
            {id: 500, nombre: 'Negro/Rojo', valor: 'Negro/Rojo'},
            {id: 530, nombre: 'Plata', valor: 'Plata'},
            {id: 503, nombre: 'Rojo', valor: 'Rojo'},
            {id: 524, nombre: 'Rojo Esacarlata', valor: 'Rojo Esacarlata'},
            {id: 528, nombre: 'Rojo Vino', valor: 'Rojo Vino'},
            {id: 522, nombre: 'Rojo/Dorado', valor: 'Rojo/Dorado'},
            {id: 547, nombre: 'Rosado', valor: 'Rosado'},
            {id: 523, nombre: 'Silver', valor: 'Silver'},
            {id: 536, nombre: 'Terracota', valor: 'Terracota'},
            {id: 515, nombre: 'Verde', valor: 'Verde'},
            {id: 532, nombre: 'Verde/Gris', valor: 'Verde/Gris'},
            {id: 508, nombre: 'Vino', valor: 'Vino'}
        ],
        Tracciones: [
            {id: 800, nombre: 'Delantera', valor: 'Delantera'},
            {id: 801, nombre: 'Trasera', valor: 'Trasera'},
            {id: 804, nombre: '2WD', valor: '2WD'},
            {id: 802, nombre: '4WD', valor: '4WD'},
            {id: 803, nombre: '4WD Full Time', valor: '4WD Full Time'},
            {id: 805, nombre: 'AWD', valor: 'AWD'}
        ],
        Transmisiones: [
            {id: 701, nombre: 'Automática', valor: 'Automática'},
            {id: 700, nombre: 'Mecánica', valor: 'Mecánica'},
            {id: 702, nombre: 'Sincronizada', valor: 'Sincronizada'},
            {id: 704, nombre: 'Semiautomática', valor: 'Semiautomática'},
            {id: 703, nombre: 'Mecánica o Automática', valor: 'Mecánica o Automática'}
        ],
        Ciudades: [
            {id: 10, nombre: 'Bani', valor: 'Bani'},
            {id: 22, nombre: 'Barahona', valor: 'Barahona'},
            {id: 13, nombre: 'Bonao', valor: 'Bonao'},
            {id: 497, nombre: 'Dajabon', valor: 'Dajabon'},
            {id: 6, nombre: 'Distrito Nacional', valor: 'Distrito Nacional'},
            {id: 4, nombre: 'Duarte', valor: 'Duarte'},
            {id: 26, nombre: 'El Seibo', valor: 'El Seibo'},
            {id: 3, nombre: 'Espaillat', valor: 'Espaillat'},
            {id: 20, nombre: 'Hato Mayor', valor: 'Hato Mayor'},
            {id: 27, nombre: 'Hermanas Mirabal', valor: 'Hermanas Mirabal'},
            {id: 1, nombre: 'Higuey', valor: 'Higuey'},
            {id: 24, nombre: 'Jarabacoa', valor: 'Jarabacoa'},
            {id: 8, nombre: 'La Romana', valor: 'La Romana'},
            {id: 2, nombre: 'La Vega', valor: 'La Vega'},
            {id: 7, nombre: 'Maria Trinidad Sanchez', valor: 'Maria Trinidad Sanchez'},
            {id: 521, nombre: 'Monseñor Nouel', valor: 'Monseñor Nouel'},
            {id: 23, nombre: 'Monte Cristi', valor: 'Monte Cristi'},
            {id: 514, nombre: 'Monte Plata', valor: 'Monte Plata'},
            {id: 11, nombre: 'Puerto Plata', valor: 'Puerto Plata'},
            {id: 25, nombre: 'Salcedo', valor: 'Salcedo'},
            {id: 12, nombre: 'Samana', valor: 'Samana'},
            {id: 15, nombre: 'San Cristobal', valor: 'San Cristobal'},
            {id: 517, nombre: 'San Jose De Ocoa', valor: 'San Jose De Ocoa'},
            {id: 21, nombre: 'San Juan de la Maguana', valor: 'San Juan de la Maguana'},
            {id: 5, nombre: 'San Pedro de Macoris', valor: 'San Pedro de Macoris'},
            {id: 18, nombre: 'Sanchez Ramirez', valor: 'Sanchez Ramirez'},
            {id: 9, nombre: 'Santiago', valor: 'Santiago'},
            {id: 493, nombre: 'Santiago Rodriguez', valor: 'Santiago Rodriguez'},
            {id: 48, nombre: 'Santo Domingo Este', valor: 'Santo Domingo Este'},
            {id: 519, nombre: 'Santo Domingo Norte', valor: 'Santo Domingo Norte'},
            {id: 502, nombre: 'Santo Domingo Oeste', valor: 'Santo Domingo Oeste'},
            {id: 14, nombre: 'Valverde Mao', valor: 'Valverde Mao'}
        ],
        Marcas: [
            {id: 36, nombre: 'Acura', valor: 'Acura'},
            {id: 681, nombre: 'Aiways', valor: 'Aiways'},
            {id: 29, nombre: 'Alfa Romeo', valor: 'Alfa Romeo'},
            {id: 19, nombre: 'Audi', valor: 'Audi'},
            {id: 473, nombre: 'Bajaj', valor: 'Bajaj'},
            {id: 636, nombre: 'Bean', valor: 'Bean'},
            {id: 651, nombre: 'Beiben', valor: 'Beiben'},
            {id: 157, nombre: 'Bentley', valor: 'Bentley'},
            {id: 695, nombre: 'Bestune', valor: 'Bestune'},
            {id: 17, nombre: 'BMW', valor: 'BMW'},
            {id: 230, nombre: 'Bobcat', valor: 'Bobcat'},
            {id: 369, nombre: 'Boston', valor: 'Boston'},
            {id: 571, nombre: 'BR', valor: 'BR'},
            {id: 283, nombre: 'Brilliance', valor: 'Brilliance'},
            {id: 39, nombre: 'Buick', valor: 'Buick'},
            {id: 303, nombre: 'BYD', valor: 'BYD'},
            {id: 23, nombre: 'Cadillac', valor: 'Cadillac'},
            {id: 335, nombre: 'Can-Am', valor: 'Can-Am'},
            {id: 209, nombre: 'Case', valor: 'Case'},
            {id: 104, nombre: 'Caterpillar', valor: 'Caterpillar'},
            {id: 575, nombre: 'CDW', valor: 'CDW'},
            {id: 672, nombre: 'Celeste', valor: 'Celeste'},
            {id: 478, nombre: 'CF Moto', valor: 'CF Moto'},
            {id: 145, nombre: 'Chana', valor: 'Chana'},
            {id: 310, nombre: 'Changan', valor: 'Changan'},
            {id: 187, nombre: 'Chery', valor: 'Chery'},
            {id: 34, nombre: 'Chevrolet', valor: 'Chevrolet'},
            {id: 140, nombre: 'Chevy', valor: 'Chevy'},
            {id: 32, nombre: 'Chrysler', valor: 'Chrysler'},
            {id: 31, nombre: 'Citroen', valor: 'Citroen'},
            {id: 190, nombre: 'Club Car', valor: 'Club Car'},
            {id: 346, nombre: 'Cola', valor: 'Cola'},
            {id: 468, nombre: 'Corvette', valor: 'Corvette'},
            {id: 55, nombre: 'Daewoo', valor: 'Daewoo'},
            {id: 35, nombre: 'Daihatsu', valor: 'Daihatsu'},
            {id: 52, nombre: 'Datsun', valor: 'Datsun'},
            {id: 189, nombre: 'DFM', valor: 'DFM'},
            {id: 46, nombre: 'Dodge', valor: 'Dodge'},
            {id: 186, nombre: 'Dongfeng', valor: 'Dongfeng'},
            {id: 81, nombre: 'Ducati', valor: 'Ducati'},
            {id: 329, nombre: 'Dynapac', valor: 'Dynapac'},
            {id: 691, nombre: 'Eco Scooter', valor: 'Eco Scooter'},
            {id: 664, nombre: 'EICHER', valor: 'EICHER'},
            {id: 700, nombre: 'Energica', valor: 'Energica'},
            {id: 558, nombre: 'EZGO', valor: 'EZGO'},
            {id: 164, nombre: 'Faw', valor: 'Faw'},
            {id: 78, nombre: 'Ferrari', valor: 'Ferrari'},
            {id: 58, nombre: 'Fiat', valor: 'Fiat'},
            {id: 45, nombre: 'Ford', valor: 'Ford'},
            {id: 552, nombre: 'Forland', valor: 'Forland'},
            {id: 241, nombre: 'Foton', valor: 'Foton'},
            {id: 48, nombre: 'Freightliner', valor: 'Freightliner'},
            {id: 477, nombre: 'Gac Gonow', valor: 'Gac Gonow'},
            {id: 470, nombre: 'Gacela', valor: 'Gacela'},
            {id: 457, nombre: 'Gas Gas', valor: 'Gas Gas'},
            {id: 608, nombre: 'GENLITEC', valor: 'GENLITEC'},
            {id: 47, nombre: 'GMC', valor: 'GMC'},
            {id: 637, nombre: 'Go Electric', valor: 'Go Electric'},
            {id: 99, nombre: 'Harley Davidson', valor: 'Harley Davidson'},
            {id: 583, nombre: 'Higer', valor: 'Higer'},
            {id: 237, nombre: 'Hino', valor: 'Hino'},
            {id: 27, nombre: 'Honda', valor: 'Honda'},
            {id: 102, nombre: 'Hummer', valor: 'Hummer'},
            {id: 248, nombre: 'Husqvarna', valor: 'Husqvarna'},
            {id: 462, nombre: 'Hyster', valor: 'Hyster'},
            {id: 42, nombre: 'Hyundai', valor: 'Hyundai'},
            {id: 604, nombre: 'IC Corporation', valor: 'IC Corporation'},
            {id: 53, nombre: 'Infiniti', valor: 'Infiniti'},
            {id: 68, nombre: 'International', valor: 'International'},
            {id: 576, nombre: 'ISI-1000', valor: 'ISI-1000'},
            {id: 44, nombre: 'Isuzu', valor: 'Isuzu'},
            {id: 180, nombre: 'Jac', valor: 'Jac'},
            {id: 18, nombre: 'Jaguar', valor: 'Jaguar'},
            {id: 64, nombre: 'Jeep', valor: 'Jeep'},
            {id: 562, nombre: 'JLG', valor: 'JLG'},
            {id: 167, nombre: 'JMC', valor: 'JMC'},
            {id: 147, nombre: 'John Deere', valor: 'John Deere'},
            {id: 622, nombre: 'Kaiyun', valor: 'Kaiyun'},
            {id: 82, nombre: 'Kawasaki', valor: 'Kawasaki'},
            {id: 74, nombre: 'Kenworth', valor: 'Kenworth'},
            {id: 49, nombre: 'Kia', valor: 'Kia'},
            {id: 128, nombre: 'Komatsu', valor: 'Komatsu'},
            {id: 138, nombre: 'KTM', valor: 'KTM'},
            {id: 109, nombre: 'Kymco', valor: 'Kymco'},
            {id: 90, nombre: 'Lamborghini', valor: 'Lamborghini'},
            {id: 488, nombre: 'Lancha', valor: 'Lancha'},
            {id: 37, nombre: 'Land Rover', valor: 'Land Rover'},
            {id: 33, nombre: 'Lexus', valor: 'Lexus'},
            {id: 291, nombre: 'Lifan', valor: 'Lifan'},
            {id: 62, nombre: 'Lincoln', valor: 'Lincoln'},
            {id: 270, nombre: 'Loncin', valor: 'Loncin'},
            {id: 65, nombre: 'Mack', valor: 'Mack'},
            {id: 141, nombre: 'Maserati', valor: 'Maserati'},
            {id: 322, nombre: 'Maxus', valor: 'Maxus'},
            {id: 40, nombre: 'Mazda', valor: 'Mazda'},
            {id: 532, nombre: 'McLaren', valor: 'McLaren'},
            {id: 24, nombre: 'Mercedes-Benz', valor: 'Mercedes-Benz'},
            {id: 76, nombre: 'Mercury', valor: 'Mercury'},
            {id: 103, nombre: 'MG', valor: 'MG'},
            {id: 114, nombre: 'Mini', valor: 'Mini'},
            {id: 21, nombre: 'Mitsubishi', valor: 'Mitsubishi'},
            {id: 635, nombre: 'Monster', valor: 'Monster'},
            {id: 135, nombre: 'Montacarga', valor: 'Montacarga'},
            {id: 690, nombre: 'Motoneo', valor: 'Motoneo'},
            {id: 667, nombre: 'MQI', valor: 'MQI'},
            {id: 28, nombre: 'Nissan', valor: 'Nissan'},
            {id: 668, nombre: 'NIU', valor: 'NIU'},
            {id: 666, nombre: 'NQI', valor: 'NQI'},
            {id: 185, nombre: 'Peterbilt', valor: 'Peterbilt'},
            {id: 41, nombre: 'Peugeot', valor: 'Peugeot'},
            {id: 429, nombre: 'Piaggio', valor: 'Piaggio'},
            {id: 69, nombre: 'Plymouth', valor: 'Plymouth'},
            {id: 112, nombre: 'Polaris', valor: 'Polaris'},
            {id: 38, nombre: 'Pontiac', valor: 'Pontiac'},
            {id: 25, nombre: 'Porsche', valor: 'Porsche'},
            {id: 450, nombre: 'Princeton', valor: 'Princeton'},
            {id: 618, nombre: 'Ram', valor: 'Ram'},
            {id: 20, nombre: 'Renault', valor: 'Renault'},
            {id: 264, nombre: 'Rolls Royce', valor: 'Rolls Royce'},
            {id: 528, nombre: 'Royal Enfield', valor: 'Royal Enfield'},
            {id: 107, nombre: 'Samsung', valor: 'Samsung'},
            {id: 146, nombre: 'Sea Doo', valor: 'Sea Doo'},
            {id: 367, nombre: 'Sea Pro', valor: 'Sea Pro'},
            {id: 77, nombre: 'Seat', valor: 'Seat'},
            {id: 704, nombre: 'Segway', valor: 'Segway'},
            {id: 696, nombre: 'Shacman', valor: 'Shacman'},
            {id: 399, nombre: 'Shineray', valor: 'Shineray'},
            {id: 22, nombre: 'Skoda', valor: 'Skoda'},
            {id: 671, nombre: 'Skywell', valor: 'Skywell'},
            {id: 422, nombre: 'Smart', valor: 'Smart'},
            {id: 59, nombre: 'SsangYong', valor: 'SsangYong'},
            {id: 320, nombre: 'Sterling', valor: 'Sterling'},
            {id: 692, nombre: 'Studebaker', valor: 'Studebaker'},
            {id: 63, nombre: 'Subaru', valor: 'Subaru'},
            {id: 675, nombre: 'Super Soco', valor: 'Super Soco'},
            {id: 30, nombre: 'Suzuki', valor: 'Suzuki'},
            {id: 694, nombre: 'Tempest', valor: 'Tempest'},
            {id: 566, nombre: 'Tesla', valor: 'Tesla'},
            {id: 521, nombre: 'Thomas', valor: 'Thomas'},
            {id: 26, nombre: 'Toyota', valor: 'Toyota'},
            {id: 261, nombre: 'Trailer', valor: 'Trailer'},
            {id: 319, nombre: 'Transcraft', valor: 'Transcraft'},
            {id: 542, nombre: 'Triumph', valor: 'Triumph'},
            {id: 436, nombre: 'Vespa', valor: 'Vespa'},
            {id: 612, nombre: 'Victory', valor: 'Victory'},
            {id: 632, nombre: 'Viparo', valor: 'Viparo'},
            {id: 43, nombre: 'Volkswagen', valor: 'Volkswagen'},
            {id: 54, nombre: 'Volvo', valor: 'Volvo'},
            {id: 149, nombre: 'Wellcraft', valor: 'Wellcraft'},
            {id: 652, nombre: 'X1000', valor: 'X1000'},
            {id: 670, nombre: 'XCMG', valor: 'XCMG'},
            {id: 85, nombre: 'Yamaha', valor: 'Yamaha'},
            {id: 260, nombre: 'Yanmar', valor: 'Yanmar'},
            {id: 630, nombre: 'Yasan', valor: 'Yasan'},
            {id: 678, nombre: 'YEMA', valor: 'YEMA'},
            {id: 519, nombre: 'Yutong', valor: 'Yutong'},
            {id: 659, nombre: 'ZX Auto', valor: 'ZX Auto'}
        ],
        Modelos: {
            36: [
                {id: 3608, nombre: 'ILX', valor: 'ILX'},
                {id: 1117, nombre: 'MDX', valor: 'MDX'},
                {id: 1895, nombre: 'RDX', valor: 'RDX'},
                {id: 854, nombre: 'T L', valor: 'T L'},
                {id: 3194, nombre: 'TLX', valor: 'TLX'},
                {id: 2342, nombre: 'ZDX', valor: 'ZDX'}
            ],
            681: [
                {id: 4147, nombre: 'U5', valor: 'U5'}
            ],
            29: [
                {id: 2972, nombre: '159', valor: '159'},
                {id: 3972, nombre: 'Giulia', valor: 'Giulia'},
                {id: 2794, nombre: 'Mito', valor: 'Mito'},
                {id: 3709, nombre: 'Stelvio', valor: 'Stelvio'}
            ],
            19: [
                {id: 802, nombre: 'A3', valor: 'A3'},
                {id: 56, nombre: 'A4', valor: 'A4'},
                {id: 2084, nombre: 'A5', valor: 'A5'},
                {id: 57, nombre: 'A6', valor: 'A6'},
                {id: 2625, nombre: 'A7', valor: 'A7'},
                {id: 1128, nombre: 'A8', valor: 'A8'},
                {id: 4179, nombre: 'E-Tron', valor: 'E-Tron'},
                {id: 3395, nombre: 'Q2', valor: 'Q2'},
                {id: 2603, nombre: 'Q3', valor: 'Q3'},
                {id: 1556, nombre: 'Q5', valor: 'Q5'},
                {id: 1215, nombre: 'Q7', valor: 'Q7'},
                {id: 3567, nombre: 'Q8', valor: 'Q8'},
                {id: 1444, nombre: 'R8', valor: 'R8'},
                {id: 4251, nombre: 'RS E-TRON GT', valor: 'RS E-TRON GT'},
                {id: 4067, nombre: 'RS Q8', valor: 'RS Q8'},
                {id: 3475, nombre: 'RS3', valor: 'RS3'},
                {id: 3105, nombre: 'S3', valor: 'S3'},
                {id: 995, nombre: 'S4', valor: 'S4'},
                {id: 2462, nombre: 'S5', valor: 'S5'},
                {id: 3003, nombre: 'S6', valor: 'S6'},
                {id: 2900, nombre: 'S7', valor: 'S7'},
                {id: 1116, nombre: 'S8', valor: 'S8'},
                {id: 3438, nombre: 'SQ5', valor: 'SQ5'}
            ],
            473: [
                {id: 3862, nombre: 'Maxima', valor: 'Maxima'},
                {id: 3306, nombre: 'Platina', valor: 'Platina'},
                {id: 3417, nombre: 'Qute', valor: 'Qute'}
            ],
            636: [
                {id: 3861, nombre: 'Pasola Eléctrica', valor: 'Pasola Eléctrica'}
            ],
            651: [
                {id: 3946, nombre: 'Volteo 20 Mts Cúbicos', valor: 'Volteo 20 Mts Cúbicos'}
            ],
            17: [
                {id: 2529, nombre: "F-800", valor: "F-800"},
                {id: 1548, nombre: "GS", valor: "GS"},
                {id: 3659, nombre: "i3", valor: "i3"},
                {id: 3607, nombre: "i8", valor: "i8"},
                {id: 1653, nombre: "M", valor: "M"},
                {id: 3100, nombre: "Serie 2", valor: "Serie 2"},
                {id: 1640, nombre: "Serie 3", valor: "Serie 3"},
                {id: 3199, nombre: "Serie 4", valor: "Serie 4"},
                {id: 1649, nombre: "Serie 5", valor: "Serie 5"},
                {id: 1652, nombre: "Serie 6", valor: "Serie 6"},
                {id: 1651, nombre: "Serie 7", valor: "Serie 7"},
                {id: 1654, nombre: "X", valor: "X"},
            ],
            23: [
                {id: 3516, nombre: "ATS", valor: "ATS"},
                {id: 2030, nombre: "Brougham", valor: "Brougham"},
                {id: 2150, nombre: "CTS", valor: "CTS"},
                {id: 151, nombre: "Escalade", valor: "Escalade"},
                {id: 325, nombre: "Seville", valor: "Seville"},
                {id: 1803, nombre: "SRX", valor: "SRX"},
            ],
            39: [
                {id: 3626, nombre: "Encore", valor: "Encore"},
            ],
            104: [
                {id: 850, nombre: "12 F", valor: "12 F"},
                {id: 4301, nombre: "329EL", valor: "329EL"},
                {id: 2247, nombre: "420-D", valor: "420-D"},
                {id: 2983, nombre: "430 D", valor: "430 D"},
                {id: 4268, nombre: "450F", valor: "450F"},
            ],
            145: [
                {id: 3497, nombre: "Star 5", valor: "Star 5"},
            ],
            157: [
                {id: 3341, nombre: "Bentayga", valor: "Bentayga"},
            ],
            187: [
                {id: 1400, nombre: "tiggo", valor: "tiggo"},
            ],
            209: [
                {id: 1840, nombre: "821 C", valor: "821 C"},
            ],
            230: [
                {id: 1626, nombre: "763 G", valor: "763 G"},
                {id: 2604, nombre: "E-35", valor: "E-35"},
                {id: 1771, nombre: "S-150", valor: "S-150"},
            ],
            283: [
                {id: 3296, nombre: "V3", valor: "V3"},
            ],
            303: [
                {id: 4265, nombre: "ATTOS", valor: "ATTOS"},
                {id: 4198, nombre: "Dolphin", valor: "Dolphin"},
                {id: 2793, nombre: "F0", valor: "F0"},
                {id: 4140, nombre: "HAN", valor: "HAN"},
                {id: 2788, nombre: "S6", valor: "S6"},
                {id: 4007, nombre: "Song Pro", valor: "Song Pro"},
                {id: 3793, nombre: "Tang", valor: "Tang"},
                {id: 3808, nombre: "Yuan", valor: "Yuan"},
            ],
            310: [
                {id: 4260, nombre: "Cargo Box Refrigerada", valor: "Cargo Box Refrigerada"},
                {id: 3553, nombre: "CS 15", valor: "CS 15"},
                {id: 4091, nombre: "CS 35", valor: "CS 35"},
                {id: 3623, nombre: "CS 55", valor: "CS 55"},
                {id: 3323, nombre: "CS 75", valor: "CS 75"},
                {id: 4047, nombre: "CS 85", valor: "CS 85"},
                {id: 3877, nombre: "F 70", valor: "F 70"},
                {id: 4052, nombre: "Hunter", valor: "Hunter"},
                {id: 3977, nombre: "Star 5", valor: "Star 5"},
                {id: 4250, nombre: "Uni-K", valor: "Uni-K"},
                {id: 4259, nombre: "Uni-K elite", valor: "Uni-K elite"},
                {id: 4151, nombre: "UNI-T", valor: "UNI-T"},
            ],
            335: [
                {id: 2892, nombre: "Maverick", valor: "Maverick"},
                {id: 3943, nombre: "RS-S", valor: "RS-S"},
            ],
            369: [
                {id: 4079, nombre: "Whaler", valor: "Whaler"},
            ],
            478: [
                {id: 4183, nombre: "300SR", valor: "300SR"},
                {id: 3923, nombre: "700CL-X", valor: "700CL-X"},
                {id: 3669, nombre: "C-Force", valor: "C-Force"},
                {id: 4255, nombre: "CLX-250", valor: "CLX-250"},
                {id: 3666, nombre: "MT", valor: "MT"},
                {id: 3665, nombre: "NK", valor: "NK"},
                {id: 3667, nombre: "Z-Force", valor: "Z-Force"},
            ],
            571: [
                {id: 4064, nombre: "CG", valor: "CG"},
                {id: 3920, nombre: "Sport", valor: "Sport"},
            ],
            575: [
                {id: 3578, nombre: "737", valor: "737"},
                {id: 3565, nombre: "757", valor: "757"},
                {id: 3843, nombre: "777", valor: "777"},
                {id: 3720, nombre: "777 20 Pies", valor: "777 20 Pies"},
                {id: 3596, nombre: "Constanza", valor: "Constanza"},
            ],
            672: [
                {id: 4088, nombre: "Iron", valor: "Iron"},
            ],
            695: [
                {id: 4201, nombre: "T-33", valor: "T-33"},
                {id: 4294, nombre: "T-55", valor: "T-55"},
                {id: 4298, nombre: "T-77", valor: "T-77"},
                {id: 4299, nombre: "T-99", valor: "T-99"},
            ],
            31: [
                {id: 1929, nombre: "Berlingo", valor: "Berlingo"},
                {id: 1776, nombre: "C-4", valor: "C-4"},
                {id: 3234, nombre: "C-Elysee", valor: "C-Elysee"},
                {id: 3087, nombre: "C3", valor: "C3"},
                {id: 3604, nombre: "C5", valor: "C5"},
                {id: 2375, nombre: "DS3", valor: "DS3"},
                {id: 3549, nombre: "Jumper", valor: "Jumper"},
                {id: 4107, nombre: "Jumpy", valor: "Jumpy"},
            ],
            32: [
                {id: 2594, nombre: "200", valor: "200"},
                {id: 1381, nombre: "300", valor: "300"},
                {id: 772, nombre: "Gran Caravan", valor: "Gran Caravan"},
                {id: 1665, nombre: "Pacifica", valor: "Pacifica"},
                {id: 358, nombre: "Town Country", valor: "Town Country"},
            ],
            34: [
                {id: 3213, nombre: "4500", valor: "4500"},
                {id: 76, nombre: "Avalanche", valor: "Avalanche"},
                {id: 1175, nombre: "Aveo", valor: "Aveo"},
                {id: 84, nombre: "Blazer", valor: "Blazer"},
                {id: 3686, nombre: "Bolt", valor: "Bolt"},
                {id: 91, nombre: "Camaro", valor: "Camaro"},
                {id: 1314, nombre: "Captiva", valor: "Captiva"},
                {id: 3677, nombre: "City Express", valor: "City Express"},
                {id: 1940, nombre: "CMV", valor: "CMV"},
                {id: 1082, nombre: "Colorado", valor: "Colorado"},
                {id: 882, nombre: "Corvette", valor: "Corvette"},
                {id: 2205, nombre: "Cruze", valor: "Cruze"},
                {id: 3935, nombre: "DAMAS", valor: "DAMAS"},
                {id: 4177, nombre: "El Camino", valor: "El Camino"},
                {id: 958, nombre: "Equinox", valor: "Equinox"},
                {id: 1186, nombre: "Express", valor: "Express"},
                {id: 4307, nombre: "Groove", valor: "Groove"},
                {id: 194, nombre: "Impala", valor: "Impala"},
                {id: 4144, nombre: "Labo", valor: "Labo"},
                {id: 238, nombre: "Malibu", valor: "Malibu"},
                {id: 2920, nombre: "N 300", valor: "N 300"},
                {id: 3761, nombre: "N 400", valor: "N 400"},
                {id: 2858, nombre: "Nova", valor: "Nova"},
                {id: 331, nombre: "Silverado", valor: "Silverado"},
                {id: 2914, nombre: "Sonic", valor: "Sonic"},
                {id: 1313, nombre: "Spark", valor: "Spark"},
                {id: 341, nombre: "Suburban", valor: "Suburban"},
                {id: 346, nombre: "Tahoe", valor: "Tahoe"},
                {id: 362, nombre: "Tracker", valor: "Tracker"},
                {id: 364, nombre: "Trail blazer", valor: "Trail blazer"},
                {id: 1841, nombre: "Traverse", valor: "Traverse"},
                {id: 2570, nombre: "Trax", valor: "Trax"},
                {id: 4184, nombre: "Volt", valor: "Volt"},
            ],
            35: [
                {id: 1872, nombre: "Boon", valor: "Boon"},
                {id: 2609, nombre: "Confort", valor: "Confort"},
                {id: 136, nombre: "Delta", valor: "Delta"},
                {id: 190, nombre: "Hijet", valor: "Hijet"},
                {id: 910, nombre: "Mira", valor: "Mira"},
                {id: 2787, nombre: "Move", valor: "Move"},
                {id: 353, nombre: "Terios", valor: "Terios"},
                {id: 378, nombre: "Volteo", valor: "Volteo"},
            ],
            45: [
                {id: 2519, nombre: "7810", valor: "7810"},
                {id: 867, nombre: "Bronco", valor: "Bronco"},
                {id: 3449, nombre: "C Max", valor: "C Max"},
                {id: 1693, nombre: "E-150", valor: "E-150"},
                {id: 522, nombre: "E-350", valor: "E-350"},
                {id: 3085, nombre: "E-450", valor: "E-450"},
                {id: 1040, nombre: "Eco Sport", valor: "Eco Sport"},
                {id: 148, nombre: "Econoline", valor: "Econoline"},
                {id: 1228, nombre: "EDGE", valor: "EDGE"},
                {id: 152, nombre: "Escape", valor: "Escape"},
                {id: 1063, nombre: "Everest", valor: "Everest"},
                {id: 394, nombre: "Expedition", valor: "Expedition"},
                {id: 156, nombre: "Explorer", valor: "Explorer"},
                {id: 160, nombre: "F 150", valor: "F 150"},
                {id: 501, nombre: "F 250", valor: "F 250"},
                {id: 500, nombre: "F 350", valor: "F 350"},
                {id: 3227, nombre: "F 550", valor: "F 550"},
                {id: 3646, nombre: "F 650", valor: "F 650"},
                {id: 1635, nombre: "F 800", valor: "F 800"},
                {id: 2399, nombre: "F-450", valor: "F-450"},
                {id: 2818, nombre: "Fiesta", valor: "Fiesta"},
                {id: 3174, nombre: "Figo", valor: "Figo"},
                {id: 169, nombre: "Focus", valor: "Focus"},
                {id: 2141, nombre: "Fusion", valor: "Fusion"},
                {id: 245, nombre: "Mercury", valor: "Mercury"},
                {id: 259, nombre: "Mustang", valor: "Mustang"},
                {id: 306, nombre: "Ranger", valor: "Ranger"},
                {id: 349, nombre: "Taurus", valor: "Taurus"},
                {id: 366, nombre: "Transit", valor: "Transit"},
            ],
            46: [
                {id: 2505, nombre: "Avenger", valor: "Avenger"},
                {id: 1283, nombre: "Caliber", valor: "Caliber"},
                {id: 100, nombre: "Caravan", valor: "Caravan"},
                {id: 2407, nombre: "Challenger", valor: "Challenger"},
                {id: 1150, nombre: "Charger", valor: "Charger"},
                {id: 599, nombre: "Dakota", valor: "Dakota"},
                {id: 3020, nombre: "Dart", valor: "Dart"},
                {id: 489, nombre: "Durango", valor: "Durango"},
                {id: 643, nombre: "Grand Caravan", valor: "Grand Caravan"},
                {id: 2169, nombre: "Journey", valor: "Journey"},
                {id: 1506, nombre: "Nitro", valor: "Nitro"},
                {id: 4285, nombre: "Raider", valor: "Raider"},
                {id: 305, nombre: "Ram", valor: "Ram"},
            ],
            52: [
                {id: 10, nombre: "1200", valor: "1200"},
            ],
            55: [
                {id: 480, nombre: "Damas", valor: "Damas"},
                {id: 1752, nombre: "Labo", valor: "Labo"},
            ],
            58: [
                {id: 2280, nombre: "500", valor: "500"},
                {id: 4218, nombre: "ARGO TREKKING", valor: "ARGO TREKKING"},
                {id: 144, nombre: "Ducato", valor: "Ducato"},
                {id: 167, nombre: "Fiorino", valor: "Fiorino"},
                {id: 3461, nombre: "Fullback", valor: "Fullback"},
                {id: 2108, nombre: "Panda", valor: "Panda"},
                {id: 4244, nombre: "Pulse", valor: "Pulse"},
            ],
            78: [
                {id: 2785, nombre: "458", valor: "458"},
                {id: 3644, nombre: "488", valor: "488"},
                {id: 4034, nombre: "812", valor: "812"},
                {id: 2014, nombre: "California", valor: "California"},
                {id: 1198, nombre: "F-430", valor: "F-430"},
                {id: 4048, nombre: "F8", valor: "F8"},
                {id: 4035, nombre: "Portofino", valor: "Portofino"},
                {id: 4138, nombre: "Roma", valor: "Roma"},
            ],
            81: [
                {id: 2469, nombre: "1100", valor: "1100"},
                {id: 2814, nombre: "Diavel", valor: "Diavel"},
                {id: 2936, nombre: "Hypermotard", valor: "Hypermotard"},
                {id: 3171, nombre: "Scrambler", valor: "Scrambler"},
                {id: 3069, nombre: "Streetfighter", valor: "Streetfighter"},
            ],
            140: [
                {id: 4305, nombre: "Nova", valor: "Nova"},
            ],
            164: [
                {id: 2413, nombre: "Camion", valor: "Camion"},
            ],
            186: [
                {id: 3324, nombre: "AX7", valor: "AX7"},
                {id: 3415, nombre: "Camion", valor: "Camion"},
                {id: 4082, nombre: "Carga K05S", valor: "Carga K05S"},
                {id: 1999, nombre: "Cargo Box", valor: "Cargo Box"},
                {id: 3458, nombre: "Cargo Van", valor: "Cargo Van"},
                {id: 3121, nombre: "DFSK", valor: "DFSK"},
                {id: 3871, nombre: "EV 400", valor: "EV 400"},
                {id: 3701, nombre: "Glory", valor: "Glory"},
                {id: 1397, nombre: "Mini Truck", valor: "Mini Truck"},
                {id: 3672, nombre: "Rich 6", valor: "Rich 6"},
                {id: 4281, nombre: "RICH PICKUP", valor: "RICH PICKUP"},
                {id: 2001, nombre: "Star Bus", valor: "Star Bus"},
            ],
            189: [
                {id: 2114, nombre: "Cargo Box", valor: "Cargo Box"},
                {id: 2065, nombre: "Donfeng", valor: "Donfeng"},
                {id: 1403, nombre: "Furgoneta", valor: "Furgoneta"},
            ],
            190: [
                {id: 3315, nombre: "Golf Car", valor: "Golf Car"},
            ],
            329: [
                {id: 2133, nombre: "C-25", valor: "C-25"},
                {id: 4278, nombre: "CA", valor: "CA"},
            ],
            346: [
                {id: 3399, nombre: "Plataforma", valor: "Plataforma"},
            ],
            468: [
                {id: 2729, nombre: "Stingray", valor: "Stingray"},
            ],
            558: [
                {id: 3309, nombre: "Golf Car", valor: "Golf Car"},
            ],
            664: [
                {id: 4023, nombre: "PRO 3008", valor: "PRO 3008"},
            ],
            691: [
                {id: 4171, nombre: "Power Deli", valor: "Power Deli"},
            ],
            700: [
                {id: 4234, nombre: "Eva", valor: "Eva"},
            ],
            18: [
                {id: 3383, nombre: "F-Pace", valor: "F-Pace"},
                {id: 340, nombre: "S-Type", valor: "S-Type"},
                {id: 478, nombre: "X J", valor: "X J"},
                {id: 4296, nombre: "XE", valor: "XE"},
                {id: 1584, nombre: "XF", valor: "XF"},
                {id: 3616, nombre: "XFR", valor: "XFR"},
                {id: 2047, nombre: "XKR-R", valor: "XKR-R"},
            ],
            27: [
                {id: 60, nombre: "Accord", valor: "Accord"},
                {id: 516, nombre: "Acty", valor: "Acty"},
                {id: 1594, nombre: "Africa Twin", valor: "Africa Twin"},
                {id: 3765, nombre: "City", valor: "City"},
                {id: 114, nombre: "Civic", valor: "Civic"},
                {id: 4141, nombre: "Clarity", valor: "Clarity"},
                {id: 3510, nombre: "CR", valor: "CR"},
                {id: 130, nombre: "CR-V", valor: "CR-V"},
                {id: 131, nombre: "CRX", valor: "CRX"},
                {id: 870, nombre: "Element", valor: "Element"},
                {id: 400, nombre: "Fit", valor: "Fit"},
                {id: 3141, nombre: "HR-V", valor: "HR-V"},
                {id: 4240, nombre: "M-NV", valor: "M-NV"},
                {id: 3936, nombre: "Navi", valor: "Navi"},
                {id: 3251, nombre: "NT", valor: "NT"},
                {id: 270, nombre: "Odyssey", valor: "Odyssey"},
                {id: 598, nombre: "Pilot", valor: "Pilot"},
                {id: 2459, nombre: "Repsol", valor: "Repsol"},
                {id: 980, nombre: "Ridgeline", valor: "Ridgeline"},
                {id: 936, nombre: "S 2000", valor: "S 2000"},
                {id: 3821, nombre: "Talon", valor: "Talon"},
                {id: 2750, nombre: "Triar", valor: "Triar"},
                {id: 1741, nombre: "XR", valor: "XR"},
            ],
            42: [
                {id: 423, nombre: "Accent", valor: "Accent"},
                {id: 2681, nombre: "Avante", valor: "Avante"},
                {id: 1772, nombre: "Azera", valor: "Azera"},
                {id: 3150, nombre: "Cantus", valor: "Cantus"},
                {id: 149, nombre: "Elantra", valor: "Elantra"},
                {id: 3609, nombre: "EX9", valor: "EX9"},
                {id: 1938, nombre: "Genesis", valor: "Genesis"},
                {id: 2805, nombre: "Grand I 10", valor: "Grand I 10"},
                {id: 2804, nombre: "Grand Santa Fe", valor: "Grand Santa Fe"},
                {id: 4005, nombre: "Grand Starex", valor: "Grand Starex"},
                {id: 2682, nombre: "Grandeur", valor: "Grandeur"},
                {id: 794, nombre: "H 1", valor: "H 1"},
                {id: 188, nombre: "H-100", valor: "H-100"},
                {id: 425, nombre: "HD", valor: "HD"},
                {id: 1465, nombre: "i 10", valor: "i 10"},
                {id: 3127, nombre: "i 20", valor: "i 20"},
                {id: 3687, nombre: "Ioniq", valor: "Ioniq"},
                {id: 3998, nombre: "KONA", valor: "KONA"},
                {id: 3664, nombre: "Mighty", valor: "Mighty"},
                {id: 3618, nombre: "Palisade", valor: "Palisade"},
                {id: 563, nombre: "Porter", valor: "Porter"},
                {id: 317, nombre: "Santa Fe", valor: "Santa Fe"},
                {id: 333, nombre: "Sonata", valor: "Sonata"},
                {id: 1304, nombre: "Starex", valor: "Starex"},
                {id: 4071, nombre: "Staria", valor: "Staria"},
                {id: 956, nombre: "Tucson", valor: "Tucson"},
                {id: 2438, nombre: "Veloster", valor: "Veloster"},
                {id: 3690, nombre: "Venue", valor: "Venue"},
                {id: 1298, nombre: "Veracruz", valor: "Veracruz"},
                {id: 3752, nombre: "Verna", valor: "Verna"},
                {id: 3610, nombre: "VOLTEO", valor: "VOLTEO"},
            ],
            44: [
                {id: 821, nombre: "Axiom", valor: "Axiom"},
                {id: 15, nombre: "Camion", valor: "Camion"},
                {id: 2568, nombre: "CXZ", valor: "CXZ"},
                {id: 694, nombre: "DMAX", valor: "DMAX"},
                {id: 4245, nombre: "ELF", valor: "ELF"},
                {id: 2157, nombre: "FTR", valor: "FTR"},
                {id: 2922, nombre: "Mux", valor: "Mux"},
                {id: 2714, nombre: "NKR", valor: "NKR"},
                {id: 3112, nombre: "NMR", valor: "NMR"},
                {id: 2504, nombre: "NPR", valor: "NPR"},
                {id: 3113, nombre: "NPS", valor: "NPS"},
                {id: 2208, nombre: "NQR", valor: "NQR"},
                {id: 3044, nombre: "QKR", valor: "QKR"},
                {id: 3225, nombre: "REWARD", valor: "REWARD"},
                {id: 395, nombre: "Volteo", valor: "Volteo"},
            ],
            47: [
                {id: 2612, nombre: "Acadia", valor: "Acadia"},
                {id: 1363, nombre: "Canyon", valor: "Canyon"},
                {id: 1390, nombre: "Denali", valor: "Denali"},
                {id: 3334, nombre: "Sabana", valor: "Sabana"},
                {id: 1462, nombre: "Sierra", valor: "Sierra"},
                {id: 3048, nombre: "Terrain", valor: "Terrain"},
                {id: 2520, nombre: "W-4500", valor: "W-4500"},
                {id: 1483, nombre: "Yukon", valor: "Yukon"},
            ],
            48: [
                {id: 2127, nombre: "Autobus", valor: "Autobus"},
                {id: 2623, nombre: "Cabezote", valor: "Cabezote"},
                {id: 1480, nombre: "Camion", valor: "Camion"},
                {id: 3603, nombre: "Camion Canasto", valor: "Camion Canasto"},
                {id: 3844, nombre: "Cascadia", valor: "Cascadia"},
                {id: 2912, nombre: "Chasis", valor: "Chasis"},
                {id: 2324, nombre: "Columbia", valor: "Columbia"},
                {id: 1275, nombre: "Columbia (CL120)", valor: "Columbia (CL120)"},
                {id: 1385, nombre: "FL-70", valor: "FL-70"},
                {id: 2201, nombre: "Grua", valor: "Grua"},
                {id: 1279, nombre: "M2", valor: "M2"},
                {id: 2290, nombre: "M2-106", valor: "M2-106"},
            ],
            53: [
                {id: 3204, nombre: "F35", valor: "F35"},
                {id: 816, nombre: "FX-35", valor: "FX-35"},
                {id: 608, nombre: "G-35", valor: "G-35"},
                {id: 3437, nombre: "JX-35", valor: "JX-35"},
                {id: 2975, nombre: "Q-50", valor: "Q-50"},
                {id: 3394, nombre: "Q-60S", valor: "Q-60S"},
                {id: 2997, nombre: "Q-70S", valor: "Q-70S"},
                {id: 3343, nombre: "QX-30", valor: "QX-30"},
                {id: 3611, nombre: "QX-50", valor: "QX-50"},
                {id: 4128, nombre: "QX-55", valor: "QX-55"},
                {id: 977, nombre: "QX-56", valor: "QX-56"},
                {id: 2998, nombre: "QX-60", valor: "QX-60"},
                {id: 2977, nombre: "QX-70", valor: "QX-70"},
                {id: 2908, nombre: "QX-80", valor: "QX-80"},
            ],
            64: [
                {id: 111, nombre: "Cherokee", valor: "Cherokee"},
                {id: 1299, nombre: "Compass", valor: "Compass"},
                {id: 3705, nombre: "Gladiator", valor: "Gladiator"},
                {id: 183, nombre: "Grand Cherokee", valor: "Grand Cherokee"},
                {id: 4133, nombre: "Grand Cherokee L", valor: "Grand Cherokee L"},
                {id: 226, nombre: "Liberty", valor: "Liberty"},
                {id: 1368, nombre: "Patriot", valor: "Patriot"},
                {id: 3151, nombre: "Renegade", valor: "Renegade"},
                {id: 383, nombre: "Wrangler", valor: "Wrangler"},
            ],
            68: [
                {id: 1894, nombre: "4300", valor: "4300"},
                {id: 2433, nombre: "4400", valor: "4400"},
                {id: 2048, nombre: "4900", valor: "4900"},
                {id: 3486, nombre: "8600", valor: "8600"},
                {id: 3396, nombre: "Autobus", valor: "Autobus"},
                {id: 1337, nombre: "Blue Bird", valor: "Blue Bird"},
                {id: 1669, nombre: "BUS", valor: "BUS"},
                {id: 1764, nombre: "Cabezote", valor: "Cabezote"},
                {id: 845, nombre: "Camion", valor: "Camion"},
                {id: 3602, nombre: "Camion Canasto", valor: "Camion Canasto"},
                {id: 1632, nombre: "DT 466", valor: "DT 466"},
                {id: 3845, nombre: "Dura Star", valor: "Dura Star"},
                {id: 846, nombre: "Grua", valor: "Grua"},
                {id: 4077, nombre: "Transtar", valor: "Transtar"},
                {id: 3683, nombre: "Workstar", valor: "Workstar"},
            ],
            99: [
                {id: 935, nombre: "Sportster", valor: "Sportster"},
                {id: 3035, nombre: "Street Glide", valor: "Street Glide"},
            ],
            102: [
                {id: 649, nombre: "H 2", valor: "H 2"},
            ],
            180: [
                {id: 4143, nombre: "1073KN CAMA 14 PIES", valor: "1073KN CAMA 14 PIES"},
                {id: 4170, nombre: "Cama 10 Pies", valor: "Cama 10 Pies"},
                {id: 4308, nombre: "Cama 14 Pies", valor: "Cama 14 Pies"},
                {id: 4304, nombre: "CAMA 18 PIES", valor: "CAMA 18 PIES"},
                {id: 4220, nombre: "CAMA 20 PIES", valor: "CAMA 20 PIES"},
                {id: 1746, nombre: "Cama Larga", valor: "Cama Larga"},
                {id: 3866, nombre: "FRISON", valor: "FRISON"},
                {id: 4297, nombre: "FRISON T8 PRO", valor: "FRISON T8 PRO"},
                {id: 4289, nombre: "GRUA PLATAFORMA", valor: "GRUA PLATAFORMA"},
                {id: 2081, nombre: "HFC", valor: "HFC"},
                {id: 4189, nombre: "JS3", valor: "JS3"},
                {id: 4219, nombre: "Js4", valor: "Js4"},
                {id: 4223, nombre: "JS4 DOBLE TONO", valor: "JS4 DOBLE TONO"},
                {id: 4222, nombre: "JS4 FLAGSHIP", valor: "JS4 FLAGSHIP"},
                {id: 3156, nombre: "S3", valor: "S3"},
                {id: 3454, nombre: "T6", valor: "T6"},
                {id: 4089, nombre: "T8", valor: "T8"},
                {id: 4162, nombre: "Volteo 4.8 Metros", valor: "Volteo 4.8 Metros"},
                {id: 3840, nombre: "X", valor: "X"},
            ],
            237: [
                {id: 3335, nombre: "268", valor: "268"},
                {id: 3986, nombre: "300", valor: "300"},
                {id: 3684, nombre: "338", valor: "338"},
                {id: 3418, nombre: "Dutro", valor: "Dutro"},
                {id: 1839, nombre: "Ranger", valor: "Ranger"},
                {id: 3688, nombre: "Serie 500", valor: "Serie 500"},
                {id: 2927, nombre: "Volteo", valor: "Volteo"},
                {id: 3361, nombre: "W 710", valor: "W 710"},
                {id: 1983, nombre: "WU 300 L", valor: "WU 300 L"},
                {id: 3540, nombre: "WU 710L", valor: "WU 710L"},
            ],
            241: [
                {id: 3933, nombre: "Aumark", valor: "Aumark"},
                {id: 2042, nombre: "Forlan", valor: "Forlan"},
                {id: 4029, nombre: "Truck Mate", valor: "Truck Mate"},
                {id: 1982, nombre: "View", valor: "View"},
            ],
            248: [
                {id: 3520, nombre: "250", valor: "250"},
                {id: 3836, nombre: "SVARTPILEN", valor: "SVARTPILEN"},
                {id: 3548, nombre: "Vitpilen", valor: "Vitpilen"},
            ],
            457: [
                {id: 4256, nombre: "700 SM", valor: "700 SM"},
            ],
            462: [
                {id: 2705, nombre: "MONTA CARGAS", valor: "MONTA CARGAS"},
            ],
            470: [
                {id: 3583, nombre: "Tekken", valor: "Tekken"},
            ],
            477: [
                {id: 2791, nombre: "Way Cargo", valor: "Way Cargo"},
            ],
            552: [
                {id: 3270, nombre: "BJ", valor: "BJ"},
                {id: 3938, nombre: "D65 L3", valor: "D65 L3"},
                {id: 4269, nombre: "Volteo", valor: "Volteo"},
            ],
            576: [
                {id: 3707, nombre: "Cryptun 110", valor: "Cryptun 110"},
            ],
            583: [
                {id: 4211, nombre: "22 Pasajeros", valor: "22 Pasajeros"},
            ],
            604: [
                {id: 3630, nombre: "PB105", valor: "PB105"},
            ],
            608: [
                {id: 3645, nombre: "GP45S", valor: "GP45S"},
            ],
            637: [
                {id: 4132, nombre: "Go 01", valor: "Go 01"},
                {id: 4093, nombre: "Go Van Pax", valor: "Go Van Pax"},
                {id: 4094, nombre: "GO02", valor: "GO02"},
                {id: 4045, nombre: "GO03XE", valor: "GO03XE"},
                {id: 4261, nombre: "Middle Box", valor: "Middle Box"},
                {id: 4180, nombre: "Pickup", valor: "Pickup"},
            ],
            21: [
                {id: 2049, nombre: "ASX", valor: "ASX"},
                {id: 98, nombre: "Canter", valor: "Canter"},
                {id: 147, nombre: "Eclipse", valor: "Eclipse"},
                {id: 881, nombre: "Endeavor", valor: "Endeavor"},
                {id: 666, nombre: "Evolution", valor: "Evolution"},
                {id: 655, nombre: "Fuso", valor: "Fuso"},
                {id: 175, nombre: "Galant", valor: "Galant"},
                {id: 209, nombre: "L 200", valor: "L 200"},
                {id: 213, nombre: "Lancer", valor: "Lancer"},
                {id: 3642, nombre: "Minicab Truck", valor: "Minicab Truck"},
                {id: 249, nombre: "Mirage", valor: "Mirage"},
                {id: 252, nombre: "Montero", valor: "Montero"},
                {id: 253, nombre: "Montero Sport", valor: "Montero Sport"},
                {id: 261, nombre: "Nativa", valor: "Nativa"},
                {id: 273, nombre: "Outlander", valor: "Outlander"},
                {id: 1836, nombre: "Rosa", valor: "Rosa"},
                {id: 3918, nombre: "Xpander", valor: "Xpander"},
            ],
            24: [
                {id: 4043, nombre: "L16", valor: "L16"},
                {id: 3320, nombre: "Actros", valor: "Actros"},
                {id: 4019, nombre: "Atego", valor: "Atego"},
                {id: 1882, nombre: "Clase A", valor: "Clase A"},
                {id: 1599, nombre: "Clase C", valor: "Clase C"},
                {id: 2685, nombre: "Clase CLA", valor: "Clase CLA"},
                {id: 1604, nombre: "Clase CLS", valor: "Clase CLS"},
                {id: 1605, nombre: "Clase E", valor: "Clase E"},
                {id: 464, nombre: "Clase G", valor: "Clase G"},
                {id: 1172, nombre: "Clase GL", valor: "Clase GL"},
                {id: 3094, nombre: "Clase GLA", valor: "Clase GLA"},
                {id: 3848, nombre: "Clase GLB", valor: "Clase GLB"},
                {id: 3247, nombre: "Clase GLC", valor: "Clase GLC"},
                {id: 3162, nombre: "Clase GLE", valor: "Clase GLE"},
                {id: 1578, nombre: "Clase GLK", valor: "Clase GLK"},
                {id: 3274, nombre: "Clase GLS", valor: "Clase GLS"},
                {id: 3576, nombre: "Clase GT", valor: "Clase GT"},
                {id: 1607, nombre: "Clase ML", valor: "Clase ML"},
                {id: 1609, nombre: "Clase S", valor: "Clase S"},
                {id: 1610, nombre: "Clase SL", valor: "Clase SL"},
                {id: 1251, nombre: "Clase SLK", valor: "Clase SLK"},
                {id: 3657, nombre: "Clase V", valor: "Clase V"},
                {id: 2346, nombre: "SE", valor: "SE"},
                {id: 1871, nombre: "SEC", valor: "SEC"},
                {id: 1781, nombre: "SEL", valor: "SEL"},
                {id: 1537, nombre: "Smart", valor: "Smart"},
                {id: 2502, nombre: "Sprinter", valor: "Sprinter"},
            ],
            28: [
                {id: 509, nombre: "300 ZX", valor: "300 ZX"},
                {id: 698, nombre: "350 Z", valor: "350 Z"},
                {id: 2013, nombre: "370-Z", valor: "370-Z"},
                {id: 3002, nombre: "Ad Van", valor: "Ad Van"},
                {id: 678, nombre: "Ad Wagon", valor: "Ad Wagon"},
                {id: 64, nombre: "Altima", valor: "Altima"},
                {id: 1010, nombre: "Armada", valor: "Armada"},
                {id: 3613, nombre: "ATLAS", valor: "ATLAS"},
                {id: 536, nombre: "Caravan", valor: "Caravan"},
                {id: 3880, nombre: "clipper", valor: "clipper"},
                {id: 134, nombre: "D 21", valor: "D 21"},
                {id: 135, nombre: "D 22", valor: "D 22"},
                {id: 173, nombre: "Frontier", valor: "Frontier"},
                {id: 2441, nombre: "GT-R", valor: "GT-R"},
                {id: 2902, nombre: "Juke", valor: "Juke"},
                {id: 3263, nombre: "Kicks", valor: "Kicks"},
                {id: 3536, nombre: "Latio", valor: "Latio"},
                {id: 3210, nombre: "Leaf", valor: "Leaf"},
                {id: 944, nombre: "March", valor: "March"},
                {id: 242, nombre: "Maxima", valor: "Maxima"},
                {id: 3628, nombre: "Micra", valor: "Micra"},
                {id: 3945, nombre: "Moco", valor: "Moco"},
                {id: 730, nombre: "Murano", valor: "Murano"},
                {id: 1374, nombre: "Navara", valor: "Navara"},
                {id: 2348, nombre: "Note", valor: "Note"},
                {id: 3484, nombre: "NV", valor: "NV"},
                {id: 282, nombre: "Pathfinder", valor: "Pathfinder"},
                {id: 283, nombre: "Patrol", valor: "Patrol"},
                {id: 1586, nombre: "Qashqai", valor: "Qashqai"},
                {id: 304, nombre: "Quest", valor: "Quest"},
                {id: 1695, nombre: "Rogue", valor: "Rogue"},
                {id: 323, nombre: "Sentra", valor: "Sentra"},
                {id: 1027, nombre: "Serena", valor: "Serena"},
                {id: 991, nombre: "Skyline", valor: "Skyline"},
                {id: 1523, nombre: "Teana", valor: "Teana"},
                {id: 1177, nombre: "TIIDA", valor: "TIIDA"},
                {id: 1159, nombre: "TITAN", valor: "TITAN"},
                {id: 964, nombre: "UD", valor: "UD"},
                {id: 372, nombre: "Urvan", valor: "Urvan"},
                {id: 2159, nombre: "Vanette", valor: "Vanette"},
                {id: 1890, nombre: "Versa", valor: "Versa"},
                {id: 387, nombre: "X-Trail", valor: "X-Trail"},
                {id: 386, nombre: "Xterra", valor: "Xterra"},
            ],
            33: [
                {id: 3254, nombre: "CT", valor: "CT"},
                {id: 150, nombre: "ES", valor: "ES"},
                {id: 186, nombre: "GS", valor: "GS"},
                {id: 688, nombre: "GX", valor: "GX"},
                {id: 570, nombre: "IS", valor: "IS"},
                {id: 4196, nombre: "IS F", valor: "IS F"},
                {id: 3511, nombre: "LC", valor: "LC"},
                {id: 1050, nombre: "LS", valor: "LS"},
                {id: 1507, nombre: "LX", valor: "LX"},
                {id: 3042, nombre: "NX", valor: "NX"},
                {id: 3184, nombre: "RC F", valor: "RC F"},
                {id: 312, nombre: "RX", valor: "RX"},
                {id: 3568, nombre: "UX", valor: "UX"},
            ],
            37: [
                {id: 905, nombre: "Defender", valor: "Defender"},
                {id: 139, nombre: "Discovery", valor: "Discovery"},
                {id: 307, nombre: "Range Rover", valor: "Range Rover"},
            ],
            40: [
                {id: 1442, nombre: "2", valor: "2"},
                {id: 869, nombre: "3", valor: "3"},
                {id: 1664, nombre: "5", valor: "5"},
                {id: 770, nombre: "6", valor: "6"},
                {id: 46, nombre: "626", valor: "626"},
                {id: 4276, nombre: "Axela", valor: "Axela"},
                {id: 1488, nombre: "Bongo", valor: "Bongo"},
                {id: 1489, nombre: "BT-50", valor: "BT-50"},
                {id: 3519, nombre: "Carol", valor: "Carol"},
                {id: 3216, nombre: "CX-3", valor: "CX-3"},
                {id: 3734, nombre: "CX-30", valor: "CX-30"},
                {id: 2740, nombre: "CX-5", valor: "CX-5"},
                {id: 1338, nombre: "CX-9", valor: "CX-9"},
                {id: 1261, nombre: "Demio", valor: "Demio"},
                {id: 4280, nombre: "MX-6", valor: "MX-6"},
                {id: 1608, nombre: "RX-8", valor: "RX-8"},
                {id: 3676, nombre: "Scrum", valor: "Scrum"},
            ],
            49: [
                {id: 2051, nombre: "Bongo", valor: "Bongo"},
                {id: 3763, nombre: "Cadenza", valor: "Cadenza"},
                {id: 101, nombre: "Carens", valor: "Carens"},
                {id: 1924, nombre: "Cerato", valor: "Cerato"},
                {id: 2929, nombre: "Forte", valor: "Forte"},
                {id: 2151, nombre: "K-2700", valor: "K-2700"},
                {id: 3481, nombre: "K-3", valor: "K-3"},
                {id: 2616, nombre: "K-5", valor: "K-5"},
                {id: 2771, nombre: "K-7", valor: "K-7"},
                {id: 4287, nombre: "K-8", valor: "K-8"},
                {id: 2684, nombre: "Lotze", valor: "Lotze"},
                {id: 3183, nombre: "Morning", valor: "Morning"},
                {id: 4190, nombre: "Niro", valor: "Niro"},
                {id: 272, nombre: "Optima", valor: "Optima"},
                {id: 952, nombre: "Picanto", valor: "Picanto"},
                {id: 3260, nombre: "Ray", valor: "Ray"},
                {id: 310, nombre: "Rio", valor: "Rio"},
                {id: 2463, nombre: "Rondo", valor: "Rondo"},
                {id: 2650, nombre: "Sedona", valor: "Sedona"},
                {id: 3746, nombre: "Seltos", valor: "Seltos"},
                {id: 3745, nombre: "Soluto", valor: "Soluto"},
                {id: 3971, nombre: "Sonet", valor: "Sonet"},
                {id: 623, nombre: "Sorento", valor: "Sorento"},
                {id: 1884, nombre: "Soul", valor: "Soul"},
                {id: 1099, nombre: "Spectra", valor: "Spectra"},
                {id: 334, nombre: "Sportage", valor: "Sportage"},
                {id: 4042, nombre: "Telluride", valor: "Telluride"},
            ],
            62: [
                {id: 3960, nombre: "Aviator", valor: "Aviator"},
                {id: 3505, nombre: "Continental", valor: "Continental"},
                {id: 3914, nombre: "Corsair", valor: "Corsair"},
                {id: 3465, nombre: "MKT", valor: "MKT"},
                {id: 1307, nombre: "MKX", valor: "MKX"},
                {id: 4075, nombre: "Nautilus", valor: "Nautilus"},
                {id: 262, nombre: "Navigator", valor: "Navigator"},
            ],
            65: [
                {id: 89, nombre: "Cabezote", valor: "Cabezote"},
                {id: 93, nombre: "Camion", valor: "Camion"},
                {id: 1634, nombre: "CH 613", valor: "CH 613"},
                {id: 1967, nombre: "CH-600", valor: "CH-600"},
                {id: 2784, nombre: "Granite", valor: "Granite"},
                {id: 3245, nombre: "Pinnacle", valor: "Pinnacle"},
                {id: 2055, nombre: "R-600", valor: "R-600"},
                {id: 1441, nombre: "RD", valor: "RD"},
                {id: 644, nombre: "Renault", valor: "Renault"},
                {id: 1545, nombre: "Volteo", valor: "Volteo"},
            ],
            74: [
                {id: 3175, nombre: "T300", valor: "T300"},
            ],
            76: [
                {id: 181, nombre: "Gran Marquis", valor: "Gran Marquis"},
            ],
            82: [
                {id: 4253, nombre: "310", valor: "310"},
                {id: 785, nombre: "Vulcan", valor: "Vulcan"},
            ],
            90: [
                {id: 1029, nombre: "Gallardo", valor: "Gallardo"},
                {id: 3524, nombre: "Urus", valor: "Urus"},
            ],
            103: [
                {id: 2261, nombre: "3", valor: "3"},
                {id: 3348, nombre: "GS", valor: "GS"},
                {id: 4004, nombre: "HS", valor: "HS"},
                {id: 3421, nombre: "Midget", valor: "Midget"},
                {id: 4205, nombre: "RX8", valor: "RX8"},
                {id: 3463, nombre: "ZS", valor: "ZS"},
                {id: 4072, nombre: "ZX", valor: "ZX"},
            ],
            109: [
                {id: 2716, nombre: "MXU", valor: "MXU"},
                {id: 4303, nombre: "UXV", valor: "UXV"},
            ],
            114: [
                {id: 793, nombre: "Cooper", valor: "Cooper"},
            ],
            128: [
                {id: 3653, nombre: "Forklift", valor: "Forklift"},
            ],
            135: [
                {id: 932, nombre: "12,000 Libra", valor: "12,000 Libra"},
                {id: 1937, nombre: "Clark", valor: "Clark"},
            ],
            138: [
                {id: 1767, nombre: "200", valor: "200"},
                {id: 1768, nombre: "250", valor: "250"},
                {id: 4254, nombre: "890", valor: "890"},
                {id: 3599, nombre: "DUKE", valor: "DUKE"},
            ],
            141: [
                {id: 3193, nombre: "Ghibli", valor: "Ghibli"},
                {id: 1598, nombre: "Gran Turismo", valor: "Gran Turismo"},
                {id: 3261, nombre: "Levante", valor: "Levante"},
                {id: 1998, nombre: "Quattroporte", valor: "Quattroporte"},
            ],
            147: [
                {id: 4274, nombre: "310K", valor: "310K"},
                {id: 1621, nombre: "Retro Pala", valor: "Retro Pala"},
            ],
            167: [
                {id: 3742, nombre: "JX1062", valor: "JX1062"},
                {id: 1724, nombre: "Camion", valor: "Camion"},
                {id: 3281, nombre: "JX1041DLA2", valor: "JX1041DLA2"},
                {id: 3632, nombre: "JX1044", valor: "JX1044"},
                {id: 3741, nombre: "N720", valor: "N720"},
                {id: 3633, nombre: "Vigus", valor: "Vigus"},
            ],
            270: [
                {id: 4243, nombre: "Super Nave", valor: "Super Nave"},
            ],
            291: [
                {id: 1941, nombre: "320", valor: "320"},
            ],
            322: [
                {id: 4207, nombre: "C100", valor: "C100"},
                {id: 4209, nombre: "D60", valor: "D60"},
                {id: 4263, nombre: "Euniq 6", valor: "Euniq 6"},
                {id: 4206, nombre: "EV30", valor: "EV30"},
                {id: 3997, nombre: "Genlyon", valor: "Genlyon"},
                {id: 3493, nombre: "T60", valor: "T60"},
                {id: 3423, nombre: "V80 Ambulancia", valor: "V80 Ambulancia"},
            ],
            488: [
                {id: 3143, nombre: "Glastron GS", valor: "Glastron GS"},
                {id: 2865, nombre: "Topaz", valor: "Topaz"},
            ],
            532: [
                {id: 3380, nombre: "570", valor: "570"},
                {id: 3104, nombre: "650", valor: "650"},
                {id: 3391, nombre: "720", valor: "720"},
                {id: 3818, nombre: "GT", valor: "GT"},
            ],
            562: [
                {id: 4267, nombre: "450A", valor: "450A"},
            ],
            622: [
                {id: 3751, nombre: "Pickman", valor: "Pickman"},
            ],
            635: [
                {id: 3860, nombre: "Motocicleta Electrica", valor: "Motocicleta Electrica"},
            ],
            667: [
                {id: 4032, nombre: "Sport", valor: "Sport"},
            ],
            690: [
                {id: 4165, nombre: "Abeja Litio Con Caja", valor: "Abeja Litio Con Caja"},
                {id: 4164, nombre: "City Mantra", valor: "City Mantra"},
            ],
            20: [
                {id: 3392, nombre: "Captur", valor: "Captur"},
                {id: 3242, nombre: "Dokker", valor: "Dokker"},
                {id: 2841, nombre: "Duster", valor: "Duster"},
                {id: 158, nombre: "Express", valor: "Express"},
                {id: 1227, nombre: "Kangoo", valor: "Kangoo"},
                {id: 2460, nombre: "Koleos", valor: "Koleos"},
                {id: 2212, nombre: "Logan", valor: "Logan"},
                {id: 243, nombre: "Megane", valor: "Megane"},
                {id: 4108, nombre: "Oroch", valor: "Oroch"},
                {id: 2281, nombre: "Sandero", valor: "Sandero"},
                {id: 3985, nombre: "Twizy", valor: "Twizy"},
            ],
            22: [
                {id: 161, nombre: "Fabia", valor: "Fabia"},
                {id: 1153, nombre: "Superb", valor: "Superb"},
            ],
            25: [
                {id: 54, nombre: "911", valor: "911"},
                {id: 86, nombre: "Boxster", valor: "Boxster"},
                {id: 710, nombre: "Cayenne", valor: "Cayenne"},
                {id: 1475, nombre: "Cayman", valor: "Cayman"},
                {id: 2864, nombre: "Macan", valor: "Macan"},
                {id: 1666, nombre: "Panamera", valor: "Panamera"},
                {id: 3964, nombre: "Taycan", valor: "Taycan"},
                {id: 4262, nombre: "Taycan GTS", valor: "Taycan GTS"},
            ],
            26: [
                {id: 35, nombre: "4 Runner", valor: "4 Runner"},
                {id: 3452, nombre: "Agya", valor: "Agya"},
                {id: 3717, nombre: "Aqua", valor: "Aqua"},
                {id: 77, nombre: "Avalon", valor: "Avalon"},
                {id: 3409, nombre: "C-HR", valor: "C-HR"},
                {id: 96, nombre: "Camry", valor: "Camry"},
                {id: 106, nombre: "Celica", valor: "Celica"},
                {id: 491, nombre: "Coaster", valor: "Coaster"},
                {id: 4266, nombre: "Coms", valor: "Coms"},
                {id: 122, nombre: "Corolla", valor: "Corolla"},
                {id: 4044, nombre: "Corolla Cross", valor: "Corolla Cross"},
                {id: 1114, nombre: "FJ Cruiser", valor: "FJ Cruiser"},
                {id: 1110, nombre: "Fortuner", valor: "Fortuner"},
                {id: 440, nombre: "Hiace", valor: "Hiace"},
                {id: 419, nombre: "Highlander", valor: "Highlander"},
                {id: 191, nombre: "Hilux", valor: "Hilux"},
                {id: 215, nombre: "Land Cruiser", valor: "Land Cruiser"},
                {id: 216, nombre: "Land Cruiser Prado", valor: "Land Cruiser Prado"},
                {id: 3273, nombre: "Lite-Ace", valor: "Lite-Ace"},
                {id: 428, nombre: "Matrix", valor: "Matrix"},
                {id: 1740, nombre: "Passo", valor: "Passo"},
                {id: 286, nombre: "Pick Up", valor: "Pick Up"},
                {id: 3411, nombre: "Pixis", valor: "Pixis"},
                {id: 1893, nombre: "Prius", valor: "Prius"},
                {id: 3096, nombre: "Probox", valor: "Probox"},
                {id: 2826, nombre: "Ractis", valor: "Ractis"},
                {id: 4114, nombre: "Raize", valor: "Raize"},
                {id: 308, nombre: "RAV4", valor: "RAV4"},
                {id: 3492, nombre: "Rush", valor: "Rush"},
                {id: 1362, nombre: "Scion", valor: "Scion"},
                {id: 410, nombre: "Sequoia", valor: "Sequoia"},
                {id: 329, nombre: "Sienna", valor: "Sienna"},
                {id: 344, nombre: "Supra", valor: "Supra"},
                {id: 345, nombre: "Tacoma", valor: "Tacoma"},
                {id: 1775, nombre: "Town-Ace", valor: "Town-Ace"},
                {id: 404, nombre: "Tundra", valor: "Tundra"},
                {id: 1519, nombre: "Venza", valor: "Venza"},
                {id: 1329, nombre: "VITZ", valor: "VITZ"},
                {id: 388, nombre: "Yaris", valor: "Yaris"},
            ],
            30: [
                {id: 65, nombre: "Alto", valor: "Alto"},
                {id: 1069, nombre: "APV", valor: "APV"},
                {id: 3639, nombre: "Carry", valor: "Carry"},
                {id: 2485, nombre: "Celerio", valor: "Celerio"},
                {id: 3217, nombre: "Ciaz", valor: "Ciaz"},
                {id: 469, nombre: "DRZ", valor: "DRZ"},
                {id: 4066, nombre: "Dzire", valor: "Dzire"},
                {id: 3246, nombre: "Every", valor: "Every"},
                {id: 1639, nombre: "Forenza", valor: "Forenza"},
                {id: 185, nombre: "Grand Vitara", valor: "Grand Vitara"},
                {id: 202, nombre: "Jimny", valor: "Jimny"},
                {id: 3025, nombre: "S-Cross", valor: "S-Cross"},
                {id: 614, nombre: "Swift", valor: "Swift"},
                {id: 1434, nombre: "SX 4", valor: "SX 4"},
                {id: 376, nombre: "Vitara", valor: "Vitara"},
                {id: 2658, nombre: "XL7", valor: "XL7"},
            ],
            38: [
                {id: 1554, nombre: "Soltice", valor: "Soltice"},
                {id: 1118, nombre: "Vibes", valor: "Vibes"},
            ],
            41: [
                {id: 3340, nombre: "2008", valor: "2008"},
                {id: 2473, nombre: "3008", valor: "3008"},
                {id: 3082, nombre: "301", valor: "301"},
                {id: 24, nombre: "307", valor: "307"},
                {id: 3508, nombre: "308", valor: "308"},
                {id: 37, nombre: "406", valor: "406"},
                {id: 1121, nombre: "407", valor: "407"},
                {id: 3426, nombre: "5008", valor: "5008"},
                {id: 45, nombre: "607", valor: "607"},
                {id: 4160, nombre: "E-2008", valor: "E-2008"},
                {id: 4014, nombre: "Landtrek", valor: "Landtrek"},
                {id: 277, nombre: "Partner", valor: "Partner"},
                {id: 3658, nombre: "Rifter", valor: "Rifter"},
            ],
            43: [
                {id: 2050, nombre: "Amarok", valor: "Amarok"},
                {id: 3538, nombre: "Atlas", valor: "Atlas"},
                {id: 82, nombre: "Beetle", valor: "Beetle"},
                {id: 3467, nombre: "Constellation", valor: "Constellation"},
                {id: 4186, nombre: "Delivery 9.170", valor: "Delivery 9.170"},
                {id: 1833, nombre: "Gol", valor: "Gol"},
                {id: 179, nombre: "Golf", valor: "Golf"},
                {id: 201, nombre: "Jetta", valor: "Jetta"},
                {id: 3982, nombre: "Nivus", valor: "Nivus"},
                {id: 279, nombre: "Passat", valor: "Passat"},
                {id: 3735, nombre: "T- Cross", valor: "T- Cross"},
                {id: 4185, nombre: "Taos", valor: "Taos"},
                {id: 4025, nombre: "Teramont", valor: "Teramont"},
                {id: 1486, nombre: "Tiguan", valor: "Tiguan"},
                {id: 691, nombre: "Touareg", valor: "Touareg"},
                {id: 3466, nombre: "Worker", valor: "Worker"},
            ],
            54: [
                {id: 724, nombre: "S60", valor: "S60"},
                {id: 721, nombre: "S80", valor: "S80"},
                {id: 3271, nombre: "S90", valor: "S90"},
                {id: 971, nombre: "V40", valor: "V40"},
                {id: 3480, nombre: "XC40", valor: "XC40"},
                {id: 1934, nombre: "XC60", valor: "XC60"},
                {id: 893, nombre: "XC90", valor: "XC90"},
            ],
            59: [
                {id: 1157, nombre: "Actyon", valor: "Actyon"},
                {id: 309, nombre: "Rexton", valor: "Rexton"},
            ],
            63: [
                {id: 3116, nombre: "BRZ", valor: "BRZ"},
                {id: 4013, nombre: "Crosstrek", valor: "Crosstrek"},
                {id: 406, nombre: "Forester", valor: "Forester"},
                {id: 195, nombre: "Impreza", valor: "Impreza"},
                {id: 219, nombre: "Legacy", valor: "Legacy"},
                {id: 1045, nombre: "Outback", valor: "Outback"},
                {id: 3556, nombre: "Pleo", valor: "Pleo"},
                {id: 3648, nombre: "Sambar", valor: "Sambar"},
                {id: 3107, nombre: "XV", valor: "XV"},
            ],
            69: [
                {id: 1956, nombre: "Deluxe", valor: "Deluxe"},
                {id: 380, nombre: "Grand Voyager", valor: "Grand Voyager"},
            ],
            77: [
                {id: 3572, nombre: "Ateca", valor: "Ateca"},
            ],
            85: [
                {id: 4006, nombre: "242", valor: "242"},
                {id: 4229, nombre: "255X", valor: "255X"},
                {id: 1372, nombre: "Bote", valor: "Bote"},
                {id: 3528, nombre: "Crux", valor: "Crux"},
                {id: 1719, nombre: "FX", valor: "FX"},
                {id: 1817, nombre: "FZ", valor: "FZ"},
                {id: 827, nombre: "Grizzly", valor: "Grizzly"},
                {id: 2493, nombre: "LX-210", valor: "LX-210"},
                {id: 4293, nombre: "R3", valor: "R3"},
                {id: 600, nombre: "Raptor", valor: "Raptor"},
                {id: 4306, nombre: "Tricker", valor: "Tricker"},
                {id: 622, nombre: "V Star", valor: "V Star"},
                {id: 1119, nombre: "YFZ 450 R", valor: "YFZ 450 R"},
                {id: 3222, nombre: "YXZ 1000", valor: "YXZ 1000"},
            ],
            107: [
                {id: 3336, nombre: "SM5", valor: "SM5"},
            ],
            112: [
                {id: 2224, nombre: "Ranger", valor: "Ranger"},
                {id: 2443, nombre: "RZR", valor: "RZR"},
            ],
            146: [
                {id: 1455, nombre: "RXP", valor: "RXP"},
                {id: 2279, nombre: "RXT", valor: "RXT"},
            ],
            149: [
                {id: 2669, nombre: "COASTAL", valor: "COASTAL"},
                {id: 3867, nombre: "Fisherman 262", valor: "Fisherman 262"},
            ],
            185: [
                {id: 2960, nombre: "Camion", valor: "Camion"},
            ],
            260: [
                {id: 4021, nombre: "EF", valor: "EF"},
                {id: 3416, nombre: "Planta Electrica", valor: "Planta Electrica"},
            ],
            261: [
                {id: 3824, nombre: "7 x 14", valor: "7 x 14"},
                {id: 1949, nombre: "Cola", valor: "Cola"},
            ],
            264: [
                {id: 3661, nombre: "Silver Spur", valor: "Silver Spur"},
            ],
            319: [
                {id: 2850, nombre: "Remolque", valor: "Remolque"},
            ],
            320: [
                {id: 4065, nombre: "Acterra", valor: "Acterra"},
            ],
            367: [
                {id: 2295, nombre: "Bote", valor: "Bote"},
            ],
            399: [
                {id: 3453, nombre: "T 30", valor: "T 30"},
                {id: 3456, nombre: "T-20", valor: "T-20"},
                {id: 3457, nombre: "T-20 Cargo Box", valor: "T-20 Cargo Box"},
                {id: 3850, nombre: "T-32", valor: "T-32"},
                {id: 3168, nombre: "X30", valor: "X30"},
            ],
            422: [
                {id: 3402, nombre: "Brabus Forfour", valor: "Brabus Forfour"},
                {id: 2542, nombre: "Passion Fortwo", valor: "Passion Fortwo"},
            ],
            429: [
                {id: 3897, nombre: "Liberty", valor: "Liberty"},
                {id: 3957, nombre: "Porter 1000", valor: "Porter 1000"},
            ],
            436: [
                {id: 3016, nombre: "150 Super", valor: "150 Super"},
                {id: 3906, nombre: "6 Giorni", valor: "6 Giorni"},
                {id: 3905, nombre: "GTS", valor: "GTS"},
                {id: 3726, nombre: "GTV", valor: "GTV"},
                {id: 3959, nombre: "Primavera", valor: "Primavera"},
                {id: 3904, nombre: "Sprint", valor: "Sprint"},
                {id: 3892, nombre: "SXL", valor: "SXL"},
                {id: 3891, nombre: "VXL", valor: "VXL"},
            ],
            450: [
                {id: 2641, nombre: "PG Back", valor: "PG Back"},
            ],
            519: [
                {id: 3913, nombre: "6809HA", valor: "6809HA"},
            ],
            521: [
                {id: 3041, nombre: "Built Buses", valor: "Built Buses"},
            ],
            528: [
                {id: 3983, nombre: "CONTINENTAL GT 650", valor: "CONTINENTAL GT 650"},
                {id: 4001, nombre: "HIMALAYAN", valor: "HIMALAYAN"},
            ],
            542: [
                {id: 4284, nombre: "1200", valor: "1200"},
            ],
            566: [
                {id: 3679, nombre: "Model 3", valor: "Model 3"},
                {id: 3929, nombre: "Model S", valor: "Model S"},
                {id: 3834, nombre: "Model X", valor: "Model X"},
                {id: 3835, nombre: "Model Y", valor: "Model Y"},
            ],
            612: [
                {id: 3706, nombre: "Jupiter", valor: "Jupiter"},
            ],
            618: [
                {id: 3961, nombre: "1000", valor: "1000"},
                {id: 4051, nombre: "1200", valor: "1200"},
                {id: 3973, nombre: "1500", valor: "1500"},
                {id: 4101, nombre: "700", valor: "700"},
                {id: 3718, nombre: "Promaster", valor: "Promaster"},
                {id: 4292, nombre: "REBEL", valor: "REBEL"},
            ],
            630: [
                {id: 3816, nombre: "Motors", valor: "Motors"},
            ],
            632: [
                {id: 3827, nombre: "Utilitario", valor: "Utilitario"},
            ],
            652: [
                {id: 3950, nombre: "LEAD", valor: "LEAD"},
            ],
            659: [
                {id: 4110, nombre: "Terralord", valor: "Terralord"},
                {id: 3990, nombre: "Terralord AT ESC", valor: "Terralord AT ESC"},
            ],
            666: [
                {id: 4031, nombre: "GTS", valor: "GTS"},
            ],
            668: [
                {id: 4038, nombre: "SCOOTER", valor: "SCOOTER"},
            ],
            670: [
                {id: 4228, nombre: "BJ493", valor: "BJ493"},
                {id: 4217, nombre: "C 17", valor: "C 17"},
                {id: 4092, nombre: "C10", valor: "C10"},
                {id: 4130, nombre: "C14", valor: "C14"},
                {id: 4080, nombre: "D 03", valor: "D 03"},
                {id: 4300, nombre: "V-30", valor: "V-30"},
            ],
            671: [
                {id: 4195, nombre: "ET5", valor: "ET5"},
                {id: 4084, nombre: "NJL6601", valor: "NJL6601"},
            ],
            675: [
                {id: 4116, nombre: "Cu", valor: "Cu"},
                {id: 4118, nombre: "TC", valor: "TC"},
                {id: 4120, nombre: "TC PRO", valor: "TC PRO"},
            ],
            678: [
                {id: 4149, nombre: "MENGO", valor: "MENGO"},
            ],
            692: [
                {id: 4181, nombre: "2R6-12", valor: "2R6-12"},
            ],
            694: [
                {id: 4199, nombre: "32 Pies", valor: "32 Pies"},
            ],
            696: [
                {id: 4202, nombre: "F3000", valor: "F3000"},
            ],
            704: [
                {id: 4257, nombre: "Snarler", valor: "Snarler"},
                {id: 4275, nombre: "Villain", valor: "Villain"},
            ]
        }
    }

    res.send({status: "SUCCESS", message: `${entityName} para formularios generada exitosamente.`, data: configuraciones});
};
