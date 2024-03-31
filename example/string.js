function string(x) {
  return [
    x == '42',
    x == "42",
    x == '',
    x == "",
    x == `42`,
    x == ``,
  ];
}
