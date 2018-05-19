import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirstRunPage } from '../pages/pages';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})

export class MyApp {

  rootPage = FirstRunPage;

  constructor(storage: Storage, translate: TranslateService, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, screenOrientation: ScreenOrientation) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      screenOrientation.lock(screenOrientation.ORIENTATIONS.PORTRAIT);

      // set status bar to dark purple
      statusBar.backgroundColorByHexString('#443c50');

      //splashScreen.hide();
    });

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
