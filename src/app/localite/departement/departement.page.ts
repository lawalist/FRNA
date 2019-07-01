import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NumeroDepartementValidator } from '../../validators/departement.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsDepartementComponent } from '../../component/relations-departement/relations-departement.component';
import { global } from '../../../app/globale/variable';
import { PaysPage } from '../pays/pays.page';
import { RegionPage } from '../region/region.page';
import { CommunePage } from '../commune/commune.page';
import { VillagePage } from '../village/village.page';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { ListOptionsComponent } from 'src/app/component/list-options/list-options.component';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToTHMLTable: any;
declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-departement',
  templateUrl: './departement.page.html',
  styleUrls: ['./departement.page.scss'],
})
export class DepartementPage implements OnInit {
 
  @Input() codePays: string;
  @Input() codeRegion: string;
  @Input() codeDepartement: string;
  departementForm: FormGroup;
  action: string = 'liste';
  departements: any;
  departementsData: any = [];
  paysData: any = [];
  regionData: any = [];
  unDepartement: any;
  departementHTMLTable: any;
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
    'codeDepartement': [
        { type: 'required', message: '' },
      ],
    'numeroDepartement': [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' },
      { type: 'maxlength', message: '' },
      { type: 'pattern', message: '' },
      { type: 'validNumeroDepartement', message: '' },
      { type: 'uniqueNumeroDepartement', message: '' }
    ],
    'nomDepartement': [
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
    ]
  }

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      if(this.codeDepartement && this.codeDepartement != ''){
        this.codeRegion = this.codeDepartement.substr(0, 5);
      }
      //au cas où la région est en mode modal, on chercher info region
      if(this.codeRegion && this.codeRegion != ''){
        this.codePays = this.codeRegion.substr(0, 2);
      }
      this.translateLangue();
      this.getDepartement();
    }
  
    /*changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.actualiserTableau(this.departementsData);
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
        this.actualiserTableau(this.departementsData);
      }else {
        this.styleAffichage = 'liste';
        this.seletedIndexes = [];
        this.estModeCocherElemListe = false;
      }
    }
  
    cocherElemListe(codeDepartement){
      if(this.seletedIndexes.indexOf(codeDepartement) === -1){
        //si coché
        this.seletedIndexes.push(codeDepartement);
      }else{
        //si décocher
        this.seletedIndexes.splice(this.seletedIndexes.indexOf(codeDepartement), 1);
      }  
      
    }
  
    
    removeMultipleElem(data, indexes){
      let codes = [];
      if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
        indexes.forEach((i) => {
          codes.push(data[i].codeDepartement);
        });
      }else{
        codes = indexes;
      }
      
  
      for(let i = 0; i < data.length; i++){
        if(codes.length == 0){
          break;
        }
        if(codes.indexOf(data[i].codeDepartement) !== -1){
          codes.splice(codes.indexOf(data[i].codeDepartement), 1);
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
      this.departementsData.forEach((d) => {
        //console.log(p.codePays+'   '+this.seletedIndexes.indexOf(p.codePays)+'    '+this.seletedIndexes)
        if(this.seletedIndexes.indexOf(d.codeDepartement) === -1){
          this.seletedIndexes.push(d.codeDepartement);
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
          "dataLength": this.departementsData.length,
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
              for(let i = 0; i < this.departementsData.length; i++){
                if(codes.length == 0){
                  break;
                }

                //console.log(this.regionsData[i].codeRegion)
                if(codes.indexOf(this.departementsData[i].codeDepartement) !== -1){
                  //console.log('yes '+i)
                  codes.splice(codes.indexOf(this.departementsData[i].codeDepartement), 1);
                  codesIndex.push(i);
                  i--;
                }
              }
              //console.log(codesIndex)

              var departementsConcernee: any = {};
              codesIndex.forEach((si) => {
                var d = this.departementsData[si];
                var exist = 0;

                if(departementsConcernee['fuma:departement:'+d.codeRegion]){
                  departementsConcernee['fuma:departement:'+d.codeRegion].data.splice(departementsConcernee['fuma:departement:'+d.codeRegion].data.indexOf(d), 1);
                  exist = 1;
                }

                if(!exist){
                  for(let reg of this.departements){
                    if('fuma:departement:'+d.codeRegion == reg._id){
                      reg.data.splice(reg.data.indexOf(d), 1);
                      departementsConcernee[reg._id] = reg
                      break;
                    }
                  }
                }
              });

              //mise à jour de departementsData
              /*this.seletedIndexes.forEach((si) => {
                this.departementsData.splice(this.departementsData.indexOf(this.departementsData[si]), 1);
              });*/

              //update
              Object.keys(departementsConcernee).forEach((key, index) => {
                this.servicePouchdb.updateLocalite(departementsConcernee[key]).then((res) => {
                  departementsConcernee[key]._rev = res.rev;
                  for(let i = 0; i < this.departements.length; i++){
                    if(this.departements[i]._id == departementsConcernee[key]._id){
                      this.departements[i] = departementsConcernee[key];
                      break;
                    }
                  }
                  if(index +1 == Object.keys(departementsConcernee).length){
                    this.departementsData = [...this.removeMultipleElem(this.departementsData, this.seletedIndexes)];
                    this.decocherTousElemListe();
                    //this.htmlTableAction = 'recharger';
                    //this.actualiserTableau(this.departementsData);
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
      //this.departementForm = null;
      this.departementForm = this.formBuilder.group({
        codePays: ['', Validators.required],
        nomPays: ['', Validators.required],
        codeRegion: ['', Validators.required],
        nomRegion: ['', Validators.required],
        codeDepartement: ['', {disabled: true}, Validators.required],
        numeroDepartement: [''/*, Validators.compose([NumeroDepartementValidator.uniqueNumeroDepartement(this.departementsData, 'ajouter'), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required])*/],
        nomDepartement: ['', Validators.required],
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

      this.departementForm.valueChanges.subscribe(change => {
        this.departementForm.get('numeroDepartement').setValidators([NumeroDepartementValidator.uniqueNumeroDepartement(this.departementsData, this.departementForm.value.codeRegion, 'ajouter'), NumeroDepartementValidator.validNumeroDepartement(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });
    }
  
    editForm(d){
      //this.departementForm = null;
      this.departementForm = this.formBuilder.group({
        codePays: [d.codePays, Validators.required],
        nomPays: [d.nomPays, Validators.required],
        codeRegion: [d.codeRegion, Validators.required],
        nomRegion: [d.nomRegion, Validators.required],
        codeDepartement: [d.codeDepartement, Validators.required],
        numeroDepartement: [d.numeroDepartement],
        nomDepartement: [d.nomDepartement, Validators.required],
        latitude: [d.latitude],
        longitude: [d.latitude],
        created_at: [d.created_at],
        created_by: [d.created_by],
        updatet_at: [d.updatet_at],
        updated_by: [d.updated_by],
        deleted: [d.deleted],
        deleted_at: [d.deleted_at],
        deleted_by: [d.deleted_by]
      });

      this.departementForm.valueChanges.subscribe(change => {
        this.departementForm.get('numeroDepartement').setValidators([NumeroDepartementValidator.uniqueNumeroDepartement(this.departementsData, this.departementForm.value.codeRegion, 'ajouter'), NumeroDepartementValidator.validNumeroDepartement(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });
    }
  
    ajouter(){
      this.getPays();
      this.initForm();
      this.action = 'ajouter';
    }
  
    infos(d){
      if(!this.estModeCocherElemListe){
        this.unDepartement = d;
        this.action = 'infos';
      }
    }

  
    modifier(d){
      this.getPays();
      this.getRegionParPays(d.codePays);
      this.editForm(d);
      this.unDepartement = d;
      this.action ='modifier';
    }

    getPosition(){
      this.afficheMessage(this.translate.instant('GENERAL.OBTENTION_COORDONNEES'));
      this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
        this.departementForm.controls.latitude.setValue(resp.coords.latitude);
        this.departementForm.controls.longitude.setValue(resp.coords.longitude);
        this.afficheMessage(this.translate.instant('GENERAL.COORDONNEES_OBTENUES'));
      }, err => {
        this.afficheMessage(this.translate.instant('GENERAL.ERREUR_COORDONNEES'));
          console.log(err)
      });
    }
  
    exportExcel(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('departement-datatable').innerHTML], {
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
      let blob = new Blob([document.getElementById('departement-datatable').innerHTML], {
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
  
  
    async supprimer(d) {
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
              this.departementsData.splice(this.departementsData.indexOf(d), 1);
              //chercher la departement concernée
              var departementConcernee;
              for(let reg of this.departements){
                if('fuma:departement:'+d.codeRegion == reg._id/*.substr(reg._id.length - 2, 2)*/){
                  departementConcernee = reg;
                  break;
                }
              }

              //mise à jour dans la région
              departementConcernee.data.splice(departementConcernee.data.indexOf(d), 1)
      
              this.servicePouchdb.updateLocalite(departementConcernee).then((res) => {
                departementConcernee._rev = res.rev;
                //mise à jour de la liste des régions
                for(let i = 0; i < this.departements.length; i++){
                  if(this.departements[i]._id == departementConcernee._id){
                    this.departements[i] = departementConcernee;
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
                //this.actualiserTableau(this.departementsData);
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
              var departementsConcernee: any = {};
              this.seletedIndexes.forEach((si) => {
                var d = this.departementsData[si];
                var exist = 0;

                if(departementsConcernee['fuma:departement:'+d.codeRegion]){
                  departementsConcernee['fuma:departement:'+d.codeRegion].data.splice(departementsConcernee['fuma:departement:'+d.codeRegion].data.indexOf(d), 1);
                  exist = 1;
                }

                if(!exist){
                  for(let reg of this.departements){
                    if('fuma:departement:'+d.codeRegion == reg._id){
                      reg.data.splice(reg.data.indexOf(d), 1);
                      departementsConcernee[reg._id] = reg
                      break;
                    }
                  }
                }
              });

              //mise à jour de departementsData
              this.seletedIndexes.forEach((si) => {
                this.departementsData.splice(this.departementsData.indexOf(this.departementsData[si]), 1);
              });

              //update
              Object.keys(departementsConcernee).forEach((key, index) => {
                this.servicePouchdb.updateLocalite(departementsConcernee[key]).then((res) => {
                  departementsConcernee[key]._rev = res.rev;
                  for(let i = 0; i < this.departements.length; i++){
                    if(this.departements[i]._id == departementsConcernee[key]._id){
                      this.departements[i] = departementsConcernee[key];
                      break;
                    }
                  }
                  if(index +1 == Object.keys(departementsConcernee).length){
                    this.action = 'liste';
                    this.dataTableRemoveRows();
                    this.seletedIndexes = [];
                    //this.htmlTableAction = 'recharger';
                    //this.actualiserTableau(this.departementsData);
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
        //this.actualiserTableau(this.departementsData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        this.action = "infos";
      }else{
        this.action = 'liste';
        //this.actualiserTableau(this.departementsData);
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
              this.infos(this.departementsData[this.seletedIndexes[0]]);
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
              this.modifier(this.departementsData[this.seletedIndexes[0]]);
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
            this.infos(this.departementsData[this.seletedIndexes[0]]);
            this.seletedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.seletedIndexes.length == 1){
            this.modifier(this.departementsData[this.seletedIndexes[0]]);
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
        this.infos(this.departementsData[this.seletedIndexes[0]]);
        //this.seletedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      }
    }
  
    selectedItemModifier(){
      if(this.seletedIndexes.length == 1){
        this.modifier(this.departementsData[this.seletedIndexes[0]]);
        //this.seletedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      }
    }
  
    async openRelationDepartement(ev: any/*, codeDepartement*/) {
      const popover = await this.popoverController.create({
        component: RelationsDepartementComponent,
        event: ev,
        translucent: true,
        componentProps: {"codeDepartement": this.unDepartement.codeDepartement},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.unDepartement.codeDepartement);
        } else if(dataReturned !== null && dataReturned.data == 'village') {
          this.presentVillage(this.unDepartement.codeDepartement) 
        }
  
      });
      return await popover.present();
    }

     
  async openRelationDepartementDepuisListe(ev: any/*, codePays*/) {
    const popover = await this.popoverController.create({
      component: RelationsDepartementComponent,
      event: ev,
      translucent: true,
      componentProps: {"codeDepartement": this.departementsData[this.seletedIndexes[0]].codeDepartement},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'commune') {
        this.presentCommune(this.departementsData[this.seletedIndexes[0]].codeDepartement);
      } else if(dataReturned !== null && dataReturned.data == 'village') {
        this.presentVillage(this.departementsData[this.seletedIndexes[0]].codeDepartement) 
      }

    });
    return await popover.present();
  }

    async presentCommune(codeDepartement) {
      const modal = await this.modalController.create({
        component: CommunePage,
        componentProps: { codeDepartement: codeDepartement },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentVillage(codeDepartement) {
      const modal = await this.modalController.create({
        component: VillagePage,
        componentProps: { codeDepartement: codeDepartement },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    existeDepartement(codeRegion){
      for(let reg of this.departements){
        if('fuma:departement:'+codeRegion == reg._id){
          return 1;
        }
      }

      return 0;
    }
  
    onSubmit(){
      let departementData = this.departementForm.value;
      if(this.action === 'ajouter'){
        //Si le departement existe
        if(this.departements && this.existeDepartement(departementData.codeRegion)){
          departementData = this.servicePouchdb.garderCreationTrace(departementData);
          
          var departementConcernee;
          for(let d of this.departements){
            if('fuma:departement:'+departementData.codeRegion == d._id){
              departementConcernee = d;
              break;
            }
          }
          
          departementConcernee.data.push(departementData);
          //********************* */
          //si changement code de departements, appliquer le changement aux localité
          /*if(this.unDepartement.codeDepartement != departementData.codeDepartement){
            //application des changements au localités
          }*/
          this.servicePouchdb.updateLocalite(departementConcernee).then((res) => {
            departementConcernee._rev = res.rev;
            for(let i = 0; i < this.departements.length; i++){
              if(this.departements[i]._id == departementConcernee._id){
                this.departements[i] = departementConcernee;
                break;
              }
            }
            this.departementsData.push(departementData);
            //this.departements._rev = res.rev;
            this.action = 'liste';
            /*if(this.mobile){
              this.departementData = this.departements.data;
            }*/
            if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
              //this.htmlTableAction = 'recharger';
              //this.actualiserTableau(this.departementsData);
              this.dataTableAddRow(departementData);
            }
            //this.htmlTableAction = 'recharger';

            //initialiser la liste des communes
            //this.creerCommune(departementData.codeDepartement);

            //libérer la mémoire occupée par la liste des pays
            this.paysData = [];
            this.regionData = [];
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          });
        }else{
          //créer un nouveau département
          departementData = this.servicePouchdb.garderCreationTrace(departementData);
          
          
          let departement: any = {
            _id: 'fuma:departement:'+departementData.codeRegion,
            type: 'departement',
            data: [departementData]
          };
          //this.departements = departement;
          this.departementsData.push(departementData);

          this.servicePouchdb.createLocalite(departement).then((res) => {
            departement._rev = res.rev;
            this.departements.push(departement);
            this.action = 'liste';
            if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
              this.htmlTableAction = 'recharger';
              this.actualiserTableau(this.departementsData);
            }
            //this.htmlTableAction = 'recharger';
            

            //initialiser la liste des communes
            //this.creerCommune(departementData.codeDepartement);

            //libérer la mémoire occupée par la liste des pays
            this.paysData = [];
            this.regionData = [];
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          });
        }
      }else{
        //si modification
        //var paysChanger: boolean = false
        var regionChanger: boolean = false
        
        //virifier s'il ya eu un changement de pays pour le département
        /*if(this.unDepartement.codePays != departementData.codePays){
          paysChanger = true;
        }*/

        //virifier s'il ya eu un changement de région pour le département
        if(this.unDepartement.codeRegion != departementData.codeRegion){
          regionChanger = true;
        }
        
        departementData = this.servicePouchdb.garderUpdateTrace(departementData);
        //mise à jour de la liste des régions
        this.departementsData[this.departementsData.indexOf(this.unDepartement)] = departementData;
        
        //récuper la région concernée, celle qui a été modifiée
        //les région sont classées par pays, donc il suffit de récupérer la région corespondant au code de pays de la région elle même
        var departementConcernee;
        var ancientDepartementConcernee;
        if(!regionChanger){
          for(let d of this.departements){
            if('fuma:departement:'+departementData.codeRegion == d._id){
              departementConcernee = d;
              break;
            }
          }
          //mise à jour dans la région
          departementConcernee.data[departementConcernee.data.indexOf(this.unDepartement)] = departementData;
        }else{
          //recuprer la nouvelle departement du pays et ajouter la région
          for(let d of this.departements){
            if('fuma:departement:'+departementData.codeRegion == d._id/*.substr(d._id.length - 2, 2)*/){
              departementConcernee = d;
              //ajouter la région
              departementConcernee.data.push(departementData);
              break;
            }
          }

          //recuprer l'ancienne departement du pays et supprimer la région
          for(let d of this.departements){
            if('fuma:departement:'+this.unDepartement.codeRegion == d._id/*.substr(d._id.length - 2, 2)*/){
              ancientDepartementConcernee = d;
              //ajouter la région
              ancientDepartementConcernee.data.splice(ancientDepartementConcernee.data.indexOf(this.unDepartement), 1);
              break;
            }
          }
          
        }
      
        //this.unDepartement = departementData;
        this.servicePouchdb.updateLocalite(departementConcernee).then((res) => {
          //this.departements._rev = res.rev;
          departementConcernee._rev = res.rev;
          //mise à jour de la liste des régions
          for(let i = 0; i < this.departements.length; i++){
            if(this.departements[i]._id == departementConcernee._id){
              this.departements[i] = departementConcernee;
              break;
            }
          }

           //en cas de changement du code du département ou du nom du département, appliquer les changement dans la subdivision
          if(this.unDepartement.codeDepartement != departementData.codeDepartement || this.unDepartement.nomDepartement != departementData.nomDepartement){
            this.changerInfoDepartementDansCommune(this.unDepartement.codeDepartement, departementData);
            this.changerInfoDepartementDansVillage(this.unDepartement.codeDepartement, departementData);
          }

          this.action = 'infos';
          this.infos(departementData);
          
          /*if(this.mobile){
            this.departementData = this.departements.data;
          }*/
          if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
            //this.htmlTableAction = 'recharger';
            this.dataTableUpdateRow(departementData);
          }
          //this.actualiserTableau(this.departements.data);
          //libérer la mémoire occupée par la liste des pays
          this.paysData = [];
          this.regionData = [];

          //si changement de pays, mettre ajouter l'ancienne departement du pays
          if(regionChanger){
            this.servicePouchdb.updateLocalite(ancientDepartementConcernee).then((res) => {
              //this.departements._rev = res.rev;
              ancientDepartementConcernee._rev = res.rev;
              //mise à jour de la liste des régions
              for(let i = 0; i < this.departements.length; i++){
                if(this.departements[i]._id == ancientDepartementConcernee._id){
                  this.departements[i] = ancientDepartementConcernee;
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

    changerInfoDepartementDansCommune(ancienCodeDepartement, infoDepartement){
      this.servicePouchdb.getLocalDocById('fuma:commune:'+ancienCodeDepartement).then((commune) => {
        if(commune){
          var oldCommune = {...commune}
          commune.data.forEach((c, index) => {
            if(ancienCodeDepartement != infoDepartement.codeDepartement){
              c.codeDepartement = infoDepartement.codeDepartement;
              c.codeCommune = infoDepartement.codeDepartement + c.numeroCommune;
            }
            c.nomDepartement = infoDepartement.nomDepartement;
            c = this.servicePouchdb.garderCreationTrace(c);
          });
  
  
          //encas de changement de code
          if(ancienCodeDepartement != infoDepartement.codeDepartement){
            //créer un nouveau document
            delete commune['_rev'];
            commune._id = 'fuma:commune:'+infoDepartement.codeDepartement;
            this.servicePouchdb.createLocalite(commune);
            this.servicePouchdb.deleteLocaliteDefinitivement(oldCommune);
          }else{
            //changement de nom
            this.servicePouchdb.updateLocalite(commune);
          }
        }
      }).catch((err) => {
        console.log(err);
      });
    }

      
    changerInfoDepartementDansVillage(ancienCodeDepartement, infoDepartement){
      this.servicePouchdb.getLocalitePlageDocs('fuma:village:'+ancienCodeDepartement, 'fuma:village:'+ancienCodeDepartement+'\uffff').then((villages) => {
        if(villages){
          villages.forEach((village) => {
            var oldVillage = {...village}
            village.data.forEach((v, index) => {
              if(ancienCodeDepartement != ancienCodeDepartement.codeRegion){
                v.codeDepartement = infoDepartement.codeDepartement;
                v.codeCommune = v.codeDepartement + v.codeCommune.substr(7,2);
                v.codeVillage = v.codeCommune + v.numeroVillage;
              }
              v.nomDepartement = infoDepartement.nomDepartement;
              v = this.servicePouchdb.garderCreationTrace(v);
            });

            //encas de changement de code
            if(ancienCodeDepartement != infoDepartement.codeDepartement){
              //créer un nouveau document
              delete village['_rev'];
              village._id = 'fuma:village:'+infoDepartement.codeDepartement + village._id.substr(village._id.indexOf('-') + 5, 2);
              this.servicePouchdb.createLocalite(village);
              this.servicePouchdb.deleteLocaliteDefinitivement(oldVillage);
            }else{
              //changement de nom
              this.servicePouchdb.updateLocalite(village);
            }
          });
          
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  

    creerCommune(codeDepartement){
      //initialise les régions du pays
      let region: any = {
        _id: 'fuma:commune:'+codeDepartement,
        type: 'commune',
        data: []
      };
      this.servicePouchdb.createLocalite(region);
    }
  
  
    actualiserTableau(data){
      if(this.codePays && this.codePays != ''){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#departement-pays').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.departementHTMLTable = JSONToTHMLTable(data, "departement-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.departementHTMLTable = JSONToTHMLTable(data, "departement-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees)
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.departementHTMLTable = reCreateTHMLTable(this.departementHTMLTable.table, "departement-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.departementHTMLTable = reCreateTHMLTable(this.departementHTMLTable.table, "departement-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.departementHTMLTable.datatable);
          });
        }
      }else{
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#departement').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.departementHTMLTable = JSONToTHMLTable(data, "departement", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.departementHTMLTable = JSONToTHMLTable(data, "departement", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees)
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.departementHTMLTable = reCreateTHMLTable(this.departementHTMLTable.table, "departement", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.departementHTMLTable = reCreateTHMLTable(this.departementHTMLTable.table, "departement", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.departementHTMLTable.datatable);
          });
        }
      }
      
    }
  
    doRefresh(event) {
      //this.servicePouchdb.getLocalDocById('fuma:departement').then((departement)
      if(this.codeRegion && this.codeRegion != ''){       
        this.servicePouchdb.getLocalDocById('fuma:departement:'+this.codeRegion).then((departement) => {
          if(departement){
            this.departements = [];
            this.departementsData = [];
            this.departements.push({...departement});
            this.departementsData = [...departement.data];

            //si non mobile ou mobile + mode tableau et 
            if(this.departementsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#departement-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.departementHTMLTable.datatable);
              });
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.departements = [];
            if(this.mobile){
              this.departementsData = [];
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces au département ==> '+err)
          this.departements = [];
          if(this.mobile){
            this.departementsData = [];
          }
          this.seletedIndexes = [];
          if(event)
            event.target.complete();
        });
    
      }else if(this.codePays  && this.codePays != ''){
        this.servicePouchdb.getLocalitePlageDocs('fuma:departement:'+this.codePays, 'fuma:departement:'+this.codePays+'\uffff').then((departements) => {
          if(departements){
            this.departements = [...departements];
            var datas = [];
            for(let d of departements){
              datas = datas.concat(d.data);
            }
            this.departementsData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.departementsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#departement-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.departementHTMLTable.datatable);
              });
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.departements = [];
            if(this.mobile){
              this.departementsData = [];
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces au département ==> '+err)
          this.departements = [];
          if(this.mobile){
            this.departementsData = [];
          }
          this.seletedIndexes = [];
          if(event)
            event.target.complete();
        });

      } else{
        this.servicePouchdb.getLocalitePlageDocs('fuma:departement:', 'fuma:departement:\uffff').then((departements) => {
          if(departements){
            this.departements = [...departements];
            var datas = [];
            for(let d of departements){
              datas = datas.concat(d.data);
            }
            this.departementsData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.departementsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#departement').ready(()=>{
                if(global.langue == 'en'){
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.departementHTMLTable.datatable);
              });
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.departements = [];
            if(this.mobile){
              this.departementsData = [];
            }
            this.seletedIndexes = [];
            if(event)
              event.target.complete();
            }
        }).catch((err) => {
          console.log('Erreur acces au département ==> '+err)
          this.departements = [];
          if(this.mobile){
            this.departementsData = [];
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
  
    getDepartement(){
      if(this.codeRegion && this.codeRegion != ''){ 
        //si charger la liste des départements d'une région
        this.servicePouchdb.getLocalDocById('fuma:departement:'+this.codeRegion).then((departement) => {
          if(departement){
            if(this.codeDepartement && this.codeDepartement != ''){
              for(let d of departement.data){
                if(d.codeDepartement == this.codeDepartement){
                  this.unDepartement = d;
                  this.infos(d);
                  break;
                }
              }
            }else{
              this.departements = [];
              this.departementsData = [];
              this.departements.push({...departement});//clone de l'objet departement
              this.departementsData = [...departement.data]; //clone du tableau
  
              //si non mobile ou mobile + mode tableau et 
              if(this.departementsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
                $('#departement-pays').ready(()=>{
                  if(global.langue == 'en'){
                    this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                  }else{
                    this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.departementHTMLTable.datatable);
                });
              }
            }
          }
        }).catch((err) => {
          this.departements = [];
          this.departementsData = [];
          console.log(err)
        });
      }else if(this.codePays && this.codePays != ''){
        //si charger la liste des départements d'un pays
        this.servicePouchdb.getLocalitePlageDocs('fuma:departement:'+this.codePays, 'fuma:departement:'+this.codePays+'\uffff').then((departements) => {
          if(departements){
            this.departements = [...departements];
            var datas = [];
            for(let d of departements){
              datas = datas.concat(d.data);
            }
            this.departementsData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.departementsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#departement-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement-pays", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement-pays", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.departementHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.departements = [];
          this.departementsData = [];
          console.log(err)
        });

      }else{ 
        //tous les departments
        this.servicePouchdb.getLocalitePlageDocs('fuma:departement:', 'fuma:departement:\uffff').then((departements) => {
          if(departements){
            this.departements = [...departements];
            var datas = [];
            for(let d of departements){
              datas = datas.concat(d.data);
            }
            this.departementsData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.departementsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#departement').ready(()=>{
                if(global.langue == 'en'){
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.departementHTMLTable = JSONToTHMLTable(this.departementsData, "departement", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.departementHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.departements = [];
          this.departementsData = [];
          console.log(err)
        });
      }
    }
  
    
  
    getPays(){
      this.servicePouchdb.getLocalDocById('fuma:pays').then((pays) => {
        if(pays){
          this.paysData = [];
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
        this.paysData = [];
      });
    }

    getRegionParPays(codePays){
      this.servicePouchdb.getLocalDocById('fuma:region:'+codePays).then((region) => {
        if(region){
          this.regionData = [];
          if(this.codeRegion && this.codeRegion != ''){
            for(let d of region.data){
              if(d.codeRegion == this.codeRegion){
                this.regionData.push(d);
                this.setCodeEtNomRegion(d);
                break;
              }
            }
          }else{
            this.regionData = region.data;
          }
        }       
      }).catch((e) => {
        console.log('pays erreur: '+e);
        this.regionData = [];
      });
    }

    setNomPays(codePays){
      if(codePays && codePays != ''){
        for(let p of this.paysData){
          if(codePays == p.codePays){
            this.departementForm.controls.nomPays.setValue(p.nomPays);
            this.departementForm.controls.codeRegion.setValue('');
            this.departementForm.controls.nomRegion.setValue('');

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
            this.departementForm.controls.nomRegion.setValue(r.nomRegion);
            this.departementForm.controls.numeroDepartement.setValue('');
            this.departementForm.controls.codeDepartement.setValue('');
            break;
          }
        }
      }
    }
  
    setCodeEtNomPays(paysData){
      this.departementForm.controls.codePays.setValue(paysData.codePays);
      this.departementForm.controls.nomPays.setValue(paysData.nomPays);
    }

    setCodeEtNomRegion(regionData){
      this.departementForm.controls.codeRegion.setValue(regionData.codeRegion);
      this.departementForm.controls.nomRegion.setValue(regionData.nomRegion);
    }

    setCodeDepartement(numeroDepartement){
      if(numeroDepartement && numeroDepartement != ''){
        this.departementForm.controls.codeDepartement.setValue(this.departementForm.controls.codeRegion.value + numeroDepartement);
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
        id = 'departement-pays-datatable';
      }else{ 
        id = 'departement-datatable';
      }


      $('#'+id+' thead tr:eq(0) th:eq(0)').html(this.translate.instant('PAYS_PAGE.CODEPAYS'));
      $('#'+id+' thead tr:eq(0) th:eq(1)').html(this.translate.instant('PAYS_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(2)').html(this.translate.instant('REGION_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(3)').html(this.translate.instant('REGION_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(4)').html(this.translate.instant('DEPARTEMENT_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(5)').html(this.translate.instant('DEPARTEMENT_PAGE.NUMERO'));
      $('#'+id+' thead tr:eq(0) th:eq(6)').html(this.translate.instant('DEPARTEMENT_PAGE.NOM'));      
      $('#'+id+' thead tr:eq(0) th:eq(7)').html(this.translate.instant('GENERAL.LATITUDE'));
      $('#'+id+' thead tr:eq(0) th:eq(8)').html(this.translate.instant('GENERAL.LONGITUDE'));
      
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }
  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //code departement
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeDepartement[0].message = res;
      });

      //numéro département
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numeroDepartement[0].message = res;
      });
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.MINLENGTH').subscribe((res: string) => {
        this.messages_validation.numeroDepartement[1].message = res;
      });
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.MAXLENGTH').subscribe((res: string) => {
        this.messages_validation.numeroDepartement[2].message = res;
      });
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.PATTERN').subscribe((res: string) => {
        this.messages_validation.numeroDepartement[3].message = res;
      });
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.VALIDNUMERODEPARTEMENT').subscribe((res: string) => {
        this.messages_validation.numeroDepartement[4].message = res;
      });

      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.UNIQUENUMERODEPARTEMENT').subscribe((res: string) => {
        this.messages_validation.numeroDepartement[5].message = res;
      });
  
      //nom departement
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NOMDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomDepartement[0].message = res;
      });

      //code pays
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codePays[0].message = res;
      });

      //nom pays
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NOMPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomPays[0].message = res;
      });

       //pays loading
       this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.PAYSLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.paysLoading[0].message = res;
      });

      //code région
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeRegion[0].message = res;
      });

      //nom région
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NOMREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomRegion[0].message = res;
      });

       //region loading
       this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.REGIONLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.regionLoading[0].message = res;
      });
    }
  
    dataTableAddRow(rowData){
      let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });
  
      this.departementHTMLTable.datatable.row.add(data).draw();
    }
  
    dataTableUpdateRow(/*index, */rowData){
      let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });
  
      this.departementHTMLTable.datatable.row('.selected').data(data).draw();
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      this.departementHTMLTable.datatable.rows('.selected').remove().draw();
    }
  
    
  dataTableSelectAll(){
    this.seletedIndexes = [];
    this.departementHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.departementHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.seletedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.departementHTMLTable.datatable.rows().deselect();
    this.seletedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'departement-pays-datatable';
    }else{ 
      id = 'departement-datatable';
    }

    $('#'+id+' thead tr:eq(1)').show();
    this.recherchePlus = true;
  }

  dataTableRemoveRechercheParColonne(){
    var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'departement-pays-datatable';
    }else{ 
      id = 'departement-datatable';
    }

    $('#'+id+' thead tr:eq(1)').hide();
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'departement-pays-datatable';
    }else{ 
      id = 'departement-datatable';
    }

    if(!this.filterAjouter && !this.filterInitialiser){
      var i = -1;
      var self = this;
      $('#'+id+' tfoot').show();
      this.departementHTMLTable.datatable.columns().every( function () {
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
                  
                  var info = self.departementHTMLTable.datatable.page.info();
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

      this.departementHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
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
      id = 'departement-pays-datatable';
    }else{ 
      id = 'departement-datatable';
    }

    $('#'+id+' tfoot').hide();
    this.filterAjouter = false;
  }

  
    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        this.departementsData = this.departements.data.filter((item) => {
          return item.codeDepartement.toLowerCase().indexOf(val) !== -1 || item.nomDepartement.toLowerCase().indexOf(val) !== -1 || item.referenceOpenStreetMap.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.departementData = temp;
      
    }
  
    async close(){
      await this.modalController.dismiss();
    }
    
    ionViewDidEnter(){ 

    }

    
    
}
