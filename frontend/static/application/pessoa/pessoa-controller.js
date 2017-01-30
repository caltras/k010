(function(ng){
    var PessoaController = function($scope,pessoaService,$window,$log){
        var pub = this;
        var pri = {};
        pub.form = {};
        pub.pessoas = [];
        
        pri.carregarPessoas = function(){
            pub.pessoas = pessoaService.query();
        };
        pri.init = function(){
           pri.carregarPessoas();
        };
        
        pub.salvar = function(){
            pessoaService.save(pub.form,function(){
                pri.carregarPessoas();
                pub.limpar();
                pub.disabledSubmit=false;
            });
        };
        pub.editar = function(id){
            pessoaService.get({_id: id},function(p){
               pub.form =  p;
            });
        };
        pub.deletar = function(id){
            if($window.confirm("Deseja excluir essa pessoa?")){
                pessoaService.delete({_id : id},function(){
                   pri.carregarPessoas();
                });
            }
        };
        pub.limpar = function(){
            pub.form = {};
        };
        pub.sortear = function(){
            pub.processing = true;
            pessoaService.sortear(function(){
                pri.carregarPessoas();
                pub.processing=false;
                $window.alert('Amigos sorteados. Um e-mail será enviado para os amigos.');
            },function(error){
                $log.error(error);
                $window.alert('Erro ao tentar sorte o amigo secreto.');
            });
        };
        pri.init();
    };
    ng.module('amigo-secreto.controllers.pessoa',[])
    .controller("pessoaController",PessoaController);

})(angular);