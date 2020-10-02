import { Component, OnInit, Input  } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { TranslateService } from '@ngx-translate/core'; 
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, PopoverController } from '@ionic/angular';
import { global } from '../../../app/globale/variable';
import { isObject, isArray } from 'util';
import { ActionComponent } from '../../component/action/action.component';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { DatatableMoreComponent } from 'src/app/component/datatable-more/datatable-more.component';
import { DatatableConstructComponent } from 'src/app/component/datatable-construct/datatable-construct.component';
import { SelectionComponent } from 'src/app/component/selection/selection.component';
import { DerniereModificationComponent } from 'src/app/component/derniere-modification/derniere-modification.component';
import { ListeMoreComponent } from 'src/app/component/liste-more/liste-more.component';
import { ListeActionComponent } from 'src/app/component/liste-action/liste-action.component';
import { ConnexionPage } from 'src/app/utilisateur/connexion/connexion.page';
import { ProfilPage } from 'src/app/utilisateur/profil/profil.page';
import { ChangerMdPassePage } from 'src/app/utilisateur/changer-md-passe/changer-md-passe.page';
import { FiltrePartenaireComponent } from 'src/app/component/filtre-partenaire/filtre-partenaire.component';
import { FiltreUnionComponent } from 'src/app/component/filtre-union/filtre-union.component';
import { FiltreOpComponent } from 'src/app/component/filtre-op/filtre-op.component';
import { FiltrePersonneComponent } from 'src/app/component/filtre-personne/filtre-personne.component';
import { FiltreProjetComponent } from 'src/app/component/filtre-projet/filtre-projet.component';
import { FiltreProtocoleComponent } from 'src/app/component/filtre-protocole/filtre-protocole.component';
import { FiltrePaysComponent } from 'src/app/component/filtre-pays/filtre-pays.component';
import { FiltreRegionComponent } from 'src/app/component/filtre-region/filtre-region.component';
import { FiltreDepartementComponent } from 'src/app/component/filtre-departement/filtre-departement.component';
import { FiltreCommuneComponent } from 'src/app/component/filtre-commune/filtre-commune.component';
import { FiltreDonneesUtilisateursComponent } from 'src/app/component/filtre-donnees-utilisateurs/filtre-donnees-utilisateurs.component';
import { FiltreStationMeteoComponent } from 'src/app/component/filtre-station-meteo/filtre-station-meteo.component';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToCSVAndTHMLTable: any;
declare var createDataTable: any; 
//declare var HTMLTableToJSON: any;
//declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.page.html',
  styleUrls: ['./utilisateurs.page.scss'],
})
export class UtilisateursPage implements OnInit {
  @Input() idUtilisateur: string;
  @Input() filtreDonneesUtilisateurs: any;

  utilisateurForm: FormGroup;
  loading: boolean = false;
  action: string = 'liste';
  cacheAction: string = 'liste';
  utilisateurs: any = [];
  utilisateursData: any = [];
  allUtilisateursData: any = [];
  
  unUtilisateur: any;
  unUtilisateurDoc: any;
  utilisateurHTMLTable: any;
  htmlTableAction: string;
  selectedIndexes: any = [];
  mobile = global.mobile; 
  styleAffichage: string = "liste";
  allSelected: boolean = false;
  recherchePlus: boolean = false;
  filterAjouter: boolean = false;
  filterInitialiser: boolean = false;
  prev: boolean = false;
  next: boolean = false;
  doModification: boolean = false;
  estModeCocherElemListe: boolean = false;
  rechargerListeMobile: boolean = false;
  groupes: any = ['1', '2', '3']
  colonnes: any = ['nom', 'identifiant', 'email'];
  message_err = null;

