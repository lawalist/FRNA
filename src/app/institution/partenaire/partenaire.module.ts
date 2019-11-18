import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation/ngx';
//import { RelationsPartenaireComponent } from '../../component/relations-partenaire/relations-partenaire.component';
import { File } from '@ionic-native/file/ngx';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
  }


import { IonicModule } from '@ionic/angular';

import { PartenairePage } from './partenaire.page';
import { LongPressModule } from 'ionic-long-press';

const routes: Routes = [
  {
    path: '',
    component: PartenairePage
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
    RouterModule.forChild(routes),
  ],
  declarations: [PartenairePage/*, RelationsPartenaireComponent*/],
  //entryComponents: [RelationsPartenaireComponent],
  providers: [File, Geolocation]
})
export class PartenairePageModule {}
