import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NumeroRegionValidator } from '../../validators/region.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController  } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsRegionComponent } from '../../component/relations-region/relations-region.component';
import { global } from '../../../app/globale/variable';
import { PaysPage } from '../pays/pays.page';
import { DepartementPage } from '../departement/departement.page';
import { CommunePage } from '../commune/commune.page';
import { LocalitePage } from '../localite/localite.page';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { ListeMoreComponent } from 'src/app/component/liste-more/liste-more.component';
import { timingSafeEqual } from 'crypto';
import { isDefined } from '@angular/compiler/src/util';
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
  selector: 'app-region',
  templateUrl: './region.page.html',
  styleUrls: ['./region.page.scss'],
})
export class RegionPage implements OnInit {

  @Input() idPays: string;
  @Input() idRegion: any;
  @Input() filtreRegion: any;
  @Input() filtrePays: any;

  global = global;
  regionForm: FormGroup;
  action: string = 'liste';
  selectedPays:any;
  regions: any;
  regionsData: any = [];
  allRegionsData: any = [];
  //pays: any = {data: []};
  paysData: any = [];
  uneRegion: any;
  uneRegionDoc: any;
  regionHTMLTable: any;
  htmlTableAction: string;
  selectedIndexes: any = [];
  mobile = global.mobile;
  styleAffichage: string = "liste";
  allSelected: boolean = false;
  recherchePlus: boolean = false;
  filterAjouter: boolean = false;
  filterInitialiser: boolean = false;
  estModeCocherElemListe: boolean = false;
  rechargerListeMobile = false;
  doModification: boolean = false;
  colonnes = ['nomPays', 'codePays', 'nom', 'numero', 'code', 'latitude', 'longitude']
  //selectedCodePays: string;

