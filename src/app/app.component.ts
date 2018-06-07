import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { FirstRunPage } from '../pages/pages';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})

export class MyApp {

  rootPage = FirstRunPage;

  constructor(storage: Storage, translate: TranslateService) {
    translate.setDefaultLang('est')

    storage.get('lang').then(val => {
      if (val) {
        translate.use(val)
      } else {
        storage.set('lang', 'en');
      }
    })
  }
}
