import { Component, OnInit, Input  } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NumeroPartenaireValidator } from '../../validators/partenaire.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsPartenaireComponent } from '../../component/relations-partenaire/relations-partenaire.component';
import { global } from '../../../app/globale/variable';
import { PaysPage } from '../../localite/pays/pays.page';
import { RegionPage } from '../../localite/region/region.page';
import { DepartementPage } from '../../localite/departement/departement.page';
import { CommunePage } from '../../localite/commune/commune.page';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { VillagePage } from 'src/app/localite/village/village.page';
 
//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToTHMLTable: any;
declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;
declare var Formio;

@Component({
  selector: 'app-partenaire',
  templateUrl: './partenaire.page.html',
  styleUrls: ['./partenaire.page.scss'],
})
export class PartenairePage implements OnInit {
  @Input() codePartenaire: string;

  partenaireForm: FormGroup;
  action: string = 'liste';
  partenaires: any = [];
  partenairesData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  communeData: any = [];
  villageData: any = [];
  typesPartenaire = ['Fédération', 'ONG', 'Projet', 'Administration', 'Hôpital', 'Gouvernement'];
  secteurs = ['Privé', 'Etat', 'Sémi-privé'];
  domaines = ['Agronamie', 'Santé', 'Environement', 'Gouvernement'];
  unPartenaire: any;
  unPartenaireDoc: any;
  partenaireHTMLTable: any;
  htmlTableAction: string;
  seletedIndexes: any = [];
  mobile = global.mobile;
  styleAffichage: string = "liste";
  allSelected: boolean = false;
  recherchePlus: boolean = false;
  filterAjouter: boolean = false;
  filterInitialiser: boolean = false;

