(function(ng){
    
    var app = ng.module('amigo-secreto',[
        'ngResource',
        'amigo-secreto.controllers'
    ]);
    
    ng.element(function() {
      ng.bootstrap(document, ['amigo-secreto']);
    });

})(angular);