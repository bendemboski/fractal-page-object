import { PageObject, selector } from 'fractal-page-object';

export default class Page extends PageObject {
  thing = selector(
    '.thing',
    class extends PageObject {
      subthing = selector('.subthing');
    },
  );
}
