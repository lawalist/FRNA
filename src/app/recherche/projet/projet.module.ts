import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RelationsProjetComponent } from '../../component/relations-projet/relations-projet.component';
import { File } from '@ionic-native/file/ngx';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
  }
import { LongPressModule } from 'ionic-long-press';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { IonicModule } from '@ionic/angular';

import { ProjetPage } from './projet.page';

const routes: Routes = [
  {
    path: '',
    component: ProjetPage
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
    CKEditorModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RouterModule.forChild(routes)
  ],
  declarations: [ProjetPage, RelationsProjetComponent],
  entryComponents: [RelationsProjetComponent],
  providers: [File]
})
export class ProjetPageModule {}
