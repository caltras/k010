(function(ng){
    
    var IndexController =function(){
        var pub = this;
        pub.title = "Amigo secreto";
    };
    
    ng.module('amigo-secreto.controllers',[
        'amigo-secreto.controllers.pessoa',
        'amigo-secreto.services.pessoa'
    ])
        .controller("indexController",IndexController);

})(angular);