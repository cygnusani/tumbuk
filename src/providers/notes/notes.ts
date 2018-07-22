import { Injectable, ResolvedReflectiveFactory } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';


@Injectable()
export class NotesProvider {
  
  private db: SQLiteObject;
  private isOpen: boolean;

  constructor(private sqlite: SQLite) {
    if (!this.isOpen) {
      this.sqlite = new SQLite();
      this.sqlite.create({ name: "data.db", location: "default" }).then((db: SQLiteObject) => {
        this.db = db;
        this.isOpen = true;
      }).catch(err => {
        console.log("Error: ", err);
      });
    }
  }

  insert(note: any): Promise<any> {
    return new Promise(resolve => {
      var noteId = -1;
      let sql = 'INSERT INTO note VALUES(NULL,?,?,?)';
      // Save new note
      this.db.executeSql(sql, [note.meal, note.bad, note.date]).then(res => {
        console.log(res);
        noteId = res.insertId;
        // Update ingredients
        for (let i = 0; i < note.ingredients.length; i++) {
          let ingredient = note.ingredients[i];
          let sql = 'SELECT * FROM ingredient WHERE name=?';
          // Insert ingredients if dont exist
          // Check if this ingredient is already in db
          this.db.executeSql(sql, [ingredient.name]).then(res => {
            console.log(res)
            // There is a record with a given ingredient name and then connect note and ingredient
            if (res.rows.length > 0) {
              let ingredientId = res.rows.item(0).id;
              let sql = 'INSERT INTO ingredient_in_meal VALUES(NULL,?,?)';
              this.db.executeSql(sql, [noteId, ingredientId]).then(res => {
                console.log("Result: ", res);
              }).catch(err => {
                console.log("Error: ", err);
              });
            }
            // No record found, let's create one
            else {
              let ingredientId = -1;
              let sql = 'INSERT INTO ingredient VALUES(NULL,?)';
              this.db.executeSql(sql, [ingredient.name]).then(res => {
                console.log(res);
                ingredientId = res.insertId;
                // Connect the note and ingredient
                sql = 'INSERT INTO ingredient_in_meal VALUES(NULL,?,?)';
                this.db.executeSql(sql, [noteId, ingredientId]).then(res => {
                }).catch(err => {
                  console.log("Error: ", err);
                });
              }).catch(err => {
                console.log("Error: ", err);
              });
            }
          }).catch(err => {
            console.log("Error: ", err);
          });
        }
        // Update symptoms
        for (let i = 0; i < note.symptoms.length; i++) {
          let symptom = note.symptoms[i];
          let sql = 'SELECT * FROM symptom WHERE name=?';
          // Insert symptom if dont exist
          // Check if this symptom is already in db
          this.db.executeSql(sql, [symptom.name]).then(res => {
            console.log(res)
            // There is a record with a given symptom name and then connect note and symptom
            if (res.rows.length > 0) {
              let symptomId = res.rows.item(0).id;
              let sql = 'INSERT INTO symptom_in_meal VALUES(NULL,?,?)';
              this.db.executeSql(sql, [noteId, symptomId]).then(res => {
                console.log("Result: ", res);
              }).catch(err => {
                console.log("Error: ", err);
              });
            }
            // No record found, let's create one
            else {
              let symptomId = -1;
              let sql = 'INSERT INTO symptom VALUES(NULL,?)';
              this.db.executeSql(sql, [symptom.name]).then(res => {
                console.log(res);
                symptomId = res.insertId;
                // Connect the note and symptom
                sql = 'INSERT INTO symptom_in_meal VALUES(NULL,?,?)';
                this.db.executeSql(sql, [noteId, symptomId]).then(res => {
                }).catch(err => {
                  console.log("Error: ", err);
                });
              }).catch(err => {
                console.log("Error: ", err);
              });
            }
          }).catch(err => {
            console.log("Error: ", err);
          });
        }
        return resolve(noteId);
      }).catch(err => {
        console.log("Error: ", err);
      });
    }).catch(err => {
      console.log("Error: ", err);
    });
  }

