import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage } from 'ionic-angular'; //NavController

import { Tab1Root } from '../pages';
import { Tab2Root } from '../pages';
import { StatisticsProvider } from '../../providers/statistics/statistics';
import { NotesProvider } from '../../providers/notes/notes';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = Tab1Root;
  tab2Root: any = Tab2Root;

  tab1Title = " ";
  tab2Title = " ";

  constructor(public translateService: TranslateService, sp: StatisticsProvider, np: NotesProvider) {
    translateService.get(['TAB1_TITLE', 'TAB2_TITLE', 'TAB3_TITLE']).subscribe(values => {
      this.tab1Title = values['TAB1_TITLE'];
      this.tab2Title = values['TAB2_TITLE'];
    });
  }

}
