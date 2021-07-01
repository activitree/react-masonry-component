"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _react = _interopRequireWildcard(require("react"));

var _elementResizeDetector = _interopRequireDefault(require("element-resize-detector"));

var _lodash = _interopRequireDefault(require("lodash.debounce"));

var _lodash2 = _interopRequireDefault(require("lodash.omit"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var isBrowser = typeof window !== 'undefined';
var Masonry = isBrowser ? window.Masonry || require('masonry-layout') : null;
var imagesloaded = isBrowser ? require('imagesloaded') : null;

var MasonryComponent = /*#__PURE__*/function (_Component) {
  (0, _inherits2.default)(MasonryComponent, _Component);

  var _super = _createSuper(MasonryComponent);

  function MasonryComponent(props) {
    var _this;

    (0, _classCallCheck2.default)(this, MasonryComponent);
    _this = _super.call(this, props);
    _this.masonry = false;
    _this.erd = undefined;
    _this.latestKnownDomChildren = [];
    _this.imagesLoadedCancelRef = undefined;
    _this.masonryContainer = undefined;
    _this.initializeMasonry = _this.initializeMasonry.bind((0, _assertThisInitialized2.default)(_this));
    _this.getCurrentDomChildren = _this.getCurrentDomChildren.bind((0, _assertThisInitialized2.default)(_this));
    _this.diffDomChildren = _this.diffDomChildren.bind((0, _assertThisInitialized2.default)(_this));
    _this.performLayout = _this.performLayout.bind((0, _assertThisInitialized2.default)(_this));
    _this.derefImagesLoaded = _this.derefImagesLoaded.bind((0, _assertThisInitialized2.default)(_this));
    _this.imagesLoaded = _this.imagesLoaded.bind((0, _assertThisInitialized2.default)(_this));
    _this.reloadLayout = _this.reloadLayout.bind((0, _assertThisInitialized2.default)(_this));
    _this.initializeResizableChildren = _this.initializeResizableChildren.bind((0, _assertThisInitialized2.default)(_this));
    _this.listenToElementResize = _this.listenToElementResize.bind((0, _assertThisInitialized2.default)(_this));
    _this.destroyErd = _this.destroyErd.bind((0, _assertThisInitialized2.default)(_this));
    return _this;
  }

  (0, _createClass2.default)(MasonryComponent, [{
    key: "initializeMasonry",
    value: function initializeMasonry(force) {
      if (!this.masonry || force) {
        this.masonry = new Masonry(this.masonryContainer, this.props.options);

        if (this.props.onLayoutComplete) {
          this.masonry.on('layoutComplete', this.props.onLayoutComplete);
        }

        if (this.props.onRemoveComplete) {
          this.masonry.on('removeComplete', this.props.onRemoveComplete);
        }

        this.latestKnownDomChildren = this.getCurrentDomChildren();
      }
    }
  }, {
    key: "getCurrentDomChildren",
    value: function getCurrentDomChildren() {
      var node = this.masonryContainer;
      var children = this.props.options.itemSelector ? node.querySelectorAll(this.props.options.itemSelector) : node.children;
      return Array.prototype.slice.call(children);
    }
  }, {
    key: "diffDomChildren",
    value: function diffDomChildren() {
      var forceItemReload = false;
      var knownChildrenStillAttached = this.latestKnownDomChildren.filter(function (element) {
        /*
         * take only elements attached to DOM
         * (aka the parent is the masonry container, not null)
         * otherwise masonry would try to "remove it" again from the DOM
         */
        return !!element.parentNode;
      });
      /*
       * If not all known children are attached to the dom - we have no other way of notifying
       * masonry to remove the ones not still attached besides invoking a complete item reload.
       * basically all the rest of the code below does not matter in that case.
       */

      if (knownChildrenStillAttached.length !== this.latestKnownDomChildren.length) {
        forceItemReload = true;
      }

      var currentDomChildren = this.getCurrentDomChildren();
      /*
       * Since we are looking for a known child which is also attached to the dom AND
       * not attached to the dom at the same time - this would *always* produce an empty array.
       */

      var removed = knownChildrenStillAttached.filter(function (attachedKnownChild) {
        return !~currentDomChildren.indexOf(attachedKnownChild);
      });
      /*
       * This would get any children which are attached to the dom but are *unkown* to us
       * from previous renders
       */

      var newDomChildren = currentDomChildren.filter(function (currentChild) {
        return !~knownChildrenStillAttached.indexOf(currentChild);
      });
      var beginningIndex = 0; // get everything added to the beginning of the DOMNode list

      var prepended = newDomChildren.filter(function (newChild) {
        var prepend = beginningIndex === currentDomChildren.indexOf(newChild);

        if (prepend) {
          // increase the index
          beginningIndex++;
        }

        return prepend;
      }); // we assume that everything else is appended

      var appended = newDomChildren.filter(function (el) {
        return prepended.indexOf(el) === -1;
      });
      /*
       * otherwise we reverse it because so we're going through the list picking off the items that
       * have been added at the end of the list. this complex logic is preserved in case it needs to be
       * invoked
       *
       * const endingIndex = currentDomChildren.length - 1
       *
       * newDomChildren.reverse().filter(function(newChild, i){
       *     const append = endingIndex == currentDomChildren.indexOf(newChild)
       *
       *     if (append) {
       *         endingIndex--
       *     }
       *
       *     return append
       * })
       */
      // get everything added to the end of the DOMNode list

      var moved = [];
      /*
       * This would always be true (see above about the lofic for "removed")
       */

      if (removed.length === 0) {
        /*
         * 'moved' will contain some random elements (if any) since the "knownChildrenStillAttached" is a filter
         * of the "known" children which are still attached - All indexes could basically change. (for example
         * if the first element is not attached)
         * Don't trust this array.
         */
        moved = knownChildrenStillAttached.filter(function (child, index) {
          return index !== currentDomChildren.indexOf(child);
        });
      }

      this.latestKnownDomChildren = currentDomChildren;
      return {
        old: knownChildrenStillAttached,
        // Not used
        new: currentDomChildren,
        // Not used
        removed: removed,
        appended: appended,
        prepended: prepended,
        moved: moved,
        forceItemReload: forceItemReload
      };
    }
  }, {
    key: "performLayout",
    value: function performLayout() {
      var diff = this.diffDomChildren();
      var reloadItems = diff.forceItemReload || diff.moved.length > 0; // Would never be true. (see comments of 'diffDomChildren' about 'removed')

      if (diff.removed.length > 0) {
        if (this.props.enableResizableChildren) {
          diff.removed.forEach(this.erd.removeAllListeners, this.erd);
        }

        this.masonry.remove(diff.removed);
        reloadItems = true;
      }

      if (diff.appended.length > 0) {
        this.masonry.appended(diff.appended);

        if (diff.prepended.length === 0) {
          reloadItems = true;
        }

        if (this.props.enableResizableChildren) {
          diff.appended.forEach(this.listenToElementResize, this);
        }
      }

      if (diff.prepended.length > 0) {
        if (!reloadItems) {
          this.masonry.prepended(diff.prepended);
        }

        if (this.props.enableResizableChildren) {
          diff.prepended.forEach(this.listenToElementResize, this);
        }
      }

      if (reloadItems) {
        this.masonry.reloadItems();
      }

      if (this.props.updateOnEachComponentUpdate || reloadItems) {
        this.reloadLayout();
      }
    }
  }, {
    key: "derefImagesLoaded",
    value: function derefImagesLoaded() {
      this.imagesLoadedCancelRef();
      this.imagesLoadedCancelRef = undefined;
    }
  }, {
    key: "imagesLoaded",
    value: function imagesLoaded() {
      if (this.props.disableImagesLoaded) {
        return;
      }

      if (this.imagesLoadedCancelRef) {
        this.derefImagesLoaded();
      }

      var event = this.props.updateOnEachImageLoad ? 'progress' : 'always';
      var handler = (0, _lodash.default)(function (instance) {
        if (this.props.onImagesLoaded) {
          this.props.onImagesLoaded(instance);
        }

        this.reloadLayout();
      }.bind(this), 100);
      var imgLoad = imagesloaded(this.masonryContainer, this.props.imagesLoadedOptions).on(event, handler);

      this.imagesLoadedCancelRef = function () {
        imgLoad.off(event, handler);
        handler.cancel();
      };
    }
  }, {
    key: "reloadLayout",
    value: function reloadLayout() {
      var _this2 = this;

      (0, _lodash.default)(function () {
        _this2.masonry.layout();
      }, 100, {
        leading: true
      });
    }
  }, {
    key: "initializeResizableChildren",
    value: function initializeResizableChildren() {
      if (!this.props.enableResizableChildren) {
        return;
      }

      this.erd = (0, _elementResizeDetector.default)({
        strategy: 'scroll'
      });
      this.latestKnownDomChildren.forEach(this.listenToElementResize, this);
    }
  }, {
    key: "listenToElementResize",
    value: function listenToElementResize(el) {
      this.erd.listenTo(el, this.reloadLayout);
    }
  }, {
    key: "destroyErd",
    value: function destroyErd() {
      if (this.erd) {
        this.latestKnownDomChildren.forEach(this.erd.uninstall, this.erd);
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.initializeMasonry();
      this.initializeResizableChildren();
      this.imagesLoaded();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.performLayout();
      this.imagesLoaded();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.destroyErd(); // unregister events

      if (this.props.onLayoutComplete) {
        this.masonry.off('layoutComplete', this.props.onLayoutComplete);
      }

      if (this.props.onRemoveComplete) {
        this.masonry.off('removeComplete', this.props.onRemoveComplete);
      }

      if (this.imagesLoadedCancelRef) {
        this.derefImagesLoaded();
      }

      this.masonry.destroy();
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var props = (0, _lodash2.default)(this.props, Object.keys(MasonryComponent.propTypes));
      return _react.default.createElement(this.props.elementType, _objectSpread(_objectSpread({}, props), {}, {
        ref: function ref(n) {
          return _this3.masonryContainer = n;
        }
      }), this.props.children);
    }
  }]);
  return MasonryComponent;
}(_react.Component);

module.exports = MasonryComponent;
module.exports.default = MasonryComponent;
MasonryComponent.defaultProps = {
  enableResizableChildren: false,
  disableImagesLoaded: false,
  updateOnEachImageLoad: false,
  options: {},
  imagesLoadedOptions: {},
  className: '',
  elementType: 'div',
  onLayoutComplete: function onLayoutComplete() {},
  onRemoveComplete: function onRemoveComplete() {},
  updateOnEachComponentUpdate: true
};
MasonryComponent.propTypes = {
  enableResizableChildren: _propTypes.default.bool,
  disableImagesLoaded: _propTypes.default.bool,
  onImagesLoaded: _propTypes.default.func,
  updateOnEachImageLoad: _propTypes.default.bool,
  options: _propTypes.default.object,
  imagesLoadedOptions: _propTypes.default.object,
  elementType: _propTypes.default.string,
  onLayoutComplete: _propTypes.default.func,
  onRemoveComplete: _propTypes.default.func,
  updateOnEachComponentUpdate: _propTypes.default.bool
};
//# sourceMappingURL=index.js.map