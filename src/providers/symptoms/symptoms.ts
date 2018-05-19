import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { Item } from '../../models/item';
import { Stat } from '../../models/stat';

/*
  Generated class for the SymptomsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
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
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  insert(name: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let sql = 'INSERT INTO symptom VALUES(NULL,?)';
      this.db.executeSql(sql, [name]).then(res => {
        console.log(res);
        return resolve(res.insertId);
      }).catch(err => {
        console.log("Error: ", err);
        return reject(err);
      });
    });
  }

  delete(symptomId: any): Promise<any> {
    return new Promise(resolve => {
      let sql = 'SELECT * FROM symptom_in_meal WHERE symptom_id=?';
      this.db.executeSql(sql, [symptomId]).then(res => {
        if (res.rows.length > 0) {
          return resolve(-1);
        } else {
          let sql = 'DELETE FROM symptom WHERE id=?';
          this.db.executeSql(sql, [symptomId]).then(res => {
            console.log(res);
            return resolve(1);
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
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM symptom';
      this.db.executeSql(sql, []).then(res => {
        console.log(res);
        var symptoms = [];
        for (var i = 0; i < res.rows.length; i++) {
          symptoms.push({
            id: res.rows.item(i).id,
            name: res.rows.item(i).name
          })
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
