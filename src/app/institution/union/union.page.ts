import { Component, OnInit, Input  } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
//import { unionValidator } from '../../validators/union.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsUnionComponent } from '../../component/relations-union/relations-union.component';
import { global } from '../../../app/globale/variable';
import { PaysPage } from '../../localite/pays/pays.page';
import { RegionPage } from '../../localite/region/region.page';
import { DepartementPage } from '../../localite/departement/departement.page';
import { CommunePage } from '../../localite/commune/commune.page';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { LocalitePage } from 'src/app/localite/localite/localite.page';
import { DatatableMoreComponent } from 'src/app/component/datatable-more/datatable-more.component';
import { DatatableConstructComponent } from 'src/app/component/datatable-construct/datatable-construct.component';
import { SelectionComponent } from 'src/app/component/selection/selection.component';
import { DerniereModificationComponent } from 'src/app/component/derniere-modification/derniere-modification.component';
import { ListeMoreComponent } from 'src/app/component/liste-more/liste-more.component';
import { ListeActionComponent } from 'src/app/component/liste-action/liste-action.component';
import { isObject } from 'util';
import { PartenairePage } from '../partenaire/partenaire.page';
import { isDefined } from '@angular/compiler/src/util';
import { OpPage } from '../op/op.page';
import { PersonnesPage } from '../personnes/personnes.page';
import * as moment from 'moment';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
//declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-union',
  templateUrl: './union.page.html',
  styleUrls: ['./union.page.scss'],
})
export class UnionPage implements OnInit {
  @Input() idUnion: string;
  @Input() idPartenaire: string;
  @Input() filtreUnion: any;
  @Input() filtrePartenaires: any;

  global = global;
  start: any;
  unionForm: FormGroup;
  action: string = 'liste';
  cacheAction: string = 'liste';
  unions: any = [];
  unionsData: any = [];
  allUnionsData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  communeData: any = [];
  localiteData: any = [];
  federationData: any = [];
  niveauChoix = [];
  secteurs = ['Privé', 'Etat', 'Sémi-privé'];
  domaines = ['Agronamie', 'Santé', 'Environement', 'Gouvernement'];
  uneUnion: any;
  uneUnionDoc: any;
  unionHTMLTable: any;
  htmlTableAction: string;
  selectedIndexes: any = [];
  mobile = global.mobile;
  styleAffichage: string = "liste";
  allSelected: boolean = false;
  recherchePlus: boolean = false;
  filterAjouter: boolean = false;
  filterInitialiser: boolean = false;
  prev: boolean = false;
  next: boolean = false;
  doModification: boolean = false;
  estModeCocherElemListe: boolean = false;
  rechargerListeMobile: boolean = false;
  colonnes = ['nom', 'numero', 'niveau', 'nomFederation', 'numeroFederation', 'dateCreation', 'telephone', 'email', 'codePays', 'nomPays', 'codeRegion', 'nomRegion', 'codeDepartement', 'nomDepartement', 'codeCommune', 'nomCommune', 'codeSiege', 'nomSiege', 'latitude', 'longitude']

  messages_validation = {
    'numero': [
      { type: 'required', message: '' },
      { type: 'uniqueNumeroUnion', message: '' }
    ],
    'nom': [
      { type: 'required', message: '' }
    ],
    'niveau': [
      { type: 'required', message: '' }
    ],
    'idFederation': [
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
    'idSiege': [
      { type: 'required', message: '' }
    ]
   
  }

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la union est en mode modal, on chercher info region
      this.translateLangue();
      this.getUnion();
      this.translateChoixNiveau();
    }
  
    translateChoixNiveau(){
      for(let i = 1; i <= 2; i++){
        this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+i).subscribe((res: string) => {
          this.niveauChoix.push({'id': i, 'val': res});
        });
      }
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
        this.actualiserTableau(this.unionsData);
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
      if(this.unionForm.get(filedName).errors && (this.unionForm.get(filedName).dirty || this.unionForm.get(filedName).touched)){
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
      if(this.unionForm.get(filedName).errors){
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

    initSelect2(id, placeholder, search = false){
      var self = this;
      var infinity = null;
      if(search){
        infinity = Infinity;
      }

      $(function () {
        $('#'+id+' select').select2({
          theme: 'bootstrap4',
          width: 'style',
          placeholder: placeholder,
          minimumResultsForSearch: infinity,
          allowClear: Boolean($('#'+id+' select').data('allow-clear')),
        });

        

        $('#'+id+' select').on('select2:select', function (e) {
          //console.log('sele')
          //var data = e.params.data;
          self.unionForm.controls[id].setValue(e.params.data.id)
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.unionForm.value[id]);
            self.setSelectRequredError(id, id)
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.unionForm.value[id]);
            self.setSelectRequredError(id, id)
            self.communeData = [];
            self.localiteData = [];
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.unionForm.value[id]);
            self.setSelectRequredError(id, id)
            self.localiteData = [];
          }else if(id == 'idCommune'){
            self.setCodeAndNomCommune(self.unionForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idSiege'){
            self.setCodeAndNomLocalite(self.unionForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idFederation'){
            self.setCodeAndNomFederation(self.unionForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'niveau'){
            if(self.unionForm.value[id] == '1' && !self.federationData.length){
              self.getFederation();
            }else{
              self.unionForm.controls.idFederation.setValue(null);
              self.unionForm.controls.numeroFederation.setValue(null);
              self.unionForm.controls.nomFederation.setValue(null);
            }
            //self.setSelect2DefaultValue('numeroFederation', null);
            self.setSelectRequredError(id, id)
          }
          
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.unionForm.controls[id].setValue(null); 
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.unionForm.value[id]);
            self.regionData = [];
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.unionForm.value[id]);
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.unionForm.value[id]);
            self.communeData = [];
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idCommune'){
            self.setCodeAndNomCommune(self.unionForm.value[id]);
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idSiege'){
            self.setCodeAndNomLocalite(self.unionForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idFederation'){
            self.unionForm.controls.idFederation.setValue(null);
            self.unionForm.controls.numeroFederation.setValue(null);
            self.unionForm.controls.nomFederation.setValue(null);
            self.setSelectRequredError(id, id);
          }else if(id == 'niveau'){
            self.setSelect2DefaultValue('idFederation', null);
            self.unionForm.controls.idFederation.setValue(null);
            self.unionForm.controls.numeroFederation.setValue(null);
            self.unionForm.controls.nomFederation.setValue(null);
            self.setSelectRequredError(id, id);
          }
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
  
  
    initForm(){
      //this.unionForm = null;
      this.unionForm = this.formBuilder.group({
        nom: [null, Validators.required],
        numero: [null, Validators.required],
        niveau: ['1', Validators.required],
        nomFederation: [null, Validators.required],
        numeroFederation: [null, Validators.required],
        idFederation: [null, Validators.required],
        dateCreation: [null], 
        telephone: [null],
        email: [null], 
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
        nomSiege: [null, Validators.required],
        codeSiege: [null, Validators.required],
        idSiege: [null, Validators.required],
        adresse: [null],
        latitude: [null],
        longitude: [null],
      });

      this.validerNumero();

      /*this.unionForm.valueChanges.subscribe(change => {
        this.unionForm.get('numero').setValidators([unionValidator.uniqueNumeroUnion(this.unionsData, 'ajouter'), Validators.required]);
      });

      this.unionForm.valueChanges.subscribe(change => {
        this.unionForm.get('numeroFederation').setValidators([unionValidator.requireFederation(this.unionForm.controls.niveau.value)]);
      });*/
    }
  
    editForm(uDoc){
      let union = uDoc.unions[0];
      let idFederation;
      let numeroFederation;
      let nomFederation;
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
      let idSiege;
      let codeSiege;
      let nomSiege;

      if(uDoc.partenaires[0]){
        idFederation = uDoc.partenaires[0].id;
        numeroFederation = uDoc.partenaires[0].formData.numero;
        nomFederation = uDoc.partenaires[0].formData.nom;
      }

      if(uDoc.pays[0]){
        idPays = uDoc.pays[0].id;
        codePays = uDoc.pays[0].formData.code;
        nomPays = uDoc.pays[0].formData.nom;
      }

      if(uDoc.regions[0]){
        idRegion = uDoc.regions[0].id;
        codeRegion = uDoc.regions[0].formData.code;
        nomRegion = uDoc.regions[0].formData.nom;
      }

      if(uDoc.departements[0]){
        idDepartement = uDoc.departements[0].id;
        codeDepartement = uDoc.departements[0].formData.code;
        nomDepartement = uDoc.departements[0].formData.nom;
      }

      if(uDoc.communes[0]){
        idCommune = uDoc.communes[0].id;
        codeCommune = uDoc.communes[0].formData.code;
        nomCommune = uDoc.communes[0].formData.nom;
      }

      if(uDoc.localites[0]){
        idSiege = uDoc.localites[0].id;
        codeSiege = uDoc.localites[0].formData.code;
        nomSiege = uDoc.localites[0].formData.nom;
      }


      //this.unionForm = null;
      let u = union.formData
      this.unionForm = this.formBuilder.group({
        nom: [u.nom, Validators.required],
        numero: [u.numero, Validators.required],
        niveau: [u.niveau, Validators.required],
        nomFederation: [nomFederation], 
        numeroFederation: [numeroFederation],
        idFederation: [idFederation],
        dateCreation: [u.dateCreation],  

        idPays: [idPays, Validators.required],
        codePays: [codePays, Validators.required],
        nomPays: [nomPays, Validators.required],
        idRegion: [idRegion, Validators.required],
        codeRegion: [codeRegion, Validators.required],
        nomRegion: [nomRegion, Validators.required],
        idDepartement: [idDepartement, Validators.required],
        codeDepartement: [codeDepartement, Validators.required],
        nomDepartement: [nomDepartement, Validators.required],
        idCommune: [idCommune, Validators.required],
        codeCommune: [codeCommune, Validators.required],
        nomCommune: [nomCommune, Validators.required],
        idSiege: [idSiege, Validators.required],
        codeSiege: [codeSiege, Validators.required],
        nomSiege: [nomSiege, Validators.required],
        
        latitude: [u.latitude],
        longitude: [u.latitude],
        telephone: [u.telephone],
        email: [u.email],
        adresse: [u.adresse],
        
      });

      this.validerNumero();

      /*this.unionForm.valueChanges.subscribe(change => {
        this.unionForm.get('numero').setValidators([unionValidator.uniqueNumeroUnion(this.unionsData, 'ajouter'), Validators.required]);
      });

      this.unionForm.valueChanges.subscribe(change => {
        this.unionForm.get('numeroFederation').setValidators([unionValidator.requireFederation(this.unionForm.controls.niveau.value)]);
      });*/

    }


    validerNumero(){
      let numeroControl = this.unionForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndNumero('union', value).then((res) => {
          if(res && res.unions && res.unions[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.uneUnion.numero))){
            numeroControl.setErrors({uniqueNumeroUnion: true});
          }
        });
      });

      /*let idFederationControl = this.unionForm.controls['idFederation'];
      idFederationControl.valueChanges.subscribe((value) => {
        if(this.unionForm.controls.niveau.value == '1' && (!idFederationControl.value || idFederationControl.value == '')){
          idFederationControl.setErrors({required: true}) 
        }
      });*/

      let idFederationControl = this.unionForm.controls['idFederation'];
      let niveauControl = this.unionForm.controls['niveau'];
      niveauControl.valueChanges.subscribe((value) => {
        if(value == 1 && (!idFederationControl.value || idFederationControl.value == '')){
          idFederationControl.setValidators(Validators.required);
          this.unionForm.controls['nomFederation'].setValidators(Validators.required);
          this.unionForm.controls['numeroFederation'].setValidators(Validators.required);
        }else {
          idFederationControl.clearValidators();
          this.unionForm.controls['nomFederation'].clearValidators();
          this.unionForm.controls['numeroFederation'].clearValidators();
          //idFederationControl.reset(null);
        }
      });
    }

  
    ajouter(){
      this.doModification = false;
      this.start = moment().toISOString();
      this.getPays();
      this.getFederation();
      this.initForm();
      this.initSelect2('niveau', this.translate.instant('UNION_PAGE.NIVEAU'), true);
      this.initSelect2('idFederation', this.translate.instant('UNION_PAGE.SELECTIONFEDERATION'));
      //this.initSelect2('domaine', this.translate.instant('UNION_PAGE.DOMAINE'));
      this.initSelect2('idPays', this.translate.instant('UNION_PAGE.SELECTIONPAYS'));
      this.initSelect2('idRegion', this.translate.instant('UNION_PAGE.SELECTIONREGION'));
      this.initSelect2('idDepartement', this.translate.instant('UNION_PAGE.SELECTIONDEPARTEMENT'));
      this.initSelect2('idCommune', this.translate.instant('UNION_PAGE.SELECTIONCOMMUNE'));
      this.initSelect2('idSiege', this.translate.instant('UNION_PAGE.SELECTIONSIEGE'));
      this.setSelect2DefaultValue('niveau', '1')
      
      this.action = 'ajouter';
    }
  
