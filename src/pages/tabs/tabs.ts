import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular'; //Platform

import { Tab1Root } from '../pages';
import { Tab2Root } from '../pages';
import { Tab3Root } from '../pages';

import { StatisticsProvider } from '../../providers/statistics/statistics';
import { NotesProvider } from '../../providers/notes/notes';
import { AppProvider } from '../../providers/app/app';
//import { SplashScreen } from '@ionic-native/splash-screen';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = Tab1Root;
  tab2Root: any = Tab2Root;
  tab3Root: any = Tab3Root;

  constructor(private ap: AppProvider, private sp: StatisticsProvider, private np: NotesProvider) {
  }

  //private platform: Platform, private spalshScreen: SplashScreen,

  //ionViewDidEnter() {
    //this.platform.ready().then(() => {
    //  this.spalshScreen.hide();
    //});
  //}
}
