const mongoose = require('mongoose');
const _ = require('lodash');
const config = global.app_require('backend/src/config.js');
const amqplib=require('amqplib');
var PessoaSchema = global.app_require("backend/src/models/pessoa");
var Pessoa = mongoose.model('Pessoa', PessoaSchema);
var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(config.MAILGUN_API);

var url_QUEUE = config.CLOUDAMQP_URL;
var queue = config.QUEUE_PESSOA_UPDATE;

var openPublisher = amqplib.connect(url_QUEUE);
var openReceiver = amqplib.connect(url_QUEUE);

openReceiver.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(queue).then(function(ok) {
    return ch.consume(queue, function(msg) {
      if (msg !== null) {
        processaSorteio(JSON.parse(msg.content));
        ch.ack(msg);
      }
    });
  });
}).catch(console.warn);

var processaSorteio = function(pessoas){
  saveAll(pessoas);
  enviarEmail(pessoas);
};
var enviarEmail = function(pessoas){
    _.each(pessoas,function(p){
        var email = p.email;
        var amigo = p.amigo;
        if(amigo){
            mg.sendText(email, [p.nome+' <'+p.email+'>'],
              'K010 - Amigo Secreto',
              'O seu amigo secreto é :'+amigo.nome+' <'+amigo.email+'>',
              'noreply@amigosecreto.com', {},
              function(err) {
                if (err) console.log('Oh noes: ' + err);
                else     console.log('Success');
            });
        }
    });
};
var saveAll = function(pessoas){
    _.each(pessoas,function(p){
        Pessoa.findOne({ _id: p._id }, function (err, doc){
            if(!err){
                doc.amigo = p.amigo;
                doc.markModified('amigo');
                doc.save();
            }
        });
    });
};

module.exports = {
    save : function *(data){
        var pessoa = new Pessoa();

        pessoa.nome = data.nome;
        pessoa.email = data.email;
        
        return yield pessoa.save();
    },
    update : function *(id, data){
        var changes = { $set: { nome: data.nome, email: data.email }};
        
        if(data.amigo){
            changes.$set.amigo = data.amigo;
        }
        return yield Pessoa.update({ _id: id }, changes);
    },
    delete : function *(id){
       return yield Pessoa.findByIdAndRemove(id).exec(); 
    },
    get : function *(id){
        return yield Pessoa.findById(id).exec();
    },
    list : function *(){
       return yield Pessoa.find({}).exec(); 
    },
    sortear : function *(){
        var pessoas = yield Pessoa.find({}).exec();
        var pessoasSemAmigos = _.map(pessoas,function(p){ 
            return p._id.toString();
        });
        _.each(pessoas,function(p,i){
            var sorteados = _.filter(pessoasSemAmigos,function(v){
                return v.toString() !== p._id.toString();
            });
            var amigo = _.sample(sorteados);
            if(amigo){
                var modelAmigo = _.find(pessoas,function(v){
                    if(v._id.toString() === amigo){
                        return v._doc;
                    }else{
                        return false;
                    }
                });
                p.amigo = {"_id":modelAmigo._id, "nome":modelAmigo.nome,"email":modelAmigo.email};
                _.remove(pessoasSemAmigos,function(v){
                    return v === amigo.toString();
                });
            }
        });
        openPublisher.then(function(conn) {
          return conn.createChannel();
        }).then(function(ch) {
          return ch.assertQueue(queue).then(function(ok) {
            return ch.sendToQueue(queue, new Buffer(JSON.stringify(pessoas)));
          });
        }).catch(console.warn);
        
        this.body="Sorteado";
    }
};