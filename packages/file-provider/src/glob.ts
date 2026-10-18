export function globMatch(globString: string, path: string) {
  return globToRegExp(globString).test(path)
}

export function globToRegExp(globString: string) {
  const escaped = globString
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*')

  return new RegExp(`^${escaped}$`)
}
