import { Component } from '@angular/core';
import { IonicPage, LoadingController, Platform } from 'ionic-angular';
import { StatisticsProvider } from '../../providers/statistics/statistics';
import { AppProvider } from '../../providers/app/app';
import { TranslateService } from '@ngx-translate/core';
import { SymptomsProvider } from '../../providers/symptoms/symptoms';


@IonicPage()
@Component({
  selector: 'page-statistics',
  templateUrl: 'statistics.html',
})
export class StatisticsPage {

  statistics = [];
  symptoms = [];
  // symptom: any;

  symptomsFilter = [];

  tabBarElement: any;
  splash = true;

  constructor(private appProv: AppProvider, private platform: Platform, private loadingCtrl: LoadingController, private symptomsProv: SymptomsProvider, private statisticsProv: StatisticsProvider, private translate: TranslateService) {
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
    }, 2900);
  }

  load() {
    this.translate.get('LOADING_MESSAGE').subscribe(val => {
      let loader = this.loadingCtrl.create({
        content: val,
        duration: 5000
      });
      if (!this.splash) {
        loader.present();
      }
      Promise.all([
        this.symptomsProv.getAll().then(data => {
          this.symptoms = data;
        }),
        this.statisticsProv.getAll(this.symptomsFilter).then(data => {
          this.statistics = data;
        })
      ]).then(() => {
        setTimeout(() => {
          loader.dismiss();
        }, 1000);
      });
    });
  }

  doRefresh(refresher) {
    Promise.all([
      this.symptomsProv.getAll().then(data => {
        this.symptoms = data;
      }),
      this.statisticsProv.getAll(this.symptomsFilter).then(data => {
        this.statistics = data;
      })
    ]).then(() => {
      setTimeout(() => {
        refresher.complete();
      }, 1000);
    });
  }

  applySymtomsFilter(s): void {
    console.log(s);
    this.symptomsFilter = s;
    this.load();
  }
}
