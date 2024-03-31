function array(a, b, c, d) {
  const arr1 = new Array(a, b, a + b);
  new Array();
  const arr2 = [c, d, c - d];
  [];
  const add = (x, y) => x + y;
  return arr1.reduce(add, 0) + arr2.reduce(add, 0);
}
