var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.Forest=void 0;let Tree_1=__importDefault(require("./Tree"));class Forest{constructor(){this.trees=new Map,this._time=0}hasTree(e){return this.trees.has(e)}tree(e){if(this.hasTree(e))return this.trees.get(e)}addTree(e,t){if(this.hasTree(e))throw new Error("cannot redefine tree "+e);t=new Tree_1.default(this,e,t);return this.trees.set(e,t),t}get nextTime(){var e=this._time+1;return this._time=e}do(e){let r=this.nextTime;try{return e(this)}catch(t){throw this.trees.forEach(e=>{e.rollback(r,t instanceof Error?t.message:"unknown error")}),t}}}exports.Forest=Forest;