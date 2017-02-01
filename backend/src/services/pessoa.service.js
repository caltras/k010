const mongoose = require('mongoose');
const _ = require('lodash');
const config = global.app_require('backend/src/config.js');
var PessoaSchema = global.app_require("backend/src/models/pessoa");
var Pessoa = mongoose.model('Pessoa', PessoaSchema);
var url_QUEUE = config.CLOUDAMQP_URL;

var PessoaConsumer = require('./pessoa.consumer');
var PessoaPublisher = require('./pessoa.publisher');

var consumer = new PessoaConsumer(url_QUEUE, config.QUEUE_PESSOA_UPDATE);
var publisher = new PessoaPublisher(url_QUEUE, config.QUEUE_PESSOA_UPDATE);

consumer.startListen();

module.exports = {
    save: function*(data) {
        var pessoa = new Pessoa();

        pessoa.nome = data.nome;
        pessoa.email = data.email;

        return yield pessoa.save();
    },
    update: function*(id, data) {
        var changes = {
            $set: {
                nome: data.nome,
                email: data.email
            }
        };

        if (data.amigo) {
            changes.$set.amigo = data.amigo;
        }
        return yield Pessoa.update({
            _id: id
        }, changes);
    },
    delete: function*(id) {
        return yield Pessoa.findByIdAndRemove(id).exec();
    },
    get: function*(id) {
        return yield Pessoa.findById(id).exec();
    },
    list: function*() {
        return yield Pessoa.find({}).exec();
    },
    sortear: function*() {
        var pessoas = yield Pessoa.find({}).exec();
        var pessoasSemAmigos = _.map(pessoas, function(p) {
            return p._id.toString();
        });
        _.each(pessoas, function(p, i) {
            var sorteados = _.filter(pessoasSemAmigos, function(v) {
                return v.toString() !== p._id.toString();
            });
            var amigo = _.sample(sorteados);
            if (amigo) {
                var modelAmigo = _.find(pessoas, function(v) {
                    if (v._id.toString() === amigo) {
                        return v._doc;
                    }
                    else {
                        return false;
                    }
                });
                if(modelAmigo){
                    p.amigo = {
                        "_id": modelAmigo._id,
                        "nome": modelAmigo.nome,
                        "email": modelAmigo.email
                    };
                    _.remove(pessoasSemAmigos, function(v) {
                        return v === amigo.toString();
                    });
                }
            }
        });
        publisher.sendMessage(pessoas);

        return "Sorteado";
    }
};