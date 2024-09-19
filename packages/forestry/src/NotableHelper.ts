import type { InfoParams, NotesMap } from './types/types.shared';

export class NotableHelper {
  static addNote(
    time: number,
    notes: NotesMap,
    message: string,
    params?: InfoParams,
    tree?: string
  ) {
    const info = { message, params, time: time, tree };
    if (!notes) {
      notes = new Map([ [ time, [ info ] ] ]);
    } else if (!notes.has(time)) {
      notes.set(time, [ info ]);
    } else {
      notes.get(time).push(info);
    }
  }
  static notes(notes: NotesMap, fromTime: number, toTime: number = 0) {
    if (toTime < fromTime) {
      return notes.get(fromTime) || [];
    }
    const out = [];
    const validKeys = Array.from(notes.keys()).filter(
      (t: number) => t >= fromTime && t <= toTime
    );
    for (const t of validKeys) {
      out.push(notes?.get(t));
    }
    return out.filter(Boolean).flat();
  }
}
