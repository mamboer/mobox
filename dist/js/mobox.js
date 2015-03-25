/*!
 * mobox 1.0.0
 * MOBOX = Modern Dialog + Pop Box + Overlay + Extensible CSS3 Effects, Inspired by Codrop&#39;s DialogEffect at github.com/codrops/DialogEffects 
 * @dependencies 
 *  1. classy.js <http://faso.me/classy>
 *  2. modernizr
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * built at 1427302236723 
 * Copyright 2015, FASO.ME <http://www.faso.me>
 */
(function (root, factory) {
    if (typeof exports === 'object'){
        module.exports = factory(require('./classy'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['classy'], factory );
    } else {
        // Browser globals
        root.Mobox = factory(root.classy);
    }
}(this, function (classy) {

	var support = { animations : Modernizr.cssanimations },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		onEndAnimation = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.animations ) {
					if( ev.target != this ) return;
					this.removeEventListener( animEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			if( support.animations ) {
				el.addEventListener( animEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		};

    function toggleClass( elems, cls){

        forEach(elems,function(elem){
            classy.toggle(elem,cls);
        });
    }

    function forEach(arr,fn){
        var len = arr.length;
        for(var i =0;i<len;i++ ){
            fn(arr[i]);
        }
    }


	/**
	 * extend obj function
	 */
	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}
    function Mobox( el, options ) {
		this.el = el;
		this.options = extend( {
            sticky:false,
            effect:el.getAttribute('data-effect')||'susan',
            effectRel:el.getAttribute('data-effect-rel')||'body',
        }, this.options );
		extend( this.options, options );
		this.ctrlClose = this.el.querySelectorAll( '[data-dialog-close]' );
        this.elemsRel = document.querySelectorAll( this.options.effectRel );
        this.effectClass = 'mobox-effect-' + this.options.effect;

        toggleClass(this.elemsRel, this.effectClass+'-rel');        

        classy.add(el,this.effectClass );	

        this.isOpen = false;
		this._initEvents();
	}

	Mobox.prototype.options = {
		// callbacks
		onOpen : function() { return false; },
		onClose : function() { return false; }
	};

	Mobox.prototype._initEvents = function() {
		var self = this;

		// close action
		forEach(this.ctrlClose,function(ctr){
            ctr.addEventListener( 'click', self.hide.bind(self) );
        });

		// esc key closes dialog
		document.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which;
			if( keyCode === 27 && self.isOpen ) {
				self.hide();
			}
		} );

        if( !this.options.sticky ){
		    this.el.querySelector( '.mobox-overlay' ).addEventListener( 'click', this.hide.bind(this) );
	    }
    };

    Mobox.prototype.show = function(){
        var self = this;
        if(this.isOpen) return;

        classy.add( this.el, 'mobox-open' );
        toggleClass( this.elemsRel, this.effectClass + '-open' );
		// callback on open
		this.options.onOpen( this );

        this.isOpen = true;

    };

    Mobox.prototype.hide = function(){

        var self = this;
        if(!this.isOpen) return;
        classy.remove( this.el, 'mobox-open' );
        toggleClass(this.elemsRel, this.effectClass + '-open' );
        classy.add( self.el, 'mobox-close' );
        
        onEndAnimation( this.el.querySelector( '.mobox-inner' ), function() {
            classy.remove( self.el, 'mobox-close' );
        } );

        // callback on close
        this.options.onClose( this );

        this.isOpen = false;
    };

	Mobox.prototype.toggle = function() {
		if( this.isOpen ) {
		    return this.hide();	
		}
        return this.show();
    };
	// add to global namespace
	return Mobox;

}));
