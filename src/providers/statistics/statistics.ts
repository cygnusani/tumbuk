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
        //console.log(error);
      })
    }
  }

  getAll(symptom: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let sql = '';
      var params: any;

      // Filter by symptoms?
      if (symptom.length > 0) {
        sql = 'SELECT * FROM ingredient_in_meal WHERE note_id IN (SELECT id FROM note WHERE bad=? AND id IN (SELECT note_id FROM symptom_in_meal WHERE symptom_id IN (SELECT id FROM symptom WHERE name = ? )))';
        params = [true, symptom];
      }
      // Get all
      else {
        sql = 'SELECT * FROM ingredient_in_meal WHERE note_id IN (SELECT id FROM note WHERE bad=?)';
        params = [true];
      }
      //console.log(symptom.toString());
      this.db.executeSql(sql, params).then(res => {
        //console.log(res);
        var badIngredients = [];

        // There are 'bad' meals in db
        if (res.rows.length > 0) {
          for (let i = 0; i < res.rows.length; i++) {
            const row = res.rows.item(i);

            // Does bad ingredients list contain an object with a given ingredient name
            var j = badIngredients.findIndex(ing => ing.ingredient_id == row.ingredient_id);
            if (j != -1) {
              badIngredients[j].count++;
            } else {
              badIngredients.push(new Item({ ingredient_id: row.ingredient_id, count: 1 }));
            }
          }
          var statistics = [];

          var badIngredientIds = [];
          badIngredients.forEach(element => {
            badIngredientIds.push(element.ingredient_id);
          });
          //console.log(badIngredientIds.toString());
          sql = 'SELECT * FROM ingredient WHERE id IN (' + badIngredientIds.toString() + ')';
          params = [];

          this.db.executeSql(sql, params).then(res => {
            //console.log(res);

            var temp = [];
            if (res.rows.length > 0) {
              for (let i = 0; i < res.rows.length; i++) {
                //const ingredient = res.rows.item(i);
                temp.push({
                  id: res.rows.item(i).id,
                  name: res.rows.item(i).name
                })
              }
            }
            //console.log(temp);

            for (let i = 0; i < badIngredients.length; i++) {
              const badIngredient = badIngredients[i];

              var insert = -1;

              const name = temp[temp.findIndex(ing => ing.id == badIngredient.ingredient_id)].name;
              //console.log(name)
              // Select that ingredient name from db
              //let sql = 'SELECT name FROM ingredient WHERE id=?';
              //this.db.executeSql(sql, [badIngredient.ingredient_id]).then(res => {

              // Save that ingredient name temporarily
              //const name = res.rows.item(0).name;

              // Loop through stats and find a stat with a same count
              if (statistics.length > 0) {
                for (let j = 0; j < statistics.length; j++) {
                  var stat = statistics[j];

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
              statistics.sort((stat1, stat2) => {
                return stat2.count - stat1.count
              });
              //})
            }
            return resolve(statistics);

          }).catch(err => {
            //console.log("Error: ", err);
          });
        } else {
          return resolve([]);
        }
      }).catch(err => {
        //console.log("Error: ", err);
      });
    }).catch(err => {
      //console.log("Error: ", err);
    });
  }
}
