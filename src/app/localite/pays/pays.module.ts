import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
//import { ActionComponent } from '../../../app/component/action/action.component';
import { RelationsPaysComponent } from '../../../app/component/relations-pays/relations-pays.component';
import { File } from '@ionic-native/file/ngx';

import { IonicModule } from '@ionic/angular';

import { PaysPage } from './pays.page';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
  }
const routes: Routes = [
  {
    path: '',
    component: PaysPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RouterModule.forChild(routes)
  ],
  declarations: [PaysPage/*, ActionComponent*/, RelationsPaysComponent],
  entryComponents: [/*ActionComponent,*/ RelationsPaysComponent],
  providers: [File]
})
export class PaysPageModule {}
