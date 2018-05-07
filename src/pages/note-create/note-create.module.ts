import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NoteCreatePage } from './note-create';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    NoteCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(NoteCreatePage),
    TranslateModule.forChild()
  ],
})
export class NoteCreatePageModule {}
