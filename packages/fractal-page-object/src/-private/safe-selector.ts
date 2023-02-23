/**
 * Make a selector safe to pass to querySelector()/querySelectorAll(). We
 * construct selectors from fragments in each page object, we want to be able to
 * support a page object specifying things like `> .foo`, which isn't
 * technically a valid selector, i.e. will error if passed to
 * querySelector()/querySelectorAll(). So in order to ensure that we can
 * tolerate such selectors, we prepend `:scope `, which will be a no-op for
 * valid selectors, and will turn technically invalid but still sensical
 * selectors like `> .foo` into a valid selector.
 */
export default function safeSelector(selector: string): string {
  return `:scope ${selector}`;
}
