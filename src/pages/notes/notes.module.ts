import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotesPage } from './notes';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    NotesPage,
  ],
  imports: [
    IonicPageModule.forChild(NotesPage),
    TranslateModule.forChild()
  ],
})
export class NotesPageModule {}
