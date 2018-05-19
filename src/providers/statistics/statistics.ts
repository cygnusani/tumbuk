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

  getAll(symptoms: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let sql = '';
      var params: any;

      // Filter by symptoms?
      if (symptoms.length > 0) {
        sql = 'SELECT * FROM ingredient_in_meal WHERE note_id IN (SELECT id FROM note WHERE bad=? AND id IN (SELECT note_id FROM symptom_in_meal WHERE symptom_id IN (SELECT id FROM symptom WHERE name IN (?) )))';
        params = [true, symptoms.toString()];
      }
      // Get all
      else {
        sql = 'SELECT * FROM ingredient_in_meal WHERE note_id IN (SELECT id FROM note WHERE bad=?)';
        params = [true];
      }

      this.db.executeSql(sql, params).then(res => {
        var ingredients = [];

        // There are 'bad' meals in db
        if (res.rows.length > 0) {
          for (let i = 0; i < res.rows.length; i++) {
            const ingredient = res.rows.item(i);

            // Does bad ingredients list contain an object with a given ingredient name
            var j = ingredients.findIndex(ing => ing.ingredient_id == ingredient.ingredient_id);
            if (j != -1) {
              ingredients[j].count++;
            } else {
              ingredients.push(new Item({ ingredient_id: ingredient.ingredient_id, count: 1 }));
            }
          }
          var statistics = [];

          for (let i = 0; i < ingredients.length; i++) {
            const badIngredient = ingredients[i];

            var insert = -1;

            // Select that ingredient name from db
            let sql = 'SELECT name FROM ingredient WHERE id=?';
            this.db.executeSql(sql, [badIngredient.ingredient_id]).then(res => {

              // Save that ingredient name temporarily
              const name = res.rows.item(0).name;

              // Loop through stats and find a stat with a same count
              if (statistics.length > 0) {
                for (let j = 0; j < statistics.length; j++) {
                  const stat = statistics[j];

                  if (stat.count == badIngredient.count) {
                    insert = j;
                  }
                }
                if (insert != -1) {
                  statistics[insert].ingredients.push(name);
                } else {
                  statistics.push(new Stat({ ingredients: [name], count: badIngredient.count }));
                }
                insert = -1;
              } else {
                statistics.push(new Stat({ ingredients: [name], count: badIngredient.count }));
              }
            })
          }
          // https://www.w3schools.com/js/js_array_sort.asp
          return resolve(this.sortByCount(statistics));
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

  sortByCount(array) {
    return array.sort((a, b) => {
      var x = a.count; var y = b.count;
      if (x < y) return -1;
      if (x > y) return 1;
      return 0;
    });
  }
}
