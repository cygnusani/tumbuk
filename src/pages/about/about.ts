import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { AppProvider } from '../../providers/app/app';


@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  appVersion = 0;

  constructor(private appProv: AppProvider) {
    this.appVersion = appProv.version;
  }

}
