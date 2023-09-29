


export class ErrorPlus extends Error {

  constructor(msg: string, public data?: any ) {
    super(msg);
  }

}
