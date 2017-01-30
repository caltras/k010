(function(ng){
    ng.module('amigo-secreto.services.pessoa',[])
    .factory("pessoaService",function($resource){
        return $resource('/v1/pessoas/:_id', 
            {
                _id:'@_id'
            },{
                sortear : {method:'GET',isArray:false,url:"/v1/pessoas/sortear"}
            });
    });

})(angular);