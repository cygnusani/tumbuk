import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { Storage } from '@ionic/storage';

@Injectable()
export class AppProvider {

  version = 0.3;
  lang = 'en';
  refreshStatistics = true;
  updateNotes = true;

  private db: SQLiteObject;
  public isOpen: boolean;

  constructor(private storage: Storage, private sqlite: SQLite, private translate: TranslateService, private toasts: ToastController) {
    translate.setDefaultLang('en');
    storage.get('lang').then(val => {
      if (val) {
        //console.log('Saved language=', val);
        translate.use(val);
      }
    })

    if (!this.isOpen) {
      this.sqlite = new SQLite();
      this.sqlite.create({ name: "data.db", location: "default" }).then((db: SQLiteObject) => {
        this.db = db;
        db.executeSql("CREATE TABLE IF NOT EXISTS note (id INTEGER PRIMARY KEY, meal TEXT, bad TEXT, date DATE)", []).catch(err => {
          //console.log("Error: ", err);
        });
        db.executeSql("CREATE TABLE IF NOT EXISTS ingredient (id INTEGER PRIMARY KEY, name TEXT)", []).catch(err => {
          //console.log("Error: ", err);
        });
        db.executeSql("CREATE TABLE IF NOT EXISTS ingredient_in_meal (id INTEGER PRIMARY KEY, note_id INTEGER, ingredient_id INTEGER)", []).catch(err => {
          //console.log("Error: ", err);
        });
        db.executeSql("CREATE TABLE IF NOT EXISTS symptom (id INTEGER PRIMARY KEY, name TEXT)", []).catch(err => {
          //console.log("Error: ", err);
        });
        db.executeSql("CREATE TABLE IF NOT EXISTS symptom_in_meal (id INTEGER PRIMARY KEY, note_id INTEGER, symptom_id INTEGER)", []).catch(err => {
          //console.log("Error: ", err);
        });
        this.isOpen = true;
      }).catch(err => {
        //console.log("Error: ", err);
      })
    }
  }
  /*
    langage(lang) {
      this.lang = lang;
      this.translate.use(lang);
      this.storage.set('lang', lang);
    }
  */
  toast(msg: string, time: number, pos: string) {
    this.translate.get('OK').subscribe(val => {
      let toast = this.toasts.create({
        message: msg,
        duration: time,
        position: pos,
        showCloseButton: true,
        closeButtonText: val
      });
      toast.present();
    })
  }
}
