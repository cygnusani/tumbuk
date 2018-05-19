import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SymptomsPage } from './symptoms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SymptomsPage,
  ],
  imports: [
    IonicPageModule.forChild(SymptomsPage),
    TranslateModule.forChild()
  ],
})
export class SymptomsPageModule {}
