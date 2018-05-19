import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  lang = 'eng';

  constructor(private storage: Storage, private translate: TranslateService, private navCtrl: NavController) {
    this.storage.get('lang').then(val => {
      if (val) {
        this.lang = val
        translate.use(val)
      } else {
        this.lang = 'eng';
      }
    })
  }

  changeLanguage() {
    this.translate.use(this.lang);
    this.storage.set('lang', this.lang);
  }

  about() {
    this.navCtrl.push('AboutPage');
  }
}
