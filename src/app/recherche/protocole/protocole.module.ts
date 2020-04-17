import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RelationsProtocoleComponent } from '../../component/relations-protocole/relations-protocole.component';
import { File } from '@ionic-native/file/ngx';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
  }


  import { LongPressModule } from 'ionic-long-press';
import { IonicModule } from '@ionic/angular';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ProtocolePage } from './protocole.page';

const routes: Routes = [
  {
    path: '',
    component: ProtocolePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CKEditorModule,
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
  declarations: [ProtocolePage, RelationsProtocoleComponent],
  entryComponents: [RelationsProtocoleComponent],
  providers: [File]
})
export class ProtocolePageModule {}
