import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NumeroVillageValidator } from '../../validators/village.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, Platform, PopoverController, NavController  } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsVillageComponent } from '../../component/relations-village/relations-village.component';
import { global } from '../../../app/globale/variable';
import { PaysPage } from '../pays/pays.page';
import { RegionPage } from '../region/region.page';
import { DepartementPage } from '../departement/departement.page';
import { CommunePage } from '../commune/commune.page';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToTHMLTable: any;
declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-village',
  templateUrl: './village.page.html',
  styleUrls: ['./village.page.scss'],
})
export class VillagePage implements OnInit {

  @Input() codePays: string;
  @Input() codeRegion: string;
  @Input() codeDepartement: string;
  @Input() codeCommune: string;
  villageForm: FormGroup;
  action: string = 'liste';
  villages: any;
  villagesData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  communeData: any = [];
  typesVillage = ['Village administratif', 'Hameau', 'Campement', 'Point d’eau', 'Quartier', 'Autre'];
  unVillage: any;
  villageHTMLTable: any;
  htmlTableAction: string;
  seletedIndexes: any = [];
  mobile: boolean = false;
  styleAffichage: string = "liste";

  messages_validation = {
    'codeVillage': [
        { type: 'required', message: '' },
      ],
    'numeroVillage': [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' },
      { type: 'maxlength', message: '' },
      { type: 'pattern', message: '' },
      { type: 'validNumeroVillage', message: '' },
      { type: 'uniqueNumeroVillage', message: '' }
    ],
    'nomVillage': [
      { type: 'required', message: '' }
    ],
    'typeVillage': [
      { type: 'required', message: '' }
    ],
    'codePays': [
      { type: 'required', message: '' }
    ],
    'codeRegion': [
      { type: 'required', message: '' }
    ],
    'codeDepartement': [
      { type: 'required', message: '' }
    ],
    'codeCommune': [
      { type: 'required', message: '' }
    ],
   
  }

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private route: ActivatedRoute, private geolocation: Geolocation, private navCtrl: NavController, private file: File, private popoverController: PopoverController, private plateform: Platform, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);
      if(this.plateform.is('android') || this.plateform.is('ios') || this.plateform.is('mobile')){
        this.mobile = true;
      }

    }
  
    ngOnInit() {
      //au cas où la village est en mode modal, on chercher info region
      if(this.codeCommune && this.codeCommune != ''){
        this.codeDepartement = this.codeCommune.substr(0, 7);
      }
      if(this.codeDepartement && this.codeDepartement != ''){
        this.codeRegion = this.codeDepartement.substr(0, 5);
      }
      if(this.codeRegion && this.codeRegion != ''){
        this.codePays = this.codeRegion.substr(0, 2);
      }
      this.translateLangue();
      this.getVillage();
    }
  
    changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.actualiserTableau(this.villagesData);
      }else {
        this.styleAffichage = 'liste';
        this.seletedIndexes = [];
      }
    }
  
    initForm(){
      //this.villageForm = null;
      this.villageForm = this.formBuilder.group({
        codePays: ['', Validators.required],
        nomPays: ['', Validators.required],
        codeRegion: ['', Validators.required],
        nomRegion: ['', Validators.required],
        codeDepartement: ['', Validators.required],
        nomDepartement: ['', Validators.required],
        codeCommune: ['', Validators.required],
        nomCommune: ['', Validators.required],
        codeVillage: ['', {disabled: true}, Validators.required],
        numeroVillage: [''/*, Validators.compose([NumeroVillageValidator.uniqueNumeroVillage(this.villagesData, 'ajouter'), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required])*/],
        nomVillage: ['', Validators.required],
        typeVillage: ['', Validators.required],
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

      this.villageForm.valueChanges.subscribe(change => {
        this.villageForm.get('numeroVillage').setValidators([NumeroVillageValidator.uniqueNumeroVillage(this.villagesData, this.villageForm.value.codeCommune, 'ajouter'), NumeroVillageValidator.validNumeroVillage(), Validators.maxLength(3), Validators.minLength(3), Validators.pattern('^[0-9]+$'), Validators.required]);
      });
    }
  
    editForm(v){
      //this.villageForm = null;
      this.villageForm = this.formBuilder.group({
        codePays: [v.codePays, Validators.required],
        nomPays: [v.nomPays, Validators.required],
        codeRegion: [v.codeRegion, Validators.required],
        nomRegion: [v.nomRegion, Validators.required],
        codeDepartement: [v.codeDepartement, Validators.required],
        nomDepartement: [v.nomDepartement, Validators.required],
        codeCommune: [v.codeCommune, Validators.required],
        nomCommune: [v.nomCommune, Validators.required],
        codeVillage: [v.codeVillage, Validators.required],
        numeroVillage: [v.numeroVillage],
        nomVillage: [v.nomVillage, Validators.required],
        typeVillage: [v.typeVillage, Validators.required],
        latitude: [v.latitude],
        longitude: [v.latitude],
        created_at: [v.created_at],
        created_by: [v.created_by],
        updatet_at: [v.updatet_at],
        updated_by: [v.updated_by],
        deleted: [v.deleted],
        deleted_at: [v.deleted_at],
        deleted_by: [v.deleted_by]
      });

      this.villageForm.valueChanges.subscribe(change => {
        this.villageForm.get('numeroVillage').setValidators([NumeroVillageValidator.uniqueNumeroVillage(this.villagesData, this.villageForm.value.codeCommune, 'ajouter'), NumeroVillageValidator.validNumeroVillage(), Validators.maxLength(3), Validators.minLength(3), Validators.pattern('^[0-9]+$'), Validators.required]);
      });
    }
  
    ajouter(){
      this.getPays();
      this.initForm();
      this.action = 'ajouter';
    }
  
    infos(v){
      this.unVillage = v;
      this.action = 'infos';
    }

  
    modifier(v){
      this.getPays();
      this.getRegionParPays(v.codePays);
      this.getDepartementParRegion(v.codeRegion);
      this.getCommuneParDepartement(v.codeDepartement);
      this.editForm(v);
      this.unVillage = v;
      this.action ='modifier';
    }

    getPosition(){
      this.afficheMessage(this.translate.instant('GENERAL.OBTENTION_COORDONNEES'));
      this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
        this.villageForm.controls.latitude.setValue(resp.coords.latitude);
        this.villageForm.controls.longitude.setValue(resp.coords.longitude);
        this.afficheMessage(this.translate.instant('GENERAL.COORDONNEES_OBTENUES'));
      }, err => {
        this.afficheMessage(this.translate.instant('GENERAL.ERREUR_COORDONNEES'));
          console.log(err)
      });
    }
  
    exportExcel(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('village-datatable').innerHTML], {
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
      let blob = new Blob([document.getElementById('village-datatable').innerHTML], {
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
  
  
    async supprimer(v) {
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
              this.villagesData.splice(this.villagesData.indexOf(v), 1);
              //chercher la village concernée
              var villageConcernee;
              for(let vil of this.villages){
                if('fuma:village:'+v.codeCommune == vil._id/*.substr(vil._id.length - 2, 2)*/){
                  villageConcernee = vil;
                  break;
                }
              }

              //mise à jour dans la village
              villageConcernee.data.splice(villageConcernee.data.indexOf(v), 1)
      
              this.servicePouchdb.updateLocalite(villageConcernee).then((res) => {
                villageConcernee._rev = res.rev;
                //mise à jour de la liste des villages
                for(let i = 0; i < this.villages.length; i++){
                  if(this.villages[i]._id == villageConcernee._id){
                    this.villages[i] = villageConcernee;
                    break;
                  }
                }
                this.action = 'liste';
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
                this.htmlTableAction = 'recharger';
                this.actualiserTableau(this.villagesData);
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

    async presentCommune(codeCommune) {
      const modal = await this.modalController.create({
        component: CommunePage,
        componentProps: { codeCommune: codeCommune },
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
              var villagesConcernee: any = {};
              this.seletedIndexes.forEach((si) => {
                var v = this.villagesData[si];
                var exist = 0;

                if(villagesConcernee['fuma:village:'+v.codeCommune]){
                  villagesConcernee['fuma:village:'+v.codeCommune].data.splice(villagesConcernee['fuma:village:'+v.codeCommune].data.indexOf(v), 1);
                  exist = 1;
                }

                if(!exist){
                  for(let vil of this.villages){
                    if('fuma:village:'+v.codeCommune == vil._id){
                      vil.data.splice(vil.data.indexOf(v), 1);
                      villagesConcernee[vil._id] = vil
                      break;
                    }
                  }
                }
              });

              //mise à jour de villagesData
              this.seletedIndexes.forEach((si) => {
                this.villagesData.splice(this.villagesData.indexOf(this.villagesData[si]), 1);
              });

              //update
              Object.keys(villagesConcernee).forEach((key, index) => {
                this.servicePouchdb.updateLocalite(villagesConcernee[key]).then((res) => {
                  villagesConcernee[key]._rev = res.rev;
                  for(let i = 0; i < this.villages.length; i++){
                    if(this.villages[i]._id == villagesConcernee[key]._id){
                      this.villages[i] = villagesConcernee[key];
                      break;
                    }
                  }
                  if(index +1 == Object.keys(villagesConcernee).length){
                    this.action = 'liste';
                    this.htmlTableAction = 'recharger';
                    this.actualiserTableau(this.villagesData);
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
                  }
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });
              });
              
              
              this.seletedIndexes = [];
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
        this.actualiserTableau(this.villagesData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        this.action = "infos";
      }else{
        this.action = 'liste';
        this.actualiserTableau(this.villagesData);
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
              this.infos(this.villagesData[this.seletedIndexes[0]]);
              this.seletedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
            }
          }
        }, {
          text: this.translate.instant('GENERAL.MODIFIER'),
          icon: 'create',
          handler: () => {
            if(this.seletedIndexes.length == 1){
              this.modifier(this.villagesData[this.seletedIndexes[0]]);
              this.seletedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
            }
          }
        }, {
          text: this.translate.instant('GENERAL.NOUVEAU'),
          icon: 'add',
          handler: () => {
            this.ajouter();
            this.seletedIndexes = [];
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
          if(this.seletedIndexes.length == 1){
            this.infos(this.villagesData[this.seletedIndexes[0]]);
            this.seletedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          if(this.seletedIndexes.length == 1){
            this.modifier(this.villagesData[this.seletedIndexes[0]]);
            this.seletedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
          }
        } else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          this.suppressionMultiple();
        }
      });
      return await popover.present();
    }
  
  
    async openRelationVillage(ev: any/*, codeVillage*/) {
      const popover = await this.popoverController.create({
        component: RelationsVillageComponent,
        event: ev,
        translucent: true,
        componentProps: {"codeVillage": this.unVillage.codeVillage},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      /*popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'village') {
          this.navCtrl.navigateForward('/localite/villages/village/'+this.unVillage.codeVillage)
        }else if(dataReturned !== null && dataReturned.data == 'village') {
          
        }else if(dataReturned !== null && dataReturned.data == 'village') {
          
        } else if(dataReturned !== null && dataReturned.data == 'village') {
          
        }
  
      });*/
      return await popover.present();
    }
  
    existeVillage(codeCommune){
      for(let vil of this.villages){
        if('fuma:village:'+codeCommune == vil._id){
          return 1;
        }
      }

      return 0;
    }
  
    onSubmit(){
      let villageData = this.villageForm.value;
      if(this.action === 'ajouter'){
        //Si le village existe
        if(this.villages && this.existeVillage(villageData.codeCommune)){
          villageData = this.servicePouchdb.garderCreationTrace(villageData);
          
          var villageConcernee;
          for(let v of this.villages){
            if('fuma:village:'+villageData.codeCommune == v._id){
              villageConcernee = v;
              break;
            }
          }
          
          villageConcernee.data.push(villageData);
          //********************* */
          //si changement code de villages, appliquer le changement aux localité
          /*if(this.unVillage.codeVillage != villageData.codeVillage){
            //application des changements au localités
          }*/
          this.servicePouchdb.updateLocalite(villageConcernee).then((res) => {
            villageConcernee._rev = res.rev;
            for(let i = 0; i < this.villages.length; i++){
              if(this.villages[i]._id == villageConcernee._id){
                this.villages[i] = villageConcernee;
                break;
              }
            }
            this.villagesData.push(villageData);
            //this.villages._rev = res.rev;
            this.action = 'liste';
            /*if(this.mobile){
              this.villageData = this.villages.data;
            }*/
            if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
              this.htmlTableAction = 'recharger';
            }
            //this.htmlTableAction = 'recharger';
            this.actualiserTableau(this.villagesData);

            //initialiser la liste des villages
            //this.creerVillage(villageData.codeVillage);

            //libérer la mémoire occupée par la liste des pays
            this.paysData = [];
            this.regionData = [];
            this.departementData = [];
            this.communeData = [];
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE'+': '+err.toString()));
          });
        }else{
          //créer un nouveau village
          villageData = this.servicePouchdb.garderCreationTrace(villageData);
          
          
          let village: any = {
            _id: 'fuma:village:'+villageData.codeCommune,
            type: 'village',
            data: [villageData]
          };
          //this.villages = village;
          this.villagesData.push(villageData);

          this.servicePouchdb.createLocalite(village).then((res) => {
            village._rev = res.rev;
            this.villages.push(village);
            this.action = 'liste';
            if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
              this.htmlTableAction = 'recharger';
            }
            //this.htmlTableAction = 'recharger';
            this.actualiserTableau(this.villagesData);

            //initialiser la liste des villages
            //this.creerVillage(villageData.codeVillage);
            
            //libérer la mémoire occupée par la liste des pays
            this.paysData = [];
            this.regionData = [];
            this.departementData = [];
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE'+': '+err.toString()));
          });
        }
      }else{
        //si modification
        //var paysChanger: boolean = false
        var communeChanger: boolean = false
        
        //virifier s'il ya eu un changement de village pour le village
        if(this.unVillage.codeCommune != villageData.codeCommune){
          communeChanger = true;
        }
        
        villageData = this.servicePouchdb.garderUpdateTrace(villageData);
        //mise à jour de la liste des villages
        this.villagesData[this.villagesData.indexOf(this.unVillage)] = villageData;
        
        //récuper la village concernée, celle qui a été modifiée
        //les village sont classées par pays, donc il suffit de récupérer la village corespondant au code de pays de la village elle même
        var villageConcernee;
        var ancientVillageConcernee;
        if(!communeChanger){
          for(let v of this.villages){
            if('fuma:village:'+villageData.codeCommune == v._id){
              villageConcernee = v;
              break;
            }
          }
          //mise à jour dans la village
          villageConcernee.data[villageConcernee.data.indexOf(this.unVillage)] = villageData;
        }else{
          //recuprer la nouvelle village du pays et ajouter la village
          for(let v of this.villages){
            if('fuma:village:'+villageData.codeCommune == v._id/*.substr(d._id.length - 2, 2)*/){
              villageConcernee = v;
              //ajouter la village
              villageConcernee.data.push(villageData);
              break;
            }
          }

          //recuprer l'ancienne village du pays et supprimer la village
          for(let v of this.villages){
            if('fuma:village:'+this.unVillage.codeCommune == v._id/*.substr(d._id.length - 2, 2)*/){
              ancientVillageConcernee = v;
              //ajouter la village
              ancientVillageConcernee.data.splice(ancientVillageConcernee.data.indexOf(this.unVillage), 1);
              break;
            }
          }
          
        }
      
        //this.unVillage = villageData;
        this.servicePouchdb.updateLocalite(villageConcernee).then((res) => {
          //this.villages._rev = res.rev;
          villageConcernee._rev = res.rev;
          //mise à jour de la liste des villages
            for(let i = 0; i < this.villages.length; i++){
              if(this.villages[i]._id == villageConcernee._id){
                this.villages[i] = villageConcernee;
                break;
              }
            }
          this.action = 'infos';
          this.infos(villageData);
          
          /*if(this.mobile){
            this.villageData = this.villages.data;
          }*/
          if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
            this.htmlTableAction = 'recharger';
          }
          //this.actualiserTableau(this.villages.data);
          //libérer la mémoire occupée par la liste des pays
          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
          this.communeData = [];

          //si changement de pays, mettre ajouter l'ancienne village du pays
          if(communeChanger){
            this.servicePouchdb.updateLocalite(ancientVillageConcernee).then((res) => {
              //this.villages._rev = res.rev;
              ancientVillageConcernee._rev = res.rev;
              //mise à jour de la liste des villages
              for(let i = 0; i < this.villages.length; i++){
                if(this.villages[i]._id == ancientVillageConcernee._id){
                  this.villages[i] = ancientVillageConcernee;
                  break;
                }
              }
            });
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE'+': '+err.toString()));
        });
      }
    }
  
  
    actualiserTableau(data){
      if(this.codePays && this.codePays != ''){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#village-pays').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.villageHTMLTable = JSONToTHMLTable(data, "village-pays", null, this.mobile);
              }else{
                this.villageHTMLTable = JSONToTHMLTable(data, "village-pays", global.dataTable_fr, this.mobile)
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.villageHTMLTable = reCreateTHMLTable(this.villageHTMLTable.table, "village-pays", null, this.mobile);
              }else{
                this.villageHTMLTable = reCreateTHMLTable(this.villageHTMLTable.table, "village-pays", global.dataTable_fr, this.mobile);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.villageHTMLTable.datatable);
          });
        }
      }else{
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#village').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.villageHTMLTable = JSONToTHMLTable(data, "village", null, this.mobile);
              }else{
                this.villageHTMLTable = JSONToTHMLTable(data, "village", global.dataTable_fr, this.mobile)
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.villageHTMLTable = reCreateTHMLTable(this.villageHTMLTable.table, "village", null, this.mobile);
              }else{
                this.villageHTMLTable = reCreateTHMLTable(this.villageHTMLTable.table, "village", global.dataTable_fr, this.mobile);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.villageHTMLTable.datatable);
          });
        }
      }
      
    }
  
    doRefresh(event) {
      //this.servicePouchdb.getLocalDocById('fuma:village').then((village)
      if(this.codeCommune && this.codeCommune != ''){       
        this.servicePouchdb.getLocalDocById('fuma:village:'+this.codeCommune).then((village) => {
          if(village){
            this.villages = [];
            this.villagesData = [];
            this.villages.push({...village});
            this.villagesData = [...village.data];

            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
            event.target.complete();
          }else{
            this.villages = [];
            if(this.mobile){
              this.villagesData = [];
            }
            event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la village ==> '+err)
          this.villages = [];
          if(this.mobile){
            this.villagesData = [];
          }
          event.target.complete();
        });
    
      }else if(this.codeDepartement  && this.codeDepartement != ''){
        this.servicePouchdb.getLocalitePlageDocs('fuma:village:'+this.codeDepartement, 'fuma:village:'+this.codeDepartement+'\uffff').then((villages) => {
          if(villages){
            this.villages = [...villages];
            var datas = [];
            for(let d of villages){
              datas = datas.concat(d.data);
            }
            this.villagesData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
            event.target.complete();
          }else{
            this.villages = [];
            if(this.mobile){
              this.villagesData = [];
            }
            event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la village ==> '+err)
          this.villages = [];
          if(this.mobile){
            this.villagesData = [];
          }
          event.target.complete();
        });

      }else if(this.codeRegion  && this.codeRegion != ''){
        this.servicePouchdb.getLocalitePlageDocs('fuma:village:'+this.codeRegion, 'fuma:village:'+this.codeRegion+'\uffff').then((villages) => {
          if(villages){
            this.villages = [...villages];
            var datas = [];
            for(let d of villages){
              datas = datas.concat(d.data);
            }
            this.villagesData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
            event.target.complete();
          }else{
            this.villages = [];
            if(this.mobile){
              this.villagesData = [];
            }
            event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la village ==> '+err)
          this.villages = [];
          if(this.mobile){
            this.villagesData = [];
          }
          event.target.complete();
        });

      }else if(this.codePays  && this.codePays != ''){
        this.servicePouchdb.getLocalitePlageDocs('fuma:village:'+this.codePays, 'fuma:village:'+this.codePays+'\uffff').then((villages) => {
          if(villages){
            this.villages = [...villages];
            var datas = [];
            for(let d of villages){
              datas = datas.concat(d.data);
            }
            this.villagesData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
            event.target.complete();
          }else{
            this.villages = [];
            if(this.mobile){
              this.villagesData = [];
            }
            event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la village ==> '+err)
          this.villages = [];
          if(this.mobile){
            this.villagesData = [];
          }
          event.target.complete();
        });

      }else{
        this.servicePouchdb.getLocalitePlageDocs('fuma:village:', 'fuma:village:\uffff').then((villages) => {
          if(villages){
            this.villages = [...villages];
            var datas = [];
            for(let d of villages){
              datas = datas.concat(d.data);
            }
            this.villagesData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
            event.target.complete();
          }else{
            this.villages = [];
            if(this.mobile){
              this.villagesData = [];
            }
            event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la village ==> '+err)
          this.villages = [];
          if(this.mobile){
            this.villagesData = [];
          }
          event.target.complete();
        });
    
      }
      /*setTimeout(() => {
        event.target.complete();
      }, 2000);*/
    }
  
    getVillage(){
      if(this.codeCommune && this.codeCommune != ''){ 
        //si charger la liste des départements d'une village
        this.servicePouchdb.getLocalDocById('fuma:village:'+this.codeCommune).then((village) => {
          if(village){
            this.villages = [];
            this.villagesData = [];
            this.villages.push({...village});//clone de l'objet village
            this.villagesData = [...village.data]; //clone du tableau

            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.villages = [];
          this.villagesData = [];
          console.log(err)
        });
      }else if(this.codeDepartement && this.codeDepartement != ''){
        //si charger la liste des départements d'une région
        this.servicePouchdb.getLocalitePlageDocs('fuma:village:'+this.codeDepartement, 'fuma:village:'+this.codeDepartement+'\uffff').then((villages) => {
          if(villages){
            this.villages = [...villages];
            var datas = [];
            for(let d of villages){
              datas = datas.concat(d.data);
            }
            this.villagesData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.villages = [];
          this.villagesData = [];
          console.log(err)
        });

      }else if(this.codeRegion && this.codeRegion != ''){
        //si charger la liste des départements d'une région
        this.servicePouchdb.getLocalitePlageDocs('fuma:village:'+this.codeRegion, 'fuma:village:'+this.codeRegion+'\uffff').then((villages) => {
          if(villages){
            this.villages = [...villages];
            var datas = [];
            for(let d of villages){
              datas = datas.concat(d.data);
            }
            this.villagesData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.villages = [];
          this.villagesData = [];
          console.log(err)
        });

      }else if(this.codePays && this.codePays != ''){
        //si charger la liste des départements d'un pays
        this.servicePouchdb.getLocalitePlageDocs('fuma:village:'+this.codePays, 'fuma:village:'+this.codePays+'\uffff').then((villages) => {
          if(villages){
            this.villages = [...villages];
            var datas = [];
            for(let d of villages){
              datas = datas.concat(d.data);
            }
            this.villagesData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village-pays", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.villages = [];
          this.villagesData = [];
          console.log(err)
        });

      }else{ 
        //tous les departments
        this.servicePouchdb.getLocalitePlageDocs('fuma:village:', 'fuma:village:\uffff').then((villages) => {
          if(villages){
            this.villages = [...villages];
            var datas = [];
            for(let d of villages){
              datas = datas.concat(d.data);
            }
            this.villagesData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.villagesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#village').ready(()=>{
                if(global.langue == 'en'){
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village", null, this.mobile);
                }else{
                  this.villageHTMLTable = JSONToTHMLTable(this.villagesData, "village", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.villageHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.villages = [];
          this.villagesData = [];
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
                this.getCommuneParDepartement(d.codeDepartement);
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

    getCommuneParDepartement(codeDepartement){
      this.communeData = [];
      this.servicePouchdb.getLocalDocById('fuma:commune:'+codeDepartement).then((commune) => {
        if(commune){
          if(this.codeCommune && this.codeCommune != ''){
            for(let c of commune.data){
              if(c.codeCommune == this.codeCommune){
                this.communeData.push(c);
                this.setCodeEtNomCommune(c);
                break;
              }
            }
          }else{
            this.communeData = commune.data;
          }
        }       
      }).catch((e) => {
        //this.communeData = [null];
        console.log('commune erreur: '+e);
        
      });
    }

    setNomPays(codePays){
      if(codePays && codePays != ''){
        for(let p of this.paysData){
          if(codePays == p.codePays){
            this.villageForm.controls.nomPays.setValue(p.nomPays);
            this.villageForm.controls.codeRegion.setValue('');
            this.villageForm.controls.nomRegion.setValue('');

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
            this.villageForm.controls.nomRegion.setValue(r.nomRegion);
            this.villageForm.controls.codeDepartement.setValue('');
            this.villageForm.controls.nomDepartement.setValue('');

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
            this.villageForm.controls.nomDepartement.setValue(d.nomDepartement);
            this.villageForm.controls.codeCommune.setValue('');
            this.villageForm.controls.nomCommune.setValue('');
            this.getCommuneParDepartement(codeDepartement)
            break;
          }
        }
      }
    }

    setNomCommune(codeCommune){
      if(codeCommune && codeCommune != ''){
        for(let c of this.communeData){
          if(codeCommune == c.codeCommune){
            this.villageForm.controls.nomCommune.setValue(c.nomCommune);
            this.villageForm.controls.numeroVillage.setValue('');
            this.villageForm.controls.codeVillage.setValue('');
            break;
          }
        }
      }
    }
  
    setCodeEtNomPays(paysData){
      this.villageForm.controls.codePays.setValue(paysData.codePays);
      this.villageForm.controls.nomPays.setValue(paysData.nomPays);
    }

    setCodeEtNomRegion(regionData){
      this.villageForm.controls.codeRegion.setValue(regionData.codeRegion);
      this.villageForm.controls.nomRegion.setValue(regionData.nomRegion);
    }

    setCodeEtNomDepartement(departementData){
      this.villageForm.controls.codeDepartement.setValue(departementData.codeDepartement);
      this.villageForm.controls.nomDepartement.setValue(departementData.nomDepartement);
    }

    setCodeEtNomCommune(communeData){
      this.villageForm.controls.codeCommune.setValue(communeData.codeCommune);
      this.villageForm.controls.nomCommune.setValue(communeData.nomCommune);
    }

    setCodeVillage(numeroVillage){
      if(numeroVillage && numeroVillage != ''){
        this.villageForm.controls.codeVillage.setValue(this.villageForm.controls.codeCommune.value + numeroVillage);
      }
    }

    attacheEventToDataTable(datatable){
      var self = this;
      datatable.on( 'select', function ( e, dt, type, indexes ) {
        for(const i of indexes){
          self.seletedIndexes.push(i)
        }
        
      } )
      .on( 'deselect', function ( e, dt, type, indexes ) {
        for(const i of indexes){
          self.seletedIndexes.splice(self.seletedIndexes.indexOf(i), 1)
        }
        
      } );
    }
  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //code village
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.CODEVILLAGE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeVillage[0].message = res;
      });

      //numéro village
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.NUMEROVILLAGE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numeroVillage[0].message = res;
      });
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.NUMEROVILLAGE.MINLENGTH').subscribe((res: string) => {
        this.messages_validation.numeroVillage[1].message = res;
      });
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.NUMEROVILLAGE.MAXLENGTH').subscribe((res: string) => {
        this.messages_validation.numeroVillage[2].message = res;
      });
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.NUMEROVILLAGE.PATTERN').subscribe((res: string) => {
        this.messages_validation.numeroVillage[3].message = res;
      });
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.NUMEROVILLAGE.VALIDNUMEROVILLAGE').subscribe((res: string) => {
        this.messages_validation.numeroVillage[4].message = res;
      });

      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.NUMEROVILLAGE.UNIQUENUMEROVILLAGE').subscribe((res: string) => {
        this.messages_validation.numeroVillage[5].message = res;
      });
  
      //nom village
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.NOMVILLAGE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomVillage[0].message = res;
      });

       //nom village
       this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.TYPEVILLAGE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.typeVillage[0].message = res;
      });

      //code pays
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codePays[0].message = res;
      });


      //code région
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeRegion[0].message = res;
      });

      //code département
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeDepartement[0].message = res;
      });

      //code commune
      this.translate.get('VILLAGE_PAGE.MESSAGES_VALIDATION.CODECOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeCommune[0].message = res;
      });
    }
  
  
    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        this.villagesData = this.villages.data.filter((item) => {
          return item.codeVillage.toLowerCase().indexOf(val) !== -1 || item.nomVillage.toLowerCase().indexOf(val) !== -1 || item.referenceOpenStreetMap.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.villageData = temp;
      
    }
  
    
    ionViewDidEnter(){ 

    }

}
