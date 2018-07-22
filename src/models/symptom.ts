export class Symptom {

  constructor(fields: any) {
    for (const f in fields) {
      this[f] = fields[f];
    }
  }
}

export interface Symptom {
  [prop: string]: any;
}
