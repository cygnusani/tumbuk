import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';


@Injectable()
export class SymptomsProvider {

  private db: SQLiteObject;
  public isOpen: boolean;

  constructor(private sqlite: SQLite) {
    if (!this.isOpen) {
      this.sqlite = new SQLite();
      this.sqlite.create({ name: "data.db", location: "default" }).then((db: SQLiteObject) => {
        this.db = db;
        this.isOpen = true;
      }).catch(err => {
        console.log("Error: ", err);
      })
    }
  }

  insert(symptom: any): Promise<any> {
    return new Promise(resolve => {
      let sql = 'INSERT INTO symptom VALUES(NULL,?,?)';
      this.db.executeSql(sql, [symptom.name, symptom.orderNr]).then(res => {
        console.log(res);
        return resolve(res.insertId);
      }).catch(err => {
        console.log("Error: ", err);
        return resolve(-1);
      });
    });
  }

  update(symptom: any): Promise<any> {
    return new Promise(resolve => {
      let sql = 'UPDATE symptom SET name=?, order_nr=? WHERE id=?';
      this.db.executeSql(sql, [symptom.name, symptom.orderNr, symptom.id]).then(res => {
        console.log(res);
        return resolve(0);
      }).catch(err => {
        console.log("Error: ", err);
      });
    });
  }

  delete(symptomId: any): Promise<any> {
    return new Promise(resolve => {
      let sql = 'SELECT * FROM symptom_in_meal WHERE symptom_id=?';
      this.db.executeSql(sql, [symptomId]).then(res => {
        console.log(res);
        if (res.rows.length > 0) {
          return resolve(-1);
        } else {
          let sql = 'DELETE FROM symptom WHERE id=?';
          this.db.executeSql(sql, [symptomId]).then(res => {
            console.log(res);
            return resolve(0);
          }).catch(err => {
            console.log("Error: ", err);
            return resolve(-2);
          });
        }
      }).catch(err => {
        console.log("Error: ", err);
        return resolve(-2);
      });
    });
  }

  getAll(): Promise<any> {
    return new Promise(resolve => {
      let sql = 'SELECT * FROM symptom';
      this.db.executeSql(sql, []).then(res => {
        console.log(res);
        var symptoms = [];
        for (var i = 0; i < res.rows.length; i++) {
          symptoms.push({
            id: res.rows.item(i).id,
            name: res.rows.item(i).name,
            orderNr: res.rows.item(i).order_nr
          });
          symptoms.sort((symptom1, symptom2) => {
            return symptom1.orderNr - symptom2.orderNr
          });
        }
        return resolve(symptoms);
      }).catch(err => {
        console.log("Error: ", err);
      });
    }).catch(err => {
      console.log("Error: ", err);
    });
  }
}
