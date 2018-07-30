/* global expect, ReactDOM, React, ReactCytoscape, cy, Immutable */

(function() {
  const { Map, List } = Immutable;

  const isImmutable = obj => Map.isMap(obj) || List.isList(obj);

  const cloneDefaults = () => ({
    // dom
    global: 'cy',
    id: 'cy',
    style: { width: '500px', height: '500px' },

    // cy
    zoom: 1,
    pan: Map({
      x: 0,
      y: 0
    }),
    elements: List([
      Map({
        data: Map({ id: 'a', label: 'apple' }),
        position: Map({ x: 0, y: 0 }),
        scratch: Map({ _test: 1 }),
        classes: 'foo bar'
      }),
      Map({
        data: Map({ id: 'b', label: 'banana' }),
        position: Map({ x: 0, y: 0 }),
        scratch: Map({ _test: 2 }),
        classes: 'foo bar'
      }),
      Map({
        data: Map({ id: 'c', label: 'cherry' }),
        position: Map({ x: 0, y: 0 }),
        scratch: Map({ _test: 3 }),
        classes: 'foo bar'
      })
    ]),

    // diff-patch config
    diff: (objA, objB) => objA !== objB,
    toJson: obj => (isImmutable(obj) ? obj.toJSON() : obj),
    get: (obj, key) => (isImmutable(obj) ? obj.get(key) : obj[key]),
    forEach: (list, iterator) => list.forEach(iterator)
  });

  const defaults = cloneDefaults();

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

  describe('Immutable component', function() {
    let root, setState, json;

    let updateCyProps = newProps =>
      new Promise(resolve => {
        setState(newProps, resolve);
      });

    beforeEach(function() {
      json = defaults;

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
      return updateCyProps({
        stylesheet: List([
          Map({
            selector: 'node',
            style: Map({
              width: '100px'
            })
          })
        ])
      }).then(() => {
        expect(
          cy
            .nodes()
            .first()
            .width()
        ).to.equal(100);
      });
    });

    it('adds an element', function() {
      return updateCyProps({
        elements: json.elements.push(
          Map({ data: Map({ id: 'd', label: 'date' }) })
        )
      }).then(() => {
        expect(cy.nodes().length).to.equal(4);
        expect(cy.getElementById('a').data('label')).to.equal('apple');
        expect(cy.getElementById('b').data('label')).to.equal('banana');
        expect(cy.getElementById('c').data('label')).to.equal('cherry');
        expect(cy.getElementById('d').data('label')).to.equal('date');
      });
    });

    it('removes an element', function() {
      return updateCyProps({
        elements: json.elements.delete(1) // remove b in index 1
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
      return updateCyProps({
        pan: json.pan.set('x', 100)
      }).then(() => {
        expect(cy.pan()).to.deep.equal({ x: 100, y: 0 });
      });
    });

    it('updates pan y', function() {
      return updateCyProps({
        pan: json.pan.set('y', 100)
      }).then(() => {
        expect(cy.pan()).to.deep.equal({ x: 0, y: 100 });
      });
    });

    it('updates pan x and y', function() {
      return updateCyProps({
        pan: json.pan.set('x', 100).set('y', 200)
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

    it('updates autounselectify state', function() {
      return updateCyProps({
        autounselectify: true
      }).then(() => {
        expect(cy.autounselectify()).to.equal(true);
      });
    });

    it('modifies element data', function() {
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set('data', a.get('data').set('label', 'apricot'));
      elements = elements.set(0, a);

      return updateCyProps({
        elements
      }).then(() => {
        // a is updated
        expect(cy.getElementById('a').data('label')).to.equal('apricot');
      });
    });

    it('adds element data', function() {
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set('data', a.get('data').set('foo', 'bar'));
      elements = elements.set(0, a);

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
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set('scratch', a.get('scratch').set('_test', 123));
      elements = elements.set(0, a);

      return updateCyProps({ elements }).then(() => {
        expect(cy.getElementById('a').scratch('_test')).to.equal(123);
      });
    });

    it('adds element scratch', function() {
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set('scratch', a.get('scratch').set('_test2', 123));
      elements = elements.set(0, a);

      return updateCyProps({ elements }).then(() => {
        // a is updated
        expect(cy.getElementById('a').scratch('_test2')).to.equal(123);

        // other data is maintained for a
        expect(cy.getElementById('a').scratch('_test')).to.equal(1);
      });
    });

    it('updates element position', function() {
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set(
        'position',
        a
          .get('position')
          .set('x', 123)
          .set('y', 456)
      );
      elements = elements.set(0, a);

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
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set('selected', true);
      elements = elements.set(0, a);

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.getElementById('a').selected()).to.be.true;
      });
    });

    it('updates element selectable state', function() {
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set('selectable', false);
      elements = elements.set(0, a);

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.getElementById('a').selectable()).to.be.false;
      });
    });

    it('updates element locked state', function() {
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set('locked', true);
      elements = elements.set(0, a);

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.getElementById('a').locked()).to.be.true;
      });
    });

    it('updates element grabbable state', function() {
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set('grabbable', false);
      elements = elements.set(0, a);

      return updateCyProps({
        elements
      }).then(() => {
        expect(cy.getElementById('a').grabbable()).to.be.false;
      });
    });

    it('updates element classes', function() {
      let elements = json.elements;
      let a = elements.get(0);

      a = a.set('classes', 'baz bat');
      elements = elements.set(0, a);

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
  });
})();
