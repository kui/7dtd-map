"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(x, {
    get: (a, b) => (typeof require < "u" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from == "object" || typeof from == "function")
      for (let key of __getOwnPropNames(from))
        !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
    mod
  ));

  // node_modules/pngjs/browser.js
  var require_browser = __commonJS({
    "node_modules/pngjs/browser.js"(exports, module) {
      (function(f) {
        if (typeof exports == "object" && typeof module < "u")
          module.exports = f();
        else if (typeof define == "function" && define.amd)
          define([], f);
        else {
          var g;
          typeof window < "u" ? g = window : typeof global < "u" ? g = global : typeof self < "u" ? g = self : g = this, g.png = f();
        }
      })(function() {
        var define2, module2, exports2;
        return (/* @__PURE__ */ function() {
          function r(e, n, t) {
            function o(i2, f) {
              if (!n[i2]) {
                if (!e[i2]) {
                  var c = typeof __require == "function" && __require;
                  if (!f && c) return c(i2, !0);
                  if (u) return u(i2, !0);
                  var a = new Error("Cannot find module '" + i2 + "'");
                  throw a.code = "MODULE_NOT_FOUND", a;
                }
                var p = n[i2] = { exports: {} };
                e[i2][0].call(p.exports, function(r2) {
                  var n2 = e[i2][1][r2];
                  return o(n2 || r2);
                }, p, p.exports, r, e, n, t);
              }
              return n[i2].exports;
            }
            for (var u = typeof __require == "function" && __require, i = 0; i < t.length; i++) o(t[i]);
            return o;
          }
          return r;
        }())({ 1: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let interlaceUtils = require2("./interlace"), pixelBppMapper = [
                // 0 - dummy entry
                function() {
                },
                // 1 - L
                // 0: 0, 1: 0, 2: 0, 3: 0xff
                function(pxData, data, pxPos, rawPos) {
                  if (rawPos === data.length)
                    throw new Error("Ran out of data");
                  let pixel = data[rawPos];
                  pxData[pxPos] = pixel, pxData[pxPos + 1] = pixel, pxData[pxPos + 2] = pixel, pxData[pxPos + 3] = 255;
                },
                // 2 - LA
                // 0: 0, 1: 0, 2: 0, 3: 1
                function(pxData, data, pxPos, rawPos) {
                  if (rawPos + 1 >= data.length)
                    throw new Error("Ran out of data");
                  let pixel = data[rawPos];
                  pxData[pxPos] = pixel, pxData[pxPos + 1] = pixel, pxData[pxPos + 2] = pixel, pxData[pxPos + 3] = data[rawPos + 1];
                },
                // 3 - RGB
                // 0: 0, 1: 1, 2: 2, 3: 0xff
                function(pxData, data, pxPos, rawPos) {
                  if (rawPos + 2 >= data.length)
                    throw new Error("Ran out of data");
                  pxData[pxPos] = data[rawPos], pxData[pxPos + 1] = data[rawPos + 1], pxData[pxPos + 2] = data[rawPos + 2], pxData[pxPos + 3] = 255;
                },
                // 4 - RGBA
                // 0: 0, 1: 1, 2: 2, 3: 3
                function(pxData, data, pxPos, rawPos) {
                  if (rawPos + 3 >= data.length)
                    throw new Error("Ran out of data");
                  pxData[pxPos] = data[rawPos], pxData[pxPos + 1] = data[rawPos + 1], pxData[pxPos + 2] = data[rawPos + 2], pxData[pxPos + 3] = data[rawPos + 3];
                }
              ], pixelBppCustomMapper = [
                // 0 - dummy entry
                function() {
                },
                // 1 - L
                // 0: 0, 1: 0, 2: 0, 3: 0xff
                function(pxData, pixelData, pxPos, maxBit) {
                  let pixel = pixelData[0];
                  pxData[pxPos] = pixel, pxData[pxPos + 1] = pixel, pxData[pxPos + 2] = pixel, pxData[pxPos + 3] = maxBit;
                },
                // 2 - LA
                // 0: 0, 1: 0, 2: 0, 3: 1
                function(pxData, pixelData, pxPos) {
                  let pixel = pixelData[0];
                  pxData[pxPos] = pixel, pxData[pxPos + 1] = pixel, pxData[pxPos + 2] = pixel, pxData[pxPos + 3] = pixelData[1];
                },
                // 3 - RGB
                // 0: 0, 1: 1, 2: 2, 3: 0xff
                function(pxData, pixelData, pxPos, maxBit) {
                  pxData[pxPos] = pixelData[0], pxData[pxPos + 1] = pixelData[1], pxData[pxPos + 2] = pixelData[2], pxData[pxPos + 3] = maxBit;
                },
                // 4 - RGBA
                // 0: 0, 1: 1, 2: 2, 3: 3
                function(pxData, pixelData, pxPos) {
                  pxData[pxPos] = pixelData[0], pxData[pxPos + 1] = pixelData[1], pxData[pxPos + 2] = pixelData[2], pxData[pxPos + 3] = pixelData[3];
                }
              ];
              function bitRetriever(data, depth) {
                let leftOver = [], i = 0;
                function split() {
                  if (i === data.length)
                    throw new Error("Ran out of data");
                  let byte = data[i];
                  i++;
                  let byte8, byte7, byte6, byte5, byte4, byte3, byte2, byte1;
                  switch (depth) {
                    default:
                      throw new Error("unrecognised depth");
                    case 16:
                      byte2 = data[i], i++, leftOver.push((byte << 8) + byte2);
                      break;
                    case 4:
                      byte2 = byte & 15, byte1 = byte >> 4, leftOver.push(byte1, byte2);
                      break;
                    case 2:
                      byte4 = byte & 3, byte3 = byte >> 2 & 3, byte2 = byte >> 4 & 3, byte1 = byte >> 6 & 3, leftOver.push(byte1, byte2, byte3, byte4);
                      break;
                    case 1:
                      byte8 = byte & 1, byte7 = byte >> 1 & 1, byte6 = byte >> 2 & 1, byte5 = byte >> 3 & 1, byte4 = byte >> 4 & 1, byte3 = byte >> 5 & 1, byte2 = byte >> 6 & 1, byte1 = byte >> 7 & 1, leftOver.push(byte1, byte2, byte3, byte4, byte5, byte6, byte7, byte8);
                      break;
                  }
                }
                return {
                  get: function(count) {
                    for (; leftOver.length < count; )
                      split();
                    let returner = leftOver.slice(0, count);
                    return leftOver = leftOver.slice(count), returner;
                  },
                  resetAfterLine: function() {
                    leftOver.length = 0;
                  },
                  end: function() {
                    if (i !== data.length)
                      throw new Error("extra data found");
                  }
                };
              }
              function mapImage8Bit(image, pxData, getPxPos, bpp, data, rawPos) {
                let imageWidth = image.width, imageHeight = image.height, imagePass = image.index;
                for (let y = 0; y < imageHeight; y++)
                  for (let x = 0; x < imageWidth; x++) {
                    let pxPos = getPxPos(x, y, imagePass);
                    pixelBppMapper[bpp](pxData, data, pxPos, rawPos), rawPos += bpp;
                  }
                return rawPos;
              }
              function mapImageCustomBit(image, pxData, getPxPos, bpp, bits, maxBit) {
                let imageWidth = image.width, imageHeight = image.height, imagePass = image.index;
                for (let y = 0; y < imageHeight; y++) {
                  for (let x = 0; x < imageWidth; x++) {
                    let pixelData = bits.get(bpp), pxPos = getPxPos(x, y, imagePass);
                    pixelBppCustomMapper[bpp](pxData, pixelData, pxPos, maxBit);
                  }
                  bits.resetAfterLine();
                }
              }
              exports3.dataToBitMap = function(data, bitmapInfo) {
                let width = bitmapInfo.width, height = bitmapInfo.height, depth = bitmapInfo.depth, bpp = bitmapInfo.bpp, interlace = bitmapInfo.interlace, bits;
                depth !== 8 && (bits = bitRetriever(data, depth));
                let pxData;
                depth <= 8 ? pxData = Buffer2.alloc(width * height * 4) : pxData = new Uint16Array(width * height * 4);
                let maxBit = Math.pow(2, depth) - 1, rawPos = 0, images, getPxPos;
                if (interlace)
                  images = interlaceUtils.getImagePasses(width, height), getPxPos = interlaceUtils.getInterlaceIterator(width, height);
                else {
                  let nonInterlacedPxPos = 0;
                  getPxPos = function() {
                    let returner = nonInterlacedPxPos;
                    return nonInterlacedPxPos += 4, returner;
                  }, images = [{ width, height }];
                }
                for (let imageIndex = 0; imageIndex < images.length; imageIndex++)
                  depth === 8 ? rawPos = mapImage8Bit(
                    images[imageIndex],
                    pxData,
                    getPxPos,
                    bpp,
                    data,
                    rawPos
                  ) : mapImageCustomBit(
                    images[imageIndex],
                    pxData,
                    getPxPos,
                    bpp,
                    bits,
                    maxBit
                  );
                if (depth === 8) {
                  if (rawPos !== data.length)
                    throw new Error("extra data found");
                } else
                  bits.end();
                return pxData;
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./interlace": 11, buffer: 32 }], 2: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let constants = require2("./constants");
              module3.exports = function(dataIn, width, height, options) {
                let outHasAlpha = [constants.COLORTYPE_COLOR_ALPHA, constants.COLORTYPE_ALPHA].indexOf(
                  options.colorType
                ) !== -1;
                if (options.colorType === options.inputColorType) {
                  let bigEndian = function() {
                    let buffer = new ArrayBuffer(2);
                    return new DataView(buffer).setInt16(
                      0,
                      256,
                      !0
                      /* littleEndian */
                    ), new Int16Array(buffer)[0] !== 256;
                  }();
                  if (options.bitDepth === 8 || options.bitDepth === 16 && bigEndian)
                    return dataIn;
                }
                let data = options.bitDepth !== 16 ? dataIn : new Uint16Array(dataIn.buffer), maxValue = 255, inBpp = constants.COLORTYPE_TO_BPP_MAP[options.inputColorType];
                inBpp === 4 && !options.inputHasAlpha && (inBpp = 3);
                let outBpp = constants.COLORTYPE_TO_BPP_MAP[options.colorType];
                options.bitDepth === 16 && (maxValue = 65535, outBpp *= 2);
                let outData = Buffer2.alloc(width * height * outBpp), inIndex = 0, outIndex = 0, bgColor = options.bgColor || {};
                bgColor.red === void 0 && (bgColor.red = maxValue), bgColor.green === void 0 && (bgColor.green = maxValue), bgColor.blue === void 0 && (bgColor.blue = maxValue);
                function getRGBA() {
                  let red, green, blue, alpha = maxValue;
                  switch (options.inputColorType) {
                    case constants.COLORTYPE_COLOR_ALPHA:
                      alpha = data[inIndex + 3], red = data[inIndex], green = data[inIndex + 1], blue = data[inIndex + 2];
                      break;
                    case constants.COLORTYPE_COLOR:
                      red = data[inIndex], green = data[inIndex + 1], blue = data[inIndex + 2];
                      break;
                    case constants.COLORTYPE_ALPHA:
                      alpha = data[inIndex + 1], red = data[inIndex], green = red, blue = red;
                      break;
                    case constants.COLORTYPE_GRAYSCALE:
                      red = data[inIndex], green = red, blue = red;
                      break;
                    default:
                      throw new Error(
                        "input color type:" + options.inputColorType + " is not supported at present"
                      );
                  }
                  return options.inputHasAlpha && (outHasAlpha || (alpha /= maxValue, red = Math.min(
                    Math.max(Math.round((1 - alpha) * bgColor.red + alpha * red), 0),
                    maxValue
                  ), green = Math.min(
                    Math.max(Math.round((1 - alpha) * bgColor.green + alpha * green), 0),
                    maxValue
                  ), blue = Math.min(
                    Math.max(Math.round((1 - alpha) * bgColor.blue + alpha * blue), 0),
                    maxValue
                  ))), { red, green, blue, alpha };
                }
                for (let y = 0; y < height; y++)
                  for (let x = 0; x < width; x++) {
                    let rgba = getRGBA(data, inIndex);
                    switch (options.colorType) {
                      case constants.COLORTYPE_COLOR_ALPHA:
                      case constants.COLORTYPE_COLOR:
                        options.bitDepth === 8 ? (outData[outIndex] = rgba.red, outData[outIndex + 1] = rgba.green, outData[outIndex + 2] = rgba.blue, outHasAlpha && (outData[outIndex + 3] = rgba.alpha)) : (outData.writeUInt16BE(rgba.red, outIndex), outData.writeUInt16BE(rgba.green, outIndex + 2), outData.writeUInt16BE(rgba.blue, outIndex + 4), outHasAlpha && outData.writeUInt16BE(rgba.alpha, outIndex + 6));
                        break;
                      case constants.COLORTYPE_ALPHA:
                      case constants.COLORTYPE_GRAYSCALE: {
                        let grayscale = (rgba.red + rgba.green + rgba.blue) / 3;
                        options.bitDepth === 8 ? (outData[outIndex] = grayscale, outHasAlpha && (outData[outIndex + 1] = rgba.alpha)) : (outData.writeUInt16BE(grayscale, outIndex), outHasAlpha && outData.writeUInt16BE(rgba.alpha, outIndex + 2));
                        break;
                      }
                      default:
                        throw new Error("unrecognised color Type " + options.colorType);
                    }
                    inIndex += inBpp, outIndex += outBpp;
                  }
                return outData;
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./constants": 4, buffer: 32 }], 3: [function(require2, module3, exports3) {
          (function(process, Buffer2) {
            (function() {
              "use strict";
              let util = require2("util"), Stream = require2("stream"), ChunkStream = module3.exports = function() {
                Stream.call(this), this._buffers = [], this._buffered = 0, this._reads = [], this._paused = !1, this._encoding = "utf8", this.writable = !0;
              };
              util.inherits(ChunkStream, Stream), ChunkStream.prototype.read = function(length, callback) {
                this._reads.push({
                  length: Math.abs(length),
                  // if length < 0 then at most this length
                  allowLess: length < 0,
                  func: callback
                }), process.nextTick(
                  function() {
                    this._process(), this._paused && this._reads && this._reads.length > 0 && (this._paused = !1, this.emit("drain"));
                  }.bind(this)
                );
              }, ChunkStream.prototype.write = function(data, encoding) {
                if (!this.writable)
                  return this.emit("error", new Error("Stream not writable")), !1;
                let dataBuffer;
                return Buffer2.isBuffer(data) ? dataBuffer = data : dataBuffer = Buffer2.from(data, encoding || this._encoding), this._buffers.push(dataBuffer), this._buffered += dataBuffer.length, this._process(), this._reads && this._reads.length === 0 && (this._paused = !0), this.writable && !this._paused;
              }, ChunkStream.prototype.end = function(data, encoding) {
                data && this.write(data, encoding), this.writable = !1, this._buffers && (this._buffers.length === 0 ? this._end() : (this._buffers.push(null), this._process()));
              }, ChunkStream.prototype.destroySoon = ChunkStream.prototype.end, ChunkStream.prototype._end = function() {
                this._reads.length > 0 && this.emit("error", new Error("Unexpected end of input")), this.destroy();
              }, ChunkStream.prototype.destroy = function() {
                this._buffers && (this.writable = !1, this._reads = null, this._buffers = null, this.emit("close"));
              }, ChunkStream.prototype._processReadAllowingLess = function(read) {
                this._reads.shift();
                let smallerBuf = this._buffers[0];
                smallerBuf.length > read.length ? (this._buffered -= read.length, this._buffers[0] = smallerBuf.slice(read.length), read.func.call(this, smallerBuf.slice(0, read.length))) : (this._buffered -= smallerBuf.length, this._buffers.shift(), read.func.call(this, smallerBuf));
              }, ChunkStream.prototype._processRead = function(read) {
                this._reads.shift();
                let pos = 0, count = 0, data = Buffer2.alloc(read.length);
                for (; pos < read.length; ) {
                  let buf = this._buffers[count++], len = Math.min(buf.length, read.length - pos);
                  buf.copy(data, pos, 0, len), pos += len, len !== buf.length && (this._buffers[--count] = buf.slice(len));
                }
                count > 0 && this._buffers.splice(0, count), this._buffered -= read.length, read.func.call(this, data);
              }, ChunkStream.prototype._process = function() {
                try {
                  for (; this._buffered > 0 && this._reads && this._reads.length > 0; ) {
                    let read = this._reads[0];
                    if (read.allowLess)
                      this._processReadAllowingLess(read);
                    else if (this._buffered >= read.length)
                      this._processRead(read);
                    else
                      break;
                  }
                  this._buffers && !this.writable && this._end();
                } catch (ex) {
                  this.emit("error", ex);
                }
              };
            }).call(this);
          }).call(this, require2("_process"), require2("buffer").Buffer);
        }, { _process: 63, buffer: 32, stream: 65, util: 84 }], 4: [function(require2, module3, exports3) {
          "use strict";
          module3.exports = {
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
        }, {}], 5: [function(require2, module3, exports3) {
          "use strict";
          let crcTable = [];
          (function() {
            for (let i = 0; i < 256; i++) {
              let currentCrc = i;
              for (let j = 0; j < 8; j++)
                currentCrc & 1 ? currentCrc = 3988292384 ^ currentCrc >>> 1 : currentCrc = currentCrc >>> 1;
              crcTable[i] = currentCrc;
            }
          })();
          let CrcCalculator = module3.exports = function() {
            this._crc = -1;
          };
          CrcCalculator.prototype.write = function(data) {
            for (let i = 0; i < data.length; i++)
              this._crc = crcTable[(this._crc ^ data[i]) & 255] ^ this._crc >>> 8;
            return !0;
          }, CrcCalculator.prototype.crc32 = function() {
            return this._crc ^ -1;
          }, CrcCalculator.crc32 = function(buf) {
            let crc = -1;
            for (let i = 0; i < buf.length; i++)
              crc = crcTable[(crc ^ buf[i]) & 255] ^ crc >>> 8;
            return crc ^ -1;
          };
        }, {}], 6: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let paethPredictor = require2("./paeth-predictor");
              function filterNone(pxData, pxPos, byteWidth, rawData, rawPos) {
                for (let x = 0; x < byteWidth; x++)
                  rawData[rawPos + x] = pxData[pxPos + x];
              }
              function filterSumNone(pxData, pxPos, byteWidth) {
                let sum = 0, length = pxPos + byteWidth;
                for (let i = pxPos; i < length; i++)
                  sum += Math.abs(pxData[i]);
                return sum;
              }
              function filterSub(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
                for (let x = 0; x < byteWidth; x++) {
                  let left = x >= bpp ? pxData[pxPos + x - bpp] : 0, val = pxData[pxPos + x] - left;
                  rawData[rawPos + x] = val;
                }
              }
              function filterSumSub(pxData, pxPos, byteWidth, bpp) {
                let sum = 0;
                for (let x = 0; x < byteWidth; x++) {
                  let left = x >= bpp ? pxData[pxPos + x - bpp] : 0, val = pxData[pxPos + x] - left;
                  sum += Math.abs(val);
                }
                return sum;
              }
              function filterUp(pxData, pxPos, byteWidth, rawData, rawPos) {
                for (let x = 0; x < byteWidth; x++) {
                  let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0, val = pxData[pxPos + x] - up;
                  rawData[rawPos + x] = val;
                }
              }
              function filterSumUp(pxData, pxPos, byteWidth) {
                let sum = 0, length = pxPos + byteWidth;
                for (let x = pxPos; x < length; x++) {
                  let up = pxPos > 0 ? pxData[x - byteWidth] : 0, val = pxData[x] - up;
                  sum += Math.abs(val);
                }
                return sum;
              }
              function filterAvg(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
                for (let x = 0; x < byteWidth; x++) {
                  let left = x >= bpp ? pxData[pxPos + x - bpp] : 0, up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0, val = pxData[pxPos + x] - (left + up >> 1);
                  rawData[rawPos + x] = val;
                }
              }
              function filterSumAvg(pxData, pxPos, byteWidth, bpp) {
                let sum = 0;
                for (let x = 0; x < byteWidth; x++) {
                  let left = x >= bpp ? pxData[pxPos + x - bpp] : 0, up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0, val = pxData[pxPos + x] - (left + up >> 1);
                  sum += Math.abs(val);
                }
                return sum;
              }
              function filterPaeth(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
                for (let x = 0; x < byteWidth; x++) {
                  let left = x >= bpp ? pxData[pxPos + x - bpp] : 0, up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0, upleft = pxPos > 0 && x >= bpp ? pxData[pxPos + x - (byteWidth + bpp)] : 0, val = pxData[pxPos + x] - paethPredictor(left, up, upleft);
                  rawData[rawPos + x] = val;
                }
              }
              function filterSumPaeth(pxData, pxPos, byteWidth, bpp) {
                let sum = 0;
                for (let x = 0; x < byteWidth; x++) {
                  let left = x >= bpp ? pxData[pxPos + x - bpp] : 0, up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0, upleft = pxPos > 0 && x >= bpp ? pxData[pxPos + x - (byteWidth + bpp)] : 0, val = pxData[pxPos + x] - paethPredictor(left, up, upleft);
                  sum += Math.abs(val);
                }
                return sum;
              }
              let filters = {
                0: filterNone,
                1: filterSub,
                2: filterUp,
                3: filterAvg,
                4: filterPaeth
              }, filterSums = {
                0: filterSumNone,
                1: filterSumSub,
                2: filterSumUp,
                3: filterSumAvg,
                4: filterSumPaeth
              };
              module3.exports = function(pxData, width, height, options, bpp) {
                let filterTypes;
                if (!("filterType" in options) || options.filterType === -1)
                  filterTypes = [0, 1, 2, 3, 4];
                else if (typeof options.filterType == "number")
                  filterTypes = [options.filterType];
                else
                  throw new Error("unrecognised filter types");
                options.bitDepth === 16 && (bpp *= 2);
                let byteWidth = width * bpp, rawPos = 0, pxPos = 0, rawData = Buffer2.alloc((byteWidth + 1) * height), sel = filterTypes[0];
                for (let y = 0; y < height; y++) {
                  if (filterTypes.length > 1) {
                    let min = 1 / 0;
                    for (let i = 0; i < filterTypes.length; i++) {
                      let sum = filterSums[filterTypes[i]](pxData, pxPos, byteWidth, bpp);
                      sum < min && (sel = filterTypes[i], min = sum);
                    }
                  }
                  rawData[rawPos] = sel, rawPos++, filters[sel](pxData, pxPos, byteWidth, rawData, rawPos, bpp), rawPos += byteWidth, pxPos += byteWidth;
                }
                return rawData;
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./paeth-predictor": 15, buffer: 32 }], 7: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let util = require2("util"), ChunkStream = require2("./chunkstream"), Filter = require2("./filter-parse"), FilterAsync = module3.exports = function(bitmapInfo) {
                ChunkStream.call(this);
                let buffers = [], that = this;
                this._filter = new Filter(bitmapInfo, {
                  read: this.read.bind(this),
                  write: function(buffer) {
                    buffers.push(buffer);
                  },
                  complete: function() {
                    that.emit("complete", Buffer2.concat(buffers));
                  }
                }), this._filter.start();
              };
              util.inherits(FilterAsync, ChunkStream);
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./chunkstream": 3, "./filter-parse": 9, buffer: 32, util: 84 }], 8: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let SyncReader = require2("./sync-reader"), Filter = require2("./filter-parse");
              exports3.process = function(inBuffer, bitmapInfo) {
                let outBuffers = [], reader = new SyncReader(inBuffer);
                return new Filter(bitmapInfo, {
                  read: reader.read.bind(reader),
                  write: function(bufferPart) {
                    outBuffers.push(bufferPart);
                  },
                  complete: function() {
                  }
                }).start(), reader.process(), Buffer2.concat(outBuffers);
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./filter-parse": 9, "./sync-reader": 22, buffer: 32 }], 9: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let interlaceUtils = require2("./interlace"), paethPredictor = require2("./paeth-predictor");
              function getByteWidth(width, bpp, depth) {
                let byteWidth = width * bpp;
                return depth !== 8 && (byteWidth = Math.ceil(byteWidth / (8 / depth))), byteWidth;
              }
              let Filter = module3.exports = function(bitmapInfo, dependencies) {
                let width = bitmapInfo.width, height = bitmapInfo.height, interlace = bitmapInfo.interlace, bpp = bitmapInfo.bpp, depth = bitmapInfo.depth;
                if (this.read = dependencies.read, this.write = dependencies.write, this.complete = dependencies.complete, this._imageIndex = 0, this._images = [], interlace) {
                  let passes = interlaceUtils.getImagePasses(width, height);
                  for (let i = 0; i < passes.length; i++)
                    this._images.push({
                      byteWidth: getByteWidth(passes[i].width, bpp, depth),
                      height: passes[i].height,
                      lineIndex: 0
                    });
                } else
                  this._images.push({
                    byteWidth: getByteWidth(width, bpp, depth),
                    height,
                    lineIndex: 0
                  });
                depth === 8 ? this._xComparison = bpp : depth === 16 ? this._xComparison = bpp * 2 : this._xComparison = 1;
              };
              Filter.prototype.start = function() {
                this.read(
                  this._images[this._imageIndex].byteWidth + 1,
                  this._reverseFilterLine.bind(this)
                );
              }, Filter.prototype._unFilterType1 = function(rawData, unfilteredLine, byteWidth) {
                let xComparison = this._xComparison, xBiggerThan = xComparison - 1;
                for (let x = 0; x < byteWidth; x++) {
                  let rawByte = rawData[1 + x], f1Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
                  unfilteredLine[x] = rawByte + f1Left;
                }
              }, Filter.prototype._unFilterType2 = function(rawData, unfilteredLine, byteWidth) {
                let lastLine = this._lastLine;
                for (let x = 0; x < byteWidth; x++) {
                  let rawByte = rawData[1 + x], f2Up = lastLine ? lastLine[x] : 0;
                  unfilteredLine[x] = rawByte + f2Up;
                }
              }, Filter.prototype._unFilterType3 = function(rawData, unfilteredLine, byteWidth) {
                let xComparison = this._xComparison, xBiggerThan = xComparison - 1, lastLine = this._lastLine;
                for (let x = 0; x < byteWidth; x++) {
                  let rawByte = rawData[1 + x], f3Up = lastLine ? lastLine[x] : 0, f3Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0, f3Add = Math.floor((f3Left + f3Up) / 2);
                  unfilteredLine[x] = rawByte + f3Add;
                }
              }, Filter.prototype._unFilterType4 = function(rawData, unfilteredLine, byteWidth) {
                let xComparison = this._xComparison, xBiggerThan = xComparison - 1, lastLine = this._lastLine;
                for (let x = 0; x < byteWidth; x++) {
                  let rawByte = rawData[1 + x], f4Up = lastLine ? lastLine[x] : 0, f4Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0, f4UpLeft = x > xBiggerThan && lastLine ? lastLine[x - xComparison] : 0, f4Add = paethPredictor(f4Left, f4Up, f4UpLeft);
                  unfilteredLine[x] = rawByte + f4Add;
                }
              }, Filter.prototype._reverseFilterLine = function(rawData) {
                let filter = rawData[0], unfilteredLine, currentImage = this._images[this._imageIndex], byteWidth = currentImage.byteWidth;
                if (filter === 0)
                  unfilteredLine = rawData.slice(1, byteWidth + 1);
                else
                  switch (unfilteredLine = Buffer2.alloc(byteWidth), filter) {
                    case 1:
                      this._unFilterType1(rawData, unfilteredLine, byteWidth);
                      break;
                    case 2:
                      this._unFilterType2(rawData, unfilteredLine, byteWidth);
                      break;
                    case 3:
                      this._unFilterType3(rawData, unfilteredLine, byteWidth);
                      break;
                    case 4:
                      this._unFilterType4(rawData, unfilteredLine, byteWidth);
                      break;
                    default:
                      throw new Error("Unrecognised filter type - " + filter);
                  }
                this.write(unfilteredLine), currentImage.lineIndex++, currentImage.lineIndex >= currentImage.height ? (this._lastLine = null, this._imageIndex++, currentImage = this._images[this._imageIndex]) : this._lastLine = unfilteredLine, currentImage ? this.read(currentImage.byteWidth + 1, this._reverseFilterLine.bind(this)) : (this._lastLine = null, this.complete());
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./interlace": 11, "./paeth-predictor": 15, buffer: 32 }], 10: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              function dePalette(indata, outdata, width, height, palette) {
                let pxPos = 0;
                for (let y = 0; y < height; y++)
                  for (let x = 0; x < width; x++) {
                    let color = palette[indata[pxPos]];
                    if (!color)
                      throw new Error("index " + indata[pxPos] + " not in palette");
                    for (let i = 0; i < 4; i++)
                      outdata[pxPos + i] = color[i];
                    pxPos += 4;
                  }
              }
              function replaceTransparentColor(indata, outdata, width, height, transColor) {
                let pxPos = 0;
                for (let y = 0; y < height; y++)
                  for (let x = 0; x < width; x++) {
                    let makeTrans = !1;
                    if (transColor.length === 1 ? transColor[0] === indata[pxPos] && (makeTrans = !0) : transColor[0] === indata[pxPos] && transColor[1] === indata[pxPos + 1] && transColor[2] === indata[pxPos + 2] && (makeTrans = !0), makeTrans)
                      for (let i = 0; i < 4; i++)
                        outdata[pxPos + i] = 0;
                    pxPos += 4;
                  }
              }
              function scaleDepth(indata, outdata, width, height, depth) {
                let maxOutSample = 255, maxInSample = Math.pow(2, depth) - 1, pxPos = 0;
                for (let y = 0; y < height; y++)
                  for (let x = 0; x < width; x++) {
                    for (let i = 0; i < 4; i++)
                      outdata[pxPos + i] = Math.floor(
                        indata[pxPos + i] * maxOutSample / maxInSample + 0.5
                      );
                    pxPos += 4;
                  }
              }
              module3.exports = function(indata, imageData, skipRescale = !1) {
                let depth = imageData.depth, width = imageData.width, height = imageData.height, colorType = imageData.colorType, transColor = imageData.transColor, palette = imageData.palette, outdata = indata;
                return colorType === 3 ? dePalette(indata, outdata, width, height, palette) : (transColor && replaceTransparentColor(indata, outdata, width, height, transColor), depth !== 8 && !skipRescale && (depth === 16 && (outdata = Buffer2.alloc(width * height * 4)), scaleDepth(indata, outdata, width, height, depth))), outdata;
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { buffer: 32 }], 11: [function(require2, module3, exports3) {
          "use strict";
          let imagePasses = [
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
          exports3.getImagePasses = function(width, height) {
            let images = [], xLeftOver = width % 8, yLeftOver = height % 8, xRepeats = (width - xLeftOver) / 8, yRepeats = (height - yLeftOver) / 8;
            for (let i = 0; i < imagePasses.length; i++) {
              let pass = imagePasses[i], passWidth = xRepeats * pass.x.length, passHeight = yRepeats * pass.y.length;
              for (let j = 0; j < pass.x.length && pass.x[j] < xLeftOver; j++)
                passWidth++;
              for (let j = 0; j < pass.y.length && pass.y[j] < yLeftOver; j++)
                passHeight++;
              passWidth > 0 && passHeight > 0 && images.push({ width: passWidth, height: passHeight, index: i });
            }
            return images;
          }, exports3.getInterlaceIterator = function(width) {
            return function(x, y, pass) {
              let outerXLeftOver = x % imagePasses[pass].x.length, outerX = (x - outerXLeftOver) / imagePasses[pass].x.length * 8 + imagePasses[pass].x[outerXLeftOver], outerYLeftOver = y % imagePasses[pass].y.length, outerY = (y - outerYLeftOver) / imagePasses[pass].y.length * 8 + imagePasses[pass].y[outerYLeftOver];
              return outerX * 4 + outerY * width * 4;
            };
          };
        }, {}], 12: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let util = require2("util"), Stream = require2("stream"), constants = require2("./constants"), Packer = require2("./packer"), PackerAsync = module3.exports = function(opt) {
                Stream.call(this);
                let options = opt || {};
                this._packer = new Packer(options), this._deflate = this._packer.createDeflate(), this.readable = !0;
              };
              util.inherits(PackerAsync, Stream), PackerAsync.prototype.pack = function(data, width, height, gamma) {
                this.emit("data", Buffer2.from(constants.PNG_SIGNATURE)), this.emit("data", this._packer.packIHDR(width, height)), gamma && this.emit("data", this._packer.packGAMA(gamma));
                let filteredData = this._packer.filterData(data, width, height);
                this._deflate.on("error", this.emit.bind(this, "error")), this._deflate.on(
                  "data",
                  function(compressedData) {
                    this.emit("data", this._packer.packIDAT(compressedData));
                  }.bind(this)
                ), this._deflate.on(
                  "end",
                  function() {
                    this.emit("data", this._packer.packIEND()), this.emit("end");
                  }.bind(this)
                ), this._deflate.end(filteredData);
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./constants": 4, "./packer": 14, buffer: 32, stream: 65, util: 84 }], 13: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let hasSyncZlib = !0, zlib = require2("zlib");
              zlib.deflateSync || (hasSyncZlib = !1);
              let constants = require2("./constants"), Packer = require2("./packer");
              module3.exports = function(metaData, opt) {
                if (!hasSyncZlib)
                  throw new Error(
                    "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
                  );
                let options = opt || {}, packer = new Packer(options), chunks = [];
                chunks.push(Buffer2.from(constants.PNG_SIGNATURE)), chunks.push(packer.packIHDR(metaData.width, metaData.height)), metaData.gamma && chunks.push(packer.packGAMA(metaData.gamma));
                let filteredData = packer.filterData(
                  metaData.data,
                  metaData.width,
                  metaData.height
                ), compressedData = zlib.deflateSync(
                  filteredData,
                  packer.getDeflateOptions()
                );
                if (filteredData = null, !compressedData || !compressedData.length)
                  throw new Error("bad png - invalid compressed data response");
                return chunks.push(packer.packIDAT(compressedData)), chunks.push(packer.packIEND()), Buffer2.concat(chunks);
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./constants": 4, "./packer": 14, buffer: 32, zlib: 31 }], 14: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let constants = require2("./constants"), CrcStream = require2("./crc"), bitPacker = require2("./bitpacker"), filter = require2("./filter-pack"), zlib = require2("zlib"), Packer = module3.exports = function(options) {
                if (this._options = options, options.deflateChunkSize = options.deflateChunkSize || 32 * 1024, options.deflateLevel = options.deflateLevel != null ? options.deflateLevel : 9, options.deflateStrategy = options.deflateStrategy != null ? options.deflateStrategy : 3, options.inputHasAlpha = options.inputHasAlpha != null ? options.inputHasAlpha : !0, options.deflateFactory = options.deflateFactory || zlib.createDeflate, options.bitDepth = options.bitDepth || 8, options.colorType = typeof options.colorType == "number" ? options.colorType : constants.COLORTYPE_COLOR_ALPHA, options.inputColorType = typeof options.inputColorType == "number" ? options.inputColorType : constants.COLORTYPE_COLOR_ALPHA, [
                  constants.COLORTYPE_GRAYSCALE,
                  constants.COLORTYPE_COLOR,
                  constants.COLORTYPE_COLOR_ALPHA,
                  constants.COLORTYPE_ALPHA
                ].indexOf(options.colorType) === -1)
                  throw new Error(
                    "option color type:" + options.colorType + " is not supported at present"
                  );
                if ([
                  constants.COLORTYPE_GRAYSCALE,
                  constants.COLORTYPE_COLOR,
                  constants.COLORTYPE_COLOR_ALPHA,
                  constants.COLORTYPE_ALPHA
                ].indexOf(options.inputColorType) === -1)
                  throw new Error(
                    "option input color type:" + options.inputColorType + " is not supported at present"
                  );
                if (options.bitDepth !== 8 && options.bitDepth !== 16)
                  throw new Error(
                    "option bit depth:" + options.bitDepth + " is not supported at present"
                  );
              };
              Packer.prototype.getDeflateOptions = function() {
                return {
                  chunkSize: this._options.deflateChunkSize,
                  level: this._options.deflateLevel,
                  strategy: this._options.deflateStrategy
                };
              }, Packer.prototype.createDeflate = function() {
                return this._options.deflateFactory(this.getDeflateOptions());
              }, Packer.prototype.filterData = function(data, width, height) {
                let packedData = bitPacker(data, width, height, this._options), bpp = constants.COLORTYPE_TO_BPP_MAP[this._options.colorType];
                return filter(packedData, width, height, this._options, bpp);
              }, Packer.prototype._packChunk = function(type, data) {
                let len = data ? data.length : 0, buf = Buffer2.alloc(len + 12);
                return buf.writeUInt32BE(len, 0), buf.writeUInt32BE(type, 4), data && data.copy(buf, 8), buf.writeInt32BE(
                  CrcStream.crc32(buf.slice(4, buf.length - 4)),
                  buf.length - 4
                ), buf;
              }, Packer.prototype.packGAMA = function(gamma) {
                let buf = Buffer2.alloc(4);
                return buf.writeUInt32BE(Math.floor(gamma * constants.GAMMA_DIVISION), 0), this._packChunk(constants.TYPE_gAMA, buf);
              }, Packer.prototype.packIHDR = function(width, height) {
                let buf = Buffer2.alloc(13);
                return buf.writeUInt32BE(width, 0), buf.writeUInt32BE(height, 4), buf[8] = this._options.bitDepth, buf[9] = this._options.colorType, buf[10] = 0, buf[11] = 0, buf[12] = 0, this._packChunk(constants.TYPE_IHDR, buf);
              }, Packer.prototype.packIDAT = function(data) {
                return this._packChunk(constants.TYPE_IDAT, data);
              }, Packer.prototype.packIEND = function() {
                return this._packChunk(constants.TYPE_IEND, null);
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./bitpacker": 2, "./constants": 4, "./crc": 5, "./filter-pack": 6, buffer: 32, zlib: 31 }], 15: [function(require2, module3, exports3) {
          "use strict";
          module3.exports = function(left, above, upLeft) {
            let paeth = left + above - upLeft, pLeft = Math.abs(paeth - left), pAbove = Math.abs(paeth - above), pUpLeft = Math.abs(paeth - upLeft);
            return pLeft <= pAbove && pLeft <= pUpLeft ? left : pAbove <= pUpLeft ? above : upLeft;
          };
        }, {}], 16: [function(require2, module3, exports3) {
          "use strict";
          let util = require2("util"), zlib = require2("zlib"), ChunkStream = require2("./chunkstream"), FilterAsync = require2("./filter-parse-async"), Parser = require2("./parser"), bitmapper = require2("./bitmapper"), formatNormaliser = require2("./format-normaliser"), ParserAsync = module3.exports = function(options) {
            ChunkStream.call(this), this._parser = new Parser(options, {
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
            }), this._options = options, this.writable = !0, this._parser.start();
          };
          util.inherits(ParserAsync, ChunkStream), ParserAsync.prototype._handleError = function(err) {
            this.emit("error", err), this.writable = !1, this.destroy(), this._inflate && this._inflate.destroy && this._inflate.destroy(), this._filter && (this._filter.destroy(), this._filter.on("error", function() {
            })), this.errord = !0;
          }, ParserAsync.prototype._inflateData = function(data) {
            if (!this._inflate)
              if (this._bitmapInfo.interlace)
                this._inflate = zlib.createInflate(), this._inflate.on("error", this.emit.bind(this, "error")), this._filter.on("complete", this._complete.bind(this)), this._inflate.pipe(this._filter);
              else {
                let imageSize = ((this._bitmapInfo.width * this._bitmapInfo.bpp * this._bitmapInfo.depth + 7 >> 3) + 1) * this._bitmapInfo.height, chunkSize = Math.max(imageSize, zlib.Z_MIN_CHUNK);
                this._inflate = zlib.createInflate({ chunkSize });
                let leftToInflate = imageSize, emitError = this.emit.bind(this, "error");
                this._inflate.on("error", function(err) {
                  leftToInflate && emitError(err);
                }), this._filter.on("complete", this._complete.bind(this));
                let filterWrite = this._filter.write.bind(this._filter);
                this._inflate.on("data", function(chunk) {
                  leftToInflate && (chunk.length > leftToInflate && (chunk = chunk.slice(0, leftToInflate)), leftToInflate -= chunk.length, filterWrite(chunk));
                }), this._inflate.on("end", this._filter.end.bind(this._filter));
              }
            this._inflate.write(data);
          }, ParserAsync.prototype._handleMetaData = function(metaData) {
            this._metaData = metaData, this._bitmapInfo = Object.create(metaData), this._filter = new FilterAsync(this._bitmapInfo);
          }, ParserAsync.prototype._handleTransColor = function(transColor) {
            this._bitmapInfo.transColor = transColor;
          }, ParserAsync.prototype._handlePalette = function(palette) {
            this._bitmapInfo.palette = palette;
          }, ParserAsync.prototype._simpleTransparency = function() {
            this._metaData.alpha = !0;
          }, ParserAsync.prototype._headersFinished = function() {
            this.emit("metadata", this._metaData);
          }, ParserAsync.prototype._finished = function() {
            this.errord || (this._inflate ? this._inflate.end() : this.emit("error", "No Inflate block"));
          }, ParserAsync.prototype._complete = function(filteredData) {
            if (this.errord)
              return;
            let normalisedBitmapData;
            try {
              let bitmapData = bitmapper.dataToBitMap(filteredData, this._bitmapInfo);
              normalisedBitmapData = formatNormaliser(
                bitmapData,
                this._bitmapInfo,
                this._options.skipRescale
              ), bitmapData = null;
            } catch (ex) {
              this._handleError(ex);
              return;
            }
            this.emit("parsed", normalisedBitmapData);
          };
        }, { "./bitmapper": 1, "./chunkstream": 3, "./filter-parse-async": 7, "./format-normaliser": 10, "./parser": 18, util: 84, zlib: 31 }], 17: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let hasSyncZlib = !0, zlib = require2("zlib"), inflateSync = require2("./sync-inflate");
              zlib.deflateSync || (hasSyncZlib = !1);
              let SyncReader = require2("./sync-reader"), FilterSync = require2("./filter-parse-sync"), Parser = require2("./parser"), bitmapper = require2("./bitmapper"), formatNormaliser = require2("./format-normaliser");
              module3.exports = function(buffer, options) {
                if (!hasSyncZlib)
                  throw new Error(
                    "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
                  );
                let err;
                function handleError(_err_) {
                  err = _err_;
                }
                let metaData;
                function handleMetaData(_metaData_) {
                  metaData = _metaData_;
                }
                function handleTransColor(transColor) {
                  metaData.transColor = transColor;
                }
                function handlePalette(palette) {
                  metaData.palette = palette;
                }
                function handleSimpleTransparency() {
                  metaData.alpha = !0;
                }
                let gamma;
                function handleGamma(_gamma_) {
                  gamma = _gamma_;
                }
                let inflateDataList = [];
                function handleInflateData(inflatedData2) {
                  inflateDataList.push(inflatedData2);
                }
                let reader = new SyncReader(buffer);
                if (new Parser(options, {
                  read: reader.read.bind(reader),
                  error: handleError,
                  metadata: handleMetaData,
                  gamma: handleGamma,
                  palette: handlePalette,
                  transColor: handleTransColor,
                  inflateData: handleInflateData,
                  simpleTransparency: handleSimpleTransparency
                }).start(), reader.process(), err)
                  throw err;
                let inflateData = Buffer2.concat(inflateDataList);
                inflateDataList.length = 0;
                let inflatedData;
                if (metaData.interlace)
                  inflatedData = zlib.inflateSync(inflateData);
                else {
                  let imageSize = ((metaData.width * metaData.bpp * metaData.depth + 7 >> 3) + 1) * metaData.height;
                  inflatedData = inflateSync(inflateData, {
                    chunkSize: imageSize,
                    maxLength: imageSize
                  });
                }
                if (inflateData = null, !inflatedData || !inflatedData.length)
                  throw new Error("bad png - invalid inflate data response");
                let unfilteredData = FilterSync.process(inflatedData, metaData);
                inflateData = null;
                let bitmapData = bitmapper.dataToBitMap(unfilteredData, metaData);
                unfilteredData = null;
                let normalisedBitmapData = formatNormaliser(
                  bitmapData,
                  metaData,
                  options.skipRescale
                );
                return metaData.data = normalisedBitmapData, metaData.gamma = gamma || 0, metaData;
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./bitmapper": 1, "./filter-parse-sync": 8, "./format-normaliser": 10, "./parser": 18, "./sync-inflate": 21, "./sync-reader": 22, buffer: 32, zlib: 31 }], 18: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              let constants = require2("./constants"), CrcCalculator = require2("./crc"), Parser = module3.exports = function(options, dependencies) {
                this._options = options, options.checkCRC = options.checkCRC !== !1, this._hasIHDR = !1, this._hasIEND = !1, this._emittedHeadersFinished = !1, this._palette = [], this._colorType = 0, this._chunks = {}, this._chunks[constants.TYPE_IHDR] = this._handleIHDR.bind(this), this._chunks[constants.TYPE_IEND] = this._handleIEND.bind(this), this._chunks[constants.TYPE_IDAT] = this._handleIDAT.bind(this), this._chunks[constants.TYPE_PLTE] = this._handlePLTE.bind(this), this._chunks[constants.TYPE_tRNS] = this._handleTRNS.bind(this), this._chunks[constants.TYPE_gAMA] = this._handleGAMA.bind(this), this.read = dependencies.read, this.error = dependencies.error, this.metadata = dependencies.metadata, this.gamma = dependencies.gamma, this.transColor = dependencies.transColor, this.palette = dependencies.palette, this.parsed = dependencies.parsed, this.inflateData = dependencies.inflateData, this.finished = dependencies.finished, this.simpleTransparency = dependencies.simpleTransparency, this.headersFinished = dependencies.headersFinished || function() {
                };
              };
              Parser.prototype.start = function() {
                this.read(constants.PNG_SIGNATURE.length, this._parseSignature.bind(this));
              }, Parser.prototype._parseSignature = function(data) {
                let signature = constants.PNG_SIGNATURE;
                for (let i = 0; i < signature.length; i++)
                  if (data[i] !== signature[i]) {
                    this.error(new Error("Invalid file signature"));
                    return;
                  }
                this.read(8, this._parseChunkBegin.bind(this));
              }, Parser.prototype._parseChunkBegin = function(data) {
                let length = data.readUInt32BE(0), type = data.readUInt32BE(4), name = "";
                for (let i = 4; i < 8; i++)
                  name += String.fromCharCode(data[i]);
                let ancillary = !!(data[4] & 32);
                if (!this._hasIHDR && type !== constants.TYPE_IHDR) {
                  this.error(new Error("Expected IHDR on beggining"));
                  return;
                }
                if (this._crc = new CrcCalculator(), this._crc.write(Buffer2.from(name)), this._chunks[type])
                  return this._chunks[type](length);
                if (!ancillary) {
                  this.error(new Error("Unsupported critical chunk type " + name));
                  return;
                }
                this.read(length + 4, this._skipChunk.bind(this));
              }, Parser.prototype._skipChunk = function() {
                this.read(8, this._parseChunkBegin.bind(this));
              }, Parser.prototype._handleChunkEnd = function() {
                this.read(4, this._parseChunkEnd.bind(this));
              }, Parser.prototype._parseChunkEnd = function(data) {
                let fileCrc = data.readInt32BE(0), calcCrc = this._crc.crc32();
                if (this._options.checkCRC && calcCrc !== fileCrc) {
                  this.error(new Error("Crc error - " + fileCrc + " - " + calcCrc));
                  return;
                }
                this._hasIEND || this.read(8, this._parseChunkBegin.bind(this));
              }, Parser.prototype._handleIHDR = function(length) {
                this.read(length, this._parseIHDR.bind(this));
              }, Parser.prototype._parseIHDR = function(data) {
                this._crc.write(data);
                let width = data.readUInt32BE(0), height = data.readUInt32BE(4), depth = data[8], colorType = data[9], compr = data[10], filter = data[11], interlace = data[12];
                if (depth !== 8 && depth !== 4 && depth !== 2 && depth !== 1 && depth !== 16) {
                  this.error(new Error("Unsupported bit depth " + depth));
                  return;
                }
                if (!(colorType in constants.COLORTYPE_TO_BPP_MAP)) {
                  this.error(new Error("Unsupported color type"));
                  return;
                }
                if (compr !== 0) {
                  this.error(new Error("Unsupported compression method"));
                  return;
                }
                if (filter !== 0) {
                  this.error(new Error("Unsupported filter method"));
                  return;
                }
                if (interlace !== 0 && interlace !== 1) {
                  this.error(new Error("Unsupported interlace method"));
                  return;
                }
                this._colorType = colorType;
                let bpp = constants.COLORTYPE_TO_BPP_MAP[this._colorType];
                this._hasIHDR = !0, this.metadata({
                  width,
                  height,
                  depth,
                  interlace: !!interlace,
                  palette: !!(colorType & constants.COLORTYPE_PALETTE),
                  color: !!(colorType & constants.COLORTYPE_COLOR),
                  alpha: !!(colorType & constants.COLORTYPE_ALPHA),
                  bpp,
                  colorType
                }), this._handleChunkEnd();
              }, Parser.prototype._handlePLTE = function(length) {
                this.read(length, this._parsePLTE.bind(this));
              }, Parser.prototype._parsePLTE = function(data) {
                this._crc.write(data);
                let entries = Math.floor(data.length / 3);
                for (let i = 0; i < entries; i++)
                  this._palette.push([data[i * 3], data[i * 3 + 1], data[i * 3 + 2], 255]);
                this.palette(this._palette), this._handleChunkEnd();
              }, Parser.prototype._handleTRNS = function(length) {
                this.simpleTransparency(), this.read(length, this._parseTRNS.bind(this));
              }, Parser.prototype._parseTRNS = function(data) {
                if (this._crc.write(data), this._colorType === constants.COLORTYPE_PALETTE_COLOR) {
                  if (this._palette.length === 0) {
                    this.error(new Error("Transparency chunk must be after palette"));
                    return;
                  }
                  if (data.length > this._palette.length) {
                    this.error(new Error("More transparent colors than palette size"));
                    return;
                  }
                  for (let i = 0; i < data.length; i++)
                    this._palette[i][3] = data[i];
                  this.palette(this._palette);
                }
                this._colorType === constants.COLORTYPE_GRAYSCALE && this.transColor([data.readUInt16BE(0)]), this._colorType === constants.COLORTYPE_COLOR && this.transColor([
                  data.readUInt16BE(0),
                  data.readUInt16BE(2),
                  data.readUInt16BE(4)
                ]), this._handleChunkEnd();
              }, Parser.prototype._handleGAMA = function(length) {
                this.read(length, this._parseGAMA.bind(this));
              }, Parser.prototype._parseGAMA = function(data) {
                this._crc.write(data), this.gamma(data.readUInt32BE(0) / constants.GAMMA_DIVISION), this._handleChunkEnd();
              }, Parser.prototype._handleIDAT = function(length) {
                this._emittedHeadersFinished || (this._emittedHeadersFinished = !0, this.headersFinished()), this.read(-length, this._parseIDAT.bind(this, length));
              }, Parser.prototype._parseIDAT = function(length, data) {
                if (this._crc.write(data), this._colorType === constants.COLORTYPE_PALETTE_COLOR && this._palette.length === 0)
                  throw new Error("Expected palette not found");
                this.inflateData(data);
                let leftOverLength = length - data.length;
                leftOverLength > 0 ? this._handleIDAT(leftOverLength) : this._handleChunkEnd();
              }, Parser.prototype._handleIEND = function(length) {
                this.read(length, this._parseIEND.bind(this));
              }, Parser.prototype._parseIEND = function(data) {
                this._crc.write(data), this._hasIEND = !0, this._handleChunkEnd(), this.finished && this.finished();
              };
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "./constants": 4, "./crc": 5, buffer: 32 }], 19: [function(require2, module3, exports3) {
          "use strict";
          let parse = require2("./parser-sync"), pack = require2("./packer-sync");
          exports3.read = function(buffer, options) {
            return parse(buffer, options || {});
          }, exports3.write = function(png, options) {
            return pack(png, options);
          };
        }, { "./packer-sync": 13, "./parser-sync": 17 }], 20: [function(require2, module3, exports3) {
          (function(process, Buffer2) {
            (function() {
              "use strict";
              let util = require2("util"), Stream = require2("stream"), Parser = require2("./parser-async"), Packer = require2("./packer-async"), PNGSync = require2("./png-sync"), PNG3 = exports3.PNG = function(options) {
                Stream.call(this), options = options || {}, this.width = options.width | 0, this.height = options.height | 0, this.data = this.width > 0 && this.height > 0 ? Buffer2.alloc(4 * this.width * this.height) : null, options.fill && this.data && this.data.fill(0), this.gamma = 0, this.readable = this.writable = !0, this._parser = new Parser(options), this._parser.on("error", this.emit.bind(this, "error")), this._parser.on("close", this._handleClose.bind(this)), this._parser.on("metadata", this._metadata.bind(this)), this._parser.on("gamma", this._gamma.bind(this)), this._parser.on(
                  "parsed",
                  function(data) {
                    this.data = data, this.emit("parsed", data);
                  }.bind(this)
                ), this._packer = new Packer(options), this._packer.on("data", this.emit.bind(this, "data")), this._packer.on("end", this.emit.bind(this, "end")), this._parser.on("close", this._handleClose.bind(this)), this._packer.on("error", this.emit.bind(this, "error"));
              };
              util.inherits(PNG3, Stream), PNG3.sync = PNGSync, PNG3.prototype.pack = function() {
                return !this.data || !this.data.length ? (this.emit("error", "No data provided"), this) : (process.nextTick(
                  function() {
                    this._packer.pack(this.data, this.width, this.height, this.gamma);
                  }.bind(this)
                ), this);
              }, PNG3.prototype.parse = function(data, callback) {
                if (callback) {
                  let onParsed, onError;
                  onParsed = function(parsedData) {
                    this.removeListener("error", onError), this.data = parsedData, callback(null, this);
                  }.bind(this), onError = function(err) {
                    this.removeListener("parsed", onParsed), callback(err, null);
                  }.bind(this), this.once("parsed", onParsed), this.once("error", onError);
                }
                return this.end(data), this;
              }, PNG3.prototype.write = function(data) {
                return this._parser.write(data), !0;
              }, PNG3.prototype.end = function(data) {
                this._parser.end(data);
              }, PNG3.prototype._metadata = function(metadata) {
                this.width = metadata.width, this.height = metadata.height, this.emit("metadata", metadata);
              }, PNG3.prototype._gamma = function(gamma) {
                this.gamma = gamma;
              }, PNG3.prototype._handleClose = function() {
                !this._parser.writable && !this._packer.readable && this.emit("close");
              }, PNG3.bitblt = function(src, dst, srcX, srcY, width, height, deltaX, deltaY) {
                if (srcX |= 0, srcY |= 0, width |= 0, height |= 0, deltaX |= 0, deltaY |= 0, srcX > src.width || srcY > src.height || srcX + width > src.width || srcY + height > src.height)
                  throw new Error("bitblt reading outside image");
                if (deltaX > dst.width || deltaY > dst.height || deltaX + width > dst.width || deltaY + height > dst.height)
                  throw new Error("bitblt writing outside image");
                for (let y = 0; y < height; y++)
                  src.data.copy(
                    dst.data,
                    (deltaY + y) * dst.width + deltaX << 2,
                    (srcY + y) * src.width + srcX << 2,
                    (srcY + y) * src.width + srcX + width << 2
                  );
              }, PNG3.prototype.bitblt = function(dst, srcX, srcY, width, height, deltaX, deltaY) {
                return PNG3.bitblt(this, dst, srcX, srcY, width, height, deltaX, deltaY), this;
              }, PNG3.adjustGamma = function(src) {
                if (src.gamma) {
                  for (let y = 0; y < src.height; y++)
                    for (let x = 0; x < src.width; x++) {
                      let idx = src.width * y + x << 2;
                      for (let i = 0; i < 3; i++) {
                        let sample = src.data[idx + i] / 255;
                        sample = Math.pow(sample, 1 / 2.2 / src.gamma), src.data[idx + i] = Math.round(sample * 255);
                      }
                    }
                  src.gamma = 0;
                }
              }, PNG3.prototype.adjustGamma = function() {
                PNG3.adjustGamma(this);
              };
            }).call(this);
          }).call(this, require2("_process"), require2("buffer").Buffer);
        }, { "./packer-async": 12, "./parser-async": 16, "./png-sync": 19, _process: 63, buffer: 32, stream: 65, util: 84 }], 21: [function(require2, module3, exports3) {
          (function(process, Buffer2) {
            (function() {
              "use strict";
              let assert = require2("assert").ok, zlib = require2("zlib"), util = require2("util"), kMaxLength = require2("buffer").kMaxLength;
              function Inflate(opts) {
                if (!(this instanceof Inflate))
                  return new Inflate(opts);
                opts && opts.chunkSize < zlib.Z_MIN_CHUNK && (opts.chunkSize = zlib.Z_MIN_CHUNK), zlib.Inflate.call(this, opts), this._offset = this._offset === void 0 ? this._outOffset : this._offset, this._buffer = this._buffer || this._outBuffer, opts && opts.maxLength != null && (this._maxLength = opts.maxLength);
              }
              function createInflate(opts) {
                return new Inflate(opts);
              }
              function _close(engine, callback) {
                callback && process.nextTick(callback), engine._handle && (engine._handle.close(), engine._handle = null);
              }
              Inflate.prototype._processChunk = function(chunk, flushFlag, asyncCb) {
                if (typeof asyncCb == "function")
                  return zlib.Inflate._processChunk.call(this, chunk, flushFlag, asyncCb);
                let self2 = this, availInBefore = chunk && chunk.length, availOutBefore = this._chunkSize - this._offset, leftToInflate = this._maxLength, inOff = 0, buffers = [], nread = 0, error;
                this.on("error", function(err) {
                  error = err;
                });
                function handleChunk(availInAfter, availOutAfter) {
                  if (self2._hadError)
                    return;
                  let have = availOutBefore - availOutAfter;
                  if (assert(have >= 0, "have should not go down"), have > 0) {
                    let out = self2._buffer.slice(self2._offset, self2._offset + have);
                    if (self2._offset += have, out.length > leftToInflate && (out = out.slice(0, leftToInflate)), buffers.push(out), nread += out.length, leftToInflate -= out.length, leftToInflate === 0)
                      return !1;
                  }
                  return (availOutAfter === 0 || self2._offset >= self2._chunkSize) && (availOutBefore = self2._chunkSize, self2._offset = 0, self2._buffer = Buffer2.allocUnsafe(self2._chunkSize)), availOutAfter === 0 ? (inOff += availInBefore - availInAfter, availInBefore = availInAfter, !0) : !1;
                }
                assert(this._handle, "zlib binding closed");
                let res;
                do
                  res = this._handle.writeSync(
                    flushFlag,
                    chunk,
                    // in
                    inOff,
                    // in_off
                    availInBefore,
                    // in_len
                    this._buffer,
                    // out
                    this._offset,
                    //out_off
                    availOutBefore
                  ), res = res || this._writeState;
                while (!this._hadError && handleChunk(res[0], res[1]));
                if (this._hadError)
                  throw error;
                if (nread >= kMaxLength)
                  throw _close(this), new RangeError(
                    "Cannot create final Buffer. It would be larger than 0x" + kMaxLength.toString(16) + " bytes"
                  );
                let buf = Buffer2.concat(buffers, nread);
                return _close(this), buf;
              }, util.inherits(Inflate, zlib.Inflate);
              function zlibBufferSync(engine, buffer) {
                if (typeof buffer == "string" && (buffer = Buffer2.from(buffer)), !(buffer instanceof Buffer2))
                  throw new TypeError("Not a string or buffer");
                let flushFlag = engine._finishFlushFlag;
                return flushFlag == null && (flushFlag = zlib.Z_FINISH), engine._processChunk(buffer, flushFlag);
              }
              function inflateSync(buffer, opts) {
                return zlibBufferSync(new Inflate(opts), buffer);
              }
              module3.exports = exports3 = inflateSync, exports3.Inflate = Inflate, exports3.createInflate = createInflate, exports3.inflateSync = inflateSync;
            }).call(this);
          }).call(this, require2("_process"), require2("buffer").Buffer);
        }, { _process: 63, assert: 23, buffer: 32, util: 84, zlib: 31 }], 22: [function(require2, module3, exports3) {
          "use strict";
          let SyncReader = module3.exports = function(buffer) {
            this._buffer = buffer, this._reads = [];
          };
          SyncReader.prototype.read = function(length, callback) {
            this._reads.push({
              length: Math.abs(length),
              // if length < 0 then at most this length
              allowLess: length < 0,
              func: callback
            });
          }, SyncReader.prototype.process = function() {
            for (; this._reads.length > 0 && this._buffer.length; ) {
              let read = this._reads[0];
              if (this._buffer.length && (this._buffer.length >= read.length || read.allowLess)) {
                this._reads.shift();
                let buf = this._buffer;
                this._buffer = buf.slice(read.length), read.func.call(this, buf.slice(0, read.length));
              } else
                break;
            }
            if (this._reads.length > 0)
              throw new Error("There are some read requests waitng on finished stream");
            if (this._buffer.length > 0)
              throw new Error("unrecognised content at end of stream");
          };
        }, {}], 23: [function(require2, module3, exports3) {
          (function(global2) {
            (function() {
              "use strict";
              var objectAssign = require2("object-assign");
              function compare(a, b) {
                if (a === b)
                  return 0;
                for (var x = a.length, y = b.length, i = 0, len = Math.min(x, y); i < len; ++i)
                  if (a[i] !== b[i]) {
                    x = a[i], y = b[i];
                    break;
                  }
                return x < y ? -1 : y < x ? 1 : 0;
              }
              function isBuffer(b) {
                return global2.Buffer && typeof global2.Buffer.isBuffer == "function" ? global2.Buffer.isBuffer(b) : !!(b != null && b._isBuffer);
              }
              var util = require2("util/"), hasOwn = Object.prototype.hasOwnProperty, pSlice = Array.prototype.slice, functionsHaveNames = function() {
                return function() {
                }.name === "foo";
              }();
              function pToString(obj) {
                return Object.prototype.toString.call(obj);
              }
              function isView(arrbuf) {
                return isBuffer(arrbuf) || typeof global2.ArrayBuffer != "function" ? !1 : typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(arrbuf) : arrbuf ? !!(arrbuf instanceof DataView || arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) : !1;
              }
              var assert = module3.exports = ok, regex = /\s*function\s+([^\(\s]*)\s*/;
              function getName(func) {
                if (util.isFunction(func)) {
                  if (functionsHaveNames)
                    return func.name;
                  var str = func.toString(), match = str.match(regex);
                  return match && match[1];
                }
              }
              assert.AssertionError = function(options) {
                this.name = "AssertionError", this.actual = options.actual, this.expected = options.expected, this.operator = options.operator, options.message ? (this.message = options.message, this.generatedMessage = !1) : (this.message = getMessage(this), this.generatedMessage = !0);
                var stackStartFunction = options.stackStartFunction || fail;
                if (Error.captureStackTrace)
                  Error.captureStackTrace(this, stackStartFunction);
                else {
                  var err = new Error();
                  if (err.stack) {
                    var out = err.stack, fn_name = getName(stackStartFunction), idx = out.indexOf(`
` + fn_name);
                    if (idx >= 0) {
                      var next_line = out.indexOf(`
`, idx + 1);
                      out = out.substring(next_line + 1);
                    }
                    this.stack = out;
                  }
                }
              }, util.inherits(assert.AssertionError, Error);
              function truncate(s, n) {
                return typeof s == "string" ? s.length < n ? s : s.slice(0, n) : s;
              }
              function inspect(something) {
                if (functionsHaveNames || !util.isFunction(something))
                  return util.inspect(something);
                var rawname = getName(something), name = rawname ? ": " + rawname : "";
                return "[Function" + name + "]";
              }
              function getMessage(self2) {
                return truncate(inspect(self2.actual), 128) + " " + self2.operator + " " + truncate(inspect(self2.expected), 128);
              }
              function fail(actual, expected, message, operator, stackStartFunction) {
                throw new assert.AssertionError({
                  message,
                  actual,
                  expected,
                  operator,
                  stackStartFunction
                });
              }
              assert.fail = fail;
              function ok(value, message) {
                value || fail(value, !0, message, "==", assert.ok);
              }
              assert.ok = ok, assert.equal = function(actual, expected, message) {
                actual != expected && fail(actual, expected, message, "==", assert.equal);
              }, assert.notEqual = function(actual, expected, message) {
                actual == expected && fail(actual, expected, message, "!=", assert.notEqual);
              }, assert.deepEqual = function(actual, expected, message) {
                _deepEqual(actual, expected, !1) || fail(actual, expected, message, "deepEqual", assert.deepEqual);
              }, assert.deepStrictEqual = function(actual, expected, message) {
                _deepEqual(actual, expected, !0) || fail(actual, expected, message, "deepStrictEqual", assert.deepStrictEqual);
              };
              function _deepEqual(actual, expected, strict2, memos) {
                if (actual === expected)
                  return !0;
                if (isBuffer(actual) && isBuffer(expected))
                  return compare(actual, expected) === 0;
                if (util.isDate(actual) && util.isDate(expected))
                  return actual.getTime() === expected.getTime();
                if (util.isRegExp(actual) && util.isRegExp(expected))
                  return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase;
                if ((actual === null || typeof actual != "object") && (expected === null || typeof expected != "object"))
                  return strict2 ? actual === expected : actual == expected;
                if (isView(actual) && isView(expected) && pToString(actual) === pToString(expected) && !(actual instanceof Float32Array || actual instanceof Float64Array))
                  return compare(
                    new Uint8Array(actual.buffer),
                    new Uint8Array(expected.buffer)
                  ) === 0;
                if (isBuffer(actual) !== isBuffer(expected))
                  return !1;
                memos = memos || { actual: [], expected: [] };
                var actualIndex = memos.actual.indexOf(actual);
                return actualIndex !== -1 && actualIndex === memos.expected.indexOf(expected) ? !0 : (memos.actual.push(actual), memos.expected.push(expected), objEquiv(actual, expected, strict2, memos));
              }
              function isArguments(object) {
                return Object.prototype.toString.call(object) == "[object Arguments]";
              }
              function objEquiv(a, b, strict2, actualVisitedObjects) {
                if (a == null || b === null || b === void 0)
                  return !1;
                if (util.isPrimitive(a) || util.isPrimitive(b))
                  return a === b;
                if (strict2 && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
                  return !1;
                var aIsArgs = isArguments(a), bIsArgs = isArguments(b);
                if (aIsArgs && !bIsArgs || !aIsArgs && bIsArgs)
                  return !1;
                if (aIsArgs)
                  return a = pSlice.call(a), b = pSlice.call(b), _deepEqual(a, b, strict2);
                var ka = objectKeys(a), kb = objectKeys(b), key, i;
                if (ka.length !== kb.length)
                  return !1;
                for (ka.sort(), kb.sort(), i = ka.length - 1; i >= 0; i--)
                  if (ka[i] !== kb[i])
                    return !1;
                for (i = ka.length - 1; i >= 0; i--)
                  if (key = ka[i], !_deepEqual(a[key], b[key], strict2, actualVisitedObjects))
                    return !1;
                return !0;
              }
              assert.notDeepEqual = function(actual, expected, message) {
                _deepEqual(actual, expected, !1) && fail(actual, expected, message, "notDeepEqual", assert.notDeepEqual);
              }, assert.notDeepStrictEqual = notDeepStrictEqual;
              function notDeepStrictEqual(actual, expected, message) {
                _deepEqual(actual, expected, !0) && fail(actual, expected, message, "notDeepStrictEqual", notDeepStrictEqual);
              }
              assert.strictEqual = function(actual, expected, message) {
                actual !== expected && fail(actual, expected, message, "===", assert.strictEqual);
              }, assert.notStrictEqual = function(actual, expected, message) {
                actual === expected && fail(actual, expected, message, "!==", assert.notStrictEqual);
              };
              function expectedException(actual, expected) {
                if (!actual || !expected)
                  return !1;
                if (Object.prototype.toString.call(expected) == "[object RegExp]")
                  return expected.test(actual);
                try {
                  if (actual instanceof expected)
                    return !0;
                } catch {
                }
                return Error.isPrototypeOf(expected) ? !1 : expected.call({}, actual) === !0;
              }
              function _tryBlock(block) {
                var error;
                try {
                  block();
                } catch (e) {
                  error = e;
                }
                return error;
              }
              function _throws(shouldThrow, block, expected, message) {
                var actual;
                if (typeof block != "function")
                  throw new TypeError('"block" argument must be a function');
                typeof expected == "string" && (message = expected, expected = null), actual = _tryBlock(block), message = (expected && expected.name ? " (" + expected.name + ")." : ".") + (message ? " " + message : "."), shouldThrow && !actual && fail(actual, expected, "Missing expected exception" + message);
                var userProvidedMessage = typeof message == "string", isUnwantedException = !shouldThrow && util.isError(actual), isUnexpectedException = !shouldThrow && actual && !expected;
                if ((isUnwantedException && userProvidedMessage && expectedException(actual, expected) || isUnexpectedException) && fail(actual, expected, "Got unwanted exception" + message), shouldThrow && actual && expected && !expectedException(actual, expected) || !shouldThrow && actual)
                  throw actual;
              }
              assert.throws = function(block, error, message) {
                _throws(!0, block, error, message);
              }, assert.doesNotThrow = function(block, error, message) {
                _throws(!1, block, error, message);
              }, assert.ifError = function(err) {
                if (err) throw err;
              };
              function strict(value, message) {
                value || fail(value, !0, message, "==", strict);
              }
              assert.strict = objectAssign(strict, assert, {
                equal: assert.strictEqual,
                deepEqual: assert.deepStrictEqual,
                notEqual: assert.notStrictEqual,
                notDeepEqual: assert.notDeepStrictEqual
              }), assert.strict.strict = assert.strict;
              var objectKeys = Object.keys || function(obj) {
                var keys = [];
                for (var key in obj)
                  hasOwn.call(obj, key) && keys.push(key);
                return keys;
              };
            }).call(this);
          }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
        }, { "object-assign": 51, "util/": 26 }], 24: [function(require2, module3, exports3) {
          typeof Object.create == "function" ? module3.exports = function(ctor, superCtor) {
            ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: !1,
                writable: !0,
                configurable: !0
              }
            });
          } : module3.exports = function(ctor, superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {
            };
            TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor(), ctor.prototype.constructor = ctor;
          };
        }, {}], 25: [function(require2, module3, exports3) {
          module3.exports = function(arg) {
            return arg && typeof arg == "object" && typeof arg.copy == "function" && typeof arg.fill == "function" && typeof arg.readUInt8 == "function";
          };
        }, {}], 26: [function(require2, module3, exports3) {
          (function(process, global2) {
            (function() {
              var formatRegExp = /%[sdj%]/g;
              exports3.format = function(f) {
                if (!isString(f)) {
                  for (var objects = [], i = 0; i < arguments.length; i++)
                    objects.push(inspect(arguments[i]));
                  return objects.join(" ");
                }
                for (var i = 1, args = arguments, len = args.length, str = String(f).replace(formatRegExp, function(x2) {
                  if (x2 === "%%") return "%";
                  if (i >= len) return x2;
                  switch (x2) {
                    case "%s":
                      return String(args[i++]);
                    case "%d":
                      return Number(args[i++]);
                    case "%j":
                      try {
                        return JSON.stringify(args[i++]);
                      } catch {
                        return "[Circular]";
                      }
                    default:
                      return x2;
                  }
                }), x = args[i]; i < len; x = args[++i])
                  isNull(x) || !isObject(x) ? str += " " + x : str += " " + inspect(x);
                return str;
              }, exports3.deprecate = function(fn, msg) {
                if (isUndefined(global2.process))
                  return function() {
                    return exports3.deprecate(fn, msg).apply(this, arguments);
                  };
                if (process.noDeprecation === !0)
                  return fn;
                var warned = !1;
                function deprecated() {
                  if (!warned) {
                    if (process.throwDeprecation)
                      throw new Error(msg);
                    process.traceDeprecation ? console.trace(msg) : console.error(msg), warned = !0;
                  }
                  return fn.apply(this, arguments);
                }
                return deprecated;
              };
              var debugs = {}, debugEnviron;
              exports3.debuglog = function(set) {
                if (isUndefined(debugEnviron) && (debugEnviron = process.env.NODE_DEBUG || ""), set = set.toUpperCase(), !debugs[set])
                  if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
                    var pid = process.pid;
                    debugs[set] = function() {
                      var msg = exports3.format.apply(exports3, arguments);
                      console.error("%s %d: %s", set, pid, msg);
                    };
                  } else
                    debugs[set] = function() {
                    };
                return debugs[set];
              };
              function inspect(obj, opts) {
                var ctx = {
                  seen: [],
                  stylize: stylizeNoColor
                };
                return arguments.length >= 3 && (ctx.depth = arguments[2]), arguments.length >= 4 && (ctx.colors = arguments[3]), isBoolean(opts) ? ctx.showHidden = opts : opts && exports3._extend(ctx, opts), isUndefined(ctx.showHidden) && (ctx.showHidden = !1), isUndefined(ctx.depth) && (ctx.depth = 2), isUndefined(ctx.colors) && (ctx.colors = !1), isUndefined(ctx.customInspect) && (ctx.customInspect = !0), ctx.colors && (ctx.stylize = stylizeWithColor), formatValue(ctx, obj, ctx.depth);
              }
              exports3.inspect = inspect, inspect.colors = {
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
              }, inspect.styles = {
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
              function stylizeWithColor(str, styleType) {
                var style = inspect.styles[styleType];
                return style ? "\x1B[" + inspect.colors[style][0] + "m" + str + "\x1B[" + inspect.colors[style][1] + "m" : str;
              }
              function stylizeNoColor(str, styleType) {
                return str;
              }
              function arrayToHash(array) {
                var hash = {};
                return array.forEach(function(val, idx) {
                  hash[val] = !0;
                }), hash;
              }
              function formatValue(ctx, value, recurseTimes) {
                if (ctx.customInspect && value && isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
                value.inspect !== exports3.inspect && // Also filter out any prototype objects using the circular check.
                !(value.constructor && value.constructor.prototype === value)) {
                  var ret = value.inspect(recurseTimes, ctx);
                  return isString(ret) || (ret = formatValue(ctx, ret, recurseTimes)), ret;
                }
                var primitive = formatPrimitive(ctx, value);
                if (primitive)
                  return primitive;
                var keys = Object.keys(value), visibleKeys = arrayToHash(keys);
                if (ctx.showHidden && (keys = Object.getOwnPropertyNames(value)), isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0))
                  return formatError(value);
                if (keys.length === 0) {
                  if (isFunction(value)) {
                    var name = value.name ? ": " + value.name : "";
                    return ctx.stylize("[Function" + name + "]", "special");
                  }
                  if (isRegExp(value))
                    return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
                  if (isDate(value))
                    return ctx.stylize(Date.prototype.toString.call(value), "date");
                  if (isError(value))
                    return formatError(value);
                }
                var base = "", array = !1, braces = ["{", "}"];
                if (isArray(value) && (array = !0, braces = ["[", "]"]), isFunction(value)) {
                  var n = value.name ? ": " + value.name : "";
                  base = " [Function" + n + "]";
                }
                if (isRegExp(value) && (base = " " + RegExp.prototype.toString.call(value)), isDate(value) && (base = " " + Date.prototype.toUTCString.call(value)), isError(value) && (base = " " + formatError(value)), keys.length === 0 && (!array || value.length == 0))
                  return braces[0] + base + braces[1];
                if (recurseTimes < 0)
                  return isRegExp(value) ? ctx.stylize(RegExp.prototype.toString.call(value), "regexp") : ctx.stylize("[Object]", "special");
                ctx.seen.push(value);
                var output;
                return array ? output = formatArray(ctx, value, recurseTimes, visibleKeys, keys) : output = keys.map(function(key) {
                  return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                }), ctx.seen.pop(), reduceToSingleString(output, base, braces);
              }
              function formatPrimitive(ctx, value) {
                if (isUndefined(value))
                  return ctx.stylize("undefined", "undefined");
                if (isString(value)) {
                  var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                  return ctx.stylize(simple, "string");
                }
                if (isNumber(value))
                  return ctx.stylize("" + value, "number");
                if (isBoolean(value))
                  return ctx.stylize("" + value, "boolean");
                if (isNull(value))
                  return ctx.stylize("null", "null");
              }
              function formatError(value) {
                return "[" + Error.prototype.toString.call(value) + "]";
              }
              function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                for (var output = [], i = 0, l = value.length; i < l; ++i)
                  hasOwnProperty(value, String(i)) ? output.push(formatProperty(
                    ctx,
                    value,
                    recurseTimes,
                    visibleKeys,
                    String(i),
                    !0
                  )) : output.push("");
                return keys.forEach(function(key) {
                  key.match(/^\d+$/) || output.push(formatProperty(
                    ctx,
                    value,
                    recurseTimes,
                    visibleKeys,
                    key,
                    !0
                  ));
                }), output;
              }
              function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                var name, str, desc;
                if (desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] }, desc.get ? desc.set ? str = ctx.stylize("[Getter/Setter]", "special") : str = ctx.stylize("[Getter]", "special") : desc.set && (str = ctx.stylize("[Setter]", "special")), hasOwnProperty(visibleKeys, key) || (name = "[" + key + "]"), str || (ctx.seen.indexOf(desc.value) < 0 ? (isNull(recurseTimes) ? str = formatValue(ctx, desc.value, null) : str = formatValue(ctx, desc.value, recurseTimes - 1), str.indexOf(`
`) > -1 && (array ? str = str.split(`
`).map(function(line) {
                  return "  " + line;
                }).join(`
`).substr(2) : str = `
` + str.split(`
`).map(function(line) {
                  return "   " + line;
                }).join(`
`))) : str = ctx.stylize("[Circular]", "special")), isUndefined(name)) {
                  if (array && key.match(/^\d+$/))
                    return str;
                  name = JSON.stringify("" + key), name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (name = name.substr(1, name.length - 2), name = ctx.stylize(name, "name")) : (name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), name = ctx.stylize(name, "string"));
                }
                return name + ": " + str;
              }
              function reduceToSingleString(output, base, braces) {
                var numLinesEst = 0, length = output.reduce(function(prev, cur) {
                  return numLinesEst++, cur.indexOf(`
`) >= 0 && numLinesEst++, prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
                }, 0);
                return length > 60 ? braces[0] + (base === "" ? "" : base + `
 `) + " " + output.join(`,
  `) + " " + braces[1] : braces[0] + base + " " + output.join(", ") + " " + braces[1];
              }
              function isArray(ar) {
                return Array.isArray(ar);
              }
              exports3.isArray = isArray;
              function isBoolean(arg) {
                return typeof arg == "boolean";
              }
              exports3.isBoolean = isBoolean;
              function isNull(arg) {
                return arg === null;
              }
              exports3.isNull = isNull;
              function isNullOrUndefined(arg) {
                return arg == null;
              }
              exports3.isNullOrUndefined = isNullOrUndefined;
              function isNumber(arg) {
                return typeof arg == "number";
              }
              exports3.isNumber = isNumber;
              function isString(arg) {
                return typeof arg == "string";
              }
              exports3.isString = isString;
              function isSymbol(arg) {
                return typeof arg == "symbol";
              }
              exports3.isSymbol = isSymbol;
              function isUndefined(arg) {
                return arg === void 0;
              }
              exports3.isUndefined = isUndefined;
              function isRegExp(re) {
                return isObject(re) && objectToString(re) === "[object RegExp]";
              }
              exports3.isRegExp = isRegExp;
              function isObject(arg) {
                return typeof arg == "object" && arg !== null;
              }
              exports3.isObject = isObject;
              function isDate(d) {
                return isObject(d) && objectToString(d) === "[object Date]";
              }
              exports3.isDate = isDate;
              function isError(e) {
                return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
              }
              exports3.isError = isError;
              function isFunction(arg) {
                return typeof arg == "function";
              }
              exports3.isFunction = isFunction;
              function isPrimitive(arg) {
                return arg === null || typeof arg == "boolean" || typeof arg == "number" || typeof arg == "string" || typeof arg == "symbol" || // ES6 symbol
                typeof arg > "u";
              }
              exports3.isPrimitive = isPrimitive, exports3.isBuffer = require2("./support/isBuffer");
              function objectToString(o) {
                return Object.prototype.toString.call(o);
              }
              function pad(n) {
                return n < 10 ? "0" + n.toString(10) : n.toString(10);
              }
              var months = [
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
              function timestamp() {
                var d = /* @__PURE__ */ new Date(), time = [
                  pad(d.getHours()),
                  pad(d.getMinutes()),
                  pad(d.getSeconds())
                ].join(":");
                return [d.getDate(), months[d.getMonth()], time].join(" ");
              }
              exports3.log = function() {
                console.log("%s - %s", timestamp(), exports3.format.apply(exports3, arguments));
              }, exports3.inherits = require2("inherits"), exports3._extend = function(origin, add) {
                if (!add || !isObject(add)) return origin;
                for (var keys = Object.keys(add), i = keys.length; i--; )
                  origin[keys[i]] = add[keys[i]];
                return origin;
              };
              function hasOwnProperty(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop);
              }
            }).call(this);
          }).call(this, require2("_process"), typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
        }, { "./support/isBuffer": 25, _process: 63, inherits: 24 }], 27: [function(require2, module3, exports3) {
          (function(global2) {
            (function() {
              "use strict";
              var possibleNames = [
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
              ], g = typeof globalThis > "u" ? global2 : globalThis;
              module3.exports = function() {
                for (var out = [], i = 0; i < possibleNames.length; i++)
                  typeof g[possibleNames[i]] == "function" && (out[out.length] = possibleNames[i]);
                return out;
              };
            }).call(this);
          }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
        }, {}], 28: [function(require2, module3, exports3) {
          "use strict";
          exports3.byteLength = byteLength, exports3.toByteArray = toByteArray, exports3.fromByteArray = fromByteArray;
          for (var lookup = [], revLookup = [], Arr = typeof Uint8Array < "u" ? Uint8Array : Array, code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i = 0, len = code.length; i < len; ++i)
            lookup[i] = code[i], revLookup[code.charCodeAt(i)] = i;
          revLookup[45] = 62, revLookup[95] = 63;
          function getLens(b64) {
            var len2 = b64.length;
            if (len2 % 4 > 0)
              throw new Error("Invalid string. Length must be a multiple of 4");
            var validLen = b64.indexOf("=");
            validLen === -1 && (validLen = len2);
            var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
            return [validLen, placeHoldersLen];
          }
          function byteLength(b64) {
            var lens = getLens(b64), validLen = lens[0], placeHoldersLen = lens[1];
            return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
          }
          function _byteLength(b64, validLen, placeHoldersLen) {
            return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
          }
          function toByteArray(b64) {
            var tmp, lens = getLens(b64), validLen = lens[0], placeHoldersLen = lens[1], arr = new Arr(_byteLength(b64, validLen, placeHoldersLen)), curByte = 0, len2 = placeHoldersLen > 0 ? validLen - 4 : validLen, i2;
            for (i2 = 0; i2 < len2; i2 += 4)
              tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)], arr[curByte++] = tmp >> 16 & 255, arr[curByte++] = tmp >> 8 & 255, arr[curByte++] = tmp & 255;
            return placeHoldersLen === 2 && (tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4, arr[curByte++] = tmp & 255), placeHoldersLen === 1 && (tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2, arr[curByte++] = tmp >> 8 & 255, arr[curByte++] = tmp & 255), arr;
          }
          function tripletToBase64(num) {
            return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
          }
          function encodeChunk(uint8, start, end) {
            for (var tmp, output = [], i2 = start; i2 < end; i2 += 3)
              tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255), output.push(tripletToBase64(tmp));
            return output.join("");
          }
          function fromByteArray(uint8) {
            for (var tmp, len2 = uint8.length, extraBytes = len2 % 3, parts = [], maxChunkLength = 16383, i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength)
              parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
            return extraBytes === 1 ? (tmp = uint8[len2 - 1], parts.push(
              lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
            )) : extraBytes === 2 && (tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1], parts.push(
              lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
            )), parts.join("");
          }
        }, {}], 29: [function(require2, module3, exports3) {
        }, {}], 30: [function(require2, module3, exports3) {
          (function(process, Buffer2) {
            (function() {
              "use strict";
              var assert = require2("assert"), Zstream = require2("pako/lib/zlib/zstream"), zlib_deflate = require2("pako/lib/zlib/deflate.js"), zlib_inflate = require2("pako/lib/zlib/inflate.js"), constants = require2("pako/lib/zlib/constants");
              for (var key in constants)
                exports3[key] = constants[key];
              exports3.NONE = 0, exports3.DEFLATE = 1, exports3.INFLATE = 2, exports3.GZIP = 3, exports3.GUNZIP = 4, exports3.DEFLATERAW = 5, exports3.INFLATERAW = 6, exports3.UNZIP = 7;
              var GZIP_HEADER_ID1 = 31, GZIP_HEADER_ID2 = 139;
              function Zlib(mode) {
                if (typeof mode != "number" || mode < exports3.DEFLATE || mode > exports3.UNZIP)
                  throw new TypeError("Bad argument");
                this.dictionary = null, this.err = 0, this.flush = 0, this.init_done = !1, this.level = 0, this.memLevel = 0, this.mode = mode, this.strategy = 0, this.windowBits = 0, this.write_in_progress = !1, this.pending_close = !1, this.gzip_id_bytes_read = 0;
              }
              Zlib.prototype.close = function() {
                if (this.write_in_progress) {
                  this.pending_close = !0;
                  return;
                }
                this.pending_close = !1, assert(this.init_done, "close before init"), assert(this.mode <= exports3.UNZIP), this.mode === exports3.DEFLATE || this.mode === exports3.GZIP || this.mode === exports3.DEFLATERAW ? zlib_deflate.deflateEnd(this.strm) : (this.mode === exports3.INFLATE || this.mode === exports3.GUNZIP || this.mode === exports3.INFLATERAW || this.mode === exports3.UNZIP) && zlib_inflate.inflateEnd(this.strm), this.mode = exports3.NONE, this.dictionary = null;
              }, Zlib.prototype.write = function(flush, input, in_off, in_len, out, out_off, out_len) {
                return this._write(!0, flush, input, in_off, in_len, out, out_off, out_len);
              }, Zlib.prototype.writeSync = function(flush, input, in_off, in_len, out, out_off, out_len) {
                return this._write(!1, flush, input, in_off, in_len, out, out_off, out_len);
              }, Zlib.prototype._write = function(async, flush, input, in_off, in_len, out, out_off, out_len) {
                if (assert.equal(arguments.length, 8), assert(this.init_done, "write before init"), assert(this.mode !== exports3.NONE, "already finalized"), assert.equal(!1, this.write_in_progress, "write already in progress"), assert.equal(!1, this.pending_close, "close is pending"), this.write_in_progress = !0, assert.equal(!1, flush === void 0, "must provide flush value"), this.write_in_progress = !0, flush !== exports3.Z_NO_FLUSH && flush !== exports3.Z_PARTIAL_FLUSH && flush !== exports3.Z_SYNC_FLUSH && flush !== exports3.Z_FULL_FLUSH && flush !== exports3.Z_FINISH && flush !== exports3.Z_BLOCK)
                  throw new Error("Invalid flush value");
                if (input == null && (input = Buffer2.alloc(0), in_len = 0, in_off = 0), this.strm.avail_in = in_len, this.strm.input = input, this.strm.next_in = in_off, this.strm.avail_out = out_len, this.strm.output = out, this.strm.next_out = out_off, this.flush = flush, !async)
                  return this._process(), this._checkError() ? this._afterSync() : void 0;
                var self2 = this;
                return process.nextTick(function() {
                  self2._process(), self2._after();
                }), this;
              }, Zlib.prototype._afterSync = function() {
                var avail_out = this.strm.avail_out, avail_in = this.strm.avail_in;
                return this.write_in_progress = !1, [avail_in, avail_out];
              }, Zlib.prototype._process = function() {
                var next_expected_header_byte = null;
                switch (this.mode) {
                  case exports3.DEFLATE:
                  case exports3.GZIP:
                  case exports3.DEFLATERAW:
                    this.err = zlib_deflate.deflate(this.strm, this.flush);
                    break;
                  case exports3.UNZIP:
                    switch (this.strm.avail_in > 0 && (next_expected_header_byte = this.strm.next_in), this.gzip_id_bytes_read) {
                      case 0:
                        if (next_expected_header_byte === null)
                          break;
                        if (this.strm.input[next_expected_header_byte] === GZIP_HEADER_ID1) {
                          if (this.gzip_id_bytes_read = 1, next_expected_header_byte++, this.strm.avail_in === 1)
                            break;
                        } else {
                          this.mode = exports3.INFLATE;
                          break;
                        }
                      case 1:
                        if (next_expected_header_byte === null)
                          break;
                        this.strm.input[next_expected_header_byte] === GZIP_HEADER_ID2 ? (this.gzip_id_bytes_read = 2, this.mode = exports3.GUNZIP) : this.mode = exports3.INFLATE;
                        break;
                      default:
                        throw new Error("invalid number of gzip magic number bytes read");
                    }
                  case exports3.INFLATE:
                  case exports3.GUNZIP:
                  case exports3.INFLATERAW:
                    for (this.err = zlib_inflate.inflate(
                      this.strm,
                      this.flush
                      // If data was encoded with dictionary
                    ), this.err === exports3.Z_NEED_DICT && this.dictionary && (this.err = zlib_inflate.inflateSetDictionary(this.strm, this.dictionary), this.err === exports3.Z_OK ? this.err = zlib_inflate.inflate(this.strm, this.flush) : this.err === exports3.Z_DATA_ERROR && (this.err = exports3.Z_NEED_DICT)); this.strm.avail_in > 0 && this.mode === exports3.GUNZIP && this.err === exports3.Z_STREAM_END && this.strm.next_in[0] !== 0; )
                      this.reset(), this.err = zlib_inflate.inflate(this.strm, this.flush);
                    break;
                  default:
                    throw new Error("Unknown mode " + this.mode);
                }
              }, Zlib.prototype._checkError = function() {
                switch (this.err) {
                  case exports3.Z_OK:
                  case exports3.Z_BUF_ERROR:
                    if (this.strm.avail_out !== 0 && this.flush === exports3.Z_FINISH)
                      return this._error("unexpected end of file"), !1;
                    break;
                  case exports3.Z_STREAM_END:
                    break;
                  case exports3.Z_NEED_DICT:
                    return this.dictionary == null ? this._error("Missing dictionary") : this._error("Bad dictionary"), !1;
                  default:
                    return this._error("Zlib error"), !1;
                }
                return !0;
              }, Zlib.prototype._after = function() {
                if (this._checkError()) {
                  var avail_out = this.strm.avail_out, avail_in = this.strm.avail_in;
                  this.write_in_progress = !1, this.callback(avail_in, avail_out), this.pending_close && this.close();
                }
              }, Zlib.prototype._error = function(message) {
                this.strm.msg && (message = this.strm.msg), this.onerror(
                  message,
                  this.err
                  // no hope of rescue.
                ), this.write_in_progress = !1, this.pending_close && this.close();
              }, Zlib.prototype.init = function(windowBits, level, memLevel, strategy, dictionary) {
                assert(arguments.length === 4 || arguments.length === 5, "init(windowBits, level, memLevel, strategy, [dictionary])"), assert(windowBits >= 8 && windowBits <= 15, "invalid windowBits"), assert(level >= -1 && level <= 9, "invalid compression level"), assert(memLevel >= 1 && memLevel <= 9, "invalid memlevel"), assert(strategy === exports3.Z_FILTERED || strategy === exports3.Z_HUFFMAN_ONLY || strategy === exports3.Z_RLE || strategy === exports3.Z_FIXED || strategy === exports3.Z_DEFAULT_STRATEGY, "invalid strategy"), this._init(level, windowBits, memLevel, strategy, dictionary), this._setDictionary();
              }, Zlib.prototype.params = function() {
                throw new Error("deflateParams Not supported");
              }, Zlib.prototype.reset = function() {
                this._reset(), this._setDictionary();
              }, Zlib.prototype._init = function(level, windowBits, memLevel, strategy, dictionary) {
                switch (this.level = level, this.windowBits = windowBits, this.memLevel = memLevel, this.strategy = strategy, this.flush = exports3.Z_NO_FLUSH, this.err = exports3.Z_OK, (this.mode === exports3.GZIP || this.mode === exports3.GUNZIP) && (this.windowBits += 16), this.mode === exports3.UNZIP && (this.windowBits += 32), (this.mode === exports3.DEFLATERAW || this.mode === exports3.INFLATERAW) && (this.windowBits = -1 * this.windowBits), this.strm = new Zstream(), this.mode) {
                  case exports3.DEFLATE:
                  case exports3.GZIP:
                  case exports3.DEFLATERAW:
                    this.err = zlib_deflate.deflateInit2(this.strm, this.level, exports3.Z_DEFLATED, this.windowBits, this.memLevel, this.strategy);
                    break;
                  case exports3.INFLATE:
                  case exports3.GUNZIP:
                  case exports3.INFLATERAW:
                  case exports3.UNZIP:
                    this.err = zlib_inflate.inflateInit2(this.strm, this.windowBits);
                    break;
                  default:
                    throw new Error("Unknown mode " + this.mode);
                }
                this.err !== exports3.Z_OK && this._error("Init error"), this.dictionary = dictionary, this.write_in_progress = !1, this.init_done = !0;
              }, Zlib.prototype._setDictionary = function() {
                if (this.dictionary != null) {
                  switch (this.err = exports3.Z_OK, this.mode) {
                    case exports3.DEFLATE:
                    case exports3.DEFLATERAW:
                      this.err = zlib_deflate.deflateSetDictionary(this.strm, this.dictionary);
                      break;
                    default:
                      break;
                  }
                  this.err !== exports3.Z_OK && this._error("Failed to set dictionary");
                }
              }, Zlib.prototype._reset = function() {
                switch (this.err = exports3.Z_OK, this.mode) {
                  case exports3.DEFLATE:
                  case exports3.DEFLATERAW:
                  case exports3.GZIP:
                    this.err = zlib_deflate.deflateReset(this.strm);
                    break;
                  case exports3.INFLATE:
                  case exports3.INFLATERAW:
                  case exports3.GUNZIP:
                    this.err = zlib_inflate.inflateReset(this.strm);
                    break;
                  default:
                    break;
                }
                this.err !== exports3.Z_OK && this._error("Failed to reset stream");
              }, exports3.Zlib = Zlib;
            }).call(this);
          }).call(this, require2("_process"), require2("buffer").Buffer);
        }, { _process: 63, assert: 23, buffer: 32, "pako/lib/zlib/constants": 54, "pako/lib/zlib/deflate.js": 56, "pako/lib/zlib/inflate.js": 58, "pako/lib/zlib/zstream": 62 }], 31: [function(require2, module3, exports3) {
          (function(process) {
            (function() {
              "use strict";
              var Buffer2 = require2("buffer").Buffer, Transform = require2("stream").Transform, binding = require2("./binding"), util = require2("util"), assert = require2("assert").ok, kMaxLength = require2("buffer").kMaxLength, kRangeErrorMessage = "Cannot create final Buffer. It would be larger than 0x" + kMaxLength.toString(16) + " bytes";
              binding.Z_MIN_WINDOWBITS = 8, binding.Z_MAX_WINDOWBITS = 15, binding.Z_DEFAULT_WINDOWBITS = 15, binding.Z_MIN_CHUNK = 64, binding.Z_MAX_CHUNK = 1 / 0, binding.Z_DEFAULT_CHUNK = 16 * 1024, binding.Z_MIN_MEMLEVEL = 1, binding.Z_MAX_MEMLEVEL = 9, binding.Z_DEFAULT_MEMLEVEL = 8, binding.Z_MIN_LEVEL = -1, binding.Z_MAX_LEVEL = 9, binding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION;
              for (var bkeys = Object.keys(binding), bk = 0; bk < bkeys.length; bk++) {
                var bkey = bkeys[bk];
                bkey.match(/^Z/) && Object.defineProperty(exports3, bkey, {
                  enumerable: !0,
                  value: binding[bkey],
                  writable: !1
                });
              }
              for (var codes = {
                Z_OK: binding.Z_OK,
                Z_STREAM_END: binding.Z_STREAM_END,
                Z_NEED_DICT: binding.Z_NEED_DICT,
                Z_ERRNO: binding.Z_ERRNO,
                Z_STREAM_ERROR: binding.Z_STREAM_ERROR,
                Z_DATA_ERROR: binding.Z_DATA_ERROR,
                Z_MEM_ERROR: binding.Z_MEM_ERROR,
                Z_BUF_ERROR: binding.Z_BUF_ERROR,
                Z_VERSION_ERROR: binding.Z_VERSION_ERROR
              }, ckeys = Object.keys(codes), ck = 0; ck < ckeys.length; ck++) {
                var ckey = ckeys[ck];
                codes[codes[ckey]] = ckey;
              }
              Object.defineProperty(exports3, "codes", {
                enumerable: !0,
                value: Object.freeze(codes),
                writable: !1
              }), exports3.Deflate = Deflate, exports3.Inflate = Inflate, exports3.Gzip = Gzip, exports3.Gunzip = Gunzip, exports3.DeflateRaw = DeflateRaw, exports3.InflateRaw = InflateRaw, exports3.Unzip = Unzip, exports3.createDeflate = function(o) {
                return new Deflate(o);
              }, exports3.createInflate = function(o) {
                return new Inflate(o);
              }, exports3.createDeflateRaw = function(o) {
                return new DeflateRaw(o);
              }, exports3.createInflateRaw = function(o) {
                return new InflateRaw(o);
              }, exports3.createGzip = function(o) {
                return new Gzip(o);
              }, exports3.createGunzip = function(o) {
                return new Gunzip(o);
              }, exports3.createUnzip = function(o) {
                return new Unzip(o);
              }, exports3.deflate = function(buffer, opts, callback) {
                return typeof opts == "function" && (callback = opts, opts = {}), zlibBuffer(new Deflate(opts), buffer, callback);
              }, exports3.deflateSync = function(buffer, opts) {
                return zlibBufferSync(new Deflate(opts), buffer);
              }, exports3.gzip = function(buffer, opts, callback) {
                return typeof opts == "function" && (callback = opts, opts = {}), zlibBuffer(new Gzip(opts), buffer, callback);
              }, exports3.gzipSync = function(buffer, opts) {
                return zlibBufferSync(new Gzip(opts), buffer);
              }, exports3.deflateRaw = function(buffer, opts, callback) {
                return typeof opts == "function" && (callback = opts, opts = {}), zlibBuffer(new DeflateRaw(opts), buffer, callback);
              }, exports3.deflateRawSync = function(buffer, opts) {
                return zlibBufferSync(new DeflateRaw(opts), buffer);
              }, exports3.unzip = function(buffer, opts, callback) {
                return typeof opts == "function" && (callback = opts, opts = {}), zlibBuffer(new Unzip(opts), buffer, callback);
              }, exports3.unzipSync = function(buffer, opts) {
                return zlibBufferSync(new Unzip(opts), buffer);
              }, exports3.inflate = function(buffer, opts, callback) {
                return typeof opts == "function" && (callback = opts, opts = {}), zlibBuffer(new Inflate(opts), buffer, callback);
              }, exports3.inflateSync = function(buffer, opts) {
                return zlibBufferSync(new Inflate(opts), buffer);
              }, exports3.gunzip = function(buffer, opts, callback) {
                return typeof opts == "function" && (callback = opts, opts = {}), zlibBuffer(new Gunzip(opts), buffer, callback);
              }, exports3.gunzipSync = function(buffer, opts) {
                return zlibBufferSync(new Gunzip(opts), buffer);
              }, exports3.inflateRaw = function(buffer, opts, callback) {
                return typeof opts == "function" && (callback = opts, opts = {}), zlibBuffer(new InflateRaw(opts), buffer, callback);
              }, exports3.inflateRawSync = function(buffer, opts) {
                return zlibBufferSync(new InflateRaw(opts), buffer);
              };
              function zlibBuffer(engine, buffer, callback) {
                var buffers = [], nread = 0;
                engine.on("error", onError), engine.on("end", onEnd), engine.end(buffer), flow();
                function flow() {
                  for (var chunk; (chunk = engine.read()) !== null; )
                    buffers.push(chunk), nread += chunk.length;
                  engine.once("readable", flow);
                }
                function onError(err) {
                  engine.removeListener("end", onEnd), engine.removeListener("readable", flow), callback(err);
                }
                function onEnd() {
                  var buf, err = null;
                  nread >= kMaxLength ? err = new RangeError(kRangeErrorMessage) : buf = Buffer2.concat(buffers, nread), buffers = [], engine.close(), callback(err, buf);
                }
              }
              function zlibBufferSync(engine, buffer) {
                if (typeof buffer == "string" && (buffer = Buffer2.from(buffer)), !Buffer2.isBuffer(buffer)) throw new TypeError("Not a string or buffer");
                var flushFlag = engine._finishFlushFlag;
                return engine._processChunk(buffer, flushFlag);
              }
              function Deflate(opts) {
                if (!(this instanceof Deflate)) return new Deflate(opts);
                Zlib.call(this, opts, binding.DEFLATE);
              }
              function Inflate(opts) {
                if (!(this instanceof Inflate)) return new Inflate(opts);
                Zlib.call(this, opts, binding.INFLATE);
              }
              function Gzip(opts) {
                if (!(this instanceof Gzip)) return new Gzip(opts);
                Zlib.call(this, opts, binding.GZIP);
              }
              function Gunzip(opts) {
                if (!(this instanceof Gunzip)) return new Gunzip(opts);
                Zlib.call(this, opts, binding.GUNZIP);
              }
              function DeflateRaw(opts) {
                if (!(this instanceof DeflateRaw)) return new DeflateRaw(opts);
                Zlib.call(this, opts, binding.DEFLATERAW);
              }
              function InflateRaw(opts) {
                if (!(this instanceof InflateRaw)) return new InflateRaw(opts);
                Zlib.call(this, opts, binding.INFLATERAW);
              }
              function Unzip(opts) {
                if (!(this instanceof Unzip)) return new Unzip(opts);
                Zlib.call(this, opts, binding.UNZIP);
              }
              function isValidFlushFlag(flag) {
                return flag === binding.Z_NO_FLUSH || flag === binding.Z_PARTIAL_FLUSH || flag === binding.Z_SYNC_FLUSH || flag === binding.Z_FULL_FLUSH || flag === binding.Z_FINISH || flag === binding.Z_BLOCK;
              }
              function Zlib(opts, mode) {
                var _this = this;
                if (this._opts = opts = opts || {}, this._chunkSize = opts.chunkSize || exports3.Z_DEFAULT_CHUNK, Transform.call(this, opts), opts.flush && !isValidFlushFlag(opts.flush))
                  throw new Error("Invalid flush flag: " + opts.flush);
                if (opts.finishFlush && !isValidFlushFlag(opts.finishFlush))
                  throw new Error("Invalid flush flag: " + opts.finishFlush);
                if (this._flushFlag = opts.flush || binding.Z_NO_FLUSH, this._finishFlushFlag = typeof opts.finishFlush < "u" ? opts.finishFlush : binding.Z_FINISH, opts.chunkSize && (opts.chunkSize < exports3.Z_MIN_CHUNK || opts.chunkSize > exports3.Z_MAX_CHUNK))
                  throw new Error("Invalid chunk size: " + opts.chunkSize);
                if (opts.windowBits && (opts.windowBits < exports3.Z_MIN_WINDOWBITS || opts.windowBits > exports3.Z_MAX_WINDOWBITS))
                  throw new Error("Invalid windowBits: " + opts.windowBits);
                if (opts.level && (opts.level < exports3.Z_MIN_LEVEL || opts.level > exports3.Z_MAX_LEVEL))
                  throw new Error("Invalid compression level: " + opts.level);
                if (opts.memLevel && (opts.memLevel < exports3.Z_MIN_MEMLEVEL || opts.memLevel > exports3.Z_MAX_MEMLEVEL))
                  throw new Error("Invalid memLevel: " + opts.memLevel);
                if (opts.strategy && opts.strategy != exports3.Z_FILTERED && opts.strategy != exports3.Z_HUFFMAN_ONLY && opts.strategy != exports3.Z_RLE && opts.strategy != exports3.Z_FIXED && opts.strategy != exports3.Z_DEFAULT_STRATEGY)
                  throw new Error("Invalid strategy: " + opts.strategy);
                if (opts.dictionary && !Buffer2.isBuffer(opts.dictionary))
                  throw new Error("Invalid dictionary: it should be a Buffer instance");
                this._handle = new binding.Zlib(mode);
                var self2 = this;
                this._hadError = !1, this._handle.onerror = function(message, errno) {
                  _close(self2), self2._hadError = !0;
                  var error = new Error(message);
                  error.errno = errno, error.code = exports3.codes[errno], self2.emit("error", error);
                };
                var level = exports3.Z_DEFAULT_COMPRESSION;
                typeof opts.level == "number" && (level = opts.level);
                var strategy = exports3.Z_DEFAULT_STRATEGY;
                typeof opts.strategy == "number" && (strategy = opts.strategy), this._handle.init(opts.windowBits || exports3.Z_DEFAULT_WINDOWBITS, level, opts.memLevel || exports3.Z_DEFAULT_MEMLEVEL, strategy, opts.dictionary), this._buffer = Buffer2.allocUnsafe(this._chunkSize), this._offset = 0, this._level = level, this._strategy = strategy, this.once("end", this.close), Object.defineProperty(this, "_closed", {
                  get: function() {
                    return !_this._handle;
                  },
                  configurable: !0,
                  enumerable: !0
                });
              }
              util.inherits(Zlib, Transform), Zlib.prototype.params = function(level, strategy, callback) {
                if (level < exports3.Z_MIN_LEVEL || level > exports3.Z_MAX_LEVEL)
                  throw new RangeError("Invalid compression level: " + level);
                if (strategy != exports3.Z_FILTERED && strategy != exports3.Z_HUFFMAN_ONLY && strategy != exports3.Z_RLE && strategy != exports3.Z_FIXED && strategy != exports3.Z_DEFAULT_STRATEGY)
                  throw new TypeError("Invalid strategy: " + strategy);
                if (this._level !== level || this._strategy !== strategy) {
                  var self2 = this;
                  this.flush(binding.Z_SYNC_FLUSH, function() {
                    assert(self2._handle, "zlib binding closed"), self2._handle.params(level, strategy), self2._hadError || (self2._level = level, self2._strategy = strategy, callback && callback());
                  });
                } else
                  process.nextTick(callback);
              }, Zlib.prototype.reset = function() {
                return assert(this._handle, "zlib binding closed"), this._handle.reset();
              }, Zlib.prototype._flush = function(callback) {
                this._transform(Buffer2.alloc(0), "", callback);
              }, Zlib.prototype.flush = function(kind, callback) {
                var _this2 = this, ws = this._writableState;
                (typeof kind == "function" || kind === void 0 && !callback) && (callback = kind, kind = binding.Z_FULL_FLUSH), ws.ended ? callback && process.nextTick(callback) : ws.ending ? callback && this.once("end", callback) : ws.needDrain ? callback && this.once("drain", function() {
                  return _this2.flush(kind, callback);
                }) : (this._flushFlag = kind, this.write(Buffer2.alloc(0), "", callback));
              }, Zlib.prototype.close = function(callback) {
                _close(this, callback), process.nextTick(emitCloseNT, this);
              };
              function _close(engine, callback) {
                callback && process.nextTick(callback), engine._handle && (engine._handle.close(), engine._handle = null);
              }
              function emitCloseNT(self2) {
                self2.emit("close");
              }
              Zlib.prototype._transform = function(chunk, encoding, cb) {
                var flushFlag, ws = this._writableState, ending = ws.ending || ws.ended, last = ending && (!chunk || ws.length === chunk.length);
                if (chunk !== null && !Buffer2.isBuffer(chunk)) return cb(new Error("invalid input"));
                if (!this._handle) return cb(new Error("zlib binding closed"));
                last ? flushFlag = this._finishFlushFlag : (flushFlag = this._flushFlag, chunk.length >= ws.length && (this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH)), this._processChunk(chunk, flushFlag, cb);
              }, Zlib.prototype._processChunk = function(chunk, flushFlag, cb) {
                var availInBefore = chunk && chunk.length, availOutBefore = this._chunkSize - this._offset, inOff = 0, self2 = this, async = typeof cb == "function";
                if (!async) {
                  var buffers = [], nread = 0, error;
                  this.on("error", function(er) {
                    error = er;
                  }), assert(this._handle, "zlib binding closed");
                  do
                    var res = this._handle.writeSync(
                      flushFlag,
                      chunk,
                      // in
                      inOff,
                      // in_off
                      availInBefore,
                      // in_len
                      this._buffer,
                      // out
                      this._offset,
                      //out_off
                      availOutBefore
                    );
                  while (!this._hadError && callback(res[0], res[1]));
                  if (this._hadError)
                    throw error;
                  if (nread >= kMaxLength)
                    throw _close(this), new RangeError(kRangeErrorMessage);
                  var buf = Buffer2.concat(buffers, nread);
                  return _close(this), buf;
                }
                assert(this._handle, "zlib binding closed");
                var req = this._handle.write(
                  flushFlag,
                  chunk,
                  // in
                  inOff,
                  // in_off
                  availInBefore,
                  // in_len
                  this._buffer,
                  // out
                  this._offset,
                  //out_off
                  availOutBefore
                );
                req.buffer = chunk, req.callback = callback;
                function callback(availInAfter, availOutAfter) {
                  if (this && (this.buffer = null, this.callback = null), !self2._hadError) {
                    var have = availOutBefore - availOutAfter;
                    if (assert(have >= 0, "have should not go down"), have > 0) {
                      var out = self2._buffer.slice(self2._offset, self2._offset + have);
                      self2._offset += have, async ? self2.push(out) : (buffers.push(out), nread += out.length);
                    }
                    if ((availOutAfter === 0 || self2._offset >= self2._chunkSize) && (availOutBefore = self2._chunkSize, self2._offset = 0, self2._buffer = Buffer2.allocUnsafe(self2._chunkSize)), availOutAfter === 0) {
                      if (inOff += availInBefore - availInAfter, availInBefore = availInAfter, !async) return !0;
                      var newReq = self2._handle.write(flushFlag, chunk, inOff, availInBefore, self2._buffer, self2._offset, self2._chunkSize);
                      newReq.callback = callback, newReq.buffer = chunk;
                      return;
                    }
                    if (!async) return !1;
                    cb();
                  }
                }
              }, util.inherits(Deflate, Zlib), util.inherits(Inflate, Zlib), util.inherits(Gzip, Zlib), util.inherits(Gunzip, Zlib), util.inherits(DeflateRaw, Zlib), util.inherits(InflateRaw, Zlib), util.inherits(Unzip, Zlib);
            }).call(this);
          }).call(this, require2("_process"));
        }, { "./binding": 30, _process: 63, assert: 23, buffer: 32, stream: 65, util: 84 }], 32: [function(require2, module3, exports3) {
          (function(Buffer2) {
            (function() {
              "use strict";
              var base64 = require2("base64-js"), ieee754 = require2("ieee754");
              exports3.Buffer = Buffer3, exports3.SlowBuffer = SlowBuffer, exports3.INSPECT_MAX_BYTES = 50;
              var K_MAX_LENGTH = 2147483647;
              exports3.kMaxLength = K_MAX_LENGTH, Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport(), !Buffer3.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
                "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
              );
              function typedArraySupport() {
                try {
                  var arr = new Uint8Array(1);
                  return arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function() {
                    return 42;
                  } }, arr.foo() === 42;
                } catch {
                  return !1;
                }
              }
              Object.defineProperty(Buffer3.prototype, "parent", {
                enumerable: !0,
                get: function() {
                  if (Buffer3.isBuffer(this))
                    return this.buffer;
                }
              }), Object.defineProperty(Buffer3.prototype, "offset", {
                enumerable: !0,
                get: function() {
                  if (Buffer3.isBuffer(this))
                    return this.byteOffset;
                }
              });
              function createBuffer(length) {
                if (length > K_MAX_LENGTH)
                  throw new RangeError('The value "' + length + '" is invalid for option "size"');
                var buf = new Uint8Array(length);
                return buf.__proto__ = Buffer3.prototype, buf;
              }
              function Buffer3(arg, encodingOrOffset, length) {
                if (typeof arg == "number") {
                  if (typeof encodingOrOffset == "string")
                    throw new TypeError(
                      'The "string" argument must be of type string. Received type number'
                    );
                  return allocUnsafe(arg);
                }
                return from(arg, encodingOrOffset, length);
              }
              typeof Symbol < "u" && Symbol.species != null && Buffer3[Symbol.species] === Buffer3 && Object.defineProperty(Buffer3, Symbol.species, {
                value: null,
                configurable: !0,
                enumerable: !1,
                writable: !1
              }), Buffer3.poolSize = 8192;
              function from(value, encodingOrOffset, length) {
                if (typeof value == "string")
                  return fromString(value, encodingOrOffset);
                if (ArrayBuffer.isView(value))
                  return fromArrayLike(value);
                if (value == null)
                  throw TypeError(
                    "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
                  );
                if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer))
                  return fromArrayBuffer(value, encodingOrOffset, length);
                if (typeof value == "number")
                  throw new TypeError(
                    'The "value" argument must not be of type number. Received type number'
                  );
                var valueOf = value.valueOf && value.valueOf();
                if (valueOf != null && valueOf !== value)
                  return Buffer3.from(valueOf, encodingOrOffset, length);
                var b = fromObject(value);
                if (b) return b;
                if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] == "function")
                  return Buffer3.from(
                    value[Symbol.toPrimitive]("string"),
                    encodingOrOffset,
                    length
                  );
                throw new TypeError(
                  "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
                );
              }
              Buffer3.from = function(value, encodingOrOffset, length) {
                return from(value, encodingOrOffset, length);
              }, Buffer3.prototype.__proto__ = Uint8Array.prototype, Buffer3.__proto__ = Uint8Array;
              function assertSize(size) {
                if (typeof size != "number")
                  throw new TypeError('"size" argument must be of type number');
                if (size < 0)
                  throw new RangeError('The value "' + size + '" is invalid for option "size"');
              }
              function alloc(size, fill, encoding) {
                return assertSize(size), size <= 0 ? createBuffer(size) : fill !== void 0 ? typeof encoding == "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill) : createBuffer(size);
              }
              Buffer3.alloc = function(size, fill, encoding) {
                return alloc(size, fill, encoding);
              };
              function allocUnsafe(size) {
                return assertSize(size), createBuffer(size < 0 ? 0 : checked(size) | 0);
              }
              Buffer3.allocUnsafe = function(size) {
                return allocUnsafe(size);
              }, Buffer3.allocUnsafeSlow = function(size) {
                return allocUnsafe(size);
              };
              function fromString(string, encoding) {
                if ((typeof encoding != "string" || encoding === "") && (encoding = "utf8"), !Buffer3.isEncoding(encoding))
                  throw new TypeError("Unknown encoding: " + encoding);
                var length = byteLength(string, encoding) | 0, buf = createBuffer(length), actual = buf.write(string, encoding);
                return actual !== length && (buf = buf.slice(0, actual)), buf;
              }
              function fromArrayLike(array) {
                for (var length = array.length < 0 ? 0 : checked(array.length) | 0, buf = createBuffer(length), i = 0; i < length; i += 1)
                  buf[i] = array[i] & 255;
                return buf;
              }
              function fromArrayBuffer(array, byteOffset, length) {
                if (byteOffset < 0 || array.byteLength < byteOffset)
                  throw new RangeError('"offset" is outside of buffer bounds');
                if (array.byteLength < byteOffset + (length || 0))
                  throw new RangeError('"length" is outside of buffer bounds');
                var buf;
                return byteOffset === void 0 && length === void 0 ? buf = new Uint8Array(array) : length === void 0 ? buf = new Uint8Array(array, byteOffset) : buf = new Uint8Array(array, byteOffset, length), buf.__proto__ = Buffer3.prototype, buf;
              }
              function fromObject(obj) {
                if (Buffer3.isBuffer(obj)) {
                  var len = checked(obj.length) | 0, buf = createBuffer(len);
                  return buf.length === 0 || obj.copy(buf, 0, 0, len), buf;
                }
                if (obj.length !== void 0)
                  return typeof obj.length != "number" || numberIsNaN(obj.length) ? createBuffer(0) : fromArrayLike(obj);
                if (obj.type === "Buffer" && Array.isArray(obj.data))
                  return fromArrayLike(obj.data);
              }
              function checked(length) {
                if (length >= K_MAX_LENGTH)
                  throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
                return length | 0;
              }
              function SlowBuffer(length) {
                return +length != length && (length = 0), Buffer3.alloc(+length);
              }
              Buffer3.isBuffer = function(b) {
                return b != null && b._isBuffer === !0 && b !== Buffer3.prototype;
              }, Buffer3.compare = function(a, b) {
                if (isInstance(a, Uint8Array) && (a = Buffer3.from(a, a.offset, a.byteLength)), isInstance(b, Uint8Array) && (b = Buffer3.from(b, b.offset, b.byteLength)), !Buffer3.isBuffer(a) || !Buffer3.isBuffer(b))
                  throw new TypeError(
                    'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
                  );
                if (a === b) return 0;
                for (var x = a.length, y = b.length, i = 0, len = Math.min(x, y); i < len; ++i)
                  if (a[i] !== b[i]) {
                    x = a[i], y = b[i];
                    break;
                  }
                return x < y ? -1 : y < x ? 1 : 0;
              }, Buffer3.isEncoding = function(encoding) {
                switch (String(encoding).toLowerCase()) {
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
              }, Buffer3.concat = function(list, length) {
                if (!Array.isArray(list))
                  throw new TypeError('"list" argument must be an Array of Buffers');
                if (list.length === 0)
                  return Buffer3.alloc(0);
                var i;
                if (length === void 0)
                  for (length = 0, i = 0; i < list.length; ++i)
                    length += list[i].length;
                var buffer = Buffer3.allocUnsafe(length), pos = 0;
                for (i = 0; i < list.length; ++i) {
                  var buf = list[i];
                  if (isInstance(buf, Uint8Array) && (buf = Buffer3.from(buf)), !Buffer3.isBuffer(buf))
                    throw new TypeError('"list" argument must be an Array of Buffers');
                  buf.copy(buffer, pos), pos += buf.length;
                }
                return buffer;
              };
              function byteLength(string, encoding) {
                if (Buffer3.isBuffer(string))
                  return string.length;
                if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer))
                  return string.byteLength;
                if (typeof string != "string")
                  throw new TypeError(
                    'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
                  );
                var len = string.length, mustMatch = arguments.length > 2 && arguments[2] === !0;
                if (!mustMatch && len === 0) return 0;
                for (var loweredCase = !1; ; )
                  switch (encoding) {
                    case "ascii":
                    case "latin1":
                    case "binary":
                      return len;
                    case "utf8":
                    case "utf-8":
                      return utf8ToBytes(string).length;
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                      return len * 2;
                    case "hex":
                      return len >>> 1;
                    case "base64":
                      return base64ToBytes(string).length;
                    default:
                      if (loweredCase)
                        return mustMatch ? -1 : utf8ToBytes(string).length;
                      encoding = ("" + encoding).toLowerCase(), loweredCase = !0;
                  }
              }
              Buffer3.byteLength = byteLength;
              function slowToString(encoding, start, end) {
                var loweredCase = !1;
                if ((start === void 0 || start < 0) && (start = 0), start > this.length || ((end === void 0 || end > this.length) && (end = this.length), end <= 0) || (end >>>= 0, start >>>= 0, end <= start))
                  return "";
                for (encoding || (encoding = "utf8"); ; )
                  switch (encoding) {
                    case "hex":
                      return hexSlice(this, start, end);
                    case "utf8":
                    case "utf-8":
                      return utf8Slice(this, start, end);
                    case "ascii":
                      return asciiSlice(this, start, end);
                    case "latin1":
                    case "binary":
                      return latin1Slice(this, start, end);
                    case "base64":
                      return base64Slice(this, start, end);
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                      return utf16leSlice(this, start, end);
                    default:
                      if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                      encoding = (encoding + "").toLowerCase(), loweredCase = !0;
                  }
              }
              Buffer3.prototype._isBuffer = !0;
              function swap(b, n, m) {
                var i = b[n];
                b[n] = b[m], b[m] = i;
              }
              Buffer3.prototype.swap16 = function() {
                var len = this.length;
                if (len % 2 !== 0)
                  throw new RangeError("Buffer size must be a multiple of 16-bits");
                for (var i = 0; i < len; i += 2)
                  swap(this, i, i + 1);
                return this;
              }, Buffer3.prototype.swap32 = function() {
                var len = this.length;
                if (len % 4 !== 0)
                  throw new RangeError("Buffer size must be a multiple of 32-bits");
                for (var i = 0; i < len; i += 4)
                  swap(this, i, i + 3), swap(this, i + 1, i + 2);
                return this;
              }, Buffer3.prototype.swap64 = function() {
                var len = this.length;
                if (len % 8 !== 0)
                  throw new RangeError("Buffer size must be a multiple of 64-bits");
                for (var i = 0; i < len; i += 8)
                  swap(this, i, i + 7), swap(this, i + 1, i + 6), swap(this, i + 2, i + 5), swap(this, i + 3, i + 4);
                return this;
              }, Buffer3.prototype.toString = function() {
                var length = this.length;
                return length === 0 ? "" : arguments.length === 0 ? utf8Slice(this, 0, length) : slowToString.apply(this, arguments);
              }, Buffer3.prototype.toLocaleString = Buffer3.prototype.toString, Buffer3.prototype.equals = function(b) {
                if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                return this === b ? !0 : Buffer3.compare(this, b) === 0;
              }, Buffer3.prototype.inspect = function() {
                var str = "", max = exports3.INSPECT_MAX_BYTES;
                return str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim(), this.length > max && (str += " ... "), "<Buffer " + str + ">";
              }, Buffer3.prototype.compare = function(target, start, end, thisStart, thisEnd) {
                if (isInstance(target, Uint8Array) && (target = Buffer3.from(target, target.offset, target.byteLength)), !Buffer3.isBuffer(target))
                  throw new TypeError(
                    'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
                  );
                if (start === void 0 && (start = 0), end === void 0 && (end = target ? target.length : 0), thisStart === void 0 && (thisStart = 0), thisEnd === void 0 && (thisEnd = this.length), start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length)
                  throw new RangeError("out of range index");
                if (thisStart >= thisEnd && start >= end)
                  return 0;
                if (thisStart >= thisEnd)
                  return -1;
                if (start >= end)
                  return 1;
                if (start >>>= 0, end >>>= 0, thisStart >>>= 0, thisEnd >>>= 0, this === target) return 0;
                for (var x = thisEnd - thisStart, y = end - start, len = Math.min(x, y), thisCopy = this.slice(thisStart, thisEnd), targetCopy = target.slice(start, end), i = 0; i < len; ++i)
                  if (thisCopy[i] !== targetCopy[i]) {
                    x = thisCopy[i], y = targetCopy[i];
                    break;
                  }
                return x < y ? -1 : y < x ? 1 : 0;
              };
              function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
                if (buffer.length === 0) return -1;
                if (typeof byteOffset == "string" ? (encoding = byteOffset, byteOffset = 0) : byteOffset > 2147483647 ? byteOffset = 2147483647 : byteOffset < -2147483648 && (byteOffset = -2147483648), byteOffset = +byteOffset, numberIsNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1), byteOffset < 0 && (byteOffset = buffer.length + byteOffset), byteOffset >= buffer.length) {
                  if (dir) return -1;
                  byteOffset = buffer.length - 1;
                } else if (byteOffset < 0)
                  if (dir) byteOffset = 0;
                  else return -1;
                if (typeof val == "string" && (val = Buffer3.from(val, encoding)), Buffer3.isBuffer(val))
                  return val.length === 0 ? -1 : arrayIndexOf(buffer, val, byteOffset, encoding, dir);
                if (typeof val == "number")
                  return val = val & 255, typeof Uint8Array.prototype.indexOf == "function" ? dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset) : arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
                throw new TypeError("val must be string, number or Buffer");
              }
              function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
                var indexSize = 1, arrLength = arr.length, valLength = val.length;
                if (encoding !== void 0 && (encoding = String(encoding).toLowerCase(), encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le")) {
                  if (arr.length < 2 || val.length < 2)
                    return -1;
                  indexSize = 2, arrLength /= 2, valLength /= 2, byteOffset /= 2;
                }
                function read(buf, i2) {
                  return indexSize === 1 ? buf[i2] : buf.readUInt16BE(i2 * indexSize);
                }
                var i;
                if (dir) {
                  var foundIndex = -1;
                  for (i = byteOffset; i < arrLength; i++)
                    if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                      if (foundIndex === -1 && (foundIndex = i), i - foundIndex + 1 === valLength) return foundIndex * indexSize;
                    } else
                      foundIndex !== -1 && (i -= i - foundIndex), foundIndex = -1;
                } else
                  for (byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength), i = byteOffset; i >= 0; i--) {
                    for (var found = !0, j = 0; j < valLength; j++)
                      if (read(arr, i + j) !== read(val, j)) {
                        found = !1;
                        break;
                      }
                    if (found) return i;
                  }
                return -1;
              }
              Buffer3.prototype.includes = function(val, byteOffset, encoding) {
                return this.indexOf(val, byteOffset, encoding) !== -1;
              }, Buffer3.prototype.indexOf = function(val, byteOffset, encoding) {
                return bidirectionalIndexOf(this, val, byteOffset, encoding, !0);
              }, Buffer3.prototype.lastIndexOf = function(val, byteOffset, encoding) {
                return bidirectionalIndexOf(this, val, byteOffset, encoding, !1);
              };
              function hexWrite(buf, string, offset, length) {
                offset = Number(offset) || 0;
                var remaining = buf.length - offset;
                length ? (length = Number(length), length > remaining && (length = remaining)) : length = remaining;
                var strLen = string.length;
                length > strLen / 2 && (length = strLen / 2);
                for (var i = 0; i < length; ++i) {
                  var parsed = parseInt(string.substr(i * 2, 2), 16);
                  if (numberIsNaN(parsed)) return i;
                  buf[offset + i] = parsed;
                }
                return i;
              }
              function utf8Write(buf, string, offset, length) {
                return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
              }
              function asciiWrite(buf, string, offset, length) {
                return blitBuffer(asciiToBytes(string), buf, offset, length);
              }
              function latin1Write(buf, string, offset, length) {
                return asciiWrite(buf, string, offset, length);
              }
              function base64Write(buf, string, offset, length) {
                return blitBuffer(base64ToBytes(string), buf, offset, length);
              }
              function ucs2Write(buf, string, offset, length) {
                return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
              }
              Buffer3.prototype.write = function(string, offset, length, encoding) {
                if (offset === void 0)
                  encoding = "utf8", length = this.length, offset = 0;
                else if (length === void 0 && typeof offset == "string")
                  encoding = offset, length = this.length, offset = 0;
                else if (isFinite(offset))
                  offset = offset >>> 0, isFinite(length) ? (length = length >>> 0, encoding === void 0 && (encoding = "utf8")) : (encoding = length, length = void 0);
                else
                  throw new Error(
                    "Buffer.write(string, encoding, offset[, length]) is no longer supported"
                  );
                var remaining = this.length - offset;
                if ((length === void 0 || length > remaining) && (length = remaining), string.length > 0 && (length < 0 || offset < 0) || offset > this.length)
                  throw new RangeError("Attempt to write outside buffer bounds");
                encoding || (encoding = "utf8");
                for (var loweredCase = !1; ; )
                  switch (encoding) {
                    case "hex":
                      return hexWrite(this, string, offset, length);
                    case "utf8":
                    case "utf-8":
                      return utf8Write(this, string, offset, length);
                    case "ascii":
                      return asciiWrite(this, string, offset, length);
                    case "latin1":
                    case "binary":
                      return latin1Write(this, string, offset, length);
                    case "base64":
                      return base64Write(this, string, offset, length);
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                      return ucs2Write(this, string, offset, length);
                    default:
                      if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                      encoding = ("" + encoding).toLowerCase(), loweredCase = !0;
                  }
              }, Buffer3.prototype.toJSON = function() {
                return {
                  type: "Buffer",
                  data: Array.prototype.slice.call(this._arr || this, 0)
                };
              };
              function base64Slice(buf, start, end) {
                return start === 0 && end === buf.length ? base64.fromByteArray(buf) : base64.fromByteArray(buf.slice(start, end));
              }
              function utf8Slice(buf, start, end) {
                end = Math.min(buf.length, end);
                for (var res = [], i = start; i < end; ) {
                  var firstByte = buf[i], codePoint = null, bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
                  if (i + bytesPerSequence <= end) {
                    var secondByte, thirdByte, fourthByte, tempCodePoint;
                    switch (bytesPerSequence) {
                      case 1:
                        firstByte < 128 && (codePoint = firstByte);
                        break;
                      case 2:
                        secondByte = buf[i + 1], (secondByte & 192) === 128 && (tempCodePoint = (firstByte & 31) << 6 | secondByte & 63, tempCodePoint > 127 && (codePoint = tempCodePoint));
                        break;
                      case 3:
                        secondByte = buf[i + 1], thirdByte = buf[i + 2], (secondByte & 192) === 128 && (thirdByte & 192) === 128 && (tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63, tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343) && (codePoint = tempCodePoint));
                        break;
                      case 4:
                        secondByte = buf[i + 1], thirdByte = buf[i + 2], fourthByte = buf[i + 3], (secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128 && (tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63, tempCodePoint > 65535 && tempCodePoint < 1114112 && (codePoint = tempCodePoint));
                    }
                  }
                  codePoint === null ? (codePoint = 65533, bytesPerSequence = 1) : codePoint > 65535 && (codePoint -= 65536, res.push(codePoint >>> 10 & 1023 | 55296), codePoint = 56320 | codePoint & 1023), res.push(codePoint), i += bytesPerSequence;
                }
                return decodeCodePointsArray(res);
              }
              var MAX_ARGUMENTS_LENGTH = 4096;
              function decodeCodePointsArray(codePoints) {
                var len = codePoints.length;
                if (len <= MAX_ARGUMENTS_LENGTH)
                  return String.fromCharCode.apply(String, codePoints);
                for (var res = "", i = 0; i < len; )
                  res += String.fromCharCode.apply(
                    String,
                    codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
                  );
                return res;
              }
              function asciiSlice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; ++i)
                  ret += String.fromCharCode(buf[i] & 127);
                return ret;
              }
              function latin1Slice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; ++i)
                  ret += String.fromCharCode(buf[i]);
                return ret;
              }
              function hexSlice(buf, start, end) {
                var len = buf.length;
                (!start || start < 0) && (start = 0), (!end || end < 0 || end > len) && (end = len);
                for (var out = "", i = start; i < end; ++i)
                  out += toHex(buf[i]);
                return out;
              }
              function utf16leSlice(buf, start, end) {
                for (var bytes = buf.slice(start, end), res = "", i = 0; i < bytes.length; i += 2)
                  res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
                return res;
              }
              Buffer3.prototype.slice = function(start, end) {
                var len = this.length;
                start = ~~start, end = end === void 0 ? len : ~~end, start < 0 ? (start += len, start < 0 && (start = 0)) : start > len && (start = len), end < 0 ? (end += len, end < 0 && (end = 0)) : end > len && (end = len), end < start && (end = start);
                var newBuf = this.subarray(start, end);
                return newBuf.__proto__ = Buffer3.prototype, newBuf;
              };
              function checkOffset(offset, ext, length) {
                if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
                if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
              }
              Buffer3.prototype.readUIntLE = function(offset, byteLength2, noAssert) {
                offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, noAssert || checkOffset(offset, byteLength2, this.length);
                for (var val = this[offset], mul = 1, i = 0; ++i < byteLength2 && (mul *= 256); )
                  val += this[offset + i] * mul;
                return val;
              }, Buffer3.prototype.readUIntBE = function(offset, byteLength2, noAssert) {
                offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, noAssert || checkOffset(offset, byteLength2, this.length);
                for (var val = this[offset + --byteLength2], mul = 1; byteLength2 > 0 && (mul *= 256); )
                  val += this[offset + --byteLength2] * mul;
                return val;
              }, Buffer3.prototype.readUInt8 = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 1, this.length), this[offset];
              }, Buffer3.prototype.readUInt16LE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 2, this.length), this[offset] | this[offset + 1] << 8;
              }, Buffer3.prototype.readUInt16BE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 2, this.length), this[offset] << 8 | this[offset + 1];
              }, Buffer3.prototype.readUInt32LE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 4, this.length), (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
              }, Buffer3.prototype.readUInt32BE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 4, this.length), this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
              }, Buffer3.prototype.readIntLE = function(offset, byteLength2, noAssert) {
                offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, noAssert || checkOffset(offset, byteLength2, this.length);
                for (var val = this[offset], mul = 1, i = 0; ++i < byteLength2 && (mul *= 256); )
                  val += this[offset + i] * mul;
                return mul *= 128, val >= mul && (val -= Math.pow(2, 8 * byteLength2)), val;
              }, Buffer3.prototype.readIntBE = function(offset, byteLength2, noAssert) {
                offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, noAssert || checkOffset(offset, byteLength2, this.length);
                for (var i = byteLength2, mul = 1, val = this[offset + --i]; i > 0 && (mul *= 256); )
                  val += this[offset + --i] * mul;
                return mul *= 128, val >= mul && (val -= Math.pow(2, 8 * byteLength2)), val;
              }, Buffer3.prototype.readInt8 = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 1, this.length), this[offset] & 128 ? (255 - this[offset] + 1) * -1 : this[offset];
              }, Buffer3.prototype.readInt16LE = function(offset, noAssert) {
                offset = offset >>> 0, noAssert || checkOffset(offset, 2, this.length);
                var val = this[offset] | this[offset + 1] << 8;
                return val & 32768 ? val | 4294901760 : val;
              }, Buffer3.prototype.readInt16BE = function(offset, noAssert) {
                offset = offset >>> 0, noAssert || checkOffset(offset, 2, this.length);
                var val = this[offset + 1] | this[offset] << 8;
                return val & 32768 ? val | 4294901760 : val;
              }, Buffer3.prototype.readInt32LE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 4, this.length), this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
              }, Buffer3.prototype.readInt32BE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 4, this.length), this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
              }, Buffer3.prototype.readFloatLE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 4, this.length), ieee754.read(this, offset, !0, 23, 4);
              }, Buffer3.prototype.readFloatBE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 4, this.length), ieee754.read(this, offset, !1, 23, 4);
              }, Buffer3.prototype.readDoubleLE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 8, this.length), ieee754.read(this, offset, !0, 52, 8);
              }, Buffer3.prototype.readDoubleBE = function(offset, noAssert) {
                return offset = offset >>> 0, noAssert || checkOffset(offset, 8, this.length), ieee754.read(this, offset, !1, 52, 8);
              };
              function checkInt(buf, value, offset, ext, max, min) {
                if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
                if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
                if (offset + ext > buf.length) throw new RangeError("Index out of range");
              }
              Buffer3.prototype.writeUIntLE = function(value, offset, byteLength2, noAssert) {
                if (value = +value, offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert) {
                  var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
                  checkInt(this, value, offset, byteLength2, maxBytes, 0);
                }
                var mul = 1, i = 0;
                for (this[offset] = value & 255; ++i < byteLength2 && (mul *= 256); )
                  this[offset + i] = value / mul & 255;
                return offset + byteLength2;
              }, Buffer3.prototype.writeUIntBE = function(value, offset, byteLength2, noAssert) {
                if (value = +value, offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert) {
                  var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
                  checkInt(this, value, offset, byteLength2, maxBytes, 0);
                }
                var i = byteLength2 - 1, mul = 1;
                for (this[offset + i] = value & 255; --i >= 0 && (mul *= 256); )
                  this[offset + i] = value / mul & 255;
                return offset + byteLength2;
              }, Buffer3.prototype.writeUInt8 = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 1, 255, 0), this[offset] = value & 255, offset + 1;
              }, Buffer3.prototype.writeUInt16LE = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 2, 65535, 0), this[offset] = value & 255, this[offset + 1] = value >>> 8, offset + 2;
              }, Buffer3.prototype.writeUInt16BE = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 2, 65535, 0), this[offset] = value >>> 8, this[offset + 1] = value & 255, offset + 2;
              }, Buffer3.prototype.writeUInt32LE = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 4, 4294967295, 0), this[offset + 3] = value >>> 24, this[offset + 2] = value >>> 16, this[offset + 1] = value >>> 8, this[offset] = value & 255, offset + 4;
              }, Buffer3.prototype.writeUInt32BE = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 4, 4294967295, 0), this[offset] = value >>> 24, this[offset + 1] = value >>> 16, this[offset + 2] = value >>> 8, this[offset + 3] = value & 255, offset + 4;
              }, Buffer3.prototype.writeIntLE = function(value, offset, byteLength2, noAssert) {
                if (value = +value, offset = offset >>> 0, !noAssert) {
                  var limit = Math.pow(2, 8 * byteLength2 - 1);
                  checkInt(this, value, offset, byteLength2, limit - 1, -limit);
                }
                var i = 0, mul = 1, sub = 0;
                for (this[offset] = value & 255; ++i < byteLength2 && (mul *= 256); )
                  value < 0 && sub === 0 && this[offset + i - 1] !== 0 && (sub = 1), this[offset + i] = (value / mul >> 0) - sub & 255;
                return offset + byteLength2;
              }, Buffer3.prototype.writeIntBE = function(value, offset, byteLength2, noAssert) {
                if (value = +value, offset = offset >>> 0, !noAssert) {
                  var limit = Math.pow(2, 8 * byteLength2 - 1);
                  checkInt(this, value, offset, byteLength2, limit - 1, -limit);
                }
                var i = byteLength2 - 1, mul = 1, sub = 0;
                for (this[offset + i] = value & 255; --i >= 0 && (mul *= 256); )
                  value < 0 && sub === 0 && this[offset + i + 1] !== 0 && (sub = 1), this[offset + i] = (value / mul >> 0) - sub & 255;
                return offset + byteLength2;
              }, Buffer3.prototype.writeInt8 = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 1, 127, -128), value < 0 && (value = 255 + value + 1), this[offset] = value & 255, offset + 1;
              }, Buffer3.prototype.writeInt16LE = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 2, 32767, -32768), this[offset] = value & 255, this[offset + 1] = value >>> 8, offset + 2;
              }, Buffer3.prototype.writeInt16BE = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 2, 32767, -32768), this[offset] = value >>> 8, this[offset + 1] = value & 255, offset + 2;
              }, Buffer3.prototype.writeInt32LE = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648), this[offset] = value & 255, this[offset + 1] = value >>> 8, this[offset + 2] = value >>> 16, this[offset + 3] = value >>> 24, offset + 4;
              }, Buffer3.prototype.writeInt32BE = function(value, offset, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648), value < 0 && (value = 4294967295 + value + 1), this[offset] = value >>> 24, this[offset + 1] = value >>> 16, this[offset + 2] = value >>> 8, this[offset + 3] = value & 255, offset + 4;
              };
              function checkIEEE754(buf, value, offset, ext, max, min) {
                if (offset + ext > buf.length) throw new RangeError("Index out of range");
                if (offset < 0) throw new RangeError("Index out of range");
              }
              function writeFloat(buf, value, offset, littleEndian, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22), ieee754.write(buf, value, offset, littleEndian, 23, 4), offset + 4;
              }
              Buffer3.prototype.writeFloatLE = function(value, offset, noAssert) {
                return writeFloat(this, value, offset, !0, noAssert);
              }, Buffer3.prototype.writeFloatBE = function(value, offset, noAssert) {
                return writeFloat(this, value, offset, !1, noAssert);
              };
              function writeDouble(buf, value, offset, littleEndian, noAssert) {
                return value = +value, offset = offset >>> 0, noAssert || checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292), ieee754.write(buf, value, offset, littleEndian, 52, 8), offset + 8;
              }
              Buffer3.prototype.writeDoubleLE = function(value, offset, noAssert) {
                return writeDouble(this, value, offset, !0, noAssert);
              }, Buffer3.prototype.writeDoubleBE = function(value, offset, noAssert) {
                return writeDouble(this, value, offset, !1, noAssert);
              }, Buffer3.prototype.copy = function(target, targetStart, start, end) {
                if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
                if (start || (start = 0), !end && end !== 0 && (end = this.length), targetStart >= target.length && (targetStart = target.length), targetStart || (targetStart = 0), end > 0 && end < start && (end = start), end === start || target.length === 0 || this.length === 0) return 0;
                if (targetStart < 0)
                  throw new RangeError("targetStart out of bounds");
                if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
                if (end < 0) throw new RangeError("sourceEnd out of bounds");
                end > this.length && (end = this.length), target.length - targetStart < end - start && (end = target.length - targetStart + start);
                var len = end - start;
                if (this === target && typeof Uint8Array.prototype.copyWithin == "function")
                  this.copyWithin(targetStart, start, end);
                else if (this === target && start < targetStart && targetStart < end)
                  for (var i = len - 1; i >= 0; --i)
                    target[i + targetStart] = this[i + start];
                else
                  Uint8Array.prototype.set.call(
                    target,
                    this.subarray(start, end),
                    targetStart
                  );
                return len;
              }, Buffer3.prototype.fill = function(val, start, end, encoding) {
                if (typeof val == "string") {
                  if (typeof start == "string" ? (encoding = start, start = 0, end = this.length) : typeof end == "string" && (encoding = end, end = this.length), encoding !== void 0 && typeof encoding != "string")
                    throw new TypeError("encoding must be a string");
                  if (typeof encoding == "string" && !Buffer3.isEncoding(encoding))
                    throw new TypeError("Unknown encoding: " + encoding);
                  if (val.length === 1) {
                    var code = val.charCodeAt(0);
                    (encoding === "utf8" && code < 128 || encoding === "latin1") && (val = code);
                  }
                } else typeof val == "number" && (val = val & 255);
                if (start < 0 || this.length < start || this.length < end)
                  throw new RangeError("Out of range index");
                if (end <= start)
                  return this;
                start = start >>> 0, end = end === void 0 ? this.length : end >>> 0, val || (val = 0);
                var i;
                if (typeof val == "number")
                  for (i = start; i < end; ++i)
                    this[i] = val;
                else {
                  var bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding), len = bytes.length;
                  if (len === 0)
                    throw new TypeError('The value "' + val + '" is invalid for argument "value"');
                  for (i = 0; i < end - start; ++i)
                    this[i + start] = bytes[i % len];
                }
                return this;
              };
              var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
              function base64clean(str) {
                if (str = str.split("=")[0], str = str.trim().replace(INVALID_BASE64_RE, ""), str.length < 2) return "";
                for (; str.length % 4 !== 0; )
                  str = str + "=";
                return str;
              }
              function toHex(n) {
                return n < 16 ? "0" + n.toString(16) : n.toString(16);
              }
              function utf8ToBytes(string, units) {
                units = units || 1 / 0;
                for (var codePoint, length = string.length, leadSurrogate = null, bytes = [], i = 0; i < length; ++i) {
                  if (codePoint = string.charCodeAt(i), codePoint > 55295 && codePoint < 57344) {
                    if (!leadSurrogate) {
                      if (codePoint > 56319) {
                        (units -= 3) > -1 && bytes.push(239, 191, 189);
                        continue;
                      } else if (i + 1 === length) {
                        (units -= 3) > -1 && bytes.push(239, 191, 189);
                        continue;
                      }
                      leadSurrogate = codePoint;
                      continue;
                    }
                    if (codePoint < 56320) {
                      (units -= 3) > -1 && bytes.push(239, 191, 189), leadSurrogate = codePoint;
                      continue;
                    }
                    codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
                  } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
                  if (leadSurrogate = null, codePoint < 128) {
                    if ((units -= 1) < 0) break;
                    bytes.push(codePoint);
                  } else if (codePoint < 2048) {
                    if ((units -= 2) < 0) break;
                    bytes.push(
                      codePoint >> 6 | 192,
                      codePoint & 63 | 128
                    );
                  } else if (codePoint < 65536) {
                    if ((units -= 3) < 0) break;
                    bytes.push(
                      codePoint >> 12 | 224,
                      codePoint >> 6 & 63 | 128,
                      codePoint & 63 | 128
                    );
                  } else if (codePoint < 1114112) {
                    if ((units -= 4) < 0) break;
                    bytes.push(
                      codePoint >> 18 | 240,
                      codePoint >> 12 & 63 | 128,
                      codePoint >> 6 & 63 | 128,
                      codePoint & 63 | 128
                    );
                  } else
                    throw new Error("Invalid code point");
                }
                return bytes;
              }
              function asciiToBytes(str) {
                for (var byteArray = [], i = 0; i < str.length; ++i)
                  byteArray.push(str.charCodeAt(i) & 255);
                return byteArray;
              }
              function utf16leToBytes(str, units) {
                for (var c, hi, lo, byteArray = [], i = 0; i < str.length && !((units -= 2) < 0); ++i)
                  c = str.charCodeAt(i), hi = c >> 8, lo = c % 256, byteArray.push(lo), byteArray.push(hi);
                return byteArray;
              }
              function base64ToBytes(str) {
                return base64.toByteArray(base64clean(str));
              }
              function blitBuffer(src, dst, offset, length) {
                for (var i = 0; i < length && !(i + offset >= dst.length || i >= src.length); ++i)
                  dst[i + offset] = src[i];
                return i;
              }
              function isInstance(obj, type) {
                return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
              }
              function numberIsNaN(obj) {
                return obj !== obj;
              }
            }).call(this);
          }).call(this, require2("buffer").Buffer);
        }, { "base64-js": 28, buffer: 32, ieee754: 45 }], 33: [function(require2, module3, exports3) {
          "use strict";
          var GetIntrinsic = require2("get-intrinsic"), callBind = require2("./"), $indexOf = callBind(GetIntrinsic("String.prototype.indexOf"));
          module3.exports = function(name, allowMissing) {
            var intrinsic = GetIntrinsic(name, !!allowMissing);
            return typeof intrinsic == "function" && $indexOf(name, ".prototype.") > -1 ? callBind(intrinsic) : intrinsic;
          };
        }, { "./": 34, "get-intrinsic": 39 }], 34: [function(require2, module3, exports3) {
          "use strict";
          var bind = require2("function-bind"), GetIntrinsic = require2("get-intrinsic"), $apply = GetIntrinsic("%Function.prototype.apply%"), $call = GetIntrinsic("%Function.prototype.call%"), $reflectApply = GetIntrinsic("%Reflect.apply%", !0) || bind.call($call, $apply), $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", !0), $defineProperty = GetIntrinsic("%Object.defineProperty%", !0), $max = GetIntrinsic("%Math.max%");
          if ($defineProperty)
            try {
              $defineProperty({}, "a", { value: 1 });
            } catch {
              $defineProperty = null;
            }
          module3.exports = function(originalFunction) {
            var func = $reflectApply(bind, $call, arguments);
            if ($gOPD && $defineProperty) {
              var desc = $gOPD(func, "length");
              desc.configurable && $defineProperty(
                func,
                "length",
                { value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
              );
            }
            return func;
          };
          var applyBind = function() {
            return $reflectApply(bind, $apply, arguments);
          };
          $defineProperty ? $defineProperty(module3.exports, "apply", { value: applyBind }) : module3.exports.apply = applyBind;
        }, { "function-bind": 38, "get-intrinsic": 39 }], 35: [function(require2, module3, exports3) {
          "use strict";
          var R = typeof Reflect == "object" ? Reflect : null, ReflectApply = R && typeof R.apply == "function" ? R.apply : function(target, receiver, args) {
            return Function.prototype.apply.call(target, receiver, args);
          }, ReflectOwnKeys;
          R && typeof R.ownKeys == "function" ? ReflectOwnKeys = R.ownKeys : Object.getOwnPropertySymbols ? ReflectOwnKeys = function(target) {
            return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
          } : ReflectOwnKeys = function(target) {
            return Object.getOwnPropertyNames(target);
          };
          function ProcessEmitWarning(warning) {
            console && console.warn && console.warn(warning);
          }
          var NumberIsNaN = Number.isNaN || function(value) {
            return value !== value;
          };
          function EventEmitter() {
            EventEmitter.init.call(this);
          }
          module3.exports = EventEmitter, module3.exports.once = once, EventEmitter.EventEmitter = EventEmitter, EventEmitter.prototype._events = void 0, EventEmitter.prototype._eventsCount = 0, EventEmitter.prototype._maxListeners = void 0;
          var defaultMaxListeners = 10;
          function checkListener(listener) {
            if (typeof listener != "function")
              throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
          }
          Object.defineProperty(EventEmitter, "defaultMaxListeners", {
            enumerable: !0,
            get: function() {
              return defaultMaxListeners;
            },
            set: function(arg) {
              if (typeof arg != "number" || arg < 0 || NumberIsNaN(arg))
                throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
              defaultMaxListeners = arg;
            }
          }), EventEmitter.init = function() {
            (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
          }, EventEmitter.prototype.setMaxListeners = function(n) {
            if (typeof n != "number" || n < 0 || NumberIsNaN(n))
              throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
            return this._maxListeners = n, this;
          };
          function _getMaxListeners(that) {
            return that._maxListeners === void 0 ? EventEmitter.defaultMaxListeners : that._maxListeners;
          }
          EventEmitter.prototype.getMaxListeners = function() {
            return _getMaxListeners(this);
          }, EventEmitter.prototype.emit = function(type) {
            for (var args = [], i = 1; i < arguments.length; i++) args.push(arguments[i]);
            var doError = type === "error", events = this._events;
            if (events !== void 0)
              doError = doError && events.error === void 0;
            else if (!doError)
              return !1;
            if (doError) {
              var er;
              if (args.length > 0 && (er = args[0]), er instanceof Error)
                throw er;
              var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
              throw err.context = er, err;
            }
            var handler = events[type];
            if (handler === void 0)
              return !1;
            if (typeof handler == "function")
              ReflectApply(handler, this, args);
            else
              for (var len = handler.length, listeners = arrayClone(handler, len), i = 0; i < len; ++i)
                ReflectApply(listeners[i], this, args);
            return !0;
          };
          function _addListener(target, type, listener, prepend) {
            var m, events, existing;
            if (checkListener(listener), events = target._events, events === void 0 ? (events = target._events = /* @__PURE__ */ Object.create(null), target._eventsCount = 0) : (events.newListener !== void 0 && (target.emit(
              "newListener",
              type,
              listener.listener ? listener.listener : listener
            ), events = target._events), existing = events[type]), existing === void 0)
              existing = events[type] = listener, ++target._eventsCount;
            else if (typeof existing == "function" ? existing = events[type] = prepend ? [listener, existing] : [existing, listener] : prepend ? existing.unshift(listener) : existing.push(listener), m = _getMaxListeners(target), m > 0 && existing.length > m && !existing.warned) {
              existing.warned = !0;
              var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
              w.name = "MaxListenersExceededWarning", w.emitter = target, w.type = type, w.count = existing.length, ProcessEmitWarning(w);
            }
            return target;
          }
          EventEmitter.prototype.addListener = function(type, listener) {
            return _addListener(this, type, listener, !1);
          }, EventEmitter.prototype.on = EventEmitter.prototype.addListener, EventEmitter.prototype.prependListener = function(type, listener) {
            return _addListener(this, type, listener, !0);
          };
          function onceWrapper() {
            if (!this.fired)
              return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
          }
          function _onceWrap(target, type, listener) {
            var state = { fired: !1, wrapFn: void 0, target, type, listener }, wrapped = onceWrapper.bind(state);
            return wrapped.listener = listener, state.wrapFn = wrapped, wrapped;
          }
          EventEmitter.prototype.once = function(type, listener) {
            return checkListener(listener), this.on(type, _onceWrap(this, type, listener)), this;
          }, EventEmitter.prototype.prependOnceListener = function(type, listener) {
            return checkListener(listener), this.prependListener(type, _onceWrap(this, type, listener)), this;
          }, EventEmitter.prototype.removeListener = function(type, listener) {
            var list, events, position, i, originalListener;
            if (checkListener(listener), events = this._events, events === void 0)
              return this;
            if (list = events[type], list === void 0)
              return this;
            if (list === listener || list.listener === listener)
              --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete events[type], events.removeListener && this.emit("removeListener", type, list.listener || listener));
            else if (typeof list != "function") {
              for (position = -1, i = list.length - 1; i >= 0; i--)
                if (list[i] === listener || list[i].listener === listener) {
                  originalListener = list[i].listener, position = i;
                  break;
                }
              if (position < 0)
                return this;
              position === 0 ? list.shift() : spliceOne(list, position), list.length === 1 && (events[type] = list[0]), events.removeListener !== void 0 && this.emit("removeListener", type, originalListener || listener);
            }
            return this;
          }, EventEmitter.prototype.off = EventEmitter.prototype.removeListener, EventEmitter.prototype.removeAllListeners = function(type) {
            var listeners, events, i;
            if (events = this._events, events === void 0)
              return this;
            if (events.removeListener === void 0)
              return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : events[type] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete events[type]), this;
            if (arguments.length === 0) {
              var keys = Object.keys(events), key;
              for (i = 0; i < keys.length; ++i)
                key = keys[i], key !== "removeListener" && this.removeAllListeners(key);
              return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
            }
            if (listeners = events[type], typeof listeners == "function")
              this.removeListener(type, listeners);
            else if (listeners !== void 0)
              for (i = listeners.length - 1; i >= 0; i--)
                this.removeListener(type, listeners[i]);
            return this;
          };
          function _listeners(target, type, unwrap) {
            var events = target._events;
            if (events === void 0)
              return [];
            var evlistener = events[type];
            return evlistener === void 0 ? [] : typeof evlistener == "function" ? unwrap ? [evlistener.listener || evlistener] : [evlistener] : unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
          }
          EventEmitter.prototype.listeners = function(type) {
            return _listeners(this, type, !0);
          }, EventEmitter.prototype.rawListeners = function(type) {
            return _listeners(this, type, !1);
          }, EventEmitter.listenerCount = function(emitter, type) {
            return typeof emitter.listenerCount == "function" ? emitter.listenerCount(type) : listenerCount.call(emitter, type);
          }, EventEmitter.prototype.listenerCount = listenerCount;
          function listenerCount(type) {
            var events = this._events;
            if (events !== void 0) {
              var evlistener = events[type];
              if (typeof evlistener == "function")
                return 1;
              if (evlistener !== void 0)
                return evlistener.length;
            }
            return 0;
          }
          EventEmitter.prototype.eventNames = function() {
            return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
          };
          function arrayClone(arr, n) {
            for (var copy2 = new Array(n), i = 0; i < n; ++i)
              copy2[i] = arr[i];
            return copy2;
          }
          function spliceOne(list, index) {
            for (; index + 1 < list.length; index++)
              list[index] = list[index + 1];
            list.pop();
          }
          function unwrapListeners(arr) {
            for (var ret = new Array(arr.length), i = 0; i < ret.length; ++i)
              ret[i] = arr[i].listener || arr[i];
            return ret;
          }
          function once(emitter, name) {
            return new Promise(function(resolve, reject) {
              function errorListener(err) {
                emitter.removeListener(name, resolver), reject(err);
              }
              function resolver() {
                typeof emitter.removeListener == "function" && emitter.removeListener("error", errorListener), resolve([].slice.call(arguments));
              }
              eventTargetAgnosticAddListener(emitter, name, resolver, { once: !0 }), name !== "error" && addErrorHandlerIfEventEmitter(emitter, errorListener, { once: !0 });
            });
          }
          function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
            typeof emitter.on == "function" && eventTargetAgnosticAddListener(emitter, "error", handler, flags);
          }
          function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
            if (typeof emitter.on == "function")
              flags.once ? emitter.once(name, listener) : emitter.on(name, listener);
            else if (typeof emitter.addEventListener == "function")
              emitter.addEventListener(name, function wrapListener(arg) {
                flags.once && emitter.removeEventListener(name, wrapListener), listener(arg);
              });
            else
              throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
          }
        }, {}], 36: [function(require2, module3, exports3) {
          "use strict";
          var isCallable = require2("is-callable"), toStr = Object.prototype.toString, hasOwnProperty = Object.prototype.hasOwnProperty, forEachArray = function(array, iterator, receiver) {
            for (var i = 0, len = array.length; i < len; i++)
              hasOwnProperty.call(array, i) && (receiver == null ? iterator(array[i], i, array) : iterator.call(receiver, array[i], i, array));
          }, forEachString = function(string, iterator, receiver) {
            for (var i = 0, len = string.length; i < len; i++)
              receiver == null ? iterator(string.charAt(i), i, string) : iterator.call(receiver, string.charAt(i), i, string);
          }, forEachObject = function(object, iterator, receiver) {
            for (var k in object)
              hasOwnProperty.call(object, k) && (receiver == null ? iterator(object[k], k, object) : iterator.call(receiver, object[k], k, object));
          }, forEach = function(list, iterator, thisArg) {
            if (!isCallable(iterator))
              throw new TypeError("iterator must be a function");
            var receiver;
            arguments.length >= 3 && (receiver = thisArg), toStr.call(list) === "[object Array]" ? forEachArray(list, iterator, receiver) : typeof list == "string" ? forEachString(list, iterator, receiver) : forEachObject(list, iterator, receiver);
          };
          module3.exports = forEach;
        }, { "is-callable": 48 }], 37: [function(require2, module3, exports3) {
          "use strict";
          var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ", slice = Array.prototype.slice, toStr = Object.prototype.toString, funcType = "[object Function]";
          module3.exports = function(that) {
            var target = this;
            if (typeof target != "function" || toStr.call(target) !== funcType)
              throw new TypeError(ERROR_MESSAGE + target);
            for (var args = slice.call(arguments, 1), bound, binder = function() {
              if (this instanceof bound) {
                var result = target.apply(
                  this,
                  args.concat(slice.call(arguments))
                );
                return Object(result) === result ? result : this;
              } else
                return target.apply(
                  that,
                  args.concat(slice.call(arguments))
                );
            }, boundLength = Math.max(0, target.length - args.length), boundArgs = [], i = 0; i < boundLength; i++)
              boundArgs.push("$" + i);
            if (bound = Function("binder", "return function (" + boundArgs.join(",") + "){ return binder.apply(this,arguments); }")(binder), target.prototype) {
              var Empty = function() {
              };
              Empty.prototype = target.prototype, bound.prototype = new Empty(), Empty.prototype = null;
            }
            return bound;
          };
        }, {}], 38: [function(require2, module3, exports3) {
          "use strict";
          var implementation = require2("./implementation");
          module3.exports = Function.prototype.bind || implementation;
        }, { "./implementation": 37 }], 39: [function(require2, module3, exports3) {
          "use strict";
          var undefined2, $SyntaxError = SyntaxError, $Function = Function, $TypeError = TypeError, getEvalledConstructor = function(expressionSyntax) {
            try {
              return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
            } catch {
            }
          }, $gOPD = Object.getOwnPropertyDescriptor;
          if ($gOPD)
            try {
              $gOPD({}, "");
            } catch {
              $gOPD = null;
            }
          var throwTypeError = function() {
            throw new $TypeError();
          }, ThrowTypeError = $gOPD ? function() {
            try {
              return arguments.callee, throwTypeError;
            } catch {
              try {
                return $gOPD(arguments, "callee").get;
              } catch {
                return throwTypeError;
              }
            }
          }() : throwTypeError, hasSymbols = require2("has-symbols")(), getProto = Object.getPrototypeOf || function(x) {
            return x.__proto__;
          }, needsEval = {}, TypedArray = typeof Uint8Array > "u" ? undefined2 : getProto(Uint8Array), INTRINSICS = {
            "%AggregateError%": typeof AggregateError > "u" ? undefined2 : AggregateError,
            "%Array%": Array,
            "%ArrayBuffer%": typeof ArrayBuffer > "u" ? undefined2 : ArrayBuffer,
            "%ArrayIteratorPrototype%": hasSymbols ? getProto([][Symbol.iterator]()) : undefined2,
            "%AsyncFromSyncIteratorPrototype%": undefined2,
            "%AsyncFunction%": needsEval,
            "%AsyncGenerator%": needsEval,
            "%AsyncGeneratorFunction%": needsEval,
            "%AsyncIteratorPrototype%": needsEval,
            "%Atomics%": typeof Atomics > "u" ? undefined2 : Atomics,
            "%BigInt%": typeof BigInt > "u" ? undefined2 : BigInt,
            "%BigInt64Array%": typeof BigInt64Array > "u" ? undefined2 : BigInt64Array,
            "%BigUint64Array%": typeof BigUint64Array > "u" ? undefined2 : BigUint64Array,
            "%Boolean%": Boolean,
            "%DataView%": typeof DataView > "u" ? undefined2 : DataView,
            "%Date%": Date,
            "%decodeURI%": decodeURI,
            "%decodeURIComponent%": decodeURIComponent,
            "%encodeURI%": encodeURI,
            "%encodeURIComponent%": encodeURIComponent,
            "%Error%": Error,
            "%eval%": eval,
            // eslint-disable-line no-eval
            "%EvalError%": EvalError,
            "%Float32Array%": typeof Float32Array > "u" ? undefined2 : Float32Array,
            "%Float64Array%": typeof Float64Array > "u" ? undefined2 : Float64Array,
            "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? undefined2 : FinalizationRegistry,
            "%Function%": $Function,
            "%GeneratorFunction%": needsEval,
            "%Int8Array%": typeof Int8Array > "u" ? undefined2 : Int8Array,
            "%Int16Array%": typeof Int16Array > "u" ? undefined2 : Int16Array,
            "%Int32Array%": typeof Int32Array > "u" ? undefined2 : Int32Array,
            "%isFinite%": isFinite,
            "%isNaN%": isNaN,
            "%IteratorPrototype%": hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined2,
            "%JSON%": typeof JSON == "object" ? JSON : undefined2,
            "%Map%": typeof Map > "u" ? undefined2 : Map,
            "%MapIteratorPrototype%": typeof Map > "u" || !hasSymbols ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
            "%Math%": Math,
            "%Number%": Number,
            "%Object%": Object,
            "%parseFloat%": parseFloat,
            "%parseInt%": parseInt,
            "%Promise%": typeof Promise > "u" ? undefined2 : Promise,
            "%Proxy%": typeof Proxy > "u" ? undefined2 : Proxy,
            "%RangeError%": RangeError,
            "%ReferenceError%": ReferenceError,
            "%Reflect%": typeof Reflect > "u" ? undefined2 : Reflect,
            "%RegExp%": RegExp,
            "%Set%": typeof Set > "u" ? undefined2 : Set,
            "%SetIteratorPrototype%": typeof Set > "u" || !hasSymbols ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
            "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? undefined2 : SharedArrayBuffer,
            "%String%": String,
            "%StringIteratorPrototype%": hasSymbols ? getProto(""[Symbol.iterator]()) : undefined2,
            "%Symbol%": hasSymbols ? Symbol : undefined2,
            "%SyntaxError%": $SyntaxError,
            "%ThrowTypeError%": ThrowTypeError,
            "%TypedArray%": TypedArray,
            "%TypeError%": $TypeError,
            "%Uint8Array%": typeof Uint8Array > "u" ? undefined2 : Uint8Array,
            "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? undefined2 : Uint8ClampedArray,
            "%Uint16Array%": typeof Uint16Array > "u" ? undefined2 : Uint16Array,
            "%Uint32Array%": typeof Uint32Array > "u" ? undefined2 : Uint32Array,
            "%URIError%": URIError,
            "%WeakMap%": typeof WeakMap > "u" ? undefined2 : WeakMap,
            "%WeakRef%": typeof WeakRef > "u" ? undefined2 : WeakRef,
            "%WeakSet%": typeof WeakSet > "u" ? undefined2 : WeakSet
          };
          try {
            null.error;
          } catch (e) {
            var errorProto = getProto(getProto(e));
            INTRINSICS["%Error.prototype%"] = errorProto;
          }
          var doEval = function doEval2(name) {
            var value;
            if (name === "%AsyncFunction%")
              value = getEvalledConstructor("async function () {}");
            else if (name === "%GeneratorFunction%")
              value = getEvalledConstructor("function* () {}");
            else if (name === "%AsyncGeneratorFunction%")
              value = getEvalledConstructor("async function* () {}");
            else if (name === "%AsyncGenerator%") {
              var fn = doEval2("%AsyncGeneratorFunction%");
              fn && (value = fn.prototype);
            } else if (name === "%AsyncIteratorPrototype%") {
              var gen = doEval2("%AsyncGenerator%");
              gen && (value = getProto(gen.prototype));
            }
            return INTRINSICS[name] = value, value;
          }, LEGACY_ALIASES = {
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
          }, bind = require2("function-bind"), hasOwn = require2("has"), $concat = bind.call(Function.call, Array.prototype.concat), $spliceApply = bind.call(Function.apply, Array.prototype.splice), $replace = bind.call(Function.call, String.prototype.replace), $strSlice = bind.call(Function.call, String.prototype.slice), $exec = bind.call(Function.call, RegExp.prototype.exec), rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, reEscapeChar = /\\(\\)?/g, stringToPath = function(string) {
            var first = $strSlice(string, 0, 1), last = $strSlice(string, -1);
            if (first === "%" && last !== "%")
              throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
            if (last === "%" && first !== "%")
              throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
            var result = [];
            return $replace(string, rePropName, function(match, number, quote, subString) {
              result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
            }), result;
          }, getBaseIntrinsic = function(name, allowMissing) {
            var intrinsicName = name, alias;
            if (hasOwn(LEGACY_ALIASES, intrinsicName) && (alias = LEGACY_ALIASES[intrinsicName], intrinsicName = "%" + alias[0] + "%"), hasOwn(INTRINSICS, intrinsicName)) {
              var value = INTRINSICS[intrinsicName];
              if (value === needsEval && (value = doEval(intrinsicName)), typeof value > "u" && !allowMissing)
                throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
              return {
                alias,
                name: intrinsicName,
                value
              };
            }
            throw new $SyntaxError("intrinsic " + name + " does not exist!");
          };
          module3.exports = function(name, allowMissing) {
            if (typeof name != "string" || name.length === 0)
              throw new $TypeError("intrinsic name must be a non-empty string");
            if (arguments.length > 1 && typeof allowMissing != "boolean")
              throw new $TypeError('"allowMissing" argument must be a boolean');
            if ($exec(/^%?[^%]*%?$/, name) === null)
              throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
            var parts = stringToPath(name), intrinsicBaseName = parts.length > 0 ? parts[0] : "", intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing), intrinsicRealName = intrinsic.name, value = intrinsic.value, skipFurtherCaching = !1, alias = intrinsic.alias;
            alias && (intrinsicBaseName = alias[0], $spliceApply(parts, $concat([0, 1], alias)));
            for (var i = 1, isOwn = !0; i < parts.length; i += 1) {
              var part = parts[i], first = $strSlice(part, 0, 1), last = $strSlice(part, -1);
              if ((first === '"' || first === "'" || first === "`" || last === '"' || last === "'" || last === "`") && first !== last)
                throw new $SyntaxError("property names with quotes must have matching quotes");
              if ((part === "constructor" || !isOwn) && (skipFurtherCaching = !0), intrinsicBaseName += "." + part, intrinsicRealName = "%" + intrinsicBaseName + "%", hasOwn(INTRINSICS, intrinsicRealName))
                value = INTRINSICS[intrinsicRealName];
              else if (value != null) {
                if (!(part in value)) {
                  if (!allowMissing)
                    throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
                  return;
                }
                if ($gOPD && i + 1 >= parts.length) {
                  var desc = $gOPD(value, part);
                  isOwn = !!desc, isOwn && "get" in desc && !("originalValue" in desc.get) ? value = desc.get : value = value[part];
                } else
                  isOwn = hasOwn(value, part), value = value[part];
                isOwn && !skipFurtherCaching && (INTRINSICS[intrinsicRealName] = value);
              }
            }
            return value;
          };
        }, { "function-bind": 38, has: 44, "has-symbols": 41 }], 40: [function(require2, module3, exports3) {
          "use strict";
          var GetIntrinsic = require2("get-intrinsic"), $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", !0);
          if ($gOPD)
            try {
              $gOPD([], "length");
            } catch {
              $gOPD = null;
            }
          module3.exports = $gOPD;
        }, { "get-intrinsic": 39 }], 41: [function(require2, module3, exports3) {
          "use strict";
          var origSymbol = typeof Symbol < "u" && Symbol, hasSymbolSham = require2("./shams");
          module3.exports = function() {
            return typeof origSymbol != "function" || typeof Symbol != "function" || typeof origSymbol("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 : hasSymbolSham();
          };
        }, { "./shams": 42 }], 42: [function(require2, module3, exports3) {
          "use strict";
          module3.exports = function() {
            if (typeof Symbol != "function" || typeof Object.getOwnPropertySymbols != "function")
              return !1;
            if (typeof Symbol.iterator == "symbol")
              return !0;
            var obj = {}, sym = Symbol("test"), symObj = Object(sym);
            if (typeof sym == "string" || Object.prototype.toString.call(sym) !== "[object Symbol]" || Object.prototype.toString.call(symObj) !== "[object Symbol]")
              return !1;
            var symVal = 42;
            obj[sym] = symVal;
            for (sym in obj)
              return !1;
            if (typeof Object.keys == "function" && Object.keys(obj).length !== 0 || typeof Object.getOwnPropertyNames == "function" && Object.getOwnPropertyNames(obj).length !== 0)
              return !1;
            var syms = Object.getOwnPropertySymbols(obj);
            if (syms.length !== 1 || syms[0] !== sym || !Object.prototype.propertyIsEnumerable.call(obj, sym))
              return !1;
            if (typeof Object.getOwnPropertyDescriptor == "function") {
              var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
              if (descriptor.value !== symVal || descriptor.enumerable !== !0)
                return !1;
            }
            return !0;
          };
        }, {}], 43: [function(require2, module3, exports3) {
          "use strict";
          var hasSymbols = require2("has-symbols/shams");
          module3.exports = function() {
            return hasSymbols() && !!Symbol.toStringTag;
          };
        }, { "has-symbols/shams": 42 }], 44: [function(require2, module3, exports3) {
          "use strict";
          var bind = require2("function-bind");
          module3.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);
        }, { "function-bind": 38 }], 45: [function(require2, module3, exports3) {
          exports3.read = function(buffer, offset, isLE, mLen, nBytes) {
            var e, m, eLen = nBytes * 8 - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, nBits = -7, i = isLE ? nBytes - 1 : 0, d = isLE ? -1 : 1, s = buffer[offset + i];
            for (i += d, e = s & (1 << -nBits) - 1, s >>= -nBits, nBits += eLen; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8)
              ;
            for (m = e & (1 << -nBits) - 1, e >>= -nBits, nBits += mLen; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8)
              ;
            if (e === 0)
              e = 1 - eBias;
            else {
              if (e === eMax)
                return m ? NaN : (s ? -1 : 1) * (1 / 0);
              m = m + Math.pow(2, mLen), e = e - eBias;
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
          }, exports3.write = function(buffer, value, offset, isLE, mLen, nBytes) {
            var e, m, c, eLen = nBytes * 8 - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, i = isLE ? 0 : nBytes - 1, d = isLE ? 1 : -1, s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
            for (value = Math.abs(value), isNaN(value) || value === 1 / 0 ? (m = isNaN(value) ? 1 : 0, e = eMax) : (e = Math.floor(Math.log(value) / Math.LN2), value * (c = Math.pow(2, -e)) < 1 && (e--, c *= 2), e + eBias >= 1 ? value += rt / c : value += rt * Math.pow(2, 1 - eBias), value * c >= 2 && (e++, c /= 2), e + eBias >= eMax ? (m = 0, e = eMax) : e + eBias >= 1 ? (m = (value * c - 1) * Math.pow(2, mLen), e = e + eBias) : (m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen), e = 0)); mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8)
              ;
            for (e = e << mLen | m, eLen += mLen; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8)
              ;
            buffer[offset + i - d] |= s * 128;
          };
        }, {}], 46: [function(require2, module3, exports3) {
          typeof Object.create == "function" ? module3.exports = function(ctor, superCtor) {
            superCtor && (ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: !1,
                writable: !0,
                configurable: !0
              }
            }));
          } : module3.exports = function(ctor, superCtor) {
            if (superCtor) {
              ctor.super_ = superCtor;
              var TempCtor = function() {
              };
              TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor(), ctor.prototype.constructor = ctor;
            }
          };
        }, {}], 47: [function(require2, module3, exports3) {
          "use strict";
          var hasToStringTag = require2("has-tostringtag/shams")(), callBound = require2("call-bind/callBound"), $toString = callBound("Object.prototype.toString"), isStandardArguments = function(value) {
            return hasToStringTag && value && typeof value == "object" && Symbol.toStringTag in value ? !1 : $toString(value) === "[object Arguments]";
          }, isLegacyArguments = function(value) {
            return isStandardArguments(value) ? !0 : value !== null && typeof value == "object" && typeof value.length == "number" && value.length >= 0 && $toString(value) !== "[object Array]" && $toString(value.callee) === "[object Function]";
          }, supportsStandardArguments = function() {
            return isStandardArguments(arguments);
          }();
          isStandardArguments.isLegacyArguments = isLegacyArguments, module3.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
        }, { "call-bind/callBound": 33, "has-tostringtag/shams": 43 }], 48: [function(require2, module3, exports3) {
          "use strict";
          var fnToStr = Function.prototype.toString, reflectApply = typeof Reflect == "object" && Reflect !== null && Reflect.apply, badArrayLike, isCallableMarker;
          if (typeof reflectApply == "function" && typeof Object.defineProperty == "function")
            try {
              badArrayLike = Object.defineProperty({}, "length", {
                get: function() {
                  throw isCallableMarker;
                }
              }), isCallableMarker = {}, reflectApply(function() {
                throw 42;
              }, null, badArrayLike);
            } catch (_) {
              _ !== isCallableMarker && (reflectApply = null);
            }
          else
            reflectApply = null;
          var constructorRegex = /^\s*class\b/, isES6ClassFn = function(value) {
            try {
              var fnStr = fnToStr.call(value);
              return constructorRegex.test(fnStr);
            } catch {
              return !1;
            }
          }, tryFunctionObject = function(value) {
            try {
              return isES6ClassFn(value) ? !1 : (fnToStr.call(value), !0);
            } catch {
              return !1;
            }
          }, toStr = Object.prototype.toString, objectClass = "[object Object]", fnClass = "[object Function]", genClass = "[object GeneratorFunction]", ddaClass = "[object HTMLAllCollection]", ddaClass2 = "[object HTML document.all class]", ddaClass3 = "[object HTMLCollection]", hasToStringTag = typeof Symbol == "function" && !!Symbol.toStringTag, isIE68 = !(0 in [,]), isDDA = function() {
            return !1;
          };
          if (typeof document == "object") {
            var all = document.all;
            toStr.call(all) === toStr.call(document.all) && (isDDA = function(value) {
              if ((isIE68 || !value) && (typeof value > "u" || typeof value == "object"))
                try {
                  var str = toStr.call(value);
                  return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
                } catch {
                }
              return !1;
            });
          }
          module3.exports = reflectApply ? function(value) {
            if (isDDA(value))
              return !0;
            if (!value || typeof value != "function" && typeof value != "object")
              return !1;
            try {
              reflectApply(value, null, badArrayLike);
            } catch (e) {
              if (e !== isCallableMarker)
                return !1;
            }
            return !isES6ClassFn(value) && tryFunctionObject(value);
          } : function(value) {
            if (isDDA(value))
              return !0;
            if (!value || typeof value != "function" && typeof value != "object")
              return !1;
            if (hasToStringTag)
              return tryFunctionObject(value);
            if (isES6ClassFn(value))
              return !1;
            var strClass = toStr.call(value);
            return strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass) ? !1 : tryFunctionObject(value);
          };
        }, {}], 49: [function(require2, module3, exports3) {
          "use strict";
          var toStr = Object.prototype.toString, fnToStr = Function.prototype.toString, isFnRegex = /^\s*(?:function)?\*/, hasToStringTag = require2("has-tostringtag/shams")(), getProto = Object.getPrototypeOf, getGeneratorFunc = function() {
            if (!hasToStringTag)
              return !1;
            try {
              return Function("return function*() {}")();
            } catch {
            }
          }, GeneratorFunction;
          module3.exports = function(fn) {
            if (typeof fn != "function")
              return !1;
            if (isFnRegex.test(fnToStr.call(fn)))
              return !0;
            if (!hasToStringTag) {
              var str = toStr.call(fn);
              return str === "[object GeneratorFunction]";
            }
            if (!getProto)
              return !1;
            if (typeof GeneratorFunction > "u") {
              var generatorFunc = getGeneratorFunc();
              GeneratorFunction = generatorFunc ? getProto(generatorFunc) : !1;
            }
            return getProto(fn) === GeneratorFunction;
          };
        }, { "has-tostringtag/shams": 43 }], 50: [function(require2, module3, exports3) {
          (function(global2) {
            (function() {
              "use strict";
              var forEach = require2("for-each"), availableTypedArrays = require2("available-typed-arrays"), callBound = require2("call-bind/callBound"), $toString = callBound("Object.prototype.toString"), hasToStringTag = require2("has-tostringtag/shams")(), gOPD = require2("gopd"), g = typeof globalThis > "u" ? global2 : globalThis, typedArrays = availableTypedArrays(), $indexOf = callBound("Array.prototype.indexOf", !0) || function(array, value) {
                for (var i = 0; i < array.length; i += 1)
                  if (array[i] === value)
                    return i;
                return -1;
              }, $slice = callBound("String.prototype.slice"), toStrTags = {}, getPrototypeOf = Object.getPrototypeOf;
              hasToStringTag && gOPD && getPrototypeOf && forEach(typedArrays, function(typedArray) {
                var arr = new g[typedArray]();
                if (Symbol.toStringTag in arr) {
                  var proto = getPrototypeOf(arr), descriptor = gOPD(proto, Symbol.toStringTag);
                  if (!descriptor) {
                    var superProto = getPrototypeOf(proto);
                    descriptor = gOPD(superProto, Symbol.toStringTag);
                  }
                  toStrTags[typedArray] = descriptor.get;
                }
              });
              var tryTypedArrays = function(value) {
                var anyTrue = !1;
                return forEach(toStrTags, function(getter, typedArray) {
                  if (!anyTrue)
                    try {
                      anyTrue = getter.call(value) === typedArray;
                    } catch {
                    }
                }), anyTrue;
              };
              module3.exports = function(value) {
                if (!value || typeof value != "object")
                  return !1;
                if (!hasToStringTag || !(Symbol.toStringTag in value)) {
                  var tag = $slice($toString(value), 8, -1);
                  return $indexOf(typedArrays, tag) > -1;
                }
                return gOPD ? tryTypedArrays(value) : !1;
              };
            }).call(this);
          }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
        }, { "available-typed-arrays": 27, "call-bind/callBound": 33, "for-each": 36, gopd: 40, "has-tostringtag/shams": 43 }], 51: [function(require2, module3, exports3) {
          "use strict";
          var getOwnPropertySymbols = Object.getOwnPropertySymbols, hasOwnProperty = Object.prototype.hasOwnProperty, propIsEnumerable = Object.prototype.propertyIsEnumerable;
          function toObject(val) {
            if (val == null)
              throw new TypeError("Object.assign cannot be called with null or undefined");
            return Object(val);
          }
          function shouldUseNative() {
            try {
              if (!Object.assign)
                return !1;
              var test1 = new String("abc");
              if (test1[5] = "de", Object.getOwnPropertyNames(test1)[0] === "5")
                return !1;
              for (var test2 = {}, i = 0; i < 10; i++)
                test2["_" + String.fromCharCode(i)] = i;
              var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
                return test2[n];
              });
              if (order2.join("") !== "0123456789")
                return !1;
              var test3 = {};
              return "abcdefghijklmnopqrst".split("").forEach(function(letter) {
                test3[letter] = letter;
              }), Object.keys(Object.assign({}, test3)).join("") === "abcdefghijklmnopqrst";
            } catch {
              return !1;
            }
          }
          module3.exports = shouldUseNative() ? Object.assign : function(target, source) {
            for (var from, to = toObject(target), symbols, s = 1; s < arguments.length; s++) {
              from = Object(arguments[s]);
              for (var key in from)
                hasOwnProperty.call(from, key) && (to[key] = from[key]);
              if (getOwnPropertySymbols) {
                symbols = getOwnPropertySymbols(from);
                for (var i = 0; i < symbols.length; i++)
                  propIsEnumerable.call(from, symbols[i]) && (to[symbols[i]] = from[symbols[i]]);
              }
            }
            return to;
          };
        }, {}], 52: [function(require2, module3, exports3) {
          "use strict";
          var TYPED_OK = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
          function _has(obj, key) {
            return Object.prototype.hasOwnProperty.call(obj, key);
          }
          exports3.assign = function(obj) {
            for (var sources = Array.prototype.slice.call(arguments, 1); sources.length; ) {
              var source = sources.shift();
              if (source) {
                if (typeof source != "object")
                  throw new TypeError(source + "must be non-object");
                for (var p in source)
                  _has(source, p) && (obj[p] = source[p]);
              }
            }
            return obj;
          }, exports3.shrinkBuf = function(buf, size) {
            return buf.length === size ? buf : buf.subarray ? buf.subarray(0, size) : (buf.length = size, buf);
          };
          var fnTyped = {
            arraySet: function(dest, src, src_offs, len, dest_offs) {
              if (src.subarray && dest.subarray) {
                dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
                return;
              }
              for (var i = 0; i < len; i++)
                dest[dest_offs + i] = src[src_offs + i];
            },
            // Join array of chunks to single array.
            flattenChunks: function(chunks) {
              var i, l, len, pos, chunk, result;
              for (len = 0, i = 0, l = chunks.length; i < l; i++)
                len += chunks[i].length;
              for (result = new Uint8Array(len), pos = 0, i = 0, l = chunks.length; i < l; i++)
                chunk = chunks[i], result.set(chunk, pos), pos += chunk.length;
              return result;
            }
          }, fnUntyped = {
            arraySet: function(dest, src, src_offs, len, dest_offs) {
              for (var i = 0; i < len; i++)
                dest[dest_offs + i] = src[src_offs + i];
            },
            // Join array of chunks to single array.
            flattenChunks: function(chunks) {
              return [].concat.apply([], chunks);
            }
          };
          exports3.setTyped = function(on) {
            on ? (exports3.Buf8 = Uint8Array, exports3.Buf16 = Uint16Array, exports3.Buf32 = Int32Array, exports3.assign(exports3, fnTyped)) : (exports3.Buf8 = Array, exports3.Buf16 = Array, exports3.Buf32 = Array, exports3.assign(exports3, fnUntyped));
          }, exports3.setTyped(TYPED_OK);
        }, {}], 53: [function(require2, module3, exports3) {
          "use strict";
          function adler32(adler, buf, len, pos) {
            for (var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0; len !== 0; ) {
              n = len > 2e3 ? 2e3 : len, len -= n;
              do
                s1 = s1 + buf[pos++] | 0, s2 = s2 + s1 | 0;
              while (--n);
              s1 %= 65521, s2 %= 65521;
            }
            return s1 | s2 << 16 | 0;
          }
          module3.exports = adler32;
        }, {}], 54: [function(require2, module3, exports3) {
          "use strict";
          module3.exports = {
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
        }, {}], 55: [function(require2, module3, exports3) {
          "use strict";
          function makeTable() {
            for (var c, table = [], n = 0; n < 256; n++) {
              c = n;
              for (var k = 0; k < 8; k++)
                c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
              table[n] = c;
            }
            return table;
          }
          var crcTable = makeTable();
          function crc32(crc, buf, len, pos) {
            var t = crcTable, end = pos + len;
            crc ^= -1;
            for (var i = pos; i < end; i++)
              crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
            return crc ^ -1;
          }
          module3.exports = crc32;
        }, {}], 56: [function(require2, module3, exports3) {
          "use strict";
          var utils = require2("../utils/common"), trees = require2("./trees"), adler32 = require2("./adler32"), crc32 = require2("./crc32"), msg = require2("./messages"), Z_NO_FLUSH = 0, Z_PARTIAL_FLUSH = 1, Z_FULL_FLUSH = 3, Z_FINISH = 4, Z_BLOCK = 5, Z_OK = 0, Z_STREAM_END = 1, Z_STREAM_ERROR = -2, Z_DATA_ERROR = -3, Z_BUF_ERROR = -5, Z_DEFAULT_COMPRESSION = -1, Z_FILTERED = 1, Z_HUFFMAN_ONLY = 2, Z_RLE = 3, Z_FIXED = 4, Z_DEFAULT_STRATEGY = 0, Z_UNKNOWN = 2, Z_DEFLATED = 8, MAX_MEM_LEVEL = 9, MAX_WBITS = 15, DEF_MEM_LEVEL = 8, LENGTH_CODES = 29, LITERALS = 256, L_CODES = LITERALS + 1 + LENGTH_CODES, D_CODES = 30, BL_CODES = 19, HEAP_SIZE = 2 * L_CODES + 1, MAX_BITS = 15, MIN_MATCH = 3, MAX_MATCH = 258, MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1, PRESET_DICT = 32, INIT_STATE = 42, EXTRA_STATE = 69, NAME_STATE = 73, COMMENT_STATE = 91, HCRC_STATE = 103, BUSY_STATE = 113, FINISH_STATE = 666, BS_NEED_MORE = 1, BS_BLOCK_DONE = 2, BS_FINISH_STARTED = 3, BS_FINISH_DONE = 4, OS_CODE = 3;
          function err(strm, errorCode) {
            return strm.msg = msg[errorCode], errorCode;
          }
          function rank(f) {
            return (f << 1) - (f > 4 ? 9 : 0);
          }
          function zero(buf) {
            for (var len = buf.length; --len >= 0; )
              buf[len] = 0;
          }
          function flush_pending(strm) {
            var s = strm.state, len = s.pending;
            len > strm.avail_out && (len = strm.avail_out), len !== 0 && (utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out), strm.next_out += len, s.pending_out += len, strm.total_out += len, strm.avail_out -= len, s.pending -= len, s.pending === 0 && (s.pending_out = 0));
          }
          function flush_block_only(s, last) {
            trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last), s.block_start = s.strstart, flush_pending(s.strm);
          }
          function put_byte(s, b) {
            s.pending_buf[s.pending++] = b;
          }
          function putShortMSB(s, b) {
            s.pending_buf[s.pending++] = b >>> 8 & 255, s.pending_buf[s.pending++] = b & 255;
          }
          function read_buf(strm, buf, start, size) {
            var len = strm.avail_in;
            return len > size && (len = size), len === 0 ? 0 : (strm.avail_in -= len, utils.arraySet(buf, strm.input, strm.next_in, len, start), strm.state.wrap === 1 ? strm.adler = adler32(strm.adler, buf, len, start) : strm.state.wrap === 2 && (strm.adler = crc32(strm.adler, buf, len, start)), strm.next_in += len, strm.total_in += len, len);
          }
          function longest_match(s, cur_match) {
            var chain_length = s.max_chain_length, scan = s.strstart, match, len, best_len = s.prev_length, nice_match = s.nice_match, limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0, _win = s.window, wmask = s.w_mask, prev = s.prev, strend = s.strstart + MAX_MATCH, scan_end1 = _win[scan + best_len - 1], scan_end = _win[scan + best_len];
            s.prev_length >= s.good_match && (chain_length >>= 2), nice_match > s.lookahead && (nice_match = s.lookahead);
            do
              if (match = cur_match, !(_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1])) {
                scan += 2, match++;
                do
                  ;
                while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
                if (len = MAX_MATCH - (strend - scan), scan = strend - MAX_MATCH, len > best_len) {
                  if (s.match_start = cur_match, best_len = len, len >= nice_match)
                    break;
                  scan_end1 = _win[scan + best_len - 1], scan_end = _win[scan + best_len];
                }
              }
            while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
            return best_len <= s.lookahead ? best_len : s.lookahead;
          }
          function fill_window(s) {
            var _w_size = s.w_size, p, n, m, more, str;
            do {
              if (more = s.window_size - s.lookahead - s.strstart, s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
                utils.arraySet(s.window, s.window, _w_size, _w_size, 0), s.match_start -= _w_size, s.strstart -= _w_size, s.block_start -= _w_size, n = s.hash_size, p = n;
                do
                  m = s.head[--p], s.head[p] = m >= _w_size ? m - _w_size : 0;
                while (--n);
                n = _w_size, p = n;
                do
                  m = s.prev[--p], s.prev[p] = m >= _w_size ? m - _w_size : 0;
                while (--n);
                more += _w_size;
              }
              if (s.strm.avail_in === 0)
                break;
              if (n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more), s.lookahead += n, s.lookahead + s.insert >= MIN_MATCH)
                for (str = s.strstart - s.insert, s.ins_h = s.window[str], s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask; s.insert && (s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask, s.prev[str & s.w_mask] = s.head[s.ins_h], s.head[s.ins_h] = str, str++, s.insert--, !(s.lookahead + s.insert < MIN_MATCH)); )
                  ;
            } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
          }
          function deflate_stored(s, flush) {
            var max_block_size = 65535;
            for (max_block_size > s.pending_buf_size - 5 && (max_block_size = s.pending_buf_size - 5); ; ) {
              if (s.lookahead <= 1) {
                if (fill_window(s), s.lookahead === 0 && flush === Z_NO_FLUSH)
                  return BS_NEED_MORE;
                if (s.lookahead === 0)
                  break;
              }
              s.strstart += s.lookahead, s.lookahead = 0;
              var max_start = s.block_start + max_block_size;
              if ((s.strstart === 0 || s.strstart >= max_start) && (s.lookahead = s.strstart - max_start, s.strstart = max_start, flush_block_only(s, !1), s.strm.avail_out === 0) || s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD && (flush_block_only(s, !1), s.strm.avail_out === 0))
                return BS_NEED_MORE;
            }
            return s.insert = 0, flush === Z_FINISH ? (flush_block_only(s, !0), s.strm.avail_out === 0 ? BS_FINISH_STARTED : BS_FINISH_DONE) : (s.strstart > s.block_start && (flush_block_only(s, !1), s.strm.avail_out === 0), BS_NEED_MORE);
          }
          function deflate_fast(s, flush) {
            for (var hash_head, bflush; ; ) {
              if (s.lookahead < MIN_LOOKAHEAD) {
                if (fill_window(s), s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH)
                  return BS_NEED_MORE;
                if (s.lookahead === 0)
                  break;
              }
              if (hash_head = 0, s.lookahead >= MIN_MATCH && (s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask, hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h], s.head[s.ins_h] = s.strstart), hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD && (s.match_length = longest_match(s, hash_head)), s.match_length >= MIN_MATCH)
                if (bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH), s.lookahead -= s.match_length, s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
                  s.match_length--;
                  do
                    s.strstart++, s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask, hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h], s.head[s.ins_h] = s.strstart;
                  while (--s.match_length !== 0);
                  s.strstart++;
                } else
                  s.strstart += s.match_length, s.match_length = 0, s.ins_h = s.window[s.strstart], s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
              else
                bflush = trees._tr_tally(s, 0, s.window[s.strstart]), s.lookahead--, s.strstart++;
              if (bflush && (flush_block_only(s, !1), s.strm.avail_out === 0))
                return BS_NEED_MORE;
            }
            return s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1, flush === Z_FINISH ? (flush_block_only(s, !0), s.strm.avail_out === 0 ? BS_FINISH_STARTED : BS_FINISH_DONE) : s.last_lit && (flush_block_only(s, !1), s.strm.avail_out === 0) ? BS_NEED_MORE : BS_BLOCK_DONE;
          }
          function deflate_slow(s, flush) {
            for (var hash_head, bflush, max_insert; ; ) {
              if (s.lookahead < MIN_LOOKAHEAD) {
                if (fill_window(s), s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH)
                  return BS_NEED_MORE;
                if (s.lookahead === 0)
                  break;
              }
              if (hash_head = 0, s.lookahead >= MIN_MATCH && (s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask, hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h], s.head[s.ins_h] = s.strstart), s.prev_length = s.match_length, s.prev_match = s.match_start, s.match_length = MIN_MATCH - 1, hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD && (s.match_length = longest_match(s, hash_head), s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096) && (s.match_length = MIN_MATCH - 1)), s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
                max_insert = s.strstart + s.lookahead - MIN_MATCH, bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH), s.lookahead -= s.prev_length - 1, s.prev_length -= 2;
                do
                  ++s.strstart <= max_insert && (s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask, hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h], s.head[s.ins_h] = s.strstart);
                while (--s.prev_length !== 0);
                if (s.match_available = 0, s.match_length = MIN_MATCH - 1, s.strstart++, bflush && (flush_block_only(s, !1), s.strm.avail_out === 0))
                  return BS_NEED_MORE;
              } else if (s.match_available) {
                if (bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]), bflush && flush_block_only(s, !1), s.strstart++, s.lookahead--, s.strm.avail_out === 0)
                  return BS_NEED_MORE;
              } else
                s.match_available = 1, s.strstart++, s.lookahead--;
            }
            return s.match_available && (bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]), s.match_available = 0), s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1, flush === Z_FINISH ? (flush_block_only(s, !0), s.strm.avail_out === 0 ? BS_FINISH_STARTED : BS_FINISH_DONE) : s.last_lit && (flush_block_only(s, !1), s.strm.avail_out === 0) ? BS_NEED_MORE : BS_BLOCK_DONE;
          }
          function deflate_rle(s, flush) {
            for (var bflush, prev, scan, strend, _win = s.window; ; ) {
              if (s.lookahead <= MAX_MATCH) {
                if (fill_window(s), s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH)
                  return BS_NEED_MORE;
                if (s.lookahead === 0)
                  break;
              }
              if (s.match_length = 0, s.lookahead >= MIN_MATCH && s.strstart > 0 && (scan = s.strstart - 1, prev = _win[scan], prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan])) {
                strend = s.strstart + MAX_MATCH;
                do
                  ;
                while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
                s.match_length = MAX_MATCH - (strend - scan), s.match_length > s.lookahead && (s.match_length = s.lookahead);
              }
              if (s.match_length >= MIN_MATCH ? (bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH), s.lookahead -= s.match_length, s.strstart += s.match_length, s.match_length = 0) : (bflush = trees._tr_tally(s, 0, s.window[s.strstart]), s.lookahead--, s.strstart++), bflush && (flush_block_only(s, !1), s.strm.avail_out === 0))
                return BS_NEED_MORE;
            }
            return s.insert = 0, flush === Z_FINISH ? (flush_block_only(s, !0), s.strm.avail_out === 0 ? BS_FINISH_STARTED : BS_FINISH_DONE) : s.last_lit && (flush_block_only(s, !1), s.strm.avail_out === 0) ? BS_NEED_MORE : BS_BLOCK_DONE;
          }
          function deflate_huff(s, flush) {
            for (var bflush; ; ) {
              if (s.lookahead === 0 && (fill_window(s), s.lookahead === 0)) {
                if (flush === Z_NO_FLUSH)
                  return BS_NEED_MORE;
                break;
              }
              if (s.match_length = 0, bflush = trees._tr_tally(s, 0, s.window[s.strstart]), s.lookahead--, s.strstart++, bflush && (flush_block_only(s, !1), s.strm.avail_out === 0))
                return BS_NEED_MORE;
            }
            return s.insert = 0, flush === Z_FINISH ? (flush_block_only(s, !0), s.strm.avail_out === 0 ? BS_FINISH_STARTED : BS_FINISH_DONE) : s.last_lit && (flush_block_only(s, !1), s.strm.avail_out === 0) ? BS_NEED_MORE : BS_BLOCK_DONE;
          }
          function Config(good_length, max_lazy, nice_length, max_chain, func) {
            this.good_length = good_length, this.max_lazy = max_lazy, this.nice_length = nice_length, this.max_chain = max_chain, this.func = func;
          }
          var configuration_table;
          configuration_table = [
            /*      good lazy nice chain */
            new Config(0, 0, 0, 0, deflate_stored),
            /* 0 store only */
            new Config(4, 4, 8, 4, deflate_fast),
            /* 1 max speed, no lazy matches */
            new Config(4, 5, 16, 8, deflate_fast),
            /* 2 */
            new Config(4, 6, 32, 32, deflate_fast),
            /* 3 */
            new Config(4, 4, 16, 16, deflate_slow),
            /* 4 lazy matches */
            new Config(8, 16, 32, 32, deflate_slow),
            /* 5 */
            new Config(8, 16, 128, 128, deflate_slow),
            /* 6 */
            new Config(8, 32, 128, 256, deflate_slow),
            /* 7 */
            new Config(32, 128, 258, 1024, deflate_slow),
            /* 8 */
            new Config(32, 258, 258, 4096, deflate_slow)
            /* 9 max compression */
          ];
          function lm_init(s) {
            s.window_size = 2 * s.w_size, zero(s.head), s.max_lazy_match = configuration_table[s.level].max_lazy, s.good_match = configuration_table[s.level].good_length, s.nice_match = configuration_table[s.level].nice_length, s.max_chain_length = configuration_table[s.level].max_chain, s.strstart = 0, s.block_start = 0, s.lookahead = 0, s.insert = 0, s.match_length = s.prev_length = MIN_MATCH - 1, s.match_available = 0, s.ins_h = 0;
          }
          function DeflateState() {
            this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = Z_DEFLATED, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2), this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2), this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2), zero(this.dyn_ltree), zero(this.dyn_dtree), zero(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new utils.Buf16(MAX_BITS + 1), this.heap = new utils.Buf16(2 * L_CODES + 1), zero(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new utils.Buf16(2 * L_CODES + 1), zero(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
          }
          function deflateResetKeep(strm) {
            var s;
            return !strm || !strm.state ? err(strm, Z_STREAM_ERROR) : (strm.total_in = strm.total_out = 0, strm.data_type = Z_UNKNOWN, s = strm.state, s.pending = 0, s.pending_out = 0, s.wrap < 0 && (s.wrap = -s.wrap), s.status = s.wrap ? INIT_STATE : BUSY_STATE, strm.adler = s.wrap === 2 ? 0 : 1, s.last_flush = Z_NO_FLUSH, trees._tr_init(s), Z_OK);
          }
          function deflateReset(strm) {
            var ret = deflateResetKeep(strm);
            return ret === Z_OK && lm_init(strm.state), ret;
          }
          function deflateSetHeader(strm, head) {
            return !strm || !strm.state || strm.state.wrap !== 2 ? Z_STREAM_ERROR : (strm.state.gzhead = head, Z_OK);
          }
          function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
            if (!strm)
              return Z_STREAM_ERROR;
            var wrap = 1;
            if (level === Z_DEFAULT_COMPRESSION && (level = 6), windowBits < 0 ? (wrap = 0, windowBits = -windowBits) : windowBits > 15 && (wrap = 2, windowBits -= 16), memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED)
              return err(strm, Z_STREAM_ERROR);
            windowBits === 8 && (windowBits = 9);
            var s = new DeflateState();
            return strm.state = s, s.strm = strm, s.wrap = wrap, s.gzhead = null, s.w_bits = windowBits, s.w_size = 1 << s.w_bits, s.w_mask = s.w_size - 1, s.hash_bits = memLevel + 7, s.hash_size = 1 << s.hash_bits, s.hash_mask = s.hash_size - 1, s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH), s.window = new utils.Buf8(s.w_size * 2), s.head = new utils.Buf16(s.hash_size), s.prev = new utils.Buf16(s.w_size), s.lit_bufsize = 1 << memLevel + 6, s.pending_buf_size = s.lit_bufsize * 4, s.pending_buf = new utils.Buf8(s.pending_buf_size), s.d_buf = 1 * s.lit_bufsize, s.l_buf = 3 * s.lit_bufsize, s.level = level, s.strategy = strategy, s.method = method, deflateReset(strm);
          }
          function deflateInit(strm, level) {
            return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
          }
          function deflate(strm, flush) {
            var old_flush, s, beg, val;
            if (!strm || !strm.state || flush > Z_BLOCK || flush < 0)
              return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
            if (s = strm.state, !strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH)
              return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
            if (s.strm = strm, old_flush = s.last_flush, s.last_flush = flush, s.status === INIT_STATE)
              if (s.wrap === 2)
                strm.adler = 0, put_byte(s, 31), put_byte(s, 139), put_byte(s, 8), s.gzhead ? (put_byte(
                  s,
                  (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (s.gzhead.extra ? 4 : 0) + (s.gzhead.name ? 8 : 0) + (s.gzhead.comment ? 16 : 0)
                ), put_byte(s, s.gzhead.time & 255), put_byte(s, s.gzhead.time >> 8 & 255), put_byte(s, s.gzhead.time >> 16 & 255), put_byte(s, s.gzhead.time >> 24 & 255), put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0), put_byte(s, s.gzhead.os & 255), s.gzhead.extra && s.gzhead.extra.length && (put_byte(s, s.gzhead.extra.length & 255), put_byte(s, s.gzhead.extra.length >> 8 & 255)), s.gzhead.hcrc && (strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0)), s.gzindex = 0, s.status = EXTRA_STATE) : (put_byte(s, 0), put_byte(s, 0), put_byte(s, 0), put_byte(s, 0), put_byte(s, 0), put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0), put_byte(s, OS_CODE), s.status = BUSY_STATE);
              else {
                var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8, level_flags = -1;
                s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? level_flags = 0 : s.level < 6 ? level_flags = 1 : s.level === 6 ? level_flags = 2 : level_flags = 3, header |= level_flags << 6, s.strstart !== 0 && (header |= PRESET_DICT), header += 31 - header % 31, s.status = BUSY_STATE, putShortMSB(s, header), s.strstart !== 0 && (putShortMSB(s, strm.adler >>> 16), putShortMSB(s, strm.adler & 65535)), strm.adler = 1;
              }
            if (s.status === EXTRA_STATE)
              if (s.gzhead.extra) {
                for (beg = s.pending; s.gzindex < (s.gzhead.extra.length & 65535) && !(s.pending === s.pending_buf_size && (s.gzhead.hcrc && s.pending > beg && (strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg)), flush_pending(strm), beg = s.pending, s.pending === s.pending_buf_size)); )
                  put_byte(s, s.gzhead.extra[s.gzindex] & 255), s.gzindex++;
                s.gzhead.hcrc && s.pending > beg && (strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg)), s.gzindex === s.gzhead.extra.length && (s.gzindex = 0, s.status = NAME_STATE);
              } else
                s.status = NAME_STATE;
            if (s.status === NAME_STATE)
              if (s.gzhead.name) {
                beg = s.pending;
                do {
                  if (s.pending === s.pending_buf_size && (s.gzhead.hcrc && s.pending > beg && (strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg)), flush_pending(strm), beg = s.pending, s.pending === s.pending_buf_size)) {
                    val = 1;
                    break;
                  }
                  s.gzindex < s.gzhead.name.length ? val = s.gzhead.name.charCodeAt(s.gzindex++) & 255 : val = 0, put_byte(s, val);
                } while (val !== 0);
                s.gzhead.hcrc && s.pending > beg && (strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg)), val === 0 && (s.gzindex = 0, s.status = COMMENT_STATE);
              } else
                s.status = COMMENT_STATE;
            if (s.status === COMMENT_STATE)
              if (s.gzhead.comment) {
                beg = s.pending;
                do {
                  if (s.pending === s.pending_buf_size && (s.gzhead.hcrc && s.pending > beg && (strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg)), flush_pending(strm), beg = s.pending, s.pending === s.pending_buf_size)) {
                    val = 1;
                    break;
                  }
                  s.gzindex < s.gzhead.comment.length ? val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255 : val = 0, put_byte(s, val);
                } while (val !== 0);
                s.gzhead.hcrc && s.pending > beg && (strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg)), val === 0 && (s.status = HCRC_STATE);
              } else
                s.status = HCRC_STATE;
            if (s.status === HCRC_STATE && (s.gzhead.hcrc ? (s.pending + 2 > s.pending_buf_size && flush_pending(strm), s.pending + 2 <= s.pending_buf_size && (put_byte(s, strm.adler & 255), put_byte(s, strm.adler >> 8 & 255), strm.adler = 0, s.status = BUSY_STATE)) : s.status = BUSY_STATE), s.pending !== 0) {
              if (flush_pending(strm), strm.avail_out === 0)
                return s.last_flush = -1, Z_OK;
            } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH)
              return err(strm, Z_BUF_ERROR);
            if (s.status === FINISH_STATE && strm.avail_in !== 0)
              return err(strm, Z_BUF_ERROR);
            if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
              var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
              if ((bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) && (s.status = FINISH_STATE), bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED)
                return strm.avail_out === 0 && (s.last_flush = -1), Z_OK;
              if (bstate === BS_BLOCK_DONE && (flush === Z_PARTIAL_FLUSH ? trees._tr_align(s) : flush !== Z_BLOCK && (trees._tr_stored_block(s, 0, 0, !1), flush === Z_FULL_FLUSH && (zero(s.head), s.lookahead === 0 && (s.strstart = 0, s.block_start = 0, s.insert = 0))), flush_pending(strm), strm.avail_out === 0))
                return s.last_flush = -1, Z_OK;
            }
            return flush !== Z_FINISH ? Z_OK : s.wrap <= 0 ? Z_STREAM_END : (s.wrap === 2 ? (put_byte(s, strm.adler & 255), put_byte(s, strm.adler >> 8 & 255), put_byte(s, strm.adler >> 16 & 255), put_byte(s, strm.adler >> 24 & 255), put_byte(s, strm.total_in & 255), put_byte(s, strm.total_in >> 8 & 255), put_byte(s, strm.total_in >> 16 & 255), put_byte(s, strm.total_in >> 24 & 255)) : (putShortMSB(s, strm.adler >>> 16), putShortMSB(s, strm.adler & 65535)), flush_pending(strm), s.wrap > 0 && (s.wrap = -s.wrap), s.pending !== 0 ? Z_OK : Z_STREAM_END);
          }
          function deflateEnd(strm) {
            var status;
            return !strm || !strm.state ? Z_STREAM_ERROR : (status = strm.state.status, status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE ? err(strm, Z_STREAM_ERROR) : (strm.state = null, status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK));
          }
          function deflateSetDictionary(strm, dictionary) {
            var dictLength = dictionary.length, s, str, n, wrap, avail, next, input, tmpDict;
            if (!strm || !strm.state || (s = strm.state, wrap = s.wrap, wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead))
              return Z_STREAM_ERROR;
            for (wrap === 1 && (strm.adler = adler32(strm.adler, dictionary, dictLength, 0)), s.wrap = 0, dictLength >= s.w_size && (wrap === 0 && (zero(s.head), s.strstart = 0, s.block_start = 0, s.insert = 0), tmpDict = new utils.Buf8(s.w_size), utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0), dictionary = tmpDict, dictLength = s.w_size), avail = strm.avail_in, next = strm.next_in, input = strm.input, strm.avail_in = dictLength, strm.next_in = 0, strm.input = dictionary, fill_window(s); s.lookahead >= MIN_MATCH; ) {
              str = s.strstart, n = s.lookahead - (MIN_MATCH - 1);
              do
                s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask, s.prev[str & s.w_mask] = s.head[s.ins_h], s.head[s.ins_h] = str, str++;
              while (--n);
              s.strstart = str, s.lookahead = MIN_MATCH - 1, fill_window(s);
            }
            return s.strstart += s.lookahead, s.block_start = s.strstart, s.insert = s.lookahead, s.lookahead = 0, s.match_length = s.prev_length = MIN_MATCH - 1, s.match_available = 0, strm.next_in = next, strm.input = input, strm.avail_in = avail, s.wrap = wrap, Z_OK;
          }
          exports3.deflateInit = deflateInit, exports3.deflateInit2 = deflateInit2, exports3.deflateReset = deflateReset, exports3.deflateResetKeep = deflateResetKeep, exports3.deflateSetHeader = deflateSetHeader, exports3.deflate = deflate, exports3.deflateEnd = deflateEnd, exports3.deflateSetDictionary = deflateSetDictionary, exports3.deflateInfo = "pako deflate (from Nodeca project)";
        }, { "../utils/common": 52, "./adler32": 53, "./crc32": 55, "./messages": 60, "./trees": 61 }], 57: [function(require2, module3, exports3) {
          "use strict";
          var BAD = 30, TYPE = 12;
          module3.exports = function(strm, start) {
            var state, _in, last, _out, beg, end, dmax, wsize, whave, wnext, s_window, hold, bits, lcode, dcode, lmask, dmask, here, op, len, dist, from, from_source, input, output;
            state = strm.state, _in = strm.next_in, input = strm.input, last = _in + (strm.avail_in - 5), _out = strm.next_out, output = strm.output, beg = _out - (start - strm.avail_out), end = _out + (strm.avail_out - 257), dmax = state.dmax, wsize = state.wsize, whave = state.whave, wnext = state.wnext, s_window = state.window, hold = state.hold, bits = state.bits, lcode = state.lencode, dcode = state.distcode, lmask = (1 << state.lenbits) - 1, dmask = (1 << state.distbits) - 1;
            top:
              do {
                bits < 15 && (hold += input[_in++] << bits, bits += 8, hold += input[_in++] << bits, bits += 8), here = lcode[hold & lmask];
                dolen:
                  for (; ; ) {
                    if (op = here >>> 24, hold >>>= op, bits -= op, op = here >>> 16 & 255, op === 0)
                      output[_out++] = here & 65535;
                    else if (op & 16) {
                      len = here & 65535, op &= 15, op && (bits < op && (hold += input[_in++] << bits, bits += 8), len += hold & (1 << op) - 1, hold >>>= op, bits -= op), bits < 15 && (hold += input[_in++] << bits, bits += 8, hold += input[_in++] << bits, bits += 8), here = dcode[hold & dmask];
                      dodist:
                        for (; ; ) {
                          if (op = here >>> 24, hold >>>= op, bits -= op, op = here >>> 16 & 255, op & 16) {
                            if (dist = here & 65535, op &= 15, bits < op && (hold += input[_in++] << bits, bits += 8, bits < op && (hold += input[_in++] << bits, bits += 8)), dist += hold & (1 << op) - 1, dist > dmax) {
                              strm.msg = "invalid distance too far back", state.mode = BAD;
                              break top;
                            }
                            if (hold >>>= op, bits -= op, op = _out - beg, dist > op) {
                              if (op = dist - op, op > whave && state.sane) {
                                strm.msg = "invalid distance too far back", state.mode = BAD;
                                break top;
                              }
                              if (from = 0, from_source = s_window, wnext === 0) {
                                if (from += wsize - op, op < len) {
                                  len -= op;
                                  do
                                    output[_out++] = s_window[from++];
                                  while (--op);
                                  from = _out - dist, from_source = output;
                                }
                              } else if (wnext < op) {
                                if (from += wsize + wnext - op, op -= wnext, op < len) {
                                  len -= op;
                                  do
                                    output[_out++] = s_window[from++];
                                  while (--op);
                                  if (from = 0, wnext < len) {
                                    op = wnext, len -= op;
                                    do
                                      output[_out++] = s_window[from++];
                                    while (--op);
                                    from = _out - dist, from_source = output;
                                  }
                                }
                              } else if (from += wnext - op, op < len) {
                                len -= op;
                                do
                                  output[_out++] = s_window[from++];
                                while (--op);
                                from = _out - dist, from_source = output;
                              }
                              for (; len > 2; )
                                output[_out++] = from_source[from++], output[_out++] = from_source[from++], output[_out++] = from_source[from++], len -= 3;
                              len && (output[_out++] = from_source[from++], len > 1 && (output[_out++] = from_source[from++]));
                            } else {
                              from = _out - dist;
                              do
                                output[_out++] = output[from++], output[_out++] = output[from++], output[_out++] = output[from++], len -= 3;
                              while (len > 2);
                              len && (output[_out++] = output[from++], len > 1 && (output[_out++] = output[from++]));
                            }
                          } else if (op & 64) {
                            strm.msg = "invalid distance code", state.mode = BAD;
                            break top;
                          } else {
                            here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                            continue dodist;
                          }
                          break;
                        }
                    } else if (op & 64)
                      if (op & 32) {
                        state.mode = TYPE;
                        break top;
                      } else {
                        strm.msg = "invalid literal/length code", state.mode = BAD;
                        break top;
                      }
                    else {
                      here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                      continue dolen;
                    }
                    break;
                  }
              } while (_in < last && _out < end);
            len = bits >> 3, _in -= len, bits -= len << 3, hold &= (1 << bits) - 1, strm.next_in = _in, strm.next_out = _out, strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last), strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end), state.hold = hold, state.bits = bits;
          };
        }, {}], 58: [function(require2, module3, exports3) {
          "use strict";
          var utils = require2("../utils/common"), adler32 = require2("./adler32"), crc32 = require2("./crc32"), inflate_fast = require2("./inffast"), inflate_table = require2("./inftrees"), CODES = 0, LENS = 1, DISTS = 2, Z_FINISH = 4, Z_BLOCK = 5, Z_TREES = 6, Z_OK = 0, Z_STREAM_END = 1, Z_NEED_DICT = 2, Z_STREAM_ERROR = -2, Z_DATA_ERROR = -3, Z_MEM_ERROR = -4, Z_BUF_ERROR = -5, Z_DEFLATED = 8, HEAD = 1, FLAGS = 2, TIME = 3, OS = 4, EXLEN = 5, EXTRA = 6, NAME = 7, COMMENT = 8, HCRC = 9, DICTID = 10, DICT = 11, TYPE = 12, TYPEDO = 13, STORED = 14, COPY_ = 15, COPY = 16, TABLE = 17, LENLENS = 18, CODELENS = 19, LEN_ = 20, LEN = 21, LENEXT = 22, DIST = 23, DISTEXT = 24, MATCH = 25, LIT = 26, CHECK = 27, LENGTH = 28, DONE = 29, BAD = 30, MEM = 31, SYNC = 32, ENOUGH_LENS = 852, ENOUGH_DISTS = 592, MAX_WBITS = 15, DEF_WBITS = MAX_WBITS;
          function zswap32(q) {
            return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
          }
          function InflateState() {
            this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new utils.Buf16(320), this.work = new utils.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
          }
          function inflateResetKeep(strm) {
            var state;
            return !strm || !strm.state ? Z_STREAM_ERROR : (state = strm.state, strm.total_in = strm.total_out = state.total = 0, strm.msg = "", state.wrap && (strm.adler = state.wrap & 1), state.mode = HEAD, state.last = 0, state.havedict = 0, state.dmax = 32768, state.head = null, state.hold = 0, state.bits = 0, state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS), state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS), state.sane = 1, state.back = -1, Z_OK);
          }
          function inflateReset(strm) {
            var state;
            return !strm || !strm.state ? Z_STREAM_ERROR : (state = strm.state, state.wsize = 0, state.whave = 0, state.wnext = 0, inflateResetKeep(strm));
          }
          function inflateReset2(strm, windowBits) {
            var wrap, state;
            return !strm || !strm.state || (state = strm.state, windowBits < 0 ? (wrap = 0, windowBits = -windowBits) : (wrap = (windowBits >> 4) + 1, windowBits < 48 && (windowBits &= 15)), windowBits && (windowBits < 8 || windowBits > 15)) ? Z_STREAM_ERROR : (state.window !== null && state.wbits !== windowBits && (state.window = null), state.wrap = wrap, state.wbits = windowBits, inflateReset(strm));
          }
          function inflateInit2(strm, windowBits) {
            var ret, state;
            return strm ? (state = new InflateState(), strm.state = state, state.window = null, ret = inflateReset2(strm, windowBits), ret !== Z_OK && (strm.state = null), ret) : Z_STREAM_ERROR;
          }
          function inflateInit(strm) {
            return inflateInit2(strm, DEF_WBITS);
          }
          var virgin = !0, lenfix, distfix;
          function fixedtables(state) {
            if (virgin) {
              var sym;
              for (lenfix = new utils.Buf32(512), distfix = new utils.Buf32(32), sym = 0; sym < 144; )
                state.lens[sym++] = 8;
              for (; sym < 256; )
                state.lens[sym++] = 9;
              for (; sym < 280; )
                state.lens[sym++] = 7;
              for (; sym < 288; )
                state.lens[sym++] = 8;
              for (inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 }), sym = 0; sym < 32; )
                state.lens[sym++] = 5;
              inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 }), virgin = !1;
            }
            state.lencode = lenfix, state.lenbits = 9, state.distcode = distfix, state.distbits = 5;
          }
          function updatewindow(strm, src, end, copy2) {
            var dist, state = strm.state;
            return state.window === null && (state.wsize = 1 << state.wbits, state.wnext = 0, state.whave = 0, state.window = new utils.Buf8(state.wsize)), copy2 >= state.wsize ? (utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0), state.wnext = 0, state.whave = state.wsize) : (dist = state.wsize - state.wnext, dist > copy2 && (dist = copy2), utils.arraySet(state.window, src, end - copy2, dist, state.wnext), copy2 -= dist, copy2 ? (utils.arraySet(state.window, src, end - copy2, copy2, 0), state.wnext = copy2, state.whave = state.wsize) : (state.wnext += dist, state.wnext === state.wsize && (state.wnext = 0), state.whave < state.wsize && (state.whave += dist))), 0;
          }
          function inflate(strm, flush) {
            var state, input, output, next, put, have, left, hold, bits, _in, _out, copy2, from, from_source, here = 0, here_bits, here_op, here_val, last_bits, last_op, last_val, len, ret, hbuf = new utils.Buf8(4), opts, n, order = (
              /* permutation of code lengths */
              [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
            );
            if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0)
              return Z_STREAM_ERROR;
            state = strm.state, state.mode === TYPE && (state.mode = TYPEDO), put = strm.next_out, output = strm.output, left = strm.avail_out, next = strm.next_in, input = strm.input, have = strm.avail_in, hold = state.hold, bits = state.bits, _in = have, _out = left, ret = Z_OK;
            inf_leave:
              for (; ; )
                switch (state.mode) {
                  case HEAD:
                    if (state.wrap === 0) {
                      state.mode = TYPEDO;
                      break;
                    }
                    for (; bits < 16; ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    if (state.wrap & 2 && hold === 35615) {
                      state.check = 0, hbuf[0] = hold & 255, hbuf[1] = hold >>> 8 & 255, state.check = crc32(state.check, hbuf, 2, 0), hold = 0, bits = 0, state.mode = FLAGS;
                      break;
                    }
                    if (state.flags = 0, state.head && (state.head.done = !1), !(state.wrap & 1) || /* check if zlib header allowed */
                    (((hold & 255) << 8) + (hold >> 8)) % 31) {
                      strm.msg = "incorrect header check", state.mode = BAD;
                      break;
                    }
                    if ((hold & 15) !== Z_DEFLATED) {
                      strm.msg = "unknown compression method", state.mode = BAD;
                      break;
                    }
                    if (hold >>>= 4, bits -= 4, len = (hold & 15) + 8, state.wbits === 0)
                      state.wbits = len;
                    else if (len > state.wbits) {
                      strm.msg = "invalid window size", state.mode = BAD;
                      break;
                    }
                    state.dmax = 1 << len, strm.adler = state.check = 1, state.mode = hold & 512 ? DICTID : TYPE, hold = 0, bits = 0;
                    break;
                  case FLAGS:
                    for (; bits < 16; ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    if (state.flags = hold, (state.flags & 255) !== Z_DEFLATED) {
                      strm.msg = "unknown compression method", state.mode = BAD;
                      break;
                    }
                    if (state.flags & 57344) {
                      strm.msg = "unknown header flags set", state.mode = BAD;
                      break;
                    }
                    state.head && (state.head.text = hold >> 8 & 1), state.flags & 512 && (hbuf[0] = hold & 255, hbuf[1] = hold >>> 8 & 255, state.check = crc32(state.check, hbuf, 2, 0)), hold = 0, bits = 0, state.mode = TIME;
                  case TIME:
                    for (; bits < 32; ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    state.head && (state.head.time = hold), state.flags & 512 && (hbuf[0] = hold & 255, hbuf[1] = hold >>> 8 & 255, hbuf[2] = hold >>> 16 & 255, hbuf[3] = hold >>> 24 & 255, state.check = crc32(state.check, hbuf, 4, 0)), hold = 0, bits = 0, state.mode = OS;
                  case OS:
                    for (; bits < 16; ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    state.head && (state.head.xflags = hold & 255, state.head.os = hold >> 8), state.flags & 512 && (hbuf[0] = hold & 255, hbuf[1] = hold >>> 8 & 255, state.check = crc32(state.check, hbuf, 2, 0)), hold = 0, bits = 0, state.mode = EXLEN;
                  case EXLEN:
                    if (state.flags & 1024) {
                      for (; bits < 16; ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold += input[next++] << bits, bits += 8;
                      }
                      state.length = hold, state.head && (state.head.extra_len = hold), state.flags & 512 && (hbuf[0] = hold & 255, hbuf[1] = hold >>> 8 & 255, state.check = crc32(state.check, hbuf, 2, 0)), hold = 0, bits = 0;
                    } else state.head && (state.head.extra = null);
                    state.mode = EXTRA;
                  case EXTRA:
                    if (state.flags & 1024 && (copy2 = state.length, copy2 > have && (copy2 = have), copy2 && (state.head && (len = state.head.extra_len - state.length, state.head.extra || (state.head.extra = new Array(state.head.extra_len)), utils.arraySet(
                      state.head.extra,
                      input,
                      next,
                      // extra field is limited to 65536 bytes
                      // - no need for additional size check
                      copy2,
                      /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                      len
                    )), state.flags & 512 && (state.check = crc32(state.check, input, copy2, next)), have -= copy2, next += copy2, state.length -= copy2), state.length))
                      break inf_leave;
                    state.length = 0, state.mode = NAME;
                  case NAME:
                    if (state.flags & 2048) {
                      if (have === 0)
                        break inf_leave;
                      copy2 = 0;
                      do
                        len = input[next + copy2++], state.head && len && state.length < 65536 && (state.head.name += String.fromCharCode(len));
                      while (len && copy2 < have);
                      if (state.flags & 512 && (state.check = crc32(state.check, input, copy2, next)), have -= copy2, next += copy2, len)
                        break inf_leave;
                    } else state.head && (state.head.name = null);
                    state.length = 0, state.mode = COMMENT;
                  case COMMENT:
                    if (state.flags & 4096) {
                      if (have === 0)
                        break inf_leave;
                      copy2 = 0;
                      do
                        len = input[next + copy2++], state.head && len && state.length < 65536 && (state.head.comment += String.fromCharCode(len));
                      while (len && copy2 < have);
                      if (state.flags & 512 && (state.check = crc32(state.check, input, copy2, next)), have -= copy2, next += copy2, len)
                        break inf_leave;
                    } else state.head && (state.head.comment = null);
                    state.mode = HCRC;
                  case HCRC:
                    if (state.flags & 512) {
                      for (; bits < 16; ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold += input[next++] << bits, bits += 8;
                      }
                      if (hold !== (state.check & 65535)) {
                        strm.msg = "header crc mismatch", state.mode = BAD;
                        break;
                      }
                      hold = 0, bits = 0;
                    }
                    state.head && (state.head.hcrc = state.flags >> 9 & 1, state.head.done = !0), strm.adler = state.check = 0, state.mode = TYPE;
                    break;
                  case DICTID:
                    for (; bits < 32; ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    strm.adler = state.check = zswap32(hold), hold = 0, bits = 0, state.mode = DICT;
                  case DICT:
                    if (state.havedict === 0)
                      return strm.next_out = put, strm.avail_out = left, strm.next_in = next, strm.avail_in = have, state.hold = hold, state.bits = bits, Z_NEED_DICT;
                    strm.adler = state.check = 1, state.mode = TYPE;
                  case TYPE:
                    if (flush === Z_BLOCK || flush === Z_TREES)
                      break inf_leave;
                  case TYPEDO:
                    if (state.last) {
                      hold >>>= bits & 7, bits -= bits & 7, state.mode = CHECK;
                      break;
                    }
                    for (; bits < 3; ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    switch (state.last = hold & 1, hold >>>= 1, bits -= 1, hold & 3) {
                      case 0:
                        state.mode = STORED;
                        break;
                      case 1:
                        if (fixedtables(state), state.mode = LEN_, flush === Z_TREES) {
                          hold >>>= 2, bits -= 2;
                          break inf_leave;
                        }
                        break;
                      case 2:
                        state.mode = TABLE;
                        break;
                      case 3:
                        strm.msg = "invalid block type", state.mode = BAD;
                    }
                    hold >>>= 2, bits -= 2;
                    break;
                  case STORED:
                    for (hold >>>= bits & 7, bits -= bits & 7; bits < 32; ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                      strm.msg = "invalid stored block lengths", state.mode = BAD;
                      break;
                    }
                    if (state.length = hold & 65535, hold = 0, bits = 0, state.mode = COPY_, flush === Z_TREES)
                      break inf_leave;
                  case COPY_:
                    state.mode = COPY;
                  case COPY:
                    if (copy2 = state.length, copy2) {
                      if (copy2 > have && (copy2 = have), copy2 > left && (copy2 = left), copy2 === 0)
                        break inf_leave;
                      utils.arraySet(output, input, next, copy2, put), have -= copy2, next += copy2, left -= copy2, put += copy2, state.length -= copy2;
                      break;
                    }
                    state.mode = TYPE;
                    break;
                  case TABLE:
                    for (; bits < 14; ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    if (state.nlen = (hold & 31) + 257, hold >>>= 5, bits -= 5, state.ndist = (hold & 31) + 1, hold >>>= 5, bits -= 5, state.ncode = (hold & 15) + 4, hold >>>= 4, bits -= 4, state.nlen > 286 || state.ndist > 30) {
                      strm.msg = "too many length or distance symbols", state.mode = BAD;
                      break;
                    }
                    state.have = 0, state.mode = LENLENS;
                  case LENLENS:
                    for (; state.have < state.ncode; ) {
                      for (; bits < 3; ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold += input[next++] << bits, bits += 8;
                      }
                      state.lens[order[state.have++]] = hold & 7, hold >>>= 3, bits -= 3;
                    }
                    for (; state.have < 19; )
                      state.lens[order[state.have++]] = 0;
                    if (state.lencode = state.lendyn, state.lenbits = 7, opts = { bits: state.lenbits }, ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts), state.lenbits = opts.bits, ret) {
                      strm.msg = "invalid code lengths set", state.mode = BAD;
                      break;
                    }
                    state.have = 0, state.mode = CODELENS;
                  case CODELENS:
                    for (; state.have < state.nlen + state.ndist; ) {
                      for (; here = state.lencode[hold & (1 << state.lenbits) - 1], here_bits = here >>> 24, here_op = here >>> 16 & 255, here_val = here & 65535, !(here_bits <= bits); ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold += input[next++] << bits, bits += 8;
                      }
                      if (here_val < 16)
                        hold >>>= here_bits, bits -= here_bits, state.lens[state.have++] = here_val;
                      else {
                        if (here_val === 16) {
                          for (n = here_bits + 2; bits < n; ) {
                            if (have === 0)
                              break inf_leave;
                            have--, hold += input[next++] << bits, bits += 8;
                          }
                          if (hold >>>= here_bits, bits -= here_bits, state.have === 0) {
                            strm.msg = "invalid bit length repeat", state.mode = BAD;
                            break;
                          }
                          len = state.lens[state.have - 1], copy2 = 3 + (hold & 3), hold >>>= 2, bits -= 2;
                        } else if (here_val === 17) {
                          for (n = here_bits + 3; bits < n; ) {
                            if (have === 0)
                              break inf_leave;
                            have--, hold += input[next++] << bits, bits += 8;
                          }
                          hold >>>= here_bits, bits -= here_bits, len = 0, copy2 = 3 + (hold & 7), hold >>>= 3, bits -= 3;
                        } else {
                          for (n = here_bits + 7; bits < n; ) {
                            if (have === 0)
                              break inf_leave;
                            have--, hold += input[next++] << bits, bits += 8;
                          }
                          hold >>>= here_bits, bits -= here_bits, len = 0, copy2 = 11 + (hold & 127), hold >>>= 7, bits -= 7;
                        }
                        if (state.have + copy2 > state.nlen + state.ndist) {
                          strm.msg = "invalid bit length repeat", state.mode = BAD;
                          break;
                        }
                        for (; copy2--; )
                          state.lens[state.have++] = len;
                      }
                    }
                    if (state.mode === BAD)
                      break;
                    if (state.lens[256] === 0) {
                      strm.msg = "invalid code -- missing end-of-block", state.mode = BAD;
                      break;
                    }
                    if (state.lenbits = 9, opts = { bits: state.lenbits }, ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts), state.lenbits = opts.bits, ret) {
                      strm.msg = "invalid literal/lengths set", state.mode = BAD;
                      break;
                    }
                    if (state.distbits = 6, state.distcode = state.distdyn, opts = { bits: state.distbits }, ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts), state.distbits = opts.bits, ret) {
                      strm.msg = "invalid distances set", state.mode = BAD;
                      break;
                    }
                    if (state.mode = LEN_, flush === Z_TREES)
                      break inf_leave;
                  case LEN_:
                    state.mode = LEN;
                  case LEN:
                    if (have >= 6 && left >= 258) {
                      strm.next_out = put, strm.avail_out = left, strm.next_in = next, strm.avail_in = have, state.hold = hold, state.bits = bits, inflate_fast(strm, _out), put = strm.next_out, output = strm.output, left = strm.avail_out, next = strm.next_in, input = strm.input, have = strm.avail_in, hold = state.hold, bits = state.bits, state.mode === TYPE && (state.back = -1);
                      break;
                    }
                    for (state.back = 0; here = state.lencode[hold & (1 << state.lenbits) - 1], here_bits = here >>> 24, here_op = here >>> 16 & 255, here_val = here & 65535, !(here_bits <= bits); ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    if (here_op && !(here_op & 240)) {
                      for (last_bits = here_bits, last_op = here_op, last_val = here_val; here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)], here_bits = here >>> 24, here_op = here >>> 16 & 255, here_val = here & 65535, !(last_bits + here_bits <= bits); ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold += input[next++] << bits, bits += 8;
                      }
                      hold >>>= last_bits, bits -= last_bits, state.back += last_bits;
                    }
                    if (hold >>>= here_bits, bits -= here_bits, state.back += here_bits, state.length = here_val, here_op === 0) {
                      state.mode = LIT;
                      break;
                    }
                    if (here_op & 32) {
                      state.back = -1, state.mode = TYPE;
                      break;
                    }
                    if (here_op & 64) {
                      strm.msg = "invalid literal/length code", state.mode = BAD;
                      break;
                    }
                    state.extra = here_op & 15, state.mode = LENEXT;
                  case LENEXT:
                    if (state.extra) {
                      for (n = state.extra; bits < n; ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold += input[next++] << bits, bits += 8;
                      }
                      state.length += hold & (1 << state.extra) - 1, hold >>>= state.extra, bits -= state.extra, state.back += state.extra;
                    }
                    state.was = state.length, state.mode = DIST;
                  case DIST:
                    for (; here = state.distcode[hold & (1 << state.distbits) - 1], here_bits = here >>> 24, here_op = here >>> 16 & 255, here_val = here & 65535, !(here_bits <= bits); ) {
                      if (have === 0)
                        break inf_leave;
                      have--, hold += input[next++] << bits, bits += 8;
                    }
                    if (!(here_op & 240)) {
                      for (last_bits = here_bits, last_op = here_op, last_val = here_val; here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)], here_bits = here >>> 24, here_op = here >>> 16 & 255, here_val = here & 65535, !(last_bits + here_bits <= bits); ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold += input[next++] << bits, bits += 8;
                      }
                      hold >>>= last_bits, bits -= last_bits, state.back += last_bits;
                    }
                    if (hold >>>= here_bits, bits -= here_bits, state.back += here_bits, here_op & 64) {
                      strm.msg = "invalid distance code", state.mode = BAD;
                      break;
                    }
                    state.offset = here_val, state.extra = here_op & 15, state.mode = DISTEXT;
                  case DISTEXT:
                    if (state.extra) {
                      for (n = state.extra; bits < n; ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold += input[next++] << bits, bits += 8;
                      }
                      state.offset += hold & (1 << state.extra) - 1, hold >>>= state.extra, bits -= state.extra, state.back += state.extra;
                    }
                    if (state.offset > state.dmax) {
                      strm.msg = "invalid distance too far back", state.mode = BAD;
                      break;
                    }
                    state.mode = MATCH;
                  case MATCH:
                    if (left === 0)
                      break inf_leave;
                    if (copy2 = _out - left, state.offset > copy2) {
                      if (copy2 = state.offset - copy2, copy2 > state.whave && state.sane) {
                        strm.msg = "invalid distance too far back", state.mode = BAD;
                        break;
                      }
                      copy2 > state.wnext ? (copy2 -= state.wnext, from = state.wsize - copy2) : from = state.wnext - copy2, copy2 > state.length && (copy2 = state.length), from_source = state.window;
                    } else
                      from_source = output, from = put - state.offset, copy2 = state.length;
                    copy2 > left && (copy2 = left), left -= copy2, state.length -= copy2;
                    do
                      output[put++] = from_source[from++];
                    while (--copy2);
                    state.length === 0 && (state.mode = LEN);
                    break;
                  case LIT:
                    if (left === 0)
                      break inf_leave;
                    output[put++] = state.length, left--, state.mode = LEN;
                    break;
                  case CHECK:
                    if (state.wrap) {
                      for (; bits < 32; ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold |= input[next++] << bits, bits += 8;
                      }
                      if (_out -= left, strm.total_out += _out, state.total += _out, _out && (strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                      state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out)), _out = left, (state.flags ? hold : zswap32(hold)) !== state.check) {
                        strm.msg = "incorrect data check", state.mode = BAD;
                        break;
                      }
                      hold = 0, bits = 0;
                    }
                    state.mode = LENGTH;
                  case LENGTH:
                    if (state.wrap && state.flags) {
                      for (; bits < 32; ) {
                        if (have === 0)
                          break inf_leave;
                        have--, hold += input[next++] << bits, bits += 8;
                      }
                      if (hold !== (state.total & 4294967295)) {
                        strm.msg = "incorrect length check", state.mode = BAD;
                        break;
                      }
                      hold = 0, bits = 0;
                    }
                    state.mode = DONE;
                  case DONE:
                    ret = Z_STREAM_END;
                    break inf_leave;
                  case BAD:
                    ret = Z_DATA_ERROR;
                    break inf_leave;
                  case MEM:
                    return Z_MEM_ERROR;
                  case SYNC:
                  default:
                    return Z_STREAM_ERROR;
                }
            return strm.next_out = put, strm.avail_out = left, strm.next_in = next, strm.avail_in = have, state.hold = hold, state.bits = bits, (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) && updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out) ? (state.mode = MEM, Z_MEM_ERROR) : (_in -= strm.avail_in, _out -= strm.avail_out, strm.total_in += _in, strm.total_out += _out, state.total += _out, state.wrap && _out && (strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
            state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out)), strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0), (_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK && (ret = Z_BUF_ERROR), ret);
          }
          function inflateEnd(strm) {
            if (!strm || !strm.state)
              return Z_STREAM_ERROR;
            var state = strm.state;
            return state.window && (state.window = null), strm.state = null, Z_OK;
          }
          function inflateGetHeader(strm, head) {
            var state;
            return !strm || !strm.state || (state = strm.state, !(state.wrap & 2)) ? Z_STREAM_ERROR : (state.head = head, head.done = !1, Z_OK);
          }
          function inflateSetDictionary(strm, dictionary) {
            var dictLength = dictionary.length, state, dictid, ret;
            return !strm || !strm.state || (state = strm.state, state.wrap !== 0 && state.mode !== DICT) ? Z_STREAM_ERROR : state.mode === DICT && (dictid = 1, dictid = adler32(dictid, dictionary, dictLength, 0), dictid !== state.check) ? Z_DATA_ERROR : (ret = updatewindow(strm, dictionary, dictLength, dictLength), ret ? (state.mode = MEM, Z_MEM_ERROR) : (state.havedict = 1, Z_OK));
          }
          exports3.inflateReset = inflateReset, exports3.inflateReset2 = inflateReset2, exports3.inflateResetKeep = inflateResetKeep, exports3.inflateInit = inflateInit, exports3.inflateInit2 = inflateInit2, exports3.inflate = inflate, exports3.inflateEnd = inflateEnd, exports3.inflateGetHeader = inflateGetHeader, exports3.inflateSetDictionary = inflateSetDictionary, exports3.inflateInfo = "pako inflate (from Nodeca project)";
        }, { "../utils/common": 52, "./adler32": 53, "./crc32": 55, "./inffast": 57, "./inftrees": 59 }], 59: [function(require2, module3, exports3) {
          "use strict";
          var utils = require2("../utils/common"), MAXBITS = 15, ENOUGH_LENS = 852, ENOUGH_DISTS = 592, CODES = 0, LENS = 1, DISTS = 2, lbase = [
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
          ], lext = [
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
          ], dbase = [
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
          ], dext = [
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
          module3.exports = function(type, lens, lens_index, codes, table, table_index, work, opts) {
            var bits = opts.bits, len = 0, sym = 0, min = 0, max = 0, root = 0, curr = 0, drop = 0, left = 0, used = 0, huff = 0, incr, fill, low, mask, next, base = null, base_index = 0, end, count = new utils.Buf16(MAXBITS + 1), offs = new utils.Buf16(MAXBITS + 1), extra = null, extra_index = 0, here_bits, here_op, here_val;
            for (len = 0; len <= MAXBITS; len++)
              count[len] = 0;
            for (sym = 0; sym < codes; sym++)
              count[lens[lens_index + sym]]++;
            for (root = bits, max = MAXBITS; max >= 1 && count[max] === 0; max--)
              ;
            if (root > max && (root = max), max === 0)
              return table[table_index++] = 1 << 24 | 64 << 16 | 0, table[table_index++] = 1 << 24 | 64 << 16 | 0, opts.bits = 1, 0;
            for (min = 1; min < max && count[min] === 0; min++)
              ;
            for (root < min && (root = min), left = 1, len = 1; len <= MAXBITS; len++)
              if (left <<= 1, left -= count[len], left < 0)
                return -1;
            if (left > 0 && (type === CODES || max !== 1))
              return -1;
            for (offs[1] = 0, len = 1; len < MAXBITS; len++)
              offs[len + 1] = offs[len] + count[len];
            for (sym = 0; sym < codes; sym++)
              lens[lens_index + sym] !== 0 && (work[offs[lens[lens_index + sym]]++] = sym);
            if (type === CODES ? (base = extra = work, end = 19) : type === LENS ? (base = lbase, base_index -= 257, extra = lext, extra_index -= 257, end = 256) : (base = dbase, extra = dext, end = -1), huff = 0, sym = 0, len = min, next = table_index, curr = root, drop = 0, low = -1, used = 1 << root, mask = used - 1, type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS)
              return 1;
            for (; ; ) {
              here_bits = len - drop, work[sym] < end ? (here_op = 0, here_val = work[sym]) : work[sym] > end ? (here_op = extra[extra_index + work[sym]], here_val = base[base_index + work[sym]]) : (here_op = 96, here_val = 0), incr = 1 << len - drop, fill = 1 << curr, min = fill;
              do
                fill -= incr, table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
              while (fill !== 0);
              for (incr = 1 << len - 1; huff & incr; )
                incr >>= 1;
              if (incr !== 0 ? (huff &= incr - 1, huff += incr) : huff = 0, sym++, --count[len] === 0) {
                if (len === max)
                  break;
                len = lens[lens_index + work[sym]];
              }
              if (len > root && (huff & mask) !== low) {
                for (drop === 0 && (drop = root), next += min, curr = len - drop, left = 1 << curr; curr + drop < max && (left -= count[curr + drop], !(left <= 0)); )
                  curr++, left <<= 1;
                if (used += 1 << curr, type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS)
                  return 1;
                low = huff & mask, table[low] = root << 24 | curr << 16 | next - table_index | 0;
              }
            }
            return huff !== 0 && (table[next + huff] = len - drop << 24 | 64 << 16 | 0), opts.bits = root, 0;
          };
        }, { "../utils/common": 52 }], 60: [function(require2, module3, exports3) {
          "use strict";
          module3.exports = {
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
        }, {}], 61: [function(require2, module3, exports3) {
          "use strict";
          var utils = require2("../utils/common"), Z_FIXED = 4, Z_BINARY = 0, Z_TEXT = 1, Z_UNKNOWN = 2;
          function zero(buf) {
            for (var len = buf.length; --len >= 0; )
              buf[len] = 0;
          }
          var STORED_BLOCK = 0, STATIC_TREES = 1, DYN_TREES = 2, MIN_MATCH = 3, MAX_MATCH = 258, LENGTH_CODES = 29, LITERALS = 256, L_CODES = LITERALS + 1 + LENGTH_CODES, D_CODES = 30, BL_CODES = 19, HEAP_SIZE = 2 * L_CODES + 1, MAX_BITS = 15, Buf_size = 16, MAX_BL_BITS = 7, END_BLOCK = 256, REP_3_6 = 16, REPZ_3_10 = 17, REPZ_11_138 = 18, extra_lbits = (
            /* extra bits for each length code */
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
          ), extra_dbits = (
            /* extra bits for each distance code */
            [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
          ), extra_blbits = (
            /* extra bits for each bit length code */
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
          ), bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], DIST_CODE_LEN = 512, static_ltree = new Array((L_CODES + 2) * 2);
          zero(static_ltree);
          var static_dtree = new Array(D_CODES * 2);
          zero(static_dtree);
          var _dist_code = new Array(DIST_CODE_LEN);
          zero(_dist_code);
          var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
          zero(_length_code);
          var base_length = new Array(LENGTH_CODES);
          zero(base_length);
          var base_dist = new Array(D_CODES);
          zero(base_dist);
          function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
            this.static_tree = static_tree, this.extra_bits = extra_bits, this.extra_base = extra_base, this.elems = elems, this.max_length = max_length, this.has_stree = static_tree && static_tree.length;
          }
          var static_l_desc, static_d_desc, static_bl_desc;
          function TreeDesc(dyn_tree, stat_desc) {
            this.dyn_tree = dyn_tree, this.max_code = 0, this.stat_desc = stat_desc;
          }
          function d_code(dist) {
            return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
          }
          function put_short(s, w) {
            s.pending_buf[s.pending++] = w & 255, s.pending_buf[s.pending++] = w >>> 8 & 255;
          }
          function send_bits(s, value, length) {
            s.bi_valid > Buf_size - length ? (s.bi_buf |= value << s.bi_valid & 65535, put_short(s, s.bi_buf), s.bi_buf = value >> Buf_size - s.bi_valid, s.bi_valid += length - Buf_size) : (s.bi_buf |= value << s.bi_valid & 65535, s.bi_valid += length);
          }
          function send_code(s, c, tree) {
            send_bits(
              s,
              tree[c * 2],
              tree[c * 2 + 1]
              /*.Len*/
            );
          }
          function bi_reverse(code, len) {
            var res = 0;
            do
              res |= code & 1, code >>>= 1, res <<= 1;
            while (--len > 0);
            return res >>> 1;
          }
          function bi_flush(s) {
            s.bi_valid === 16 ? (put_short(s, s.bi_buf), s.bi_buf = 0, s.bi_valid = 0) : s.bi_valid >= 8 && (s.pending_buf[s.pending++] = s.bi_buf & 255, s.bi_buf >>= 8, s.bi_valid -= 8);
          }
          function gen_bitlen(s, desc) {
            var tree = desc.dyn_tree, max_code = desc.max_code, stree = desc.stat_desc.static_tree, has_stree = desc.stat_desc.has_stree, extra = desc.stat_desc.extra_bits, base = desc.stat_desc.extra_base, max_length = desc.stat_desc.max_length, h, n, m, bits, xbits, f, overflow = 0;
            for (bits = 0; bits <= MAX_BITS; bits++)
              s.bl_count[bits] = 0;
            for (tree[s.heap[s.heap_max] * 2 + 1] = 0, h = s.heap_max + 1; h < HEAP_SIZE; h++)
              n = s.heap[h], bits = tree[tree[n * 2 + 1] * 2 + 1] + 1, bits > max_length && (bits = max_length, overflow++), tree[n * 2 + 1] = bits, !(n > max_code) && (s.bl_count[bits]++, xbits = 0, n >= base && (xbits = extra[n - base]), f = tree[n * 2], s.opt_len += f * (bits + xbits), has_stree && (s.static_len += f * (stree[n * 2 + 1] + xbits)));
            if (overflow !== 0) {
              do {
                for (bits = max_length - 1; s.bl_count[bits] === 0; )
                  bits--;
                s.bl_count[bits]--, s.bl_count[bits + 1] += 2, s.bl_count[max_length]--, overflow -= 2;
              } while (overflow > 0);
              for (bits = max_length; bits !== 0; bits--)
                for (n = s.bl_count[bits]; n !== 0; )
                  m = s.heap[--h], !(m > max_code) && (tree[m * 2 + 1] !== bits && (s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2], tree[m * 2 + 1] = bits), n--);
            }
          }
          function gen_codes(tree, max_code, bl_count) {
            var next_code = new Array(MAX_BITS + 1), code = 0, bits, n;
            for (bits = 1; bits <= MAX_BITS; bits++)
              next_code[bits] = code = code + bl_count[bits - 1] << 1;
            for (n = 0; n <= max_code; n++) {
              var len = tree[n * 2 + 1];
              len !== 0 && (tree[n * 2] = bi_reverse(next_code[len]++, len));
            }
          }
          function tr_static_init() {
            var n, bits, length, code, dist, bl_count = new Array(MAX_BITS + 1);
            for (length = 0, code = 0; code < LENGTH_CODES - 1; code++)
              for (base_length[code] = length, n = 0; n < 1 << extra_lbits[code]; n++)
                _length_code[length++] = code;
            for (_length_code[length - 1] = code, dist = 0, code = 0; code < 16; code++)
              for (base_dist[code] = dist, n = 0; n < 1 << extra_dbits[code]; n++)
                _dist_code[dist++] = code;
            for (dist >>= 7; code < D_CODES; code++)
              for (base_dist[code] = dist << 7, n = 0; n < 1 << extra_dbits[code] - 7; n++)
                _dist_code[256 + dist++] = code;
            for (bits = 0; bits <= MAX_BITS; bits++)
              bl_count[bits] = 0;
            for (n = 0; n <= 143; )
              static_ltree[n * 2 + 1] = 8, n++, bl_count[8]++;
            for (; n <= 255; )
              static_ltree[n * 2 + 1] = 9, n++, bl_count[9]++;
            for (; n <= 279; )
              static_ltree[n * 2 + 1] = 7, n++, bl_count[7]++;
            for (; n <= 287; )
              static_ltree[n * 2 + 1] = 8, n++, bl_count[8]++;
            for (gen_codes(static_ltree, L_CODES + 1, bl_count), n = 0; n < D_CODES; n++)
              static_dtree[n * 2 + 1] = 5, static_dtree[n * 2] = bi_reverse(n, 5);
            static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS), static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS), static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
          }
          function init_block(s) {
            var n;
            for (n = 0; n < L_CODES; n++)
              s.dyn_ltree[n * 2] = 0;
            for (n = 0; n < D_CODES; n++)
              s.dyn_dtree[n * 2] = 0;
            for (n = 0; n < BL_CODES; n++)
              s.bl_tree[n * 2] = 0;
            s.dyn_ltree[END_BLOCK * 2] = 1, s.opt_len = s.static_len = 0, s.last_lit = s.matches = 0;
          }
          function bi_windup(s) {
            s.bi_valid > 8 ? put_short(s, s.bi_buf) : s.bi_valid > 0 && (s.pending_buf[s.pending++] = s.bi_buf), s.bi_buf = 0, s.bi_valid = 0;
          }
          function copy_block(s, buf, len, header) {
            bi_windup(s), header && (put_short(s, len), put_short(s, ~len)), utils.arraySet(s.pending_buf, s.window, buf, len, s.pending), s.pending += len;
          }
          function smaller(tree, n, m, depth) {
            var _n2 = n * 2, _m2 = m * 2;
            return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
          }
          function pqdownheap(s, tree, k) {
            for (var v = s.heap[k], j = k << 1; j <= s.heap_len && (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth) && j++, !smaller(tree, v, s.heap[j], s.depth)); )
              s.heap[k] = s.heap[j], k = j, j <<= 1;
            s.heap[k] = v;
          }
          function compress_block(s, ltree, dtree) {
            var dist, lc, lx = 0, code, extra;
            if (s.last_lit !== 0)
              do
                dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1], lc = s.pending_buf[s.l_buf + lx], lx++, dist === 0 ? send_code(s, lc, ltree) : (code = _length_code[lc], send_code(s, code + LITERALS + 1, ltree), extra = extra_lbits[code], extra !== 0 && (lc -= base_length[code], send_bits(s, lc, extra)), dist--, code = d_code(dist), send_code(s, code, dtree), extra = extra_dbits[code], extra !== 0 && (dist -= base_dist[code], send_bits(s, dist, extra)));
              while (lx < s.last_lit);
            send_code(s, END_BLOCK, ltree);
          }
          function build_tree(s, desc) {
            var tree = desc.dyn_tree, stree = desc.stat_desc.static_tree, has_stree = desc.stat_desc.has_stree, elems = desc.stat_desc.elems, n, m, max_code = -1, node;
            for (s.heap_len = 0, s.heap_max = HEAP_SIZE, n = 0; n < elems; n++)
              tree[n * 2] !== 0 ? (s.heap[++s.heap_len] = max_code = n, s.depth[n] = 0) : tree[n * 2 + 1] = 0;
            for (; s.heap_len < 2; )
              node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0, tree[node * 2] = 1, s.depth[node] = 0, s.opt_len--, has_stree && (s.static_len -= stree[node * 2 + 1]);
            for (desc.max_code = max_code, n = s.heap_len >> 1; n >= 1; n--)
              pqdownheap(s, tree, n);
            node = elems;
            do
              n = s.heap[
                1
                /*SMALLEST*/
              ], s.heap[
                1
                /*SMALLEST*/
              ] = s.heap[s.heap_len--], pqdownheap(
                s,
                tree,
                1
                /*SMALLEST*/
              ), m = s.heap[
                1
                /*SMALLEST*/
              ], s.heap[--s.heap_max] = n, s.heap[--s.heap_max] = m, tree[node * 2] = tree[n * 2] + tree[m * 2], s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1, tree[n * 2 + 1] = tree[m * 2 + 1] = node, s.heap[
                1
                /*SMALLEST*/
              ] = node++, pqdownheap(
                s,
                tree,
                1
                /*SMALLEST*/
              );
            while (s.heap_len >= 2);
            s.heap[--s.heap_max] = s.heap[
              1
              /*SMALLEST*/
            ], gen_bitlen(s, desc), gen_codes(tree, max_code, s.bl_count);
          }
          function scan_tree(s, tree, max_code) {
            var n, prevlen = -1, curlen, nextlen = tree[0 * 2 + 1], count = 0, max_count = 7, min_count = 4;
            for (nextlen === 0 && (max_count = 138, min_count = 3), tree[(max_code + 1) * 2 + 1] = 65535, n = 0; n <= max_code; n++)
              curlen = nextlen, nextlen = tree[(n + 1) * 2 + 1], !(++count < max_count && curlen === nextlen) && (count < min_count ? s.bl_tree[curlen * 2] += count : curlen !== 0 ? (curlen !== prevlen && s.bl_tree[curlen * 2]++, s.bl_tree[REP_3_6 * 2]++) : count <= 10 ? s.bl_tree[REPZ_3_10 * 2]++ : s.bl_tree[REPZ_11_138 * 2]++, count = 0, prevlen = curlen, nextlen === 0 ? (max_count = 138, min_count = 3) : curlen === nextlen ? (max_count = 6, min_count = 3) : (max_count = 7, min_count = 4));
          }
          function send_tree(s, tree, max_code) {
            var n, prevlen = -1, curlen, nextlen = tree[0 * 2 + 1], count = 0, max_count = 7, min_count = 4;
            for (nextlen === 0 && (max_count = 138, min_count = 3), n = 0; n <= max_code; n++)
              if (curlen = nextlen, nextlen = tree[(n + 1) * 2 + 1], !(++count < max_count && curlen === nextlen)) {
                if (count < min_count)
                  do
                    send_code(s, curlen, s.bl_tree);
                  while (--count !== 0);
                else curlen !== 0 ? (curlen !== prevlen && (send_code(s, curlen, s.bl_tree), count--), send_code(s, REP_3_6, s.bl_tree), send_bits(s, count - 3, 2)) : count <= 10 ? (send_code(s, REPZ_3_10, s.bl_tree), send_bits(s, count - 3, 3)) : (send_code(s, REPZ_11_138, s.bl_tree), send_bits(s, count - 11, 7));
                count = 0, prevlen = curlen, nextlen === 0 ? (max_count = 138, min_count = 3) : curlen === nextlen ? (max_count = 6, min_count = 3) : (max_count = 7, min_count = 4);
              }
          }
          function build_bl_tree(s) {
            var max_blindex;
            for (scan_tree(s, s.dyn_ltree, s.l_desc.max_code), scan_tree(s, s.dyn_dtree, s.d_desc.max_code), build_tree(s, s.bl_desc), max_blindex = BL_CODES - 1; max_blindex >= 3 && s.bl_tree[bl_order[max_blindex] * 2 + 1] === 0; max_blindex--)
              ;
            return s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4, max_blindex;
          }
          function send_all_trees(s, lcodes, dcodes, blcodes) {
            var rank;
            for (send_bits(s, lcodes - 257, 5), send_bits(s, dcodes - 1, 5), send_bits(s, blcodes - 4, 4), rank = 0; rank < blcodes; rank++)
              send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
            send_tree(s, s.dyn_ltree, lcodes - 1), send_tree(s, s.dyn_dtree, dcodes - 1);
          }
          function detect_data_type(s) {
            var black_mask = 4093624447, n;
            for (n = 0; n <= 31; n++, black_mask >>>= 1)
              if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0)
                return Z_BINARY;
            if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0)
              return Z_TEXT;
            for (n = 32; n < LITERALS; n++)
              if (s.dyn_ltree[n * 2] !== 0)
                return Z_TEXT;
            return Z_BINARY;
          }
          var static_init_done = !1;
          function _tr_init(s) {
            static_init_done || (tr_static_init(), static_init_done = !0), s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc), s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc), s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc), s.bi_buf = 0, s.bi_valid = 0, init_block(s);
          }
          function _tr_stored_block(s, buf, stored_len, last) {
            send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3), copy_block(s, buf, stored_len, !0);
          }
          function _tr_align(s) {
            send_bits(s, STATIC_TREES << 1, 3), send_code(s, END_BLOCK, static_ltree), bi_flush(s);
          }
          function _tr_flush_block(s, buf, stored_len, last) {
            var opt_lenb, static_lenb, max_blindex = 0;
            s.level > 0 ? (s.strm.data_type === Z_UNKNOWN && (s.strm.data_type = detect_data_type(s)), build_tree(s, s.l_desc), build_tree(s, s.d_desc), max_blindex = build_bl_tree(s), opt_lenb = s.opt_len + 3 + 7 >>> 3, static_lenb = s.static_len + 3 + 7 >>> 3, static_lenb <= opt_lenb && (opt_lenb = static_lenb)) : opt_lenb = static_lenb = stored_len + 5, stored_len + 4 <= opt_lenb && buf !== -1 ? _tr_stored_block(s, buf, stored_len, last) : s.strategy === Z_FIXED || static_lenb === opt_lenb ? (send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3), compress_block(s, static_ltree, static_dtree)) : (send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3), send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1), compress_block(s, s.dyn_ltree, s.dyn_dtree)), init_block(s), last && bi_windup(s);
          }
          function _tr_tally(s, dist, lc) {
            return s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255, s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255, s.pending_buf[s.l_buf + s.last_lit] = lc & 255, s.last_lit++, dist === 0 ? s.dyn_ltree[lc * 2]++ : (s.matches++, dist--, s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++, s.dyn_dtree[d_code(dist) * 2]++), s.last_lit === s.lit_bufsize - 1;
          }
          exports3._tr_init = _tr_init, exports3._tr_stored_block = _tr_stored_block, exports3._tr_flush_block = _tr_flush_block, exports3._tr_tally = _tr_tally, exports3._tr_align = _tr_align;
        }, { "../utils/common": 52 }], 62: [function(require2, module3, exports3) {
          "use strict";
          function ZStream() {
            this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
          }
          module3.exports = ZStream;
        }, {}], 63: [function(require2, module3, exports3) {
          var process = module3.exports = {}, cachedSetTimeout, cachedClearTimeout;
          function defaultSetTimout() {
            throw new Error("setTimeout has not been defined");
          }
          function defaultClearTimeout() {
            throw new Error("clearTimeout has not been defined");
          }
          (function() {
            try {
              typeof setTimeout == "function" ? cachedSetTimeout = setTimeout : cachedSetTimeout = defaultSetTimout;
            } catch {
              cachedSetTimeout = defaultSetTimout;
            }
            try {
              typeof clearTimeout == "function" ? cachedClearTimeout = clearTimeout : cachedClearTimeout = defaultClearTimeout;
            } catch {
              cachedClearTimeout = defaultClearTimeout;
            }
          })();
          function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout)
              return setTimeout(fun, 0);
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout)
              return cachedSetTimeout = setTimeout, setTimeout(fun, 0);
            try {
              return cachedSetTimeout(fun, 0);
            } catch {
              try {
                return cachedSetTimeout.call(null, fun, 0);
              } catch {
                return cachedSetTimeout.call(this, fun, 0);
              }
            }
          }
          function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout)
              return clearTimeout(marker);
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout)
              return cachedClearTimeout = clearTimeout, clearTimeout(marker);
            try {
              return cachedClearTimeout(marker);
            } catch {
              try {
                return cachedClearTimeout.call(null, marker);
              } catch {
                return cachedClearTimeout.call(this, marker);
              }
            }
          }
          var queue = [], draining = !1, currentQueue, queueIndex = -1;
          function cleanUpNextTick() {
            !draining || !currentQueue || (draining = !1, currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1, queue.length && drainQueue());
          }
          function drainQueue() {
            if (!draining) {
              var timeout = runTimeout(cleanUpNextTick);
              draining = !0;
              for (var len = queue.length; len; ) {
                for (currentQueue = queue, queue = []; ++queueIndex < len; )
                  currentQueue && currentQueue[queueIndex].run();
                queueIndex = -1, len = queue.length;
              }
              currentQueue = null, draining = !1, runClearTimeout(timeout);
            }
          }
          process.nextTick = function(fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1)
              for (var i = 1; i < arguments.length; i++)
                args[i - 1] = arguments[i];
            queue.push(new Item(fun, args)), queue.length === 1 && !draining && runTimeout(drainQueue);
          };
          function Item(fun, array) {
            this.fun = fun, this.array = array;
          }
          Item.prototype.run = function() {
            this.fun.apply(null, this.array);
          }, process.title = "browser", process.browser = !0, process.env = {}, process.argv = [], process.version = "", process.versions = {};
          function noop() {
          }
          process.on = noop, process.addListener = noop, process.once = noop, process.off = noop, process.removeListener = noop, process.removeAllListeners = noop, process.emit = noop, process.prependListener = noop, process.prependOnceListener = noop, process.listeners = function(name) {
            return [];
          }, process.binding = function(name) {
            throw new Error("process.binding is not supported");
          }, process.cwd = function() {
            return "/";
          }, process.chdir = function(dir) {
            throw new Error("process.chdir is not supported");
          }, process.umask = function() {
            return 0;
          };
        }, {}], 64: [function(require2, module3, exports3) {
          var buffer = require2("buffer"), Buffer2 = buffer.Buffer;
          function copyProps(src, dst) {
            for (var key in src)
              dst[key] = src[key];
          }
          Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow ? module3.exports = buffer : (copyProps(buffer, exports3), exports3.Buffer = SafeBuffer);
          function SafeBuffer(arg, encodingOrOffset, length) {
            return Buffer2(arg, encodingOrOffset, length);
          }
          SafeBuffer.prototype = Object.create(Buffer2.prototype), copyProps(Buffer2, SafeBuffer), SafeBuffer.from = function(arg, encodingOrOffset, length) {
            if (typeof arg == "number")
              throw new TypeError("Argument must not be a number");
            return Buffer2(arg, encodingOrOffset, length);
          }, SafeBuffer.alloc = function(size, fill, encoding) {
            if (typeof size != "number")
              throw new TypeError("Argument must be a number");
            var buf = Buffer2(size);
            return fill !== void 0 ? typeof encoding == "string" ? buf.fill(fill, encoding) : buf.fill(fill) : buf.fill(0), buf;
          }, SafeBuffer.allocUnsafe = function(size) {
            if (typeof size != "number")
              throw new TypeError("Argument must be a number");
            return Buffer2(size);
          }, SafeBuffer.allocUnsafeSlow = function(size) {
            if (typeof size != "number")
              throw new TypeError("Argument must be a number");
            return buffer.SlowBuffer(size);
          };
        }, { buffer: 32 }], 65: [function(require2, module3, exports3) {
          module3.exports = Stream;
          var EE = require2("events").EventEmitter, inherits = require2("inherits");
          inherits(Stream, EE), Stream.Readable = require2("readable-stream/lib/_stream_readable.js"), Stream.Writable = require2("readable-stream/lib/_stream_writable.js"), Stream.Duplex = require2("readable-stream/lib/_stream_duplex.js"), Stream.Transform = require2("readable-stream/lib/_stream_transform.js"), Stream.PassThrough = require2("readable-stream/lib/_stream_passthrough.js"), Stream.finished = require2("readable-stream/lib/internal/streams/end-of-stream.js"), Stream.pipeline = require2("readable-stream/lib/internal/streams/pipeline.js"), Stream.Stream = Stream;
          function Stream() {
            EE.call(this);
          }
          Stream.prototype.pipe = function(dest, options) {
            var source = this;
            function ondata(chunk) {
              dest.writable && dest.write(chunk) === !1 && source.pause && source.pause();
            }
            source.on("data", ondata);
            function ondrain() {
              source.readable && source.resume && source.resume();
            }
            dest.on("drain", ondrain), !dest._isStdio && (!options || options.end !== !1) && (source.on("end", onend), source.on("close", onclose));
            var didOnEnd = !1;
            function onend() {
              didOnEnd || (didOnEnd = !0, dest.end());
            }
            function onclose() {
              didOnEnd || (didOnEnd = !0, typeof dest.destroy == "function" && dest.destroy());
            }
            function onerror(er) {
              if (cleanup(), EE.listenerCount(this, "error") === 0)
                throw er;
            }
            source.on("error", onerror), dest.on("error", onerror);
            function cleanup() {
              source.removeListener("data", ondata), dest.removeListener("drain", ondrain), source.removeListener("end", onend), source.removeListener("close", onclose), source.removeListener("error", onerror), dest.removeListener("error", onerror), source.removeListener("end", cleanup), source.removeListener("close", cleanup), dest.removeListener("close", cleanup);
            }
            return source.on("end", cleanup), source.on("close", cleanup), dest.on("close", cleanup), dest.emit("pipe", source), dest;
          };
        }, { events: 35, inherits: 46, "readable-stream/lib/_stream_duplex.js": 67, "readable-stream/lib/_stream_passthrough.js": 68, "readable-stream/lib/_stream_readable.js": 69, "readable-stream/lib/_stream_transform.js": 70, "readable-stream/lib/_stream_writable.js": 71, "readable-stream/lib/internal/streams/end-of-stream.js": 75, "readable-stream/lib/internal/streams/pipeline.js": 77 }], 66: [function(require2, module3, exports3) {
          "use strict";
          function _inheritsLoose(subClass, superClass) {
            subClass.prototype = Object.create(superClass.prototype), subClass.prototype.constructor = subClass, subClass.__proto__ = superClass;
          }
          var codes = {};
          function createErrorType(code, message, Base) {
            Base || (Base = Error);
            function getMessage(arg1, arg2, arg3) {
              return typeof message == "string" ? message : message(arg1, arg2, arg3);
            }
            var NodeError = /* @__PURE__ */ function(_Base) {
              _inheritsLoose(NodeError2, _Base);
              function NodeError2(arg1, arg2, arg3) {
                return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
              }
              return NodeError2;
            }(Base);
            NodeError.prototype.name = Base.name, NodeError.prototype.code = code, codes[code] = NodeError;
          }
          function oneOf(expected, thing) {
            if (Array.isArray(expected)) {
              var len = expected.length;
              return expected = expected.map(function(i) {
                return String(i);
              }), len > 2 ? "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(", "), ", or ") + expected[len - 1] : len === 2 ? "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]) : "of ".concat(thing, " ").concat(expected[0]);
            } else
              return "of ".concat(thing, " ").concat(String(expected));
          }
          function startsWith(str, search, pos) {
            return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
          }
          function endsWith(str, search, this_len) {
            return (this_len === void 0 || this_len > str.length) && (this_len = str.length), str.substring(this_len - search.length, this_len) === search;
          }
          function includes(str, search, start) {
            return typeof start != "number" && (start = 0), start + search.length > str.length ? !1 : str.indexOf(search, start) !== -1;
          }
          createErrorType("ERR_INVALID_OPT_VALUE", function(name, value) {
            return 'The value "' + value + '" is invalid for option "' + name + '"';
          }, TypeError), createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
            var determiner;
            typeof expected == "string" && startsWith(expected, "not ") ? (determiner = "must not be", expected = expected.replace(/^not /, "")) : determiner = "must be";
            var msg;
            if (endsWith(name, " argument"))
              msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
            else {
              var type = includes(name, ".") ? "property" : "argument";
              msg = 'The "'.concat(name, '" ').concat(type, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
            }
            return msg += ". Received type ".concat(typeof actual), msg;
          }, TypeError), createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF"), createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name) {
            return "The " + name + " method is not implemented";
          }), createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close"), createErrorType("ERR_STREAM_DESTROYED", function(name) {
            return "Cannot call " + name + " after a stream was destroyed";
          }), createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times"), createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable"), createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end"), createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError), createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
            return "Unknown encoding: " + arg;
          }, TypeError), createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event"), module3.exports.codes = codes;
        }, {}], 67: [function(require2, module3, exports3) {
          (function(process) {
            (function() {
              "use strict";
              var objectKeys = Object.keys || function(obj) {
                var keys2 = [];
                for (var key in obj)
                  keys2.push(key);
                return keys2;
              };
              module3.exports = Duplex;
              var Readable = require2("./_stream_readable"), Writable = require2("./_stream_writable");
              require2("inherits")(Duplex, Readable);
              for (var keys = objectKeys(Writable.prototype), v = 0; v < keys.length; v++) {
                var method = keys[v];
                Duplex.prototype[method] || (Duplex.prototype[method] = Writable.prototype[method]);
              }
              function Duplex(options) {
                if (!(this instanceof Duplex)) return new Duplex(options);
                Readable.call(this, options), Writable.call(this, options), this.allowHalfOpen = !0, options && (options.readable === !1 && (this.readable = !1), options.writable === !1 && (this.writable = !1), options.allowHalfOpen === !1 && (this.allowHalfOpen = !1, this.once("end", onend)));
              }
              Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._writableState.highWaterMark;
                }
              }), Object.defineProperty(Duplex.prototype, "writableBuffer", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._writableState && this._writableState.getBuffer();
                }
              }), Object.defineProperty(Duplex.prototype, "writableLength", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._writableState.length;
                }
              });
              function onend() {
                this._writableState.ended || process.nextTick(onEndNT, this);
              }
              function onEndNT(self2) {
                self2.end();
              }
              Object.defineProperty(Duplex.prototype, "destroyed", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._readableState === void 0 || this._writableState === void 0 ? !1 : this._readableState.destroyed && this._writableState.destroyed;
                },
                set: function(value) {
                  this._readableState === void 0 || this._writableState === void 0 || (this._readableState.destroyed = value, this._writableState.destroyed = value);
                }
              });
            }).call(this);
          }).call(this, require2("_process"));
        }, { "./_stream_readable": 69, "./_stream_writable": 71, _process: 63, inherits: 46 }], 68: [function(require2, module3, exports3) {
          "use strict";
          module3.exports = PassThrough;
          var Transform = require2("./_stream_transform");
          require2("inherits")(PassThrough, Transform);
          function PassThrough(options) {
            if (!(this instanceof PassThrough)) return new PassThrough(options);
            Transform.call(this, options);
          }
          PassThrough.prototype._transform = function(chunk, encoding, cb) {
            cb(null, chunk);
          };
        }, { "./_stream_transform": 70, inherits: 46 }], 69: [function(require2, module3, exports3) {
          (function(process, global2) {
            (function() {
              "use strict";
              module3.exports = Readable;
              var Duplex;
              Readable.ReadableState = ReadableState;
              var EE = require2("events").EventEmitter, EElistenerCount = function(emitter, type) {
                return emitter.listeners(type).length;
              }, Stream = require2("./internal/streams/stream"), Buffer2 = require2("buffer").Buffer, OurUint8Array = global2.Uint8Array || function() {
              };
              function _uint8ArrayToBuffer(chunk) {
                return Buffer2.from(chunk);
              }
              function _isUint8Array(obj) {
                return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
              }
              var debugUtil = require2("util"), debug;
              debugUtil && debugUtil.debuglog ? debug = debugUtil.debuglog("stream") : debug = function() {
              };
              var BufferList = require2("./internal/streams/buffer_list"), destroyImpl = require2("./internal/streams/destroy"), _require = require2("./internal/streams/state"), getHighWaterMark = _require.getHighWaterMark, _require$codes = require2("../errors").codes, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT, StringDecoder, createReadableStreamAsyncIterator, from;
              require2("inherits")(Readable, Stream);
              var errorOrDestroy = destroyImpl.errorOrDestroy, kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
              function prependListener(emitter, event, fn) {
                if (typeof emitter.prependListener == "function") return emitter.prependListener(event, fn);
                !emitter._events || !emitter._events[event] ? emitter.on(event, fn) : Array.isArray(emitter._events[event]) ? emitter._events[event].unshift(fn) : emitter._events[event] = [fn, emitter._events[event]];
              }
              function ReadableState(options, stream, isDuplex) {
                Duplex = Duplex || require2("./_stream_duplex"), options = options || {}, typeof isDuplex != "boolean" && (isDuplex = stream instanceof Duplex), this.objectMode = !!options.objectMode, isDuplex && (this.objectMode = this.objectMode || !!options.readableObjectMode), this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex), this.buffer = new BufferList(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.paused = !0, this.emitClose = options.emitClose !== !1, this.autoDestroy = !!options.autoDestroy, this.destroyed = !1, this.defaultEncoding = options.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, options.encoding && (StringDecoder || (StringDecoder = require2("string_decoder/").StringDecoder), this.decoder = new StringDecoder(options.encoding), this.encoding = options.encoding);
              }
              function Readable(options) {
                if (Duplex = Duplex || require2("./_stream_duplex"), !(this instanceof Readable)) return new Readable(options);
                var isDuplex = this instanceof Duplex;
                this._readableState = new ReadableState(options, this, isDuplex), this.readable = !0, options && (typeof options.read == "function" && (this._read = options.read), typeof options.destroy == "function" && (this._destroy = options.destroy)), Stream.call(this);
              }
              Object.defineProperty(Readable.prototype, "destroyed", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._readableState === void 0 ? !1 : this._readableState.destroyed;
                },
                set: function(value) {
                  this._readableState && (this._readableState.destroyed = value);
                }
              }), Readable.prototype.destroy = destroyImpl.destroy, Readable.prototype._undestroy = destroyImpl.undestroy, Readable.prototype._destroy = function(err, cb) {
                cb(err);
              }, Readable.prototype.push = function(chunk, encoding) {
                var state = this._readableState, skipChunkCheck;
                return state.objectMode ? skipChunkCheck = !0 : typeof chunk == "string" && (encoding = encoding || state.defaultEncoding, encoding !== state.encoding && (chunk = Buffer2.from(chunk, encoding), encoding = ""), skipChunkCheck = !0), readableAddChunk(this, chunk, encoding, !1, skipChunkCheck);
              }, Readable.prototype.unshift = function(chunk) {
                return readableAddChunk(this, chunk, null, !0, !1);
              };
              function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
                debug("readableAddChunk", chunk);
                var state = stream._readableState;
                if (chunk === null)
                  state.reading = !1, onEofChunk(stream, state);
                else {
                  var er;
                  if (skipChunkCheck || (er = chunkInvalid(state, chunk)), er)
                    errorOrDestroy(stream, er);
                  else if (state.objectMode || chunk && chunk.length > 0)
                    if (typeof chunk != "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype && (chunk = _uint8ArrayToBuffer(chunk)), addToFront)
                      state.endEmitted ? errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT()) : addChunk(stream, state, chunk, !0);
                    else if (state.ended)
                      errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
                    else {
                      if (state.destroyed)
                        return !1;
                      state.reading = !1, state.decoder && !encoding ? (chunk = state.decoder.write(chunk), state.objectMode || chunk.length !== 0 ? addChunk(stream, state, chunk, !1) : maybeReadMore(stream, state)) : addChunk(stream, state, chunk, !1);
                    }
                  else addToFront || (state.reading = !1, maybeReadMore(stream, state));
                }
                return !state.ended && (state.length < state.highWaterMark || state.length === 0);
              }
              function addChunk(stream, state, chunk, addToFront) {
                state.flowing && state.length === 0 && !state.sync ? (state.awaitDrain = 0, stream.emit("data", chunk)) : (state.length += state.objectMode ? 1 : chunk.length, addToFront ? state.buffer.unshift(chunk) : state.buffer.push(chunk), state.needReadable && emitReadable(stream)), maybeReadMore(stream, state);
              }
              function chunkInvalid(state, chunk) {
                var er;
                return !_isUint8Array(chunk) && typeof chunk != "string" && chunk !== void 0 && !state.objectMode && (er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk)), er;
              }
              Readable.prototype.isPaused = function() {
                return this._readableState.flowing === !1;
              }, Readable.prototype.setEncoding = function(enc) {
                StringDecoder || (StringDecoder = require2("string_decoder/").StringDecoder);
                var decoder = new StringDecoder(enc);
                this._readableState.decoder = decoder, this._readableState.encoding = this._readableState.decoder.encoding;
                for (var p = this._readableState.buffer.head, content = ""; p !== null; )
                  content += decoder.write(p.data), p = p.next;
                return this._readableState.buffer.clear(), content !== "" && this._readableState.buffer.push(content), this._readableState.length = content.length, this;
              };
              var MAX_HWM = 1073741824;
              function computeNewHighWaterMark(n) {
                return n >= MAX_HWM ? n = MAX_HWM : (n--, n |= n >>> 1, n |= n >>> 2, n |= n >>> 4, n |= n >>> 8, n |= n >>> 16, n++), n;
              }
              function howMuchToRead(n, state) {
                return n <= 0 || state.length === 0 && state.ended ? 0 : state.objectMode ? 1 : n !== n ? state.flowing && state.length ? state.buffer.head.data.length : state.length : (n > state.highWaterMark && (state.highWaterMark = computeNewHighWaterMark(n)), n <= state.length ? n : state.ended ? state.length : (state.needReadable = !0, 0));
              }
              Readable.prototype.read = function(n) {
                debug("read", n), n = parseInt(n, 10);
                var state = this._readableState, nOrig = n;
                if (n !== 0 && (state.emittedReadable = !1), n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended))
                  return debug("read: emitReadable", state.length, state.ended), state.length === 0 && state.ended ? endReadable(this) : emitReadable(this), null;
                if (n = howMuchToRead(n, state), n === 0 && state.ended)
                  return state.length === 0 && endReadable(this), null;
                var doRead = state.needReadable;
                debug("need readable", doRead), (state.length === 0 || state.length - n < state.highWaterMark) && (doRead = !0, debug("length less than watermark", doRead)), state.ended || state.reading ? (doRead = !1, debug("reading or ended", doRead)) : doRead && (debug("do read"), state.reading = !0, state.sync = !0, state.length === 0 && (state.needReadable = !0), this._read(state.highWaterMark), state.sync = !1, state.reading || (n = howMuchToRead(nOrig, state)));
                var ret;
                return n > 0 ? ret = fromList(n, state) : ret = null, ret === null ? (state.needReadable = state.length <= state.highWaterMark, n = 0) : (state.length -= n, state.awaitDrain = 0), state.length === 0 && (state.ended || (state.needReadable = !0), nOrig !== n && state.ended && endReadable(this)), ret !== null && this.emit("data", ret), ret;
              };
              function onEofChunk(stream, state) {
                if (debug("onEofChunk"), !state.ended) {
                  if (state.decoder) {
                    var chunk = state.decoder.end();
                    chunk && chunk.length && (state.buffer.push(chunk), state.length += state.objectMode ? 1 : chunk.length);
                  }
                  state.ended = !0, state.sync ? emitReadable(stream) : (state.needReadable = !1, state.emittedReadable || (state.emittedReadable = !0, emitReadable_(stream)));
                }
              }
              function emitReadable(stream) {
                var state = stream._readableState;
                debug("emitReadable", state.needReadable, state.emittedReadable), state.needReadable = !1, state.emittedReadable || (debug("emitReadable", state.flowing), state.emittedReadable = !0, process.nextTick(emitReadable_, stream));
              }
              function emitReadable_(stream) {
                var state = stream._readableState;
                debug("emitReadable_", state.destroyed, state.length, state.ended), !state.destroyed && (state.length || state.ended) && (stream.emit("readable"), state.emittedReadable = !1), state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark, flow(stream);
              }
              function maybeReadMore(stream, state) {
                state.readingMore || (state.readingMore = !0, process.nextTick(maybeReadMore_, stream, state));
              }
              function maybeReadMore_(stream, state) {
                for (; !state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0); ) {
                  var len = state.length;
                  if (debug("maybeReadMore read 0"), stream.read(0), len === state.length)
                    break;
                }
                state.readingMore = !1;
              }
              Readable.prototype._read = function(n) {
                errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
              }, Readable.prototype.pipe = function(dest, pipeOpts) {
                var src = this, state = this._readableState;
                switch (state.pipesCount) {
                  case 0:
                    state.pipes = dest;
                    break;
                  case 1:
                    state.pipes = [state.pipes, dest];
                    break;
                  default:
                    state.pipes.push(dest);
                    break;
                }
                state.pipesCount += 1, debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
                var doEnd = (!pipeOpts || pipeOpts.end !== !1) && dest !== process.stdout && dest !== process.stderr, endFn = doEnd ? onend : unpipe;
                state.endEmitted ? process.nextTick(endFn) : src.once("end", endFn), dest.on("unpipe", onunpipe);
                function onunpipe(readable, unpipeInfo) {
                  debug("onunpipe"), readable === src && unpipeInfo && unpipeInfo.hasUnpiped === !1 && (unpipeInfo.hasUnpiped = !0, cleanup());
                }
                function onend() {
                  debug("onend"), dest.end();
                }
                var ondrain = pipeOnDrain(src);
                dest.on("drain", ondrain);
                var cleanedUp = !1;
                function cleanup() {
                  debug("cleanup"), dest.removeListener("close", onclose), dest.removeListener("finish", onfinish), dest.removeListener("drain", ondrain), dest.removeListener("error", onerror), dest.removeListener("unpipe", onunpipe), src.removeListener("end", onend), src.removeListener("end", unpipe), src.removeListener("data", ondata), cleanedUp = !0, state.awaitDrain && (!dest._writableState || dest._writableState.needDrain) && ondrain();
                }
                src.on("data", ondata);
                function ondata(chunk) {
                  debug("ondata");
                  var ret = dest.write(chunk);
                  debug("dest.write", ret), ret === !1 && ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp && (debug("false write response, pause", state.awaitDrain), state.awaitDrain++), src.pause());
                }
                function onerror(er) {
                  debug("onerror", er), unpipe(), dest.removeListener("error", onerror), EElistenerCount(dest, "error") === 0 && errorOrDestroy(dest, er);
                }
                prependListener(dest, "error", onerror);
                function onclose() {
                  dest.removeListener("finish", onfinish), unpipe();
                }
                dest.once("close", onclose);
                function onfinish() {
                  debug("onfinish"), dest.removeListener("close", onclose), unpipe();
                }
                dest.once("finish", onfinish);
                function unpipe() {
                  debug("unpipe"), src.unpipe(dest);
                }
                return dest.emit("pipe", src), state.flowing || (debug("pipe resume"), src.resume()), dest;
              };
              function pipeOnDrain(src) {
                return function() {
                  var state = src._readableState;
                  debug("pipeOnDrain", state.awaitDrain), state.awaitDrain && state.awaitDrain--, state.awaitDrain === 0 && EElistenerCount(src, "data") && (state.flowing = !0, flow(src));
                };
              }
              Readable.prototype.unpipe = function(dest) {
                var state = this._readableState, unpipeInfo = {
                  hasUnpiped: !1
                };
                if (state.pipesCount === 0) return this;
                if (state.pipesCount === 1)
                  return dest && dest !== state.pipes ? this : (dest || (dest = state.pipes), state.pipes = null, state.pipesCount = 0, state.flowing = !1, dest && dest.emit("unpipe", this, unpipeInfo), this);
                if (!dest) {
                  var dests = state.pipes, len = state.pipesCount;
                  state.pipes = null, state.pipesCount = 0, state.flowing = !1;
                  for (var i = 0; i < len; i++)
                    dests[i].emit("unpipe", this, {
                      hasUnpiped: !1
                    });
                  return this;
                }
                var index = indexOf(state.pipes, dest);
                return index === -1 ? this : (state.pipes.splice(index, 1), state.pipesCount -= 1, state.pipesCount === 1 && (state.pipes = state.pipes[0]), dest.emit("unpipe", this, unpipeInfo), this);
              }, Readable.prototype.on = function(ev, fn) {
                var res = Stream.prototype.on.call(this, ev, fn), state = this._readableState;
                return ev === "data" ? (state.readableListening = this.listenerCount("readable") > 0, state.flowing !== !1 && this.resume()) : ev === "readable" && !state.endEmitted && !state.readableListening && (state.readableListening = state.needReadable = !0, state.flowing = !1, state.emittedReadable = !1, debug("on readable", state.length, state.reading), state.length ? emitReadable(this) : state.reading || process.nextTick(nReadingNextTick, this)), res;
              }, Readable.prototype.addListener = Readable.prototype.on, Readable.prototype.removeListener = function(ev, fn) {
                var res = Stream.prototype.removeListener.call(this, ev, fn);
                return ev === "readable" && process.nextTick(updateReadableListening, this), res;
              }, Readable.prototype.removeAllListeners = function(ev) {
                var res = Stream.prototype.removeAllListeners.apply(this, arguments);
                return (ev === "readable" || ev === void 0) && process.nextTick(updateReadableListening, this), res;
              };
              function updateReadableListening(self2) {
                var state = self2._readableState;
                state.readableListening = self2.listenerCount("readable") > 0, state.resumeScheduled && !state.paused ? state.flowing = !0 : self2.listenerCount("data") > 0 && self2.resume();
              }
              function nReadingNextTick(self2) {
                debug("readable nexttick read 0"), self2.read(0);
              }
              Readable.prototype.resume = function() {
                var state = this._readableState;
                return state.flowing || (debug("resume"), state.flowing = !state.readableListening, resume(this, state)), state.paused = !1, this;
              };
              function resume(stream, state) {
                state.resumeScheduled || (state.resumeScheduled = !0, process.nextTick(resume_, stream, state));
              }
              function resume_(stream, state) {
                debug("resume", state.reading), state.reading || stream.read(0), state.resumeScheduled = !1, stream.emit("resume"), flow(stream), state.flowing && !state.reading && stream.read(0);
              }
              Readable.prototype.pause = function() {
                return debug("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== !1 && (debug("pause"), this._readableState.flowing = !1, this.emit("pause")), this._readableState.paused = !0, this;
              };
              function flow(stream) {
                var state = stream._readableState;
                for (debug("flow", state.flowing); state.flowing && stream.read() !== null; )
                  ;
              }
              Readable.prototype.wrap = function(stream) {
                var _this = this, state = this._readableState, paused = !1;
                stream.on("end", function() {
                  if (debug("wrapped end"), state.decoder && !state.ended) {
                    var chunk = state.decoder.end();
                    chunk && chunk.length && _this.push(chunk);
                  }
                  _this.push(null);
                }), stream.on("data", function(chunk) {
                  if (debug("wrapped data"), state.decoder && (chunk = state.decoder.write(chunk)), !(state.objectMode && chunk == null) && !(!state.objectMode && (!chunk || !chunk.length))) {
                    var ret = _this.push(chunk);
                    ret || (paused = !0, stream.pause());
                  }
                });
                for (var i in stream)
                  this[i] === void 0 && typeof stream[i] == "function" && (this[i] = /* @__PURE__ */ function(method) {
                    return function() {
                      return stream[method].apply(stream, arguments);
                    };
                  }(i));
                for (var n = 0; n < kProxyEvents.length; n++)
                  stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
                return this._read = function(n2) {
                  debug("wrapped _read", n2), paused && (paused = !1, stream.resume());
                }, this;
              }, typeof Symbol == "function" && (Readable.prototype[Symbol.asyncIterator] = function() {
                return createReadableStreamAsyncIterator === void 0 && (createReadableStreamAsyncIterator = require2("./internal/streams/async_iterator")), createReadableStreamAsyncIterator(this);
              }), Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._readableState.highWaterMark;
                }
              }), Object.defineProperty(Readable.prototype, "readableBuffer", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._readableState && this._readableState.buffer;
                }
              }), Object.defineProperty(Readable.prototype, "readableFlowing", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._readableState.flowing;
                },
                set: function(state) {
                  this._readableState && (this._readableState.flowing = state);
                }
              }), Readable._fromList = fromList, Object.defineProperty(Readable.prototype, "readableLength", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._readableState.length;
                }
              });
              function fromList(n, state) {
                if (state.length === 0) return null;
                var ret;
                return state.objectMode ? ret = state.buffer.shift() : !n || n >= state.length ? (state.decoder ? ret = state.buffer.join("") : state.buffer.length === 1 ? ret = state.buffer.first() : ret = state.buffer.concat(state.length), state.buffer.clear()) : ret = state.buffer.consume(n, state.decoder), ret;
              }
              function endReadable(stream) {
                var state = stream._readableState;
                debug("endReadable", state.endEmitted), state.endEmitted || (state.ended = !0, process.nextTick(endReadableNT, state, stream));
              }
              function endReadableNT(state, stream) {
                if (debug("endReadableNT", state.endEmitted, state.length), !state.endEmitted && state.length === 0 && (state.endEmitted = !0, stream.readable = !1, stream.emit("end"), state.autoDestroy)) {
                  var wState = stream._writableState;
                  (!wState || wState.autoDestroy && wState.finished) && stream.destroy();
                }
              }
              typeof Symbol == "function" && (Readable.from = function(iterable, opts) {
                return from === void 0 && (from = require2("./internal/streams/from")), from(Readable, iterable, opts);
              });
              function indexOf(xs, x) {
                for (var i = 0, l = xs.length; i < l; i++)
                  if (xs[i] === x) return i;
                return -1;
              }
            }).call(this);
          }).call(this, require2("_process"), typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
        }, { "../errors": 66, "./_stream_duplex": 67, "./internal/streams/async_iterator": 72, "./internal/streams/buffer_list": 73, "./internal/streams/destroy": 74, "./internal/streams/from": 76, "./internal/streams/state": 78, "./internal/streams/stream": 79, _process: 63, buffer: 32, events: 35, inherits: 46, "string_decoder/": 80, util: 29 }], 70: [function(require2, module3, exports3) {
          "use strict";
          module3.exports = Transform;
          var _require$codes = require2("../errors").codes, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK, ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING, ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0, Duplex = require2("./_stream_duplex");
          require2("inherits")(Transform, Duplex);
          function afterTransform(er, data) {
            var ts = this._transformState;
            ts.transforming = !1;
            var cb = ts.writecb;
            if (cb === null)
              return this.emit("error", new ERR_MULTIPLE_CALLBACK());
            ts.writechunk = null, ts.writecb = null, data != null && this.push(data), cb(er);
            var rs = this._readableState;
            rs.reading = !1, (rs.needReadable || rs.length < rs.highWaterMark) && this._read(rs.highWaterMark);
          }
          function Transform(options) {
            if (!(this instanceof Transform)) return new Transform(options);
            Duplex.call(this, options), this._transformState = {
              afterTransform: afterTransform.bind(this),
              needTransform: !1,
              transforming: !1,
              writecb: null,
              writechunk: null,
              writeencoding: null
            }, this._readableState.needReadable = !0, this._readableState.sync = !1, options && (typeof options.transform == "function" && (this._transform = options.transform), typeof options.flush == "function" && (this._flush = options.flush)), this.on("prefinish", prefinish);
          }
          function prefinish() {
            var _this = this;
            typeof this._flush == "function" && !this._readableState.destroyed ? this._flush(function(er, data) {
              done(_this, er, data);
            }) : done(this, null, null);
          }
          Transform.prototype.push = function(chunk, encoding) {
            return this._transformState.needTransform = !1, Duplex.prototype.push.call(this, chunk, encoding);
          }, Transform.prototype._transform = function(chunk, encoding, cb) {
            cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
          }, Transform.prototype._write = function(chunk, encoding, cb) {
            var ts = this._transformState;
            if (ts.writecb = cb, ts.writechunk = chunk, ts.writeencoding = encoding, !ts.transforming) {
              var rs = this._readableState;
              (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) && this._read(rs.highWaterMark);
            }
          }, Transform.prototype._read = function(n) {
            var ts = this._transformState;
            ts.writechunk !== null && !ts.transforming ? (ts.transforming = !0, this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform)) : ts.needTransform = !0;
          }, Transform.prototype._destroy = function(err, cb) {
            Duplex.prototype._destroy.call(this, err, function(err2) {
              cb(err2);
            });
          };
          function done(stream, er, data) {
            if (er) return stream.emit("error", er);
            if (data != null && stream.push(data), stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
            if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
            return stream.push(null);
          }
        }, { "../errors": 66, "./_stream_duplex": 67, inherits: 46 }], 71: [function(require2, module3, exports3) {
          (function(process, global2) {
            (function() {
              "use strict";
              module3.exports = Writable;
              function WriteReq(chunk, encoding, cb) {
                this.chunk = chunk, this.encoding = encoding, this.callback = cb, this.next = null;
              }
              function CorkedRequest(state) {
                var _this = this;
                this.next = null, this.entry = null, this.finish = function() {
                  onCorkedFinish(_this, state);
                };
              }
              var Duplex;
              Writable.WritableState = WritableState;
              var internalUtil = {
                deprecate: require2("util-deprecate")
              }, Stream = require2("./internal/streams/stream"), Buffer2 = require2("buffer").Buffer, OurUint8Array = global2.Uint8Array || function() {
              };
              function _uint8ArrayToBuffer(chunk) {
                return Buffer2.from(chunk);
              }
              function _isUint8Array(obj) {
                return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
              }
              var destroyImpl = require2("./internal/streams/destroy"), _require = require2("./internal/streams/state"), getHighWaterMark = _require.getHighWaterMark, _require$codes = require2("../errors").codes, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK, ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE, ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED, ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES, ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END, ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING, errorOrDestroy = destroyImpl.errorOrDestroy;
              require2("inherits")(Writable, Stream);
              function nop() {
              }
              function WritableState(options, stream, isDuplex) {
                Duplex = Duplex || require2("./_stream_duplex"), options = options || {}, typeof isDuplex != "boolean" && (isDuplex = stream instanceof Duplex), this.objectMode = !!options.objectMode, isDuplex && (this.objectMode = this.objectMode || !!options.writableObjectMode), this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
                var noDecode = options.decodeStrings === !1;
                this.decodeStrings = !noDecode, this.defaultEncoding = options.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(er) {
                  onwrite(stream, er);
                }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.emitClose = options.emitClose !== !1, this.autoDestroy = !!options.autoDestroy, this.bufferedRequestCount = 0, this.corkedRequestsFree = new CorkedRequest(this);
              }
              WritableState.prototype.getBuffer = function() {
                for (var current = this.bufferedRequest, out = []; current; )
                  out.push(current), current = current.next;
                return out;
              }, function() {
                try {
                  Object.defineProperty(WritableState.prototype, "buffer", {
                    get: internalUtil.deprecate(function() {
                      return this.getBuffer();
                    }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
                  });
                } catch {
                }
              }();
              var realHasInstance;
              typeof Symbol == "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] == "function" ? (realHasInstance = Function.prototype[Symbol.hasInstance], Object.defineProperty(Writable, Symbol.hasInstance, {
                value: function(object) {
                  return realHasInstance.call(this, object) ? !0 : this !== Writable ? !1 : object && object._writableState instanceof WritableState;
                }
              })) : realHasInstance = function(object) {
                return object instanceof this;
              };
              function Writable(options) {
                Duplex = Duplex || require2("./_stream_duplex");
                var isDuplex = this instanceof Duplex;
                if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
                this._writableState = new WritableState(options, this, isDuplex), this.writable = !0, options && (typeof options.write == "function" && (this._write = options.write), typeof options.writev == "function" && (this._writev = options.writev), typeof options.destroy == "function" && (this._destroy = options.destroy), typeof options.final == "function" && (this._final = options.final)), Stream.call(this);
              }
              Writable.prototype.pipe = function() {
                errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
              };
              function writeAfterEnd(stream, cb) {
                var er = new ERR_STREAM_WRITE_AFTER_END();
                errorOrDestroy(stream, er), process.nextTick(cb, er);
              }
              function validChunk(stream, state, chunk, cb) {
                var er;
                return chunk === null ? er = new ERR_STREAM_NULL_VALUES() : typeof chunk != "string" && !state.objectMode && (er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk)), er ? (errorOrDestroy(stream, er), process.nextTick(cb, er), !1) : !0;
              }
              Writable.prototype.write = function(chunk, encoding, cb) {
                var state = this._writableState, ret = !1, isBuf = !state.objectMode && _isUint8Array(chunk);
                return isBuf && !Buffer2.isBuffer(chunk) && (chunk = _uint8ArrayToBuffer(chunk)), typeof encoding == "function" && (cb = encoding, encoding = null), isBuf ? encoding = "buffer" : encoding || (encoding = state.defaultEncoding), typeof cb != "function" && (cb = nop), state.ending ? writeAfterEnd(this, cb) : (isBuf || validChunk(this, state, chunk, cb)) && (state.pendingcb++, ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb)), ret;
              }, Writable.prototype.cork = function() {
                this._writableState.corked++;
              }, Writable.prototype.uncork = function() {
                var state = this._writableState;
                state.corked && (state.corked--, !state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest && clearBuffer(this, state));
              }, Writable.prototype.setDefaultEncoding = function(encoding) {
                if (typeof encoding == "string" && (encoding = encoding.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
                return this._writableState.defaultEncoding = encoding, this;
              }, Object.defineProperty(Writable.prototype, "writableBuffer", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._writableState && this._writableState.getBuffer();
                }
              });
              function decodeChunk(state, chunk, encoding) {
                return !state.objectMode && state.decodeStrings !== !1 && typeof chunk == "string" && (chunk = Buffer2.from(chunk, encoding)), chunk;
              }
              Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._writableState.highWaterMark;
                }
              });
              function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
                if (!isBuf) {
                  var newChunk = decodeChunk(state, chunk, encoding);
                  chunk !== newChunk && (isBuf = !0, encoding = "buffer", chunk = newChunk);
                }
                var len = state.objectMode ? 1 : chunk.length;
                state.length += len;
                var ret = state.length < state.highWaterMark;
                if (ret || (state.needDrain = !0), state.writing || state.corked) {
                  var last = state.lastBufferedRequest;
                  state.lastBufferedRequest = {
                    chunk,
                    encoding,
                    isBuf,
                    callback: cb,
                    next: null
                  }, last ? last.next = state.lastBufferedRequest : state.bufferedRequest = state.lastBufferedRequest, state.bufferedRequestCount += 1;
                } else
                  doWrite(stream, state, !1, len, chunk, encoding, cb);
                return ret;
              }
              function doWrite(stream, state, writev, len, chunk, encoding, cb) {
                state.writelen = len, state.writecb = cb, state.writing = !0, state.sync = !0, state.destroyed ? state.onwrite(new ERR_STREAM_DESTROYED("write")) : writev ? stream._writev(chunk, state.onwrite) : stream._write(chunk, encoding, state.onwrite), state.sync = !1;
              }
              function onwriteError(stream, state, sync, er, cb) {
                --state.pendingcb, sync ? (process.nextTick(cb, er), process.nextTick(finishMaybe, stream, state), stream._writableState.errorEmitted = !0, errorOrDestroy(stream, er)) : (cb(er), stream._writableState.errorEmitted = !0, errorOrDestroy(stream, er), finishMaybe(stream, state));
              }
              function onwriteStateUpdate(state) {
                state.writing = !1, state.writecb = null, state.length -= state.writelen, state.writelen = 0;
              }
              function onwrite(stream, er) {
                var state = stream._writableState, sync = state.sync, cb = state.writecb;
                if (typeof cb != "function") throw new ERR_MULTIPLE_CALLBACK();
                if (onwriteStateUpdate(state), er) onwriteError(stream, state, sync, er, cb);
                else {
                  var finished = needFinish(state) || stream.destroyed;
                  !finished && !state.corked && !state.bufferProcessing && state.bufferedRequest && clearBuffer(stream, state), sync ? process.nextTick(afterWrite, stream, state, finished, cb) : afterWrite(stream, state, finished, cb);
                }
              }
              function afterWrite(stream, state, finished, cb) {
                finished || onwriteDrain(stream, state), state.pendingcb--, cb(), finishMaybe(stream, state);
              }
              function onwriteDrain(stream, state) {
                state.length === 0 && state.needDrain && (state.needDrain = !1, stream.emit("drain"));
              }
              function clearBuffer(stream, state) {
                state.bufferProcessing = !0;
                var entry = state.bufferedRequest;
                if (stream._writev && entry && entry.next) {
                  var l = state.bufferedRequestCount, buffer = new Array(l), holder = state.corkedRequestsFree;
                  holder.entry = entry;
                  for (var count = 0, allBuffers = !0; entry; )
                    buffer[count] = entry, entry.isBuf || (allBuffers = !1), entry = entry.next, count += 1;
                  buffer.allBuffers = allBuffers, doWrite(stream, state, !0, state.length, buffer, "", holder.finish), state.pendingcb++, state.lastBufferedRequest = null, holder.next ? (state.corkedRequestsFree = holder.next, holder.next = null) : state.corkedRequestsFree = new CorkedRequest(state), state.bufferedRequestCount = 0;
                } else {
                  for (; entry; ) {
                    var chunk = entry.chunk, encoding = entry.encoding, cb = entry.callback, len = state.objectMode ? 1 : chunk.length;
                    if (doWrite(stream, state, !1, len, chunk, encoding, cb), entry = entry.next, state.bufferedRequestCount--, state.writing)
                      break;
                  }
                  entry === null && (state.lastBufferedRequest = null);
                }
                state.bufferedRequest = entry, state.bufferProcessing = !1;
              }
              Writable.prototype._write = function(chunk, encoding, cb) {
                cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
              }, Writable.prototype._writev = null, Writable.prototype.end = function(chunk, encoding, cb) {
                var state = this._writableState;
                return typeof chunk == "function" ? (cb = chunk, chunk = null, encoding = null) : typeof encoding == "function" && (cb = encoding, encoding = null), chunk != null && this.write(chunk, encoding), state.corked && (state.corked = 1, this.uncork()), state.ending || endWritable(this, state, cb), this;
              }, Object.defineProperty(Writable.prototype, "writableLength", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._writableState.length;
                }
              });
              function needFinish(state) {
                return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
              }
              function callFinal(stream, state) {
                stream._final(function(err) {
                  state.pendingcb--, err && errorOrDestroy(stream, err), state.prefinished = !0, stream.emit("prefinish"), finishMaybe(stream, state);
                });
              }
              function prefinish(stream, state) {
                !state.prefinished && !state.finalCalled && (typeof stream._final == "function" && !state.destroyed ? (state.pendingcb++, state.finalCalled = !0, process.nextTick(callFinal, stream, state)) : (state.prefinished = !0, stream.emit("prefinish")));
              }
              function finishMaybe(stream, state) {
                var need = needFinish(state);
                if (need && (prefinish(stream, state), state.pendingcb === 0 && (state.finished = !0, stream.emit("finish"), state.autoDestroy))) {
                  var rState = stream._readableState;
                  (!rState || rState.autoDestroy && rState.endEmitted) && stream.destroy();
                }
                return need;
              }
              function endWritable(stream, state, cb) {
                state.ending = !0, finishMaybe(stream, state), cb && (state.finished ? process.nextTick(cb) : stream.once("finish", cb)), state.ended = !0, stream.writable = !1;
              }
              function onCorkedFinish(corkReq, state, err) {
                var entry = corkReq.entry;
                for (corkReq.entry = null; entry; ) {
                  var cb = entry.callback;
                  state.pendingcb--, cb(err), entry = entry.next;
                }
                state.corkedRequestsFree.next = corkReq;
              }
              Object.defineProperty(Writable.prototype, "destroyed", {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: !1,
                get: function() {
                  return this._writableState === void 0 ? !1 : this._writableState.destroyed;
                },
                set: function(value) {
                  this._writableState && (this._writableState.destroyed = value);
                }
              }), Writable.prototype.destroy = destroyImpl.destroy, Writable.prototype._undestroy = destroyImpl.undestroy, Writable.prototype._destroy = function(err, cb) {
                cb(err);
              };
            }).call(this);
          }).call(this, require2("_process"), typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
        }, { "../errors": 66, "./_stream_duplex": 67, "./internal/streams/destroy": 74, "./internal/streams/state": 78, "./internal/streams/stream": 79, _process: 63, buffer: 32, inherits: 46, "util-deprecate": 81 }], 72: [function(require2, module3, exports3) {
          (function(process) {
            (function() {
              "use strict";
              var _Object$setPrototypeO;
              function _defineProperty(obj, key, value) {
                return key in obj ? Object.defineProperty(obj, key, { value, enumerable: !0, configurable: !0, writable: !0 }) : obj[key] = value, obj;
              }
              var finished = require2("./end-of-stream"), kLastResolve = Symbol("lastResolve"), kLastReject = Symbol("lastReject"), kError = Symbol("error"), kEnded = Symbol("ended"), kLastPromise = Symbol("lastPromise"), kHandlePromise = Symbol("handlePromise"), kStream = Symbol("stream");
              function createIterResult(value, done) {
                return {
                  value,
                  done
                };
              }
              function readAndResolve(iter) {
                var resolve = iter[kLastResolve];
                if (resolve !== null) {
                  var data = iter[kStream].read();
                  data !== null && (iter[kLastPromise] = null, iter[kLastResolve] = null, iter[kLastReject] = null, resolve(createIterResult(data, !1)));
                }
              }
              function onReadable(iter) {
                process.nextTick(readAndResolve, iter);
              }
              function wrapForNext(lastPromise, iter) {
                return function(resolve, reject) {
                  lastPromise.then(function() {
                    if (iter[kEnded]) {
                      resolve(createIterResult(void 0, !0));
                      return;
                    }
                    iter[kHandlePromise](resolve, reject);
                  }, reject);
                };
              }
              var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
              }), ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
                get stream() {
                  return this[kStream];
                },
                next: function() {
                  var _this = this, error = this[kError];
                  if (error !== null)
                    return Promise.reject(error);
                  if (this[kEnded])
                    return Promise.resolve(createIterResult(void 0, !0));
                  if (this[kStream].destroyed)
                    return new Promise(function(resolve, reject) {
                      process.nextTick(function() {
                        _this[kError] ? reject(_this[kError]) : resolve(createIterResult(void 0, !0));
                      });
                    });
                  var lastPromise = this[kLastPromise], promise;
                  if (lastPromise)
                    promise = new Promise(wrapForNext(lastPromise, this));
                  else {
                    var data = this[kStream].read();
                    if (data !== null)
                      return Promise.resolve(createIterResult(data, !1));
                    promise = new Promise(this[kHandlePromise]);
                  }
                  return this[kLastPromise] = promise, promise;
                }
              }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
                return this;
              }), _defineProperty(_Object$setPrototypeO, "return", function() {
                var _this2 = this;
                return new Promise(function(resolve, reject) {
                  _this2[kStream].destroy(null, function(err) {
                    if (err) {
                      reject(err);
                      return;
                    }
                    resolve(createIterResult(void 0, !0));
                  });
                });
              }), _Object$setPrototypeO), AsyncIteratorPrototype), createReadableStreamAsyncIterator = function(stream) {
                var _Object$create, iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
                  value: stream,
                  writable: !0
                }), _defineProperty(_Object$create, kLastResolve, {
                  value: null,
                  writable: !0
                }), _defineProperty(_Object$create, kLastReject, {
                  value: null,
                  writable: !0
                }), _defineProperty(_Object$create, kError, {
                  value: null,
                  writable: !0
                }), _defineProperty(_Object$create, kEnded, {
                  value: stream._readableState.endEmitted,
                  writable: !0
                }), _defineProperty(_Object$create, kHandlePromise, {
                  value: function(resolve, reject) {
                    var data = iterator[kStream].read();
                    data ? (iterator[kLastPromise] = null, iterator[kLastResolve] = null, iterator[kLastReject] = null, resolve(createIterResult(data, !1))) : (iterator[kLastResolve] = resolve, iterator[kLastReject] = reject);
                  },
                  writable: !0
                }), _Object$create));
                return iterator[kLastPromise] = null, finished(stream, function(err) {
                  if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
                    var reject = iterator[kLastReject];
                    reject !== null && (iterator[kLastPromise] = null, iterator[kLastResolve] = null, iterator[kLastReject] = null, reject(err)), iterator[kError] = err;
                    return;
                  }
                  var resolve = iterator[kLastResolve];
                  resolve !== null && (iterator[kLastPromise] = null, iterator[kLastResolve] = null, iterator[kLastReject] = null, resolve(createIterResult(void 0, !0))), iterator[kEnded] = !0;
                }), stream.on("readable", onReadable.bind(null, iterator)), iterator;
              };
              module3.exports = createReadableStreamAsyncIterator;
            }).call(this);
          }).call(this, require2("_process"));
        }, { "./end-of-stream": 75, _process: 63 }], 73: [function(require2, module3, exports3) {
          "use strict";
          function ownKeys(object, enumerableOnly) {
            var keys = Object.keys(object);
            if (Object.getOwnPropertySymbols) {
              var symbols = Object.getOwnPropertySymbols(object);
              enumerableOnly && (symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
              })), keys.push.apply(keys, symbols);
            }
            return keys;
          }
          function _objectSpread(target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i] != null ? arguments[i] : {};
              i % 2 ? ownKeys(Object(source), !0).forEach(function(key) {
                _defineProperty(target, key, source[key]);
              }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
              });
            }
            return target;
          }
          function _defineProperty(obj, key, value) {
            return key in obj ? Object.defineProperty(obj, key, { value, enumerable: !0, configurable: !0, writable: !0 }) : obj[key] = value, obj;
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
              throw new TypeError("Cannot call a class as a function");
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            return protoProps && _defineProperties(Constructor.prototype, protoProps), staticProps && _defineProperties(Constructor, staticProps), Constructor;
          }
          var _require = require2("buffer"), Buffer2 = _require.Buffer, _require2 = require2("util"), inspect = _require2.inspect, custom = inspect && inspect.custom || "inspect";
          function copyBuffer(src, target, offset) {
            Buffer2.prototype.copy.call(src, target, offset);
          }
          module3.exports = /* @__PURE__ */ function() {
            function BufferList() {
              _classCallCheck(this, BufferList), this.head = null, this.tail = null, this.length = 0;
            }
            return _createClass(BufferList, [{
              key: "push",
              value: function(v) {
                var entry = {
                  data: v,
                  next: null
                };
                this.length > 0 ? this.tail.next = entry : this.head = entry, this.tail = entry, ++this.length;
              }
            }, {
              key: "unshift",
              value: function(v) {
                var entry = {
                  data: v,
                  next: this.head
                };
                this.length === 0 && (this.tail = entry), this.head = entry, ++this.length;
              }
            }, {
              key: "shift",
              value: function() {
                if (this.length !== 0) {
                  var ret = this.head.data;
                  return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, ret;
                }
              }
            }, {
              key: "clear",
              value: function() {
                this.head = this.tail = null, this.length = 0;
              }
            }, {
              key: "join",
              value: function(s) {
                if (this.length === 0) return "";
                for (var p = this.head, ret = "" + p.data; p = p.next; )
                  ret += s + p.data;
                return ret;
              }
            }, {
              key: "concat",
              value: function(n) {
                if (this.length === 0) return Buffer2.alloc(0);
                for (var ret = Buffer2.allocUnsafe(n >>> 0), p = this.head, i = 0; p; )
                  copyBuffer(p.data, ret, i), i += p.data.length, p = p.next;
                return ret;
              }
              // Consumes a specified amount of bytes or characters from the buffered data.
            }, {
              key: "consume",
              value: function(n, hasStrings) {
                var ret;
                return n < this.head.data.length ? (ret = this.head.data.slice(0, n), this.head.data = this.head.data.slice(n)) : n === this.head.data.length ? ret = this.shift() : ret = hasStrings ? this._getString(n) : this._getBuffer(n), ret;
              }
            }, {
              key: "first",
              value: function() {
                return this.head.data;
              }
              // Consumes a specified amount of characters from the buffered data.
            }, {
              key: "_getString",
              value: function(n) {
                var p = this.head, c = 1, ret = p.data;
                for (n -= ret.length; p = p.next; ) {
                  var str = p.data, nb = n > str.length ? str.length : n;
                  if (nb === str.length ? ret += str : ret += str.slice(0, n), n -= nb, n === 0) {
                    nb === str.length ? (++c, p.next ? this.head = p.next : this.head = this.tail = null) : (this.head = p, p.data = str.slice(nb));
                    break;
                  }
                  ++c;
                }
                return this.length -= c, ret;
              }
              // Consumes a specified amount of bytes from the buffered data.
            }, {
              key: "_getBuffer",
              value: function(n) {
                var ret = Buffer2.allocUnsafe(n), p = this.head, c = 1;
                for (p.data.copy(ret), n -= p.data.length; p = p.next; ) {
                  var buf = p.data, nb = n > buf.length ? buf.length : n;
                  if (buf.copy(ret, ret.length - n, 0, nb), n -= nb, n === 0) {
                    nb === buf.length ? (++c, p.next ? this.head = p.next : this.head = this.tail = null) : (this.head = p, p.data = buf.slice(nb));
                    break;
                  }
                  ++c;
                }
                return this.length -= c, ret;
              }
              // Make sure the linked list only shows the minimal necessary information.
            }, {
              key: custom,
              value: function(_, options) {
                return inspect(this, _objectSpread({}, options, {
                  // Only inspect one level.
                  depth: 0,
                  // It should not recurse.
                  customInspect: !1
                }));
              }
            }]), BufferList;
          }();
        }, { buffer: 32, util: 29 }], 74: [function(require2, module3, exports3) {
          (function(process) {
            (function() {
              "use strict";
              function destroy(err, cb) {
                var _this = this, readableDestroyed = this._readableState && this._readableState.destroyed, writableDestroyed = this._writableState && this._writableState.destroyed;
                return readableDestroyed || writableDestroyed ? (cb ? cb(err) : err && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, process.nextTick(emitErrorNT, this, err)) : process.nextTick(emitErrorNT, this, err)), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(err || null, function(err2) {
                  !cb && err2 ? _this._writableState ? _this._writableState.errorEmitted ? process.nextTick(emitCloseNT, _this) : (_this._writableState.errorEmitted = !0, process.nextTick(emitErrorAndCloseNT, _this, err2)) : process.nextTick(emitErrorAndCloseNT, _this, err2) : cb ? (process.nextTick(emitCloseNT, _this), cb(err2)) : process.nextTick(emitCloseNT, _this);
                }), this);
              }
              function emitErrorAndCloseNT(self2, err) {
                emitErrorNT(self2, err), emitCloseNT(self2);
              }
              function emitCloseNT(self2) {
                self2._writableState && !self2._writableState.emitClose || self2._readableState && !self2._readableState.emitClose || self2.emit("close");
              }
              function undestroy() {
                this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
              }
              function emitErrorNT(self2, err) {
                self2.emit("error", err);
              }
              function errorOrDestroy(stream, err) {
                var rState = stream._readableState, wState = stream._writableState;
                rState && rState.autoDestroy || wState && wState.autoDestroy ? stream.destroy(err) : stream.emit("error", err);
              }
              module3.exports = {
                destroy,
                undestroy,
                errorOrDestroy
              };
            }).call(this);
          }).call(this, require2("_process"));
        }, { _process: 63 }], 75: [function(require2, module3, exports3) {
          "use strict";
          var ERR_STREAM_PREMATURE_CLOSE = require2("../../../errors").codes.ERR_STREAM_PREMATURE_CLOSE;
          function once(callback) {
            var called = !1;
            return function() {
              if (!called) {
                called = !0;
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)
                  args[_key] = arguments[_key];
                callback.apply(this, args);
              }
            };
          }
          function noop() {
          }
          function isRequest(stream) {
            return stream.setHeader && typeof stream.abort == "function";
          }
          function eos(stream, opts, callback) {
            if (typeof opts == "function") return eos(stream, null, opts);
            opts || (opts = {}), callback = once(callback || noop);
            var readable = opts.readable || opts.readable !== !1 && stream.readable, writable = opts.writable || opts.writable !== !1 && stream.writable, onlegacyfinish = function() {
              stream.writable || onfinish();
            }, writableEnded = stream._writableState && stream._writableState.finished, onfinish = function() {
              writable = !1, writableEnded = !0, readable || callback.call(stream);
            }, readableEnded = stream._readableState && stream._readableState.endEmitted, onend = function() {
              readable = !1, readableEnded = !0, writable || callback.call(stream);
            }, onerror = function(err) {
              callback.call(stream, err);
            }, onclose = function() {
              var err;
              if (readable && !readableEnded)
                return (!stream._readableState || !stream._readableState.ended) && (err = new ERR_STREAM_PREMATURE_CLOSE()), callback.call(stream, err);
              if (writable && !writableEnded)
                return (!stream._writableState || !stream._writableState.ended) && (err = new ERR_STREAM_PREMATURE_CLOSE()), callback.call(stream, err);
            }, onrequest = function() {
              stream.req.on("finish", onfinish);
            };
            return isRequest(stream) ? (stream.on("complete", onfinish), stream.on("abort", onclose), stream.req ? onrequest() : stream.on("request", onrequest)) : writable && !stream._writableState && (stream.on("end", onlegacyfinish), stream.on("close", onlegacyfinish)), stream.on("end", onend), stream.on("finish", onfinish), opts.error !== !1 && stream.on("error", onerror), stream.on("close", onclose), function() {
              stream.removeListener("complete", onfinish), stream.removeListener("abort", onclose), stream.removeListener("request", onrequest), stream.req && stream.req.removeListener("finish", onfinish), stream.removeListener("end", onlegacyfinish), stream.removeListener("close", onlegacyfinish), stream.removeListener("finish", onfinish), stream.removeListener("end", onend), stream.removeListener("error", onerror), stream.removeListener("close", onclose);
            };
          }
          module3.exports = eos;
        }, { "../../../errors": 66 }], 76: [function(require2, module3, exports3) {
          module3.exports = function() {
            throw new Error("Readable.from is not available in the browser");
          };
        }, {}], 77: [function(require2, module3, exports3) {
          "use strict";
          var eos;
          function once(callback) {
            var called = !1;
            return function() {
              called || (called = !0, callback.apply(void 0, arguments));
            };
          }
          var _require$codes = require2("../../../errors").codes, ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS, ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
          function noop(err) {
            if (err) throw err;
          }
          function isRequest(stream) {
            return stream.setHeader && typeof stream.abort == "function";
          }
          function destroyer(stream, reading, writing, callback) {
            callback = once(callback);
            var closed = !1;
            stream.on("close", function() {
              closed = !0;
            }), eos === void 0 && (eos = require2("./end-of-stream")), eos(stream, {
              readable: reading,
              writable: writing
            }, function(err) {
              if (err) return callback(err);
              closed = !0, callback();
            });
            var destroyed = !1;
            return function(err) {
              if (!closed && !destroyed) {
                if (destroyed = !0, isRequest(stream)) return stream.abort();
                if (typeof stream.destroy == "function") return stream.destroy();
                callback(err || new ERR_STREAM_DESTROYED("pipe"));
              }
            };
          }
          function call(fn) {
            fn();
          }
          function pipe(from, to) {
            return from.pipe(to);
          }
          function popCallback(streams) {
            return !streams.length || typeof streams[streams.length - 1] != "function" ? noop : streams.pop();
          }
          function pipeline() {
            for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++)
              streams[_key] = arguments[_key];
            var callback = popCallback(streams);
            if (Array.isArray(streams[0]) && (streams = streams[0]), streams.length < 2)
              throw new ERR_MISSING_ARGS("streams");
            var error, destroys = streams.map(function(stream, i) {
              var reading = i < streams.length - 1, writing = i > 0;
              return destroyer(stream, reading, writing, function(err) {
                error || (error = err), err && destroys.forEach(call), !reading && (destroys.forEach(call), callback(error));
              });
            });
            return streams.reduce(pipe);
          }
          module3.exports = pipeline;
        }, { "../../../errors": 66, "./end-of-stream": 75 }], 78: [function(require2, module3, exports3) {
          "use strict";
          var ERR_INVALID_OPT_VALUE = require2("../../../errors").codes.ERR_INVALID_OPT_VALUE;
          function highWaterMarkFrom(options, isDuplex, duplexKey) {
            return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
          }
          function getHighWaterMark(state, options, duplexKey, isDuplex) {
            var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
            if (hwm != null) {
              if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
                var name = isDuplex ? duplexKey : "highWaterMark";
                throw new ERR_INVALID_OPT_VALUE(name, hwm);
              }
              return Math.floor(hwm);
            }
            return state.objectMode ? 16 : 16 * 1024;
          }
          module3.exports = {
            getHighWaterMark
          };
        }, { "../../../errors": 66 }], 79: [function(require2, module3, exports3) {
          module3.exports = require2("events").EventEmitter;
        }, { events: 35 }], 80: [function(require2, module3, exports3) {
          "use strict";
          var Buffer2 = require2("safe-buffer").Buffer, isEncoding = Buffer2.isEncoding || function(encoding) {
            switch (encoding = "" + encoding, encoding && encoding.toLowerCase()) {
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
          function _normalizeEncoding(enc) {
            if (!enc) return "utf8";
            for (var retried; ; )
              switch (enc) {
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
                  return enc;
                default:
                  if (retried) return;
                  enc = ("" + enc).toLowerCase(), retried = !0;
              }
          }
          function normalizeEncoding(enc) {
            var nenc = _normalizeEncoding(enc);
            if (typeof nenc != "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
            return nenc || enc;
          }
          exports3.StringDecoder = StringDecoder;
          function StringDecoder(encoding) {
            this.encoding = normalizeEncoding(encoding);
            var nb;
            switch (this.encoding) {
              case "utf16le":
                this.text = utf16Text, this.end = utf16End, nb = 4;
                break;
              case "utf8":
                this.fillLast = utf8FillLast, nb = 4;
                break;
              case "base64":
                this.text = base64Text, this.end = base64End, nb = 3;
                break;
              default:
                this.write = simpleWrite, this.end = simpleEnd;
                return;
            }
            this.lastNeed = 0, this.lastTotal = 0, this.lastChar = Buffer2.allocUnsafe(nb);
          }
          StringDecoder.prototype.write = function(buf) {
            if (buf.length === 0) return "";
            var r, i;
            if (this.lastNeed) {
              if (r = this.fillLast(buf), r === void 0) return "";
              i = this.lastNeed, this.lastNeed = 0;
            } else
              i = 0;
            return i < buf.length ? r ? r + this.text(buf, i) : this.text(buf, i) : r || "";
          }, StringDecoder.prototype.end = utf8End, StringDecoder.prototype.text = utf8Text, StringDecoder.prototype.fillLast = function(buf) {
            if (this.lastNeed <= buf.length)
              return buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
            buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length), this.lastNeed -= buf.length;
          };
          function utf8CheckByte(byte) {
            return byte <= 127 ? 0 : byte >> 5 === 6 ? 2 : byte >> 4 === 14 ? 3 : byte >> 3 === 30 ? 4 : byte >> 6 === 2 ? -1 : -2;
          }
          function utf8CheckIncomplete(self2, buf, i) {
            var j = buf.length - 1;
            if (j < i) return 0;
            var nb = utf8CheckByte(buf[j]);
            return nb >= 0 ? (nb > 0 && (self2.lastNeed = nb - 1), nb) : --j < i || nb === -2 ? 0 : (nb = utf8CheckByte(buf[j]), nb >= 0 ? (nb > 0 && (self2.lastNeed = nb - 2), nb) : --j < i || nb === -2 ? 0 : (nb = utf8CheckByte(buf[j]), nb >= 0 ? (nb > 0 && (nb === 2 ? nb = 0 : self2.lastNeed = nb - 3), nb) : 0));
          }
          function utf8CheckExtraBytes(self2, buf, p) {
            if ((buf[0] & 192) !== 128)
              return self2.lastNeed = 0, "\uFFFD";
            if (self2.lastNeed > 1 && buf.length > 1) {
              if ((buf[1] & 192) !== 128)
                return self2.lastNeed = 1, "\uFFFD";
              if (self2.lastNeed > 2 && buf.length > 2 && (buf[2] & 192) !== 128)
                return self2.lastNeed = 2, "\uFFFD";
            }
          }
          function utf8FillLast(buf) {
            var p = this.lastTotal - this.lastNeed, r = utf8CheckExtraBytes(this, buf, p);
            if (r !== void 0) return r;
            if (this.lastNeed <= buf.length)
              return buf.copy(this.lastChar, p, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
            buf.copy(this.lastChar, p, 0, buf.length), this.lastNeed -= buf.length;
          }
          function utf8Text(buf, i) {
            var total = utf8CheckIncomplete(this, buf, i);
            if (!this.lastNeed) return buf.toString("utf8", i);
            this.lastTotal = total;
            var end = buf.length - (total - this.lastNeed);
            return buf.copy(this.lastChar, 0, end), buf.toString("utf8", i, end);
          }
          function utf8End(buf) {
            var r = buf && buf.length ? this.write(buf) : "";
            return this.lastNeed ? r + "\uFFFD" : r;
          }
          function utf16Text(buf, i) {
            if ((buf.length - i) % 2 === 0) {
              var r = buf.toString("utf16le", i);
              if (r) {
                var c = r.charCodeAt(r.length - 1);
                if (c >= 55296 && c <= 56319)
                  return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = buf[buf.length - 2], this.lastChar[1] = buf[buf.length - 1], r.slice(0, -1);
              }
              return r;
            }
            return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = buf[buf.length - 1], buf.toString("utf16le", i, buf.length - 1);
          }
          function utf16End(buf) {
            var r = buf && buf.length ? this.write(buf) : "";
            if (this.lastNeed) {
              var end = this.lastTotal - this.lastNeed;
              return r + this.lastChar.toString("utf16le", 0, end);
            }
            return r;
          }
          function base64Text(buf, i) {
            var n = (buf.length - i) % 3;
            return n === 0 ? buf.toString("base64", i) : (this.lastNeed = 3 - n, this.lastTotal = 3, n === 1 ? this.lastChar[0] = buf[buf.length - 1] : (this.lastChar[0] = buf[buf.length - 2], this.lastChar[1] = buf[buf.length - 1]), buf.toString("base64", i, buf.length - n));
          }
          function base64End(buf) {
            var r = buf && buf.length ? this.write(buf) : "";
            return this.lastNeed ? r + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : r;
          }
          function simpleWrite(buf) {
            return buf.toString(this.encoding);
          }
          function simpleEnd(buf) {
            return buf && buf.length ? this.write(buf) : "";
          }
        }, { "safe-buffer": 64 }], 81: [function(require2, module3, exports3) {
          (function(global2) {
            (function() {
              module3.exports = deprecate;
              function deprecate(fn, msg) {
                if (config("noDeprecation"))
                  return fn;
                var warned = !1;
                function deprecated() {
                  if (!warned) {
                    if (config("throwDeprecation"))
                      throw new Error(msg);
                    config("traceDeprecation") ? console.trace(msg) : console.warn(msg), warned = !0;
                  }
                  return fn.apply(this, arguments);
                }
                return deprecated;
              }
              function config(name) {
                try {
                  if (!global2.localStorage) return !1;
                } catch {
                  return !1;
                }
                var val = global2.localStorage[name];
                return val == null ? !1 : String(val).toLowerCase() === "true";
              }
            }).call(this);
          }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
        }, {}], 82: [function(require2, module3, exports3) {
          arguments[4][25][0].apply(exports3, arguments);
        }, { dup: 25 }], 83: [function(require2, module3, exports3) {
          "use strict";
          var isArgumentsObject = require2("is-arguments"), isGeneratorFunction = require2("is-generator-function"), whichTypedArray = require2("which-typed-array"), isTypedArray = require2("is-typed-array");
          function uncurryThis(f) {
            return f.call.bind(f);
          }
          var BigIntSupported = typeof BigInt < "u", SymbolSupported = typeof Symbol < "u", ObjectToString = uncurryThis(Object.prototype.toString), numberValue = uncurryThis(Number.prototype.valueOf), stringValue = uncurryThis(String.prototype.valueOf), booleanValue = uncurryThis(Boolean.prototype.valueOf);
          if (BigIntSupported)
            var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
          if (SymbolSupported)
            var symbolValue = uncurryThis(Symbol.prototype.valueOf);
          function checkBoxedPrimitive(value, prototypeValueOf) {
            if (typeof value != "object")
              return !1;
            try {
              return prototypeValueOf(value), !0;
            } catch {
              return !1;
            }
          }
          exports3.isArgumentsObject = isArgumentsObject, exports3.isGeneratorFunction = isGeneratorFunction, exports3.isTypedArray = isTypedArray;
          function isPromise(input) {
            return typeof Promise < "u" && input instanceof Promise || input !== null && typeof input == "object" && typeof input.then == "function" && typeof input.catch == "function";
          }
          exports3.isPromise = isPromise;
          function isArrayBufferView(value) {
            return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? ArrayBuffer.isView(value) : isTypedArray(value) || isDataView(value);
          }
          exports3.isArrayBufferView = isArrayBufferView;
          function isUint8Array(value) {
            return whichTypedArray(value) === "Uint8Array";
          }
          exports3.isUint8Array = isUint8Array;
          function isUint8ClampedArray(value) {
            return whichTypedArray(value) === "Uint8ClampedArray";
          }
          exports3.isUint8ClampedArray = isUint8ClampedArray;
          function isUint16Array(value) {
            return whichTypedArray(value) === "Uint16Array";
          }
          exports3.isUint16Array = isUint16Array;
          function isUint32Array(value) {
            return whichTypedArray(value) === "Uint32Array";
          }
          exports3.isUint32Array = isUint32Array;
          function isInt8Array(value) {
            return whichTypedArray(value) === "Int8Array";
          }
          exports3.isInt8Array = isInt8Array;
          function isInt16Array(value) {
            return whichTypedArray(value) === "Int16Array";
          }
          exports3.isInt16Array = isInt16Array;
          function isInt32Array(value) {
            return whichTypedArray(value) === "Int32Array";
          }
          exports3.isInt32Array = isInt32Array;
          function isFloat32Array(value) {
            return whichTypedArray(value) === "Float32Array";
          }
          exports3.isFloat32Array = isFloat32Array;
          function isFloat64Array(value) {
            return whichTypedArray(value) === "Float64Array";
          }
          exports3.isFloat64Array = isFloat64Array;
          function isBigInt64Array(value) {
            return whichTypedArray(value) === "BigInt64Array";
          }
          exports3.isBigInt64Array = isBigInt64Array;
          function isBigUint64Array(value) {
            return whichTypedArray(value) === "BigUint64Array";
          }
          exports3.isBigUint64Array = isBigUint64Array;
          function isMapToString(value) {
            return ObjectToString(value) === "[object Map]";
          }
          isMapToString.working = typeof Map < "u" && isMapToString(/* @__PURE__ */ new Map());
          function isMap(value) {
            return typeof Map > "u" ? !1 : isMapToString.working ? isMapToString(value) : value instanceof Map;
          }
          exports3.isMap = isMap;
          function isSetToString(value) {
            return ObjectToString(value) === "[object Set]";
          }
          isSetToString.working = typeof Set < "u" && isSetToString(/* @__PURE__ */ new Set());
          function isSet(value) {
            return typeof Set > "u" ? !1 : isSetToString.working ? isSetToString(value) : value instanceof Set;
          }
          exports3.isSet = isSet;
          function isWeakMapToString(value) {
            return ObjectToString(value) === "[object WeakMap]";
          }
          isWeakMapToString.working = typeof WeakMap < "u" && isWeakMapToString(/* @__PURE__ */ new WeakMap());
          function isWeakMap(value) {
            return typeof WeakMap > "u" ? !1 : isWeakMapToString.working ? isWeakMapToString(value) : value instanceof WeakMap;
          }
          exports3.isWeakMap = isWeakMap;
          function isWeakSetToString(value) {
            return ObjectToString(value) === "[object WeakSet]";
          }
          isWeakSetToString.working = typeof WeakSet < "u" && isWeakSetToString(/* @__PURE__ */ new WeakSet());
          function isWeakSet(value) {
            return isWeakSetToString(value);
          }
          exports3.isWeakSet = isWeakSet;
          function isArrayBufferToString(value) {
            return ObjectToString(value) === "[object ArrayBuffer]";
          }
          isArrayBufferToString.working = typeof ArrayBuffer < "u" && isArrayBufferToString(new ArrayBuffer());
          function isArrayBuffer(value) {
            return typeof ArrayBuffer > "u" ? !1 : isArrayBufferToString.working ? isArrayBufferToString(value) : value instanceof ArrayBuffer;
          }
          exports3.isArrayBuffer = isArrayBuffer;
          function isDataViewToString(value) {
            return ObjectToString(value) === "[object DataView]";
          }
          isDataViewToString.working = typeof ArrayBuffer < "u" && typeof DataView < "u" && isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1));
          function isDataView(value) {
            return typeof DataView > "u" ? !1 : isDataViewToString.working ? isDataViewToString(value) : value instanceof DataView;
          }
          exports3.isDataView = isDataView;
          var SharedArrayBufferCopy = typeof SharedArrayBuffer < "u" ? SharedArrayBuffer : void 0;
          function isSharedArrayBufferToString(value) {
            return ObjectToString(value) === "[object SharedArrayBuffer]";
          }
          function isSharedArrayBuffer(value) {
            return typeof SharedArrayBufferCopy > "u" ? !1 : (typeof isSharedArrayBufferToString.working > "u" && (isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy())), isSharedArrayBufferToString.working ? isSharedArrayBufferToString(value) : value instanceof SharedArrayBufferCopy);
          }
          exports3.isSharedArrayBuffer = isSharedArrayBuffer;
          function isAsyncFunction(value) {
            return ObjectToString(value) === "[object AsyncFunction]";
          }
          exports3.isAsyncFunction = isAsyncFunction;
          function isMapIterator(value) {
            return ObjectToString(value) === "[object Map Iterator]";
          }
          exports3.isMapIterator = isMapIterator;
          function isSetIterator(value) {
            return ObjectToString(value) === "[object Set Iterator]";
          }
          exports3.isSetIterator = isSetIterator;
          function isGeneratorObject(value) {
            return ObjectToString(value) === "[object Generator]";
          }
          exports3.isGeneratorObject = isGeneratorObject;
          function isWebAssemblyCompiledModule(value) {
            return ObjectToString(value) === "[object WebAssembly.Module]";
          }
          exports3.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;
          function isNumberObject(value) {
            return checkBoxedPrimitive(value, numberValue);
          }
          exports3.isNumberObject = isNumberObject;
          function isStringObject(value) {
            return checkBoxedPrimitive(value, stringValue);
          }
          exports3.isStringObject = isStringObject;
          function isBooleanObject(value) {
            return checkBoxedPrimitive(value, booleanValue);
          }
          exports3.isBooleanObject = isBooleanObject;
          function isBigIntObject(value) {
            return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
          }
          exports3.isBigIntObject = isBigIntObject;
          function isSymbolObject(value) {
            return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
          }
          exports3.isSymbolObject = isSymbolObject;
          function isBoxedPrimitive(value) {
            return isNumberObject(value) || isStringObject(value) || isBooleanObject(value) || isBigIntObject(value) || isSymbolObject(value);
          }
          exports3.isBoxedPrimitive = isBoxedPrimitive;
          function isAnyArrayBuffer(value) {
            return typeof Uint8Array < "u" && (isArrayBuffer(value) || isSharedArrayBuffer(value));
          }
          exports3.isAnyArrayBuffer = isAnyArrayBuffer, ["isProxy", "isExternal", "isModuleNamespaceObject"].forEach(function(method) {
            Object.defineProperty(exports3, method, {
              enumerable: !1,
              value: function() {
                throw new Error(method + " is not supported in userland");
              }
            });
          });
        }, { "is-arguments": 47, "is-generator-function": 49, "is-typed-array": 50, "which-typed-array": 85 }], 84: [function(require2, module3, exports3) {
          (function(process) {
            (function() {
              var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function(obj) {
                for (var keys = Object.keys(obj), descriptors = {}, i = 0; i < keys.length; i++)
                  descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
                return descriptors;
              }, formatRegExp = /%[sdj%]/g;
              exports3.format = function(f) {
                if (!isString(f)) {
                  for (var objects = [], i = 0; i < arguments.length; i++)
                    objects.push(inspect(arguments[i]));
                  return objects.join(" ");
                }
                for (var i = 1, args = arguments, len = args.length, str = String(f).replace(formatRegExp, function(x2) {
                  if (x2 === "%%") return "%";
                  if (i >= len) return x2;
                  switch (x2) {
                    case "%s":
                      return String(args[i++]);
                    case "%d":
                      return Number(args[i++]);
                    case "%j":
                      try {
                        return JSON.stringify(args[i++]);
                      } catch {
                        return "[Circular]";
                      }
                    default:
                      return x2;
                  }
                }), x = args[i]; i < len; x = args[++i])
                  isNull(x) || !isObject(x) ? str += " " + x : str += " " + inspect(x);
                return str;
              }, exports3.deprecate = function(fn, msg) {
                if (typeof process < "u" && process.noDeprecation === !0)
                  return fn;
                if (typeof process > "u")
                  return function() {
                    return exports3.deprecate(fn, msg).apply(this, arguments);
                  };
                var warned = !1;
                function deprecated() {
                  if (!warned) {
                    if (process.throwDeprecation)
                      throw new Error(msg);
                    process.traceDeprecation ? console.trace(msg) : console.error(msg), warned = !0;
                  }
                  return fn.apply(this, arguments);
                }
                return deprecated;
              };
              var debugs = {}, debugEnvRegex = /^$/;
              if (process.env.NODE_DEBUG) {
                var debugEnv = process.env.NODE_DEBUG;
                debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/,/g, "$|^").toUpperCase(), debugEnvRegex = new RegExp("^" + debugEnv + "$", "i");
              }
              exports3.debuglog = function(set) {
                if (set = set.toUpperCase(), !debugs[set])
                  if (debugEnvRegex.test(set)) {
                    var pid = process.pid;
                    debugs[set] = function() {
                      var msg = exports3.format.apply(exports3, arguments);
                      console.error("%s %d: %s", set, pid, msg);
                    };
                  } else
                    debugs[set] = function() {
                    };
                return debugs[set];
              };
              function inspect(obj, opts) {
                var ctx = {
                  seen: [],
                  stylize: stylizeNoColor
                };
                return arguments.length >= 3 && (ctx.depth = arguments[2]), arguments.length >= 4 && (ctx.colors = arguments[3]), isBoolean(opts) ? ctx.showHidden = opts : opts && exports3._extend(ctx, opts), isUndefined(ctx.showHidden) && (ctx.showHidden = !1), isUndefined(ctx.depth) && (ctx.depth = 2), isUndefined(ctx.colors) && (ctx.colors = !1), isUndefined(ctx.customInspect) && (ctx.customInspect = !0), ctx.colors && (ctx.stylize = stylizeWithColor), formatValue(ctx, obj, ctx.depth);
              }
              exports3.inspect = inspect, inspect.colors = {
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
              }, inspect.styles = {
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
              function stylizeWithColor(str, styleType) {
                var style = inspect.styles[styleType];
                return style ? "\x1B[" + inspect.colors[style][0] + "m" + str + "\x1B[" + inspect.colors[style][1] + "m" : str;
              }
              function stylizeNoColor(str, styleType) {
                return str;
              }
              function arrayToHash(array) {
                var hash = {};
                return array.forEach(function(val, idx) {
                  hash[val] = !0;
                }), hash;
              }
              function formatValue(ctx, value, recurseTimes) {
                if (ctx.customInspect && value && isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
                value.inspect !== exports3.inspect && // Also filter out any prototype objects using the circular check.
                !(value.constructor && value.constructor.prototype === value)) {
                  var ret = value.inspect(recurseTimes, ctx);
                  return isString(ret) || (ret = formatValue(ctx, ret, recurseTimes)), ret;
                }
                var primitive = formatPrimitive(ctx, value);
                if (primitive)
                  return primitive;
                var keys = Object.keys(value), visibleKeys = arrayToHash(keys);
                if (ctx.showHidden && (keys = Object.getOwnPropertyNames(value)), isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0))
                  return formatError(value);
                if (keys.length === 0) {
                  if (isFunction(value)) {
                    var name = value.name ? ": " + value.name : "";
                    return ctx.stylize("[Function" + name + "]", "special");
                  }
                  if (isRegExp(value))
                    return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
                  if (isDate(value))
                    return ctx.stylize(Date.prototype.toString.call(value), "date");
                  if (isError(value))
                    return formatError(value);
                }
                var base = "", array = !1, braces = ["{", "}"];
                if (isArray(value) && (array = !0, braces = ["[", "]"]), isFunction(value)) {
                  var n = value.name ? ": " + value.name : "";
                  base = " [Function" + n + "]";
                }
                if (isRegExp(value) && (base = " " + RegExp.prototype.toString.call(value)), isDate(value) && (base = " " + Date.prototype.toUTCString.call(value)), isError(value) && (base = " " + formatError(value)), keys.length === 0 && (!array || value.length == 0))
                  return braces[0] + base + braces[1];
                if (recurseTimes < 0)
                  return isRegExp(value) ? ctx.stylize(RegExp.prototype.toString.call(value), "regexp") : ctx.stylize("[Object]", "special");
                ctx.seen.push(value);
                var output;
                return array ? output = formatArray(ctx, value, recurseTimes, visibleKeys, keys) : output = keys.map(function(key) {
                  return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                }), ctx.seen.pop(), reduceToSingleString(output, base, braces);
              }
              function formatPrimitive(ctx, value) {
                if (isUndefined(value))
                  return ctx.stylize("undefined", "undefined");
                if (isString(value)) {
                  var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                  return ctx.stylize(simple, "string");
                }
                if (isNumber(value))
                  return ctx.stylize("" + value, "number");
                if (isBoolean(value))
                  return ctx.stylize("" + value, "boolean");
                if (isNull(value))
                  return ctx.stylize("null", "null");
              }
              function formatError(value) {
                return "[" + Error.prototype.toString.call(value) + "]";
              }
              function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                for (var output = [], i = 0, l = value.length; i < l; ++i)
                  hasOwnProperty(value, String(i)) ? output.push(formatProperty(
                    ctx,
                    value,
                    recurseTimes,
                    visibleKeys,
                    String(i),
                    !0
                  )) : output.push("");
                return keys.forEach(function(key) {
                  key.match(/^\d+$/) || output.push(formatProperty(
                    ctx,
                    value,
                    recurseTimes,
                    visibleKeys,
                    key,
                    !0
                  ));
                }), output;
              }
              function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                var name, str, desc;
                if (desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] }, desc.get ? desc.set ? str = ctx.stylize("[Getter/Setter]", "special") : str = ctx.stylize("[Getter]", "special") : desc.set && (str = ctx.stylize("[Setter]", "special")), hasOwnProperty(visibleKeys, key) || (name = "[" + key + "]"), str || (ctx.seen.indexOf(desc.value) < 0 ? (isNull(recurseTimes) ? str = formatValue(ctx, desc.value, null) : str = formatValue(ctx, desc.value, recurseTimes - 1), str.indexOf(`
`) > -1 && (array ? str = str.split(`
`).map(function(line) {
                  return "  " + line;
                }).join(`
`).slice(2) : str = `
` + str.split(`
`).map(function(line) {
                  return "   " + line;
                }).join(`
`))) : str = ctx.stylize("[Circular]", "special")), isUndefined(name)) {
                  if (array && key.match(/^\d+$/))
                    return str;
                  name = JSON.stringify("" + key), name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (name = name.slice(1, -1), name = ctx.stylize(name, "name")) : (name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), name = ctx.stylize(name, "string"));
                }
                return name + ": " + str;
              }
              function reduceToSingleString(output, base, braces) {
                var numLinesEst = 0, length = output.reduce(function(prev, cur) {
                  return numLinesEst++, cur.indexOf(`
`) >= 0 && numLinesEst++, prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
                }, 0);
                return length > 60 ? braces[0] + (base === "" ? "" : base + `
 `) + " " + output.join(`,
  `) + " " + braces[1] : braces[0] + base + " " + output.join(", ") + " " + braces[1];
              }
              exports3.types = require2("./support/types");
              function isArray(ar) {
                return Array.isArray(ar);
              }
              exports3.isArray = isArray;
              function isBoolean(arg) {
                return typeof arg == "boolean";
              }
              exports3.isBoolean = isBoolean;
              function isNull(arg) {
                return arg === null;
              }
              exports3.isNull = isNull;
              function isNullOrUndefined(arg) {
                return arg == null;
              }
              exports3.isNullOrUndefined = isNullOrUndefined;
              function isNumber(arg) {
                return typeof arg == "number";
              }
              exports3.isNumber = isNumber;
              function isString(arg) {
                return typeof arg == "string";
              }
              exports3.isString = isString;
              function isSymbol(arg) {
                return typeof arg == "symbol";
              }
              exports3.isSymbol = isSymbol;
              function isUndefined(arg) {
                return arg === void 0;
              }
              exports3.isUndefined = isUndefined;
              function isRegExp(re) {
                return isObject(re) && objectToString(re) === "[object RegExp]";
              }
              exports3.isRegExp = isRegExp, exports3.types.isRegExp = isRegExp;
              function isObject(arg) {
                return typeof arg == "object" && arg !== null;
              }
              exports3.isObject = isObject;
              function isDate(d) {
                return isObject(d) && objectToString(d) === "[object Date]";
              }
              exports3.isDate = isDate, exports3.types.isDate = isDate;
              function isError(e) {
                return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
              }
              exports3.isError = isError, exports3.types.isNativeError = isError;
              function isFunction(arg) {
                return typeof arg == "function";
              }
              exports3.isFunction = isFunction;
              function isPrimitive(arg) {
                return arg === null || typeof arg == "boolean" || typeof arg == "number" || typeof arg == "string" || typeof arg == "symbol" || // ES6 symbol
                typeof arg > "u";
              }
              exports3.isPrimitive = isPrimitive, exports3.isBuffer = require2("./support/isBuffer");
              function objectToString(o) {
                return Object.prototype.toString.call(o);
              }
              function pad(n) {
                return n < 10 ? "0" + n.toString(10) : n.toString(10);
              }
              var months = [
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
              function timestamp() {
                var d = /* @__PURE__ */ new Date(), time = [
                  pad(d.getHours()),
                  pad(d.getMinutes()),
                  pad(d.getSeconds())
                ].join(":");
                return [d.getDate(), months[d.getMonth()], time].join(" ");
              }
              exports3.log = function() {
                console.log("%s - %s", timestamp(), exports3.format.apply(exports3, arguments));
              }, exports3.inherits = require2("inherits"), exports3._extend = function(origin, add) {
                if (!add || !isObject(add)) return origin;
                for (var keys = Object.keys(add), i = keys.length; i--; )
                  origin[keys[i]] = add[keys[i]];
                return origin;
              };
              function hasOwnProperty(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop);
              }
              var kCustomPromisifiedSymbol = typeof Symbol < "u" ? Symbol("util.promisify.custom") : void 0;
              exports3.promisify = function(original) {
                if (typeof original != "function")
                  throw new TypeError('The "original" argument must be of type Function');
                if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
                  var fn = original[kCustomPromisifiedSymbol];
                  if (typeof fn != "function")
                    throw new TypeError('The "util.promisify.custom" argument must be of type Function');
                  return Object.defineProperty(fn, kCustomPromisifiedSymbol, {
                    value: fn,
                    enumerable: !1,
                    writable: !1,
                    configurable: !0
                  }), fn;
                }
                function fn() {
                  for (var promiseResolve, promiseReject, promise = new Promise(function(resolve, reject) {
                    promiseResolve = resolve, promiseReject = reject;
                  }), args = [], i = 0; i < arguments.length; i++)
                    args.push(arguments[i]);
                  args.push(function(err, value) {
                    err ? promiseReject(err) : promiseResolve(value);
                  });
                  try {
                    original.apply(this, args);
                  } catch (err) {
                    promiseReject(err);
                  }
                  return promise;
                }
                return Object.setPrototypeOf(fn, Object.getPrototypeOf(original)), kCustomPromisifiedSymbol && Object.defineProperty(fn, kCustomPromisifiedSymbol, {
                  value: fn,
                  enumerable: !1,
                  writable: !1,
                  configurable: !0
                }), Object.defineProperties(
                  fn,
                  getOwnPropertyDescriptors(original)
                );
              }, exports3.promisify.custom = kCustomPromisifiedSymbol;
              function callbackifyOnRejected(reason, cb) {
                if (!reason) {
                  var newReason = new Error("Promise was rejected with a falsy value");
                  newReason.reason = reason, reason = newReason;
                }
                return cb(reason);
              }
              function callbackify(original) {
                if (typeof original != "function")
                  throw new TypeError('The "original" argument must be of type Function');
                function callbackified() {
                  for (var args = [], i = 0; i < arguments.length; i++)
                    args.push(arguments[i]);
                  var maybeCb = args.pop();
                  if (typeof maybeCb != "function")
                    throw new TypeError("The last argument must be of type Function");
                  var self2 = this, cb = function() {
                    return maybeCb.apply(self2, arguments);
                  };
                  original.apply(this, args).then(
                    function(ret) {
                      process.nextTick(cb.bind(null, null, ret));
                    },
                    function(rej) {
                      process.nextTick(callbackifyOnRejected.bind(null, rej, cb));
                    }
                  );
                }
                return Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original)), Object.defineProperties(
                  callbackified,
                  getOwnPropertyDescriptors(original)
                ), callbackified;
              }
              exports3.callbackify = callbackify;
            }).call(this);
          }).call(this, require2("_process"));
        }, { "./support/isBuffer": 82, "./support/types": 83, _process: 63, inherits: 46 }], 85: [function(require2, module3, exports3) {
          (function(global2) {
            (function() {
              "use strict";
              var forEach = require2("for-each"), availableTypedArrays = require2("available-typed-arrays"), callBound = require2("call-bind/callBound"), gOPD = require2("gopd"), $toString = callBound("Object.prototype.toString"), hasToStringTag = require2("has-tostringtag/shams")(), g = typeof globalThis > "u" ? global2 : globalThis, typedArrays = availableTypedArrays(), $slice = callBound("String.prototype.slice"), toStrTags = {}, getPrototypeOf = Object.getPrototypeOf;
              hasToStringTag && gOPD && getPrototypeOf && forEach(typedArrays, function(typedArray) {
                if (typeof g[typedArray] == "function") {
                  var arr = new g[typedArray]();
                  if (Symbol.toStringTag in arr) {
                    var proto = getPrototypeOf(arr), descriptor = gOPD(proto, Symbol.toStringTag);
                    if (!descriptor) {
                      var superProto = getPrototypeOf(proto);
                      descriptor = gOPD(superProto, Symbol.toStringTag);
                    }
                    toStrTags[typedArray] = descriptor.get;
                  }
                }
              });
              var tryTypedArrays = function(value) {
                var foundName = !1;
                return forEach(toStrTags, function(getter, typedArray) {
                  if (!foundName)
                    try {
                      var name = getter.call(value);
                      name === typedArray && (foundName = name);
                    } catch {
                    }
                }), foundName;
              }, isTypedArray = require2("is-typed-array");
              module3.exports = function(value) {
                return isTypedArray(value) ? !hasToStringTag || !(Symbol.toStringTag in value) ? $slice($toString(value), 8, -1) : tryTypedArrays(value) : !1;
              };
            }).call(this);
          }).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
        }, { "available-typed-arrays": 27, "call-bind/callBound": 33, "for-each": 36, gopd: 40, "has-tostringtag/shams": 43, "is-typed-array": 50 }] }, {}, [20])(20);
      });
    }
  });

  // src/worker/file-processor.ts
  var pngjs = __toESM(require_browser(), 1);

  // lib/map-files.ts
  var PNG;
  function setPNG(png) {
    PNG = png;
  }
  var FILE_PROCESS_RULES = {
    "map_info.xml": {
      name: "map_info.xml",
      process: copy
    },
    "biomes.png": {
      name: "biomes.png",
      process: repackPng
    },
    "splat3.png": {
      name: "splat3.png",
      process: processSplat3Png
    },
    "splat3_processed.png": {
      name: "splat3.png",
      process: processSplat3Png
    },
    "splat4.png": {
      name: "splat4.png",
      process: processSplat4Png
    },
    "splat4_processed.png": {
      name: "splat4.png",
      process: processSplat4Png
    },
    "radiation.png": {
      name: "radiation.png",
      process: processRadiationPng
    },
    "prefabs.xml": {
      name: "prefabs.xml",
      process: copy
    },
    "dtm.raw": {
      name: "dtm_block.raw.gz",
      process: (i, o) => i.pipeThrough(new DtmRawTransformer()).pipeTo(o)
    }
  }, MAP_FILE_NAME_MAP = Object.fromEntries(Object.entries(FILE_PROCESS_RULES).map(([k, v]) => [k, v.name])), Processor = class {
    #worldFileName;
    constructor(worldFileName) {
      this.#worldFileName = worldFileName;
    }
    get mapFileName() {
      return FILE_PROCESS_RULES[this.#worldFileName].name;
    }
    async process(src, dst) {
      await FILE_PROCESS_RULES[this.#worldFileName].process(src, dst);
    }
  }, WORLD_FILE_NAMES = new Set(Object.keys(FILE_PROCESS_RULES));
  var MAP_FILE_NAMES = new Set(Object.values(FILE_PROCESS_RULES).map((v) => v.name));
  function copy(i, o) {
    return i.pipeTo(o);
  }
  function repackPng(i, o) {
    return i.pipeThrough(new RepackPngTransformer()).pipeTo(o);
  }
  function processSplat3Png(i, o) {
    return i.pipeThrough(new Splat3PngTransformer()).pipeTo(o);
  }
  function processSplat4Png(i, o) {
    return i.pipeThrough(new Splat4PngTransformer()).pipeTo(o);
  }
  function processRadiationPng(i, o) {
    return i.pipeThrough(new RadiationPngTransformer()).pipeTo(o);
  }
  var DEFAULT_TRASNFORM_STRATEGY = { highWaterMark: 1024 * 1024 }, DEFAULT_TRASNFORM_STRATEGIES = [DEFAULT_TRASNFORM_STRATEGY, DEFAULT_TRASNFORM_STRATEGY], ComposingTransformer = class {
    readable;
    writable;
    constructor(transformStreams) {
      let { readable, writable } = new TransformStream({}, ...DEFAULT_TRASNFORM_STRATEGIES);
      this.readable = transformStreams.reduce((r, t) => r.pipeThrough(t), readable), this.writable = writable;
    }
  }, OddByteTransformer = class extends TransformStream {
    constructor() {
      let nextOffset = 1;
      super(
        {
          transform(chunk, controller) {
            let buffer = new Uint8Array(
              chunk.length % 2 === 0 ? chunk.length / 2 : nextOffset === 1 ? (chunk.length - 1) / 2 : (chunk.length + 1) / 2
            ), i = nextOffset;
            for (; i < chunk.length; i += 2)
              buffer[(i - nextOffset) / 2] = chunk[i];
            nextOffset = i - chunk.length, controller.enqueue(buffer);
          }
        },
        ...DEFAULT_TRASNFORM_STRATEGIES
      );
    }
  }, DtmRawTransformer = class extends ComposingTransformer {
    constructor() {
      super([new OddByteTransformer(), new CompressionStream("gzip")]);
    }
  }, DtmBlockRawDecompressor = class extends DecompressionStream {
    constructor() {
      super("gzip");
    }
  }, PngEditingTransfomer = class extends TransformStream {
    constructor(copyAndEdit) {
      let png = new PNG({ deflateLevel: 9, deflateStrategy: 0 }), { promise: flushPromise, resolve, reject } = Promise.withResolvers();
      super(
        {
          start(controller) {
            png.on("parsed", () => {
              packPng(png, copyAndEdit, controller).then(resolve).catch((e) => {
                reject(e);
              });
            });
          },
          transform(chunk) {
            png.write(chunk);
          },
          flush() {
            return flushPromise;
          }
        },
        ...DEFAULT_TRASNFORM_STRATEGIES
      );
    }
  };
  async function packPng(png, copyAndEdit, controller) {
    if (globalThis.OffscreenCanvas) {
      let canvas = new OffscreenCanvas(png.width, png.height), ctx = canvas.getContext("2d"), imageData = ctx.createImageData(png.width, png.height);
      copyAndEdit(png.data, imageData.data), ctx.putImageData(imageData, 0, 0);
      let blob = await canvas.convertToBlob({ type: "image/png" });
      for await (let chunk of blob.stream()) controller.enqueue(chunk);
    } else
      return copyAndEdit(png.data, png.data), new Promise((resolve, reject) => {
        png.pack().on("data", (chunk) => {
          controller.enqueue(chunk);
        }).on("error", reject).on("end", resolve);
      });
  }
  var Splat3PngTransformer = class extends PngEditingTransfomer {
    constructor() {
      super((src, dst) => {
        for (let i = 0; i < dst.length; i += 4)
          src[i] === 0 && src[i + 1] === 0 && src[i + 2] === 0 ? (dst[i] = 0, dst[i + 1] = 0, dst[i + 2] = 0, dst[i + 3] = 0) : (dst[i] = src[i], dst[i + 1] = src[i + 1], dst[i + 2] = src[i + 2], dst[i + 3] = 255);
      });
    }
  }, Splat4PngTransformer = class extends PngEditingTransfomer {
    constructor() {
      super((src, dst) => {
        for (let i = 0; i < src.length; i += 4)
          src[i] === 0 && src[i + 1] === 0 && src[i + 2] === 0 ? (dst[i] = 0, dst[i + 1] = 0, dst[i + 2] = 0, dst[i + 3] = 0) : src[i + 1] === 255 || src[i + 2] === 29 ? (dst[i] = src[i], dst[i + 1] = src[i + 2], dst[i + 2] = 255, dst[i + 3] = 255) : (dst[i] = src[i], dst[i + 1] = src[i + 1], dst[i + 2] = src[i + 2], dst[i + 3] = 255);
      });
    }
  }, RadiationPngTransformer = class extends PngEditingTransfomer {
    constructor() {
      super((src, dst) => {
        for (let i = 0; i < src.length; i += 4)
          src[i] === 0 && src[i + 1] === 0 && src[i + 2] === 0 ? (dst[i] = 0, dst[i + 1] = 0, dst[i + 2] = 0, dst[i + 3] = 0) : (dst[i] = src[i], dst[i + 1] = src[i + 1], dst[i + 2] = src[i + 2], dst[i + 3] = 255);
      });
    }
  }, RepackPngTransformer = class extends PngEditingTransfomer {
    constructor() {
      super((src, dst) => {
        for (let i = 0; i < src.length; i++)
          dst[i] = src[i];
      });
    }
  };

  // src/lib/storage.ts
  var WORKSPACE_DIR = "workspace";
  async function workspaceDir() {
    let root = await navigator.storage.getDirectory();
    return new MapDir(await root.getDirectoryHandle(WORKSPACE_DIR, { create: !0 }));
  }
  var MapDir = class {
    #dir;
    constructor(dir) {
      this.#dir = dir;
    }
    get name() {
      return this.#dir.name;
    }
    async put(name, data) {
      console.debug("put", name);
      let writable = await (await this.#dir.getFileHandle(name, { create: !0 })).createWritable();
      data instanceof ArrayBuffer || data instanceof Blob ? await writable.write(data) : await data.pipeTo(writable), await writable.close();
    }
    async createWritable(name) {
      return await (await this.#dir.getFileHandle(name, { create: !0 })).createWritable();
    }
    async get(name) {
      console.debug("get", name);
      try {
        return await (await this.#dir.getFileHandle(name)).getFile();
      } catch (e) {
        if (e instanceof DOMException && e.name === "NotFoundError")
          return null;
        throw e;
      }
    }
    async size(name) {
      return (await (await this.#dir.getFileHandle(name)).getFile()).size;
    }
    async remove(name) {
      await this.#dir.removeEntry(name);
    }
  };

  // src/worker/file-processor.ts
  setPNG(pngjs.PNG);
  onmessage = async (event) => {
    let out = await main(event.data).catch((e) => ({ error: String(e) }));
    postMessage(out);
  };
  async function main(inMessage) {
    let blob;
    if ("blob" in inMessage)
      blob = inMessage.blob;
    else if ("url" in inMessage) {
      let response = await fetch(inMessage.url);
      if (!response.ok) throw Error(`Failed to fetch ${inMessage.url}: ${response.statusText}`);
      blob = await response.blob();
    } else
      throw Error(`Unexpected message: ${JSON.stringify(inMessage)}`);
    let processor = new Processor(inMessage.name), outName = processor.mapFileName, workspace = await workspaceDir();
    return await processor.process(blob.stream(), await workspace.createWritable(outName)), { name: outName, size: await workspace.size(outName) };
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
