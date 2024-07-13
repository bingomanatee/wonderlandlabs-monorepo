import { A } from "@svgdotjs/svg.js";
import {
  ActionIF,
  ActionMap,
  DataEngineIF,
  DataEngineValidatorFn,
  TreeIF,
} from "../../types";

type ActionFactory = (engine: DataEngineIF) => ActionIF;

export default class DataEngine implements DataEngineIF {
  constructor(public name: string, public validator?: DataEngineValidatorFn) {}
  actions: ActionMap = new Map();
  public tree?: TreeIF;

  addAction(actOrActFactory: ActionIF | ActionFactory): DataEngine {
    if (typeof actOrActFactory === "function") {
      return this.addAction(actOrActFactory(this));
    }
    this.actions.set(actOrActFactory.name, actOrActFactory);
    return this;
  }
}
