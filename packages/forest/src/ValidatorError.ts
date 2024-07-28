import { MutationValidatorIF, TreeValidator } from "./types";

export class ValidatorError extends Error {
  constructor(
    err: Error | string | unknown,
    val: TreeValidator | MutationValidatorIF,
    mutation?: string
  ) {
    if (err instanceof Error) {
      super(err.message);
    } else if (typeof err === "string") {
      super(err);
    } else {
      super("validation errror");
    }
    this.name = val.name || "validator";
    if (mutation) this.mutation = mutation;
  }
  public readonly name: string;
  public mutation?: string;
}
