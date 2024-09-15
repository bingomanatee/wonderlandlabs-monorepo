"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entitle =
  exports.capFirst =
  exports.humanize =
  exports.addAfter =
  exports.addBefore =
    void 0;
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
exports.addBefore = addBefore;
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
exports.addAfter = addAfter;
/**
 * turn database / snake case strings in to sentence form
 * @param phrase
 */
const humanize = (phrase) => {
  return phrase.replace(/[ _-]+/g, "");
};
exports.humanize = humanize;
const letter = /[a-z]/i;
const capFirst = (phrase) => {
  if (!letter.test(phrase)) return phrase;
  const m = letter.exec(phrase);
  if (!m) return phrase;
  const [firstLetter] = m;
  return phrase.replace(firstLetter, firstLetter.toUpperCase());
};
exports.capFirst = capFirst;
const entitle = (phrase) => {
  return (0, exports.humanize)(phrase)
    .split(" ")
    .map(exports.capFirst)
    .join(" ");
};
exports.entitle = entitle;