  messages_validation = {
    'code': [
        { type: 'required', message: '' },
      ],
    'numero': [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' },
      { type: 'maxlength', message: '' },
      { type: 'pattern', message: '' },
      { type: 'validNumeroRegion', message: '' },
      { type: 'uniqueNumeroRegion', message: '' }
    ],
    'nom': [
      { type: 'required', message: '' }
    ],
    'idPays': [
      { type: 'required', message: '' }
    ],
    'paysLoading': [
      { type: 'loagin', message: '' }
    ]
  }

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la région est en mode modal, on chercher info region
      /*if(this.idRegion && this.idRegion != ''){
        this.idPays = this.idRegion.substr(0, 2);
      }*/
      this.translateLangue();
      this.getRegion();
      //this.initForm();
    }
  
    /*changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.actualiserTableau(this.regionsData);
      }else {
        this.styleAffichage = 'liste';
        this.selectedIndexes = [];
      }
    }*/

   
    changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.selectedIndexes = [];
        this.allSelected = false;
        this.recherchePlus = false;
        this.filterAjouter = false;
        this.estModeCocherElemListe = false;
        this.actualiserTableau(this.regionsData);
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
      if(this.regionForm.get(filedName).errors && (this.regionForm.get(filedName).dirty || this.regionForm.get(filedName).touched)){
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
      if(this.regionForm.get(filedName).errors){
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

    initSelect2(id, placeholder){
      var self = this;
      $(function () {
        $('#'+id+' select').select2({
          theme: 'bootstrap4',
          width: 'style',
          placeholder: placeholder,
          allowClear: Boolean($('#'+id+' select').data('allow-clear')),
        });

        

        $('#'+id+' select').on('select2:select', function (e) {
          //console.log('sele')
          //var data = e.params.data;
          self.regionForm.controls[id].setValue(e.params.data.id)
          self.setCodeAndNomPays(self.regionForm.value[id]);
          self.setSelectRequredError(id, id)
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.regionForm.controls[id].setValue(null); 
          self.setCodeAndNomPays(self.regionForm.value[id]);
          self.setSelectRequredError(id, id)
        });
      });
    }

    setSelect2DefaultValue(id, value){
      var self = this;
      $(function () { 
        $('#'+id+' select').val(value); // Select the option with a value of '1'
        $('#'+id+' select').trigger('change');

        if(!self.doModification){
          $('#'+id+' select').trigger({
            type: 'select2:select',
            params: {
              data: {
                "id": value
              }
            }
          });
        }
        
      });
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
    
    cocherTousElemListe(){
      this.regionsData.forEach((r) => {
        //console.log(p.codePays+'   '+this.selectedIndexes.indexOf(p.codePays)+'    '+this.selectedIndexes)
        if(this.selectedIndexes.indexOf(r.id) === -1){
          this.selectedIndexes.push(r.id);
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
          "dataLength": this.regionsData.length,
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
        } /*else  if(dataReturned !== null && dataReturned.data == 'changeStyle') {
          this.changeStyle();
        }  */else  if(dataReturned !== null && dataReturned.data == 'exporter') {
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
      let data = [...this.regionsData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Regions_'+date+'.xls', blob).then(()=> {
          alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
      }).catch(()=>{
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
      });
    }
  
    exportCSV(){
      let data = [...this.regionsData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Regions_'+date+'.csv', blob).then(()=> {
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
            handler: (data) => {
              
              this.selectedIndexes.forEach((id) => {
                this.servicePouchdb.findRelationalDocByID('region', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.regions[0]).then((res) => {
                  }).catch((err) => {
                     this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                   });//fin delete
                 }).catch((err) => {
                   this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                 });//fin get
              });
              
              this.regionsData = this.removeMultipleElem(this.regionsData, this.selectedIndexes);
              this.allRegionsData = this.removeMultipleElem(this.allRegionsData, this.selectedIndexes);
              this.decocherTousElemListe();
              this.regionsData = [...this.regionsData];
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
      //this.regionForm = null;
      this.regionForm = this.formBuilder.group({
        nomPays: ['', Validators.required],
        codePays: ['', Validators.required],
        idPays: ['', Validators.required],
        nom: ['', Validators.required],
        numero: ['', Validators.compose([NumeroRegionValidator.validNumeroRegion(), Validators.maxLength(2), Validators.minLength(1), Validators.pattern('^[0-9A-Za-z]+$'), Validators.required])],
        code: ['', {disabled: true}, Validators.required],
        latitude: [''],
        longitude: [''],
      });

      this.validerNumeroRegion();
      /*this.regionForm.valueChanges.subscribe(change => {
        this.regionForm.get('numero').setValidators([NumeroRegionValidator.uniqueNumeroRegion(this.regionsData, this.regionForm.value.codePays, 'ajouter'), NumeroRegionValidator.validNumeroRegion(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9A-Z]+$'), Validators.required]);
        //this.regionForm.get('numero').setValidators([NumeroRegionValidator.uniqueNumeroRegion(this.regionsData, this.regionForm.value.codePays, 'ajouter'), NumeroRegionValidator.validNumeroRegion(), Validators.maxLength(this.regionForm.value.codePays.length +1 + 2), Validators.minLength(this.regionForm.value.codePays.length +1 + 2), Validators.pattern('^'+this.regionForm.value.codePays+'-[0-9A-Z]+$'), Validators.required]);
      });*/
    }
  
    editForm(rDoc){
      //this.regionForm = null;
      let region = rDoc.regions[0];
      let codePays;
      let nomPays;
      let idPays;
      if(rDoc.pays[0]){
        codePays = rDoc.pays[0].formData.code;
        nomPays = rDoc.pays[0].formData.nom;
        idPays = rDoc.pays[0].id;
      }
      //this.unionForm = null;
      let r = region.formData

      this.regionForm = this.formBuilder.group({
        nomPays: [nomPays, Validators.required],
        codePays: [codePays, Validators.required],
        idPays: [idPays, Validators.required],
        nom: [r.nom, Validators.required],
        numero: [r.numero, Validators.compose([NumeroRegionValidator.validNumeroRegion(), Validators.maxLength(2), Validators.minLength(1), Validators.pattern('^[0-9A-Za-z]+$'), Validators.required])],
        code: [r.code, Validators.required],
        latitude: [r.latitude],
        longitude: [r.latitude],
      });

      this.validerNumeroRegion();

      /*this.regionForm.valueChanges.subscribe(change => {
        this.regionForm.get('numero').setValidators([NumeroRegionValidator.uniqueNumeroRegion(this.regionsData, this.regionForm.value.codePays, 'ajouter'), NumeroRegionValidator.validNumeroRegion(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9A-Z]+$'), Validators.required]);
      });*/
    }


    validerNumeroRegion(){
      let numeroControl = this.regionForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndCode('region', this.regionForm.value.codePays+'-'+value).then((res) => {
          if(res && res.regions && res.regions[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.uneRegion.numero))){
            numeroControl.setErrors({uniqueNumeroRegion: true});
          }
        });
      });
    } 
  
    ajouter(){
      this.doModification = false;
      this.getPays();
      this.initForm();
      this.initSelect2('idPays', this.translate.instant('REGION_PAGE.SELECTIONPAYS'));
      this.action = 'ajouter';
      
    }
  
    infos(p){
      if(global.controlAccesModele('regions', 'lecture')){
        if(!this.estModeCocherElemListe){
          this.uneRegion = p;
          this.action = 'infos';
        }
      }
    }

  
    modifier(r){
      if(!this.filtreRegion){
        if(global.controlAccesModele('regions', 'modification')){
          this.doModification = true;
          this.servicePouchdb.findRelationalDocByID('region', r.id).then((res) => {
            if(res && res.regions){
              //let rDoc = res.regions[0];
              this.getPays();
              this.editForm(res);
              this.initSelect2('idPays', this.translate.instant('REGION_PAGE.SELECTIONPAYS'));
              //this.setSelect2DefaultValue('codePays', r.codePays)
              /*$('#numero input').ready(()=>{
                $('#numero input').attr('disabled', true)
              });*/
    
              this.uneRegion = r;
              this.uneRegionDoc = res.regions[0];
              this.action ='modifier';
            }
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
          })
        }
      }
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
  
    /*
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
    }*/
  
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
              this.servicePouchdb.findRelationalDocByID('region', r.id).then((res) => {
                this.servicePouchdb.deleteRelationalDocDefinitivement(res.regions[0]).then((res) => {
                  this.regionsData.splice(this.regionsData.indexOf(r), 1);
                  this.action = 'liste';
                  if(!this.mobile){
                    this.dataTableRemoveRows();
                    this.selectedIndexes = [];
                  }else{
                    this.regionsData.splice(this.regionsData.indexOf(r), 1);
                    this.regionsData = [...this.regionsData];
                    this.allRegionsData.splice(this.allRegionsData.indexOf(r), 1);
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
  
    async presentPays(idPays) {
      const modal = await this.modalController.create({
        component: PaysPage,
        componentProps: { idPays: idPays },
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
              this.selectedIndexes.forEach((id) => {
                this.servicePouchdb.findRelationalDocByID('region', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.regions[0]).then((res) => {
                  }).catch((err) => {
                     this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                   });//fin delete
                 }).catch((err) => {
                   this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                 });//fin get
              })
  
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
        //this.actualiserTableau(this.regionsData);
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
          this.regionsData = [...this.regionsData];
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
          this.supprimer(this.uneRegion);
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
          this.supprimer(this.uneRegion);
        }
      });
      return await popover.present();
    }
    
    async presentDerniereModification(region) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { _id: region.id, _rev: region.rev, security: region.security },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      if(this.uneRegion.id && this.uneRegion.id != ''){
        this.servicePouchdb.findRelationalDocByID('region', this.uneRegion.id).then((res) => {
          if(res && res.regions[0]){
            this.presentDerniereModification(res.regions[0]);
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
              this.infos(this.regionsData[this.selectedIndexes[0]]);
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
              this.modifier(this.regionsData[this.selectedIndexes[0]]);
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
            this.infos(this.regionsData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.regionsData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
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
      //if(this.selectedIndexes.length == 1){
        let row  = this.regionHTMLTable.datatable.row('.selected').index();
        let data  = this.regionHTMLTable.datatable.row(row).data();
        this.infos(data);
        //this.selectedIndexes = [];
      /*}else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      }*/
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
        let row  = this.regionHTMLTable.datatable.row('.selected').index();
        let data  = this.regionHTMLTable.datatable.row(row).data();
        this.modifier(data);
        //this.selectedIndexes = [];
      /*}else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      }*/
    }
  
  
  
    async openRelationRegion(ev: any/*, code*/) {
      const popover = await this.popoverController.create({
        component: RelationsRegionComponent,
        event: ev,
        translucent: true,
        componentProps: {"idRegion": this.uneRegion.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'departement') {
          this.presentDepartment(this.uneRegion.id);
        }else if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.uneRegion.id);
        } else if(dataReturned !== null && dataReturned.data == 'localite') {
          this.presentLocalite(this.uneRegion.id);
        }
  
      });
      return await popover.present();
    }

    
  async openRelationRegionDepuisListe(ev: any/*, codePays*/) {

    const popover = await this.popoverController.create({
      component: RelationsRegionComponent,
      event: ev,
      translucent: true,
      componentProps: {"codeRegion": this.selectedIndexes[0]},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'departement') {
        this.presentDepartment(this.selectedIndexes[0]);
      }else if(dataReturned !== null && dataReturned.data == 'commune') {
        this.presentCommune(this.selectedIndexes[0]);
      } else if(dataReturned !== null && dataReturned.data == 'localite') {
        this.presentLocalite(this.selectedIndexes[0]);
      }

    });
    return await popover.present();
  }


    async presentDepartment(idRegion) {
      const modal = await this.modalController.create({
        component: DepartementPage,
        componentProps: { idRegion: idRegion },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentCommune(idRegion) {
      const modal = await this.modalController.create({
        component: CommunePage,
        componentProps: { idRegion: idRegion },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentLocalite(idRegion) {
      const modal = await this.modalController.create({
        component: LocalitePage,
        componentProps: { idRegion: idRegion },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
  
    onSubmit(){
      //let regionData = this.regionForm.value;
      let formData = this.regionForm.value;
      let formioData = {};
      if(this.action === 'ajouter'){
        let region: any = {
          //id: formData.code,
          type: 'region',
          pays: formData.idPays,
          formData: formData,
          //pour le customisation
          formioData: formioData,
          //pour garder les traces
          security: {
            created_by: null,
            created_at: null,
            created_deviceid: null,
            created_imei: null,
            created_phonenumber: null,
            updated_by: null,
            updated_at: null,
            updated_deviceid: null,
            updated_imei: null,
            updated_phonenumber: null,
            deleted: false,
            deleted_by: null,
            deleted_at: null,
          }
  
        };

        region.security = this.servicePouchdb.garderCreationTrace(region.security);
        delete region.security['archived'];
  

        let doc = this.clone(region);
        delete doc.formData.idPays;
        delete doc.formData.codePays;
        delete doc.formData.nomPays;

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let regionData = {id: res.regions[0].id, ...region.formData, ...region.formioData, ...region.security};
          //this.unions = union;
          this.action = 'liste';

          //this.rechargerListeMobile = true;
          if (!this.mobile){
            //mode tableau, ajout d'un autre union dans la liste
            this.dataTableAddRow(regionData)
          }else{
            //mobile, cache la liste des union pour mettre à jour la base de données
            this.regionsData.push(regionData);
            this.regionsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.regionsData = [...this.regionsData];

            this.allRegionsData.push(regionData);
            this.allRegionsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
          }

          //libérer la mémoire occupée par la liste des pays
          this.paysData = [];
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });

      }else{

         //si modification
         this.uneRegionDoc.pays = formData.idPays
         this.uneRegionDoc.formData = formData;
         this.uneRegionDoc.formioData = formioData;

         //this.uneUnion = unionData;
         this.uneRegionDoc.security = this.servicePouchdb.garderUpdateTrace(this.uneRegionDoc.security);

         let doc = this.clone(this.uneRegionDoc);
         delete doc.formData.codePays;
         delete doc.formData.nomPays;
         delete doc.formData.idPays;

         this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
           //this.unions._rev = res.rev;
           //this.uneUnionDoc._rev = res.rev;
           let regionData = {id: this.uneRegionDoc.id, ...this.uneRegionDoc.formData, ...this.uneRegionDoc.formioData, ...this.uneRegionDoc.security};

           this.action = 'infos';
           this.infos(regionData);

           if(this.mobile){
             //mode liste
             //cache la liste pour le changement dans virtual Scroll
             //mise à jour dans la liste
             for(let i = 0; i < this.regionsData.length; i++){
               if(this.regionsData[i].id == regionData.id){
                 this.regionsData[i] = regionData;
                 break;
               }
             }

             this.regionsData.sort((a, b) => {
               if (a.nom < b.nom) {
                 return -1;
               }
               if (a.nom > b.nom) {
                 return 1;
               }
               return 0;
             });

             //mise à jour dans la liste cache
             for(let i = 0; i < this.allRegionsData.length; i++){
               if(this.allRegionsData[i].id == regionData.id){
                 this.allRegionsData[i] = regionData;
                 break;
               }
             }

             this.allRegionsData.sort((a, b) => {
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
             this.dataTableUpdateRow(regionData);
           }

           this.paysData = [];
           this.uneRegionDoc = null;

         }).catch((err) => {
           alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
         });

      }
    }


    actualiserTableau(data){
      if(this.idPays && this.idPays != ''){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#region-pays').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.regionHTMLTable = createDataTable("region-pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.regionHTMLTable = createDataTable("region-pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }

              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.regionHTMLTable = createDataTable("region-pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.regionHTMLTable = createDataTable("region-pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
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
                this.regionHTMLTable = createDataTable("region", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.regionHTMLTable = createDataTable("region", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.regionHTMLTable = createDataTable("region", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.regionHTMLTable = createDataTable("region", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
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
      if((this.idPays && this.idPays != '') || this.filtreRegion){       
        this.servicePouchdb.findRelationalDocHasMany('region', 'pays', this.idPays).then((res) => {
          if(res && res.regions){
            let regionsData = [];
            this.allRegionsData = [];

            for(let r of res.regions){
              if(this.filtreRegion){
                if((this.filtreRegion.indexOf(r.id) === -1) && (this.filtrePays.indexOf(r.pays))){
                  r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[0].formData.nom, 0);    
                  r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[0].formData.code, 1); 
                  this.regionsData.push({id: r.id, idPays: res.pays[0].id, ...r.formData, ...r.formioData, ...r.security})    
                }
              }else{
                r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[0].formData.nom, 0);    
                r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[0].formData.code, 1); 
                this.regionsData.push({id: r.id, idPays: res.pays[0].id, ...r.formData, ...r.formioData, ...r.security})  
              }
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              let expor = global.peutExporterDonnees;
              if(this.filtreRegion){
                expor = false;
              }
              $('#region-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.regionHTMLTable = createDataTable("region-pays", this.colonnes, regionsData, null, this.translate, expor);
                }else{
                  this.regionHTMLTable = createDataTable("region-pays", this.colonnes, regionsData, global.dataTable_fr, this.translate, expor);
                }

                this.attacheEventToDataTable(this.regionHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.regionsData = regionsData;
              this.regionsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allRegionsData = [...this.regionsData]
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.regions = [];
            if(this.mobile){
              this.regionsData = [];
              this.allRegionsData = [];
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces au region ==> '+err)
          this.regions = [];
          if(this.mobile){
            this.regionsData = [];
            this.allRegionsData = [];
          }
          this.selectedIndexes = [];
          if(event)
            event.target.complete();
        });
    
      }else{
        this.servicePouchdb.findAllRelationalDocByType('region').then((res) => {
          if(res){
            let regionsData = [];
            this.allRegionsData = [];
            let paysIndex = [];
            let idPays;
            for(let r of res.regions){
              if(isDefined(paysIndex[r.pays])){
                r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[paysIndex[r.pays]].formData.nom, 0);
                r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[paysIndex[r.pays]].formData.code, 1);     
                idPays = res.pays[paysIndex[r.pays]].id;  
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == r.pays){
                    r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[i].formData.code, 1);
                    idPays = res.pays[i].id;
                    paysIndex[r.pays] = i;
                    break;
                  }
                }
              }
              regionsData.push({id: r.id, idPays: idPays, ...r.formData, ...r.formioData, ...r.security})
            }
  
            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#region').ready(()=>{
                if(global.langue == 'en'){
                  this.regionHTMLTable = createDataTable("region", this.colonnes, regionsData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.regionHTMLTable = createDataTable("region", this.colonnes, regionsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }

                this.attacheEventToDataTable(this.regionHTMLTable.datatable);
              });
            } else if(this.mobile){
              this.regionsData = regionsData;
              this.regionsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allRegionsData = [...this.regionsData];
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.regions = [];
            if(this.mobile){
              this.regionsData = [];
              this.allRegionsData = [];
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces au region ==> '+err)
          this.regions = [];
          if(this.mobile){
            this.regionsData = [];
            this.allRegionsData = [];
          }
          this.selectedIndexes = [];
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

     
  /*!
 * Add a new item to an object
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Object} obj   The original object
 * @param  {String} key   The key for the item to add
 * @param  {Any}    value The value for the new key to add
 * @param  {Number} index The position in the object to add the new key/value pair [optional]
 * @return {Object}       An immutable clone of the original object, with the new key/value pair added
 */
  addItemToObjectAtSpecificPosition (obj, key, value, index) {

    // Create a temp object and index variable
    let temp = {};
    let i = 0;

    // Loop through the original object
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {

        // If the indexes match, add the new item
        if (i === index && key && value) {
          temp[key] = value;
        }

        // Add the current item in the loop to the temp obj
        temp[prop] = obj[prop];

        // Increase the count
        i++;

      }
    }

    // If no index, add to the end
    if (!index && key && value) {
      temp[key] = value;
    }

    return temp;

  }
  
    getRegion(){
      //si le code region est définit, passer en mode affichage
      if(this.idRegion && this.idRegion != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('region', this.idRegion).then((res) => {
          if(res && res.regions){
            res.regions[0].formData = this.addItemToObjectAtSpecificPosition(res.regions[0].formData, 'nomPays', res.pays[0].formData.nom, 0);    
            res.regions[0].formData = this.addItemToObjectAtSpecificPosition(res.regions[0].formData, 'codePays', res.pays[0].formData.code, 1);
            this.uneRegion = {id: res.regions[0].id, idPays: res.pays[0].id, ...res.regions[0].formData, ...res.regions[0].formioData, ...res.regions[0].security};
            this.infos(this.uneRegion);
          }
        }).catch((err) => {
          this.regions = [];
          this.regionsData = [];
          this.allRegionsData = [];
          console.log(err)
        });
      }else if((this.idPays && this.idPays != '') || this.filtreRegion){ 
        this.servicePouchdb.findRelationalDocHasMany('region', 'pays', this.idPays).then((res) => {
          if(res && res.regions){
            let regionsData = [];
            this.allRegionsData = [];
            let paysIndex = [];
            for(let r of res.regions){
              if(this.filtreRegion){
                if((this.filtreRegion.indexOf(r.id) === -1) && this.filtrePays.indexOf(r.pays)){
                  if(isDefined(paysIndex[r.pays])){
                    r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[paysIndex[r.pays]].formData.nom, 0);
                    r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[paysIndex[r.pays]].formData.code, 1);       
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == r.pays){
                        r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[i].formData.nom, 0);
                        r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[i].formData.code, 1);
                        paysIndex[r.pays] = i;
                        break;
                      }
                    }
                  }
                  regionsData.push({id: r.id, idPays: this.idPays, ...r.formData, ...r.formioData, ...r.security})
                }
              }else{
                if(isDefined(paysIndex[r.pays])){
                  r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[paysIndex[r.pays]].formData.nom, 0);
                  r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[paysIndex[r.pays]].formData.code, 1);       
                }else{
                  for(let i=0; i < res.pays.length; i++){
                    if(res.pays[i].id == r.pays){
                      r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[i].formData.nom, 0);
                      r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[i].formData.code, 1);
                      paysIndex[r.pays] = i;
                      break;
                    }
                  }
                }
                regionsData.push({id: r.id, idPays: this.idPays, ...r.formData, ...r.formioData, ...r.security})
              }
              
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              let expor = global.peutExporterDonnees;
              if(this.filtreRegion){
                expor = false;
              }
              $('#region-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.regionHTMLTable = createDataTable("region-pays", this.colonnes, regionsData, null, this.translate, expor);
                }else{
                  this.regionHTMLTable = createDataTable("region-pays", this.colonnes, regionsData, global.dataTable_fr, this.translate, expor);
                }

                this.attacheEventToDataTable(this.regionHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.regionsData = regionsData;
              this.regionsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allRegionsData = [...this.regionsData];
            }
          
          }
        }).catch((err) => {
          this.regionsData = [];
          this.allRegionsData = [];
          console.log(err)
        });
      }else{  
        this.servicePouchdb.findAllRelationalDocByType('region').then((res) => {
          if(res && res.regions){
            let regionsData = [];
            this.allRegionsData = [];
            let paysIndex = [];
            let idPays;
            for(let r of res.regions){
              if(isDefined(paysIndex[r.pays])){
                r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[paysIndex[r.pays]].formData.nom, 0);
                r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[paysIndex[r.pays]].formData.code, 1); 
                idPays = res.pays[paysIndex[r.pays]].id;      
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == r.pays){
                    r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    r.formData = this.addItemToObjectAtSpecificPosition(r.formData, 'codePays', res.pays[i].formData.code, 1);
                    idPays = res.pays[i].id;
                    paysIndex[r.pays] = i;
                    break;
                  }
                }
              }
              regionsData.push({id: r.id, idPays: idPays, ...r.formData, ...r.formioData, ...r.security})
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#region').ready(()=>{
                if(global.langue == 'en'){
                this.regionHTMLTable = createDataTable("region", this.colonnes, regionsData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.regionHTMLTable = createDataTable("region", this.colonnes, regionsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
                this.attacheEventToDataTable(this.regionHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.regionsData = regionsData;
              this.regionsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allRegionsData = [...this.regionsData]
            }
          }
        }).catch((err) => {
          this.regionsData = [];
          this.allRegionsData = [];
          console.log(err)
        });
      }
    }
  
    getPays(){
      if(this.idPays && this.idPays != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('pays', this.idPays).then((res) => {
          if(res && res.pays){
            this.paysData.push({id: res.pays[0].id, ...res.pays[0].formData});
            if(this.doModification){
              this.setSelect2DefaultValue('idPays', this.uneRegion.idPays);
            } else {
              this.setSelect2DefaultValue('idPays', this.idPays);
              $('#idPays select').ready(()=>{
                $('#idPays select').attr('disabled', true)
              });
            }
            
            this.setIDCodeEtNomPays({id:res.pays[0].id, ...res.pays[0].formData});
          }
        }).catch((e) => {
          console.log('pays erreur: '+e);
          this.paysData = [];
        });
      }else{
        this.servicePouchdb.findAllRelationalDocByType('pays').then((res) => {
          if(res && res.pays){
            //this.pays = [...pays];
            this.paysData = [];
            //var datas = [];
            for(let p of res.pays){
              this.paysData.push({id: p.id, ...p.formData});
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

            if(this.doModification){
              this.setSelect2DefaultValue('idPays', this.uneRegion.idPays);
            }
          }
        }).catch((e) => {
          console.log('pays erreur: '+e);
          this.paysData = [];
        });
      }
    }

    setCodeAndNomPays(idPays){
      if(idPays && idPays != ''){
        for(let p of this.paysData){
          if(idPays == p.id){
            this.regionForm.controls.codePays.setValue(p.code);
            this.regionForm.controls.nomPays.setValue(p.nom);
            this.regionForm.controls.numero.setValue(null);
            this.regionForm.controls.code.setValue(null);
            //créer le code de la region
            /*if(this.regionForm.controls.numero.value && this.regionForm.controls.numero.value != ''){
              this.regionForm.controls.code.setValue(codePays + '-' + this.regionForm.controls.numero.value);
            }*/
            break;
          }
        }
      }
    }
  
    setIDCodeEtNomPays(paysData){
      this.regionForm.controls.idPays.setValue(paysData.id);
      this.regionForm.controls.codePays.setValue(paysData.code);
      this.regionForm.controls.nomPays.setValue(paysData.nom);
    }

    setCodeRegion(numero){
      if(numero && numero != ''){
        this.regionForm.controls.code.setValue(this.regionForm.controls.codePays.value + '-' + numero);
      }
    }

    attacheEventToDataTable(datatable){
      var self = this;
      var id = '';
      if(this.idPays && this.idPays != ''){
        id = 'region-pays-datatable';
      }else{ 
        id = 'region-datatable';
      }
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
      ///this.translateDataTableCollumn();
    }
  
    translateDataTableCollumn(){
      var id = '';
      if(this.idPays && this.idPays != ''){
        id = 'region-pays-datatable';
      }else{ 
        id = 'region-datatable';
      }

      var self = this;
      $(self.regionHTMLTable.datatable.table().header()).children(1)[0].children[0].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.NOM');
      $(self.regionHTMLTable.datatable.table().header()).children(1)[0].children[1].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.CODEPAYS');
      $(self.regionHTMLTable.datatable.table().header()).children(1)[0].children[2].firstChild.nodeValue = this.translate.instant('REGION_PAGE.NOM');
      $(self.regionHTMLTable.datatable.table().header()).children(1)[0].children[3].firstChild.nodeValue = this.translate.instant('REGION_PAGE.NUMERO');
      $(self.regionHTMLTable.datatable.table().header()).children(1)[0].children[4].firstChild.nodeValue = this.translate.instant('REGION_PAGE.CODE');
      $(self.regionHTMLTable.datatable.table().header()).children(1)[0].children[5].firstChild.nodeValue = this.translate.instant('GENERAL.LATITUDE');
      $(self.regionHTMLTable.datatable.table().header()).children(1)[0].children[6].firstChild.nodeValue = this.translate.instant('GENERAL.LONGITUDE');
      
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }
  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //code region
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.code[0].message = res;
      });

      //numéro région
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numero[0].message = res;
      });
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.MINLENGTH').subscribe((res: string) => {
        this.messages_validation.numero[1].message = res;
      });
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.MAXLENGTH').subscribe((res: string) => {
        this.messages_validation.numero[2].message = res;
      });
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.PATTERN').subscribe((res: string) => {
        this.messages_validation.numero[3].message = res;
      });
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.VALIDNUMEROREGION').subscribe((res: string) => {
        this.messages_validation.numero[4].message = res;
      });

      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NUMEROREGION.UNIQUENUMEROREGION').subscribe((res: string) => {
        this.messages_validation.numero[5].message = res;
      });
  
      //nom region
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.NOMREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });

      //id pays
      this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPays[0].message = res;
      });

       //nom pays
       this.translate.get('REGION_PAGE.MESSAGES_VALIDATION.PAYSLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.paysLoading[0].message = res;
      });
    }




    dataTableAddRow(rowData){

      this.regionHTMLTable.datatable.row.add(rowData).draw();
    }
  
    dataTableUpdateRow(/*index, */rowData){

      this.regionHTMLTable.datatable.row('.selected').data(rowData).draw();
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      this.regionHTMLTable.datatable.rows('.selected').remove().draw();
    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.regionHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.regionHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.regionHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    /*var id = '';
    if(this.idPays && this.idPays != ''){
      id = 'region-pays-datatable';
    }else{ 
      id = 'region-datatable';
    }

    $('#'+id+' thead tr:eq(1)').show();*/
    var self = this;
    $(self.regionHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
    this.recherchePlus = true;
  }

  dataTableRemoveRechercheParColonne(){
    /*var id = '';
    if(this.idPays && this.idPays != ''){
      id = 'region-pays-datatable';
    }else{ 
      id = 'region-datatable';
    }

    $('#'+id+' thead tr:eq(1)').hide();*/
    
    var self = this;
    $(self.regionHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    var id = '';
    if(this.idPays && this.idPays != ''){
      id = 'region-pays-datatable';
    }else{ 
      id = 'region-datatable';
    }
  
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
      $( self.regionHTMLTable.datatable.table().footer() ).show();
      this.regionHTMLTable.datatable.columns().every( function () {
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
                  
                  var info = self.regionHTMLTable.datatable.page.info();
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

      this.regionHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
        if(!$('#'+id+colIdx).attr('style') && visibility){
            $('#'+id+colIdx).selectpicker();
              $('.ms-parent').removeAttr("style");
          }
      });

      this.filterAjouter = true;
      this.filterInitialiser = true;

    } else if(!this.filterAjouter && this.filterInitialiser){
      //$('#'+id+' tfoot').show();
      $( self.regionHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }


  dataTableRemoveCustomFiltre(){
    var id = '';
    if(this.idPays && this.idPays != ''){
      id = 'region-pays-datatable';
    }else{ 
      id = 'region-datatable';
    }
    var self = this;
    $( self.regionHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }
  
    filterItems(event) {
      const val = event.target.value.toLowerCase();
      return this.regionsData.filter(item => {
        return item.code.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    }
  
    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter pour data
      //if(val && val.trim() != '' && val.trim().length > 1){
        this.regionsData = this.allRegionsData.filter((item) => {
          return item.numero.toLowerCase().indexOf(val) !== -1 || item.code.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || item.codePays.toLowerCase().indexOf(val) !== -1 || item.nomPays.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.regionData = temp;
      
    }
  
    /*async close(){
      await this.modalController.dismiss();
    }*/

    async close(){
      await this.modalController.dismiss({filtreRegion: this.filtreRegion});
    }

    async valider() {
      //this.filtreRegion = [];
      this.filtreRegion = this.filtreRegion.concat(this.selectedIndexes);

      await this.modalController.dismiss({filtreRegion: this.filtreRegion});
    }
    
    ionViewDidEnter(){ 
    }
    
}
