import { Component, ViewChild } from '@angular/core';
import { IonicPage, ModalController, AlertController, List, Platform, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { NotesProvider } from '../../providers/notes/notes';
import { AppProvider } from '../../providers/app/app';

/**
 * Generated class for the NotesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-notes',
  templateUrl: 'notes.html',
})
export class NotesPage {
  //@ViewChild(List) list: List;

  notes = [];

  recordsLimit = 15;

  constructor(private appProv: AppProvider, private loadingCtrl: LoadingController, private platform: Platform, private alertCtrl: AlertController, private translate: TranslateService, private modalCtrl: ModalController, private notesProv: NotesProvider) {
    this.load();
  }

  load() {
    this.translate.get('LOADING_MESSAGE').subscribe(val => {
      let loader = this.loadingCtrl.create({
        //spinner: "dots",
        content: val,
        duration: 5000
      });
      loader.present();
      this.platform.ready().then(() => {
        this.notesProv.getAll(this.recordsLimit).then(data => {
          this.notes = data;
          this.appProv.updateNotes = false;
          loader.dismiss();
        })
      })
    });
  }

  /**
   *
   * @param refresher
   */
  doRefresh(refresher) {
    setTimeout(() => {
      refresher.complete();
    }, 3000);
    //this.list.closeSlidingItems();
    this.notesProv.getAll(this.recordsLimit).then(data => {
      this.notes = data;
      refresher.complete();
    })
  }

  noteSymptoms(note: any): string {
    var symptomsString = '';
    if (note.symptoms.length > 0) {
      for (let i = 0; i < note.symptoms.length; i++) {
        const symptom = note.symptoms[i];
        symptomsString += symptom.name;
        if (i < note.symptoms.length - 1) {
          symptomsString += ', ';
        }
      }
    }
    return symptomsString;
  }

  /**
   * Prompt the user to add a new note. This shows our NoteCreatePage in a
   * modal and then adds the new note to our data source if the user created one.
   */
  addNote() {
    //this.list.closeSlidingItems();
    this.translate.get("CREATE_NOTE_SUCCESS_TOAST").subscribe(val => {
      let createNoteModal = this.modalCtrl.create('NoteCreatePage');
      createNoteModal.onWillDismiss(res => {
        //if (this.appProv.updateStatistics) {
        //  this.load();
        //}
        if (res) {
          this.notes.unshift(res);
          //this.appProv.updateStatistics = true;

          this.appProv.toast(val, 3000, "top")
        }
      })
      createNoteModal.present();
    });
  }

  /**
   * Edit a note from the list of notes.
   */
  editNote(note) {
    //this.list.closeSlidingItems();
    this.translate.get("EDIT_NOTE_SUCCESS_TOAST").subscribe(val => {
      let createNoteModal = this.modalCtrl.create('NoteCreatePage', { note: note });
      createNoteModal.onWillDismiss(res => {
        if (res) {
          this.appProv.refreshStatistics = true;
          this.notes[this.notes.indexOf(note)] = res;
          this.appProv.toast(val, 3000, "top")
        }
        if (this.appProv.updateNotes) {
          this.appProv.updateNotes = false;
          this.load();
        }
      });
      createNoteModal.present();
    });
  }

  /**
   * Delete a note from the list of notes.
   */
  deleteNote(note) {
    //this.list.closeSlidingItems();
    this.translate.get([
      "DELETE_NOTE_ALERT_TITLE",
      "DELETE_NOTE_ALERT_MESSAGE",
      "DELETE_BUTTON",
      "CANCEL_BUTTON",
      "DELETE_NOTE_SUCCESS_TOAST"
    ]).subscribe(values => {
      let confirm = this.alertCtrl.create({
        title: values.DELETE_NOTE_ALERT_TITLE,
        message: values.DELETE_NOTE_ALERT_MESSAGE,
        buttons: [
          {
            text: values.DELETE_BUTTON,
            handler: () => {
              this.notesProv.delete(note).then(res => {
                if (res == -1) {
                  this.notes.splice(this.notes.indexOf(note), 1);
                  if (note.symptoms.length > 0) {
                    this.appProv.refreshStatistics = true;
                  }
                  this.appProv.toast(values.DELETE_NOTE_SUCCESS_TOAST, 3000, "top");
                } else {
                  this.presentErrorToast();
                }
              })
            }
          },
          {
            text: values.CANCEL_BUTTON,
            handler: () => {
            }
          }
        ]
      });
      confirm.present();
    })
  }

  private presentErrorToast() {
    this.translate.get("ERROR_TOAST").subscribe(val => {
      this.appProv.toast(val, 3000, "top");
    });
  }
}
