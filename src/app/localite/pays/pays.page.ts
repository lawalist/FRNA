import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
//import { CodePaysValidator } from '../../validators/pays.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RegionPage } from '../../localite/region/region.page';
import { RelationsPaysComponent } from '../../component/relations-pays/relations-pays.component';
import { global } from '../../../app/globale/variable';
import { DepartementPage } from '../departement/departement.page';
import { CommunePage } from '../commune/commune.page';
import { LocalitePage } from '../localite/localite.page';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { ListeMoreComponent } from 'src/app/component/liste-more/liste-more.component';
import { DerniereModificationComponent } from 'src/app/component/derniere-modification/derniere-modification.component';
import { DatatableConstructComponent } from 'src/app/component/datatable-construct/datatable-construct.component';
import { ListeActionComponent } from 'src/app/component/liste-action/liste-action.component';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
//declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;
//declare var TableManageButtons: any;

@Component({
  selector: 'app-pays',
  templateUrl: './pays.page.html',
  styleUrls: ['./pays.page.scss'],
})
export class PaysPage implements OnInit {

  @Input() idPays: any;
  paysForm: FormGroup;
  action: string = 'liste';
  pays: any;
  paysData: any = [];
  allPaysData: any = [];
  unPays: any;
  unPaysDoc :any;
  paysHTMLTable: any;
  htmlTableAction: string;
  selectedIndexes: any = [];
  mobile = global.mobile;
  styleAffichage: string = "liste";

  allSelected: boolean = false;
  recherchePlus: boolean = false;
  filterAjouter: boolean = false;
  filterInitialiser: boolean = false;
  estModeCocherElemListe: boolean = false;
  rechargerListeMobile: boolean = false;
  colonnes = ['nom', 'code', 'referenceOpenStreetMap'];

