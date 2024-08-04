"use strict";
(() => {
  var At = Object.create;
  var ct = Object.defineProperty;
  var Tt = Object.getOwnPropertyDescriptor;
  var Rt = Object.getOwnPropertyNames;
  var Ot = Object.getPrototypeOf, kt = Object.prototype.hasOwnProperty;
  var Xe = /* @__PURE__ */ ((ve) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(ve, {
    get: (le, be) => (typeof require < "u" ? require : le)[be]
  }) : ve)(function(ve) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + ve + '" is not supported');
  });
  var It = (ve, le) => () => (le || ve((le = { exports: {} }).exports, le), le.exports);
  var Lt = (ve, le, be, y) => {
    if (le && typeof le == "object" || typeof le == "function")
      for (let H of Rt(le))
        !kt.call(ve, H) && H !== be && ct(ve, H, { get: () => le[H], enumerable: !(y = Tt(le, H)) || y.enumerable });
    return ve;
  };
  var Ft = (ve, le, be) => (be = ve != null ? At(Ot(ve)) : {}, Lt(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    le || !ve || !ve.__esModule ? ct(be, "default", { value: ve, enumerable: !0 }) : be,
    ve
  ));

  // node_modules/pngjs/browser.js
  var Et = It((mt, ut) => {
    (function(ve) {
      if (typeof mt == "object" && typeof ut < "u")
        ut.exports = ve();
      else if (typeof define == "function" && define.amd)
        define([], ve);
      else {
        var le;
        typeof window < "u" ? le = window : typeof global < "u" ? le = global : typeof self < "u" ? le = self : le = this, le.png = ve();
      }
    })(function() {
      var ve, le, be;
      return (/* @__PURE__ */ function() {
        function y(H, s, w) {
          function g(d, i) {
            if (!s[d]) {
              if (!H[d]) {
                var o = typeof Xe == "function" && Xe;
                if (!i && o) return o(d, !0);
                if (T) return T(d, !0);
                var a = new Error("Cannot find module '" + d + "'");
                throw a.code = "MODULE_NOT_FOUND", a;
              }
              var f = s[d] = { exports: {} };
              H[d][0].call(f.exports, function(p) {
                var u = H[d][1][p];
                return g(u || p);
              }, f, f.exports, y, H, s, w);
            }
            return s[d].exports;
          }
          for (var T = typeof Xe == "function" && Xe, m = 0; m < w.length; m++) g(w[m]);
          return g;
        }
        return y;
      }())({ 1: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = y("./interlace"), T = [
              // 0 - dummy entry
              function() {
              },
              // 1 - L
              // 0: 0, 1: 0, 2: 0, 3: 0xff
              function(a, f, p, u) {
                if (u === f.length)
                  throw new Error("Ran out of data");
                let c = f[u];
                a[p] = c, a[p + 1] = c, a[p + 2] = c, a[p + 3] = 255;
              },
              // 2 - LA
              // 0: 0, 1: 0, 2: 0, 3: 1
              function(a, f, p, u) {
                if (u + 1 >= f.length)
                  throw new Error("Ran out of data");
                let c = f[u];
                a[p] = c, a[p + 1] = c, a[p + 2] = c, a[p + 3] = f[u + 1];
              },
              // 3 - RGB
              // 0: 0, 1: 1, 2: 2, 3: 0xff
              function(a, f, p, u) {
                if (u + 2 >= f.length)
                  throw new Error("Ran out of data");
                a[p] = f[u], a[p + 1] = f[u + 1], a[p + 2] = f[u + 2], a[p + 3] = 255;
              },
              // 4 - RGBA
              // 0: 0, 1: 1, 2: 2, 3: 3
              function(a, f, p, u) {
                if (u + 3 >= f.length)
                  throw new Error("Ran out of data");
                a[p] = f[u], a[p + 1] = f[u + 1], a[p + 2] = f[u + 2], a[p + 3] = f[u + 3];
              }
            ], m = [
              // 0 - dummy entry
              function() {
              },
              // 1 - L
              // 0: 0, 1: 0, 2: 0, 3: 0xff
              function(a, f, p, u) {
                let c = f[0];
                a[p] = c, a[p + 1] = c, a[p + 2] = c, a[p + 3] = u;
              },
              // 2 - LA
              // 0: 0, 1: 0, 2: 0, 3: 1
              function(a, f, p) {
                let u = f[0];
                a[p] = u, a[p + 1] = u, a[p + 2] = u, a[p + 3] = f[1];
              },
              // 3 - RGB
              // 0: 0, 1: 1, 2: 2, 3: 0xff
              function(a, f, p, u) {
                a[p] = f[0], a[p + 1] = f[1], a[p + 2] = f[2], a[p + 3] = u;
              },
              // 4 - RGBA
              // 0: 0, 1: 1, 2: 2, 3: 3
              function(a, f, p) {
                a[p] = f[0], a[p + 1] = f[1], a[p + 2] = f[2], a[p + 3] = f[3];
              }
            ];
            function d(a, f) {
              let p = [], u = 0;
              function c() {
                if (u === a.length)
                  throw new Error("Ran out of data");
                let b = a[u];
                u++;
                let R, S, O, L, E, F, I, M;
                switch (f) {
                  default:
                    throw new Error("unrecognised depth");
                  case 16:
                    I = a[u], u++, p.push((b << 8) + I);
                    break;
                  case 4:
                    I = b & 15, M = b >> 4, p.push(M, I);
                    break;
                  case 2:
                    E = b & 3, F = b >> 2 & 3, I = b >> 4 & 3, M = b >> 6 & 3, p.push(M, I, F, E);
                    break;
                  case 1:
                    R = b & 1, S = b >> 1 & 1, O = b >> 2 & 1, L = b >> 3 & 1, E = b >> 4 & 1, F = b >> 5 & 1, I = b >> 6 & 1, M = b >> 7 & 1, p.push(M, I, F, E, L, O, S, R);
                    break;
                }
              }
              return {
                get: function(b) {
                  for (; p.length < b; )
                    c();
                  let R = p.slice(0, b);
                  return p = p.slice(b), R;
                },
                resetAfterLine: function() {
                  p.length = 0;
                },
                end: function() {
                  if (u !== a.length)
                    throw new Error("extra data found");
                }
              };
            }
            function i(a, f, p, u, c, b) {
              let R = a.width, S = a.height, O = a.index;
              for (let L = 0; L < S; L++)
                for (let E = 0; E < R; E++) {
                  let F = p(E, L, O);
                  T[u](f, c, F, b), b += u;
                }
              return b;
            }
            function o(a, f, p, u, c, b) {
              let R = a.width, S = a.height, O = a.index;
              for (let L = 0; L < S; L++) {
                for (let E = 0; E < R; E++) {
                  let F = c.get(u), I = p(E, L, O);
                  m[u](f, F, I, b);
                }
                c.resetAfterLine();
              }
            }
            s.dataToBitMap = function(a, f) {
              let p = f.width, u = f.height, c = f.depth, b = f.bpp, R = f.interlace, S;
              c !== 8 && (S = d(a, c));
              let O;
              c <= 8 ? O = w.alloc(p * u * 4) : O = new Uint16Array(p * u * 4);
              let L = Math.pow(2, c) - 1, E = 0, F, I;
              if (R)
                F = g.getImagePasses(p, u), I = g.getInterlaceIterator(p, u);
              else {
                let M = 0;
                I = function() {
                  let N = M;
                  return M += 4, N;
                }, F = [{ width: p, height: u }];
              }
              for (let M = 0; M < F.length; M++)
                c === 8 ? E = i(
                  F[M],
                  O,
                  I,
                  b,
                  a,
                  E
                ) : o(
                  F[M],
                  O,
                  I,
                  b,
                  S,
                  L
                );
              if (c === 8) {
                if (E !== a.length)
                  throw new Error("extra data found");
              } else
                S.end();
              return O;
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./interlace": 11, buffer: 32 }], 2: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = y("./constants");
            H.exports = function(T, m, d, i) {
              let o = [g.COLORTYPE_COLOR_ALPHA, g.COLORTYPE_ALPHA].indexOf(
                i.colorType
              ) !== -1;
              if (i.colorType === i.inputColorType) {
                let L = function() {
                  let E = new ArrayBuffer(2);
                  return new DataView(E).setInt16(
                    0,
                    256,
                    !0
                    /* littleEndian */
                  ), new Int16Array(E)[0] !== 256;
                }();
                if (i.bitDepth === 8 || i.bitDepth === 16 && L)
                  return T;
              }
              let a = i.bitDepth !== 16 ? T : new Uint16Array(T.buffer), f = 255, p = g.COLORTYPE_TO_BPP_MAP[i.inputColorType];
              p === 4 && !i.inputHasAlpha && (p = 3);
              let u = g.COLORTYPE_TO_BPP_MAP[i.colorType];
              i.bitDepth === 16 && (f = 65535, u *= 2);
              let c = w.alloc(m * d * u), b = 0, R = 0, S = i.bgColor || {};
              S.red === void 0 && (S.red = f), S.green === void 0 && (S.green = f), S.blue === void 0 && (S.blue = f);
              function O() {
                let L, E, F, I = f;
                switch (i.inputColorType) {
                  case g.COLORTYPE_COLOR_ALPHA:
                    I = a[b + 3], L = a[b], E = a[b + 1], F = a[b + 2];
                    break;
                  case g.COLORTYPE_COLOR:
                    L = a[b], E = a[b + 1], F = a[b + 2];
                    break;
                  case g.COLORTYPE_ALPHA:
                    I = a[b + 1], L = a[b], E = L, F = L;
                    break;
                  case g.COLORTYPE_GRAYSCALE:
                    L = a[b], E = L, F = L;
                    break;
                  default:
                    throw new Error(
                      "input color type:" + i.inputColorType + " is not supported at present"
                    );
                }
                return i.inputHasAlpha && (o || (I /= f, L = Math.min(
                  Math.max(Math.round((1 - I) * S.red + I * L), 0),
                  f
                ), E = Math.min(
                  Math.max(Math.round((1 - I) * S.green + I * E), 0),
                  f
                ), F = Math.min(
                  Math.max(Math.round((1 - I) * S.blue + I * F), 0),
                  f
                ))), { red: L, green: E, blue: F, alpha: I };
              }
              for (let L = 0; L < d; L++)
                for (let E = 0; E < m; E++) {
                  let F = O(a, b);
                  switch (i.colorType) {
                    case g.COLORTYPE_COLOR_ALPHA:
                    case g.COLORTYPE_COLOR:
                      i.bitDepth === 8 ? (c[R] = F.red, c[R + 1] = F.green, c[R + 2] = F.blue, o && (c[R + 3] = F.alpha)) : (c.writeUInt16BE(F.red, R), c.writeUInt16BE(F.green, R + 2), c.writeUInt16BE(F.blue, R + 4), o && c.writeUInt16BE(F.alpha, R + 6));
                      break;
                    case g.COLORTYPE_ALPHA:
                    case g.COLORTYPE_GRAYSCALE: {
                      let I = (F.red + F.green + F.blue) / 3;
                      i.bitDepth === 8 ? (c[R] = I, o && (c[R + 1] = F.alpha)) : (c.writeUInt16BE(I, R), o && c.writeUInt16BE(F.alpha, R + 2));
                      break;
                    }
                    default:
                      throw new Error("unrecognised color Type " + i.colorType);
                  }
                  b += p, R += u;
                }
              return c;
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./constants": 4, buffer: 32 }], 3: [function(y, H, s) {
        (function(w, g) {
          (function() {
            "use strict";
            let T = y("util"), m = y("stream"), d = H.exports = function() {
              m.call(this), this._buffers = [], this._buffered = 0, this._reads = [], this._paused = !1, this._encoding = "utf8", this.writable = !0;
            };
            T.inherits(d, m), d.prototype.read = function(i, o) {
              this._reads.push({
                length: Math.abs(i),
                // if length < 0 then at most this length
                allowLess: i < 0,
                func: o
              }), w.nextTick(
                function() {
                  this._process(), this._paused && this._reads && this._reads.length > 0 && (this._paused = !1, this.emit("drain"));
                }.bind(this)
              );
            }, d.prototype.write = function(i, o) {
              if (!this.writable)
                return this.emit("error", new Error("Stream not writable")), !1;
              let a;
              return g.isBuffer(i) ? a = i : a = g.from(i, o || this._encoding), this._buffers.push(a), this._buffered += a.length, this._process(), this._reads && this._reads.length === 0 && (this._paused = !0), this.writable && !this._paused;
            }, d.prototype.end = function(i, o) {
              i && this.write(i, o), this.writable = !1, this._buffers && (this._buffers.length === 0 ? this._end() : (this._buffers.push(null), this._process()));
            }, d.prototype.destroySoon = d.prototype.end, d.prototype._end = function() {
              this._reads.length > 0 && this.emit("error", new Error("Unexpected end of input")), this.destroy();
            }, d.prototype.destroy = function() {
              this._buffers && (this.writable = !1, this._reads = null, this._buffers = null, this.emit("close"));
            }, d.prototype._processReadAllowingLess = function(i) {
              this._reads.shift();
              let o = this._buffers[0];
              o.length > i.length ? (this._buffered -= i.length, this._buffers[0] = o.slice(i.length), i.func.call(this, o.slice(0, i.length))) : (this._buffered -= o.length, this._buffers.shift(), i.func.call(this, o));
            }, d.prototype._processRead = function(i) {
              this._reads.shift();
              let o = 0, a = 0, f = g.alloc(i.length);
              for (; o < i.length; ) {
                let p = this._buffers[a++], u = Math.min(p.length, i.length - o);
                p.copy(f, o, 0, u), o += u, u !== p.length && (this._buffers[--a] = p.slice(u));
              }
              a > 0 && this._buffers.splice(0, a), this._buffered -= i.length, i.func.call(this, f);
            }, d.prototype._process = function() {
              try {
                for (; this._buffered > 0 && this._reads && this._reads.length > 0; ) {
                  let i = this._reads[0];
                  if (i.allowLess)
                    this._processReadAllowingLess(i);
                  else if (this._buffered >= i.length)
                    this._processRead(i);
                  else
                    break;
                }
                this._buffers && !this.writable && this._end();
              } catch (i) {
                this.emit("error", i);
              }
            };
          }).call(this);
        }).call(this, y("_process"), y("buffer").Buffer);
      }, { _process: 63, buffer: 32, stream: 65, util: 84 }], 4: [function(y, H, s) {
        "use strict";
        H.exports = {
          PNG_SIGNATURE: [137, 80, 78, 71, 13, 10, 26, 10],
          TYPE_IHDR: 1229472850,
          TYPE_IEND: 1229278788,
          TYPE_IDAT: 1229209940,
          TYPE_PLTE: 1347179589,
          TYPE_tRNS: 1951551059,
          // eslint-disable-line camelcase
          TYPE_gAMA: 1732332865,
          // eslint-disable-line camelcase
          // color-type bits
          COLORTYPE_GRAYSCALE: 0,
          COLORTYPE_PALETTE: 1,
          COLORTYPE_COLOR: 2,
          COLORTYPE_ALPHA: 4,
          // e.g. grayscale and alpha
          // color-type combinations
          COLORTYPE_PALETTE_COLOR: 3,
          COLORTYPE_COLOR_ALPHA: 6,
          COLORTYPE_TO_BPP_MAP: {
            0: 1,
            2: 3,
            3: 1,
            4: 2,
            6: 4
          },
          GAMMA_DIVISION: 1e5
        };
      }, {}], 5: [function(y, H, s) {
        "use strict";
        let w = [];
        (function() {
          for (let T = 0; T < 256; T++) {
            let m = T;
            for (let d = 0; d < 8; d++)
              m & 1 ? m = 3988292384 ^ m >>> 1 : m = m >>> 1;
            w[T] = m;
          }
        })();
        let g = H.exports = function() {
          this._crc = -1;
        };
        g.prototype.write = function(T) {
          for (let m = 0; m < T.length; m++)
            this._crc = w[(this._crc ^ T[m]) & 255] ^ this._crc >>> 8;
          return !0;
        }, g.prototype.crc32 = function() {
          return this._crc ^ -1;
        }, g.crc32 = function(T) {
          let m = -1;
          for (let d = 0; d < T.length; d++)
            m = w[(m ^ T[d]) & 255] ^ m >>> 8;
          return m ^ -1;
        };
      }, {}], 6: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = y("./paeth-predictor");
            function T(S, O, L, E, F) {
              for (let I = 0; I < L; I++)
                E[F + I] = S[O + I];
            }
            function m(S, O, L) {
              let E = 0, F = O + L;
              for (let I = O; I < F; I++)
                E += Math.abs(S[I]);
              return E;
            }
            function d(S, O, L, E, F, I) {
              for (let M = 0; M < L; M++) {
                let N = M >= I ? S[O + M - I] : 0, G = S[O + M] - N;
                E[F + M] = G;
              }
            }
            function i(S, O, L, E) {
              let F = 0;
              for (let I = 0; I < L; I++) {
                let M = I >= E ? S[O + I - E] : 0, N = S[O + I] - M;
                F += Math.abs(N);
              }
              return F;
            }
            function o(S, O, L, E, F) {
              for (let I = 0; I < L; I++) {
                let M = O > 0 ? S[O + I - L] : 0, N = S[O + I] - M;
                E[F + I] = N;
              }
            }
            function a(S, O, L) {
              let E = 0, F = O + L;
              for (let I = O; I < F; I++) {
                let M = O > 0 ? S[I - L] : 0, N = S[I] - M;
                E += Math.abs(N);
              }
              return E;
            }
            function f(S, O, L, E, F, I) {
              for (let M = 0; M < L; M++) {
                let N = M >= I ? S[O + M - I] : 0, G = O > 0 ? S[O + M - L] : 0, W = S[O + M] - (N + G >> 1);
                E[F + M] = W;
              }
            }
            function p(S, O, L, E) {
              let F = 0;
              for (let I = 0; I < L; I++) {
                let M = I >= E ? S[O + I - E] : 0, N = O > 0 ? S[O + I - L] : 0, G = S[O + I] - (M + N >> 1);
                F += Math.abs(G);
              }
              return F;
            }
            function u(S, O, L, E, F, I) {
              for (let M = 0; M < L; M++) {
                let N = M >= I ? S[O + M - I] : 0, G = O > 0 ? S[O + M - L] : 0, W = O > 0 && M >= I ? S[O + M - (L + I)] : 0, Q = S[O + M] - g(N, G, W);
                E[F + M] = Q;
              }
            }
            function c(S, O, L, E) {
              let F = 0;
              for (let I = 0; I < L; I++) {
                let M = I >= E ? S[O + I - E] : 0, N = O > 0 ? S[O + I - L] : 0, G = O > 0 && I >= E ? S[O + I - (L + E)] : 0, W = S[O + I] - g(M, N, G);
                F += Math.abs(W);
              }
              return F;
            }
            let b = {
              0: T,
              1: d,
              2: o,
              3: f,
              4: u
            }, R = {
              0: m,
              1: i,
              2: a,
              3: p,
              4: c
            };
            H.exports = function(S, O, L, E, F) {
              let I;
              if (!("filterType" in E) || E.filterType === -1)
                I = [0, 1, 2, 3, 4];
              else if (typeof E.filterType == "number")
                I = [E.filterType];
              else
                throw new Error("unrecognised filter types");
              E.bitDepth === 16 && (F *= 2);
              let M = O * F, N = 0, G = 0, W = w.alloc((M + 1) * L), Q = I[0];
              for (let re = 0; re < L; re++) {
                if (I.length > 1) {
                  let ae = 1 / 0;
                  for (let C = 0; C < I.length; C++) {
                    let h = R[I[C]](S, G, M, F);
                    h < ae && (Q = I[C], ae = h);
                  }
                }
                W[N] = Q, N++, b[Q](S, G, M, W, N, F), N += M, G += M;
              }
              return W;
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./paeth-predictor": 15, buffer: 32 }], 7: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = y("util"), T = y("./chunkstream"), m = y("./filter-parse"), d = H.exports = function(i) {
              T.call(this);
              let o = [], a = this;
              this._filter = new m(i, {
                read: this.read.bind(this),
                write: function(f) {
                  o.push(f);
                },
                complete: function() {
                  a.emit("complete", w.concat(o));
                }
              }), this._filter.start();
            };
            g.inherits(d, T);
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./chunkstream": 3, "./filter-parse": 9, buffer: 32, util: 84 }], 8: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = y("./sync-reader"), T = y("./filter-parse");
            s.process = function(m, d) {
              let i = [], o = new g(m);
              return new T(d, {
                read: o.read.bind(o),
                write: function(f) {
                  i.push(f);
                },
                complete: function() {
                }
              }).start(), o.process(), w.concat(i);
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./filter-parse": 9, "./sync-reader": 22, buffer: 32 }], 9: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = y("./interlace"), T = y("./paeth-predictor");
            function m(i, o, a) {
              let f = i * o;
              return a !== 8 && (f = Math.ceil(f / (8 / a))), f;
            }
            let d = H.exports = function(i, o) {
              let a = i.width, f = i.height, p = i.interlace, u = i.bpp, c = i.depth;
              if (this.read = o.read, this.write = o.write, this.complete = o.complete, this._imageIndex = 0, this._images = [], p) {
                let b = g.getImagePasses(a, f);
                for (let R = 0; R < b.length; R++)
                  this._images.push({
                    byteWidth: m(b[R].width, u, c),
                    height: b[R].height,
                    lineIndex: 0
                  });
              } else
                this._images.push({
                  byteWidth: m(a, u, c),
                  height: f,
                  lineIndex: 0
                });
              c === 8 ? this._xComparison = u : c === 16 ? this._xComparison = u * 2 : this._xComparison = 1;
            };
            d.prototype.start = function() {
              this.read(
                this._images[this._imageIndex].byteWidth + 1,
                this._reverseFilterLine.bind(this)
              );
            }, d.prototype._unFilterType1 = function(i, o, a) {
              let f = this._xComparison, p = f - 1;
              for (let u = 0; u < a; u++) {
                let c = i[1 + u], b = u > p ? o[u - f] : 0;
                o[u] = c + b;
              }
            }, d.prototype._unFilterType2 = function(i, o, a) {
              let f = this._lastLine;
              for (let p = 0; p < a; p++) {
                let u = i[1 + p], c = f ? f[p] : 0;
                o[p] = u + c;
              }
            }, d.prototype._unFilterType3 = function(i, o, a) {
              let f = this._xComparison, p = f - 1, u = this._lastLine;
              for (let c = 0; c < a; c++) {
                let b = i[1 + c], R = u ? u[c] : 0, S = c > p ? o[c - f] : 0, O = Math.floor((S + R) / 2);
                o[c] = b + O;
              }
            }, d.prototype._unFilterType4 = function(i, o, a) {
              let f = this._xComparison, p = f - 1, u = this._lastLine;
              for (let c = 0; c < a; c++) {
                let b = i[1 + c], R = u ? u[c] : 0, S = c > p ? o[c - f] : 0, O = c > p && u ? u[c - f] : 0, L = T(S, R, O);
                o[c] = b + L;
              }
            }, d.prototype._reverseFilterLine = function(i) {
              let o = i[0], a, f = this._images[this._imageIndex], p = f.byteWidth;
              if (o === 0)
                a = i.slice(1, p + 1);
              else
                switch (a = w.alloc(p), o) {
                  case 1:
                    this._unFilterType1(i, a, p);
                    break;
                  case 2:
                    this._unFilterType2(i, a, p);
                    break;
                  case 3:
                    this._unFilterType3(i, a, p);
                    break;
                  case 4:
                    this._unFilterType4(i, a, p);
                    break;
                  default:
                    throw new Error("Unrecognised filter type - " + o);
                }
              this.write(a), f.lineIndex++, f.lineIndex >= f.height ? (this._lastLine = null, this._imageIndex++, f = this._images[this._imageIndex]) : this._lastLine = a, f ? this.read(f.byteWidth + 1, this._reverseFilterLine.bind(this)) : (this._lastLine = null, this.complete());
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./interlace": 11, "./paeth-predictor": 15, buffer: 32 }], 10: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            function g(d, i, o, a, f) {
              let p = 0;
              for (let u = 0; u < a; u++)
                for (let c = 0; c < o; c++) {
                  let b = f[d[p]];
                  if (!b)
                    throw new Error("index " + d[p] + " not in palette");
                  for (let R = 0; R < 4; R++)
                    i[p + R] = b[R];
                  p += 4;
                }
            }
            function T(d, i, o, a, f) {
              let p = 0;
              for (let u = 0; u < a; u++)
                for (let c = 0; c < o; c++) {
                  let b = !1;
                  if (f.length === 1 ? f[0] === d[p] && (b = !0) : f[0] === d[p] && f[1] === d[p + 1] && f[2] === d[p + 2] && (b = !0), b)
                    for (let R = 0; R < 4; R++)
                      i[p + R] = 0;
                  p += 4;
                }
            }
            function m(d, i, o, a, f) {
              let p = 255, u = Math.pow(2, f) - 1, c = 0;
              for (let b = 0; b < a; b++)
                for (let R = 0; R < o; R++) {
                  for (let S = 0; S < 4; S++)
                    i[c + S] = Math.floor(
                      d[c + S] * p / u + 0.5
                    );
                  c += 4;
                }
            }
            H.exports = function(d, i, o = !1) {
              let a = i.depth, f = i.width, p = i.height, u = i.colorType, c = i.transColor, b = i.palette, R = d;
              return u === 3 ? g(d, R, f, p, b) : (c && T(d, R, f, p, c), a !== 8 && !o && (a === 16 && (R = w.alloc(f * p * 4)), m(d, R, f, p, a))), R;
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { buffer: 32 }], 11: [function(y, H, s) {
        "use strict";
        let w = [
          {
            // pass 1 - 1px
            x: [0],
            y: [0]
          },
          {
            // pass 2 - 1px
            x: [4],
            y: [0]
          },
          {
            // pass 3 - 2px
            x: [0, 4],
            y: [4]
          },
          {
            // pass 4 - 4px
            x: [2, 6],
            y: [0, 4]
          },
          {
            // pass 5 - 8px
            x: [0, 2, 4, 6],
            y: [2, 6]
          },
          {
            // pass 6 - 16px
            x: [1, 3, 5, 7],
            y: [0, 2, 4, 6]
          },
          {
            // pass 7 - 32px
            x: [0, 1, 2, 3, 4, 5, 6, 7],
            y: [1, 3, 5, 7]
          }
        ];
        s.getImagePasses = function(g, T) {
          let m = [], d = g % 8, i = T % 8, o = (g - d) / 8, a = (T - i) / 8;
          for (let f = 0; f < w.length; f++) {
            let p = w[f], u = o * p.x.length, c = a * p.y.length;
            for (let b = 0; b < p.x.length && p.x[b] < d; b++)
              u++;
            for (let b = 0; b < p.y.length && p.y[b] < i; b++)
              c++;
            u > 0 && c > 0 && m.push({ width: u, height: c, index: f });
          }
          return m;
        }, s.getInterlaceIterator = function(g) {
          return function(T, m, d) {
            let i = T % w[d].x.length, o = (T - i) / w[d].x.length * 8 + w[d].x[i], a = m % w[d].y.length, f = (m - a) / w[d].y.length * 8 + w[d].y[a];
            return o * 4 + f * g * 4;
          };
        };
      }, {}], 12: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = y("util"), T = y("stream"), m = y("./constants"), d = y("./packer"), i = H.exports = function(o) {
              T.call(this);
              let a = o || {};
              this._packer = new d(a), this._deflate = this._packer.createDeflate(), this.readable = !0;
            };
            g.inherits(i, T), i.prototype.pack = function(o, a, f, p) {
              this.emit("data", w.from(m.PNG_SIGNATURE)), this.emit("data", this._packer.packIHDR(a, f)), p && this.emit("data", this._packer.packGAMA(p));
              let u = this._packer.filterData(o, a, f);
              this._deflate.on("error", this.emit.bind(this, "error")), this._deflate.on(
                "data",
                function(c) {
                  this.emit("data", this._packer.packIDAT(c));
                }.bind(this)
              ), this._deflate.on(
                "end",
                function() {
                  this.emit("data", this._packer.packIEND()), this.emit("end");
                }.bind(this)
              ), this._deflate.end(u);
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./constants": 4, "./packer": 14, buffer: 32, stream: 65, util: 84 }], 13: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = !0, T = y("zlib");
            T.deflateSync || (g = !1);
            let m = y("./constants"), d = y("./packer");
            H.exports = function(i, o) {
              if (!g)
                throw new Error(
                  "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
                );
              let a = o || {}, f = new d(a), p = [];
              p.push(w.from(m.PNG_SIGNATURE)), p.push(f.packIHDR(i.width, i.height)), i.gamma && p.push(f.packGAMA(i.gamma));
              let u = f.filterData(
                i.data,
                i.width,
                i.height
              ), c = T.deflateSync(
                u,
                f.getDeflateOptions()
              );
              if (u = null, !c || !c.length)
                throw new Error("bad png - invalid compressed data response");
              return p.push(f.packIDAT(c)), p.push(f.packIEND()), w.concat(p);
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./constants": 4, "./packer": 14, buffer: 32, zlib: 31 }], 14: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = y("./constants"), T = y("./crc"), m = y("./bitpacker"), d = y("./filter-pack"), i = y("zlib"), o = H.exports = function(a) {
              if (this._options = a, a.deflateChunkSize = a.deflateChunkSize || 32 * 1024, a.deflateLevel = a.deflateLevel != null ? a.deflateLevel : 9, a.deflateStrategy = a.deflateStrategy != null ? a.deflateStrategy : 3, a.inputHasAlpha = a.inputHasAlpha != null ? a.inputHasAlpha : !0, a.deflateFactory = a.deflateFactory || i.createDeflate, a.bitDepth = a.bitDepth || 8, a.colorType = typeof a.colorType == "number" ? a.colorType : g.COLORTYPE_COLOR_ALPHA, a.inputColorType = typeof a.inputColorType == "number" ? a.inputColorType : g.COLORTYPE_COLOR_ALPHA, [
                g.COLORTYPE_GRAYSCALE,
                g.COLORTYPE_COLOR,
                g.COLORTYPE_COLOR_ALPHA,
                g.COLORTYPE_ALPHA
              ].indexOf(a.colorType) === -1)
                throw new Error(
                  "option color type:" + a.colorType + " is not supported at present"
                );
              if ([
                g.COLORTYPE_GRAYSCALE,
                g.COLORTYPE_COLOR,
                g.COLORTYPE_COLOR_ALPHA,
                g.COLORTYPE_ALPHA
              ].indexOf(a.inputColorType) === -1)
                throw new Error(
                  "option input color type:" + a.inputColorType + " is not supported at present"
                );
              if (a.bitDepth !== 8 && a.bitDepth !== 16)
                throw new Error(
                  "option bit depth:" + a.bitDepth + " is not supported at present"
                );
            };
            o.prototype.getDeflateOptions = function() {
              return {
                chunkSize: this._options.deflateChunkSize,
                level: this._options.deflateLevel,
                strategy: this._options.deflateStrategy
              };
            }, o.prototype.createDeflate = function() {
              return this._options.deflateFactory(this.getDeflateOptions());
            }, o.prototype.filterData = function(a, f, p) {
              let u = m(a, f, p, this._options), c = g.COLORTYPE_TO_BPP_MAP[this._options.colorType];
              return d(u, f, p, this._options, c);
            }, o.prototype._packChunk = function(a, f) {
              let p = f ? f.length : 0, u = w.alloc(p + 12);
              return u.writeUInt32BE(p, 0), u.writeUInt32BE(a, 4), f && f.copy(u, 8), u.writeInt32BE(
                T.crc32(u.slice(4, u.length - 4)),
                u.length - 4
              ), u;
            }, o.prototype.packGAMA = function(a) {
              let f = w.alloc(4);
              return f.writeUInt32BE(Math.floor(a * g.GAMMA_DIVISION), 0), this._packChunk(g.TYPE_gAMA, f);
            }, o.prototype.packIHDR = function(a, f) {
              let p = w.alloc(13);
              return p.writeUInt32BE(a, 0), p.writeUInt32BE(f, 4), p[8] = this._options.bitDepth, p[9] = this._options.colorType, p[10] = 0, p[11] = 0, p[12] = 0, this._packChunk(g.TYPE_IHDR, p);
            }, o.prototype.packIDAT = function(a) {
              return this._packChunk(g.TYPE_IDAT, a);
            }, o.prototype.packIEND = function() {
              return this._packChunk(g.TYPE_IEND, null);
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./bitpacker": 2, "./constants": 4, "./crc": 5, "./filter-pack": 6, buffer: 32, zlib: 31 }], 15: [function(y, H, s) {
        "use strict";
        H.exports = function(g, T, m) {
          let d = g + T - m, i = Math.abs(d - g), o = Math.abs(d - T), a = Math.abs(d - m);
          return i <= o && i <= a ? g : o <= a ? T : m;
        };
      }, {}], 16: [function(y, H, s) {
        "use strict";
        let w = y("util"), g = y("zlib"), T = y("./chunkstream"), m = y("./filter-parse-async"), d = y("./parser"), i = y("./bitmapper"), o = y("./format-normaliser"), a = H.exports = function(f) {
          T.call(this), this._parser = new d(f, {
            read: this.read.bind(this),
            error: this._handleError.bind(this),
            metadata: this._handleMetaData.bind(this),
            gamma: this.emit.bind(this, "gamma"),
            palette: this._handlePalette.bind(this),
            transColor: this._handleTransColor.bind(this),
            finished: this._finished.bind(this),
            inflateData: this._inflateData.bind(this),
            simpleTransparency: this._simpleTransparency.bind(this),
            headersFinished: this._headersFinished.bind(this)
          }), this._options = f, this.writable = !0, this._parser.start();
        };
        w.inherits(a, T), a.prototype._handleError = function(f) {
          this.emit("error", f), this.writable = !1, this.destroy(), this._inflate && this._inflate.destroy && this._inflate.destroy(), this._filter && (this._filter.destroy(), this._filter.on("error", function() {
          })), this.errord = !0;
        }, a.prototype._inflateData = function(f) {
          if (!this._inflate)
            if (this._bitmapInfo.interlace)
              this._inflate = g.createInflate(), this._inflate.on("error", this.emit.bind(this, "error")), this._filter.on("complete", this._complete.bind(this)), this._inflate.pipe(this._filter);
            else {
              let u = ((this._bitmapInfo.width * this._bitmapInfo.bpp * this._bitmapInfo.depth + 7 >> 3) + 1) * this._bitmapInfo.height, c = Math.max(u, g.Z_MIN_CHUNK);
              this._inflate = g.createInflate({ chunkSize: c });
              let b = u, R = this.emit.bind(this, "error");
              this._inflate.on("error", function(O) {
                b && R(O);
              }), this._filter.on("complete", this._complete.bind(this));
              let S = this._filter.write.bind(this._filter);
              this._inflate.on("data", function(O) {
                b && (O.length > b && (O = O.slice(0, b)), b -= O.length, S(O));
              }), this._inflate.on("end", this._filter.end.bind(this._filter));
            }
          this._inflate.write(f);
        }, a.prototype._handleMetaData = function(f) {
          this._metaData = f, this._bitmapInfo = Object.create(f), this._filter = new m(this._bitmapInfo);
        }, a.prototype._handleTransColor = function(f) {
          this._bitmapInfo.transColor = f;
        }, a.prototype._handlePalette = function(f) {
          this._bitmapInfo.palette = f;
        }, a.prototype._simpleTransparency = function() {
          this._metaData.alpha = !0;
        }, a.prototype._headersFinished = function() {
          this.emit("metadata", this._metaData);
        }, a.prototype._finished = function() {
          this.errord || (this._inflate ? this._inflate.end() : this.emit("error", "No Inflate block"));
        }, a.prototype._complete = function(f) {
          if (this.errord)
            return;
          let p;
          try {
            let u = i.dataToBitMap(f, this._bitmapInfo);
            p = o(
              u,
              this._bitmapInfo,
              this._options.skipRescale
            ), u = null;
          } catch (u) {
            this._handleError(u);
            return;
          }
          this.emit("parsed", p);
        };
      }, { "./bitmapper": 1, "./chunkstream": 3, "./filter-parse-async": 7, "./format-normaliser": 10, "./parser": 18, util: 84, zlib: 31 }], 17: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = !0, T = y("zlib"), m = y("./sync-inflate");
            T.deflateSync || (g = !1);
            let d = y("./sync-reader"), i = y("./filter-parse-sync"), o = y("./parser"), a = y("./bitmapper"), f = y("./format-normaliser");
            H.exports = function(p, u) {
              if (!g)
                throw new Error(
                  "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
                );
              let c;
              function b(x) {
                c = x;
              }
              let R;
              function S(x) {
                R = x;
              }
              function O(x) {
                R.transColor = x;
              }
              function L(x) {
                R.palette = x;
              }
              function E() {
                R.alpha = !0;
              }
              let F;
              function I(x) {
                F = x;
              }
              let M = [];
              function N(x) {
                M.push(x);
              }
              let G = new d(p);
              if (new o(u, {
                read: G.read.bind(G),
                error: b,
                metadata: S,
                gamma: I,
                palette: L,
                transColor: O,
                inflateData: N,
                simpleTransparency: E
              }).start(), G.process(), c)
                throw c;
              let Q = w.concat(M);
              M.length = 0;
              let re;
              if (R.interlace)
                re = T.inflateSync(Q);
              else {
                let V = ((R.width * R.bpp * R.depth + 7 >> 3) + 1) * R.height;
                re = m(Q, {
                  chunkSize: V,
                  maxLength: V
                });
              }
              if (Q = null, !re || !re.length)
                throw new Error("bad png - invalid inflate data response");
              let ae = i.process(re, R);
              Q = null;
              let C = a.dataToBitMap(ae, R);
              ae = null;
              let h = f(
                C,
                R,
                u.skipRescale
              );
              return R.data = h, R.gamma = F || 0, R;
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./bitmapper": 1, "./filter-parse-sync": 8, "./format-normaliser": 10, "./parser": 18, "./sync-inflate": 21, "./sync-reader": 22, buffer: 32, zlib: 31 }], 18: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            let g = y("./constants"), T = y("./crc"), m = H.exports = function(d, i) {
              this._options = d, d.checkCRC = d.checkCRC !== !1, this._hasIHDR = !1, this._hasIEND = !1, this._emittedHeadersFinished = !1, this._palette = [], this._colorType = 0, this._chunks = {}, this._chunks[g.TYPE_IHDR] = this._handleIHDR.bind(this), this._chunks[g.TYPE_IEND] = this._handleIEND.bind(this), this._chunks[g.TYPE_IDAT] = this._handleIDAT.bind(this), this._chunks[g.TYPE_PLTE] = this._handlePLTE.bind(this), this._chunks[g.TYPE_tRNS] = this._handleTRNS.bind(this), this._chunks[g.TYPE_gAMA] = this._handleGAMA.bind(this), this.read = i.read, this.error = i.error, this.metadata = i.metadata, this.gamma = i.gamma, this.transColor = i.transColor, this.palette = i.palette, this.parsed = i.parsed, this.inflateData = i.inflateData, this.finished = i.finished, this.simpleTransparency = i.simpleTransparency, this.headersFinished = i.headersFinished || function() {
              };
            };
            m.prototype.start = function() {
              this.read(g.PNG_SIGNATURE.length, this._parseSignature.bind(this));
            }, m.prototype._parseSignature = function(d) {
              let i = g.PNG_SIGNATURE;
              for (let o = 0; o < i.length; o++)
                if (d[o] !== i[o]) {
                  this.error(new Error("Invalid file signature"));
                  return;
                }
              this.read(8, this._parseChunkBegin.bind(this));
            }, m.prototype._parseChunkBegin = function(d) {
              let i = d.readUInt32BE(0), o = d.readUInt32BE(4), a = "";
              for (let p = 4; p < 8; p++)
                a += String.fromCharCode(d[p]);
              let f = !!(d[4] & 32);
              if (!this._hasIHDR && o !== g.TYPE_IHDR) {
                this.error(new Error("Expected IHDR on beggining"));
                return;
              }
              if (this._crc = new T(), this._crc.write(w.from(a)), this._chunks[o])
                return this._chunks[o](i);
              if (!f) {
                this.error(new Error("Unsupported critical chunk type " + a));
                return;
              }
              this.read(i + 4, this._skipChunk.bind(this));
            }, m.prototype._skipChunk = function() {
              this.read(8, this._parseChunkBegin.bind(this));
            }, m.prototype._handleChunkEnd = function() {
              this.read(4, this._parseChunkEnd.bind(this));
            }, m.prototype._parseChunkEnd = function(d) {
              let i = d.readInt32BE(0), o = this._crc.crc32();
              if (this._options.checkCRC && o !== i) {
                this.error(new Error("Crc error - " + i + " - " + o));
                return;
              }
              this._hasIEND || this.read(8, this._parseChunkBegin.bind(this));
            }, m.prototype._handleIHDR = function(d) {
              this.read(d, this._parseIHDR.bind(this));
            }, m.prototype._parseIHDR = function(d) {
              this._crc.write(d);
              let i = d.readUInt32BE(0), o = d.readUInt32BE(4), a = d[8], f = d[9], p = d[10], u = d[11], c = d[12];
              if (a !== 8 && a !== 4 && a !== 2 && a !== 1 && a !== 16) {
                this.error(new Error("Unsupported bit depth " + a));
                return;
              }
              if (!(f in g.COLORTYPE_TO_BPP_MAP)) {
                this.error(new Error("Unsupported color type"));
                return;
              }
              if (p !== 0) {
                this.error(new Error("Unsupported compression method"));
                return;
              }
              if (u !== 0) {
                this.error(new Error("Unsupported filter method"));
                return;
              }
              if (c !== 0 && c !== 1) {
                this.error(new Error("Unsupported interlace method"));
                return;
              }
              this._colorType = f;
              let b = g.COLORTYPE_TO_BPP_MAP[this._colorType];
              this._hasIHDR = !0, this.metadata({
                width: i,
                height: o,
                depth: a,
                interlace: !!c,
                palette: !!(f & g.COLORTYPE_PALETTE),
                color: !!(f & g.COLORTYPE_COLOR),
                alpha: !!(f & g.COLORTYPE_ALPHA),
                bpp: b,
                colorType: f
              }), this._handleChunkEnd();
            }, m.prototype._handlePLTE = function(d) {
              this.read(d, this._parsePLTE.bind(this));
            }, m.prototype._parsePLTE = function(d) {
              this._crc.write(d);
              let i = Math.floor(d.length / 3);
              for (let o = 0; o < i; o++)
                this._palette.push([d[o * 3], d[o * 3 + 1], d[o * 3 + 2], 255]);
              this.palette(this._palette), this._handleChunkEnd();
            }, m.prototype._handleTRNS = function(d) {
              this.simpleTransparency(), this.read(d, this._parseTRNS.bind(this));
            }, m.prototype._parseTRNS = function(d) {
              if (this._crc.write(d), this._colorType === g.COLORTYPE_PALETTE_COLOR) {
                if (this._palette.length === 0) {
                  this.error(new Error("Transparency chunk must be after palette"));
                  return;
                }
                if (d.length > this._palette.length) {
                  this.error(new Error("More transparent colors than palette size"));
                  return;
                }
                for (let i = 0; i < d.length; i++)
                  this._palette[i][3] = d[i];
                this.palette(this._palette);
              }
              this._colorType === g.COLORTYPE_GRAYSCALE && this.transColor([d.readUInt16BE(0)]), this._colorType === g.COLORTYPE_COLOR && this.transColor([
                d.readUInt16BE(0),
                d.readUInt16BE(2),
                d.readUInt16BE(4)
              ]), this._handleChunkEnd();
            }, m.prototype._handleGAMA = function(d) {
              this.read(d, this._parseGAMA.bind(this));
            }, m.prototype._parseGAMA = function(d) {
              this._crc.write(d), this.gamma(d.readUInt32BE(0) / g.GAMMA_DIVISION), this._handleChunkEnd();
            }, m.prototype._handleIDAT = function(d) {
              this._emittedHeadersFinished || (this._emittedHeadersFinished = !0, this.headersFinished()), this.read(-d, this._parseIDAT.bind(this, d));
            }, m.prototype._parseIDAT = function(d, i) {
              if (this._crc.write(i), this._colorType === g.COLORTYPE_PALETTE_COLOR && this._palette.length === 0)
                throw new Error("Expected palette not found");
              this.inflateData(i);
              let o = d - i.length;
              o > 0 ? this._handleIDAT(o) : this._handleChunkEnd();
            }, m.prototype._handleIEND = function(d) {
              this.read(d, this._parseIEND.bind(this));
            }, m.prototype._parseIEND = function(d) {
              this._crc.write(d), this._hasIEND = !0, this._handleChunkEnd(), this.finished && this.finished();
            };
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "./constants": 4, "./crc": 5, buffer: 32 }], 19: [function(y, H, s) {
        "use strict";
        let w = y("./parser-sync"), g = y("./packer-sync");
        s.read = function(T, m) {
          return w(T, m || {});
        }, s.write = function(T, m) {
          return g(T, m);
        };
      }, { "./packer-sync": 13, "./parser-sync": 17 }], 20: [function(y, H, s) {
        (function(w, g) {
          (function() {
            "use strict";
            let T = y("util"), m = y("stream"), d = y("./parser-async"), i = y("./packer-async"), o = y("./png-sync"), a = s.PNG = function(f) {
              m.call(this), f = f || {}, this.width = f.width | 0, this.height = f.height | 0, this.data = this.width > 0 && this.height > 0 ? g.alloc(4 * this.width * this.height) : null, f.fill && this.data && this.data.fill(0), this.gamma = 0, this.readable = this.writable = !0, this._parser = new d(f), this._parser.on("error", this.emit.bind(this, "error")), this._parser.on("close", this._handleClose.bind(this)), this._parser.on("metadata", this._metadata.bind(this)), this._parser.on("gamma", this._gamma.bind(this)), this._parser.on(
                "parsed",
                function(p) {
                  this.data = p, this.emit("parsed", p);
                }.bind(this)
              ), this._packer = new i(f), this._packer.on("data", this.emit.bind(this, "data")), this._packer.on("end", this.emit.bind(this, "end")), this._parser.on("close", this._handleClose.bind(this)), this._packer.on("error", this.emit.bind(this, "error"));
            };
            T.inherits(a, m), a.sync = o, a.prototype.pack = function() {
              return !this.data || !this.data.length ? (this.emit("error", "No data provided"), this) : (w.nextTick(
                function() {
                  this._packer.pack(this.data, this.width, this.height, this.gamma);
                }.bind(this)
              ), this);
            }, a.prototype.parse = function(f, p) {
              if (p) {
                let u, c;
                u = function(b) {
                  this.removeListener("error", c), this.data = b, p(null, this);
                }.bind(this), c = function(b) {
                  this.removeListener("parsed", u), p(b, null);
                }.bind(this), this.once("parsed", u), this.once("error", c);
              }
              return this.end(f), this;
            }, a.prototype.write = function(f) {
              return this._parser.write(f), !0;
            }, a.prototype.end = function(f) {
              this._parser.end(f);
            }, a.prototype._metadata = function(f) {
              this.width = f.width, this.height = f.height, this.emit("metadata", f);
            }, a.prototype._gamma = function(f) {
              this.gamma = f;
            }, a.prototype._handleClose = function() {
              !this._parser.writable && !this._packer.readable && this.emit("close");
            }, a.bitblt = function(f, p, u, c, b, R, S, O) {
              if (u |= 0, c |= 0, b |= 0, R |= 0, S |= 0, O |= 0, u > f.width || c > f.height || u + b > f.width || c + R > f.height)
                throw new Error("bitblt reading outside image");
              if (S > p.width || O > p.height || S + b > p.width || O + R > p.height)
                throw new Error("bitblt writing outside image");
              for (let L = 0; L < R; L++)
                f.data.copy(
                  p.data,
                  (O + L) * p.width + S << 2,
                  (c + L) * f.width + u << 2,
                  (c + L) * f.width + u + b << 2
                );
            }, a.prototype.bitblt = function(f, p, u, c, b, R, S) {
              return a.bitblt(this, f, p, u, c, b, R, S), this;
            }, a.adjustGamma = function(f) {
              if (f.gamma) {
                for (let p = 0; p < f.height; p++)
                  for (let u = 0; u < f.width; u++) {
                    let c = f.width * p + u << 2;
                    for (let b = 0; b < 3; b++) {
                      let R = f.data[c + b] / 255;
                      R = Math.pow(R, 1 / 2.2 / f.gamma), f.data[c + b] = Math.round(R * 255);
                    }
                  }
                f.gamma = 0;
              }
            }, a.prototype.adjustGamma = function() {
              a.adjustGamma(this);
            };
          }).call(this);
        }).call(this, y("_process"), y("buffer").Buffer);
      }, { "./packer-async": 12, "./parser-async": 16, "./png-sync": 19, _process: 63, buffer: 32, stream: 65, util: 84 }], 21: [function(y, H, s) {
        (function(w, g) {
          (function() {
            "use strict";
            let T = y("assert").ok, m = y("zlib"), d = y("util"), i = y("buffer").kMaxLength;
            function o(c) {
              if (!(this instanceof o))
                return new o(c);
              c && c.chunkSize < m.Z_MIN_CHUNK && (c.chunkSize = m.Z_MIN_CHUNK), m.Inflate.call(this, c), this._offset = this._offset === void 0 ? this._outOffset : this._offset, this._buffer = this._buffer || this._outBuffer, c && c.maxLength != null && (this._maxLength = c.maxLength);
            }
            function a(c) {
              return new o(c);
            }
            function f(c, b) {
              b && w.nextTick(b), c._handle && (c._handle.close(), c._handle = null);
            }
            o.prototype._processChunk = function(c, b, R) {
              if (typeof R == "function")
                return m.Inflate._processChunk.call(this, c, b, R);
              let S = this, O = c && c.length, L = this._chunkSize - this._offset, E = this._maxLength, F = 0, I = [], M = 0, N;
              this.on("error", function(re) {
                N = re;
              });
              function G(re, ae) {
                if (S._hadError)
                  return;
                let C = L - ae;
                if (T(C >= 0, "have should not go down"), C > 0) {
                  let h = S._buffer.slice(S._offset, S._offset + C);
                  if (S._offset += C, h.length > E && (h = h.slice(0, E)), I.push(h), M += h.length, E -= h.length, E === 0)
                    return !1;
                }
                return (ae === 0 || S._offset >= S._chunkSize) && (L = S._chunkSize, S._offset = 0, S._buffer = g.allocUnsafe(S._chunkSize)), ae === 0 ? (F += O - re, O = re, !0) : !1;
              }
              T(this._handle, "zlib binding closed");
              let W;
              do
                W = this._handle.writeSync(
                  b,
                  c,
                  // in
                  F,
                  // in_off
                  O,
                  // in_len
                  this._buffer,
                  // out
                  this._offset,
                  //out_off
                  L
                ), W = W || this._writeState;
              while (!this._hadError && G(W[0], W[1]));
              if (this._hadError)
                throw N;
              if (M >= i)
                throw f(this), new RangeError(
                  "Cannot create final Buffer. It would be larger than 0x" + i.toString(16) + " bytes"
                );
              let Q = g.concat(I, M);
              return f(this), Q;
            }, d.inherits(o, m.Inflate);
            function p(c, b) {
              if (typeof b == "string" && (b = g.from(b)), !(b instanceof g))
                throw new TypeError("Not a string or buffer");
              let R = c._finishFlushFlag;
              return R == null && (R = m.Z_FINISH), c._processChunk(b, R);
            }
            function u(c, b) {
              return p(new o(b), c);
            }
            H.exports = s = u, s.Inflate = o, s.createInflate = a, s.inflateSync = u;
          }).call(this);
        }).call(this, y("_process"), y("buffer").Buffer);
      }, { _process: 63, assert: 23, buffer: 32, util: 84, zlib: 31 }], 22: [function(y, H, s) {
        "use strict";
        let w = H.exports = function(g) {
          this._buffer = g, this._reads = [];
        };
        w.prototype.read = function(g, T) {
          this._reads.push({
            length: Math.abs(g),
            // if length < 0 then at most this length
            allowLess: g < 0,
            func: T
          });
        }, w.prototype.process = function() {
          for (; this._reads.length > 0 && this._buffer.length; ) {
            let g = this._reads[0];
            if (this._buffer.length && (this._buffer.length >= g.length || g.allowLess)) {
              this._reads.shift();
              let T = this._buffer;
              this._buffer = T.slice(g.length), g.func.call(this, T.slice(0, g.length));
            } else
              break;
          }
          if (this._reads.length > 0)
            throw new Error("There are some read requests waitng on finished stream");
          if (this._buffer.length > 0)
            throw new Error("unrecognised content at end of stream");
        };
      }, {}], 23: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            var g = y("object-assign");
            function T(C, h) {
              if (C === h)
                return 0;
              for (var x = C.length, V = h.length, oe = 0, Ee = Math.min(x, V); oe < Ee; ++oe)
                if (C[oe] !== h[oe]) {
                  x = C[oe], V = h[oe];
                  break;
                }
              return x < V ? -1 : V < x ? 1 : 0;
            }
            function m(C) {
              return w.Buffer && typeof w.Buffer.isBuffer == "function" ? w.Buffer.isBuffer(C) : !!(C != null && C._isBuffer);
            }
            var d = y("util/"), i = Object.prototype.hasOwnProperty, o = Array.prototype.slice, a = function() {
              return function() {
              }.name === "foo";
            }();
            function f(C) {
              return Object.prototype.toString.call(C);
            }
            function p(C) {
              return m(C) || typeof w.ArrayBuffer != "function" ? !1 : typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(C) : C ? !!(C instanceof DataView || C.buffer && C.buffer instanceof ArrayBuffer) : !1;
            }
            var u = H.exports = E, c = /\s*function\s+([^\(\s]*)\s*/;
            function b(C) {
              if (d.isFunction(C)) {
                if (a)
                  return C.name;
                var h = C.toString(), x = h.match(c);
                return x && x[1];
              }
            }
            u.AssertionError = function(h) {
              this.name = "AssertionError", this.actual = h.actual, this.expected = h.expected, this.operator = h.operator, h.message ? (this.message = h.message, this.generatedMessage = !1) : (this.message = O(this), this.generatedMessage = !0);
              var x = h.stackStartFunction || L;
              if (Error.captureStackTrace)
                Error.captureStackTrace(this, x);
              else {
                var V = new Error();
                if (V.stack) {
                  var oe = V.stack, Ee = b(x), he = oe.indexOf(`
` + Ee);
                  if (he >= 0) {
                    var B = oe.indexOf(`
`, he + 1);
                    oe = oe.substring(B + 1);
                  }
                  this.stack = oe;
                }
              }
            }, d.inherits(u.AssertionError, Error);
            function R(C, h) {
              return typeof C == "string" ? C.length < h ? C : C.slice(0, h) : C;
            }
            function S(C) {
              if (a || !d.isFunction(C))
                return d.inspect(C);
              var h = b(C), x = h ? ": " + h : "";
              return "[Function" + x + "]";
            }
            function O(C) {
              return R(S(C.actual), 128) + " " + C.operator + " " + R(S(C.expected), 128);
            }
            function L(C, h, x, V, oe) {
              throw new u.AssertionError({
                message: x,
                actual: C,
                expected: h,
                operator: V,
                stackStartFunction: oe
              });
            }
            u.fail = L;
            function E(C, h) {
              C || L(C, !0, h, "==", u.ok);
            }
            u.ok = E, u.equal = function(h, x, V) {
              h != x && L(h, x, V, "==", u.equal);
            }, u.notEqual = function(h, x, V) {
              h == x && L(h, x, V, "!=", u.notEqual);
            }, u.deepEqual = function(h, x, V) {
              F(h, x, !1) || L(h, x, V, "deepEqual", u.deepEqual);
            }, u.deepStrictEqual = function(h, x, V) {
              F(h, x, !0) || L(h, x, V, "deepStrictEqual", u.deepStrictEqual);
            };
            function F(C, h, x, V) {
              if (C === h)
                return !0;
              if (m(C) && m(h))
                return T(C, h) === 0;
              if (d.isDate(C) && d.isDate(h))
                return C.getTime() === h.getTime();
              if (d.isRegExp(C) && d.isRegExp(h))
                return C.source === h.source && C.global === h.global && C.multiline === h.multiline && C.lastIndex === h.lastIndex && C.ignoreCase === h.ignoreCase;
              if ((C === null || typeof C != "object") && (h === null || typeof h != "object"))
                return x ? C === h : C == h;
              if (p(C) && p(h) && f(C) === f(h) && !(C instanceof Float32Array || C instanceof Float64Array))
                return T(
                  new Uint8Array(C.buffer),
                  new Uint8Array(h.buffer)
                ) === 0;
              if (m(C) !== m(h))
                return !1;
              V = V || { actual: [], expected: [] };
              var oe = V.actual.indexOf(C);
              return oe !== -1 && oe === V.expected.indexOf(h) ? !0 : (V.actual.push(C), V.expected.push(h), M(C, h, x, V));
            }
            function I(C) {
              return Object.prototype.toString.call(C) == "[object Arguments]";
            }
            function M(C, h, x, V) {
              if (C == null || h === null || h === void 0)
                return !1;
              if (d.isPrimitive(C) || d.isPrimitive(h))
                return C === h;
              if (x && Object.getPrototypeOf(C) !== Object.getPrototypeOf(h))
                return !1;
              var oe = I(C), Ee = I(h);
              if (oe && !Ee || !oe && Ee)
                return !1;
              if (oe)
                return C = o.call(C), h = o.call(h), F(C, h, x);
              var he = ae(C), B = ae(h), K, q;
              if (he.length !== B.length)
                return !1;
              for (he.sort(), B.sort(), q = he.length - 1; q >= 0; q--)
                if (he[q] !== B[q])
                  return !1;
              for (q = he.length - 1; q >= 0; q--)
                if (K = he[q], !F(C[K], h[K], x, V))
                  return !1;
              return !0;
            }
            u.notDeepEqual = function(h, x, V) {
              F(h, x, !1) && L(h, x, V, "notDeepEqual", u.notDeepEqual);
            }, u.notDeepStrictEqual = N;
            function N(C, h, x) {
              F(C, h, !0) && L(C, h, x, "notDeepStrictEqual", N);
            }
            u.strictEqual = function(h, x, V) {
              h !== x && L(h, x, V, "===", u.strictEqual);
            }, u.notStrictEqual = function(h, x, V) {
              h === x && L(h, x, V, "!==", u.notStrictEqual);
            };
            function G(C, h) {
              if (!C || !h)
                return !1;
              if (Object.prototype.toString.call(h) == "[object RegExp]")
                return h.test(C);
              try {
                if (C instanceof h)
                  return !0;
              } catch {
              }
              return Error.isPrototypeOf(h) ? !1 : h.call({}, C) === !0;
            }
            function W(C) {
              var h;
              try {
                C();
              } catch (x) {
                h = x;
              }
              return h;
            }
            function Q(C, h, x, V) {
              var oe;
              if (typeof h != "function")
                throw new TypeError('"block" argument must be a function');
              typeof x == "string" && (V = x, x = null), oe = W(h), V = (x && x.name ? " (" + x.name + ")." : ".") + (V ? " " + V : "."), C && !oe && L(oe, x, "Missing expected exception" + V);
              var Ee = typeof V == "string", he = !C && d.isError(oe), B = !C && oe && !x;
              if ((he && Ee && G(oe, x) || B) && L(oe, x, "Got unwanted exception" + V), C && oe && x && !G(oe, x) || !C && oe)
                throw oe;
            }
            u.throws = function(C, h, x) {
              Q(!0, C, h, x);
            }, u.doesNotThrow = function(C, h, x) {
              Q(!1, C, h, x);
            }, u.ifError = function(C) {
              if (C) throw C;
            };
            function re(C, h) {
              C || L(C, !0, h, "==", re);
            }
            u.strict = g(re, u, {
              equal: u.strictEqual,
              deepEqual: u.deepStrictEqual,
              notEqual: u.notStrictEqual,
              notDeepEqual: u.notDeepStrictEqual
            }), u.strict.strict = u.strict;
            var ae = Object.keys || function(C) {
              var h = [];
              for (var x in C)
                i.call(C, x) && h.push(x);
              return h;
            };
          }).call(this);
        }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, { "object-assign": 51, "util/": 26 }], 24: [function(y, H, s) {
        typeof Object.create == "function" ? H.exports = function(g, T) {
          g.super_ = T, g.prototype = Object.create(T.prototype, {
            constructor: {
              value: g,
              enumerable: !1,
              writable: !0,
              configurable: !0
            }
          });
        } : H.exports = function(g, T) {
          g.super_ = T;
          var m = function() {
          };
          m.prototype = T.prototype, g.prototype = new m(), g.prototype.constructor = g;
        };
      }, {}], 25: [function(y, H, s) {
        H.exports = function(g) {
          return g && typeof g == "object" && typeof g.copy == "function" && typeof g.fill == "function" && typeof g.readUInt8 == "function";
        };
      }, {}], 26: [function(y, H, s) {
        (function(w, g) {
          (function() {
            var T = /%[sdj%]/g;
            s.format = function(B) {
              if (!M(B)) {
                for (var K = [], q = 0; q < arguments.length; q++)
                  K.push(i(arguments[q]));
                return K.join(" ");
              }
              for (var q = 1, ge = arguments, z = ge.length, Y = String(B).replace(T, function(ce) {
                if (ce === "%%") return "%";
                if (q >= z) return ce;
                switch (ce) {
                  case "%s":
                    return String(ge[q++]);
                  case "%d":
                    return Number(ge[q++]);
                  case "%j":
                    try {
                      return JSON.stringify(ge[q++]);
                    } catch {
                      return "[Circular]";
                    }
                  default:
                    return ce;
                }
              }), $ = ge[q]; q < z; $ = ge[++q])
                E($) || !Q($) ? Y += " " + $ : Y += " " + i($);
              return Y;
            }, s.deprecate = function(B, K) {
              if (G(g.process))
                return function() {
                  return s.deprecate(B, K).apply(this, arguments);
                };
              if (w.noDeprecation === !0)
                return B;
              var q = !1;
              function ge() {
                if (!q) {
                  if (w.throwDeprecation)
                    throw new Error(K);
                  w.traceDeprecation ? console.trace(K) : console.error(K), q = !0;
                }
                return B.apply(this, arguments);
              }
              return ge;
            };
            var m = {}, d;
            s.debuglog = function(B) {
              if (G(d) && (d = w.env.NODE_DEBUG || ""), B = B.toUpperCase(), !m[B])
                if (new RegExp("\\b" + B + "\\b", "i").test(d)) {
                  var K = w.pid;
                  m[B] = function() {
                    var q = s.format.apply(s, arguments);
                    console.error("%s %d: %s", B, K, q);
                  };
                } else
                  m[B] = function() {
                  };
              return m[B];
            };
            function i(B, K) {
              var q = {
                seen: [],
                stylize: a
              };
              return arguments.length >= 3 && (q.depth = arguments[2]), arguments.length >= 4 && (q.colors = arguments[3]), L(K) ? q.showHidden = K : K && s._extend(q, K), G(q.showHidden) && (q.showHidden = !1), G(q.depth) && (q.depth = 2), G(q.colors) && (q.colors = !1), G(q.customInspect) && (q.customInspect = !0), q.colors && (q.stylize = o), p(q, B, q.depth);
            }
            s.inspect = i, i.colors = {
              bold: [1, 22],
              italic: [3, 23],
              underline: [4, 24],
              inverse: [7, 27],
              white: [37, 39],
              grey: [90, 39],
              black: [30, 39],
              blue: [34, 39],
              cyan: [36, 39],
              green: [32, 39],
              magenta: [35, 39],
              red: [31, 39],
              yellow: [33, 39]
            }, i.styles = {
              special: "cyan",
              number: "yellow",
              boolean: "yellow",
              undefined: "grey",
              null: "bold",
              string: "green",
              date: "magenta",
              // "name": intentionally not styling
              regexp: "red"
            };
            function o(B, K) {
              var q = i.styles[K];
              return q ? "\x1B[" + i.colors[q][0] + "m" + B + "\x1B[" + i.colors[q][1] + "m" : B;
            }
            function a(B, K) {
              return B;
            }
            function f(B) {
              var K = {};
              return B.forEach(function(q, ge) {
                K[q] = !0;
              }), K;
            }
            function p(B, K, q) {
              if (B.customInspect && K && C(K.inspect) && // Filter out the util module, it's inspect function is special
              K.inspect !== s.inspect && // Also filter out any prototype objects using the circular check.
              !(K.constructor && K.constructor.prototype === K)) {
                var ge = K.inspect(q, B);
                return M(ge) || (ge = p(B, ge, q)), ge;
              }
              var z = u(B, K);
              if (z)
                return z;
              var Y = Object.keys(K), $ = f(Y);
              if (B.showHidden && (Y = Object.getOwnPropertyNames(K)), ae(K) && (Y.indexOf("message") >= 0 || Y.indexOf("description") >= 0))
                return c(K);
              if (Y.length === 0) {
                if (C(K)) {
                  var ce = K.name ? ": " + K.name : "";
                  return B.stylize("[Function" + ce + "]", "special");
                }
                if (W(K))
                  return B.stylize(RegExp.prototype.toString.call(K), "regexp");
                if (re(K))
                  return B.stylize(Date.prototype.toString.call(K), "date");
                if (ae(K))
                  return c(K);
              }
              var de = "", we = !1, ye = ["{", "}"];
              if (O(K) && (we = !0, ye = ["[", "]"]), C(K)) {
                var U = K.name ? ": " + K.name : "";
                de = " [Function" + U + "]";
              }
              if (W(K) && (de = " " + RegExp.prototype.toString.call(K)), re(K) && (de = " " + Date.prototype.toUTCString.call(K)), ae(K) && (de = " " + c(K)), Y.length === 0 && (!we || K.length == 0))
                return ye[0] + de + ye[1];
              if (q < 0)
                return W(K) ? B.stylize(RegExp.prototype.toString.call(K), "regexp") : B.stylize("[Object]", "special");
              B.seen.push(K);
              var j;
              return we ? j = b(B, K, q, $, Y) : j = Y.map(function(ie) {
                return R(B, K, q, $, ie, we);
              }), B.seen.pop(), S(j, de, ye);
            }
            function u(B, K) {
              if (G(K))
                return B.stylize("undefined", "undefined");
              if (M(K)) {
                var q = "'" + JSON.stringify(K).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                return B.stylize(q, "string");
              }
              if (I(K))
                return B.stylize("" + K, "number");
              if (L(K))
                return B.stylize("" + K, "boolean");
              if (E(K))
                return B.stylize("null", "null");
            }
            function c(B) {
              return "[" + Error.prototype.toString.call(B) + "]";
            }
            function b(B, K, q, ge, z) {
              for (var Y = [], $ = 0, ce = K.length; $ < ce; ++$)
                he(K, String($)) ? Y.push(R(
                  B,
                  K,
                  q,
                  ge,
                  String($),
                  !0
                )) : Y.push("");
              return z.forEach(function(de) {
                de.match(/^\d+$/) || Y.push(R(
                  B,
                  K,
                  q,
                  ge,
                  de,
                  !0
                ));
              }), Y;
            }
            function R(B, K, q, ge, z, Y) {
              var $, ce, de;
              if (de = Object.getOwnPropertyDescriptor(K, z) || { value: K[z] }, de.get ? de.set ? ce = B.stylize("[Getter/Setter]", "special") : ce = B.stylize("[Getter]", "special") : de.set && (ce = B.stylize("[Setter]", "special")), he(ge, z) || ($ = "[" + z + "]"), ce || (B.seen.indexOf(de.value) < 0 ? (E(q) ? ce = p(B, de.value, null) : ce = p(B, de.value, q - 1), ce.indexOf(`
`) > -1 && (Y ? ce = ce.split(`
`).map(function(we) {
                return "  " + we;
              }).join(`
`).substr(2) : ce = `
` + ce.split(`
`).map(function(we) {
                return "   " + we;
              }).join(`
`))) : ce = B.stylize("[Circular]", "special")), G($)) {
                if (Y && z.match(/^\d+$/))
                  return ce;
                $ = JSON.stringify("" + z), $.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? ($ = $.substr(1, $.length - 2), $ = B.stylize($, "name")) : ($ = $.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), $ = B.stylize($, "string"));
              }
              return $ + ": " + ce;
            }
            function S(B, K, q) {
              var ge = 0, z = B.reduce(function(Y, $) {
                return ge++, $.indexOf(`
`) >= 0 && ge++, Y + $.replace(/\u001b\[\d\d?m/g, "").length + 1;
              }, 0);
              return z > 60 ? q[0] + (K === "" ? "" : K + `
 `) + " " + B.join(`,
  `) + " " + q[1] : q[0] + K + " " + B.join(", ") + " " + q[1];
            }
            function O(B) {
              return Array.isArray(B);
            }
            s.isArray = O;
            function L(B) {
              return typeof B == "boolean";
            }
            s.isBoolean = L;
            function E(B) {
              return B === null;
            }
            s.isNull = E;
            function F(B) {
              return B == null;
            }
            s.isNullOrUndefined = F;
            function I(B) {
              return typeof B == "number";
            }
            s.isNumber = I;
            function M(B) {
              return typeof B == "string";
            }
            s.isString = M;
            function N(B) {
              return typeof B == "symbol";
            }
            s.isSymbol = N;
            function G(B) {
              return B === void 0;
            }
            s.isUndefined = G;
            function W(B) {
              return Q(B) && x(B) === "[object RegExp]";
            }
            s.isRegExp = W;
            function Q(B) {
              return typeof B == "object" && B !== null;
            }
            s.isObject = Q;
            function re(B) {
              return Q(B) && x(B) === "[object Date]";
            }
            s.isDate = re;
            function ae(B) {
              return Q(B) && (x(B) === "[object Error]" || B instanceof Error);
            }
            s.isError = ae;
            function C(B) {
              return typeof B == "function";
            }
            s.isFunction = C;
            function h(B) {
              return B === null || typeof B == "boolean" || typeof B == "number" || typeof B == "string" || typeof B == "symbol" || // ES6 symbol
              typeof B > "u";
            }
            s.isPrimitive = h, s.isBuffer = y("./support/isBuffer");
            function x(B) {
              return Object.prototype.toString.call(B);
            }
            function V(B) {
              return B < 10 ? "0" + B.toString(10) : B.toString(10);
            }
            var oe = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec"
            ];
            function Ee() {
              var B = /* @__PURE__ */ new Date(), K = [
                V(B.getHours()),
                V(B.getMinutes()),
                V(B.getSeconds())
              ].join(":");
              return [B.getDate(), oe[B.getMonth()], K].join(" ");
            }
            s.log = function() {
              console.log("%s - %s", Ee(), s.format.apply(s, arguments));
            }, s.inherits = y("inherits"), s._extend = function(B, K) {
              if (!K || !Q(K)) return B;
              for (var q = Object.keys(K), ge = q.length; ge--; )
                B[q[ge]] = K[q[ge]];
              return B;
            };
            function he(B, K) {
              return Object.prototype.hasOwnProperty.call(B, K);
            }
          }).call(this);
        }).call(this, y("_process"), typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, { "./support/isBuffer": 25, _process: 63, inherits: 24 }], 27: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            var g = [
              "BigInt64Array",
              "BigUint64Array",
              "Float32Array",
              "Float64Array",
              "Int16Array",
              "Int32Array",
              "Int8Array",
              "Uint16Array",
              "Uint32Array",
              "Uint8Array",
              "Uint8ClampedArray"
            ], T = typeof globalThis > "u" ? w : globalThis;
            H.exports = function() {
              for (var d = [], i = 0; i < g.length; i++)
                typeof T[g[i]] == "function" && (d[d.length] = g[i]);
              return d;
            };
          }).call(this);
        }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, {}], 28: [function(y, H, s) {
        "use strict";
        s.byteLength = a, s.toByteArray = p, s.fromByteArray = b;
        for (var w = [], g = [], T = typeof Uint8Array < "u" ? Uint8Array : Array, m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", d = 0, i = m.length; d < i; ++d)
          w[d] = m[d], g[m.charCodeAt(d)] = d;
        g[45] = 62, g[95] = 63;
        function o(R) {
          var S = R.length;
          if (S % 4 > 0)
            throw new Error("Invalid string. Length must be a multiple of 4");
          var O = R.indexOf("=");
          O === -1 && (O = S);
          var L = O === S ? 0 : 4 - O % 4;
          return [O, L];
        }
        function a(R) {
          var S = o(R), O = S[0], L = S[1];
          return (O + L) * 3 / 4 - L;
        }
        function f(R, S, O) {
          return (S + O) * 3 / 4 - O;
        }
        function p(R) {
          var S, O = o(R), L = O[0], E = O[1], F = new T(f(R, L, E)), I = 0, M = E > 0 ? L - 4 : L, N;
          for (N = 0; N < M; N += 4)
            S = g[R.charCodeAt(N)] << 18 | g[R.charCodeAt(N + 1)] << 12 | g[R.charCodeAt(N + 2)] << 6 | g[R.charCodeAt(N + 3)], F[I++] = S >> 16 & 255, F[I++] = S >> 8 & 255, F[I++] = S & 255;
          return E === 2 && (S = g[R.charCodeAt(N)] << 2 | g[R.charCodeAt(N + 1)] >> 4, F[I++] = S & 255), E === 1 && (S = g[R.charCodeAt(N)] << 10 | g[R.charCodeAt(N + 1)] << 4 | g[R.charCodeAt(N + 2)] >> 2, F[I++] = S >> 8 & 255, F[I++] = S & 255), F;
        }
        function u(R) {
          return w[R >> 18 & 63] + w[R >> 12 & 63] + w[R >> 6 & 63] + w[R & 63];
        }
        function c(R, S, O) {
          for (var L, E = [], F = S; F < O; F += 3)
            L = (R[F] << 16 & 16711680) + (R[F + 1] << 8 & 65280) + (R[F + 2] & 255), E.push(u(L));
          return E.join("");
        }
        function b(R) {
          for (var S, O = R.length, L = O % 3, E = [], F = 16383, I = 0, M = O - L; I < M; I += F)
            E.push(c(R, I, I + F > M ? M : I + F));
          return L === 1 ? (S = R[O - 1], E.push(
            w[S >> 2] + w[S << 4 & 63] + "=="
          )) : L === 2 && (S = (R[O - 2] << 8) + R[O - 1], E.push(
            w[S >> 10] + w[S >> 4 & 63] + w[S << 2 & 63] + "="
          )), E.join("");
        }
      }, {}], 29: [function(y, H, s) {
      }, {}], 30: [function(y, H, s) {
        (function(w, g) {
          (function() {
            "use strict";
            var T = y("assert"), m = y("pako/lib/zlib/zstream"), d = y("pako/lib/zlib/deflate.js"), i = y("pako/lib/zlib/inflate.js"), o = y("pako/lib/zlib/constants");
            for (var a in o)
              s[a] = o[a];
            s.NONE = 0, s.DEFLATE = 1, s.INFLATE = 2, s.GZIP = 3, s.GUNZIP = 4, s.DEFLATERAW = 5, s.INFLATERAW = 6, s.UNZIP = 7;
            var f = 31, p = 139;
            function u(c) {
              if (typeof c != "number" || c < s.DEFLATE || c > s.UNZIP)
                throw new TypeError("Bad argument");
              this.dictionary = null, this.err = 0, this.flush = 0, this.init_done = !1, this.level = 0, this.memLevel = 0, this.mode = c, this.strategy = 0, this.windowBits = 0, this.write_in_progress = !1, this.pending_close = !1, this.gzip_id_bytes_read = 0;
            }
            u.prototype.close = function() {
              if (this.write_in_progress) {
                this.pending_close = !0;
                return;
              }
              this.pending_close = !1, T(this.init_done, "close before init"), T(this.mode <= s.UNZIP), this.mode === s.DEFLATE || this.mode === s.GZIP || this.mode === s.DEFLATERAW ? d.deflateEnd(this.strm) : (this.mode === s.INFLATE || this.mode === s.GUNZIP || this.mode === s.INFLATERAW || this.mode === s.UNZIP) && i.inflateEnd(this.strm), this.mode = s.NONE, this.dictionary = null;
            }, u.prototype.write = function(c, b, R, S, O, L, E) {
              return this._write(!0, c, b, R, S, O, L, E);
            }, u.prototype.writeSync = function(c, b, R, S, O, L, E) {
              return this._write(!1, c, b, R, S, O, L, E);
            }, u.prototype._write = function(c, b, R, S, O, L, E, F) {
              if (T.equal(arguments.length, 8), T(this.init_done, "write before init"), T(this.mode !== s.NONE, "already finalized"), T.equal(!1, this.write_in_progress, "write already in progress"), T.equal(!1, this.pending_close, "close is pending"), this.write_in_progress = !0, T.equal(!1, b === void 0, "must provide flush value"), this.write_in_progress = !0, b !== s.Z_NO_FLUSH && b !== s.Z_PARTIAL_FLUSH && b !== s.Z_SYNC_FLUSH && b !== s.Z_FULL_FLUSH && b !== s.Z_FINISH && b !== s.Z_BLOCK)
                throw new Error("Invalid flush value");
              if (R == null && (R = g.alloc(0), O = 0, S = 0), this.strm.avail_in = O, this.strm.input = R, this.strm.next_in = S, this.strm.avail_out = F, this.strm.output = L, this.strm.next_out = E, this.flush = b, !c)
                return this._process(), this._checkError() ? this._afterSync() : void 0;
              var I = this;
              return w.nextTick(function() {
                I._process(), I._after();
              }), this;
            }, u.prototype._afterSync = function() {
              var c = this.strm.avail_out, b = this.strm.avail_in;
              return this.write_in_progress = !1, [b, c];
            }, u.prototype._process = function() {
              var c = null;
              switch (this.mode) {
                case s.DEFLATE:
                case s.GZIP:
                case s.DEFLATERAW:
                  this.err = d.deflate(this.strm, this.flush);
                  break;
                case s.UNZIP:
                  switch (this.strm.avail_in > 0 && (c = this.strm.next_in), this.gzip_id_bytes_read) {
                    case 0:
                      if (c === null)
                        break;
                      if (this.strm.input[c] === f) {
                        if (this.gzip_id_bytes_read = 1, c++, this.strm.avail_in === 1)
                          break;
                      } else {
                        this.mode = s.INFLATE;
                        break;
                      }
                    case 1:
                      if (c === null)
                        break;
                      this.strm.input[c] === p ? (this.gzip_id_bytes_read = 2, this.mode = s.GUNZIP) : this.mode = s.INFLATE;
                      break;
                    default:
                      throw new Error("invalid number of gzip magic number bytes read");
                  }
                case s.INFLATE:
                case s.GUNZIP:
                case s.INFLATERAW:
                  for (this.err = i.inflate(
                    this.strm,
                    this.flush
                    // If data was encoded with dictionary
                  ), this.err === s.Z_NEED_DICT && this.dictionary && (this.err = i.inflateSetDictionary(this.strm, this.dictionary), this.err === s.Z_OK ? this.err = i.inflate(this.strm, this.flush) : this.err === s.Z_DATA_ERROR && (this.err = s.Z_NEED_DICT)); this.strm.avail_in > 0 && this.mode === s.GUNZIP && this.err === s.Z_STREAM_END && this.strm.next_in[0] !== 0; )
                    this.reset(), this.err = i.inflate(this.strm, this.flush);
                  break;
                default:
                  throw new Error("Unknown mode " + this.mode);
              }
            }, u.prototype._checkError = function() {
              switch (this.err) {
                case s.Z_OK:
                case s.Z_BUF_ERROR:
                  if (this.strm.avail_out !== 0 && this.flush === s.Z_FINISH)
                    return this._error("unexpected end of file"), !1;
                  break;
                case s.Z_STREAM_END:
                  break;
                case s.Z_NEED_DICT:
                  return this.dictionary == null ? this._error("Missing dictionary") : this._error("Bad dictionary"), !1;
                default:
                  return this._error("Zlib error"), !1;
              }
              return !0;
            }, u.prototype._after = function() {
              if (this._checkError()) {
                var c = this.strm.avail_out, b = this.strm.avail_in;
                this.write_in_progress = !1, this.callback(b, c), this.pending_close && this.close();
              }
            }, u.prototype._error = function(c) {
              this.strm.msg && (c = this.strm.msg), this.onerror(
                c,
                this.err
                // no hope of rescue.
              ), this.write_in_progress = !1, this.pending_close && this.close();
            }, u.prototype.init = function(c, b, R, S, O) {
              T(arguments.length === 4 || arguments.length === 5, "init(windowBits, level, memLevel, strategy, [dictionary])"), T(c >= 8 && c <= 15, "invalid windowBits"), T(b >= -1 && b <= 9, "invalid compression level"), T(R >= 1 && R <= 9, "invalid memlevel"), T(S === s.Z_FILTERED || S === s.Z_HUFFMAN_ONLY || S === s.Z_RLE || S === s.Z_FIXED || S === s.Z_DEFAULT_STRATEGY, "invalid strategy"), this._init(b, c, R, S, O), this._setDictionary();
            }, u.prototype.params = function() {
              throw new Error("deflateParams Not supported");
            }, u.prototype.reset = function() {
              this._reset(), this._setDictionary();
            }, u.prototype._init = function(c, b, R, S, O) {
              switch (this.level = c, this.windowBits = b, this.memLevel = R, this.strategy = S, this.flush = s.Z_NO_FLUSH, this.err = s.Z_OK, (this.mode === s.GZIP || this.mode === s.GUNZIP) && (this.windowBits += 16), this.mode === s.UNZIP && (this.windowBits += 32), (this.mode === s.DEFLATERAW || this.mode === s.INFLATERAW) && (this.windowBits = -1 * this.windowBits), this.strm = new m(), this.mode) {
                case s.DEFLATE:
                case s.GZIP:
                case s.DEFLATERAW:
                  this.err = d.deflateInit2(this.strm, this.level, s.Z_DEFLATED, this.windowBits, this.memLevel, this.strategy);
                  break;
                case s.INFLATE:
                case s.GUNZIP:
                case s.INFLATERAW:
                case s.UNZIP:
                  this.err = i.inflateInit2(this.strm, this.windowBits);
                  break;
                default:
                  throw new Error("Unknown mode " + this.mode);
              }
              this.err !== s.Z_OK && this._error("Init error"), this.dictionary = O, this.write_in_progress = !1, this.init_done = !0;
            }, u.prototype._setDictionary = function() {
              if (this.dictionary != null) {
                switch (this.err = s.Z_OK, this.mode) {
                  case s.DEFLATE:
                  case s.DEFLATERAW:
                    this.err = d.deflateSetDictionary(this.strm, this.dictionary);
                    break;
                  default:
                    break;
                }
                this.err !== s.Z_OK && this._error("Failed to set dictionary");
              }
            }, u.prototype._reset = function() {
              switch (this.err = s.Z_OK, this.mode) {
                case s.DEFLATE:
                case s.DEFLATERAW:
                case s.GZIP:
                  this.err = d.deflateReset(this.strm);
                  break;
                case s.INFLATE:
                case s.INFLATERAW:
                case s.GUNZIP:
                  this.err = i.inflateReset(this.strm);
                  break;
                default:
                  break;
              }
              this.err !== s.Z_OK && this._error("Failed to reset stream");
            }, s.Zlib = u;
          }).call(this);
        }).call(this, y("_process"), y("buffer").Buffer);
      }, { _process: 63, assert: 23, buffer: 32, "pako/lib/zlib/constants": 54, "pako/lib/zlib/deflate.js": 56, "pako/lib/zlib/inflate.js": 58, "pako/lib/zlib/zstream": 62 }], 31: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            var g = y("buffer").Buffer, T = y("stream").Transform, m = y("./binding"), d = y("util"), i = y("assert").ok, o = y("buffer").kMaxLength, a = "Cannot create final Buffer. It would be larger than 0x" + o.toString(16) + " bytes";
            m.Z_MIN_WINDOWBITS = 8, m.Z_MAX_WINDOWBITS = 15, m.Z_DEFAULT_WINDOWBITS = 15, m.Z_MIN_CHUNK = 64, m.Z_MAX_CHUNK = 1 / 0, m.Z_DEFAULT_CHUNK = 16 * 1024, m.Z_MIN_MEMLEVEL = 1, m.Z_MAX_MEMLEVEL = 9, m.Z_DEFAULT_MEMLEVEL = 8, m.Z_MIN_LEVEL = -1, m.Z_MAX_LEVEL = 9, m.Z_DEFAULT_LEVEL = m.Z_DEFAULT_COMPRESSION;
            for (var f = Object.keys(m), p = 0; p < f.length; p++) {
              var u = f[p];
              u.match(/^Z/) && Object.defineProperty(s, u, {
                enumerable: !0,
                value: m[u],
                writable: !1
              });
            }
            for (var c = {
              Z_OK: m.Z_OK,
              Z_STREAM_END: m.Z_STREAM_END,
              Z_NEED_DICT: m.Z_NEED_DICT,
              Z_ERRNO: m.Z_ERRNO,
              Z_STREAM_ERROR: m.Z_STREAM_ERROR,
              Z_DATA_ERROR: m.Z_DATA_ERROR,
              Z_MEM_ERROR: m.Z_MEM_ERROR,
              Z_BUF_ERROR: m.Z_BUF_ERROR,
              Z_VERSION_ERROR: m.Z_VERSION_ERROR
            }, b = Object.keys(c), R = 0; R < b.length; R++) {
              var S = b[R];
              c[c[S]] = S;
            }
            Object.defineProperty(s, "codes", {
              enumerable: !0,
              value: Object.freeze(c),
              writable: !1
            }), s.Deflate = E, s.Inflate = F, s.Gzip = I, s.Gunzip = M, s.DeflateRaw = N, s.InflateRaw = G, s.Unzip = W, s.createDeflate = function(h) {
              return new E(h);
            }, s.createInflate = function(h) {
              return new F(h);
            }, s.createDeflateRaw = function(h) {
              return new N(h);
            }, s.createInflateRaw = function(h) {
              return new G(h);
            }, s.createGzip = function(h) {
              return new I(h);
            }, s.createGunzip = function(h) {
              return new M(h);
            }, s.createUnzip = function(h) {
              return new W(h);
            }, s.deflate = function(h, x, V) {
              return typeof x == "function" && (V = x, x = {}), O(new E(x), h, V);
            }, s.deflateSync = function(h, x) {
              return L(new E(x), h);
            }, s.gzip = function(h, x, V) {
              return typeof x == "function" && (V = x, x = {}), O(new I(x), h, V);
            }, s.gzipSync = function(h, x) {
              return L(new I(x), h);
            }, s.deflateRaw = function(h, x, V) {
              return typeof x == "function" && (V = x, x = {}), O(new N(x), h, V);
            }, s.deflateRawSync = function(h, x) {
              return L(new N(x), h);
            }, s.unzip = function(h, x, V) {
              return typeof x == "function" && (V = x, x = {}), O(new W(x), h, V);
            }, s.unzipSync = function(h, x) {
              return L(new W(x), h);
            }, s.inflate = function(h, x, V) {
              return typeof x == "function" && (V = x, x = {}), O(new F(x), h, V);
            }, s.inflateSync = function(h, x) {
              return L(new F(x), h);
            }, s.gunzip = function(h, x, V) {
              return typeof x == "function" && (V = x, x = {}), O(new M(x), h, V);
            }, s.gunzipSync = function(h, x) {
              return L(new M(x), h);
            }, s.inflateRaw = function(h, x, V) {
              return typeof x == "function" && (V = x, x = {}), O(new G(x), h, V);
            }, s.inflateRawSync = function(h, x) {
              return L(new G(x), h);
            };
            function O(h, x, V) {
              var oe = [], Ee = 0;
              h.on("error", B), h.on("end", K), h.end(x), he();
              function he() {
                for (var q; (q = h.read()) !== null; )
                  oe.push(q), Ee += q.length;
                h.once("readable", he);
              }
              function B(q) {
                h.removeListener("end", K), h.removeListener("readable", he), V(q);
              }
              function K() {
                var q, ge = null;
                Ee >= o ? ge = new RangeError(a) : q = g.concat(oe, Ee), oe = [], h.close(), V(ge, q);
              }
            }
            function L(h, x) {
              if (typeof x == "string" && (x = g.from(x)), !g.isBuffer(x)) throw new TypeError("Not a string or buffer");
              var V = h._finishFlushFlag;
              return h._processChunk(x, V);
            }
            function E(h) {
              if (!(this instanceof E)) return new E(h);
              re.call(this, h, m.DEFLATE);
            }
            function F(h) {
              if (!(this instanceof F)) return new F(h);
              re.call(this, h, m.INFLATE);
            }
            function I(h) {
              if (!(this instanceof I)) return new I(h);
              re.call(this, h, m.GZIP);
            }
            function M(h) {
              if (!(this instanceof M)) return new M(h);
              re.call(this, h, m.GUNZIP);
            }
            function N(h) {
              if (!(this instanceof N)) return new N(h);
              re.call(this, h, m.DEFLATERAW);
            }
            function G(h) {
              if (!(this instanceof G)) return new G(h);
              re.call(this, h, m.INFLATERAW);
            }
            function W(h) {
              if (!(this instanceof W)) return new W(h);
              re.call(this, h, m.UNZIP);
            }
            function Q(h) {
              return h === m.Z_NO_FLUSH || h === m.Z_PARTIAL_FLUSH || h === m.Z_SYNC_FLUSH || h === m.Z_FULL_FLUSH || h === m.Z_FINISH || h === m.Z_BLOCK;
            }
            function re(h, x) {
              var V = this;
              if (this._opts = h = h || {}, this._chunkSize = h.chunkSize || s.Z_DEFAULT_CHUNK, T.call(this, h), h.flush && !Q(h.flush))
                throw new Error("Invalid flush flag: " + h.flush);
              if (h.finishFlush && !Q(h.finishFlush))
                throw new Error("Invalid flush flag: " + h.finishFlush);
              if (this._flushFlag = h.flush || m.Z_NO_FLUSH, this._finishFlushFlag = typeof h.finishFlush < "u" ? h.finishFlush : m.Z_FINISH, h.chunkSize && (h.chunkSize < s.Z_MIN_CHUNK || h.chunkSize > s.Z_MAX_CHUNK))
                throw new Error("Invalid chunk size: " + h.chunkSize);
              if (h.windowBits && (h.windowBits < s.Z_MIN_WINDOWBITS || h.windowBits > s.Z_MAX_WINDOWBITS))
                throw new Error("Invalid windowBits: " + h.windowBits);
              if (h.level && (h.level < s.Z_MIN_LEVEL || h.level > s.Z_MAX_LEVEL))
                throw new Error("Invalid compression level: " + h.level);
              if (h.memLevel && (h.memLevel < s.Z_MIN_MEMLEVEL || h.memLevel > s.Z_MAX_MEMLEVEL))
                throw new Error("Invalid memLevel: " + h.memLevel);
              if (h.strategy && h.strategy != s.Z_FILTERED && h.strategy != s.Z_HUFFMAN_ONLY && h.strategy != s.Z_RLE && h.strategy != s.Z_FIXED && h.strategy != s.Z_DEFAULT_STRATEGY)
                throw new Error("Invalid strategy: " + h.strategy);
              if (h.dictionary && !g.isBuffer(h.dictionary))
                throw new Error("Invalid dictionary: it should be a Buffer instance");
              this._handle = new m.Zlib(x);
              var oe = this;
              this._hadError = !1, this._handle.onerror = function(B, K) {
                ae(oe), oe._hadError = !0;
                var q = new Error(B);
                q.errno = K, q.code = s.codes[K], oe.emit("error", q);
              };
              var Ee = s.Z_DEFAULT_COMPRESSION;
              typeof h.level == "number" && (Ee = h.level);
              var he = s.Z_DEFAULT_STRATEGY;
              typeof h.strategy == "number" && (he = h.strategy), this._handle.init(h.windowBits || s.Z_DEFAULT_WINDOWBITS, Ee, h.memLevel || s.Z_DEFAULT_MEMLEVEL, he, h.dictionary), this._buffer = g.allocUnsafe(this._chunkSize), this._offset = 0, this._level = Ee, this._strategy = he, this.once("end", this.close), Object.defineProperty(this, "_closed", {
                get: function() {
                  return !V._handle;
                },
                configurable: !0,
                enumerable: !0
              });
            }
            d.inherits(re, T), re.prototype.params = function(h, x, V) {
              if (h < s.Z_MIN_LEVEL || h > s.Z_MAX_LEVEL)
                throw new RangeError("Invalid compression level: " + h);
              if (x != s.Z_FILTERED && x != s.Z_HUFFMAN_ONLY && x != s.Z_RLE && x != s.Z_FIXED && x != s.Z_DEFAULT_STRATEGY)
                throw new TypeError("Invalid strategy: " + x);
              if (this._level !== h || this._strategy !== x) {
                var oe = this;
                this.flush(m.Z_SYNC_FLUSH, function() {
                  i(oe._handle, "zlib binding closed"), oe._handle.params(h, x), oe._hadError || (oe._level = h, oe._strategy = x, V && V());
                });
              } else
                w.nextTick(V);
            }, re.prototype.reset = function() {
              return i(this._handle, "zlib binding closed"), this._handle.reset();
            }, re.prototype._flush = function(h) {
              this._transform(g.alloc(0), "", h);
            }, re.prototype.flush = function(h, x) {
              var V = this, oe = this._writableState;
              (typeof h == "function" || h === void 0 && !x) && (x = h, h = m.Z_FULL_FLUSH), oe.ended ? x && w.nextTick(x) : oe.ending ? x && this.once("end", x) : oe.needDrain ? x && this.once("drain", function() {
                return V.flush(h, x);
              }) : (this._flushFlag = h, this.write(g.alloc(0), "", x));
            }, re.prototype.close = function(h) {
              ae(this, h), w.nextTick(C, this);
            };
            function ae(h, x) {
              x && w.nextTick(x), h._handle && (h._handle.close(), h._handle = null);
            }
            function C(h) {
              h.emit("close");
            }
            re.prototype._transform = function(h, x, V) {
              var oe, Ee = this._writableState, he = Ee.ending || Ee.ended, B = he && (!h || Ee.length === h.length);
              if (h !== null && !g.isBuffer(h)) return V(new Error("invalid input"));
              if (!this._handle) return V(new Error("zlib binding closed"));
              B ? oe = this._finishFlushFlag : (oe = this._flushFlag, h.length >= Ee.length && (this._flushFlag = this._opts.flush || m.Z_NO_FLUSH)), this._processChunk(h, oe, V);
            }, re.prototype._processChunk = function(h, x, V) {
              var oe = h && h.length, Ee = this._chunkSize - this._offset, he = 0, B = this, K = typeof V == "function";
              if (!K) {
                var q = [], ge = 0, z;
                this.on("error", function(we) {
                  z = we;
                }), i(this._handle, "zlib binding closed");
                do
                  var Y = this._handle.writeSync(
                    x,
                    h,
                    // in
                    he,
                    // in_off
                    oe,
                    // in_len
                    this._buffer,
                    // out
                    this._offset,
                    //out_off
                    Ee
                  );
                while (!this._hadError && de(Y[0], Y[1]));
                if (this._hadError)
                  throw z;
                if (ge >= o)
                  throw ae(this), new RangeError(a);
                var $ = g.concat(q, ge);
                return ae(this), $;
              }
              i(this._handle, "zlib binding closed");
              var ce = this._handle.write(
                x,
                h,
                // in
                he,
                // in_off
                oe,
                // in_len
                this._buffer,
                // out
                this._offset,
                //out_off
                Ee
              );
              ce.buffer = h, ce.callback = de;
              function de(we, ye) {
                if (this && (this.buffer = null, this.callback = null), !B._hadError) {
                  var U = Ee - ye;
                  if (i(U >= 0, "have should not go down"), U > 0) {
                    var j = B._buffer.slice(B._offset, B._offset + U);
                    B._offset += U, K ? B.push(j) : (q.push(j), ge += j.length);
                  }
                  if ((ye === 0 || B._offset >= B._chunkSize) && (Ee = B._chunkSize, B._offset = 0, B._buffer = g.allocUnsafe(B._chunkSize)), ye === 0) {
                    if (he += oe - we, oe = we, !K) return !0;
                    var ie = B._handle.write(x, h, he, oe, B._buffer, B._offset, B._chunkSize);
                    ie.callback = de, ie.buffer = h;
                    return;
                  }
                  if (!K) return !1;
                  V();
                }
              }
            }, d.inherits(E, re), d.inherits(F, re), d.inherits(I, re), d.inherits(M, re), d.inherits(N, re), d.inherits(G, re), d.inherits(W, re);
          }).call(this);
        }).call(this, y("_process"));
      }, { "./binding": 30, _process: 63, assert: 23, buffer: 32, stream: 65, util: 84 }], 32: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            var g = y("base64-js"), T = y("ieee754");
            s.Buffer = o, s.SlowBuffer = L, s.INSPECT_MAX_BYTES = 50;
            var m = 2147483647;
            s.kMaxLength = m, o.TYPED_ARRAY_SUPPORT = d(), !o.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
              "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
            );
            function d() {
              try {
                var n = new Uint8Array(1);
                return n.__proto__ = { __proto__: Uint8Array.prototype, foo: function() {
                  return 42;
                } }, n.foo() === 42;
              } catch {
                return !1;
              }
            }
            Object.defineProperty(o.prototype, "parent", {
              enumerable: !0,
              get: function() {
                if (o.isBuffer(this))
                  return this.buffer;
              }
            }), Object.defineProperty(o.prototype, "offset", {
              enumerable: !0,
              get: function() {
                if (o.isBuffer(this))
                  return this.byteOffset;
              }
            });
            function i(n) {
              if (n > m)
                throw new RangeError('The value "' + n + '" is invalid for option "size"');
              var t = new Uint8Array(n);
              return t.__proto__ = o.prototype, t;
            }
            function o(n, t, r) {
              if (typeof n == "number") {
                if (typeof t == "string")
                  throw new TypeError(
                    'The "string" argument must be of type string. Received type number'
                  );
                return u(n);
              }
              return a(n, t, r);
            }
            typeof Symbol < "u" && Symbol.species != null && o[Symbol.species] === o && Object.defineProperty(o, Symbol.species, {
              value: null,
              configurable: !0,
              enumerable: !1,
              writable: !1
            }), o.poolSize = 8192;
            function a(n, t, r) {
              if (typeof n == "string")
                return c(n, t);
              if (ArrayBuffer.isView(n))
                return b(n);
              if (n == null)
                throw TypeError(
                  "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof n
                );
              if (Te(n, ArrayBuffer) || n && Te(n.buffer, ArrayBuffer))
                return R(n, t, r);
              if (typeof n == "number")
                throw new TypeError(
                  'The "value" argument must not be of type number. Received type number'
                );
              var l = n.valueOf && n.valueOf();
              if (l != null && l !== n)
                return o.from(l, t, r);
              var D = S(n);
              if (D) return D;
              if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof n[Symbol.toPrimitive] == "function")
                return o.from(
                  n[Symbol.toPrimitive]("string"),
                  t,
                  r
                );
              throw new TypeError(
                "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof n
              );
            }
            o.from = function(n, t, r) {
              return a(n, t, r);
            }, o.prototype.__proto__ = Uint8Array.prototype, o.__proto__ = Uint8Array;
            function f(n) {
              if (typeof n != "number")
                throw new TypeError('"size" argument must be of type number');
              if (n < 0)
                throw new RangeError('The value "' + n + '" is invalid for option "size"');
            }
            function p(n, t, r) {
              return f(n), n <= 0 ? i(n) : t !== void 0 ? typeof r == "string" ? i(n).fill(t, r) : i(n).fill(t) : i(n);
            }
            o.alloc = function(n, t, r) {
              return p(n, t, r);
            };
            function u(n) {
              return f(n), i(n < 0 ? 0 : O(n) | 0);
            }
            o.allocUnsafe = function(n) {
              return u(n);
            }, o.allocUnsafeSlow = function(n) {
              return u(n);
            };
            function c(n, t) {
              if ((typeof t != "string" || t === "") && (t = "utf8"), !o.isEncoding(t))
                throw new TypeError("Unknown encoding: " + t);
              var r = E(n, t) | 0, l = i(r), D = l.write(n, t);
              return D !== r && (l = l.slice(0, D)), l;
            }
            function b(n) {
              for (var t = n.length < 0 ? 0 : O(n.length) | 0, r = i(t), l = 0; l < t; l += 1)
                r[l] = n[l] & 255;
              return r;
            }
            function R(n, t, r) {
              if (t < 0 || n.byteLength < t)
                throw new RangeError('"offset" is outside of buffer bounds');
              if (n.byteLength < t + (r || 0))
                throw new RangeError('"length" is outside of buffer bounds');
              var l;
              return t === void 0 && r === void 0 ? l = new Uint8Array(n) : r === void 0 ? l = new Uint8Array(n, t) : l = new Uint8Array(n, t, r), l.__proto__ = o.prototype, l;
            }
            function S(n) {
              if (o.isBuffer(n)) {
                var t = O(n.length) | 0, r = i(t);
                return r.length === 0 || n.copy(r, 0, 0, t), r;
              }
              if (n.length !== void 0)
                return typeof n.length != "number" || k(n.length) ? i(0) : b(n);
              if (n.type === "Buffer" && Array.isArray(n.data))
                return b(n.data);
            }
            function O(n) {
              if (n >= m)
                throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + m.toString(16) + " bytes");
              return n | 0;
            }
            function L(n) {
              return +n != n && (n = 0), o.alloc(+n);
            }
            o.isBuffer = function(t) {
              return t != null && t._isBuffer === !0 && t !== o.prototype;
            }, o.compare = function(t, r) {
              if (Te(t, Uint8Array) && (t = o.from(t, t.offset, t.byteLength)), Te(r, Uint8Array) && (r = o.from(r, r.offset, r.byteLength)), !o.isBuffer(t) || !o.isBuffer(r))
                throw new TypeError(
                  'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
                );
              if (t === r) return 0;
              for (var l = t.length, D = r.length, te = 0, fe = Math.min(l, D); te < fe; ++te)
                if (t[te] !== r[te]) {
                  l = t[te], D = r[te];
                  break;
                }
              return l < D ? -1 : D < l ? 1 : 0;
            }, o.isEncoding = function(t) {
              switch (String(t).toLowerCase()) {
                case "hex":
                case "utf8":
                case "utf-8":
                case "ascii":
                case "latin1":
                case "binary":
                case "base64":
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                  return !0;
                default:
                  return !1;
              }
            }, o.concat = function(t, r) {
              if (!Array.isArray(t))
                throw new TypeError('"list" argument must be an Array of Buffers');
              if (t.length === 0)
                return o.alloc(0);
              var l;
              if (r === void 0)
                for (r = 0, l = 0; l < t.length; ++l)
                  r += t[l].length;
              var D = o.allocUnsafe(r), te = 0;
              for (l = 0; l < t.length; ++l) {
                var fe = t[l];
                if (Te(fe, Uint8Array) && (fe = o.from(fe)), !o.isBuffer(fe))
                  throw new TypeError('"list" argument must be an Array of Buffers');
                fe.copy(D, te), te += fe.length;
              }
              return D;
            };
            function E(n, t) {
              if (o.isBuffer(n))
                return n.length;
              if (ArrayBuffer.isView(n) || Te(n, ArrayBuffer))
                return n.byteLength;
              if (typeof n != "string")
                throw new TypeError(
                  'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof n
                );
              var r = n.length, l = arguments.length > 2 && arguments[2] === !0;
              if (!l && r === 0) return 0;
              for (var D = !1; ; )
                switch (t) {
                  case "ascii":
                  case "latin1":
                  case "binary":
                    return r;
                  case "utf8":
                  case "utf-8":
                    return ye(n).length;
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return r * 2;
                  case "hex":
                    return r >>> 1;
                  case "base64":
                    return ie(n).length;
                  default:
                    if (D)
                      return l ? -1 : ye(n).length;
                    t = ("" + t).toLowerCase(), D = !0;
                }
            }
            o.byteLength = E;
            function F(n, t, r) {
              var l = !1;
              if ((t === void 0 || t < 0) && (t = 0), t > this.length || ((r === void 0 || r > this.length) && (r = this.length), r <= 0) || (r >>>= 0, t >>>= 0, r <= t))
                return "";
              for (n || (n = "utf8"); ; )
                switch (n) {
                  case "hex":
                    return B(this, t, r);
                  case "utf8":
                  case "utf-8":
                    return x(this, t, r);
                  case "ascii":
                    return Ee(this, t, r);
                  case "latin1":
                  case "binary":
                    return he(this, t, r);
                  case "base64":
                    return h(this, t, r);
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return K(this, t, r);
                  default:
                    if (l) throw new TypeError("Unknown encoding: " + n);
                    n = (n + "").toLowerCase(), l = !0;
                }
            }
            o.prototype._isBuffer = !0;
            function I(n, t, r) {
              var l = n[t];
              n[t] = n[r], n[r] = l;
            }
            o.prototype.swap16 = function() {
              var t = this.length;
              if (t % 2 !== 0)
                throw new RangeError("Buffer size must be a multiple of 16-bits");
              for (var r = 0; r < t; r += 2)
                I(this, r, r + 1);
              return this;
            }, o.prototype.swap32 = function() {
              var t = this.length;
              if (t % 4 !== 0)
                throw new RangeError("Buffer size must be a multiple of 32-bits");
              for (var r = 0; r < t; r += 4)
                I(this, r, r + 3), I(this, r + 1, r + 2);
              return this;
            }, o.prototype.swap64 = function() {
              var t = this.length;
              if (t % 8 !== 0)
                throw new RangeError("Buffer size must be a multiple of 64-bits");
              for (var r = 0; r < t; r += 8)
                I(this, r, r + 7), I(this, r + 1, r + 6), I(this, r + 2, r + 5), I(this, r + 3, r + 4);
              return this;
            }, o.prototype.toString = function() {
              var t = this.length;
              return t === 0 ? "" : arguments.length === 0 ? x(this, 0, t) : F.apply(this, arguments);
            }, o.prototype.toLocaleString = o.prototype.toString, o.prototype.equals = function(t) {
              if (!o.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
              return this === t ? !0 : o.compare(this, t) === 0;
            }, o.prototype.inspect = function() {
              var t = "", r = s.INSPECT_MAX_BYTES;
              return t = this.toString("hex", 0, r).replace(/(.{2})/g, "$1 ").trim(), this.length > r && (t += " ... "), "<Buffer " + t + ">";
            }, o.prototype.compare = function(t, r, l, D, te) {
              if (Te(t, Uint8Array) && (t = o.from(t, t.offset, t.byteLength)), !o.isBuffer(t))
                throw new TypeError(
                  'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof t
                );
              if (r === void 0 && (r = 0), l === void 0 && (l = t ? t.length : 0), D === void 0 && (D = 0), te === void 0 && (te = this.length), r < 0 || l > t.length || D < 0 || te > this.length)
                throw new RangeError("out of range index");
              if (D >= te && r >= l)
                return 0;
              if (D >= te)
                return -1;
              if (r >= l)
                return 1;
              if (r >>>= 0, l >>>= 0, D >>>= 0, te >>>= 0, this === t) return 0;
              for (var fe = te - D, Oe = l - r, Ie = Math.min(fe, Oe), Le = this.slice(D, te), Me = t.slice(r, l), xe = 0; xe < Ie; ++xe)
                if (Le[xe] !== Me[xe]) {
                  fe = Le[xe], Oe = Me[xe];
                  break;
                }
              return fe < Oe ? -1 : Oe < fe ? 1 : 0;
            };
            function M(n, t, r, l, D) {
              if (n.length === 0) return -1;
              if (typeof r == "string" ? (l = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), r = +r, k(r) && (r = D ? 0 : n.length - 1), r < 0 && (r = n.length + r), r >= n.length) {
                if (D) return -1;
                r = n.length - 1;
              } else if (r < 0)
                if (D) r = 0;
                else return -1;
              if (typeof t == "string" && (t = o.from(t, l)), o.isBuffer(t))
                return t.length === 0 ? -1 : N(n, t, r, l, D);
              if (typeof t == "number")
                return t = t & 255, typeof Uint8Array.prototype.indexOf == "function" ? D ? Uint8Array.prototype.indexOf.call(n, t, r) : Uint8Array.prototype.lastIndexOf.call(n, t, r) : N(n, [t], r, l, D);
              throw new TypeError("val must be string, number or Buffer");
            }
            function N(n, t, r, l, D) {
              var te = 1, fe = n.length, Oe = t.length;
              if (l !== void 0 && (l = String(l).toLowerCase(), l === "ucs2" || l === "ucs-2" || l === "utf16le" || l === "utf-16le")) {
                if (n.length < 2 || t.length < 2)
                  return -1;
                te = 2, fe /= 2, Oe /= 2, r /= 2;
              }
              function Ie(Ce, Be) {
                return te === 1 ? Ce[Be] : Ce.readUInt16BE(Be * te);
              }
              var Le;
              if (D) {
                var Me = -1;
                for (Le = r; Le < fe; Le++)
                  if (Ie(n, Le) === Ie(t, Me === -1 ? 0 : Le - Me)) {
                    if (Me === -1 && (Me = Le), Le - Me + 1 === Oe) return Me * te;
                  } else
                    Me !== -1 && (Le -= Le - Me), Me = -1;
              } else
                for (r + Oe > fe && (r = fe - Oe), Le = r; Le >= 0; Le--) {
                  for (var xe = !0, je = 0; je < Oe; je++)
                    if (Ie(n, Le + je) !== Ie(t, je)) {
                      xe = !1;
                      break;
                    }
                  if (xe) return Le;
                }
              return -1;
            }
            o.prototype.includes = function(t, r, l) {
              return this.indexOf(t, r, l) !== -1;
            }, o.prototype.indexOf = function(t, r, l) {
              return M(this, t, r, l, !0);
            }, o.prototype.lastIndexOf = function(t, r, l) {
              return M(this, t, r, l, !1);
            };
            function G(n, t, r, l) {
              r = Number(r) || 0;
              var D = n.length - r;
              l ? (l = Number(l), l > D && (l = D)) : l = D;
              var te = t.length;
              l > te / 2 && (l = te / 2);
              for (var fe = 0; fe < l; ++fe) {
                var Oe = parseInt(t.substr(fe * 2, 2), 16);
                if (k(Oe)) return fe;
                n[r + fe] = Oe;
              }
              return fe;
            }
            function W(n, t, r, l) {
              return _e(ye(t, n.length - r), n, r, l);
            }
            function Q(n, t, r, l) {
              return _e(U(t), n, r, l);
            }
            function re(n, t, r, l) {
              return Q(n, t, r, l);
            }
            function ae(n, t, r, l) {
              return _e(ie(t), n, r, l);
            }
            function C(n, t, r, l) {
              return _e(j(t, n.length - r), n, r, l);
            }
            o.prototype.write = function(t, r, l, D) {
              if (r === void 0)
                D = "utf8", l = this.length, r = 0;
              else if (l === void 0 && typeof r == "string")
                D = r, l = this.length, r = 0;
              else if (isFinite(r))
                r = r >>> 0, isFinite(l) ? (l = l >>> 0, D === void 0 && (D = "utf8")) : (D = l, l = void 0);
              else
                throw new Error(
                  "Buffer.write(string, encoding, offset[, length]) is no longer supported"
                );
              var te = this.length - r;
              if ((l === void 0 || l > te) && (l = te), t.length > 0 && (l < 0 || r < 0) || r > this.length)
                throw new RangeError("Attempt to write outside buffer bounds");
              D || (D = "utf8");
              for (var fe = !1; ; )
                switch (D) {
                  case "hex":
                    return G(this, t, r, l);
                  case "utf8":
                  case "utf-8":
                    return W(this, t, r, l);
                  case "ascii":
                    return Q(this, t, r, l);
                  case "latin1":
                  case "binary":
                    return re(this, t, r, l);
                  case "base64":
                    return ae(this, t, r, l);
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return C(this, t, r, l);
                  default:
                    if (fe) throw new TypeError("Unknown encoding: " + D);
                    D = ("" + D).toLowerCase(), fe = !0;
                }
            }, o.prototype.toJSON = function() {
              return {
                type: "Buffer",
                data: Array.prototype.slice.call(this._arr || this, 0)
              };
            };
            function h(n, t, r) {
              return t === 0 && r === n.length ? g.fromByteArray(n) : g.fromByteArray(n.slice(t, r));
            }
            function x(n, t, r) {
              r = Math.min(n.length, r);
              for (var l = [], D = t; D < r; ) {
                var te = n[D], fe = null, Oe = te > 239 ? 4 : te > 223 ? 3 : te > 191 ? 2 : 1;
                if (D + Oe <= r) {
                  var Ie, Le, Me, xe;
                  switch (Oe) {
                    case 1:
                      te < 128 && (fe = te);
                      break;
                    case 2:
                      Ie = n[D + 1], (Ie & 192) === 128 && (xe = (te & 31) << 6 | Ie & 63, xe > 127 && (fe = xe));
                      break;
                    case 3:
                      Ie = n[D + 1], Le = n[D + 2], (Ie & 192) === 128 && (Le & 192) === 128 && (xe = (te & 15) << 12 | (Ie & 63) << 6 | Le & 63, xe > 2047 && (xe < 55296 || xe > 57343) && (fe = xe));
                      break;
                    case 4:
                      Ie = n[D + 1], Le = n[D + 2], Me = n[D + 3], (Ie & 192) === 128 && (Le & 192) === 128 && (Me & 192) === 128 && (xe = (te & 15) << 18 | (Ie & 63) << 12 | (Le & 63) << 6 | Me & 63, xe > 65535 && xe < 1114112 && (fe = xe));
                  }
                }
                fe === null ? (fe = 65533, Oe = 1) : fe > 65535 && (fe -= 65536, l.push(fe >>> 10 & 1023 | 55296), fe = 56320 | fe & 1023), l.push(fe), D += Oe;
              }
              return oe(l);
            }
            var V = 4096;
            function oe(n) {
              var t = n.length;
              if (t <= V)
                return String.fromCharCode.apply(String, n);
              for (var r = "", l = 0; l < t; )
                r += String.fromCharCode.apply(
                  String,
                  n.slice(l, l += V)
                );
              return r;
            }
            function Ee(n, t, r) {
              var l = "";
              r = Math.min(n.length, r);
              for (var D = t; D < r; ++D)
                l += String.fromCharCode(n[D] & 127);
              return l;
            }
            function he(n, t, r) {
              var l = "";
              r = Math.min(n.length, r);
              for (var D = t; D < r; ++D)
                l += String.fromCharCode(n[D]);
              return l;
            }
            function B(n, t, r) {
              var l = n.length;
              (!t || t < 0) && (t = 0), (!r || r < 0 || r > l) && (r = l);
              for (var D = "", te = t; te < r; ++te)
                D += we(n[te]);
              return D;
            }
            function K(n, t, r) {
              for (var l = n.slice(t, r), D = "", te = 0; te < l.length; te += 2)
                D += String.fromCharCode(l[te] + l[te + 1] * 256);
              return D;
            }
            o.prototype.slice = function(t, r) {
              var l = this.length;
              t = ~~t, r = r === void 0 ? l : ~~r, t < 0 ? (t += l, t < 0 && (t = 0)) : t > l && (t = l), r < 0 ? (r += l, r < 0 && (r = 0)) : r > l && (r = l), r < t && (r = t);
              var D = this.subarray(t, r);
              return D.__proto__ = o.prototype, D;
            };
            function q(n, t, r) {
              if (n % 1 !== 0 || n < 0) throw new RangeError("offset is not uint");
              if (n + t > r) throw new RangeError("Trying to access beyond buffer length");
            }
            o.prototype.readUIntLE = function(t, r, l) {
              t = t >>> 0, r = r >>> 0, l || q(t, r, this.length);
              for (var D = this[t], te = 1, fe = 0; ++fe < r && (te *= 256); )
                D += this[t + fe] * te;
              return D;
            }, o.prototype.readUIntBE = function(t, r, l) {
              t = t >>> 0, r = r >>> 0, l || q(t, r, this.length);
              for (var D = this[t + --r], te = 1; r > 0 && (te *= 256); )
                D += this[t + --r] * te;
              return D;
            }, o.prototype.readUInt8 = function(t, r) {
              return t = t >>> 0, r || q(t, 1, this.length), this[t];
            }, o.prototype.readUInt16LE = function(t, r) {
              return t = t >>> 0, r || q(t, 2, this.length), this[t] | this[t + 1] << 8;
            }, o.prototype.readUInt16BE = function(t, r) {
              return t = t >>> 0, r || q(t, 2, this.length), this[t] << 8 | this[t + 1];
            }, o.prototype.readUInt32LE = function(t, r) {
              return t = t >>> 0, r || q(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + this[t + 3] * 16777216;
            }, o.prototype.readUInt32BE = function(t, r) {
              return t = t >>> 0, r || q(t, 4, this.length), this[t] * 16777216 + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
            }, o.prototype.readIntLE = function(t, r, l) {
              t = t >>> 0, r = r >>> 0, l || q(t, r, this.length);
              for (var D = this[t], te = 1, fe = 0; ++fe < r && (te *= 256); )
                D += this[t + fe] * te;
              return te *= 128, D >= te && (D -= Math.pow(2, 8 * r)), D;
            }, o.prototype.readIntBE = function(t, r, l) {
              t = t >>> 0, r = r >>> 0, l || q(t, r, this.length);
              for (var D = r, te = 1, fe = this[t + --D]; D > 0 && (te *= 256); )
                fe += this[t + --D] * te;
              return te *= 128, fe >= te && (fe -= Math.pow(2, 8 * r)), fe;
            }, o.prototype.readInt8 = function(t, r) {
              return t = t >>> 0, r || q(t, 1, this.length), this[t] & 128 ? (255 - this[t] + 1) * -1 : this[t];
            }, o.prototype.readInt16LE = function(t, r) {
              t = t >>> 0, r || q(t, 2, this.length);
              var l = this[t] | this[t + 1] << 8;
              return l & 32768 ? l | 4294901760 : l;
            }, o.prototype.readInt16BE = function(t, r) {
              t = t >>> 0, r || q(t, 2, this.length);
              var l = this[t + 1] | this[t] << 8;
              return l & 32768 ? l | 4294901760 : l;
            }, o.prototype.readInt32LE = function(t, r) {
              return t = t >>> 0, r || q(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
            }, o.prototype.readInt32BE = function(t, r) {
              return t = t >>> 0, r || q(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
            }, o.prototype.readFloatLE = function(t, r) {
              return t = t >>> 0, r || q(t, 4, this.length), T.read(this, t, !0, 23, 4);
            }, o.prototype.readFloatBE = function(t, r) {
              return t = t >>> 0, r || q(t, 4, this.length), T.read(this, t, !1, 23, 4);
            }, o.prototype.readDoubleLE = function(t, r) {
              return t = t >>> 0, r || q(t, 8, this.length), T.read(this, t, !0, 52, 8);
            }, o.prototype.readDoubleBE = function(t, r) {
              return t = t >>> 0, r || q(t, 8, this.length), T.read(this, t, !1, 52, 8);
            };
            function ge(n, t, r, l, D, te) {
              if (!o.isBuffer(n)) throw new TypeError('"buffer" argument must be a Buffer instance');
              if (t > D || t < te) throw new RangeError('"value" argument is out of bounds');
              if (r + l > n.length) throw new RangeError("Index out of range");
            }
            o.prototype.writeUIntLE = function(t, r, l, D) {
              if (t = +t, r = r >>> 0, l = l >>> 0, !D) {
                var te = Math.pow(2, 8 * l) - 1;
                ge(this, t, r, l, te, 0);
              }
              var fe = 1, Oe = 0;
              for (this[r] = t & 255; ++Oe < l && (fe *= 256); )
                this[r + Oe] = t / fe & 255;
              return r + l;
            }, o.prototype.writeUIntBE = function(t, r, l, D) {
              if (t = +t, r = r >>> 0, l = l >>> 0, !D) {
                var te = Math.pow(2, 8 * l) - 1;
                ge(this, t, r, l, te, 0);
              }
              var fe = l - 1, Oe = 1;
              for (this[r + fe] = t & 255; --fe >= 0 && (Oe *= 256); )
                this[r + fe] = t / Oe & 255;
              return r + l;
            }, o.prototype.writeUInt8 = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 1, 255, 0), this[r] = t & 255, r + 1;
            }, o.prototype.writeUInt16LE = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 2, 65535, 0), this[r] = t & 255, this[r + 1] = t >>> 8, r + 2;
            }, o.prototype.writeUInt16BE = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 2, 65535, 0), this[r] = t >>> 8, this[r + 1] = t & 255, r + 2;
            }, o.prototype.writeUInt32LE = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 4, 4294967295, 0), this[r + 3] = t >>> 24, this[r + 2] = t >>> 16, this[r + 1] = t >>> 8, this[r] = t & 255, r + 4;
            }, o.prototype.writeUInt32BE = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 4, 4294967295, 0), this[r] = t >>> 24, this[r + 1] = t >>> 16, this[r + 2] = t >>> 8, this[r + 3] = t & 255, r + 4;
            }, o.prototype.writeIntLE = function(t, r, l, D) {
              if (t = +t, r = r >>> 0, !D) {
                var te = Math.pow(2, 8 * l - 1);
                ge(this, t, r, l, te - 1, -te);
              }
              var fe = 0, Oe = 1, Ie = 0;
              for (this[r] = t & 255; ++fe < l && (Oe *= 256); )
                t < 0 && Ie === 0 && this[r + fe - 1] !== 0 && (Ie = 1), this[r + fe] = (t / Oe >> 0) - Ie & 255;
              return r + l;
            }, o.prototype.writeIntBE = function(t, r, l, D) {
              if (t = +t, r = r >>> 0, !D) {
                var te = Math.pow(2, 8 * l - 1);
                ge(this, t, r, l, te - 1, -te);
              }
              var fe = l - 1, Oe = 1, Ie = 0;
              for (this[r + fe] = t & 255; --fe >= 0 && (Oe *= 256); )
                t < 0 && Ie === 0 && this[r + fe + 1] !== 0 && (Ie = 1), this[r + fe] = (t / Oe >> 0) - Ie & 255;
              return r + l;
            }, o.prototype.writeInt8 = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 1, 127, -128), t < 0 && (t = 255 + t + 1), this[r] = t & 255, r + 1;
            }, o.prototype.writeInt16LE = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 2, 32767, -32768), this[r] = t & 255, this[r + 1] = t >>> 8, r + 2;
            }, o.prototype.writeInt16BE = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 2, 32767, -32768), this[r] = t >>> 8, this[r + 1] = t & 255, r + 2;
            }, o.prototype.writeInt32LE = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 4, 2147483647, -2147483648), this[r] = t & 255, this[r + 1] = t >>> 8, this[r + 2] = t >>> 16, this[r + 3] = t >>> 24, r + 4;
            }, o.prototype.writeInt32BE = function(t, r, l) {
              return t = +t, r = r >>> 0, l || ge(this, t, r, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), this[r] = t >>> 24, this[r + 1] = t >>> 16, this[r + 2] = t >>> 8, this[r + 3] = t & 255, r + 4;
            };
            function z(n, t, r, l, D, te) {
              if (r + l > n.length) throw new RangeError("Index out of range");
              if (r < 0) throw new RangeError("Index out of range");
            }
            function Y(n, t, r, l, D) {
              return t = +t, r = r >>> 0, D || z(n, t, r, 4, 34028234663852886e22, -34028234663852886e22), T.write(n, t, r, l, 23, 4), r + 4;
            }
            o.prototype.writeFloatLE = function(t, r, l) {
              return Y(this, t, r, !0, l);
            }, o.prototype.writeFloatBE = function(t, r, l) {
              return Y(this, t, r, !1, l);
            };
            function $(n, t, r, l, D) {
              return t = +t, r = r >>> 0, D || z(n, t, r, 8, 17976931348623157e292, -17976931348623157e292), T.write(n, t, r, l, 52, 8), r + 8;
            }
            o.prototype.writeDoubleLE = function(t, r, l) {
              return $(this, t, r, !0, l);
            }, o.prototype.writeDoubleBE = function(t, r, l) {
              return $(this, t, r, !1, l);
            }, o.prototype.copy = function(t, r, l, D) {
              if (!o.isBuffer(t)) throw new TypeError("argument should be a Buffer");
              if (l || (l = 0), !D && D !== 0 && (D = this.length), r >= t.length && (r = t.length), r || (r = 0), D > 0 && D < l && (D = l), D === l || t.length === 0 || this.length === 0) return 0;
              if (r < 0)
                throw new RangeError("targetStart out of bounds");
              if (l < 0 || l >= this.length) throw new RangeError("Index out of range");
              if (D < 0) throw new RangeError("sourceEnd out of bounds");
              D > this.length && (D = this.length), t.length - r < D - l && (D = t.length - r + l);
              var te = D - l;
              if (this === t && typeof Uint8Array.prototype.copyWithin == "function")
                this.copyWithin(r, l, D);
              else if (this === t && l < r && r < D)
                for (var fe = te - 1; fe >= 0; --fe)
                  t[fe + r] = this[fe + l];
              else
                Uint8Array.prototype.set.call(
                  t,
                  this.subarray(l, D),
                  r
                );
              return te;
            }, o.prototype.fill = function(t, r, l, D) {
              if (typeof t == "string") {
                if (typeof r == "string" ? (D = r, r = 0, l = this.length) : typeof l == "string" && (D = l, l = this.length), D !== void 0 && typeof D != "string")
                  throw new TypeError("encoding must be a string");
                if (typeof D == "string" && !o.isEncoding(D))
                  throw new TypeError("Unknown encoding: " + D);
                if (t.length === 1) {
                  var te = t.charCodeAt(0);
                  (D === "utf8" && te < 128 || D === "latin1") && (t = te);
                }
              } else typeof t == "number" && (t = t & 255);
              if (r < 0 || this.length < r || this.length < l)
                throw new RangeError("Out of range index");
              if (l <= r)
                return this;
              r = r >>> 0, l = l === void 0 ? this.length : l >>> 0, t || (t = 0);
              var fe;
              if (typeof t == "number")
                for (fe = r; fe < l; ++fe)
                  this[fe] = t;
              else {
                var Oe = o.isBuffer(t) ? t : o.from(t, D), Ie = Oe.length;
                if (Ie === 0)
                  throw new TypeError('The value "' + t + '" is invalid for argument "value"');
                for (fe = 0; fe < l - r; ++fe)
                  this[fe + r] = Oe[fe % Ie];
              }
              return this;
            };
            var ce = /[^+/0-9A-Za-z-_]/g;
            function de(n) {
              if (n = n.split("=")[0], n = n.trim().replace(ce, ""), n.length < 2) return "";
              for (; n.length % 4 !== 0; )
                n = n + "=";
              return n;
            }
            function we(n) {
              return n < 16 ? "0" + n.toString(16) : n.toString(16);
            }
            function ye(n, t) {
              t = t || 1 / 0;
              for (var r, l = n.length, D = null, te = [], fe = 0; fe < l; ++fe) {
                if (r = n.charCodeAt(fe), r > 55295 && r < 57344) {
                  if (!D) {
                    if (r > 56319) {
                      (t -= 3) > -1 && te.push(239, 191, 189);
                      continue;
                    } else if (fe + 1 === l) {
                      (t -= 3) > -1 && te.push(239, 191, 189);
                      continue;
                    }
                    D = r;
                    continue;
                  }
                  if (r < 56320) {
                    (t -= 3) > -1 && te.push(239, 191, 189), D = r;
                    continue;
                  }
                  r = (D - 55296 << 10 | r - 56320) + 65536;
                } else D && (t -= 3) > -1 && te.push(239, 191, 189);
                if (D = null, r < 128) {
                  if ((t -= 1) < 0) break;
                  te.push(r);
                } else if (r < 2048) {
                  if ((t -= 2) < 0) break;
                  te.push(
                    r >> 6 | 192,
                    r & 63 | 128
                  );
                } else if (r < 65536) {
                  if ((t -= 3) < 0) break;
                  te.push(
                    r >> 12 | 224,
                    r >> 6 & 63 | 128,
                    r & 63 | 128
                  );
                } else if (r < 1114112) {
                  if ((t -= 4) < 0) break;
                  te.push(
                    r >> 18 | 240,
                    r >> 12 & 63 | 128,
                    r >> 6 & 63 | 128,
                    r & 63 | 128
                  );
                } else
                  throw new Error("Invalid code point");
              }
              return te;
            }
            function U(n) {
              for (var t = [], r = 0; r < n.length; ++r)
                t.push(n.charCodeAt(r) & 255);
              return t;
            }
            function j(n, t) {
              for (var r, l, D, te = [], fe = 0; fe < n.length && !((t -= 2) < 0); ++fe)
                r = n.charCodeAt(fe), l = r >> 8, D = r % 256, te.push(D), te.push(l);
              return te;
            }
            function ie(n) {
              return g.toByteArray(de(n));
            }
            function _e(n, t, r, l) {
              for (var D = 0; D < l && !(D + r >= t.length || D >= n.length); ++D)
                t[D + r] = n[D];
              return D;
            }
            function Te(n, t) {
              return n instanceof t || n != null && n.constructor != null && n.constructor.name != null && n.constructor.name === t.name;
            }
            function k(n) {
              return n !== n;
            }
          }).call(this);
        }).call(this, y("buffer").Buffer);
      }, { "base64-js": 28, buffer: 32, ieee754: 45 }], 33: [function(y, H, s) {
        "use strict";
        var w = y("get-intrinsic"), g = y("./"), T = g(w("String.prototype.indexOf"));
        H.exports = function(d, i) {
          var o = w(d, !!i);
          return typeof o == "function" && T(d, ".prototype.") > -1 ? g(o) : o;
        };
      }, { "./": 34, "get-intrinsic": 39 }], 34: [function(y, H, s) {
        "use strict";
        var w = y("function-bind"), g = y("get-intrinsic"), T = g("%Function.prototype.apply%"), m = g("%Function.prototype.call%"), d = g("%Reflect.apply%", !0) || w.call(m, T), i = g("%Object.getOwnPropertyDescriptor%", !0), o = g("%Object.defineProperty%", !0), a = g("%Math.max%");
        if (o)
          try {
            o({}, "a", { value: 1 });
          } catch {
            o = null;
          }
        H.exports = function(u) {
          var c = d(w, m, arguments);
          if (i && o) {
            var b = i(c, "length");
            b.configurable && o(
              c,
              "length",
              { value: 1 + a(0, u.length - (arguments.length - 1)) }
            );
          }
          return c;
        };
        var f = function() {
          return d(w, T, arguments);
        };
        o ? o(H.exports, "apply", { value: f }) : H.exports.apply = f;
      }, { "function-bind": 38, "get-intrinsic": 39 }], 35: [function(y, H, s) {
        "use strict";
        var w = typeof Reflect == "object" ? Reflect : null, g = w && typeof w.apply == "function" ? w.apply : function(N, G, W) {
          return Function.prototype.apply.call(N, G, W);
        }, T;
        w && typeof w.ownKeys == "function" ? T = w.ownKeys : Object.getOwnPropertySymbols ? T = function(N) {
          return Object.getOwnPropertyNames(N).concat(Object.getOwnPropertySymbols(N));
        } : T = function(N) {
          return Object.getOwnPropertyNames(N);
        };
        function m(M) {
          console && console.warn && console.warn(M);
        }
        var d = Number.isNaN || function(N) {
          return N !== N;
        };
        function i() {
          i.init.call(this);
        }
        H.exports = i, H.exports.once = E, i.EventEmitter = i, i.prototype._events = void 0, i.prototype._eventsCount = 0, i.prototype._maxListeners = void 0;
        var o = 10;
        function a(M) {
          if (typeof M != "function")
            throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof M);
        }
        Object.defineProperty(i, "defaultMaxListeners", {
          enumerable: !0,
          get: function() {
            return o;
          },
          set: function(M) {
            if (typeof M != "number" || M < 0 || d(M))
              throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + M + ".");
            o = M;
          }
        }), i.init = function() {
          (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
        }, i.prototype.setMaxListeners = function(N) {
          if (typeof N != "number" || N < 0 || d(N))
            throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + N + ".");
          return this._maxListeners = N, this;
        };
        function f(M) {
          return M._maxListeners === void 0 ? i.defaultMaxListeners : M._maxListeners;
        }
        i.prototype.getMaxListeners = function() {
          return f(this);
        }, i.prototype.emit = function(N) {
          for (var G = [], W = 1; W < arguments.length; W++) G.push(arguments[W]);
          var Q = N === "error", re = this._events;
          if (re !== void 0)
            Q = Q && re.error === void 0;
          else if (!Q)
            return !1;
          if (Q) {
            var ae;
            if (G.length > 0 && (ae = G[0]), ae instanceof Error)
              throw ae;
            var C = new Error("Unhandled error." + (ae ? " (" + ae.message + ")" : ""));
            throw C.context = ae, C;
          }
          var h = re[N];
          if (h === void 0)
            return !1;
          if (typeof h == "function")
            g(h, this, G);
          else
            for (var x = h.length, V = S(h, x), W = 0; W < x; ++W)
              g(V[W], this, G);
          return !0;
        };
        function p(M, N, G, W) {
          var Q, re, ae;
          if (a(G), re = M._events, re === void 0 ? (re = M._events = /* @__PURE__ */ Object.create(null), M._eventsCount = 0) : (re.newListener !== void 0 && (M.emit(
            "newListener",
            N,
            G.listener ? G.listener : G
          ), re = M._events), ae = re[N]), ae === void 0)
            ae = re[N] = G, ++M._eventsCount;
          else if (typeof ae == "function" ? ae = re[N] = W ? [G, ae] : [ae, G] : W ? ae.unshift(G) : ae.push(G), Q = f(M), Q > 0 && ae.length > Q && !ae.warned) {
            ae.warned = !0;
            var C = new Error("Possible EventEmitter memory leak detected. " + ae.length + " " + String(N) + " listeners added. Use emitter.setMaxListeners() to increase limit");
            C.name = "MaxListenersExceededWarning", C.emitter = M, C.type = N, C.count = ae.length, m(C);
          }
          return M;
        }
        i.prototype.addListener = function(N, G) {
          return p(this, N, G, !1);
        }, i.prototype.on = i.prototype.addListener, i.prototype.prependListener = function(N, G) {
          return p(this, N, G, !0);
        };
        function u() {
          if (!this.fired)
            return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
        }
        function c(M, N, G) {
          var W = { fired: !1, wrapFn: void 0, target: M, type: N, listener: G }, Q = u.bind(W);
          return Q.listener = G, W.wrapFn = Q, Q;
        }
        i.prototype.once = function(N, G) {
          return a(G), this.on(N, c(this, N, G)), this;
        }, i.prototype.prependOnceListener = function(N, G) {
          return a(G), this.prependListener(N, c(this, N, G)), this;
        }, i.prototype.removeListener = function(N, G) {
          var W, Q, re, ae, C;
          if (a(G), Q = this._events, Q === void 0)
            return this;
          if (W = Q[N], W === void 0)
            return this;
          if (W === G || W.listener === G)
            --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete Q[N], Q.removeListener && this.emit("removeListener", N, W.listener || G));
          else if (typeof W != "function") {
            for (re = -1, ae = W.length - 1; ae >= 0; ae--)
              if (W[ae] === G || W[ae].listener === G) {
                C = W[ae].listener, re = ae;
                break;
              }
            if (re < 0)
              return this;
            re === 0 ? W.shift() : O(W, re), W.length === 1 && (Q[N] = W[0]), Q.removeListener !== void 0 && this.emit("removeListener", N, C || G);
          }
          return this;
        }, i.prototype.off = i.prototype.removeListener, i.prototype.removeAllListeners = function(N) {
          var G, W, Q;
          if (W = this._events, W === void 0)
            return this;
          if (W.removeListener === void 0)
            return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : W[N] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete W[N]), this;
          if (arguments.length === 0) {
            var re = Object.keys(W), ae;
            for (Q = 0; Q < re.length; ++Q)
              ae = re[Q], ae !== "removeListener" && this.removeAllListeners(ae);
            return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
          }
          if (G = W[N], typeof G == "function")
            this.removeListener(N, G);
          else if (G !== void 0)
            for (Q = G.length - 1; Q >= 0; Q--)
              this.removeListener(N, G[Q]);
          return this;
        };
        function b(M, N, G) {
          var W = M._events;
          if (W === void 0)
            return [];
          var Q = W[N];
          return Q === void 0 ? [] : typeof Q == "function" ? G ? [Q.listener || Q] : [Q] : G ? L(Q) : S(Q, Q.length);
        }
        i.prototype.listeners = function(N) {
          return b(this, N, !0);
        }, i.prototype.rawListeners = function(N) {
          return b(this, N, !1);
        }, i.listenerCount = function(M, N) {
          return typeof M.listenerCount == "function" ? M.listenerCount(N) : R.call(M, N);
        }, i.prototype.listenerCount = R;
        function R(M) {
          var N = this._events;
          if (N !== void 0) {
            var G = N[M];
            if (typeof G == "function")
              return 1;
            if (G !== void 0)
              return G.length;
          }
          return 0;
        }
        i.prototype.eventNames = function() {
          return this._eventsCount > 0 ? T(this._events) : [];
        };
        function S(M, N) {
          for (var G = new Array(N), W = 0; W < N; ++W)
            G[W] = M[W];
          return G;
        }
        function O(M, N) {
          for (; N + 1 < M.length; N++)
            M[N] = M[N + 1];
          M.pop();
        }
        function L(M) {
          for (var N = new Array(M.length), G = 0; G < N.length; ++G)
            N[G] = M[G].listener || M[G];
          return N;
        }
        function E(M, N) {
          return new Promise(function(G, W) {
            function Q(ae) {
              M.removeListener(N, re), W(ae);
            }
            function re() {
              typeof M.removeListener == "function" && M.removeListener("error", Q), G([].slice.call(arguments));
            }
            I(M, N, re, { once: !0 }), N !== "error" && F(M, Q, { once: !0 });
          });
        }
        function F(M, N, G) {
          typeof M.on == "function" && I(M, "error", N, G);
        }
        function I(M, N, G, W) {
          if (typeof M.on == "function")
            W.once ? M.once(N, G) : M.on(N, G);
          else if (typeof M.addEventListener == "function")
            M.addEventListener(N, function Q(re) {
              W.once && M.removeEventListener(N, Q), G(re);
            });
          else
            throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof M);
        }
      }, {}], 36: [function(y, H, s) {
        "use strict";
        var w = y("is-callable"), g = Object.prototype.toString, T = Object.prototype.hasOwnProperty, m = function(f, p, u) {
          for (var c = 0, b = f.length; c < b; c++)
            T.call(f, c) && (u == null ? p(f[c], c, f) : p.call(u, f[c], c, f));
        }, d = function(f, p, u) {
          for (var c = 0, b = f.length; c < b; c++)
            u == null ? p(f.charAt(c), c, f) : p.call(u, f.charAt(c), c, f);
        }, i = function(f, p, u) {
          for (var c in f)
            T.call(f, c) && (u == null ? p(f[c], c, f) : p.call(u, f[c], c, f));
        }, o = function(f, p, u) {
          if (!w(p))
            throw new TypeError("iterator must be a function");
          var c;
          arguments.length >= 3 && (c = u), g.call(f) === "[object Array]" ? m(f, p, c) : typeof f == "string" ? d(f, p, c) : i(f, p, c);
        };
        H.exports = o;
      }, { "is-callable": 48 }], 37: [function(y, H, s) {
        "use strict";
        var w = "Function.prototype.bind called on incompatible ", g = Array.prototype.slice, T = Object.prototype.toString, m = "[object Function]";
        H.exports = function(i) {
          var o = this;
          if (typeof o != "function" || T.call(o) !== m)
            throw new TypeError(w + o);
          for (var a = g.call(arguments, 1), f, p = function() {
            if (this instanceof f) {
              var S = o.apply(
                this,
                a.concat(g.call(arguments))
              );
              return Object(S) === S ? S : this;
            } else
              return o.apply(
                i,
                a.concat(g.call(arguments))
              );
          }, u = Math.max(0, o.length - a.length), c = [], b = 0; b < u; b++)
            c.push("$" + b);
          if (f = Function("binder", "return function (" + c.join(",") + "){ return binder.apply(this,arguments); }")(p), o.prototype) {
            var R = function() {
            };
            R.prototype = o.prototype, f.prototype = new R(), R.prototype = null;
          }
          return f;
        };
      }, {}], 38: [function(y, H, s) {
        "use strict";
        var w = y("./implementation");
        H.exports = Function.prototype.bind || w;
      }, { "./implementation": 37 }], 39: [function(y, H, s) {
        "use strict";
        var w, g = SyntaxError, T = Function, m = TypeError, d = function(C) {
          try {
            return T('"use strict"; return (' + C + ").constructor;")();
          } catch {
          }
        }, i = Object.getOwnPropertyDescriptor;
        if (i)
          try {
            i({}, "");
          } catch {
            i = null;
          }
        var o = function() {
          throw new m();
        }, a = i ? function() {
          try {
            return arguments.callee, o;
          } catch {
            try {
              return i(arguments, "callee").get;
            } catch {
              return o;
            }
          }
        }() : o, f = y("has-symbols")(), p = Object.getPrototypeOf || function(C) {
          return C.__proto__;
        }, u = {}, c = typeof Uint8Array > "u" ? w : p(Uint8Array), b = {
          "%AggregateError%": typeof AggregateError > "u" ? w : AggregateError,
          "%Array%": Array,
          "%ArrayBuffer%": typeof ArrayBuffer > "u" ? w : ArrayBuffer,
          "%ArrayIteratorPrototype%": f ? p([][Symbol.iterator]()) : w,
          "%AsyncFromSyncIteratorPrototype%": w,
          "%AsyncFunction%": u,
          "%AsyncGenerator%": u,
          "%AsyncGeneratorFunction%": u,
          "%AsyncIteratorPrototype%": u,
          "%Atomics%": typeof Atomics > "u" ? w : Atomics,
          "%BigInt%": typeof BigInt > "u" ? w : BigInt,
          "%BigInt64Array%": typeof BigInt64Array > "u" ? w : BigInt64Array,
          "%BigUint64Array%": typeof BigUint64Array > "u" ? w : BigUint64Array,
          "%Boolean%": Boolean,
          "%DataView%": typeof DataView > "u" ? w : DataView,
          "%Date%": Date,
          "%decodeURI%": decodeURI,
          "%decodeURIComponent%": decodeURIComponent,
          "%encodeURI%": encodeURI,
          "%encodeURIComponent%": encodeURIComponent,
          "%Error%": Error,
          "%eval%": eval,
          // eslint-disable-line no-eval
          "%EvalError%": EvalError,
          "%Float32Array%": typeof Float32Array > "u" ? w : Float32Array,
          "%Float64Array%": typeof Float64Array > "u" ? w : Float64Array,
          "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? w : FinalizationRegistry,
          "%Function%": T,
          "%GeneratorFunction%": u,
          "%Int8Array%": typeof Int8Array > "u" ? w : Int8Array,
          "%Int16Array%": typeof Int16Array > "u" ? w : Int16Array,
          "%Int32Array%": typeof Int32Array > "u" ? w : Int32Array,
          "%isFinite%": isFinite,
          "%isNaN%": isNaN,
          "%IteratorPrototype%": f ? p(p([][Symbol.iterator]())) : w,
          "%JSON%": typeof JSON == "object" ? JSON : w,
          "%Map%": typeof Map > "u" ? w : Map,
          "%MapIteratorPrototype%": typeof Map > "u" || !f ? w : p((/* @__PURE__ */ new Map())[Symbol.iterator]()),
          "%Math%": Math,
          "%Number%": Number,
          "%Object%": Object,
          "%parseFloat%": parseFloat,
          "%parseInt%": parseInt,
          "%Promise%": typeof Promise > "u" ? w : Promise,
          "%Proxy%": typeof Proxy > "u" ? w : Proxy,
          "%RangeError%": RangeError,
          "%ReferenceError%": ReferenceError,
          "%Reflect%": typeof Reflect > "u" ? w : Reflect,
          "%RegExp%": RegExp,
          "%Set%": typeof Set > "u" ? w : Set,
          "%SetIteratorPrototype%": typeof Set > "u" || !f ? w : p((/* @__PURE__ */ new Set())[Symbol.iterator]()),
          "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? w : SharedArrayBuffer,
          "%String%": String,
          "%StringIteratorPrototype%": f ? p(""[Symbol.iterator]()) : w,
          "%Symbol%": f ? Symbol : w,
          "%SyntaxError%": g,
          "%ThrowTypeError%": a,
          "%TypedArray%": c,
          "%TypeError%": m,
          "%Uint8Array%": typeof Uint8Array > "u" ? w : Uint8Array,
          "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? w : Uint8ClampedArray,
          "%Uint16Array%": typeof Uint16Array > "u" ? w : Uint16Array,
          "%Uint32Array%": typeof Uint32Array > "u" ? w : Uint32Array,
          "%URIError%": URIError,
          "%WeakMap%": typeof WeakMap > "u" ? w : WeakMap,
          "%WeakRef%": typeof WeakRef > "u" ? w : WeakRef,
          "%WeakSet%": typeof WeakSet > "u" ? w : WeakSet
        };
        try {
          null.error;
        } catch (C) {
          var R = p(p(C));
          b["%Error.prototype%"] = R;
        }
        var S = function C(h) {
          var x;
          if (h === "%AsyncFunction%")
            x = d("async function () {}");
          else if (h === "%GeneratorFunction%")
            x = d("function* () {}");
          else if (h === "%AsyncGeneratorFunction%")
            x = d("async function* () {}");
          else if (h === "%AsyncGenerator%") {
            var V = C("%AsyncGeneratorFunction%");
            V && (x = V.prototype);
          } else if (h === "%AsyncIteratorPrototype%") {
            var oe = C("%AsyncGenerator%");
            oe && (x = p(oe.prototype));
          }
          return b[h] = x, x;
        }, O = {
          "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
          "%ArrayPrototype%": ["Array", "prototype"],
          "%ArrayProto_entries%": ["Array", "prototype", "entries"],
          "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
          "%ArrayProto_keys%": ["Array", "prototype", "keys"],
          "%ArrayProto_values%": ["Array", "prototype", "values"],
          "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
          "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
          "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
          "%BooleanPrototype%": ["Boolean", "prototype"],
          "%DataViewPrototype%": ["DataView", "prototype"],
          "%DatePrototype%": ["Date", "prototype"],
          "%ErrorPrototype%": ["Error", "prototype"],
          "%EvalErrorPrototype%": ["EvalError", "prototype"],
          "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
          "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
          "%FunctionPrototype%": ["Function", "prototype"],
          "%Generator%": ["GeneratorFunction", "prototype"],
          "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
          "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
          "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
          "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
          "%JSONParse%": ["JSON", "parse"],
          "%JSONStringify%": ["JSON", "stringify"],
          "%MapPrototype%": ["Map", "prototype"],
          "%NumberPrototype%": ["Number", "prototype"],
          "%ObjectPrototype%": ["Object", "prototype"],
          "%ObjProto_toString%": ["Object", "prototype", "toString"],
          "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
          "%PromisePrototype%": ["Promise", "prototype"],
          "%PromiseProto_then%": ["Promise", "prototype", "then"],
          "%Promise_all%": ["Promise", "all"],
          "%Promise_reject%": ["Promise", "reject"],
          "%Promise_resolve%": ["Promise", "resolve"],
          "%RangeErrorPrototype%": ["RangeError", "prototype"],
          "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
          "%RegExpPrototype%": ["RegExp", "prototype"],
          "%SetPrototype%": ["Set", "prototype"],
          "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
          "%StringPrototype%": ["String", "prototype"],
          "%SymbolPrototype%": ["Symbol", "prototype"],
          "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
          "%TypedArrayPrototype%": ["TypedArray", "prototype"],
          "%TypeErrorPrototype%": ["TypeError", "prototype"],
          "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
          "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
          "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
          "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
          "%URIErrorPrototype%": ["URIError", "prototype"],
          "%WeakMapPrototype%": ["WeakMap", "prototype"],
          "%WeakSetPrototype%": ["WeakSet", "prototype"]
        }, L = y("function-bind"), E = y("has"), F = L.call(Function.call, Array.prototype.concat), I = L.call(Function.apply, Array.prototype.splice), M = L.call(Function.call, String.prototype.replace), N = L.call(Function.call, String.prototype.slice), G = L.call(Function.call, RegExp.prototype.exec), W = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, Q = /\\(\\)?/g, re = function(h) {
          var x = N(h, 0, 1), V = N(h, -1);
          if (x === "%" && V !== "%")
            throw new g("invalid intrinsic syntax, expected closing `%`");
          if (V === "%" && x !== "%")
            throw new g("invalid intrinsic syntax, expected opening `%`");
          var oe = [];
          return M(h, W, function(Ee, he, B, K) {
            oe[oe.length] = B ? M(K, Q, "$1") : he || Ee;
          }), oe;
        }, ae = function(h, x) {
          var V = h, oe;
          if (E(O, V) && (oe = O[V], V = "%" + oe[0] + "%"), E(b, V)) {
            var Ee = b[V];
            if (Ee === u && (Ee = S(V)), typeof Ee > "u" && !x)
              throw new m("intrinsic " + h + " exists, but is not available. Please file an issue!");
            return {
              alias: oe,
              name: V,
              value: Ee
            };
          }
          throw new g("intrinsic " + h + " does not exist!");
        };
        H.exports = function(h, x) {
          if (typeof h != "string" || h.length === 0)
            throw new m("intrinsic name must be a non-empty string");
          if (arguments.length > 1 && typeof x != "boolean")
            throw new m('"allowMissing" argument must be a boolean');
          if (G(/^%?[^%]*%?$/, h) === null)
            throw new g("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
          var V = re(h), oe = V.length > 0 ? V[0] : "", Ee = ae("%" + oe + "%", x), he = Ee.name, B = Ee.value, K = !1, q = Ee.alias;
          q && (oe = q[0], I(V, F([0, 1], q)));
          for (var ge = 1, z = !0; ge < V.length; ge += 1) {
            var Y = V[ge], $ = N(Y, 0, 1), ce = N(Y, -1);
            if (($ === '"' || $ === "'" || $ === "`" || ce === '"' || ce === "'" || ce === "`") && $ !== ce)
              throw new g("property names with quotes must have matching quotes");
            if ((Y === "constructor" || !z) && (K = !0), oe += "." + Y, he = "%" + oe + "%", E(b, he))
              B = b[he];
            else if (B != null) {
              if (!(Y in B)) {
                if (!x)
                  throw new m("base intrinsic for " + h + " exists, but the property is not available.");
                return;
              }
              if (i && ge + 1 >= V.length) {
                var de = i(B, Y);
                z = !!de, z && "get" in de && !("originalValue" in de.get) ? B = de.get : B = B[Y];
              } else
                z = E(B, Y), B = B[Y];
              z && !K && (b[he] = B);
            }
          }
          return B;
        };
      }, { "function-bind": 38, has: 44, "has-symbols": 41 }], 40: [function(y, H, s) {
        "use strict";
        var w = y("get-intrinsic"), g = w("%Object.getOwnPropertyDescriptor%", !0);
        if (g)
          try {
            g([], "length");
          } catch {
            g = null;
          }
        H.exports = g;
      }, { "get-intrinsic": 39 }], 41: [function(y, H, s) {
        "use strict";
        var w = typeof Symbol < "u" && Symbol, g = y("./shams");
        H.exports = function() {
          return typeof w != "function" || typeof Symbol != "function" || typeof w("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 : g();
        };
      }, { "./shams": 42 }], 42: [function(y, H, s) {
        "use strict";
        H.exports = function() {
          if (typeof Symbol != "function" || typeof Object.getOwnPropertySymbols != "function")
            return !1;
          if (typeof Symbol.iterator == "symbol")
            return !0;
          var g = {}, T = Symbol("test"), m = Object(T);
          if (typeof T == "string" || Object.prototype.toString.call(T) !== "[object Symbol]" || Object.prototype.toString.call(m) !== "[object Symbol]")
            return !1;
          var d = 42;
          g[T] = d;
          for (T in g)
            return !1;
          if (typeof Object.keys == "function" && Object.keys(g).length !== 0 || typeof Object.getOwnPropertyNames == "function" && Object.getOwnPropertyNames(g).length !== 0)
            return !1;
          var i = Object.getOwnPropertySymbols(g);
          if (i.length !== 1 || i[0] !== T || !Object.prototype.propertyIsEnumerable.call(g, T))
            return !1;
          if (typeof Object.getOwnPropertyDescriptor == "function") {
            var o = Object.getOwnPropertyDescriptor(g, T);
            if (o.value !== d || o.enumerable !== !0)
              return !1;
          }
          return !0;
        };
      }, {}], 43: [function(y, H, s) {
        "use strict";
        var w = y("has-symbols/shams");
        H.exports = function() {
          return w() && !!Symbol.toStringTag;
        };
      }, { "has-symbols/shams": 42 }], 44: [function(y, H, s) {
        "use strict";
        var w = y("function-bind");
        H.exports = w.call(Function.call, Object.prototype.hasOwnProperty);
      }, { "function-bind": 38 }], 45: [function(y, H, s) {
        s.read = function(w, g, T, m, d) {
          var i, o, a = d * 8 - m - 1, f = (1 << a) - 1, p = f >> 1, u = -7, c = T ? d - 1 : 0, b = T ? -1 : 1, R = w[g + c];
          for (c += b, i = R & (1 << -u) - 1, R >>= -u, u += a; u > 0; i = i * 256 + w[g + c], c += b, u -= 8)
            ;
          for (o = i & (1 << -u) - 1, i >>= -u, u += m; u > 0; o = o * 256 + w[g + c], c += b, u -= 8)
            ;
          if (i === 0)
            i = 1 - p;
          else {
            if (i === f)
              return o ? NaN : (R ? -1 : 1) * (1 / 0);
            o = o + Math.pow(2, m), i = i - p;
          }
          return (R ? -1 : 1) * o * Math.pow(2, i - m);
        }, s.write = function(w, g, T, m, d, i) {
          var o, a, f, p = i * 8 - d - 1, u = (1 << p) - 1, c = u >> 1, b = d === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, R = m ? 0 : i - 1, S = m ? 1 : -1, O = g < 0 || g === 0 && 1 / g < 0 ? 1 : 0;
          for (g = Math.abs(g), isNaN(g) || g === 1 / 0 ? (a = isNaN(g) ? 1 : 0, o = u) : (o = Math.floor(Math.log(g) / Math.LN2), g * (f = Math.pow(2, -o)) < 1 && (o--, f *= 2), o + c >= 1 ? g += b / f : g += b * Math.pow(2, 1 - c), g * f >= 2 && (o++, f /= 2), o + c >= u ? (a = 0, o = u) : o + c >= 1 ? (a = (g * f - 1) * Math.pow(2, d), o = o + c) : (a = g * Math.pow(2, c - 1) * Math.pow(2, d), o = 0)); d >= 8; w[T + R] = a & 255, R += S, a /= 256, d -= 8)
            ;
          for (o = o << d | a, p += d; p > 0; w[T + R] = o & 255, R += S, o /= 256, p -= 8)
            ;
          w[T + R - S] |= O * 128;
        };
      }, {}], 46: [function(y, H, s) {
        typeof Object.create == "function" ? H.exports = function(g, T) {
          T && (g.super_ = T, g.prototype = Object.create(T.prototype, {
            constructor: {
              value: g,
              enumerable: !1,
              writable: !0,
              configurable: !0
            }
          }));
        } : H.exports = function(g, T) {
          if (T) {
            g.super_ = T;
            var m = function() {
            };
            m.prototype = T.prototype, g.prototype = new m(), g.prototype.constructor = g;
          }
        };
      }, {}], 47: [function(y, H, s) {
        "use strict";
        var w = y("has-tostringtag/shams")(), g = y("call-bind/callBound"), T = g("Object.prototype.toString"), m = function(a) {
          return w && a && typeof a == "object" && Symbol.toStringTag in a ? !1 : T(a) === "[object Arguments]";
        }, d = function(a) {
          return m(a) ? !0 : a !== null && typeof a == "object" && typeof a.length == "number" && a.length >= 0 && T(a) !== "[object Array]" && T(a.callee) === "[object Function]";
        }, i = function() {
          return m(arguments);
        }();
        m.isLegacyArguments = d, H.exports = i ? m : d;
      }, { "call-bind/callBound": 33, "has-tostringtag/shams": 43 }], 48: [function(y, H, s) {
        "use strict";
        var w = Function.prototype.toString, g = typeof Reflect == "object" && Reflect !== null && Reflect.apply, T, m;
        if (typeof g == "function" && typeof Object.defineProperty == "function")
          try {
            T = Object.defineProperty({}, "length", {
              get: function() {
                throw m;
              }
            }), m = {}, g(function() {
              throw 42;
            }, null, T);
          } catch (F) {
            F !== m && (g = null);
          }
        else
          g = null;
        var d = /^\s*class\b/, i = function(I) {
          try {
            var M = w.call(I);
            return d.test(M);
          } catch {
            return !1;
          }
        }, o = function(I) {
          try {
            return i(I) ? !1 : (w.call(I), !0);
          } catch {
            return !1;
          }
        }, a = Object.prototype.toString, f = "[object Object]", p = "[object Function]", u = "[object GeneratorFunction]", c = "[object HTMLAllCollection]", b = "[object HTML document.all class]", R = "[object HTMLCollection]", S = typeof Symbol == "function" && !!Symbol.toStringTag, O = !(0 in [,]), L = function() {
          return !1;
        };
        if (typeof document == "object") {
          var E = document.all;
          a.call(E) === a.call(document.all) && (L = function(I) {
            if ((O || !I) && (typeof I > "u" || typeof I == "object"))
              try {
                var M = a.call(I);
                return (M === c || M === b || M === R || M === f) && I("") == null;
              } catch {
              }
            return !1;
          });
        }
        H.exports = g ? function(I) {
          if (L(I))
            return !0;
          if (!I || typeof I != "function" && typeof I != "object")
            return !1;
          try {
            g(I, null, T);
          } catch (M) {
            if (M !== m)
              return !1;
          }
          return !i(I) && o(I);
        } : function(I) {
          if (L(I))
            return !0;
          if (!I || typeof I != "function" && typeof I != "object")
            return !1;
          if (S)
            return o(I);
          if (i(I))
            return !1;
          var M = a.call(I);
          return M !== p && M !== u && !/^\[object HTML/.test(M) ? !1 : o(I);
        };
      }, {}], 49: [function(y, H, s) {
        "use strict";
        var w = Object.prototype.toString, g = Function.prototype.toString, T = /^\s*(?:function)?\*/, m = y("has-tostringtag/shams")(), d = Object.getPrototypeOf, i = function() {
          if (!m)
            return !1;
          try {
            return Function("return function*() {}")();
          } catch {
          }
        }, o;
        H.exports = function(f) {
          if (typeof f != "function")
            return !1;
          if (T.test(g.call(f)))
            return !0;
          if (!m) {
            var p = w.call(f);
            return p === "[object GeneratorFunction]";
          }
          if (!d)
            return !1;
          if (typeof o > "u") {
            var u = i();
            o = u ? d(u) : !1;
          }
          return d(f) === o;
        };
      }, { "has-tostringtag/shams": 43 }], 50: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            var g = y("for-each"), T = y("available-typed-arrays"), m = y("call-bind/callBound"), d = m("Object.prototype.toString"), i = y("has-tostringtag/shams")(), o = y("gopd"), a = typeof globalThis > "u" ? w : globalThis, f = T(), p = m("Array.prototype.indexOf", !0) || function(O, L) {
              for (var E = 0; E < O.length; E += 1)
                if (O[E] === L)
                  return E;
              return -1;
            }, u = m("String.prototype.slice"), c = {}, b = Object.getPrototypeOf;
            i && o && b && g(f, function(S) {
              var O = new a[S]();
              if (Symbol.toStringTag in O) {
                var L = b(O), E = o(L, Symbol.toStringTag);
                if (!E) {
                  var F = b(L);
                  E = o(F, Symbol.toStringTag);
                }
                c[S] = E.get;
              }
            });
            var R = function(O) {
              var L = !1;
              return g(c, function(E, F) {
                if (!L)
                  try {
                    L = E.call(O) === F;
                  } catch {
                  }
              }), L;
            };
            H.exports = function(O) {
              if (!O || typeof O != "object")
                return !1;
              if (!i || !(Symbol.toStringTag in O)) {
                var L = u(d(O), 8, -1);
                return p(f, L) > -1;
              }
              return o ? R(O) : !1;
            };
          }).call(this);
        }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, { "available-typed-arrays": 27, "call-bind/callBound": 33, "for-each": 36, gopd: 40, "has-tostringtag/shams": 43 }], 51: [function(y, H, s) {
        "use strict";
        var w = Object.getOwnPropertySymbols, g = Object.prototype.hasOwnProperty, T = Object.prototype.propertyIsEnumerable;
        function m(i) {
          if (i == null)
            throw new TypeError("Object.assign cannot be called with null or undefined");
          return Object(i);
        }
        function d() {
          try {
            if (!Object.assign)
              return !1;
            var i = new String("abc");
            if (i[5] = "de", Object.getOwnPropertyNames(i)[0] === "5")
              return !1;
            for (var o = {}, a = 0; a < 10; a++)
              o["_" + String.fromCharCode(a)] = a;
            var f = Object.getOwnPropertyNames(o).map(function(u) {
              return o[u];
            });
            if (f.join("") !== "0123456789")
              return !1;
            var p = {};
            return "abcdefghijklmnopqrst".split("").forEach(function(u) {
              p[u] = u;
            }), Object.keys(Object.assign({}, p)).join("") === "abcdefghijklmnopqrst";
          } catch {
            return !1;
          }
        }
        H.exports = d() ? Object.assign : function(i, o) {
          for (var a, f = m(i), p, u = 1; u < arguments.length; u++) {
            a = Object(arguments[u]);
            for (var c in a)
              g.call(a, c) && (f[c] = a[c]);
            if (w) {
              p = w(a);
              for (var b = 0; b < p.length; b++)
                T.call(a, p[b]) && (f[p[b]] = a[p[b]]);
            }
          }
          return f;
        };
      }, {}], 52: [function(y, H, s) {
        "use strict";
        var w = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
        function g(d, i) {
          return Object.prototype.hasOwnProperty.call(d, i);
        }
        s.assign = function(d) {
          for (var i = Array.prototype.slice.call(arguments, 1); i.length; ) {
            var o = i.shift();
            if (o) {
              if (typeof o != "object")
                throw new TypeError(o + "must be non-object");
              for (var a in o)
                g(o, a) && (d[a] = o[a]);
            }
          }
          return d;
        }, s.shrinkBuf = function(d, i) {
          return d.length === i ? d : d.subarray ? d.subarray(0, i) : (d.length = i, d);
        };
        var T = {
          arraySet: function(d, i, o, a, f) {
            if (i.subarray && d.subarray) {
              d.set(i.subarray(o, o + a), f);
              return;
            }
            for (var p = 0; p < a; p++)
              d[f + p] = i[o + p];
          },
          // Join array of chunks to single array.
          flattenChunks: function(d) {
            var i, o, a, f, p, u;
            for (a = 0, i = 0, o = d.length; i < o; i++)
              a += d[i].length;
            for (u = new Uint8Array(a), f = 0, i = 0, o = d.length; i < o; i++)
              p = d[i], u.set(p, f), f += p.length;
            return u;
          }
        }, m = {
          arraySet: function(d, i, o, a, f) {
            for (var p = 0; p < a; p++)
              d[f + p] = i[o + p];
          },
          // Join array of chunks to single array.
          flattenChunks: function(d) {
            return [].concat.apply([], d);
          }
        };
        s.setTyped = function(d) {
          d ? (s.Buf8 = Uint8Array, s.Buf16 = Uint16Array, s.Buf32 = Int32Array, s.assign(s, T)) : (s.Buf8 = Array, s.Buf16 = Array, s.Buf32 = Array, s.assign(s, m));
        }, s.setTyped(w);
      }, {}], 53: [function(y, H, s) {
        "use strict";
        function w(g, T, m, d) {
          for (var i = g & 65535 | 0, o = g >>> 16 & 65535 | 0, a = 0; m !== 0; ) {
            a = m > 2e3 ? 2e3 : m, m -= a;
            do
              i = i + T[d++] | 0, o = o + i | 0;
            while (--a);
            i %= 65521, o %= 65521;
          }
          return i | o << 16 | 0;
        }
        H.exports = w;
      }, {}], 54: [function(y, H, s) {
        "use strict";
        H.exports = {
          /* Allowed flush values; see deflate() and inflate() below for details */
          Z_NO_FLUSH: 0,
          Z_PARTIAL_FLUSH: 1,
          Z_SYNC_FLUSH: 2,
          Z_FULL_FLUSH: 3,
          Z_FINISH: 4,
          Z_BLOCK: 5,
          Z_TREES: 6,
          /* Return codes for the compression/decompression functions. Negative values
          * are errors, positive values are used for special but normal events.
          */
          Z_OK: 0,
          Z_STREAM_END: 1,
          Z_NEED_DICT: 2,
          Z_ERRNO: -1,
          Z_STREAM_ERROR: -2,
          Z_DATA_ERROR: -3,
          //Z_MEM_ERROR:     -4,
          Z_BUF_ERROR: -5,
          //Z_VERSION_ERROR: -6,
          /* compression levels */
          Z_NO_COMPRESSION: 0,
          Z_BEST_SPEED: 1,
          Z_BEST_COMPRESSION: 9,
          Z_DEFAULT_COMPRESSION: -1,
          Z_FILTERED: 1,
          Z_HUFFMAN_ONLY: 2,
          Z_RLE: 3,
          Z_FIXED: 4,
          Z_DEFAULT_STRATEGY: 0,
          /* Possible values of the data_type field (though see inflate()) */
          Z_BINARY: 0,
          Z_TEXT: 1,
          //Z_ASCII:                1, // = Z_TEXT (deprecated)
          Z_UNKNOWN: 2,
          /* The deflate compression method */
          Z_DEFLATED: 8
          //Z_NULL:                 null // Use -1 or null inline, depending on var type
        };
      }, {}], 55: [function(y, H, s) {
        "use strict";
        function w() {
          for (var m, d = [], i = 0; i < 256; i++) {
            m = i;
            for (var o = 0; o < 8; o++)
              m = m & 1 ? 3988292384 ^ m >>> 1 : m >>> 1;
            d[i] = m;
          }
          return d;
        }
        var g = w();
        function T(m, d, i, o) {
          var a = g, f = o + i;
          m ^= -1;
          for (var p = o; p < f; p++)
            m = m >>> 8 ^ a[(m ^ d[p]) & 255];
          return m ^ -1;
        }
        H.exports = T;
      }, {}], 56: [function(y, H, s) {
        "use strict";
        var w = y("../utils/common"), g = y("./trees"), T = y("./adler32"), m = y("./crc32"), d = y("./messages"), i = 0, o = 1, a = 3, f = 4, p = 5, u = 0, c = 1, b = -2, R = -3, S = -5, O = -1, L = 1, E = 2, F = 3, I = 4, M = 0, N = 2, G = 8, W = 9, Q = 15, re = 8, ae = 29, C = 256, h = C + 1 + ae, x = 30, V = 19, oe = 2 * h + 1, Ee = 15, he = 3, B = 258, K = B + he + 1, q = 32, ge = 42, z = 69, Y = 73, $ = 91, ce = 103, de = 113, we = 666, ye = 1, U = 2, j = 3, ie = 4, _e = 3;
        function Te(e, J) {
          return e.msg = d[J], J;
        }
        function k(e) {
          return (e << 1) - (e > 4 ? 9 : 0);
        }
        function n(e) {
          for (var J = e.length; --J >= 0; )
            e[J] = 0;
        }
        function t(e) {
          var J = e.state, ee = J.pending;
          ee > e.avail_out && (ee = e.avail_out), ee !== 0 && (w.arraySet(e.output, J.pending_buf, J.pending_out, ee, e.next_out), e.next_out += ee, J.pending_out += ee, e.total_out += ee, e.avail_out -= ee, J.pending -= ee, J.pending === 0 && (J.pending_out = 0));
        }
        function r(e, J) {
          g._tr_flush_block(e, e.block_start >= 0 ? e.block_start : -1, e.strstart - e.block_start, J), e.block_start = e.strstart, t(e.strm);
        }
        function l(e, J) {
          e.pending_buf[e.pending++] = J;
        }
        function D(e, J) {
          e.pending_buf[e.pending++] = J >>> 8 & 255, e.pending_buf[e.pending++] = J & 255;
        }
        function te(e, J, ee, v) {
          var P = e.avail_in;
          return P > v && (P = v), P === 0 ? 0 : (e.avail_in -= P, w.arraySet(J, e.input, e.next_in, P, ee), e.state.wrap === 1 ? e.adler = T(e.adler, J, P, ee) : e.state.wrap === 2 && (e.adler = m(e.adler, J, P, ee)), e.next_in += P, e.total_in += P, P);
        }
        function fe(e, J) {
          var ee = e.max_chain_length, v = e.strstart, P, X, Re = e.prev_length, me = e.nice_match, Ae = e.strstart > e.w_size - K ? e.strstart - (e.w_size - K) : 0, Fe = e.window, Ve = e.w_mask, Pe = e.prev, Ne = e.strstart + B, Ue = Fe[v + Re - 1], Ze = Fe[v + Re];
          e.prev_length >= e.good_match && (ee >>= 2), me > e.lookahead && (me = e.lookahead);
          do
            if (P = J, !(Fe[P + Re] !== Ze || Fe[P + Re - 1] !== Ue || Fe[P] !== Fe[v] || Fe[++P] !== Fe[v + 1])) {
              v += 2, P++;
              do
                ;
              while (Fe[++v] === Fe[++P] && Fe[++v] === Fe[++P] && Fe[++v] === Fe[++P] && Fe[++v] === Fe[++P] && Fe[++v] === Fe[++P] && Fe[++v] === Fe[++P] && Fe[++v] === Fe[++P] && Fe[++v] === Fe[++P] && v < Ne);
              if (X = B - (Ne - v), v = Ne - B, X > Re) {
                if (e.match_start = J, Re = X, X >= me)
                  break;
                Ue = Fe[v + Re - 1], Ze = Fe[v + Re];
              }
            }
          while ((J = Pe[J & Ve]) > Ae && --ee !== 0);
          return Re <= e.lookahead ? Re : e.lookahead;
        }
        function Oe(e) {
          var J = e.w_size, ee, v, P, X, Re;
          do {
            if (X = e.window_size - e.lookahead - e.strstart, e.strstart >= J + (J - K)) {
              w.arraySet(e.window, e.window, J, J, 0), e.match_start -= J, e.strstart -= J, e.block_start -= J, v = e.hash_size, ee = v;
              do
                P = e.head[--ee], e.head[ee] = P >= J ? P - J : 0;
              while (--v);
              v = J, ee = v;
              do
                P = e.prev[--ee], e.prev[ee] = P >= J ? P - J : 0;
              while (--v);
              X += J;
            }
            if (e.strm.avail_in === 0)
              break;
            if (v = te(e.strm, e.window, e.strstart + e.lookahead, X), e.lookahead += v, e.lookahead + e.insert >= he)
              for (Re = e.strstart - e.insert, e.ins_h = e.window[Re], e.ins_h = (e.ins_h << e.hash_shift ^ e.window[Re + 1]) & e.hash_mask; e.insert && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[Re + he - 1]) & e.hash_mask, e.prev[Re & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = Re, Re++, e.insert--, !(e.lookahead + e.insert < he)); )
                ;
          } while (e.lookahead < K && e.strm.avail_in !== 0);
        }
        function Ie(e, J) {
          var ee = 65535;
          for (ee > e.pending_buf_size - 5 && (ee = e.pending_buf_size - 5); ; ) {
            if (e.lookahead <= 1) {
              if (Oe(e), e.lookahead === 0 && J === i)
                return ye;
              if (e.lookahead === 0)
                break;
            }
            e.strstart += e.lookahead, e.lookahead = 0;
            var v = e.block_start + ee;
            if ((e.strstart === 0 || e.strstart >= v) && (e.lookahead = e.strstart - v, e.strstart = v, r(e, !1), e.strm.avail_out === 0) || e.strstart - e.block_start >= e.w_size - K && (r(e, !1), e.strm.avail_out === 0))
              return ye;
          }
          return e.insert = 0, J === f ? (r(e, !0), e.strm.avail_out === 0 ? j : ie) : (e.strstart > e.block_start && (r(e, !1), e.strm.avail_out === 0), ye);
        }
        function Le(e, J) {
          for (var ee, v; ; ) {
            if (e.lookahead < K) {
              if (Oe(e), e.lookahead < K && J === i)
                return ye;
              if (e.lookahead === 0)
                break;
            }
            if (ee = 0, e.lookahead >= he && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + he - 1]) & e.hash_mask, ee = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart), ee !== 0 && e.strstart - ee <= e.w_size - K && (e.match_length = fe(e, ee)), e.match_length >= he)
              if (v = g._tr_tally(e, e.strstart - e.match_start, e.match_length - he), e.lookahead -= e.match_length, e.match_length <= e.max_lazy_match && e.lookahead >= he) {
                e.match_length--;
                do
                  e.strstart++, e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + he - 1]) & e.hash_mask, ee = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart;
                while (--e.match_length !== 0);
                e.strstart++;
              } else
                e.strstart += e.match_length, e.match_length = 0, e.ins_h = e.window[e.strstart], e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + 1]) & e.hash_mask;
            else
              v = g._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++;
            if (v && (r(e, !1), e.strm.avail_out === 0))
              return ye;
          }
          return e.insert = e.strstart < he - 1 ? e.strstart : he - 1, J === f ? (r(e, !0), e.strm.avail_out === 0 ? j : ie) : e.last_lit && (r(e, !1), e.strm.avail_out === 0) ? ye : U;
        }
        function Me(e, J) {
          for (var ee, v, P; ; ) {
            if (e.lookahead < K) {
              if (Oe(e), e.lookahead < K && J === i)
                return ye;
              if (e.lookahead === 0)
                break;
            }
            if (ee = 0, e.lookahead >= he && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + he - 1]) & e.hash_mask, ee = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart), e.prev_length = e.match_length, e.prev_match = e.match_start, e.match_length = he - 1, ee !== 0 && e.prev_length < e.max_lazy_match && e.strstart - ee <= e.w_size - K && (e.match_length = fe(e, ee), e.match_length <= 5 && (e.strategy === L || e.match_length === he && e.strstart - e.match_start > 4096) && (e.match_length = he - 1)), e.prev_length >= he && e.match_length <= e.prev_length) {
              P = e.strstart + e.lookahead - he, v = g._tr_tally(e, e.strstart - 1 - e.prev_match, e.prev_length - he), e.lookahead -= e.prev_length - 1, e.prev_length -= 2;
              do
                ++e.strstart <= P && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + he - 1]) & e.hash_mask, ee = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart);
              while (--e.prev_length !== 0);
              if (e.match_available = 0, e.match_length = he - 1, e.strstart++, v && (r(e, !1), e.strm.avail_out === 0))
                return ye;
            } else if (e.match_available) {
              if (v = g._tr_tally(e, 0, e.window[e.strstart - 1]), v && r(e, !1), e.strstart++, e.lookahead--, e.strm.avail_out === 0)
                return ye;
            } else
              e.match_available = 1, e.strstart++, e.lookahead--;
          }
          return e.match_available && (v = g._tr_tally(e, 0, e.window[e.strstart - 1]), e.match_available = 0), e.insert = e.strstart < he - 1 ? e.strstart : he - 1, J === f ? (r(e, !0), e.strm.avail_out === 0 ? j : ie) : e.last_lit && (r(e, !1), e.strm.avail_out === 0) ? ye : U;
        }
        function xe(e, J) {
          for (var ee, v, P, X, Re = e.window; ; ) {
            if (e.lookahead <= B) {
              if (Oe(e), e.lookahead <= B && J === i)
                return ye;
              if (e.lookahead === 0)
                break;
            }
            if (e.match_length = 0, e.lookahead >= he && e.strstart > 0 && (P = e.strstart - 1, v = Re[P], v === Re[++P] && v === Re[++P] && v === Re[++P])) {
              X = e.strstart + B;
              do
                ;
              while (v === Re[++P] && v === Re[++P] && v === Re[++P] && v === Re[++P] && v === Re[++P] && v === Re[++P] && v === Re[++P] && v === Re[++P] && P < X);
              e.match_length = B - (X - P), e.match_length > e.lookahead && (e.match_length = e.lookahead);
            }
            if (e.match_length >= he ? (ee = g._tr_tally(e, 1, e.match_length - he), e.lookahead -= e.match_length, e.strstart += e.match_length, e.match_length = 0) : (ee = g._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++), ee && (r(e, !1), e.strm.avail_out === 0))
              return ye;
          }
          return e.insert = 0, J === f ? (r(e, !0), e.strm.avail_out === 0 ? j : ie) : e.last_lit && (r(e, !1), e.strm.avail_out === 0) ? ye : U;
        }
        function je(e, J) {
          for (var ee; ; ) {
            if (e.lookahead === 0 && (Oe(e), e.lookahead === 0)) {
              if (J === i)
                return ye;
              break;
            }
            if (e.match_length = 0, ee = g._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++, ee && (r(e, !1), e.strm.avail_out === 0))
              return ye;
          }
          return e.insert = 0, J === f ? (r(e, !0), e.strm.avail_out === 0 ? j : ie) : e.last_lit && (r(e, !1), e.strm.avail_out === 0) ? ye : U;
        }
        function Ce(e, J, ee, v, P) {
          this.good_length = e, this.max_lazy = J, this.nice_length = ee, this.max_chain = v, this.func = P;
        }
        var Be;
        Be = [
          /*      good lazy nice chain */
          new Ce(0, 0, 0, 0, Ie),
          /* 0 store only */
          new Ce(4, 4, 8, 4, Le),
          /* 1 max speed, no lazy matches */
          new Ce(4, 5, 16, 8, Le),
          /* 2 */
          new Ce(4, 6, 32, 32, Le),
          /* 3 */
          new Ce(4, 4, 16, 16, Me),
          /* 4 lazy matches */
          new Ce(8, 16, 32, 32, Me),
          /* 5 */
          new Ce(8, 16, 128, 128, Me),
          /* 6 */
          new Ce(8, 32, 128, 256, Me),
          /* 7 */
          new Ce(32, 128, 258, 1024, Me),
          /* 8 */
          new Ce(32, 258, 258, 4096, Me)
          /* 9 max compression */
        ];
        function We(e) {
          e.window_size = 2 * e.w_size, n(e.head), e.max_lazy_match = Be[e.level].max_lazy, e.good_match = Be[e.level].good_length, e.nice_match = Be[e.level].nice_length, e.max_chain_length = Be[e.level].max_chain, e.strstart = 0, e.block_start = 0, e.lookahead = 0, e.insert = 0, e.match_length = e.prev_length = he - 1, e.match_available = 0, e.ins_h = 0;
        }
        function A() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = G, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new w.Buf16(oe * 2), this.dyn_dtree = new w.Buf16((2 * x + 1) * 2), this.bl_tree = new w.Buf16((2 * V + 1) * 2), n(this.dyn_ltree), n(this.dyn_dtree), n(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new w.Buf16(Ee + 1), this.heap = new w.Buf16(2 * h + 1), n(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new w.Buf16(2 * h + 1), n(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        function se(e) {
          var J;
          return !e || !e.state ? Te(e, b) : (e.total_in = e.total_out = 0, e.data_type = N, J = e.state, J.pending = 0, J.pending_out = 0, J.wrap < 0 && (J.wrap = -J.wrap), J.status = J.wrap ? ge : de, e.adler = J.wrap === 2 ? 0 : 1, J.last_flush = i, g._tr_init(J), u);
        }
        function pe(e) {
          var J = se(e);
          return J === u && We(e.state), J;
        }
        function Se(e, J) {
          return !e || !e.state || e.state.wrap !== 2 ? b : (e.state.gzhead = J, u);
        }
        function Z(e, J, ee, v, P, X) {
          if (!e)
            return b;
          var Re = 1;
          if (J === O && (J = 6), v < 0 ? (Re = 0, v = -v) : v > 15 && (Re = 2, v -= 16), P < 1 || P > W || ee !== G || v < 8 || v > 15 || J < 0 || J > 9 || X < 0 || X > I)
            return Te(e, b);
          v === 8 && (v = 9);
          var me = new A();
          return e.state = me, me.strm = e, me.wrap = Re, me.gzhead = null, me.w_bits = v, me.w_size = 1 << me.w_bits, me.w_mask = me.w_size - 1, me.hash_bits = P + 7, me.hash_size = 1 << me.hash_bits, me.hash_mask = me.hash_size - 1, me.hash_shift = ~~((me.hash_bits + he - 1) / he), me.window = new w.Buf8(me.w_size * 2), me.head = new w.Buf16(me.hash_size), me.prev = new w.Buf16(me.w_size), me.lit_bufsize = 1 << P + 6, me.pending_buf_size = me.lit_bufsize * 4, me.pending_buf = new w.Buf8(me.pending_buf_size), me.d_buf = 1 * me.lit_bufsize, me.l_buf = 3 * me.lit_bufsize, me.level = J, me.strategy = X, me.method = ee, pe(e);
        }
        function ne(e, J) {
          return Z(e, J, G, Q, re, M);
        }
        function _(e, J) {
          var ee, v, P, X;
          if (!e || !e.state || J > p || J < 0)
            return e ? Te(e, b) : b;
          if (v = e.state, !e.output || !e.input && e.avail_in !== 0 || v.status === we && J !== f)
            return Te(e, e.avail_out === 0 ? S : b);
          if (v.strm = e, ee = v.last_flush, v.last_flush = J, v.status === ge)
            if (v.wrap === 2)
              e.adler = 0, l(v, 31), l(v, 139), l(v, 8), v.gzhead ? (l(
                v,
                (v.gzhead.text ? 1 : 0) + (v.gzhead.hcrc ? 2 : 0) + (v.gzhead.extra ? 4 : 0) + (v.gzhead.name ? 8 : 0) + (v.gzhead.comment ? 16 : 0)
              ), l(v, v.gzhead.time & 255), l(v, v.gzhead.time >> 8 & 255), l(v, v.gzhead.time >> 16 & 255), l(v, v.gzhead.time >> 24 & 255), l(v, v.level === 9 ? 2 : v.strategy >= E || v.level < 2 ? 4 : 0), l(v, v.gzhead.os & 255), v.gzhead.extra && v.gzhead.extra.length && (l(v, v.gzhead.extra.length & 255), l(v, v.gzhead.extra.length >> 8 & 255)), v.gzhead.hcrc && (e.adler = m(e.adler, v.pending_buf, v.pending, 0)), v.gzindex = 0, v.status = z) : (l(v, 0), l(v, 0), l(v, 0), l(v, 0), l(v, 0), l(v, v.level === 9 ? 2 : v.strategy >= E || v.level < 2 ? 4 : 0), l(v, _e), v.status = de);
            else {
              var Re = G + (v.w_bits - 8 << 4) << 8, me = -1;
              v.strategy >= E || v.level < 2 ? me = 0 : v.level < 6 ? me = 1 : v.level === 6 ? me = 2 : me = 3, Re |= me << 6, v.strstart !== 0 && (Re |= q), Re += 31 - Re % 31, v.status = de, D(v, Re), v.strstart !== 0 && (D(v, e.adler >>> 16), D(v, e.adler & 65535)), e.adler = 1;
            }
          if (v.status === z)
            if (v.gzhead.extra) {
              for (P = v.pending; v.gzindex < (v.gzhead.extra.length & 65535) && !(v.pending === v.pending_buf_size && (v.gzhead.hcrc && v.pending > P && (e.adler = m(e.adler, v.pending_buf, v.pending - P, P)), t(e), P = v.pending, v.pending === v.pending_buf_size)); )
                l(v, v.gzhead.extra[v.gzindex] & 255), v.gzindex++;
              v.gzhead.hcrc && v.pending > P && (e.adler = m(e.adler, v.pending_buf, v.pending - P, P)), v.gzindex === v.gzhead.extra.length && (v.gzindex = 0, v.status = Y);
            } else
              v.status = Y;
          if (v.status === Y)
            if (v.gzhead.name) {
              P = v.pending;
              do {
                if (v.pending === v.pending_buf_size && (v.gzhead.hcrc && v.pending > P && (e.adler = m(e.adler, v.pending_buf, v.pending - P, P)), t(e), P = v.pending, v.pending === v.pending_buf_size)) {
                  X = 1;
                  break;
                }
                v.gzindex < v.gzhead.name.length ? X = v.gzhead.name.charCodeAt(v.gzindex++) & 255 : X = 0, l(v, X);
              } while (X !== 0);
              v.gzhead.hcrc && v.pending > P && (e.adler = m(e.adler, v.pending_buf, v.pending - P, P)), X === 0 && (v.gzindex = 0, v.status = $);
            } else
              v.status = $;
          if (v.status === $)
            if (v.gzhead.comment) {
              P = v.pending;
              do {
                if (v.pending === v.pending_buf_size && (v.gzhead.hcrc && v.pending > P && (e.adler = m(e.adler, v.pending_buf, v.pending - P, P)), t(e), P = v.pending, v.pending === v.pending_buf_size)) {
                  X = 1;
                  break;
                }
                v.gzindex < v.gzhead.comment.length ? X = v.gzhead.comment.charCodeAt(v.gzindex++) & 255 : X = 0, l(v, X);
              } while (X !== 0);
              v.gzhead.hcrc && v.pending > P && (e.adler = m(e.adler, v.pending_buf, v.pending - P, P)), X === 0 && (v.status = ce);
            } else
              v.status = ce;
          if (v.status === ce && (v.gzhead.hcrc ? (v.pending + 2 > v.pending_buf_size && t(e), v.pending + 2 <= v.pending_buf_size && (l(v, e.adler & 255), l(v, e.adler >> 8 & 255), e.adler = 0, v.status = de)) : v.status = de), v.pending !== 0) {
            if (t(e), e.avail_out === 0)
              return v.last_flush = -1, u;
          } else if (e.avail_in === 0 && k(J) <= k(ee) && J !== f)
            return Te(e, S);
          if (v.status === we && e.avail_in !== 0)
            return Te(e, S);
          if (e.avail_in !== 0 || v.lookahead !== 0 || J !== i && v.status !== we) {
            var Ae = v.strategy === E ? je(v, J) : v.strategy === F ? xe(v, J) : Be[v.level].func(v, J);
            if ((Ae === j || Ae === ie) && (v.status = we), Ae === ye || Ae === j)
              return e.avail_out === 0 && (v.last_flush = -1), u;
            if (Ae === U && (J === o ? g._tr_align(v) : J !== p && (g._tr_stored_block(v, 0, 0, !1), J === a && (n(v.head), v.lookahead === 0 && (v.strstart = 0, v.block_start = 0, v.insert = 0))), t(e), e.avail_out === 0))
              return v.last_flush = -1, u;
          }
          return J !== f ? u : v.wrap <= 0 ? c : (v.wrap === 2 ? (l(v, e.adler & 255), l(v, e.adler >> 8 & 255), l(v, e.adler >> 16 & 255), l(v, e.adler >> 24 & 255), l(v, e.total_in & 255), l(v, e.total_in >> 8 & 255), l(v, e.total_in >> 16 & 255), l(v, e.total_in >> 24 & 255)) : (D(v, e.adler >>> 16), D(v, e.adler & 65535)), t(e), v.wrap > 0 && (v.wrap = -v.wrap), v.pending !== 0 ? u : c);
        }
        function ue(e) {
          var J;
          return !e || !e.state ? b : (J = e.state.status, J !== ge && J !== z && J !== Y && J !== $ && J !== ce && J !== de && J !== we ? Te(e, b) : (e.state = null, J === de ? Te(e, R) : u));
        }
        function ke(e, J) {
          var ee = J.length, v, P, X, Re, me, Ae, Fe, Ve;
          if (!e || !e.state || (v = e.state, Re = v.wrap, Re === 2 || Re === 1 && v.status !== ge || v.lookahead))
            return b;
          for (Re === 1 && (e.adler = T(e.adler, J, ee, 0)), v.wrap = 0, ee >= v.w_size && (Re === 0 && (n(v.head), v.strstart = 0, v.block_start = 0, v.insert = 0), Ve = new w.Buf8(v.w_size), w.arraySet(Ve, J, ee - v.w_size, v.w_size, 0), J = Ve, ee = v.w_size), me = e.avail_in, Ae = e.next_in, Fe = e.input, e.avail_in = ee, e.next_in = 0, e.input = J, Oe(v); v.lookahead >= he; ) {
            P = v.strstart, X = v.lookahead - (he - 1);
            do
              v.ins_h = (v.ins_h << v.hash_shift ^ v.window[P + he - 1]) & v.hash_mask, v.prev[P & v.w_mask] = v.head[v.ins_h], v.head[v.ins_h] = P, P++;
            while (--X);
            v.strstart = P, v.lookahead = he - 1, Oe(v);
          }
          return v.strstart += v.lookahead, v.block_start = v.strstart, v.insert = v.lookahead, v.lookahead = 0, v.match_length = v.prev_length = he - 1, v.match_available = 0, e.next_in = Ae, e.input = Fe, e.avail_in = me, v.wrap = Re, u;
        }
        s.deflateInit = ne, s.deflateInit2 = Z, s.deflateReset = pe, s.deflateResetKeep = se, s.deflateSetHeader = Se, s.deflate = _, s.deflateEnd = ue, s.deflateSetDictionary = ke, s.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 52, "./adler32": 53, "./crc32": 55, "./messages": 60, "./trees": 61 }], 57: [function(y, H, s) {
        "use strict";
        var w = 30, g = 12;
        H.exports = function(m, d) {
          var i, o, a, f, p, u, c, b, R, S, O, L, E, F, I, M, N, G, W, Q, re, ae, C, h, x;
          i = m.state, o = m.next_in, h = m.input, a = o + (m.avail_in - 5), f = m.next_out, x = m.output, p = f - (d - m.avail_out), u = f + (m.avail_out - 257), c = i.dmax, b = i.wsize, R = i.whave, S = i.wnext, O = i.window, L = i.hold, E = i.bits, F = i.lencode, I = i.distcode, M = (1 << i.lenbits) - 1, N = (1 << i.distbits) - 1;
          e:
            do {
              E < 15 && (L += h[o++] << E, E += 8, L += h[o++] << E, E += 8), G = F[L & M];
              t:
                for (; ; ) {
                  if (W = G >>> 24, L >>>= W, E -= W, W = G >>> 16 & 255, W === 0)
                    x[f++] = G & 65535;
                  else if (W & 16) {
                    Q = G & 65535, W &= 15, W && (E < W && (L += h[o++] << E, E += 8), Q += L & (1 << W) - 1, L >>>= W, E -= W), E < 15 && (L += h[o++] << E, E += 8, L += h[o++] << E, E += 8), G = I[L & N];
                    r:
                      for (; ; ) {
                        if (W = G >>> 24, L >>>= W, E -= W, W = G >>> 16 & 255, W & 16) {
                          if (re = G & 65535, W &= 15, E < W && (L += h[o++] << E, E += 8, E < W && (L += h[o++] << E, E += 8)), re += L & (1 << W) - 1, re > c) {
                            m.msg = "invalid distance too far back", i.mode = w;
                            break e;
                          }
                          if (L >>>= W, E -= W, W = f - p, re > W) {
                            if (W = re - W, W > R && i.sane) {
                              m.msg = "invalid distance too far back", i.mode = w;
                              break e;
                            }
                            if (ae = 0, C = O, S === 0) {
                              if (ae += b - W, W < Q) {
                                Q -= W;
                                do
                                  x[f++] = O[ae++];
                                while (--W);
                                ae = f - re, C = x;
                              }
                            } else if (S < W) {
                              if (ae += b + S - W, W -= S, W < Q) {
                                Q -= W;
                                do
                                  x[f++] = O[ae++];
                                while (--W);
                                if (ae = 0, S < Q) {
                                  W = S, Q -= W;
                                  do
                                    x[f++] = O[ae++];
                                  while (--W);
                                  ae = f - re, C = x;
                                }
                              }
                            } else if (ae += S - W, W < Q) {
                              Q -= W;
                              do
                                x[f++] = O[ae++];
                              while (--W);
                              ae = f - re, C = x;
                            }
                            for (; Q > 2; )
                              x[f++] = C[ae++], x[f++] = C[ae++], x[f++] = C[ae++], Q -= 3;
                            Q && (x[f++] = C[ae++], Q > 1 && (x[f++] = C[ae++]));
                          } else {
                            ae = f - re;
                            do
                              x[f++] = x[ae++], x[f++] = x[ae++], x[f++] = x[ae++], Q -= 3;
                            while (Q > 2);
                            Q && (x[f++] = x[ae++], Q > 1 && (x[f++] = x[ae++]));
                          }
                        } else if (W & 64) {
                          m.msg = "invalid distance code", i.mode = w;
                          break e;
                        } else {
                          G = I[(G & 65535) + (L & (1 << W) - 1)];
                          continue r;
                        }
                        break;
                      }
                  } else if (W & 64)
                    if (W & 32) {
                      i.mode = g;
                      break e;
                    } else {
                      m.msg = "invalid literal/length code", i.mode = w;
                      break e;
                    }
                  else {
                    G = F[(G & 65535) + (L & (1 << W) - 1)];
                    continue t;
                  }
                  break;
                }
            } while (o < a && f < u);
          Q = E >> 3, o -= Q, E -= Q << 3, L &= (1 << E) - 1, m.next_in = o, m.next_out = f, m.avail_in = o < a ? 5 + (a - o) : 5 - (o - a), m.avail_out = f < u ? 257 + (u - f) : 257 - (f - u), i.hold = L, i.bits = E;
        };
      }, {}], 58: [function(y, H, s) {
        "use strict";
        var w = y("../utils/common"), g = y("./adler32"), T = y("./crc32"), m = y("./inffast"), d = y("./inftrees"), i = 0, o = 1, a = 2, f = 4, p = 5, u = 6, c = 0, b = 1, R = 2, S = -2, O = -3, L = -4, E = -5, F = 8, I = 1, M = 2, N = 3, G = 4, W = 5, Q = 6, re = 7, ae = 8, C = 9, h = 10, x = 11, V = 12, oe = 13, Ee = 14, he = 15, B = 16, K = 17, q = 18, ge = 19, z = 20, Y = 21, $ = 22, ce = 23, de = 24, we = 25, ye = 26, U = 27, j = 28, ie = 29, _e = 30, Te = 31, k = 32, n = 852, t = 592, r = 15, l = r;
        function D(Z) {
          return (Z >>> 24 & 255) + (Z >>> 8 & 65280) + ((Z & 65280) << 8) + ((Z & 255) << 24);
        }
        function te() {
          this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new w.Buf16(320), this.work = new w.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        function fe(Z) {
          var ne;
          return !Z || !Z.state ? S : (ne = Z.state, Z.total_in = Z.total_out = ne.total = 0, Z.msg = "", ne.wrap && (Z.adler = ne.wrap & 1), ne.mode = I, ne.last = 0, ne.havedict = 0, ne.dmax = 32768, ne.head = null, ne.hold = 0, ne.bits = 0, ne.lencode = ne.lendyn = new w.Buf32(n), ne.distcode = ne.distdyn = new w.Buf32(t), ne.sane = 1, ne.back = -1, c);
        }
        function Oe(Z) {
          var ne;
          return !Z || !Z.state ? S : (ne = Z.state, ne.wsize = 0, ne.whave = 0, ne.wnext = 0, fe(Z));
        }
        function Ie(Z, ne) {
          var _, ue;
          return !Z || !Z.state || (ue = Z.state, ne < 0 ? (_ = 0, ne = -ne) : (_ = (ne >> 4) + 1, ne < 48 && (ne &= 15)), ne && (ne < 8 || ne > 15)) ? S : (ue.window !== null && ue.wbits !== ne && (ue.window = null), ue.wrap = _, ue.wbits = ne, Oe(Z));
        }
        function Le(Z, ne) {
          var _, ue;
          return Z ? (ue = new te(), Z.state = ue, ue.window = null, _ = Ie(Z, ne), _ !== c && (Z.state = null), _) : S;
        }
        function Me(Z) {
          return Le(Z, l);
        }
        var xe = !0, je, Ce;
        function Be(Z) {
          if (xe) {
            var ne;
            for (je = new w.Buf32(512), Ce = new w.Buf32(32), ne = 0; ne < 144; )
              Z.lens[ne++] = 8;
            for (; ne < 256; )
              Z.lens[ne++] = 9;
            for (; ne < 280; )
              Z.lens[ne++] = 7;
            for (; ne < 288; )
              Z.lens[ne++] = 8;
            for (d(o, Z.lens, 0, 288, je, 0, Z.work, { bits: 9 }), ne = 0; ne < 32; )
              Z.lens[ne++] = 5;
            d(a, Z.lens, 0, 32, Ce, 0, Z.work, { bits: 5 }), xe = !1;
          }
          Z.lencode = je, Z.lenbits = 9, Z.distcode = Ce, Z.distbits = 5;
        }
        function We(Z, ne, _, ue) {
          var ke, e = Z.state;
          return e.window === null && (e.wsize = 1 << e.wbits, e.wnext = 0, e.whave = 0, e.window = new w.Buf8(e.wsize)), ue >= e.wsize ? (w.arraySet(e.window, ne, _ - e.wsize, e.wsize, 0), e.wnext = 0, e.whave = e.wsize) : (ke = e.wsize - e.wnext, ke > ue && (ke = ue), w.arraySet(e.window, ne, _ - ue, ke, e.wnext), ue -= ke, ue ? (w.arraySet(e.window, ne, _ - ue, ue, 0), e.wnext = ue, e.whave = e.wsize) : (e.wnext += ke, e.wnext === e.wsize && (e.wnext = 0), e.whave < e.wsize && (e.whave += ke))), 0;
        }
        function A(Z, ne) {
          var _, ue, ke, e, J, ee, v, P, X, Re, me, Ae, Fe, Ve, Pe = 0, Ne, Ue, Ze, He, Qe, qe, De, Ge, ze = new w.Buf8(4), Ke, Ye, ht = (
            /* permutation of code lengths */
            [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
          );
          if (!Z || !Z.state || !Z.output || !Z.input && Z.avail_in !== 0)
            return S;
          _ = Z.state, _.mode === V && (_.mode = oe), J = Z.next_out, ke = Z.output, v = Z.avail_out, e = Z.next_in, ue = Z.input, ee = Z.avail_in, P = _.hold, X = _.bits, Re = ee, me = v, Ge = c;
          e:
            for (; ; )
              switch (_.mode) {
                case I:
                  if (_.wrap === 0) {
                    _.mode = oe;
                    break;
                  }
                  for (; X < 16; ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  if (_.wrap & 2 && P === 35615) {
                    _.check = 0, ze[0] = P & 255, ze[1] = P >>> 8 & 255, _.check = T(_.check, ze, 2, 0), P = 0, X = 0, _.mode = M;
                    break;
                  }
                  if (_.flags = 0, _.head && (_.head.done = !1), !(_.wrap & 1) || /* check if zlib header allowed */
                  (((P & 255) << 8) + (P >> 8)) % 31) {
                    Z.msg = "incorrect header check", _.mode = _e;
                    break;
                  }
                  if ((P & 15) !== F) {
                    Z.msg = "unknown compression method", _.mode = _e;
                    break;
                  }
                  if (P >>>= 4, X -= 4, De = (P & 15) + 8, _.wbits === 0)
                    _.wbits = De;
                  else if (De > _.wbits) {
                    Z.msg = "invalid window size", _.mode = _e;
                    break;
                  }
                  _.dmax = 1 << De, Z.adler = _.check = 1, _.mode = P & 512 ? h : V, P = 0, X = 0;
                  break;
                case M:
                  for (; X < 16; ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  if (_.flags = P, (_.flags & 255) !== F) {
                    Z.msg = "unknown compression method", _.mode = _e;
                    break;
                  }
                  if (_.flags & 57344) {
                    Z.msg = "unknown header flags set", _.mode = _e;
                    break;
                  }
                  _.head && (_.head.text = P >> 8 & 1), _.flags & 512 && (ze[0] = P & 255, ze[1] = P >>> 8 & 255, _.check = T(_.check, ze, 2, 0)), P = 0, X = 0, _.mode = N;
                case N:
                  for (; X < 32; ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  _.head && (_.head.time = P), _.flags & 512 && (ze[0] = P & 255, ze[1] = P >>> 8 & 255, ze[2] = P >>> 16 & 255, ze[3] = P >>> 24 & 255, _.check = T(_.check, ze, 4, 0)), P = 0, X = 0, _.mode = G;
                case G:
                  for (; X < 16; ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  _.head && (_.head.xflags = P & 255, _.head.os = P >> 8), _.flags & 512 && (ze[0] = P & 255, ze[1] = P >>> 8 & 255, _.check = T(_.check, ze, 2, 0)), P = 0, X = 0, _.mode = W;
                case W:
                  if (_.flags & 1024) {
                    for (; X < 16; ) {
                      if (ee === 0)
                        break e;
                      ee--, P += ue[e++] << X, X += 8;
                    }
                    _.length = P, _.head && (_.head.extra_len = P), _.flags & 512 && (ze[0] = P & 255, ze[1] = P >>> 8 & 255, _.check = T(_.check, ze, 2, 0)), P = 0, X = 0;
                  } else _.head && (_.head.extra = null);
                  _.mode = Q;
                case Q:
                  if (_.flags & 1024 && (Ae = _.length, Ae > ee && (Ae = ee), Ae && (_.head && (De = _.head.extra_len - _.length, _.head.extra || (_.head.extra = new Array(_.head.extra_len)), w.arraySet(
                    _.head.extra,
                    ue,
                    e,
                    // extra field is limited to 65536 bytes
                    // - no need for additional size check
                    Ae,
                    /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                    De
                  )), _.flags & 512 && (_.check = T(_.check, ue, Ae, e)), ee -= Ae, e += Ae, _.length -= Ae), _.length))
                    break e;
                  _.length = 0, _.mode = re;
                case re:
                  if (_.flags & 2048) {
                    if (ee === 0)
                      break e;
                    Ae = 0;
                    do
                      De = ue[e + Ae++], _.head && De && _.length < 65536 && (_.head.name += String.fromCharCode(De));
                    while (De && Ae < ee);
                    if (_.flags & 512 && (_.check = T(_.check, ue, Ae, e)), ee -= Ae, e += Ae, De)
                      break e;
                  } else _.head && (_.head.name = null);
                  _.length = 0, _.mode = ae;
                case ae:
                  if (_.flags & 4096) {
                    if (ee === 0)
                      break e;
                    Ae = 0;
                    do
                      De = ue[e + Ae++], _.head && De && _.length < 65536 && (_.head.comment += String.fromCharCode(De));
                    while (De && Ae < ee);
                    if (_.flags & 512 && (_.check = T(_.check, ue, Ae, e)), ee -= Ae, e += Ae, De)
                      break e;
                  } else _.head && (_.head.comment = null);
                  _.mode = C;
                case C:
                  if (_.flags & 512) {
                    for (; X < 16; ) {
                      if (ee === 0)
                        break e;
                      ee--, P += ue[e++] << X, X += 8;
                    }
                    if (P !== (_.check & 65535)) {
                      Z.msg = "header crc mismatch", _.mode = _e;
                      break;
                    }
                    P = 0, X = 0;
                  }
                  _.head && (_.head.hcrc = _.flags >> 9 & 1, _.head.done = !0), Z.adler = _.check = 0, _.mode = V;
                  break;
                case h:
                  for (; X < 32; ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  Z.adler = _.check = D(P), P = 0, X = 0, _.mode = x;
                case x:
                  if (_.havedict === 0)
                    return Z.next_out = J, Z.avail_out = v, Z.next_in = e, Z.avail_in = ee, _.hold = P, _.bits = X, R;
                  Z.adler = _.check = 1, _.mode = V;
                case V:
                  if (ne === p || ne === u)
                    break e;
                case oe:
                  if (_.last) {
                    P >>>= X & 7, X -= X & 7, _.mode = U;
                    break;
                  }
                  for (; X < 3; ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  switch (_.last = P & 1, P >>>= 1, X -= 1, P & 3) {
                    case 0:
                      _.mode = Ee;
                      break;
                    case 1:
                      if (Be(_), _.mode = z, ne === u) {
                        P >>>= 2, X -= 2;
                        break e;
                      }
                      break;
                    case 2:
                      _.mode = K;
                      break;
                    case 3:
                      Z.msg = "invalid block type", _.mode = _e;
                  }
                  P >>>= 2, X -= 2;
                  break;
                case Ee:
                  for (P >>>= X & 7, X -= X & 7; X < 32; ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  if ((P & 65535) !== (P >>> 16 ^ 65535)) {
                    Z.msg = "invalid stored block lengths", _.mode = _e;
                    break;
                  }
                  if (_.length = P & 65535, P = 0, X = 0, _.mode = he, ne === u)
                    break e;
                case he:
                  _.mode = B;
                case B:
                  if (Ae = _.length, Ae) {
                    if (Ae > ee && (Ae = ee), Ae > v && (Ae = v), Ae === 0)
                      break e;
                    w.arraySet(ke, ue, e, Ae, J), ee -= Ae, e += Ae, v -= Ae, J += Ae, _.length -= Ae;
                    break;
                  }
                  _.mode = V;
                  break;
                case K:
                  for (; X < 14; ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  if (_.nlen = (P & 31) + 257, P >>>= 5, X -= 5, _.ndist = (P & 31) + 1, P >>>= 5, X -= 5, _.ncode = (P & 15) + 4, P >>>= 4, X -= 4, _.nlen > 286 || _.ndist > 30) {
                    Z.msg = "too many length or distance symbols", _.mode = _e;
                    break;
                  }
                  _.have = 0, _.mode = q;
                case q:
                  for (; _.have < _.ncode; ) {
                    for (; X < 3; ) {
                      if (ee === 0)
                        break e;
                      ee--, P += ue[e++] << X, X += 8;
                    }
                    _.lens[ht[_.have++]] = P & 7, P >>>= 3, X -= 3;
                  }
                  for (; _.have < 19; )
                    _.lens[ht[_.have++]] = 0;
                  if (_.lencode = _.lendyn, _.lenbits = 7, Ke = { bits: _.lenbits }, Ge = d(i, _.lens, 0, 19, _.lencode, 0, _.work, Ke), _.lenbits = Ke.bits, Ge) {
                    Z.msg = "invalid code lengths set", _.mode = _e;
                    break;
                  }
                  _.have = 0, _.mode = ge;
                case ge:
                  for (; _.have < _.nlen + _.ndist; ) {
                    for (; Pe = _.lencode[P & (1 << _.lenbits) - 1], Ne = Pe >>> 24, Ue = Pe >>> 16 & 255, Ze = Pe & 65535, !(Ne <= X); ) {
                      if (ee === 0)
                        break e;
                      ee--, P += ue[e++] << X, X += 8;
                    }
                    if (Ze < 16)
                      P >>>= Ne, X -= Ne, _.lens[_.have++] = Ze;
                    else {
                      if (Ze === 16) {
                        for (Ye = Ne + 2; X < Ye; ) {
                          if (ee === 0)
                            break e;
                          ee--, P += ue[e++] << X, X += 8;
                        }
                        if (P >>>= Ne, X -= Ne, _.have === 0) {
                          Z.msg = "invalid bit length repeat", _.mode = _e;
                          break;
                        }
                        De = _.lens[_.have - 1], Ae = 3 + (P & 3), P >>>= 2, X -= 2;
                      } else if (Ze === 17) {
                        for (Ye = Ne + 3; X < Ye; ) {
                          if (ee === 0)
                            break e;
                          ee--, P += ue[e++] << X, X += 8;
                        }
                        P >>>= Ne, X -= Ne, De = 0, Ae = 3 + (P & 7), P >>>= 3, X -= 3;
                      } else {
                        for (Ye = Ne + 7; X < Ye; ) {
                          if (ee === 0)
                            break e;
                          ee--, P += ue[e++] << X, X += 8;
                        }
                        P >>>= Ne, X -= Ne, De = 0, Ae = 11 + (P & 127), P >>>= 7, X -= 7;
                      }
                      if (_.have + Ae > _.nlen + _.ndist) {
                        Z.msg = "invalid bit length repeat", _.mode = _e;
                        break;
                      }
                      for (; Ae--; )
                        _.lens[_.have++] = De;
                    }
                  }
                  if (_.mode === _e)
                    break;
                  if (_.lens[256] === 0) {
                    Z.msg = "invalid code -- missing end-of-block", _.mode = _e;
                    break;
                  }
                  if (_.lenbits = 9, Ke = { bits: _.lenbits }, Ge = d(o, _.lens, 0, _.nlen, _.lencode, 0, _.work, Ke), _.lenbits = Ke.bits, Ge) {
                    Z.msg = "invalid literal/lengths set", _.mode = _e;
                    break;
                  }
                  if (_.distbits = 6, _.distcode = _.distdyn, Ke = { bits: _.distbits }, Ge = d(a, _.lens, _.nlen, _.ndist, _.distcode, 0, _.work, Ke), _.distbits = Ke.bits, Ge) {
                    Z.msg = "invalid distances set", _.mode = _e;
                    break;
                  }
                  if (_.mode = z, ne === u)
                    break e;
                case z:
                  _.mode = Y;
                case Y:
                  if (ee >= 6 && v >= 258) {
                    Z.next_out = J, Z.avail_out = v, Z.next_in = e, Z.avail_in = ee, _.hold = P, _.bits = X, m(Z, me), J = Z.next_out, ke = Z.output, v = Z.avail_out, e = Z.next_in, ue = Z.input, ee = Z.avail_in, P = _.hold, X = _.bits, _.mode === V && (_.back = -1);
                    break;
                  }
                  for (_.back = 0; Pe = _.lencode[P & (1 << _.lenbits) - 1], Ne = Pe >>> 24, Ue = Pe >>> 16 & 255, Ze = Pe & 65535, !(Ne <= X); ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  if (Ue && !(Ue & 240)) {
                    for (He = Ne, Qe = Ue, qe = Ze; Pe = _.lencode[qe + ((P & (1 << He + Qe) - 1) >> He)], Ne = Pe >>> 24, Ue = Pe >>> 16 & 255, Ze = Pe & 65535, !(He + Ne <= X); ) {
                      if (ee === 0)
                        break e;
                      ee--, P += ue[e++] << X, X += 8;
                    }
                    P >>>= He, X -= He, _.back += He;
                  }
                  if (P >>>= Ne, X -= Ne, _.back += Ne, _.length = Ze, Ue === 0) {
                    _.mode = ye;
                    break;
                  }
                  if (Ue & 32) {
                    _.back = -1, _.mode = V;
                    break;
                  }
                  if (Ue & 64) {
                    Z.msg = "invalid literal/length code", _.mode = _e;
                    break;
                  }
                  _.extra = Ue & 15, _.mode = $;
                case $:
                  if (_.extra) {
                    for (Ye = _.extra; X < Ye; ) {
                      if (ee === 0)
                        break e;
                      ee--, P += ue[e++] << X, X += 8;
                    }
                    _.length += P & (1 << _.extra) - 1, P >>>= _.extra, X -= _.extra, _.back += _.extra;
                  }
                  _.was = _.length, _.mode = ce;
                case ce:
                  for (; Pe = _.distcode[P & (1 << _.distbits) - 1], Ne = Pe >>> 24, Ue = Pe >>> 16 & 255, Ze = Pe & 65535, !(Ne <= X); ) {
                    if (ee === 0)
                      break e;
                    ee--, P += ue[e++] << X, X += 8;
                  }
                  if (!(Ue & 240)) {
                    for (He = Ne, Qe = Ue, qe = Ze; Pe = _.distcode[qe + ((P & (1 << He + Qe) - 1) >> He)], Ne = Pe >>> 24, Ue = Pe >>> 16 & 255, Ze = Pe & 65535, !(He + Ne <= X); ) {
                      if (ee === 0)
                        break e;
                      ee--, P += ue[e++] << X, X += 8;
                    }
                    P >>>= He, X -= He, _.back += He;
                  }
                  if (P >>>= Ne, X -= Ne, _.back += Ne, Ue & 64) {
                    Z.msg = "invalid distance code", _.mode = _e;
                    break;
                  }
                  _.offset = Ze, _.extra = Ue & 15, _.mode = de;
                case de:
                  if (_.extra) {
                    for (Ye = _.extra; X < Ye; ) {
                      if (ee === 0)
                        break e;
                      ee--, P += ue[e++] << X, X += 8;
                    }
                    _.offset += P & (1 << _.extra) - 1, P >>>= _.extra, X -= _.extra, _.back += _.extra;
                  }
                  if (_.offset > _.dmax) {
                    Z.msg = "invalid distance too far back", _.mode = _e;
                    break;
                  }
                  _.mode = we;
                case we:
                  if (v === 0)
                    break e;
                  if (Ae = me - v, _.offset > Ae) {
                    if (Ae = _.offset - Ae, Ae > _.whave && _.sane) {
                      Z.msg = "invalid distance too far back", _.mode = _e;
                      break;
                    }
                    Ae > _.wnext ? (Ae -= _.wnext, Fe = _.wsize - Ae) : Fe = _.wnext - Ae, Ae > _.length && (Ae = _.length), Ve = _.window;
                  } else
                    Ve = ke, Fe = J - _.offset, Ae = _.length;
                  Ae > v && (Ae = v), v -= Ae, _.length -= Ae;
                  do
                    ke[J++] = Ve[Fe++];
                  while (--Ae);
                  _.length === 0 && (_.mode = Y);
                  break;
                case ye:
                  if (v === 0)
                    break e;
                  ke[J++] = _.length, v--, _.mode = Y;
                  break;
                case U:
                  if (_.wrap) {
                    for (; X < 32; ) {
                      if (ee === 0)
                        break e;
                      ee--, P |= ue[e++] << X, X += 8;
                    }
                    if (me -= v, Z.total_out += me, _.total += me, me && (Z.adler = _.check = /*UPDATE(state.check, put - _out, _out);*/
                    _.flags ? T(_.check, ke, me, J - me) : g(_.check, ke, me, J - me)), me = v, (_.flags ? P : D(P)) !== _.check) {
                      Z.msg = "incorrect data check", _.mode = _e;
                      break;
                    }
                    P = 0, X = 0;
                  }
                  _.mode = j;
                case j:
                  if (_.wrap && _.flags) {
                    for (; X < 32; ) {
                      if (ee === 0)
                        break e;
                      ee--, P += ue[e++] << X, X += 8;
                    }
                    if (P !== (_.total & 4294967295)) {
                      Z.msg = "incorrect length check", _.mode = _e;
                      break;
                    }
                    P = 0, X = 0;
                  }
                  _.mode = ie;
                case ie:
                  Ge = b;
                  break e;
                case _e:
                  Ge = O;
                  break e;
                case Te:
                  return L;
                case k:
                default:
                  return S;
              }
          return Z.next_out = J, Z.avail_out = v, Z.next_in = e, Z.avail_in = ee, _.hold = P, _.bits = X, (_.wsize || me !== Z.avail_out && _.mode < _e && (_.mode < U || ne !== f)) && We(Z, Z.output, Z.next_out, me - Z.avail_out) ? (_.mode = Te, L) : (Re -= Z.avail_in, me -= Z.avail_out, Z.total_in += Re, Z.total_out += me, _.total += me, _.wrap && me && (Z.adler = _.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
          _.flags ? T(_.check, ke, me, Z.next_out - me) : g(_.check, ke, me, Z.next_out - me)), Z.data_type = _.bits + (_.last ? 64 : 0) + (_.mode === V ? 128 : 0) + (_.mode === z || _.mode === he ? 256 : 0), (Re === 0 && me === 0 || ne === f) && Ge === c && (Ge = E), Ge);
        }
        function se(Z) {
          if (!Z || !Z.state)
            return S;
          var ne = Z.state;
          return ne.window && (ne.window = null), Z.state = null, c;
        }
        function pe(Z, ne) {
          var _;
          return !Z || !Z.state || (_ = Z.state, !(_.wrap & 2)) ? S : (_.head = ne, ne.done = !1, c);
        }
        function Se(Z, ne) {
          var _ = ne.length, ue, ke, e;
          return !Z || !Z.state || (ue = Z.state, ue.wrap !== 0 && ue.mode !== x) ? S : ue.mode === x && (ke = 1, ke = g(ke, ne, _, 0), ke !== ue.check) ? O : (e = We(Z, ne, _, _), e ? (ue.mode = Te, L) : (ue.havedict = 1, c));
        }
        s.inflateReset = Oe, s.inflateReset2 = Ie, s.inflateResetKeep = fe, s.inflateInit = Me, s.inflateInit2 = Le, s.inflate = A, s.inflateEnd = se, s.inflateGetHeader = pe, s.inflateSetDictionary = Se, s.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 52, "./adler32": 53, "./crc32": 55, "./inffast": 57, "./inftrees": 59 }], 59: [function(y, H, s) {
        "use strict";
        var w = y("../utils/common"), g = 15, T = 852, m = 592, d = 0, i = 1, o = 2, a = [
          /* Length codes 257..285 base */
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          13,
          15,
          17,
          19,
          23,
          27,
          31,
          35,
          43,
          51,
          59,
          67,
          83,
          99,
          115,
          131,
          163,
          195,
          227,
          258,
          0,
          0
        ], f = [
          /* Length codes 257..285 extra */
          16,
          16,
          16,
          16,
          16,
          16,
          16,
          16,
          17,
          17,
          17,
          17,
          18,
          18,
          18,
          18,
          19,
          19,
          19,
          19,
          20,
          20,
          20,
          20,
          21,
          21,
          21,
          21,
          16,
          72,
          78
        ], p = [
          /* Distance codes 0..29 base */
          1,
          2,
          3,
          4,
          5,
          7,
          9,
          13,
          17,
          25,
          33,
          49,
          65,
          97,
          129,
          193,
          257,
          385,
          513,
          769,
          1025,
          1537,
          2049,
          3073,
          4097,
          6145,
          8193,
          12289,
          16385,
          24577,
          0,
          0
        ], u = [
          /* Distance codes 0..29 extra */
          16,
          16,
          16,
          16,
          17,
          17,
          18,
          18,
          19,
          19,
          20,
          20,
          21,
          21,
          22,
          22,
          23,
          23,
          24,
          24,
          25,
          25,
          26,
          26,
          27,
          27,
          28,
          28,
          29,
          29,
          64,
          64
        ];
        H.exports = function(b, R, S, O, L, E, F, I) {
          var M = I.bits, N = 0, G = 0, W = 0, Q = 0, re = 0, ae = 0, C = 0, h = 0, x = 0, V = 0, oe, Ee, he, B, K, q = null, ge = 0, z, Y = new w.Buf16(g + 1), $ = new w.Buf16(g + 1), ce = null, de = 0, we, ye, U;
          for (N = 0; N <= g; N++)
            Y[N] = 0;
          for (G = 0; G < O; G++)
            Y[R[S + G]]++;
          for (re = M, Q = g; Q >= 1 && Y[Q] === 0; Q--)
            ;
          if (re > Q && (re = Q), Q === 0)
            return L[E++] = 1 << 24 | 64 << 16 | 0, L[E++] = 1 << 24 | 64 << 16 | 0, I.bits = 1, 0;
          for (W = 1; W < Q && Y[W] === 0; W++)
            ;
          for (re < W && (re = W), h = 1, N = 1; N <= g; N++)
            if (h <<= 1, h -= Y[N], h < 0)
              return -1;
          if (h > 0 && (b === d || Q !== 1))
            return -1;
          for ($[1] = 0, N = 1; N < g; N++)
            $[N + 1] = $[N] + Y[N];
          for (G = 0; G < O; G++)
            R[S + G] !== 0 && (F[$[R[S + G]]++] = G);
          if (b === d ? (q = ce = F, z = 19) : b === i ? (q = a, ge -= 257, ce = f, de -= 257, z = 256) : (q = p, ce = u, z = -1), V = 0, G = 0, N = W, K = E, ae = re, C = 0, he = -1, x = 1 << re, B = x - 1, b === i && x > T || b === o && x > m)
            return 1;
          for (; ; ) {
            we = N - C, F[G] < z ? (ye = 0, U = F[G]) : F[G] > z ? (ye = ce[de + F[G]], U = q[ge + F[G]]) : (ye = 96, U = 0), oe = 1 << N - C, Ee = 1 << ae, W = Ee;
            do
              Ee -= oe, L[K + (V >> C) + Ee] = we << 24 | ye << 16 | U | 0;
            while (Ee !== 0);
            for (oe = 1 << N - 1; V & oe; )
              oe >>= 1;
            if (oe !== 0 ? (V &= oe - 1, V += oe) : V = 0, G++, --Y[N] === 0) {
              if (N === Q)
                break;
              N = R[S + F[G]];
            }
            if (N > re && (V & B) !== he) {
              for (C === 0 && (C = re), K += W, ae = N - C, h = 1 << ae; ae + C < Q && (h -= Y[ae + C], !(h <= 0)); )
                ae++, h <<= 1;
              if (x += 1 << ae, b === i && x > T || b === o && x > m)
                return 1;
              he = V & B, L[he] = re << 24 | ae << 16 | K - E | 0;
            }
          }
          return V !== 0 && (L[K + V] = N - C << 24 | 64 << 16 | 0), I.bits = re, 0;
        };
      }, { "../utils/common": 52 }], 60: [function(y, H, s) {
        "use strict";
        H.exports = {
          2: "need dictionary",
          /* Z_NEED_DICT       2  */
          1: "stream end",
          /* Z_STREAM_END      1  */
          0: "",
          /* Z_OK              0  */
          "-1": "file error",
          /* Z_ERRNO         (-1) */
          "-2": "stream error",
          /* Z_STREAM_ERROR  (-2) */
          "-3": "data error",
          /* Z_DATA_ERROR    (-3) */
          "-4": "insufficient memory",
          /* Z_MEM_ERROR     (-4) */
          "-5": "buffer error",
          /* Z_BUF_ERROR     (-5) */
          "-6": "incompatible version"
          /* Z_VERSION_ERROR (-6) */
        };
      }, {}], 61: [function(y, H, s) {
        "use strict";
        var w = y("../utils/common"), g = 4, T = 0, m = 1, d = 2;
        function i(A) {
          for (var se = A.length; --se >= 0; )
            A[se] = 0;
        }
        var o = 0, a = 1, f = 2, p = 3, u = 258, c = 29, b = 256, R = b + 1 + c, S = 30, O = 19, L = 2 * R + 1, E = 15, F = 16, I = 7, M = 256, N = 16, G = 17, W = 18, Q = (
          /* extra bits for each length code */
          [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
        ), re = (
          /* extra bits for each distance code */
          [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
        ), ae = (
          /* extra bits for each bit length code */
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
        ), C = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], h = 512, x = new Array((R + 2) * 2);
        i(x);
        var V = new Array(S * 2);
        i(V);
        var oe = new Array(h);
        i(oe);
        var Ee = new Array(u - p + 1);
        i(Ee);
        var he = new Array(c);
        i(he);
        var B = new Array(S);
        i(B);
        function K(A, se, pe, Se, Z) {
          this.static_tree = A, this.extra_bits = se, this.extra_base = pe, this.elems = Se, this.max_length = Z, this.has_stree = A && A.length;
        }
        var q, ge, z;
        function Y(A, se) {
          this.dyn_tree = A, this.max_code = 0, this.stat_desc = se;
        }
        function $(A) {
          return A < 256 ? oe[A] : oe[256 + (A >>> 7)];
        }
        function ce(A, se) {
          A.pending_buf[A.pending++] = se & 255, A.pending_buf[A.pending++] = se >>> 8 & 255;
        }
        function de(A, se, pe) {
          A.bi_valid > F - pe ? (A.bi_buf |= se << A.bi_valid & 65535, ce(A, A.bi_buf), A.bi_buf = se >> F - A.bi_valid, A.bi_valid += pe - F) : (A.bi_buf |= se << A.bi_valid & 65535, A.bi_valid += pe);
        }
        function we(A, se, pe) {
          de(
            A,
            pe[se * 2],
            pe[se * 2 + 1]
            /*.Len*/
          );
        }
        function ye(A, se) {
          var pe = 0;
          do
            pe |= A & 1, A >>>= 1, pe <<= 1;
          while (--se > 0);
          return pe >>> 1;
        }
        function U(A) {
          A.bi_valid === 16 ? (ce(A, A.bi_buf), A.bi_buf = 0, A.bi_valid = 0) : A.bi_valid >= 8 && (A.pending_buf[A.pending++] = A.bi_buf & 255, A.bi_buf >>= 8, A.bi_valid -= 8);
        }
        function j(A, se) {
          var pe = se.dyn_tree, Se = se.max_code, Z = se.stat_desc.static_tree, ne = se.stat_desc.has_stree, _ = se.stat_desc.extra_bits, ue = se.stat_desc.extra_base, ke = se.stat_desc.max_length, e, J, ee, v, P, X, Re = 0;
          for (v = 0; v <= E; v++)
            A.bl_count[v] = 0;
          for (pe[A.heap[A.heap_max] * 2 + 1] = 0, e = A.heap_max + 1; e < L; e++)
            J = A.heap[e], v = pe[pe[J * 2 + 1] * 2 + 1] + 1, v > ke && (v = ke, Re++), pe[J * 2 + 1] = v, !(J > Se) && (A.bl_count[v]++, P = 0, J >= ue && (P = _[J - ue]), X = pe[J * 2], A.opt_len += X * (v + P), ne && (A.static_len += X * (Z[J * 2 + 1] + P)));
          if (Re !== 0) {
            do {
              for (v = ke - 1; A.bl_count[v] === 0; )
                v--;
              A.bl_count[v]--, A.bl_count[v + 1] += 2, A.bl_count[ke]--, Re -= 2;
            } while (Re > 0);
            for (v = ke; v !== 0; v--)
              for (J = A.bl_count[v]; J !== 0; )
                ee = A.heap[--e], !(ee > Se) && (pe[ee * 2 + 1] !== v && (A.opt_len += (v - pe[ee * 2 + 1]) * pe[ee * 2], pe[ee * 2 + 1] = v), J--);
          }
        }
        function ie(A, se, pe) {
          var Se = new Array(E + 1), Z = 0, ne, _;
          for (ne = 1; ne <= E; ne++)
            Se[ne] = Z = Z + pe[ne - 1] << 1;
          for (_ = 0; _ <= se; _++) {
            var ue = A[_ * 2 + 1];
            ue !== 0 && (A[_ * 2] = ye(Se[ue]++, ue));
          }
        }
        function _e() {
          var A, se, pe, Se, Z, ne = new Array(E + 1);
          for (pe = 0, Se = 0; Se < c - 1; Se++)
            for (he[Se] = pe, A = 0; A < 1 << Q[Se]; A++)
              Ee[pe++] = Se;
          for (Ee[pe - 1] = Se, Z = 0, Se = 0; Se < 16; Se++)
            for (B[Se] = Z, A = 0; A < 1 << re[Se]; A++)
              oe[Z++] = Se;
          for (Z >>= 7; Se < S; Se++)
            for (B[Se] = Z << 7, A = 0; A < 1 << re[Se] - 7; A++)
              oe[256 + Z++] = Se;
          for (se = 0; se <= E; se++)
            ne[se] = 0;
          for (A = 0; A <= 143; )
            x[A * 2 + 1] = 8, A++, ne[8]++;
          for (; A <= 255; )
            x[A * 2 + 1] = 9, A++, ne[9]++;
          for (; A <= 279; )
            x[A * 2 + 1] = 7, A++, ne[7]++;
          for (; A <= 287; )
            x[A * 2 + 1] = 8, A++, ne[8]++;
          for (ie(x, R + 1, ne), A = 0; A < S; A++)
            V[A * 2 + 1] = 5, V[A * 2] = ye(A, 5);
          q = new K(x, Q, b + 1, R, E), ge = new K(V, re, 0, S, E), z = new K(new Array(0), ae, 0, O, I);
        }
        function Te(A) {
          var se;
          for (se = 0; se < R; se++)
            A.dyn_ltree[se * 2] = 0;
          for (se = 0; se < S; se++)
            A.dyn_dtree[se * 2] = 0;
          for (se = 0; se < O; se++)
            A.bl_tree[se * 2] = 0;
          A.dyn_ltree[M * 2] = 1, A.opt_len = A.static_len = 0, A.last_lit = A.matches = 0;
        }
        function k(A) {
          A.bi_valid > 8 ? ce(A, A.bi_buf) : A.bi_valid > 0 && (A.pending_buf[A.pending++] = A.bi_buf), A.bi_buf = 0, A.bi_valid = 0;
        }
        function n(A, se, pe, Se) {
          k(A), Se && (ce(A, pe), ce(A, ~pe)), w.arraySet(A.pending_buf, A.window, se, pe, A.pending), A.pending += pe;
        }
        function t(A, se, pe, Se) {
          var Z = se * 2, ne = pe * 2;
          return A[Z] < A[ne] || A[Z] === A[ne] && Se[se] <= Se[pe];
        }
        function r(A, se, pe) {
          for (var Se = A.heap[pe], Z = pe << 1; Z <= A.heap_len && (Z < A.heap_len && t(se, A.heap[Z + 1], A.heap[Z], A.depth) && Z++, !t(se, Se, A.heap[Z], A.depth)); )
            A.heap[pe] = A.heap[Z], pe = Z, Z <<= 1;
          A.heap[pe] = Se;
        }
        function l(A, se, pe) {
          var Se, Z, ne = 0, _, ue;
          if (A.last_lit !== 0)
            do
              Se = A.pending_buf[A.d_buf + ne * 2] << 8 | A.pending_buf[A.d_buf + ne * 2 + 1], Z = A.pending_buf[A.l_buf + ne], ne++, Se === 0 ? we(A, Z, se) : (_ = Ee[Z], we(A, _ + b + 1, se), ue = Q[_], ue !== 0 && (Z -= he[_], de(A, Z, ue)), Se--, _ = $(Se), we(A, _, pe), ue = re[_], ue !== 0 && (Se -= B[_], de(A, Se, ue)));
            while (ne < A.last_lit);
          we(A, M, se);
        }
        function D(A, se) {
          var pe = se.dyn_tree, Se = se.stat_desc.static_tree, Z = se.stat_desc.has_stree, ne = se.stat_desc.elems, _, ue, ke = -1, e;
          for (A.heap_len = 0, A.heap_max = L, _ = 0; _ < ne; _++)
            pe[_ * 2] !== 0 ? (A.heap[++A.heap_len] = ke = _, A.depth[_] = 0) : pe[_ * 2 + 1] = 0;
          for (; A.heap_len < 2; )
            e = A.heap[++A.heap_len] = ke < 2 ? ++ke : 0, pe[e * 2] = 1, A.depth[e] = 0, A.opt_len--, Z && (A.static_len -= Se[e * 2 + 1]);
          for (se.max_code = ke, _ = A.heap_len >> 1; _ >= 1; _--)
            r(A, pe, _);
          e = ne;
          do
            _ = A.heap[
              1
              /*SMALLEST*/
            ], A.heap[
              1
              /*SMALLEST*/
            ] = A.heap[A.heap_len--], r(
              A,
              pe,
              1
              /*SMALLEST*/
            ), ue = A.heap[
              1
              /*SMALLEST*/
            ], A.heap[--A.heap_max] = _, A.heap[--A.heap_max] = ue, pe[e * 2] = pe[_ * 2] + pe[ue * 2], A.depth[e] = (A.depth[_] >= A.depth[ue] ? A.depth[_] : A.depth[ue]) + 1, pe[_ * 2 + 1] = pe[ue * 2 + 1] = e, A.heap[
              1
              /*SMALLEST*/
            ] = e++, r(
              A,
              pe,
              1
              /*SMALLEST*/
            );
          while (A.heap_len >= 2);
          A.heap[--A.heap_max] = A.heap[
            1
            /*SMALLEST*/
          ], j(A, se), ie(pe, ke, A.bl_count);
        }
        function te(A, se, pe) {
          var Se, Z = -1, ne, _ = se[0 * 2 + 1], ue = 0, ke = 7, e = 4;
          for (_ === 0 && (ke = 138, e = 3), se[(pe + 1) * 2 + 1] = 65535, Se = 0; Se <= pe; Se++)
            ne = _, _ = se[(Se + 1) * 2 + 1], !(++ue < ke && ne === _) && (ue < e ? A.bl_tree[ne * 2] += ue : ne !== 0 ? (ne !== Z && A.bl_tree[ne * 2]++, A.bl_tree[N * 2]++) : ue <= 10 ? A.bl_tree[G * 2]++ : A.bl_tree[W * 2]++, ue = 0, Z = ne, _ === 0 ? (ke = 138, e = 3) : ne === _ ? (ke = 6, e = 3) : (ke = 7, e = 4));
        }
        function fe(A, se, pe) {
          var Se, Z = -1, ne, _ = se[0 * 2 + 1], ue = 0, ke = 7, e = 4;
          for (_ === 0 && (ke = 138, e = 3), Se = 0; Se <= pe; Se++)
            if (ne = _, _ = se[(Se + 1) * 2 + 1], !(++ue < ke && ne === _)) {
              if (ue < e)
                do
                  we(A, ne, A.bl_tree);
                while (--ue !== 0);
              else ne !== 0 ? (ne !== Z && (we(A, ne, A.bl_tree), ue--), we(A, N, A.bl_tree), de(A, ue - 3, 2)) : ue <= 10 ? (we(A, G, A.bl_tree), de(A, ue - 3, 3)) : (we(A, W, A.bl_tree), de(A, ue - 11, 7));
              ue = 0, Z = ne, _ === 0 ? (ke = 138, e = 3) : ne === _ ? (ke = 6, e = 3) : (ke = 7, e = 4);
            }
        }
        function Oe(A) {
          var se;
          for (te(A, A.dyn_ltree, A.l_desc.max_code), te(A, A.dyn_dtree, A.d_desc.max_code), D(A, A.bl_desc), se = O - 1; se >= 3 && A.bl_tree[C[se] * 2 + 1] === 0; se--)
            ;
          return A.opt_len += 3 * (se + 1) + 5 + 5 + 4, se;
        }
        function Ie(A, se, pe, Se) {
          var Z;
          for (de(A, se - 257, 5), de(A, pe - 1, 5), de(A, Se - 4, 4), Z = 0; Z < Se; Z++)
            de(A, A.bl_tree[C[Z] * 2 + 1], 3);
          fe(A, A.dyn_ltree, se - 1), fe(A, A.dyn_dtree, pe - 1);
        }
        function Le(A) {
          var se = 4093624447, pe;
          for (pe = 0; pe <= 31; pe++, se >>>= 1)
            if (se & 1 && A.dyn_ltree[pe * 2] !== 0)
              return T;
          if (A.dyn_ltree[9 * 2] !== 0 || A.dyn_ltree[10 * 2] !== 0 || A.dyn_ltree[13 * 2] !== 0)
            return m;
          for (pe = 32; pe < b; pe++)
            if (A.dyn_ltree[pe * 2] !== 0)
              return m;
          return T;
        }
        var Me = !1;
        function xe(A) {
          Me || (_e(), Me = !0), A.l_desc = new Y(A.dyn_ltree, q), A.d_desc = new Y(A.dyn_dtree, ge), A.bl_desc = new Y(A.bl_tree, z), A.bi_buf = 0, A.bi_valid = 0, Te(A);
        }
        function je(A, se, pe, Se) {
          de(A, (o << 1) + (Se ? 1 : 0), 3), n(A, se, pe, !0);
        }
        function Ce(A) {
          de(A, a << 1, 3), we(A, M, x), U(A);
        }
        function Be(A, se, pe, Se) {
          var Z, ne, _ = 0;
          A.level > 0 ? (A.strm.data_type === d && (A.strm.data_type = Le(A)), D(A, A.l_desc), D(A, A.d_desc), _ = Oe(A), Z = A.opt_len + 3 + 7 >>> 3, ne = A.static_len + 3 + 7 >>> 3, ne <= Z && (Z = ne)) : Z = ne = pe + 5, pe + 4 <= Z && se !== -1 ? je(A, se, pe, Se) : A.strategy === g || ne === Z ? (de(A, (a << 1) + (Se ? 1 : 0), 3), l(A, x, V)) : (de(A, (f << 1) + (Se ? 1 : 0), 3), Ie(A, A.l_desc.max_code + 1, A.d_desc.max_code + 1, _ + 1), l(A, A.dyn_ltree, A.dyn_dtree)), Te(A), Se && k(A);
        }
        function We(A, se, pe) {
          return A.pending_buf[A.d_buf + A.last_lit * 2] = se >>> 8 & 255, A.pending_buf[A.d_buf + A.last_lit * 2 + 1] = se & 255, A.pending_buf[A.l_buf + A.last_lit] = pe & 255, A.last_lit++, se === 0 ? A.dyn_ltree[pe * 2]++ : (A.matches++, se--, A.dyn_ltree[(Ee[pe] + b + 1) * 2]++, A.dyn_dtree[$(se) * 2]++), A.last_lit === A.lit_bufsize - 1;
        }
        s._tr_init = xe, s._tr_stored_block = je, s._tr_flush_block = Be, s._tr_tally = We, s._tr_align = Ce;
      }, { "../utils/common": 52 }], 62: [function(y, H, s) {
        "use strict";
        function w() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        }
        H.exports = w;
      }, {}], 63: [function(y, H, s) {
        var w = H.exports = {}, g, T;
        function m() {
          throw new Error("setTimeout has not been defined");
        }
        function d() {
          throw new Error("clearTimeout has not been defined");
        }
        (function() {
          try {
            typeof setTimeout == "function" ? g = setTimeout : g = m;
          } catch {
            g = m;
          }
          try {
            typeof clearTimeout == "function" ? T = clearTimeout : T = d;
          } catch {
            T = d;
          }
        })();
        function i(O) {
          if (g === setTimeout)
            return setTimeout(O, 0);
          if ((g === m || !g) && setTimeout)
            return g = setTimeout, setTimeout(O, 0);
          try {
            return g(O, 0);
          } catch {
            try {
              return g.call(null, O, 0);
            } catch {
              return g.call(this, O, 0);
            }
          }
        }
        function o(O) {
          if (T === clearTimeout)
            return clearTimeout(O);
          if ((T === d || !T) && clearTimeout)
            return T = clearTimeout, clearTimeout(O);
          try {
            return T(O);
          } catch {
            try {
              return T.call(null, O);
            } catch {
              return T.call(this, O);
            }
          }
        }
        var a = [], f = !1, p, u = -1;
        function c() {
          !f || !p || (f = !1, p.length ? a = p.concat(a) : u = -1, a.length && b());
        }
        function b() {
          if (!f) {
            var O = i(c);
            f = !0;
            for (var L = a.length; L; ) {
              for (p = a, a = []; ++u < L; )
                p && p[u].run();
              u = -1, L = a.length;
            }
            p = null, f = !1, o(O);
          }
        }
        w.nextTick = function(O) {
          var L = new Array(arguments.length - 1);
          if (arguments.length > 1)
            for (var E = 1; E < arguments.length; E++)
              L[E - 1] = arguments[E];
          a.push(new R(O, L)), a.length === 1 && !f && i(b);
        };
        function R(O, L) {
          this.fun = O, this.array = L;
        }
        R.prototype.run = function() {
          this.fun.apply(null, this.array);
        }, w.title = "browser", w.browser = !0, w.env = {}, w.argv = [], w.version = "", w.versions = {};
        function S() {
        }
        w.on = S, w.addListener = S, w.once = S, w.off = S, w.removeListener = S, w.removeAllListeners = S, w.emit = S, w.prependListener = S, w.prependOnceListener = S, w.listeners = function(O) {
          return [];
        }, w.binding = function(O) {
          throw new Error("process.binding is not supported");
        }, w.cwd = function() {
          return "/";
        }, w.chdir = function(O) {
          throw new Error("process.chdir is not supported");
        }, w.umask = function() {
          return 0;
        };
      }, {}], 64: [function(y, H, s) {
        var w = y("buffer"), g = w.Buffer;
        function T(d, i) {
          for (var o in d)
            i[o] = d[o];
        }
        g.from && g.alloc && g.allocUnsafe && g.allocUnsafeSlow ? H.exports = w : (T(w, s), s.Buffer = m);
        function m(d, i, o) {
          return g(d, i, o);
        }
        m.prototype = Object.create(g.prototype), T(g, m), m.from = function(d, i, o) {
          if (typeof d == "number")
            throw new TypeError("Argument must not be a number");
          return g(d, i, o);
        }, m.alloc = function(d, i, o) {
          if (typeof d != "number")
            throw new TypeError("Argument must be a number");
          var a = g(d);
          return i !== void 0 ? typeof o == "string" ? a.fill(i, o) : a.fill(i) : a.fill(0), a;
        }, m.allocUnsafe = function(d) {
          if (typeof d != "number")
            throw new TypeError("Argument must be a number");
          return g(d);
        }, m.allocUnsafeSlow = function(d) {
          if (typeof d != "number")
            throw new TypeError("Argument must be a number");
          return w.SlowBuffer(d);
        };
      }, { buffer: 32 }], 65: [function(y, H, s) {
        H.exports = T;
        var w = y("events").EventEmitter, g = y("inherits");
        g(T, w), T.Readable = y("readable-stream/lib/_stream_readable.js"), T.Writable = y("readable-stream/lib/_stream_writable.js"), T.Duplex = y("readable-stream/lib/_stream_duplex.js"), T.Transform = y("readable-stream/lib/_stream_transform.js"), T.PassThrough = y("readable-stream/lib/_stream_passthrough.js"), T.finished = y("readable-stream/lib/internal/streams/end-of-stream.js"), T.pipeline = y("readable-stream/lib/internal/streams/pipeline.js"), T.Stream = T;
        function T() {
          w.call(this);
        }
        T.prototype.pipe = function(m, d) {
          var i = this;
          function o(R) {
            m.writable && m.write(R) === !1 && i.pause && i.pause();
          }
          i.on("data", o);
          function a() {
            i.readable && i.resume && i.resume();
          }
          m.on("drain", a), !m._isStdio && (!d || d.end !== !1) && (i.on("end", p), i.on("close", u));
          var f = !1;
          function p() {
            f || (f = !0, m.end());
          }
          function u() {
            f || (f = !0, typeof m.destroy == "function" && m.destroy());
          }
          function c(R) {
            if (b(), w.listenerCount(this, "error") === 0)
              throw R;
          }
          i.on("error", c), m.on("error", c);
          function b() {
            i.removeListener("data", o), m.removeListener("drain", a), i.removeListener("end", p), i.removeListener("close", u), i.removeListener("error", c), m.removeListener("error", c), i.removeListener("end", b), i.removeListener("close", b), m.removeListener("close", b);
          }
          return i.on("end", b), i.on("close", b), m.on("close", b), m.emit("pipe", i), m;
        };
      }, { events: 35, inherits: 46, "readable-stream/lib/_stream_duplex.js": 67, "readable-stream/lib/_stream_passthrough.js": 68, "readable-stream/lib/_stream_readable.js": 69, "readable-stream/lib/_stream_transform.js": 70, "readable-stream/lib/_stream_writable.js": 71, "readable-stream/lib/internal/streams/end-of-stream.js": 75, "readable-stream/lib/internal/streams/pipeline.js": 77 }], 66: [function(y, H, s) {
        "use strict";
        function w(a, f) {
          a.prototype = Object.create(f.prototype), a.prototype.constructor = a, a.__proto__ = f;
        }
        var g = {};
        function T(a, f, p) {
          p || (p = Error);
          function u(b, R, S) {
            return typeof f == "string" ? f : f(b, R, S);
          }
          var c = /* @__PURE__ */ function(b) {
            w(R, b);
            function R(S, O, L) {
              return b.call(this, u(S, O, L)) || this;
            }
            return R;
          }(p);
          c.prototype.name = p.name, c.prototype.code = a, g[a] = c;
        }
        function m(a, f) {
          if (Array.isArray(a)) {
            var p = a.length;
            return a = a.map(function(u) {
              return String(u);
            }), p > 2 ? "one of ".concat(f, " ").concat(a.slice(0, p - 1).join(", "), ", or ") + a[p - 1] : p === 2 ? "one of ".concat(f, " ").concat(a[0], " or ").concat(a[1]) : "of ".concat(f, " ").concat(a[0]);
          } else
            return "of ".concat(f, " ").concat(String(a));
        }
        function d(a, f, p) {
          return a.substr(!p || p < 0 ? 0 : +p, f.length) === f;
        }
        function i(a, f, p) {
          return (p === void 0 || p > a.length) && (p = a.length), a.substring(p - f.length, p) === f;
        }
        function o(a, f, p) {
          return typeof p != "number" && (p = 0), p + f.length > a.length ? !1 : a.indexOf(f, p) !== -1;
        }
        T("ERR_INVALID_OPT_VALUE", function(a, f) {
          return 'The value "' + f + '" is invalid for option "' + a + '"';
        }, TypeError), T("ERR_INVALID_ARG_TYPE", function(a, f, p) {
          var u;
          typeof f == "string" && d(f, "not ") ? (u = "must not be", f = f.replace(/^not /, "")) : u = "must be";
          var c;
          if (i(a, " argument"))
            c = "The ".concat(a, " ").concat(u, " ").concat(m(f, "type"));
          else {
            var b = o(a, ".") ? "property" : "argument";
            c = 'The "'.concat(a, '" ').concat(b, " ").concat(u, " ").concat(m(f, "type"));
          }
          return c += ". Received type ".concat(typeof p), c;
        }, TypeError), T("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF"), T("ERR_METHOD_NOT_IMPLEMENTED", function(a) {
          return "The " + a + " method is not implemented";
        }), T("ERR_STREAM_PREMATURE_CLOSE", "Premature close"), T("ERR_STREAM_DESTROYED", function(a) {
          return "Cannot call " + a + " after a stream was destroyed";
        }), T("ERR_MULTIPLE_CALLBACK", "Callback called multiple times"), T("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable"), T("ERR_STREAM_WRITE_AFTER_END", "write after end"), T("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError), T("ERR_UNKNOWN_ENCODING", function(a) {
          return "Unknown encoding: " + a;
        }, TypeError), T("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event"), H.exports.codes = g;
      }, {}], 67: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            var g = Object.keys || function(u) {
              var c = [];
              for (var b in u)
                c.push(b);
              return c;
            };
            H.exports = a;
            var T = y("./_stream_readable"), m = y("./_stream_writable");
            y("inherits")(a, T);
            for (var d = g(m.prototype), i = 0; i < d.length; i++) {
              var o = d[i];
              a.prototype[o] || (a.prototype[o] = m.prototype[o]);
            }
            function a(u) {
              if (!(this instanceof a)) return new a(u);
              T.call(this, u), m.call(this, u), this.allowHalfOpen = !0, u && (u.readable === !1 && (this.readable = !1), u.writable === !1 && (this.writable = !1), u.allowHalfOpen === !1 && (this.allowHalfOpen = !1, this.once("end", f)));
            }
            Object.defineProperty(a.prototype, "writableHighWaterMark", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._writableState.highWaterMark;
              }
            }), Object.defineProperty(a.prototype, "writableBuffer", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._writableState && this._writableState.getBuffer();
              }
            }), Object.defineProperty(a.prototype, "writableLength", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._writableState.length;
              }
            });
            function f() {
              this._writableState.ended || w.nextTick(p, this);
            }
            function p(u) {
              u.end();
            }
            Object.defineProperty(a.prototype, "destroyed", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._readableState === void 0 || this._writableState === void 0 ? !1 : this._readableState.destroyed && this._writableState.destroyed;
              },
              set: function(c) {
                this._readableState === void 0 || this._writableState === void 0 || (this._readableState.destroyed = c, this._writableState.destroyed = c);
              }
            });
          }).call(this);
        }).call(this, y("_process"));
      }, { "./_stream_readable": 69, "./_stream_writable": 71, _process: 63, inherits: 46 }], 68: [function(y, H, s) {
        "use strict";
        H.exports = g;
        var w = y("./_stream_transform");
        y("inherits")(g, w);
        function g(T) {
          if (!(this instanceof g)) return new g(T);
          w.call(this, T);
        }
        g.prototype._transform = function(T, m, d) {
          d(null, T);
        };
      }, { "./_stream_transform": 70, inherits: 46 }], 69: [function(y, H, s) {
        (function(w, g) {
          (function() {
            "use strict";
            H.exports = h;
            var T;
            h.ReadableState = C;
            var m = y("events").EventEmitter, d = function(n, t) {
              return n.listeners(t).length;
            }, i = y("./internal/streams/stream"), o = y("buffer").Buffer, a = g.Uint8Array || function() {
            };
            function f(k) {
              return o.from(k);
            }
            function p(k) {
              return o.isBuffer(k) || k instanceof a;
            }
            var u = y("util"), c;
            u && u.debuglog ? c = u.debuglog("stream") : c = function() {
            };
            var b = y("./internal/streams/buffer_list"), R = y("./internal/streams/destroy"), S = y("./internal/streams/state"), O = S.getHighWaterMark, L = y("../errors").codes, E = L.ERR_INVALID_ARG_TYPE, F = L.ERR_STREAM_PUSH_AFTER_EOF, I = L.ERR_METHOD_NOT_IMPLEMENTED, M = L.ERR_STREAM_UNSHIFT_AFTER_END_EVENT, N, G, W;
            y("inherits")(h, i);
            var Q = R.errorOrDestroy, re = ["error", "close", "destroy", "pause", "resume"];
            function ae(k, n, t) {
              if (typeof k.prependListener == "function") return k.prependListener(n, t);
              !k._events || !k._events[n] ? k.on(n, t) : Array.isArray(k._events[n]) ? k._events[n].unshift(t) : k._events[n] = [t, k._events[n]];
            }
            function C(k, n, t) {
              T = T || y("./_stream_duplex"), k = k || {}, typeof t != "boolean" && (t = n instanceof T), this.objectMode = !!k.objectMode, t && (this.objectMode = this.objectMode || !!k.readableObjectMode), this.highWaterMark = O(this, k, "readableHighWaterMark", t), this.buffer = new b(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.paused = !0, this.emitClose = k.emitClose !== !1, this.autoDestroy = !!k.autoDestroy, this.destroyed = !1, this.defaultEncoding = k.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, k.encoding && (N || (N = y("string_decoder/").StringDecoder), this.decoder = new N(k.encoding), this.encoding = k.encoding);
            }
            function h(k) {
              if (T = T || y("./_stream_duplex"), !(this instanceof h)) return new h(k);
              var n = this instanceof T;
              this._readableState = new C(k, this, n), this.readable = !0, k && (typeof k.read == "function" && (this._read = k.read), typeof k.destroy == "function" && (this._destroy = k.destroy)), i.call(this);
            }
            Object.defineProperty(h.prototype, "destroyed", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._readableState === void 0 ? !1 : this._readableState.destroyed;
              },
              set: function(n) {
                this._readableState && (this._readableState.destroyed = n);
              }
            }), h.prototype.destroy = R.destroy, h.prototype._undestroy = R.undestroy, h.prototype._destroy = function(k, n) {
              n(k);
            }, h.prototype.push = function(k, n) {
              var t = this._readableState, r;
              return t.objectMode ? r = !0 : typeof k == "string" && (n = n || t.defaultEncoding, n !== t.encoding && (k = o.from(k, n), n = ""), r = !0), x(this, k, n, !1, r);
            }, h.prototype.unshift = function(k) {
              return x(this, k, null, !0, !1);
            };
            function x(k, n, t, r, l) {
              c("readableAddChunk", n);
              var D = k._readableState;
              if (n === null)
                D.reading = !1, K(k, D);
              else {
                var te;
                if (l || (te = oe(D, n)), te)
                  Q(k, te);
                else if (D.objectMode || n && n.length > 0)
                  if (typeof n != "string" && !D.objectMode && Object.getPrototypeOf(n) !== o.prototype && (n = f(n)), r)
                    D.endEmitted ? Q(k, new M()) : V(k, D, n, !0);
                  else if (D.ended)
                    Q(k, new F());
                  else {
                    if (D.destroyed)
                      return !1;
                    D.reading = !1, D.decoder && !t ? (n = D.decoder.write(n), D.objectMode || n.length !== 0 ? V(k, D, n, !1) : z(k, D)) : V(k, D, n, !1);
                  }
                else r || (D.reading = !1, z(k, D));
              }
              return !D.ended && (D.length < D.highWaterMark || D.length === 0);
            }
            function V(k, n, t, r) {
              n.flowing && n.length === 0 && !n.sync ? (n.awaitDrain = 0, k.emit("data", t)) : (n.length += n.objectMode ? 1 : t.length, r ? n.buffer.unshift(t) : n.buffer.push(t), n.needReadable && q(k)), z(k, n);
            }
            function oe(k, n) {
              var t;
              return !p(n) && typeof n != "string" && n !== void 0 && !k.objectMode && (t = new E("chunk", ["string", "Buffer", "Uint8Array"], n)), t;
            }
            h.prototype.isPaused = function() {
              return this._readableState.flowing === !1;
            }, h.prototype.setEncoding = function(k) {
              N || (N = y("string_decoder/").StringDecoder);
              var n = new N(k);
              this._readableState.decoder = n, this._readableState.encoding = this._readableState.decoder.encoding;
              for (var t = this._readableState.buffer.head, r = ""; t !== null; )
                r += n.write(t.data), t = t.next;
              return this._readableState.buffer.clear(), r !== "" && this._readableState.buffer.push(r), this._readableState.length = r.length, this;
            };
            var Ee = 1073741824;
            function he(k) {
              return k >= Ee ? k = Ee : (k--, k |= k >>> 1, k |= k >>> 2, k |= k >>> 4, k |= k >>> 8, k |= k >>> 16, k++), k;
            }
            function B(k, n) {
              return k <= 0 || n.length === 0 && n.ended ? 0 : n.objectMode ? 1 : k !== k ? n.flowing && n.length ? n.buffer.head.data.length : n.length : (k > n.highWaterMark && (n.highWaterMark = he(k)), k <= n.length ? k : n.ended ? n.length : (n.needReadable = !0, 0));
            }
            h.prototype.read = function(k) {
              c("read", k), k = parseInt(k, 10);
              var n = this._readableState, t = k;
              if (k !== 0 && (n.emittedReadable = !1), k === 0 && n.needReadable && ((n.highWaterMark !== 0 ? n.length >= n.highWaterMark : n.length > 0) || n.ended))
                return c("read: emitReadable", n.length, n.ended), n.length === 0 && n.ended ? ie(this) : q(this), null;
              if (k = B(k, n), k === 0 && n.ended)
                return n.length === 0 && ie(this), null;
              var r = n.needReadable;
              c("need readable", r), (n.length === 0 || n.length - k < n.highWaterMark) && (r = !0, c("length less than watermark", r)), n.ended || n.reading ? (r = !1, c("reading or ended", r)) : r && (c("do read"), n.reading = !0, n.sync = !0, n.length === 0 && (n.needReadable = !0), this._read(n.highWaterMark), n.sync = !1, n.reading || (k = B(t, n)));
              var l;
              return k > 0 ? l = j(k, n) : l = null, l === null ? (n.needReadable = n.length <= n.highWaterMark, k = 0) : (n.length -= k, n.awaitDrain = 0), n.length === 0 && (n.ended || (n.needReadable = !0), t !== k && n.ended && ie(this)), l !== null && this.emit("data", l), l;
            };
            function K(k, n) {
              if (c("onEofChunk"), !n.ended) {
                if (n.decoder) {
                  var t = n.decoder.end();
                  t && t.length && (n.buffer.push(t), n.length += n.objectMode ? 1 : t.length);
                }
                n.ended = !0, n.sync ? q(k) : (n.needReadable = !1, n.emittedReadable || (n.emittedReadable = !0, ge(k)));
              }
            }
            function q(k) {
              var n = k._readableState;
              c("emitReadable", n.needReadable, n.emittedReadable), n.needReadable = !1, n.emittedReadable || (c("emitReadable", n.flowing), n.emittedReadable = !0, w.nextTick(ge, k));
            }
            function ge(k) {
              var n = k._readableState;
              c("emitReadable_", n.destroyed, n.length, n.ended), !n.destroyed && (n.length || n.ended) && (k.emit("readable"), n.emittedReadable = !1), n.needReadable = !n.flowing && !n.ended && n.length <= n.highWaterMark, U(k);
            }
            function z(k, n) {
              n.readingMore || (n.readingMore = !0, w.nextTick(Y, k, n));
            }
            function Y(k, n) {
              for (; !n.reading && !n.ended && (n.length < n.highWaterMark || n.flowing && n.length === 0); ) {
                var t = n.length;
                if (c("maybeReadMore read 0"), k.read(0), t === n.length)
                  break;
              }
              n.readingMore = !1;
            }
            h.prototype._read = function(k) {
              Q(this, new I("_read()"));
            }, h.prototype.pipe = function(k, n) {
              var t = this, r = this._readableState;
              switch (r.pipesCount) {
                case 0:
                  r.pipes = k;
                  break;
                case 1:
                  r.pipes = [r.pipes, k];
                  break;
                default:
                  r.pipes.push(k);
                  break;
              }
              r.pipesCount += 1, c("pipe count=%d opts=%j", r.pipesCount, n);
              var l = (!n || n.end !== !1) && k !== w.stdout && k !== w.stderr, D = l ? fe : Be;
              r.endEmitted ? w.nextTick(D) : t.once("end", D), k.on("unpipe", te);
              function te(We, A) {
                c("onunpipe"), We === t && A && A.hasUnpiped === !1 && (A.hasUnpiped = !0, Le());
              }
              function fe() {
                c("onend"), k.end();
              }
              var Oe = $(t);
              k.on("drain", Oe);
              var Ie = !1;
              function Le() {
                c("cleanup"), k.removeListener("close", je), k.removeListener("finish", Ce), k.removeListener("drain", Oe), k.removeListener("error", xe), k.removeListener("unpipe", te), t.removeListener("end", fe), t.removeListener("end", Be), t.removeListener("data", Me), Ie = !0, r.awaitDrain && (!k._writableState || k._writableState.needDrain) && Oe();
              }
              t.on("data", Me);
              function Me(We) {
                c("ondata");
                var A = k.write(We);
                c("dest.write", A), A === !1 && ((r.pipesCount === 1 && r.pipes === k || r.pipesCount > 1 && Te(r.pipes, k) !== -1) && !Ie && (c("false write response, pause", r.awaitDrain), r.awaitDrain++), t.pause());
              }
              function xe(We) {
                c("onerror", We), Be(), k.removeListener("error", xe), d(k, "error") === 0 && Q(k, We);
              }
              ae(k, "error", xe);
              function je() {
                k.removeListener("finish", Ce), Be();
              }
              k.once("close", je);
              function Ce() {
                c("onfinish"), k.removeListener("close", je), Be();
              }
              k.once("finish", Ce);
              function Be() {
                c("unpipe"), t.unpipe(k);
              }
              return k.emit("pipe", t), r.flowing || (c("pipe resume"), t.resume()), k;
            };
            function $(k) {
              return function() {
                var t = k._readableState;
                c("pipeOnDrain", t.awaitDrain), t.awaitDrain && t.awaitDrain--, t.awaitDrain === 0 && d(k, "data") && (t.flowing = !0, U(k));
              };
            }
            h.prototype.unpipe = function(k) {
              var n = this._readableState, t = {
                hasUnpiped: !1
              };
              if (n.pipesCount === 0) return this;
              if (n.pipesCount === 1)
                return k && k !== n.pipes ? this : (k || (k = n.pipes), n.pipes = null, n.pipesCount = 0, n.flowing = !1, k && k.emit("unpipe", this, t), this);
              if (!k) {
                var r = n.pipes, l = n.pipesCount;
                n.pipes = null, n.pipesCount = 0, n.flowing = !1;
                for (var D = 0; D < l; D++)
                  r[D].emit("unpipe", this, {
                    hasUnpiped: !1
                  });
                return this;
              }
              var te = Te(n.pipes, k);
              return te === -1 ? this : (n.pipes.splice(te, 1), n.pipesCount -= 1, n.pipesCount === 1 && (n.pipes = n.pipes[0]), k.emit("unpipe", this, t), this);
            }, h.prototype.on = function(k, n) {
              var t = i.prototype.on.call(this, k, n), r = this._readableState;
              return k === "data" ? (r.readableListening = this.listenerCount("readable") > 0, r.flowing !== !1 && this.resume()) : k === "readable" && !r.endEmitted && !r.readableListening && (r.readableListening = r.needReadable = !0, r.flowing = !1, r.emittedReadable = !1, c("on readable", r.length, r.reading), r.length ? q(this) : r.reading || w.nextTick(de, this)), t;
            }, h.prototype.addListener = h.prototype.on, h.prototype.removeListener = function(k, n) {
              var t = i.prototype.removeListener.call(this, k, n);
              return k === "readable" && w.nextTick(ce, this), t;
            }, h.prototype.removeAllListeners = function(k) {
              var n = i.prototype.removeAllListeners.apply(this, arguments);
              return (k === "readable" || k === void 0) && w.nextTick(ce, this), n;
            };
            function ce(k) {
              var n = k._readableState;
              n.readableListening = k.listenerCount("readable") > 0, n.resumeScheduled && !n.paused ? n.flowing = !0 : k.listenerCount("data") > 0 && k.resume();
            }
            function de(k) {
              c("readable nexttick read 0"), k.read(0);
            }
            h.prototype.resume = function() {
              var k = this._readableState;
              return k.flowing || (c("resume"), k.flowing = !k.readableListening, we(this, k)), k.paused = !1, this;
            };
            function we(k, n) {
              n.resumeScheduled || (n.resumeScheduled = !0, w.nextTick(ye, k, n));
            }
            function ye(k, n) {
              c("resume", n.reading), n.reading || k.read(0), n.resumeScheduled = !1, k.emit("resume"), U(k), n.flowing && !n.reading && k.read(0);
            }
            h.prototype.pause = function() {
              return c("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== !1 && (c("pause"), this._readableState.flowing = !1, this.emit("pause")), this._readableState.paused = !0, this;
            };
            function U(k) {
              var n = k._readableState;
              for (c("flow", n.flowing); n.flowing && k.read() !== null; )
                ;
            }
            h.prototype.wrap = function(k) {
              var n = this, t = this._readableState, r = !1;
              k.on("end", function() {
                if (c("wrapped end"), t.decoder && !t.ended) {
                  var te = t.decoder.end();
                  te && te.length && n.push(te);
                }
                n.push(null);
              }), k.on("data", function(te) {
                if (c("wrapped data"), t.decoder && (te = t.decoder.write(te)), !(t.objectMode && te == null) && !(!t.objectMode && (!te || !te.length))) {
                  var fe = n.push(te);
                  fe || (r = !0, k.pause());
                }
              });
              for (var l in k)
                this[l] === void 0 && typeof k[l] == "function" && (this[l] = /* @__PURE__ */ function(fe) {
                  return function() {
                    return k[fe].apply(k, arguments);
                  };
                }(l));
              for (var D = 0; D < re.length; D++)
                k.on(re[D], this.emit.bind(this, re[D]));
              return this._read = function(te) {
                c("wrapped _read", te), r && (r = !1, k.resume());
              }, this;
            }, typeof Symbol == "function" && (h.prototype[Symbol.asyncIterator] = function() {
              return G === void 0 && (G = y("./internal/streams/async_iterator")), G(this);
            }), Object.defineProperty(h.prototype, "readableHighWaterMark", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._readableState.highWaterMark;
              }
            }), Object.defineProperty(h.prototype, "readableBuffer", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._readableState && this._readableState.buffer;
              }
            }), Object.defineProperty(h.prototype, "readableFlowing", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._readableState.flowing;
              },
              set: function(n) {
                this._readableState && (this._readableState.flowing = n);
              }
            }), h._fromList = j, Object.defineProperty(h.prototype, "readableLength", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._readableState.length;
              }
            });
            function j(k, n) {
              if (n.length === 0) return null;
              var t;
              return n.objectMode ? t = n.buffer.shift() : !k || k >= n.length ? (n.decoder ? t = n.buffer.join("") : n.buffer.length === 1 ? t = n.buffer.first() : t = n.buffer.concat(n.length), n.buffer.clear()) : t = n.buffer.consume(k, n.decoder), t;
            }
            function ie(k) {
              var n = k._readableState;
              c("endReadable", n.endEmitted), n.endEmitted || (n.ended = !0, w.nextTick(_e, n, k));
            }
            function _e(k, n) {
              if (c("endReadableNT", k.endEmitted, k.length), !k.endEmitted && k.length === 0 && (k.endEmitted = !0, n.readable = !1, n.emit("end"), k.autoDestroy)) {
                var t = n._writableState;
                (!t || t.autoDestroy && t.finished) && n.destroy();
              }
            }
            typeof Symbol == "function" && (h.from = function(k, n) {
              return W === void 0 && (W = y("./internal/streams/from")), W(h, k, n);
            });
            function Te(k, n) {
              for (var t = 0, r = k.length; t < r; t++)
                if (k[t] === n) return t;
              return -1;
            }
          }).call(this);
        }).call(this, y("_process"), typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, { "../errors": 66, "./_stream_duplex": 67, "./internal/streams/async_iterator": 72, "./internal/streams/buffer_list": 73, "./internal/streams/destroy": 74, "./internal/streams/from": 76, "./internal/streams/state": 78, "./internal/streams/stream": 79, _process: 63, buffer: 32, events: 35, inherits: 46, "string_decoder/": 80, util: 29 }], 70: [function(y, H, s) {
        "use strict";
        H.exports = a;
        var w = y("../errors").codes, g = w.ERR_METHOD_NOT_IMPLEMENTED, T = w.ERR_MULTIPLE_CALLBACK, m = w.ERR_TRANSFORM_ALREADY_TRANSFORMING, d = w.ERR_TRANSFORM_WITH_LENGTH_0, i = y("./_stream_duplex");
        y("inherits")(a, i);
        function o(u, c) {
          var b = this._transformState;
          b.transforming = !1;
          var R = b.writecb;
          if (R === null)
            return this.emit("error", new T());
          b.writechunk = null, b.writecb = null, c != null && this.push(c), R(u);
          var S = this._readableState;
          S.reading = !1, (S.needReadable || S.length < S.highWaterMark) && this._read(S.highWaterMark);
        }
        function a(u) {
          if (!(this instanceof a)) return new a(u);
          i.call(this, u), this._transformState = {
            afterTransform: o.bind(this),
            needTransform: !1,
            transforming: !1,
            writecb: null,
            writechunk: null,
            writeencoding: null
          }, this._readableState.needReadable = !0, this._readableState.sync = !1, u && (typeof u.transform == "function" && (this._transform = u.transform), typeof u.flush == "function" && (this._flush = u.flush)), this.on("prefinish", f);
        }
        function f() {
          var u = this;
          typeof this._flush == "function" && !this._readableState.destroyed ? this._flush(function(c, b) {
            p(u, c, b);
          }) : p(this, null, null);
        }
        a.prototype.push = function(u, c) {
          return this._transformState.needTransform = !1, i.prototype.push.call(this, u, c);
        }, a.prototype._transform = function(u, c, b) {
          b(new g("_transform()"));
        }, a.prototype._write = function(u, c, b) {
          var R = this._transformState;
          if (R.writecb = b, R.writechunk = u, R.writeencoding = c, !R.transforming) {
            var S = this._readableState;
            (R.needTransform || S.needReadable || S.length < S.highWaterMark) && this._read(S.highWaterMark);
          }
        }, a.prototype._read = function(u) {
          var c = this._transformState;
          c.writechunk !== null && !c.transforming ? (c.transforming = !0, this._transform(c.writechunk, c.writeencoding, c.afterTransform)) : c.needTransform = !0;
        }, a.prototype._destroy = function(u, c) {
          i.prototype._destroy.call(this, u, function(b) {
            c(b);
          });
        };
        function p(u, c, b) {
          if (c) return u.emit("error", c);
          if (b != null && u.push(b), u._writableState.length) throw new d();
          if (u._transformState.transforming) throw new m();
          return u.push(null);
        }
      }, { "../errors": 66, "./_stream_duplex": 67, inherits: 46 }], 71: [function(y, H, s) {
        (function(w, g) {
          (function() {
            "use strict";
            H.exports = C;
            function T(U, j, ie) {
              this.chunk = U, this.encoding = j, this.callback = ie, this.next = null;
            }
            function m(U) {
              var j = this;
              this.next = null, this.entry = null, this.finish = function() {
                ye(j, U);
              };
            }
            var d;
            C.WritableState = re;
            var i = {
              deprecate: y("util-deprecate")
            }, o = y("./internal/streams/stream"), a = y("buffer").Buffer, f = g.Uint8Array || function() {
            };
            function p(U) {
              return a.from(U);
            }
            function u(U) {
              return a.isBuffer(U) || U instanceof f;
            }
            var c = y("./internal/streams/destroy"), b = y("./internal/streams/state"), R = b.getHighWaterMark, S = y("../errors").codes, O = S.ERR_INVALID_ARG_TYPE, L = S.ERR_METHOD_NOT_IMPLEMENTED, E = S.ERR_MULTIPLE_CALLBACK, F = S.ERR_STREAM_CANNOT_PIPE, I = S.ERR_STREAM_DESTROYED, M = S.ERR_STREAM_NULL_VALUES, N = S.ERR_STREAM_WRITE_AFTER_END, G = S.ERR_UNKNOWN_ENCODING, W = c.errorOrDestroy;
            y("inherits")(C, o);
            function Q() {
            }
            function re(U, j, ie) {
              d = d || y("./_stream_duplex"), U = U || {}, typeof ie != "boolean" && (ie = j instanceof d), this.objectMode = !!U.objectMode, ie && (this.objectMode = this.objectMode || !!U.writableObjectMode), this.highWaterMark = R(this, U, "writableHighWaterMark", ie), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
              var _e = U.decodeStrings === !1;
              this.decodeStrings = !_e, this.defaultEncoding = U.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(Te) {
                K(j, Te);
              }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.emitClose = U.emitClose !== !1, this.autoDestroy = !!U.autoDestroy, this.bufferedRequestCount = 0, this.corkedRequestsFree = new m(this);
            }
            re.prototype.getBuffer = function() {
              for (var j = this.bufferedRequest, ie = []; j; )
                ie.push(j), j = j.next;
              return ie;
            }, function() {
              try {
                Object.defineProperty(re.prototype, "buffer", {
                  get: i.deprecate(function() {
                    return this.getBuffer();
                  }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
                });
              } catch {
              }
            }();
            var ae;
            typeof Symbol == "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] == "function" ? (ae = Function.prototype[Symbol.hasInstance], Object.defineProperty(C, Symbol.hasInstance, {
              value: function(j) {
                return ae.call(this, j) ? !0 : this !== C ? !1 : j && j._writableState instanceof re;
              }
            })) : ae = function(j) {
              return j instanceof this;
            };
            function C(U) {
              d = d || y("./_stream_duplex");
              var j = this instanceof d;
              if (!j && !ae.call(C, this)) return new C(U);
              this._writableState = new re(U, this, j), this.writable = !0, U && (typeof U.write == "function" && (this._write = U.write), typeof U.writev == "function" && (this._writev = U.writev), typeof U.destroy == "function" && (this._destroy = U.destroy), typeof U.final == "function" && (this._final = U.final)), o.call(this);
            }
            C.prototype.pipe = function() {
              W(this, new F());
            };
            function h(U, j) {
              var ie = new N();
              W(U, ie), w.nextTick(j, ie);
            }
            function x(U, j, ie, _e) {
              var Te;
              return ie === null ? Te = new M() : typeof ie != "string" && !j.objectMode && (Te = new O("chunk", ["string", "Buffer"], ie)), Te ? (W(U, Te), w.nextTick(_e, Te), !1) : !0;
            }
            C.prototype.write = function(U, j, ie) {
              var _e = this._writableState, Te = !1, k = !_e.objectMode && u(U);
              return k && !a.isBuffer(U) && (U = p(U)), typeof j == "function" && (ie = j, j = null), k ? j = "buffer" : j || (j = _e.defaultEncoding), typeof ie != "function" && (ie = Q), _e.ending ? h(this, ie) : (k || x(this, _e, U, ie)) && (_e.pendingcb++, Te = oe(this, _e, k, U, j, ie)), Te;
            }, C.prototype.cork = function() {
              this._writableState.corked++;
            }, C.prototype.uncork = function() {
              var U = this._writableState;
              U.corked && (U.corked--, !U.writing && !U.corked && !U.bufferProcessing && U.bufferedRequest && z(this, U));
            }, C.prototype.setDefaultEncoding = function(j) {
              if (typeof j == "string" && (j = j.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((j + "").toLowerCase()) > -1)) throw new G(j);
              return this._writableState.defaultEncoding = j, this;
            }, Object.defineProperty(C.prototype, "writableBuffer", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._writableState && this._writableState.getBuffer();
              }
            });
            function V(U, j, ie) {
              return !U.objectMode && U.decodeStrings !== !1 && typeof j == "string" && (j = a.from(j, ie)), j;
            }
            Object.defineProperty(C.prototype, "writableHighWaterMark", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._writableState.highWaterMark;
              }
            });
            function oe(U, j, ie, _e, Te, k) {
              if (!ie) {
                var n = V(j, _e, Te);
                _e !== n && (ie = !0, Te = "buffer", _e = n);
              }
              var t = j.objectMode ? 1 : _e.length;
              j.length += t;
              var r = j.length < j.highWaterMark;
              if (r || (j.needDrain = !0), j.writing || j.corked) {
                var l = j.lastBufferedRequest;
                j.lastBufferedRequest = {
                  chunk: _e,
                  encoding: Te,
                  isBuf: ie,
                  callback: k,
                  next: null
                }, l ? l.next = j.lastBufferedRequest : j.bufferedRequest = j.lastBufferedRequest, j.bufferedRequestCount += 1;
              } else
                Ee(U, j, !1, t, _e, Te, k);
              return r;
            }
            function Ee(U, j, ie, _e, Te, k, n) {
              j.writelen = _e, j.writecb = n, j.writing = !0, j.sync = !0, j.destroyed ? j.onwrite(new I("write")) : ie ? U._writev(Te, j.onwrite) : U._write(Te, k, j.onwrite), j.sync = !1;
            }
            function he(U, j, ie, _e, Te) {
              --j.pendingcb, ie ? (w.nextTick(Te, _e), w.nextTick(de, U, j), U._writableState.errorEmitted = !0, W(U, _e)) : (Te(_e), U._writableState.errorEmitted = !0, W(U, _e), de(U, j));
            }
            function B(U) {
              U.writing = !1, U.writecb = null, U.length -= U.writelen, U.writelen = 0;
            }
            function K(U, j) {
              var ie = U._writableState, _e = ie.sync, Te = ie.writecb;
              if (typeof Te != "function") throw new E();
              if (B(ie), j) he(U, ie, _e, j, Te);
              else {
                var k = Y(ie) || U.destroyed;
                !k && !ie.corked && !ie.bufferProcessing && ie.bufferedRequest && z(U, ie), _e ? w.nextTick(q, U, ie, k, Te) : q(U, ie, k, Te);
              }
            }
            function q(U, j, ie, _e) {
              ie || ge(U, j), j.pendingcb--, _e(), de(U, j);
            }
            function ge(U, j) {
              j.length === 0 && j.needDrain && (j.needDrain = !1, U.emit("drain"));
            }
            function z(U, j) {
              j.bufferProcessing = !0;
              var ie = j.bufferedRequest;
              if (U._writev && ie && ie.next) {
                var _e = j.bufferedRequestCount, Te = new Array(_e), k = j.corkedRequestsFree;
                k.entry = ie;
                for (var n = 0, t = !0; ie; )
                  Te[n] = ie, ie.isBuf || (t = !1), ie = ie.next, n += 1;
                Te.allBuffers = t, Ee(U, j, !0, j.length, Te, "", k.finish), j.pendingcb++, j.lastBufferedRequest = null, k.next ? (j.corkedRequestsFree = k.next, k.next = null) : j.corkedRequestsFree = new m(j), j.bufferedRequestCount = 0;
              } else {
                for (; ie; ) {
                  var r = ie.chunk, l = ie.encoding, D = ie.callback, te = j.objectMode ? 1 : r.length;
                  if (Ee(U, j, !1, te, r, l, D), ie = ie.next, j.bufferedRequestCount--, j.writing)
                    break;
                }
                ie === null && (j.lastBufferedRequest = null);
              }
              j.bufferedRequest = ie, j.bufferProcessing = !1;
            }
            C.prototype._write = function(U, j, ie) {
              ie(new L("_write()"));
            }, C.prototype._writev = null, C.prototype.end = function(U, j, ie) {
              var _e = this._writableState;
              return typeof U == "function" ? (ie = U, U = null, j = null) : typeof j == "function" && (ie = j, j = null), U != null && this.write(U, j), _e.corked && (_e.corked = 1, this.uncork()), _e.ending || we(this, _e, ie), this;
            }, Object.defineProperty(C.prototype, "writableLength", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._writableState.length;
              }
            });
            function Y(U) {
              return U.ending && U.length === 0 && U.bufferedRequest === null && !U.finished && !U.writing;
            }
            function $(U, j) {
              U._final(function(ie) {
                j.pendingcb--, ie && W(U, ie), j.prefinished = !0, U.emit("prefinish"), de(U, j);
              });
            }
            function ce(U, j) {
              !j.prefinished && !j.finalCalled && (typeof U._final == "function" && !j.destroyed ? (j.pendingcb++, j.finalCalled = !0, w.nextTick($, U, j)) : (j.prefinished = !0, U.emit("prefinish")));
            }
            function de(U, j) {
              var ie = Y(j);
              if (ie && (ce(U, j), j.pendingcb === 0 && (j.finished = !0, U.emit("finish"), j.autoDestroy))) {
                var _e = U._readableState;
                (!_e || _e.autoDestroy && _e.endEmitted) && U.destroy();
              }
              return ie;
            }
            function we(U, j, ie) {
              j.ending = !0, de(U, j), ie && (j.finished ? w.nextTick(ie) : U.once("finish", ie)), j.ended = !0, U.writable = !1;
            }
            function ye(U, j, ie) {
              var _e = U.entry;
              for (U.entry = null; _e; ) {
                var Te = _e.callback;
                j.pendingcb--, Te(ie), _e = _e.next;
              }
              j.corkedRequestsFree.next = U;
            }
            Object.defineProperty(C.prototype, "destroyed", {
              // making it explicit this property is not enumerable
              // because otherwise some prototype manipulation in
              // userland will fail
              enumerable: !1,
              get: function() {
                return this._writableState === void 0 ? !1 : this._writableState.destroyed;
              },
              set: function(j) {
                this._writableState && (this._writableState.destroyed = j);
              }
            }), C.prototype.destroy = c.destroy, C.prototype._undestroy = c.undestroy, C.prototype._destroy = function(U, j) {
              j(U);
            };
          }).call(this);
        }).call(this, y("_process"), typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, { "../errors": 66, "./_stream_duplex": 67, "./internal/streams/destroy": 74, "./internal/streams/state": 78, "./internal/streams/stream": 79, _process: 63, buffer: 32, inherits: 46, "util-deprecate": 81 }], 72: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            var g;
            function T(F, I, M) {
              return I in F ? Object.defineProperty(F, I, { value: M, enumerable: !0, configurable: !0, writable: !0 }) : F[I] = M, F;
            }
            var m = y("./end-of-stream"), d = Symbol("lastResolve"), i = Symbol("lastReject"), o = Symbol("error"), a = Symbol("ended"), f = Symbol("lastPromise"), p = Symbol("handlePromise"), u = Symbol("stream");
            function c(F, I) {
              return {
                value: F,
                done: I
              };
            }
            function b(F) {
              var I = F[d];
              if (I !== null) {
                var M = F[u].read();
                M !== null && (F[f] = null, F[d] = null, F[i] = null, I(c(M, !1)));
              }
            }
            function R(F) {
              w.nextTick(b, F);
            }
            function S(F, I) {
              return function(M, N) {
                F.then(function() {
                  if (I[a]) {
                    M(c(void 0, !0));
                    return;
                  }
                  I[p](M, N);
                }, N);
              };
            }
            var O = Object.getPrototypeOf(function() {
            }), L = Object.setPrototypeOf((g = {
              get stream() {
                return this[u];
              },
              next: function() {
                var I = this, M = this[o];
                if (M !== null)
                  return Promise.reject(M);
                if (this[a])
                  return Promise.resolve(c(void 0, !0));
                if (this[u].destroyed)
                  return new Promise(function(Q, re) {
                    w.nextTick(function() {
                      I[o] ? re(I[o]) : Q(c(void 0, !0));
                    });
                  });
                var N = this[f], G;
                if (N)
                  G = new Promise(S(N, this));
                else {
                  var W = this[u].read();
                  if (W !== null)
                    return Promise.resolve(c(W, !1));
                  G = new Promise(this[p]);
                }
                return this[f] = G, G;
              }
            }, T(g, Symbol.asyncIterator, function() {
              return this;
            }), T(g, "return", function() {
              var I = this;
              return new Promise(function(M, N) {
                I[u].destroy(null, function(G) {
                  if (G) {
                    N(G);
                    return;
                  }
                  M(c(void 0, !0));
                });
              });
            }), g), O), E = function(I) {
              var M, N = Object.create(L, (M = {}, T(M, u, {
                value: I,
                writable: !0
              }), T(M, d, {
                value: null,
                writable: !0
              }), T(M, i, {
                value: null,
                writable: !0
              }), T(M, o, {
                value: null,
                writable: !0
              }), T(M, a, {
                value: I._readableState.endEmitted,
                writable: !0
              }), T(M, p, {
                value: function(W, Q) {
                  var re = N[u].read();
                  re ? (N[f] = null, N[d] = null, N[i] = null, W(c(re, !1))) : (N[d] = W, N[i] = Q);
                },
                writable: !0
              }), M));
              return N[f] = null, m(I, function(G) {
                if (G && G.code !== "ERR_STREAM_PREMATURE_CLOSE") {
                  var W = N[i];
                  W !== null && (N[f] = null, N[d] = null, N[i] = null, W(G)), N[o] = G;
                  return;
                }
                var Q = N[d];
                Q !== null && (N[f] = null, N[d] = null, N[i] = null, Q(c(void 0, !0))), N[a] = !0;
              }), I.on("readable", R.bind(null, N)), N;
            };
            H.exports = E;
          }).call(this);
        }).call(this, y("_process"));
      }, { "./end-of-stream": 75, _process: 63 }], 73: [function(y, H, s) {
        "use strict";
        function w(b, R) {
          var S = Object.keys(b);
          if (Object.getOwnPropertySymbols) {
            var O = Object.getOwnPropertySymbols(b);
            R && (O = O.filter(function(L) {
              return Object.getOwnPropertyDescriptor(b, L).enumerable;
            })), S.push.apply(S, O);
          }
          return S;
        }
        function g(b) {
          for (var R = 1; R < arguments.length; R++) {
            var S = arguments[R] != null ? arguments[R] : {};
            R % 2 ? w(Object(S), !0).forEach(function(O) {
              T(b, O, S[O]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(b, Object.getOwnPropertyDescriptors(S)) : w(Object(S)).forEach(function(O) {
              Object.defineProperty(b, O, Object.getOwnPropertyDescriptor(S, O));
            });
          }
          return b;
        }
        function T(b, R, S) {
          return R in b ? Object.defineProperty(b, R, { value: S, enumerable: !0, configurable: !0, writable: !0 }) : b[R] = S, b;
        }
        function m(b, R) {
          if (!(b instanceof R))
            throw new TypeError("Cannot call a class as a function");
        }
        function d(b, R) {
          for (var S = 0; S < R.length; S++) {
            var O = R[S];
            O.enumerable = O.enumerable || !1, O.configurable = !0, "value" in O && (O.writable = !0), Object.defineProperty(b, O.key, O);
          }
        }
        function i(b, R, S) {
          return R && d(b.prototype, R), S && d(b, S), b;
        }
        var o = y("buffer"), a = o.Buffer, f = y("util"), p = f.inspect, u = p && p.custom || "inspect";
        function c(b, R, S) {
          a.prototype.copy.call(b, R, S);
        }
        H.exports = /* @__PURE__ */ function() {
          function b() {
            m(this, b), this.head = null, this.tail = null, this.length = 0;
          }
          return i(b, [{
            key: "push",
            value: function(S) {
              var O = {
                data: S,
                next: null
              };
              this.length > 0 ? this.tail.next = O : this.head = O, this.tail = O, ++this.length;
            }
          }, {
            key: "unshift",
            value: function(S) {
              var O = {
                data: S,
                next: this.head
              };
              this.length === 0 && (this.tail = O), this.head = O, ++this.length;
            }
          }, {
            key: "shift",
            value: function() {
              if (this.length !== 0) {
                var S = this.head.data;
                return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, S;
              }
            }
          }, {
            key: "clear",
            value: function() {
              this.head = this.tail = null, this.length = 0;
            }
          }, {
            key: "join",
            value: function(S) {
              if (this.length === 0) return "";
              for (var O = this.head, L = "" + O.data; O = O.next; )
                L += S + O.data;
              return L;
            }
          }, {
            key: "concat",
            value: function(S) {
              if (this.length === 0) return a.alloc(0);
              for (var O = a.allocUnsafe(S >>> 0), L = this.head, E = 0; L; )
                c(L.data, O, E), E += L.data.length, L = L.next;
              return O;
            }
            // Consumes a specified amount of bytes or characters from the buffered data.
          }, {
            key: "consume",
            value: function(S, O) {
              var L;
              return S < this.head.data.length ? (L = this.head.data.slice(0, S), this.head.data = this.head.data.slice(S)) : S === this.head.data.length ? L = this.shift() : L = O ? this._getString(S) : this._getBuffer(S), L;
            }
          }, {
            key: "first",
            value: function() {
              return this.head.data;
            }
            // Consumes a specified amount of characters from the buffered data.
          }, {
            key: "_getString",
            value: function(S) {
              var O = this.head, L = 1, E = O.data;
              for (S -= E.length; O = O.next; ) {
                var F = O.data, I = S > F.length ? F.length : S;
                if (I === F.length ? E += F : E += F.slice(0, S), S -= I, S === 0) {
                  I === F.length ? (++L, O.next ? this.head = O.next : this.head = this.tail = null) : (this.head = O, O.data = F.slice(I));
                  break;
                }
                ++L;
              }
              return this.length -= L, E;
            }
            // Consumes a specified amount of bytes from the buffered data.
          }, {
            key: "_getBuffer",
            value: function(S) {
              var O = a.allocUnsafe(S), L = this.head, E = 1;
              for (L.data.copy(O), S -= L.data.length; L = L.next; ) {
                var F = L.data, I = S > F.length ? F.length : S;
                if (F.copy(O, O.length - S, 0, I), S -= I, S === 0) {
                  I === F.length ? (++E, L.next ? this.head = L.next : this.head = this.tail = null) : (this.head = L, L.data = F.slice(I));
                  break;
                }
                ++E;
              }
              return this.length -= E, O;
            }
            // Make sure the linked list only shows the minimal necessary information.
          }, {
            key: u,
            value: function(S, O) {
              return p(this, g({}, O, {
                // Only inspect one level.
                depth: 0,
                // It should not recurse.
                customInspect: !1
              }));
            }
          }]), b;
        }();
      }, { buffer: 32, util: 29 }], 74: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            function g(a, f) {
              var p = this, u = this._readableState && this._readableState.destroyed, c = this._writableState && this._writableState.destroyed;
              return u || c ? (f ? f(a) : a && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, w.nextTick(i, this, a)) : w.nextTick(i, this, a)), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(a || null, function(b) {
                !f && b ? p._writableState ? p._writableState.errorEmitted ? w.nextTick(m, p) : (p._writableState.errorEmitted = !0, w.nextTick(T, p, b)) : w.nextTick(T, p, b) : f ? (w.nextTick(m, p), f(b)) : w.nextTick(m, p);
              }), this);
            }
            function T(a, f) {
              i(a, f), m(a);
            }
            function m(a) {
              a._writableState && !a._writableState.emitClose || a._readableState && !a._readableState.emitClose || a.emit("close");
            }
            function d() {
              this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
            }
            function i(a, f) {
              a.emit("error", f);
            }
            function o(a, f) {
              var p = a._readableState, u = a._writableState;
              p && p.autoDestroy || u && u.autoDestroy ? a.destroy(f) : a.emit("error", f);
            }
            H.exports = {
              destroy: g,
              undestroy: d,
              errorOrDestroy: o
            };
          }).call(this);
        }).call(this, y("_process"));
      }, { _process: 63 }], 75: [function(y, H, s) {
        "use strict";
        var w = y("../../../errors").codes.ERR_STREAM_PREMATURE_CLOSE;
        function g(i) {
          var o = !1;
          return function() {
            if (!o) {
              o = !0;
              for (var a = arguments.length, f = new Array(a), p = 0; p < a; p++)
                f[p] = arguments[p];
              i.apply(this, f);
            }
          };
        }
        function T() {
        }
        function m(i) {
          return i.setHeader && typeof i.abort == "function";
        }
        function d(i, o, a) {
          if (typeof o == "function") return d(i, null, o);
          o || (o = {}), a = g(a || T);
          var f = o.readable || o.readable !== !1 && i.readable, p = o.writable || o.writable !== !1 && i.writable, u = function() {
            i.writable || b();
          }, c = i._writableState && i._writableState.finished, b = function() {
            p = !1, c = !0, f || a.call(i);
          }, R = i._readableState && i._readableState.endEmitted, S = function() {
            f = !1, R = !0, p || a.call(i);
          }, O = function(I) {
            a.call(i, I);
          }, L = function() {
            var I;
            if (f && !R)
              return (!i._readableState || !i._readableState.ended) && (I = new w()), a.call(i, I);
            if (p && !c)
              return (!i._writableState || !i._writableState.ended) && (I = new w()), a.call(i, I);
          }, E = function() {
            i.req.on("finish", b);
          };
          return m(i) ? (i.on("complete", b), i.on("abort", L), i.req ? E() : i.on("request", E)) : p && !i._writableState && (i.on("end", u), i.on("close", u)), i.on("end", S), i.on("finish", b), o.error !== !1 && i.on("error", O), i.on("close", L), function() {
            i.removeListener("complete", b), i.removeListener("abort", L), i.removeListener("request", E), i.req && i.req.removeListener("finish", b), i.removeListener("end", u), i.removeListener("close", u), i.removeListener("finish", b), i.removeListener("end", S), i.removeListener("error", O), i.removeListener("close", L);
          };
        }
        H.exports = d;
      }, { "../../../errors": 66 }], 76: [function(y, H, s) {
        H.exports = function() {
          throw new Error("Readable.from is not available in the browser");
        };
      }, {}], 77: [function(y, H, s) {
        "use strict";
        var w;
        function g(b) {
          var R = !1;
          return function() {
            R || (R = !0, b.apply(void 0, arguments));
          };
        }
        var T = y("../../../errors").codes, m = T.ERR_MISSING_ARGS, d = T.ERR_STREAM_DESTROYED;
        function i(b) {
          if (b) throw b;
        }
        function o(b) {
          return b.setHeader && typeof b.abort == "function";
        }
        function a(b, R, S, O) {
          O = g(O);
          var L = !1;
          b.on("close", function() {
            L = !0;
          }), w === void 0 && (w = y("./end-of-stream")), w(b, {
            readable: R,
            writable: S
          }, function(F) {
            if (F) return O(F);
            L = !0, O();
          });
          var E = !1;
          return function(F) {
            if (!L && !E) {
              if (E = !0, o(b)) return b.abort();
              if (typeof b.destroy == "function") return b.destroy();
              O(F || new d("pipe"));
            }
          };
        }
        function f(b) {
          b();
        }
        function p(b, R) {
          return b.pipe(R);
        }
        function u(b) {
          return !b.length || typeof b[b.length - 1] != "function" ? i : b.pop();
        }
        function c() {
          for (var b = arguments.length, R = new Array(b), S = 0; S < b; S++)
            R[S] = arguments[S];
          var O = u(R);
          if (Array.isArray(R[0]) && (R = R[0]), R.length < 2)
            throw new m("streams");
          var L, E = R.map(function(F, I) {
            var M = I < R.length - 1, N = I > 0;
            return a(F, M, N, function(G) {
              L || (L = G), G && E.forEach(f), !M && (E.forEach(f), O(L));
            });
          });
          return R.reduce(p);
        }
        H.exports = c;
      }, { "../../../errors": 66, "./end-of-stream": 75 }], 78: [function(y, H, s) {
        "use strict";
        var w = y("../../../errors").codes.ERR_INVALID_OPT_VALUE;
        function g(m, d, i) {
          return m.highWaterMark != null ? m.highWaterMark : d ? m[i] : null;
        }
        function T(m, d, i, o) {
          var a = g(d, o, i);
          if (a != null) {
            if (!(isFinite(a) && Math.floor(a) === a) || a < 0) {
              var f = o ? i : "highWaterMark";
              throw new w(f, a);
            }
            return Math.floor(a);
          }
          return m.objectMode ? 16 : 16 * 1024;
        }
        H.exports = {
          getHighWaterMark: T
        };
      }, { "../../../errors": 66 }], 79: [function(y, H, s) {
        H.exports = y("events").EventEmitter;
      }, { events: 35 }], 80: [function(y, H, s) {
        "use strict";
        var w = y("safe-buffer").Buffer, g = w.isEncoding || function(E) {
          switch (E = "" + E, E && E.toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
            case "raw":
              return !0;
            default:
              return !1;
          }
        };
        function T(E) {
          if (!E) return "utf8";
          for (var F; ; )
            switch (E) {
              case "utf8":
              case "utf-8":
                return "utf8";
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return "utf16le";
              case "latin1":
              case "binary":
                return "latin1";
              case "base64":
              case "ascii":
              case "hex":
                return E;
              default:
                if (F) return;
                E = ("" + E).toLowerCase(), F = !0;
            }
        }
        function m(E) {
          var F = T(E);
          if (typeof F != "string" && (w.isEncoding === g || !g(E))) throw new Error("Unknown encoding: " + E);
          return F || E;
        }
        s.StringDecoder = d;
        function d(E) {
          this.encoding = m(E);
          var F;
          switch (this.encoding) {
            case "utf16le":
              this.text = c, this.end = b, F = 4;
              break;
            case "utf8":
              this.fillLast = f, F = 4;
              break;
            case "base64":
              this.text = R, this.end = S, F = 3;
              break;
            default:
              this.write = O, this.end = L;
              return;
          }
          this.lastNeed = 0, this.lastTotal = 0, this.lastChar = w.allocUnsafe(F);
        }
        d.prototype.write = function(E) {
          if (E.length === 0) return "";
          var F, I;
          if (this.lastNeed) {
            if (F = this.fillLast(E), F === void 0) return "";
            I = this.lastNeed, this.lastNeed = 0;
          } else
            I = 0;
          return I < E.length ? F ? F + this.text(E, I) : this.text(E, I) : F || "";
        }, d.prototype.end = u, d.prototype.text = p, d.prototype.fillLast = function(E) {
          if (this.lastNeed <= E.length)
            return E.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
          E.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, E.length), this.lastNeed -= E.length;
        };
        function i(E) {
          return E <= 127 ? 0 : E >> 5 === 6 ? 2 : E >> 4 === 14 ? 3 : E >> 3 === 30 ? 4 : E >> 6 === 2 ? -1 : -2;
        }
        function o(E, F, I) {
          var M = F.length - 1;
          if (M < I) return 0;
          var N = i(F[M]);
          return N >= 0 ? (N > 0 && (E.lastNeed = N - 1), N) : --M < I || N === -2 ? 0 : (N = i(F[M]), N >= 0 ? (N > 0 && (E.lastNeed = N - 2), N) : --M < I || N === -2 ? 0 : (N = i(F[M]), N >= 0 ? (N > 0 && (N === 2 ? N = 0 : E.lastNeed = N - 3), N) : 0));
        }
        function a(E, F, I) {
          if ((F[0] & 192) !== 128)
            return E.lastNeed = 0, "\uFFFD";
          if (E.lastNeed > 1 && F.length > 1) {
            if ((F[1] & 192) !== 128)
              return E.lastNeed = 1, "\uFFFD";
            if (E.lastNeed > 2 && F.length > 2 && (F[2] & 192) !== 128)
              return E.lastNeed = 2, "\uFFFD";
          }
        }
        function f(E) {
          var F = this.lastTotal - this.lastNeed, I = a(this, E, F);
          if (I !== void 0) return I;
          if (this.lastNeed <= E.length)
            return E.copy(this.lastChar, F, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
          E.copy(this.lastChar, F, 0, E.length), this.lastNeed -= E.length;
        }
        function p(E, F) {
          var I = o(this, E, F);
          if (!this.lastNeed) return E.toString("utf8", F);
          this.lastTotal = I;
          var M = E.length - (I - this.lastNeed);
          return E.copy(this.lastChar, 0, M), E.toString("utf8", F, M);
        }
        function u(E) {
          var F = E && E.length ? this.write(E) : "";
          return this.lastNeed ? F + "\uFFFD" : F;
        }
        function c(E, F) {
          if ((E.length - F) % 2 === 0) {
            var I = E.toString("utf16le", F);
            if (I) {
              var M = I.charCodeAt(I.length - 1);
              if (M >= 55296 && M <= 56319)
                return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = E[E.length - 2], this.lastChar[1] = E[E.length - 1], I.slice(0, -1);
            }
            return I;
          }
          return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = E[E.length - 1], E.toString("utf16le", F, E.length - 1);
        }
        function b(E) {
          var F = E && E.length ? this.write(E) : "";
          if (this.lastNeed) {
            var I = this.lastTotal - this.lastNeed;
            return F + this.lastChar.toString("utf16le", 0, I);
          }
          return F;
        }
        function R(E, F) {
          var I = (E.length - F) % 3;
          return I === 0 ? E.toString("base64", F) : (this.lastNeed = 3 - I, this.lastTotal = 3, I === 1 ? this.lastChar[0] = E[E.length - 1] : (this.lastChar[0] = E[E.length - 2], this.lastChar[1] = E[E.length - 1]), E.toString("base64", F, E.length - I));
        }
        function S(E) {
          var F = E && E.length ? this.write(E) : "";
          return this.lastNeed ? F + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : F;
        }
        function O(E) {
          return E.toString(this.encoding);
        }
        function L(E) {
          return E && E.length ? this.write(E) : "";
        }
      }, { "safe-buffer": 64 }], 81: [function(y, H, s) {
        (function(w) {
          (function() {
            H.exports = g;
            function g(m, d) {
              if (T("noDeprecation"))
                return m;
              var i = !1;
              function o() {
                if (!i) {
                  if (T("throwDeprecation"))
                    throw new Error(d);
                  T("traceDeprecation") ? console.trace(d) : console.warn(d), i = !0;
                }
                return m.apply(this, arguments);
              }
              return o;
            }
            function T(m) {
              try {
                if (!w.localStorage) return !1;
              } catch {
                return !1;
              }
              var d = w.localStorage[m];
              return d == null ? !1 : String(d).toLowerCase() === "true";
            }
          }).call(this);
        }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, {}], 82: [function(y, H, s) {
        arguments[4][25][0].apply(s, arguments);
      }, { dup: 25 }], 83: [function(y, H, s) {
        "use strict";
        var w = y("is-arguments"), g = y("is-generator-function"), T = y("which-typed-array"), m = y("is-typed-array");
        function d(l) {
          return l.call.bind(l);
        }
        var i = typeof BigInt < "u", o = typeof Symbol < "u", a = d(Object.prototype.toString), f = d(Number.prototype.valueOf), p = d(String.prototype.valueOf), u = d(Boolean.prototype.valueOf);
        if (i)
          var c = d(BigInt.prototype.valueOf);
        if (o)
          var b = d(Symbol.prototype.valueOf);
        function R(l, D) {
          if (typeof l != "object")
            return !1;
          try {
            return D(l), !0;
          } catch {
            return !1;
          }
        }
        s.isArgumentsObject = w, s.isGeneratorFunction = g, s.isTypedArray = m;
        function S(l) {
          return typeof Promise < "u" && l instanceof Promise || l !== null && typeof l == "object" && typeof l.then == "function" && typeof l.catch == "function";
        }
        s.isPromise = S;
        function O(l) {
          return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? ArrayBuffer.isView(l) : m(l) || z(l);
        }
        s.isArrayBufferView = O;
        function L(l) {
          return T(l) === "Uint8Array";
        }
        s.isUint8Array = L;
        function E(l) {
          return T(l) === "Uint8ClampedArray";
        }
        s.isUint8ClampedArray = E;
        function F(l) {
          return T(l) === "Uint16Array";
        }
        s.isUint16Array = F;
        function I(l) {
          return T(l) === "Uint32Array";
        }
        s.isUint32Array = I;
        function M(l) {
          return T(l) === "Int8Array";
        }
        s.isInt8Array = M;
        function N(l) {
          return T(l) === "Int16Array";
        }
        s.isInt16Array = N;
        function G(l) {
          return T(l) === "Int32Array";
        }
        s.isInt32Array = G;
        function W(l) {
          return T(l) === "Float32Array";
        }
        s.isFloat32Array = W;
        function Q(l) {
          return T(l) === "Float64Array";
        }
        s.isFloat64Array = Q;
        function re(l) {
          return T(l) === "BigInt64Array";
        }
        s.isBigInt64Array = re;
        function ae(l) {
          return T(l) === "BigUint64Array";
        }
        s.isBigUint64Array = ae;
        function C(l) {
          return a(l) === "[object Map]";
        }
        C.working = typeof Map < "u" && C(/* @__PURE__ */ new Map());
        function h(l) {
          return typeof Map > "u" ? !1 : C.working ? C(l) : l instanceof Map;
        }
        s.isMap = h;
        function x(l) {
          return a(l) === "[object Set]";
        }
        x.working = typeof Set < "u" && x(/* @__PURE__ */ new Set());
        function V(l) {
          return typeof Set > "u" ? !1 : x.working ? x(l) : l instanceof Set;
        }
        s.isSet = V;
        function oe(l) {
          return a(l) === "[object WeakMap]";
        }
        oe.working = typeof WeakMap < "u" && oe(/* @__PURE__ */ new WeakMap());
        function Ee(l) {
          return typeof WeakMap > "u" ? !1 : oe.working ? oe(l) : l instanceof WeakMap;
        }
        s.isWeakMap = Ee;
        function he(l) {
          return a(l) === "[object WeakSet]";
        }
        he.working = typeof WeakSet < "u" && he(/* @__PURE__ */ new WeakSet());
        function B(l) {
          return he(l);
        }
        s.isWeakSet = B;
        function K(l) {
          return a(l) === "[object ArrayBuffer]";
        }
        K.working = typeof ArrayBuffer < "u" && K(new ArrayBuffer());
        function q(l) {
          return typeof ArrayBuffer > "u" ? !1 : K.working ? K(l) : l instanceof ArrayBuffer;
        }
        s.isArrayBuffer = q;
        function ge(l) {
          return a(l) === "[object DataView]";
        }
        ge.working = typeof ArrayBuffer < "u" && typeof DataView < "u" && ge(new DataView(new ArrayBuffer(1), 0, 1));
        function z(l) {
          return typeof DataView > "u" ? !1 : ge.working ? ge(l) : l instanceof DataView;
        }
        s.isDataView = z;
        var Y = typeof SharedArrayBuffer < "u" ? SharedArrayBuffer : void 0;
        function $(l) {
          return a(l) === "[object SharedArrayBuffer]";
        }
        function ce(l) {
          return typeof Y > "u" ? !1 : (typeof $.working > "u" && ($.working = $(new Y())), $.working ? $(l) : l instanceof Y);
        }
        s.isSharedArrayBuffer = ce;
        function de(l) {
          return a(l) === "[object AsyncFunction]";
        }
        s.isAsyncFunction = de;
        function we(l) {
          return a(l) === "[object Map Iterator]";
        }
        s.isMapIterator = we;
        function ye(l) {
          return a(l) === "[object Set Iterator]";
        }
        s.isSetIterator = ye;
        function U(l) {
          return a(l) === "[object Generator]";
        }
        s.isGeneratorObject = U;
        function j(l) {
          return a(l) === "[object WebAssembly.Module]";
        }
        s.isWebAssemblyCompiledModule = j;
        function ie(l) {
          return R(l, f);
        }
        s.isNumberObject = ie;
        function _e(l) {
          return R(l, p);
        }
        s.isStringObject = _e;
        function Te(l) {
          return R(l, u);
        }
        s.isBooleanObject = Te;
        function k(l) {
          return i && R(l, c);
        }
        s.isBigIntObject = k;
        function n(l) {
          return o && R(l, b);
        }
        s.isSymbolObject = n;
        function t(l) {
          return ie(l) || _e(l) || Te(l) || k(l) || n(l);
        }
        s.isBoxedPrimitive = t;
        function r(l) {
          return typeof Uint8Array < "u" && (q(l) || ce(l));
        }
        s.isAnyArrayBuffer = r, ["isProxy", "isExternal", "isModuleNamespaceObject"].forEach(function(l) {
          Object.defineProperty(s, l, {
            enumerable: !1,
            value: function() {
              throw new Error(l + " is not supported in userland");
            }
          });
        });
      }, { "is-arguments": 47, "is-generator-function": 49, "is-typed-array": 50, "which-typed-array": 85 }], 84: [function(y, H, s) {
        (function(w) {
          (function() {
            var g = Object.getOwnPropertyDescriptors || function(Y) {
              for (var $ = Object.keys(Y), ce = {}, de = 0; de < $.length; de++)
                ce[$[de]] = Object.getOwnPropertyDescriptor(Y, $[de]);
              return ce;
            }, T = /%[sdj%]/g;
            s.format = function(z) {
              if (!N(z)) {
                for (var Y = [], $ = 0; $ < arguments.length; $++)
                  Y.push(o(arguments[$]));
                return Y.join(" ");
              }
              for (var $ = 1, ce = arguments, de = ce.length, we = String(z).replace(T, function(U) {
                if (U === "%%") return "%";
                if ($ >= de) return U;
                switch (U) {
                  case "%s":
                    return String(ce[$++]);
                  case "%d":
                    return Number(ce[$++]);
                  case "%j":
                    try {
                      return JSON.stringify(ce[$++]);
                    } catch {
                      return "[Circular]";
                    }
                  default:
                    return U;
                }
              }), ye = ce[$]; $ < de; ye = ce[++$])
                F(ye) || !re(ye) ? we += " " + ye : we += " " + o(ye);
              return we;
            }, s.deprecate = function(z, Y) {
              if (typeof w < "u" && w.noDeprecation === !0)
                return z;
              if (typeof w > "u")
                return function() {
                  return s.deprecate(z, Y).apply(this, arguments);
                };
              var $ = !1;
              function ce() {
                if (!$) {
                  if (w.throwDeprecation)
                    throw new Error(Y);
                  w.traceDeprecation ? console.trace(Y) : console.error(Y), $ = !0;
                }
                return z.apply(this, arguments);
              }
              return ce;
            };
            var m = {}, d = /^$/;
            if (w.env.NODE_DEBUG) {
              var i = w.env.NODE_DEBUG;
              i = i.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/,/g, "$|^").toUpperCase(), d = new RegExp("^" + i + "$", "i");
            }
            s.debuglog = function(z) {
              if (z = z.toUpperCase(), !m[z])
                if (d.test(z)) {
                  var Y = w.pid;
                  m[z] = function() {
                    var $ = s.format.apply(s, arguments);
                    console.error("%s %d: %s", z, Y, $);
                  };
                } else
                  m[z] = function() {
                  };
              return m[z];
            };
            function o(z, Y) {
              var $ = {
                seen: [],
                stylize: f
              };
              return arguments.length >= 3 && ($.depth = arguments[2]), arguments.length >= 4 && ($.colors = arguments[3]), E(Y) ? $.showHidden = Y : Y && s._extend($, Y), W($.showHidden) && ($.showHidden = !1), W($.depth) && ($.depth = 2), W($.colors) && ($.colors = !1), W($.customInspect) && ($.customInspect = !0), $.colors && ($.stylize = a), u($, z, $.depth);
            }
            s.inspect = o, o.colors = {
              bold: [1, 22],
              italic: [3, 23],
              underline: [4, 24],
              inverse: [7, 27],
              white: [37, 39],
              grey: [90, 39],
              black: [30, 39],
              blue: [34, 39],
              cyan: [36, 39],
              green: [32, 39],
              magenta: [35, 39],
              red: [31, 39],
              yellow: [33, 39]
            }, o.styles = {
              special: "cyan",
              number: "yellow",
              boolean: "yellow",
              undefined: "grey",
              null: "bold",
              string: "green",
              date: "magenta",
              // "name": intentionally not styling
              regexp: "red"
            };
            function a(z, Y) {
              var $ = o.styles[Y];
              return $ ? "\x1B[" + o.colors[$][0] + "m" + z + "\x1B[" + o.colors[$][1] + "m" : z;
            }
            function f(z, Y) {
              return z;
            }
            function p(z) {
              var Y = {};
              return z.forEach(function($, ce) {
                Y[$] = !0;
              }), Y;
            }
            function u(z, Y, $) {
              if (z.customInspect && Y && h(Y.inspect) && // Filter out the util module, it's inspect function is special
              Y.inspect !== s.inspect && // Also filter out any prototype objects using the circular check.
              !(Y.constructor && Y.constructor.prototype === Y)) {
                var ce = Y.inspect($, z);
                return N(ce) || (ce = u(z, ce, $)), ce;
              }
              var de = c(z, Y);
              if (de)
                return de;
              var we = Object.keys(Y), ye = p(we);
              if (z.showHidden && (we = Object.getOwnPropertyNames(Y)), C(Y) && (we.indexOf("message") >= 0 || we.indexOf("description") >= 0))
                return b(Y);
              if (we.length === 0) {
                if (h(Y)) {
                  var U = Y.name ? ": " + Y.name : "";
                  return z.stylize("[Function" + U + "]", "special");
                }
                if (Q(Y))
                  return z.stylize(RegExp.prototype.toString.call(Y), "regexp");
                if (ae(Y))
                  return z.stylize(Date.prototype.toString.call(Y), "date");
                if (C(Y))
                  return b(Y);
              }
              var j = "", ie = !1, _e = ["{", "}"];
              if (L(Y) && (ie = !0, _e = ["[", "]"]), h(Y)) {
                var Te = Y.name ? ": " + Y.name : "";
                j = " [Function" + Te + "]";
              }
              if (Q(Y) && (j = " " + RegExp.prototype.toString.call(Y)), ae(Y) && (j = " " + Date.prototype.toUTCString.call(Y)), C(Y) && (j = " " + b(Y)), we.length === 0 && (!ie || Y.length == 0))
                return _e[0] + j + _e[1];
              if ($ < 0)
                return Q(Y) ? z.stylize(RegExp.prototype.toString.call(Y), "regexp") : z.stylize("[Object]", "special");
              z.seen.push(Y);
              var k;
              return ie ? k = R(z, Y, $, ye, we) : k = we.map(function(n) {
                return S(z, Y, $, ye, n, ie);
              }), z.seen.pop(), O(k, j, _e);
            }
            function c(z, Y) {
              if (W(Y))
                return z.stylize("undefined", "undefined");
              if (N(Y)) {
                var $ = "'" + JSON.stringify(Y).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                return z.stylize($, "string");
              }
              if (M(Y))
                return z.stylize("" + Y, "number");
              if (E(Y))
                return z.stylize("" + Y, "boolean");
              if (F(Y))
                return z.stylize("null", "null");
            }
            function b(z) {
              return "[" + Error.prototype.toString.call(z) + "]";
            }
            function R(z, Y, $, ce, de) {
              for (var we = [], ye = 0, U = Y.length; ye < U; ++ye)
                B(Y, String(ye)) ? we.push(S(
                  z,
                  Y,
                  $,
                  ce,
                  String(ye),
                  !0
                )) : we.push("");
              return de.forEach(function(j) {
                j.match(/^\d+$/) || we.push(S(
                  z,
                  Y,
                  $,
                  ce,
                  j,
                  !0
                ));
              }), we;
            }
            function S(z, Y, $, ce, de, we) {
              var ye, U, j;
              if (j = Object.getOwnPropertyDescriptor(Y, de) || { value: Y[de] }, j.get ? j.set ? U = z.stylize("[Getter/Setter]", "special") : U = z.stylize("[Getter]", "special") : j.set && (U = z.stylize("[Setter]", "special")), B(ce, de) || (ye = "[" + de + "]"), U || (z.seen.indexOf(j.value) < 0 ? (F($) ? U = u(z, j.value, null) : U = u(z, j.value, $ - 1), U.indexOf(`
`) > -1 && (we ? U = U.split(`
`).map(function(ie) {
                return "  " + ie;
              }).join(`
`).slice(2) : U = `
` + U.split(`
`).map(function(ie) {
                return "   " + ie;
              }).join(`
`))) : U = z.stylize("[Circular]", "special")), W(ye)) {
                if (we && de.match(/^\d+$/))
                  return U;
                ye = JSON.stringify("" + de), ye.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (ye = ye.slice(1, -1), ye = z.stylize(ye, "name")) : (ye = ye.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), ye = z.stylize(ye, "string"));
              }
              return ye + ": " + U;
            }
            function O(z, Y, $) {
              var ce = 0, de = z.reduce(function(we, ye) {
                return ce++, ye.indexOf(`
`) >= 0 && ce++, we + ye.replace(/\u001b\[\d\d?m/g, "").length + 1;
              }, 0);
              return de > 60 ? $[0] + (Y === "" ? "" : Y + `
 `) + " " + z.join(`,
  `) + " " + $[1] : $[0] + Y + " " + z.join(", ") + " " + $[1];
            }
            s.types = y("./support/types");
            function L(z) {
              return Array.isArray(z);
            }
            s.isArray = L;
            function E(z) {
              return typeof z == "boolean";
            }
            s.isBoolean = E;
            function F(z) {
              return z === null;
            }
            s.isNull = F;
            function I(z) {
              return z == null;
            }
            s.isNullOrUndefined = I;
            function M(z) {
              return typeof z == "number";
            }
            s.isNumber = M;
            function N(z) {
              return typeof z == "string";
            }
            s.isString = N;
            function G(z) {
              return typeof z == "symbol";
            }
            s.isSymbol = G;
            function W(z) {
              return z === void 0;
            }
            s.isUndefined = W;
            function Q(z) {
              return re(z) && V(z) === "[object RegExp]";
            }
            s.isRegExp = Q, s.types.isRegExp = Q;
            function re(z) {
              return typeof z == "object" && z !== null;
            }
            s.isObject = re;
            function ae(z) {
              return re(z) && V(z) === "[object Date]";
            }
            s.isDate = ae, s.types.isDate = ae;
            function C(z) {
              return re(z) && (V(z) === "[object Error]" || z instanceof Error);
            }
            s.isError = C, s.types.isNativeError = C;
            function h(z) {
              return typeof z == "function";
            }
            s.isFunction = h;
            function x(z) {
              return z === null || typeof z == "boolean" || typeof z == "number" || typeof z == "string" || typeof z == "symbol" || // ES6 symbol
              typeof z > "u";
            }
            s.isPrimitive = x, s.isBuffer = y("./support/isBuffer");
            function V(z) {
              return Object.prototype.toString.call(z);
            }
            function oe(z) {
              return z < 10 ? "0" + z.toString(10) : z.toString(10);
            }
            var Ee = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec"
            ];
            function he() {
              var z = /* @__PURE__ */ new Date(), Y = [
                oe(z.getHours()),
                oe(z.getMinutes()),
                oe(z.getSeconds())
              ].join(":");
              return [z.getDate(), Ee[z.getMonth()], Y].join(" ");
            }
            s.log = function() {
              console.log("%s - %s", he(), s.format.apply(s, arguments));
            }, s.inherits = y("inherits"), s._extend = function(z, Y) {
              if (!Y || !re(Y)) return z;
              for (var $ = Object.keys(Y), ce = $.length; ce--; )
                z[$[ce]] = Y[$[ce]];
              return z;
            };
            function B(z, Y) {
              return Object.prototype.hasOwnProperty.call(z, Y);
            }
            var K = typeof Symbol < "u" ? Symbol("util.promisify.custom") : void 0;
            s.promisify = function(Y) {
              if (typeof Y != "function")
                throw new TypeError('The "original" argument must be of type Function');
              if (K && Y[K]) {
                var $ = Y[K];
                if (typeof $ != "function")
                  throw new TypeError('The "util.promisify.custom" argument must be of type Function');
                return Object.defineProperty($, K, {
                  value: $,
                  enumerable: !1,
                  writable: !1,
                  configurable: !0
                }), $;
              }
              function $() {
                for (var ce, de, we = new Promise(function(j, ie) {
                  ce = j, de = ie;
                }), ye = [], U = 0; U < arguments.length; U++)
                  ye.push(arguments[U]);
                ye.push(function(j, ie) {
                  j ? de(j) : ce(ie);
                });
                try {
                  Y.apply(this, ye);
                } catch (j) {
                  de(j);
                }
                return we;
              }
              return Object.setPrototypeOf($, Object.getPrototypeOf(Y)), K && Object.defineProperty($, K, {
                value: $,
                enumerable: !1,
                writable: !1,
                configurable: !0
              }), Object.defineProperties(
                $,
                g(Y)
              );
            }, s.promisify.custom = K;
            function q(z, Y) {
              if (!z) {
                var $ = new Error("Promise was rejected with a falsy value");
                $.reason = z, z = $;
              }
              return Y(z);
            }
            function ge(z) {
              if (typeof z != "function")
                throw new TypeError('The "original" argument must be of type Function');
              function Y() {
                for (var $ = [], ce = 0; ce < arguments.length; ce++)
                  $.push(arguments[ce]);
                var de = $.pop();
                if (typeof de != "function")
                  throw new TypeError("The last argument must be of type Function");
                var we = this, ye = function() {
                  return de.apply(we, arguments);
                };
                z.apply(this, $).then(
                  function(U) {
                    w.nextTick(ye.bind(null, null, U));
                  },
                  function(U) {
                    w.nextTick(q.bind(null, U, ye));
                  }
                );
              }
              return Object.setPrototypeOf(Y, Object.getPrototypeOf(z)), Object.defineProperties(
                Y,
                g(z)
              ), Y;
            }
            s.callbackify = ge;
          }).call(this);
        }).call(this, y("_process"));
      }, { "./support/isBuffer": 82, "./support/types": 83, _process: 63, inherits: 46 }], 85: [function(y, H, s) {
        (function(w) {
          (function() {
            "use strict";
            var g = y("for-each"), T = y("available-typed-arrays"), m = y("call-bind/callBound"), d = y("gopd"), i = m("Object.prototype.toString"), o = y("has-tostringtag/shams")(), a = typeof globalThis > "u" ? w : globalThis, f = T(), p = m("String.prototype.slice"), u = {}, c = Object.getPrototypeOf;
            o && d && c && g(f, function(S) {
              if (typeof a[S] == "function") {
                var O = new a[S]();
                if (Symbol.toStringTag in O) {
                  var L = c(O), E = d(L, Symbol.toStringTag);
                  if (!E) {
                    var F = c(L);
                    E = d(F, Symbol.toStringTag);
                  }
                  u[S] = E.get;
                }
              }
            });
            var b = function(O) {
              var L = !1;
              return g(u, function(E, F) {
                if (!L)
                  try {
                    var I = E.call(O);
                    I === F && (L = I);
                  } catch {
                  }
              }), L;
            }, R = y("is-typed-array");
            H.exports = function(O) {
              return R(O) ? !o || !(Symbol.toStringTag in O) ? p(i(O), 8, -1) : b(O) : !1;
            };
          }).call(this);
        }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, { "available-typed-arrays": 27, "call-bind/callBound": 33, "for-each": 36, gopd: 40, "has-tostringtag/shams": 43, "is-typed-array": 50 }] }, {}, [20])(20);
    });
  });

  // src/lib/storage.ts
  var xt = "workspace";
  async function dt() {
    let ve = await navigator.storage.getDirectory();
    return new tt(await ve.getDirectoryHandle(xt, { create: !0 }));
  }
  var tt = class {
    #e;
    constructor(le) {
      this.#e = le;
    }
    get name() {
      return this.#e.name;
    }
    async put(le, be) {
      console.debug("put", le);
      let H = await (await this.#e.getFileHandle(le, { create: !0 })).createWritable();
      be instanceof ArrayBuffer || be instanceof Blob ? await H.write(be) : await be.pipeTo(H), await H.close();
    }
    async createWritable(le) {
      return await (await this.#e.getFileHandle(le, { create: !0 })).createWritable();
    }
    async get(le) {
      console.debug("get", le);
      try {
        return await (await this.#e.getFileHandle(le)).getFile();
      } catch (be) {
        if (be instanceof DOMException && be.name === "NotFoundError")
          return null;
        throw be;
      }
    }
    async size(le) {
      return (await (await this.#e.getFileHandle(le)).getFile()).size;
    }
    async remove(le) {
      await this.#e.removeEntry(le);
    }
  };

  // lib/map-files.ts
  var vt;
  function wt(ve) {
    vt = ve;
  }
  var Je = {
    "map_info.xml": {
      name: "map_info.xml",
      process: pt
    },
    "biomes.png": {
      name: "biomes.png",
      process: Mt
    },
    "splat3.png": {
      name: "splat3.png",
      process: _t
    },
    "splat3_processed.png": {
      name: "splat3.png",
      process: _t
    },
    "splat4.png": {
      name: "splat4.png",
      process: yt
    },
    "splat4_processed.png": {
      name: "splat4.png",
      process: yt
    },
    "radiation.png": {
      name: "radiation.png",
      process: Ct
    },
    "prefabs.xml": {
      name: "prefabs.xml",
      process: pt
    },
    "dtm.raw": {
      name: "dtm_block.raw.gz",
      process: (ve, le) => ve.pipeThrough(new it()).pipeTo(le)
    }
  }, Ut = Object.fromEntries(Object.entries(Je).map(([ve, le]) => [ve, le.name])), et = class {
    #e;
    constructor(le) {
      this.#e = le;
    }
    get mapFileName() {
      return Je[this.#e].name;
    }
    async process(le, be) {
      await Je[this.#e].process(le, be);
    }
  }, jt = new Set(Object.keys(Je));
  var zt = new Set(Object.values(Je).map((ve) => ve.name));
  function pt(ve, le) {
    return ve.pipeTo(le);
  }
  function Mt(ve, le) {
    return ve.pipeThrough(new lt()).pipeTo(le);
  }
  function _t(ve, le) {
    return ve.pipeThrough(new at()).pipeTo(le);
  }
  function yt(ve, le) {
    return ve.pipeThrough(new ot()).pipeTo(le);
  }
  function Ct(ve, le) {
    return ve.pipeThrough(new ft()).pipeTo(le);
  }
  var gt = { highWaterMark: 1024 * 1024 }, st = [gt, gt], rt = class {
    readable;
    writable;
    constructor(le) {
      let { readable: be, writable: y } = new TransformStream({}, ...st);
      this.readable = le.reduce((H, s) => H.pipeThrough(s), be), this.writable = y;
    }
  }, nt = class extends TransformStream {
    constructor() {
      let le = 1;
      super(
        {
          transform(be, y) {
            let H = new Uint8Array(
              be.length % 2 === 0 ? be.length / 2 : le === 1 ? (be.length - 1) / 2 : (be.length + 1) / 2
            ), s = le;
            for (; s < be.length; s += 2)
              H[(s - le) / 2] = be[s];
            le = s - be.length, y.enqueue(H);
          }
        },
        ...st
      );
    }
  }, it = class extends rt {
    constructor() {
      super([new nt(), new CompressionStream("gzip")]);
    }
  }, bt = class extends DecompressionStream {
    constructor() {
      super("gzip");
    }
  }, $e = class extends TransformStream {
    constructor(le) {
      let be = new vt({ deflateLevel: 9, deflateStrategy: 0 }), { promise: y, resolve: H, reject: s } = Promise.withResolvers();
      super(
        {
          start(w) {
            be.on("parsed", () => {
              Pt(be, le, w).then(H).catch((g) => {
                s(g);
              });
            });
          },
          transform(w) {
            be.write(w);
          },
          flush() {
            return y;
          }
        },
        ...st
      );
    }
  };
  async function Pt(ve, le, be) {
    if (globalThis.OffscreenCanvas) {
      let y = new OffscreenCanvas(ve.width, ve.height), H = y.getContext("2d"), s = H.createImageData(ve.width, ve.height);
      le(ve.data, s.data), H.putImageData(s, 0, 0);
      let w = await y.convertToBlob({ type: "image/png" });
      for await (let g of w.stream()) be.enqueue(g);
    } else
      return le(ve.data, ve.data), new Promise((y, H) => {
        ve.pack().on("data", (s) => {
          be.enqueue(s);
        }).on("error", H).on("end", y);
      });
  }
  var at = class extends $e {
    constructor() {
      super((le, be) => {
        for (let y = 0; y < be.length; y += 4)
          le[y] === 0 && le[y + 1] === 0 && le[y + 2] === 0 ? (be[y] = 0, be[y + 1] = 0, be[y + 2] = 0, be[y + 3] = 0) : (be[y] = le[y], be[y + 1] = le[y + 1], be[y + 2] = le[y + 2], be[y + 3] = 255);
      });
    }
  }, ot = class extends $e {
    constructor() {
      super((le, be) => {
        for (let y = 0; y < le.length; y += 4)
          if (le[y] === 0 && le[y + 1] === 0 && le[y + 2] === 0)
            be[y] = 0, be[y + 1] = 0, be[y + 2] = 0, be[y + 3] = 0;
          else if (le[y + 1] === 255) {
            be[y] = le[y];
            let H = le[y + 1];
            be[y + 1] = le[y + 2], be[y + 2] = H, be[y + 3] = 255;
          } else
            be[y] = le[y], be[y + 1] = le[y + 1], be[y + 2] = le[y + 2], be[y + 3] = 255;
      });
    }
  }, ft = class extends $e {
    constructor() {
      super((le, be) => {
        for (let y = 0; y < le.length; y += 4)
          le[y] === 0 && le[y + 1] === 0 && le[y + 2] === 0 ? (be[y] = 0, be[y + 1] = 0, be[y + 2] = 0, be[y + 3] = 0) : (be[y] = le[y], be[y + 1] = le[y + 1], be[y + 2] = le[y + 2], be[y + 3] = 255);
      });
    }
  }, lt = class extends $e {
    constructor() {
      super((le, be) => {
        for (let y = 0; y < le.length; y++)
          be[y] = le[y];
      });
    }
  };

  // src/worker/file-processor.ts
  var St = Ft(Et(), 1);
  wt(St.PNG);
  onmessage = async (ve) => {
    let le = await Dt(ve.data).catch((be) => ({ error: String(be) }));
    postMessage(le);
  };
  async function Dt(ve) {
    let le;
    if ("blob" in ve)
      le = ve.blob;
    else if ("url" in ve) {
      let s = await fetch(ve.url);
      if (!s.ok) throw Error(`Failed to fetch ${ve.url}: ${s.statusText}`);
      le = await s.blob();
    } else
      throw Error(`Unexpected message: ${JSON.stringify(ve)}`);
    let be = new et(ve.name), y = be.mapFileName, H = await dt();
    return await be.process(le.stream(), await H.createWritable(y)), { name: y, size: await H.size(y) };
  }
})();
/*! Bundled license information:

pngjs/browser.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   *)
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=file-processor.js.map
