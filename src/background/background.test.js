import { fetchDocument } from "./scrape";
import { Dictionary } from '../types';
import { JSDOM } from "jsdom";

const words = {
  [Dictionary.Turkish]: ["tureng", "text", "word", "binary", "computer"],
  [Dictionary.French]: ["impossible", "salle", "pan", "batterie", "neuf"],
  [Dictionary.Spanish]: ["hola", "dulce", "hielo", "elefante", "libro"],
  [Dictionary.German]: ["nine", "hallo", "deutsch", "mensch", "jein"],
}

// Tests are run in Node.js, so we must use the jsdom parser.
const parseDom = (a, b) => new JSDOM(a, b);
const fetcherFor = dictionary => term => fetchDocument(term, dictionary, parseDom);

const testerFor = (dictionary) => async () => {
  const fetch = fetcherFor(dictionary);
  const promise = Promise.all(words[dictionary].map(fetch));
  await expect(promise).resolves.not.toThrow();
}

describe("documents", () => {
  test("are fetched for turkish", testerFor(Dictionary.Turkish));
  test("are fetched for french", testerFor(Dictionary.French));
  test("are fetched for spanish", testerFor(Dictionary.Spanish));
  test("are fetched for german", testerFor(Dictionary.German));
});
