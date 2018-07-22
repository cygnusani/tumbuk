import { Component, OnInit } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppProvider } from '../../providers/app/app';
import { SymptomsProvider } from '../../providers/symptoms/symptoms';
import { FormGroup, FormBuilder } from '@angular/forms';


@IonicPage()
@Component({
  selector: 'page-symptoms',
  templateUrl: 'symptoms.html',
})
export class SymptomsPage implements OnInit {

  form: FormGroup;
  isReadyToSave: boolean;

  symptoms = [];
  symptom: any = { id: -1, name: '', orderNr: -1 };

  saved = false;

  constructor(private symptomsProv: SymptomsProvider,
    private appProv: AppProvider,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private navParams: NavParams,
    private viewCtrl: ViewController) {
  }

  ngOnInit(): void {
    var symptoms = this.navParams.get('symptoms');
    this.symptoms = symptoms;
    console.log(this.symptoms);
    this.symptom.orderNr = symptoms.length;
    this.saved = true;
    this.form = this.formBuilder.group({
      symptom: []
    });
    this.isReadyToSave = true;
  }

  add() {
    this.translate.get([
      "TOAST_ERROR_SYMPTOM_LENGTH",
      "TOAST_ERROR_SYMPTOM_EXISTS",
      "ERROR_TOAST"
    ]).subscribe(values => {
      var temp = this.symptom.name.trim().toLowerCase();
      var name = temp.charAt(0).toUpperCase() + temp.slice(1);
      // Checking if the inserted symptom is valid
      // Length is zero
      if (name.length < 3 || name.length > 25) {
        this.appProv.toast(values.TOAST_ERROR_SYMPTOM_LENGTH, 3000, "top");
        return;
      }
      // Inserted sympton already exists
      if (this.symptoms.findIndex(s => s.name == name) != -1) {
        this.appProv.toast(values.TOAST_ERROR_SYMPTOM_EXISTS, 3000, "top");
        return;
      }
      // Start saving...
      this.saved = false;
      // Save inserted symptom to database
      this.symptomsProv.insert(this.symptom).then(generatedId => {
        // Insert was a success
        if (generatedId != -1) {
          // Insert new symptom object with generated ID to list
          this.symptoms.push({ id: generatedId, name: this.symptom.name, orderNr: this.symptom.orderNr });
          this.symptom = { id: -1, name: '', orderNr: this.symptoms.length };
          // End saving
          this.saved = true;
          // Update statistcis page to load data from db again
          this.appProv.refreshStatistics = true;
        }
        // Something went wrong
        else if (generatedId == -1) {
          this.appProv.toast(values.ERROR_TOAST, 3000, "top");
        }
      });
    });
  }

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
        // Delete successfuly
        if (res == 0) {
          // Update statistics
          this.appProv.refreshStatistics = true;
          // Remove symptom from visible list
          this.symptoms.splice(this.symptoms.findIndex(s => s.name == symptom.name), 1);
          this.appProv.toast(values.TOAST_DELETE_SYMPTOM_SUCCESS, 3000, "top");
        }
        // Delete failed because the symptom is used in more than one note
        else if (res == -1) {
          this.appProv.toast(values.TOAST_ERROR_NOTE_DEPENDENCY, 3000, "top");
        }
        // Something else went wrong
        else if (res == -2) {
          this.appProv.toast(values.ERROR_TOAST, 3000, "top");
        }
        // End save
        this.saved = true;
      });
    });
  }

  reorderItems(indexes) {
    var symptomFrom = this.symptoms[indexes.from];
    this.symptoms.splice(indexes.from, 1);
    this.symptoms.splice(indexes.to, 0, symptomFrom);
    this.translate.get("ERROR_TOAST").subscribe(value => {
      this.saved = false;
      for (let i = 0; i < this.symptoms.length; i++) {
        var symptom = this.symptoms[i];
        if (symptom.orderNr != i) {
          this.appProv.refreshStatistics = true;
          symptom.orderNr = i;
          this.symptomsProv.update(symptom).then(res => {
            if (res != 0) {
              this.appProv.toast(value, 3000, "top");
            }
          });
        }
      }
      this.saved = true;
    });
  }

  done() {
    this.viewCtrl.dismiss();
  }
}
