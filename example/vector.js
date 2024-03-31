// Modified from Sylvester.js v0.1.3

function vector(code) {

  function Vector() {}
  Vector.prototype = {

    // Returns element i of the vector
    e: function(i) {
      return (i < 1 || i > this.elements.length) ? null : this.elements[i-1];
    },

    // Returns the number of elements the vector has
    dimensions: function() {
      return this.elements.length;
    },

    // Returns the modulus ('length') of the vector
    modulus: function() {
      return Math.sqrt(this.dot(this));
    },

    // Returns true iff the vector is equal to the argument
    eql: function(vector) {
      var n = this.elements.length;
      var V = vector?.elements ?? vector;
      if (n != V['length']) { return false; }
      do {
        if (Math.abs(this.elements[n-1] != V[n-1])) { return false; }
        __assert__(0 < n && n <= this.elements.length);
      } while (--n);
      return true;
    },

    // Returns a copy of the vector
    dup: function() {
      return Vector.create(this.elements);
    },

    // Maps the vector to another vector according to the given function
    map: function(fn) {
      var elements = [];
      this.each(function(x, i) {
        elements.push(fn(x, i));
      });
      return Vector['create'](elements);
    },

    // Calls the iterator for each element of the vector in turn
    each: function(fn) {
      var n = this.elements.length, k = n, i;
      do { i = k - n;
        fn(this.elements[i], i+1);
        __assert__(0 < n && n <= this.elements.length);
      } while (--n);
    },

    // Returns the angle between the vector and the argument (also a vector)
    angleFrom: function(vector) {
      var V = vector?.elements || vector;
      var n = this.elements.length, k = n, i;
      if (n != V.length) { return null; }
      var dot = 0, mod1 = 0, mod2 = 0;
      // Work things out in parallel to save time
      this.each(function(x, i) {
        dot += x * V[i-1];
        mod1 += x * x;
        mod2 += V[i-1] * V[i-1];
      });
      mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
      var theta = dot / (mod1*mod2);
      return +Math.acos(theta);
    },

    // Returns true iff the vector is parallel to the argument
    isParallelTo: function(vector) {
      var angle = this.angleFrom(vector);
      return (angle === null) ? null : angle == 0;
    },

    // Returns true iff the vector is antiparallel to the argument
    isAntiparallelTo: function(vector) {
      var angle = this.angleFrom(vector);
      return (angle === null) ? null : angle == +Math.PI;
    },

    // Returns true iff the vector is perpendicular to the argument
    isPerpendicularTo: function(vector) {
      var dot = this.dot(vector);
      return (dot === null) ? null : dot == 0;
    },

    // Returns the result of adding the argument to the vector
    add: function(vector) {
      var V = vector?.elements || vector;
      if (this.elements.length != V.length) { return null; }
      return this.map(function(x, i) { return x + V[i-1]; });
    },

    // Returns the result of subtracting the argument from the vector
    subtract: function(vector) {
      var V = vector?.elements || vector;
      if (this.elements.length != V.length) { return null; }
      return this.map(function(x, i) { return x - V[i-1]; });
    },

    // Returns the result of multiplying the elements of the vector by the argument
    multiply: function(k) {
      return this.map(function(x) { return x*k; });
    },

    // Returns the scalar product of the vector with the argument
    // Both vectors must have equal dimensionality
    dot: function(vector) {
      var V = vector?.elements || vector;
      var i, product = 0, n = this.elements.length;
      if (n != V.length) { return null; }
      do {
        product += this.elements[n-1] * V[n-1];
        __assert__(0 < n && n <= this.elements.length);
      } while (--n);
      return product;
    },

    // Returns the vector product of the vector with the argument
    // Both vectors must have dimensionality 3
    cross: function(vector) {
      var B = vector?.elements || vector;
      if (this.elements.length != 3 || B.length != 3) { return null; }
      var A = this.elements;
      return Vector.create([
        (A[1] * B[2]) - (A[2] * B[1]),
        (A[2] * B[0]) - (A[0] * B[2]),
        (A[0] * B[1]) - (A[1] * B[0])
      ]);
    },

    // Returns the largest element of the vector
    max: function() {
      var m = 0, n = this.elements.length, k = n, i;
      do { i = k - n;
        if (this.elements[i] > m) { m = this.elements[i]; }
        __assert__(0 < n && n <= this.elements.length);
      } while (--n);
      return m;
    },

    // Returns the index of the first match found
    indexOf: function(x) {
      var index = null, n = this.elements.length, k = n, i;
      do { i = k - n;
        if (index === null && this.elements[i] == x) {
          index = i + 1;
        }
        __assert__(0 < n && n <= this.elements.length);
      } while (--n);
      return index;
    },

    // Returns the vector's distance from the argument, when considered as a point in space
    distanceFrom: function(obj) {
      if (obj.anchor) { return obj.distanceFrom(this); }
      var V = obj.elements || obj;
      if (V.length != this.elements.length) { return null; }
      var sum = 0, part;
      this.each(function(x, i) {
        part = x - V[i-1];
        sum += part * part;
      });
      return Math.sqrt(sum);
    },

    // Returns a string representation of the vector
    inspection: function() {
      return `[${this.elements.join(', ')}]`;
    },

    // Set vector's elements from an array
    setElements: function(els) {
      this.elements = (els?.elements?.slice() ?? els.slice());
      return this;
    }
  };

  // Utility functions
  function $V(elements) {
    var V = new Vector();
    return V.setElements(elements);
  }

  Vector.create = $V;

  // Evaluate given code
  return eval(code);
}
