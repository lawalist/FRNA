import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NumeroCommuneValidator } from '../../validators/commune.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController  } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsCommuneComponent } from '../../component/relations-commune/relations-commune.component';
import { global } from '../../../app/globale/variable';
import { PaysPage } from '../pays/pays.page';
import { RegionPage } from '../region/region.page';
import { DepartementPage } from '../departement/departement.page';
import { VillagePage } from '../village/village.page';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { ListOptionsComponent } from 'src/app/component/list-options/list-options.component';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToTHMLTable: any;
declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-commune',
  templateUrl: './commune.page.html',
  styleUrls: ['./commune.page.scss'],
})
export class CommunePage implements OnInit {

  
  @Input() codePays: string;
  @Input() codeRegion: string;
  @Input() codeDepartement: string;
  @Input() codeCommune: string;
  communeForm: FormGroup;
  action: string = 'liste';
  communes: any;
  communesData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  uneCommune: any;
  communeHTMLTable: any;
  htmlTableAction: string;
  seletedIndexes: any = [];
  mobile = global.mobile;
  styleAffichage: string = "liste";
  allSelected: boolean = false;
  recherchePlus: boolean = false;
  filterAjouter: boolean = false;
  filterInitialiser: boolean = false;
  estModeCocherElemListe: boolean = false;

