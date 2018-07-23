import { Component, ViewChild } from '@angular/core';
import { IonicPage, ModalController, AlertController, List, Platform, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { NotesProvider } from '../../providers/notes/notes';
import { AppProvider } from '../../providers/app/app';


@IonicPage()
@Component({
  selector: 'page-notes',
  templateUrl: 'notes.html',
})
export class NotesPage {

  notes = [];
  recordsLimit = 15;

  constructor(private appProv: AppProvider, private loadingCtrl: LoadingController, private platform: Platform, private alertCtrl: AlertController, private translate: TranslateService, private modalCtrl: ModalController, private notesProv: NotesProvider) {
    this.load();
  }

  load() {
    this.translate.get('LOADING_MESSAGE').subscribe(val => {
      let loader = this.loadingCtrl.create({
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

  doRefresh(refresher) {
    setTimeout(() => {
      refresher.complete();
    }, 3000);
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

  addNote() {
    this.translate.get("CREATE_NOTE_SUCCESS_TOAST").subscribe(val => {
      let createNoteModal = this.modalCtrl.create('NoteCreatePage');
      createNoteModal.onWillDismiss(res => {
        if (res) {
          this.notes.unshift(res);
          this.appProv.toast(val, 3000, "top")
        }
      })
      createNoteModal.present();
    });
  }

  editNote(note) {
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

  deleteNote(note) {
    this.translate.get([
      "DELETE_NOTE_ALERT_TITLE",
      "DELETE_NOTE_ALERT_MESSAGE",
      "DELETE_BUTTON",
      "CANCEL_BUTTON",
      "DELETE_NOTE_SUCCESS_TOAST",
      "ERROR_TOAST"
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
                  this.appProv.toast(values.ERROR_TOAST, 3000, "top");
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
}
