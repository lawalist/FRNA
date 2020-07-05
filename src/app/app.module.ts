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

import { IonicSelectableModule } from 'ionic-selectable';

import { PopoverComponent } from '../app/component/popover/popover.component';
import { ActionComponent } from '../app/component/action/action.component';
import { ActionDatatableComponent } from '../app/component/action-datatable/action-datatable.component';

import { IonicStorageModule } from '@ionic/storage';
import { RegionPageModule } from './localite/region/region.module';
import { PaysPageModule } from './localite/pays/pays.module';
import { DepartementPageModule } from './localite/departement/departement.module';
import { CommunePageModule } from './localite/commune/commune.module';
import { LocalitePageModule } from './localite/localite/localite.module';
import { DatatableMoreComponent } from './component/datatable-more/datatable-more.component';
import { DatatableConstructComponent } from './component/datatable-construct/datatable-construct.component';
import { SelectionComponent } from './component/selection/selection.component';
import { DerniereModificationComponent } from './component/derniere-modification/derniere-modification.component';
import { ListeMoreComponent } from './component/liste-more/liste-more.component';
import { ListeActionComponent } from './component/liste-action/liste-action.component';
import { PartenairePageModule } from './institution/partenaire/partenaire.module';
import { UnionPageModule } from './institution/union/union.module';
import { OpPageModule } from './institution/op/op.module';
import { RelationsPartenaireComponent } from './component/relations-partenaire/relations-partenaire.component';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Sim } from '@ionic-native/sim/ngx';
import { Device } from '@ionic-native/device/ngx';
import { ProjetPageModule } from './recherche/projet/projet.module';
import { FormulaireProtocolePageModule } from './recherche/formulaire-protocole/formulaire-protocole.module';
import { PersonnesPageModule } from './institution/personnes/personnes.module';
import { ChampPageModule } from './institution/champ/champ.module';
import { EssaiPageModule } from './recherche/essai/essai.module';
import { ProtocolePageModule } from './recherche/protocole/protocole.module';
import { ConnexionPageModule } from './utilisateur/connexion/connexion.module';
import { ProfilPageModule } from './utilisateur/profil/profil.module';


//Activé angular en mode production
enableProdMode();
//Pour la traduction
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
  declarations: [AppComponent, PopoverComponent, ActionComponent, RelationsPartenaireComponent, ListeMoreComponent, ListeActionComponent, ActionDatatableComponent, SelectionComponent, DatatableMoreComponent, DatatableConstructComponent, DerniereModificationComponent],
  entryComponents: [PopoverComponent, ActionComponent, RelationsPartenaireComponent, ListeMoreComponent, ListeActionComponent, ActionDatatableComponent, SelectionComponent, DatatableMoreComponent, DatatableConstructComponent, DerniereModificationComponent],
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
    IonicSelectableModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    PaysPageModule,
    RegionPageModule,
    DepartementPageModule,
    CommunePageModule,
    LocalitePageModule,
    PartenairePageModule,
    UnionPageModule,
    OpPageModule,
    PersonnesPageModule,
    ChampPageModule,
    EssaiPageModule,
    ProjetPageModule,
    ProtocolePageModule,
    FormulaireProtocolePageModule,
    ConnexionPageModule,
    ProfilPageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    PhotoViewer,
    Crop,
    Camera,
    Sim,
    Device,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
