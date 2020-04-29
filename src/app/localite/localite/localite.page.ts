import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NumeroLocaliteValidator } from '../../validators/localite.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsLocaliteComponent } from '../../component/relations-localite/relations-localite.component';
import { global } from '../../../app/globale/variable';
import { PaysPage } from '../pays/pays.page';
import { RegionPage } from '../region/region.page';
import { DepartementPage } from '../departement/departement.page';
import { CommunePage } from '../commune/commune.page';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { ListeMoreComponent } from 'src/app/component/liste-more/liste-more.component';
import { isDefined } from '@angular/compiler/src/util';
import { ListeActionComponent } from 'src/app/component/liste-action/liste-action.component';
import { DerniereModificationComponent } from 'src/app/component/derniere-modification/derniere-modification.component';
import { DatatableConstructComponent } from 'src/app/component/datatable-construct/datatable-construct.component';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
//declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-localite',
  templateUrl: './localite.page.html',
  styleUrls: ['./localite.page.scss'],
})
export class LocalitePage implements OnInit {

  @Input() idPays: string;
  @Input() idRegion: string;
  @Input() idDepartement: string;
  @Input() idCommune: string;
  @Input() idLocalite: string;
  localiteForm: FormGroup;
  action: string = 'liste';
  localites: any;
  localitesData: any = [];
  allLocalitesData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  communeData: any = [];
  typesLocalite = [];
  unLocalite: any;
  unLocaliteDoc: any;
  localiteHTMLTable: any;
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
  colonnes = ['nomPays', 'codePays', 'nomRegion', 'codeRegion', 'nomDepartement', 'codeDepartement', 'nomCommune', 'codeCommune', 'nom', 'numero', 'code', 'type', 'autreType', 'latitude', 'longitude']

