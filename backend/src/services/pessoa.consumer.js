const mongoose = require('mongoose');
const _ = require('lodash');
const config = global.app_require('backend/src/config.js');
const amqplib = require('amqplib');
var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(config.MAILGUN_API);
var PessoaSchema = global.app_require("backend/src/models/pessoa");
var Pessoa = mongoose.model('Pessoa', PessoaSchema);

var PessoaConsumer = function(url, q) {
    var self = this;
    self.receiver;
    var priv = {
        processaSorteio: function(pessoas) {
            try {
                priv.saveAll(pessoas);
                priv.enviarEmail(pessoas);
            }
            catch (e) {
                console.log(e);
            }
        },
        enviarEmail: function(pessoas) {
            _.each(pessoas, function(p) {
                var email = p.email;
                var amigo = p.amigo;
                if (amigo) {
                    try {
                        mg.sendText(email, [p.nome + ' <' + p.email + '>'],
                            'K010 - Amigo Secreto',
                            'O seu amigo secreto é :' + amigo.nome + ' <' + amigo.email + '>',
                            'noreply@amigosecreto.com', {},
                            function(err) {
                                if (err) {
                                    console.log('Oh noes: ' + err);
                                }
                                else {
                                    console.log('Success');
                                }
                            });
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            });
        },
        saveAll: function(pessoas) {
            _.each(pessoas, function(p) {
                try {
                    Pessoa.findOne({
                        _id: p._id
                    }, function(err, doc) {
                        if (!err) {
                            doc.amigo = p.amigo;
                            doc.markModified('amigo');
                            doc.save();
                        }
                        else {
                            console.log(err);
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                }
            });
        }
    };

    self.init = function() {
        self.receiver = amqplib.connect(url);
        return self;
    };
    self.startListen = function() {
        self.addEventListener();
    };
    self.addEventListener = function() {
        self.receiver.then(function(conn) {
            return conn.createChannel();
        }).then(function(ch) {
            return ch.assertQueue(q).then(function(ok) {
                return ch.consume(q, function(msg){
                    self.onMessage(ch,msg);
                });
            });
        }).catch(self.onError);
        return self;
    };
    self.onMessage = function(ch, msg) {
        if (msg !== null && msg !== undefined) {
            priv.processaSorteio(JSON.parse(msg.content));
            ch.ack(msg);
        }
    };
    self.onError = function(err) {
        console.log("Não foi possível conectar na fila");
        console.log(url);
        console.warn(err);
    };
    self.init();
};
module.exports = PessoaConsumer;