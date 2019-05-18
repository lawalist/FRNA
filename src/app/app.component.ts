import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
}) 
export class AppComponent {
  public boutonMenuClass = false;
  public appPages = [
    {
      title: 'Accueil',
      url: '/home',
      icon: 'home',
      open: false
    },
    {
      title: 'Institution',
      //icon: 'logo-ionic',
      src: '../assets/svgs/university.svg',
      open: false,
      children: [
        {
          title: 'Partenaires',
          url: '/institution/partenaires',
          icon: 'document',
          color: ''
        },
        {
          title: 'Unions',
          url: '/institution/unions',
          icon: 'document',
          color: ''
        },
        {
          title: 'OPs',
          url: '/institution/ops',
          icon: 'document',
          color: ''
        },
        {
          title: 'Membres/Producteurs',
          url: '/institution/membres',
          icon: 'document',
          color: ''
        }
      ]
    },
    {
      title: 'Recherche',
      icon: 'medkit',
      open: false,
      children: [
        {
          title: 'Projets',
          url: '/recherche/projets',
          icon: 'folder',
          color: ''
        },
        {
          title: 'Protocoles',
          url: '/recherche/protocoles',
          icon: 'document',
          color: ''
        },
        {
          title: 'Traitements',
          url: '/recherche/traitements',
          icon: 'document',
          color: ''
        },
        {
          title: 'Essais',
          url: '/recherche/essais',
          icon: 'document',
          color: ''
        },
        {
          title: 'Pluviométrie',
          url: '/recherche/pluviometrie',
          icon: 'document',
          color: ''
        },
        {
          title: 'Typologie',
          url: '/recherche/typologie',
          icon: 'document',
          color: ''
        }
      ]
    },
    {
      title: 'Rapport',
      icon: 'stats',
      open: false,
      children: [
        {
          title: 'Restitution',
          url: '/rapports/restitution',
          icon: 'document',
          color: ''
        },
        {
          title: 'Statistiques',
          url: '/rapports/statistiques',
          icon: 'document',
          color: ''
        }
      ]
    },
    {
      title: 'Localités',
      icon: 'planet',
      open: false,
      children: [
        {
          title: 'Pays',
          url: '/localite/pays',
          icon: 'document',
          color: ''
        },
        {
          title: 'Régions',
          url: '/localite/regions',
          icon: 'document',
          color: ''
        },
        {
          title: 'Communes',
          url: '/localite/communes',
          icon: 'document',
          color: ''
        },
        {
          title: 'Départments',
          url: '/localite/departements',
          icon: 'document',
          color: ''
        },
        {
          title: 'Villages',
          url: '/localite/villages',
          icon: 'document',
          color: ''
        }
      ]
    },
    {
      title: 'Configuration',
      icon: 'construct',
      open: false,
      children: [
        {
          title: 'Partenaire',
          url: '/configuration/partenaire',
          icon: 'document',
          color: ''
        },
        {
          title: 'Union',
          url: '/configuration/union',
          icon: 'document',
          color: ''
        },
        {
          title: 'OP',
          url: '/configuration/op',
          icon: 'document',
          color: ''
        },
        {
          title: 'Membre',
          url: '/configuration/membre',
          icon: 'document',
          color: ''
        },
        {
          title: 'Champ',
          url: '/configuration/champ',
          icon: 'document',
          color: ''
        }
      ]
    },
    {
      title: 'Administration',
      icon: 'settings',
      open: false,
      children: [
        {
          title: 'Gestion des utilisateurs',
          url: '#',
          icon: 'document',
          color: ''
        },
        {
          title: 'Ajouter filtre local',
          url: '#',
          //icon: 'document',
          src: '../assets/svgs/upload.svg',
          color: ''
        },
        {
          title: 'Ajouter filtre serveur',
          url: '#',
          icon: 'cloud-upload',
          color: ''
        },
        {
          title: 'Vider la corbeille',
          url: '#',
          icon: 'trash',
          color: ''
        },
        {
          title: 'Réinitialiser la BD',
          url: '#',
          icon: 'document',
          color: 'danger'
        }
      ]
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  derouler(i){
      this.appPages[i].open = !this.appPages[i].open;
      this.appPages.forEach((p, index) =>{
        if(i != index && p.open){
          p.open = false;
        }
      })
  }

  replier(){
    this.appPages.forEach((p, index) =>{
      if(p.open)
        p.open = false;
    })
  }

  boutonMenuControl(){
    this.boutonMenuClass = !this.boutonMenuClass;
  }
}
