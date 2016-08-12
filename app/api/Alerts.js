
/* This file is WIP, to be used for the advanced alerts API */
export class Alert {

}

export class TornAPIDescriptor {
  constructor (entityID ) {

  }
}

export const CONDITIONALS = {
  "gt": (x, y) => return x > y,
  "lt": (x, y) => return x < y,
  "eq": (x, y) => return x === y,
  "not-eq": (x, y) => return x !== y,
  "regex": (x, y) => x.test(y)
}


export class AlertManager {
  constructor () {
    this.api = null;

    this.conditionals = [];
  }

  addAlert () {

  }

  modifyAllAlerts () {

  }

  linkConditional (conditional) {
    this.conditionals.push(conditional);
  }

  linkTornAPI (tornApi) {
    this.api = tornApi;
  }
}
