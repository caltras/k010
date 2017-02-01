var _ = require('koa-route');
module.exports.install = function(app){
    app.use(_.get('/', function *(next){
        this.body = global.render('index.html');
    }));
};