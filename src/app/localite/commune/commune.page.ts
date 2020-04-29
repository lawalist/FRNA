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
  selector: 'app-commune',
  templateUrl: './commune.page.html',
  styleUrls: ['./commune.page.scss'],
})
export class CommunePage implements OnInit {

  
  @Input() idPays: string;
  @Input() idRegion: string;
  @Input() idDepartement: string;
  @Input() idCommune: string;
  communeForm: FormGroup;
  action: string = 'liste';
  communes: any;
  communesData: any = [];
  allCommunesData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  uneCommune: any;
  uneCommuneDoc: any;
  communeHTMLTable: any;
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
  colonnes = ['nomPays', 'codePays', 'nomRegion', 'codeRegion', 'nomDepartement', 'codeDepartement', 'nom', 'numero', 'code', 'latitude', 'longitude']

  messages_validation = {
    'code': [
        { type: 'required', message: '' },
      ],
    'numero': [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' },
      { type: 'maxlength', message: '' },
      { type: 'pattern', message: '' },
      { type: 'validNumeroCommune', message: '' },
      { type: 'uniqueNumeroCommune', message: '' }
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
    ],
    'idDepartement': [
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
      /*if(this.code && this.code != ''){
        this.codeDepartement = this.code.substr(0, 7);
      }
      //au cas où la commune est en mode modal, on chercher info region
      if(this.codeDepartement && this.codeDepartement != ''){
        this.codeRegion = this.codeDepartement.substr(0, 5);
      }
      if(this.codeRegion && this.codeRegion != ''){
        this.codePays = this.codeRegion.substr(0, 2);
      }*/
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
        this.actualiserTableau(this.communesData);
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
      if(this.communeForm.get(filedName).errors && (this.communeForm.get(filedName).dirty || this.communeForm.get(filedName).touched)){
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
      if(this.communeForm.get(filedName).errors){
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
          self.communeForm.controls[id].setValue(e.params.data.id)
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.communeForm.value[id]);
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.communeForm.value[id]);
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.communeForm.value[id]);
          }
          self.setSelectRequredError(id, id)
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.communeForm.controls[id].setValue(null); 
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.communeForm.value[id]);
            self.regionData = [];
            self.departementData = [];
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.communeForm.value[id]);
            self.departementData = [];
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.communeForm.value[id]);
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

    /*setSelect2DefaultValue(id, value){
      $(function () {
        $('#'+id+' select').val(value); // Select the option with a value of '1'
        $('#'+id+' select').trigger('change');
      });
       
    }
  */
  
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
      let codes = [];
      if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
        indexes.forEach((i) => {
          codes.push(data[i].id);
        });
      }else{
        codes = indexes;
      }
      
  
      for(let i = 0; i < data.length; i++){
        if(codes.length == 0){
          break;
        }
        if(codes.indexOf(data[i].id) !== -1){
          codes.splice(codes.indexOf(data[i].id), 1);
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
      this.communesData.forEach((c) => {
        //console.log(p.codePays+'   '+this.selectedIndexes.indexOf(p.codePays)+'    '+this.selectedIndexes)
        if(this.selectedIndexes.indexOf(c.id) === -1){
          this.selectedIndexes.push(c.id);
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
          "dataLength": this.communesData.length,
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
        } else  if(dataReturned !== null && dataReturned.data == 'exporter') {
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
      let data = [...this.communesData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Communes_'+date+'.xls', blob).then(()=> {
          alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
      }).catch(()=>{
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
      });
    }
  
    exportCSV(){
      let data = [...this.communesData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Communes_'+date+'.csv', blob).then(()=> {
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
                this.servicePouchdb.findRelationalDocByID('commune', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.communes[0]).then((res) => {
                  }).catch((err) => {
                     this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                   });//fin delete
                 }).catch((err) => {
                   this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                 });//fin get
              });
              
              this.communesData = this.removeMultipleElem(this.communesData, this.selectedIndexes);
              this.allCommunesData = this.removeMultipleElem(this.allCommunesData, this.selectedIndexes);
              this.decocherTousElemListe();
              this.communesData = [...this.communesData];
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
      //this.communeForm = null;
      this.communeForm = this.formBuilder.group({
        nomPays: [null, Validators.required],
        codePays: [null, Validators.required],
        idPays: [null, Validators.required],
        nomRegion: [null, Validators.required],
        codeRegion: [null, Validators.required],
        idRegion: [null, Validators.required],
        nomDepartement: [null, Validators.required],
        codeDepartement: [null, Validators.required],
        idDepartement: [null, Validators.required],
        nom: [null, Validators.required],
        numero: [null, Validators.compose([NumeroCommuneValidator.validNumeroCommune(), Validators.maxLength(2), Validators.minLength(1), Validators.pattern('^[0-9A-Za-z]+$'), Validators.required])],
        code: [null, Validators.required],
        latitude: [null],
        longitude: [null],
      });

      this.validerNumeroCommune();
      /*this.communeForm.valueChanges.subscribe(change => {
        this.communeForm.get('numero').setValidators([NumeroCommuneValidator.uniqueNumeroCommune(this.communesData, this.communeForm.value.codeDepartement, 'ajouter'), NumeroCommuneValidator.validNumeroCommune(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });*/
    }
  
    editForm(cDoc){
      //this.communeForm = null;
      let commune = cDoc.communes[0];
      let codePays;
      let idPays;
      let nomPays;
      let idRegion;
      let codeRegion;
      let nomRegion;
      let idDepartement;
      let codeDepartement;
      let nomDepartement;
      if(cDoc.pays[0]){
        idPays = cDoc.pays[0].id;
        codePays = cDoc.pays[0].formData.code;
        nomPays = cDoc.pays[0].formData.nom;
      }

      if(cDoc.regions[0]){
        idRegion = cDoc.regions[0].id;
        codeRegion = cDoc.regions[0].formData.code;
        nomRegion = cDoc.regions[0].formData.nom;
      }

      if(cDoc.departements[0]){
        idDepartement = cDoc.departements[0].id;
        codeDepartement = cDoc.departements[0].formData.code;
        nomDepartement = cDoc.departements[0].formData.nom;
      }
      //this.unionForm = null;
      let c = commune.formData
      this.communeForm = this.formBuilder.group({
        nomPays: [nomPays, Validators.required],
        codePays: [codePays, Validators.required],
        idPays: [idPays, Validators.required],
        nomRegion: [nomRegion, Validators.required],
        codeRegion: [codeRegion, Validators.required],
        idRegion: [idRegion, Validators.required],
        nomDepartement: [nomDepartement, Validators.required],
        codeDepartement: [codeDepartement, Validators.required],
        idDepartement: [idDepartement, Validators.required],
        nom: [c.nom, Validators.required],
        numero: [c.numero, Validators.compose([NumeroCommuneValidator.validNumeroCommune(), Validators.maxLength(2), Validators.minLength(1), Validators.pattern('^[0-9A-Za-z]+$'), Validators.required])],
        code: [c.code, Validators.required],
        latitude: [c.latitude],
        longitude: [c.latitude],
      });

      this.validerNumeroCommune();
     /* this.communeForm.valueChanges.subscribe(change => {
        this.communeForm.get('numero').setValidators([NumeroCommuneValidator.uniqueNumeroCommune(this.communesData, this.communeForm.value.codeDepartement, 'ajouter'), NumeroCommuneValidator.validNumeroCommune(), Validators.maxLength(2), Validators.minLength(2), Validators.pattern('^[0-9]+$'), Validators.required]);
      });*/
    }

    validerNumeroCommune(){
      let numeroControl = this.communeForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndCode('commune', this.communeForm.value.codeDepartement + value).then((res) => {
          if(res && res.communes && res.communes[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.uneCommune.numero))){
            numeroControl.setErrors({uniqueNumeroCommune: true});
          }
        });
      });
    }
  
    ajouter(){
      this.doModification = false;
      if(this.idDepartement && this.idDepartement != ''){
        if(this.communeHTMLTable && this.communeHTMLTable.datatable && this.communeHTMLTable.datatable.row(0) && this.communeHTMLTable.datatable.row(0).data()){
          this.idRegion = this.communeHTMLTable.datatable.row(0).data().idRegion;
          this.idPays = this.communeHTMLTable.datatable.row(0).data().idPays;
          this.getPays();
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('departement', this.idDepartement).then((res) => {
            if(res && res.departements && res.departements[0]){
              this.idRegion = res.departements[0].region;
              this.idPays = res.departements[0].pays;
              this.getPays();
            }
          })
        }
      }else if(this.idRegion && this.idRegion != ''){
        if(this.communeHTMLTable && this.communeHTMLTable.datatable && this.communeHTMLTable.datatable.row(0) && this.communeHTMLTable.datatable.row(0).data()){
          this.idPays = this.communeHTMLTable.datatable.row(0).data().idPays;
          this.getPays();
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('region', this.idRegion).then((res) => {
            if(res && res.regions && res.regions[0]){
              this.idPays = res.regions[0].pays;
              this.getPays();
            }
          })
        }
      }else{
        this.getPays();
      }
    
      this.initForm();
      this.initSelect2('idPays', this.translate.instant('COMMUNE_PAGE.SELECTIONPAYS'));
      this.initSelect2('idRegion', this.translate.instant('COMMUNE_PAGE.SELECTIONREGION'));
      this.initSelect2('idDepartement', this.translate.instant('COMMUNE_PAGE.SELECTIONDEPARTEMENT'));
      this.action = 'ajouter';
    }
  
    infos(c){
      if(!this.estModeCocherElemListe){
        this.uneCommune = c;
        this.action = 'infos';
      }
    }

  
    modifier(c){
      this.doModification = true;
      this.servicePouchdb.findRelationalDocByID('commune', c.id).then((res) => {
        if(res && res.communes && res.communes[0]){
          this.getPays();
          this.getRegionParPays(c.idPays);
          this.getDepartementParRegion(c.idRegion);
          this.editForm(res);
          this.initSelect2('idPays', this.translate.instant('COMMUNE_PAGE.SELECTIONPAYS'));
          this.initSelect2('idRegion', this.translate.instant('COMMUNE_PAGE.SELECTIONREGION'));
          this.initSelect2('idDepartement', this.translate.instant('COMMUNE_PAGE.SELECTIONDEPARTEMENT'));
          //this.setSelect2DefaultValue('codePays', c.codePays)
          //this.setSelect2DefaultValue('codeRegion', c.codeRegion)
          //this.setSelect2DefaultValue('codeDepartement', c.codeDepartement)
          /*$('#numero input').ready(()=>{
            $('#numero input').attr('disabled', true)
          });*/

          this.uneCommune = c;
          this.uneCommuneDoc = res.communes[0];
          this.action ='modifier';
        }
      }).catch((err) => {
        alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
      })
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
              this.servicePouchdb.findRelationalDocByID('commune', c.id).then((res) => {
                this.servicePouchdb.deleteRelationalDocDefinitivement(res.communes[0]).then((res) => {
                  this.communesData.splice(this.communesData.indexOf(c), 1);
                  this.action = 'liste';
                  if(!this.mobile){
                    this.dataTableRemoveRows();
                    this.selectedIndexes = [];
                  }else{
                    this.communesData = [...this.communesData];
                    this.allCommunesData.splice(this.allCommunesData.indexOf(c), 1);
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

    async presentDepartement(idDepartement) {
      const modal = await this.modalController.create({
        component: DepartementPage,
        componentProps: { idDepartement: idDepartement },
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
                this.servicePouchdb.findRelationalDocByID('commune', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.communes[0]).then((res) => {
                  }).catch((err) => {
                     this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                   });//fin delete
                 }).catch((err) => {
                   this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                 });//fin get
              });
  
              //this.communesData = this.removeMultipleElem(this.communesData, this.selectedIndexes);
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
        //this.actualiserTableau(this.communesData);
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
          this.communesData = [...this.communesData];
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
          this.supprimer(this.uneCommune);
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
          this.supprimer(this.uneCommune);
        }
      });
      return await popover.present();
    }
    
    async presentDerniereModification(commune) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { _id: commune.id, _rev: commune.rev, security: commune.security },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      if(this.uneCommune.id && this.uneCommune.id != ''){
        this.servicePouchdb.findRelationalDocByID('commune', this.uneCommune.id).then((res) => {
          if(res && res.communes[0]){
            this.presentDerniereModification(res.communes[0]);
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
              this.infos(this.communesData[this.selectedIndexes[0]]);
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
              this.modifier(this.communesData[this.selectedIndexes[0]]);
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
            this.infos(this.communesData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.communesData[this.selectedIndexes[0]]);
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
        let row  = this.communeHTMLTable.datatable.row('.selected').index();
        let data  = this.communeHTMLTable.datatable.row(row).data();
        this.infos(data);
        //this.selectedIndexes = [];
     /* }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      }*/
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
        let row  = this.communeHTMLTable.datatable.row('.selected').index();
        let data  = this.communeHTMLTable.datatable.row(row).data();
        this.modifier(data);
        //this.selectedIndexes = [];
     /* }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      }*/
    }
  
    async openRelationCommune(ev: any/*, code*/) {
      const popover = await this.popoverController.create({
        component: RelationsCommuneComponent,
        event: ev,
        translucent: true,
        componentProps: {"idCommune": this.uneCommune.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'localite') {
          this.presentLocalite(this.uneCommune.id);
        }
  
      });
      return await popover.present();
    }

    
  async openRelationCommuneDepuisListe(ev: any/*, codePays*/) {
    const popover = await this.popoverController.create({
      component: RelationsCommuneComponent,
      event: ev,
      translucent: true,
      componentProps: {"idCommune": this.selectedIndexes[0]},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onWillDismiss().then((dataReturned) => {
      if(dataReturned !== null && dataReturned.data == 'localite') {
        this.presentLocalite(this.selectedIndexes[0]);
      }

    });
    return await popover.present();
  }


    async presentLocalite(idCommune) {
      const modal = await this.modalController.create({
        component: LocalitePage,
        componentProps: { idCommune: idCommune },
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
      //let communeData = this.communeForm.value;
      let formData = this.communeForm.value;
      let formioData = {};
      if(this.action === 'ajouter'){
        let commune: any = {
          //id: formData.code,
          type: 'commune',
          pays: formData.idPays,
          region: formData.idRegion,
          departement: formData.idDepartement,
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

        commune.security = this.servicePouchdb.garderCreationTrace(commune.security);
        delete commune.security['archived'];
  

        let doc = this.clone(commune);
        delete doc.formData.idPays;
        delete doc.formData.codePays;
        delete doc.formData.nomPays;
        delete doc.formData.idRegion;
        delete doc.formData.codeRegion;
        delete doc.formData.nomRegion;
        delete doc.formData.idDepartement;
        delete doc.formData.codeDepartement;
        delete doc.formData.nomDepartement;

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let communeData = {id: res.communes[0].id, ...commune.formData, ...commune.formioData, ...commune.security};
          //this.unions = union;
          this.action = 'liste';

          //this.rechargerListeMobile = true;
          if (!this.mobile){
            //mode tableau, ajout d'un autre union dans la liste
            this.dataTableAddRow(communeData)
          }else{
            //mobile, cache la liste des union pour mettre à jour la base de données
            this.communesData.push(communeData);
            this.communesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.communesData = [...this.communesData];

            this.allCommunesData.push(communeData);
            this.allCommunesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
          }

          //libérer la mémoire occupée par la liste des departement
          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });



      }else{

        //si modification
        this.uneCommuneDoc.pays = formData.idPays;
        this.uneCommuneDoc.region = formData.idRegion
        this.uneCommuneDoc.departement = formData.idDepartement
        this.uneCommuneDoc.formData = formData;
        this.uneCommuneDoc.formioData = formioData;

        this.uneCommuneDoc.security = this.servicePouchdb.garderUpdateTrace(this.uneCommuneDoc.security);

        let doc = this.clone(this.uneCommuneDoc);
        delete doc.formData.idPays;
        delete doc.formData.codePays;
        delete doc.formData.nomPays;
        delete doc.formData.idRegion;
        delete doc.formData.codeRegion;
        delete doc.formData.nomRegion;
        delete doc.formData.idDepartement;
        delete doc.formData.codeDepartement;
        delete doc.formData.nomDepartement;

        this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
          //this.unions._rev = res.rev;
          //this.uneUnionDoc._rev = res.rev;
          let communeData = {id: this.uneCommuneDoc.id, ...this.uneCommuneDoc.formData, ...this.uneCommuneDoc.formioData, ...this.uneCommuneDoc.security};

          this.action = 'infos';
          this.infos(communeData);

          if(this.mobile){
            //mode liste
            //cache la liste pour le changement dans virtual Scroll
            //mise à jour dans la liste
            for(let i = 0; i < this.communesData.length; i++){
              if(this.communesData[i].id== communeData.id){
                this.communesData[i] = communeData;
                break;
              }
            }

            this.communesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //mise à jour dans la liste cache
            for(let i = 0; i < this.allCommunesData.length; i++){
              if(this.allCommunesData[i].id == communeData.id){
                this.allCommunesData[i] = communeData;
                break;
              }
            }

            this.allCommunesData.sort((a, b) => {
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
            this.dataTableUpdateRow(communeData);
          }

          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
          this.uneCommuneDoc = null;

        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }
    }

  
    actualiserTableau(data){
      if(this.idPays && this.idPays != ''){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#commune-pays').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.communeHTMLTable = createDataTable("commune-pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.communeHTMLTable = createDataTable("commune-pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.communeHTMLTable = createDataTable("commune-pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.communeHTMLTable = createDataTable("commune-pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
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
                this.communeHTMLTable = createDataTable("commune", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.communeHTMLTable = createDataTable("commune", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.communeHTMLTable = createDataTable("commune", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.communeHTMLTable = createDataTable("commune", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
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
      if((this.idPays && this.idPays != '') || (this.idRegion && this.idRegion != '') || (this.idDepartement && this.idDepartement != '')){
        let type;
        let idType;
        if(this.idDepartement){
          type = 'departement';
          idType = this.idDepartement;
        }else if(this.idRegion){
          type = 'region';
          idType = this.idRegion;
        }else{
          type = 'pays';
          idType = this.idPays;
        }

        this.servicePouchdb.findRelationalDocHasMany('commune', type, idType).then((res) => {
          if(res && res.communes){
            let communesData = [];
            this.allCommunesData = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let idPays;
            let idRegion;
            let idDepartement;
            for(let c of res.communes){
              if(isDefined(paysIndex[c.pays])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomPays', res.pays[paysIndex[c.pays]].formData.nom, 0);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codePays', res.pays[paysIndex[c.pays]].formData.code, 1);
                idPays =  res.pays[paysIndex[c.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == c.pays){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[c.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[c.region])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomRegion', res.regions[regionIndex[c.region]].formData.nom, 2);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeRegion', res.regions[regionIndex[c.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[c.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == c.region){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    regionIndex[c.region] = i;
                    idRegion  = res.regions[i].id;
                    break;
                  }
                }
              }

              if(isDefined(departementIndex[c.departement])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomDepartement', res.departements[departementIndex[c.departement]].formData.nom, 4);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeDepartement', res.departements[departementIndex[c.departement]].formData.code, 5);
                idDepartement = res.departements[departementIndex[c.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == c.departement){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomDepartement', res.departements[i].formData.nom, 4);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeDepartement', res.departements[i].formData.code, 5);
                    departementIndex[c.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }


              communesData.push({id: c.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, ...c.formData, ...c.formioData, ...c.security})
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#commune-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = createDataTable("commune-pays", this.colonnes, communesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = createDataTable("commune-pays", this.colonnes, communesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            } else if(this.mobile){
              this.communesData = communesData;
              this.communesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allCommunesData = [...this.communesData]
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.communes = [];
            if(this.mobile){
              this.communesData = [];
              this.allCommunesData = [];
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
            }
        }).catch((err) => {
          console.log('Erreur acces à la commune ==> '+err)
          this.communes = [];
          if(this.mobile){
            this.communesData = [];
            this.allCommunesData = [];
          }
          this.selectedIndexes = [];
          if(event)
            event.target.complete();
        });
    
      }else{
        this.servicePouchdb.findAllRelationalDocByType('commune').then((res) => {
          if(res && res.communes){
            let communesData = [];
            this.allCommunesData = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let idPays;
            let idRegion;
            let idDepartement;
            for(let c of res.communes){
              if(isDefined(paysIndex[c.pays])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomPays', res.pays[paysIndex[c.pays]].formData.nom, 0);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codePays', res.pays[paysIndex[c.pays]].formData.code, 1);
                idPays =  res.pays[paysIndex[c.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == c.pays){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[c.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[c.region])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomRegion', res.regions[regionIndex[c.region]].formData.nom, 2);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeRegion', res.regions[regionIndex[c.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[c.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == c.region){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    regionIndex[c.region] = i;
                    idRegion  = res.regions[i].id;
                    break;
                  }
                }
              }

              if(isDefined(departementIndex[c.departement])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomDepartement', res.departements[departementIndex[c.departement]].formData.nom, 4);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeDepartement', res.departements[departementIndex[c.departement]].formData.code, 5);
                idDepartement = res.departements[departementIndex[c.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == c.departement){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomDepartement', res.departements[i].formData.nom, 4);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeDepartement', res.departements[i].formData.code, 5);
                    departementIndex[c.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }


              communesData.push({id: c.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, ...c.formData, ...c.formioData, ...c.security})
            }
            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#commune').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = createDataTable("commune", this.colonnes, communesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = createDataTable("commune", this.colonnes, communesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.communesData = communesData;
              this.communesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allCommunesData = [...this.communesData]
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.communes = [];
            if(this.mobile){
              this.communesData = [];
              this.allCommunesData = [];
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la commune ==> '+err)
          this.communes = [];
          if(this.mobile){
            this.communesData = [];
            this.allCommunesData = [];
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
  
    getCommune(){

      if(this.idCommune && this.idCommune != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('commune', this.idCommune).then((res) => {
          if(res && res.communes){
            res.communes[0].formData = this.addItemToObjectAtSpecificPosition(res.communes[0].formData, 'nomPays', res.pays[0].formData.nom, 0);    
            res.communes[0].formData = this.addItemToObjectAtSpecificPosition(res.communes[0].formData, 'codePays', res.pays[0].formData.code, 1);
            res.communes[0].formData = this.addItemToObjectAtSpecificPosition(res.communes[0].formData, 'nomRegion', res.regions[0].formData.nom, 2);  
            res.communes[0].formData = this.addItemToObjectAtSpecificPosition(res.communes[0].formData, 'codeRegion', res.regions[0].formData.code, 3);
            res.communes[0].formData = this.addItemToObjectAtSpecificPosition(res.communes[0].formData, 'nomDepartement', res.departements[0].formData.nom, 4);    
            res.communes[0].formData = this.addItemToObjectAtSpecificPosition(res.communes[0].formData, 'codeDepartement', res.departements[0].formData.code, 5);
            
            this.uneCommune = {id: res.communes[0].id, idPays: res.pays[0].id, idRegion: res.regions[0].id, idDepartement: res.departements[0].id, ...res.communes[0].formData, ...res.communes[0].formioData, ...res.communes[0].security};
            this.infos(this.uneCommune);
          }
        }).catch((err) => {
          this.communesData = [];
          this.allCommunesData = [];
          console.log(err)
        });
      }else if((this.idPays && this.idPays != '') || (this.idRegion && this.idRegion != '') || (this.idDepartement && this.idDepartement != '')){
        let type;
        let idType;
        if(this.idDepartement){
          type = 'departement';
          idType = this.idDepartement;
        }else if(this.idRegion){
          type = 'region';
          idType = this.idRegion;
        }else{
          type = 'pays';
          idType = this.idPays;
        }
        

        this.servicePouchdb.findRelationalDocHasMany('commune', type, idType).then((res) => {
          if(res && res.communes){
            let communesData = [];
            this.allCommunesData = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let idPays;
            let idRegion;
            let idDepartement;
            for(let c of res.communes){
              if(isDefined(paysIndex[c.pays])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomPays', res.pays[paysIndex[c.pays]].formData.nom, 0);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codePays', res.pays[paysIndex[c.pays]].formData.code, 1);
                idPays =  res.pays[paysIndex[c.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == c.pays){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[c.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[c.region])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomRegion', res.regions[regionIndex[c.region]].formData.nom, 2);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeRegion', res.regions[regionIndex[c.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[c.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == c.region){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    regionIndex[c.region] = i;
                    idRegion  = res.regions[i].id;
                    break;
                  }
                }
              }

              if(isDefined(departementIndex[c.departement])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomDepartement', res.departements[departementIndex[c.departement]].formData.nom, 4);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeDepartement', res.departements[departementIndex[c.departement]].formData.code, 5);
                idDepartement = res.departements[departementIndex[c.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == c.departement){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomDepartement', res.departements[i].formData.nom, 4);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeDepartement', res.departements[i].formData.code, 5);
                    departementIndex[c.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }


              communesData.push({id: c.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, ...c.formData, ...c.formioData, ...c.security})
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#commune-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = createDataTable("commune-pays", this.colonnes, communesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = createDataTable("commune-pays", this.colonnes, communesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.communesData = communesData;
              this.communesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allCommunesData = [...this.allCommunesData];
            }
          
          }
        }).catch((err) => {
          this.communesData = [];
          this.allCommunesData = [];
          console.log(err)
        });

      }else{
        this.servicePouchdb.findAllRelationalDocByType('commune').then((res) => {
          if(res && res.communes){
            let communesData = [];
            this.allCommunesData = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let idPays;
            let idRegion;
            let idDepartement;
            for(let c of res.communes){
              if(isDefined(paysIndex[c.pays])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomPays', res.pays[paysIndex[c.pays]].formData.nom, 0);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codePays', res.pays[paysIndex[c.pays]].formData.code, 1);
                idPays =  res.pays[paysIndex[c.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == c.pays){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[c.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[c.region])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomRegion', res.regions[regionIndex[c.region]].formData.nom, 2);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeRegion', res.regions[regionIndex[c.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[c.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == c.region){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    regionIndex[c.region] = i;
                    idRegion  = res.regions[i].id;
                    break;
                  }
                }
              }

              if(isDefined(departementIndex[c.departement])){
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomDepartement', res.departements[departementIndex[c.departement]].formData.nom, 4);
                c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeDepartement', res.departements[departementIndex[c.departement]].formData.code, 5);
                idDepartement = res.departements[departementIndex[c.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == c.departement){
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'nomDepartement', res.departements[i].formData.nom, 4);
                    c.formData = this.addItemToObjectAtSpecificPosition(c.formData, 'codeDepartement', res.departements[i].formData.code, 5);
                    departementIndex[c.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }


              communesData.push({id: c.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, ...c.formData, ...c.formioData, ...c.security})
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#commune').ready(()=>{
                if(global.langue == 'en'){
                  this.communeHTMLTable = createDataTable("commune", this.colonnes, communesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.communeHTMLTable = createDataTable("commune", this.colonnes, communesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.communeHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.communesData = communesData;

              this.communesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allCommunesData = [...this.communesData]
            }
          }
        }).catch((err) => {
          this.communesData = [];
          this.allCommunesData = [];
          console.log(err)
        });
      }
    }
  
    
  
    getPays(){
      this.paysData = [];
      if(this.idPays && this.idPays != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('pays', this.idPays).then((res) => {
          if(res && res.pays){
            this.paysData.push({id: res.pays[0].id, ...res.pays[0].formData});
            if(this.doModification){
              this.setSelect2DefaultValue('idPays', this.uneCommune.idPays);
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
              this.setSelect2DefaultValue('idPays', this.uneCommune.idPays);
            }
          }
        }).catch((e) => {
          console.log('pays erreur: '+e);
          this.paysData = [];
        });
      }
    }

    getRegionParPays(idPays){
      this.regionData = [];
      this.departementData = [];
      if(this.idRegion && this.idRegion != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('region', this.idRegion).then((res) => {
          if(res && res.regions && res.regions[0]){
            this.regionData.push({id: res.regions[0].id, ...res.regions[0].formData});
            if(this.doModification){
              this.setSelect2DefaultValue('idRegion', this.uneCommune.idRegion);
            } else {
              this.setSelect2DefaultValue('idRegion', this.idRegion);
              $('#idRegion select').ready(()=>{
                $('#idRegion select').attr('disabled', true)
              });
            }
            this.setIDCodeEtNomRegion(res.regions[0].formData);
            this.getDepartementParRegion(this.idRegion);
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
              this.setSelect2DefaultValue('idRegion', this.uneCommune.idRegion);
            }
          }
        }).catch((e) => {
          console.log('region erreur: '+e);
          this.regionData = [];
        });
      }
    }

    getDepartementParRegion(idRegion){
      this.departementData = [];
      if(this.idDepartement && this.idDepartement != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('departement', this.idDepartement).then((res) => {
          if(res && res.departements && res.departements[0]){
            this.departementData.push(res.departements[0].formData);
            if(this.doModification){
              this.setSelect2DefaultValue('idDepartement', this.uneCommune.idDepartement);
            } else {
              this.setSelect2DefaultValue('idDepartement', this.idDepartement);
              $('#idDepartement select').ready(()=>{
                $('#idDepartement select').attr('disabled', true)
              });
            }
            this.setCodeEtNomDepartement(res.departements[0].formData);
          }
        }).catch((e) => {
          console.log('departement erreur: '+e);
          this.departementData = [];
        });
      }else{
        this.servicePouchdb.findRelationalDocHasMany('departement', 'region', idRegion).then((res) => {
          if(res && res.departements){
            this.departementData = [];
            //var datas = [];
            for(let d of res.departements){
              this.departementData.push({id: d.id, ...d.formData});
            }

            this.departementData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            if(this.doModification){
              this.setSelect2DefaultValue('idDepartement', this.uneCommune.idDepartement);
            }
          }
        }).catch((e) => {
          console.log('departement erreur: '+e);
          this.departementData = [];
        });
      }
    }

    setCodeAndNomPays(idPays){
      if(idPays && idPays != ''){
        for(let p of this.paysData){
          if(idPays == p.id){
            this.communeForm.controls.codePays.setValue(p.code);
            this.communeForm.controls.nomPays.setValue(p.nom);
            
            this.communeForm.controls.idRegion.setValue(null);
            this.communeForm.controls.codeRegion.setValue(null);
            this.communeForm.controls.nomRegion.setValue(null);

            this.communeForm.controls.idDepartement.setValue(null);
            this.communeForm.controls.codeDepartement.setValue(null);
            this.communeForm.controls.nomDepartement.setValue(null);
            
            this.communeForm.controls.code.setValue(null);
            this.communeForm.controls.numero.setValue(null);

            this.getRegionParPays(idPays)
            break;
          }
        }
      }else{
        this.communeForm.controls.idRegion.setValue(null);
        this.communeForm.controls.codeRegion.setValue(null);
        this.communeForm.controls.nomRegion.setValue(null);

        this.communeForm.controls.idDepartement.setValue(null);
        this.communeForm.controls.nomDepartement.setValue(null);
        this.communeForm.controls.codeDepartement.setValue(null);

        this.communeForm.controls.code.setValue(null);
        this.communeForm.controls.numero.setValue(null);
      }
    }

    setCodeAndNomRegion(idRegion){
      if(idRegion && idRegion != ''){
        for(let r of this.regionData){
          if(idRegion == r.id){
            this.communeForm.controls.codeRegion.setValue(r.code);
            this.communeForm.controls.nomRegion.setValue(r.nom);
            this.communeForm.controls.idDepartement.setValue(null);
            this.communeForm.controls.codeDepartement.setValue(null);
            this.communeForm.controls.nomDepartement.setValue(null);

            this.communeForm.controls.code.setValue(null);
            this.communeForm.controls.numero.setValue(null);

            this.getDepartementParRegion(idRegion)
            break;
          }
        }
      }else{
        this.communeForm.controls.idDepartement.setValue(null);
        this.communeForm.controls.codeDepartement.setValue(null);
        this.communeForm.controls.nomDepartement.setValue(null);

        this.communeForm.controls.code.setValue(null);
        this.communeForm.controls.numero.setValue(null);
      }
    }

    setCodeAndNomDepartement(idDepartement){
      if(idDepartement && idDepartement != ''){
        for(let d of this.departementData){
          if(idDepartement == d.id){
            this.communeForm.controls.codeDepartement.setValue(d.code);
            this.communeForm.controls.nomDepartement.setValue(d.nom);
            this.communeForm.controls.numero.setValue(null);
            this.communeForm.controls.code.setValue(null);
            break;
          }
        }
      }else {
        this.communeForm.controls.numero.setValue(null);
        this.communeForm.controls.code.setValue(null);
      }
    }
  
    setIDCodeEtNomPays(paysData){
      this.communeForm.controls.idPays.setValue(paysData.id);
      this.communeForm.controls.codePays.setValue(paysData.code);
      this.communeForm.controls.nomPays.setValue(paysData.nom);
    }

    setIDCodeEtNomRegion(regionData){
      this.communeForm.controls.idRegion.setValue(regionData.id);
      this.communeForm.controls.codeRegion.setValue(regionData.code);
      this.communeForm.controls.nomRegion.setValue(regionData.nom);
    }

    setCodeEtNomDepartement(departementData){
      this.communeForm.controls.codeDepartement.setValue(departementData.code);
      this.communeForm.controls.nomDepartement.setValue(departementData.nom);
    }

    setCodeCommune(numero){
      if(numero && numero != ''){
        this.communeForm.controls.code.setValue(this.communeForm.controls.codeDepartement.value + numero);
      }
    }

    attacheEventToDataTable(datatable){
      var self = this;
      var id = '';
      if(this.idPays && this.idPays != ''){
        id = 'commune-pays-datatable';
      }else{ 
        id = 'commune-datatable';
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
      this.translateDataTableCollumn();
    }
  
    translateDataTableCollumn(){
      var id = '';
      if(this.idPays && this.idPays != ''){
        id = 'commune-pays-datatable';
      }else{ 
        id = 'commune-datatable';
      }


      var self = this;
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[0].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.NOM');
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[1].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.CODEPAYS');
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[2].firstChild.nodeValue = this.translate.instant('REGION_PAGE.NOM');
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[3].firstChild.nodeValue = this.translate.instant('REGION_PAGE.CODE');
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[4].firstChild.nodeValue = this.translate.instant('DEPARTEMENT_PAGE.NOM');
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[5].firstChild.nodeValue = this.translate.instant('DEPARTEMENT_PAGE.CODE');      
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[6].firstChild.nodeValue = this.translate.instant('COMMUNE_PAGE.NOM');
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[7].firstChild.nodeValue = this.translate.instant('COMMUNE_PAGE.NUMERO');
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[8].firstChild.nodeValue = this.translate.instant('COMMUNE_PAGE.CODE');    
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[9].firstChild.nodeValue = this.translate.instant('GENERAL.LATITUDE');
      $(self.communeHTMLTable.datatable.table().header()).children(1)[0].children[10].firstChild.nodeValue = this.translate.instant('GENERAL.LONGITUDE');
      
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }

  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //code commune
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.CODECOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.code[0].message = res;
      });

      //numéro commune
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numero[0].message = res;
      });
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.MINLENGTH').subscribe((res: string) => {
        this.messages_validation.numero[1].message = res;
      });
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.MAXLENGTH').subscribe((res: string) => {
        this.messages_validation.numero[2].message = res;
      });
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.PATTERN').subscribe((res: string) => {
        this.messages_validation.numero[3].message = res;
      });
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.VALIDNUMEROCOMMUNE').subscribe((res: string) => {
        this.messages_validation.numero[4].message = res;
      });

      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NUMEROCOMMUNE.UNIQUENUMEROCOMMUNE').subscribe((res: string) => {
        this.messages_validation.numero[5].message = res;
      });
  
      //nom commune
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.NOMCOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });

      //code pays
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPays[0].message = res;
      });


       //pays loading
       this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.PAYSLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.paysLoading[0].message = res;
      });

      //code région
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idRegion[0].message = res;
      });

       //région loading
       this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.REGIONLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.regionLoading[0].message = res;
      });

      //code département
      this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idDepartement[0].message = res;
      });

       //département loading
       this.translate.get('COMMUNE_PAGE.MESSAGES_VALIDATION.DEPARTEMENTLOADING.LOADING').subscribe((res: string) => {
        this.messages_validation.departementLoading[0].message = res;
      });
    }

    dataTableAddRow(rowData){

      this.communeHTMLTable.datatable.row.add(rowData).draw();
    }
  
    dataTableUpdateRow(/*index, */rowData){

  
      this.communeHTMLTable.datatable.row('.selected').data(rowData).draw();
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      this.communeHTMLTable.datatable.rows('.selected').remove().draw();
    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.communeHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.communeHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.communeHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    /*var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'commune-pays-datatable';
    }else{ 
      id = 'commune-datatable';
    }

    $('#'+id+' thead tr:eq(1)').show();*/
    var self = this;
    $(self.communeHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
    this.recherchePlus = true;
  }

  dataTableRemoveRechercheParColonne(){
    /*var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'commune-pays-datatable';
    }else{ 
      id = 'commune-datatable';
    }

    $('#'+id+' thead tr:eq(1)').hide();*/

    var self = this;
    $(self.communeHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

    
  dataTableAddCustomFiltre(){
    var id = '';
    if(this.idPays && this.idPays != ''){
      id = 'commune-pays-datatable';
    }else{ 
      id = 'commune-datatable';
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
      $( self.communeHTMLTable.datatable.table().footer() ).show();
      this.communeHTMLTable.datatable.columns().every( function () {
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
                  
                  var info = self.communeHTMLTable.datatable.page.info();
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

      this.communeHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
        if(!$('#'+id+colIdx).attr('style') && visibility){
            $('#'+id+colIdx).selectpicker();
              $('.ms-parent').removeAttr("style");
          }
      });

      this.filterAjouter = true;
      this.filterInitialiser = true;

    } else if(!this.filterAjouter && this.filterInitialiser){
      //$('#'+id+' tfoot').show();
      $( self.communeHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }


  dataTableRemoveCustomFiltre(){
    var id = '';
    if(this.idPays && this.idPays != ''){
      id = 'commune-pays-datatable';
    }else{ 
      id = 'commune-datatable';
    }
    var self = this;
    $( self.communeHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }


  
    async close(){
      await this.modalController.dismiss();
    }
  

    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        this.communesData = this.allCommunesData.filter((item) => {
          return item.numero.toLowerCase().indexOf(val) !== -1 || item.code.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || item.codeDepartement.toLowerCase().indexOf(val) !== -1 || item.nomDepartement.toLowerCase().indexOf(val) !== -1 || item.codeRegion.toLowerCase().indexOf(val) !== -1 || item.nomRegion.toLowerCase().indexOf(val) !== -1 || item.codePays.toLowerCase().indexOf(val) !== -1 || item.nomPays.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.communeData = temp;
      
    }
  
    


    
    ionViewDidEnter(){ 
       
    }
    
}
