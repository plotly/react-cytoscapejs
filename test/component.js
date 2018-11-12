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

  describe('Component', function() {
    let root, setState, json;

    let updateCyProps = props =>
      new Promise(resolve => setState(Object.assign({}, json, props), resolve));

    beforeEach(function() {
      json = cloneDefaults();

      root = document.createElement('div');

      document.body.appendChild(root);

      ReactDOM.render(
        React.createElement(TestComponent, {
          setStateRef: ref => (setState = ref),
          defaults: json
        }),
        root
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(root);
      document.body.removeChild(root);
    });

    it('creates Cytoscape instance', function() {
      expect(cy).to.exist;
      expect(cy.elements().length).to.equal(3);
      expect(cy.getElementById('a').data('label')).to.equal('apple');
      expect(cy.getElementById('b').data('label')).to.equal('banana');
      expect(cy.getElementById('c').data('label')).to.equal('cherry');
    });

    it('updates stylesheet', function() {
      return updateCyProps(
        Object.assign(cloneDefaults(), {
          stylesheet: [
            {
              selector: 'node',
              style: {
                width: '100px'
              }
            }
          ]
        })
      ).then(() => {
        expect(
          cy
            .nodes()
            .first()
            .width()
        ).to.equal(100);
      });
    });

    it('adds an element', function() {
      const elements = cloneDefaults().elements;

      elements.push({ data: { id: 'd', label: 'date' } });

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.nodes().length).to.equal(4);
        expect(cy.getElementById('a').data('label')).to.equal('apple');
        expect(cy.getElementById('b').data('label')).to.equal('banana');
        expect(cy.getElementById('c').data('label')).to.equal('cherry');
        expect(cy.getElementById('d').data('label')).to.equal('date');
      });
    });

    it('removes an element', function() {
      const elements = cloneDefaults().elements;

      elements.splice(1, 1); // remove b in index 1

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.nodes().length).to.equal(2);
        expect(cy.getElementById('a').data('label')).to.equal('apple');
        expect(cy.getElementById('c').data('label')).to.equal('cherry');
      });
    });

    it('updates zoom', function() {
      return updateCyProps({
        zoom: 2
      }).then(() => {
        expect(cy.zoom()).to.equal(2);
      });
    });

    it('updates min zoom', function() {
      return updateCyProps({
        minZoom: 0.5
      }).then(() => {
        expect(cy.minZoom()).to.equal(0.5);
      });
    });

    it('updates min zoom x2 (from unspecified initial value)', function() {
      return updateCyProps({
        minZoom: 0.5
      })
        .then(() => {
          expect(cy.minZoom()).to.equal(0.5);
        })
        .then(() => {
          return updateCyProps({
            minZoom: 0.25
          });
        })
        .then(() => {
          expect(cy.minZoom()).to.equal(0.25);
        });
    });

    it('updates max zoom', function() {
      return updateCyProps({
        maxZoom: 4
      }).then(() => {
        expect(cy.maxZoom()).to.equal(4);
      });
    });

    it('updates zooming enabled state', function() {
      return updateCyProps({
        zoomingEnabled: false
      }).then(() => {
        expect(cy.zoomingEnabled()).to.equal(false);
      });
    });

    it('updates user zooming enabled state', function() {
      return updateCyProps({
        userZoomingEnabled: false
      }).then(() => {
        expect(cy.userZoomingEnabled()).to.equal(false);
      });
    });

    it('updates pan x', function() {
      const pan = cloneDefaults().pan;

      pan.x = 100;

      return updateCyProps({
        pan
      }).then(() => {
        expect(cy.pan()).to.deep.equal({ x: 100, y: 0 });
      });
    });

    it('updates pan y', function() {
      const pan = cloneDefaults().pan;

      pan.y = 100;

      return updateCyProps({
        pan
      }).then(() => {
        expect(cy.pan()).to.deep.equal({ x: 0, y: 100 });
      });
    });

    it('updates pan x and y', function() {
      const pan = cloneDefaults().pan;

      pan.x = 100;
      pan.y = 200;

      return updateCyProps({
        pan
      }).then(() => {
        expect(cy.pan()).to.deep.equal({ x: 100, y: 200 });
      });
    });

    it('updates panning enabled state', function() {
      return updateCyProps({
        panningEnabled: false
      }).then(() => {
        expect(cy.panningEnabled()).to.equal(false);
      });
    });

    it('updates user panning enabled state', function() {
      return updateCyProps({
        userPanningEnabled: false
      }).then(() => {
        expect(cy.userPanningEnabled()).to.equal(false);
      });
    });

    it('updates box selection enabled state', function() {
      return updateCyProps({
        boxSelectionEnabled: false
      }).then(() => {
        expect(cy.boxSelectionEnabled()).to.equal(false);
      });
    });

    it('updates autoungrabify state', function() {
      return updateCyProps({
        autoungrabify: true
      }).then(() => {
        expect(cy.autoungrabify()).to.equal(true);
      });
    });

    it('updates autolock state', function() {
      return updateCyProps({
        autolock: true
      }).then(() => {
        expect(cy.autolock()).to.equal(true);
      });
    });

    it('updates autolock state', function() {
      return updateCyProps({
        autounselectify: true
      }).then(() => {
        expect(cy.autounselectify()).to.equal(true);
      });
    });

    it('modifies element data', function() {
      const elements = cloneDefaults().elements;

      elements[0].data.label = 'apricot';

      return updateCyProps({
        elements
      }).then(() => {
        // a is updated
        expect(cy.getElementById('a').data('label')).to.equal('apricot');
      });
    });

    it('adds element data', function() {
      const elements = cloneDefaults().elements;

      elements[0].data.foo = 'bar';

      return updateCyProps({
        elements
      }).then(() => {
        // a is updated
        expect(cy.getElementById('a').data('foo')).to.equal('bar');

        // other data is maintained for a
        expect(cy.getElementById('a').data('label')).to.equal('apple');
      });
    });

    it('modifies element scratch', function() {
      const elements = cloneDefaults().elements;

      elements[0].scratch._test = 123;

      return updateCyProps({ elements }).then(() => {
        expect(cy.getElementById('a').scratch('_test')).to.equal(123);
      });
    });

    it('adds element scratch', function() {
      const elements = cloneDefaults().elements;

      elements[0].scratch._test2 = 123;

      return updateCyProps({ elements }).then(() => {
        // a is updated
        expect(cy.getElementById('a').scratch('_test2')).to.equal(123);

        // other data is maintained for a
        expect(cy.getElementById('a').scratch('_test')).to.equal(1);
      });
    });

    it('updates element position', function() {
      const elements = cloneDefaults().elements;
      const position = elements[0].position;

      position.x = 123;
      position.y = 456;

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.getElementById('a').position()).to.deep.equal({
          x: 123,
          y: 456
        });
      });
    });

    it('updates element selection state', function() {
      const elements = cloneDefaults().elements;

      elements[0].selected = true;

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.getElementById('a').selected()).to.be.true;
      });
    });

    it('updates element selectable state', function() {
      const elements = cloneDefaults().elements;

      elements[0].selectable = false;

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.getElementById('a').selectable()).to.be.false;
      });
    });

    it('updates element locked state', function() {
      const elements = cloneDefaults().elements;

      elements[0].locked = true;

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.getElementById('a').locked()).to.be.true;
      });
    });

    it('updates element grabbable state', function() {
      const elements = cloneDefaults().elements;

      elements[0].grabbable = false;

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.getElementById('a').grabbable()).to.be.false;
      });
    });

    it('updates element classes', function() {
      const elements = cloneDefaults().elements;

      elements[0].classes = 'baz bat';

      return updateCyProps({
        elements
      }).then(() => {
        const a = cy.getElementById('a');

        expect(a.hasClass('baz')).to.be.true;
        expect(a.hasClass('bat')).to.be.true;
        expect(a.hasClass('foo')).to.be.false;
        expect(a.hasClass('bar')).to.be.false;
      });
    });

    it('converts non-array elements', function() {
      const elements = {
        nodes: [{ data: { id: 'n0' } }, { data: { id: 'n1' } }],
        edges: [{ data: { id: 'e', source: 'n0', target: 'n1' } }]
      };

      return updateCyProps({
        elements: ReactCytoscape.normalizeElements(elements)
      }).then(() => {
        expect(cy.getElementById('n0').length).to.equal(1);
        expect(cy.getElementById('n1').length).to.equal(1);
        expect(cy.getElementById('e').length).to.equal(1);
      });
    });

    it('maintains array elements', function() {
      const elements = [
        { data: { id: 'n0' } },
        { data: { id: 'n1' } },
        { data: { id: 'e', source: 'n0', target: 'n1' } }
      ];

      return updateCyProps({
        elements: ReactCytoscape.normalizeElements(elements)
      }).then(() => {
        expect(cy.getElementById('n0').length).to.equal(1);
        expect(cy.getElementById('n1').length).to.equal(1);
        expect(cy.getElementById('e').length).to.equal(1);
      });
    });
  });
})();
