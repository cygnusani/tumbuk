import { Component, OnInit } from '@angular/core';
import { IonicPage, NavParams, ViewController, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
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

  validation_messages = {};

  isValidIngredient = false;
  hasAtleastOneIngredient = false;
  insertedIngredientAlreadyExists = false;
  isReadyToSave = false;
  isNew = false;

  note;
  ingredient = '';

  mealMinLength = 3;
  mealMaxLength = 150;
  ingredientMinLength = 3;
  ingredientMaxLength = 150;

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
    this.translate.get([
      'NOTE_CREATE_ERROR_REQUIRED',
      'NOTE_CREATE_ERROR_MEAL_LENGTH',
      'NOTE_CREATE_ERROR_INGREDIENTS_NR',
      'NOTE_CREATE_ERROR_INGREDIENT_LENGTH'
    ]).subscribe(values => {
      this.validation_messages = {
        'meal': [
          { type: 'required', message: values.NOTE_CREATE_ERROR_REQUIRED },
          { type: 'minlength', message: values.NOTE_CREATE_ERROR_MEAL_LENGTH },
          { type: 'maxlength', message: values.NOTE_CREATE_ERROR_MEAL_LENGTH }
        ],
        'ingredient': [
          { type: 'minlength', message: values.NOTE_CREATE_ERROR_INGREDIENT_LENGTH },
          { type: 'maxlength', message: values.NOTE_CREATE_ERROR_INGREDIENT_LENGTH }
        ],
        'ingredients': [
          { type: 'min', message: values.NOTE_CREATE_ERROR_INGREDIENTS_NR },
        ]
      }
    });

    this.symptomsProv.getAll().then(data => {
      this.symptoms = data;
    });
    const noteData = this.navParams.get('note');

    if (noteData) {
      this.navParams.data.note = null;
      this.note = new Note({ id: noteData.id, meal: noteData.meal, bad: noteData.bad, ingredients: [], symptoms: [], date: noteData.date });

      for (let i = 0; i < noteData.ingredients.length; i++) {
        const ingredientName = noteData.ingredients[i].name;
        this.note.ingredients.push({ name: ingredientName });
      }

      for (let i = 0; i < noteData.symptoms.length; i++) {
        const symptomName = noteData.symptoms[i].name;
        this.symptomsInNote.push(symptomName);
      }

      var dateParts = this.note.date.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

      this.form = this.formBuilder.group({
        meal: new FormControl(this.note.meal, Validators.compose([
          Validators.required,
          Validators.minLength(this.mealMinLength),
          Validators.maxLength(this.mealMaxLength)
        ])),
        ingredient: new FormControl(this.ingredient, Validators.compose([
          Validators.minLength(this.ingredientMinLength),
          Validators.maxLength(this.ingredientMaxLength)
        ])),
        ingredients: new FormControl(this.note.ingredients.length, Validators.min(1)),
        symptoms: new FormControl(this.note.symptoms.length, {}),
        date: new FormControl(dateObject.toISOString(), {})
      });
      this.isReadyToSave = true;
    } else {
      this.isNew = true;

      let date = new Date();
      let latest = this.datepipe.transform(date, 'dd/MM/yyyy');

      this.note = { id: -1, meal: '', bad: false, ingredients: [], symptoms: [], date: latest }

      this.form = this.formBuilder.group({
        meal: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(this.mealMinLength),
          Validators.maxLength(this.mealMaxLength)
        ])),
        ingredient: new FormControl('', Validators.compose([
          Validators.minLength(this.ingredientMinLength),
          Validators.maxLength(this.ingredientMaxLength)
        ])),
        ingredients: new FormControl('', Validators.min(1)),
        symptoms: new FormControl('', {}),
        date: new FormControl(new Date().toISOString(), {})
      });
    }
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid && this.note.ingredients.length > 0 && !this.insertedIngredientAlreadyExists;
      this.isValidIngredient = this.form.get('ingredient').valid && this.ingredient.length > 0;
      this.insertedIngredientAlreadyExists = this.insertedIngredientExists();
    });
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  addIngredient() {
    if (!this.isValidIngredient || this.insertedIngredientAlreadyExists) {
      return;
    }

    var temp = this.ingredient.trim().toLowerCase();
    var ingredientName = temp.charAt(0).toUpperCase() + temp.slice(1);

    this.note.ingredients.push({ name: ingredientName });
    this.ingredient = '';
  }

  insertedIngredientExists() {
    var ingredient = this.ingredient.trim().toLowerCase();
    var ingredientName = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);

    if (this.note.ingredients.findIndex(ing => ing.name == ingredientName) !== -1) {
      return true;
    }
    return false;
  }

  deleteIngredient(chip: Element, ingredient) {
    chip.remove();
    this.note.ingredients.splice(this.note.ingredients.findIndex(ing => ing.name == ingredient), 1);
    if (this.note.ingredients.length == 0) {
      this.isReadyToSave = false;
    }
  }

  editSymptoms() {
    let createNoteModal = this.modalCtrl.create('SymptomsPage', {
      symptoms: this.symptoms
    });
    createNoteModal.onWillDismiss(() => {
      for (let i = 0; i < this.symptomsInNote.length; i++) {
        var symptomInNote = this.symptomsInNote[i];
        if (this.symptoms.findIndex(s => s.name == symptomInNote) == -1) {
          this.symptomsInNote.splice(i, 1);
        }
      }
    })
    createNoteModal.present();
  }

  done() {
    this.note.meal = this.form.value.meal;

    for (let i = 0; i < this.symptomsInNote.length; i++) {
      const symptomName = this.symptomsInNote[i];
      const symptom = this.symptoms[this.symptoms.findIndex(s => s.name == symptomName)];
      this.note.symptoms.push({ id: symptom.id, name: symptom.name });
    }

    this.note.symptoms.length > 0 ? this.note.bad = true : this.note.bad = false;

    var date = new Date(this.form.value.date);
    console.log(date);

    this.note.date = this.datepipe.transform(date, 'dd/MM/yyyy');
    console.log(this.note.date);

    this.appProv.refreshStatistics = true;

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
}
