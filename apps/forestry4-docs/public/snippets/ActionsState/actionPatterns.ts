// Action Patterns in Forestry 4.1.x

// 1. BASIC STATE UPDATES using mutate()
increment() {
  this.mutate((draft) => {
    const newCount = draft.count + draft.multiplier;
    draft.count = newCount;
    draft.history.push(`Incremented to ${newCount}`);
  });
}

// 2. SINGLE FIELD UPDATES using set()
setMultiplier(multiplier: number) {
  this.set('multiplier', multiplier);
}

// 3. COMPLEX TRANSFORMATIONS using mutate()
doubleAndLog() {
  this.mutate((draft) => {
    const originalCount = draft.count;
    draft.count = originalCount * 2;
    draft.history.push(`Doubled from ${originalCount} to ${draft.count}`);
  });
}

// 4. CALLING OTHER ACTIONS via $ binding
incrementTwice() {
  this.$.increment();  // Call increment action
  this.$.increment();  // Call it again
}

// 5. COMPLETE STATE REPLACEMENT using next()
reset() {
  this.next({ 
    count: 0, 
    history: ['Reset to 0'], 
    multiplier: 1, 
    qualityMessage: '' 
  });
}

// 6. ARRAY MANIPULATION using mutate()
clearHistory() {
  this.mutate((draft) => {
    draft.history.length = 0; // Clear array in place
  });
}

addHistoryEntry(entry: string) {
  this.mutate((draft) => {
    draft.history.push(entry);
  });
}

// 7. CONDITIONAL LOGIC in actions
conditionalIncrement() {
  if (this.value.count < 100) {
    this.$.increment();
  } else {
    this.mutate((draft) => {
      draft.qualityMessage = 'Cannot increment beyond 100';
    });
  }
}

// 8. ACCESSING CURRENT STATE via this.value
getCurrentStatus() {
  const { count, multiplier } = this.value;
  return `Count: ${count}, Multiplier: ${multiplier}`;
}

// 9. VALIDATION AND QUALITY FEEDBACK via prep()
prep(input: Partial<CounterState>, current: CounterState): CounterState {
  const result = { ...current, ...input };

  // Quality feedback for user input (not blocking validation)
  let qualityMessage = '';
  if (result.count < -100) {
    qualityMessage = 'Count is getting very low';
  } else if (result.count > 100) {
    qualityMessage = 'Count is getting very high';
  } else if (result.multiplier < 1) {
    qualityMessage = 'Multiplier works best at 1 or higher';
  }

  return { ...result, qualityMessage };
}
