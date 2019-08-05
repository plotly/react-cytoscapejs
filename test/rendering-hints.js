/* global expect, ReactDOM, React, ReactCytoscape, cy */

(function() {
  const defaults = {
    global: 'cy',
    id: 'cy',
    style: { width: '500px', height: '500px' },
    zoom: 1,
    pan: {
      x: 0,
      y: 0
    },
    elements: [
      {
        data: { id: 'a', label: 'apple' },
        position: { x: 0, y: 0 },
        scratch: { _test: 1 },
        classes: 'foo bar'
      },
      {
        data: { id: 'b', label: 'banana' },
        position: { x: 0, y: 0 },
        scratch: { _test: 2 },
        classes: 'foo bar'
      },
      {
        data: { id: 'c', label: 'cherry' },
        position: { x: 0, y: 0 },
        scratch: { _test: 3 },
        classes: 'foo bar'
      }
    ],
    stylesheet: [
      {
        selector: 'node',
        style: {
          'width': 100
        }
      }
    ]
  };

  const cloneDefaults = () => JSON.parse(JSON.stringify(defaults));

  /**
   * The TestComponent drives updates to the ReactCytoscape component.  Updates
   * to the state of the TestComponent trigger updates to the props of
   * ReactCytoscape via componentDidUpdate(props).
   */
  class TestComponent extends React.Component {
    constructor(props) {
      super(props);

      props.setStateRef(this.setState.bind(this));

      this.state = props.defaults;
    }

    render() {
      return React.createElement(ReactCytoscape, this.state);
    }
  }

  describe('Rendering hints', function() {
    let root, setState, json;

    let updateCyProps = props =>
      new Promise(resolve => setState(Object.assign({}, json, props), resolve));

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(root);
      document.body.removeChild(root);
    });

    let createComponent = props => {
      json = Object.assign(cloneDefaults(), props);

      root = document.createElement('div');

      document.body.appendChild(root);

      ReactDOM.render(
        React.createElement(TestComponent, {
          setStateRef: ref => (setState = ref),
          defaults: json
        }),
        root
      );
    };

    it('allows headless:true', function(){
      createComponent({ headless: true });

      expect(cy.style()).to.not.exist;

      // TODO add another assertion here if/when there is a public getter for headless state
      
      expect(cy.nodes().length).to.equal(3); // sanity check
    });

    it('allows headless:true styleEnabled:true', function(){
      createComponent({ headless: true, styleEnabled: true });

      expect(cy.style()).to.exist;

      expect(cy.nodes().length).to.equal(3); // sanity check

      expect(cy.nodes().first().width()).to.equal(100);
    });
  });
})();
