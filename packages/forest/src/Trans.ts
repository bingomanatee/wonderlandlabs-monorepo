import { ForestIF, TransIF, TransStatusItem } from './types';
import { TransStatus } from './constants';
import { v4 } from 'uuid';

type Props = {
  name: string;
  forest: ForestIF;
};

export class Trans implements TransIF {
  constructor({ name, forest }: Props) {
    this.name = name;
    this.forest = forest;
    this.id = v4();
  }

  public id: string;

  public name: string;
  forest: ForestIF;

  status: TransStatusItem = TransStatus.active;

  error?: Error;

  fail(err: Error) {
    if (this.status !== TransStatus.active) {
      this.error = err;
      this.status = TransStatus.failed;
    }
    this.forest.removeTrans(this);
  }

  isFailed(): boolean {
    return this.status === TransStatus.failed;
  }
}
