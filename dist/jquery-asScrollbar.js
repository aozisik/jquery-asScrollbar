/**
* jQuery Scrollbar
* a jquery plugin
* Compiled: Fri Aug 12 2016 10:57:05 GMT+0800 (CST)
* @version v0.4.0
* @link https://github.com/amazingSurge/jquery-asScrollbar
* @copyright LGPL-3.0
*/
(function(global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'jQuery'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('jQuery'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.jQuery);
    global.jqueryAsScrollbar = mod.exports;
  }
})(this,

  function(exports, _jQuery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _jQuery2 = _interopRequireDefault(_jQuery);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ?

      function(obj) {
        return typeof obj;
      }
      :

      function(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
      };

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;

          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);

        if (staticProps)
          defineProperties(Constructor, staticProps);

        return Constructor;
      };
    }();

    var defaults = {
      namespace: 'asScrollbar',

      skin: null,
      handleSelector: null,
      handleTemplate: '<div class="{{handle}}"></div>',

      barClass: null,
      handleClass: null,

      disabledClass: 'is-disabled',
      draggingClass: 'is-dragging',
      hoveringClass: 'is-hovering',

      direction: 'vertical',

      barLength: null,
      handleLength: null,

      minHandleLength: 30,
      maxHandleLength: null,

      mouseDrag: true,
      touchDrag: true,
      pointerDrag: true,
      clickMove: true,
      clickMoveStep: 0.3, // 0 - 1
      mousewheel: true,
      mousewheelSpeed: 50,

      keyboard: true,

      useCssTransforms3d: true,
      useCssTransforms: true,
      useCssTransitions: true,

      duration: '500',
      easing: 'ease' // linear, ease-in, ease-out, ease-in-out
    };

    var easingBezier = function easingBezier(mX1, mY1, mX2, mY2) {
      'use strict';

      var a = function a(aA1, aA2) {
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
      };

      var b = function b(aA1, aA2) {
        return 3.0 * aA2 - 6.0 * aA1;
      };

      var c = function c(aA1) {
        return 3.0 * aA1;
      };

      // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
      var calcBezier = function calcBezier(aT, aA1, aA2) {
        return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
      };

      // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
      var getSlope = function getSlope(aT, aA1, aA2) {
        return 3.0 * a(aA1, aA2) * aT * aT + 2.0 * b(aA1, aA2) * aT + c(aA1);
      };

      var getTForX = function getTForX(aX) {
        // Newton raphson iteration
        var aGuessT = aX;

        for (var i = 0; i < 4; ++i) {
          var currentSlope = getSlope(aGuessT, mX1, mX2);

          if (currentSlope === 0.0) {

            return aGuessT;
          }
          var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
          aGuessT -= currentX / currentSlope;
        }

        return aGuessT;
      };

      if (mX1 === mY1 && mX2 === mY2) {

        return {
          css: 'linear',
          fn: function fn(aX) {
            return aX;
          }
        };
      }

      return {
        css: 'cubic-bezier(' + mX1 + ',' + mY1 + ',' + mX2 + ',' + mY2 + ')',
        fn: function fn(aX) {
          return calcBezier(getTForX(aX), mY1, mY2);
        }
      };
    };

    /**
     * Helper functions
     **/
    var isPercentage = function isPercentage(n) {
      'use strict';

      return typeof n === 'string' && n.indexOf('%') !== -1;
    };

    var convertPercentageToFloat = function convertPercentageToFloat(n) {
      'use strict';

      return parseFloat(n.slice(0, -1) / 100, 10);
    };

    var convertMatrixToArray = function convertMatrixToArray(value) {
      'use strict';

      if (value && value.substr(0, 6) === 'matrix') {

        return value.replace(/^.*\((.*)\)$/g, '$1').replace(/px/g, '').split(/, +/);
      }

      return false;
    };

    var support = {};

    (function(support) {
      /**
       * Borrowed from Owl carousel
       **/
      'use strict';

      var events = {
          transition: {
            end: {
              WebkitTransition: 'webkitTransitionEnd',
              MozTransition: 'transitionend',
              OTransition: 'oTransitionEnd',
              transition: 'transitionend'
            }
          },
          animation: {
            end: {
              WebkitAnimation: 'webkitAnimationEnd',
              MozAnimation: 'animationend',
              OAnimation: 'oAnimationEnd',
              animation: 'animationend'
            }
          }
        },
        prefixes = ['webkit', 'Moz', 'O', 'ms'],
        style = (0, _jQuery2.default)('<support>').get(0).style,
        tests = {
          csstransforms: function csstransforms() {
            return Boolean(test('transform'));
          },
          csstransforms3d: function csstransforms3d() {
            return Boolean(test('perspective'));
          },
          csstransitions: function csstransitions() {
            return Boolean(test('transition'));
          },
          cssanimations: function cssanimations() {
            return Boolean(test('animation'));
          }
        };

      var test = function test(property, prefixed) {
        var result = false,
          upper = property.charAt(0).toUpperCase() + property.slice(1);

        if (style[property] !== undefined) {
          result = property;
        }

        if (!result) {
          _jQuery2.default.each(prefixes,

            function(i, prefix) {
              if (style[prefix + upper] !== undefined) {
                result = '-' + prefix.toLowerCase() + '-' + upper;

                return false;
              }

              return true;
            }
          );
        }

        if (prefixed) {

          return result;
        }

        if (result) {

          return true;
        }

        return false;
      };

      var prefixed = function prefixed(property) {
        return test(property, true);
      };

      if (tests.csstransitions()) {
        /* jshint -W053 */
        support.transition = new String(prefixed('transition'));
        support.transition.end = events.transition.end[support.transition];
      }

      if (tests.cssanimations()) {
        /* jshint -W053 */
        support.animation = new String(prefixed('animation'));
        support.animation.end = events.animation.end[support.animation];
      }

      if (tests.csstransforms()) {
        /* jshint -W053 */
        support.transform = new String(prefixed('transform'));
        support.transform3d = tests.csstransforms3d();
      }

      if ('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch) {
        support.touch = true;
      } else {
        support.touch = false;
      }

      if (window.PointerEvent || window.MSPointerEvent) {
        support.pointer = true;
      } else {
        support.pointer = false;
      }

      support.prefixPointerEvent = function(pointerEvent) {
        var charStart = 9,
          subStart = 10;

        return window.MSPointerEvent ? 'MSPointer' + pointerEvent.charAt(charStart).toUpperCase() + pointerEvent.substr(subStart) : pointerEvent;
      }
      ;
    })(support);

    var NAME = 'asScrollbar';

    /**
     * Animation Frame
     **/

    if (!Date.now) {
      Date.now = function() {
        'use strict';

        return new Date().getTime();
      }
      ;
    }

    var getTime = function getTime() {
      'use strict';

      if (typeof window.performance !== 'undefined' && window.performance.now) {

        return window.performance.now();
      }

      return Date.now();
    };

    var vendors = ['webkit', 'moz'];

    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }

    if (/iP(ad|hone|od).*OS (6|7|8)/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      (function() {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
          'use strict';

          var now = getTime();
          var timePlus = 16;
          var nextTime = Math.max(lastTime + timePlus, now);

          return setTimeout(

            function() {
              callback(lastTime = nextTime);
            }
            , nextTime - now);
        }
        ;
        window.cancelAnimationFrame = clearTimeout;
      })();
    }

    /**
     * Plugin constructor
     **/

    var asScrollbar = function() {
      function asScrollbar(options, bar) {
        _classCallCheck(this, asScrollbar);

        this.$bar = (0, _jQuery2.default)(bar);
        options = this.options = _jQuery2.default.extend({}, defaults, options || {}, this.$bar.data('options') || {});
        bar.direction = this.options.direction;

        this.classes = {
          directionClass: options.namespace + '-' + options.direction,
          barClass: options.barClass ? options.barClass : options.namespace,
          handleClass: options.handleClass ? options.handleClass : options.namespace + '-handle'
        };

        if (this.options.direction === 'vertical') {
          this.attributes = {
            axis: 'Y',
            position: 'top',
            length: 'height',
            clientLength: 'clientHeight'
          };
        } else if (this.options.direction === 'horizontal') {
          this.attributes = {
            axis: 'X',
            position: 'left',
            length: 'width',
            clientLength: 'clientWidth'
          };
        }

        // Current state information.
        this._states = {};

        // Current state information for the drag operation.
        this._drag = {
          time: null,
          pointer: null
        };

        // Current timeout
        this._frameId = null;

        // Current handle position
        this.handlePosition = 0;

        this.easing = asScrollbar.easing[this.options.easing] || asScrollbar.easing.ease;

        this.init();
      }

      _createClass(asScrollbar, [{
        key: 'init',
        value: function init() {
          var options = this.options;

          this.$handle = this.$bar.find(this.options.handleSelector);

          if (this.$handle.length === 0) {
            this.$handle = (0, _jQuery2.default)(options.handleTemplate.replace(/\{\{handle\}\}/g, this.classes.handleClass)).appendTo(this.$bar);
          } else {
            this.$handle.addClass(this.classes.handleClass);
          }

          this.$bar.addClass(this.classes.barClass).addClass(this.classes.directionClass).attr('draggable', false);

          if (options.skin) {
            this.$bar.addClass(options.skin);
          }

          if (options.barLength !== null) {
            this.setBarLength(options.barLength);
          }

          if (options.handleLength !== null) {
            this.setHandleLength(options.handleLength);
          }

          this.updateLength();

          this.bindEvents();
        }
      }, {
        key: 'trigger',
        value: function trigger(eventType) {
          var _ref;

          for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
          }

          var data = (_ref = [this]).concat.apply(_ref, params);

          // event
          this.$bar.trigger(NAME + '::' + eventType, data);

          // callback
          eventType = eventType.replace(/\b\w+\b/g,

            function(word) {
              return word.substring(0, 1).toUpperCase() + word.substring(1);
            }
          );
          var onFunction = 'on' + eventType;

          if (typeof this.options[onFunction] === 'function') {
            var _options$onFunction;

            (_options$onFunction = this.options[onFunction]).apply.apply(_options$onFunction, [this].concat(params));
          }
        }
      }, {
        key: 'is',
        value: function is(state) {
          return this._states[state] && this._states[state] > 0;
        }
      }, {
        key: 'enter',
        value: function enter(state) {
          if (this._states[state] === undefined) {
            this._states[state] = 0;
          }

          this._states[state]++;
        }
      }, {
        key: 'leave',
        value: function leave(state) {
          this._states[state]--;
        }
      }, {
        key: 'eventName',
        value: function eventName(events) {
          if (typeof events !== 'string' || events === '') {

            return '.' + this.options.namespace;
          }
          events = events.split(' ');

          var length = events.length;

          for (var _i = 0; _i < length; _i++) {
            events[_i] = events[_i] + '.' + this.options.namespace;
          }

          return events.join(' ');
        }
      }, {
        key: 'bindEvents',
        value: function bindEvents() {
          var _this = this;

          if (this.options.mouseDrag) {
            this.$handle.on(this.eventName('mousedown'), _jQuery2.default.proxy(this.onDragStart, this));
            this.$handle.on(this.eventName('dragstart selectstart'),

              function() {
                return false;
              }
            );
          }

          if (this.options.touchDrag && support.touch) {
            this.$handle.on(this.eventName('touchstart'), _jQuery2.default.proxy(this.onDragStart, this));
            this.$handle.on(this.eventName('touchcancel'), _jQuery2.default.proxy(this.onDragEnd, this));
          }

          if (this.options.pointerDrag && support.pointer) {
            this.$handle.on(this.eventName(support.prefixPointerEvent('pointerdown')), _jQuery2.default.proxy(this.onDragStart, this));
            this.$handle.on(this.eventName(support.prefixPointerEvent('pointercancel')), _jQuery2.default.proxy(this.onDragEnd, this));
          }

          if (this.options.clickMove) {
            this.$bar.on(this.eventName('mousedown'), _jQuery2.default.proxy(this.onClick, this));
          }

          if (this.options.mousewheel) {
            this.$bar.on(this.eventName('mousewheel'),

              function(e, delta) {
                var offset = _this.getHandlePosition();

                if (offset <= 0 && delta > 0) {

                  return true;
                } else if (offset >= _this.barLength && delta < 0) {

                  return true;
                }
                offset -= _this.options.mousewheelSpeed * delta;

                _this.move(offset, true);

                return false;
              }
            );
          }

          this.$bar.on(this.eventName('mouseenter'),

            function() {
              _this.$bar.addClass(_this.options.hoveringClass);
              _this.enter('hovering');
              _this.trigger('hover');
            }
          );

          this.$bar.on(this.eventName('mouseleave'),

            function() {
              _this.$bar.removeClass(_this.options.hoveringClass);

              if (!_this.is('hovering')) {

                return;
              }
              _this.leave('hovering');
              _this.trigger('hovered');
            }
          );

          if (this.options.keyboard) {
            (0, _jQuery2.default)(document).on(this.eventName('keydown'),

              function(e) {
                if (e.isDefaultPrevented && e.isDefaultPrevented()) {

                  return;
                }

                if (!_this.is('hovering')) {

                  return;
                }
                var activeElement = document.activeElement;
                // go deeper if element is a webcomponent
                while (activeElement.shadowRoot) {
                  activeElement = activeElement.shadowRoot.activeElement;
                }

                if ((0, _jQuery2.default)(activeElement).is(':input,select,option,[contenteditable]')) {

                  return;
                }
                var by = 0,
                  to = null;

                var down = 40,
                  end = 35,
                  home = 36,
                  left = 37,
                  pageDown = 34,
                  pageUp = 33,
                  right = 39,
                  spaceBar = 32,
                  up = 38;

                var webkitDown = 63233,
                  webkitEnd = 63275,
                  webkitHome = 63273,
                  webkitLeft = 63234,
                  webkitPageDown = 63277,
                  webkitPageUp = 63276,
                  webkitRight = 63235,
                  webkitUp = 63232;

                switch (e.which) {
                  case left: // left
                  case webkitUp:
                    by = -30;
                    break;
                  case up: // up
                  case webkitDown:
                    by = -30;
                    break;
                  case right: // right
                  case webkitLeft:
                    by = 30;
                    break;
                  case down: // down
                  case webkitRight:
                    by = 30;
                    break;
                  case pageUp: // page up
                  case webkitPageUp:
                    by = -90;
                    break;
                  case spaceBar: // space bar
                  case pageDown: // page down
                  case webkitPageDown:
                    by = -90;
                    break;
                  case end: // end
                  case webkitEnd:
                    to = '100%';
                    break;
                  case home: // home
                  case webkitHome:
                    to = 0;
                    break;
                  default:

                    return;
                }

                if (by || to !== null) {

                  if (by) {
                    _this.moveBy(by, true);
                  } else if (to !== null) {
                    _this.moveTo(to, true);
                  }
                  e.preventDefault();
                }
              }
            );
          }
        }
      }, {
        key: 'onClick',
        value: function onClick(event) {
          var num = 3;

          if (event.which === num) {

            return;
          }

          if (event.target === this.$handle[0]) {

            return;
          }

          this._drag.time = new Date().getTime();
          this._drag.pointer = this.pointer(event);

          var offset = this.$handle.offset();
          var distance = this.distance({
              x: offset.left,
              y: offset.top
            }, this._drag.pointer),
            factor = 1;

          if (distance > 0) {
            distance -= this.handleLength;
          } else {
            distance = Math.abs(distance);
            factor = -1;
          }

          if (distance > this.barLength * this.options.clickMoveStep) {
            distance = this.barLength * this.options.clickMoveStep;
          }
          this.moveBy(factor * distance, true);
        }
      }, {
        key: 'onDragStart',
        value: function onDragStart(event) {
          var _this2 = this;

          var num = 3;

          if (event.which === num) {

            return;
          }

          // this.$bar.toggleClass(this.options.draggingClass, event.type === 'mousedown');
          this.$bar.addClass(this.options.draggingClass);

          this._drag.time = new Date().getTime();
          this._drag.pointer = this.pointer(event);

          var callback = function callback() {
            _this2.enter('dragging');
            _this2.trigger('drag');
          };

          if (this.options.mouseDrag) {
            (0, _jQuery2.default)(document).on(this.eventName('mouseup'), _jQuery2.default.proxy(this.onDragEnd, this));

            (0, _jQuery2.default)(document).one(this.eventName('mousemove'), _jQuery2.default.proxy(

              function() {
                (0, _jQuery2.default)(document).on(_this2.eventName('mousemove'), _jQuery2.default.proxy(_this2.onDragMove, _this2));

                callback();
              }
              , this));
          }

          if (this.options.touchDrag && support.touch) {
            (0, _jQuery2.default)(document).on(this.eventName('touchend'), _jQuery2.default.proxy(this.onDragEnd, this));

            (0, _jQuery2.default)(document).one(this.eventName('touchmove'), _jQuery2.default.proxy(

              function() {
                (0, _jQuery2.default)(document).on(_this2.eventName('touchmove'), _jQuery2.default.proxy(_this2.onDragMove, _this2));

                callback();
              }
              , this));
          }

          if (this.options.pointerDrag && support.pointer) {
            (0, _jQuery2.default)(document).on(this.eventName(support.prefixPointerEvent('pointerup')), _jQuery2.default.proxy(this.onDragEnd, this));

            (0, _jQuery2.default)(document).one(this.eventName(support.prefixPointerEvent('pointermove')), _jQuery2.default.proxy(

              function() {
                (0, _jQuery2.default)(document).on(_this2.eventName(support.prefixPointerEvent('pointermove')), _jQuery2.default.proxy(_this2.onDragMove, _this2));

                callback();
              }
              , this));
          }

          (0, _jQuery2.default)(document).on(this.eventName('blur'), _jQuery2.default.proxy(this.onDragEnd, this));
        }
      }, {
        key: 'onDragMove',
        value: function onDragMove(event) {
          var distance = this.distance(this._drag.pointer, this.pointer(event));

          if (!this.is('dragging')) {

            return;
          }

          event.preventDefault();
          this.moveBy(distance, true);
        }
      }, {
        key: 'onDragEnd',
        value: function onDragEnd() {
          (0, _jQuery2.default)(document).off(this.eventName('mousemove mouseup touchmove touchend pointermove pointerup MSPointerMove MSPointerUp blur'));

          this.$bar.removeClass(this.options.draggingClass);
          this.handlePosition = this.getHandlePosition();

          if (!this.is('dragging')) {

            return;
          }

          this.leave('dragging');
          this.trigger('dragged');
        }
      }, {
        key: 'pointer',
        value: function pointer(event) {
          var result = {
            x: null,
            y: null
          };

          event = event.originalEvent || event || window.event;

          event = event.touches && event.touches.length ? event.touches[0] : event.changedTouches && event.changedTouches.length ? event.changedTouches[0] : event;

          if (event.pageX) {
            result.x = event.pageX;
            result.y = event.pageY;
          } else {
            result.x = event.clientX;
            result.y = event.clientY;
          }

          return result;
        }
      }, {
        key: 'distance',
        value: function distance(first, second) {
          if (this.options.direction === 'vertical') {

            return second.y - first.y;
          }

          return second.x - first.x;
        }
      }, {
        key: 'setBarLength',
        value: function setBarLength(length, update) {
          if (typeof length !== 'undefined') {
            this.$bar.css(this.attributes.length, length);
          }

          if (update !== false) {
            this.updateLength();
          }
        }
      }, {
        key: 'setHandleLength',
        value: function setHandleLength(length, update) {
          if (typeof length !== 'undefined') {

            if (length < this.options.minHandleLength) {
              length = this.options.minHandleLength;
            } else if (this.options.maxHandleLength && length > this.options.maxHandleLength) {
              length = this.options.maxHandleLength;
            }
            this.$handle.css(this.attributes.length, length);

            if (update !== false) {
              this.updateLength(length);
            }
          }
        }
      }, {
        key: 'updateLength',
        value: function updateLength(length, barLength) {
          if (typeof length !== 'undefined') {
            this.handleLength = length;
          } else {
            this.handleLength = this.getHandleLenght();
          }

          if (typeof barLength !== 'undefined') {
            this.barLength = barLength;
          } else {
            this.barLength = this.getBarLength();
          }
        }
      }, {
        key: 'getBarLength',
        value: function getBarLength() {
          return this.$bar[0][this.attributes.clientLength];
        }
      }, {
        key: 'getHandleLenght',
        value: function getHandleLenght() {
          return this.$handle[0][this.attributes.clientLength];
        }
      }, {
        key: 'getHandlePosition',
        value: function getHandlePosition() {
          var value = void 0;

          if (this.options.useCssTransforms && support.transform) {
            value = convertMatrixToArray(this.$handle.css(support.transform));

            if (!value) {

              return 0;
            }

            if (this.attributes.axis === 'X') {
              value = value[12] || value[4];
            } else {
              value = value[13] || value[5];
            }
          } else {
            value = this.$handle.css(this.attributes.position);
          }

          return parseFloat(value.replace('px', ''));
        }
      }, {
        key: 'makeHandlePositionStyle',
        value: function makeHandlePositionStyle(value) {
          var property = void 0,
            x = '0',
            y = '0';

          if (this.options.useCssTransforms && support.transform) {

            if (this.attributes.axis === 'X') {
              x = value + 'px';
            } else {
              y = value + 'px';
            }

            property = support.transform.toString();

            if (this.options.useCssTransforms3d && support.transform3d) {
              value = 'translate3d(' + x + ',' + y + ',0)';
            } else {
              value = 'translate(' + x + ',' + y + ')';
            }
          } else {
            property = this.attributes.position;
          }
          var temp = {};
          temp[property] = value;

          return temp;
        }
      }, {
        key: 'setHandlePosition',
        value: function setHandlePosition(value) {
          var style = this.makeHandlePositionStyle(value);
          this.$handle.css(style);

          if (!this.is('dragging')) {
            this.handlePosition = parseFloat(value);
          }
        }
      }, {
        key: 'moveTo',
        value: function moveTo(value, trigger, sync) {
          var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

          if (type === 'string') {

            if (isPercentage(value)) {
              value = convertPercentageToFloat(value) * (this.barLength - this.handleLength);
            }

            value = parseFloat(value);
            type = 'number';
          }

          if (type !== 'number') {

            return;
          }

          this.move(value, trigger, sync);
        }
      }, {
        key: 'moveBy',
        value: function moveBy(value, trigger, sync) {
          var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

          if (type === 'string') {

            if (isPercentage(value)) {
              value = convertPercentageToFloat(value) * (this.barLength - this.handleLength);
            }

            value = parseFloat(value);
            type = 'number';
          }

          if (type !== 'number') {

            return;
          }

          this.move(this.handlePosition + value, trigger, sync);
        }
      }, {
        key: 'move',
        value: function move(value, trigger, sync) {
          if (typeof value !== 'number' || this.is('disabled')) {

            return;
          }

          if (value < 0) {
            value = 0;
          } else if (value + this.handleLength > this.barLength) {
            value = this.barLength - this.handleLength;
          }

          if (!this.is('dragging') && sync !== true) {
            this.doMove(value, this.options.duration, this.options.easing, trigger);
          } else {
            this.setHandlePosition(value);

            if (trigger) {
              this.trigger('change', value / (this.barLength - this.handleLength));
            }
          }
        }
      }, {
        key: 'doMove',
        value: function doMove(value, duration, easing, trigger) {
          var _this3 = this;

          var property = void 0;
          this.enter('moving');
          duration = duration ? duration : this.options.duration;
          easing = easing ? easing : this.options.easing;

          var style = this.makeHandlePositionStyle(value);

          for (property in style) {

            if ({}.hasOwnProperty.call(style, property)) {
              break;
            }
          }

          if (this.options.useCssTransitions && support.transition) {
            this.enter('transition');
            this.prepareTransition(property, duration, easing);

            this.$handle.one(support.transition.end,

              function() {
                _this3.$handle.css(support.transition, '');

                if (trigger) {
                  _this3.trigger('change', value / (_this3.barLength - _this3.handleLength));
                }
                _this3.leave('transition');
                _this3.leave('moving');
              }
            );

            this.setHandlePosition(value);
          } else {
            (function() {
              _this3.enter('animating');

              var startTime = getTime();
              var start = _this3.getHandlePosition();
              var end = value;

              var run = function run(time) {
                var percent = (time - startTime) / _this3.options.duration;

                if (percent > 1) {
                  percent = 1;
                }

                percent = _this3.easing.fn(percent);
                var scale = 10;
                var current = parseFloat(start + percent * (end - start), scale);
                _this3.setHandlePosition(current);

                if (trigger) {
                  _this3.trigger('change', current / (_this3.barLength - _this3.handleLength));
                }

                if (percent === 1) {
                  window.cancelAnimationFrame(_this3._frameId);
                  _this3._frameId = null;

                  _this3.leave('animating');
                  _this3.leave('moving');
                } else {
                  _this3._frameId = window.requestAnimationFrame(run);
                }
              };

              _this3._frameId = window.requestAnimationFrame(run);
            })();
          }
        }
      }, {
        key: 'prepareTransition',
        value: function prepareTransition(property, duration, easing, delay) {
          var temp = [];

          if (property) {
            temp.push(property);
          }

          if (duration) {

            if (_jQuery2.default.isNumeric(duration)) {
              duration = duration + 'ms';
            }
            temp.push(duration);
          }

          if (easing) {
            temp.push(easing);
          } else {
            temp.push(this.easing.css);
          }

          if (delay) {
            temp.push(delay);
          }
          this.$handle.css(support.transition, temp.join(' '));
        }
      }, {
        key: 'enable',
        value: function enable() {
          this._states.disabled = 0;

          this.$bar.removeClass(this.options.disabledClass);
        }
      }, {
        key: 'disable',
        value: function disable() {
          this._states.disabled = 1;

          this.$bar.addClass(this.options.disabledClass);
        }
      }, {
        key: 'destory',
        value: function destory() {
          this.$bar.on(this.eventName());
        }
      }], [{
        key: '_jQueryInterface',
        value: function _jQueryInterface(options) {
          'use strict';

          for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          if (typeof options === 'string') {

            return this.each(

              function() {
                var instance = (0, _jQuery2.default)(this).data(NAME);

                if (!instance) {

                  return false;
                }

                if (!_jQuery2.default.isFunction(instance[options]) || options.charAt(0) === '_') {

                  return false;
                }
                // apply method

                return instance[options].apply(instance, args);
              }
            );
          }

          return this.each(

            function() {
              if (!(0, _jQuery2.default)(this).data(NAME)) {
                (0, _jQuery2.default)(this).data(NAME, new asScrollbar(options, this));
              }
            }
          );
        }
      }]);

      return asScrollbar;
    }();

    asScrollbar.support = support;

    _jQuery2.default.extend(asScrollbar.easing = {}, {
      ease: easingBezier(0.25, 0.1, 0.25, 1.0),
      linear: easingBezier(0.00, 0.0, 1.00, 1.0),
      'ease-in': easingBezier(0.42, 0.0, 1.00, 1.0),
      'ease-out': easingBezier(0.00, 0.0, 0.58, 1.0),
      'ease-in-out': easingBezier(0.42, 0.0, 0.58, 1.0)
    });

    _jQuery2.default.fn[NAME] = asScrollbar._jQueryInterface;
    _jQuery2.default.fn[NAME].constructor = asScrollbar;
    _jQuery2.default.fn[NAME].noConflict = function() {
      'use strict';

      _jQuery2.default.fn[NAME] = window.JQUERY_NO_CONFLICT;

      return asScrollbar._jQueryInterface;
    }
    ;

    exports.default = asScrollbar;
  }
);