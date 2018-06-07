import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { DatePipe } from '@angular/common';
import { SQLite } from '@ionic-native/sqlite';
import { AppProvider } from '../providers/app/app';
import { SymptomsProvider } from '../providers/symptoms/symptoms';
import { StatisticsProvider } from '../providers/statistics/statistics';
import { NotesProvider } from '../providers/notes/notes';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    SplashScreen,
    StatusBar,
    DatePipe,
    SQLite,
    AppProvider,
    SymptomsProvider,
    StatisticsProvider,
    NotesProvider,
  ]
})
export class AppModule { }
