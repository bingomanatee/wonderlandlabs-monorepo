export function globMatch(globString, path) {
    return globToRegExp(globString).test(path);
}
export function globToRegExp(globString) {
    const escaped = globString
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '\u0000')
        .replace(/\*/g, '[^/]*')
        .replace(/\u0000/g, '.*');
    return new RegExp(`^${escaped}$`);
}
