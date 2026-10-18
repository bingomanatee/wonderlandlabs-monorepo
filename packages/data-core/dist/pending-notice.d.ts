export interface PendingNoticeOptions {
    /** localStorage key used to remember “don’t show again” for this site. */
    storageKey?: string;
}
/** Explain the pending icon. Returns a function that removes this notice. */
export declare function showPendingNotice(options?: PendingNoticeOptions): () => void;
//# sourceMappingURL=pending-notice.d.ts.map