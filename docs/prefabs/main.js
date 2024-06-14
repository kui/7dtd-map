(()=>{"use strict";var e={725:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.LabelHandler=void 0;const a=n(273);t.LabelHandler=class{constructor(e,t){this.listener=[],this.doms=e,this.buildSelectOptions(t),this.doms.language.addEventListener("change",(()=>{this.listener.map((e=>e(this.doms.language.value)))}))}buildSelectOptions(e){const t=new Set(Array.from(this.doms.language.options).map((e=>e.value)));for(const e of a.LANGUAGES){if(t.has(e))continue;const n=document.createElement("option");n.textContent=e,this.doms.language.appendChild(n)}const n=(0,a.resolveLanguage)(e);this.doms.language.value!==n&&(this.doms.language.value=(0,a.resolveLanguage)(e),requestAnimationFrame((()=>this.doms.language.dispatchEvent(new Event("change")))))}addListener(e){this.listener.push(e)}}},273:function(e,t){var n,a,o,s=this&&this.__classPrivateFieldSet||function(e,t,n,a,o){if("m"===a)throw new TypeError("Private method is not writable");if("a"===a&&!o)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!o:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===a?o.call(e,n):o?o.value=n:t.set(e,n),n},r=this&&this.__classPrivateFieldGet||function(e,t,n,a){if("a"===n&&!a)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!a:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===n?a:"a"===n?a.call(e):a?a.value:t.get(e)};Object.defineProperty(t,"__esModule",{value:!0}),t.resolveLanguage=t.Labels=t.LabelHolder=t.LANGUAGES=void 0,t.LANGUAGES=["english","german","spanish","french","italian","japanese","koreana","polish","brazilian","russian","turkish","schinese","tchinese"];const i={en:"english",de:"german",es:"spanish",fr:"french",it:"italian",ja:"japanese",ko:"koreana",pl:"polish",pt:"brazilian",ru:"russian",tr:"turkish","zh-CN":"schinese","zh-TW":"tchinese"};class l{constructor(e,t){n.set(this,void 0),a.set(this,void 0),o.set(this,void 0),this.baseUrl=e,s(this,n,u(t),"f"),this.defaultBlocks=this.fetchLabelMap(l.DEFAULT_LANGUAGE,"blocks.json"),this.defaultPrefabs=this.fetchLabelMap(l.DEFAULT_LANGUAGE,"prefabs.json"),s(this,a,this.buildLabels(this.defaultBlocks,"blocks.json"),"f"),s(this,o,this.buildLabels(this.defaultPrefabs,"prefabs.json"),"f")}get blocks(){return r(this,a,"f")}get prefabs(){return r(this,o,"f")}set language(e){e!==r(this,n,"f")&&(console.log("LabelHolder set language: %s -> %s",r(this,n,"f"),e),s(this,n,e,"f"),s(this,a,this.buildLabels(this.defaultBlocks,"blocks.json"),"f"),s(this,o,this.buildLabels(this.defaultPrefabs,"prefabs.json"),"f"))}async buildLabels(e,t){return new c(await this.fetchLabelMap(r(this,n,"f"),t),await e)}async fetchLabelMap(e,t){return new Map(Object.entries(await async function(e){return(await fetch(e)).json()}(`${this.baseUrl}/${e}/${t}`)))}}t.LabelHolder=l,n=new WeakMap,a=new WeakMap,o=new WeakMap,l.DEFAULT_LANGUAGE="english";class c{constructor(e,t){this.labels=e,this.defaultLabels=t}get(e){return this.labels.get(e)??this.defaultLabels.get(e)}}function u(e){for(const t of e)for(const[e,n]of Object.entries(i))if(t.startsWith(e))return n;return l.DEFAULT_LANGUAGE}t.Labels=c,t.resolveLanguage=u},726:(e,t)=>{function n(e,t=(()=>`Unexpected state: ${e}`)){if(null!=e)return e;throw Error(t())}function a(e,t,n=(()=>`Unexpected type: ${e}`)){if(e instanceof t)return e;throw Error(n())}function o(e){return{type:"game",...e}}function s(e,t,n){const a=e.offsetX*t.width/n.width,s=e.offsetY*t.height/n.height;if(a<0||a>=t.width||s<0||s>=t.height)return null;const r=a-Math.floor(t.width/2),i=Math.floor(t.height/2)-s;return o({x:Math.round(r),z:Math.round(i)})}Object.defineProperty(t,"__esModule",{value:!0}),t.threePlaneSize=t.canvasEventToGameCoords=t.gameCoords=t.gameMapSize=t.sleep=t.imageBitmapToPngBlob=t.downloadCanvasPng=t.formatCoords=t.waitAnimationFrame=t.humanreadableDistance=t.removeAllChildren=t.component=t.requireType=t.requireNonnull=void 0,t.requireNonnull=n,t.requireType=a,t.component=function(e,t){const o=n(document.getElementById(n(e,(()=>`Element ID must not null: ${e}`))),(()=>`Element not found: #${e}`));return t?a(o,t):o},t.removeAllChildren=function(e){for(;e.lastChild;)e.removeChild(e.lastChild)},t.humanreadableDistance=function(e){return e<1e3?`${e}m`:`${(e/1e3).toFixed(2)}km`},t.waitAnimationFrame=function(){return new Promise((e=>requestAnimationFrame(e)))},t.formatCoords=function(e,t,n,a){if(!a)return"E/W: -, N/S: -, Elev: -";const o=s(a,e,t);if(null===o)return"E/W: -, N/S: -, Elev: -";const r=n(o,e)??"-";return`E/W: ${o.x}, N/S: ${o.z}, Elev: ${r}`},t.downloadCanvasPng=function(e,t){const n=document.createElement("a");n.download=e,n.href=t.toDataURL("image/png"),n.click()},t.imageBitmapToPngBlob=async function(e){const t=new OffscreenCanvas(e.height,e.width);return n(t.getContext("2d")).drawImage(e,0,0),await t.convertToBlob({type:"image/png"})},t.sleep=async function(e){return new Promise((t=>setTimeout(t,e)))},t.gameMapSize=function(e){return{type:"game",...e}},t.gameCoords=o,t.canvasEventToGameCoords=s,t.threePlaneSize=function(e,t){return{type:"threePlane",width:e,height:t}}}},t={};function n(a){var o=t[a];if(void 0!==o)return o.exports;var s=t[a]={exports:{}};return e[a].call(s.exports,s,s.exports,n),s.exports}(()=>{const e=n(725),t=n(273),a=n(726);function o(){const n=new t.LabelHolder("../labels",navigator.languages);new e.LabelHandler({language:(0,a.component)("label_lang",HTMLSelectElement)},navigator.languages).addListener((async e=>{n.language=e,function(e){const t=document.querySelector(".prefab_name")?.textContent?.trim();if(!t)return;const n=document.querySelector(".prefab_label");n&&(n.textContent=e.get(t)??"-")}(await n.prefabs),function(e){for(const t of(0,a.component)("blocks",HTMLElement).querySelectorAll(".block")){const n=t.querySelector(".block_name")?.textContent?.trim();if(!n)continue;const a=t.querySelector(".block_label");a&&(a.textContent=e.get(n)??"-")}}(await n.blocks)}))}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",o):o()})()})();
//# sourceMappingURL=main.js.map