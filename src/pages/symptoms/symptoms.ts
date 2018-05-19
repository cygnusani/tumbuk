import { Component, OnInit } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppProvider } from '../../providers/app/app';
import { SymptomsProvider } from '../../providers/symptoms/symptoms';
import { NotesProvider } from '../../providers/notes/notes';

/**
 * Generated class for the SymptomsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-symptoms',
  templateUrl: 'symptoms.html',
})
export class SymptomsPage implements OnInit {

  symptoms = [];
  symptom = '';

  noteId = -1;
  saved = false;

  constructor(private symptomsProv: SymptomsProvider,
    private notesProv: NotesProvider,
    private appProv: AppProvider,
    private translate: TranslateService,
    private navParams: NavParams,
    private viewCtrl: ViewController) {
  }

  ngOnInit(): void {
    this.noteId = this.navParams.get('noteId');
    var symptoms = this.navParams.get('symptoms');
    if (symptoms) {
      this.symptoms = symptoms;
    }
    this.saved = true;
  }

  /**
   * Add new symptom
   */
  add() {
    this.translate.get([
      "TOAST_ERROR_SYMPTOM_EMPTY",
      "TOAST_ERROR_SYMPTOM_EXISTS"
    ]).subscribe(values => {
      var temp = this.symptom.trim().toLowerCase();
      var name = temp.charAt(0).toUpperCase() + temp.slice(1);

      // Checking if the inserted symptom is valid
      // Length is zero
      if (name.length == 0) {
        this.appProv.toast(values.ERROR_SYMPTOM_EMPTY, 3000, "top");
        return;
      }
      // Inserted sympton already exists
      if (this.symptoms.findIndex(s => s.name == name) != -1) {
        this.appProv.toast(values.ERROR_SYMPTOM_EXISTS, 3000, "top");
        return;
      }
      // Clear insert field
      this.symptom = '';
      // Start saving...
      this.saved = false;
      // Save inserted symptom to database
      this.symptomsProv.insert(name).then(generatedId => {
        // Insert new symptom object ith generated ID to list
        this.symptoms.push({ id: generatedId, name: name });
        // End saving
        this.saved = true;
      });
    });
  }

  /**
   * Deletes the symptom if not used
   * @param symptom
   */
  delete(symptom: any) {
    this.translate.get([
      "TOAST_DELETE_SYMPTOM_SUCCESS",
      "TOAST_ERROR_NOTE_DEPENDENCY",
      "ERROR_TOAST"
    ]).subscribe(values => {
      // Start saving...
      this.saved = false;
      // Delete symptom from database
      this.symptomsProv.delete(symptom.id).then(res => {
        console.log(res);
        // Delete successfuly
        if (res == 1) {
          // Update statistics
          this.appProv.updateStatistics = true;
          // Remove symptom from visible list
          this.symptoms.splice(this.symptoms.findIndex(s => s.name == symptom.name), 1);
          // Toast
          this.appProv.toast(values.TOAST_DELETE_SYMPTOM_SUCCESS, 3000, "top");
        }
        // Delete failed because the symptom is used in more than one note
        else if (res == -1) {
          // Toast
          this.appProv.toast(values.TOAST_ERROR_NOTE_DEPENDENCY, 3000, "top");
        }
        // Something else went wrong
        else if (res == -2) {
          // Toast
          this.appProv.toast(values.ERROR_TOAST, 3000, "top");
        }
        // End save
        this.saved = true;
      });
    });
  }

  /**
   * Dismisses the modal and returns new/updated symptoms list
   */
  done() {
    this.viewCtrl.dismiss(this.symptoms);
  }
}
