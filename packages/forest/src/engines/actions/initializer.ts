import { Branch } from '../../Branch';
import { ACTION_NAME_INITIALIZER } from '../../constants';
import { MutatorArgs, BranchIF, TreeIF, TreeSeed } from '../../types';

/**
 * a generic initializer; it returns a seed's initial value.
 * Some intitializers may $validate their data.
 */
export const initializer = {
  name: ACTION_NAME_INITIALIZER,
  delta(_: BranchIF, args: MutatorArgs) {
    if (_.tree.name === 'basic-engine')
      console.log(ACTION_NAME_INITIALIZER, '....................... called with ', args);
    return args[0];
  },
};
