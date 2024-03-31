function block(x) {
  {
    var a = x++;
  }
  function f() {
    return x--;
  }
  if (x > 0) {
    var b = f();
    var c = x;
  } else { }
  return [a, b, c];
}
