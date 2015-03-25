/*!
 * classy 1.0.0
 * Classy.JS - A library agnostic, DOM element classes management utility
 * @Author Levin Van <github.com/mamboer> 
 */
/*jshint browser: true, strict: true, undef: true */
/*global define: false */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( factory );
    } else {
        // Browser globals
        root.classy = factory();
    }
}(this, function () {

    'use strict';

    // helper functions
    function classReg( className ) {
        return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
    }

    function splitChar( className ) {
        return className.indexOf( api.splitChar );   
    }

    function empty( c ) {
        return (c === '');
    }

    function splitCharTask ( str, task ) {
        if( !splitChar( str ) ) { 
            task(str);
            return str;
        }
        str = str.split( api.splitChar );
        var len = str.length,
            str1 = [];
        for( var i = 0; i < len; i++ ){
            if( empty( str[i] ) ) continue;
            str1.push( str[i] );
            task( str[i] );
        }
        return str1.join( api.splitChar );
    }

    function prefixCharTask ( elem, prefix, task ){
        var classes = elem.className.split(" "),
            len = classes.length,
            classes1 = [],
            classes2 = [];

        for(var i = 0; i<len; i++ ){

            if( classes[i] === '' ) continue;

            if( classes[i].indexOf(prefix) !== 0){
                classes1.push( classes[i] );
            } else {
                classes2.push( classes[i] );
            }

        }

        return task(classes1/* classes stay in */, classes2/* classes to be removed */);

    }

    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    var hasClass, addClass, removeClass, removeByPrefix, len;

    if ( 'classList' in document.documentElement ) {
        hasClass = function( elem, c ) {
            return elem.classList.contains( c );
        };
        addClass = function( elem, c ) {

            return splitCharTask( c, function( cName ) {
                elem.classList.add(cName);
            });
            
        };
        removeClass = function( elem, c ) {

            return splitCharTask( c, function( cName ){
                elem.classList.remove( cName );
            });            
        };

        removeByPrefix = function( elem, prefix ) {

            return prefixCharTask(elem, prefix ,function( stayClasses, removedClasses ){
                removeClass( elem, removedClasses.join( api.splitChar ) );
                return removedClasses.join( api.splitChar );
            });       

        };
    }
    else {
        hasClass = function( elem, c ) {
            return classReg( c ).test( elem.className );
        };
        addClass = function( elem, c ) {
            
            return splitCharTask( c, function(cName){
                if ( !hasClass( elem, cName ) ) {
                    elem.className = elem.className + ' ' + cName;
                }
            });            

            
        };
        removeClass = function( elem, c ) {
            return removeByPrefix(elem, c);
        };
        
        removeByPrefix = function(elem,prefix){
            return prefixCharTask(elem, prefix ,function( stayClasses, removedClasses ){
                elem.className = stayClasses.join(' ');
                return removedClasses.join( api.splitChar );
            }); 
        };


    }

    function toggleClass( elem, c ) {
        splitCharTask( c, function(cName){
            var fn = hasClass( elem, cName ) ? removeClass : addClass;
            fn( elem, cName );
        });
    }

    var api = {
        splitChar:' ',
        has: hasClass,
        add: addClass,
        remove: removeClass,
        removeByPrefix:removeByPrefix,
        toggle: toggleClass
    };

    return api;

}));
