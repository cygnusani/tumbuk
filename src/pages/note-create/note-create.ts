import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavParams, ViewController, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NotesProvider } from '../../providers/notes/notes';
import { Note } from '../../models/note';
import { AppProvider } from '../../providers/app/app';
import { TranslateService } from '@ngx-translate/core';
import { SymptomsProvider } from '../../providers/symptoms/symptoms';


@IonicPage()
@Component({
  selector: 'page-note-create',
  templateUrl: 'note-create.html',
})
export class NoteCreatePage implements OnInit {
  form: FormGroup;

  isReadyToSave: boolean;
  isNew: boolean = false;

  note: any;

  ingredient: string = '';

  symptoms = [];
  symptomsInNote = [];

  constructor(
    private appProv: AppProvider,
    private datepipe: DatePipe,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private notesProv: NotesProvider,
    private symptomsProv: SymptomsProvider,
    private translate: TranslateService,
    private viewCtrl: ViewController) { }

  ngOnInit() {
    // Fetch symptoms from database
    this.symptomsProv.getAll().then(data => {
      this.symptoms = data;
    });
    // Get note data from navParams
    const n = this.navParams.get('note');
    // If note data is present...
    if (n) {
      // Clear note data from navParams
      this.navParams.data.note = null;
      // Create copy of the note
      this.note = new Note({ id: n.id, meal: n.meal, bad: n.bad, ingredients: [], symptoms: [], date: n.date });
      // Copy ingredients if any
      for (let i = 0; i < n.ingredients.length; i++) {
        const ingredientName = n.ingredients[i].name;
        this.note.ingredients.push({ name: ingredientName });
      }
      // Copy symptoms if any
      for (let i = 0; i < n.symptoms.length; i++) {
        const symptomName = n.symptoms[i].name;
        this.symptomsInNote.push(symptomName);
      }
      // Copy and froamt date
      var dateParts = this.note.date.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

      this.form = this.formBuilder.group({
        meal: [this.note.meal, Validators.required],
        ingredients: [this.note.ingredients],
        symptoms: [this.note.symptoms],
        date: [dateObject.toISOString()]
      });

      this.isReadyToSave = true;
    }
    // No data was sent. Is a new note
    else {
      this.isNew = true;
      // Create new date and format
      let date = new Date();
      let latest = this.datepipe.transform(date, 'dd/MM/yyyy');
      // Create new note
      this.note = { id: -1, meal: '', bad: false, ingredients: [], symptoms: [], date: latest }
      this.form = this.formBuilder.group({
        meal: ['', Validators.required],
        ingredients: [''],
        symptoms: [''],
        date: [new Date().toISOString()]
      });
    }
    // Watch the form for changes
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  addIngredient() {
    // Fetch translations
    this.translate.get([
      "ERROR_INGREDIENT_EMPTY",
      "ERROR_INGREDIENT_EXISTS"
    ]).subscribe(values => {
      // Change inserted ingredient to lower case and trim spaces
      var temp = this.ingredient.trim().toLowerCase();
      // Change first letter to upper case
      var ingredientName = temp.charAt(0).toUpperCase() + temp.slice(1);
      // Present error if length is 0
      if (ingredientName.length == 0) {
        this.appProv.toast(values.ERROR_INGREDIENT_EMPTY, 3000, "top");
        return;
      }
      // Present error if ingredient already exists
      if (this.note.ingredients.findIndex(ing => ing.name == ingredientName) !== -1) {
        this.appProv.toast(values.ERROR_INGREDIENT_EXISTS, 3000, "top");
        return;
      }
      // Save new ingredient
      this.note.ingredients.push({ name: ingredientName });
      // Clear new ingredient field
      this.ingredient = '';
    });
  }

  deleteIngredient(chip: Element, ingredient) {
    // Removes chrip from chips list
    chip.remove();
    // Remove selected ingredient from ingredients list
    this.note.ingredients.splice(this.note.ingredients.findIndex(ing => ing.name == ingredient), 1);
  }

  editSymptoms() {
    // Create a modal
    let createNoteModal = this.modalCtrl.create('SymptomsPage', {
      // Send symptoms data
      symptoms: this.symptoms
    });
    // When model will be dismissed...
    createNoteModal.onWillDismiss(() => {
      // Array for symptoms IDs that will be removed
      var symptomsToDeleteIds = [];

      for (let i = 0; i < this.symptomsInNote.length; i++) {
        var symptomInNote = this.symptomsInNote[i];
        if (this.symptoms.findIndex(s => s.name == symptomInNote.name) == -1) {
          symptomsToDeleteIds.push(symptomInNote.id);
          this.symptomsInNote.splice(i, 1);
        }
      }

      if (symptomsToDeleteIds.length > 0) {
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

  done() {
    // Return if form is not valid
    if (!this.form.valid) { return; }
    // Present error if no ingredients are entered
    if (this.note.ingredients.length == 0) {
      this.translate.get("ERROR_ONE_INGREDIENT").subscribe(val => {
        this.appProv.toast(val, 3000, "top");
      });
      return;
    }
    // Get meal value from form
    this.note.meal = this.form.value.meal;
    // Write symptoms into note
    for (let i = 0; i < this.symptomsInNote.length; i++) {
      const symptomName = this.symptomsInNote[i];
      const symptom = this.symptoms[this.symptoms.findIndex(s => s.name == symptomName)];
      this.note.symptoms.push({ id: symptom.id, name: symptom.name });
    }
    // Does the note have sny symptoms?
    this.note.symptoms.length > 0 ? this.note.bad = true : this.note.bad = false;
    // Write selected date into note
    var date = new Date(this.form.value.date);
    this.note.date = this.datepipe.transform(date, 'dd/MM/yyyy');
    // Refresh statistics when viewed next time
    this.appProv.refreshStatistics = true;
    // If is a new note...
    if (this.note.id != -1) {
      // Save note to database and send note to previous view
      this.notesProv.update(this.note).then(() => {
        this.viewCtrl.dismiss(this.note);
      });
    }
    // Else an old note was edited
    else {
      // Save note to database and send note to previous view
      this.notesProv.insert(this.note).then(res => {
        // Write generated ID into note
        this.note.id = res;
        this.viewCtrl.dismiss(this.note);
      });
    }
  }
}