  messages_validation = {
    'code': [
        { type: 'required', message: '' },
      ],
    'numero': [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' },
      { type: 'maxlength', message: '' },
      { type: 'pattern', message: '' },
      { type: 'validNumeroLocalite', message: '' },
      { type: 'uniqueNumeroLocalite', message: '' }
    ],
    'nom': [
      { type: 'required', message: '' }
    ],
    'type': [
      { type: 'required', message: '' }
    ],
    'autreType': [
      { type: 'required', message: '' }
    ],
    'idPays': [
      { type: 'required', message: '' }
    ],
    'idRegion': [
      { type: 'required', message: '' }
    ],
    'idDepartement': [
      { type: 'required', message: '' }
    ],
    'idCommune': [
      { type: 'required', message: '' }
    ],
   
  }

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la localite est en mode modal, on chercher info region
      /*if(this.code && this.code != ''){
        this.codeCommune = this.code.substr(0, 9);
      }
      if(this.codeCommune && this.codeCommune != ''){
        this.codeDepartement = this.codeCommune.substr(0, 7);
      }
      if(this.codeDepartement && this.codeDepartement != ''){
        this.codeRegion = this.codeDepartement.substr(0, 5);
      }
      if(this.codeRegion && this.codeRegion != ''){
        this.codePays = this.codeRegion.substr(0, 2);
      }*/
      this.translateLangue();
      this.getLocalite();
      this.translateChoixNiveau();
    }
  

    translateChoixNiveau(){
      for(let i = 1; i <= 6; i++){
        this.translate.get('LOCALITE_PAGE.CHOIXTYPE.'+i).subscribe((res: string) => {
          this.typesLocalite.push({id: i, val: res});
        });
      }
    }
    /*changeStyle(){
      if(this.styleAffichage == 'liste'){
        this.styleAffichage = 'tableau';
        this.htmlTableAction = 'recharger';
        this.actualiserTableau(this.localitesData);
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
        this.actualiserTableau(this.localitesData);
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
      if(this.localiteForm.get(filedName).errors && (this.localiteForm.get(filedName).dirty || this.localiteForm.get(filedName).touched)){
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
      if(this.localiteForm.get(filedName).errors){
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
          self.localiteForm.controls[id].setValue(e.params.data.id)
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.localiteForm.value[id]);
            self.departementData = [];
            self.communeData = [];
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.localiteForm.value[id]);
            self.communeData = [];
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.localiteForm.value[id]);
          }else if(id == 'idCommune'){
            self.setCodeAndNomCommune(self.localiteForm.value[id]);
          }
          self.setSelectRequredError(id, id)
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.localiteForm.controls[id].setValue(null); 
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.localiteForm.value[id]);
            self.regionData = [];
            self.departementData = [];
            self.communeData = [];
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.localiteForm.value[id]);
            self.departementData = [];
            self.communeData = [];
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.localiteForm.value[id]);
            self.communeData = [];
          }if(id == 'idCommune'){
            self.setCodeAndNomCommune(self.localiteForm.value[id]);
            self.communeData = [];
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
      this.localitesData.forEach((l) => {
        //console.log(p.codePays+'   '+this.selectedIndexes.indexOf(p.codePays)+'    '+this.selectedIndexes)
        if(this.selectedIndexes.indexOf(l.id) === -1){
          this.selectedIndexes.push(l.id);
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
          "dataLength": this.localitesData.length,
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
        } else if(dataReturned !== null && dataReturned.data == 'exporter') {
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
      let data = [...this.localitesData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Localites_'+date+'.xls', blob).then(()=> {
          alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
      }).catch(()=>{
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
      });
    }
  
    exportCSV(){
      let data = [...this.localitesData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Localites_'+date+'.csv', blob).then(()=> {
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
                this.servicePouchdb.findRelationalDocByID('localite', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.localites[0]).then((res) => {
                  }).catch((err) => {
                     this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                   });//fin delete
                 }).catch((err) => {
                   this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                 });//fin get
              });
              
              this.localitesData = this.removeMultipleElem(this.localitesData, this.selectedIndexes);
              this.allLocalitesData = this.removeMultipleElem(this.allLocalitesData, this.selectedIndexes);
              this.decocherTousElemListe();
              this.localitesData = [...this.localitesData];
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
      //this.localiteForm = null;
      this.localiteForm = this.formBuilder.group({
        nomPays: [null, Validators.required],
        codePays: [null, Validators.required],
        idPays: [null, Validators.required],
        nomRegion: [null, Validators.required],
        codeRegion: [null, Validators.required],
        idRegion: [null, Validators.required],
        nomDepartement: [null, Validators.required],
        codeDepartement: [null, Validators.required],
        idDepartement: [null, Validators.required],
        nomCommune: [null, Validators.required],
        codeCommune: [null, Validators.required],
        idCommune: [null, Validators.required],
        nom: [null, Validators.required],
        numero: [null, Validators.compose([NumeroLocaliteValidator.validNumeroLocalite(), Validators.maxLength(3), Validators.minLength(1), Validators.pattern('^[0-9A-Za-z]+$'), Validators.required])],
        code: [null, {disabled: true}, Validators.required],
        type: [null, Validators.required],
        autreType: [null],
        latitude: [null],
        longitude: [null],
      });

      this.validerNumeroLocalite();
      /*this.localiteForm.valueChanges.subscribe(change => {
        this.localiteForm.get('numero').setValidators([NumeroLocaliteValidator.uniqueNumeroLocalite(this.localitesData, this.localiteForm.value.codeCommune, 'ajouter'), NumeroLocaliteValidator.validNumeroLocalite(), Validators.maxLength(3), Validators.minLength(3), Validators.pattern('^[0-9]+$'), Validators.required]);
      });*/

    }
  
    editForm(vDoc){
      //this.localiteForm = null;
      let localite = vDoc.localites[0];
      let idPays;
      let codePays;
      let nomPays;
      let idRegion;
      let codeRegion;
      let nomRegion;
      let idDepartement;
      let codeDepartement;
      let nomDepartement;
      let idCommune;
      let codeCommune;
      let nomCommune;
      if(vDoc.pays[0]){
        idPays = vDoc.pays[0].id;
        codePays = vDoc.pays[0].formData.code;
        nomPays = vDoc.pays[0].formData.nom;
      }

      if(vDoc.regions[0]){
        idRegion = vDoc.regions[0].id;
        codeRegion = vDoc.regions[0].formData.code;
        nomRegion = vDoc.regions[0].formData.nom;
      }

      if(vDoc.departements[0]){
        idDepartement = vDoc.departements[0].id;
        codeDepartement = vDoc.departements[0].formData.code;
        nomDepartement = vDoc.departements[0].formData.nom;
      }

      if(vDoc.communes[0]){
        idCommune = vDoc.communes[0].id;
        codeCommune = vDoc.communes[0].formData.code;
        nomCommune = vDoc.communes[0].formData.nom;
      }

      let l = localite.formData

      this.localiteForm = this.formBuilder.group({
        nomPays: [nomPays, Validators.required],
        codePays: [codePays, Validators.required],
        idPays: [idPays, Validators.required],
        nomRegion: [nomRegion, Validators.required],
        codeRegion: [codeRegion, Validators.required],
        idRegion: [idRegion, Validators.required],
        nomDepartement: [nomDepartement, Validators.required],
        codeDepartement: [codeDepartement, Validators.required],
        idDepartement: [idDepartement, Validators.required],
        nomCommune: [nomCommune, Validators.required],
        codeCommune: [codeCommune, Validators.required],
        idCommune: [idCommune, Validators.required],
        nom: [l.nom, Validators.required],
        numero: [l.numero, Validators.compose([NumeroLocaliteValidator.validNumeroLocalite(), Validators.maxLength(3), Validators.minLength(1), Validators.pattern('^[0-9A-Za-z]+$'), Validators.required])],
        code: [l.code, Validators.required],
        type: [l.type, Validators.required],
        autreType: [l.autreType],
        latitude: [l.latitude],
        longitude: [l.latitude],
 
      });

      this.validerNumeroLocalite();
      /*this.localiteForm.valueChanges.subscribe(change => {
        this.localiteForm.get('numero').setValidators([NumeroLocaliteValidator.uniqueNumeroLocalite(this.localitesData, this.localiteForm.value.codeCommune, 'ajouter'), NumeroLocaliteValidator.validNumeroLocalite(), Validators.maxLength(3), Validators.minLength(3), Validators.pattern('^[0-9]+$'), Validators.required]);
      });*/
    }

    validerNumeroLocalite(){
      let numeroControl = this.localiteForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndCode('localite', this.localiteForm.value.codeCommune + value).then((res) => {
          if(res && res.localites && res.localites[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.unLocalite.numero))){
            numeroControl.setErrors({uniqueNumeroLocalite: true});
          }
        });    
      });

      let typeControl = this.localiteForm.controls['type'];
      let autreTypeControl = this.localiteForm.controls['autreType'];
      typeControl.valueChanges.subscribe((value) => {
        if(value == 6 && (!autreTypeControl.value || autreTypeControl.value == '')){
          this.localiteForm.controls['autreType'].setValidators(Validators.required)
        }else {
          this.localiteForm.controls['autreType'].clearValidators();
          this.localiteForm.controls['autreType'].reset(null);
        }
      });
    }
  
    ajouter(){
      this.doModification = false;

      if(this.idCommune && this.idCommune != ''){
        if(this.localiteHTMLTable && this.localiteHTMLTable.datatable && this.localiteHTMLTable.datatable.row(0) && this.localiteHTMLTable.datatable.row(0).data()){
          this.idDepartement = this.localiteHTMLTable.datatable.row(0).data().idDepartement;
          this.idRegion = this.localiteHTMLTable.datatable.row(0).data().idRegion;
          this.idPays = this.localiteHTMLTable.datatable.row(0).data().idPays;
          this.getPays();
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('commune', this.idCommune).then((res) => {
            if(res && res.communes && res.communes[0]){
              this.idDepartement = res.communes[0].departement;
              this.idRegion = res.communes[0].region;
              this.idPays = res.communes[0].pays;
              this.getPays();
            }
          })
        }
      }else if(this.idDepartement && this.idDepartement != ''){
        if(this.localiteHTMLTable && this.localiteHTMLTable.datatable && this.localiteHTMLTable.datatable.row(0) && this.localiteHTMLTable.datatable.row(0).data()){
          this.idRegion = this.localiteHTMLTable.datatable.row(0).data().idRegion;
          this.idPays = this.localiteHTMLTable.datatable.row(0).data().idPays;
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
        if(this.localiteHTMLTable && this.localiteHTMLTable.datatable && this.localiteHTMLTable.datatable.row(0) && this.localiteHTMLTable.datatable.row(0).data()){
          this.idPays = this.localiteHTMLTable.datatable.row(0).data().idPays;
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
      this.initSelect2('idPays', this.translate.instant('LOCALITE_PAGE.SELECTIONPAYS'));
      this.initSelect2('idRegion', this.translate.instant('LOCALITE_PAGE.SELECTIONREGION'));
      this.initSelect2('idDepartement', this.translate.instant('LOCALITE_PAGE.SELECTIONDEPARTEMENT'));
      this.initSelect2('idCommune', this.translate.instant('LOCALITE_PAGE.SELECTIONCOMMUNE'));
      this.initSelect2('type', this.translate.instant('LOCALITE_PAGE.TYPE'));
      this.action = 'ajouter';
    }
  
    infos(l){
      if(!this.estModeCocherElemListe){
        this.unLocalite = l;
        this.action = 'infos';
      }
    }

  
    modifier(l){
      this.doModification = true;
      this.servicePouchdb.findRelationalDocByID('localite', l.id).then((res) => {
        if(res && res.localites){
          this.getPays();
          this.getRegionParPays(l.idPays);
          this.getDepartementParRegion(l.idRegion);
          this.getCommuneParDepartement(l.idDepartement);
          this.editForm(res);
          this.initSelect2('idPays', this.translate.instant('LOCALITE_PAGE.SELECTIONPAYS'));
          this.initSelect2('idRegion', this.translate.instant('LOCALITE_PAGE.SELECTIONREGION'));
          this.initSelect2('idDepartement', this.translate.instant('LOCALITE_PAGE.SELECTIONDEPARTEMENT'));
          this.initSelect2('idCommune', this.translate.instant('LOCALITE_PAGE.SELECTIONCOMMUNE'));
          this.initSelect2('type', this.translate.instant('LOCALITE_PAGE.TYPE'));
          //this.setSelect2DefaultValue('codePays', l.codePays)
          //this.setSelect2DefaultValue('codeRegion', l.codeRegion)
          //this.setSelect2DefaultValue('codeDepartement', l.codeDepartement)
          //this.setSelect2DefaultValue('codeCommune', l.codeCommune)
          this.setSelect2DefaultValue('type', res.localites[0].formData.type)

          /*$('#numero input').ready(()=>{
            $('#numero input').attr('disabled', true)
          });*/
          
          this.unLocalite = l;
          this.unLocaliteDoc = res.localites[0];
          this.action ='modifier';
        }
      }).catch((err) => {
        alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
      })

      
    }

    getPosition(){
      this.afficheMessage(this.translate.instant('GENERAL.OBTENTION_COORDONNEES'));
      this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
        this.localiteForm.controls.latitude.setValue(resp.coords.latitude);
        this.localiteForm.controls.longitude.setValue(resp.coords.longitude);
        this.afficheMessage(this.translate.instant('GENERAL.COORDONNEES_OBTENUES'));
      }, err => {
        this.afficheMessage(this.translate.instant('GENERAL.ERREUR_COORDONNEES'));
          console.log(err)
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
  
  
    async supprimer(l) {
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
              this.servicePouchdb.findRelationalDocByID('localite', l.id).then((res) => {
                this.servicePouchdb.deleteRelationalDocDefinitivement(res.localites[0]).then((res) => {
                  this.localitesData.splice(this.localitesData.indexOf(l), 1);
                  this.action = 'liste';
                  if(!this.mobile){
                    this.dataTableRemoveRows();
                    this.selectedIndexes = [];
                  }else{
                    this.localitesData = [...this.localitesData];
                    this.allLocalitesData.splice(this.allLocalitesData.indexOf(l), 1);
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

    async presentCommune(idCommune) {
      const modal = await this.modalController.create({
        component: CommunePage,
        componentProps: { idCommune: idCommune },
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
                this.servicePouchdb.findRelationalDocByID('localite', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.localites[0]).then((res) => {
                  }).catch((err) => {
                     this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                   });//fin delete
                 }).catch((err) => {
                   this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                 });//fin get
              })
  
              //this.localitesData = this.removeMultipleElem(this.localitesData, this.selectedIndexes);
              this.action = 'liste';
              //this.htmlTableAction = 'recharger';
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
        //this.actualiserTableau(this.localitesData);
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
          this.localitesData = [...this.localitesData];
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
          this.supprimer(this.unLocalite);
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
          this.supprimer(this.unLocalite);
        }
      });
      return await popover.present();
    }
    
    async presentDerniereModification(localite) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { _id: localite.id, _rev: localite.rev, security: localite.security },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      if(this.unLocalite.id && this.unLocalite.id != ''){
        this.servicePouchdb.findRelationalDocByID('localite', this.unLocalite.id).then((res) => {
          if(res && res.localites[0]){
            this.presentDerniereModification(res.localites[0]);
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
              this.infos(this.localitesData[this.selectedIndexes[0]]);
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
              this.modifier(this.localitesData[this.selectedIndexes[0]]);
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
            this.infos(this.localitesData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.localitesData[this.selectedIndexes[0]]);
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
        let row  = this.localiteHTMLTable.datatable.row('.selected').index();
        let data  = this.localiteHTMLTable.datatable.row(row).data();
        this.infos(data);
        //this.selectedIndexes = [];
      /*}else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      }*/
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
        let row  = this.localiteHTMLTable.datatable.row('.selected').index();
        let data  = this.localiteHTMLTable.datatable.row(row).data();
        this.modifier(data);
        //this.selectedIndexes = [];
      /*}else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      }*/
    }
  
  
    async openRelationLocalite(ev: any/*, code*/) {
      const popover = await this.popoverController.create({
        component: RelationsLocaliteComponent,
        event: ev,
        translucent: true,
        componentProps: {"idLocalite": this.unLocalite.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      /*popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'localite') {
          this.navCtrl.navigateForward('/localite/localites/localite/'+this.unLocalite.code)
        }else if(dataReturned !== null && dataReturned.data == 'localite') {
          
        }else if(dataReturned !== null && dataReturned.data == 'localite') {
          
        } else if(dataReturned !== null && dataReturned.data == 'localite') {
          
        }
  
      });*/
      return await popover.present();
    }

    async openRelationLocaliteDepuisListe(ev: any/*, codePays*/) {
      const popover = await this.popoverController.create({
        component: RelationsLocaliteComponent,
        event: ev,
        translucent: true,
        componentProps: {"idLocalite": this.selectedIndexes[0]},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      /*popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.departementsData[this.selectedIndexes[0]].codeDepartement);
        } else if(dataReturned !== null && dataReturned.data == 'localite') {
          this.presentLocalite(this.departementsData[this.selectedIndexes[0]].codeDepartement) 
        }
  
      });*/
      return await popover.present();
    }
  
  
    onSubmit(){
      //let localiteData = this.localiteForm.value;
      let formData = this.localiteForm.value;
      let formioData = {};
      if(this.action === 'ajouter'){
        let localite: any = {
          //id: formData.code,
          type: 'localite',
          pays: formData.idPays,
          region: formData.idRegion,
          departement: formData.idDepartement,
          commune: formData.idCommune,
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

        localite.security = this.servicePouchdb.garderCreationTrace(localite.security);
        delete localite.security['archived'];
  

        let doc = this.clone(localite);
        delete doc.formData.idPays;
        delete doc.formData.codePays;
        delete doc.formData.nomPays;
        delete doc.formData.idRegion;
        delete doc.formData.codeRegion;
        delete doc.formData.nomRegion;
        delete doc.formData.idDepartement;
        delete doc.formData.codeDepartement;
        delete doc.formData.nomDepartement;
        delete doc.formData.idCommune;
        delete doc.formData.codeCommune;
        delete doc.formData.nomCommune

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let localiteData = {id: res.localites[0].id, ...localite.formData, ...localite.formioData, ...localite.security};
          //this.unions = union;
          this.translate.get('LOCALITE_PAGE.CHOIXTYPE.'+localiteData.type).subscribe((res: string) => {
            localiteData.type = res;
          });

          this.action = 'liste';

          //this.rechargerListeMobile = true;
          if (!this.mobile){
            //mode tableau, ajout d'un autre union dans la liste
            this.dataTableAddRow(localiteData)
          }else{
            //mobile, cache la liste des union pour mettre à jour la base de données
            this.localitesData.push(localiteData);
            this.localitesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.localitesData = [...this.localitesData];

            this.allLocalitesData.push(localiteData);
            this.allLocalitesData.sort((a, b) => {
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
          this.departementData = [];
          this.communeData = [];
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });

      }else{
        //si modification
        this.unLocaliteDoc.pays = formData.idPays;
        this.unLocaliteDoc.region = formData.idRegion;
        this.unLocaliteDoc.departement = formData.idDepartement;
        this.unLocaliteDoc.commune = formData.idCommune;
        this.unLocaliteDoc.formData = formData;
        this.unLocaliteDoc.formioData = formioData;

        this.unLocaliteDoc.security = this.servicePouchdb.garderUpdateTrace(this.unLocaliteDoc.security);

        let doc = this.clone(this.unLocaliteDoc);
        delete doc.formData.idPays;
        delete doc.formData.codePays;
        delete doc.formData.nomPays;
        delete doc.formData.idRegion;
        delete doc.formData.codeRegion;
        delete doc.formData.nomRegion;
        delete doc.formData.idDepartement;
        delete doc.formData.codeDepartement;
        delete doc.formData.nomDepartement;
        delete doc.formData.idCommune;
        delete doc.formData.codeCommune;
        delete doc.formData.nomCommune

        this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
          //this.unions._rev = res.rev;
          //this.uneUnionDoc._rev = res.rev;
          let localiteData = {...this.unLocaliteDoc.formData, ...this.unLocaliteDoc.formioData, ...this.unLocaliteDoc.security};

          this.translate.get('LOCALITE_PAGE.CHOIXTYPE.'+localiteData.type).subscribe((res: string) => {
            localiteData.type = res;
          });

          this.action = 'infos';
          this.infos(localiteData);

          //mise à jour dans la liste
          for(let i = 0; i < this.localitesData.length; i++){
            if(this.localitesData[i].code== localiteData.code){
              this.localitesData[i] = localiteData;
              break;
            }
          }

          if(this.mobile){
            //mode liste
            //cache la liste pour le changement dans virtual Scroll
            this.localitesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //mise à jour dans la liste cache
            for(let i = 0; i < this.allLocalitesData.length; i++){
              if(this.allLocalitesData[i].code == localiteData.code){
                this.allLocalitesData[i] = localiteData;
                break;
              }
            }

            this.allLocalitesData.sort((a, b) => {
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
            this.dataTableUpdateRow(localiteData);
          }

          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
          this.communeData = [];
          this.unLocaliteDoc = null;

        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }
    }
  
  
    actualiserTableau(data){
      if(this.idPays && this.idPays != ''){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#localite-pays').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.localiteHTMLTable = createDataTable("localite-pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.localiteHTMLTable = createDataTable("localite-pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.localiteHTMLTable = createDataTable("localite-pays", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.localiteHTMLTable = createDataTable("localite-pays", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.localiteHTMLTable.datatable);
          });
        }
      }else{
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#localite').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.localiteHTMLTable = createDataTable("localite", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.localiteHTMLTable = createDataTable("localite", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.localiteHTMLTable = createDataTable("localite", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.localiteHTMLTable = createDataTable("localite", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.localiteHTMLTable.datatable);
          });
        }
      }
      
    }
  
    doRefresh(event) {
      //this.servicePouchdb.getLocalDocById('fuma:localite').then((localite)
      if((this.idCommune && this.idCommune != '') || (this.idDepartement && this.idDepartement != '') || (this.idRegion && this.idRegion != '') || (this.idPays && this.idPays != '')){
        let type;
        let idType;
        if(this.idCommune){
          type = 'commune';
          idType = this.idCommune; 
        }else if(this.idDepartement){
          type = 'departement';
          idType = this.idDepartement;
        }else if(this.idRegion){
          type = 'region';
          idType = this.idRegion;
        }else{
          type = 'pays';
          idType = this.idPays;
        }


        this.servicePouchdb.findRelationalDocHasMany('localite', type, idType).then((res) => {
          if(res && res.localites){
            let localitesData = [];
            this.allLocalitesData = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let idPays;
            let idRegion;
            let idDepartement; 
            let idCommune;
            for(let l of res.localites){
              this.translate.get('LOCALITE_PAGE.CHOIXTYPE.'+l.formData.type).subscribe((res: string) => {
                l.formData.type = res;
              });

              if(isDefined(paysIndex[l.pays])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomPays', res.pays[paysIndex[l.pays]].formData.nom, 0);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codePays', res.pays[paysIndex[l.pays]].formData.code, 1);
                idPays = res.pays[paysIndex[l.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == l.pays){7
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[l.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[l.region])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomRegion', res.regions[regionIndex[l.region]].formData.nom, 2);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeRegion', res.regions[regionIndex[l.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[l.region]].id;
                
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == l.region){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    idRegion = res.regions[i].id;
                    regionIndex[l.region] = i;
                    break;
                  }
                }
              }

              if(isDefined(departementIndex[l.departement])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomDepartement', res.departements[departementIndex[l.departement]].formData.nom, 4);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeDepartement', res.departements[departementIndex[l.departement]].formData.code, 5);
                idDepartement = res.departements[departementIndex[l.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == l.departement){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomDepartement', res.departements[i].formData.nom, 4);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeDepartement', res.departements[i].formData.code, 5);
                    departementIndex[l.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }

              if(isDefined(communeIndex[l.commune])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomCommune', res.communes[communeIndex[l.commune]].formData.nom, 6);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeCommune', res.communes[communeIndex[l.commune]].formData.code, 7);
                idCommune = res.communes[communeIndex[l.commune]].id;
              }else{
                for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == l.commune){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomCommune', res.communes[i].formData.nom, 6);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeCommune', res.communes[i].formData.code, 7);
                    communeIndex[l.commune] = i;
                    idCommune = res.communes[i].id;
                    break;
                  }
                }
              }

              localitesData.push({id: l.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, ...l.formData, ...l.formioData, ...l.security})
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#localite-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.localiteHTMLTable = createDataTable("localite-pays", this.colonnes, localitesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.localiteHTMLTable = createDataTable("localite-pays", this.colonnes, localitesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.localiteHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.localitesData = localitesData;
              this.localitesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allLocalitesData = [...this.localitesData]
            }

            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.localites = [];
            if(this.mobile){
              this.localitesData = [];
              this.allLocalitesData = [];
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la localite ==> '+err)
          this.localites = [];
          if(this.mobile){
            this.localitesData = [];
            this.allLocalitesData = [];
          }
          this.selectedIndexes = [];
          if(event)
            event.target.complete();
        });
    
      }else {
        this.servicePouchdb.findAllRelationalDocByType('localite').then((res) => {
          if(res && res.localites){
            let localitesData = [];
            this.allLocalitesData = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let idPays;
            let idRegion;
            let idDepartement; 
            let idCommune;
            for(let l of res.localites){
              this.translate.get('LOCALITE_PAGE.CHOIXTYPE.'+l.formData.type).subscribe((res: string) => {
                l.formData.type = res;
              });

              if(isDefined(paysIndex[l.pays])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomPays', res.pays[paysIndex[l.pays]].formData.nom, 0);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codePays', res.pays[paysIndex[l.pays]].formData.code, 1);
                idPays = res.pays[paysIndex[l.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == l.pays){7
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[l.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[l.region])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomRegion', res.regions[regionIndex[l.region]].formData.nom, 2);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeRegion', res.regions[regionIndex[l.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[l.region]].id;
                
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == l.region){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    idRegion = res.regions[i].id;
                    regionIndex[l.region] = i;
                    break;
                  }
                }
              }

              if(isDefined(departementIndex[l.departement])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomDepartement', res.departements[departementIndex[l.departement]].formData.nom, 4);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeDepartement', res.departements[departementIndex[l.departement]].formData.code, 5);
                idDepartement = res.departements[departementIndex[l.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == l.departement){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomDepartement', res.departements[i].formData.nom, 4);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeDepartement', res.departements[i].formData.code, 5);
                    departementIndex[l.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }

              if(isDefined(communeIndex[l.commune])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomCommune', res.communes[communeIndex[l.commune]].formData.nom, 6);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeCommune', res.communes[communeIndex[l.commune]].formData.code, 7);
                idCommune = res.communes[communeIndex[l.commune]].id;
              }else{
                for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == l.commune){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomCommune', res.communes[i].formData.nom, 6);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeCommune', res.communes[i].formData.code, 7);
                    communeIndex[l.commune] = i;
                    idCommune = res.communes[i].id;
                    break;
                  }
                }
              }

              localitesData.push({id: l.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, ...l.formData, ...l.formioData, ...l.security})
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#localite').ready(()=>{
                if(global.langue == 'en'){
                  this.localiteHTMLTable = createDataTable("localite", this.colonnes, localitesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.localiteHTMLTable = createDataTable("localite", this.colonnes, localitesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.localiteHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.localitesData = localitesData;
              this.localitesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allLocalitesData = [...this.localitesData]
            }

            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }else{
            this.localites = [];
            if(this.mobile){
              this.localitesData = [];
              this.allLocalitesData = [];
            }
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          }
        }).catch((err) => {
          console.log('Erreur acces à la localite ==> '+err)
          this.localites = [];
          if(this.mobile){
            this.localitesData = [];
            this.allLocalitesData = [];
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

    getLocalite(){
      if(this.idLocalite && this.idLocalite != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('localite', this.idLocalite).then((res) => {
          if(res && res.localites){
            this.translate.get('LOCALITE_PAGE.CHOIXTYPE.'+res.localites[0].formData.type).subscribe((res2: string) => {
              res.localites[0].formData.type = res2;
            });

            res.localites[0].formData = this.addItemToObjectAtSpecificPosition(res.localites[0].formData, 'nomPays', res.pays[0].formData.nom, 0);  
            res.localites[0].formData = this.addItemToObjectAtSpecificPosition(res.localites[0].formData, 'codePays', res.pays[0].formData.code, 1);  
            res.localites[0].formData = this.addItemToObjectAtSpecificPosition(res.localites[0].formData, 'nomRegion', res.regions[0].formData.nom, 2);  
            res.localites[0].formData = this.addItemToObjectAtSpecificPosition(res.localites[0].formData, 'codeRegion', res.regions[0].formData.code, 3);  
            res.localites[0].formData = this.addItemToObjectAtSpecificPosition(res.localites[0].formData, 'nomDepartement', res.departements[0].formData.nom, 4);   
            res.localites[0].formData = this.addItemToObjectAtSpecificPosition(res.localites[0].formData, 'codeDepartement', res.departements[0].formData.code, 5); 
            res.localites[0].formData = this.addItemToObjectAtSpecificPosition(res.localites[0].formData, 'nomCommune', res.communes[0].formData.nom, 6);  
            res.localites[0].formData = this.addItemToObjectAtSpecificPosition(res.localites[0].formData, 'codeCommune', res.communes[0].formData.code, 7);  
            
            this.unLocalite = {id: res.localites[0].id, idPays: res.localites[0].pays, idRegion: res.localites[0].region, idDepartement: res.localites[0].departement, idCommune: res.localites[0].commune, ...res.localites[0].formData, ...res.localites[0].formioData, ...res.localites[0].security};
            this.infos(this.unLocalite);
          }
        }).catch((err) => {
          this.localitesData = [];
          this.allLocalitesData = [];
          console.log(err)
        });
      }else if((this.idPays && this.idPays != '') || (this.idRegion && this.idRegion != '') || (this.idDepartement && this.idDepartement != '') || (this.idCommune && this.idCommune != '')){
        let type;
        let idType;
        if(this.idCommune){
          type = 'commune';
          idType = this.idCommune; 
        }else if(this.idDepartement){
          type = 'departement';
          idType = this.idDepartement;
        }else if(this.idRegion){
          type = 'region';
          idType = this.idRegion;
        }else{
          type = 'pays';
          idType = this.idPays;
        }


        this.servicePouchdb.findRelationalDocHasMany('localite', type, idType).then((res) => {
          //console.log(res)
          if(res && res.localites){
            let localitesData = [];
            this.allLocalitesData = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let idPays;
            let idRegion;
            let idDepartement; 
            let idCommune;
            for(let l of res.localites){
              this.translate.get('LOCALITE_PAGE.CHOIXTYPE.'+l.formData.type).subscribe((res: string) => {
                l.formData.type = res;
              });

              if(isDefined(paysIndex[l.pays])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomPays', res.pays[paysIndex[l.pays]].formData.nom, 0);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codePays', res.pays[paysIndex[l.pays]].formData.code, 1);
                idPays = res.pays[paysIndex[l.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == l.pays){7
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[l.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[l.region])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomRegion', res.regions[regionIndex[l.region]].formData.nom, 2);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeRegion', res.regions[regionIndex[l.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[l.region]].id;
                
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == l.region){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    idRegion = res.regions[i].id;
                    regionIndex[l.region] = i;
                    break;
                  }
                }
              }

              if(isDefined(departementIndex[l.departement])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomDepartement', res.departements[departementIndex[l.departement]].formData.nom, 4);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeDepartement', res.departements[departementIndex[l.departement]].formData.code, 5);
                idDepartement = res.departements[departementIndex[l.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == l.departement){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomDepartement', res.departements[i].formData.nom, 4);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeDepartement', res.departements[i].formData.code, 5);
                    departementIndex[l.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }

              if(isDefined(communeIndex[l.commune])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomCommune', res.communes[communeIndex[l.commune]].formData.nom, 6);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeCommune', res.communes[communeIndex[l.commune]].formData.code, 7);
                idCommune = res.communes[communeIndex[l.commune]].id;
              }else{
                for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == l.commune){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomCommune', res.communes[i].formData.nom, 6);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeCommune', res.communes[i].formData.code, 7);
                    communeIndex[l.commune] = i;
                    idCommune = res.communes[i].id;
                    break;
                  }
                }
              }

              localitesData.push({id: l.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, ...l.formData, ...l.formioData, ...l.security})
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#localite-pays').ready(()=>{
                if(global.langue == 'en'){
                  this.localiteHTMLTable = createDataTable("localite-pays", this.colonnes, localitesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.localiteHTMLTable = createDataTable("localite-pays", this.colonnes, localitesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.localiteHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.localitesData = localitesData;
              this.localitesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allLocalitesData = [...this.allLocalitesData];
            }
          
          }
        }).catch((err) => {
          this.localitesData = [];
          this.allLocalitesData = [];
          console.log(err)
        });

      }else{
        this.servicePouchdb.findAllRelationalDocByType('localite').then((res) => {
          if(res && res.localites){
            let localitesData = [];
            this.allLocalitesData = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let idPays;
            let idRegion;
            let idDepartement; 
            let idCommune;
            for(let l of res.localites){
              this.translate.get('LOCALITE_PAGE.CHOIXTYPE.'+l.formData.type).subscribe((res: string) => {
                l.formData.type = res;
              });

              if(isDefined(paysIndex[l.pays])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomPays', res.pays[paysIndex[l.pays]].formData.nom, 0);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codePays', res.pays[paysIndex[l.pays]].formData.code, 1);
                idPays = res.pays[paysIndex[l.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == l.pays){7
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomPays', res.pays[i].formData.nom, 0);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codePays', res.pays[i].formData.code, 1);
                    paysIndex[l.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[l.region])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomRegion', res.regions[regionIndex[l.region]].formData.nom, 2);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeRegion', res.regions[regionIndex[l.region]].formData.code, 3);
                idRegion = res.regions[regionIndex[l.region]].id;
                
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == l.region){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomRegion', res.regions[i].formData.nom, 2);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeRegion', res.regions[i].formData.code, 3);
                    idRegion = res.regions[i].id;
                    regionIndex[l.region] = i;
                    break;
                  }
                }
              }

              if(isDefined(departementIndex[l.departement])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomDepartement', res.departements[departementIndex[l.departement]].formData.nom, 4);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeDepartement', res.departements[departementIndex[l.departement]].formData.code, 5);
                idDepartement = res.departements[departementIndex[l.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == l.departement){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomDepartement', res.departements[i].formData.nom, 4);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeDepartement', res.departements[i].formData.code, 5);
                    departementIndex[l.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }

              if(isDefined(communeIndex[l.commune])){
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomCommune', res.communes[communeIndex[l.commune]].formData.nom, 6);
                l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeCommune', res.communes[communeIndex[l.commune]].formData.code, 7);
                idCommune = res.communes[communeIndex[l.commune]].id;
              }else{
                for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == l.commune){
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'nomCommune', res.communes[i].formData.nom, 6);
                    l.formData = this.addItemToObjectAtSpecificPosition(l.formData, 'codeCommune', res.communes[i].formData.code, 7);
                    communeIndex[l.commune] = i;
                    idCommune = res.communes[i].id;
                    break;
                  } 
                }
              }

              localitesData.push({id: l.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, ...l.formData, ...l.formioData, ...l.security})
            }

            //si non mobile ou mobile + mode tableau et 
            if(!this.mobile){
              $('#localite').ready(()=>{
                if(global.langue == 'en'){
                  this.localiteHTMLTable = createDataTable("localite", this.colonnes, localitesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.localiteHTMLTable = createDataTable("localite", this.colonnes, localitesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.localiteHTMLTable.datatable);
              });
            }else if(this.mobile){
              this.localitesData = localitesData;
              this.localitesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allLocalitesData = [...this.localitesData]
            }
          }
        }).catch((err) => {
          this.localitesData = [];
          this.allLocalitesData = [];
          console.log(err)
        });
      }
    }
  
    
  
    getPays(){
      this.paysData = [];
      if(this.idPays && this.idPays != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('pays', this.idPays).then((res) => {
          if(res && res.pays && res.pays[0]){
            this.paysData.push({id: res.pays[0].id, ...res.pays[0].formData});
            if(this.doModification){
              this.setSelect2DefaultValue('idPays', this.unLocalite.idPays);
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
              this.setSelect2DefaultValue('idPays', this.unLocalite.idPays);
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
      if(this.idRegion && this.idRegion != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('region', this.idRegion).then((res) => {
          if(res && res.regions && res.regions[0]){
            this.regionData.push({id: res.regions[0].id, ...res.regions[0].formData});
            if(this.doModification){
              this.setSelect2DefaultValue('idRegion', this.unLocalite.idRegion);
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
              this.setSelect2DefaultValue('idRegion', this.unLocalite.idRegion);
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
            this.departementData.push({id: res.departements[0].id, ...res.departements[0].formData});
            if(this.doModification){
              this.setSelect2DefaultValue('idDepartement', this.unLocalite.idDepartement);
            } else {
              this.setSelect2DefaultValue('idDepartement', this.idDepartement);

              $('#idDepartement select').ready(()=>{
                $('#idDepartement select').attr('disabled', true)
              });
            }
            this.setIDCodeEtNomDepartement(res.departements[0].formData);
            this.getCommuneParDepartement(this.idDepartement);
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
              this.setSelect2DefaultValue('idDepartement', this.unLocalite.idDepartement);
            }
          }
        }).catch((e) => {
          console.log('departement erreur: '+e);
          this.departementData = [];
        });
      }
    }

    getCommuneParDepartement(idDepartement){
      this.communeData = [];
      if(this.idCommune && this.idCommune != ''){
        this.servicePouchdb.findRelationalDocByTypeAndID('commune', this.idCommune).then((res) => {
          if(res && res.communes && res.communes[0]){
            this.communeData.push({id: res.communes[0].id, ...res.communes[0].formData});
            if(this.doModification){
              this.setSelect2DefaultValue('idCommune', this.unLocalite.idCommune);
            } else {
              this.setSelect2DefaultValue('idCommune', this.idCommune);
              $('#idCommune select').ready(()=>{
                $('#idCommune select').attr('disabled', true)
              });
            }
            this.setIDCodeEtNomCommune(res.communes[0].formData);
          }
        }).catch((e) => {
          console.log('commune erreur: '+e);
          this.communeData = [];
        });
      }else{
        this.servicePouchdb.findRelationalDocHasMany('commune', 'departement', idDepartement).then((res) => {
          if(res && res.communes){
            this.communeData = [];
            //var datas = [];
            for(let c of res.communes){
              this.communeData.push({id: c.id, ...c.formData});
            }

            this.communeData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            if(this.doModification){
              this.setSelect2DefaultValue('idCommune', this.unLocalite.idCommune);
            }
          }
        }).catch((e) => {
          console.log('Commune erreur: '+e);
          this.communeData = [];
        });
      }
    }

    setCodeAndNomPays(idPays){
      if(idPays && idPays != ''){
        for(let p of this.paysData){
          if(idPays == p.id){
            this.localiteForm.controls.codePays.setValue(p.code);
            this.localiteForm.controls.nomPays.setValue(p.nom);
            this.localiteForm.controls.idRegion.setValue(null);
            this.localiteForm.controls.codeRegion.setValue(null);
            this.localiteForm.controls.nomRegion.setValue(null);

            this.localiteForm.controls.idDepartement.setValue(null);
            this.localiteForm.controls.codeDepartement.setValue(null);
            this.localiteForm.controls.nomDepartement.setValue(null);

            this.localiteForm.controls.idCommune.setValue(null);
            this.localiteForm.controls.codeCommune.setValue(null);
            this.localiteForm.controls.nomCommune.setValue(null);
            this.localiteForm.controls.numero.setValue(null);
            this.localiteForm.controls.code.setValue(null);

            this.getRegionParPays(idPays)
            break;
          }
        }
      }else{
        this.localiteForm.controls.idRegion.setValue(null);
        this.localiteForm.controls.codeRegion.setValue(null);
        this.localiteForm.controls.nomRegion.setValue(null);

        this.localiteForm.controls.idDepartement.setValue(null);
        this.localiteForm.controls.codeDepartement.setValue(null);
        this.localiteForm.controls.nomDepartement.setValue(null);

        this.localiteForm.controls.idCommune.setValue(null);
        this.localiteForm.controls.codeCommune.setValue(null);
        this.localiteForm.controls.nomCommune.setValue(null);

        this.localiteForm.controls.numero.setValue(null);
        this.localiteForm.controls.code.setValue(null);
      }
    }

    setCodeAndNomRegion(idRegion){
      if(idRegion && idRegion != ''){
        for(let r of this.regionData){
          if(idRegion == r.id){
            this.localiteForm.controls.codeRegion.setValue(r.code);
            this.localiteForm.controls.nomRegion.setValue(r.nom);
            this.localiteForm.controls.idDepartement.setValue(null);
            this.localiteForm.controls.codeDepartement.setValue(null);
            this.localiteForm.controls.nomDepartement.setValue(null);

            this.localiteForm.controls.idCommune.setValue(null);
            this.localiteForm.controls.codeCommune.setValue(null);
            this.localiteForm.controls.nomCommune.setValue(null);
            this.localiteForm.controls.numero.setValue(null);
            this.localiteForm.controls.code.setValue(null);

            this.getDepartementParRegion(idRegion)
            break;
          }
        }
      }else{
        this.localiteForm.controls.idDepartement.setValue(null);
        this.localiteForm.controls.codeDepartement.setValue(null);
        this.localiteForm.controls.nomDepartement.setValue(null);

        this.localiteForm.controls.idCommune.setValue(null);
        this.localiteForm.controls.codeCommune.setValue(null);
        this.localiteForm.controls.nomCommune.setValue(null);
        this.localiteForm.controls.numero.setValue(null);
        this.localiteForm.controls.code.setValue(null);
      }
    }

    setCodeAndNomDepartement(idDepartement){
      if(idDepartement && idDepartement != ''){
        for(let d of this.departementData){
          if(idDepartement == d.id){
            this.localiteForm.controls.codeDepartement.setValue(d.code);
            this.localiteForm.controls.nomDepartement.setValue(d.nom);
            this.localiteForm.controls.idCommune.setValue(null);
            this.localiteForm.controls.codeCommune.setValue(null);
            this.localiteForm.controls.nomCommune.setValue(null);

            this.localiteForm.controls.numero.setValue(null);
            this.localiteForm.controls.code.setValue(null);
            this.getCommuneParDepartement(idDepartement)
            break;
          }
        }
      }else{
        this.localiteForm.controls.idCommune.setValue(null);
        this.localiteForm.controls.codeCommune.setValue(null);
        this.localiteForm.controls.nomCommune.setValue(null);

        this.localiteForm.controls.numero.setValue(null);
        this.localiteForm.controls.code.setValue(null);
      }
    }

    setCodeAndNomCommune(idCommune){
      if(idCommune && idCommune != ''){
        for(let c of this.communeData){
          if(idCommune == c.id){
            this.localiteForm.controls.codeCommune.setValue(c.code);
            this.localiteForm.controls.nomCommune.setValue(c.nom);
            this.localiteForm.controls.numero.setValue(null);
            this.localiteForm.controls.code.setValue(null);
            break;
          }
        }
      }else{
        this.localiteForm.controls.numero.setValue(null);
        this.localiteForm.controls.code.setValue(null);
      }
    }
  
    setIDCodeEtNomPays(paysData){
      this.localiteForm.controls.idPays.setValue(paysData.id);
      this.localiteForm.controls.codePays.setValue(paysData.code);
      this.localiteForm.controls.nomPays.setValue(paysData.nom);
    }

    setIDCodeEtNomRegion(regionData){
      this.localiteForm.controls.idRegion.setValue(regionData.id);
      this.localiteForm.controls.codeRegion.setValue(regionData.code);
      this.localiteForm.controls.nomRegion.setValue(regionData.nom);
    }

    setIDCodeEtNomDepartement(departementData){
      this.localiteForm.controls.idDepartement.setValue(departementData.id);
      this.localiteForm.controls.codeDepartement.setValue(departementData.code);
      this.localiteForm.controls.nomDepartement.setValue(departementData.nom);
    }

    setIDCodeEtNomCommune(communeData){
      this.localiteForm.controls.idCommune.setValue(communeData.id);
      this.localiteForm.controls.codeCommune.setValue(communeData.code);
      this.localiteForm.controls.nomCommune.setValue(communeData.nom);
    }

    setCodeLocalite(numero){
      if(numero && numero != ''){
        this.localiteForm.controls.code.setValue(this.localiteForm.controls.codeCommune.value + numero);
      }
    }

    attacheEventToDataTable(datatable){
      var self = this;
      var id = '';
      if(this.idPays && this.idPays != ''){
        id = 'localite-pays-datatable';
      }else{ 
        id = 'localite-datatable';
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
        id = 'localite-pays-datatable';
      }else{ 
        id = 'localite-datatable';
      }


      var self = this;
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[0].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.NOM');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[1].firstChild.nodeValue = this.translate.instant('PAYS_PAGE.CODEPAYS');
      //$('#'+id+' thead tr:eq(0) th:eq(0)').attr({'title': this.translate.instant('PAYS_PAGE.CODEPAYS')});
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[2].firstChild.nodeValue = this.translate.instant('REGION_PAGE.NOM');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[3].firstChild.nodeValue = this.translate.instant('REGION_PAGE.CODE');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[4].firstChild.nodeValue = this.translate.instant('DEPARTEMENT_PAGE.NOM');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[5].firstChild.nodeValue = this.translate.instant('DEPARTEMENT_PAGE.CODE');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[6].firstChild.nodeValue = this.translate.instant('COMMUNE_PAGE.NOM');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[7].firstChild.nodeValue = this.translate.instant('COMMUNE_PAGE.CODE');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[8].firstChild.nodeValue = this.translate.instant('LOCALITE_PAGE.NOM');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[9].firstChild.nodeValue = this.translate.instant('LOCALITE_PAGE.NUMERO');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[10].firstChild.nodeValue = this.translate.instant('LOCALITE_PAGE.CODE');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[11].firstChild.nodeValue = this.translate.instant('LOCALITE_PAGE.TYPE');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[12].firstChild.nodeValue = this.translate.instant('LOCALITE_PAGE.AUTRETYPE');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[13].firstChild.nodeValue = this.translate.instant('GENERAL.LATITUDE');
      $(self.localiteHTMLTable.datatable.table().header()).children(1)[0].children[14].firstChild.nodeValue = this.translate.instant('GENERAL.LONGITUDE');
      
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }

  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //code localite
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.CODELOCALITE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.code[0].message = res;
      });

      //numéro localite
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.NUMEROLOCALITE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numero[0].message = res;
      });
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.NUMEROLOCALITE.MINLENGTH').subscribe((res: string) => {
        this.messages_validation.numero[1].message = res;
      });
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.NUMEROLOCALITE.MAXLENGTH').subscribe((res: string) => {
        this.messages_validation.numero[2].message = res;
      });
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.NUMEROLOCALITE.PATTERN').subscribe((res: string) => {
        this.messages_validation.numero[3].message = res;
      });
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.NUMEROLOCALITE.VALIDNUMEROLOCALITE').subscribe((res: string) => {
        this.messages_validation.numero[4].message = res;
      });

      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.NUMEROLOCALITE.UNIQUENUMEROLOCALITE').subscribe((res: string) => {
        this.messages_validation.numero[5].message = res;
      });
  
      //nom localite
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.NOMLOCALITE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });

       //type localite
       this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.TYPELOCALITE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.type[0].message = res;
      });

      //autre type localite
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.AUTRETYPELOCALITE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.autreType[0].message = res;
      });

      //code pays
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPays[0].message = res;
      });


      //code région
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idRegion[0].message = res;
      });

      //code département
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idDepartement[0].message = res;
      });

      //code commune
      this.translate.get('LOCALITE_PAGE.MESSAGES_VALIDATION.CODECOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idCommune[0].message = res;
      });
    }
  
    
    dataTableAddRow(rowData){

      this.localiteHTMLTable.datatable.row.add(rowData).draw();
    }
  
    dataTableUpdateRow(/*index, */rowData){

      this.localiteHTMLTable.datatable.row('.selected').data(rowData).draw();
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      this.localiteHTMLTable.datatable.rows('.selected').remove().draw();
    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.localiteHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.localiteHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.localiteHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    /*var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'localite-pays-datatable';
    }else{ 
      id = 'localite-datatable';
    }

    $('#'+id+' thead tr:eq(1)').show();*/
    var self = this;
    $(self.localiteHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
    this.recherchePlus = true;
  }

  dataTableRemoveRechercheParColonne(){
    /*var id = '';
    if(this.codePays && this.codePays != ''){
      id = 'localite-pays-datatable';
    }else{ 
      id = 'localite-datatable';
    }

    $('#'+id+' thead tr:eq(1)').hide();*/
    var self = this;
    $(self.localiteHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    var id = '';
    if(this.idPays && this.idPays != ''){
      id = 'localite-pays-datatable';
    }else{ 
      id = 'localite-datatable';
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
      $( self.localiteHTMLTable.datatable.table().footer() ).show();
      this.localiteHTMLTable.datatable.columns().every( function () {
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
                  
                  var info = self.localiteHTMLTable.datatable.page.info();
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

      this.localiteHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
        if(!$('#'+id+colIdx).attr('style') && visibility){
            $('#'+id+colIdx).selectpicker();
              $('.ms-parent').removeAttr("style");
          }
      });

      this.filterAjouter = true;
      this.filterInitialiser = true;

    } else if(!this.filterAjouter && this.filterInitialiser){
      //$('#'+id+' tfoot').show();
      $( self.localiteHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }


  dataTableRemoveCustomFiltre(){
    var id = '';
    if(this.idPays && this.idPays != ''){
      id = 'localite-pays-datatable';
    }else{ 
      id = 'localite-datatable';
    }
    var self = this;
    $( self.localiteHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }



    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        this.localitesData = this.allLocalitesData.filter((item) => {
          return item.code.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || item.numero.toLowerCase().indexOf(val) !== -1 || item.codeCommune.toLowerCase().indexOf(val) !== -1 || item.nomCommune.toLowerCase().indexOf(val) !== -1 || item.codeDepartement.toLowerCase().indexOf(val) !== -1 || item.nomDepartement.toLowerCase().indexOf(val) !== -1 || item.codeRegion.toLowerCase().indexOf(val) !== -1 || item.nomRegion.toLowerCase().indexOf(val) !== -1 || item.codePays.toLowerCase().indexOf(val) !== -1 || item.nomPays.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.localiteData = temp;
      
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
