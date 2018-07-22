export class Stat {

  constructor(fields: any) {
    for (const f in fields) {
      this[f] = fields[f];
    }
  }
}

export interface Stat {
  [prop: string]: any;
}