  messages_validation = {
    'code': [
        { type: 'required', message: '' },
        { type: 'minlength', message: '' },
        { type: 'maxlength', message: '' },
        { type: 'pattern', message: '' },
        { type: 'validCodePays', message: '' }
      ],
      'nom': [
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

  setInputRequredError(id, filedName){
    if(this.paysForm.get(filedName).errors && (this.paysForm.get(filedName).dirty || this.paysForm.get(filedName).touched)){
      //$('#'+id).addClass( "required has-error" );
      $('#'+id).addClass( "has-error" );
      $('#'+id +' input').addClass( "is-invalid" );
    }
    else{
   //$('#'+id).removeClass( "required has-error" );
    $('#'+id).removeClass( "has-error" );
      $('#'+id +' input').removeClass( "is-invalid" );
    }

    //this.validerCodePays();
  }

  separateLetter(record, recordIndex, records) {
    if (recordIndex == 0) {
      return record.nom[0].toUpperCase();
    }
 
    if (!records[recordIndex + 1] || !records[recordIndex + 2]) {
      return null;
    }
 
    let first_prev = records[recordIndex - 1].nom[0];
    let first_current = record.nom[0];
 
    if (first_prev != first_current) {
      return first_current.toUpperCase();
    }
    return null;
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
      this.actualiserTableau(this.paysData);
    }else {
      this.styleAffichage = 'liste';
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;
      this.estModeCocherElemListe = false;
    }
  }

  cocherElemListe(id){
    if(this.selectedIndexes.indexOf(id) === -1){
      //si coché
      this.selectedIndexes.push(id);
    }else{
      //si décocher
      this.selectedIndexes.splice(this.selectedIndexes.indexOf(id), 1);
    }  
    
  }

  
  removeMultipleElem(data, indexes){

    for(let i = 0; i < data.length; i++){
      if(indexes.length == 0){
        break;
      }
      if(indexes.indexOf(data[i].id) !== -1){
        indexes.splice(indexes.indexOf(data[i].id), 1);
        data.splice(i, 1);
        i--;
      }
    }

    return data;
  }

  changerModeCocherElemListe(){
     if(this.estModeCocherElemListe){
      this.estModeCocherElemListe = false;
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

  cocherTousElemListe(){
    this.paysData.forEach((p) => {
      //console.log(p.code+'   '+this.selectedIndexes.indexOf(p.code)+'    '+this.selectedIndexes)
      if(this.selectedIndexes.indexOf(p.id) === -1){
        this.selectedIndexes.push(p.id);
      }
    });

    $('ion-checkbox').prop("checked", true);
  }

  decocherTousElemListe(){
    $('ion-checkbox').prop("checked", false);
    this.selectedIndexes = [];
  }


  async listOptionsPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: ListeMoreComponent,
      event: ev,
      translucent: true,
      componentProps: {"options": {
        "estModeCocherElemListe": this.estModeCocherElemListe,
        "dataLength": this.paysData.length,
        "selectedIndexesLength": this.selectedIndexes.length,
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
      }/* else  if(dataReturned !== null && dataReturned.data == 'changeStyle') {
        this.changeStyle();
      } */
      else  if(dataReturned !== null && dataReturned.data == 'exporter') {
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
    let data = [...this.paysData];
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
    this.file.writeFile(fileDestiny, 'FRNA_Export_Pays_'+date+'.xls', blob).then(()=> {
        alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
    }).catch(()=>{
        alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
    });
  }

  exportCSV(){
    let data = [...this.paysData];
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
    this.file.writeFile(fileDestiny, 'FRNA_Export_Pays_'+date+'.csv', blob).then(()=> {
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
          handler: () => {
            //suppression définitive
            this.selectedIndexes.forEach((id) => {
              this.servicePouchdb.findRelationalDocByID('pays', id).then((res) => {
                this.servicePouchdb.deleteRelationalDocDefinitivement(res.pays[0]).then((res) => {
                }).catch((err) => {
                   this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                 });//fin delete
               }).catch((err) => {
                 this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
               });//fin get
            });
            
            this.paysData = this.removeMultipleElem(this.paysData, this.selectedIndexes);
            this.allPaysData = this.removeMultipleElem(this.allPaysData, this.selectedIndexes);
            this.decocherTousElemListe();
            this.paysData = [...this.paysData];
            this.selectedIndexes = [];

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
      nom: ['', Validators.required],
      code: ['', Validators.compose([Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[A-Z]+$'), Validators.required])],
      referenceOpenStreetMap: [''],
    });
    this.validerCodePays();
  }


  editForm(p){
    //this.paysForm = null;
    this.paysForm = this.formBuilder.group({
      nom: [p.nom, Validators.required],
      code: [p.code, Validators.compose([Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[A-Z]+$'), Validators.required])],
      referenceOpenStreetMap: [p.referenceOpenStreetMap],
    });

    this.validerCodePays();
  }

  
  validerCodePays(){
    let codeControl = this.paysForm.controls['code'];
    codeControl.valueChanges.subscribe((value) => {
      this.servicePouchdb.findRelationalDocByTypeAndCode('pays', value).then((res) => {
        if(res && res.pays && res.pays[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.unPays.code))){
          codeControl.setErrors({validCodePays: true});
        }
      });
    });
  }

  ajouter(){
    this.initForm();
    this.action = 'ajouter';

    this.initSelect2();
  }

  initSelect2(){
    $(function () {
      $('.select2').each(function () {
        $(this).select2({
          theme: 'bootstrap4',
          width: 'style',
          placeholder: $(this).attr('placeholder'),
          allowClear: Boolean($(this).data('allow-clear')),
        });
      });
    });
  }

  infos(p){
    if(!this.estModeCocherElemListe){
      this.unPays = p;
      this.action = 'infos';
    }
    
  }

  modifier(p){

    this.servicePouchdb.findRelationalDocByID('pays', p.id).then((res) => {
      if(res && res.pays[0]){
          this.editForm(p);
          
          /*$('#code input').ready(()=>{
            $('#code input').attr('disabled', true)
          });*/

          this.unPays = p;
          this.unPaysDoc =  res.pays[0];
          this.action ='modifier';
        }
    }).catch((err) => {
      alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
    })
  }

  selectItem(index){
    alert(index)
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
          handler: (/*data*/) => {
            //suppression définitive
            this.servicePouchdb.findRelationalDocByID('pays', p.id).then((res) => {
              this.servicePouchdb.deleteRelationalDocDefinitivement(res.pays[0]).then((res) => {
                
                this.action = 'liste';
                if(!this.mobile){
                  this.dataTableRemoveRows();
                  this.selectedIndexes = [];
                }else{
                  this.paysData.splice(this.paysData.indexOf(p), 1);
                  this.paysData = [...this.paysData];
                  this.allPaysData.splice(this.allPaysData.indexOf(p), 1);
                  this.selectedIndexes = [];
                }
              }).catch((err) => {
                 this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
               });//fin delete
             }).catch((err) => {
               this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
             });//fin get
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
            this.selectedIndexes.forEach((id) => {
              this.servicePouchdb.findRelationalDocByID('pays', id).then((res) => {
                this.servicePouchdb.deleteRelationalDocDefinitivement(res.pays[0]).then((res) => {
                }).catch((err) => {
                   this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                 });//fin delete
               }).catch((err) => {
                 this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
               });//fin get
            })

            //this.paysData = this.removeMultipleElem(this.paysData, this.selectedIndexes);
            this.action = 'liste';
            //this.htmlTableAction = 'recharger';
            //this.actualiserTableau(this.paysData);
            this.dataTableRemoveRows();
            this.selectedIndexes = [];
            this.afficheMessage(this.translate.instant('GENERAL.ALERT_SUPPRIMER'));
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
        this.actualiserTableau(this.paysData);*/
    }
  }

  retour(){
    if(this.action === 'modifier'){
      this.action = "infos";
    }else{
      this.action = 'liste';
      //this.action = this.cacheAction; 
      //recharger la liste
      if(this.rechargerListeMobile){
        this.paysData = [...this.paysData];
        this.rechargerListeMobile = false;
      }
      ///this.actualiserTableau(this.paysData);
    }
  }


  async listActionPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: ListeActionComponent,
      event: ev,
      translucent: true,
      componentProps: {
        "action": this.action,
        "localite": true
      },
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'supprimer') {
        this.supprimer(this.unPays);
      }else if(dataReturned !== null && dataReturned.data == 'derniereModification') {
        this.selectedItemDerniereModification();          
      }     
    });
    return await popover.present();
  }


  async datatableConstructPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: DatatableConstructComponent,
      event: ev,
      translucent: true,
      componentProps: {"action": this.action, "cacheAction": this.action, "localite": true},
      animated: true,
      showBackdrop: true,
      mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'derniereModification') {
        this.selectedItemDerniereModification();
      }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
        this.supprimer(this.unPays);
      }
    });
    return await popover.present();
  }
  
  async presentDerniereModification(pays) {
    const modal = await this.modalController.create({
      component: DerniereModificationComponent,
      componentProps: { _id: pays.id, _rev: pays.rev, security: pays.security },
      mode: 'ios',
      //cssClass: 'costom-modal',
    });
    return await modal.present();
  }

  selectedItemDerniereModification(){
    if(this.unPays.id && this.unPays.id != ''){
      this.servicePouchdb.findRelationalDocByID('pays', this.unPays.id).then((res) => {
        if(res && res.pays[0]){
          this.presentDerniereModification(res.pays[0]);
        }else{
          alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
        }
      });
      //this.selectedIndexes = [];
    }else{
      alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
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
          if(this.selectedIndexes.length == 1){
            this.infos(this.paysData[this.selectedIndexes[0]]);
            //this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }
        }
      }, {
        text: this.translate.instant('GENERAL.MODIFIER'),
        icon: 'create',
        handler: () => {
          if(this.selectedIndexes.length == 1){
            this.modifier(this.paysData[this.selectedIndexes[0]]);
            //this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
          }
        }
      }, {
        text: this.translate.instant('GENERAL.NOUVEAU'),
        icon: 'add',
        handler: () => {
          this.ajouter();
          this.selectedIndexes = [];
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
        this.selectedIndexes = [];
      }else if(dataReturned !== null && dataReturned.data == 'infos') {
        this.selectedItemInfo();
        /*if(this.selectedIndexes.length == 1){
          this.infos(this.paysData[this.selectedIndexes[0]]);
          //this.selectedIndexes = [];
        }else{
          alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
        }*/
      }else if(dataReturned !== null && dataReturned.data == 'modifier') {
        this.selectedItemModifier();
        /*if(this.selectedIndexes.length == 1){
          this.modifier(this.paysData[this.selectedIndexes[0]]);
          //this.selectedIndexes = [];
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
      }/* else if(dataReturned !== null && dataReturned.data == 'changeStyle') {
        this.changeStyle();
      } */

    });
    return await popover.present();
  }


  selectedItemInfo(){
    //if(this.selectedIndexes.length == 1){
      let row  = this.paysHTMLTable.datatable.row('.selected').index();
      let data  = this.paysHTMLTable.datatable.row(row).data();
      this.infos(data);
      //this.selectedIndexes = [];
    /*}else{
      alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
    }*/
  }

  selectedItemModifier(){
    //if(this.selectedIndexes.length == 1){
      let row  = this.paysHTMLTable.datatable.row('.selected').index();
      let data  = this.paysHTMLTable.datatable.row(row).data();
      this.modifier(data);
      //this.selectedIndexes = [];
    /*}else{
      alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
    }*/
  }

  async openRelationPays(ev: any/*, code*/) {
    const popover = await this.popoverController.create({
      component: RelationsPaysComponent,
      event: ev,
      translucent: true,
      componentProps: {"idPays": this.unPays.id},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'region') {
        this.presentRegions(this.unPays.id);
        //this.navCtrl.navigateForward('/localite/regions/pays/'+this.unPays.code)
      }else if(dataReturned !== null && dataReturned.data == 'departement') {
        this.presentDepartment(this.unPays.id);
      }else if(dataReturned !== null && dataReturned.data == 'commune') {
        this.presentCommune(this.unPays.id);
      } else if(dataReturned !== null && dataReturned.data == 'localite') {
        this.presentLocalite(this.unPays.id);
      }

    });
    return await popover.present();
  }

