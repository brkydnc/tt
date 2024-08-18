// Any breaking layout change visible to our extension must be handled
// immediately, by hand. So in order to recognize changes easily, this 
// exception should be thrown whenever a DOM element retrieval fails.
// 
// For example, a typical Tureng page contains a search input field, with an id
// of "searchTerm". Consider the layout has changed and `getElementById("searchTerm")`
// no longer returns a valid input field. At that moment, this error should be
// thrown.
export class ElementNotFoundError extends Error {
  constructor() {
    super("Element not found, DOM layout might have been changed.")
    this.name = "ElementNotFoundError";
  }
}