  messages_validation = {
    'nom': [
      { type: 'required', message: '' }
    ],
    'identifiant': [
      { type: 'required', message: '' },
      { type: 'unique', message: '' }
    ],
    'mdPasse': [
      { type: 'required', message: '' }
    ]
  }

    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la utilisateur est en mode modal, on chercher info region
      this.translateLangue();
      this.getUtilisateur();
    }

    
  
    changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.selectedIndexes = [];
        this.allSelected = false;
        this.recherchePlus = false;
        this.filterAjouter = false;
        this.estModeCocherElemListe = false;
        this.actualiserTableau(this.utilisateursData);
      }else {
        this.styleAffichage = 'liste';
        this.selectedIndexes = [];
        this.allSelected = false;
        this.recherchePlus = false;
        this.filterAjouter = false;
        this.estModeCocherElemListe = false;
      }
    }

    
    setInputRequredError(id, filedName){
      if(this.message_err != ''){
        this.message_err = '';
      }
      if(this.utilisateurForm.get(filedName).errors && (this.utilisateurForm.get(filedName).dirty || this.utilisateurForm.get(filedName).touched)){
        //$('#'+id).addClass( "required has-error" );
        $('#'+id).addClass( "has-error" );
        $('#'+id +' input').addClass( "is-invalid" );
      }
      else{
     //$('#'+id).removeClass( "required has-error" );
      $('#'+id).removeClass( "has-error" );
        $('#'+id +' input').removeClass( "is-invalid" );
      }
  
    }

    setSelectRequredError(id, filedName){
      if(this.utilisateurForm.get(filedName).errors){
        //$('#'+id).addClass( "required has-error" );
        $('#'+id).addClass( "has-error" );
        $('#'+id +' select').addClass( "is-invalid" );
      }
      else{
     //$('#'+id).removeClass( "required has-error" );
      $('#'+id).removeClass( "has-error" );
        $('#'+id +' select').removeClass( "is-invalid" );
      }
  
    }

  
    initForm(){
      //this.utilisateurForm = null;
      this.utilisateurForm = this.formBuilder.group({
        nom: [null, Validators.required],
        actif: [true],
        identifiant: [null, Validators.required],
        email: [null],
        mdPasse: [null, Validators.required],
        groupes: [[]],
        accessDonnes: [{
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
        }]
      });
      
      this.howHidePassword()
      //this.validerNumero();
    }

    howHidePassword(){
      $('#mdPasse').ready(() => {
        $("#mdPasse a").on('click', function(event) {
            event.preventDefault();
            if($('#mdPasse input').attr("type") == "text"){
                $('#mdPasse input').attr('type', 'password');
                $('#mdPasse input').addClass( "fa-eye-slash" );
                $('#mdPasse input').removeClass( "fa-eye" );
            }else if($('#mdPasse input').attr("type") == "password"){
                $('#mdPasse input').attr('type', 'text');
                $('#mdPasse input').removeClass( "fa-eye-slash" );
                $('#mdPasse input').addClass( "fa-eye" );
            }
        });
    });
    }
  
    editForm(utilisateur){
	  let groupes = [];
      let accessDonnes = {
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
      }

      if(utilisateur.accessDonnes && utilisateur.accessDonnes !== ''){
        accessDonnes = utilisateur.accessDonnes;
      }
	  
	  if(utilisateur.groupes && utilisateur.groupes !== ''){
        groupes = utilisateur.groupes;
      }

      this.utilisateurForm = this.formBuilder.group({
        nom: [utilisateur.nom, Validators.required],
        actif: [utilisateur.actif],
        identifiant: [utilisateur.identifiant, Validators.required],
        email: [utilisateur.email],
        mdPasse: [null],
        groupes: [groupes],
        accessDonnes: [accessDonnes],
      });
      
      this.howHidePassword()

      //console.log(this.utilisateurForm.controls.accessDonnes)
      //this.validerNumero();

    }

    editMdpasse(utilisateur){
      
      this.utilisateurForm = this.formBuilder.group({
        mdPasse: [null, Validators.required],
      });
      
      this.howHidePassword()
    }

    editIdentifiant(utilisateur){
      this.utilisateurForm = this.formBuilder.group({
        identifiant: [null, Validators.required],
      });
    }


    validerNumero(){
      let numeroControl = this.utilisateurForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndNumero('utilisateur', value).then((res) => {
          if(res && res.utilisateurs && res.utilisateurs[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.unUtilisateur.numero))){
            numeroControl.setErrors({uniqueNumeroUtilisateur: true});
          }
        });
      });
    }
  
    ajouter(){
      this.message_err = '';
      this.doModification = false;
      this.getGroupes();
      this.initForm();
      this.action = 'ajouter';
    }
  
    infos(p){
      this.unUtilisateur = p;
      this.action = 'infos';
      /*if(!this.mobile){
        this.unUtilisateur = p;
        //this.action = 'infos';
      }else  if(this.mobile && !this.estModeCocherElemListe){
        this.unUtilisateur = p;
        this.action = 'infos';
      }*/
    }

  
    modifier(utilisateur){
      //console.log(utilisateur)
      if(!this.filtreDonneesUtilisateurs){
        this.getGroupes();
        this.message_err = '';
        let id;
        if(isObject(utilisateur)){
          this.unUtilisateur = utilisateur
        }else{
          for(let p of this.utilisateursData){
            if(p.name == utilisateur){
              this.unUtilisateur = p;
              break;
            }
          }
        }
        this.doModification = true;
        this.editForm(this.unUtilisateur); 
        this.action ='modifier';     
  
      }
    }

    changerMdPasse(utilisateur){
      //console.log(utilisateur)
      this.message_err = '';
      if(isObject(utilisateur) && !isArray(utilisateur)){
        this.unUtilisateur = utilisateur
      }else{
        if(this.utilisateursData.length > 0){
          for(let p of this.utilisateursData){
            if(p.name == utilisateur[0]){
              this.unUtilisateur = p;
              break;
            }
          }
        }else{
          this.servicePouchdb.getInfosUtilisateur(utilisateur[0]).then((res) => {
            res.identifiant = res.name;
            this.unUtilisateur = res
          }).catch((err) => {
            if(err){
              console.log("Problème de réseau ou privilèges insuffisants ", err)
            }
          });
        }
        
      }

      this.doModification = true;
      this.editMdpasse(this.unUtilisateur); 
      this.action ='mdpasse';    
      //console.log(this.unUtilisateur) 
    }

    changerIdentifiant(utilisateur){
      //console.log(utilisateur)
      this.message_err = '';
      //console.log(this.utilisateursData)
      if(isObject(utilisateur) && !isArray(utilisateur)){
        this.unUtilisateur = utilisateur
      }else{
        if(this.utilisateursData.length > 0){
          for(let p of this.utilisateursData){
            if(p.name == utilisateur[0]){
              this.unUtilisateur = p;
              break;
            }
          }
        }else{
          this.servicePouchdb.getInfosUtilisateur(utilisateur[0]).then((res) => {
            res.identifiant = res.name;
            this.unUtilisateur = res
          }).catch((err) => {
            if(err){
              console.log("Problème de réseau ou privilèges insuffisants ", err)
            }
          });
        }
        
      }

      this.doModification = true;
      this.editIdentifiant(this.unUtilisateur); 
      this.action ='identifiant'; 
      //console.log(this.unUtilisateur)    
    }
    
    exportPDF(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('utilisateur-datatable').innerHTML], {
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-7"
        type: "text/plain;charset=utf-7"
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-7"
        //type: 'application/vnd.ms-excel;charset=utf-7'
        //type: "application/vnd.ms-excel;charset=utf-7"
      });
  
      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'FRNA_Export_'+date+'.pdf', blob).then(()=> {
          alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
      }).catch(()=>{
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
      });
    }
  
    clone(obj) {
      // Handle the 3 simple types, and null or undefined
      if (null == obj || "object" != typeof obj) {return obj};
  
      // Handle Date
      if (obj instanceof Date) {
          var copy = new Date();
          copy.setTime(obj.getTime());
          return copy;
      }
  
      // Handle Array
      if (obj instanceof Array) {
          let copy = [];
          for (var i = 0, len = obj.length; i < len; i++) {
              copy[i] = this.clone(obj[i]);
          }
          return copy;
      }
  
      // Handle Object
      if (obj instanceof Object) {
          let copy = {};
          for (var attr in obj) {
              if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
          }
          return copy;
      }
  
      throw new Error("Unable to copy obj! Its type isn't supported.");
  }
  

  //retourne la liste de key unique par order dans un tableau d'objets
  getAllJSONKeys(data){
    return  data.reduce((keys, obj) => ( 
        keys.concat(Object.keys(obj).filter(key => ( 
          keys.indexOf(key) === -1)) 
        ) 
      ), []) 
  }
  
    async supprimer(p) {
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
        message: this.translate.instant('GENERAL.ALERT_MESSAGE'),
        //cssClass: 'aler-confirm',
        mode: 'ios',
        buttons: [
          {
            text: this.translate.instant('GENERAL.ALERT_ANNULER'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirmation annulée');
            }
          }, {
            text: this.translate.instant('GENERAL.ALERT_OUI'),
            role: 'destructive',
            cssClass: 'alert-danger',
            handler: (data) => {
            this.servicePouchdb.supprimerUtilisateur(p.name).then((res) => {

              //mise à jour de la liste si mobile et mode liste
              if(this.utilisateursData.indexOf(p) !== -1){
                this.utilisateursData.splice(this.utilisateursData.indexOf(p), 1);
              }else{
                console.log('echec splice, index inexistant')
              }

              this.action = 'liste';
              if(!this.mobile){
                //sinion dans le tableau
                this.dataTableRemoveRows();
              }else{
                this.utilisateursData = [...this.utilisateursData];
                if(this.allUtilisateursData.indexOf(p) !== -1){
                  this.allUtilisateursData.splice(this.allUtilisateursData.indexOf(p), 1);
                }else{
                  console.log('echec splice, index inexistant dans allUtilisateursData')
                }
              }
              }).catch((err) => {
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
              });//fin delete
            }
          
          }
        ]
      });
  
      await alert.present();
    }
  
  
    changerModeCocherElemListe(){
      if(this.estModeCocherElemListe){
       this.estModeCocherElemListe = false
      }else{
       this.estModeCocherElemListe = true
      }

      if(this.selectedIndexes){
        this.decocherTousElemListe();
        this.selectedIndexes = [];
      }
    }

    active(){
      if(!this.estModeCocherElemListe){
        this.estModeCocherElemListe = true
        this.selectedIndexes = [];
       } 
    }

    cocherElemListe(name){
      if(this.selectedIndexes.indexOf(name) === -1){
        //si coché
        this.selectedIndexes.push(name);
      }else{
        //si décocher
        this.selectedIndexes.splice(this.selectedIndexes.indexOf(name), 1);
      }  
      
    }

    cocherTousElemListe(){
      this.utilisateursData.forEach((p) => {
        //console.log(p.codePays+'   '+this.selectedIndexes.indexOf(p.codePays)+'    '+this.selectedIndexes)
        if(this.selectedIndexes.indexOf(p.name) === -1){
          this.selectedIndexes.push(p.name);
        }
      });
  
      $('ion-checkbox').prop("checked", true);
    }

    
    getGroupes(){
      this.groupes = [];
      this.servicePouchdb.findAllRelationalDocByType('groupe').then((res) => {
        if(res && res.groupes){
          //this.pays = [...pays];
          this.groupes = [];
          //var datas = [];
          for(let p of res.groupes){
            this.groupes.push({id: p.id, ...p.formData});
          }

          this.groupes.sort((a, b) => {
            if (a.nom < b.nom) {
              return -1;
            }
            if (a.nom > b.nom) {
              return 1;
            }
            return 0;
          });

          /*if(this.doModification){
            this.setSelect2DefaultValue('idgroupe', this.unMembre.idgroupe);
          }*/
        }
      }).catch((e) => {
        console.log('groupe erreur: '+e);
        this.groupes = [];
      });

    }
  
  
    decocherTousElemListe(){
      $('ion-checkbox').prop("checked", false);
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;
    }

    async listMorePopover(ev: any) {
      const popover = await this.popoverController.create({
        component: ListeMoreComponent,
        event: ev, 
        translucent: true,
        componentProps: {"options": {
          "estModeCocherElemListe": this.estModeCocherElemListe,
          "dataLength": this.utilisateursData.length,
          "selectedIndexesLength": this.selectedIndexes.length,
          "styleAffichage": this.styleAffichage,
          "action": this.action,
          "limite": true
        }},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'listSelectionMultiple') {
          this.changerModeCocherElemListe();
        }else  if(dataReturned !== null && dataReturned.data == 'listSelectAll') {
          this.cocherTousElemListe();
        }else  if(dataReturned !== null && dataReturned.data == 'listSelectNon') {
          this.decocherTousElemListe();
        } else  if(dataReturned !== null && dataReturned.data == 'changeStyle') {
          this.estModeCocherElemListe = false;
          this.changeStyle();
        }  else  if(dataReturned !== null && dataReturned.data == 'liste') {
          this.estModeCocherElemListe = false;
          this.getUtilisateursByType('liste');
        }  else  if(dataReturned !== null && dataReturned.data == 'archives') {
          this.estModeCocherElemListe = false;
          this.getUtilisateursByType('archives');
        }  else  if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.estModeCocherElemListe = false;
          this.getUtilisateursByType('corbeille');
        }  else  if(dataReturned !== null && dataReturned.data == 'partages') {
          this.estModeCocherElemListe = false;
          this.getUtilisateursByType('partages');
        } else  if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.estModeCocherElemListe = false;
          this.getUtilisateurWithConflicts();
         // this.changeStyle();
        }  else  if(dataReturned !== null && dataReturned.data == 'exporter') {
         this.exporter();
        }      
  
      });
      return await popover.present();
    }
  
     
    async exporter() {
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_EXPORTER'),
        message: this.translate.instant('GENERAL.ALERT_EXPORTER_MESSAGE'),
        //cssClass: 'aler-confirm',
        mode: 'ios',
        inputs: [
          {
            name: 'radio',
            type: 'radio',
            label: 'Excel',
            value: 'excel',
            checked: true
          },
          {
            name: 'radio',
            type: 'radio',
            label: 'CSV',
            value: 'csv',
            checked: false
          }
  
        ],
        buttons: [
          {
            text: this.translate.instant('GENERAL.ALERT_ANNULER'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Exportation annulée annulée');
            }
          },
          {
            text: this.translate.instant('GENERAL.ALERT_OK'),
            role: 'destructive',
            cssClass: 'alert-danger',
            handler: (data) => {
              console.log(data.toString())
              if(data.toString() == 'csv'){
                console.log('csv')
                this.exportCSV();
              }else{
                console.log('ecel')
                this.exportExcel();
              }
  
            }
          }
        ]
      });
  
      await alert.present();
    }
  
  
    exportExcel(){
      let data = [...this.utilisateursData];
      data.map((d) => {
        delete d['id'];
      })
      let date =new Date().getTime();
      var htmlTable = JSONToCSVAndTHMLTable(data, 'table', this.translate, 'xlsx')
      //document.getElementById(id).innerHTML = result.table;
      let blob = new Blob([htmlTable], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        //type: "text/plain;charset=utf-8"
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        //type: 'application/vnd.ms-excel;charset=utf-8'
        //type: "application/vnd.ms-excel;charset=utf-8"
      });
  
      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'FRNA_Export_Utilisateurs_'+date+'.xls', blob).then(()=> {
          alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
      }).catch(()=>{
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
      });
    }
  
    exportCSV(){
      let data = [...this.utilisateursData];
      data.map((d) => {
        delete d['id'];
      })
      let date =new Date().getTime();
      var csv = JSONToCSVAndTHMLTable(data, 'table', this.translate, 'csv')
      //document.getElementById(id).innerHTML = result.table;
      let blob = new Blob([csv], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        //type: "text/plain;charset=utf-8"
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        //type: 'application/vnd.ms-excel;charset=utf-8'
        //type: "application/vnd.ms-excel;charset=utf-8"
      });
  
      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'FRNA_Export_Utilisateurs_'+date+'.csv', blob).then(()=> {
          alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
      }).catch(()=>{
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
      });
    }

  
    async listActionPopover(ev: any) {
      //console.log('ici')
      const popover = await this.popoverController.create({
        component: ListeActionComponent,
        event: ev,
        translucent: true,
        componentProps: {//"options": {
          //"estModeCocherElemListe": this.estModeCocherElemListe,
          //"dataLength": this.utilisateursData.length,
          //"selectedIndexesLength": this.selectedIndexes.length,
          //"styleAffichage": this.styleAffichage,
          "action": this.cacheAction,
          "limite": true,
          "user": "admin"
      /*}*/},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        //console.log(this.selectedIndexes)
        if(dataReturned !== null && dataReturned.data == 'modifier') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unUtilisateur.name);
          }

          this.modifier(this.selectedIndexes[0]);
          this.decocherTousElemListe();
          this.estModeCocherElemListe = false;
          //this.changerModeCocherElemListe();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unUtilisateur.name);
          }

            this.suppressionMultipleDefinitive(this.selectedIndexes)

          //this.estModeCocherElemListe = false;
        }else if(dataReturned !== null && dataReturned.data == 'mdpasse') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unUtilisateur.name);
          }
          this.changerMdPasse(this.selectedIndexes);
        }else if(dataReturned !== null && dataReturned.data == 'identifiant') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unUtilisateur.name);
          }
          this.changerIdentifiant(this.selectedIndexes);
        }     
      });
      return await popover.present();
    }
  

    mobileSuppression(){
      if(this.action =='infos' && !this.selectedIndexes[0]){
        this.selectedIndexes.push(this.unUtilisateur.name);
      }

      this.suppressionMultipleDefinitive(this.selectedIndexes)

    }
    cacherAction(){
      if(this.utilisateursData.length != this.selectedIndexes.length) {
        this.cocherTousElemListe();
      }else {
        this.decocherTousElemListe();
      } 
    }
    

    async suppressionMultipleDefinitive(names) {
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
        message: this.translate.instant('GENERAL.ALERT_MESSAGE_SUPPRESSION_DEFINITIVE'),
        //cssClass: 'aler-confirm',
        mode: 'ios',
        buttons: [
          {
            text: this.translate.instant('GENERAL.ALERT_ANNULER'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirmation annulée');
            }
          }, 
          {
            text: this.translate.instant('GENERAL.ALERT_OUI'),
            role: 'destructive',
            cssClass: 'alert-danger',
            handler: () => {
              //suppresion multiple définitive
              //console.log(names)
              for(let name of names){

                //var p = this.utilisateursData[i];
                this.servicePouchdb.supprimerUtilisateur(name).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin delete

              }

              if(this.action == 'infos'){
                this.action = this.cacheAction;
              }

              if(!this.mobile){
                this.dataTableRemoveRows();
                //this.utilisateursData = this.removeMultipleElem(this.utilisateursData, indexes);
                this.selectedIndexes = [];
              }else{
                this.utilisateursData = [...this.removeMultipleElem(this.utilisateursData, names)];
                this.allUtilisateursData = this.removeMultipleElem(this.allUtilisateursData, names);
                
                //if(this.action != 'infos'){
                  this.estModeCocherElemListe = false;
                  this.decocherTousElemListe();
                //}
                //this.action = this.cacheAction;
              }

            }
          }
        ]
      });
  
      await alert.present();
    }

    removeMultipleElem(data, names){
      let codes = [];
      if(this.mobile && this.action == 'infos'){
        codes.push(this.unUtilisateur.id);
      }else /*if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)*/{
        /*indexes.forEach((i) => {
          codes.push(data[i].numero);
        });*/

        codes = names;
      }/*else{
        codes = indexes;
      }*/
      for(let i = 0; i < data.length; i++){
        if(codes.length == 0){
          break;
        }
        if(codes.indexOf(data[i].name) !== -1){
          codes.splice(codes.indexOf(data[i].name), 1);
          data.splice(i, 1);
          i--;
        }
      }

      return data;
    }
  
    async afficheMessage(msg) {
      const toast = await this.toastCtl.create({
        message: msg,
        duration: 2000,
        position: 'top',
        buttons: [
          {
            icon: 'close',
            text: this.translate.instant('GENERAL.FERMER'),
            role: 'cancel',
            handler: () => {
              console.log('Fermer cliqué');
            }
          }
        ]
      });
      toast.present();
    }  
  
  
    annuler(){
      if(this.action === 'modifier' || this.action === 'mdpasse' || this.action === 'identifiant'){
        //this.action = "infos";
        this.infos(this.unUtilisateur);
      }else{
        this.action = 'liste';
        //this.actualiserTableau(this.utilisateursData);
      }
    }
  
    retour(){
      if(this.action === 'modifier' || this.action === 'mdpasse' || this.action === 'identifiant'){
        //this.action = "infos";
        //console.log('ici')
        //console.log(this.unUtilisateur)
        this.infos(this.unUtilisateur)
      }else{
        //this.action = 'liste';
        this.action = this.cacheAction; 
        //recharger la liste
        if(this.rechargerListeMobile){
          this.utilisateursData = [...this.utilisateursData];
          this.rechargerListeMobile = false;
        }
        ///this.actualiserTableau(this.utilisateursData);
      }
    }

    
    async presentFiltrePays(filtrePays = [], doAjout = false) {
      //console.log('filte: '+filtrePays)
      const modal = await this.modalController.create({
        component: FiltrePaysComponent,
        componentProps: { filtrePays: filtrePays, translate: this.translate, doAjout: doAjout },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtrePays && dataReturned.data.filtrePays != ''){
          //this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtrePays;
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.pays = dataReturned.data.filtrePays;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        
      });

      return await modal.present();
    }
  
    async presentFiltreRegion(filtreRegion = [], doAjout = false, pays) {
      const modal = await this.modalController.create({
        component: FiltreRegionComponent,
        componentProps: { filtreRegion: filtreRegion, translate: this.translate, doAjout: doAjout, pays: pays },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtreRegion && dataReturned.data.filtreRegion != ''){
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.regions = dataReturned.data.filtreRegion;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        
      });

      return await modal.present();
    }

    async presentFiltreDepartement(filtreDepartement = [], doAjout = false, regions) {
      const modal = await this.modalController.create({
        component: FiltreDepartementComponent,
        componentProps: { filtreDepartement: filtreDepartement, translate: this.translate, doAjout: doAjout, regions: regions },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtreDepartement && dataReturned.data.filtreDepartement != ''){
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.departements = dataReturned.data.filtreDepartement;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        //this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtreDepartement;
      });

      return await modal.present();
    }

    async presentFiltreCommune(filtreCommune = [], doAjout = false, departements) {
      const modal = await this.modalController.create({
        component: FiltreCommuneComponent,
        componentProps: { filtreCommune: filtreCommune, translate: this.translate, doAjout: doAjout, departements: departements },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtreCommune && dataReturned.data.filtreCommune != ''){
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.communes = dataReturned.data.filtreCommune;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        //this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtreCommune;
      });

      return await modal.present();
    }

    async presentFiltrePartenaire(filtrePartenaire = [], doAjout = false) {
      const modal = await this.modalController.create({
        component: FiltrePartenaireComponent,
        componentProps: { filtrePartenaire: filtrePartenaire, translate: this.translate, doAjout: doAjout },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtrePartenaire && dataReturned.data.filtrePartenaire != ''){
          //this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtrePartenaire;
          //console.log(this.utilisateurForm.controls)
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.partenaires = dataReturned.data.filtrePartenaire;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        
      });

      return await modal.present();
    }
  
    async presentFiltreUnion(filtreUnion = [], doAjout = false, partenaires) {
      const modal = await this.modalController.create({
        component: FiltreUnionComponent,
        componentProps: { filtreUnion: filtreUnion, translate: this.translate, doAjout: doAjout, partenaires: partenaires },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtreUnion && dataReturned.data.filtreUnion != ''){
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.unions = dataReturned.data.filtreUnion;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        
      });

      return await modal.present();
    }

    async presentFiltreOP(filtreOP = [], doAjout = false, unions) {
      const modal = await this.modalController.create({
        component: FiltreOpComponent,
        componentProps: { filtreOP: filtreOP, translate: this.translate, doAjout: doAjout, unions: unions },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtreOP && dataReturned.data.filtreOP != ''){
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.ops = dataReturned.data.filtreOP;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        
        //this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtreOP;
      });

      return await modal.present();
    }

    async presentFiltrePersonne(filtrePersonne = [], doAjout = false) {
      const modal = await this.modalController.create({
        component: FiltrePersonneComponent,
        componentProps: { filtrePersonne: filtrePersonne, translate: this.translate, doAjout: doAjout },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtrePersonne;
      });

      return await modal.present();
    }

    async presentFiltreProjet(filtreProjet = [], doAjout=false) {
      const modal = await this.modalController.create({
        component: FiltreProjetComponent,
        componentProps: { filtreProjet: filtreProjet, translate: this.translate, doAjout: doAjout },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtreProjet && dataReturned.data.filtreProjet != ''){
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.projets = dataReturned.data.filtreProjet;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        

        //this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtreProjet;
      });

      return await modal.present();
    }

    async presentFiltreProtocole(filtreProtocole = [], doAjout = false, projets) {
      const modal = await this.modalController.create({
        component: FiltreProtocoleComponent,
        componentProps: { filtreProtocole: filtreProtocole, translate: this.translate, doAjout: doAjout, projets: projets },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtreProtocole && dataReturned.data.filtreProtocole != ''){
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.protocoles = dataReturned.data.filtreProtocole;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        
        //this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtreProtocole;
      });

      return await modal.present();
    }


    async presentFiltreStationMeteo(filtreStationMeteo = [], doAjout = false) {
      const modal = await this.modalController.create({
        component: FiltreStationMeteoComponent,
        componentProps: { filtreStationMeteo: filtreStationMeteo, translate: this.translate, doAjout: doAjout},
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtreStationMeteo && dataReturned.data.filtreStationMeteo != ''){
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.stationMeteos = dataReturned.data.filtreStationMeteo;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        
        //this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtreProtocole;
      });

      return await modal.present();
    }


    async presentFiltreDonneesUtilisateurs(filtreDonneesUtilisateurs = [], doAjout = false) {
      const modal = await this.modalController.create({
        component: FiltreDonneesUtilisateursComponent,
        componentProps: { filtreDonneesUtilisateurs: filtreDonneesUtilisateurs, translate: this.translate, doAjout: doAjout },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((dataReturned) => {
        if(dataReturned.data && dataReturned.data.filtreDonneesUtilisateurs && dataReturned.data.filtreDonneesUtilisateurs != ''){
          let acc = this.utilisateurForm.controls.accessDonnes.value;
          acc.donneesUtilisateurs = dataReturned.data.filtreDonneesUtilisateurs;
          this.utilisateurForm.controls.accessDonnes.setValidators(acc);
        }
        
        //this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtreDonneesUtilisateurs;
      });

      return await modal.present();
    }


    async actionPopover(ev: any) {
      const popover = await this.popoverController.create({
        component: ActionComponent,
        event: ev,
        translucent: true,
        //componentProps: {"id": "salu"},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'ajouter') {
          this.ajouter();
          this.selectedIndexes = [];
        }else if(dataReturned !== null && dataReturned.data == 'infos') {
          this.selectedItemInfo();
          /*if(this.selectedIndexes.length == 1){
            this.infos(this.utilisateursData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.utilisateursData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
          }*/
        } else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          this.suppressionMultipleDefinitive(this.selectedIndexes);
        }
      });
      return await popover.present();
    }
  

    async actionDatatablePopover(ev: any) {
      const popover = await this.popoverController.create({
        component: ActionDatatableComponent,
        event: ev,
        translucent: true,
        componentProps: {"action": this.action, "recherchePlus": this.recherchePlus, "filterAjouter": this.filterAjouter},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'dataTableAddRechercheParColonne') {
          if(!this.recherchePlus){
            this.dataTableAddRechercheParColonne();
          }else{
            this.dataTableRemoveRechercheParColonne();
          }
        } else if(dataReturned !== null && dataReturned.data == 'dataTableAddCustomFiltre') {
          if(!this.filterAjouter){
            this.dataTableAddCustomFiltre();
          }else{
            this.dataTableRemoveCustomFiltre();
          }
        } else if(dataReturned !== null && dataReturned.data == 'exportExcel') {
          this.exporter();
        } else if(dataReturned !== null && dataReturned.data == 'changeStyle') {
          this.changeStyle();
        } else if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.getUtilisateursByType('corbeille');
        } else if(dataReturned !== null && dataReturned.data == 'archives') {
          this.getUtilisateursByType('archives');
        } else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getUtilisateursByType('partages');
        } else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.getUtilisateurWithConflicts();
        } else if(dataReturned !== null && dataReturned.data == 'liste') {
          this.getUtilisateursByType('liste');
        } 

  
      });
      return await popover.present();
    }


    async selectionPopover(ev: any) {
      const popover = await this.popoverController.create({
        component: SelectionComponent,
        event: ev,
        translucent: true,
        //componentProps: {"id": "salu"},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'tous') {
          this.dataTableSelectAll();
        }else if(dataReturned !== null && dataReturned.data == 'aucun') {
          this.dataTableSelectNon();
        }
      });
      return await popover.present();
    }

    async datatableMorePopover(ev: any) {
      const popover = await this.popoverController.create({
        component: DatatableMoreComponent,
        event: ev,
        translucent: true,
        componentProps: {action: this.action},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'listePrincipale') {
          this.getUtilisateursByType('liste');
        }else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getUtilisateursByType('partages');
        }else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.getUtilisateurWithConflicts();
        }else if(dataReturned !== null && dataReturned.data == 'styleAffichage') {
          //this.action = this.cacheAction;
          this.changeStyle();
          //this.selectedIndexes = [];
          
        }
      });
      return await popover.present();
    }

    getUtilisateurWithConflicts(event = null){
      this.action = 'conflits';
      this.cacheAction = 'conflits';
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;

      this.servicePouchdb.findRelationalDocInConflict('utilisateur').then((res) => {
        if(res){
          //this.utilisateursData = [];
          let utilisateursData = [];
          for(let p of res.utilisateurs){
            //supprimer l'historique de la liste
            delete p.security['shared_history'];

            utilisateursData.push({id: p.id, ...p.formData, ...p.formioData, ...p.security});
          }

          if(this.mobile){
            utilisateursData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
            this.utilisateursData = [...utilisateursData]
            this.allUtilisateursData = [...utilisateursData];
          } else {

          //si non mobile
          //if(this.utilisateursData.length > 0){
            //$('#utilisateur').ready(()=>{
              if(global.langue == 'en'){
                this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, utilisateursData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, utilisateursData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.attacheEventToDataTable(this.utilisateurHTMLTable.datatable);
           // });
         // }
          }

        }

        if(event)
          event.target.complete();
      }).catch((err) => {
        this.utilisateurs = [];
        this.utilisateursData = [];
        console.log(err);
        if(event)
            event.target.complete();
      });
    }

    getUtilisateursByType(type){
      this.action = type;
      this.cacheAction = type;
      this.getUtilisateur();
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;
    }

    async datatableConstructPopover(ev: any) {
      const popover = await this.popoverController.create({
        component: DatatableConstructComponent,
        event: ev,
        translucent: true,
        componentProps: {"action": this.action, "cacheAction": this.cacheAction, "limite": true, "user": "admin"},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          this.suppressionMultipleDefinitive(this.selectedIndexes)
        }else if(dataReturned !== null && dataReturned.data == 'mdpasse') {
          this.changerMdPasse(this.selectedIndexes);
        }else if(dataReturned !== null && dataReturned.data == 'identifiant') {
          this.changerIdentifiant(this.selectedIndexes);
        }
      });
      return await popover.present();
    }
    
    async presentDerniereModification(utilisateur) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { _id: utilisateur.id, _rev: utilisateur.rev, security: utilisateur.security },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async connexion() {
      const modal = await this.modalController.create({
        component: ConnexionPage,
        //componentProps: { idMembre: idMembre },
        mode: 'ios',
        backdropDismiss: false,
        cssClass: 'costom-connexion-modal',
      });
      return await modal.present();
    }

    async profil() {
      const modal = await this.modalController.create({
        component: ProfilPage,
        //componentProps: { idMembre: idMembre },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-connexion-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      let id
      if(this.action == 'infos'){
        id = this.unUtilisateur.id;
      }else{
        id = this.selectedIndexes[0];
      }

      if(id && id != ''){
        this.servicePouchdb.findRelationalDocByID('utilisateur', id).then((res) => {
          if(res && res.utilisateurs[0]){
            if(this.estModeCocherElemListe){
              this.estModeCocherElemListe = false;
              this.decocherTousElemListe();
            }
            this.presentDerniereModification(res.utilisateurs[0]);
          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          }
        });
        //this.selectedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      }
    }

    doNext(){

      //si datatable
      if(!this.mobile){
        this.datatableNextRow();
      }else{
        //si liste
      }
    }

    doPrev(){
      //si datatable
      if(!this.mobile){
        this.datatablePrevRow();
      }else{
        //si liste
      }
    }

    initDatatableNextPrevRow(){
      var i = this.utilisateurHTMLTable.datatable.row('.selected').index();

      if(this.utilisateurHTMLTable.datatable.row(i).next()){
        this.next = true;
      }else{
        this.next = false;
      }

      if(this.utilisateurHTMLTable.datatable.row(i).prev()){
        this.prev = true;
      }else{
        this.prev = false;
      }
    }

    datatableNextRow(){
      //datatable.row(this.selectedIndexes).next().data();
      var i = this.utilisateurHTMLTable.datatable.row('.selected').index();
      if(this.utilisateurHTMLTable.datatable.row(i).next()){
        //this.utilisateurHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.utilisateurHTMLTable.datatable.rows().deselect();
        this.utilisateurHTMLTable.datatable.row(i).next().select();
        this.selectedItemInfo();
        
        if(this.utilisateurHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }else{
        this.next = false;

        if(this.utilisateurHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }
    }

    datatablePrevRow(){
      //datatable.row(this.selectedIndexes).prev().data();
      var i = this.utilisateurHTMLTable.datatable.row('.selected').index();
      if(this.utilisateurHTMLTable.datatable.row(i).prev()){
        //this.utilisateurHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.utilisateurHTMLTable.datatable.rows().deselect();
        this.utilisateurHTMLTable.datatable.row(i).prev().select();
        this.selectedItemInfo();
        
        if(this.utilisateurHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }else{
        this.prev = false;

        if(this.utilisateurHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }
    }

    datatableDeselectMultipleSelectedItemForModification(){
      if(this.selectedIndexes.length > 1){
        var i = this.utilisateurHTMLTable.datatable.row('.selected').index();
        this.utilisateurHTMLTable.datatable.rows().deselect();
        this.utilisateurHTMLTable.datatable.row(i).select();
      }
    }

    selectedItemInfo(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.utilisateurHTMLTable.datatable.row('.selected').index();
      let data  = this.utilisateurHTMLTable.datatable.row(row).data();
      this.infos(data);
      this.initDatatableNextPrevRow();


        //this.selectedIndexes = [];
      //}else{
      //  alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      //}
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.utilisateurHTMLTable.datatable.row('.selected').index();
      let data  = this.utilisateurHTMLTable.datatable.row(row).data();
      this.modifier(data);

      //this.selectedIndexes = [];
      //}else{
       // alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      //}
    }
  
  
  
    onSubmit(){
      let formData = this.utilisateurForm.value;
      if(this.action === 'ajouter'){
        //créer un nouveau utilisateur
        let u = this.clone(formData);

        delete formData.mdPasse;
        delete formData.identifiant;
        //formData.roles = Array.from(new Set(formData.roles.concat(formData.groupes)));
        //formData.roles = formData.groupe;

        this.servicePouchdb.creerUtilisateur(u.identifiant, u.mdPasse, formData).then((res) => {
          u._id = res.id;
          u.name = u.identifiant

          delete u.mdPasse;
          
          this.action = 'liste';
          //this.rechargerListeMobile = true;
          if (!this.mobile){
            //mode tableau, ajout d'un autre utilisateur dans la liste
            this.dataTableAddRow(u)
          }else{
            //mobile, cache la liste des utilisateur pour mettre à jour la base de données
            this.utilisateursData.push(u);
            this.utilisateursData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.utilisateursData = [...this.utilisateursData];

            this.allUtilisateursData.push(u);
            this.allUtilisateursData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
            
          }
        }).catch((err) => {
          if (err) {
            if (err.name === 'conflict') {
              this.message_err = u.identifiant+" already exists, choose another username";
            } else if (err.name === 'forbidden') {
              this.message_err = "invalid username";
            } else {
              this.message_err = "HTTP error, cosmic rays, etc.";
            }
          }
        })
  
      }else if(this.action === 'modifier'){
        let u = this.clone(formData);


        delete formData.mdPasse;
        delete formData.identifiant;

        //formData.roles = formData.groupe;
        //formData.roles = Array.from(new Set(formData.roles.concat(formData.groupes)));
  
        this.servicePouchdb.updateInfoUtilisateur(u.identifiant, formData).then((res) => {
          
          u._id = res.id;
          u.name = u.identifiant

          delete u.mdPasse;
          
          //this.action = 'infos';
          this.infos(u);

          if(this.mobile){
           for(let i = 0; i < this.utilisateursData.length; i++){
              if(this.utilisateursData[i]._id == u._id){
                this.utilisateursData[i] = u;
                break;
              }
            }

            this.utilisateursData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //mise à jour dans la liste cache
            for(let i = 0; i < this.allUtilisateursData.length; i++){
              if(this.allUtilisateursData[i]._id == u._id){
                this.allUtilisateursData[i] = u;
                break;
              }
            }

            this.allUtilisateursData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
            this.rechargerListeMobile = true;
          }else{
            //mode tableau
            //deselect multiple items selected
            this.datatableDeselectMultipleSelectedItemForModification();
            this.dataTableUpdateRow(u);
          }

          
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }else if(this.action === 'mdpasse'){
        this.servicePouchdb.changerMdPass(this.unUtilisateur.name, formData.mdPasse).then((res) => {
          //this.action = 'infos';
          this.infos(this.unUtilisateur);
        
        }).catch((err) => {
          if (err) {
            if (err.name === 'not_found') {
              this.message_err = "typo, or you don't have the privileges to see this user"
            } else {
              this.message_err = "some other error";
            }
          }
        });

      }else{
        this.servicePouchdb.changerNomutilisateur(this.unUtilisateur.name, formData.identifiant).then((res) => {
    
          //this.action = 'infos';
          this.unUtilisateur.name = formData.identifiant;
          this.unUtilisateur.identifiant = formData.identifiant;
          this.infos(this.unUtilisateur);
        
        }).catch((err) => {
          if (err) {
            if (err.name === 'not_found') {
              this.message_err = "typo, or you don't have the privileges to see this user";
            } else if (err.taken) {
              this.message_err = "auth error, make sure that 'batman' isn't already in DB"
            } else {
              this.message_err = "some other error";
            }
          }
        });
      }
    }
  
  
    actualiserTableau(data){
        if(data.length > 0 && !this.mobile){
          $('#utilisateur').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              
              if(global.langue == 'en'){
                this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.utilisateurHTMLTable.datatable);
          });
        }
      
    }
  
    doRefresh(event) {
      let id = 'utilisateur';
      if(this.filtreDonneesUtilisateurs){
        id = 'utilisateur-relation';
      }

      this.servicePouchdb.getAllUsers().then((res) => {
        //console.log(res)
        if(res){

          let utilisateursData = [];
          if(this.filtreDonneesUtilisateurs){
            res.rows.map((row) => {
              //if(row.doc.db === 'frna'){
                let doc: any =row.doc
                if(this.filtreDonneesUtilisateurs.indexOf(doc.name) === -1){
                  doc.identifiant = doc.name
                  utilisateursData.push(doc);
                }
              //}
            });

          }else{
            res.rows.map((row) => {
              //if(row.doc.db === 'frna'){
                let doc: any =row.doc
                doc.identifiant = doc.name
                utilisateursData.push(doc);
              //}
            });
          }
  


          if(this.mobile){
            utilisateursData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.utilisateursData = [...utilisateursData];
            this.allUtilisateursData = [...utilisateursData];
          } else{
            let expor = global.peutExporterDonnees;
            if(this.filtreDonneesUtilisateurs){
              expor = false;
            }
            //$('#utilisateur').ready(()=>{
              if(global.langue == 'en'){
                this.utilisateurHTMLTable = createDataTable(id, this.colonnes, utilisateursData, null, this.translate, expor);
              }else{
                this.utilisateurHTMLTable = createDataTable(id, this.colonnes, utilisateursData, global.dataTable_fr, this.translate, expor);
              }

              this.attacheEventToDataTable(this.utilisateurHTMLTable.datatable);
          // });
          }

          if(event)
            event.target.complete();
          
        }
      }).catch((err) => {
        if(err){
          if(err.error === 'unauthorized'){
            console.log("Vous n'ètes pas administrateur du serveur ", err)
          }else{
            console.log("Problème de connexion au serveur ", err)
          }
        }
        this.utilisateurs = [];
        this.utilisateursData = [];
        this.allUtilisateursData = [];
        if(event)
            event.target.complete();
        //console.log('Erreur acces aux utilisateurs');
        //console.log(err);
        if(!this.mobile){
          if(global.langue == 'en'){
            this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, [], null, this.translate, global.peutExporterDonnees);
          }else{
            this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, [], global.dataTable_fr, this.translate, global.peutExporterDonnees);
          }

          this.attacheEventToDataTable(this.utilisateurHTMLTable.datatable);
        }
      });
      
      this.filterAjouter = false;
      this.filterInitialiser = false;
      this.recherchePlus = false;
      this.allSelected = false;
      this.selectedIndexes = [];
      /*setTimeout(() => {
        event.target.complete();
      }, 2000);*/
    }

    
    addItemToObjectAtSpecificPosition (obj, key, value, index) {

      // Create a temp object and index variable
      let temp = {};
      let i = 0;
  
      // Loop through the original object
      for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
  
          // If the indexes match, add the new item
          if (i === index && key/* && value*/) {
            temp[key] = value;
          }
  
          // Add the current item in the loop to the temp obj
          temp[prop] = obj[prop];
  
          // Increase the count
          i++;
  
        } 
      }
  
      // If no index, add to the end
      if (!index && key/* && value*/) {
        temp[key] = value;
      }
  
      return temp;
  
    }
  
    getUtilisateur(){
      this.loading = true;
      //tous les utilisateurs
      let id = 'utilisateur';
      if(this.filtreDonneesUtilisateurs){
        id = 'utilisateur-relation';
      }

      this.servicePouchdb.getAllUsers().then((res) => {
        //console.log(res)
        if(res){

          let utilisateursData = [];
          if(this.filtreDonneesUtilisateurs){
            res.rows.map((row) => {
              //if(row.doc.db === 'frna'){
                let doc: any =row.doc
                if(this.filtreDonneesUtilisateurs.indexOf(doc.name) === -1){
                  doc.identifiant = doc.name
                  utilisateursData.push(doc);
                }
              //}
            });

          }else{
            res.rows.map((row) => {
              //if(row.doc.db === 'frna'){
                let doc: any =row.doc
                doc.identifiant = doc.name
                utilisateursData.push(doc);
              //}
            });
          }

          //let utilisateursData = res

          this.loading = false;
          if(this.mobile){
            utilisateursData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.utilisateursData = [...utilisateursData];
            this.allUtilisateursData = [...utilisateursData];
          } else{
              //this.utilisateursData = [...datas];
            let expor = global.peutExporterDonnees;
            if(this.filtreDonneesUtilisateurs){
              expor = false;
            }
            //si non mobile ou mobile + mode tableau et 
            //if(this.utilisateursData.length > 0){
            //$('#utilisateur').ready(()=>{
              if(global.langue == 'en'){
                this.utilisateurHTMLTable = createDataTable(id, this.colonnes, utilisateursData, null, this.translate, expor);
              }else{
                this.utilisateurHTMLTable = createDataTable(id, this.colonnes, utilisateursData, global.dataTable_fr, this.translate, expor);
              }

              this.attacheEventToDataTable(this.utilisateurHTMLTable.datatable);
          // });
          // }
          }
          
        }
      }).catch((err) => {
        this.loading = false;
        if(err){
          if(err.error === 'unauthorized'){
            console.log("Vous n'ètes pas administrateur du serveur ", err)
          }else{
            console.log("Problème de connexion au serveur ", err)
          }
        }
        this.utilisateurs = [];
        this.utilisateursData = [];
        this.allUtilisateursData = [];
        if(!this.mobile){
          if(global.langue == 'en'){
            this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, [], null, this.translate, global.peutExporterDonnees);
          }else{
            this.utilisateurHTMLTable = createDataTable("utilisateur", this.colonnes, [], global.dataTable_fr, this.translate, global.peutExporterDonnees);
          }

          this.attacheEventToDataTable(this.utilisateurHTMLTable.datatable);
        }
        //console.log('Erreur acces aux utilisateurs');
        //console.log(err);
      });
      
    }
  
  


    attacheEventToDataTable(datatable){
      var self = this;
      var id = 'utilisateur-datatable';
      datatable.on( 'select', function ( e, dt, type, indexes ) {
        for(const i of indexes){
          //pour éviter les doublon d'index
          if(self.selectedIndexes.indexOf(datatable.row(i).data().name) === -1){
            self.selectedIndexes.push(datatable.row(i).data().name)
          }
        }

        var info = datatable.page.info();
        if(info.recordsDisplay == self.selectedIndexes.length){
          self.allSelected = true;
        }else{
          self.allSelected = false;
        }
        
      } )
      .on( 'deselect', function ( e, dt, type, indexes ) {
        for(const i of indexes){
          //pour éviter les erreurs d'index
          if(self.selectedIndexes.indexOf(datatable.row(i).data().name) !== -1){
            self.selectedIndexes.splice(self.selectedIndexes.indexOf(datatable.row(i).data().name), 1)
          }
        }

        var info = datatable.page.info();
        if(info.recordsDisplay == self.selectedIndexes.length){
          self.allSelected = true;
        }else{
          self.allSelected = false;
        }
        
      } ).on( 'search.dt', function () {
        var info = datatable.page.info();
        if(info.recordsDisplay == self.selectedIndexes.length){
          self.allSelected = true;
        }else{
          self.allSelected = false;
        }
      })/*.on( 'dblclick', 'tr', function ( e, dt, type, indexes) {
        console.log(e)
        //console.log(dt)
        //console.log(type)
        //console.log(indexes)
        
        console.log(this);
        console.log(this.utilisateurHTMLTable.datatable.row(this).data());
      })*/;
      
      $('#'+id+' tbody').on( 'dblclick', 'tr', function () {
        //datatable.$('tr.selected').removeClass('selected');
        //$(this).addClass('selected');
        datatable.row('.selected').deselect();
        datatable.row(this).select();
        self.selectedItemInfo();
        //console.log(datatable.row(this).data()[0]);
      });

      //traduitre les collonnes de la table la table
      this.translateDataTableCollumn();
    }
  
    translateDataTableCollumn(){
      /*var id = '';
      if(this.codePays && this.codePays != ''){
        id = 'utilisateur-pays-datatable';
      }else{ 
        id = 'utilisateur-datatable';
      }


      $('#'+id+' thead tr:eq(0) th:eq(0)').html(this.translate.instant('PAYS_PAGE.CODEPAYS'));
      //$('#'+id+' thead tr:eq(0) th:eq(0)').attr({'title': this.translate.instant('PAYS_PAGE.CODEPAYS')});
      $('#'+id+' thead tr:eq(0) th:eq(1)').html(this.translate.instant('PAYS_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(2)').html(this.translate.instant('REGION_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(3)').html(this.translate.instant('REGION_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(4)').html(this.translate.instant('DEPARTEMENT_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(5)').html(this.translate.instant('DEPARTEMENT_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(6)').html(this.translate.instant('COMMUNE_PAGE.CODE'));    
      $('#'+id+' thead tr:eq(0) th:eq(6)').html(this.translate.instant('COMMUNE_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(7)').html(this.translate.instant('UTILISATEUR_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(8)').html(this.translate.instant('UTILISATEUR_PAGE.NUMERO'));
      $('#'+id+' thead tr:eq(0) th:eq(9)').html(this.translate.instant('UTILISATEUR_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(10)').html(this.translate.instant('UTILISATEUR_PAGE.CATEGORIE'));
      $('#'+id+' thead tr:eq(0) th:eq(11)').html(this.translate.instant('UTILISATEUR_PAGE.AUTRETYPE'));
      $('#'+id+' thead tr:eq(0) th:eq(12)').html(this.translate.instant('GENERAL.LATITUDE'));
      $('#'+id+' thead tr:eq(0) th:eq(13)').html(this.translate.instant('GENERAL.LONGITUDE'));
      */
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }

  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //nom utilisateur
      this.translate.get('UTILISATEUR_PAGE.MESSAGES_VALIDATION.NOM.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });

      this.translate.get('UTILISATEUR_PAGE.MESSAGES_VALIDATION.IDENTIFIANT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.identifiant[0].message = res;
      });
      this.translate.get('UTILISATEUR_PAGE.MESSAGES_VALIDATION.IDENTIFIANT.UNIQUE').subscribe((res: string) => {
        this.messages_validation.identifiant[1].message = res;
      });

      this.translate.get('UTILISATEUR_PAGE.MESSAGES_VALIDATION.MDPASSE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.mdPasse[0].message = res;
      });
    }
  
    
    dataTableAddRow(rowData){
      /*let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });*/
  
      $('#utilisateur-dataTable').ready(() => {
        this.utilisateurHTMLTable.datatable.row.add(rowData).draw();
        //this.utilisateurHTMLTable.datatable.row.add(data).draw();
      });
    }
  
    dataTableUpdateRow(/*index, */rowData){
      /*let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });*/
      $('#utilisateur-dataTable').ready(() => {
        this.utilisateurHTMLTable.datatable.row('.selected').data(rowData).draw();
        //this.utilisateurHTMLTable.datatable.row('.selected').data(data).draw();
      })
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      $('#utilisateur-dataTable').ready(() => {
        this.utilisateurHTMLTable.datatable.rows('.selected').remove().draw();
      })
      
    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.utilisateurHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.utilisateurHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.utilisateurHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    if(this.utilisateurHTMLTable && this.utilisateurHTMLTable.datatable){
      //var id = 'utilisateur-datatable';

      var self = this;
      //$('#'+id+' thead tr:eq(1)').show();

      //$(self.utilisateurHTMLTable.datatable.table().header()).children(1).show();
      $(self.utilisateurHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
      this.recherchePlus = true;
    }
  }

  dataTableRemoveRechercheParColonne(){
    //var id = 'utilisateur-datatable';
    var self = this;

    //$('#'+id+' thead tr:eq(1)').hide();
    //children(0).children(0)[1].firstChild.nodeValue
    //console.log($(self.utilisateurHTMLTable.datatable.table().header()).children(1)[1])
    $(self.utilisateurHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'utilisateur-datatable';
    var self = this;
    var lang;
    if(global.langue == 'fr'){
      lang = 'fr_FR';
    }else if(global.langue == 'ha'){
      lang = 'ha_HA';
    } else{
      lang = 'en_US';
    }

    if(!this.filterAjouter && !this.filterInitialiser){
      var i = -1;
      //$('#'+id+' tfoot').show();
      $( self.utilisateurHTMLTable.datatable.table().footer() ).show();
      this.utilisateurHTMLTable.datatable.columns().every( function () {
          i = i +1;
          var column = this;
          var select = $('<select id="'+id+i+'" data-header="'+$(column.header())[0].firstChild.nodeValue+'" placeholder="'+self.translate.instant('GENERAL.FILTRER')+'" class="form-control form-control-sm" multiple data-language="'+lang+'" data-selected-text-format="count" data-width="100%" data-live-search="true" data-size="5" data-actions-box="true" data-container="body"></select>')
              .appendTo( $(column.footer()).empty() )
              .on( 'change', function () {
                  var val = $(this).val();
                  var vide = false;
                  if(val.indexOf('vide') !== -1){ 
                      vide = true;
                      val[val.indexOf('vide')] = '';
                  }
                  
                  var mergedVal = val.join('|');
                  column
                      .search( mergedVal || vide ? '^'+mergedVal+'$' : '', true, false )
                      .draw();
                  
                  var info = self.utilisateurHTMLTable.datatable.page.info();
                  if(info.recordsDisplay == self.selectedIndexes.length){
                    self.allSelected = true;
                  }else{
                    self.allSelected = false;
                  }

              } );

          column.data().unique().sort().each( function ( d, j ) {
              if(!d){
                  select.append( '<option value="vide">('+self.translate.instant('GENERAL.VIDE')+')</option>' )
              }else{
                  select.append( '<option value="'+d+'">'+d+'</option>' )
              }
              
          } );

          $('#'+id+i).selectpicker();
              $('.ms-parent').removeAttr("style");
      } );

      this.utilisateurHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
        if(!$('#'+id+colIdx).attr('style') && visibility){
            $('#'+id+colIdx).selectpicker();
              $('.ms-parent').removeAttr("style");
          }
      });

      this.filterAjouter = true;
      this.filterInitialiser = true;

    } else if(!this.filterAjouter && this.filterInitialiser){
      //$('#'+id+' tfoot').show();
      $( self.utilisateurHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }

  dataTableRemoveCustomFiltre(){
    var id = 'utilisateur-datatable';
    var self = this;
    //$('#'+id+' tfoot').hide();
    $( self.utilisateurHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }


    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        //let p = [...this.utilisateursData]
        this.utilisateursData = this.allUtilisateursData.filter((item) => {
          return item.nom.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.utilisateurData = temp;
      
    }
    
    /*async close(){
      await this.modalController.dismiss();
    }*/

    async close(){
      await this.modalController.dismiss({filtreDonneesUtilisateurs: this.filtreDonneesUtilisateurs});
    }

    async valider() {
      //this.filtreDonneesUtilisateurs = [];
      this.filtreDonneesUtilisateurs = this.filtreDonneesUtilisateurs.concat(this.selectedIndexes);

      await this.modalController.dismiss({filtreDonneesUtilisateurs: this.filtreDonneesUtilisateurs});
    }
    
    ionViewDidEnter(){ 

    }

    
    ionViewWillEnter(){ 
      this.initMultipleSelect(this.translate);
    }
    
    initMultipleSelect(t){
      $(function () {
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


}
