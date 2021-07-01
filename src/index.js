import React, { Component } from 'react'
import elementResizeDetectorMaker from 'element-resize-detector'
import debounce from 'lodash.debounce'
import omit from 'lodash.omit'
import PropTypes from 'prop-types'

const isBrowser = typeof window !== 'undefined'
const Masonry = isBrowser ? window.Masonry || require('masonry-layout') : null
const imagesloaded = isBrowser ? require('imagesloaded') : null

class MasonryComponent extends Component {
  constructor(props) {
    super(props);
    this.masonry = false
    this.erd = undefined
    this.latestKnownDomChildren = []
    this.imagesLoadedCancelRef = undefined
    this.masonryContainer = undefined

    this.initializeMasonry = this.initializeMasonry.bind(this)
    this.getCurrentDomChildren = this.getCurrentDomChildren.bind(this)
    this.diffDomChildren = this.diffDomChildren.bind(this)
    this.performLayout = this.performLayout.bind(this)
    this.derefImagesLoaded = this.derefImagesLoaded.bind(this)
    this.imagesLoaded = this.imagesLoaded.bind(this)
    this.reloadLayout = this.reloadLayout.bind(this)
    this.initializeResizableChildren = this.initializeResizableChildren.bind(this)
    this.listenToElementResize = this.listenToElementResize.bind(this)
    this.destroyErd = this.destroyErd.bind(this)
  }

  initializeMasonry (force) {
    if (!this.masonry || force) {
      this.masonry = new Masonry(
        this.masonryContainer,
        this.props.options
      )

      if (this.props.onLayoutComplete) {
        this.masonry.on('layoutComplete', this.props.onLayoutComplete)
      }

      if (this.props.onRemoveComplete) {
        this.masonry.on('removeComplete', this.props.onRemoveComplete)
      }

      this.latestKnownDomChildren = this.getCurrentDomChildren()
    }
  }

  getCurrentDomChildren () {
    const node = this.masonryContainer
    const children = this.props.options.itemSelector ? node.querySelectorAll(this.props.options.itemSelector) : node.children
    return Array.prototype.slice.call(children)
  }

  diffDomChildren () {
    let forceItemReload = false

    const knownChildrenStillAttached = this.latestKnownDomChildren.filter(function(element) {
      /*
       * take only elements attached to DOM
       * (aka the parent is the masonry container, not null)
       * otherwise masonry would try to "remove it" again from the DOM
       */
      return !!element.parentNode
    })

    /*
     * If not all known children are attached to the dom - we have no other way of notifying
     * masonry to remove the ones not still attached besides invoking a complete item reload.
     * basically all the rest of the code below does not matter in that case.
     */
    if (knownChildrenStillAttached.length !== this.latestKnownDomChildren.length) {
      forceItemReload = true
    }

    const currentDomChildren = this.getCurrentDomChildren()

    /*
     * Since we are looking for a known child which is also attached to the dom AND
     * not attached to the dom at the same time - this would *always* produce an empty array.
     */
    const removed = knownChildrenStillAttached.filter(function(attachedKnownChild) {
      return !~currentDomChildren.indexOf(attachedKnownChild)
    })

    /*
     * This would get any children which are attached to the dom but are *unkown* to us
     * from previous renders
     */
    const newDomChildren = currentDomChildren.filter(function(currentChild) {
      return !~knownChildrenStillAttached.indexOf(currentChild)
    })

    let beginningIndex = 0

    // get everything added to the beginning of the DOMNode list
    const prepended = newDomChildren.filter(function(newChild) {
      const prepend = (beginningIndex === currentDomChildren.indexOf(newChild))

      if (prepend) {
        // increase the index
        beginningIndex++
      }

      return prepend
    })

    // we assume that everything else is appended
    const appended = newDomChildren.filter(function(el) {
      return prepended.indexOf(el) === -1
    })

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
    let moved = []

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
      moved = knownChildrenStillAttached.filter(function(child, index) {
        return index !== currentDomChildren.indexOf(child)
      })
    }

    this.latestKnownDomChildren = currentDomChildren