    infos(u){
      if(global.controlAccesModele('unions', 'lecture')){
        if(!this.estModeCocherElemListe){
          this.uneUnion = u;
          this.action = 'infos';
        }
      }
    }

  
    modifier(union){
      //console.log(union)
      if(!this.filtreUnion){
        if(global.controlAccesModele('unions', 'modification')){
          let id;
          if(isObject(union)){
            id = union.id;
          }else{
            id = union;
          }
  
          this.doModification = true;
          this.start = moment().toISOString();
          this.servicePouchdb.findRelationalDocByID('union', id).then((res) => {
            if(res && res.unions[0]){
              let uDoc = res.unions[0];
              this.getPays();
              if(uDoc.pays)
                this.getRegionParPays(uDoc.pays);
              if(uDoc.region)
                this.getDepartementParRegion(uDoc.region);
              if(uDoc.departement)
                this.getCommuneParDepartement(uDoc.departement);
              if(uDoc.commune)
                this.getLocaliteParCommune(uDoc.commune);
              
              if(uDoc.formData.niveau == '1'){
                this.getFederation();
              }
  
              this.editForm(res);
  
              this.initSelect2('niveau', this.translate.instant('UNION_PAGE.NIVEAU'));
              this.initSelect2('idFederation', this.translate.instant('UNION_PAGE.SELECTIONFEDERATION'));
              //this.initSelect2('domaine', this.translate.instant('UNION_PAGE.DOMAINE'));
              this.initSelect2('idPays', this.translate.instant('UNION_PAGE.SELECTIONPAYS'));
              this.initSelect2('idRegion', this.translate.instant('UNION_PAGE.SELECTIONREGION'));
              this.initSelect2('idDepartement', this.translate.instant('UNION_PAGE.SELECTIONDEPARTEMENT'));
              this.initSelect2('idCommune', this.translate.instant('UNION_PAGE.SELECTIONCOMMUNE'));
              this.initSelect2('idSiege', this.translate.instant('UNION_PAGE.SELECTIONSIEGE'));
  
              this.setSelect2DefaultValue('niveau', uDoc.formData.niveau);
              /*$('#numero input').ready(()=>{
                $('#numero input').attr('disabled', true)
              });*/
              //this.setSelect2DefaultValue('numeroFederation', uDoc.formData.numeroFederation)
              //this.setSelect2DefaultValue('domaine', uDoc.formData.domaine)
  
              //this.setSelect2DefaultValue('codePays', union.codePays)
              //this.setSelect2DefaultValue('codeRegion', union.codeRegion)
              //this.setSelect2DefaultValue('codeDepartement', union.codeDepartement)
              //this.setSelect2DefaultValue('codeCommune', union.codeCommune)
              //this.setSelect2DefaultValue('codeSiege', union.codeSiege)
              
              this.uneUnionDoc = uDoc;
            
              if(!isObject(union)){
                for(let u of this.unionsData){
                  if(u.id == id){
                    this.uneUnion = u;
                    break;
                  }
                }
              }else{
                this.uneUnion = union;
              }
  
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
        this.unionForm.controls.latitude.setValue(resp.coords.latitude);
        this.unionForm.controls.longitude.setValue(resp.coords.longitude);
        this.afficheMessage(this.translate.instant('GENERAL.COORDONNEES_OBTENUES'));
      }, err => {
        this.afficheMessage(this.translate.instant('GENERAL.ERREUR_COORDONNEES'));
          console.log(err)
      });
    }
  
    
    exportPDF(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('union-datatable').innerHTML], {
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
        if (i === index && key/* && value*/) {
          temp[key] = value;
        }

        // Add the current item in the loop to the temp obj
        temp[prop] = obj[prop];

        // Increase the count
        i++;

      }
    }

    // If no index, add to the end
    if (!index && key/* && value*/) {
      temp[key] = value;
    }

    return temp;

  };
   
    
    async supprimer(u) {
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

                this.servicePouchdb.findRelationalDocByID('union', u.id).then((res) => {
                  res.unions[0].security = this.servicePouchdb.garderDeleteTrace(res.unions[0].security);

                  this.servicePouchdb.updateRelationalDoc(res.unions[0]).then((res) => {
                    //mise à jour de la liste si mobile et mode liste
                    if(this.unionsData.indexOf(u) !== -1){
                      this.unionsData.splice(this.unionsData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant')
                    }

                    this.action = 'liste';

                    if(!this.mobile){
                      //sinion dans le tableau
                      this.dataTableRemoveRows();
                    }else{
                      this.unionsData = [...this.unionsData];
                      if(this.allUnionsData.indexOf(u) !== -1){
                        this.allUnionsData.splice(this.allUnionsData.indexOf(u), 1);
                      }else{
                        console.log('echec splice, index inexistant dans allUnionsData')
                      }
                    }
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }else{

                this.servicePouchdb.findRelationalDocByID('union', u.id).then((res) => {
                 this.servicePouchdb.deleteRelationalDocDefinitivement(res.unions[0]).then((res) => {

                  //mise à jour de la liste si mobile et mode liste
                  if(this.unionsData.indexOf(u) !== -1){
                    this.unionsData.splice(this.unionsData.indexOf(u), 1);
                  }else{
                    console.log('echec splice, index inexistant')
                  }

                  this.action = 'liste';
                  if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                    //sinion dans le tableau
                    this.dataTableRemoveRows();
                  }else{
                    this.unionsData = [...this.unionsData];
                    if(this.allUnionsData.indexOf(u) !== -1){
                      this.allUnionsData.splice(this.allUnionsData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant dans allUnionsData')
                    }
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

    async presentLocalite(idSiege) {
      const modal = await this.modalController.create({
        component: LocalitePage,
        componentProps: { idLocalite: idSiege },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentFederation(idPartenaire) {
      const modal = await this.modalController.create({
        component: PartenairePage,
        componentProps: {
          idModele: 'unions', idPartenaire: idPartenaire },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
  
  
    async archivageMultiple(numeros) {
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
        message: this.translate.instant('GENERAL.ALERT_MESSAGE_ARCHIVER'),
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
              for(let id of numeros){
                //var u = this.unionsData[i];
                this.servicePouchdb.findRelationalDocByID('union', id).then((res) => {
                  res.unions[0].security = this.servicePouchdb.garderArchivedTrace(res.unions[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.unions[0]).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_ARCHIVAGE')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_ARCHIVAGE')+': '+err.toString());
                });//fin get
              }

              if(this.action == 'infos'){
                this.action = this.cacheAction;
              }

              //sinion dans le tableau
              if(!this.mobile){
                this.dataTableRemoveRows();
                this.selectedIndexes = [];
                //this.selectedIndexes = [];
              }else{
                this.unionsData = [...this.removeMultipleElem(this.unionsData, numeros)];
                this.allUnionsData = this.removeMultipleElem(this.allUnionsData, numeros);
                //if(this.action != 'infos'){
                  this.estModeCocherElemListe = false;
                  this.decocherTousElemListe();
                //}
                //this.action = this.cacheAction;
                //this.retour();
              }
              //this.dataTableRemoveRows();
            }
          }
        ]
      });
  
      await alert.present();
    }

    async desarchivageMultiple(ids) {
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
        message: this.translate.instant('GENERAL.ALERT_MESSAGE_DESARCHIVER'),
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
              for(let id of ids){
                //var u = this.unionsData[i];
                this.servicePouchdb.findRelationalDocByID('union', id).then((res) => {
                  res.unions[0].security = this.servicePouchdb.garderDesarchivedTrace(res.unions[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.unions[0]).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_DESARCHIVAGE')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_DESARCHIVAGE')+': '+err.toString());
                });//fin get
              }
    
              if(this.action == 'infos'){
                this.action = this.cacheAction;
              }
              //sinion dans le tableau
              if(!this.mobile){
                this.dataTableRemoveRows();
                this.selectedIndexes = [];
              }else{
                this.unionsData = [...this.removeMultipleElem(this.unionsData, ids)]; 
                this.allUnionsData = this.removeMultipleElem(this.allUnionsData, ids);
                
                //if(this.action != 'infos'){
                  this.estModeCocherElemListe = false;
                  this.decocherTousElemListe();
               // }
                //this.action = this.cacheAction;
              }
            }
          }
        ]
      });
  
      await alert.present();
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

    cocherElemListe(id){
      if(this.selectedIndexes.indexOf(id) === -1){
        //si coché
        this.selectedIndexes.push(id);
      }else{
        //si décocher
        this.selectedIndexes.splice(this.selectedIndexes.indexOf(id), 1);
      }  
      
    }

    cocherTousElemListe(){
      this.unionsData.forEach((u) => {
        //console.log(u.codePays+'   '+this.selectedIndexes.indexOf(u.codePays)+'    '+this.selectedIndexes)
        if(this.selectedIndexes.indexOf(u.id) === -1){
          this.selectedIndexes.push(u.id);
        }
      });
  
      $('ion-checkbox').prop("checked", true);
    }
  
    decocherTousElemListe(){
      $('ion-checkbox').prop("checked", false);
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;
    }

    async listMorePopover(ev: any) {
      const popover = await this.popoverController.create({
        component: ListeMoreComponent,
        event: ev,
        translucent: true,
        componentProps: {"options": {
          idModele: 'unions', 
          "estModeCocherElemListe": this.estModeCocherElemListe,
          "dataLength": this.unionsData.length,
          "selectedIndexesLength": this.selectedIndexes.length,
          "styleAffichage": this.styleAffichage,
          "action": this.action
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
          this.estModeCocherElemListe = false;
          this.changeStyle();
        }  else  if(dataReturned !== null && dataReturned.data == 'liste') {
          this.estModeCocherElemListe = false;
          this.getUnionsByType('liste');
        }  else  if(dataReturned !== null && dataReturned.data == 'archives') {
          this.estModeCocherElemListe = false;
          this.getUnionsByType('archives');
        }  else  if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.estModeCocherElemListe = false;
          this.getUnionsByType('corbeille');
        }  else  if(dataReturned !== null && dataReturned.data == 'partages') {
          this.estModeCocherElemListe = false;
          this.getUnionsByType('partages');
        } else  if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.estModeCocherElemListe = false;
          this.action = 'conflits';
         // this.changeStyle();
        }   else  if(dataReturned !== null && dataReturned.data == 'exporter') {
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
       let data = [...this.unionsData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_Unions_'+date+'.xls', blob).then(()=> {
           alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
       }).catch(()=>{
           alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
       });
     }
   
     exportCSV(){
       let data = [...this.unionsData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_Unions_'+date+'.csv', blob).then(()=> {
           alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
       }).catch(()=>{
           alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
       });
     }
  
  
    async listActionPopover(ev: any) {
      const popover = await this.popoverController.create({
        component: ListeActionComponent,
        event: ev,
        translucent: true,
        componentProps: {//"options": {
          //"estModeCocherElemListe": this.estModeCocherElemListe,
          //"dataLength": this.unionsData.length,
          //"selectedIndexesLength": this.selectedIndexes.length,
          //"styleAffichage": this.styleAffichage,
          idModele: 'unions', 
          "action": this.cacheAction
      /*}*/},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'modifier') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneUnion.id);
          }

          this.modifier(this.selectedIndexes[0]);
          this.decocherTousElemListe();
          this.estModeCocherElemListe = false;
          //this.changerModeCocherElemListe();
        }else  if(dataReturned !== null && dataReturned.data == 'desarchiver') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneUnion.id);
          }
         

          this.desarchivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else  if(dataReturned !== null && dataReturned.data == 'archiver') {
          if(this.action == 'infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneUnion.id);
          }

          this.archivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        } else  if(dataReturned !== null && dataReturned.data == 'restaurer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneUnion.id);
          }

          this.restaurationMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else if(dataReturned !== null && dataReturned.data == 'derniereModification') {
          this.selectedItemDerniereModification();          
        }else if(dataReturned !== null && dataReturned.data == 'partager') {
          //this.changeStyle();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneUnion.id);
          }

          if(this.action != 'corbeille'){
            this.suppressionMultiple(this.selectedIndexes);
          }else{
            this.suppressionMultipleDefinitive(this.selectedIndexes)
          }

          //this.estModeCocherElemListe = false;
        }     
      });
      return await popover.present();
    }
  

