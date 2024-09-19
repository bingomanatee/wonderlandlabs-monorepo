import type {
  FieldError,
  FieldIF,
  FieldProps,
  FieldValidator,
} from './types.formCollection.ts';
import { uniqWith, isEqual } from 'lodash-es';
import { isFieldIF } from './types.guards.ts';

function a(arg: FieldValidator | FieldValidator[]): FieldValidator[] {
  if (Array.isArray(arg)) {return arg;}
  return [ arg ];
}

type pProp = FieldProps | undefined;
function p(...props: pProp[]) {
  return props.reduce((memo: FieldProps, next: pProp) => {
    if (memo && next) {return { ...memo, ...next };}
    if (next) {return next;}
    return memo;
  }, {});
}

type Param = Partial<FieldIF> | undefined | Param[];

/**
 *
 * @param  fields passed arrays or individual FieldIFs; may have undefined.
 * passed in most recent to least recent.
 * returns an array favoring more recent values.
 */
export default function extendField(...fields: Param[]) {
  const history = fields.flat().reverse();
  const next: FieldIF | Partial<FieldIF> = history.reduce(
    (out: FieldIF, next: FieldIF | undefined) => {
      if (!next) {return out;}
      const nextOut = { ...out, ...next };
      nextOut.props = p(out.props, next.props);
      return nextOut;
    },
    { name: '', value: '' }
  ) as FieldIF;

  if (next.baseParams) {
    const { baseParams, ...rest } = next;
    return extendField(rest, baseParams);
  }

  if (!isFieldIF(next)) {
    console.log('bad field ', next);
    throw new Error('extendField cannot produce a complete fieldIF');
  }

  delete next.baseParams;

  return applyValidators(next);
}

function applyValidators(field: FieldIF): FieldIF {
  if (field.validators) {
    const errors = a(field.validators)
      .reduce((errs: FieldError[], v: FieldValidator) => {
        let e: FieldError | undefined;
        try {
          e = v(field, errs) || undefined;
          if (e) {errs.push(e);}
        } catch (er) {
          if (er instanceof Error) {
            errs.push({
              message: er.message,
              severity: Number.MAX_SAFE_INTEGER - 1,
            });
          } else
          {errs.push({ message: `${er}`, severity: Number.MAX_SAFE_INTEGER });}
        }
        return errs;
      }, [])
      .filter(Boolean);

    if (errors) {
      field.errors = uniqWith(errors, isEqual);
    } else {
      delete field.errors;
    }
  } else {
    delete field.errors;
  }
  return field;
}
