
// requestAnimationFrame polyfill from https://github.com/darius/requestAnimationFrame
if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    'use strict';
    
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

var snowFall = (function(){
    function jSnow(){
        var defaults = {
                flakeCount : 35,
                flakeColor : '#ffffff',
                flakeIndex: 999999,
                flakePosition: 'absolute',
                minSize : 1,
                maxSize : 2,
                minSpeed : 1,
                maxSpeed : 5,
                round : false,
                shadow : false,
                collection : false,
                image : false,
                collectionHeight : 40
            },
            flakes = [],
            element = {},
            elHeight = 0,
            elWidth = 0,
            widthOffset = 0,
            snowTimeout = 0,
            extend = function(obj, extObj){
                for(var i in extObj){
                    if(obj.hasOwnProperty(i)){
                        obj[i] = extObj[i];
                    }
                }
            },
            transform = function (el, styles){
                el.style.webkitTransform = styles;
                el.style.MozTransform = styles;
                el.style.msTransform = styles;
                el.style.OTransform = styles;
                el.style.transform = styles;
            },
            random = function random(min, max){
                return Math.round(min + Math.random()*(max-min)); 
            },
            setStyle = function(element, props)
            {
                for (var property in props){
                    element.style[property] = props[property] + ((property == 'width' || property == 'height') ? 'px' : '');
                }
            },
            flake = function(_el, _size, _speed)
            {
                this.x  = random(widthOffset, elWidth - widthOffset);
                this.y  = random(0, elHeight);
                this.size = _size;
                this.speed = _speed;
                this.step = 0;
                this.stepSize = random(1,10) / 100;

                if(defaults.collection){
                    this.target = canvasCollection[random(0,canvasCollection.length-1)];
                }
                
                var flakeObj = null;
                
                if(defaults.image){
                    flakeObj = new Image();
                    flakeObj.src = defaults.image;
                }else{
                    flakeObj = document.createElement('div');
                    setStyle(flakeObj, {'background' : defaults.flakeColor});
                }
                
                flakeObj.className = 'snowfall-flakes';
                setStyle(flakeObj, {'width' : this.size, 'height' : this.size, 'position' : defaults.flakePosition, 'top' : 0, 'left' : 0, 'will-change': 'transform', 'fontSize' : 0, 'zIndex' : defaults.flakeIndex});
                if(defaults.round){
                    setStyle(flakeObj,{'-moz-border-radius' : ~~(defaults.maxSize) + 'px', '-webkit-border-radius' : ~~(defaults.maxSize) + 'px', 'borderRadius' : ~~(defaults.maxSize) + 'px'});
                }
                if(defaults.shadow){
                    setStyle(flakeObj,{'-moz-box-shadow' : '1px 1px 1px #555', '-webkit-box-shadow' : '1px 1px 1px #555', 'boxShadow' : '1px 1px 1px #555'});
                }

                if(_el.tagName === document.body.tagName){
                    document.body.appendChild(flakeObj);
                }else{
                    _el.appendChild(flakeObj);
                }

                
                this.element = flakeObj;
                this.update = function(){
                    this.y += this.speed;

                    if(this.y > elHeight - (this.size  + 6)){
                        this.reset();
                    }

                    transform(this.element, 'translateY('+this.y+'px) translateX('+this.x+'px)');

                    this.step += this.stepSize;
                    this.x += Math.cos(this.step);
                    
                    if(this.x + this.size > elWidth - widthOffset || this.x < widthOffset){
                        this.reset();
                    }
                }
                this.reset = function(){
                    this.y = 0;
                    this.x = random(widthOffset, elWidth - widthOffset);
                    this.stepSize = random(1,10) / 100;
                    this.size = random((defaults.minSize * 100), (defaults.maxSize * 100)) / 100;
                    this.element.style.width = this.size + 'px';
                    this.element.style.height = this.size + 'px';
                    this.speed = random(defaults.minSpeed, defaults.maxSpeed);
                }
            },
            animateSnow = function(){
                for(var i = 0; i < flakes.length; i += 1){
                    flakes[i].update();
                }
                snowTimeout = requestAnimationFrame(function(){animateSnow()});
            }
        return{
            snow : function(_element, _options){
                extend(defaults, _options);
                element = _element;
                elHeight = element.offsetHeight;
                elWidth = element.offsetWidth;

                element.snow = this;
                if(element.tagName.toLowerCase() === 'body'){
                    widthOffset = 25;
                }
                window.addEventListener('resize', function(){
                    elHeight = element.clientHeight;
                    elWidth = element.offsetWidth;
                }, true);
                
                // initialize the flakes
                for(i = 0; i < defaults.flakeCount; i+=1){
                    flakes.push(new flake(element, random((defaults.minSize * 100), (defaults.maxSize * 100)) / 100, random(defaults.minSpeed, defaults.maxSpeed)));
                }
                animateSnow();
            },
            clear : function(){
                var flakeChildren = null;

                if(!element.getElementsByClassName){
                    flakeChildren = element.querySelectorAll('.snowfall-flakes');
                }else{
                    flakeChildren = element.getElementsByClassName('snowfall-flakes');
                }

                var flakeChilLen = flakeChildren.length;
                while(flakeChilLen--){
                    if(flakeChildren[flakeChilLen].parentNode === element){
                        element.removeChild(flakeChildren[flakeChilLen]);
                    }
                }

                cancelAnimationFrame(snowTimeout);
            }
        }
    };
    return{
        snow : function(elements, options){
            if(typeof(options) == 'string'){
                if(elements.length > 0){
                    for(var i = 0; i < elements.length; i++){
                        if(elements[i].snow){
                            elements[i].snow.clear();
                        }
                    }
                }else{
                    elements.snow.clear();
                }
            }else{
                if(elements.length > 0){
                    for(var i = 0; i < elements.length; i++){
                        new jSnow().snow(elements[i], options);
                    }
                }else{
                    new jSnow().snow(elements, options);
                }
            }
        }
    }
})();
