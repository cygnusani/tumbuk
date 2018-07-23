export class Ingredient {

  constructor(fields: any) {
    for (const f in fields) {
      this[f] = fields[f];
    }
  }
}

export interface Ingredient {
  [prop: string]: any;
}
