import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, ModalController, AlertController, LoadingController, Content } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { NotesProvider } from '../../providers/notes/notes';
import { AppProvider } from '../../providers/app/app';


@IonicPage()
@Component({
  selector: 'page-notes',
  templateUrl: 'notes.html',
})
export class NotesPage implements OnInit {
  @ViewChild(Content) content: Content;

  notes = [];

  orderBy = 'noteId';
  nrOfNotes = 5;
  notesLimit = 5;

  numberOfNotesInDb;
  hideInfiniteScroll = false;


  constructor(private appProv: AppProvider,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private notesProv: NotesProvider) { }

  ngOnInit(): void {

    this.loadNotes(true);
    this.getNrOfNotesInDb();
  }

  /* Infinite scroll */
  doInfinite(infiniteScroll) {
    if (this.notes.length === this.numberOfNotesInDb) {
      return;
    }
    setTimeout(() => {
      this.nrOfNotes += this.notesLimit;
      // this.notesRowEnd += this.notesLimit;
      this.getNotesBetweenRows(this.orderBy, this.nrOfNotes).then(infiniteScroll.complete());
    }, 1000);
  }

  loadNotes(showLoader: boolean): Promise<boolean> {
    return new Promise(resolve => {
      this.translate.get('LOADING_MESSAGE').subscribe(val => {
        let loader = this.loadingCtrl.create({
          content: val,
          duration: 5000
        });
        showLoader === true ? loader.present() : null;
        this.getNrOfNotesInDb();
        this.getNotesBetweenRows(this.orderBy, this.nrOfNotes).then(() => {
          loader.dismiss();
          this.notes.length === this.numberOfNotesInDb ? this.hideInfiniteScroll = true : this.hideInfiniteScroll = false;
          return resolve(true);
        });
      });
    });
  }

  /* Loading notes data */
  getNrOfNotesInDb(): Promise<boolean> {
    return new Promise(resolve => {
      this.notesProv.getNrOfNotesInDb().then(result => {
        this.numberOfNotesInDb = result;
        this.notes.length === this.numberOfNotesInDb ? this.hideInfiniteScroll = true : this.hideInfiniteScroll = false;
        return resolve(true);
      });
    });
  }

  getNotesBetweenRows(orderBy, rowsLimit): Promise<boolean> {
    return new Promise(resolve => {
      this.notesProv.getNotesBetweenRows(orderBy, rowsLimit).then(data => {
        console.log(data);
        this.notes = data;
        this.appProv.updateNotes = false;
        this.notes.length === this.numberOfNotesInDb ? this.hideInfiniteScroll = true : this.hideInfiniteScroll = false;
        return resolve(true);
      });
    });
  }

  scrollToTop(): Promise<any> {
    return new Promise(resolve => {
      this.content.scrollToTop().then(() => {
        return resolve(true);
      });
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.loadNotes(false).then(refresher.complete());
    }, 1000);
  }

  addNote() {
    this.translate.get("CREATE_NOTE_SUCCESS_TOAST").subscribe(val => {
      let createNoteModal = this.modalCtrl.create('NoteCreatePage');
      createNoteModal.onWillDismiss(result => {
        if (result) {
          this.numberOfNotesInDb++;
          this.notes.unshift(result);
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
          this.loadNotes(false);
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
              this.notesProv.delete(note).then(result => {
                if (result == -1) {
                  this.notes.splice(this.notes.indexOf(note), 1);
                  this.numberOfNotesInDb--;
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
