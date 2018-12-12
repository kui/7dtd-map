!function(t){var e={};function i(s){if(e[s])return e[s].exports;var a=e[s]={i:s,l:!1,exports:{}};return t[s].call(a.exports,a,a.exports,i),a.l=!0,a.exports}i.m=t,i.c=e,i.d=function(t,e,s){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(i.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)i.d(s,a,function(e){return t[e]}.bind(null,a));return s},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=43)}({43:function(t,e,i){"use strict";i.r(e);const s="✘",a="🚩️";class h{constructor(t,e){this.window=t,this.canvas=e,this.showBiomes=!0,this.showSplat3=!0,this.showRad=!0,this.showPrefabs=!0,this.biomesImg=null,this.splat3Img=null,this.radImg=null,this.brightness="100%",this.scale="0.1",this.signSize=200,this.prefabs=[];const i=new t.FontFace("Noto Sans","url(NotoEmoji-Regular.ttf)");i.load().then(e=>t.fonts.add(e)),this.fontFace=i.load(),this.markCoords={},this.updateRequest=null,this.updatePromise=null}get width(){return Math.max(this.biomesImg?this.biomesImg.width:0,this.splat3Img?this.splat3Img.width:0)}get height(){return Math.max(this.biomesImg?this.biomesImg.height:0,this.splat3Img?this.splat3Img.height:0)}async update(){if(!this.updateRequest&&(this.updateRequest=!0,!this.updatePromise))for(;this.updateRequest;)this.updateRequest=!1,this.updatePromise=this.updateImmediately(),await this.updatePromise,await n(this.window),this.updatePromise=null}async updateImmediately(){this.canvas.width=this.width*this.scale,this.canvas.height=this.height*this.scale;const t=this.canvas.getContext("2d");t.scale(this.scale,this.scale),t.filter=`brightness(${this.brightness})`,this.biomesImg&&this.showBiomes&&t.drawImage(this.biomesImg,0,0,this.width,this.height),this.splat3Img&&this.showSplat3&&t.drawImage(this.splat3Img,0,0,this.width,this.height),t.filter="none",this.radImg&&this.showRad&&(t.imageSmoothingEnabled=!1,t.drawImage(this.radImg,0,0,this.width,this.height),t.imageSmoothingEnabled=!0),this.showPrefabs&&await async function(t,e){e.font=`${t.signSize}px ${(await t.fontFace).family}`,e.fillStyle="red",e.textAlign="center",e.textBaseline="middle";const i=t.width/2,a=t.height/2,h=Math.round(.01*t.signSize),n=Math.round(.05*t.signSize);t.prefabs.forEach(r=>{const l=i+r.x+h,d=a-r.y+n;o({ctx:e,text:s,x:l,y:d,textSize:t.signSize})})}(this,t),this.markCoords&&this.markCoords.x&&this.markCoords.y&&await async function(t,e){e.font=`${t.signSize}px ${(await t.fontFace).family}`,e.fillStyle="red",e.textAlign="left",e.textBaseline="alphabetic";const i=t.width/2,s=t.height/2,h=-1*Math.round(.32*t.signSize),n=-1*Math.round(.1*t.signSize),r=i+t.markCoords.x+h,l=s-t.markCoords.y+n;o({ctx:e,text:a,x:r,y:l,textSize:t.signSize}),e.strokeText(a,r,l),e.fillText(a,r,l)}(this,t),this.updateRequest=null,console.log("update")}}function n(t){return new Promise(e=>t.requestAnimationFrame(e))}function o({ctx:t,text:e,x:i,y:s,textSize:a}){t.lineWidth=Math.round(.2*a),t.strokeStyle="rgba(0, 0, 0, 0.8)",t.strokeText(e,i,s),t.lineWidth=Math.round(.1*a),t.strokeStyle="white",t.strokeText(e,i,s),t.fillText(e,i,s)}const r=new Set(["biomesImg","splat3Img","radImg","showBiomes","showSplat3","showRad","showPrefabs","brightness","scale","signSize","prefabs","signChar","markChar","markCoords"]);let l;onmessage=(t=>{const{canvas:e,...i}=t.data;e&&(l?l.canvas=e:l=new h(self,e)),Object.keys(i).forEach(t=>{r.has(t)&&(l[t]=i[t])}),postMessage({mapSizes:{width:l.width,height:l.height}}),l.update()})}});