  async openRelationPaysDepuisListe(ev: any/*, code*/) {
    let row  = this.paysHTMLTable.datatable.row('.selected').index();
    let data  = this.paysHTMLTable.datatable.row(row).data();
    const popover = await this.popoverController.create({
      component: RelationsPaysComponent,
      event: ev,
      translucent: true,
      componentProps: {"idPays": data.id},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'region') {
        this.presentRegions(data.id);
        //this.navCtrl.navigateForward('/localite/regions/pays/'+this.unPays.code)
      }else if(dataReturned !== null && dataReturned.data == 'departement') {
        this.presentDepartment(data.id);
      }else if(dataReturned !== null && dataReturned.data == 'commune') {
        this.presentCommune(data.id);
      } else if(dataReturned !== null && dataReturned.data == 'localite') {
        this.presentLocalite(data.id);
      }

    });
    return await popover.present();
  }

  async presentRegions(idPays) {
    const modal = await this.modalController.create({
      component: RegionPage,
      componentProps: { idPays: idPays },
      mode: 'ios',
      cssClass: 'costom-modal',
    });
    return await modal.present();
  }

  async presentDepartment(idPays) {
    const modal = await this.modalController.create({
      component: DepartementPage,
      componentProps: { idPays: idPays },
      mode: 'ios',
      cssClass: 'costom-modal',
    });
    return await modal.present();
  }

  async presentCommune(idPays) {
    const modal = await this.modalController.create({
      component: CommunePage,
      componentProps: { idPays: idPays },
      mode: 'ios',
      cssClass: 'costom-modal',
    });
    return await modal.present();
  }

  async presentLocalite(idPays) {
    const modal = await this.modalController.create({
      component: LocalitePage,
      componentProps: { idPays: idPays },
      mode: 'ios',
      cssClass: 'costom-modal',
    });
    return await modal.present();
  }

  onSubmit(){
    //let paysData = this.paysForm.value;
    let formData = this.paysForm.value;
    let formioData = {};
    if(this.action === 'ajouter'){
      
      let pays: any = {
        //_id: 'fuma:pays:'+data.numero,
        //id: formData.code,
        type: 'pays',
        formData: formData,
        //pour le customisation
        formioData: formioData,
        //pour garder les traces
        security: {
          created_by: null,
          created_at: null,
          updated_by: null,
          updated_at: null,
          deleted: false,
          deleted_by: null,
          deleted_at: null,
        }

      };
      pays.security = this.servicePouchdb.garderCreationTrace(pays.security);
      delete pays.security['archived'];

      this.servicePouchdb.createRelationalDoc(pays).then((res) => {
        //fusionner les différend objets
        let paysData = {id: res.id, ...pays.formData, ...pays.formioData, ...pays.security};
        //this.pays = pays;
        //pays._rev = res.rev;

        //this.pays.push(pays);
        this.action = 'liste';
        //this.rechargerListeMobile = true;
        if (!this.mobile){
          //mode tableau, ajout d'un autre pays dans la liste
          this.dataTableAddRow(paysData)
        }else{
          //mobile, cache la liste des pays pour mettre à jour la base de données
          this.paysData.push(paysData);
          this.paysData.sort((a, b) => {
            if (a.nom < b.nom) {
              return -1;
            }
            if (a.nom > b.nom) {
              return 1;
            }
            return 0;
          });

          this.paysData = [...this.paysData];

          this.allPaysData.push(paysData);
          this.allPaysData.sort((a, b) => {
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
        alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
      });
    }else{

      //si modification
      this.unPaysDoc.formData = formData;
      this.unPaysDoc.formioData = formioData;

      //this.unpays = paysData;
      this.unPaysDoc.security = this.servicePouchdb.garderUpdateTrace(this.unPaysDoc.security);

      this.servicePouchdb.updateRelationalDoc(this.unPaysDoc).then((res) => {
        //this.pays._rev = res.rev;
        //this.unPaysDoc._rev = res.pays[0].rev;
        let paysData = {id: this.unPaysDoc.id, ...this.unPaysDoc.formData, ...this.unPaysDoc.formioData, ...this.unPaysDoc.security};

        
        this.action = 'infos';
        this.infos(paysData);

        if(this.mobile){
          //mode liste
          //cache la liste pour le changement dans virtual Scroll
          //this.paysData = [...this.paysData];

          //mise à jour dans la liste
          for(let i = 0; i < this.paysData.length; i++){
            if(this.paysData[i].id == paysData.id){
              this.paysData[i] = paysData;
              break;
            }
          }
          this.paysData.sort((a, b) => {
            if (a.nom < b.nom) {
              return -1;
            }
            if (a.nom > b.nom) {
              return 1;
            }
            return 0;
          });
          //this.paysData = [...this.paysData];

          //mise à jour dans la liste cache
          for(let i = 0; i < this.allPaysData.length; i++){
            if(this.allPaysData[i].id == paysData.id){
              this.allPaysData[i] = paysData;
              break;
            }
          }

          //this.allPaysData[this.allPaysData.indexOf(this.unPays)] = paysData;

          this.allPaysData.sort((a, b) => {
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
          //this.datatableDeselectMultipleSelectedItemForModification();
          this.dataTableUpdateRow(paysData);
        }

      }).catch((err) => {
        alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
      });
    }
  }


  actualiserTableau(data){
    if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
      $('#pays').ready(()=>{
        if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
          //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour    
          if(global.langue == 'en'){
            this.paysHTMLTable = createDataTable("pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
          }else{
            this.paysHTMLTable = createDataTable("pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
          }
          this.htmlTableAction = null;
        }else{
          //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
          if(global.langue == 'en'){
            this.paysHTMLTable = createDataTable("pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
          }else{
            this.paysHTMLTable = createDataTable("pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
          }
          this.htmlTableAction = null;
        }
        
        this.selectedIndexes = [];
        this.attacheEventToDataTable(this.paysHTMLTable.datatable);
      });
    }
    
  }

  doRefresh(event) {
    this.servicePouchdb.findAllRelationalDocByType('pays').then((res) => {
      if(res && res.pays){
        //this.pays = [...pays];
        let paysData = [];
        //var datas = [];
        for(let p of res.pays){
          //datas = datas.concat(d.data);
          paysData.push({id: p.id, ...p.formData, ...p.formioData, ...p.security});
        }


        if(this.mobile){
          this.paysData = [...paysData];
          this.paysData.sort((a, b) => {
            if (a.nom < b.nom) {
              return -1;
            }
            if (a.nom > b.nom) {
              return 1;
            }
            return 0;
          });

          this.allPaysData = [...paysData];

        } else {
          //si non mobile 
          $('#pays').ready(()=>{
            if(global.langue == 'en'){
              this.paysHTMLTable = createDataTable("pays", this.colonnes, paysData, null, this.translate, global.peutExporterDonnees);
            }else{
              this.paysHTMLTable = createDataTable("pays", this.colonnes, paysData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
            }
     
            this.attacheEventToDataTable(this.paysHTMLTable.datatable);
          });
        }
        this.selectedIndexes = [];
        if(event)
          event.target.complete();
      }else{
        this.pays = null;
        if(this.mobile){
          this.paysData = [];
          this.allPaysData = [];
        }
        this.selectedIndexes = [];
        if(event)
          event.target.complete();
      }
    }).catch((err) => {
      console.log('Erreur acces au pays ==> '+err)
      this.pays = null;
      if(this.mobile){
        this.paysData = [];
        this.allPaysData = [];
      }
      this.selectedIndexes = [];
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
    this.paysData = [];
    this.allPaysData = [];

    if(this.idPays && this.idPays != ''){
      this.servicePouchdb.findRelationalDocByTypeAndID('pays', this.idPays).then((res) => {
        if(res && res.pays){
          this.unPays = {id: res.pays[0].id, ...res.pays[0].formData, ...res.pays[0].formioData, ...res.pays[0].security};
          this.infos(this.unPays);         
        }
      }).catch((err) => {
        this.pays = [];
        this.paysData = [];
        this.allPaysData = [];
        this.unPays = null;
        console.log('Erreur acces aux pays');
        console.log(err);
      });
    }else{
      this.servicePouchdb.findAllRelationalDocByType('pays').then((res) => {
        if(res && res.pays){
          //this.pays = [...pays];
          let paysData = [];
          //var datas = [];
          for(let p of res.pays){
            //datas = datas.concat(d.data);
            paysData.push({id: p.id,...p.formData, ...p.formioData, ...p.security});
          }

          if(this.mobile){
            this.paysData = paysData;
            this.paysData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.allPaysData = [...this.paysData];
          } else{
            $('#pays').ready(()=>{
              if(global.langue == 'en'){
                this.paysHTMLTable = createDataTable("pays", this.colonnes, paysData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.paysHTMLTable = createDataTable("pays", this.colonnes, paysData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
             
              this.attacheEventToDataTable(this.paysHTMLTable.datatable);
            });
          }
        }
      }).catch((err) => {
        this.pays = [];
        this.paysData = [];
        this.allPaysData = [];
        console.log('Erreur acces aux pays');
        console.log(err);
      });
    }
  }

  attacheEventToDataTable(datatable){
    var self = this;
    var id = 'pays-datatable';
    
    datatable.on( 'select', function ( e, dt, type, indexes ) {
      for(const i of indexes){
        if(self.selectedIndexes.indexOf(datatable.row(i).data().id) === -1){
          self.selectedIndexes.push(datatable.row(i).data().id)
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
        if(self.selectedIndexes.indexOf(datatable.row(i).data().id) !== -1){
          self.selectedIndexes.splice(self.selectedIndexes.indexOf(datatable.row(i).data().id), 1)
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
    });

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

  translateLangue(){
    this.translate.use(global.langue);
    this.translateMessagesValidation();
  }
  
  translateMessagesValidation(){
    //code pays
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
      this.messages_validation.code[0].message = res;
    });
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.MINLENGTH').subscribe((res: string) => {
      this.messages_validation.code[1].message = res;
    });
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.MAXLENGTH').subscribe((res: string) => {
      this.messages_validation.code[2].message = res;
    });
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.PATTERN').subscribe((res: string) => {
      this.messages_validation.code[3].message = res;
    });
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.CODEPAYS.VALIDCODEPAYS').subscribe((res: string) => {
      this.messages_validation.code[4].message = res;
    });

    //nom pays
    this.translate.get('PAYS_PAGE.MESSAGES_VALIDATION.NOMPAYS.REQUIRED').subscribe((res: string) => {
      this.messages_validation.nom[0].message = res;
    });
  }


  dataTableAddRow(rowData){

    this.paysHTMLTable.datatable.row.add(rowData).draw();
  }

  dataTableUpdateRow(/*index, */rowData){
    this.paysHTMLTable.datatable.row('.selected').data(rowData).draw();
  }

  dataTableRemoveRows(){
    //datatable.row(index).remove().draw();
    this.paysHTMLTable.datatable.rows('.selected').remove().draw();
  }

  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.paysHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.paysHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.paysHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    /*var id = 'pays-datatable';
    $('#'+id+' thead tr:eq(1)').show();*/
    var self = this;
    $(self.paysHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
    this.recherchePlus = true;
  }

  dataTableRemoveRechercheParColonne(){
    /*var id = 'pays-datatable';
    $('#'+id+' thead tr:eq(1)').hide();*/
    
    var self = this;
    $(self.paysHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltreOld(){
    //.initComplete = function () {
    var id = 'pays-datatable';
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

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'pays-datatable';
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
      $( self.paysHTMLTable.datatable.table().footer() ).show();
      this.paysHTMLTable.datatable.columns().every( function () {
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
                  
                  var info = self.paysHTMLTable.datatable.page.info();
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

      this.paysHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
        if(!$('#'+id+colIdx).attr('style') && visibility){
            $('#'+id+colIdx).selectpicker();
              $('.ms-parent').removeAttr("style");
          }
      });

      this.filterAjouter = true;
      this.filterInitialiser = true;

    } else if(!this.filterAjouter && this.filterInitialiser){
      //$('#'+id+' tfoot').show();
      $( self.paysHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }


  dataTableRemoveCustomFiltre(){
    var id = 'pays-datatable';
    var self = this;
    $( self.paysHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }

  /*dataTableRemoveCustomFiltre(){
    var id = 'pays-datatable';
    $('#'+id+' tfoot').hide();
    this.filterAjouter = false;
  }*/

  removeTraceKey(paysData){
    delete paysData['created_at'];
    delete paysData['created_by'];
    delete paysData['updated_at'];
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

    var self = this;

    $(self.paysHTMLTable.datatable.table().header()).children(1)[0].children[0].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.NOM');
    $(self.paysHTMLTable.datatable.table().header()).children(1)[0].children[1].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.CODEPAYS');
    $(self.paysHTMLTable.datatable.table().header()).children(1)[0].children[2].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.REFERENCE');
    
    /*$('#pays-datatable thead tr:eq(0) th:eq(0)').html(this.translate.instant('PAYS_PAGE.CODEPAYS'));
    $('#pays-datatable thead tr:eq(0) th:eq(1)').html(this.translate.instant('PAYS_PAGE.NOM'));
    $('#pays-datatable thead tr:eq(0) th:eq(2)').html(this.translate.instant('PAYS_PAGE.REFERENCE'));
    */
    //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
  }

  filterItems(event) {
    const val = event.target.value.toLowerCase();
    return this.paysData.filter(item => {
      return item.code.toLowerCase().indexOf(val.toLowerCase()) > -1;
    });
  } 

  filter(event) {
    const val = event.target.value.toLowerCase();
  
    // filter our data
    //if(val && val.trim() != '' && val.trim().length > 1){
      this.paysData = this.allPaysData.filter((item) => {
        return item.nom.toLowerCase().indexOf(val) !== -1 || item.code.toLowerCase().indexOf(val) !== -1 || item.referenceOpenStreetMap.toLowerCase().indexOf(val) !== -1 || !val;
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


