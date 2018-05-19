import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class AppProvider {

  lang = 'en';
  updateStatistics = true;
  updateNotes = true;

  constructor(private storage: Storage, private translate: TranslateService, private toasts: ToastController) {
    translate.setDefaultLang('en')
    storage.get('lang').then(val => {
      if (val) {
        console.log('Saved language=', val);
        translate.use(val)
      }
    })
  }

  toast(msg: string, time: number, pos: string) {
    this.translate.get('OK').subscribe(val => {
      let toast = this.toasts.create({
        message: msg,
        duration: time,
        position: pos,
        showCloseButton: true,
        closeButtonText: val
      });
      toast.present();
    })
  }

  langage(lang) {
    this.lang = lang;
    this.translate.use(lang);
    this.storage.set('lang', lang);
  }
}
