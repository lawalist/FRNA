import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { LongPressModule } from 'ionic-long-press';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
  }


import { IonicModule } from '@ionic/angular';

import { UtilisateursPage } from './utilisateurs.page';
import { FiltrePartenaireComponent } from 'src/app/component/filtre-partenaire/filtre-partenaire.component';
import { FiltreUnionComponent } from 'src/app/component/filtre-union/filtre-union.component';
import { FiltrePersonneComponent } from 'src/app/component/filtre-personne/filtre-personne.component';
import { FiltreProjetComponent } from 'src/app/component/filtre-projet/filtre-projet.component';
import { FiltreProtocoleComponent } from 'src/app/component/filtre-protocole/filtre-protocole.component';
import { FiltreOpComponent } from 'src/app/component/filtre-op/filtre-op.component';
import { FiltrePaysComponent } from 'src/app/component/filtre-pays/filtre-pays.component';
import { FiltreRegionComponent } from 'src/app/component/filtre-region/filtre-region.component';
import { FiltreDepartementComponent } from 'src/app/component/filtre-departement/filtre-departement.component';
import { FiltreCommuneComponent } from 'src/app/component/filtre-commune/filtre-commune.component';

const routes: Routes = [
  {
    path: '',
    component: UtilisateursPage
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
  declarations: [UtilisateursPage, FiltrePaysComponent, FiltreRegionComponent, FiltreDepartementComponent, FiltreCommuneComponent, FiltrePartenaireComponent, FiltreUnionComponent, FiltreOpComponent, FiltrePersonneComponent, FiltreProjetComponent, FiltreProtocoleComponent],
  entryComponents: [FiltrePaysComponent, FiltreRegionComponent, FiltreDepartementComponent, FiltreCommuneComponent, FiltrePartenaireComponent, FiltreUnionComponent, FiltreOpComponent, FiltrePersonneComponent, FiltreProjetComponent, FiltreProtocoleComponent],
})
export class UtilisateursPageModule {}
