Object.defineProperty(exports,"__esModule",{value:!0});let Branch_1=require("./Branch"),rxjs_1=require("rxjs"),UNINITIALIZED=Symbol("tree has no value");class Tree{constructor(t,r,e){this.forest=t,this.name=r,(this.params=e)&&"initial"in e&&(t=e["initial"],void 0!==t)&&(this.root=new Branch_1.Branch(this,{next:t}),this.top=this.root),this.stream=new rxjs_1.BehaviorSubject(this.top)}next(t){this.grow({next:t})}rollback(r,e){if(this.top&&!(this.top.time<r)){let t=this.top;for(;t.prev&&t.prev.time>=r;)t=t.prev;e={time:r,error:e,branch:t},e=(this.offshoots||(this.offshoots=[]),this.offshoots.push(e),t.prev);(this.top=e)?e.next=void 0:(this.root=void 0,this.top=void 0)}}grow(e){return this.forest.do(()=>{var t=new Branch_1.Branch(this,e);if(this.top?this.top.linkTo(t):this.root=t,this.top=t,this.params?.validator){var r=this.params.validator(t.value,this);if(r)throw r}return this.stream.next(this.top),t})}subscribe(t){return this.stream.pipe((0,rxjs_1.filter)(t=>!!t),(0,rxjs_1.map)(t=>t.value)).subscribe(t)}get value(){if(this.top)return this.top.value;throw new Error("cannot get the value from an empty tree")}}exports.default=Tree;