type ActsInput<Acts> = {
  [K in keyof Acts]: (this: ActorIF<Acts>, ...args: any[]) => any;
};

type ActsDo<Acts> = {
  [K in keyof Acts]: OmitThisParameter<Acts[K]>;
};

interface ActorIF<Acts> {
  do: ActsDo<Acts>;
}

function createDo<Acts extends ActsInput<Acts>>(
  actor: ActorIF<Acts>,
  actions: Acts
): ActsDo<Acts> {
  const doObj = {} as ActsDo<Acts>;
  for (const key in actions) {
    const action = actions[key];
    (doObj as any)[key] = action.bind(actor);
  }
  return doObj;
}

class Actor<Acts extends ActsInput<Acts>> implements ActorIF<Acts> {
  public do: ActsDo<Acts>;

  constructor(public actions: Acts) {
    this.do = createDo(this, actions);
  }
}

// Example usage
const f = new Actor({
  alpha(this: ActorIF<any>, input: number) {
    return 2 * input;
  },
  bar(this: ActorIF<any>) {
    return 'foo';
  },
});

const b = f.do.bar();      // b is inferred as number
const c = f.do.alpha(2);   // c is inferred as number

console.log(b); // Output: 33
console.log(c); // Output: 4
