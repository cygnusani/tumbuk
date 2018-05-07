import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NotesProvider } from '../../providers/notes/notes';
import { Note } from '../../models/note';

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

  isNew = false;

  form: FormGroup;

  constructor(private navParams: NavParams, private viewCtrl: ViewController, private formBuilder: FormBuilder, private datepipe: DatePipe, private notesProv: NotesProvider) {
  }

  ngOnInit() {
    const n = this.navParams.get('note');
    if (n) {
      this.navParams.data.note = null;
      this.note = new Note({ id: n.id, meal: n.meal, ingredients: [], bad: n.bad, date: n.date });

      for (let i = 0; i < n.ingredients.length; i++) {
        const ingredient = n.ingredients[i].name;
        this.note.ingredients.push({ name: ingredient });
      }

      var dateParts = this.note.date.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

      this.form = this.formBuilder.group({
        meal: [this.note.meal, Validators.required],
        ingredients: [this.note.ingredients],
        bad: [this.note.bad],
        date: [dateObject.toISOString()]
      });

      this.isReadyToSave = true;
    } else {
      this.isNew = true;

      let date = new Date();
      let latest = this.datepipe.transform(date, 'dd/MM/yyyy');

      this.note = { id: -1, meal: '', ingredients: [], bad: false, date: latest }
      this.form = this.formBuilder.group({
        meal: ['', Validators.required],
        ingredients: [''],
        bad: [false],
        date: [new Date().toISOString()]
      });
    }
    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  /**
   *
   */
  addIngredient() {
    var ingredient = this.ingredient.trim().toLowerCase();
    console.log(ingredient);
    if (ingredient.length == 0) {

      // TODO

      console.log('empty');
      return;
    }
    if (this.note.ingredients.findIndex(ing => ing.name == ingredient) !== -1) {

      // TODO

      console.log('exists');
      return;
    }
    this.note.ingredients.push({ name: ingredient });
    this.ingredient = '';
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
    if (this.note.ingredients.length == 0) { return; }

    this.note.meal = this.form.value.meal;
    this.note.bad = this.form.value.bad.toString();

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
}
