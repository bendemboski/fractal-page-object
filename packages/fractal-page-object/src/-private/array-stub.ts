/* istanbul ignore file */

/**
 * Helper type for array prototype stubbing
 *
 * @see {@link ArrayStub#map} etc.
 */
type WithElement<T> = T & { element: Element };

/**
 * Base class for {@link PageObject} that contains stub implementations of a
 * subset of array methods (the ones that produce a possibly useful value). The
 * actual functionality is handled by the proxy, the implementations aren't
 * important, these are just here for type checking.
 *
 * It really seems like there should be a better way to do this, but I can't
 * figure out how else to make PageObject subclasses look like arrays of
 * `WithElement<this>`.
 *
 * @private
 */
export default class ArrayStub {
  //
  // Array API
  //
  // Here we provide typed stub implementations for a subset of array methods
  // (the ones that produce a possibly useful value). The actual functionality
  // is handled by the proxy, the implementations aren't important, these are
  // just here for type checking.
  //
  // It really seems like there should be a better way to do this, but I can't
  // figure out how else to make PageObject subclasses look like arrays of
  // `WithElement<this>`.
  //

  /**
   * @private
   */
  readonly length: number = 0;
  /**
   * @private
   */
  pop(): WithElement<this> | undefined {
    return undefined;
  }
  /**
   * @private
   */
  concat(...items: ConcatArray<WithElement<this>>[]): WithElement<this>[];
  /**
   * @private
   */
  concat(
    ...items: (WithElement<this> | ConcatArray<WithElement<this>>)[]
  ): WithElement<this>[];
  /**
   * @private
   */
  concat(
    ..._items: (WithElement<this> | ConcatArray<WithElement<this>>)[]
  ): WithElement<this>[] {
    return [];
  }
  /**
   * @private
   */
  reverse(): WithElement<this>[] {
    return [];
  }
  /**
   * @private
   */
  shift(): WithElement<this> | undefined {
    return undefined;
  }
  /**
   * @private
   */
  slice(_start?: number, _end?: number): WithElement<this>[] {
    return [];
  }
  /**
   * @private
   */
  sort(
    _compareFn?: (a: WithElement<this>, b: WithElement<this>) => number
  ): this[] {
    return [];
  }
  /**
   * @private
   */
  indexOf(_searchElement: WithElement<this>, _fromIndex?: number): number {
    return -1;
  }
  /**
   * @private
   */
  lastIndexOf(_searchElement: WithElement<this>, _fromIndex?: number): number {
    return -1;
  }
  /**
   * @private
   */
  every<S extends WithElement<this>>(
    predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => value is S,
    thisArg?: any
  ): this is S[];
  /**
   * @private
   */
  every(
    predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ): boolean;
  /**
   * @private
   */
  every(
    predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ): boolean;
  /**
   * @private
   */
  every(
    _predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ): boolean {
    return false;
  }
  /**
   * @private
   */
  some(
    _predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ): boolean {
    return false;
  }
  /**
   * @private
   */
  forEach(
    _callbackfn: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => void,
    _thisArg?: any
  ): void {}
  /**
   * @private
   */
  map<U>(
    _callbackfn: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => U,
    _thisArg?: any
  ): U[] {
    return [];
  }
  /**
   * @private
   */
  filter<S extends WithElement<this>>(
    predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => value is S,
    thisArg?: any
  ): S[];
  /**
   * @private
   */
  filter(
    predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => unknown,
    thisArg?: any
  ): WithElement<this>[];
  /**
   * @private
   */
  filter(
    _predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ): WithElement<this>[] {
    return [];
  }
  /**
   * @private
   */
  reduce<U>(
    _callbackfn: (
      previousValue: U,
      currentValue: WithElement<this>,
      currentIndex: number,
      array: WithElement<this>[]
    ) => U,
    initialValue: U
  ): U {
    return initialValue;
  }
  /**
   * @private
   */
  reduceRight<U>(
    _callbackfn: (
      previousValue: U,
      currentValue: WithElement<this>,
      currentIndex: number,
      array: WithElement<this>[]
    ) => U,
    initialValue: U
  ): U {
    return initialValue;
  }
  /**
   * @private
   */
  find<S extends WithElement<this>>(
    predicate: (
      this: void,
      value: WithElement<this>,
      index: number,
      obj: WithElement<this>[]
    ) => value is S,
    thisArg?: any
  ): S | undefined;
  /**
   * @private
   */
  find(
    predicate: (
      value: WithElement<this>,
      index: number,
      obj: WithElement<this>[]
    ) => unknown,
    thisArg?: any
  ): WithElement<this> | undefined;
  /**
   * @private
   */
  find(
    _predicate: (
      value: WithElement<this>,
      index: number,
      obj: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ): WithElement<this> | undefined {
    return undefined;
  }
  /**
   * @private
   */
  findIndex(
    _predicate: (
      value: WithElement<this>,
      index: number,
      obj: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ): number {
    return -1;
  }
  /**
   * @private
   */
  includes(_searchElement: WithElement<this>, _fromIndex?: number): boolean {
    return false;
  }
  /**
   * @private
   */
  [Symbol.iterator](): IterableIterator<WithElement<this>> {
    return {} as IterableIterator<WithElement<this>>;
  }
  /**
   * @private
   */
  entries(): IterableIterator<[number, WithElement<this>]> {
    return {} as IterableIterator<[number, WithElement<this>]>;
  }
  /**
   * @private
   */
  keys(): IterableIterator<number> {
    return {} as IterableIterator<number>;
  }
  /**
   * @private
   */
  values(): IterableIterator<WithElement<this>> {
    return {} as IterableIterator<WithElement<this>>;
  }

  /**
   * @private
   */
  readonly [n: number]: this;
}
