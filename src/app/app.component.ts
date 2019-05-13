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
      title: 'Acceuil',
      url: '/home',
      icon: 'home',
      open: false
    },
    {
      title: 'Institution',
      icon: 'logo-ionic',
      open: false,
      children: [
        {
          title: 'Fédérations',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Unions',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'OPs',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Membres/Producteurs',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Autres partenaires',
          url: '#',
          icon: 'logo-google'
        },
      ]
    },
    {
      title: 'Recherche',
      icon: 'logo-ionic',
      open: false,
      children: [
        {
          title: 'Projets',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Protocoles',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Traitements',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Essais',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Pluviométrie',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Typologie',
          url: '#',
          icon: 'logo-google'
        }
      ]
    },
    {
      title: 'Rapport',
      icon: 'logo-ionic',
      open: false,
      children: [
        {
          title: 'Restitution',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Statistiques',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Autres',
          url: '#',
          icon: 'logo-ionic'
        }
      ]
    },
    {
      title: 'Localités',
      icon: 'logo-ionic',
      open: false,
      children: [
        {
          title: 'Pays',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Régions',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Communes',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Départments',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Villages',
          url: '#',
          icon: 'logo-google'
        }
      ]
    },
    {
      title: 'Configuration',
      icon: 'logo-ionic',
      open: false,
      children: [
        {
          title: 'Fédération',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Union',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'OP',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Membre',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Autre partanaire',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Champ',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Variables essais',
          url: '#',
          icon: 'logo-google'
        },
        {
          title: 'Membre',
          url: '#',
          icon: 'logo-google'
        }
      ]
    },
    {
      title: 'Administration',
      icon: 'logo-ionic',
      open: false,
      children: [
        {
          title: 'Gestion des utilisateurs',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Ajout/mise à jour filtre local',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Ajout/mise à jour filtre serveur',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Vider la corbeille',
          url: '#',
          icon: 'logo-ionic'
        },
        {
          title: 'Réinitialiser la BD',
          url: '#',
          icon: 'logo-google'
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

  boutonMenuControl(){
    this.boutonMenuClass = !this.boutonMenuClass;
  }
}
