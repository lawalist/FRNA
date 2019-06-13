import { NgModule, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { PopoverComponent } from '../app/component/popover/popover.component';
import { ActionComponent } from '../app/component/action/action.component';

import { IonicStorageModule } from '@ionic/storage';
import { RegionPageModule } from './localite/region/region.module';
import { PaysPageModule } from './localite/pays/pays.module';
import { DepartementPageModule } from './localite/departement/departement.module';
import { CommunePageModule } from './localite/commune/commune.module';
import { VillagePageModule } from './localite/village/village.module';


//Activé angular en mode production
enableProdMode();
//Pour la traduction
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
  declarations: [AppComponent, PopoverComponent, ActionComponent],
  entryComponents: [PopoverComponent, ActionComponent],
  imports: [
    BrowserModule,
    HttpClientModule, 
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    PaysPageModule,
    RegionPageModule,
    DepartementPageModule,
    CommunePageModule,
    VillagePageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
