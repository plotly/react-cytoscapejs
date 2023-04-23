// Import helper functions
import { get as atKey } from './json';
import { shallowObjDiff } from './diff';
import { deepEqual } from './deepEqual';

// Check if there's a difference in the specified key between json1 and json2
const isDiffAtKey = (json1, json2, diff, key) =>
  diff(atKey(json1, key), atKey(json2, key));

// Update the specified key in the cytoscape instance with the new value
const patchJson = (cy, key, val1, val2, toJson) => {
  cy[key](toJson(val2));
};

// Update the layout of the cytoscape instance if there's a difference
const patchLayout = (cy, layout1, layout2, toJson) => {

  const layoutOpts = toJson(layout2);

  if (layoutOpts != null) {
    cy.layout(layoutOpts).run();
  }
};

// Update the style of the cytoscape instance if there's a difference
const patchStyle = (cy, style1, style2, toJson) => {
  if (deepEqual(style1, style2)) return;
  const style = cy.style();

  if (style == null) {
    return;
  }

  style.fromJson(toJson(style2)).update();
};

// Update elements in the cytoscape instance based on differences
const patchElements = (cy, eles1, eles2, toJson, get, forEach, diff) => {
  const toAdd = [];
  const toRm = cy.collection();
  const toPatch = [];
  const eles1Map = {};
  const eles2Map = {};
  const getId = (ele) => get(get(ele, 'data'), 'id');
  let isEdit = false;

  // Create a map of elements in eles2
  forEach(eles2, (ele2) => {
    const id = getId(ele2);
    eles2Map[id] = ele2;
  });

  // Create a map of elements in eles1 and identify elements to remove
  if (eles1 != null) {
    forEach(eles1, (ele1) => {
      const id = getId(ele1);
      eles1Map[id] = ele1;

      if (!eles2Map.hasOwnProperty(id)) {
        toRm.merge(cy.getElementById(id));
      }
    });
  }

  // Identify elements to add and to patch
  forEach(eles2, (ele2) => {
    const id = getId(ele2);
    const ele1 = eles1Map[id];

    if (eles1Map.hasOwnProperty(id)) {
      toPatch.push({ ele1, ele2 });
    } else {
      toAdd.push(toJson(ele2));
    }
  });

  // Remove, add, and patch elements in the cytoscape instance
  if (toRm.length > 0) {
    cy.remove(toRm);
    isEdit = true;
  }

  if (toAdd.length > 0) {
    cy.add(toAdd);
    isEdit = true;
  }

  toPatch.forEach(({ ele1, ele2 }) => {
    patchElement(cy, ele1, ele2, toJson, get, diff)
  }
  );
  return {
    isEdit,
  }
};

// Update a single element in the cytoscape instance
const patchElement = (cy, ele1, ele2, toJson, get, diff) => {
  const id = get(get(ele2, 'data'), 'id');
  const cyEle = cy.getElementById(id);
  const patch = {};
  const jsonKeys = [
    'data',
    'position',
    'selected',
    'selectable',
    'locked',
    'grabbable',
    'classes',
  ];

  // Check for differences in each key and create a patch object
  jsonKeys.forEach((key) => {
    const data2 = get(ele2, key);
    if (diff(data2, get(ele1, key))) {
      patch[key] = toJson(data2);
    }
  });

  // Patch the 'scratch' key if there's a difference
  const scratch2 = get(ele2, 'scratch');
  if (diff(scratch2, get(ele1, 'scratch'))) {
    cyEle.scratch(toJson(scratch2));
  }

  // Apply the patch to the element if there are differences
  if (Object.keys(patch).length > 0) {
    cyEle.json(patch);
  }
};

// Main patch function to update the cytoscape instance based on differences between json1 and json2
export const patch = (cy, json1, json2, diff, toJson, get, forEach) => {
  cy.batch(() => {
    const keysToPatch = [
      'elements',
      'stylesheet',
      'zoom',
      'minZoom',
      'maxZoom',
      'zoomingEnabled',
      'userZoomingEnabled',
      'pan',
      'panningEnabled',
      'userPanningEnabled',
      'boxSelectionEnabled',
      'autoungrabify',
      'autolock',
      'autounselectify',
    ];

    let elementsChanged = false;
    let styleChanged = false;

    // Check for differences in each key and apply the appropriate patch function
    keysToPatch.forEach((key) => {
      
      if (isDiffAtKey(json1, json2, diff, key)) {
        
        switch (key) {
          case 'elements':
            
            const { isEdit } = patchElements(
              cy,
              atKey(json1, 'elements'),
              atKey(json2, 'elements'),
              toJson,
              get,
              forEach,
              diff
            );
            elementsChanged = isEdit;
            break;
          case 'stylesheet':
            patchStyle(
              cy,
              atKey(json1, 'stylesheet'),
              atKey(json2, 'stylesheet'),
              toJson
            );
            styleChanged = true;
            break;
          default:
            patchJson(cy, key, atKey(json1, key), atKey(json2, key), toJson);
            break;
        }
      }
    });

    // Update the layout if there's a difference
    if (isDiffAtKey(json1, json2, diff, 'layout') && elementsChanged) {
      patchLayout(cy, atKey(json1, 'layout'), atKey(json2, 'layout'), toJson);
    }
  });
};