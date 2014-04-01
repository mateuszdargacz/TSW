/*jshint globalstrict: true devel: true */
'use strict';

var defFun = function(fun, types){
    fun.typeConstr = types;
    return fun;
};

var myFun = defFun(function (a, b) {
    return a + b;
}, ['number', 'number']);


var compare_lists = function arraysEqual(args, types) {
    if(args.length !== types.length)
        throw({ typerr: "bad amount of arguments" });
    for(var i = args.length; i--;) {
        if(typeof(args[i]) !== types[i])
            return false;
    }
    return true;
};

function appFun(f){
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    if(f.typeConstr.length > 0 && compare_lists(args, f.typeConstr))
        return f.apply(this,args);
    else
        throw({typerr: "bad args"})
}
