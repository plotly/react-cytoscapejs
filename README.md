# react-cytoscapejs

The `react-cytoscapejs` package is an MIT-licensed [React](https://reactjs.org) component for network (or graph, as in [graph theory](https://en.wikipedia.org/wiki/Graph_theory)) visualisation. The component renders a [Cytoscape](http://js.cytoscape.org) graph.

Most props of this component are [Cytoscape JSON](http://js.cytoscape.org/#core/initialisation).

## Usage

### npm

```bash
npm install react-cytoscapejs
npm install cytoscape@3.x.y # your desired version, 3.2.19 or newer
```

### yarn

```bash
yarn add react-cytoscapejs
yarn add cytoscape@3.x.y # your desired version, 3.2.19 or newer
```

Note that you must specify the desired version of `cytoscape` to be used.  Otherwise, you will get whatever version npm or yarn thinks best matches this package's compatible semver range -- which is currently `^3.2.19` or any version of 3 newer than or equal to 3.2.19.


The component is created by putting a `<CytoscapeComponent>` within the `render()` function of one of your apps's React components. Here is a minimal example:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import CytoscapeComponent from 'react-cytoscapejs';

class MyApp extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const elements = [
       { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
       { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
       { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
    ];

    return <CytoscapeComponent elements={elements} style={ { width: '600px', height: '600px' } } />;
  }
}

ReactDOM.render( React.createElement(MyApp, document.getElementById('root')));
```

## `Basic props`

### `elements`

The flat list of [Cytoscape elements](http://js.cytoscape.org/#notation/elements-json) to be included in the graph, each represented as non-stringified JSON. E.g.:

```jsx
<CytoscapeComponent
  elements={[
    { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
    { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
    {
      data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' }
    }
  ]}
/>
```

Note that arrays or objects should not be used in an `element`'s `data` or `scratch` fields, unless using a custom `diff()` prop.

In order to make it easier to support passing in `elements` JSON in the `elements: { nodes: [], edges: [] }` format, there is a static function `CytoscapeComponent.normalizeElements()`.  E.g.:

```jsx
<CytoscapeComponent
  elements={CytoscapeComponent.normalizeElements({
    nodes: [
      { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
      { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } }
    ],
    edges: [
      {
        data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' }
      }
    ]
  })}
/>
```

Note that `CytoscapeComponent.normalizeElements()` is useful only for plain-JSON data, such as an export from Cytoscape.js or the Cytoscape desktop software.  If you use [custom prop types](#custom-prop-types), such as Immutable, then you should flatten the elements yourself before passing the `elements` prop.

### `stylesheet`

The Cytoscape stylesheet as non-stringified JSON. Note that the prop key is `stylesheet` rather than `style`, the key used by Cytoscape itself, so as to not conflict with the HTML [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/style) attribute. E.g.:

```jsx
<CytoscapeComponent
  stylesheet={[
    {
      selector: 'node',
      style: {
        width: 20,
        height: 20,
        shape: 'rectangle'
      }
    },
    {
      selector: 'edge',
      style: {
        width: 15
      }
    }
  ]}
/>
```

### `layout`

Use a [layout](http://js.cytoscape.org/#layouts) to automatically position the nodes in the graph. E.g.:

```jsx
layout: {
  name: 'random';
}
```

To use an external [layout extension](http://js.cytoscape.org/#extensions/layout-extensions), you must register the extension prior to rendering this component, e.g.:

```jsx
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

Cytoscape.use(COSEBilkent);

class MyApp extends React.Component {
  render() {
    const elements = [
      { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
      { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
      { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
    ];

    const layout = { name: 'cose-bilkent' };

    return <CytoscapeComponent elements={elements} layout={layout} />;
  }
}
```

### `cy`

This prop allows for getting a reference to the Cytoscape `cy` reference using a React ref function. This `cy` reference can be used to access the Cytoscape API directly. E.g.:

```jsx
class MyApp extends React.Component {
  render() {
    return <CytoscapeComponent cy={(cy) => { this.cy = cy }}>;
  }
}
```

## Viewport manipulation

### `pan`

The [panning position](http://js.cytoscape.org/#init-opts/pan) of the graph, e.g. `<CytoscapeComponent pan={ { x: 100, y: 200 } } />`.

### `zoom`

The [zoom level](http://js.cytoscape.org/#init-opts/zoom) of the graph, e.g. `<CytoscapeComponent zoom={2} />`.

## Viewport mutability & gesture toggling

### `panningEnabled`

Whether the [panning position of the graph is mutable overall](http://js.cytoscape.org/#init-opts/panningEnabled), e.g. `<CytoscapeComponent panningEnabled={false} />`.

### `userPanningEnabled`

Whether the [panning position of the graph is mutable by user gestures](http://js.cytoscape.org/#init-opts/userPanningEnabled) such as swiping, e.g. `<CytoscapeComponent userPanningEnabled={false} />`.

### `minZoom`

The [minimum zoom level](http://js.cytoscape.org/#init-opts/minZoom) of the graph, e.g. `<CytoscapeComponent minZoom={0.5} />`.

### `maxZoom`

The [maximum zoom level](http://js.cytoscape.org/#init-opts/maxZoom) of the graph, e.g. `<CytoscapeComponent maxZoom={2} />`.

### `zoomingEnabled`

Whether the [zoom level of the graph is mutable overall](http://js.cytoscape.org/#init-opts/zoomingEnabled), e.g. `<CytoscapeComponent zoomingEnabled={false} />`.

### `userZoomingEnabled`

Whether the [zoom level of the graph is mutable by user gestures](http://js.cytoscape.org/#init-opts/userZoomingEnabled) (e.g. pinch-to-zoom), e.g. `<CytoscapeComponent userZoomingEnabled={false} />`.

### `boxSelectionEnabled`

Whether [shift+click-and-drag box selection is enabled](http://js.cytoscape.org/#init-opts/boxSelectionEnabled), e.g. `<CytoscapeComponent boxSelectionEnabled={false} />`.

### `autoungrabify`

If true, nodes [automatically can not be grabbed](http://js.cytoscape.org/#init-opts/autoungrabify) regardless of whether each node is marked as grabbable, e.g. `<CytoscapeComponent autoungrabify={true} />`.

### `autolock`

If true, [nodes can not be moved at all](http://js.cytoscape.org/#init-opts/autolock), e.g. `<CytoscapeComponent autolock={true} />`.

### `autounselectify`

If true, [elements have immutable selection state](http://js.cytoscape.org/#init-opts/autounselectify), e.g. `<CytoscapeComponent autounselectify={true} />`.

## HTML attribute props

These props allow for setting built-in HTML attributes on the div created by the component that holds the visualisation:

### `id`

The [`id`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id) attribute of the div, e.g. `<CytoscapeComponent id="myCy" />`.

### `className`

The [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) attribute of the div containing space-separated class names, e.g. `<CytoscapeComponent className="foo bar" />`.

### `style`

The [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/style) attribute of the div containing CSS styles, e.g. `<CytoscapeComponent style={ { width: '600px', height: '600px' } } />`.

## Custom prop types

This component allows for props of custom type to be used (i.e. non JSON props), for example an object-oriented model or an [Immutable](http://facebook.github.io/immutable-js/) model. The props used to control the reading and diffing of the main props are listed below.

Examples are given using Immutable. Using Immutable allows for cheaper diffs, which is useful for updating graphs with many `elements`. For example, you may specify `elements` as the following:

```js
const elements = Immutable.List([
  Immutable.Map({ data: Immutable.Map({ id: 'foo', label: 'bar' }) })
]);
```

### `get(object, key)`

Get the value of the specified `object` at the `key`, which may be an integer in the case of lists/arrays or strings in the case of maps/objects. E.g.:

```js
const get = (object, key) => {
  // must check type because some props may be immutable and others may not be
  if (Immutable.Map.isMap(object) || Immutable.List.isList(object)) {
    return object.get(key);
  } else {
    return object[key];
  }
}
```

The default is:

```js
const get = (object, key) => object[key];
```

### `toJson(object)`

Get the deep value of the specified `object` as non-stringified JSON. E.g.:

```js
const toJson = (object) => {
  // must check type because some props may be immutable and others may not be
  if (Immutable.isImmutable(object)) {
    return object.toJSON();
  } else {
    return object;
  }
}
```

The default is:

```js
const toJson = (object) => object;
```

### `diff(objectA, objectB)`

Return whether the two objects have equal value. This is used to determine if and where Cytoscape needs to be patched. E.g.:

```js
const diff = (objectA, objectB) => objectA !== objectB; // immutable creates new objects for each operation
```

The default is a shallow equality check over the fields of each object. This means that if you use the default `diff()`, you should not use arrays or objects in an element's `data` or `scratch` fields.

Immutable benefits performance here by reducing the total number of `diff()` calls needed. For example, an unchanged `element` requires only one diff with Immutable whereas it would require many diffs with the default JSON `diff()` implementation. Basically, Immutable make diffs minimal-depth searches.

### `forEach(list, iterator)`

Call `iterator` on each element in the `list`, in order. E.g.:

```js
const forEach = (list, iterator) => list.forEach(iterator); // same for immutable and js arrays
```

The above example is the same as the default `forEach()`.

## Reference props

### `cy()`

The `cy` prop allows for getting a reference to the `cy` Cytoscape object, e.g.:

```jsx
<CytoscapeComponent cy={(cy) => { myCyRef = cy }} />
```

## Change log

- v1.2.1
  - When patching, apply layout outside of batching.
- v1.2.0
  - Add support for `headless`, `styleEnabled` and the following (canvas renderer) rendering hints: `hideEdgesOnViewport`, `textureOnViewport`, `motionBlur`, `motionBlurOpacity`, `wheelSensitivity`, `pixelRatio`
  - Add setup and version explanation to README
  - Add a default React displayName
- v1.1.0
  - Add `Component.normalizeElements()` utility function
  - Update style prop docs
- v1.0.1
  - Update style attribute in docs example to use idiomatic React style object
  - Add npmignore
- v1.0.0
  - Initial release
  
