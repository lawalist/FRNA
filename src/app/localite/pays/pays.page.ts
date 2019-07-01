import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { CodePaysValidator } from '../../validators/pays.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RegionPage } from '../../localite/region/region.page';
import { RelationsPaysComponent } from '../../component/relations-pays/relations-pays.component';
import { global } from '../../../app/globale/variable';
import { DepartementPage } from '../departement/departement.page';
import { CommunePage } from '../commune/commune.page';
import { VillagePage } from '../village/village.page';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { ListOptionsComponent } from 'src/app/component/list-options/list-options.component';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToTHMLTable: any;
declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;
//declare var TableManageButtons: any;

@Component({
  selector: 'app-pays',
  templateUrl: './pays.page.html',
  styleUrls: ['./pays.page.scss'],
})
export class PaysPage implements OnInit {

  @Input() codePays: any;
  paysForm: any;
  action: string = 'liste';
  pays: any;
  paysData: any = [];
  unPays: any;
  paysHTMLTable: any;
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
    'codePays': [
        { type: 'required', message: '' },
        { type: 'minlength', message: '' },
        { type: 'maxlength', message: '' },
        { type: 'pattern', message: '' },
        { type: 'validCodePays', message: '' }
      ],
      'nomPays': [
        { type: 'required', message: '' }
      ],
    }
  constructor(private formBuilder: FormBuilder, public modalController: ModalController, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
    this.translate.setDefaultLang(global.langue);
   }

  ngOnInit() {
    this.translateLangue();
    this.getPays();
    //this.initForm();
  }

  changeStyle(){
    if(this.styleAffichage == 'liste'){
      this.styleAffichage = 'tableau';
      this.htmlTableAction = 'recharger';
      this.estModeCocherElemListe = false;
      this.actualiserTableau(this.pays.data);
    }else {
      this.styleAffichage = 'liste';
      this.seletedIndexes = [];
      this.estModeCocherElemListe = false;
    }
  }

  cocherElemListe(codePays){
    if(this.seletedIndexes.indexOf(codePays) === -1){
      //si coché
      this.seletedIndexes.push(codePays);
    }else{
      //si décocher
      this.seletedIndexes.splice(this.seletedIndexes.indexOf(codePays), 1);
    }  
    
  }

  
  removeMultipleElem(data, indexes){
    let codes = [];
    if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
      indexes.forEach((i) => {
        codes.push(data[i].codePays);
      });
    }else{
      codes = indexes;
    }
    

    for(let i = 0; i < data.length; i++){
      if(codes.length == 0){
        break;
      }
      if(codes.indexOf(data[i].codePays) !== -1){
        codes.splice(codes.indexOf(data[i].codePays), 1);
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
    this.paysData.forEach((p) => {
      //console.log(p.codePays+'   '+this.seletedIndexes.indexOf(p.codePays)+'    '+this.seletedIndexes)
      if(this.seletedIndexes.indexOf(p.codePays) === -1){
        this.seletedIndexes.push(p.codePays);
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
        "dataLength": this.paysData.length,
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
            //suppression définitive
            /*for(let p of this.paysData){
              if(this.seletedIndexes.length > 0){
                if(this.seletedIndexes.indexOf(p.codePays) !== -1){
                  this.pays.data.splice(this.pays.data.indexOf(p), 1)
                  this.seletedIndexes.splice(this.seletedIndexes.indexOf(p.codePays), 1)
                }
              }else{
                break;
              }
            }*/

            this.pays.data = this.removeMultipleElem(this.pays.data, this.seletedIndexes);
            this.servicePouchdb.updateLocalite(this.pays).then((res) => {
              this.pays._rev = res.rev;
              this.decocherTousElemListe();
              this.paysData = [...this.pays.data];
              this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
              
            }).catch((err) => {
              this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
      
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
    //this.paysForm = null;
    this.paysForm = this.formBuilder.group({
      codePays: ['', Validators.compose([CodePaysValidator.validCodePays(this.pays, 'ajouter'), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[A-Z]+$'), Validators.required])],
      nomPays: ['', Validators.required],
      referenceOpenStreetMap: [''],
      created_at: [''],
      created_by: [''],
      updatet_at: [''],
      updated_by: [''],
      deleted: [''],
      deleted_at: [''],
      deleted_by: ['']
    });
  }

  editForm(p){
    //this.paysForm = null;
    this.paysForm = this.formBuilder.group({
      codePays: [p.codePays, Validators.compose([CodePaysValidator.validCodePays(this.pays, 'modifier'), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[A-Z]+$'), Validators.required])],
      nomPays: [p.nomPays, Validators.required],
      referenceOpenStreetMap: [p.referenceOpenStreetMap],
      created_at: [p.created_at],
      created_by: [p.created_by],
      updatet_at: [p.updatet_at],
      updated_by: [p.updated_by],
      deleted: [p.deleted],
      deleted_at: [p.deleted_at],
      deleted_by: [p.deleted_by]
    });
  }

  ajouter(){
    this.initForm();
    this.action = 'ajouter';
  }

  infos(p){
    if(!this.estModeCocherElemListe){
      this.unPays = p;
      this.action = 'infos';
    }
    
  }

  modifier(p){
    this.editForm(p);
    this.unPays = p;
    this.action ='modifier';
  }

  selectItem(index){
    alert(index)
  }

  exportExcel(){
    let date =new Date().getTime();
    let blob = new Blob([document.getElementById('pays-datatable').innerHTML], {
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
    let blob = new Blob([document.getElementById('pays-datatable').innerHTML], {
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


  async supprimer(p) {
    const alert = await this.alertCtl.create({
      header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
      message: this.translate.instant('GENERAL.ALERT_MESSAGE'),
      //cssClass: 'aler-confirm',
      mode: 'ios',
      /*inputs: [
        {
          name: 'checkbox',
          type: 'checkbox',
          label: this.translate.instant('GENERAL.ALERT_SUPPRIMER_DIFINITIVEMENT'),
          value: 'oui',
          checked: false
        }
      ],*/
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
          handler: (/*data*/) => {
            //suppression définitive
            this.pays.data.splice(this.pays.data.indexOf(p), 1);
            this.servicePouchdb.updateLocalite(this.pays).then((res) => {
              this.pays._rev = res.rev;
              this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
              this.action = 'liste';
              if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                this.dataTableRemoveRows();
                this.seletedIndexes = [];
              }else{
                this.paysData = [...this.pays.data]
              }
              //this.htmlTableAction = 'recharger';
              //this.actualiserTableau(this.pays.data);
            }).catch((err) => {
              this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());

            });
            //suppression définitive
            /*if(data.toString() == 'oui'){
              this.pays.data.splice(this.pays.data.indexOf(p), 1)
              this.servicePouchdb.updateLocalite(this.pays).then((res) => {
                this.pays._rev = res.rev;
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
                this.action = 'liste';
                this.htmlTableAction = 'recharger';
                this.actualiserTableau(this.pays.data);
              }).catch((err) => {
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());

              });
            }else{
              this.pays.data[this.pays.data.indexOf(p)] = this.servicePouchdb.garderDeleteTrace(p);
              this.servicePouchdb.updateLocalite(this.pays).then((res) => {
                this.pays._rev = res.rev;
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_CORBEILLE'));
                this.action = 'liste';
                this.htmlTableAction = 'recharger';
                this.actualiserTableau(this.pays.data);
              }).catch((err) => {
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
              });
            }*/
          }
        }
      ]
    });

    await alert.present();
  }


  async suppressionMultiple() {
    const alert = await this.alertCtl.create({
      header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
      message: this.translate.instant('GENERAL.ALERT_MESSAGE'),
      //cssClass: 'aler-confirm',
      mode: 'ios',
      /*inputs: [
        {
          name: 'checkbox',
          type: 'checkbox',
          label: this.translate.instant('GENERAL.ALERT_SUPPRIMER_DIFINITIVEMENT'),
          value: 'oui',
          checked: false
        }
      ],*/
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
            //suppression définitive
           /* this.seletedIndexes.forEach((i) => {
              var p = this.pays.data[i];
              this.pays.data.splice(this.pays.data.indexOf(p), 1)
            });*/

            this.pays.data = this.removeMultipleElem(this.pays.data, this.seletedIndexes);
            //update
            this.servicePouchdb.updateLocalite(this.pays).then((res) => {
              this.pays._rev = res.rev;
              this.action = 'liste';
              //this.htmlTableAction = 'recharger';
              //this.actualiserTableau(this.pays.data);
              this.dataTableRemoveRows();
              this.seletedIndexes = [];
              this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
            }).catch((err) => {
              this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
              //this.seletedIndexes = [];
            });
           // this.seletedIndexes = [];
            /*if(data.toString() == 'oui'){
              this.seletedIndexes.forEach((i) => {
                var p = this.pays.data[i];
                this.pays.data.splice(this.pays.data.indexOf(p), 1)
              });

              //update
              this.servicePouchdb.updateLocalite(this.pays).then((res) => {
                this.pays._rev = res.rev;
                this.action = 'liste';
                this.htmlTableAction = 'recharger';
                this.actualiserTableau(this.pays.data);
                //this.seletedIndexes = [];
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
              }).catch((err) => {
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                //this.seletedIndexes = [];
              });
              this.seletedIndexes = [];
              
            }else{
              this.seletedIndexes.forEach((i) => {
                var p = this.pays.data[i];
                this.pays.data[this.pays.data.indexOf(p)] = this.servicePouchdb.garderDeleteTrace(p);
              });

              //update
              this.servicePouchdb.updateLocalite(this.pays).then((res) => {
                this.pays._rev = res.rev;
                this.action = 'liste';
                this.htmlTableAction = 'recharger';
                this.actualiserTableau(this.pays.data);
                //this.seletedIndexes = [];
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_CORBEILLE'));
              }).catch((err) => {
                this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                //this.seletedIndexes = [];
              });
              this.seletedIndexes = [];
              
            }*/
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
      /*if(this.htmlTableAction)
        this.actualiserTableau(this.pays.data);*/
    }
  }

  retour(){
    if(this.action === 'modifier'){
      this.action = "infos";
    }else{
      this.action = 'liste';
      /*if(this.htmlTableAction)
        this.actualiserTableau(this.pays.data);*/
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
            this.infos(this.pays.data[this.seletedIndexes[0]]);
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
            this.modifier(this.pays.data[this.seletedIndexes[0]]);
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
        this.selectedItemInfo();
        /*if(this.seletedIndexes.length == 1){
          this.infos(this.pays.data[this.seletedIndexes[0]]);
          //this.seletedIndexes = [];
        }else{
          alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
        }*/
      }else if(dataReturned !== null && dataReturned.data == 'modifier') {
        this.selectedItemModifier();
        /*if(this.seletedIndexes.length == 1){
          this.modifier(this.pays.data[this.seletedIndexes[0]]);
          //this.seletedIndexes = [];
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
      this.infos(this.pays.data[this.seletedIndexes[0]]);
      //this.seletedIndexes = [];
    }else{
      alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
    }
  }

  selectedItemModifier(){
    if(this.seletedIndexes.length == 1){
      this.modifier(this.pays.data[this.seletedIndexes[0]]);
      //this.seletedIndexes = [];
    }else{
      alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
    }
  }

  async openRelationPays(ev: any/*, codePays*/) {
    const popover = await this.popoverController.create({
      component: RelationsPaysComponent,
      event: ev,
      translucent: true,
      componentProps: {"codePays": this.unPays.codePays},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'region') {
        this.presentRegions(this.unPays.codePays);
        //this.navCtrl.navigateForward('/localite/regions/pays/'+this.unPays.codePays)
      }else if(dataReturned !== null && dataReturned.data == 'departement') {
        this.presentDepartment(this.unPays.codePays);
      }else if(dataReturned !== null && dataReturned.data == 'commune') {
        this.presentCommune(this.unPays.codePays);
      } else if(dataReturned !== null && dataReturned.data == 'village') {
        this.presentVillage(this.unPays.codePays);
      }

    });
    return await popover.present();
  }

  async openRelationPaysDepuisListe(ev: any/*, codePays*/) {
    const popover = await this.popoverController.create({
      component: RelationsPaysComponent,
      event: ev,
      translucent: true,
      componentProps: {"codePays": this.pays.data[this.seletedIndexes[0]].codePays},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'region') {
        this.presentRegions(this.pays.data[this.seletedIndexes[0]].codePays);
        //this.navCtrl.navigateForward('/localite/regions/pays/'+this.unPays.codePays)
      }else if(dataReturned !== null && dataReturned.data == 'departement') {
        this.presentDepartment(this.pays.data[this.seletedIndexes[0]].codePays);
      }else if(dataReturned !== null && dataReturned.data == 'commune') {
        this.presentCommune(this.pays.data[this.seletedIndexes[0]].codePays);
      } else if(dataReturned !== null && dataReturned.data == 'village') {
        this.presentVillage(this.pays.data[this.seletedIndexes[0]].codePays);
      }

    });
    return await popover.present();
  }

  async presentRegions(codePays) {
    const modal = await this.modalController.create({
      component: RegionPage,
      componentProps: { codePays: codePays },
      mode: 'ios',
      cssClass: 'costom-modal',
    });
    return await modal.present();
  }

  async presentDepartment(codePays) {
    const modal = await this.modalController.create({
      component: DepartementPage,
      componentProps: { codePays: codePays },
      mode: 'ios',
      cssClass: 'costom-modal',
    });
    return await modal.present();
  }

  async presentCommune(codePays) {
    const modal = await this.modalController.create({
      component: CommunePage,
      componentProps: { codePays: codePays },
      mode: 'ios',
      cssClass: 'costom-modal',
    });
    return await modal.present();
  }

  async presentVillage(codePays) {
    const modal = await this.modalController.create({
      component: VillagePage,
      componentProps: { codePays: codePays },
      mode: 'ios',
      cssClass: 'costom-modal',
    });
    return await modal.present();
  }

  onSubmit(){
    let paysData = this.paysForm.value;
    if(this.action === 'ajouter'){
      //Si le pays existe
      if(this.pays && this.pays.data){
        paysData = this.servicePouchdb.garderCreationTrace(paysData);
        this.pays.data.push(paysData);
        this.servicePouchdb.updateLocalite(this.pays).then((res) => {
          this.pays._rev = res.rev;
          this.action = 'liste';
          if(this.mobile){
            this.paysData = [...this.pays.data];
          }
          if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
            //this.htmlTableAction = 'recharger';
            //this.actualiserTableau(this.pays.data);
            this.dataTableAddRow(paysData);
          }
          //this.htmlTableAction = 'recharger';
          //this.actualiserTableau(this.pays.data);

          //initialiser la liste des régions
          //this.creerRegion(paysData.codePays);
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }else{
        //créer un nouveau pays
        paysData = this.servicePouchdb.garderCreationTrace(paysData);
        let pays = {
          _id: 'fuma:pays',
          type: 'pays',
          data: [paysData]
        };
        this.pays = pays;
        this.servicePouchdb.createLocalite(this.pays).then((res) => {
          this.pays._rev = res.rev;
          this.action = 'liste';
          if(this.mobile){
            this.paysData = [...paysData];
          }
          if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
            //this.htmlTableAction = 'recharger';
            this.htmlTableAction = 'recharger';
            this.actualiserTableau(this.pays.data);
            //this.dataTableAddRow(paysData);
          }
          //this.htmlTableAction = 'recharger';
          ////this.actualiserTableau(this.pays.data);
          
          //initialiser la liste des régions
          //this.creerRegion(paysData.codePays);
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }
    }else{
      //si modification
      paysData = this.servicePouchdb.garderUpdateTrace(paysData);
      //this.pays.data.push(paysData);
      /*for(let i = 0; i < this.pays.data.length; i++){
        if(this.pays.data[i].codePays == paysData.codePays){
          this.pays.data[i] = paysData;
          break;
        }
      }*/

      this.pays.data[this.pays.data.indexOf(this.unPays)] = paysData;
      //this.unPays = paysData;
      this.servicePouchdb.updateLocalite(this.pays).then((res) => {
        this.pays._rev = res.rev;
        //en cas de changement du code de pays ou du nom du pays, appliquer les changement dans la subdivision
        if(this.unPays.codePays != paysData.codePays || this.unPays.nomPays != paysData.nomPays){
          this.changerInfoPaysDansRegions(this.unPays.codePays, paysData);
          this.changerInfoPaysDansDepartement(this.unPays.codePays, paysData);
          this.changerInfoPaysDansCommune(this.unPays.codePays, paysData);
          this.changerInfoPaysDansVillage(this.unPays.codePays, paysData);
        }
        this.action = 'infos';
        this.infos(paysData);
        if(this.mobile){
          this.paysData = [...this.pays.data];
        }
        if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
          //this.htmlTableAction = 'recharger';
          this.dataTableUpdateRow(/*this.seletedIndexes[0], */paysData);
        }
        //this.actualiserTableau(this.pays.data);
      }).catch((err) => {
        alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
      });
    }
  }

  creerRegion(codePays){
    //initialise les régions du pays
    let region: any = {
      _id: 'fuma:region:'+codePays,
      type: 'region',
      data: []
    };
    this.servicePouchdb.createLocalite(region);
  }

  changerInfoPaysDansRegions(ancienCodePays, infoPays){
    this.servicePouchdb.getLocalDocById('fuma:region:'+ancienCodePays).then((region) => {
      if(region){
        var oldRegion = {...region}
        region.data.forEach((r, index) => {
          if(ancienCodePays != infoPays.codePays){
            r.codePays = infoPays.codePays;
            r.codeRegion = infoPays.codePays+'-'+r.numeroRegion;
          }
          r.nomPays = infoPays.nomPays;
          r = this.servicePouchdb.garderCreationTrace(r);
        });


        //encas de changement de code
        if(ancienCodePays != infoPays.codePays){
          //créer un nouveau document
          delete region['_rev'];
          region._id = 'fuma:region:'+infoPays.codePays;
          this.servicePouchdb.createLocalite(region);
          this.servicePouchdb.deleteLocaliteDefinitivement(oldRegion);
        }else{
          //changement de nom
          this.servicePouchdb.updateLocalite(region);
        }
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  changerInfoPaysDansDepartement(ancienCodePays, infoPays){
    this.servicePouchdb.getLocalitePlageDocs('fuma:departement:'+ancienCodePays+'-', 'fuma:departement:'+ancienCodePays+'-\uffff').then((departements) => {
      if(departements){
        departements.forEach((departement) => {
          var oldDepartement = {...departement}
          departement.data.forEach((d, index) => {
            if(ancienCodePays != infoPays.codePays){
              d.codePays = infoPays.codePays;
              d.codeRegion = infoPays.codePays+'-'+d.codeRegion.substr(3,2);// d.numeroRegion;
              d.codeDepartement = d.codeRegion + d.numeroDepartement;
            }
            d.nomPays = infoPays.nomPays;
            d = this.servicePouchdb.garderCreationTrace(d);
          });
  
  
          //encas de changement de code
          if(ancienCodePays != infoPays.codePays){
            //créer un nouveau document
            delete departement['_rev'];
            departement._id = 'fuma:departement:'+infoPays.codePays+'-'+departement._id.substr(departement._id.indexOf('-') + 1, 2);
            this.servicePouchdb.createLocalite(departement);
            this.servicePouchdb.deleteLocaliteDefinitivement(oldDepartement);
          }else{
            //changement de nom
            this.servicePouchdb.updateLocalite(departement);
          }
        });
        
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  
  changerInfoPaysDansCommune(ancienCodePays, infoPays){
    this.servicePouchdb.getLocalitePlageDocs('fuma:commune:'+ancienCodePays+'-', 'fuma:commune:'+ancienCodePays+'-\uffff').then((communes) => {
      if(communes){
        communes.forEach((commune) => {
          var oldCommune = {...commune}
          commune.data.forEach((c, index) => {
            if(ancienCodePays != infoPays.codePays){
              c.codePays = infoPays.codePays;
              c.codeRegion = infoPays.codePays+'-'+c.codeRegion.substr(3,2);// d.numeroRegion;
              c.codeDepartement = c.codeRegion + c.codeDepartement.substr(5,2);
              c.codeCommune = c.codeDepartement + c.numeroCommune;
            }
            c.nomPays = infoPays.nomPays;
            c = this.servicePouchdb.garderCreationTrace(c);
          });
  
  
          //encas de changement de code
          if(ancienCodePays != infoPays.codePays){
            //créer un nouveau document
            delete commune['_rev'];
            commune._id = 'fuma:commune:'+infoPays.codePays+'-'+commune._id.substr(commune._id.indexOf('-') + 1, 4);
            this.servicePouchdb.createLocalite(commune);
            this.servicePouchdb.deleteLocaliteDefinitivement(oldCommune);
          }else{
            //changement de nom
            this.servicePouchdb.updateLocalite(commune);
          }
        });
        
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  
  changerInfoPaysDansVillage(ancienCodePays, infoPays){
    this.servicePouchdb.getLocalitePlageDocs('fuma:village:'+ancienCodePays+'-', 'fuma:village:'+ancienCodePays+'-\uffff').then((villages) => {
      if(villages){
        villages.forEach((village) => {
          var oldVillage = {...village}
          village.data.forEach((v, index) => {
            if(ancienCodePays != infoPays.codePays){
              v.codePays = infoPays.codePays;
              v.codeRegion = infoPays.codePays+'-'+v.codeRegion.substr(3,2);// d.numeroRegion;
              v.codeDepartement = v.codeRegion + v.codeDepartement.substr(5,2);
              v.codeCommune = v.codeDepartement + v.codeCommune.substr(7,2);
              v.codeVillage = v.codeCommune + v.numeroVillage;
            }
            v.nomPays = infoPays.nomPays;
            v = this.servicePouchdb.garderCreationTrace(v);
          });
  
  
          //encas de changement de code
          if(ancienCodePays != infoPays.codePays){
            //créer un nouveau document
            delete village['_rev'];
            village._id = 'fuma:village:'+infoPays.codePays+'-'+village._id.substr(village._id.indexOf('-') + 1, 6);
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

  actualiserTableau(data){
    if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
      $('#pays').ready(()=>{
        if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
          //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
          if(global.langue == 'en'){
            this.paysHTMLTable = JSONToTHMLTable(data, "pays", null, this.mobile, this.translate, global.peutExporterDonnees);
          }else{
            this.paysHTMLTable = JSONToTHMLTable(data, "pays", global.dataTable_fr, this.mobile, this.translate, global.peutExporterDonnees)
          }
          
          this.htmlTableAction = null;
        }else{
          //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
          if(global.langue == 'en'){
            this.paysHTMLTable = reCreateTHMLTable(this.paysHTMLTable.table, "pays", null, this.mobile, this.translate, global.peutExporterDonnees);
          }else{
            this.paysHTMLTable = reCreateTHMLTable(this.paysHTMLTable.table, "pays", global.dataTable_fr, this.mobile, this.translate, global.peutExporterDonnees);
          }
          this.htmlTableAction = null;
        }
        
        this.seletedIndexes = [];
        this.attacheEventToDataTable(this.paysHTMLTable.datatable);
      });
    }
    
  }

  doRefresh(event) {
    this.servicePouchdb.getLocalDocById('fuma:pays').then((pays) => {
      if(pays){
        this.pays = pays;
        //si mobile crer la liste
        if(this.mobile && this.styleAffichage != 'tableau'){
          this.paysData = [...this.pays.data];
        }

        //si non mobile ou mobile + mode tableau et 
        if(this.pays.data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#pays').ready(()=>{
            if(global.langue == 'en'){
              this.paysHTMLTable = JSONToTHMLTable(this.pays.data, "pays", null, this.mobile, this.translate, global.peutExporterDonnees);
            }else{
              this.paysHTMLTable = JSONToTHMLTable(this.pays.data, "pays", global.dataTable_fr, this.mobile, this.translate, global.peutExporterDonnees);
            }
     
            this.attacheEventToDataTable(this.paysHTMLTable.datatable);
          });
        }
        this.seletedIndexes = [];
        if(event)
          event.target.complete();
      }else{
        this.pays = null;
        if(this.mobile){
          this.paysData = [];
        }
        this.seletedIndexes = [];
        if(event)
          event.target.complete();
      }
    }).catch((err) => {
      console.log('Erreur acces au pays ==> '+err)
      this.pays = null;
      if(this.mobile){
        this.paysData = [];
      }
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

  getPays(){
    this.pays = null;
    this.servicePouchdb.getLocalDocById('fuma:pays').then((pays) => {
      if(pays){
        if(this.codePays && this.codePays != ''){
          for(let p of pays.data){
            if(p.codePays == this.codePays){
              this.unPays = p;
              this.infos(p);
              break;
            }
          }
        }else{
          this.pays = pays;
          //si mobile crer la liste
          if(this.mobile && this.styleAffichage != 'tableau'){
            this.paysData = [...this.pays.data];
          }
  
          //si non mobile ou mobile + mode tableau et 
          if(this.pays.data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
            $('#pays').ready(()=>{
              if(global.langue == 'en'){
                this.paysHTMLTable = JSONToTHMLTable(this.pays.data, "pays", null, this.mobile, this.translate, global.peutExporterDonnees);
              }else{
                this.paysHTMLTable = JSONToTHMLTable(this.pays.data, "pays", global.dataTable_fr, this.mobile, this.translate, global.peutExporterDonnees);
              }
             
              this.attacheEventToDataTable(this.paysHTMLTable.datatable);
            });
          }
        }
        
      }
    });
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

  translateLangue(){
    this.translate.use(global.langue);
    this.translateMessagesValidation();
  }
  
  translateMessagesValidation(){
    //code pays
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
      this.messages_validation.codePays[0].message = res;
    });
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.MINLENGTH').subscribe((res: string) => {
      this.messages_validation.codePays[1].message = res;
    });
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.MAXLENGTH').subscribe((res: string) => {
      this.messages_validation.codePays[2].message = res;
    });
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.PATTERN').subscribe((res: string) => {
      this.messages_validation.codePays[3].message = res;
    });
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.VALIDCODEPAYS').subscribe((res: string) => {
      this.messages_validation.codePays[4].message = res;
    });

    //nom pays
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.NOMPAYS.REQUIRED').subscribe((res: string) => {
      this.messages_validation.nomPays[0].message = res;
    });
  }


  dataTableAddRow(rowData){
    let data = [];
    Object.keys(rowData).forEach((key, index) => {
      data.push(rowData[key]);
    });

    this.paysHTMLTable.datatable.row.add(data).draw();
  }

  dataTableUpdateRow(/*index, */rowData){
    let data = [];
    Object.keys(rowData).forEach((key, index) => {
      data.push(rowData[key]);
    });

    this.paysHTMLTable.datatable.row('.selected').data(data).draw();
  }

  dataTableRemoveRows(){
    //datatable.row(index).remove().draw();
    this.paysHTMLTable.datatable.rows('.selected').remove().draw();
  }

  dataTableSelectAll(){
    this.seletedIndexes = [];
    this.paysHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.paysHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.seletedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.paysHTMLTable.datatable.rows().deselect();
    this.seletedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    var id = 'pays-datatable';
    $('#'+id+' thead tr:eq(1)').show();
    this.recherchePlus = true;
  }

  dataTableRemoveRechercheParColonne(){
    var id = 'pays-datatable';
    $('#'+id+' thead tr:eq(1)').hide();
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'pays-datatable';
    if(!this.filterAjouter && !this.filterInitialiser){
      var i = -1;
      var self = this;
      $('#'+id+' tfoot').show();
      this.paysHTMLTable.datatable.columns().every( function () {
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
                  
                  var info = self.paysHTMLTable.datatable.page.info();
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

      this.paysHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
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
    var id = 'pays-datatable';
    $('#'+id+' tfoot').hide();
    this.filterAjouter = false;
  }

  removeTraceKey(paysData){
    delete paysData['created_at'];
    delete paysData['created_by'];
    delete paysData['updatet_at'];
    delete paysData['updated_by'];
    delete paysData['deleted'];
    delete paysData['deleted_at'];
    delete paysData['deleted_by'];

    return paysData
  }

  translateDataTableCollumn(){
    /*$('#pays-datatable thead tr:eq(0) th').each( function (i) {
      var title = $(this).text();
      $(this).html( title+' '+$('#pays-datatable thead tr:eq(0) th').length + ''+i );
    } );*/

    $('#pays-datatable thead tr:eq(0) th:eq(0)').html(this.translate.instant('PAYS_PAGE.CODEPAYS'));
    $('#pays-datatable thead tr:eq(0) th:eq(1)').html(this.translate.instant('PAYS_PAGE.NOM'));
    $('#pays-datatable thead tr:eq(0) th:eq(2)').html(this.translate.instant('PAYS_PAGE.REFERENCE'));
    
    //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
  }

  filterItems(event) {
    const val = event.target.value.toLowerCase();
    return this.pays.data.filter(item => {
      return item.codePays.toLowerCase().indexOf(val.toLowerCase()) > -1;
    });
  } 

  filter(event) {
    const val = event.target.value.toLowerCase();
  
    // filter our data
    //if(val && val.trim() != '' && val.trim().length > 1){
      this.paysData = this.pays.data.filter((item) => {
        return item.codePays.toLowerCase().indexOf(val) !== -1 || item.nomPays.toLowerCase().indexOf(val) !== -1 || item.referenceOpenStreetMap.toLowerCase().indexOf(val) !== -1 || !val;
      });
    //}
    
  
    // update the rows
    //this.paysData = temp;
    
  }
  async close(){
    await this.modalController.dismiss();
  }
  
  ionViewDidEnter(){
   
  }
}


