global.path = '../'; //__dirname;
global.app_require = (path) => require(global.path + '/' + path);
global.inject_service = (service) => require(global.path + '/backend/src/services/' + service);
global.controller = (ctrl) => require(global.path + '/backend/src/routes/controllers/' + ctrl);

require('mocha-generators').install();

var mongooseMock = require('mongoose-mock'),
    proxyquire = require('proxyquire'),
    chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require("sinon-chai");

var proxyquireStrict = require('proxyquire').noCallThru();

var assert = require('assert');
var fakeAmqp = require("exp-fake-amqplib");
var amqplib = require('amqplib');
amqplib.connect = fakeAmqp.connect;

chai.use(sinonChai);

describe('Teste para Serviço de Pessoa', function() {

    var service;
    beforeEach(function() {

        var amqplib = {
            channel: function() {
                return new Promise(function(resolveCreate) {
                    resolveCreate({
                        assertQueue: function() {
                            return new Promise(function(resolveAssert) {
                                resolveAssert(true);
                            });
                        },
                        consume: function(q, callback) {
                            callback();
                        },
                        sendToQueue: function(q, data) {

                        }
                    });
                });
            },
            connect: function() {
                return new Promise(function(resolve) {
                    resolve({
                        createChannel: amqplib.channel
                    });
                });
            }
        };
        var mongooseStub = {
            model: function() {
                return {
                    find: function(query, callback) {
                        if (callback) {
                            callback();
                        }
                        else {
                            return {
                                exec: function() {
                                    return [{
                                        _id: 1,
                                        _doc : {
                                            _id: 1,
                                            nome: 'teste',
                                            email: 'teste@teste.com.br'
                                        }
                                    },
                                    {
                                        _id: 2,
                                        _doc : {
                                            _id: 2,
                                            nome: 'teste2',
                                            email: 'teste2@teste2.com.br'
                                        }
                                    }];
                                }
                            }
                        }
                    },
                    findById: function(id) {
                        return {
                            exec: function() {
                                return {
                                    _id: 1,
                                    nome: 'teste',
                                    email: 'teste@teste.com.br'
                                };
                            }
                        };
                    },
                    findByIdAndRemove: function(id) {
                        return {
                            exec: function() {
                                return {
                                    _id: 1,
                                    nome: 'teste',
                                    email: 'teste@teste.com.br'
                                };
                            }
                        };
                    },
                    delte: function(id) {
                        return {
                            exec: function() {
                                return {
                                    _id: 1,
                                    nome: 'teste',
                                    email: 'teste@teste.com.br'
                                };
                            }
                        };
                    }
                };
            }
        };

        var consumerStub = proxyquireStrict('../backend/src/services/pessoa.consumer', {
            'mongoose': mongooseMock,
            'amqplib': amqplib,
            'mailgun': {
                Mailgun: function() {}
            }
        });
        service = proxyquire('../backend/src/services/pessoa.service.js', {
            'mongoose': mongooseStub,
            './pessoa.consumer': consumerStub,
            './pessoa.publisher': function() {
                var self = this;
                self.sendMessage = function() {

                };
            }
        });
    });
    describe('get function', function() {

        it('deve retornar uma pessoa', function() {
            var p = service.get(1).next();
            assert(p.value, "Não pode ser nulo");
        });
        it('deve retornar uma lista de pessoas', function() {
            var p = service.list().next();
            assert(p.value instanceof Array, "Não é um array");
            assert(p.value.length > 0, "Não pode estar vazia");
        });
        it('deve deletar uma pessoa e retornar o objeto deletado', function() {
            var p = service.delete(1).next();
            assert(p.value, "Não pode ser nulo");
        });
        it('deve sortear os amigos e retornar uma mensagem de "Sorteado"', function*() {
            var msg = yield service.sortear();
            assert(msg==="Sorteado", "Erro ao retornar mensagem de sorteio");
        });
    });
});