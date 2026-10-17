export declare const modelSocketStatus: {
    readonly connected: "connected";
    readonly connecting: "connecting";
    readonly disconnected: "disconnected";
    readonly error: "error";
    readonly idle: "idle";
    readonly validated: "validated";
};
export declare const dataCoreDefaults: {
    readonly managerName: "DataManager";
    readonly identity: "id";
};
export declare const dataCoreErrors: {
    readonly invalidIdentity: "Model identity must be a string or finite number";
    readonly missingIdentity: "Model schema is missing the identity property";
    readonly schemaKeyOf: "Use the schema identity property instead of keyOf";
    readonly mismatchedIdentity: "Record identity does not match its collection key";
    readonly changedIdentity: "Updates cannot change a record identity";
    readonly dataSourceFailed: "Data source failed";
    readonly duplicateCollection: (name: string) => string;
    readonly missingItemId: (storeName: string) => string;
};
//# sourceMappingURL=constants.d.ts.map