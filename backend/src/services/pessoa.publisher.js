const amqplib = require('amqplib');

var PessoaPublisher = function(url, q) {
    var self = this;
    self.publisher;
    self.init = function() {
        self.publisher = amqplib.connect(url);
        return self;
    };
    self.sendMessage = function(object) {
        self.publisher.then(function(conn) {
            return conn.createChannel();
        }).then(function(ch) {
            return ch.assertQueue(q).then(function(ok) {
                return ch.sendToQueue(q, new Buffer(JSON.stringify(object)));
            });
        }).catch(self.onError);

        return self;
    };
    self.onError = function(err) {
        console.log("Não foi possível conectar na fila");
        console.log(url);
        console.warn(err);
    };
    self.init();
};
module.exports = PessoaPublisher;