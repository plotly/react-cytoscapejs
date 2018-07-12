import React from 'react';
import ReactDOM from 'react-dom';
import { defaults } from './defaults';
import Cytoscape from 'cytoscape';

export default class CytoscapeComponent extends React.Component {
  static get defaultProps(){
    return defaults;
  }

  constructor(props){
    super(props);
  }

  componentDidMount(){
    const container = ReactDOM.findDOMNode(this);
    const { global } = this.props;
    const cy = this._cy = new Cytoscape({ container });

    if(global){
      window[global] = cy;
    }

    this.updateCytoscape(null, this.props);
  }

  updateCytoscape(prevProps, newProps){
    const cy = this._cy;
    const { elements, stylesheet } = newProps;

    // TODO update via diff
    cy.json({
      elements,
      style: stylesheet
    });

    // TODO run layout only on diff
    cy.layout({ name: 'grid' }).run();
  }

  componentDidUpdate(prevProps){
    this.updateCytoscape(prevProps, this.props);
  }

  componentWillUnmount(){
    this._cy.destroy();
  }

  render(){
    const { id, className, style } = this.props;

    return (
      React.createElement('div', {
        id,
        className,
        style
      })
    );
  }
}