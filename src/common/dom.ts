import jsdom from 'jsdom';

const dom = new jsdom.JSDOM();
const parser = new dom.window.DOMParser();

export function parseFromString(str: string): Document {
  return parser.parseFromString(str, 'text/html');
} 