    return {
      old: knownChildrenStillAttached, // Not used
      new: currentDomChildren, // Not used
      removed: removed,
      appended: appended,
      prepended: prepended,
      moved: moved,
      forceItemReload: forceItemReload
    }
  }

  performLayout () {
    const diff = this.diffDomChildren()
    let reloadItems = diff.forceItemReload || diff.moved.length > 0

    // Would never be true. (see comments of 'diffDomChildren' about 'removed')
    if (diff.removed.length > 0) {
      if (this.props.enableResizableChildren) {
        diff.removed.forEach(this.erd.removeAllListeners, this.erd)
      }
      this.masonry.remove(diff.removed)
      reloadItems = true
    }

    if (diff.appended.length > 0) {
      this.masonry.appended(diff.appended)

      if (diff.prepended.length === 0) {
        reloadItems = true
      }

      if (this.props.enableResizableChildren) {
        diff.appended.forEach(this.listenToElementResize, this)
      }
    }

    if (diff.prepended.length > 0) {
      if (!reloadItems) {
        this.masonry.prepended(diff.prepended)
      }

      if (this.props.enableResizableChildren) {
        diff.prepended.forEach(this.listenToElementResize, this)
      }
    }

    if (reloadItems) {
      this.masonry.reloadItems()
    }

    if (this.props.updateOnEachComponentUpdate || reloadItems) {
      this.reloadLayout()
    }
  }

  derefImagesLoaded () {
    this.imagesLoadedCancelRef()
    this.imagesLoadedCancelRef = undefined
  }

  imagesLoaded () {
    if (this.props.disableImagesLoaded) {
      return
    }

    if (this.imagesLoadedCancelRef) {
      this.derefImagesLoaded()
    }

    const event = this.props.updateOnEachImageLoad ? 'progress' : 'always'
    const handler = debounce(
      function(instance) {
        if (this.props.onImagesLoaded) {
          this.props.onImagesLoaded(instance)
        }
        this.reloadLayout()
      }.bind(this), 100)

    const imgLoad = imagesloaded(this.masonryContainer, this.props.imagesLoadedOptions).on(event, handler)

    this.imagesLoadedCancelRef = function() {
      imgLoad.off(event, handler)
      handler.cancel()
    }
  }

  reloadLayout () {
    debounce(() => {
        this.masonry.layout()
      }, 100, {
        leading: true
      }
    )
  }

  initializeResizableChildren () {
    if (!this.props.enableResizableChildren) {
      return
    }

    this.erd = elementResizeDetectorMaker({
      strategy: 'scroll'
    })

    this.latestKnownDomChildren.forEach(this.listenToElementResize, this)
  }

  listenToElementResize (el) {
    this.erd.listenTo(el, this.reloadLayout)
  }

  destroyErd () {
    if (this.erd) {
      this.latestKnownDomChildren.forEach(this.erd.uninstall, this.erd)
    }
  }

  componentDidMount () {
    this.initializeMasonry()
    this.initializeResizableChildren()
    this.imagesLoaded()
  }

  componentDidUpdate () {
    this.performLayout()
    this.imagesLoaded()
  }

  componentWillUnmount () {
    this.destroyErd()

    // unregister events
    if (this.props.onLayoutComplete) {
      this.masonry.off('layoutComplete', this.props.onLayoutComplete)
    }

    if (this.props.onRemoveComplete) {
      this.masonry.off('removeComplete', this.props.onRemoveComplete)
    }

    if (this.imagesLoadedCancelRef) {
      this.derefImagesLoaded()
    }
    this.masonry.destroy()
  }

  render () {
    const props = omit(this.props, Object.keys(MasonryComponent.propTypes))
    return React.createElement(this.props.elementType, {...props, ref: n => this.masonryContainer = n }, this.props.children)
  }
}

module.exports = MasonryComponent
module.exports.default = MasonryComponent

MasonryComponent.defaultProps = {
  enableResizableChildren: false,
  disableImagesLoaded: false,
  updateOnEachImageLoad: false,
  options: {},
  imagesLoadedOptions: {},
  className: '',
  elementType: 'div',
  onLayoutComplete: () => {},
  onRemoveComplete: () => {},
  updateOnEachComponentUpdate: true
}


MasonryComponent.propTypes = {
  enableResizableChildren: PropTypes.bool,
  disableImagesLoaded: PropTypes.bool,
  onImagesLoaded: PropTypes.func,
  updateOnEachImageLoad: PropTypes.bool,
  options: PropTypes.object,
  imagesLoadedOptions: PropTypes.object,
  elementType: PropTypes.string,
  onLayoutComplete: PropTypes.func,
  onRemoveComplete: PropTypes.func,
  updateOnEachComponentUpdate: PropTypes.bool
}
