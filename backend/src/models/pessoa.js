var Schema = require('mongoose').Schema;
var ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id          : ObjectId,
    nome        : String,
    email       : String,
    amigo       : Schema.Types.Mixed
});