  messages_validation = {
    'numero': [
      { type: 'required', message: '' },
      { type: 'uniqueNumeroPartenaire', message: '' }
    ],
    'nom': [
      { type: 'required', message: '' }
    ],
    'code': [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' },
      { type: 'maxlength', message: '' },
      { type: 'pattern', message: '' }
    ],
    'type': [
      { type: 'required', message: '' }
    ],
    'domaine': [
      { type: 'required', message: '' }
    ],
    'secteur': [
      { type: 'required', message: '' }
    ],

    'codePays': [
      { type: 'required', message: '' }
    ],
    'codeRegion': [
      { type: 'required', message: '' }
    ]
   
  }

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la partenaire est en mode modal, on chercher info region
      this.translateLangue();
      this.getPartenaire();
    }
  
    changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.actualiserTableau(this.partenairesData);
      }else {
        this.styleAffichage = 'liste';
        this.seletedIndexes = [];
      }
    }
  
    initForm(){
      //this.partenaireForm = null;
      this.partenaireForm = this.formBuilder.group({
        nom: ['', Validators.required],
        numero: [''],
        code: ['', Validators.compose([Validators.maxLength(3), Validators.minLength(2), Validators.pattern('^[A-Z]+$'), Validators.required])],
        type: ['', Validators.required],
        secteur: ['', Validators.required],
        domaine: ['', Validators.required],
        dateCreation: [''],  
              
        codePays: ['', Validators.required],
        nomPays: ['', Validators.required],
        codeRegion: ['', Validators.required],
        nomRegion: ['', Validators.required],
        codeDepartement: [''],
        nomDepartement: [''],
        codeCommune: [''],
        nomCommune: [''],
        codeVillage: [''],
        nomVillage: [''],

        latitude: [''],
        longitude: [''],
      });

      this.partenaireForm.valueChanges.subscribe(change => {
        this.partenaireForm.get('numero').setValidators([NumeroPartenaireValidator.uniqueNumeroPartenaire(this.partenairesData, 'ajouter'), Validators.required]);
      });
    }
  
    editForm(partenaire){
      //this.partenaireForm = null;
      let p = partenaire.data
      this.partenaireForm = this.formBuilder.group({
        nom: [p.nom, Validators.required],
        numero: [p.numero],
        code: [p.code, Validators.compose([Validators.maxLength(3), Validators.minLength(2), Validators.pattern('^[A-Z]+$'), Validators.required])],
        type: [p.type, Validators.required],
        secteur: [p.secteur, Validators.required],
        domaine: [p.domaine, Validators.required], 
        dateCreation: [p.dateCreation],  

        codePays: [p.codePays, Validators.required],
        nomPays: [p.nomPays, Validators.required],
        codeRegion: [p.codeRegion, Validators.required],
        nomRegion: [p.nomRegion, Validators.required],
        codeDepartement: [p.codeDepartement],
        nomDepartement: [p.nomDepartement],
        codeCommune: [p.codeCommune],
        nomCommune: [p.nomCommune],
        codeVillage: [p.codeVillage],
        nomVillage: [p.nomVillage],
        
        latitude: [p.latitude],
        longitude: [p.latitude],
        
      });

      this.partenaireForm.valueChanges.subscribe(change => {
        this.partenaireForm.get('numero').setValidators([NumeroPartenaireValidator.uniqueNumeroPartenaire(this.partenairesData, 'ajouter'), Validators.required]);
      });

    }
  
    ajouter(){
      this.getPays();
      this.initForm();
      this.action = 'ajouter';
    }
  
    infos(p){
      this.unPartenaire = p;
      this.action = 'infos';
    }

  
    modifier(partenaire){
      this.servicePouchdb.getLocalDocById('fuma:partenaire:'+partenaire.numero).then((pDoc) => {
        if(pDoc){
          this.getPays();
          this.getRegionParPays(partenaire.codePays);
          this.getDepartementParRegion(partenaire.codeRegion);
          this.getCommuneParDepartement(partenaire.codeDepartement);
          this.editForm(pDoc);
          this.unPartenaireDoc = pDoc;
          this.unPartenaire = partenaire;
          this.action ='modifier';
        }
      }).catch((err) => {
        alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
      })
      
    }

    getPosition(){
      this.afficheMessage(this.translate.instant('GENERAL.OBTENTION_COORDONNEES'));
      this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
        this.partenaireForm.controls.latitude.setValue(resp.coords.latitude);
        this.partenaireForm.controls.longitude.setValue(resp.coords.longitude);
        this.afficheMessage(this.translate.instant('GENERAL.COORDONNEES_OBTENUES'));
      }, err => {
        this.afficheMessage(this.translate.instant('GENERAL.ERREUR_COORDONNEES'));
          console.log(err)
      });
    }
  
    exportExcel(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('partenaire-datatable').innerHTML], {
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
      let blob = new Blob([document.getElementById('partenaire-datatable').innerHTML], {
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
  
  
    async supprimer(p) {
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
        message: this.translate.instant('GENERAL.ALERT_MESSAGE'),
        //cssClass: 'aler-confirm',
        mode: 'ios',
        inputs: [
        {
          name: 'checkbox',
          type: 'checkbox',
          label: this.translate.instant('GENERAL.ALERT_SUPPRIMER_DIFINITIVEMENT'),
          value: 'oui',
          checked: false
        }
      ],
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
              if(data.toString() != 'oui'){

                this.servicePouchdb.getLocalDocById('fuma:partenaire:'+p.numero).then((partenaire) => {
                  partenaire.security = this.servicePouchdb.garderDeleteTrace(partenaire.security);

                  this.servicePouchdb.updateDoc(partenaire).then((res) => {
                    //mise à jour de la liste si mobile et mode liste
                    if(this.partenairesData.indexOf(p) !== -1){
                      this.partenairesData.splice(this.partenairesData.indexOf(p), 1);
                    }else{
                      console.log('echec splice, index inexistant')
                    }

                    this.action = 'liste';

                    if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                      //sinion dans le tableau
                      this.dataTableRemoveRows();
                    }
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }else{

                this.servicePouchdb.getLocalDocById('fuma:partenaire:'+p.numero).then((partenaire) => {
                 this.servicePouchdb.deleteDocDefinitivement(partenaire).then((res) => {

                  //mise à jour de la liste si mobile et mode liste
                  if(this.partenairesData.indexOf(p) !== -1){
                  this.partenairesData.splice(this.partenairesData.indexOf(p), 1);
                  }else{
                    console.log('echec splice, index inexistant')
                  }

                  this.action = 'liste';
                  if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                    //sinion dans le tableau
                    this.dataTableRemoveRows();
                  }
                 }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin delete

                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }
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

    async presentVillage(codeVillage) {
      const modal = await this.modalController.create({
        component: VillagePage,
        componentProps: { codeVillage: codeVillage },
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
        inputs: [
          {
            name: 'checkbox',
            type: 'checkbox',
            label: this.translate.instant('GENERAL.ALERT_SUPPRIMER_DIFINITIVEMENT'),
            value: 'oui',
            checked: false
          }
        ],
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
              if(data.toString() != 'oui'){
                for(let i of this.seletedIndexes){
                  var p = this.partenairesData[i];
                  this.servicePouchdb.getLocalDocById('fuma:partenaire:'+p.numero).then((partenaire) => {
                    partenaire.security = this.servicePouchdb.garderDeleteTrace(partenaire.security);
                    this.servicePouchdb.updateDoc(partenaire).catch((err) => {
                      this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                    });//fin update
                    
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin get
                }
      
                //sinion dans le tableau
                this.action = 'liste';
                this.dataTableRemoveRows();
                this.partenairesData = this.removeMultipleElem(this.partenairesData, this.seletedIndexes);
                this.seletedIndexes = [];
                 

              }else{

                //suppresion multiple définitive
                for(let i of this.seletedIndexes){
                  var p = this.partenairesData[i];
                  
                  this.servicePouchdb.getLocalDocById('fuma:partenaire:'+p.numero).then((partenaire) => {
                    this.servicePouchdb.deleteDocDefinitivement(partenaire).catch((err) => {
                      this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                    });//fin delete
                    
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin get
 
                }

                this.action = 'liste';
                this.dataTableRemoveRows();
                this.partenairesData = this.removeMultipleElem(this.partenairesData, this.seletedIndexes);
                this.seletedIndexes = [];
              }
              
            }
          }
        ]
      });
  
      await alert.present();
    }

    removeMultipleElem(data, indexes){
      let codes = [];
      if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
        indexes.forEach((i) => {
          codes.push(data[i].numero);
        });
      }else{
        codes = indexes;
      }
      

      for(let i = 0; i < data.length; i++){
        if(codes.length == 0){
          break;
        }
        if(codes.indexOf(data[i].numero) !== -1){
          codes.splice(codes.indexOf(data[i].numero), 1);
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
      if(this.action === 'modifier'){
        this.action = "infos";
      }else{
        this.action = 'liste';
        //this.actualiserTableau(this.partenairesData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        this.action = "infos";
      }else{
        this.action = 'liste';
        ///this.actualiserTableau(this.partenairesData);
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
              this.infos(this.partenairesData[this.seletedIndexes[0]]);
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
              this.modifier(this.partenairesData[this.seletedIndexes[0]]);
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
            this.infos(this.partenairesData[this.seletedIndexes[0]]);
            this.seletedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.seletedIndexes.length == 1){
            this.modifier(this.partenairesData[this.seletedIndexes[0]]);
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
        this.infos(this.partenairesData[this.seletedIndexes[0]]);
        //this.seletedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      }
    }
  
    selectedItemModifier(){
      if(this.seletedIndexes.length == 1){
        this.modifier(this.partenairesData[this.seletedIndexes[0]]);
        //this.seletedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      }
    }
  
  
    async openRelationPartenaire(ev: any/*, codePartenaire*/) {
      const popover = await this.popoverController.create({
        component: RelationsPartenaireComponent,
        event: ev,
        translucent: true,
        componentProps: {"codePartenaire": this.unPartenaire.codePartenaire},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      /*popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'partenaire') {
          this.navCtrl.navigateForward('/localite/partenaires/partenaire/'+this.unPartenaire.codePartenaire)
        }else if(dataReturned !== null && dataReturned.data == 'partenaire') {
          
        }else if(dataReturned !== null && dataReturned.data == 'partenaire') {
          
        } else if(dataReturned !== null && dataReturned.data == 'partenaire') {
          
        }
  
      });*/
      return await popover.present();
    }

    async openRelationPartenaireDepuisListe(ev: any/*, codePays*/) {
      const popover = await this.popoverController.create({
        component: RelationsPartenaireComponent,
        event: ev,
        translucent: true,
        componentProps: {"codePartenaire": this.partenairesData[this.seletedIndexes[0]].codePartenaire},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      /*popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.departementsData[this.seletedIndexes[0]].codeDepartement);
        } else if(dataReturned !== null && dataReturned.data == 'partenaire') {
          this.presentPartenaire(this.departementsData[this.seletedIndexes[0]].codeDepartement) 
        }
  
      });*/
      return await popover.present();
    }
  
    existePartenaire(codeCommune){
      for(let vil of this.partenaires){
        if('fuma:partenaire:'+codeCommune == vil._id){
          return 1;
        }
      }

      return 0;
    }
  
    onSubmit(){
      let data = this.partenaireForm.value;
      let formioData = {};
      if(this.action === 'ajouter'){
        //créer un nouveau partenaire
      
        let partenaire: any = {
          _id: 'fuma:partenaire:'+data.numero,
          type: 'partenaire',
          data: data,
          //pour le customisation
          formioData: formioData,
          //pour garder les traces
          security: {
            created_at: null,
            created_by: null,
            updatet_at: null,
            updated_by: null,
            deleted: null,
            deleted_at: null,
            deleted_by: null
          }

        };

        partenaire.security = this.servicePouchdb.garderCreationTrace(partenaire.security);


        this.servicePouchdb.createDoc(partenaire).then((res) => {
          //fusionner les différend objets
          let partenaireData = {...partenaire.data, ...partenaire.formioData, ...partenaire.security};
          //this.partenaires = partenaire;
          this.partenairesData.push(partenaireData);
          partenaire._rev = res.rev;
          //this.partenaires.push(partenaire);
          this.action = 'liste';
          if(this.partenairesData.length == 1 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
            this.htmlTableAction = 'recharger';
            this.actualiserTableau(this.partenairesData);
          }else{
            this.dataTableAddRow(partenaireData)
          }
          //this.htmlTableAction = 'recharger';

          //initialiser la liste des partenaires
          //this.creerPartenaire(partenaireData.codePartenaire);
          
          //libérer la mémoire occupée par la liste des pays
          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
          this.communeData = [];
          this.villageData = [];
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
  
      }else{
        //si modification
        //Vérifier s'il ya eu un changement de numéro
        if(this.unPartenaireDoc.data.numero == data.numero){
          //pas de changement de numéro
          this.unPartenaireDoc.data = data;
          this.unPartenaireDoc.formioData = formioData;

          //this.unPartenaire = partenaireData;
          this.unPartenaireDoc.security = this.servicePouchdb.garderUpdateTrace(this.unPartenaireDoc.security);

          this.servicePouchdb.updateDoc(this.unPartenaireDoc).then((res) => {
            //this.partenaires._rev = res.rev;
            this.unPartenaireDoc._rev = res.rev;
            let partenaireData = {...this.unPartenaireDoc.data, ...this.unPartenaireDoc.formioData, ...this.unPartenaireDoc.security};

            this.action = 'infos';
            this.infos(partenaireData);

            //mise à jour de la liste si mobile et mode liste
            if(this.mobile && this.styleAffichage != 'tableau'){
              for(let i = 0; i < this.partenairesData.length; i++){
                if(this.partenairesData[i].numero == partenaireData.numero){
                  this.partenairesData[i] = partenaireData;
                  break;
                }
              }
            }else{
              //sinion dans le tableau
              this.dataTableUpdateRow(partenaireData);
            }

            this.paysData = [];
            this.regionData = [];
            this.departementData = [];
            this.communeData = [];
            this.villageData = [];
            this.unPartenaireDoc = null;

          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          });

        }else{
          //si changement du numéro
          let copieUnPartenaireDoc = {...this.unPartenaireDoc}
          this.unPartenaireDoc.data = data;
          this.unPartenaireDoc.formioData = formioData;

          //this.unPartenaire = partenaireData;
          this.unPartenaireDoc.security = this.servicePouchdb.garderUpdateTrace(this.unPartenaireDoc.security);

          this.unPartenaireDoc._id = 'fuma:partenaire:'+data.numero;
          delete this.unPartenaireDoc['_rev'];

          this.servicePouchdb.updateDoc(this.unPartenaireDoc).then((res) => {
            //this.partenaires._rev = res.rev;
            this.unPartenaireDoc._rev = res.rev;
            let partenaireData = {...this.unPartenaireDoc.data, ...this.unPartenaireDoc.formioData, ...this.unPartenaireDoc.security};

            this.action = 'infos';
            this.infos(partenaireData);

            //mise à jour de la liste si mobile et mode liste
            if(this.mobile && this.styleAffichage != 'tableau'){
              for(let i = 0; i < this.partenairesData.length; i++){
                if(this.partenairesData[i].numero == partenaireData.numero){
                  this.partenairesData[i] = partenaireData;
                  break;
                }
              }
            }else{
              //sinion dans le tableau
              this.dataTableUpdateRow(partenaireData);
            }

            this.servicePouchdb.deleteDocDefinitivement(copieUnPartenaireDoc)
            this.paysData = [];
            this.regionData = [];
            this.departementData = [];
            this.communeData = [];
            this.villageData = [];
            this.unPartenaireDoc = null;

          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          });
        }
    
      }
    }
  
  
    actualiserTableau(data){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#partenaire').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.partenaireHTMLTable = JSONToTHMLTable(data, "partenaire", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.partenaireHTMLTable = JSONToTHMLTable(data, "partenaire", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees)
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.partenaireHTMLTable = reCreateTHMLTable(this.partenaireHTMLTable.table, "partenaire", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.partenaireHTMLTable = reCreateTHMLTable(this.partenaireHTMLTable.table, "partenaire", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.partenaireHTMLTable.datatable);
          });
        }
      
    }
  
    doRefresh(event) {
      
      this.servicePouchdb.getPlageDocs('fuma:partenaire:', 'fuma:partenaire:\uffff').then((partenaires) => {
        if(partenaires){
          this.partenairesData = [];
            //var datas = [];
            for(let p of partenaires){
              //datas = datas.concat(d.data);
              this.partenairesData.push({...p.data, ...p.formioData, ...p.security});

            }

          //si non mobile ou mobile + mode tableau et 
          if(this.partenairesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
            $('#partenaire').ready(()=>{
              if(global.langue == 'en'){
                this.partenaireHTMLTable = JSONToTHMLTable(this.partenairesData, "partenaire", null, this.mobile , this.translate, global.peutExporterDonnees);
              }else{
                this.partenaireHTMLTable = JSONToTHMLTable(this.partenairesData, "partenaire", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
              }
              this.attacheEventToDataTable(this.partenaireHTMLTable.datatable);
            });
          }
          this.seletedIndexes = [];
          if(event)
            event.target.complete();
        }else{
          this.partenaires = [];
          //if(this.mobile){
            this.partenairesData = [];
          //}
          this.seletedIndexes = [];
          if(event)
            event.target.complete();
        }
      }).catch((err) => {
        console.log('Erreur acces à la partenaire ==> '+err)
        this.partenaires = [];
        //if(this.mobile){
          this.partenairesData = [];
        //}
        this.seletedIndexes = [];
        if(event)
          event.target.complete();
      });
  

      this.filterAjouter = false;
      this.filterInitialiser = false;
      this.recherchePlus = false;
      /*setTimeout(() => {
        event.target.complete();
      }, 2000);*/
    }
  
    getPartenaire(){
      //tous les departments
      if(this.codePartenaire && this.codePartenaire != ''){
        this.servicePouchdb.getLocalDocById('fuma:partenaire:'+this.codePartenaire).then((partenaire) => {
          if(partenaire){
            this.unPartenaire = partenaire;
            this.infos(partenaire); 
          }
        }).catch((err) => {
          console.log(err)
        });
      }else{
        this.servicePouchdb.getPlageDocs('fuma:partenaire:', 'fuma:partenaire:\uffff').then((partenaires) => {
          if(partenaires){
            //this.partenaires = [...partenaires];
            this.partenairesData = [];
            //var datas = [];
            for(let p of partenaires){
              //datas = datas.concat(d.data);
              this.partenairesData.push({...p.data, ...p.formioData, ...p.security});

            }

            //this.partenairesData = [...datas];
  
            //si non mobile ou mobile + mode tableau et 
            if(this.partenairesData.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
              $('#partenaire').ready(()=>{
                if(global.langue == 'en'){
                  this.partenaireHTMLTable = JSONToTHMLTable(this.partenairesData, "partenaire", null, this.mobile , this.translate, global.peutExporterDonnees);
                }else{
                  this.partenaireHTMLTable = JSONToTHMLTable(this.partenairesData, "partenaire", global.dataTable_fr, this.mobile , this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.partenaireHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.partenaires = [];
          this.partenairesData = [];
          console.log(err)
        });
      }
      
    }
  
    
  
    getPays(){
      this.paysData = [];
      this.servicePouchdb.getLocalDocById('fuma:pays').then((pays) => {
        if(pays){
          //si le code de pays est transmis, ne selection que le pays en question
          /*if(this.codePays && this.codePays != ''){
            for(let p of pays.data){
              if(p.codePays == this.codePays){
                this.paysData.push(p);
                this.setCodeEtNomPays(p);
                this.getRegionParPays(this.codePays);
                break;
              }
            }
          }else{*/
            this.paysData = pays.data;
         // }
          
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
          /*if(this.codeRegion && this.codeRegion != ''){
            for(let d of region.data){
              if(d.codeRegion == this.codeRegion){
                this.regionData.push(d);
                this.setCodeEtNomRegion(d);
                this.getDepartementParRegion(d.codeRegion);
                break;
              }
            }
          }else{*/
            this.regionData = region.data;
          //}
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
          /*if(this.codeDepartement && this.codeDepartement != ''){
            for(let d of departement.data){
              if(d.codeDepartement == this.codeDepartement){
                this.departementData.push(d);
                this.setCodeEtNomDepartement(d);
                this.getCommuneParDepartement(d.codeDepartement);
                break;
              }
            }
          }else{*/
            this.departementData = departement.data;
         // }
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
          /*if(this.codeCommune && this.codeCommune != ''){
            for(let c of commune.data){
              if(c.codeCommune == this.codeCommune){
                this.communeData.push(c);
                this.setCodeEtNomCommune(c);
                break;
              }
            }
          }else{*/
            this.communeData = commune.data;
          //}
        }       
      }).catch((e) => {
        //this.communeData = [null];
        console.log('commune erreur: '+e);
        
      });
    }

    
    getVillageParCommune(codeCommune){
      this.villageData = [];
      this.servicePouchdb.getLocalDocById('fuma:village:'+codeCommune).then((village) => {
        if(village){
            this.villageData = village.data;
          //}
        }       
      }).catch((e) => {
        console.log('commune erreur: '+e);
        
      });
    }

    setNomPays(codePays){
      if(codePays && codePays != ''){
        for(let p of this.paysData){
          if(codePays == p.codePays){
            this.partenaireForm.controls.nomPays.setValue(p.nomPays);
            this.partenaireForm.controls.codeRegion.setValue('');
            this.partenaireForm.controls.nomRegion.setValue('');

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
            this.partenaireForm.controls.nomRegion.setValue(r.nomRegion);
            this.partenaireForm.controls.codeDepartement.setValue('');
            this.partenaireForm.controls.nomDepartement.setValue('');

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
            this.partenaireForm.controls.nomDepartement.setValue(d.nomDepartement);
            this.partenaireForm.controls.codeCommune.setValue('');
            this.partenaireForm.controls.nomCommune.setValue('');
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
            this.partenaireForm.controls.nomCommune.setValue(c.nomCommune);
            this.partenaireForm.controls.codeVillage.setValue('');
            this.partenaireForm.controls.nomVillage.setValue('');
            this.getVillageParCommune(codeCommune)
            break;
          }
        }
      }
    }

    setNomVillage(codeVillage){
      if(codeVillage && codeVillage != ''){
        for(let v of this.villageData){
          if(codeVillage == v.codeVillage){
            this.partenaireForm.controls.nomVillage.setValue(v.nomVillage);
            break;
          }
        }
      }
    }
  
    setCodeEtNomPays(paysData){
      this.partenaireForm.controls.codePays.setValue(paysData.codePays);
      this.partenaireForm.controls.nomPays.setValue(paysData.nomPays);
    }

    setCodeEtNomRegion(regionData){
      this.partenaireForm.controls.codeRegion.setValue(regionData.codeRegion);
      this.partenaireForm.controls.nomRegion.setValue(regionData.nomRegion);
    }

    setCodeEtNomDepartement(departementData){
      this.partenaireForm.controls.codeDepartement.setValue(departementData.codeDepartement);
      this.partenaireForm.controls.nomDepartement.setValue(departementData.nomDepartement);
    }

    setCodeEtNomCommune(communeData){
      this.partenaireForm.controls.codeCommune.setValue(communeData.codeCommune);
      this.partenaireForm.controls.nomCommune.setValue(communeData.nomCommune);
    }

    setCodeEtNomVillage(villageData){
      this.partenaireForm.controls.codeVillage.setValue(villageData.codeVillage);
      this.partenaireForm.controls.nomVillage.setValue(villageData.nomVillage);
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
      /*var id = '';
      if(this.codePays && this.codePays != ''){
        id = 'partenaire-pays-datatable';
      }else{ 
        id = 'partenaire-datatable';
      }


      $('#'+id+' thead tr:eq(0) th:eq(0)').html(this.translate.instant('PAYS_PAGE.CODEPAYS'));
      //$('#'+id+' thead tr:eq(0) th:eq(0)').attr({'title': this.translate.instant('PAYS_PAGE.CODEPAYS')});
      $('#'+id+' thead tr:eq(0) th:eq(1)').html(this.translate.instant('PAYS_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(2)').html(this.translate.instant('REGION_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(3)').html(this.translate.instant('REGION_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(4)').html(this.translate.instant('DEPARTEMENT_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(5)').html(this.translate.instant('DEPARTEMENT_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(6)').html(this.translate.instant('COMMUNE_PAGE.CODE'));    
      $('#'+id+' thead tr:eq(0) th:eq(7)').html(this.translate.instant('COMMUNE_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(8)').html(this.translate.instant('PARTENAIRE_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(9)').html(this.translate.instant('PARTENAIRE_PAGE.NUMERO'));
      $('#'+id+' thead tr:eq(0) th:eq(10)').html(this.translate.instant('PARTENAIRE_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(11)').html(this.translate.instant('PARTENAIRE_PAGE.TYPE'));
      $('#'+id+' thead tr:eq(0) th:eq(12)').html(this.translate.instant('PARTENAIRE_PAGE.AUTRETYPE'));
      $('#'+id+' thead tr:eq(0) th:eq(13)').html(this.translate.instant('GENERAL.LATITUDE'));
      $('#'+id+' thead tr:eq(0) th:eq(14)').html(this.translate.instant('GENERAL.LONGITUDE'));
      */
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }

  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //code partenaire
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.code[0].message = res;
      });

      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODE.MINLENGTH').subscribe((res: string) => {
        this.messages_validation.code[1].message = res;
      });

      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODE.MAXLENGTH').subscribe((res: string) => {
        this.messages_validation.code[2].message = res;
      });

      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODE.PATTERN').subscribe((res: string) => {
        this.messages_validation.code[3].message = res;
      });

      //numéro partenaire
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.NUMERO.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numero[0].message = res;
      });
      
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.NUMERO.UNIQUENUMEROPARTENAIRE').subscribe((res: string) => {
        this.messages_validation.numero[1].message = res;
      });
  
      //nom partenaire
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.NOM.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });

       //type partenaire
       this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.TYPE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.type[0].message = res;
      });

       //autre type secteur
       this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.SECTEUR.REQUIRED').subscribe((res: string) => {
        this.messages_validation.secteur[0].message = res;
      });

      //autre type domaine
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.DOMAINE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.domaine[0].message = res;
      });

      //code pays
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codePays[0].message = res;
      });


      //code région
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.codeRegion[0].message = res;
      });
    }
  
    
    dataTableAddRow(rowData){
      let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });
  
      this.partenaireHTMLTable.datatable.row.add(data).draw();
    }
  
    dataTableUpdateRow(/*index, */rowData){
      let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });
  
      this.partenaireHTMLTable.datatable.row('.selected').data(data).draw();
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      this.partenaireHTMLTable.datatable.rows('.selected').remove().draw();
    }
  
    
  dataTableSelectAll(){
    this.seletedIndexes = [];
    this.partenaireHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.partenaireHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.seletedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.partenaireHTMLTable.datatable.rows().deselect();
    this.seletedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    var id = 'partenaire-datatable';

    $('#'+id+' thead tr:eq(1)').show();
    this.recherchePlus = true;
  }

  dataTableRemoveRechercheParColonne(){
    var id = 'partenaire-datatable';

    $('#'+id+' thead tr:eq(1)').hide();
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'partenaire-datatable';

    if(!this.filterAjouter && !this.filterInitialiser){
      var i = -1;
      var self = this;
      $('#'+id+' tfoot').show();
      this.partenaireHTMLTable.datatable.columns().every( function () {
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
                  
                  var info = self.partenaireHTMLTable.datatable.page.info();
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

      this.partenaireHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
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
    var id = 'partenaire-datatable';

    $('#'+id+' tfoot').hide();
    this.filterAjouter = false;
  }


    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        this.partenairesData = this.partenaires.data.filter((item) => {
          return item.codePartenaire.toLowerCase().indexOf(val) !== -1 || item.nomPartenaire.toLowerCase().indexOf(val) !== -1 || item.referenceOpenStreetMap.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.partenaireData = temp;
      
    }
    
    async close(){
      await this.modalController.dismiss();
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
