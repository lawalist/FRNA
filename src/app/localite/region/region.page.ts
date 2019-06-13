import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NumeroRegionValidator } from '../../validators/region.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, Platform, PopoverController, NavController  } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsRegionComponent } from '../../component/relations-region/relations-region.component';
import { global } from '../../../app/globale/variable';
import { PaysPage } from '../pays/pays.page';
import { DepartementPage } from '../departement/departement.page';
import { CommunePage } from '../commune/commune.page';
import { VillagePage } from '../village/village.page';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToTHMLTable: any;
declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;
//declare var TableManageButtons: any;
@Component({
  selector: 'app-region',
  templateUrl: './region.page.html',
  styleUrls: ['./region.page.scss'],
})
export class RegionPage implements OnInit {

  @Input() codePays: string;
  @Input() codeRegion: any;
  regionForm: FormGroup;
  action: string = 'liste';
  regions: any;
  regionsData: any = [];
  //pays: any = {data: []};
  paysData: any = [];
  uneRegion: any;
  regionHTMLTable: any;
  htmlTableAction: string;
  seletedIndexes: any = [];
  mobile: boolean = false;
  styleAffichage: string = "liste";
  //selectedCodePays: string;

  messages_validation = {
    'codeRegion': [
        { type: 'required', message: '' },
      ],
    'numeroRegion': [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' },
      { type: 'maxlength', message: '' },
      { type: 'pattern', message: '' },
      { type: 'validNumeroRegion', message: '' },
      { type: 'uniqueNumeroRegion', message: '' }
    ],
    'nomRegion': [
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
    ]
  }

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private route: ActivatedRoute, private geolocation: Geolocation, private navCtrl: NavController, private file: File, private popoverController: PopoverController, private plateform: Platform, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);
      if(this.plateform.is('android') || this.plateform.is('ios') || this.plateform.is('mobile')){
        this.mobile = true;
      }

      /*if(this.route.snapshot.paramMap.get('codePays')){
        this.codePays = this.route.snapshot.paramMap.get('codePays');
      }*/

    }
  
    ngOnInit() {
      //au cas où la région est en mode modal, on chercher info region
      if(this.codeRegion && this.codeRegion != ''){
        this.codePays = this.codeRegion.substr(0, 2);
      }
      this.translateLangue();
      this.getRegion();
      //this.initForm();
    }
  
    changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.actualiserTableau(this.regionsData);
      }else {
        this.styleAffichage = 'liste';
        this.seletedIndexes = [];
      }
    }
  
    initForm(){
      //this.regionForm = null;
      this.regionForm = this.formBuilder.group({
        codePays: ['', Validators.required],
        nomPays: ['', Validators.required],
        codeRegion: ['', {disabled: true}, Validators.required],
        numeroRegion: [''/*, Validators.compose([NumeroRegionValidator.uniqueNumeroRegion(this.regionsData, 'ajouter'), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required])*/],
        nomRegion: ['', Validators.required],
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

      this.regionForm.valueChanges.subscribe(change => {
        this.regionForm.get('numeroRegion').setValidators([NumeroRegionValidator.uniqueNumeroRegion(this.regionsData, this.regionForm.value.codePays, 'ajouter'), NumeroRegionValidator.validNumeroRegion(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });
    }
  
    editForm(r){
      //this.regionForm = null;
      this.regionForm = this.formBuilder.group({
        codePays: [r.codePays, Validators.required],
        nomPays: [r.nomPays, Validators.required],
        codeRegion: [r.codeRegion, Validators.required],
        numeroRegion: [r.numeroRegion],
        nomRegion: [r.nomRegion, Validators.required],
        latitude: [r.latitude],
        longitude: [r.latitude],
        created_at: [r.created_at],
        created_by: [r.created_by],
        updatet_at: [r.updatet_at],
        updated_by: [r.updated_by],
        deleted: [r.deleted],
        deleted_at: [r.deleted_at],
        deleted_by: [r.deleted_by]
      });

      this.regionForm.valueChanges.subscribe(change => {
        this.regionForm.get('numeroRegion').setValidators([NumeroRegionValidator.uniqueNumeroRegion(this.regionsData, this.regionForm.value.codePays, 'ajouter'), NumeroRegionValidator.validNumeroRegion(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });
    }
  
    ajouter(){
      this.getPays();
      this.initForm();
      this.action = 'ajouter';
    }
  
    infos(p){
      this.uneRegion = p;
      this.action = 'infos';
    }

  
    modifier(r){
      this.getPays();
      this.editForm(r);
      this.uneRegion = r;
      this.action ='modifier';
    }

    getPosition(){
      this.afficheMessage(this.translate.instant('GENERAL.OBTENTION_COORDONNEES'));
      this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
        this.regionForm.controls.latitude.setValue(resp.coords.latitude);
        this.regionForm.controls.longitude.setValue(resp.coords.longitude);
        this.afficheMessage(this.translate.instant('GENERAL.COORDONNEES_OBTENUES'));
      }, err => {
        this.afficheMessage(this.translate.instant('GENERAL.ERREUR_COORDONNEES'));
          console.log(err)
      });
    }
  
    exportExcel(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('region-datatable').innerHTML], {
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
      let blob = new Blob([document.getElementById('region-datatable').innerHTML], {
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
  
  
    async supprimer(r) {
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
              this.regionsData.splice(this.regionsData.indexOf(r), 1);
              //chercher la region concernée
              var regionConcernee;
              for(let reg of this.regions){
                if('fuma:region:'+r.codePays == reg._id/*.substr(reg._id.length - 2, 2)*/){
                  regionConcernee = reg;
                  break;
                }
              }

              //mise à jour dans la région
              regionConcernee.data.splice(regionConcernee.data.indexOf(r), 1)
      
              this.servicePouchdb.updateLocalite(regionConcernee).then((res) => {
                regionConcernee._rev = res.rev;
                //mise à jour de la liste des régions
                for(let i = 0; i < this.regions.length; i++){
                  if(this.regions[i]._id == regionConcernee._id){
                    this.regions[i] = regionConcernee;
                    break;
                  }
                }
                this.action = 'liste';
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
                this.htmlTableAction = 'recharger';
                this.actualiserTableau(this.regionsData);
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
              var regionsConcernee: any = {};
              this.seletedIndexes.forEach((si) => {
                //console.log('si = '+si)
                var r = this.regionsData[si];
                //console.log('r = '+JSON.stringify(r))
                //this.regionsData.splice(this.regionsData.indexOf(r), 1);
                var exist = 0;

                if(regionsConcernee['fuma:region:'+r.codePays]){
                  regionsConcernee['fuma:region:'+r.codePays].data.splice(regionsConcernee['fuma:region:'+r.codePays].data.indexOf(r), 1);
                  exist = 1;
                }

                if(!exist){
                  for(let reg of this.regions){
                    if('fuma:region:'+r.codePays == reg._id/*.substr(r._id.length - 2, 2)*/){
                      reg.data.splice(reg.data.indexOf(r), 1);
                      regionsConcernee[reg._id] = reg
                      break;
                    }
                  }
                }
              });

              //mise à jour de regionsData
              this.seletedIndexes.forEach((si) => {
                this.regionsData.splice(this.regionsData.indexOf(this.regionsData[si]), 1);
              });

              //update
              Object.keys(regionsConcernee).forEach((key, index) => {
                this.servicePouchdb.updateLocalite(regionsConcernee[key]).then((res) => {
                  regionsConcernee[key]._rev = res.rev;
                  for(let i = 0; i < this.regions.length; i++){
                    if(this.regions[i]._id == regionsConcernee[key]._id){
                      this.regions[i] = regionsConcernee[key];
                      break;
                    }
                  }
                  if(index +1 == Object.keys(regionsConcernee).length){
                    this.action = 'liste';
                    this.htmlTableAction = 'recharger';
                    this.actualiserTableau(this.regionsData);
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
        this.actualiserTableau(this.regionsData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        this.action = "infos";
      }else{
        this.action = 'liste';
        this.actualiserTableau(this.regionsData);
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
              this.infos(this.regionsData[this.seletedIndexes[0]]);
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
              this.modifier(this.regionsData[this.seletedIndexes[0]]);
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
            this.infos(this.regionsData[this.seletedIndexes[0]]);
            this.seletedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          if(this.seletedIndexes.length == 1){
            this.modifier(this.regionsData[this.seletedIndexes[0]]);
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
  
  
    async openRelationRegion(ev: any/*, codeRegion*/) {
      const popover = await this.popoverController.create({
        component: RelationsRegionComponent,
        event: ev,
        translucent: true,
        componentProps: {"codeRegion": this.uneRegion.codeRegion},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'departement') {
          this.presentDepartment(this.uneRegion.codeRegion);
        }else if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.uneRegion.codeRegion);
        } else if(dataReturned !== null && dataReturned.data == 'village') {
          this.presentVillage(this.uneRegion.codeRegion);
        }
  
      });
      return await popover.present();
    }

    async presentDepartment(codeRegion) {
      const modal = await this.modalController.create({
        component: DepartementPage,
        componentProps: { codeRegion: codeRegion },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentCommune(codeRegion) {
      const modal = await this.modalController.create({
        component: CommunePage,
        componentProps: { codeRegion: codeRegion },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentVillage(codeRegion) {
      const modal = await this.modalController.create({
        component: VillagePage,
        componentProps: { codeRegion: codeRegion },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    existeRegion(codePays){
      for(let reg of this.regions){
        if('fuma:region:'+codePays == reg._id){
          return 1;
        }
      }

      return 0;
    }
  
    onSubmit(){
      let regionData = this.regionForm.value;
      if(this.action === 'ajouter'){
        //Si le region existe
        if(this.regions && this.existeRegion(regionData.codePays)){
          regionData = this.servicePouchdb.garderCreationTrace(regionData);
          
          var regionConcernee;
          for(let r of this.regions){
            if('fuma:region:'+regionData.codePays == r._id/*.substr(r._id.length - 2, 2)*/){
              regionConcernee = r;
              break;
            }
          }
          
          regionConcernee.data.push(regionData);
          /************************************************************ */
          //si changement code de regions, appliquer le changement aux localité
          /*if(this.uneRegion.codeRegion != regionData.codeRegion){
            //application des changements au localités
          }*/
          this.servicePouchdb.updateLocalite(regionConcernee).then((res) => {
            regionConcernee._rev = res.rev;
            for(let i = 0; i < this.regions.length; i++){
              if(this.regions[i]._id == regionConcernee._id){
                this.regions[i] = regionConcernee;
                break;
              }
            }
            this.regionsData.push(regionData);
            //this.regions._rev = res.rev;
            this.action = 'liste';
            /*if(this.mobile){
              this.regionData = this.regions.data;
            }*/
            if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
              this.htmlTableAction = 'recharger';
            }
            //this.htmlTableAction = 'recharger';
            this.actualiserTableau(this.regionsData);

            //initialiser la liste des départements
            this.creerDepartement(regionData.codeRegion);

            //libérer la mémoire occupée par la liste des pays
            this.paysData = [];
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE'+': '+err.toString()));
          });
        }else{
          //créer un nouveau region
          regionData = this.servicePouchdb.garderCreationTrace(regionData);
          
          
          let region: any = {
            _id: 'fuma:region:'+regionData.codePays,
            type: 'region',
            data: [regionData]
          };
          //this.regions = region;
          this.regionsData.push(regionData);

          this.servicePouchdb.createLocalite(region).then((res) => {
            region._rev = res.rev;
            this.regions.push(region);
            this.action = 'liste';
            if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
              this.htmlTableAction = 'recharger';
            }
            //this.htmlTableAction = 'recharger';
            this.actualiserTableau(this.regionsData);

            //initialiser la liste des départements
            this.creerDepartement(regionData.codeRegion);
            //libérer la mémoire occupée par la liste des pays
            this.paysData = [];
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE'+': '+err.toString()));
          });
        }
      }else{
        //si modification
        var paysChanger: boolean = false
        
        //virifier s'il ya eu un changement de pays pour la région
        if(this.uneRegion.codePays != regionData.codePays){
          paysChanger = true;
        }
        
        regionData = this.servicePouchdb.garderUpdateTrace(regionData);
        //mise à jour de la liste des régions
        this.regionsData[this.regionsData.indexOf(this.uneRegion)] = regionData;

        //récuper la région concernée, celle qui a été modifiée
        //les région sont classées par pays, donc il suffit de récupérer la région corespondant au code de pays de la région elle même
        var regionConcernee;
        var ancientRegionConcernee;
        if(!paysChanger){
          for(let r of this.regions){
            if('fuma:region:'+regionData.codePays == r._id/*.substr(r._id.length - 2, 2)*/){
              regionConcernee = r;
              break;
            }
          }
          //mise à jour dans la région
          regionConcernee.data[regionConcernee.data.indexOf(this.uneRegion)] = regionData;
        }else{
          //recuprer la nouvelle region du pays et ajouter la région
          for(let r of this.regions){
            if('fuma:region:'+regionData.codePays == r._id/*.substr(r._id.length - 2, 2)*/){
              regionConcernee = r;
              //ajouter la région
              regionConcernee.data.push(regionData);
              break;
            }
          }

          //recuprer l'ancienne region du pays et supprimer la région
          for(let r of this.regions){
            if('fuma:region:'+this.uneRegion.codePays == r._id/*.substr(r._id.length - 2, 2)*/){
              ancientRegionConcernee = r;
              //ajouter la région
              ancientRegionConcernee.data.splice(ancientRegionConcernee.data.indexOf(this.uneRegion), 1);
              break;
            }
          }
          
        }
      
        //this.uneRegion = regionData;
        this.servicePouchdb.updateLocalite(regionConcernee).then((res) => {
          //this.regions._rev = res.rev;
          regionConcernee._rev = res.rev;
          //mise à jour de la liste des régions
          for(let i = 0; i < this.regions.length; i++){
            if(this.regions[i]._id == regionConcernee._id){
              this.regions[i] = regionConcernee;
              break;
            }
          }

          //en cas de changement du code de région ou du nom de la région, appliquer les changement dans la subdivision
          if(this.uneRegion.codeRegion != regionData.codeRegion || this.uneRegion.nomRegion != regionData.nomRegion){
            this.changerInfoRegionDansDepartement(this.uneRegion.codeRegion, regionData);
            this.changerInfoRegionDansCommune(this.uneRegion.codeRegion, regionData);
            this.changerInfoRegionDansVillage(this.uneRegion.codeRegion, regionData);
          }

          this.action = 'infos';
          this.infos(regionData);
          
          /*if(this.mobile){
            this.regionData = this.regions.data;
          }*/
          if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
            this.htmlTableAction = 'recharger';
          }
          //this.actualiserTableau(this.regions.data);
          //libérer la mémoire occupée par la liste des pays
          this.paysData = [];

          //si changement de pays, mettre ajouter l'ancienne region du pays
          if(paysChanger){
            this.servicePouchdb.updateLocalite(ancientRegionConcernee).then((res) => {
              //this.regions._rev = res.rev;
              ancientRegionConcernee._rev = res.rev;
              //mise à jour de la liste des régions
              for(let i = 0; i < this.regions.length; i++){
                if(this.regions[i]._id == ancientRegionConcernee._id){
                  this.regions[i] = ancientRegionConcernee;
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

    creerDepartement(codeRegion){
      //initialise les régions du pays
      let region: any = {
        _id: 'fuma:departement:'+codeRegion,
        type: 'departement',
        data: []
      };
      this.servicePouchdb.createLocalite(region);
    }
  
    changerInfoRegionDansDepartement(ancienCodeRegion, infoRegion){
      this.servicePouchdb.getLocalDocById('fuma:departement:'+ancienCodeRegion).then((departement) => {
        if(departement){
          var oldDepartement = {...departement}
          departement.data.forEach((d, index) => {
            if(ancienCodeRegion != infoRegion.codeRegion){
              d.codePays = infoRegion.codePays;
              d.nomPays = infoRegion.nomPays;
              d.codeRegion = infoRegion.codeRegion;
              d.codeDepartement = infoRegion.codeRegion + d.numeroDepartement;
            }
            d.nomRegion = infoRegion.nomRegion;
            d = this.servicePouchdb.garderCreationTrace(d);
          });
  
  
          //encas de changement de code
          if(ancienCodeRegion != infoRegion.codeRegion){
            //créer un nouveau document
            delete departement['_rev'];
            departement._id = 'fuma:departement:'+infoRegion.codeRegion;
            this.servicePouchdb.createLocalite(departement);
            this.servicePouchdb.deleteLocaliteDefinitivement(oldDepartement);
          }else{
            //changement de nom
            this.servicePouchdb.updateLocalite(departement);
          }
        }
      });
    }

    changerInfoRegionDansCommune(ancienCodeRegion, infoRegion){
      this.servicePouchdb.getLocalitePlageDocs('fuma:commune:'+ancienCodeRegion, 'fuma:commune:'+ancienCodeRegion+'\uffff').then((communes) => {
        if(communes){
          communes.forEach((commune) => {
            var oldCommune = {...commune}
            commune.data.forEach((c, index) => {
              if(ancienCodeRegion != infoRegion.codeRegion){
                c.codeRegion = infoRegion.codeRegion;
                c.codeDepartement = c.codeRegion + c.codeDepartement.substr(5,2);
                c.codeCommune = c.codeDepartement + c.numeroCommune;
              }
              c.nomRegion = infoRegion.nomRegion;
              c = this.servicePouchdb.garderCreationTrace(c);
            });

            //encas de changement de code
            if(ancienCodeRegion != infoRegion.codeRegion){
              //créer un nouveau document
              delete commune['_rev'];
              commune._id = 'fuma:commune:'+infoRegion.codeRegion + commune._id.substr(commune._id.indexOf('-') + 3, 2);
              this.servicePouchdb.createLocalite(commune);
              this.servicePouchdb.deleteLocaliteDefinitivement(oldCommune);
            }else{
              //changement de nom
              this.servicePouchdb.updateLocalite(commune);
            }
          });
          
        }
      });
    }
  
    
    changerInfoRegionDansVillage(ancienCodeRegion, infoRegion){
      this.servicePouchdb.getLocalitePlageDocs('fuma:village:'+ancienCodeRegion, 'fuma:village:'+ancienCodeRegion+'\uffff').then((villages) => {
        if(villages){
          villages.forEach((village) => {
            var oldVillage = {...village}
            village.data.forEach((v, index) => {
              if(ancienCodeRegion != infoRegion.codeRegion){
                v.codeRegion = infoRegion.codeRegion;
                v.codeDepartement = v.codeRegion + v.codeDepartement.substr(5,2);
                v.codeCommune = v.codeDepartement + v.codeCommune.substr(7,2);
                v.codeVillage = v.codeCommune + v.numeroVillage;
              }
              v.nomRegion = infoRegion.nomRegion;
              v = this.servicePouchdb.garderCreationTrace(v);
            });

            //encas de changement de code
            if(ancienCodeRegion != infoRegion.codeRegion){
              //créer un nouveau document
              delete village['_rev'];
              village._id = 'fuma:village:'+infoRegion.codeRegion + village._id.substr(village._id.indexOf('-') + 3, 4);
              this.servicePouchdb.createLocalite(village);
              this.servicePouchdb.deleteLocaliteDefinitivement(oldVillage);
            }else{
              //changement de nom
              this.servicePouchdb.updateLocalite(village);
            }
          });
          
        }
      });
    }
  
    actualiserTableau(data){
      if(this.codePays && this.codePays != ''){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#region-pays').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.regionHTMLTable = JSONToTHMLTable(data, "region-pays", null, this.mobile);
              }else{
                this.regionHTMLTable = JSONToTHMLTable(data, "region-pays", global.dataTable_fr, this.mobile)
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.regionHTMLTable = reCreateTHMLTable(this.regionHTMLTable.table, "region-pays", null, this.mobile);
              }else{
                this.regionHTMLTable = reCreateTHMLTable(this.regionHTMLTable.table, "region-pays", global.dataTable_fr, this.mobile);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.regionHTMLTable.datatable);
          });
        }
      }else{
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#region').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.regionHTMLTable = JSONToTHMLTable(data, "region", null, this.mobile);
              }else{
                this.regionHTMLTable = JSONToTHMLTable(data, "region", global.dataTable_fr, this.mobile)
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.regionHTMLTable = reCreateTHMLTable(this.regionHTMLTable.table, "region", null, this.mobile);
              }else{
                this.regionHTMLTable = reCreateTHMLTable(this.regionHTMLTable.table, "region", global.dataTable_fr, this.mobile);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.regionHTMLTable.datatable);
          });
        }
      }
      
    }
  
    doRefresh(event) {
      //this.servicePouchdb.getLocalDocById('fuma:region').then((region)
      if(this.codePays && this.codePays != ''){       
        this.servicePouchdb.getLocalDocById('fuma:region:'+this.codePays).then((region) => {
          if(region){
            this.regions = [];
            this.regionsData = [];
            this.regions.push({...region});
            /*var datas = [];
            for(let r of regions){
              datas = datas.concat(r.data);
            }*/
            this.regionsData = [...region.data];

            //si non mobile ou mobile + mode tableau et 
            if(this.regionsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#region-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.regionHTMLTable = JSONToTHMLTable(this.regionsData, "region-pays", null, this.mobile);
                }else{
                  this.regionHTMLTable = JSONToTHMLTable(this.regionsData, "region-pays", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.regionHTMLTable.datatable);
              });
            }
            event.target.complete();
          }else{
            this.regions = [];
            if(this.mobile){
              this.regionsData = [];
            }
            event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces au region ==> '+err)
          this.regions = [];
          if(this.mobile){
            this.regionsData = [];
          }
          event.target.complete();
        });
    
      }else{
        this.servicePouchdb.getLocalitePlageDocs('fuma:region:', 'fuma:region:\uffff').then((regions) => {
          if(regions){
            this.regions = [...regions];
            var datas = [];
            for(let r of regions){
              datas = datas.concat(r.data);
            }
            this.regionsData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.regionsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#region').ready(()=>{
                if(global.langue == 'en'){
                  this.regionHTMLTable = JSONToTHMLTable(this.regionsData, "region", null, this.mobile);
                }else{
                  this.regionHTMLTable = JSONToTHMLTable(this.regionsData, "region", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.regionHTMLTable.datatable);
              });
            }
            event.target.complete();
          }else{
            this.regions = [];
            if(this.mobile){
              this.regionsData = [];
            }
            event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces au region ==> '+err)
          this.regions = [];
          if(this.mobile){
            this.regionsData = [];
          }
          event.target.complete();
        });
    
      }
      /*setTimeout(() => {
        event.target.complete();
      }, 2000);*/
    }
  
    getRegion(){
      if(this.codePays && this.codePays != ''){ 
        this.servicePouchdb.getLocalDocById('fuma:region:'+this.codePays).then((region) => {
          if(region){
            if(this.codeRegion && this.codeRegion != ''){
              for(let r of region.data){
                if(r.codeRegion == this.codeRegion){
                  this.uneRegion = r;
                  this.infos(r);
                  break;
                }
              }
            }else{
              this.regions = [];
              this.regionsData = [];
              this.regions.push({...region});//clone de l'objet region
              this.regionsData = [...region.data]; //clone du tableau

              //si non mobile ou mobile + mode tableau et 
              if(this.regionsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
                $('#region-pays').ready(()=>{
                  if(global.langue == 'en'){
                    this.regionHTMLTable = JSONToTHMLTable(this.regionsData, "region-pays", null, this.mobile);
                  }else{
                    this.regionHTMLTable = JSONToTHMLTable(this.regionsData, "region-pays", global.dataTable_fr, this.mobile);
                  }
                  this.attacheEventToDataTable(this.regionHTMLTable.datatable);
                });
              }
            }
          }
        }).catch((err) => {
          this.regions = [];
          this.regionsData = [];
          console.log(err)
        });
      }else{  
        this.servicePouchdb.getLocalitePlageDocs('fuma:region:', 'fuma:region:\uffff').then((regions) => {
          if(regions){
            this.regions = [...regions];
            var datas = [];
            for(let r of regions){
              datas = datas.concat(r.data);
            }
            this.regionsData = [...datas];

            //si non mobile ou mobile + mode tableau et 
            if(this.regionsData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#region').ready(()=>{
                if(global.langue == 'en'){
                  this.regionHTMLTable = JSONToTHMLTable(this.regionsData, "region", null, this.mobile);
                }else{
                  this.regionHTMLTable = JSONToTHMLTable(this.regionsData, "region", global.dataTable_fr, this.mobile);
                }
                this.attacheEventToDataTable(this.regionHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.regions = [];
          this.regionsData = [];
          console.log(err)
        });;
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

    setNomPays(codePays){
      if(codePays && codePays != ''){
        for(let p of this.paysData){
          if(codePays == p.codePays){
            this.regionForm.controls.nomPays.setValue(p.nomPays);
            this.regionForm.controls.numeroRegion.setValue('');
            this.regionForm.controls.codeRegion.setValue('');
            //créer le code de la region
            /*if(this.regionForm.controls.numeroRegion.value && this.regionForm.controls.numeroRegion.value != ''){
              this.regionForm.controls.codeRegion.setValue(codePays + '-' + this.regionForm.controls.numeroRegion.value);
            }*/
            break;
          }
        }
      }
    }
  
    setCodeEtNomPays(paysData){
      this.regionForm.controls.codePays.setValue(paysData.codePays);
      this.regionForm.controls.nomPays.setValue(paysData.nomPays);
    }

    setCodeRegion(numeroRegion){
      if(numeroRegion && numeroRegion != ''){
        this.regionForm.controls.codeRegion.setValue(this.regionForm.controls.codePays.value + '-' + numeroRegion);
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
      //code region
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeRegion[0].message = res;
      });

      //numéro région
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numeroRegion[0].message = res;
      });
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.MINLENGTH').subscribe((res: string) => {
        this.messages_validation.numeroRegion[1].message = res;
      });
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.MAXLENGTH').subscribe((res: string) => {
        this.messages_validation.numeroRegion[2].message = res;
      });
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.PATTERN').subscribe((res: string) => {
        this.messages_validation.numeroRegion[3].message = res;
      });
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.VALIDNUMEROREGION').subscribe((res: string) => {
        this.messages_validation.numeroRegion[4].message = res;
      });

      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.UNIQUENUMEROREGION').subscribe((res: string) => {
        this.messages_validation.numeroRegion[5].message = res;
      });
  
      //nom region
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NOMREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomRegion[0].message = res;
      });

      //code pays
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codePays[0].message = res;
      });

      //nom pays
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NOMPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nomPays[0].message = res;
      });

       //nom pays
       this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.PAYSLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.paysLoading[0].message = res;
      });
    }
  
    filterItems(event) {
      const val = event.target.value.toLowerCase();
      return this.regionsData.filter(item => {
        return item.codeRegion.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    }
  
    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter pour data
      //if(val && val.trim() != '' && val.trim().length > 1){
        this.regionsData = this.regions.data.filter((item) => {
          return item.codeRegion.toLowerCase().indexOf(val) !== -1 || item.nomRegion.toLowerCase().indexOf(val) !== -1 || item.referenceOpenStreetMap.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.regionData = temp;
      
    }
  
    
    ionViewDidEnter(){ 

    }
  

}
