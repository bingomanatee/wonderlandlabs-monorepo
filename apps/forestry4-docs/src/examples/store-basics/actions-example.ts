// Modern Forestry 4.1.x class methods (not actions object)
setName(name: string) {
  this.mutate(draft => {
    draft.name = name;
  });
}