  update(note: any) {
    return new Promise((resolve, reject) => {
      let sql = 'UPDATE note SET meal=?, bad=?, date=? WHERE id=?';
      this.db.executeSql(sql, [note.meal, note.bad, note.date, note.id]).then(res => {
        console.log(res);
        // Delete all connections
        let sql = 'DELETE FROM ingredient_in_meal WHERE note_id=?';
        this.db.executeSql(sql, [note.id]).then(res => {
          console.log(res);
          // Remove all ingredients that were only connected to this note
          let sql = 'DELETE FROM ingredient WHERE id NOT IN (SELECT ingredient_id FROM ingredient_in_meal)';
          this.db.executeSql(sql, []).then(res => {
            console.log(res);
            // Update ingredients
            for (let i = 0; i < note.ingredients.length; i++) {
              const ingredient = note.ingredients[i];
              let sql = 'SELECT * FROM ingredient WHERE name=?';
              // Check if this ingredient is already in db
              this.db.executeSql(sql, [ingredient.name]).then(res => {
                console.log(res);
                // There is a record with a given ingredient name and then connect note and ingredient
                if (res.rows.length > 0) {
                  const ingredientId = res.rows.item(0).id;
                  let sql = 'INSERT INTO ingredient_in_meal VALUES(NULL,?,?)';
                  this.db.executeSql(sql, [note.id, ingredientId]).then(res => {
                    console.log(res);
                  }).catch(err => {
                    console.log("Error: ", err);
                  });
                }
                // No record found, let's create one
                else {
                  let ingredientId = -1;
                  let sql = 'INSERT INTO ingredient VALUES(NULL,?)';
                  this.db.executeSql(sql, [ingredient.name]).then(res => {
                    console.log(res);
                    ingredientId = res.insertId;
                    // Connect the note and ingredient
                    sql = 'INSERT INTO ingredient_in_meal VALUES(NULL,?,?)';
                    this.db.executeSql(sql, [note.id, ingredientId]).then(res => {
                      console.log(res);
                    }).catch(err => {
                      console.log("Error: ", err);
                    });
                  }).catch(err => {
                    console.log("Error: ", err);
                  });
                }
              }).catch(err => {
                console.log("Error: ", err);
              });
            }
          }).catch(err => {
            console.log("Error: ", err);
          });
        }).catch(err => {
          console.log("Error: ", err);
        });
        // Delete all connections
        let sql2 = 'DELETE FROM symptom_in_meal WHERE note_id=?';
        this.db.executeSql(sql2, [note.id]).then(res => {
          console.log(res);
          // Update symptoms
          for (let i = 0; i < note.symptoms.length; i++) {
            const symptom = note.symptoms[i];
            let sql = 'INSERT INTO symptom_in_meal VALUES(NULL,?,?)';
            this.db.executeSql(sql, [note.id, symptom.id]).then(res => {
              console.log(res);
            }).catch(err => {
              console.log("Error: ", err);
            });
          }
        }).catch(err => {
          console.log("Error: ", err);
        });
      });
      return resolve(note.id);
    })
  }

  getAll(recordsLimit: any): Promise<any> {
    return new Promise(resolve => {
      let sql = 'SELECT * FROM note ORDER BY id DESC LIMIT ?';
      this.db.executeSql(sql, [recordsLimit]).then(res => {
        console.log(res);
        var notes = [];
        // Note
        for (var i = 0; i < res.rows.length; i++) {
          notes.push({
            id: res.rows.item(i).id,
            meal: res.rows.item(i).meal,
            bad: res.rows.item(i).bad,
            ingredients: [],
            symptoms: [],
            date: res.rows.item(i).date
          })
        }
        // Ingredients in note
        for (let i = 0; i < notes.length; i++) {
          const note = notes[i];
          let sql = 'SELECT * FROM ingredient WHERE id IN (SELECT ingredient_id FROM ingredient_in_meal WHERE note_id=?)';
          this.db.executeSql(sql, [note.id]).then(res => {
            console.log(res);
            for (var i = 0; i < res.rows.length; i++) {
              note.ingredients.push({
                id: res.rows.item(i).id,
                name: res.rows.item(i).name
              });
            }
          })
          let sql2 = 'SELECT * FROM symptom WHERE id IN (SELECT symptom_id FROM symptom_in_meal WHERE note_id=?)';
          this.db.executeSql(sql2, [note.id]).then(res => {
            console.log(res);
            for (var i = 0; i < res.rows.length; i++) {
              note.symptoms.push({
                id: res.rows.item(i).id,
                name: res.rows.item(i).name
              });
            }
          })
        }
        return resolve(notes);
      }).catch(err => {
        console.log("Error: ", err);
      });
    }).catch(err => {
      console.log("Error: ", err);
    });
  }

  delete(note: any): Promise<any> {
    return new Promise(resolve => {
      // Delete note
      this.db.executeSql('DELETE FROM note WHERE id=?', [note.id]).catch(err => {
        console.log("Error: ", err);
      });
      // Delete connection between note and ingredient
      this.db.executeSql('DELETE FROM ingredient_in_meal WHERE note_id=?', [note.id]).catch(err => {
        console.log("Error: ", err);
      });
      // Delete connection between note and symptom
      this.db.executeSql('DELETE FROM symptom_in_meal WHERE note_id=?', [note.id]).catch(err => {
        console.log("Error: ", err);
      });
      // Delete all ingredients from db that are only connected with this note
      var sql = 'DELETE FROM ingredient WHERE id NOT IN (SELECT ingredient_id FROM ingredient_in_meal)'
      this.db.executeSql(sql, []).catch(err => {
        console.log("Error: ", err);
      });
      return resolve(-1)
    })
  }

  deleteSymptomsConnections(symptomsToDeleteIds: any): Promise<any> {
    return new Promise(resolve => {
      for (let i = 0; i < symptomsToDeleteIds.length; i++) {
        const id = symptomsToDeleteIds[i];
        var sql = 'DELETE FROM symptom_in_meal WHERE symptom_id=?';
        this.db.executeSql(sql, [id]).catch(err => {
          console.log("Error: ", err);
        });
      }
      return resolve(1);
    });
  }
}
