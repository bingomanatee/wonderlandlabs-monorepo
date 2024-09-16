import type { InfoParams, NotesMap } from './types/types.shared';
export declare const canProxy: boolean;
export declare class NotableHelper {
    static addNote(time: number, notes: NotesMap, message: string, params?: InfoParams, tree?: string): void;
    static notes(notes: NotesMap, fromTime: number, toTime?: number): any[];
}
