import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { IonicModule } from '@ionic/angular';

import { RegionPage } from './region.page';

//import { ActionComponent } from '../../../app/component/action/action.component';
import { RelationsRegionComponent } from '../../../app/component/relations-region/relations-region.component';
import { File } from '@ionic-native/file/ngx';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LongPressModule } from 'ionic-long-press';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
  }

const routes: Routes = [
  {
    path: '',
    component: RegionPage
  }
]; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    LongPressModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RouterModule.forChild(routes)
  ],
  declarations: [RegionPage/*, ActionComponent*/, RelationsRegionComponent],
  entryComponents: [/*ActionComponent, */RelationsRegionComponent],
  providers: [File, Geolocation]
})
export class RegionPageModule {}
