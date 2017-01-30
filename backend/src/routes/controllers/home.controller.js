var _ = require('koa-route');
module.exports.install = function(app){
    // router.get('/', function (ctx,next){
    //     ctx.body = global.render('index.html');
    // });
    app.use(_.get('/', function *(next){
        this.body = global.render('index.html');
    }));
};