import { Component, OnInit } from '@angular/core';

import { Platform, ToastController, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

import { PouchdbService } from '../app/services/pouchdb/pouchdb.service';

import { TranslateService } from '@ngx-translate/core';

import { global } from '../app/globale/variable';
import { ConnexionPage } from './utilisateur/connexion/connexion.page';
import { ProfilPage } from './utilisateur/profil/profil.page';

declare var $: any;


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  public boutonMenuClass = false;
  public global = global;
  public lastTimeBackPress = 0;
  public timePeriodToExit  = 2000;
  public backButtonSubscrib;
  //public language: string;
  public appPages1 = [
    {
      title: global.info_user.name,
      //icon: 'logo-ionic',
      src: './../assets/img/avatar_2x.png',
      open: false,
      children: [
        {
          title: 'Profile',
          url: '/profil',
          icon: 'person',
          color: '',
          id: 'profil'
        },
        {
          title: 'Télécharger données',
          //url: '/profil',
          icon: 'cloud-download',
          color: '',
          id: 'tel-donnees'
        },
        {
          title: 'Envoyer Données',
          //url: '/profil',
          icon: 'cloud-upload',
          color: '',
          id: 'env-donnees'
        },
        {
          title: 'Deconnexion',
          //url: '/champ',
          icon: 'log-out',
          color: '',
          id: 'deconnexion'
        }
      ]
    }
  ];

  public appPages = [
    {
      title: 'Tableau de bord',
      url: '/tableau-de-bord',
      icon: 'home',
      open: false,
      id: 'tableau-de-bord'
    },
    {
      title: 'Institution',
      //icon: 'logo-ionic',
      src: './../assets/svgs/university.svg',
      open: false,
      id: 'institution',
      children: [
        {
          title: 'Mon institution',
          url: '/mon-institution',
          icon: 'document',
          color: '',
          id: 'mon-institution'
        },
        {
          title: 'Partenaires',
          url: '/partenaires',
          icon: 'document',
          color: '',
          id: 'partenaires'
        },
        {
          title: 'Unions',
          url: '/unions',
          icon: 'document',
          color: '',
          id: 'unions'
        },
        {
          title: 'OPs',
          url: '/ops',
          icon: 'document',
          color: '',
          id: 'ops'
        },
        {
          title: 'Personnes',
          url: '/personnes',
          icon: 'person',
          color: '',
          id: 'personnes'
        },{
          title: 'Champ',
          url: '/champ',
          icon: 'document',
          color: '',
          id: 'champ'
        },{
          title: 'Stations météo',
          url: '/station-meteo',
          icon: 'document',
          color: '',
          id: 'stationmeteos'
        },{
          title: 'Pluviometries',
          url: '/pluviometrie',
          icon: 'document',
          color: '',
          id: 'pluviometrie'
        }

      ]
    },
    {
      title: 'Recherche',
      icon: 'medkit',
      open: false,
      id: 'recherche',
      children: [
        {
          title: 'Projets',
          url: '/projets',
          icon: 'folder',
          color: '',
          id: 'projets'
        },
        {
          title: 'Protocoles',
          url: '/protocoles',
          icon: 'document',
          color: '',
          id: 'protocoles'
        },
        {
          title: 'Essais',
          url: '/essais',
          icon: 'document',
          color: '',
          id: 'essais'
        },
        {
          title: 'Pluviométrie',
          url: '/pluviometrie',
          icon: 'document',
          color: '',
          id: 'pluviometrie'
        },
        {
          title: 'Typologie',
          url: '/typologie',
          icon: 'document',
          color: '',
          id: 'typologie'
        }
      ]
    },
    {
      title: 'Rapport',
      icon: 'stats',
      open: false,
      id: 'rapport',
      children: [
        {
          title: 'Restitution',
          url: '/restitution',
          icon: 'document',
          color: '',
          id: 'restitution'
        },
        {
          title: 'Statistiques',
          url: '/statistiques',
          icon: 'document',
          color: '',
          id: 'statistiques'
        }
      ]
    },
    {
      title: 'Habitations',
      icon: 'planet',
      open: false,
      id: 'habitations',
      children: [
        {
          title: 'Pays',
          url: '/pays',
          icon: 'document',
          color: '',
          id: 'pays'
        },
        {
          title: 'Régions',
          url: '/regions',
          icon: 'document',
          color: '',
          id: 'regions'
        },
        {
          title: 'Départments',
          url: '/departements',
          icon: 'document',
          color: '',
          id: 'departements'
        },
        {
          title: 'Communes',
          url: '/communes',
          icon: 'document',
          color: '',
          id: 'communes'
        },
        {
          title: 'Localites',
          url: '/localites',
          icon: 'document',
          color: '',
          id: 'localites'
        }
      ]
    },
    {
      title: 'Configuration',
      icon: 'construct',
      open: false,
      id: 'configuration',
      children: [
        /*{
          title: 'Partenaire',
          url: '/partenaire',
          icon: 'document',
          color: ''
        },
        {
          title: 'Union',
          url: '/union',
          icon: 'document',
          color: ''
        },
        {
          title: 'OP',
          url: '/op',
          icon: 'document',
          color: ''
        },
        {
          title: 'Membre',
          url: '/membre',
          icon: 'document',
          color: ''
        },*/
        {
          title: 'Profession',
          url: '/profession',
          icon: 'document',
          color: '',
          id: 'profession'
        },
        {
          title: 'Ethnie',
          url: '/ethnie',
          icon: 'document',
          color: '',
          id: 'ethnie'
        },
        {
          title: 'Types de soles',
          url: '/type-sole',
          icon: 'document',
          color: '',
          id: 'type-sole'
        },
        {
          title: 'Serveur',
          url: '/conf-serveur',
          icon: 'document',
          color: '',
          id: 'conf-serveur'
        }
      ] 
    },
    {
      title: 'Administration',
      icon: 'settings',
      open: false,
      id: 'administration',
      children: [
        {
          title: 'Modules',
          url: '/modules',
          icon: 'document',
          color: '',
          id: 'modules'
        },
        {
          title: 'Groupes',
          url: '/groupes',
          icon: 'document',
          color: '',
          id: 'groupes'
        },
        {
          title: 'Utilisateurs',
          url: '/utilisateurs',
          icon: 'document',
          color: '',
          id: 'utilisateurs'
        },
        /*{
          title: 'Localités',
          url: '/localites',
          icon: 'document',
          color: ''
        },*/
        {
          title: 'Serveur',
          url: '/serveur',
          icon: 'document',
          color: '',
          id: 'serveur'
        },
        {
          title: 'Base de données locale',
          url: '/bd-locale',
          icon: 'document',
          color: '',
          id: 'bd-locale'
        }
      ]
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private toastCtl: ToastController,
    private router: Router,
    private modalController: ModalController,
    private servicePouchdb: PouchdbService,
    private storage: Storage
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if(this.platform.is('android') || this.platform.is('ios')){
        global.mobile = true;
      }
      console.log('platform android ou ios = '+global.mobile);
      this.initTranslate(); 
      this.chargerUserInfo(); 
      //this.getConfServeur();    
//this.initMultipleSelect(this.translate)
      
    });
  }

  chargerUserInfo(){
    //console.log('chargerUserInfo')
    this.storage.get('frna_v2_info_user').then((res) => {
     // console.log(res)
      if(res && res != ''){
        global.info_user = res;
      }
    })
  }

  getConfServeur(){
    this.storage.get('conf-serveur').then((res) => {
      //console.log(res)
      if(res && res != ''){
        global.conf_serveur = res;
        this.servicePouchdb.remoteDB = new PouchDB(global.conf_serveur.domaine+'/'+global.conf_serveur.bd, this.servicePouchdb.pouchOpts /*'http://localhost:5984/frna-v2', {skip_setup: true}*/);
        this.testerConnexion();
      }else{
        this.servicePouchdb = null;
      }
    }).catch((err) => {
      console.log(err)
      this.servicePouchdb.remoteDB = null;
    })
  }

  ngOnInit(){
    this.quitterApp(); 
  }

  testerAccesMenu(idMenu){
    //console.log(global.info_user.roles)
    if(global.estModeTeste || global.info_user.roles && (global.info_user.roles.indexOf('_admin') !== -1 || global.info_user.roles.indexOf('admin') !== -1)){
      return true;
    }else {
      for(let p of global.info_user.permissionsAccesModel){
        if(idMenu === 'serveur' || idMenu === 'administration' || p.modele === idMenu){
          return true;
        }
      }
      return false;
    }
    //return true
  }
 initMultipleSelect(t){
  $(function () {
    var self = this;
    $('.multiple-select').multipleSelect({
      filter: true,
      width: 150,
      position: 'top',
      formatSelectAll: function () {
        
        return '['+t.instant('GENERAL.SELECTIONNER_TOUS')+']'
      },

      formatAllSelected: function () {
        return t.instant('GENERAL.TOUS_SELECTIONNES')
      },

      formatCountSelected: function (count, total) {
        return count + ' '+t.instant('GENERAL.SUR').toLocaleLowerCase()+' ' + total + ' '+t.instant('GENERAL.SELECTIONNES').toLocaleLowerCase()+''
      },

      formatNoMatchesFound: function () {
        return t.instant('GENERAL.AUCTUN_RESULTAT')
      }
    })
  })
 }


  /*ionViewDidEnter(): void {
    // initialize
    this.initTranslate()
  }*/

  quitterApp(){
    this.backButtonSubscrib = this.platform.backButton.subscribe(() => {   
          //Double check to exit app
          if(this.router.url === '/tableau-de-bord' || this.router.url === ''){
            if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
              this.backButtonSubscrib.unsubscribe();
              navigator['app'].exitApp(); //Exit from app
            } else {
                this.affMsg('Appuyez sur la touche retour à nouveau pour quitter!')
                this.lastTimeBackPress = new Date().getTime();
            }
          }
          
    });
  }

  async affMsg(msg){
    const toast = await this.toastCtl.create({
      message: msg,
      position: 'middle',
      duration: 3000
    });

    toast.present();
  }

  initialiseTranslation(){
    this.translate.get('MENU.TABLEAU_DE_BORD').subscribe((res: string) => {
      this.appPages[0].title = res;
    });

    //institution
    this.translate.get('MENU.INSTITUTION.INSTITUTION').subscribe((res: string) => {
      this.appPages[1].title = res;
    });
    //sous-menu institution
    this.translate.get('MENU.INSTITUTION.MONINSTITUTION').subscribe((res: string) => {
      this.appPages[1].children[0].title = res;
    });
    this.translate.get('MENU.INSTITUTION.PARTENAIRES').subscribe((res: string) => {
      this.appPages[1].children[1].title = res;
    });
    this.translate.get('MENU.INSTITUTION.UNIONS').subscribe((res: string) => {
      this.appPages[1].children[2].title = res;
    });
    this.translate.get('MENU.INSTITUTION.OPS').subscribe((res: string) => {
      this.appPages[1].children[3].title = res;
    });
    this.translate.get('MENU.INSTITUTION.PERSONNES').subscribe((res: string) => {
      this.appPages[1].children[4].title = res;
    });
    this.translate.get('MENU.INSTITUTION.CHAMP').subscribe((res: string) => {
      this.appPages[1].children[5].title = res;
    });
    this.translate.get('MENU.INSTITUTION.STATIONMETEOS').subscribe((res: string) => {
      this.appPages[1].children[6].title = res;
    });
    this.translate.get('MENU.INSTITUTION.PLUVIOMETRIES').subscribe((res: string) => {
      this.appPages[1].children[7].title = res;
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
    
    this.translate.get('MENU.RECHERCHE.ESSAIS').subscribe((res: string) => {
      this.appPages[2].children[2].title = res;
    });
    this.translate.get('MENU.RECHERCHE.PLUVIOMETRIE').subscribe((res: string) => {
      this.appPages[2].children[3].title = res;
    });
    this.translate.get('MENU.RECHERCHE.TYPOLOGIE').subscribe((res: string) => {
      this.appPages[2].children[4].title = res;
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
    this.translate.get('MENU.LOCALITES.HABITATIONS').subscribe((res: string) => {
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
    this.translate.get('MENU.LOCALITES.LOCALITES').subscribe((res: string) => {
      this.appPages[4].children[4].title = res;
    });

    //Configuration
    this.translate.get('MENU.CONFIGURATION.CONFIGURATION').subscribe((res: string) => {
      this.appPages[5].title = res;
    });
    //sous-menu configuration
    /*this.translate.get('MENU.CONFIGURATION.PARTENAIRE').subscribe((res: string) => {
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
    });*/
    
    /*this.translate.get('MENU.CONFIGURATION.CHAMP').subscribe((res: string) => {
      this.appPages[5].children[4].title = res;
    });*/
    this.translate.get('MENU.CONFIGURATION.PROFESSION').subscribe((res: string) => {
      this.appPages[5].children[0].title = res;
    });
    this.translate.get('MENU.CONFIGURATION.ETHNIE').subscribe((res: string) => {
      this.appPages[5].children[1].title = res;
    });
    this.translate.get('MENU.CONFIGURATION.TYPESOLE').subscribe((res: string) => {
      this.appPages[5].children[2].title = res;
    });
    this.translate.get('MENU.CONFIGURATION.SERVEUR').subscribe((res: string) => {
      this.appPages[5].children[3].title = res;
    });

    //Administration
    this.translate.get('MENU.ADMINISTRATION.ADMINISTRATION').subscribe((res: string) => {
      this.appPages[6].title = res;
    });
    //sous-menu Administration
    this.translate.get('MENU.ADMINISTRATION.MODULES').subscribe((res: string) => {
      this.appPages[6].children[0].title = res;
    });
    this.translate.get('MENU.ADMINISTRATION.GROUPES').subscribe((res: string) => {
      this.appPages[6].children[1].title = res;
    });
    this.translate.get('MENU.ADMINISTRATION.UTILISATEURS').subscribe((res: string) => {
      this.appPages[6].children[2].title = res;
    });
    this.translate.get('MENU.ADMINISTRATION.SERVEUR').subscribe((res: string) => {
      this.appPages[6].children[3].title = res;
    });
    this.translate.get('MENU.ADMINISTRATION.BASE_DE_DONNEES_LOCALE').subscribe((res: string) => {
      this.appPages[6].children[4].title = res;
    });
  }

  public changeLanguage(): void {
    this.translateLangue();
  }

  translateLangue(): void {
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

  derouler1(i){
    this.appPages1[i].open = !this.appPages1[i].open;
    this.appPages1.forEach((p, index) =>{
      if(i != index && p.open){
        p.open = false;
      }
    })
}

replier1(){
  this.appPages1.forEach((p, index) =>{
    if(p.open)
      p.open = false;
  })
}


async connexion() {
  const modal = await this.modalController.create({
    component: ConnexionPage,
    //componentProps: { idMembre: idMembre },
    mode: 'ios',
    cssClass: 'costom-connexion-modal',
  });
  return await modal.present();
}

doAction(id){
  if(id == 'tel-donnees'){
    this.servicePouchdb.replicationFromServerToLocal();
  }else if(id == 'env-donnees'){
    this.servicePouchdb.replicationFromLocalToServer();
  }else if(id == 'deconnexion'){
    this.deconnexion();    
  }
}

deconnexion(){
  this.servicePouchdb.deconnexion().then((res) => {
    global.estConnecte = false;
    global.info_user.name = 'default';
    global.info_user.roles = [];
    global.info_user.groupes = [];
    global.info_user.permissionsAccesModel = [];
    global.info_user.accessDonnes = {
      exporter: false,
      importer: false,
      inclureDonneesDependantes: false,
      pays: [],
      regions: [],
      departements: [],
      communes: [],
      partenaires: [],
      unions: [],
      ops: [],
      personnes: [],
      projets: [],
      protocoles: [],
      donneesUtilisateurs: [],
      stationMeteos: []
    };
    this.storage.remove('frna_v2_info_user')

    this.afficheMessage('Vous ètes déconnecté');
    
    if(this.router.url === '/profil' || this.router.url === '/groupes' || this.router.url === '/utilisateurs' || this.router.url === '/serveur'){
      this.router.navigateByUrl('/tableau-de-bord');
    }
  }).catch((err) => {
    console.log('Erreur réseau ', err)
  })
}

async afficheMessage(msg) {
  const toast = await this.toastCtl.create({
    message: msg,
    duration: 2000,
    position: 'top',
    buttons: [
      {
        icon: 'close',
        text: 'Fermer',//translate.instant('GENERAL.FERMER'),
        role: 'cancel',
        handler: () => {
          console.log('Fermer cliqué');
        }
      }
    ]
  });
  toast.present();
}  


async profil() {
  const modal = await this.modalController.create({
    component: ProfilPage,
    //componentProps: { idMembre: idMembre },
    mode: 'ios',
    //cssClass: 'costom-connexion-modal',
  });
  return await modal.present();
}


testerConnexion(){
  this.servicePouchdb.getSessionUtilisateur().then((res1) => {
    if(res1.userCtx.name){
      global.estConnecte = true;
      global.info_user.name = res1.userCtx.name;
      global.info_user.roles = res1.userCtx.roles;
      if(res1.userCtx.roles.indexOf('_admin') === -1 && res1.userCtx.roles.indexOf('admin') === -1){
        this.servicePouchdb.getInfosUtilisateur(res1.userCtx.name).then((res2) => {
          global.info_user.groupes = res2.groupes;
          global.info_user.permissionsAccesModel = [];
          global.info_user.accessDonnes = res2.accessDonnes;
          //console.log(global.info_user.groupes)
          this.servicePouchdb.getGroupes(res2.groupes).then((res3) => {
            if(res3){
              //console.log(res)
              res3.forEach((g) => {
                g.formData.permissionAcces.forEach((p) => {
                  if(global.info_user.permissionsAccesModel.indexOf(p) === -1){
                    global.info_user.permissionsAccesModel.push(p)
                  }
                })
                
              });
              this.storage.set('frna_v2_info_user', global.info_user);
              //console.log(global.info_user.permissionsAccesDonnees)
            }
          })
        }).catch((err) => {
          if(err){
            console.log("Problème de réseau ou privilèges insuffisants ", err)
          }
        });
      }else{
        this.storage.set('frna_v2_info_user', global.info_user);
      }
      
    }else{
      //global.estConnecte = false;
      /*global.info_user.name = 'default';
      global.info_user.roles = [];
      global.info_user.groupes = [];
      global.info_user.permissionsAccesModel = [];
      global.info_user.accessDonnes = {
        exporter: false,
        importer: false,
        inclureDonneesDependantes: false,
        pays: [],
        regions: [],
        departements: [],
        communes: [],
        partenaires: [],
        unions: [],
        ops: [],
        personnes: [],
        projets: [],
        protocoles: [],
        donneesUtilisateurs: [],
        stationMeteos: []
      };*/
    }
  }).catch((err) => {
      console.log("Problème de réseau ", err)
      //global.estConnecte = false;
      /*global.info_user.name = 'default';
      global.info_user.roles = [];
      global.info_user.groupes = [];
      global.info_user.permissionsAccesModel = [];
      global.info_user.accessDonnes = {
        exporter: false,
        importer: false,
        inclureDonneesDependantes: false,
        pays: [],
        regions: [],
        departements: [],
        communes: [],
        partenaires: [],
        unions: [],
        ops: [],
        personnes: [],
        projets: [],
        protocoles: [],
        donneesUtilisateurs: [],
        stationMeteos: []
      };*/
  });
}


  boutonMenuControl(){
    this.boutonMenuClass = !this.boutonMenuClass;
  }

  
}
