import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';

import { global } from '../app/globale/variable';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
}) 
export class AppComponent {
  public boutonMenuClass = false;
  //public language: string;
  public appPages = [
    {
      title: 'Tableau de bord',
      url: '/tableau-de-bord',
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
          title: 'Départments',
          url: '/localite/departements',
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
    private statusBar: StatusBar,
    private translate: TranslateService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initTranslate();
    });
  }

  /*ionViewDidEnter(): void {
    // initialize
    this.initTranslate()
  }*/

  initialiseTranslation(){
    this.translate.get('MENU.TABLEAU_DE_BORD').subscribe((res: string) => {
      this.appPages[0].title = res;
    });

    //institution
    this.translate.get('MENU.INSTITUTION.INSTITUTION').subscribe((res: string) => {
      this.appPages[1].title = res;
    });
    //sous-menu institution
    this.translate.get('MENU.INSTITUTION.PARTENAIRES').subscribe((res: string) => {
      this.appPages[1].children[0].title = res;
    });
    this.translate.get('MENU.INSTITUTION.UNIONS').subscribe((res: string) => {
      this.appPages[1].children[1].title = res;
    });
    this.translate.get('MENU.INSTITUTION.OPS').subscribe((res: string) => {
      this.appPages[1].children[2].title = res;
    });
    this.translate.get('MENU.INSTITUTION.MEMBRES').subscribe((res: string) => {
      this.appPages[1].children[3].title = res;
    });

    //Recherche
    this.translate.get('MENU.RECHERCHE.RECHERCHE').subscribe((res: string) => {
      this.appPages[2].title = res;
    });
    //sous-menu recherche
    this.translate.get('MENU.RECHERCHE.PROJETS').subscribe((res: string) => {
      this.appPages[2].children[0].title = res;
    });
    this.translate.get('MENU.RECHERCHE.PROTOCOLES').subscribe((res: string) => {
      this.appPages[2].children[1].title = res;
    });
    this.translate.get('MENU.RECHERCHE.TRAITEMENTS').subscribe((res: string) => {
      this.appPages[2].children[2].title = res;
    });
    this.translate.get('MENU.RECHERCHE.ESSAIS').subscribe((res: string) => {
      this.appPages[2].children[3].title = res;
    });
    this.translate.get('MENU.RECHERCHE.PLUVIOMETRIE').subscribe((res: string) => {
      this.appPages[2].children[4].title = res;
    });
    this.translate.get('MENU.RECHERCHE.TYPOLOGIE').subscribe((res: string) => {
      this.appPages[2].children[5].title = res;
    });
    
    //Rapport
    this.translate.get('MENU.RAPPORT.RAPPORT').subscribe((res: string) => {
      this.appPages[3].title = res;
    });
    //sous-menu rapport
    this.translate.get('MENU.RAPPORT.RESTITUTION').subscribe((res: string) => {
      this.appPages[3].children[0].title = res;
    });
    this.translate.get('MENU.RAPPORT.STATISTIQUES').subscribe((res: string) => {
      this.appPages[3].children[1].title = res;
    });

    //Localités
    this.translate.get('MENU.LOCALITES.LOCALITES').subscribe((res: string) => {
      this.appPages[4].title = res;
    });
    //sous-menu localitées
    this.translate.get('MENU.LOCALITES.PAYS').subscribe((res: string) => {
      this.appPages[4].children[0].title = res;
    });
    this.translate.get('MENU.LOCALITES.REGIONS').subscribe((res: string) => {
      this.appPages[4].children[1].title = res;
    });
    this.translate.get('MENU.LOCALITES.DEPARTEMENTS').subscribe((res: string) => {
      this.appPages[4].children[2].title = res;
    });
    this.translate.get('MENU.LOCALITES.COMMUNES').subscribe((res: string) => {
      this.appPages[4].children[3].title = res;
    });
    this.translate.get('MENU.LOCALITES.VILLAGES').subscribe((res: string) => {
      this.appPages[4].children[4].title = res;
    });

    //Configuration
    this.translate.get('MENU.CONFIGURATION.CONFIGURATION').subscribe((res: string) => {
      this.appPages[5].title = res;
    });
    //sous-menu configuration
    this.translate.get('MENU.CONFIGURATION.PARTENAIRE').subscribe((res: string) => {
      this.appPages[5].children[0].title = res;
    });
    this.translate.get('MENU.CONFIGURATION.UNION').subscribe((res: string) => {
      this.appPages[5].children[1].title = res;
    });
    this.translate.get('MENU.CONFIGURATION.OP').subscribe((res: string) => {
      this.appPages[5].children[2].title = res;
    });
    this.translate.get('MENU.CONFIGURATION.MEMBRE').subscribe((res: string) => {
      this.appPages[5].children[3].title = res;
    });
    this.translate.get('MENU.CONFIGURATION.CHAMP').subscribe((res: string) => {
      this.appPages[5].children[4].title = res;
    });

    //Administration
    this.translate.get('MENU.ADMINISTRATION.ADMINISTRATION').subscribe((res: string) => {
      this.appPages[6].title = res;
    });
    //sous-menu Administration
    this.translate.get('MENU.ADMINISTRATION.GESTION_DES_UTILISATEURS').subscribe((res: string) => {
      this.appPages[6].children[0].title = res;
    });
    this.translate.get('MENU.ADMINISTRATION.AJOUTER_FILTRE_LOCAL').subscribe((res: string) => {
      this.appPages[6].children[1].title = res;
    });
    this.translate.get('MENU.ADMINISTRATION.AJOUTER_FILTRE_SERVEUR').subscribe((res: string) => {
      this.appPages[6].children[2].title = res;
    });
    this.translate.get('MENU.ADMINISTRATION.VIDER_LA_CORBEILLE').subscribe((res: string) => {
      this.appPages[6].children[3].title = res;
    });
    this.translate.get('MENU.ADMINISTRATION.REINITIALISER_LA_BD').subscribe((res: string) => {
      this.appPages[6].children[4].title = res;
    });
  }

  public changeLanguage(): void {
    this.translateLangue();
  }

  translateLangue(): void {
    //console.log('language', this.language)
    this.translate.use(global.langue);
    this.initialiseTranslation();
  }

  initTranslate() {
    // La langue par défaut est le français
    this.translate.setDefaultLang(global.langue);

    //Recupérer la langue du navigateur
    if (this.translate.getBrowserLang() !== undefined) {
      global.langue = this.translate.getBrowserLang();
      console.log('La langue du navigateur est', this.translate.getBrowserLang());
    }
    else {
      // Si non définit, utiliser la langue par défaut qui est le françias
      global.langue = 'fr'; 
    }

    this.translateLangue();
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