  messages_validation = {
    'codeCommune': [
        { type: 'required', message: '' },
      ],
    'numeroCommune': [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' },
      { type: 'maxlength', message: '' },
      { type: 'pattern', message: '' },
      { type: 'validNumeroCommune', message: '' },
      { type: 'uniqueNumeroCommune', message: '' }
    ],
    'nomCommune': [
      { type: 'required', message: '' }
    ],
    'codePays': [
      { type: 'required', message: '' }
    ],
    'nomPays': [
      { type: 'required', message: '' }
    ],
    'paysLoading': [
      { type: 'loagin', message: '' }
    ],
    'codeRegion': [
      { type: 'required', message: '' }
    ],
    'nomRegion': [
      { type: 'required', message: '' }
    ],
    'regionLoading': [
      { type: 'loagin', message: '' }
    ],
    'codeDepartement': [
      { type: 'required', message: '' }
    ],
    'nomDepartement': [
      { type: 'required', message: '' }
    ],
    'departementLoading': [
      { type: 'loagin', message: '' }
    ]
  }

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);
    }
  
    ngOnInit() {
      if(this.codeCommune && this.codeCommune != ''){
        this.codeDepartement = this.codeCommune.substr(0, 7);
      }
      //au cas où la commune est en mode modal, on chercher info region
      if(this.codeDepartement && this.codeDepartement != ''){
        this.codeRegion = this.codeDepartement.substr(0, 5);
      }
      if(this.codeRegion && this.codeRegion != ''){
        this.codePays = this.codeRegion.substr(0, 2);
      }
      this.translateLangue();
      this.getCommune();
    }
  
    /*changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.actualiserTableau(this.communesData);
      }else {
        this.styleAffichage = 'liste';
        this.seletedIndexes = [];
      }
    }*/

    
    changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.estModeCocherElemListe = false;
        this.actualiserTableau(this.communesData);
      }else {
        this.styleAffichage = 'liste';
        this.seletedIndexes = [];
        this.estModeCocherElemListe = false;
      }
    }
  
    cocherElemListe(codeCommune){
      if(this.seletedIndexes.indexOf(codeCommune) === -1){
        //si coché
        this.seletedIndexes.push(codeCommune);
      }else{
        //si décocher
        this.seletedIndexes.splice(this.seletedIndexes.indexOf(codeCommune), 1);
      }  
      
    }
  
    
    removeMultipleElem(data, indexes){
      let codes = [];
      if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
        indexes.forEach((i) => {
          codes.push(data[i].codeCommune);
        });
      }else{
        codes = indexes;
      }
      
  
      for(let i = 0; i < data.length; i++){
        if(codes.length == 0){
          break;
        }
        if(codes.indexOf(data[i].codeCommune) !== -1){
          codes.splice(codes.indexOf(data[i].codeCommune), 1);
          data.splice(i, 1);
          i--;
        }
      }
  
      return data;
    }
  
    changerModeCocherElemListe(){
       if(this.estModeCocherElemListe){
        this.estModeCocherElemListe = false
       }else{
        this.estModeCocherElemListe = true
       }
      this.seletedIndexes = [];
    }
  
    cocherTousElemListe(){
      this.communesData.forEach((c) => {
        //console.log(p.codePays+'   '+this.seletedIndexes.indexOf(p.codePays)+'    '+this.seletedIndexes)
        if(this.seletedIndexes.indexOf(c.codeCommune) === -1){
          this.seletedIndexes.push(c.codeCommune);
        }
      });
  
      $('ion-checkbox').prop("checked", true);
    }
  
    decocherTousElemListe(){
      $('ion-checkbox').prop("checked", false);
      this.seletedIndexes = [];
    }
  
  
    async listOptionsPopover(ev: any) {
      const popover = await this.popoverController.create({
        component: ListOptionsComponent,
        event: ev,
        translucent: true,
        componentProps: {"options": {
          "estModeCocherElemListe": this.estModeCocherElemListe,
          "dataLength": this.communesData.length,
          "seletedIndexesLength": this.seletedIndexes.length,
          "styleAffichage": this.styleAffichage
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
          this.changeStyle();
        }      
  
      });
      return await popover.present();
    }
  
    
    async supprimerElemCocherListe() {
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
        message: this.translate.instant('GENERAL.ALERT_MESSAGE'),
        //cssClass: 'aler-confirm',
        mode: 'ios',
        buttons: [
          {
            text: this.translate.instant('GENERAL.ALERT_OUI'),
            role: 'destructive',
            cssClass: 'alert-danger',
            handler: (data) => {
              

              var codesIndex = [];
              let codes = [...this.seletedIndexes];
              //console.log(codes)
              for(let i = 0; i < this.communesData.length; i++){
                if(codes.length == 0){
                  break;
                }

                //console.log(this.regionsData[i].codeRegion)
                if(codes.indexOf(this.communesData[i].codeCommune) !== -1){
                  //console.log('yes '+i)
                  codes.splice(codes.indexOf(this.communesData[i].codeCommune), 1);
                  codesIndex.push(i);
                  i--;
                }
              }

              var communesConcernee: any = {};
              codesIndex.forEach((si) => {
                var c = this.communesData[si];
                var exist = 0;

                if(communesConcernee['fuma:commune:'+c.codeDepartement]){
                  communesConcernee['fuma:commune:'+c.codeDepartement].data.splice(communesConcernee['fuma:commune:'+c.codeDepartement].data.indexOf(c), 1);
                  exist = 1;
                }

                if(!exist){
                  for(let com of this.communes){
                    if('fuma:commune:'+c.codeDepartement == com._id){
                      com.data.splice(com.data.indexOf(c), 1);
                      communesConcernee[com._id] = com
                      break;
                    }
                  }
                }
              });

              //mise à jour de communesData
             /* this.seletedIndexes.forEach((si) => {
                this.communesData.splice(this.communesData.indexOf(this.communesData[si]), 1);
              });
*/
              //update
              Object.keys(communesConcernee).forEach((key, index) => {
                this.servicePouchdb.updateLocalite(communesConcernee[key]).then((res) => {
                  communesConcernee[key]._rev = res.rev;
                  for(let i = 0; i < this.communes.length; i++){
                    if(this.communes[i]._id == communesConcernee[key]._id){
                      this.communes[i] = communesConcernee[key];
                      break;
                    }
                  }
                  if(index +1 == Object.keys(communesConcernee).length){
                    this.communesData = [...this.removeMultipleElem(this.communesData, this.seletedIndexes)];
                    this.decocherTousElemListe();
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
                  }
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });
              });
            }
          },{
            text: this.translate.instant('GENERAL.ALERT_ANNULER'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirmation annulée');
            }
          }
        ]
      });
  
      await alert.present();
    }
  

  
    initForm(){
      //this.communeForm = null;
      this.communeForm = this.formBuilder.group({
        codePays: ['', Validators.required],
        nomPays: ['', Validators.required],
        codeRegion: ['', Validators.required],
        nomRegion: ['', Validators.required],
        codeDepartement: ['', Validators.required],
        nomDepartement: ['', Validators.required],
        codeCommune: ['', {disabled: true}, Validators.required],
        numeroCommune: [''/*, Validators.compose([NumeroCommuneValidator.uniqueNumeroCommune(this.communesData, 'ajouter'), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required])*/],
        nomCommune: ['', Validators.required],
        latitude: [''],
        longitude: [''],
        created_at: [''],
        created_by: [''],
        updatet_at: [''],
        updated_by: [''],
        deleted: [''],
        deleted_at: [''],
        deleted_by: ['']
      });

      this.communeForm.valueChanges.subscribe(change => {
        this.communeForm.get('numeroCommune').setValidators([NumeroCommuneValidator.uniqueNumeroCommune(this.communesData, this.communeForm.value.codeDepartement, 'ajouter'), NumeroCommuneValidator.validNumeroCommune(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });
    }
  
    editForm(c){
      //this.communeForm = null;
      this.communeForm = this.formBuilder.group({
        codePays: [c.codePays, Validators.required],
        nomPays: [c.nomPays, Validators.required],
        codeRegion: [c.codeRegion, Validators.required],
        nomRegion: [c.nomRegion, Validators.required],
        codeDepartement: [c.codeDepartement, Validators.required],
        nomDepartement: [c.nomDepartement, Validators.required],
        codeCommune: [c.codeCommune, Validators.required],
        numeroCommune: [c.numeroCommune],
        nomCommune: [c.nomCommune, Validators.required],
        latitude: [c.latitude],
        longitude: [c.latitude],
        created_at: [c.created_at],
        created_by: [c.created_by],
        updatet_at: [c.updatet_at],
        updated_by: [c.updated_by],
        deleted: [c.deleted],
        deleted_at: [c.deleted_at],
        deleted_by: [c.deleted_by]
      });

      this.communeForm.valueChanges.subscribe(change => {
        this.communeForm.get('numeroCommune').setValidators([NumeroCommuneValidator.uniqueNumeroCommune(this.communesData, this.communeForm.value.codeDepartement, 'ajouter'), NumeroCommuneValidator.validNumeroCommune(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });
    }
  
    ajouter(){
      this.getPays();
      this.initForm();
      this.action = 'ajouter';
    }
  
    infos(c){
      if(!this.estModeCocherElemListe){
        this.uneCommune = c;
        this.action = 'infos';
      }
    }

  
    modifier(c){
      this.getPays();
      this.getRegionParPays(c.codePays);
      this.getDepartementParRegion(c.codeRegion);
      this.editForm(c);
      this.uneCommune = c;
      this.action ='modifier';
    }

    getPosition(){
      this.afficheMessage(this.translate.instant('GENERAL.OBTENTION_COORDONNEES'));
      this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
        this.communeForm.controls.latitude.setValue(resp.coords.latitude);
        this.communeForm.controls.longitude.setValue(resp.coords.longitude);
        this.afficheMessage(this.translate.instant('GENERAL.COORDONNEES_OBTENUES'));
      }, err => {
        this.afficheMessage(this.translate.instant('GENERAL.ERREUR_COORDONNEES'));
          console.log(err)
      });
    }
  
    exportExcel(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('commune-datatable').innerHTML], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        //type: "text/plain;charset=utf-8"
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        //type: 'application/vnd.ms-excel;charset=utf-8'
        //type: "application/vnd.ms-excel;charset=utf-8"
      });
  
      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'FRNA_Export_'+date+'.xls', blob).then(()=> {
          alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
      }).catch(()=>{
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
      });
    }
  
    exportPDF(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('commune-datatable').innerHTML], {
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        type: "text/plain;charset=utf-8"
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        //type: 'application/vnd.ms-excel;charset=utf-8'
        //type: "application/vnd.ms-excel;charset=utf-8"
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
  
  
    async supprimer(c) {
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
            handler: () => {
              //suppression définitive
              this.communesData.splice(this.communesData.indexOf(c), 1);
              //chercher la commune concernée
              var communeConcernee;
              for(let com of this.communes){
                if('fuma:commune:'+c.codeDepartement == com._id/*.substr(com._id.length - 2, 2)*/){
                  communeConcernee = com;
                  break;
                }
              }

              //mise à jour dans la commune
              communeConcernee.data.splice(communeConcernee.data.indexOf(c), 1)
      
              this.servicePouchdb.updateLocalite(communeConcernee).then((res) => {
                communeConcernee._rev = res.rev;
                //mise à jour de la liste des communes
                for(let i = 0; i < this.communes.length; i++){
                  if(this.communes[i]._id == communeConcernee._id){
                    this.communes[i] = communeConcernee;
                    break;
                  }
                }
                this.action = 'liste';
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
                if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                  this.dataTableRemoveRows();
                  this.seletedIndexes = [];
                }
                //this.htmlTableAction = 'recharger';
                //this.actualiserTableau(this.communesData);
              }).catch((err) => {
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());

              });
            }
          }
        ]
      });
  
      await alert.present();
    }
  
    async presentPays(codePays) {
      const modal = await this.modalController.create({
        component: PaysPage,
        componentProps: { codePays: codePays },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async presentRegion(codeRegion) {
      const modal = await this.modalController.create({
        component: RegionPage,
        componentProps: { codeRegion: codeRegion },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentDepartement(codeDepartement) {
      const modal = await this.modalController.create({
        component: DepartementPage,
        componentProps: { codeDepartement: codeDepartement },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
  
    async suppressionMultiple() {
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
            handler: () => {
              //suppression définitive
              var communesConcernee: any = {};
              this.seletedIndexes.forEach((si) => {
                var c = this.communesData[si];
                var exist = 0;

                if(communesConcernee['fuma:commune:'+c.codeDepartement]){
                  communesConcernee['fuma:commune:'+c.codeDepartement].data.splice(communesConcernee['fuma:commune:'+c.codeDepartement].data.indexOf(c), 1);
                  exist = 1;
                }

                if(!exist){
                  for(let com of this.communes){
                    if('fuma:commune:'+c.codeDepartement == com._id){
                      com.data.splice(com.data.indexOf(c), 1);
                      communesConcernee[com._id] = com
                      break;
                    }
                  }
                }
              });

              //mise à jour de communesData
              this.seletedIndexes.forEach((si) => {
                this.communesData.splice(this.communesData.indexOf(this.communesData[si]), 1);
              });

              //update
              Object.keys(communesConcernee).forEach((key, index) => {
                this.servicePouchdb.updateLocalite(communesConcernee[key]).then((res) => {
                  communesConcernee[key]._rev = res.rev;
                  for(let i = 0; i < this.communes.length; i++){
                    if(this.communes[i]._id == communesConcernee[key]._id){
                      this.communes[i] = communesConcernee[key];
                      break;
                    }
                  }
                  if(index +1 == Object.keys(communesConcernee).length){
                    this.action = 'liste';
                    //this.htmlTableAction = 'recharger';
                    //this.actualiserTableau(this.communesData);
                    this.dataTableRemoveRows();
                    this.seletedIndexes = [];
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
                  }
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });
              });
              
              
              //this.seletedIndexes = [];
            }
          }
        ]
      });
  
      await alert.present();
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
      if(this.action === 'modifier'){
        this.action = "infos";
      }else{
        this.action = 'liste';
        //this.actualiserTableau(this.communesData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        this.action = "infos";
      }else{
        this.action = 'liste';
        //this.actualiserTableau(this.communesData);
      }
    }
  
    async actionActionSheet() {
      const actionSheet = await this.actionSheetCtl.create({
        header: this.translate.instant('GENERAL.ACTION'),
        mode: 'ios',
        buttons: [{
          text: this.translate.instant('GENERAL.INFOS'),
          icon: 'information-circle',
          handler: () => {
            if(this.seletedIndexes.length == 1){
              this.infos(this.communesData[this.seletedIndexes[0]]);
              //this.seletedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
            }
          }
        }, {
          text: this.translate.instant('GENERAL.MODIFIER'),
          icon: 'create',
          handler: () => {
            if(this.seletedIndexes.length == 1){
              this.modifier(this.communesData[this.seletedIndexes[0]]);
              //this.seletedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
            }
          }
        }, {
          text: this.translate.instant('GENERAL.NOUVEAU'),
          icon: 'add',
          handler: () => {
            this.ajouter();
            //this.seletedIndexes = [];
          }
        }, {
          text: this.translate.instant('GENERAL.SUPPRIMER'),
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.suppressionMultiple();
          }
        }, {
          text: this.translate.instant('GENERAL.ANNULER'),
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Anuuler cliqué');
          }
        }]
      });
      await actionSheet.present();
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
          this.seletedIndexes = [];
        }else if(dataReturned !== null && dataReturned.data == 'infos') {
          this.selectedItemInfo();
          /*if(this.seletedIndexes.length == 1){
            this.infos(this.communesData[this.seletedIndexes[0]]);
            this.seletedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.seletedIndexes.length == 1){
            this.modifier(this.communesData[this.seletedIndexes[0]]);
            this.seletedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
          }*/
        } else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          this.suppressionMultiple();
        }
      });
      return await popover.present();
    }
  
    
    async actionDatatablePopover(ev: any) {
      const popover = await this.popoverController.create({
        component: ActionDatatableComponent,
        event: ev,
        translucent: true,
        //componentProps: {"id": "salu"},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'dataTableSelectAll') {
          this.dataTableSelectAll();
        }else if(dataReturned !== null && dataReturned.data == 'dataTableSelectNon') {
          this.dataTableSelectNon();
        }else if(dataReturned !== null && dataReturned.data == 'doRefresh') {
          this.doRefresh(null);
        } else if(dataReturned !== null && dataReturned.data == 'dataTableAddRechercheParColonne') {
          this.dataTableAddRechercheParColonne();
        } else if(dataReturned !== null && dataReturned.data == 'dataTableAddCustomFiltre') {
          this.dataTableAddCustomFiltre();
        } else if(dataReturned !== null && dataReturned.data == 'exportExcel') {
          this.exportExcel();
        } else if(dataReturned !== null && dataReturned.data == 'changeStyle') {
          this.changeStyle();
        } 
  
      });
      return await popover.present();
    }

    selectedItemInfo(){
      if(this.seletedIndexes.length == 1){
        this.infos(this.communesData[this.seletedIndexes[0]]);
        //this.seletedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      }
    }
  
    selectedItemModifier(){
      if(this.seletedIndexes.length == 1){
        this.modifier(this.communesData[this.seletedIndexes[0]]);
        //this.seletedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      }
    }
  
    async openRelationCommune(ev: any/*, codeCommune*/) {
      const popover = await this.popoverController.create({
        component: RelationsCommuneComponent,
        event: ev,
        translucent: true,
        componentProps: {"codeCommune": this.uneCommune.codeCommune},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'village') {
          this.presentVillage(this.uneCommune.codeCommune);
        }
  
      });
      return await popover.present();
    }

    
  async openRelationCommuneDepuisListe(ev: any/*, codePays*/) {
    const popover = await this.popoverController.create({
      component: RelationsCommuneComponent,
      event: ev,
      translucent: true,
      componentProps: {"codeCommune": this.communesData[this.seletedIndexes[0]].codeCommune},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'village') {
        this.presentVillage(this.communesData[this.seletedIndexes[0]].codeCommune);
      }

    });
    return await popover.present();
  }


    async presentVillage(codeCommune) {
      const modal = await this.modalController.create({
        component: VillagePage,
        componentProps: { codeCommune: codeCommune },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    existeCommune(codeDepartement){
      for(let com of this.communes){
        if('fuma:commune:'+codeDepartement == com._id){
          return 1;
        }
      }

      return 0;
    }
  
    onSubmit(){
      let communeData = this.communeForm.value;
      if(this.action === 'ajouter'){
        //Si le commune existe
        if(this.communes && this.existeCommune(communeData.codeDepartement)){
          communeData = this.servicePouchdb.garderCreationTrace(communeData);
          
          var communeConcernee;
          for(let c of this.communes){
            if('fuma:commune:'+communeData.codeDepartement == c._id){
              communeConcernee = c;
              break;
            }
          }
          
          communeConcernee.data.push(communeData);
          //********************* */
          //si changement code de communes, appliquer le changement aux localité
          /*if(this.uneCommune.codeCommune != communeData.codeCommune){
            //application des changements au localités
          }*/
          this.servicePouchdb.updateLocalite(communeConcernee).then((res) => {
            communeConcernee._rev = res.rev;
            for(let i = 0; i < this.communes.length; i++){
              if(this.communes[i]._id == communeConcernee._id){
                this.communes[i] = communeConcernee;
                break;
              }
            }
            this.communesData.push(communeData);
            //this.communes._rev = res.rev;
            this.action = 'liste';
            /*if(this.mobile){
              this.communeData = this.communes.data;
            }*/
            if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
              //this.htmlTableAction = 'recharger';
              //this.actualiserTableau(this.communesData);
              this.dataTableAddRow(communeData);
            }
            //this.htmlTableAction = 'recharger';

            //initialiser la liste des communes
            //this.creerVillage(communeData.codeCommune);

            //libérer la mémoire occupée par la liste des pays
            this.paysData = [];
            this.regionData = [];
            this.departementData = [];
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          });
        }else{
          //créer un nouveau commune
          communeData = this.servicePouchdb.garderCreationTrace(communeData);
          
          
          let commune: any = {
            _id: 'fuma:commune:'+communeData.codeDepartement,
            type: 'commune',
            data: [communeData]
          };
          //this.communes = commune;
          this.communesData.push(communeData);

          this.servicePouchdb.createLocalite(commune).then((res) => {
            commune._rev = res.rev;
            this.communes.push(commune);
            this.action = 'liste';
            if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
              this.htmlTableAction = 'recharger';
            }
            //this.htmlTableAction = 'recharger';
            this.actualiserTableau(this.communesData);

            //initialiser la liste des communes
            //this.creerVillage(communeData.codeCommune);
            
            //libérer la mémoire occupée par la liste des pays
            this.paysData = [];
            this.regionData = [];
            this.departementData = [];
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          });
        }
      }else{
        //si modification
        //var paysChanger: boolean = false
        var regionChanger: boolean = false
        
        //virifier s'il ya eu un changement de commune pour le commune
        if(this.uneCommune.codeDepartement != communeData.codeDepartement){
          regionChanger = true;
        }
        
        communeData = this.servicePouchdb.garderUpdateTrace(communeData);
        //mise à jour de la liste des communes
        this.communesData[this.communesData.indexOf(this.uneCommune)] = communeData;
        
        //récuper la commune concernée, celle qui a été modifiée
        //les commune sont classées par pays, donc il suffit de récupérer la commune corespondant au code de pays de la commune elle même
        var communeConcernee;
        var ancientCommuneConcernee;
        if(!regionChanger){
          for(let c of this.communes){
            if('fuma:commune:'+communeData.codeDepartement == c._id){
              communeConcernee = c;
              break;
            }
          }
          //mise à jour dans la commune
          communeConcernee.data[communeConcernee.data.indexOf(this.uneCommune)] = communeData;
        }else{
          //recuprer la nouvelle commune du pays et ajouter la commune
          for(let c of this.communes){
            if('fuma:commune:'+communeData.codeDepartement == c._id/*.substr(d._id.length - 2, 2)*/){
              communeConcernee = c;
              //ajouter la commune
              communeConcernee.data.push(communeData);
              break;
            }
          }

          //recuprer l'ancienne commune du pays et supprimer la commune
          for(let c of this.communes){
            if('fuma:commune:'+this.uneCommune.codeDepartement == c._id/*.substr(d._id.length - 2, 2)*/){
              ancientCommuneConcernee = c;
              //ajouter la commune
              ancientCommuneConcernee.data.splice(ancientCommuneConcernee.data.indexOf(this.uneCommune), 1);
              break;
            }
          }
          
        }
      
        //this.uneCommune = communeData;
        this.servicePouchdb.updateLocalite(communeConcernee).then((res) => {
          //this.communes._rev = res.rev;
          communeConcernee._rev = res.rev;
          //mise à jour de la liste des communes
          for(let i = 0; i < this.communes.length; i++){
            if(this.communes[i]._id == communeConcernee._id){
              this.communes[i] = communeConcernee;
              break;
            }
          }

          //en cas de changement du code de la commune ou du nom de la commune, appliquer les changement dans la subdivision
          if(this.uneCommune.codeCommune != communeConcernee.codeCommune || this.uneCommune.nomCommune != communeData.nomCommune){
            this.changerInfoCommuneDansVillage(this.uneCommune.codeCommune, communeData);
          }
          this.action = 'infos';
          this.infos(communeData);
          
          /*if(this.mobile){
            this.communeData = this.communes.data;
          }*/
          if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
            //this.htmlTableAction = 'recharger';
            this.dataTableUpdateRow(communeData);
          }
          //this.actualiserTableau(this.communes.data);
          //libérer la mémoire occupée par la liste des pays
          this.paysData = [];
          this.regionData = [];
          this.departementData = [];

          //si changement de pays, mettre ajouter l'ancienne commune du pays
          if(regionChanger){
            this.servicePouchdb.updateLocalite(ancientCommuneConcernee).then((res) => {
              //this.communes._rev = res.rev;
              ancientCommuneConcernee._rev = res.rev;
              //mise à jour de la liste des communes
              for(let i = 0; i < this.communes.length; i++){
                if(this.communes[i]._id == ancientCommuneConcernee._id){
                  this.communes[i] = ancientCommuneConcernee;
                  break;
                }
              }
            });
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }
    }


    
    changerInfoCommuneDansVillage(ancienCodeCommune, infoCommune){
      this.servicePouchdb.getLocalDocById('fuma:village:'+ancienCodeCommune).then((village) => {
        if(village){
          var oldVillage = {...village}
          village.data.forEach((v, index) => {
            if(ancienCodeCommune != infoCommune.codeCommune){
              v.codeCommune = infoCommune.codeCommune;
              v.codeVillage = infoCommune.codeCommune + v.numeroVillage;
            }
            v.nomCommune = infoCommune.nomCommune;
            v = this.servicePouchdb.garderCreationTrace(v);
          });
  

          //encas de changement de code
          if(ancienCodeCommune != infoCommune.codeCommune){
            //créer un nouveau document
            delete village['_rev'];
            village._id = 'fuma:village:'+infoCommune.codeCommune;
            this.servicePouchdb.createLocalite(village);
            this.servicePouchdb.deleteLocaliteDefinitivement(oldVillage);
          }else{
            //changement de nom
            this.servicePouchdb.updateLocalite(village);
          }
        }
      }).catch((err) => {
        console.log(err);
      });
    }

      

    creerVillage(codeCommune){
      //initialise les communes du pays
      let region: any = {
        _id: 'fuma:village:'+codeCommune,
        type: 'village',
        data: []
      };
      this.servicePouchdb.createLocalite(region);
    }
  
  
    actualiserTableau(data){
      if(this.codePays && this.codePays != ''){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#commune-pays').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.communeHTMLTable = JSONToTHMLTable(data, "commune-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.communeHTMLTable = JSONToTHMLTable(data, "commune-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees)
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.communeHTMLTable = reCreateTHMLTable(this.communeHTMLTable.table, "commune-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.communeHTMLTable = reCreateTHMLTable(this.communeHTMLTable.table, "commune-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.communeHTMLTable.datatable);
          });
        }
      }else{
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#commune').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.communeHTMLTable = JSONToTHMLTable(data, "commune", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.communeHTMLTable = JSONToTHMLTable(data, "commune", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees)
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.communeHTMLTable = reCreateTHMLTable(this.communeHTMLTable.table, "commune", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.communeHTMLTable = reCreateTHMLTable(this.communeHTMLTable.table, "commune", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.communeHTMLTable.datatable);
          });
        }
      }
      
    }
  
    doRefresh(event) {
      //this.servicePouchdb.getLocalDocById('fuma:commune').then((commune)
      if(this.codeDepartement && this.codeDepartement != ''){       
        this.servicePouchdb.getLocalDocById('fuma:commune:'+this.codeDepartement).then((commune) => {
          if(commune){
            this.communes = [];
            this.communesData = [];
            this.communes.push({...commune});
            this.communesData = [...commune.data];

            //si non mobile ou mobile + mode tableau et 
            if(this.communesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#commune-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.communes = [];
            if(this.mobile){
              this.communesData = [];
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
            }
        }).catch((err) => {
          console.log('Erreur acces à la commune ==> '+err)
          this.communes = [];
          if(this.mobile){
            this.communesData = [];
          }
          this.seletedIndexes = [];
          if(event)
            event.target.complete();
        });
    
      }else if(this.codeRegion  && this.codeRegion != ''){
        this.servicePouchdb.getLocalitePlageDocs('fuma:commune:'+this.codeRegion, 'fuma:commune:'+this.codeRegion+'\uffff').then((communes) => {
          if(communes){
            this.communes = [...communes];
            var datas = [];
            for(let d of communes){
              datas = datas.concat(d.data);
            }
            this.communesData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.communesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#commune-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.communes = [];
            if(this.mobile){
              this.communesData = [];
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la commune ==> '+err)
          this.communes = [];
          if(this.mobile){
            this.communesData = [];
          }
          this.seletedIndexes = [];
          if(event)
            event.target.complete();
        });

      }else if(this.codePays  && this.codePays != ''){
        this.servicePouchdb.getLocalitePlageDocs('fuma:commune:'+this.codePays, 'fuma:commune:'+this.codePays+'\uffff').then((communes) => {
          if(communes){
            this.communes = [...communes];
            var datas = [];
            for(let d of communes){
              datas = datas.concat(d.data);
            }
            this.communesData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.communesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#commune-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.communes = [];
            if(this.mobile){
              this.communesData = [];
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la commune ==> '+err)
          this.communes = [];
          if(this.mobile){
            this.communesData = [];
          }
          this.seletedIndexes = [];
          if(event)
            event.target.complete();
        });

      }else{
        this.servicePouchdb.getLocalitePlageDocs('fuma:commune:', 'fuma:commune:\uffff').then((communes) => {
          if(communes){
            this.communes = [...communes];
            var datas = [];
            for(let d of communes){
              datas = datas.concat(d.data);
            }
            this.communesData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.communesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#commune').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.communes = [];
            if(this.mobile){
              this.communesData = [];
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la commune ==> '+err)
          this.communes = [];
          if(this.mobile){
            this.communesData = [];
          }
          this.seletedIndexes = [];
          if(event)
            event.target.complete();
        });
    
      }

      this.filterAjouter = false;
      this.filterInitialiser = false;
      this.recherchePlus = false;
      /*setTimeout(() => {
        event.target.complete();
      }, 2000);*/
    }
  
    getCommune(){
      if(this.codeDepartement && this.codeDepartement != ''){ 
        //si charger la liste des départements d'une commune
        this.servicePouchdb.getLocalDocById('fuma:commune:'+this.codeDepartement).then((commune) => {
          if(commune){
            if(this.codeCommune && this.codeCommune != ''){
              for(let c of commune.data){
                if(c.codeCommune == this.codeCommune){
                  this.uneCommune = c;
                  this.infos(c);
                  break;
                }
              }
            }else{
              this.communes = [];
              this.communesData = [];
              this.communes.push({...commune});//clone de l'objet commune
              this.communesData = [...commune.data]; //clone du tableau
  
              //si non mobile ou mobile + mode tableau et 
              if(this.communesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
                $('#commune-pays').ready(()=>{
                  if(global.langue == 'en'){
                    this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                  }else{
                    this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.communeHTMLTable.datatable);
                });
              }
            }
            
          }
        }).catch((err) => {
          this.communes = [];
          this.communesData = [];
          console.log(err)
        });
      }else if(this.codeRegion && this.codeRegion != ''){
        //si charger la liste des départements d'une région
        this.servicePouchdb.getLocalitePlageDocs('fuma:commune:'+this.codeRegion, 'fuma:commune:'+this.codeRegion+'\uffff').then((communes) => {
          if(communes){
            this.communes = [...communes];
            var datas = [];
            for(let d of communes){
              datas = datas.concat(d.data);
            }
            this.communesData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.communesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#commune-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.communes = [];
          this.communesData = [];
          console.log(err)
        });

      }else if(this.codePays && this.codePays != ''){
        //si charger la liste des départements d'un pays
        this.servicePouchdb.getLocalitePlageDocs('fuma:commune:'+this.codePays, 'fuma:commune:'+this.codePays+'\uffff').then((communes) => {
          if(communes){
            this.communes = [...communes];
            var datas = [];
            for(let d of communes){
              datas = datas.concat(d.data);
            }
            this.communesData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.communesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#commune-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.communes = [];
          this.communesData = [];
          console.log(err)
        });

      }else{ 
        //tous les departments
        this.servicePouchdb.getLocalitePlageDocs('fuma:commune:', 'fuma:commune:\uffff').then((communes) => {
          if(communes){
            this.communes = [...communes];
            var datas = [];
            for(let d of communes){
              datas = datas.concat(d.data);
            }
            this.communesData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.communesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#commune').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = JSONToTHMLTable(this.communesData, "commune", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.communes = [];
          this.communesData = [];
          console.log(err)
        });
      }
    }
  
    
  
    getPays(){
      this.paysData = [];
      this.servicePouchdb.getLocalDocById('fuma:pays').then((pays) => {
        if(pays){
          //si le code de pays est transmis, ne selection que le pays en question
          if(this.codePays && this.codePays != ''){
            for(let p of pays.data){
              if(p.codePays == this.codePays){
                this.paysData.push(p);
                this.setCodeEtNomPays(p);
                this.getRegionParPays(this.codePays);
                break;
              }
            }
          }else{
            this.paysData = pays.data;
          }
          
        }
      }).catch((e) => {
        console.log('pays erreur: '+e);
        //this.paysData = [];
      });
    }

    getRegionParPays(codePays){
      this.regionData = [];
      this.servicePouchdb.getLocalDocById('fuma:region:'+codePays).then((region) => {
        if(region){
          if(this.codeRegion && this.codeRegion != ''){
            for(let d of region.data){
              if(d.codeRegion == this.codeRegion){
                this.regionData.push(d);
                this.setCodeEtNomRegion(d);
                this.getDepartementParRegion(d.codeRegion);
                break;
              }
            }
          }else{
            this.regionData = region.data;
          }
        }       
      }).catch((e) => {
        console.log('pays erreur: '+e);
        //this.regionData = [];
      });
    }

    getDepartementParRegion(codeRegion){
      this.departementData = [];
      this.servicePouchdb.getLocalDocById('fuma:departement:'+codeRegion).then((departement) => {
        if(departement){
          if(this.codeDepartement && this.codeDepartement != ''){
            for(let d of departement.data){
              if(d.codeDepartement == this.codeDepartement){
                this.departementData.push(d);
                this.setCodeEtNomDepartement(d);
                break;
              }
            }
          }else{
            this.departementData = departement.data;
          }
        }       
      }).catch((e) => {
        console.log('pays erreur: '+e);
        //this.departementData = [];
      });
    }

    setNomPays(codePays){
      if(codePays && codePays != ''){
        for(let p of this.paysData){
          if(codePays == p.codePays){
            this.communeForm.controls.nomPays.setValue(p.nomPays);
            this.communeForm.controls.codeRegion.setValue('');
            this.communeForm.controls.nomRegion.setValue('');

            this.getRegionParPays(codePays)
            break;
          }
        }
      }
    }

    setNomRegion(codeRegion){
      if(codeRegion && codeRegion != ''){
        for(let r of this.regionData){
          if(codeRegion == r.codeRegion){
            this.communeForm.controls.nomRegion.setValue(r.nomRegion);
            this.communeForm.controls.codeDepartement.setValue('');
            this.communeForm.controls.nomDepartement.setValue('');

            this.getDepartementParRegion(codeRegion)
            break;
          }
        }
      }
    }

    setNomDepartement(codeDepartement){
      if(codeDepartement && codeDepartement != ''){
        for(let d of this.departementData){
          if(codeDepartement == d.codeDepartement){
            this.communeForm.controls.nomDepartement.setValue(d.nomDepartement);
            this.communeForm.controls.numeroCommune.setValue('');
            this.communeForm.controls.codeCommune.setValue('');
            break;
          }
        }
      }
    }
  
    setCodeEtNomPays(paysData){
      this.communeForm.controls.codePays.setValue(paysData.codePays);
      this.communeForm.controls.nomPays.setValue(paysData.nomPays);
    }

    setCodeEtNomRegion(regionData){
      this.communeForm.controls.codeRegion.setValue(regionData.codeRegion);
      this.communeForm.controls.nomRegion.setValue(regionData.nomRegion);
    }

    setCodeEtNomDepartement(departementData){
      this.communeForm.controls.codeDepartement.setValue(departementData.codeDepartement);
      this.communeForm.controls.nomDepartement.setValue(departementData.nomDepartement);
    }

    setCodeCommune(numeroCommune){
      if(numeroCommune && numeroCommune != ''){
        this.communeForm.controls.codeCommune.setValue(this.communeForm.controls.codeDepartement.value + numeroCommune);
      }
    }

    attacheEventToDataTable(datatable){
      var self = this;
      datatable.on( 'select', function ( e, dt, type, indexes ) {
        for(const i of indexes){
          self.seletedIndexes.push(i)
        }

        var info = datatable.page.info();
        if(info.recordsDisplay == self.seletedIndexes.length){
          self.allSelected = true;
        }else{
          self.allSelected = false;
        }
        
      } )
      .on( 'deselect', function ( e, dt, type, indexes ) {
        for(const i of indexes){
          self.seletedIndexes.splice(self.seletedIndexes.indexOf(i), 1)
        }

        var info = datatable.page.info();
        if(info.recordsDisplay == self.seletedIndexes.length){
          self.allSelected = true;
        }else{
          self.allSelected = false;
        }
        
      } ).on( 'search.dt', function () {
        var info = datatable.page.info();
        if(info.recordsDisplay == self.seletedIndexes.length){
          self.allSelected = true;
        }else{
          self.allSelected = false;
        }
      });
      
      //traduitre les collonnes de la table la table
      this.translateDataTableCollumn();
    }
  
    translateDataTableCollumn(){
      var id = '';
      if(this.codePays && this.codePays != ''){
        id = 'commune-pays-datatable';
      }else{ 
        id = 'commune-datatable';
      }


      $('#'+id+' thead tr:eq(0) th:eq(0)').html(this.translate.instant('PAYS_PAGE.CODEPAYS'));
      $('#'+id+' thead tr:eq(0) th:eq(1)').html(this.translate.instant('PAYS_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(2)').html(this.translate.instant('REGION_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(3)').html(this.translate.instant('REGION_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(4)').html(this.translate.instant('DEPARTEMENT_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(5)').html(this.translate.instant('DEPARTEMENT_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(6)').html(this.translate.instant('COMMUNE_PAGE.CODE'));    
      $('#'+id+' thead tr:eq(0) th:eq(7)').html(this.translate.instant('COMMUNE_PAGE.NUMERO'));
      $('#'+id+' thead tr:eq(0) th:eq(8)').html(this.translate.instant('COMMUNE_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(9)').html(this.translate.instant('GENERAL.LATITUDE'));
      $('#'+id+' thead tr:eq(0) th:eq(10)').html(this.translate.instant('GENERAL.LONGITUDE'));
      
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }

  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //code commune
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.CODECOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeCommune[0].message = res;
      });

      //numéro commune
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numeroCommune[0].message = res;
      });
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.MINLENGTH').subscribe((res: string) => {
        this.messages_validation.numeroCommune[1].message = res;
      });
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.MAXLENGTH').subscribe((res: string) => {
        this.messages_validation.numeroCommune[2].message = res;
      });
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.PATTERN').subscribe((res: string) => {
        this.messages_validation.numeroCommune[3].message = res;
      });
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.VALIDNUMEROCOMMUNE').subscribe((res: string) => {
        this.messages_validation.numeroCommune[4].message = res;
      });

      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.UNIQUENUMEROCOMMUNE').subscribe((res: string) => {
        this.messages_validation.numeroCommune[5].message = res;
      });
  
      //nom commune
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NOMCOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomCommune[0].message = res;
      });

      //code pays
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codePays[0].message = res;
      });

      //nom pays
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NOMPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomPays[0].message = res;
      });

       //pays loading
       this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.PAYSLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.paysLoading[0].message = res;
      });

      //code région
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeRegion[0].message = res;
      });

      //nom région
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NOMREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomRegion[0].message = res;
      });

       //région loading
       this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.REGIONLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.regionLoading[0].message = res;
      });

      //code département
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeDepartement[0].message = res;
      });

      //nom département
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NOMDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomDepartement[0].message = res;
      });

       //département loading
       this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.DEPARTEMENTLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.departementLoading[0].message = res;
      });
    }

    dataTableAddRow(rowData){
      let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });
  
      this.communeHTMLTable.datatable.row.add(data).draw();
    }
  
    dataTableUpdateRow(/*index, */rowData){
      let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });
  
      this.communeHTMLTable.datatable.row('.selected').data(data).draw();
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      this.communeHTMLTable.datatable.rows('.selected').remove().draw();
    }
  
    
  dataTableSelectAll(){
    this.seletedIndexes = [];
    this.communeHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.communeHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.seletedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.communeHTMLTable.datatable.rows().deselect();
    this.seletedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'commune-pays-datatable';
    }else{ 
      id = 'commune-datatable';
    }

    $('#'+id+' thead tr:eq(1)').show();
    this.recherchePlus = true;
  }

  dataTableRemoveRechercheParColonne(){
    var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'commune-pays-datatable';
    }else{ 
      id = 'commune-datatable';
    }

    $('#'+id+' thead tr:eq(1)').hide();
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'commune-pays-datatable';
    }else{ 
      id = 'commune-datatable';
    }

    if(!this.filterAjouter && !this.filterInitialiser){
      var i = -1;
      var self = this;
      $('#'+id+' tfoot').show();
      this.communeHTMLTable.datatable.columns().every( function () {
          i = i +1;
          var column = this;
          var select = $('<select multiple="multiple" id="'+id+i+'" placeholder="'+self.translate.instant('GENERAL.FILTRER')+'" class="form-control form-control-sm"></select>')
              .appendTo( $(column.footer()).empty() )
              .on( 'change', function () {
                  /*var val = $.fn.dataTable.util.escapeRegex(
                      $(this).val()
                  );*/
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
                  
                  var info = self.communeHTMLTable.datatable.page.info();
                  if(info.recordsDisplay == self.seletedIndexes.length){
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

          $('#'+id+i).multipleSelect({
                filter: true,
                //width: 150,
                position: 'top',
                formatSelectAll: function () {
                  
                  return '['+self.translate.instant('GENERAL.SELECTIONNER_TOUS')+']'
                },
          
                formatAllSelected: function () {
                  return self.translate.instant('GENERAL.TOUS_SELECTIONNES')
                },
          
                formatCountSelected: function (count, total) {
                  return count + ' '+self.translate.instant('GENERAL.SUR').toLocaleLowerCase()+' ' + total + ' '+self.translate.instant('GENERAL.SELECTIONNES').toLocaleLowerCase()+''
                },
          
                formatNoMatchesFound: function () {
                  return self.translate.instant('GENERAL.AUCTUN_RESULTAT')
                }
                
              });

              $('.ms-parent').removeAttr("style");
      } );

      this.communeHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
        if(!$('#'+id+colIdx).attr('style') && visibility){
            $('#'+id+colIdx).multipleSelect({
                filter: true,
                //width: 150,
                position: 'top',
                formatSelectAll: function () {
                  
                  return '['+self.translate.instant('GENERAL.SELECTIONNER_TOUS')+']'
                },
          
                formatAllSelected: function () {
                  return self.translate.instant('GENERAL.TOUS_SELECTIONNES')
                },
          
                formatCountSelected: function (count, total) {
                  return count + ' '+self.translate.instant('GENERAL.SUR').toLocaleLowerCase()+' ' + total + ' '+self.translate.instant('GENERAL.SELECTIONNES').toLocaleLowerCase()+''
                },
          
                formatNoMatchesFound: function () {
                  return self.translate.instant('GENERAL.AUCTUN_RESULTAT')
                }
              });

              $('.ms-parent').removeAttr("style");
          }
      });

      this.filterAjouter = true;
      this.filterInitialiser = true;

    } else if(!this.filterAjouter && this.filterInitialiser){
      $('#'+id+' tfoot').show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }

  dataTableRemoveCustomFiltre(){
    var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'commune-pays-datatable';
    }else{ 
      id = 'commune-datatable';
    }

    $('#'+id+' tfoot').hide();
    this.filterAjouter = false;
  }

  
    async close(){
      await this.modalController.dismiss();
    }
  

    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        this.communesData = this.communes.data.filter((item) => {
          return item.codeCommune.toLowerCase().indexOf(val) !== -1 || item.nomCommune.toLowerCase().indexOf(val) !== -1 || item.referenceOpenStreetMap.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.communeData = temp;
      
    }
  
    


    
    ionViewDidEnter(){ 
       
    }
    
}
