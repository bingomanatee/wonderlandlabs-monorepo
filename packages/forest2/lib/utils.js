"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotableHelper = exports.canProxy = void 0;
exports.canProxy = typeof Proxy === 'function';
class NotableHelper {
    static addNote(time, notes, message, params, tree) {
        const info = { message, params, time: time, tree };
        if (!notes) {
            notes = new Map([[time, [info]]]);
        }
        else if (!notes.has(time)) {
            notes.set(time, [info]);
        }
        else {
            notes.get(time).push(info);
        }
    }
    static notes(notes, fromTime, toTime = 0) {
        if (toTime < fromTime) {
            return notes.get(fromTime) || [];
        }
        const out = [];
        const validKeys = Array.from(notes.keys()).filter((t) => t >= fromTime && t <= toTime);
        for (const t of validKeys) {
            out.push(notes?.get(t));
        }
        return out.filter(Boolean).flat();
    }
}
exports.NotableHelper = NotableHelper;
