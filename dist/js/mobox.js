/*!
 * mobox 1.0.0
 * MOBOX = Modern Dialog + Pop Box + Overlay + Extensible CSS3 Effects, Inspired by Codrop&#39;s DialogEffect at github.com/codrops/DialogEffects 
 * @dependencies 
 *  1. classy.js <http://faso.me/classy>
 *  2. modernizr
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * built at 1428048949394 
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
            morphDurationOpen: parseInt( el.getAttribute('data-morph-open-duration') || 1500),
            morphDurationClose: parseInt( el.getAttribute('data-morph-close-duration') || 250),
            morphOpenDelay:parseInt( el.getAttribute('data-morph-open-delay') || 0),
            morphCloseDelay:parseInt( el.getAttribute('data-morph-close-delay') || 0),
            morphOpenData:el.getAttribute('data-morph-open')||null,
            morphCloseData:el.getAttribute('data-morph-close')||null,
            morphTag:el.getAttribute('data-morph-tag')||'path',
            morphOpenEffect:el.getAttribute('data-morph-open-effect') || 'elastic',
            morphCloseEffect:el.getAttribute('data-morph-close-effect') || 'easeout',
            sticky:false,
            effect:el.getAttribute('data-effect')||Mobox.defaults.effect,
            effectRel:el.getAttribute('data-effect-rel')||Mobox.defaults.effectRel,
        }, this.options );
		extend( this.options, options );
		this.ctrlClose = this.el.querySelectorAll( '[data-mobox-close]' );
        this.elemsRel = document.querySelectorAll( this.options.effectRel );
        this.effectClass = 'mobox-effect-' + this.options.effect;
        
        toggleClass(this.elemsRel, this.effectClass+'-rel');        

        classy.add(el,this.effectClass );	

        this._initSvg();

        this.isOpen = false;
		this._initEvents();
	}

	Mobox.prototype.options = {
		// callbacks
		onOpen : function() { return false; },
		onClose : function() { return false; }
	};

    Mobox.prototype._initSvg = function(){
        var me = this,
            morphElm = this.el.querySelector('.mobox-morph-shape'),
            svg = morphElm ? morphElm.querySelector('svg') : null;
        if(!svg || !morphElm){
            return;
        }

        if( typeof Snap === 'undefined' ){
            alert("Snap.svg not found! SVG Mobox need Snap.svn to function properly!");
            return;
        }

        var snap = Snap(svg),
            morphTag = this.options.morphTag,
            openMorph = {},
            closeMorph = {},
            morphCloseData = closeMorph[morphTag] = this.options.morphCloseData,
            morphOpenData = openMorph[morphTag] = this.options.morphOpenData;

        this.svg = {
            
            morph:{
                openData:morphOpenData,
                closeData:morphCloseData,
                open: openMorph,
                close:closeMorph,
                target:snap.select(morphTag)
            },
            onOpen:function(inst){

               if( !inst.svg.morph.openData ) return; 
                // animate
                var morph = inst.svg.morph;
                if( inst.options.morphOpenDelay === 0 ){
                    return morph.target.stop().animate( morph.open, inst.options.morphDurationOpen, mina[inst.options.morphOpenEffect] );
                }
                setTimeout(function() {
                    morph.target.stop().animate( morph.open, inst.options.morphDurationOpen, mina[inst.options.morphOpenEffect] );
                }, inst.options.morphOpenDelay );
            },
            onClose : function( inst ) {

                if( !inst.svg.morph.closeData ) return;

                var morph = inst.svg.morph;
                if( inst.options.morphCloseDelay === 0 ){
                    return morph.target.stop().animate( morph.close, inst.options.morphDurationClose, mina[inst.options.morphCloseEffect] );
                }
                
                setTimeout(function() {
                    morph.target.stop().animate( morph.close, inst.options.morphDurationClose, mina[inst.options.morphCloseEffect] );
                }, inst.options.morphCloseDelay );
                
            }
        };   

         

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

        if( this.svg ) {
            this.svg.onOpen( this ); 
        }

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

        // svg
        if( this.svg ) {
            this.svg.onClose(this);
        }

        this.isOpen = false;
    };

	Mobox.prototype.toggle = function() {
		if( this.isOpen ) {
		    return this.hide();	
		}
        return this.show();
    };
    
    Mobox.defaults = {
        effect:'lv',
        effectRel:'body',
        svgEffects:['dg','panther','lava','anna']
    };

    Mobox.isSvgEffect = function( eff ){
        var items = Mobox.defaults.svgEffects,
            len = items.length,
            ret = false;

        for(var i=0; i<len; i++ ){
            if( eff === items[i] ) {
                ret = true;
                break;
            }
        }
        return ret;
    };

	// add to global namespace
	return Mobox;

}));
