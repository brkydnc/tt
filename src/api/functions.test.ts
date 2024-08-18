import { fetchDocument } from "./functions";
import { Dictionary } from "./types";

const words = {
  English: ["tureng", "text", "word", "binary", "computer"],
  [Dictionary.Turkish]: ["merhaba", "yaklaşık", "bilfiil", "esnaf", "deneme"],
  [Dictionary.French]: ["impossible", "salle", "pan", "batterie", "neuf"],
  [Dictionary.Spanish]: ["hola", "dulce", "hielo", "elefante", "libro"],
  [Dictionary.German]: ["nine", "hallo", "deutsch", "mensch", "jein"],
}

// TODO: Run these tests in parallel??
describe("fetchDocument function", () => {
  const native = (d: Dictionary) => async () => {
    const promise = Promise.all(words[d].map(p => fetchDocument(p, d)));
    await expect(promise).resolves.not.toThrow();
  }

  it.concurrent("should fetch turkish words", native(Dictionary.Turkish));
  it.concurrent("should fetch french words", native(Dictionary.French));
  it.concurrent("should fetch spanish words", native(Dictionary.Spanish));
  it.concurrent("should fetch german words", native(Dictionary.German));

  const english = (d: Dictionary) => async () => {
    const promise = Promise.all(words.English.map(p => fetchDocument(p, d)));
    await expect(promise).resolves.not.toThrow();
  }

  it.concurrent("should fetch english words in turkish dictionary", english(Dictionary.Turkish));
  it.concurrent("should fetch english words in french dictionary", english(Dictionary.French));
  it.concurrent("should fetch english words in spanish dictionary", english(Dictionary.Spanish));
  it.concurrent("should fetch english words in german dictionary", english(Dictionary.German));
});

describe("scrapeDocument function", () => {
  const native = (d: Dictionary) => async () => {
    const promise = Promise.all(words[d].map(p => fetchDocument(p, d)));
    await expect(promise).resolves.not.toThrow();
  }

  it.concurrent("should fetch turkish words", native(Dictionary.Turkish));
  it.concurrent("should fetch french words", native(Dictionary.French));
  it.concurrent("should fetch spanish words", native(Dictionary.Spanish));
  it.concurrent("should fetch german words", native(Dictionary.German));

  const english = (d: Dictionary) => async () => {
    const promise = Promise.all(words.English.map(p => fetchDocument(p, d)));
    await expect(promise).resolves.not.toThrow();
  }

  it.concurrent("should fetch english words in turkish dictionary", english(Dictionary.Turkish));
  it.concurrent("should fetch english words in french dictionary", english(Dictionary.French));
  it.concurrent("should fetch english words in spanish dictionary", english(Dictionary.Spanish));
  it.concurrent("should fetch english words in german dictionary", english(Dictionary.German));
});