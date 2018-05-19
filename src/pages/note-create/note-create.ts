import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavParams, ViewController, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NotesProvider } from '../../providers/notes/notes';
import { Note } from '../../models/note';
import { AppProvider } from '../../providers/app/app';
import { TranslateService } from '@ngx-translate/core';
import { SymptomsProvider } from '../../providers/symptoms/symptoms';

/**
 * Generated class for the NoteCreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-note-create',
  templateUrl: 'note-create.html',
})
export class NoteCreatePage implements OnInit {
  @ViewChild('fileInput') fileInput;

  isReadyToSave: boolean;

  note: any;

  ingredient = '';

  symptoms = [];
  symptomsInNote = [];

  isNew = false;

  form: FormGroup;

  constructor(private translate: TranslateService, private modalCtrl: ModalController, private appProv: AppProvider, private navParams: NavParams, private viewCtrl: ViewController, private formBuilder: FormBuilder, private datepipe: DatePipe, private symptomsProv: SymptomsProvider, private notesProv: NotesProvider) {
  }

  ngOnInit() {
    this.symptomsProv.getAll().then(data => {
      this.symptoms = data;
    });
    const n = this.navParams.get('note');
    if (n) {
      this.navParams.data.note = null;
      //this.note = new Note({ id: n.id, meal: n.meal, ingredients: [], bad: n.bad, date: n.date });
      this.note = new Note({ id: n.id, meal: n.meal, bad: n.bad, ingredients: [], symptoms: [], date: n.date });

      for (let i = 0; i < n.ingredients.length; i++) {
        const ingredient = n.ingredients[i].name;
        this.note.ingredients.push({ name: ingredient });
      }

      for (let i = 0; i < n.symptoms.length; i++) {
        const symptom = n.symptoms[i].name;
        //this.note.symptoms.push({ name: symptom });
        this.symptomsInNote.push(symptom);
      }

      var dateParts = this.note.date.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

      this.form = this.formBuilder.group({
        meal: [this.note.meal, Validators.required],
        ingredients: [this.note.ingredients],
        //bad: [this.note.bad],
        symptoms: [this.note.symptoms],
        date: [dateObject.toISOString()]
      });

      this.isReadyToSave = true;
    } else {
      this.isNew = true;

      let date = new Date();
      let latest = this.datepipe.transform(date, 'dd/MM/yyyy');

      this.note = { id: -1, meal: '', bad: false, ingredients: [], symptoms: [], date: latest }
      this.form = this.formBuilder.group({
        meal: ['', Validators.required],
        ingredients: [''],
        //bad: [false],
        symptoms: [''],
        date: [new Date().toISOString()]
      });
    }
    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  /**
   *
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  /**
   *
   */
  addIngredient() {
    this.translate.get([
      "ERROR_INGREDIENT_EMPTY",
      "ERROR_INGREDIENT_EXISTS"
    ]).subscribe(values => {
      var temp = this.ingredient.trim().toLowerCase();
      var ingredientName = temp.charAt(0).toUpperCase() + temp.slice(1);
      if (ingredientName.length == 0) {
        this.appProv.toast(values.ERROR_INGREDIENT_EMPTY, 3000, "top");
        return;
      }
      if (this.note.ingredients.findIndex(ing => ing.name == ingredientName) !== -1) {
        this.appProv.toast(values.ERROR_INGREDIENT_EXISTS, 3000, "top");
        return;
      }
      this.note.ingredients.push({ name: ingredientName });
      this.ingredient = '';
    });
  }

  /**
   *
   * @param chip
   * @param ingredient
   */
  deleteIngredient(chip: Element, ingredient) {
    chip.remove();
    this.note.ingredients.splice(this.note.ingredients.findIndex(ing => ing.name == ingredient), 1);
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {
    if (!this.form.valid) { return; }
    if (this.note.ingredients.length == 0) {
      this.translate.get("ERROR_ONE_INGREDIENT").subscribe(val => {
        this.appProv.toast(val, 3000, "top");
      });
      return;
    }

    this.note.meal = this.form.value.meal;

    for (let i = 0; i < this.symptomsInNote.length; i++) {
      const symptomName = this.symptomsInNote[i];
      const symptom = this.symptoms[this.symptoms.findIndex(s => s.name == symptomName)];
      this.note.symptoms.push({ id: symptom.id, name: symptom.name });
    }

    this.note.symptoms.length > 0 ? this.note.bad = true : this.note.bad = false;

    var date = new Date(this.form.value.date);
    this.note.date = this.datepipe.transform(date, 'dd/MM/yyyy');

    if (this.note.id != -1) {
      this.notesProv.update(this.note).then(() => {
        this.viewCtrl.dismiss(this.note);
      });
    } else {
      this.notesProv.insert(this.note).then(res => {
        this.note.id = res;
        this.viewCtrl.dismiss(this.note);
      });
    }
  }

  editSymptoms() {
    let createNoteModal = this.modalCtrl.create('SymptomsPage', {
      noteId: this.note.id,
      symptoms: this.symptoms
    });
    createNoteModal.onWillDismiss(() => {
      // Check and remove symptoms from draft and database that don't exist anymore
      var symptomsToDeleteIds = [];

      for (let i = 0; i < this.symptomsInNote.length; i++) {
        var symptomInNote = this.symptomsInNote[i];
        if (this.symptoms.findIndex(s => s.name == symptomInNote.name) == -1) {
          symptomsToDeleteIds.push(symptomInNote.id);
          this.symptomsInNote.splice(i, 1);
        }
      }

      if (symptomsToDeleteIds.length > 0) {
        this.appProv.updateNotes = true;
        this.notesProv.deleteSymptomsConnections(symptomsToDeleteIds);
      }

      if (this.note.id != -1) {
        this.isReadyToSave = false;
        if (this.symptomsInNote.length == 0) {
          this.note.bad = false;
        }
        this.notesProv.update(this.note).then(() => {
          this.isReadyToSave = true;
        });
      }
    })
    createNoteModal.present();
  }
}
