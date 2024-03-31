function bool(x) {
  return [
    true && x,
    false && x,
    true || x,
    false || x,
    true ? x : 0,
    false ? 0 : x,
  ];
}
