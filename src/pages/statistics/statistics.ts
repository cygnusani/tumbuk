import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { StatisticsProvider } from '../../providers/statistics/statistics';
import { AppProvider } from '../../providers/app/app';

/**
 * Generated class for the StatisticsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-statistics',
  templateUrl: 'statistics.html',
})
export class StatisticsPage {
  statistics = [];

  constructor(private appProv: AppProvider, private platform: Platform, public loadingCtrl: LoadingController, public navCtrl: NavController, public navParams: NavParams, private statisticsProv: StatisticsProvider) {
  }

  ionViewWillEnter() {
    if (!this.appProv.updateStatistics) { return; }
    this.appProv.updateStatistics = false;
    let loader = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
    this.platform.ready().then(() => {
      this.statisticsProv.getAll().then(data => {
        this.statistics = data;
        loader.dismiss();
      })
    })
  }
  
  doRefresh(refresher) {
    setTimeout(() => {
      refresher.complete();
    }, 1000);
    this.statisticsProv.getAll().then(data => {
      this.statistics = data;
      refresher.complete();
    })
  }
}
