import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tableau-de-bord',
    pathMatch: 'full'
  },
  { path: 'tableau-de-bord', loadChildren: './accueil/tableau-de-bord/tableau-de-bord.module#TableauDeBordPageModule' },
  { path: 'mon-institution', loadChildren: './institution/mon-institution/mon-institution.module#MonInstitutionPageModule' },
  { path: 'partenaires', loadChildren: './institution/partenaire/partenaire.module#PartenairePageModule' },
  { path: 'unions', loadChildren: './institution/union/union.module#UnionPageModule' },
  { path: 'ops', loadChildren: './institution/op/op.module#OpPageModule' },
  //{ path: /*'institution/*/'membres', loadChildren: './institution/membre/membre.module#MembrePageModule' },
  { path: 'personnes', loadChildren: './institution/personnes/personnes.module#PersonnesPageModule' },
  { path: /*configuration/*/'champ', loadChildren: './institution/champ/champ.module#ChampPageModule' },
  { path: 'station-meteo', loadChildren: './institution/station-meteo/station-meteo.module#StationMeteoPageModule' },
  { path: 'pluviometrie', loadChildren: './institution/pluviometrie/pluviometrie.module#PluviometriePageModule' },
    
  { path: /*recherche/*/'projets', loadChildren: './recherche/projet/projet.module#ProjetPageModule' },
  { path: 'protocoles', loadChildren: './recherche/protocole/protocole.module#ProtocolePageModule' },
  //{ path: 'traitements', loadChildren: './recherche/traitement/traitement.module#TraitementPageModule' },
  { path: 'essais', loadChildren: './recherche/essai/essai.module#EssaiPageModule' },
  { path: 'pluviometrie', loadChildren: './recherche/pluviometrie/pluviometrie.module#PluviometriePageModule' },
  { path: 'typologie', loadChildren: './recherche/typologie/typologie.module#TypologiePageModule' },
  //{ path: 'formulaire', loadChildren: './recherche/formulaire/formulaire.module#FormulairePageModule' },
  { path: 'formulaire-protocole', loadChildren: './recherche/formulaire-protocole/formulaire-protocole.module#FormulaireProtocolePageModule' },
  
  { path: /*rapports/*/'restitution', loadChildren: './rapports/restitution/restitution.module#RestitutionPageModule' },
  { path: 'statistiques', loadChildren: './rapports/statistiques/statistiques.module#StatistiquesPageModule' },
  
  { path: /*localite/*/'pays', loadChildren: './localite/pays/pays.module#PaysPageModule' },
  //{ path: 'pays', loadChildren: './localite/pays/pays.module#PaysPageModule' },
  { path: 'regions', loadChildren: './localite/region/region.module#RegionPageModule' },
  { path: 'regions/pays/:codePays', loadChildren: './localite/region/region.module#RegionPageModule' },
  { path: 'communes', loadChildren: './localite/commune/commune.module#CommunePageModule' },
  { path: 'departements', loadChildren: './localite/departement/departement.module#DepartementPageModule' },
  { path: 'localites', loadChildren: './localite/localite/localite.module#LocalitePageModule' },
  
  //{ path: 'membre', loadChildren: './configuration/membre/membre.module#MembrePageModule' },
  //{ path: 'op', loadChildren: './configuration/op/op.module#OpPageModule' },
  //{ path: 'union', loadChildren: './configuration/union/union.module#UnionPageModule' },
  //{ path: 'partenaire', loadChildren: './configuration/partenaire/partenaire.module#PartenairePageModule' },
  { path: 'profession', loadChildren: './configuration/profession/profession.module#ProfessionPageModule' },
  { path: 'ethnie', loadChildren: './configuration/ethnie/ethnie.module#EthniePageModule' },
  { path: 'type-sole', loadChildren: './configuration/type-sole/type-sole.module#TypeSolePageModule' },
  { path: 'conf-serveur', loadChildren: './configuration/conf-serveur/conf-serveur.module#ConfServeurPageModule' },
  
  { path: /*administration/*/'modules', loadChildren: './administration/modules/modules.module#ModulesPageModule' },
  { path: 'groupes', loadChildren: './administration/groupes/groupes.module#GroupesPageModule' },
  { path: 'utilisateurs', loadChildren: './administration/utilisateurs/utilisateurs.module#UtilisateursPageModule' },
  { path: 'serveur', loadChildren: './administration/serveur/serveur.module#ServeurPageModule' },
  { path: 'bd-locale', loadChildren: './administration/bd-locale/bd-locale.module#BDLocalePageModule' },
  
  { path: 'connexion', loadChildren: './utilisateur/connexion/connexion.module#ConnexionPageModule' },
  { path: 'profil', loadChildren: './utilisateur/profil/profil.module#ProfilPageModule' },
  { path: 'changer-md-passe', loadChildren: './utilisateur/changer-md-passe/changer-md-passe.module#ChangerMdPassePageModule' },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
