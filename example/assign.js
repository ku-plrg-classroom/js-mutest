function assign(x1, x2, x3, x4, x5, x6, x7, x8, x9, x10) {
  let result = 42;
  result += x1;
  result -= x2;
  result *= x3;
  result /= x4;
  result %= x5;
  result <<= x6;
  result >>= x7;
  result &= x8;
  result |= x9;
  result ??= x10;
  return result;
}
