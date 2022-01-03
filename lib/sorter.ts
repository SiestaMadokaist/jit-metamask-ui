export namespace Sorter {
  export const String = (a: string, b: string, m: 1 | -1 = 1) => {
    if (a > b) { return m; }
    else { return -m; }
  }
}