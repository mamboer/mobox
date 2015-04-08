/*!
 * {{name}} {{version}}
 * {{description}} 
 * @dependencies 
 *  1. classy.js <http://faso.me/classy>
 *  2. modernizr
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * built at {{date()}} 
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
		ids = 1,
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
			} else {
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

    function validDom(dom, tagName){
        return (dom && dom.tagName && dom.nodeName && dom.nodeType === 1 && ( !tagName ? true: (tagName === dom.tagName) ) );    
    }

    function getDom(dom,tagName){
        if(!dom) return null;
        if(typeof(dom)==='string'){
            return document.getElementById(dom);    
        }
        if(validDom( dom, tagName )){
            return dom;
        }
        return null;
    }

    function getDomByTpl(tpl){
        var  tempDiv = document.createElement('div'),
            dynamicDom = false;
        // a template script dom element was passed in
        if( validDom( tpl,'SCRIPT' ) ){
            tempDiv.innerHTML = tpl.innerHTML;
        } else if( typeof(tpl)==='string' ){ 
            if( tpl.indexOf('<')!==-1 && tpl.indexOf('>')!==-1 ){
                tempDiv.innerHTML = tpl;
            } else if( (tpl = document.getElementById(tpl)) ) {
                tempDiv.innerHTML = tpl.innerHTML;
            } else {
                tempDiv = null;
            }
        } else {
            tempDiv = null;    
        }    

        if(!tempDiv || !tempDiv.children[0]){
            return null;    
        }
        
        tempDiv = tempDiv.children[0];
        if(!tempDiv.id){
            dynamicDom = true;
            tempDiv.id = 'mobox-'+(ids++);
        }
        //insert it to the dom
        document.body.appendChild(tempDiv);

        return ({
            dynamic:dynamicDom,
            dom:tempDiv
        });

    }
    function applyDataToDoms(doms,data){
    
        forEach(doms,function(dom){
            //attributes data
            if( typeof(data) === 'object' && data.attrs ){
                for(var d1 in data.attrs){
                    dom.setAttribute( d1, data.attrs[d1] );    
                }
                return;
            }
            //normal data
            if( dom.tagName === 'INPUT' &&  (dom.type === 'checkbox' || dom.type === 'radio') ){
                dom.checked = !!data;  
            } else if(typeof(dom.value) !== 'undefined'){
                dom.value = data;    
            }else if( typeof(dom.innerHTML) !== 'undefined'){
                dom.innerHTML = data;    
            }           
        });

    }
    // apply data to dom
    function applyData(dom, data){
        var tempElems,tempElemData;
        //prepare data
        for(var d in data){
            tempElems = dom.querySelectorAll('.mobox-'+d);
            tempElemData = data[d];
            if(tempElems.length > 0){
                applyDataToDoms(tempElems, tempElemData);
            }
            tempElems = dom.querySelectorAll('[data-'+d+']');

            if(tempElems.length === 0) continue;
            applyDataToDoms(tempElems, tempElemData);
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
            actions:{
                btnIdXXX:function(obj){
                    //this reference to the Mobox instance
                    //obj.el contains the action elements
                }    
            },
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
        this._initScenes();
	}

    Mobox.prototype.destroy = function(){
        this.el.parentNode.removeChild(this.el);
    };
    /**
     * default options
     */
	Mobox.prototype.options = {
        sticky:false,
        clScene:'mobox-scene',
        clSceneActive:'mobox-scene-active',
        destroyAfterClosed:false,
        /**
         * callback for opening
         */
		onOpen : function() { return false; },
        /**
         * callback after being opened while the animation has been finished
         */
        onOpened: function() { return false; },
        /**
         * callback for closing
         */
		onClose : function() { return false; },
        /**
         * callback after being closed while the animation has been finished
         */
        onClosed: function() { return false;}
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

    Mobox.prototype._initScenes = function(){
    
        this.scenes = this.el.querySelectorAll('.'+this.options.clScene);
        
    };

    Mobox.prototype.showScene = function(sceneName,data){
        data = data || {};
        var me = this,targetScene,tempElem, tempElemData;
        sceneName = this.options.clScene + '-'+ (sceneName || 'default');
        forEach(this.scenes,function(scene){
            classy.remove(scene,me.options.clSceneActive);
            if( classy.has(scene,sceneName) && !targetScene ){
                targetScene = scene;    
            }
        });

        if(!targetScene) return;

        applyData(targetScene, data);
        classy.add(targetScene,me.options.clSceneActive);

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

        //element actions
        for(var actionKey in this.options.actions){
            var elem = document.getElementById(actionKey) || this.el.querySelector(actionKey) || this.el.querySelector('[data-mobox-'+ actionKey +']'),
                action = this.options.actions[actionKey],
                actionFun = action.evtName ? action.func:action;
                evtName = action.evtName || 'click';
            if(!elem) continue;

            (function(obj){
                obj.el.addEventListener(obj.evtName,function(evt){
                
                    obj.action.call(self,obj);

                });    
            })({
                el:elem,
                evtName:evtName,
                actionKey:actionKey,
                action:actionFun
            });
            
            
        }
    };

    Mobox.prototype.show = function(data){
        data = this.options.data = (data || {});
        var self = this;
        applyData(this.el,data);

        if(this.isOpen) {
            return this;
        }

        classy.add( this.el, 'mobox-open' );
        toggleClass( this.elemsRel, this.effectClass + '-open' );
        
        onEndAnimation( this.el.querySelector( '.mobox-inner' ), function() {
            self.options.onOpened(self);
        } );

        // callback on open
		this.options.onOpen( this );

        if( this.svg ) {
            this.svg.onOpen( this ); 
        }

        this.isOpen = true;
        return this;
    };

    Mobox.prototype.hide = function(){

        var self = this;
        if(!this.isOpen) return;
        classy.remove( this.el, 'mobox-open' );
        toggleClass(this.elemsRel, this.effectClass + '-open' );
        classy.add( self.el, 'mobox-close' );
        
        // callback on close
        this.options.onClose( this );

        // svg
        if( this.svg ) {
            this.svg.onClose(this);
        }
        
        onEndAnimation( this.el.querySelector( '.mobox-inner' ), function() {
            classy.remove( self.el, 'mobox-close' );
            if(self.options.destroyAfterClosed){
                self.destroy();    
            }
            self.options.onClosed( self );
        } );
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

    /**
     * create a specified mobox
     * @param {object} opts options, like {'tpl':'template id or template dom element', 'dom':'dom id or dom element object'}
     * @return {Mobox} the mobox instance
     */
    Mobox.create = function(opts){
        opts = opts || {};

        if(typeof( opts.autoShow ) === 'undefined' ){
            opts.autoShow = true;    
        }

        var dom = opts.dom,
            tpl = opts.tpl,
            tempDiv = null,
            inst = null;
        //a valid dom element or dom id was passed in
        dom = getDom(dom);
        delete opts.dom;
        delete opts.tpl;
        if( dom ){
            inst = new Mobox(dom, opts);
            return ( opts.autoShow ? inst.show() : inst );
        } 
        dom = getDomByTpl(tpl);
        // invalid dom or tpl
        if( !dom ) {
            alert('Invalid parameters! The parameter "options" must contain a property named either "dom" or "tpl"! ');
            return null;
        }

        opts.destroyAfterClosed = dom.dynamic;
        inst = new Mobox(dom.dom, opts);
        return ( opts.autoShow ? inst.show() : inst );

    };    

	// add to global namespace
	return Mobox;

}));
