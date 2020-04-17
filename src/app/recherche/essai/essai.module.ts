import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
  }


import { LongPressModule } from 'ionic-long-press';

import { IonicModule } from '@ionic/angular';

import { EssaiPage } from './essai.page';

const routes: Routes = [
  {
    path: '',
    component: EssaiPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
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
  declarations: [EssaiPage],
  providers: [File]
})
export class EssaiPageModule {}
