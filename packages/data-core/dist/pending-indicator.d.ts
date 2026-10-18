export interface PendingIndicatorOptions {
    /** Multiplier of the original 64px icon. Defaults to 0.5 (32px). */
    scale?: number;
    /** Revolutions per second. Defaults to 1; zero pauses rotation. */
    speed?: number;
    /** Base hue in degrees, normalized to 0–360. Defaults to 64. */
    hue?: number;
}
/** Create in a browser; importing this module does not require a DOM. */
export declare function createPendingIndicator(options?: PendingIndicatorOptions): {
    /** Count unique unsaved records, including failed saves. Zero hides. */
    setPending(unsavedRecords: number): void;
    configure(next: PendingIndicatorOptions): void;
    /** Remove the element. Later calls do nothing. */
    destroy(): void;
};
export { showPendingNotice } from './pending-notice.js';
export type { PendingNoticeOptions } from './pending-notice.js';
//# sourceMappingURL=pending-indicator.d.ts.map