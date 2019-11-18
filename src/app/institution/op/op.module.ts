import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { RelationsOpComponent } from '../../component/relations-op/relations-op.component';
import { File } from '@ionic-native/file/ngx';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
  }


import { IonicModule } from '@ionic/angular';

import { OpPage } from './op.page';
import { LongPressModule } from 'ionic-long-press';

const routes: Routes = [
  {
    path: '',
    component: OpPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LongPressModule,
    IonicModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RouterModule.forChild(routes)
  ],
  declarations: [OpPage, RelationsOpComponent],
  entryComponents: [RelationsOpComponent],
  providers: [File, Geolocation]
})
export class OpPageModule {}
