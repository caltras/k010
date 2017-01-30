const config = require('./config');
const Koa = require('koa');
var static_files = require('koa-static');
const compress = require('koa-compress');
const bouncer = require('koa-bouncer');
var bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
 
function Application(cfg){
    var self = this;
    self.config = cfg;
    self.app;
    var configure = function(){
        
        global.app_require = (path) => require(global.path + '/' + path);
        global.inject_service = (service) => require(global.path + '/backend/src/services/' + service);
        global.controller = (ctrl) => require(global.path + '/backend/src/routes/controllers/' + ctrl);
        
        
        global.render = (view) => {
            const fs = require('fs');
            return fs.readFileSync(global.path+"/frontend/"+view,"UTF-8");
        };
        
        mongoose.connect(self.config.MONGO_URL);
        
        self.app = new Koa();
        
        self.app.use(bodyParser());
        self.app.use(bouncer.middleware());
        self.app.use(static_files(global.path + '/frontend/static'));

        // Compression middleware.
        self.app.use(compress({
            threshold: 2048,
            flush: require('zlib').Z_SYNC_FLUSH
        }));

        // Log middleware.
        self.app.use(function* (next){
            var ctx = this;
            var start = new Date;
            yield next;
            var ms = new Date - start;
            console.log('%s %s - %s', ctx.method, ctx.url, ms);
        });
        
        // Error middleware.
        self.app.use(function* (next) {
            var ctx = this;
            try {
                yield next;
            } catch (err) {
                console.log(err);
        
                // Validation errors.
                if (err instanceof bouncer.ValidationError) {
                    err.status = 400;
                }
        
                ctx.status = err.status || 500;
                if (ctx.status != 500) {
                    ctx.body = {
                        message: err.message
                    };
                }
            }
        });
        require('./routes/routing').configure(self.app);
    };
    self.run  = function(){
        configure();
        return self.app.listen(self.config.PORT, () => {
            console.log('Listening on port %s. ENV: %s', self.config.PORT, self.config.NODE_ENV);
        });
    };
}
module.exports = new Application(config);