import React from 'react';
import ReactDOM from 'react-dom';
import { types } from './types';
import { defaults } from './defaults';
import Cytoscape from 'cytoscape';
import { patch } from './patch';

/**
 * The `CytoscapeComponent` is a React component that allows for the declarative creation
 * and modification of a Cytoscape instance, a graph visualisation.
 */
export default class CytoscapeComponent extends React.Component {
  static get propTypes() {
    return types;
  }

  static get defaultProps() {
    return defaults;
  }

  static normalizeElements(elements) {
    const isArray = elements.length != null;

    if (isArray) {
      return elements;
    } else {
      let { nodes, edges } = elements;

      if (nodes == null) {
        nodes = [];
      }

      if (edges == null) {
        edges = [];
      }

      return nodes.concat(edges);
    }
  }

  constructor(props) {
    super(props);
    this.displayName = `CytoscapeComponent`;
  }

  componentDidMount() {
    const container = ReactDOM.findDOMNode(this);
    const { global, options } = this.props;

    // Set some logical defaults
    const cyOptions = {
      container,
      headless: false,
      styleEnabled: true,
      hideEdgesOnViewport: false,
      hideLabelsOnViewport: false,
      textureOnViewport: false,
      motionBlur: false,
      motionBlurOpacity: 0.2,
      wheelSensitivity: 1,
      pixelRatio: 'auto'
    }

    // Merge with defaults and passed props
    const cy = (this._cy = new Cytoscape(Object.assign(cyOptions, options || {})));

    if (global) {
      window[global] = cy;
    }

    this.updateCytoscape(null, this.props);
  }

  updateCytoscape(prevProps, newProps) {
    const cy = this._cy;
    const { diff, toJson, get, forEach } = newProps;

    // batch for peformance
    cy.batch(() => {
      patch(cy, prevProps, newProps, diff, toJson, get, forEach);
    });

    if (newProps.cy != null) {
      newProps.cy(cy);
    }
  }

  componentDidUpdate(prevProps) {
    this.updateCytoscape(prevProps, this.props);
  }

  componentWillUnmount() {
    this._cy.destroy();
  }

  render() {
    const { id, className, style } = this.props;

    return React.createElement('div', {
      id,
      className,
      style
    });
  }
}