    cacherAction(){
      if(this.unionsData.length != this.selectedIndexes.length) {
        this.cocherTousElemListe();
      }else {
        this.decocherTousElemListe();
      } 
    }
    

    async suppressionMultiple(ids) {
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
                for(let id of ids){
                  //var u = this.unionsData[i];
                  this.servicePouchdb.findRelationalDocByID('union', id).then((res) => {
                    res.unions[0].security = this.servicePouchdb.garderDeleteTrace(res.unions[0].security);
                    this.servicePouchdb.updateRelationalDoc(res.unions[0]).catch((err) => {
                      this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                    });//fin update
                    
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin get
                }
      
                if(this.action == 'infos'){
                  this.action = this.cacheAction;
                }
                //sinion dans le tableau
                
                if(!this.mobile){
                  this.dataTableRemoveRows();
                  this.selectedIndexes = [];
                }else{
                  this.unionsData = [...this.removeMultipleElem(this.unionsData, ids)];
                  this.allUnionsData = this.removeMultipleElem(this.allUnionsData, ids);
                  
                  //if(this.action != 'infos'){
                    this.estModeCocherElemListe = false;
                    this.decocherTousElemListe();
                  //}
                  //this.action = this.cacheAction;
                }
              }else{

                //suppresion multiple définitive
                for(let id of ids){
                  //var u = this.unionsData[i];
                  
                  this.servicePouchdb.findRelationalDocByID('union', id).then((res) => {
                    this.servicePouchdb.deleteRelationalDocDefinitivement(res.unions[0]).catch((err) => {
                      this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                    });//fin delete
                    
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin get
 
                }

                if(this.action == 'infos'){
                  this.action = this.cacheAction;
                }
                if(!this.mobile){
                  this.dataTableRemoveRows();
                  this.selectedIndexes = [];
                }else{
                  this.unionsData = [...this.removeMultipleElem(this.unionsData, ids)];
                  this.allUnionsData = [...this.removeMultipleElem(this.allUnionsData, ids)];

                  this.estModeCocherElemListe = false;
                  this.decocherTousElemListe();
                  //this.action = this.cacheAction;
                }
              }
              
            }
          }
        ]
      });
  
      await alert.present();
    }

    async suppressionMultipleDefinitive(ids) {
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
        message: this.translate.instant('GENERAL.ALERT_MESSAGE_SUPPRESSION_DEFINITIVE'),
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
          }, 
          {
            text: this.translate.instant('GENERAL.ALERT_OUI'),
            role: 'destructive',
            cssClass: 'alert-danger',
            handler: () => {
              //suppresion multiple définitive
              for(let id of ids){
                //var u = this.unionsData[i];
                
                this.servicePouchdb.findRelationalDocByID('union', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.unions[0]).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin delete
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }

              if(this.action == 'infos'){
                this.action = this.cacheAction;
              }

              if(!this.mobile){
                this.dataTableRemoveRows();
                this.selectedIndexes = [];
              }else{
                this.unionsData = [...this.removeMultipleElem(this.unionsData, ids)];
                this.allUnionsData = this.removeMultipleElem(this.allUnionsData, ids);
                
                //if(this.action != 'infos'){
                  this.estModeCocherElemListe = false;
                  this.decocherTousElemListe();
                //}
                //this.action = this.cacheAction;
              }
            }
          }
        ]
      });
  
      await alert.present();
    }

    async restaurationMultiple(ids) {
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
        message: this.translate.instant('GENERAL.ALERT_MESSAGE_RESTAURER'),
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
              for(let id of ids){
                //var u = this.unionsData[i];
                this.servicePouchdb.findRelationalDocByID('union', id).then((res) => {
                  res.unions[0].security = this.servicePouchdb.garderRestaureTrace(res.unions[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.unions[0]).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_RESTAURATION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_RESTAURATION')+': '+err.toString());
                });//fin get
              }
    
              if(this.action == 'infos'){
                this.action = this.cacheAction;
              }
              //sinion dans le tableau
              if(!this.mobile){
                this.dataTableRemoveRows();
                this.selectedIndexes = [];
              }else{
                this.unionsData = [...this.removeMultipleElem(this.unionsData, ids)];
                this.allUnionsData = [...this.removeMultipleElem(this.allUnionsData, ids)];
                
                //if(this.action != 'infos'){
                  this.estModeCocherElemListe = false;
                  this.decocherTousElemListe();
                //}
               // this.action = this.cacheAction;
              }
              //this.dataTableRemoveRows();
              
            }
          }
        ]
      });
  
      await alert.present();
    }


    removeMultipleElem(data, ids){
      let codes = [];
      if(this.mobile && this.action == 'infos'){
        codes.push(this.uneUnion.id);
      }else /*if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)*/{
        /*indexes.forEach((i) => {
          codes.push(data[i].numero);
        });*/
        codes = ids;
      }/*else{
        codes = indexes;
      }*/
      
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
        //this.actualiserTableau(this.unionsData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        this.action = "infos";
      }else{
        //this.action = 'liste';
        this.action = this.cacheAction; 
        //recharger la liste
        if(this.rechargerListeMobile){
          this.unionsData = [...this.unionsData];
          this.rechargerListeMobile = false;
        }
        ///this.actualiserTableau(this.unionsData);
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
              this.infos(this.unionsData[this.selectedIndexes[0]]);
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
              this.modifier(this.unionsData[this.selectedIndexes[0]]);
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
            this.suppressionMultiple(this.selectedIndexes);
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
        componentProps: {
          idModele: 'unions'},
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
            this.infos(this.unionsData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.unionsData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
          }*/
        } else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          this.suppressionMultiple(this.selectedIndexes);
        }
      });
      return await popover.present();
    }
  

    async actionDatatablePopover(ev: any) {
      const popover = await this.popoverController.create({
        component: ActionDatatableComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'unions', "action": this.action, "recherchePlus": this.recherchePlus, "filterAjouter": this.filterAjouter},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'dataTableAddRechercheParColonne') {
          if(!this.recherchePlus){
            this.dataTableAddRechercheParColonne();
          }else{
            this.dataTableRemoveRechercheParColonne();
          }
        } else if(dataReturned !== null && dataReturned.data == 'dataTableAddCustomFiltre') {
          if(!this.filterAjouter){
            this.dataTableAddCustomFiltre();
          }else{
            this.dataTableRemoveCustomFiltre();
          }
        } else if(dataReturned !== null && dataReturned.data == 'exportExcel') {
          this.exporter();
        } else if(dataReturned !== null && dataReturned.data == 'changeStyle') {
          this.changeStyle();
        } else if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.getUnionsByType('corbeille');
        } else if(dataReturned !== null && dataReturned.data == 'archives') {
          this.getUnionsByType('archives');
        } else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getUnionsByType('partages');
        } else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          //this.getUnionsByType('conflits');
        } else if(dataReturned !== null && dataReturned.data == 'liste') {
          this.getUnionsByType('liste');
        } 

  
      });
      return await popover.present();
    }


    async selectionPopover(ev: any) {
      const popover = await this.popoverController.create({
        component: SelectionComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'unions'},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'tous') {
          this.dataTableSelectAll();
        }else if(dataReturned !== null && dataReturned.data == 'aucun') {
          this.dataTableSelectNon();
        }
      });
      return await popover.present();
    }

    async datatableMorePopover(ev: any) {
      const popover = await this.popoverController.create({
        component: DatatableMoreComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'unions', action: this.action},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'listePrincipale') {
          this.getUnionsByType('liste');
        }else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getUnionsByType('partages');
        }else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          this.cacheAction = 'conflits';
          this.getUnionWithConflicts();
          //this.getUnion();
          this.selectedIndexes = [];
          this.allSelected = false;
          this.recherchePlus = false;
          this.filterAjouter = false;
        }else if(dataReturned !== null && dataReturned.data == 'styleAffichage') {
          //this.action = this.cacheAction;
          this.changeStyle();
          //this.selectedIndexes = [];
          
        }
      });
      return await popover.present();
    }

    getUnionWithConflicts(event = null){
      this.action = 'conflits';
      this.cacheAction = 'conflits';
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;

      this.servicePouchdb.findRelationalDocInConflict('union').then((res) => {
        if(res){
          //this.unionsData = [];
          let unionsData = [];
          let partenaireIndex = [];
          let paysIndex = [];
          let regionIndex = [];
          let departementIndex = [];
          let communeIndex = [];
          let localiteIndex = [];
          let idFederation, idPays, idRegion, idDepartement, idCommune, idSiege;

          for(let u of res.unions){
            //supprimer l'historique de la liste
            delete u.security['shared_history'];

            this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
              u.formData.niveau = res;
            });
            //charger la relation avec le paetenire si non niveaue
            if(u.partenaire && u.partenaire != ''){
              if(isDefined(partenaireIndex[u.partenaire])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 4);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 5);
                idFederation = res.partenaires[partenaireIndex[u.partenaire]].id;
              }else{
                for(let i=0; i < res.partenaires.length; i++){
                  if(res.partenaires[i].id == u.partenaire){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                    partenaireIndex[u.partenaire] = i;
                    idFederation = res.partenaires[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', null, 4);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', null, 5);
              idFederation = null;
            }


            //chargement des relation des localités
            if(isDefined(paysIndex[u.pays])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 6);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 7);
              idPays = res.pays[paysIndex[u.pays]].id;
            }else{
              for(let i=0; i < res.pays.length; i++){
                if(res.pays[i].id == u.pays){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 6);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 7);
                  paysIndex[u.pays] = i;
                  idPays = res.pays[i].id;
                  break;
                }
              }
            }

            if(isDefined(regionIndex[u.region])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 8);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 9);
              idRegion = res.regions[regionIndex[u.region]].id;
            }else{
              for(let i=0; i < res.regions.length; i++){
                if(res.regions[i].id == u.region){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 9);
                  regionIndex[u.region] = i;
                  idRegion = res.regions[i].id;
                  break;
                }
              }
            }

            if(isDefined(departementIndex[u.departement])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 10);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 11);
              idDepartement = res.departements[departementIndex[u.departement]].id;
            }else{
              for(let i=0; i < res.departements.length; i++){
                if(res.departements[i].id == u.departement){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                  departementIndex[u.departement] = i;
                  idDepartement = res.departements[i].id;
                  break;
                }
              }
            }
            
            
            if(isDefined(communeIndex[u.commune])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 12);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 13);
              idCommune = res.communes[communeIndex[u.commune]].id;
            }else{
              for(let i=0; i < res.communes.length; i++){
                if(res.communes[i].id == u.commune){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 13);
                  communeIndex[u.commune] = i;
                  idCommune = res.communes[i].id;
                  break;
                }
                }
            }
           
            
            if(isDefined(localiteIndex[u.localite])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 14);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 15);
              idSiege = res.localites[localiteIndex[u.localite]].id;
            }else{
              for(let i=0; i < res.localites.length; i++){
                if(res.localites[i].id == u.localite){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 15);
                  localiteIndex[u.localite] = i;
                  idSiege = res.localites[i].id;
                  break;
                }
              }
            }
            

            unionsData.push({id: u.id, idFederation: idFederation, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});
          }

          if(this.mobile){
            this.unionsData = unionsData;
            this.unionsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.allUnionsData = [...this.allUnionsData];

          } else{
            $('#union').ready(()=>{
              if(global.langue == 'en'){
                this.unionHTMLTable = createDataTable("union", this.colonnes, unionsData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.unionHTMLTable = createDataTable("union", this.colonnes, unionsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.attacheEventToDataTable(this.unionHTMLTable.datatable);
            });
          }
        }
        if(event)
          event.target.complete();
      }).catch((err) => {
        this.unions = [];
        this.unionsData = [];
        this.allUnionsData = [];
        console.log(err)
        if(event)
          event.target.complete();
      });
    }

    getUnionsByType(type){
      this.action = type;
      this.cacheAction = type;
      this.getUnion();
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;
    }

    async datatableConstructPopover(ev: any) {
      const popover = await this.popoverController.create({
        component: DatatableConstructComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'unions', "action": this.action, "cacheAction": this.cacheAction},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
        }else if(dataReturned !== null && dataReturned.data == 'archiver') {
          this.archivageMultiple(this.selectedIndexes);
        }else if(dataReturned !== null && dataReturned.data == 'desarchiver') {
          this.desarchivageMultiple(this.selectedIndexes);
        }else if(dataReturned !== null && dataReturned.data == 'restaurer') {
          this.restaurationMultiple(this.selectedIndexes);
        }else if(dataReturned !== null && dataReturned.data == 'derniereModification') {
          this.selectedItemDerniereModification();
        }else if(dataReturned !== null && dataReturned.data == 'partager') {
          //this.dataTableSelectAll();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          if(this.action != 'corbeille'){
            this.suppressionMultiple(this.selectedIndexes);
          }else{
            this.suppressionMultipleDefinitive(this.selectedIndexes)
          }
        }
      });
      return await popover.present();
    }
    
    async presentDerniereModification(union) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: {
          idModele: 'unions', _id: union.id, _rev: union.rev, security: union.security },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      let id
      if(this.action == 'infos'){
        id = this.uneUnion.id;
      }else{
        id = this.selectedIndexes[0];
      }

      if(id && id != ''){
        this.servicePouchdb.findRelationalDocByID('union', id).then((res) => {
          if(res && res.unions[0]){
            if(this.estModeCocherElemListe){
              this.estModeCocherElemListe = false;
              this.decocherTousElemListe();
            }
            this.presentDerniereModification(res.unions[0]);
          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          }
        });
        //this.selectedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      }
    }

    doNext(){

      //si datatable
      if(!this.mobile){
        this.datatableNextRow();
      }else{
        //si liste
      }
    }

    doPrev(){
      //si datatable
      if(!this.mobile){
        this.datatablePrevRow();
      }else{
        //si liste
      }
    }
    initDatatableNextPrevRow(){
      var i = this.unionHTMLTable.datatable.row('.selected').index();

      if(this.unionHTMLTable.datatable.row(i).next()){
        this.next = true;
      }else{
        this.next = false;
      }

      if(this.unionHTMLTable.datatable.row(i).prev()){
        this.prev = true;
      }else{
        this.prev = false;
      }
    }

    datatableNextRow(){
      //datatable.row(this.selectedIndexes).next().data();
      var i = this.unionHTMLTable.datatable.row('.selected').index();
      if(this.unionHTMLTable.datatable.row(i).next()){
        //this.unionHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.unionHTMLTable.datatable.rows().deselect();
        this.unionHTMLTable.datatable.row(i).next().select();
        this.selectedItemInfo();
        
        if(this.unionHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }else{
        this.next = false;

        if(this.unionHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }
    }

    datatablePrevRow(){
      //datatable.row(this.selectedIndexes).prev().data();
      var i = this.unionHTMLTable.datatable.row('.selected').index();
      if(this.unionHTMLTable.datatable.row(i).prev()){
        //this.unionHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.unionHTMLTable.datatable.rows().deselect();
        this.unionHTMLTable.datatable.row(i).prev().select();
        this.selectedItemInfo();
        
        if(this.unionHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }else{
        this.prev = false;

        if(this.unionHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }
    }

    datatableDeselectMultipleSelectedItemForModification(){
      if(this.selectedIndexes.length > 1){
        var i = this.unionHTMLTable.datatable.row('.selected').index();
        this.unionHTMLTable.datatable.rows().deselect();
        this.unionHTMLTable.datatable.row(i).select();
      }
    }

    selectedItemInfo(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.unionHTMLTable.datatable.row('.selected').index();
      let data  = this.unionHTMLTable.datatable.row(row).data();
      this.infos(data);
      this.initDatatableNextPrevRow();
        //this.selectedIndexes = [];
      //}else{
      //  alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      //}
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
        let row  = this.unionHTMLTable.datatable.row('.selected').index();
        let data  = this.unionHTMLTable.datatable.row(row).data();
        this.modifier(data);

        //this.selectedIndexes = [];
      //}else{
       // alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      //}
    }
  
  
    async openRelationUnion(ev: any/*, numeroUnion*/) {
      const popover = await this.popoverController.create({
        component: RelationsUnionComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'unions', "idUnion": this.uneUnion.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'OPs') {
          this.presentOP(this.uneUnion.id);
        } else if(dataReturned !== null && dataReturned.data == 'personne') {
          this.presentPersonne(this.uneUnion.id);
        }/*else if(dataReturned !== null && dataReturned.data == 'union') {
          
        }else if(dataReturned !== null && dataReturned.data == 'union') {
          
        } else if(dataReturned !== null && dataReturned.data == 'union') {
          
        }*/
  
      });
      return await popover.present();
    }

    async openRelationUnionDepuisListe(ev: any/*, codePays*/) {
      const popover = await this.popoverController.create({
        component: RelationsUnionComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'unions', "idUnion": this.selectedIndexes[0]},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'OPs') {
          this.presentOP(this.selectedIndexes[0]);
        }else if(dataReturned !== null && dataReturned.data == 'personne') {
          this.presentPersonne(this.selectedIndexes[0]);
        }
        /*if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.departementsData[this.selectedIndexes[0]].codeDepartement);
        } else if(dataReturned !== null && dataReturned.data == 'union') {
          this.presentUnion(this.departementsData[this.selectedIndexes[0]].codeDepartement) 
        }*/
  
      });
      return await popover.present();
    }
  

    async openRelationUnionDepuisTableau(ev: any/*, codePays*/) {
      //let row  = this.unionHTMLTable.datatable.row('.selected').index();
      //let data  = this.unionHTMLTable.datatable.row(row).data();
      const popover = await this.popoverController.create({
        component: RelationsUnionComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'unions', "idUnion": this.selectedIndexes[0]/*data.numero*/},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'OPs') {
          this.presentOP(this.selectedIndexes[0]);
        }else if(dataReturned !== null && dataReturned.data == 'personne') {
          this.presentPersonne(this.selectedIndexes[0]);
        }
  
      });
      return await popover.present();
    }

    async presentOP(idUnion){
      const modal = await this.modalController.create({
        component: OpPage,
        componentProps: {
          idModele: 'unions',  idUnion: idUnion },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentPersonne(idUnion){
      const modal = await this.modalController.create({
        component: PersonnesPage,
        componentProps: {
          idModele: 'unions',  idUnion: idUnion },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  

    onSubmit(){
      let formData = this.unionForm.value;
      let formioData = {};
      if(this.action === 'ajouter'){
        //créer un nouveau union
      
        let union: any = {
          //_id: 'fuma:union:'+data.numero,
          //id: formData.numero,
          type: 'union',
          pays: formData.idPays,
          region: formData.idRegion,
          departement: formData.idDepartement,
          commune: formData.idCommune,
          localite: formData.idSiege,
          partenaire: formData.idFederation, //relation avec la fédération
          formData: formData,
          //pour le customisation
          formioData: formioData,
          //pour garder les traces
          security: {
            creation_start: this.start,
            creation_end: moment().toISOString(),
            created_by: null,
            created_at: null,
            created_deviceid: null,
            created_imei: null,
            created_phonenumber: null,
            update_start: null,
            update_end: null,
            updated_by: null,
            updated_at: null,
            updated_deviceid: null,
            updated_imei: null,
            updated_phonenumber: null,
            archived: false,
            archived_by: null,
            archived_at: null,
            shared: false,
            shared_by: null,
            shared_at: null,
            shared_history: [],
            deleted: false,
            deleted_by: null,
            deleted_at: null,
          }

        };

        union.security = this.servicePouchdb.garderCreationTrace(union.security);

        //ne pas sauvegarder les information relative à la fédération dans l'objet union
        //relation-pour va faire le mapping à travers la propriété federation se trouvant dans l'objet union
        let doc = this.clone(union);
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
        delete doc.formData.nomCommune;
        delete doc.formData.idSiege;
        delete doc.formData.codeSiege;
        delete doc.formData.nomSiege;
        delete doc.formData.idFederation;
        delete doc.formData.numeroFederation;
        delete doc.formData.nomFederation;

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let unionData = {id: res.unions[0].id, ...union.formData, ...union.formioData, ...union.security};
          //this.unions = union;
          
          this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+unionData.niveau).subscribe((res: string) => {
            unionData.niveau = res;
          });
          //union._rev = res.unions[0].rev;
          //this.unions.push(union);
          this.action = 'liste';
          //this.rechargerListeMobile = true;
          if(!this.mobile){
            //mode tableau, ajout d'un autre union dans la liste
            this.dataTableAddRow(unionData)
          }else{
            //mobile, cache la liste des union pour mettre à jour la base de données
            this.unionsData.push(unionData);
            this.unionsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.unionsData = [...this.unionsData];

            this.allUnionsData.push(unionData);
            this.allUnionsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
          }
          //this.htmlTableAction = 'recharger';

          //initialiser la liste des unions
          //this.creerUnion(unionData.numeroUnion);
          
          //libérer la mémoire occupée par la liste des pays
          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
          this.communeData = [];
          this.localiteData = [];
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
  
      }else{
        //si modification
        this.uneUnionDoc.pays = formData.idPays,
          this.uneUnionDoc.region = formData.idRegion,
          this.uneUnionDoc.departement = formData.idDepartement,
          this.uneUnionDoc.commune = formData.idCommune,
          this.uneUnionDoc.localite = formData.idSiege,
          this.uneUnionDoc.partenaire = formData.idFederation
          this.uneUnionDoc.formData = formData;
          this.uneUnionDoc.formioData = formioData;

          //this.uneUnion = unionData;
          this.uneUnionDoc.security.update_start = this.start;
          this.uneUnionDoc.security.update_start = moment().toISOString();
          this.uneUnionDoc.security = this.servicePouchdb.garderUpdateTrace(this.uneUnionDoc.security);

          let doc = this.clone(this.uneUnionDoc);
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
          delete doc.formData.nomCommune;
          delete doc.formData.idSiege;
          delete doc.formData.codeSiege;
          delete doc.formData.nomSiege;
          delete doc.formData.idFederation;
          delete doc.formData.numeroFederation;
          delete doc.formData.nomFederation;

          this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
            //this.unions._rev = res.rev;
            //this.uneUnionDoc._rev = res.rev;
            let unionData = {id: this.uneUnionDoc.id, ...this.uneUnionDoc.formData, ...this.uneUnionDoc.formioData, ...this.uneUnionDoc.security};

            this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+unionData.niveau).subscribe((res: string) => {
              unionData.niveau = res;
            });

            this.action = 'infos';
            this.infos(unionData);

            
            if(this.mobile){
              //mode liste
              //cache la liste pour le changement dans virtual Scroll
              //this.unionsData = [...this.unionsData];
              
              //mise à jour dans la liste
              for(let i = 0; i < this.unionsData.length; i++){
                if(this.unionsData[i].id == unionData.id){
                  this.unionsData[i] = unionData;
                  break;
                }
              }


              this.unionsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              //mise à jour dans la liste cache
              for(let i = 0; i < this.allUnionsData.length; i++){
                if(this.allUnionsData[i].id == unionData.id){
                  this.allUnionsData[i] = unionData;
                  break;
                }
              }

              this.allUnionsData.sort((a, b) => {
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
              this.datatableDeselectMultipleSelectedItemForModification();
              this.dataTableUpdateRow(unionData);
            }

            this.paysData = [];
            this.regionData = [];
            this.departementData = [];
            this.communeData = [];
            this.localiteData = [];
            this.uneUnionDoc = null;

          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          });
      }
    }
  
  
    actualiserTableau(data){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#union').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.unionHTMLTable = createDataTable("union", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.unionHTMLTable = createDataTable("union", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.unionHTMLTable = createDataTable("union", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.unionHTMLTable = createDataTable("union", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.unionHTMLTable.datatable);
          });
        }
      
    }
  
    doRefresh(event) {
      if(this.action != 'conflits'){
        var deleted: any;
        var archived: any;
        var shared: any;
        if(this.action == 'corbeille'){
          deleted = true;
          archived = {$ne: null};
          shared = {$ne: null};
        }else if(this.action == 'archives'){
          archived = true;
          deleted = false;
          shared = {$ne: null};
        }else if(this.action == 'partages'){
          archived = {$ne: null};
          deleted = false;
          shared = true;
        }else{
          archived = false;
          deleted = false;
          shared = {$ne: null};
        }

        if((this.idPartenaire && this.idPartenaire != '') || this.filtreUnion){

          this.servicePouchdb.findRelationalDocOfTypeByPere('union', 'partenaire', this.idPartenaire, deleted, archived, shared).then((res) => {
            if(res && res.unions){
              let unionsData = [];
                //var datas = [];
              let partenaireIndex = [];
              let paysIndex = [];
              let regionIndex = [];
              let departementIndex = [];
              let communeIndex = [];
              let localiteIndex = [];
              let idFederation, idPays, idRegion, idDepartement, idCommune, idSiege;
  
              for(let u of res.unions){
                if(this.filtreUnion){
                  if((this.filtreUnion.indexOf(u.id) === -1) && ((this.filtrePartenaires.indexOf(u.partenaire) || u.formData.niveau == '2'))){
                    delete u.security['shared_history'];
    
                    this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                      u.formData.niveau = res;
                    });
                    //charger la relation avec le paetenire si non niveaue
                    if(u.partenaire && u.partenaire != ''){
                      if(isDefined(partenaireIndex[u.partenaire])){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 4);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 5);
                        idFederation = res.partenaires[partenaireIndex[u.partenaire]].id;
                      }else{
                        for(let i=0; i < res.partenaires.length; i++){
                          if(res.partenaires[i].id == u.partenaire){
                            u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                            u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                            partenaireIndex[u.partenaire] = i;
                            idFederation = res.partenaires[i].id;
                            break;
                          }
                        }
                      }  
                    }else{
                      //collone vide
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', null, 4);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', null, 5);
                      idFederation = null;
                    }
        
        
                    //chargement des relation des localités
                    if(isDefined(paysIndex[u.pays])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 6);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 7);
                      idPays = res.pays[paysIndex[u.pays]].id;
                    }else{
                      for(let i=0; i < res.pays.length; i++){
                        if(res.pays[i].id == u.pays){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 6);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 7);
                          paysIndex[u.pays] = i;
                          idPays = res.pays[i].id;
                          break;
                        }
                      }
                    }
        
                    if(isDefined(regionIndex[u.region])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 9);
                      idRegion = res.regions[regionIndex[u.region]].id;
                    }else{
                      for(let i=0; i < res.regions.length; i++){
                        if(res.regions[i].id == u.region){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 9);
                          regionIndex[u.region] = i;
                          idRegion = res.regions[i].id;
                          break;
                        }
                      }
                    }
        
                    if(isDefined(departementIndex[u.departement])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 11);
                      idDepartement = res.departements[departementIndex[u.departement]].id;
                    }else{
                      for(let i=0; i < res.departements.length; i++){
                        if(res.departements[i].id == u.departement){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                          departementIndex[u.departement] = i;
                          idDepartement = res.departements[i].id;
                          break;
                        }
                      }
                    }
                    
                    
                    if(isDefined(communeIndex[u.commune])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 12);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 13);
                      idCommune = res.communes[communeIndex[u.commune]].id;
                    }else{
                      for(let i=0; i < res.communes.length; i++){
                        if(res.communes[i].id == u.commune){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 13);
                          communeIndex[u.commune] = i;
                          idCommune = res.communes[i].id;
                          break;
                        }
                        }
                    }
                   
                    
                    if(isDefined(localiteIndex[u.localite])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 14);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 15);
                      idSiege = res.localites[localiteIndex[u.localite]].id;
                    }else{
                      for(let i=0; i < res.localites.length; i++){
                        if(res.localites[i].id == u.localite){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 15);
                          localiteIndex[u.localite] = i;
                          idSiege = res.localites[i].id;
                          break;
                        }
                      }
                    }
                    
        
                    unionsData.push({id: u.id, idFederation: idFederation, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});    
                  }
                }else{
                  delete u.security['shared_history'];
    
                  this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                    u.formData.niveau = res;
                  });
                  //charger la relation avec le paetenire si non niveaue
                  if(u.partenaire && u.partenaire != ''){
                    if(isDefined(partenaireIndex[u.partenaire])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 4);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 5);
                      idFederation = res.partenaires[partenaireIndex[u.partenaire]].id;
                    }else{
                      for(let i=0; i < res.partenaires.length; i++){
                        if(res.partenaires[i].id == u.partenaire){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                          partenaireIndex[u.partenaire] = i;
                          idFederation = res.partenaires[i].id;
                          break;
                        }
                      }
                    }  
                  }else{
                    //collone vide
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', null, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', null, 5);
                    idFederation = null;
                  }
      
      
                  //chargement des relation des localités
                  if(isDefined(paysIndex[u.pays])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 7);
                    idPays = res.pays[paysIndex[u.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == u.pays){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 6);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 7);
                        paysIndex[u.pays] = i;
                        idPays = res.pays[i].id;
                        break;
                      }
                    }
                  }
      
                  if(isDefined(regionIndex[u.region])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 9);
                    idRegion = res.regions[regionIndex[u.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == u.region){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 9);
                        regionIndex[u.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }
      
                  if(isDefined(departementIndex[u.departement])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 11);
                    idDepartement = res.departements[departementIndex[u.departement]].id;
                  }else{
                    for(let i=0; i < res.departements.length; i++){
                      if(res.departements[i].id == u.departement){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                        departementIndex[u.departement] = i;
                        idDepartement = res.departements[i].id;
                        break;
                      }
                    }
                  }
                  
                  
                  if(isDefined(communeIndex[u.commune])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 12);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 13);
                    idCommune = res.communes[communeIndex[u.commune]].id;
                  }else{
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == u.commune){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 13);
                        communeIndex[u.commune] = i;
                        idCommune = res.communes[i].id;
                        break;
                      }
                      }
                  }
                 
                  
                  if(isDefined(localiteIndex[u.localite])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 14);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 15);
                    idSiege = res.localites[localiteIndex[u.localite]].id;
                  }else{
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == u.localite){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 15);
                        localiteIndex[u.localite] = i;
                        idSiege = res.localites[i].id;
                        break;
                      }
                    }
                  }
                  
                  unionsData.push({id: u.id, idFederation: idFederation, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});  
                }
                //supprimer l'historique de la liste
              }
    
            //si mobile
            if(this.mobile){
              this.unionsData = unionsData;
              this.unionsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              this.allUnionsData = [...this.unionsData]
            } else{
                let expor = global.peutExporterDonnees;
                if(this.filtreUnion){
                  expor = false;
                }

                $('#union-partenaire').ready(()=>{
                  if(global.langue == 'en'){
                    this.unionHTMLTable = createDataTable("union-partenaire", this.colonnes, unionsData, null, this.translate, expor);
                  }else{
                    this.unionHTMLTable = createDataTable("union-partenaire", this.colonnes, unionsData, global.dataTable_fr, this.translate, expor);
                  }
                  this.attacheEventToDataTable(this.unionHTMLTable.datatable);
                });
              }
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }else{
              this.unions = [];
              //if(this.mobile){
                this.unionsData = [];
                this.allUnionsData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            console.log('Erreur acces à la union ==> '+err)
            this.unions = [];
            //if(this.mobile){
              this.unionsData = [];
              this.allUnionsData = [];
            //}
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          });  
        }else{

          this.servicePouchdb.findRelationalDocByType('union', deleted, archived, shared).then((res) => {
            if(res && res.unions){
              let unionsData = [];
                //var datas = [];
              let partenaireIndex = [];
              let paysIndex = [];
              let regionIndex = [];
              let departementIndex = [];
              let communeIndex = [];
              let localiteIndex = [];
              let idFederation, idPays, idRegion, idDepartement, idCommune, idSiege;
  
              for(let u of res.unions){
                //supprimer l'historique de la liste
                delete u.security['shared_history'];
    
                this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                  u.formData.niveau = res;
                });
                //charger la relation avec le paetenire si non niveaue
                if(u.partenaire && u.partenaire != ''){
                  if(isDefined(partenaireIndex[u.partenaire])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 5);
                    idFederation = res.partenaires[partenaireIndex[u.partenaire]].id;
                  }else{
                    for(let i=0; i < res.partenaires.length; i++){
                      if(res.partenaires[i].id == u.partenaire){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                        partenaireIndex[u.partenaire] = i;
                        idFederation = res.partenaires[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', null, 4);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', null, 5);
                  idFederation = null;
                }
    
    
                //chargement des relation des localités
                if(isDefined(paysIndex[u.pays])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 6);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 7);
                  idPays = res.pays[paysIndex[u.pays]].id;
                }else{
                  for(let i=0; i < res.pays.length; i++){
                    if(res.pays[i].id == u.pays){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 6);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 7);
                      paysIndex[u.pays] = i;
                      idPays = res.pays[i].id;
                      break;
                    }
                  }
                }
    
                if(isDefined(regionIndex[u.region])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 9);
                  idRegion = res.regions[regionIndex[u.region]].id;
                }else{
                  for(let i=0; i < res.regions.length; i++){
                    if(res.regions[i].id == u.region){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 9);
                      regionIndex[u.region] = i;
                      idRegion = res.regions[i].id;
                      break;
                    }
                  }
                }
    
                if(isDefined(departementIndex[u.departement])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 11);
                  idDepartement = res.departements[departementIndex[u.departement]].id;
                }else{
                  for(let i=0; i < res.departements.length; i++){
                    if(res.departements[i].id == u.departement){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                      departementIndex[u.departement] = i;
                      idDepartement = res.departements[i].id;
                      break;
                    }
                  }
                }
                
                
                if(isDefined(communeIndex[u.commune])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 12);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 13);
                  idCommune = res.communes[communeIndex[u.commune]].id;
                }else{
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == u.commune){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 13);
                      communeIndex[u.commune] = i;
                      idCommune = res.communes[i].id;
                      break;
                    }
                    }
                }
               
                
                if(isDefined(localiteIndex[u.localite])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 14);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 15);
                  idSiege = res.localites[localiteIndex[u.localite]].id;
                }else{
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == u.localite){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 15);
                      localiteIndex[u.localite] = i;
                      idSiege = res.localites[i].id;
                      break;
                    }
                  }
                }
                
    
                unionsData.push({id: u.id, idFederation: idFederation, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});
              }
    
            //si mobile
            if(this.mobile){
              this.unionsData = unionsData;
              this.unionsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              this.allUnionsData = [...this.unionsData]
            } else{
                $('#union').ready(()=>{
                  if(global.langue == 'en'){
                    this.unionHTMLTable = createDataTable("union", this.colonnes, unionsData, null, this.translate, global.peutExporterDonnees);
                  }else{
                    this.unionHTMLTable = createDataTable("union", this.colonnes, unionsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.unionHTMLTable.datatable);
                });
              }
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }else{
              this.unions = [];
              //if(this.mobile){
                this.unionsData = [];
                this.allUnionsData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            console.log('Erreur acces à la union ==> '+err)
            this.unions = [];
            //if(this.mobile){
              this.unionsData = [];
              this.allUnionsData = [];
            //}
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          });
      
        }

      }else{
        this.getUnionWithConflicts(event);
      }
    
      this.filterAjouter = false;
      this.filterInitialiser = false;
      this.recherchePlus = false;
      this.allSelected = false;
      this.selectedIndexes = [];
      /*setTimeout(() => {
        event.target.complete();
      }, 2000);*/
    }
  
    getUnion(){
      //tous les departements
      if(this.idUnion && this.idUnion != ''){
        this.servicePouchdb.findRelationalDocByID('union', this.idUnion).then((res) => {
          if(res && res.unions[0]){
            let f = null;
            //this.uneUnion = res && res.unions[0];
            this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+res.unions[0].formData.niveau).subscribe((res2: string) => {
              res.unions[0].formData.niveau = res2;
            });

            if(res.partenaires && res.partenaires[0]){
              res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'numeroFederation', res.partenaires[0].formData.numero, 4);
              res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'nomFederation', res.partenaires[0].formData.nom, 5); 
              f = res.partenaires[0].id;
            }else{
              res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'numeroFederation', null, 4);
              res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'nomFederation', null, 5);
            }

            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'nomPays', res.pays[0].formData.nom, 6); 
            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'codePays', res.pays[0].formData.code, 7);   
            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'nomRegion', res.regions[0].formData.nom, 8); 
            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'codeRegion', res.regions[0].formData.code, 9);   
            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'nomDepartement', res.departements[0].formData.nom, 10);
            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'codeDepartement', res.departements[0].formData.code, 11);  
            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'nomCommune', res.communes[0].formData.nom, 12);  
            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'codeCommune', res.communes[0].formData.code, 13);   
            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'nomSiege', res.localites[0].formData.nom, 14);  
            res.unions[0].formData = this.addItemToObjectAtSpecificPosition(res.unions[0].formData, 'codeSiege', res.localites[0].formData.code, 15);   
            
            this.infos({id: res.unions[0].id, idFederation: f, idPays: res.pays[0].id, idRegion: res.regions[0].id, idDepartement: res.departements[0].id, idCommune: res.communes[0].id, idSiege: res.localites[0].id, ...res.unions[0].formData}); 
          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
            this.close();
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          console.log(err)
          this.close();
        });
      }else if((this.idPartenaire && this.idPartenaire != '') || this.filtreUnion){
        var deleted: any;
        var archived: any;
        var shared: any;
        if(this.action == 'corbeille'){
          deleted = true;
          archived = {$ne: null};
          shared = {$ne: null};
        }else if(this.action == 'archives'){
          archived = true;
          deleted = false;
          shared = {$ne: null};
        }else if(this.action == 'partages'){
          archived = {$ne: null};
          deleted = false;
          shared = true;
        }else{
          archived = false;
          deleted = false;
          shared = {$ne: null};
        }
        this.servicePouchdb.findRelationalDocOfTypeByPere('union', 'partenaire', this.idPartenaire, deleted, archived, shared).then((res) => {
          if(res && res.unions){
            //this.unions = [...unions];
            //this.unionsData = [];
            
            let unionsData = [];
            //var datas = [];
            let partenaireIndex = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let localiteIndex = [];
            let idFederation, idPays, idRegion, idDepartement, idCommune, idSiege;

            for(let u of res.unions){
              //supprimer l'historique de la liste
              if(this.filtreUnion){
                if((this.filtreUnion.indexOf(u.id) === -1) && ((this.filtrePartenaires.indexOf(u.partenaire) || u.formData.niveau == '2'))){
                  delete u.security['shared_history'];
  
                  this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                    u.formData.niveau = res;
                  });
                  //charger la relation avec le paetenire si non niveaue
                  if(u.partenaire && u.partenaire != ''){
                    if(isDefined(partenaireIndex[u.partenaire])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 4);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 5);
                      idFederation = res.partenaires[partenaireIndex[u.partenaire]].id;
                    }else{
                      for(let i=0; i < res.partenaires.length; i++){
                        if(res.partenaires[i].id == u.partenaire){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                          partenaireIndex[u.partenaire] = i;
                          idFederation = res.partenaires[i].id;
                          break;
                        }
                      }
                    }  
                  }else{
                    //collone vide
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', null, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', null, 5);
                    idFederation = null;
                  }
      
      
                  //chargement des relation des localités
                  if(isDefined(paysIndex[u.pays])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 7);
                    idPays = res.pays[paysIndex[u.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == u.pays){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 6);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 7);
                        paysIndex[u.pays] = i;
                        idPays = res.pays[i].id;
                        break;
                      }
                    }
                  }
      
                  if(isDefined(regionIndex[u.region])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 9);
                    idRegion = res.regions[regionIndex[u.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == u.region){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 9);
                        regionIndex[u.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }
      
                  if(isDefined(departementIndex[u.departement])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 11);
                    idDepartement = res.departements[departementIndex[u.departement]].id;
                  }else{
                    for(let i=0; i < res.departements.length; i++){
                      if(res.departements[i].id == u.departement){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                        departementIndex[u.departement] = i;
                        idDepartement = res.departements[i].id;
                        break;
                      }
                    }
                  }
                  
                  
                  if(isDefined(communeIndex[u.commune])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 12);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 13);
                    idCommune = res.communes[communeIndex[u.commune]].id;
                  }else{
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == u.commune){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 13);
                        communeIndex[u.commune] = i;
                        idCommune = res.communes[i].id;
                        break;
                      }
                      }
                  }
                 
                  
                  if(isDefined(localiteIndex[u.localite])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 14);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 15);
                    idSiege = res.localites[localiteIndex[u.localite]].id;
                  }else{
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == u.localite){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 15);
                        localiteIndex[u.localite] = i;
                        idSiege = res.localites[i].id;
                        break;
                      }
                    }
                  }
                  
      
                  unionsData.push({id: u.id, idFederation: idFederation, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});    
                }
              }else{
                delete u.security['shared_history'];
  
                this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                  u.formData.niveau = res;
                });
                //charger la relation avec le paetenire si non niveaue
                if(u.partenaire && u.partenaire != ''){
                  if(isDefined(partenaireIndex[u.partenaire])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 5);
                    idFederation = res.partenaires[partenaireIndex[u.partenaire]].id;
                  }else{
                    for(let i=0; i < res.partenaires.length; i++){
                      if(res.partenaires[i].id == u.partenaire){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                        partenaireIndex[u.partenaire] = i;
                        idFederation = res.partenaires[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', null, 4);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', null, 5);
                  idFederation = null;
                }
    
    
                //chargement des relation des localités
                if(isDefined(paysIndex[u.pays])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 6);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 7);
                  idPays = res.pays[paysIndex[u.pays]].id;
                }else{
                  for(let i=0; i < res.pays.length; i++){
                    if(res.pays[i].id == u.pays){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 6);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 7);
                      paysIndex[u.pays] = i;
                      idPays = res.pays[i].id;
                      break;
                    }
                  }
                }
    
                if(isDefined(regionIndex[u.region])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 9);
                  idRegion = res.regions[regionIndex[u.region]].id;
                }else{
                  for(let i=0; i < res.regions.length; i++){
                    if(res.regions[i].id == u.region){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 9);
                      regionIndex[u.region] = i;
                      idRegion = res.regions[i].id;
                      break;
                    }
                  }
                }
    
                if(isDefined(departementIndex[u.departement])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 11);
                  idDepartement = res.departements[departementIndex[u.departement]].id;
                }else{
                  for(let i=0; i < res.departements.length; i++){
                    if(res.departements[i].id == u.departement){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                      departementIndex[u.departement] = i;
                      idDepartement = res.departements[i].id;
                      break;
                    }
                  }
                }
                
                
                if(isDefined(communeIndex[u.commune])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 12);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 13);
                  idCommune = res.communes[communeIndex[u.commune]].id;
                }else{
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == u.commune){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 13);
                      communeIndex[u.commune] = i;
                      idCommune = res.communes[i].id;
                      break;
                    }
                    }
                }
               
                
                if(isDefined(localiteIndex[u.localite])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 14);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 15);
                  idSiege = res.localites[localiteIndex[u.localite]].id;
                }else{
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == u.localite){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 15);
                      localiteIndex[u.localite] = i;
                      idSiege = res.localites[i].id;
                      break;
                    }
                  }
                }
                
    
                unionsData.push({id: u.id, idFederation: idFederation, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});  
              }
            }
  
            //this.unionsData = [...datas];
  
            if(this.mobile){
              this.unionsData = unionsData;
              this.unionsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allUnionsData = [...this.unionsData];

            } else {
              //si non mobile ou mobile + mode tableau et 
              let expor = global.peutExporterDonnees;
                if(this.filtreUnion){
                  expor = false;
                }
              $('#union-partenaire').ready(()=>{
                
                if(global.langue == 'en'){
                  this.unionHTMLTable = createDataTable("union-partenaire", this.colonnes, unionsData, null, this.translate, expor);
                }else{
                  this.unionHTMLTable = createDataTable("union-partenaire", this.colonnes, unionsData, global.dataTable_fr, this.translate, expor);
                }
                this.attacheEventToDataTable(this.unionHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.unions = [];
          this.unionsData = [];
          console.log(err)
        });
      
      } else{
        var deleted: any;
        var archived: any;
        var shared: any;
        if(this.action == 'corbeille'){
          deleted = true;
          archived = {$ne: null};
          shared = {$ne: null};
        }else if(this.action == 'archives'){
          archived = true;
          deleted = false;
          shared = {$ne: null};
        }else if(this.action == 'partages'){
          archived = {$ne: null};
          deleted = false;
          shared = true;
        }else{
          archived = false;
          deleted = false;
          shared = {$ne: null};
        }
        this.servicePouchdb.findRelationalDocByType('union', deleted, archived, shared).then((res) => {
          //console.log(res)
          if(res && res.unions){
            //this.unions = [...unions];
            //this.unionsData = [];
            let unionsData = [];
            //var datas = [];
            let partenaireIndex = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let localiteIndex = [];
            let idFederation, idPays, idRegion, idDepartement, idCommune, idSiege;

            for(let u of res.unions){
              //supprimer l'historique de la liste
              delete u.security['shared_history'];
  
              this.translate.get('UNION_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                u.formData.niveau = res;
              });
              //charger la relation avec le paetenire si non niveaue
              if(u.partenaire && u.partenaire != ''){
                if(isDefined(partenaireIndex[u.partenaire])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 4);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 5);
                  idFederation = res.partenaires[partenaireIndex[u.partenaire]].id;
                }else{
                  for(let i=0; i < res.partenaires.length; i++){
                    if(res.partenaires[i].id == u.partenaire){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                      partenaireIndex[u.partenaire] = i;
                      idFederation = res.partenaires[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', null, 4);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', null, 5);
                idFederation = null;
              }
  
  
              //chargement des relation des localités
              if(isDefined(paysIndex[u.pays])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 6);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 7);
                idPays = res.pays[paysIndex[u.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == u.pays){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 7);
                    paysIndex[u.pays] = i;
                    idPays = res.pays[i].id;
                    break;
                  }
                }
              }
  
              if(isDefined(regionIndex[u.region])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 8);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 9);
                idRegion = res.regions[regionIndex[u.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == u.region){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 9);
                    regionIndex[u.region] = i;
                    idRegion = res.regions[i].id;
                    break;
                  }
                }
              }
  
              if(isDefined(departementIndex[u.departement])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 10);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 11);
                idDepartement = res.departements[departementIndex[u.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == u.departement){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                    departementIndex[u.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }
              
              
              if(isDefined(communeIndex[u.commune])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 12);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 13);
                idCommune = res.communes[communeIndex[u.commune]].id;
              }else{
                for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == u.commune){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 13);
                    communeIndex[u.commune] = i;
                    idCommune = res.communes[i].id;
                    break;
                  }
                  }
              }
             
              
              if(isDefined(localiteIndex[u.localite])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 14);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 15);
                idSiege = res.localites[localiteIndex[u.localite]].id;
              }else{
                for(let i=0; i < res.localites.length; i++){
                  if(res.localites[i].id == u.localite){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 15);
                    localiteIndex[u.localite] = i;
                    idSiege = res.localites[i].id;
                    break;
                  }
                }
              }
              
  
              unionsData.push({id: u.id, idFederation: idFederation, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});
            }  

            //this.unionsData = [...datas];
  
            if(this.mobile){
              this.unionsData = unionsData;
              this.unionsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allUnionsData = [...this.unionsData];
            } else {
              //si non mobile ou mobile + mode tableau et 
              $('#union').ready(()=>{
                if(global.langue == 'en'){
                  this.unionHTMLTable = createDataTable("union", this.colonnes, unionsData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.unionHTMLTable = createDataTable("union", this.colonnes, unionsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.unionHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.unions = [];
          this.unionsData = [];
          console.log(err)
        });
      }
      
    }
  
    
  
    getPays(){
      this.paysData = [];
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
            this.setSelect2DefaultValue('idPays', this.uneUnion.idPays);
          }
        }
      }).catch((e) => {
        console.log('pays erreur: '+e);
        this.paysData = [];
      });

    }

    getRegionParPays(idPays){
      this.regionData = [];
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
            this.setSelect2DefaultValue('idRegion', this.uneUnion.idRegion);
          }
        }
      }).catch((e) => {
        console.log('region erreur: '+e);
        this.regionData = [];
      });

    }

    getDepartementParRegion(idRegion){
      this.departementData = [];
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
            this.setSelect2DefaultValue('idDepartement', this.uneUnion.idDepartement);
          }
        }
      }).catch((e) => {
        console.log('departement erreur: '+e);
        this.departementData = [];
      });

      
    }

    getCommuneParDepartement(idDepartement){
      this.communeData = [];
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
            this.setSelect2DefaultValue('idCommune', this.uneUnion.idCommune);
          }
        }
      }).catch((e) => {
        console.log('nomCommune erreur: '+e);
        this.communeData = [];
      });
    
    }

    
    getLocaliteParCommune(idCommune){
      this.localiteData = [];
      this.servicePouchdb.findRelationalDocHasMany('localite', 'commune', idCommune).then((res) => {
        if(res && res.localites){
          this.localiteData = [];
          //var datas = [];
          for(let l of res.localites){
            this.localiteData.push({id: l.id, ...l.formData});
          }

          this.localiteData.sort((a, b) => {
            if (a.nom < b.nom) {
              return -1;
            }
            if (a.nom > b.nom) {
              return 1;
            }
            return 0;
          });


          if(this.doModification){
            this.setSelect2DefaultValue('idSiege', this.uneUnion.idSiege);
          }
        }
      }).catch((e) => {
        console.log('vilage commune erreur: '+e);
        this.localiteData = [];
      });
    }


    getFederation(){
      this.servicePouchdb.findRelationalDocByTypeAndDeleted('partenaire', false).then((res) => {
        if(res && res.partenaires){
          //this.partenaires = [...partenaires];
          this.federationData = [];
          //var datas = [];
          for(let f of res.partenaires){
            if(f.formData.categorie == '1'){
              this.federationData.push({id: f.id, numero: f.formData.numero, nom: f.formData.nom});

              if(!this.doModification && !this.idPartenaire && f.formData.monInstitution){
                this.setSelect2DefaultValue('idFederation', f.id);
              }
            }
          }

          this.federationData.sort((a, b) => {
            if (a.nom < b.nom) {
              return -1;
            }
            if (a.nom > b.nom) {
              return 1;
            }
            return 0;
          });

          if(this.doModification){
            this.setSelect2DefaultValue('idFederation', this.uneUnion.idFederation);
          }else if(this.idPartenaire){
            this.setSelect2DefaultValue('idFederation', this.idPartenaire);
            $('#idFederation select').ready(()=>{
              $('#idFederation select').attr('disabled', true)
            });
          }
          
        }
      }).catch((err) => {
        this.federationData = [];
        console.log(err)
      });
    }

    
    setCodeAndNomPays(idPays){
      if(idPays && idPays != ''){
        for(let p of this.paysData){
          if(idPays == p.id){
            this.unionForm.controls.codePays.setValue(p.code);
            this.unionForm.controls.nomPays.setValue(p.nom);

            this.unionForm.controls.idRegion.setValue(null);
            this.unionForm.controls.codeRegion.setValue(null);
            this.unionForm.controls.nomRegion.setValue(null);

            this.departementData = [];
            this.unionForm.controls.idDepartement.setValue(null);
            this.unionForm.controls.codeDepartement.setValue(null);
            this.unionForm.controls.nomDepartement.setValue(null);

            this.communeData = [];
            this.unionForm.controls.idCommune.setValue(null);
            this.unionForm.controls.codeCommune.setValue(null);
            this.unionForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.unionForm.controls.idSiege.setValue(null);
            this.unionForm.controls.codeSiege.setValue(null);
            this.unionForm.controls.nomSiege.setValue(null);

            this.getRegionParPays(idPays)
            break;
          }
        }
      }
    }

    setCodeAndNomRegion(idRegion){
      if(idRegion && idRegion != ''){
        for(let r of this.regionData){
          if(idRegion == r.id){
            this.unionForm.controls.codeRegion.setValue(r.code);
            this.unionForm.controls.nomRegion.setValue(r.nom);

            this.unionForm.controls.idDepartement.setValue(null);
            this.unionForm.controls.codeDepartement.setValue(null);
            this.unionForm.controls.nomDepartement.setValue('');

            this.communeData = [];
            this.unionForm.controls.idCommune.setValue(null);
            this.unionForm.controls.codeCommune.setValue(null);
            this.unionForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.unionForm.controls.idSiege.setValue(null);
            this.unionForm.controls.codeSiege.setValue(null);
            this.unionForm.controls.nomSiege.setValue(null);

            this.getDepartementParRegion(idRegion)
            break;
          }
        }
      }
    }

    setCodeAndNomDepartement(idDepartement){
      if(idDepartement && idDepartement != ''){
        for(let d of this.departementData){
          if(idDepartement == d.id){
            this.unionForm.controls.codeDepartement.setValue(d.code);
            this.unionForm.controls.nomDepartement.setValue(d.nom);

            this.unionForm.controls.idCommune.setValue(null);
            this.unionForm.controls.codeCommune.setValue(null);
            this.unionForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.unionForm.controls.idSiege.setValue(null);
            this.unionForm.controls.codeSiege.setValue(null);
            this.unionForm.controls.nomSiege.setValue(null);

            this.getCommuneParDepartement(idDepartement)
            break;
          }
        }
      }
    }

    setCodeAndNomCommune(idCommune){
      if(idCommune && idCommune != ''){
        for(let c of this.communeData){
          if(idCommune == c.id){
            this.unionForm.controls.codeCommune.setValue(c.code);
            this.unionForm.controls.nomCommune.setValue(c.nom);
            
            this.unionForm.controls.idSiege.setValue(null);
            this.unionForm.controls.codeSiege.setValue(null);
            this.unionForm.controls.nomSiege.setValue(null);
            this.getLocaliteParCommune(idCommune)
            break;
          }
        }
      }
    }

    setCodeAndNomLocalite(idSiege){
      if(idSiege && idSiege != ''){
        for(let l of this.localiteData){
          if(idSiege == l.id){
            this.unionForm.controls.codeSiege.setValue(l.code);
            this.unionForm.controls.nomSiege.setValue(l.nom);
            break;
          }
        }
      }
    }


    setCodeAndNomFederation(idFederation){
      if(idFederation && idFederation != ''){
        for(let f of this.federationData){
          if(idFederation == f.id){
            this.unionForm.controls.numeroFederation.setValue(f.numero);
            this.unionForm.controls.nomFederation.setValue(f.nom);
            break;
          }
        }
      }else{
        this.unionForm.controls.numeroFederation.setValue(null);
        this.unionForm.controls.nomFederation.setValue(null);
      }
    }
  
    setIDCodeEtNomPays(paysData){
      this.unionForm.controls.idPays.setValue(paysData.id);
      this.unionForm.controls.codePays.setValue(paysData.code);
      this.unionForm.controls.nomPays.setValue(paysData.nom);
    }

    setIDCodeEtNomRegion(regionData){
      this.unionForm.controls.idRegion.setValue(regionData.id);
      this.unionForm.controls.codeRegion.setValue(regionData.code);
      this.unionForm.controls.nomRegion.setValue(regionData.nom);
    }

    setIDCodeEtNomDepartement(departementData){
      this.unionForm.controls.idDepartement.setValue(departementData.id);
      this.unionForm.controls.codeDepartement.setValue(departementData.code);
      this.unionForm.controls.nomDepartement.setValue(departementData.nom);
    }

    setIDCodeEtNomCommune(communeData){
      this.unionForm.controls.idCommune.setValue(communeData.id);
      this.unionForm.controls.codeCommune.setValue(communeData.code);
      this.unionForm.controls.nomCommune.setValue(communeData.nom);
    }

    setIDCodeEtNomLocalite(localiteData){
      console.log(localiteData.id)
      this.unionForm.controls.idSiege.setValue(localiteData.id);
      this.unionForm.controls.codeSiege.setValue(localiteData.code);
      this.unionForm.controls.nomSiege.setValue(localiteData.nom);
    }

 

    attacheEventToDataTable(datatable){
      var self = this;
      var id = 'union-datatable';
      datatable.on( 'select', function ( e, dt, type, indexes ) {
        for(const i of indexes){
          //pour éviter les doublon d'index
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
      })/*.on( 'dblclick', 'tr', function ( e, dt, type, indexes) {
        console.log(e)
        //console.log(dt)
        //console.log(type)
        //console.log(indexes)
        
        console.log(this);
        console.log(this.unionHTMLTable.datatable.row(this).data());
      })*/;
      
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
      /*var id = '';
      if(this.codePays && this.codePays != ''){
        id = 'union-pays-datatable';
      }else{ 
        id = 'union-datatable';
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
      $('#'+id+' thead tr:eq(0) th:eq(8)').html(this.translate.instant('UNION_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(9)').html(this.translate.instant('UNION_PAGE.NUMERO'));
      $('#'+id+' thead tr:eq(0) th:eq(10)').html(this.translate.instant('UNION_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(11)').html(this.translate.instant('UNION_PAGE.NIVEAU'));
      $('#'+id+' thead tr:eq(0) th:eq(12)').html(this.translate.instant('UNION_PAGE.AUTRETYPE'));
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
      //numéro union
      this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.NUMERO.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numero[0].message = res;
      });
      
      this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.NUMERO.UNIQUENUMEROPARTENAIRE').subscribe((res: string) => {
        this.messages_validation.numero[1].message = res;
      });
  
      //nom union
      this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.NOM.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });

       //niveau
       this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.NIVEAU.REQUIRED').subscribe((res: string) => {
        this.messages_validation.niveau[0].message = res;
      });

       //numero fédération
       this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.NUMERO_FEDERATION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idFederation[0].message = res;
      });

      //autre type domaine
      /*this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.DOMAINE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.domaine[0].message = res;
      });*/

      //code pays
      this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPays[0].message = res;
      });


      //code région
      this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idRegion[0].message = res;
      });

      //code département
      this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idDepartement[0].message = res;
      });

      //code commune
      this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.CODECOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idCommune[0].message = res;
      });

      //code localité
      this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.CODESIEGE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idSiege[0].message = res;
      });
    }
  
    
    dataTableAddRow(rowData){
 
      $('#union-dataTable').ready(() => {
        this.unionHTMLTable.datatable.row.add(rowData).draw();
      });
      
    }
  
    dataTableUpdateRow(/*index, */rowData){

      $('#union-dataTable').ready(() => {
        this.unionHTMLTable.datatable.row('.selected').data(rowData).draw();
      });
      
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      $('#union-dataTable').ready(() => {
        this.unionHTMLTable.datatable.rows('.selected').remove().draw();
      });

    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.unionHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.unionHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.unionHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    if(this.unionHTMLTable && this.unionHTMLTable.datatable){
      //var id = 'union-datatable';

      var self = this;
      //$('#'+id+' thead tr:eq(1)').show();

      //$(self.unionHTMLTable.datatable.table().header() ).children(1).show();
      $(self.unionHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
      this.recherchePlus = true;
    }
  }

  dataTableRemoveRechercheParColonne(){
    //var id = 'union-datatable';
    var self = this;

    //$('#'+id+' thead tr:eq(1)').hide();
    //$(self.unionHTMLTable.datatable.table().header() ).children(1).hide();
    $(self.unionHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'union-datatable';
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
      $( self.unionHTMLTable.datatable.table().footer() ).show();
      this.unionHTMLTable.datatable.columns().every( function () {
          i = i +1;
          //console.log("data-header=" +$(self.unionHTMLTable.datatable.table().header()).children(0).children(0)[1].firstChild.nodeValue)
          var column = this;
          //console.log($(column.header())[0].firstChild.nodeValue)
          var select = $('<select id="'+id+i+'" data-header="'+$(column.header())[0].firstChild.nodeValue+'" placeholder="'+self.translate.instant('GENERAL.FILTRER')+'" class="form-control form-control-sm" multiple data-language="'+lang+'" data-selected-text-format="count" data-width="100%" data-live-search="true" data-size="5" data-actions-box="true" data-container="body"></select>')
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
                  
                  var info = self.unionHTMLTable.datatable.page.info();
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
          /*$( self.unionHTMLTable.datatable.table().footer() ).children(0).each( function (i) {
            $(this).removeAttr('style');
          })*/
          /* .multipleSelect({
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
*/
            /*$('.dataTables_scrollBody').css({
                'overflow': 'hidden',
                'border': '0'
            });
        
            // Enable TFOOT scoll bars
            $('.dataTables_scrollFoot').css('overflow', 'auto');
        
            // Sync TFOOT scrolling with TBODY
            $('.dataTables_scrollFoot').on('scroll', function () {
                $('.dataTables_scrollBody').scrollLeft($(this).scrollLeft());
            });*/

              $('.ms-parent').removeAttr("style");
              //$('.dataTables_scrollFoot').removeAttr("style");
              //$('.dataTables_scrollFoot').addClass("display-select2-dropdown-in-datatable-footer");
      } );

      this.unionHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
        if(!$('#'+id+colIdx).attr('style') && visibility){
            $('#'+id+colIdx).selectpicker();
            /*.multipleSelect({
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
              });*/

              $('.ms-parent').removeAttr("style");
              //$('.dataTables_scrollFoot').removeAttr("style");
              //$('.dataTables_scrollFoot').addClass("display-select2-dropdown-in-datatable-footer");
          }
      });

      this.filterAjouter = true;
      this.filterInitialiser = true;

    } else if(!this.filterAjouter && this.filterInitialiser){
      //$('#'+id+' tfoot').show();
      $( self.unionHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }

  dataTableRemoveCustomFiltre(){
    var id = 'union-datatable';
    var self = this;
    //$('#'+id+' tfoot').hide();
    $( self.unionHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }


    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        ///let u = [...this.unionsData]
        this.unionsData = this.allUnionsData.filter((item) => {
          return item.numero.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || item.niveau.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.unionData = temp;
      
    }
    
    /*async close(){
      await this.modalController.dismiss();
    }*/

    async close(){
      await this.modalController.dismiss({filtreUnion: this.filtreUnion});
    }

    async valider() {
      //this.filtreUnion = [];
      this.filtreUnion = this.filtreUnion.concat(this.selectedIndexes);

      await this.modalController.dismiss({filtreUnion: this.filtreUnion});
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
