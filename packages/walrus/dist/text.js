const addBefore = (phrase, prefix, loose = false) => {
  if (phrase.startsWith(prefix)) {
    return phrase;
  }
  if (loose) {
    const r = new RegExp("^" + prefix, "i");
    if (r.test(phrase)) {
      return phrase.replace(r, prefix);
    }
  }
  return `${prefix}${phrase}`;
};
const addAfter = (phrase, suffix, loose = false) => {
  if (phrase.endsWith(suffix)) {
    return phrase;
  }
  if (loose) {
    const r = new RegExp(suffix + "$", "i");
    if (r.test(phrase)) {
      return phrase.replace(r, suffix);
    }
  }
  return `${phrase}${suffix}`;
};
const humanize = (phrase) => {
  return phrase.replace(/[ _-]+/g, "");
};
const letter = /[a-z]/i;
const capFirst = (phrase) => {
  if (!letter.test(phrase)) return phrase;
  const m = letter.exec(phrase);
  if (!m) return phrase;
  const [firstLetter] = m;
  return phrase.replace(firstLetter, firstLetter.toUpperCase());
};
const entitle = (phrase) => {
  return humanize(phrase).split(" ").map(capFirst).join(" ");
};
export {
  addAfter,
  addBefore,
  capFirst,
  entitle,
  humanize
};
//# sourceMappingURL=text.js.map
