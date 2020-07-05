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
import { LocalitePage } from '../localite/localite.page';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { ListeMoreComponent } from 'src/app/component/liste-more/liste-more.component';
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

@Component({
  selector: 'app-departement',
  templateUrl: './departement.page.html',
  styleUrls: ['./departement.page.scss'],
})
export class DepartementPage implements OnInit {
 
  @Input() idPays: string;
  @Input() idRegion: string;
  @Input() idDepartement: string;
  @Input() filtreDepartement: any;
  @Input() filtreRegions: any;

  global = global;
  departementForm: FormGroup;
  action: string = 'liste';
  departements: any;
  departementsData: any = [];
  allDepartementsData: any = [];
  paysData: any = [];
  regionData: any = [];
  unDepartement: any;
  uneDepartementDoc: any;
  departementHTMLTable: any;
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
  colonnes = ['nomPays', 'codePays', 'nomRegion', 'codeRegion', 'nom', 'numero', 'code', 'latitude', 'longitude']

  messages_validation = {
    'code': [
        { type: 'required', message: '' },
      ],
    'numero': [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' },
      { type: 'maxlength', message: '' },
      { type: 'pattern', message: '' },
      { type: 'validNumeroDepartement', message: '' },
      { type: 'uniqueNumeroDepartement', message: '' }
    ],
    'nom': [
      { type: 'required', message: '' }
    ],
    'idPays': [
      { type: 'required', message: '' }
    ],
    'paysLoading': [
      { type: 'loagin', message: '' }
    ],
    'idRegion': [
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
      /*if(this.code && this.code != ''){
        this.codeRegion = this.code.substr(0, 5);
      }*/
      //au cas où la région est en mode modal, on chercher info region
      /*if(this.codeRegion && this.codeRegion != ''){
        if(this.departementHTMLTable && this.departementHTMLTable.datatable.row(0).data().codePays){
          this.codePays = this.departementHTMLTable.datatable.row(0).data().codePays;
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('region', this.codeRegion).then((res) => {
            if(res && res.resions){
              this.codePays = res.resgions[0].codePays;
            }
          })
        }
        //this.codePays = this.codeRegion.substr(0, 2);
      }*/
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
        this.actualiserTableau(this.departementsData);
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
      if(this.departementForm.get(filedName).errors && (this.departementForm.get(filedName).dirty || this.departementForm.get(filedName).touched)){
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
      if(this.departementForm.get(filedName).errors){
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
          self.departementForm.controls[id].setValue(e.params.data.id)
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.departementForm.value[id]);
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.departementForm.value[id]);
          }
          self.setSelectRequredError(id, id)
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.departementForm.controls[id].setValue(null); 
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.departementForm.value[id]);
            self.regionData = [];
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.departementForm.value[id]);
          }
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
      this.departementsData.forEach((d) => {
        //console.log(p.codePays+'   '+this.selectedIndexes.indexOf(p.codePays)+'    '+this.selectedIndexes)
        if(this.selectedIndexes.indexOf(d.id) === -1){
          this.selectedIndexes.push(d.id);
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
          "dataLength": this.departementsData.length,
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
        } else /* if(dataReturned !== null && dataReturned.data == 'changeStyle') {
          this.changeStyle();
        }else  */if(dataReturned !== null && dataReturned.data == 'exporter') {
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
      let data = [...this.departementsData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Departements_'+date+'.xls', blob).then(()=> {
          alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
      }).catch(()=>{
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
      });
    }
  
    exportCSV(){
      let data = [...this.departementsData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Departements_'+date+'.csv', blob).then(()=> {
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
                this.servicePouchdb.findRelationalDocByID('departement', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.departements[0]).then((res) => {
                  }).catch((err) => {
                     this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                   });//fin delete
                 }).catch((err) => {
                   this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                 });//fin get
              });
              
              this.departementsData = this.removeMultipleElem(this.departementsData, this.selectedIndexes);
              this.allDepartementsData = this.removeMultipleElem(this.allDepartementsData, this.selectedIndexes);
              this.decocherTousElemListe();
              this.departementsData = [...this.departementsData];
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
      //this.departementForm = null;
      this.departementForm = this.formBuilder.group({
        nomPays: ['', Validators.required],
        codePays: ['', Validators.required],
        idPays: ['', Validators.required],
        nomRegion: ['', Validators.required],
        codeRegion: ['', Validators.required],
        idRegion: ['', Validators.required],
        nom: ['', Validators.required],
        numero: ['', Validators.compose([NumeroDepartementValidator.validNumeroDepartement(), Validators.maxLength(2), Validators.minLength(1), Validators.pattern('^[0-9A-ZA-z]+$'), Validators.required])],
        code: ['', Validators.required],
        latitude: [''],
        longitude: [''],
      });

      this.validerNumeroDepartement()
      /*this.departementForm.valueChanges.subscribe(change => {
        this.departementForm.get('numero').setValidators([NumeroDepartementValidator.uniqueNumeroDepartement(this.departementsData, this.departementForm.value.codeRegion, 'ajouter'), NumeroDepartementValidator.validNumeroDepartement(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });*/
    }
  
    editForm(dDoc){
      //this.departementForm = null;
      let departement = dDoc.departements[0];
      let codePays;
      let idPays;
      let nomPays;
      let codeRegion;
      let nomRegion;
      let idRegion;
      if(dDoc.pays[0]){
        idPays = dDoc.pays[0].id;
        codePays = dDoc.pays[0].formData.code;
        nomPays = dDoc.pays[0].formData.nom;
      }

      if(dDoc.regions[0]){
        idRegion = dDoc.regions[0].id;
        codeRegion = dDoc.regions[0].formData.code;
        nomRegion = dDoc.regions[0].formData.nom;
      }
      //this.unionForm = null;
      let d = departement.formData
      this.departementForm = this.formBuilder.group({
        nomPays: [nomPays, Validators.required],
        codePays: [codePays, Validators.required],
        idPays: [idPays, Validators.required],
        nomRegion: [nomRegion, Validators.required],
        codeRegion: [codeRegion, Validators.required],
        idRegion: [idRegion, Validators.required],
        nom: [d.nom, Validators.required],
        code: [d.code, Validators.required],
        numero: [d.numero,  Validators.compose([NumeroDepartementValidator.validNumeroDepartement(), Validators.maxLength(2), Validators.minLength(1), Validators.pattern('^[0-9A-ZA-z]+$'), Validators.required])],
        latitude: [d.latitude],
        longitude: [d.latitude],
      });

      this.validerNumeroDepartement();
      /*this.departementForm.valueChanges.subscribe(change => {
        this.departementForm.get('numero').setValidators([NumeroDepartementValidator.uniqueNumeroDepartement(this.departementsData, this.departementForm.value.codeRegion, 'ajouter'), NumeroDepartementValidator.validNumeroDepartement(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });*/
    }
  
    validerNumeroDepartement(){
      let numeroControl = this.departementForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndCode('departement', this.departementForm.value.codeRegion + value).then((res) => {
          if(res && res.departements && res.departements[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.unDepartement.numero))){
            numeroControl.setErrors({uniqueNumeroDepartement: true});
          }
        });
      });
    }


    ajouter(){
      this.doModification = false;
      if(this.idRegion && this.idRegion != ''){
        if(this.departementHTMLTable && this.departementHTMLTable.datatable && this.departementHTMLTable.datatable.row(0) && this.departementHTMLTable.datatable.row(0).data()){
          this.idPays = this.departementHTMLTable.datatable.row(0).data().idPays;
          this.getPays();
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('region', this.idRegion).then((res) => {
            if(res && res.regions){
              this.idPays = res.regions[0].pays;
              this.getPays();
            }
          })
        }
        //this.codePays = this.codeRegion.substr(0, 2);
      }else {
        this.getPays();
      }
      //
      this.initForm();
      this.initSelect2('idPays', this.translate.instant('DEPARTEMENT_PAGE.SELECTIONPAYS'));
      this.initSelect2('idRegion', this.translate.instant('DEPARTEMENT_PAGE.SELECTIONREGION'));
      this.action = 'ajouter';
    }
  
    infos(d){
      if(global.controlAccesModele('departements', 'lecture')){
        if(!this.estModeCocherElemListe){
          this.unDepartement = d;
          this.action = 'infos';
        }
      }
      
    }

  
    modifier(d){
      if(!this.filtreDepartement){
        if(global.controlAccesModele('departements', 'modification')){
          this.doModification = true;
          this.servicePouchdb.findRelationalDocByID('departement', d.id).then((res) => {
            if(res && res.departements){
              this.getPays();
              this.getRegionParPays(d.idPays);
              this.editForm(res);
              this.initSelect2('idPays', this.translate.instant('DEPARTEMENT_PAGE.SELECTIONPAYS'));
              this.initSelect2('idRegion', this.translate.instant('DEPARTEMENT_PAGE.SELECTIONREGION'));
              //.setSelect2DefaultValue('codePays', d.codePays)
              //this.setSelect2DefaultValue('codeRegion', d.codeRegion)
              /*$('#numero input').ready(()=>{
                $('#numero input').attr('disabled', true)
              });*/
    
              this.uneDepartementDoc = res.departements[0];
              this.unDepartement = d;
              this.action ='modifier';
            }
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
          })  
        }  
      }
      
      
      //this.unDepartement = d;
      //this.action ='modifier';
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
  
    /*exportExcel(){
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
              this.servicePouchdb.findRelationalDocByID('departement', d.id).then((res) => {
                this.servicePouchdb.deleteRelationalDocDefinitivement(res.departements[0]).then((res) => {
                  this.departementsData.splice(this.departementsData.indexOf(d), 1);
                  this.action = 'liste';
                  if(!this.mobile){
                    this.dataTableRemoveRows();
                    this.selectedIndexes = [];
                  }else{
                    this.departementsData = [...this.departementsData];
                    this.allDepartementsData.splice(this.allDepartementsData.indexOf(d), 1);
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
  
    async presentRegion(idRegion) {
      const modal = await this.modalController.create({
        component: RegionPage,
        componentProps: { idRegion: idRegion },
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
                this.servicePouchdb.findRelationalDocByID('departement', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.departements[0]).then((res) => {
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
        //this.actualiserTableau(this.departementsData);
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
          this.departementsData = [...this.departementsData];
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
          this.supprimer(this.unDepartement);
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
          this.supprimer(this.unDepartement);
        }
      });
      return await popover.present();
    }
    
    async presentDerniereModification(departement) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { _id: departement.id, _rev: departement.rev, security: departement.security },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      if(this.unDepartement.id && this.unDepartement.id != ''){
        this.servicePouchdb.findRelationalDocByID('departement', this.unDepartement.id).then((res) => {
          if(res && res.departements[0]){
            this.presentDerniereModification(res.departements[0]);
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
              this.infos(this.departementsData[this.selectedIndexes[0]]);
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
              this.modifier(this.departementsData[this.selectedIndexes[0]]);
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
            //this.selectedIndexes = [];
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
            this.infos(this.departementsData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.departementsData[this.selectedIndexes[0]]);
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
     // if(this.selectedIndexes.length == 1){
      let row  = this.departementHTMLTable.datatable.row('.selected').index();
      let data  = this.departementHTMLTable.datatable.row(row).data();
      this.infos(data);
        //this.selectedIndexes = [];
      /*}else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      }*/
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
        let row  = this.departementHTMLTable.datatable.row('.selected').index();
        let data  = this.departementHTMLTable.datatable.row(row).data();
        this.modifier(data);
        //this.selectedIndexes = [];
      /*}else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      }*/
    }
  
    async openRelationDepartement(ev: any/*, code*/) {
      const popover = await this.popoverController.create({
        component: RelationsDepartementComponent,
        event: ev,
        translucent: true,
        componentProps: {"idDepartement": this.unDepartement.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.unDepartement.id);
        } else if(dataReturned !== null && dataReturned.data == 'localite') {
          this.presentLocalite(this.unDepartement.id) 
        }
  
      });
      return await popover.present();
    }

     
  async openRelationDepartementDepuisListe(ev: any/*, idPays*/) {
    const popover = await this.popoverController.create({
      component: RelationsDepartementComponent,
      event: ev,
      translucent: true,
      componentProps: {"idDepartement": this.selectedIndexes[0]},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'commune') {
        this.presentCommune(this.selectedIndexes[0]);
      } else if(dataReturned !== null && dataReturned.data == 'localite') {
        this.presentLocalite(this.selectedIndexes[0]) 
      }

    });
    return await popover.present();
  }

    async presentCommune(idDepartement) {
      const modal = await this.modalController.create({
        component: CommunePage,
        componentProps: { idDepartement: idDepartement },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentLocalite(idDepartement) {
      const modal = await this.modalController.create({
        component: LocalitePage,
        componentProps: { idDepartement: idDepartement },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
  
    onSubmit(){
      //let departementData = this.departementForm.value;
      let formData = this.departementForm.value;
      let formioData = {};
      if(this.action === 'ajouter'){
        let departement: any = {
          //id: formData.code,
          type: 'departement',
          pays: formData.idPays,
          region: formData.idRegion,
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

        departement.security = this.servicePouchdb.garderCreationTrace(departement.security);
        delete departement.security['archived'];
  

        let doc = this.clone(departement);
        delete doc.formData.codePays;
        delete doc.formData.idPays;
        delete doc.formData.nomPays;
        delete doc.formData.codeRegion;
        delete doc.formData.nomRegion;
        delete doc.formData.idRegion;

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let departementData = {id: res.departements[0].id, ...departement.formData, ...departement.formioData, ...departement.security};
          //this.unions = union;
          this.action = 'liste';

          //this.rechargerListeMobile = true;
          if (!this.mobile){
            //mode tableau, ajout d'un autre union dans la liste
            this.dataTableAddRow(departementData)
          }else{
            //mobile, cache la liste des union pour mettre à jour la base de données
            this.departementsData.push(departementData);
            this.departementsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.departementsData = [...this.departementsData];

            this.allDepartementsData.push(departementData);
            this.allDepartementsData.sort((a, b) => {
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
          this.regionData = [];
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }else{
        //si modification
        this.uneDepartementDoc.pays = formData.idPays;
          this.uneDepartementDoc.region = formData.idRegion
          this.uneDepartementDoc.formData = formData;
          this.uneDepartementDoc.formioData = formioData;

          this.uneDepartementDoc.security = this.servicePouchdb.garderUpdateTrace(this.uneDepartementDoc.security);

          let doc = this.clone(this.uneDepartementDoc);
          delete doc.formData.idPays;
          delete doc.formData.codePays;
          delete doc.formData.nomPays;
          delete doc.formData.idRegion;
          delete doc.formData.codeRegion;
          delete doc.formData.nomRegion;

          this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
            //this.unions._rev = res.rev;
            //this.uneUnionDoc._rev = res.rev;
            let departementData = {id: this.uneDepartementDoc.id, ...this.uneDepartementDoc.formData, ...this.uneDepartementDoc.formioData, ...this.uneDepartementDoc.security};

            this.action = 'infos';
            this.infos(departementData);

            if(this.mobile){
              //mode liste
              //cache la liste pour le changement dans virtual Scroll

              for(let i = 0; i < this.departementsData.length; i++){
                if(this.departementsData[i].id== departementData.id){
                  this.departementsData[i] = departementData;
                  break;
                }
              }

              this.departementsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              //mise à jour dans la liste cache
              for(let i = 0; i < this.allDepartementsData.length; i++){
                if(this.allDepartementsData[i].id == departementData.id){
                  this.allDepartementsData[i] = departementData;
                  break;
                }
              }

              this.allDepartementsData.sort((a, b) => {
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
              this.dataTableUpdateRow(departementData);
            }

            this.paysData = [];
            this.regionData = [];
            this.uneDepartementDoc = null;

          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          });
      }
    }

 
    actualiserTableau(data){
      if(this.idPays && this.idPays != ''){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#departement-pays').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.departementHTMLTable = createDataTable("departement-pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.departementHTMLTable = createDataTable("departement-pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.departementHTMLTable = createDataTable("departement-pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.departementHTMLTable = createDataTable("departement-pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
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
                this.departementHTMLTable = createDataTable("departement", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.departementHTMLTable = createDataTable("departement", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.departementHTMLTable = createDataTable("departement", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.departementHTMLTable = createDataTable("departement", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
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
      if((this.idPays && this.idPays != '') || (this.idRegion && this.idRegion != '')  || this.filtreDepartement){
        let type;
        let idType;
        if(this.idRegion){
          type = 'region';
          idType = this.idRegion;
        }else{
          type = 'pays';
          idType = this.idPays;
        }

        this.servicePouchdb.findRelationalDocHasMany('departement', type, idType).then((res) => {
          if(res && res.departements){
            let departementsData = [];
            this.allDepartementsData = [];
            let paysIndex = [];
            let regionIndex = [];
            let idPays;
            let idRegion;
            for(let d of res.departements){
              if(this.filtreDepartement){
                if((this.filtreDepartement.indexOf(d.id) === -1) && (this.filtreRegions.indexOf(d.region))){
                  if(isDefined(paysIndex[d.pays])){
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[paysIndex[d.pays]].formData.nom, 0);
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[paysIndex[d.pays]].formData.code, 1);
                    idPays = res.pays[paysIndex[d.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == d.pays){
                        d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[i].formData.nom, 0);
                        d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[i].formData.code, 1);
                        paysIndex[d.pays] = i;
                        idPays = res.pays[i].id;
                        break;
                      }
                    }
                  }
    
                  if(isDefined(regionIndex[d.region])){
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[regionIndex[d.region]].formData.nom, 2);
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[regionIndex[d.region]].formData.code, 3);
                    idRegion = res.regions[regionIndex[d.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == d.region){
                        d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                        d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[i].formData.code, 3);
                        regionIndex[d.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }
                  
                  departementsData.push({id: d.id, idPays: idPays, idRegion: idRegion, ...d.formData, ...d.formioData, ...d.security})
                }
              }else{
                if(isDefined(paysIndex[d.pays])){
                  d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[paysIndex[d.pays]].formData.nom, 0);
                  d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[paysIndex[d.pays]].formData.code, 1);
                  idPays = res.pays[paysIndex[d.pays]].id;
                }else{
                  for(let i=0; i < res.pays.length; i++){
                    if(res.pays[i].id == d.pays){
                      d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[i].formData.nom, 0);
                      d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[i].formData.code, 1);
                      paysIndex[d.pays] = i;
                      idPays = res.pays[i].id;
                      break;
                    }
                  }
                }
  
                if(isDefined(regionIndex[d.region])){
                  d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[regionIndex[d.region]].formData.nom, 2);
                  d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[regionIndex[d.region]].formData.code, 3);
                  idRegion = res.regions[regionIndex[d.region]].id;
                }else{
                  for(let i=0; i < res.regions.length; i++){
                    if(res.regions[i].id == d.region){
                      d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                      d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[i].formData.code, 3);
                      regionIndex[d.region] = i;
                      idRegion = res.regions[i].id;
                      break;
                    }
                  }
                }
                
                departementsData.push({id: d.id, idPays: idPays, idRegion: idRegion, ...d.formData, ...d.formioData, ...d.security})
              }
              
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              let expor = global.peutExporterDonnees;
              if(this.filtreDepartement){
                expor = false;
              }
              $('#departement-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.departementHTMLTable = createDataTable("departement-pays", this.colonnes, departementsData, null, this.translate, expor);
                }else{
                  this.departementHTMLTable = createDataTable("departement-pays", this.colonnes, departementsData, global.dataTable_fr, this.translate, expor);
                }
                this.attacheEventToDataTable(this.departementHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.departementsData = departementsData;
              this.departementsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allDepartementsData = [...this.allDepartementsData];
            }

            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            if(this.mobile){
              this.departementsData = [];
              this.allDepartementsData = [];
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces au departement ==> '+err)
          if(this.mobile){
            this.departementsData = [];
            this.allDepartementsData = [];
          }
          this.selectedIndexes = [];
          if(event)
            event.target.complete();
        });
    
      }else{
        this.servicePouchdb.findAllRelationalDocByType('departement').then((res) => {
          if(res && res.departements){
            let departementsData = [];
            this.allDepartementsData = [];
            let paysIndex = [];
            let regionIndex = [];
            let idPays;
            let idRegion;
            for(let d of res.departements){
              if(isDefined(paysIndex[d.pays])){
                d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[paysIndex[d.pays]].formData.nom, 0);
                d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[paysIndex[d.pays]].formData.code, 1);
                idPays = res.pays[paysIndex[d.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == d.pays){
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[d.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[d.region])){
                d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[regionIndex[d.region]].formData.nom, 2);
                d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[regionIndex[d.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[d.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == d.region){
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    regionIndex[d.region] = i;
                    idRegion = res.regions[i].id;
                    break;
                  }
                }
              }


              departementsData.push({id: d.id, idPays: idPays, idRegion: idRegion, ...d.formData, ...d.formioData, ...d.security})
            }
  
            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#departement').ready(()=>{
                if(global.langue == 'en'){
                  this.departementHTMLTable = createDataTable("departement", this.colonnes, departementsData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.departementHTMLTable = createDataTable("departement", this.colonnes, departementsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.departementHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.departementsData = departementsData;
              this.departementsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allDepartementsData = [...this.departementsData]
            }

            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            if(this.mobile){
              this.departementsData = [];
              this.allDepartementsData = [];
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces au departement ==> '+err)
          if(this.mobile){
            this.departementsData = [];
            this.allDepartementsData = [];
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
    
    getDepartement(){
      if(this.idDepartement && this.idDepartement != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('departement', this.idDepartement).then((res) => {
          if(res && res.departements){
            res.departements[0].formData = this.addItemToObjectAtSpecificPosition(res.departements[0].formData, 'nomPays', res.pays[0].formData.nom, 0);    
            res.departements[0].formData = this.addItemToObjectAtSpecificPosition(res.departements[0].formData, 'codePays', res.pays[0].formData.code, 1);
            res.departements[0].formData = this.addItemToObjectAtSpecificPosition(res.departements[0].formData, 'nomRegion', res.regions[0].formData.nom, 2);    
            res.departements[0].formData = this.addItemToObjectAtSpecificPosition(res.departements[0].formData, 'codeRegion', res.regions[0].formData.code, 3);
            
            this.unDepartement = {id: res.departements[0].id, idPays: res.pays[0].id, idRegion: res.regions[0].id, ...res.departements[0].formData, ...res.departements[0].formioData, ...res.departements[0].security};
            this.infos(this.unDepartement);
          }
        }).catch((err) => {
          this.departementsData = [];
          this.allDepartementsData = [];
          console.log(err)
        });
      }else if((this.idPays && this.idPays != '') || (this.idRegion && this.idRegion != '') || this.filtreDepartement){
        let type;
        let idType;
        if(this.idRegion){
          type = 'region';
          idType = this.idRegion;
        }else{
          type = 'pays';
          idType = this.idPays;
        }

        this.servicePouchdb.findRelationalDocHasMany('departement', type, idType).then((res) => {
          if(res && res.departements){
            let departementsData = [];
            this.allDepartementsData = [];
            let paysIndex = [];
            let regionIndex = [];
            let idPays;
            let idRegion;
            for(let d of res.departements){
              if(this.filtreDepartement){
                if((this.filtreDepartement.indexOf(d.id) === -1) && this.filtreRegions.indexOf(d.region)){
                  if(isDefined(paysIndex[d.pays])){
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[paysIndex[d.pays]].formData.nom, 0);
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[paysIndex[d.pays]].formData.code, 1);
                    idPays = res.pays[paysIndex[d.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == d.pays){
                        d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[i].formData.nom, 0);
                        d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[i].formData.code, 1);
                        paysIndex[d.pays] = i;
                        idPays = res.pays[i].id;
                        break;
                      }
                    }
                  }
    
                  if(isDefined(regionIndex[d.region])){
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[regionIndex[d.region]].formData.nom, 2);
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[regionIndex[d.region]].formData.code, 3);
                    idRegion = res.regions[regionIndex[d.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == d.region){
                        d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                        d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[i].formData.code, 3);
                        regionIndex[d.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }
    
    
                  departementsData.push({id: d.id, idPays: idPays, idRegion: idRegion, ...d.formData, ...d.formioData, ...d.security})
                }
              }else{
                if(isDefined(paysIndex[d.pays])){
                  d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[paysIndex[d.pays]].formData.nom, 0);
                  d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[paysIndex[d.pays]].formData.code, 1);
                  idPays = res.pays[paysIndex[d.pays]].id;
                }else{
                  for(let i=0; i < res.pays.length; i++){
                    if(res.pays[i].id == d.pays){
                      d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[i].formData.nom, 0);
                      d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[i].formData.code, 1);
                      paysIndex[d.pays] = i;
                      idPays = res.pays[i].id;
                      break;
                    }
                  }
                }
  
                if(isDefined(regionIndex[d.region])){
                  d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[regionIndex[d.region]].formData.nom, 2);
                  d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[regionIndex[d.region]].formData.code, 3);
                  idRegion = res.regions[regionIndex[d.region]].id;
                }else{
                  for(let i=0; i < res.regions.length; i++){
                    if(res.regions[i].id == d.region){
                      d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                      d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[i].formData.code, 3);
                      regionIndex[d.region] = i;
                      idRegion = res.regions[i].id;
                      break;
                    }
                  }
                }
  
  
                departementsData.push({id: d.id, idPays: idPays, idRegion: idRegion, ...d.formData, ...d.formioData, ...d.security})
              }
              
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              let expor = global.peutExporterDonnees;
              if(this.filtreDepartement){
                expor = false;
              }
              $('#departement-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.departementHTMLTable = createDataTable("departement-pays", this.colonnes, departementsData, null, this.translate, expor);
                }else{
                  this.departementHTMLTable = createDataTable("departement-pays", this.colonnes, departementsData, global.dataTable_fr, this.translate, expor);
                }
                this.attacheEventToDataTable(this.departementHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.departementsData = departementsData;
              this.departementsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allDepartementsData = [...this.allDepartementsData];
            }
          
          }
        }).catch((err) => {
          this.departementsData = [];
          this.allDepartementsData = [];
          console.log(err)
        });

      }else{
        this.servicePouchdb.findAllRelationalDocByType('departement').then((res) => {
          if(res && res.departements){
            let departementsData = [];
            this.allDepartementsData = [];
            let paysIndex = [];
            let regionIndex = [];
            let idPays;
            let idRegion;
            for(let d of res.departements){
              if(isDefined(paysIndex[d.pays])){
                d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[paysIndex[d.pays]].formData.nom, 0);
                d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[paysIndex[d.pays]].formData.code, 1);
                idPays = res.pays[paysIndex[d.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == d.pays){
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[d.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[d.region])){
                d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[regionIndex[d.region]].formData.nom, 2);
                d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[regionIndex[d.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[d.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == d.region){
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    d.formData = this.addItemToObjectAtSpecificPosition(d.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    regionIndex[d.region] = i;
                    idRegion = res.regions[i].id;
                    break;
                  }
                }
              }


              departementsData.push({id: d.id, idPays: idPays, idRegion: idRegion, ...d.formData, ...d.formioData, ...d.security})
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#departement').ready(()=>{
                if(global.langue == 'en'){
                  this.departementHTMLTable = createDataTable("departement", this.colonnes, departementsData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.departementHTMLTable = createDataTable("departement", this.colonnes, departementsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.departementHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.departementsData = departementsData;
              this.departementsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allDepartementsData = [...this.departementsData]
            }
          }
        }).catch((err) => {
          this.departementsData = [];
          this.allDepartementsData = [];
          console.log(err)
        });
      }
    }
  
    
  
    getPays(){
      if(this.idPays && this.idPays != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('pays', this.idPays).then((res) => {
          if(res && res.pays && res.pays[0]){
            this.paysData.push({id: res.pays[0].id, ...res.pays[0].formData});
            if(this.doModification){
              this.setSelect2DefaultValue('idPays', this.unDepartement.idPays);
            } else {
              this.setSelect2DefaultValue('idPays', this.idPays);

              $('#idPays select').ready(()=>{
                $('#idPays select').attr('disabled', true)
              });
            }

            this.setIDCodeEtNomPays(res.pays[0].formData);
            this.getRegionParPays(this.idPays);
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
              this.setSelect2DefaultValue('idPays', this.unDepartement.idPays);
            }
          }
        }).catch((e) => {
          console.log('pays erreur: '+e);
          this.paysData = [];
        });
      }

    }

    getRegionParPays(idPays){
      if(this.idRegion && this.idRegion != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('region', this.idRegion).then((res) => {
          if(res && res.regions){
            this.regionData.push({id: res.regions[0].id, ...res.regions[0].formData});
            if(this.doModification){
              this.setSelect2DefaultValue('idRegion', this.unDepartement.idRegion);
            } else {
              this.setSelect2DefaultValue('idRegion', this.idRegion);
              $('#idRegion select').ready(()=>{
                $('#idRegion select').attr('disabled', true)
              });
            }

            this.setIDCodeEtNomRegion(res.regions[0].formData);
          }
        }).catch((e) => {
          console.log('region erreur: '+e);
          this.regionData = [];
        });
      }else{
        this.servicePouchdb.findRelationalDocHasMany('region', 'pays', idPays).then((res) => {
          if(res && res.regions){
            this.regionData = [];
            //var datas = [];
            for(let r of res.regions){
              this.regionData.push({id: r.id, ...r.formData});
            }

            this.regionData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            if(this.doModification){
              this.setSelect2DefaultValue('idRegion', this.unDepartement.idRegion);
            }
          }
        }).catch((e) => {
          console.log('region erreur: '+e);
          this.regionData = [];
        });
      }
    }

    setCodeAndNomPays(idPays){
      if(idPays && idPays != ''){
        for(let p of this.paysData){
          if(idPays == p.id){
            this.departementForm.controls.codePays.setValue(p.code);
            this.departementForm.controls.nomPays.setValue(p.nom);
            this.departementForm.controls.idRegion.setValue(null);
            this.departementForm.controls.codeRegion.setValue(null);
            this.departementForm.controls.nomRegion.setValue(null);
            this.departementForm.controls.numero.setValue(null);
            this.departementForm.controls.code.setValue(null);

            this.getRegionParPays(idPays)
            break;
          }
        }
      }else{
        this.departementForm.controls.idRegion.setValue(null);
        this.departementForm.controls.codeRegion.setValue(null);
        this.departementForm.controls.nomRegion.setValue(null);
        this.departementForm.controls.numero.setValue(null);
        this.departementForm.controls.code.setValue(null);
      }
    }

    setCodeAndNomRegion(idRegion){
      if(idRegion && idRegion != ''){
        for(let r of this.regionData){
          if(idRegion == r.id){
            this.departementForm.controls.codeRegion.setValue(r.code);
            this.departementForm.controls.nomRegion.setValue(r.nom);
            this.departementForm.controls.numero.setValue(null);
            this.departementForm.controls.code.setValue(null);
            break;
          }
        }
      }else{
        this.departementForm.controls.numero.setValue(null);
        this.departementForm.controls.code.setValue(null);
      }
    }
  
    setIDCodeEtNomPays(paysData){
      this.departementForm.controls.idPays.setValue(paysData.id);
      this.departementForm.controls.codePays.setValue(paysData.code);
      this.departementForm.controls.nomPays.setValue(paysData.nom);
    }

    setIDCodeEtNomRegion(regionData){
      this.departementForm.controls.idRegion.setValue(regionData.id);
      this.departementForm.controls.codeRegion.setValue(regionData.code);
      this.departementForm.controls.nomRegion.setValue(regionData.nom);
    }

    setCodeDepartement(numero){
      if(numero && numero != ''){
        this.departementForm.controls.code.setValue(this.departementForm.controls.codeRegion.value + numero);
      }
    }

    attacheEventToDataTable(datatable){
      var self = this;
      var id = '';
      if(this.idPays && this.idPays != ''){
        id = 'departement-pays-datatable';
      }else{ 
        id = 'departement-datatable';
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
        id = 'departement-pays-datatable';
      }else{ 
        id = 'departement-datatable';
      }


      var self = this;
      $(self.departementHTMLTable.datatable.table().header()).children(1)[0].children[0].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.NOM');
      $(self.departementHTMLTable.datatable.table().header()).children(1)[0].children[1].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.CODEPAYS');
      $(self.departementHTMLTable.datatable.table().header()).children(1)[0].children[2].firstChild.nodeValue = this.translate.instant('REGION_PAGE.NOM');
      $(self.departementHTMLTable.datatable.table().header()).children(1)[0].children[3].firstChild.nodeValue = this.translate.instant('REGION_PAGE.CODE');
      $(self.departementHTMLTable.datatable.table().header()).children(1)[0].children[4].firstChild.nodeValue = this.translate.instant('DEPARTEMENT_PAGE.NOM');
      $(self.departementHTMLTable.datatable.table().header()).children(1)[0].children[5].firstChild.nodeValue = this.translate.instant('DEPARTEMENT_PAGE.NUMERO');
      $(self.departementHTMLTable.datatable.table().header()).children(1)[0].children[6].firstChild.nodeValue = this.translate.instant('DEPARTEMENT_PAGE.CODE');
      $(self.departementHTMLTable.datatable.table().header()).children(1)[0].children[7].firstChild.nodeValue = this.translate.instant('GENERAL.LATITUDE');
      $(self.departementHTMLTable.datatable.table().header()).children(1)[0].children[8].firstChild.nodeValue = this.translate.instant('GENERAL.LONGITUDE');
      
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }
  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //code departement
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.code[0].message = res;
      });

      //numéro département
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numero[0].message = res;
      });
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.MINLENGTH').subscribe((res: string) => {
        this.messages_validation.numero[1].message = res;
      });
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.MAXLENGTH').subscribe((res: string) => {
        this.messages_validation.numero[2].message = res;
      });
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.PATTERN').subscribe((res: string) => {
        this.messages_validation.numero[3].message = res;
      });
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.VALIDNUMERODEPARTEMENT').subscribe((res: string) => {
        this.messages_validation.numero[4].message = res;
      });

      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NUMERODEPARTEMENT.UNIQUENUMERODEPARTEMENT').subscribe((res: string) => {
        this.messages_validation.numero[5].message = res;
      });
  
      //nom departement
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.NOMDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });

      //pays
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPays[0].message = res;
      });

       //pays loading
       this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.PAYSLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.paysLoading[0].message = res;
      });

      //code région
      this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idRegion[0].message = res;
      });

       //region loading
       this.translate.get('DEPARTEMENT_PAGE.MESSAGES_VALIDATION.REGIONLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.regionLoading[0].message = res;
      });
    }
  
    dataTableAddRow(rowData){
      this.departementHTMLTable.datatable.row.add(rowData).draw();
    }
  
    dataTableUpdateRow(/*index, */rowData){
      this.departementHTMLTable.datatable.row('.selected').data(rowData).draw();
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      this.departementHTMLTable.datatable.rows('.selected').remove().draw();
    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.departementHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.departementHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.departementHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    /*var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'departement-pays-datatable';
    }else{ 
      id = 'departement-datatable';
    }

    $('#'+id+' thead tr:eq(1)').show();*/
    var self = this;
    $(self.departementHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
    this.recherchePlus = true;
  }

  dataTableRemoveRechercheParColonne(){
    /*var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'departement-pays-datatable';
    }else{ 
      id = 'departement-datatable';
    }

    $('#'+id+' thead tr:eq(1)').hide();*/
    
    var self = this;
    $(self.departementHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  
    dataTableAddCustomFiltre(){
      var id = '';
      if((this.idPays && this.idPays != '') || (this.idRegion && this.idRegion != '')){
        id = 'departement-pays-datatable';
      }else{ 
        id = 'departement-datatable';
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
        $( self.departementHTMLTable.datatable.table().footer() ).show();
        this.departementHTMLTable.datatable.columns().every( function () {
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
                    
                    var info = self.departementHTMLTable.datatable.page.info();
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
  
        this.departementHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
          if(!$('#'+id+colIdx).attr('style') && visibility){
              $('#'+id+colIdx).selectpicker();
                $('.ms-parent').removeAttr("style");
            }
        });
  
        this.filterAjouter = true;
        this.filterInitialiser = true;
  
      } else if(!this.filterAjouter && this.filterInitialiser){
        //$('#'+id+' tfoot').show();
        $( self.departementHTMLTable.datatable.table().footer() ).show();
        //$('#'+id+' tfoot').removeAttr("style");
        this.filterAjouter = true;
      }
     // }              
    }
  
  
    dataTableRemoveCustomFiltre(){
      var id = '';
      if((this.idPays && this.idPays != '') || (this.idRegion && this.idRegion != '')){
        id = 'departement-pays-datatable';
      }else{ 
        id = 'departement-datatable';
      }
      var self = this;
      $( self.departementHTMLTable.datatable.table().footer() ).hide();
      this.filterAjouter = false;
    }


  
    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        this.departementsData = this.allDepartementsData.filter((item) => {
          return item.numero.toLowerCase().indexOf(val) !== -1 || item.code.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || item.codeRegion.toLowerCase().indexOf(val) !== -1 || item.nomRegion.toLowerCase().indexOf(val) !== -1 || item.codePays.toLowerCase().indexOf(val) !== -1 || item.nomPays.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.departementData = temp;
      
    }
  
    /*async close(){
      await this.modalController.dismiss();
    }*/

    async close(){
      await this.modalController.dismiss({filtreDepartement: this.filtreDepartement});
    }

    async valider() {
      //this.filtreDepartement = [];
      this.filtreDepartement = this.filtreDepartement.concat(this.selectedIndexes);

      await this.modalController.dismiss({filtreDepartement: this.filtreDepartement});
    }
    
    ionViewDidEnter(){ 

    }

    
    
}
