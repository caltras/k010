module.exports.configure = function(app){

    global.controller('home.controller').install(app);
    global.controller('pessoa.controller').install(app);

};