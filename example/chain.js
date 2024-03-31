function chain(obj) {
  return [
    obj?.x,
    obj?.['y'],
    obj.z?.(),
    obj?.x?.y.z,
    obj?.z?.()['x'].y?.z,
  ];
}
