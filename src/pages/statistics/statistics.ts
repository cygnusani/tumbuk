import { Component } from '@angular/core';
import { IonicPage, LoadingController, Platform } from 'ionic-angular';
import { StatisticsProvider } from '../../providers/statistics/statistics';
import { AppProvider } from '../../providers/app/app';
import { TranslateService } from '@ngx-translate/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SymptomsProvider } from '../../providers/symptoms/symptoms';


@IonicPage()
@Component({
  selector: 'page-statistics',
  templateUrl: 'statistics.html',
})
export class StatisticsPage {
  statistics = [];
  symptoms = [];
  symptom: any;

  symptomsFilter = [];

  tabBarElement: any;
  splash = true;

  constructor(private splashScreen: SplashScreen, private appProv: AppProvider, private platform: Platform, private loadingCtrl: LoadingController, private symptomsProv: SymptomsProvider, private statisticsProv: StatisticsProvider, private translate: TranslateService) {
    this.tabBarElement = document.querySelector('.tabbar');
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      if (!this.appProv.refreshStatistics) { return; }
      this.appProv.refreshStatistics = false;
      this.load();
    });
  }

  ionViewDidLoad() {
    this.tabBarElement.style.display = 'none';
    setTimeout(() => {
      this.splash = false;
      this.tabBarElement.style.display = 'flex';
    }, 5000);
  }

  load() {
    this.translate.get('LOADING_MESSAGE').subscribe(val => {
      let loader = this.loadingCtrl.create({
        //spinner: "dots",
        content: "Please wait...",
        duration: 5000
      });
      if (!this.splash) {
        loader.present();
      }
      this.symptomsProv.getAll().then(data => {
        this.symptoms = data;
      }).then(() => {
        this.statisticsProv.getAll(this.symptomsFilter).then(data => {
          this.statistics = data;
          loader.dismiss();
        });
      });
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      refresher.complete();
    }, 5000);
    this.symptomsProv.getAll().then(data => {
      this.symptoms = data;
    }).then(() => {
      this.statisticsProv.getAll(this.symptomsFilter).then(data => {
        this.statistics = data;
        refresher.complete();
      });
    });
  }

  applySymtomsFilter(s): void {
    this.symptomsFilter = s;
    this.load();
  }
}
