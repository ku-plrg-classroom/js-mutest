function cond(n) {
  for (; n == 5;) return 0;
  while (n == 7) return 1;
  let x1 = n || 42;
  do x1++; while (x1 % 2 == 1);
  let x2;
  if (n < 13) x2 = 0;
  else x2 = 1;
  let x3 = n < 21 ? 0 : 1;
  return [x1, x2, x3];
}
