import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, PopoverController, List, Platform, LoadingController } from 'ionic-angular';
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
  @ViewChild(List) list: List;

  notes = [];

  constructor(private appProv: AppProvider, public loadingCtrl: LoadingController, private platform: Platform, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, private translate: TranslateService, public modalCtrl: ModalController, public popoverCtrl: PopoverController, private notesProv: NotesProvider) {
    let loader = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
    this.platform.ready().then(() => {
      this.notesProv.getAll().then(data => {
        this.notes = data;
        loader.dismiss();
      })
    })
  }

  /**
   *
   * @param refresher
   */
  doRefresh(refresher) {
    setTimeout(() => {
      refresher.complete();
    }, 3000);
    this.list.closeSlidingItems();
    this.notesProv.getAll().then(data => {
      this.notes = data;
      refresher.complete();
    })
  }

  /**
   * Prompt the user to add a new note. This shows our NoteCreatePage in a
   * modal and then adds the new note to our data source if the user created one.
   */
  addNote() {
    this.list.closeSlidingItems();
    let createNoteModal = this.modalCtrl.create('NoteCreatePage');
    createNoteModal.onWillDismiss(res => {
      if (res) {
        this.notes.unshift(res);
        this.appProv.updateStatistics = true;
      }
    })
    createNoteModal.present();
  }

  /**
   * Edit a note from the list of notes.
   */
  editNote(note) {
    this.list.closeSlidingItems();
    let createNoteModal = this.modalCtrl.create('NoteCreatePage', { note: note });
    createNoteModal.onWillDismiss(res => {
      if (res) {
        this.notes[this.notes.indexOf(note)] = res;
        this.appProv.updateStatistics = true;
      }
    })
    createNoteModal.present();
  }

  /**
   * Delete a note from the list of notes.
   */
  deleteNote(note) {
    this.list.closeSlidingItems();
    this.translate.get(["DELETE_NOTE_ALERT_TITLE",
      "DELETE_NOTE_ALERT_MESSAGE",
      "DELETE_BUTTON",
      "CANCEL_BUTTON"
    ]).subscribe((values) => {
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
                  this.appProv.updateStatistics = true;
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
