import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tableau-de-bord',
    pathMatch: 'full'
  },
  { path: 'tableau-de-bord', loadChildren: './accueil/tableau-de-bord/tableau-de-bord.module#TableauDeBordPageModule' },
  { path: 'institution/partenaires', loadChildren: './institution/partenaire/partenaire.module#PartenairePageModule' },
  { path: 'institution/unions', loadChildren: './institution/union/union.module#UnionPageModule' },
  { path: 'institution/ops', loadChildren: './institution/op/op.module#OpPageModule' },
  { path: 'institution/membres', loadChildren: './institution/membre/membre.module#MembrePageModule' },
  
  { path: 'recherche/projets', loadChildren: './recherche/projet/projet.module#ProjetPageModule' },
  { path: 'recherche/protocoles', loadChildren: './recherche/protocole/protocole.module#ProtocolePageModule' },
  { path: 'recherche/traitements', loadChildren: './recherche/traitement/traitement.module#TraitementPageModule' },
  { path: 'recherche/essais', loadChildren: './recherche/essai/essai.module#EssaiPageModule' },
  { path: 'recherche/pluviometrie', loadChildren: './recherche/pluviometrie/pluviometrie.module#PluviometriePageModule' },
  { path: 'recherche/typologie', loadChildren: './recherche/typologie/typologie.module#TypologiePageModule' },

  { path: 'rapports/restitution', loadChildren: './rapports/restitution/restitution.module#RestitutionPageModule' },
  { path: 'rapports/statistiques', loadChildren: './rapports/statistiques/statistiques.module#StatistiquesPageModule' },
  
  { path: 'localite/pays', loadChildren: './localite/pays/pays.module#PaysPageModule' },
  //{ path: 'pays', loadChildren: './localite/pays/pays.module#PaysPageModule' },
  { path: 'localite/regions', loadChildren: './localite/region/region.module#RegionPageModule' },
  { path: 'localite/regions/pays/:codePays', loadChildren: './localite/region/region.module#RegionPageModule' },
  { path: 'localite/communes', loadChildren: './localite/commune/commune.module#CommunePageModule' },
  { path: 'localite/departements', loadChildren: './localite/departement/departement.module#DepartementPageModule' },
  { path: 'localite/villages', loadChildren: './localite/village/village.module#VillagePageModule' },
  
  { path: 'configuration/membre', loadChildren: './configuration/membre/membre.module#MembrePageModule' },
  { path: 'configuration/op', loadChildren: './configuration/op/op.module#OpPageModule' },
  { path: 'configuration/union', loadChildren: './configuration/union/union.module#UnionPageModule' },
  { path: 'configuration/partenaire', loadChildren: './configuration/partenaire/partenaire.module#PartenairePageModule' },
  { path: 'configuration/champ', loadChildren: './configuration/champ/champ.module#ChampPageModule' },
  
  { path: 'administration/modules', loadChildren: './administration/modules/modules.module#ModulesPageModule' },
  { path: 'administration/utilisateurs', loadChildren: './administration/utilisateurs/utilisateurs.module#UtilisateursPageModule' },
  { path: 'administration/localites', loadChildren: './administration/localites/localites.module#LocalitesPageModule' },
  { path: 'administration/serveur', loadChildren: './administration/serveur/serveur.module#ServeurPageModule' },
  { path: 'administration/bd-locale', loadChildren: './administration/bd-locale/bd-locale.module#BDLocalePageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
