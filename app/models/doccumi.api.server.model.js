var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ApiSchema = new Schema({
    client          : {type: String, index: true},
    type            : {type: String, index: true},
    key             : {type: String, index: true},
    valid_until     : {type: Date, index: true},
    date_created    : {type: Date, default: Date.now},
    date_updated    : {type: Date, default: Date.now},
    isActive        : {type: Boolean, default: true}
});

mongoose.model('Api', ApiSchema);