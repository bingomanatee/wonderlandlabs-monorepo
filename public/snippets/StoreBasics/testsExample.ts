tests: (candidateValue) => {
  if (candidateValue.age < 0) return 'Invalid age';
  return null; // Valid; 
  // you don't actually have to return ANYTHING for valid candidates
}
