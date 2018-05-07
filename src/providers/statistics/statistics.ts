import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { Item } from '../../models/item';
import { Stat } from '../../models/stat';

/*
  Generated class for the StatisticsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StatisticsProvider {

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

  getAll(): Promise<any> {
    return new Promise((resolve, reject) => {

      let sql = 'SELECT * FROM ingredient_in_meal WHERE note_id IN (SELECT id FROM note WHERE bad=?)';
      this.db.executeSql(sql, [true]).then(res => {

        let badIngredients = [];

        // There are 'bad' meals in db
        if (res.rows.length > 0) {
          for (let i = 0; i < res.rows.length; i++) {
            const ingredient = res.rows.item(i);
            // Does bad ingredients list contain an object with a given ingredient name
            var _i = badIngredients.findIndex(i => i.ingredient_id == ingredient.ingredient_id);
            if (_i !== -1) {
              badIngredients[_i].count++;
            } else {
              badIngredients.push(new Item({ ingredient_id: ingredient.ingredient_id, count: 1 }));
            }
          }
          let statistics = [];

          for (let i = 0; i < badIngredients.length; i++) {
            const badIngredient = badIngredients[i];

            var insert = -1;

            // Select that ingredient name from db
            let sql = 'SELECT name FROM ingredient WHERE id=?';
            this.db.executeSql(sql, [badIngredient.ingredient_id]).then(res => {

              // Save that ingredient name temporarily
              const ingredientName = res.rows.item(0).name;

              // Loop through stats and find a stat with a same coun
              if (statistics.length > 0) {
                for (let j = 0; j < statistics.length; j++) {
                  const stat = statistics[j];

                  if (stat.count == badIngredient.count) {
                    insert = j;
                  }
                }
                if (insert != -1) {
                  statistics[insert].ingredients.push(ingredientName);
                } else {
                  statistics.push(new Stat({ ingredients: [ingredientName], count: badIngredient.count }));
                }
                insert = -1;
              } else {
                statistics.push(new Stat({ ingredients: [ingredientName], count: badIngredient.count }));
              }
            })
          }
          // https://davidwalsh.name/array-sort
          return resolve(statistics.sort((a, b) => b.count - a.count));
        } else {
          return resolve([]);
        }
      }).catch(err => {
        console.log("Error: ", err);
      });
    }).catch(err => {
      console.log("Error: ", err);
    });
  }
}
