var route = require('koa-route');
var service = global.inject_service("pessoa.service");

var PessoaController = {
    index: function *(next){
        this.body = yield service.list();
    },
    create: function *(next){
        var data = this.request.body;
        this.body = yield service.save(data);
    },
    show: function *(id){
        this.body = yield service.get(id);
    },
    update: function *(id){
        var data = this.request.body;
        this.body = yield service.update(id,data);
    },
    delete : function *(id){
        this.body = yield service.delete(id);
    },
    sortear : function *(){
        this.body = yield service.sortear();
    }
};

module.exports.install = function (app){
    app.use(route.get('/v1/pessoas', PessoaController.index));
    app.use(route.get('/v1/pessoas/sortear', PessoaController.sortear));
    app.use(route.get('/v1/pessoas/:id', PessoaController.show));
    app.use(route.post('/v1/pessoas', PessoaController.create));
    app.use(route.post('/v1/pessoas/:id', PessoaController.update));
    app.use(route.delete('/v1/pessoas/:id', PessoaController.delete));
};