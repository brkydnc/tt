const parser = new DOMParser();

export function parseFromString(str: string): Document {
  return parser.parseFromString(str, 'text/html');
} 