export const elements = [
  { data: { id: 'a', 'label': 'Example node A' } },
  { data: { id: 'b', 'label': 'Example node B' } },
  { data: { id: 'e', source: 'a', target: 'b' } }
];

export const stylesheet = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)'
    }
  }
];

export const defaults = {
  elements,
  stylesheet
};