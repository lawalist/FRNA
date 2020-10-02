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
import { LocalitePage } from 'src/app/localite/localite/localite.page';
import { DatatableMoreComponent } from 'src/app/component/datatable-more/datatable-more.component';
import { DatatableConstructComponent } from 'src/app/component/datatable-construct/datatable-construct.component';
import { SelectionComponent } from 'src/app/component/selection/selection.component';
import { DerniereModificationComponent } from 'src/app/component/derniere-modification/derniere-modification.component';
import { ListeMoreComponent } from 'src/app/component/liste-more/liste-more.component';
import { ListeActionComponent } from 'src/app/component/liste-action/liste-action.component';
import { isObject } from 'util';
import { isDefined } from '@angular/compiler/src/util';
import { UnionPage } from '../union/union.page';
import { OpPage } from '../op/op.page';
import { PersonnesPage } from '../personnes/personnes.page';
import { ProjetPage } from 'src/app/recherche/projet/projet.page';
import * as moment from 'moment';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToCSVAndTHMLTable: any;
declare var createDataTable: any;
//declare var HTMLTableToJSON: any;
//declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-partenaire',
  templateUrl: './partenaire.page.html',
  styleUrls: ['./partenaire.page.scss'],
})
export class PartenairePage implements OnInit {
  @Input() idPartenaire: string;
  @Input() filtrePartenaire: any;

  global = global;
  start: any;
  loading: boolean = false;
  partenaireForm: FormGroup;
  action: string = 'liste';
  cacheAction: string = 'liste';
  partenaires: any = [];
  partenairesData: any = [];
  allPartenairesData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  communeData: any = [];
  localiteData: any = [];
  categoriePartenaire = [];
  secteurPublics = [];
  secteurActivites = [];
  unPartenaire: any;
  unPartenaireDoc: any;
  partenaireHTMLTable: any;
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
  colonnes = ['nom', 'numero', 'categorie', 'secteurPublic', 'secteurActivite', 'dateCreation', 'telephone', 'email', 'nomPays', 'codePays', 'nomRegion', 'codeRegion', 'nomDepartement', 'codeDepartement', 'nomCommune', 'codeCommune', 'nomSiege', 'codeSiege', 'latitude', 'longitude']

  messages_validation = {
    'numero': [
      { type: 'required', message: '' },
      { type: 'uniqueNumeroPartenaire', message: '' }
    ],
    'nom': [
      { type: 'required', message: '' }
    ],
    'categorie': [
      { type: 'required', message: '' }
    ],
    'secteurActivite': [
      { type: 'required', message: '' }
    ],
    'secteurPublic': [
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
      //au cas où la partenaire est en mode modal, on chercher info region
      this.translateLangue();
      this.getPartenaire();
      this.translateChoixNiveau();
    }

    translateChoixNiveau(){
      //catégories 
      for(let i = 1; i <= 12; i++){
        this.translate.get('PARTENAIRE_PAGE.CATEGORIES.'+i).subscribe((res: string) => {
          this.categoriePartenaire.push({'id': i, 'val': res});
        });
      }

      this.categoriePartenaire.sort((a, b) => {
        if (a.val < b.val) {
          return -1;
        }
        if (a.val > b.val) {
          return 1;
        }
        return 0;
      });

      //secteurPublics 
      for(let i = 1; i <= 4; i++){
        this.translate.get('PARTENAIRE_PAGE.SECTEURPUBLICS.'+i).subscribe((res: string) => {
          this.secteurPublics.push({'id': i, 'val': res});
        });
      }

      this.secteurPublics.sort((a, b) => {
        if (a.val < b.val) {
          return -1;
        }
        if (a.val > b.val) {
          return 1;
        }
        return 0;
      });

      //secteurActivites 
      /*for(let i = 1; i <= 21; i++){
        this.translate.get('PARTENAIRE_PAGE.SECTEURACTIVITES.'+i).subscribe((res: string) => {
          this.secteurActivites.push({'id': i, 'val': res});
        });
      }

      this.secteurActivites.sort((a, b) => {
        if (a.val < b.val) {
          return -1;
        }
        if (a.val > b.val) {
          return 1;
        }
        return 0;
      });*/
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
        this.actualiserTableau(this.partenairesData);
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
      if(this.partenaireForm.get(filedName).errors && (this.partenaireForm.get(filedName).dirty || this.partenaireForm.get(filedName).touched)){
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
      if(this.partenaireForm.get(filedName).errors){
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
          self.partenaireForm.controls[id].setValue(e.params.data.id)
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.partenaireForm.value[id]);
            self.setSelectRequredError(id, id)
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.partenaireForm.value[id]);
            self.setSelectRequredError(id, id)
            self.communeData = [];
            self.localiteData = [];
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.partenaireForm.value[id]);
            self.setSelectRequredError(id, id)
            self.localiteData = [];
          }else if(id == 'idCommune'){
            self.setCodeAndNomCommune(self.partenaireForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idSiege'){
            self.setCodeAndNomLocalite(self.partenaireForm.value[id]);
            self.setSelectRequredError(id, id)
          }
          
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.partenaireForm.controls[id].setValue(null); 
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.partenaireForm.value[id]);
            self.regionData = [];
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.partenaireForm.value[id]);
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.partenaireForm.value[id]);
            self.communeData = [];
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idCommune'){
            self.setCodeAndNomCommune(self.partenaireForm.value[id]);
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idSiege'){
            self.setCodeAndNomLocalite(self.partenaireForm.value[id]);
            self.setSelectRequredError(id, id)
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
      //this.partenaireForm = null;
      this.partenaireForm = this.formBuilder.group({
        nom: [null, Validators.required],
        numero: [null, Validators.required],
        categorie: [null, Validators.required],
        secteurPublic: [null, Validators.required],
        secteurActivite: [null, Validators.required],
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

      /*this.partenaireForm.valueChanges.subscribe(change => {
        this.partenaireForm.get('numero').setValidators([NumeroPartenaireValidator.uniqueNumeroPartenaire(this.partenairesData, 'ajouter'), Validators.required]);
      });*/
    }
  
    editForm(pDoc){
      //this.partenaireForm = null;
      let p = pDoc.partenaires[0].formData
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
      let codeSiege;
      let idSiege;
      let nomSiege;

      if(pDoc.pays[0]){
        idPays = pDoc.pays[0].id;
        codePays = pDoc.pays[0].formData.code;
        nomPays = pDoc.pays[0].formData.nom;
      }

      if(pDoc.regions[0]){
        idRegion = pDoc.regions[0].id;
        codeRegion = pDoc.regions[0].formData.code;
        nomRegion = pDoc.regions[0].formData.nom;
      }

      if(pDoc.departements[0]){
        idDepartement = pDoc.departements[0].id;
        codeDepartement = pDoc.departements[0].formData.code;
        nomDepartement = pDoc.departements[0].formData.nom;
      }

      if(pDoc.communes[0]){
        idCommune = pDoc.communes[0].id;
        codeCommune = pDoc.communes[0].formData.code;
        nomCommune = pDoc.communes[0].formData.nom;
      }

      if(pDoc.localites[0]){
        idSiege = pDoc.localites[0].id;
        codeSiege = pDoc.localites[0].formData.code;
        nomSiege = pDoc.localites[0].formData.nom;
      }


      this.partenaireForm = this.formBuilder.group({
        nom: [p.nom, Validators.required],
        numero: [p.numero, Validators.required],
        categorie: [p.categorie, Validators.required],
        secteurPublic: [p.secteurPublic, Validators.required],
        secteurActivite: [p.secteurActivite, Validators.required], 
        dateCreation: [p.dateCreation],  
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
        nomSiege: [nomSiege, Validators.required],
        codeSiege: [codeSiege, Validators.required],
        idSiege: [idSiege, Validators.required],
        latitude: [p.latitude],
        longitude: [p.latitude],
        telephone: [p.telephone],
        email: [p.email],
        adresse: [p.adresse],
      });

      this.validerNumero();

      /*this.partenaireForm.valueChanges.subscribe(change => {
        this.partenaireForm.get('numero').setValidators([NumeroPartenaireValidator.uniqueNumeroPartenaire(this.partenairesData, 'ajouter'), Validators.required]);
      });*/

    }

    validerNumero(){
      let numeroControl = this.partenaireForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndNumero('partenaire', value).then((res) => {
          if(res && res.partenaires && res.partenaires[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.unPartenaire.numero))){
            numeroControl.setErrors({uniqueNumeroPartenaire: true});
          }
        });
      });
    }
  
    ajouter(){
      this.doModification = false;
      this.start = moment().toISOString();
      this.getPays();
      this.initForm();
      this.initSelect2('categorie', this.translate.instant('PARTENAIRE_PAGE.CATEGORIE'), true);
      this.initSelect2('secteurPublic', this.translate.instant('PARTENAIRE_PAGE.SECTEURPUBLIC'), true);
      //this.initSelect2('secteurActivite', this.translate.instant('PARTENAIRE_PAGE.SECTEURACTIVITE'), true);
      this.initSelect2('idPays', this.translate.instant('PARTENAIRE_PAGE.SELECTIONPAYS'));
      this.initSelect2('idRegion', this.translate.instant('PARTENAIRE_PAGE.SELECTIONREGION'));
      this.initSelect2('idDepartement', this.translate.instant('PARTENAIRE_PAGE.SELECTIONDEPARTEMENT'));
      this.initSelect2('idCommune', this.translate.instant('PARTENAIRE_PAGE.SELECTIONCOMMUNE'));
      this.initSelect2('idSiege', this.translate.instant('PARTENAIRE_PAGE.SELECTIONSIEGE'));
      
      this.action = 'ajouter';
    }
  
    infos(p){
      if(global.controlAccesModele('partenaires', 'lecture')){
        if(!this.mobile){
          this.unPartenaire = p;
          this.action = 'infos';
        }else  if(this.mobile && !this.estModeCocherElemListe){
          this.unPartenaire = p;
          this.action = 'infos';
        }
      }
      
    }

  
    modifier(partenaire){
      //console.log(partenaire)
      if(!this.filtrePartenaire){
        if(global.controlAccesModele('partenaires', 'modification')){
          if(!this.idPartenaire){
            let id;
            if(isObject(partenaire)){
              id = partenaire.id;
            }else{
              id = partenaire;
            }
    
            this.doModification = true;
            this.start = moment().toISOString();
            this.servicePouchdb.findRelationalDocByID('partenaire', id).then((res) => {
              if(res && res.partenaires[0]){
                let pDoc = res.partenaires[0];
                this.getPays();
                //console.log(pDoc)
                if(pDoc.pays)
                  this.getRegionParPays(pDoc.pays);
                if(pDoc.region)
                  this.getDepartementParRegion(pDoc.region);
                if(pDoc.departement)
                  this.getCommuneParDepartement(pDoc.departement);
                if(pDoc.commune)
                  this.getLocaliteParCommune(pDoc.commune);
                  
                this.editForm(res);
    
                this.initSelect2('categorie', this.translate.instant('PARTENAIRE_PAGE.CATEGORIE'));
                this.initSelect2('secteurPublic', this.translate.instant('PARTENAIRE_PAGE.SECTEURPUBLIC'));
                //this.initSelect2('secteurActivite', this.translate.instant('PARTENAIRE_PAGE.SECTEURACTIVITE'));
                this.initSelect2('idPays', this.translate.instant('PARTENAIRE_PAGE.SELECTIONPAYS'));
                this.initSelect2('idRegion', this.translate.instant('PARTENAIRE_PAGE.SELECTIONREGION'));
                this.initSelect2('idDepartement', this.translate.instant('PARTENAIRE_PAGE.SELECTIONDEPARTEMENT'));
                this.initSelect2('idCommune', this.translate.instant('PARTENAIRE_PAGE.SELECTIONCOMMUNE'));
                this.initSelect2('idSiege', this.translate.instant('PARTENAIRE_PAGE.SELECTIONSIEGE'));
    
                this.setSelect2DefaultValue('categorie', pDoc.formData.categorie)
                this.setSelect2DefaultValue('secteurPublic', pDoc.formData.secteurPublic)
                //this.setSelect2DefaultValue('secteurActivite', pDoc.formData.secteurActivite)
                /*$('#numero input').ready(()=>{
                  $('#numero input').attr('disabled', true)
                });*/
    
                //this.setSelect2DefaultValue('codePays', partenaire.codePays)
                //this.setSelect2DefaultValue('codeRegion', partenaire.codeRegion)
                //this.setSelect2DefaultValue('codeDepartement', partenaire.codeDepartement)
                //this.setSelect2DefaultValue('codeCommune', partenaire.codeCommune)
                //this.setSelect2DefaultValue('codeSiege', partenaire.codeSiege)
                
                this.unPartenaireDoc = pDoc;
              
                if(!isObject(partenaire)){
                  for(let p of this.partenairesData){
                    if(p.id == id){
                      this.unPartenaire = p;
                      break;
                    }
                  }
                }else{
                  this.unPartenaire = partenaire;
                }
    
                this.action ='modifier';
              }
            }).catch((err) => {
              alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
            })
            
          }
        }  
      }
      
      
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
  
    
    exportPDF(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('partenaire-datatable').innerHTML], {
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-7"
        type: "text/plain;charset=utf-7"
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-7"
        //type: 'application/vnd.ms-excel;charset=utf-7'
        //type: "application/vnd.ms-excel;charset=utf-7"
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
  

  //retourne la liste de key unique par order dans un tableau d'objets
  getAllJSONKeys(data){
    return  data.reduce((keys, obj) => ( 
        keys.concat(Object.keys(obj).filter(key => ( 
          keys.indexOf(key) === -1)) 
        ) 
      ), []) 
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

                this.servicePouchdb.findRelationalDocByID('partenaire', p.id).then((res) => {
                  res.partenaires[0].security = this.servicePouchdb.garderDeleteTrace(res.partenaires[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.partenaires[0]).then((res) => {
                    //mise à jour de la liste si mobile et mode liste
                    if(this.partenairesData.indexOf(p) !== -1){
                      this.partenairesData.splice(this.partenairesData.indexOf(p), 1);
                    }else{
                      console.log('echec splice, index inexistant')
                    }

                    this.action = 'liste';

                    if(!this.mobile){
                      //sinion dans le tableau
                      this.dataTableRemoveRows();
                    }else{
                      this.partenairesData = [...this.partenairesData];
                      if(this.allPartenairesData.indexOf(p) !== -1){
                        this.allPartenairesData.splice(this.allPartenairesData.indexOf(p), 1);
                      }else{
                        console.log('echec splice, index inexistant dans allPartenairesData')
                      }
                    }
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }else{

                this.servicePouchdb.findRelationalDocByID('partenaire', p.id).then((res) => {
                 this.servicePouchdb.deleteRelationalDocDefinitivement(res.partenaires[0]).then((res) => {

                  //mise à jour de la liste si mobile et mode liste
                  if(this.partenairesData.indexOf(p) !== -1){
                    this.partenairesData.splice(this.partenairesData.indexOf(p), 1);
                  }else{
                    console.log('echec splice, index inexistant')
                  }

                  this.action = 'liste';
                  if(!this.mobile){
                    //sinion dans le tableau
                    this.dataTableRemoveRows();
                  }else{
                    this.partenairesData = [...this.partenairesData];
                    if(this.allPartenairesData.indexOf(p) !== -1){
                      this.allPartenairesData.splice(this.allPartenairesData.indexOf(p), 1);
                    }else{
                      console.log('echec splice, index inexistant dans allPartenairesData')
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

    async presentLocalite(idLocalite) {
      const modal = await this.modalController.create({
        component: LocalitePage,
        componentProps: { idLocalite: idLocalite },
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
                //var p = this.partenairesData[i];
                this.servicePouchdb.findRelationalDocByID('partenaire', id).then((res) => {
                  res.partenaires[0].security = this.servicePouchdb.garderArchivedTrace(res.partenaires[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.partenaires[0]).catch((err) => {
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
                //this.action = this.cacheAction;
                this.dataTableRemoveRows();
                //this.partenairesData = this.removeMultipleElem(this.partenairesData, indexes);
                this.selectedIndexes = [];
                //this.selectedIndexes = [];
              }else{
                this.partenairesData = [...this.removeMultipleElem(this.partenairesData, numeros)];
                this.allPartenairesData = this.removeMultipleElem(this.allPartenairesData, numeros);
                
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

    async desarchivageMultiple(numeros) {
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
              for(let id of numeros){
                //var p = this.partenairesData[i];
                this.servicePouchdb.findRelationalDocByID('partenaire', id).then((res) => {
                  res.partenaires[0].security = this.servicePouchdb.garderDesarchivedTrace(res.partenaires[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.partenaires[0]).catch((err) => {
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
                //this.partenairesData = this.removeMultipleElem(this.partenairesData, indexes); 
                this.selectedIndexes = [];
              }else{
                this.partenairesData = [...this.removeMultipleElem(this.partenairesData, numeros)]; 
                this.allPartenairesData = this.removeMultipleElem(this.allPartenairesData, numeros);
                
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
      this.partenairesData.forEach((p) => {
        //console.log(p.codePays+'   '+this.selectedIndexes.indexOf(p.codePays)+'    '+this.selectedIndexes)
        if(this.selectedIndexes.indexOf(p.id) === -1){
          this.selectedIndexes.push(p.id);
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
          "estModeCocherElemListe": this.estModeCocherElemListe,
          "dataLength": this.partenairesData.length,
          "selectedIndexesLength": this.selectedIndexes.length,
          "styleAffichage": this.styleAffichage,
          "action": this.action,
          idModele: 'partenaires'
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
          this.getPartenairesByType('liste');
        }  else  if(dataReturned !== null && dataReturned.data == 'archives') {
          this.estModeCocherElemListe = false;
          this.getPartenairesByType('archives');
        }  else  if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.estModeCocherElemListe = false;
          this.getPartenairesByType('corbeille');
        }  else  if(dataReturned !== null && dataReturned.data == 'partages') {
          this.estModeCocherElemListe = false;
          this.getPartenairesByType('partages');
        } else  if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.estModeCocherElemListe = false;
          this.getPartenaireWithConflicts();
         // this.changeStyle();
        }  else  if(dataReturned !== null && dataReturned.data == 'exporter') {
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
      let data = [...this.partenairesData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Partenaires_'+date+'.xls', blob).then(()=> {
          alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
      }).catch(()=>{
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
      });
    }
  
    exportCSV(){
      let data = [...this.partenairesData];
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
      this.file.writeFile(fileDestiny, 'FRNA_Export_Partenaires_'+date+'.csv', blob).then(()=> {
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
          //"dataLength": this.partenairesData.length,
          //"selectedIndexesLength": this.selectedIndexes.length,
          //"styleAffichage": this.styleAffichage,
          "action": this.cacheAction,
          idModele: 'partenaires'
      /*}*/},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'modifier') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unPartenaire.id);
          }

          this.modifier(this.selectedIndexes[0]);
          this.decocherTousElemListe();
          this.estModeCocherElemListe = false;
          //this.changerModeCocherElemListe();
        }else  if(dataReturned !== null && dataReturned.data == 'desarchiver') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unPartenaire.id);
          }

          this.desarchivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else  if(dataReturned !== null && dataReturned.data == 'archiver') {
          if(this.action == 'infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unPartenaire.id);
          }

          this.archivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        } else  if(dataReturned !== null && dataReturned.data == 'restaurer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unPartenaire.id);
          }
          
          this.restaurationMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else if(dataReturned !== null && dataReturned.data == 'derniereModification') {
          this.selectedItemDerniereModification();          
        }else if(dataReturned !== null && dataReturned.data == 'partager') {
          //this.changeStyle();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unPartenaire.id);
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
      if(this.partenairesData.length != this.selectedIndexes.length) {
        this.cocherTousElemListe();
      }else {
        this.decocherTousElemListe();
      } 
    }
    

    async suppressionMultiple(numeros) {
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
                for(let id of numeros){
                  //var p = this.partenairesData[i];
                  this.servicePouchdb.findRelationalDocByID('partenaire', id).then((res) => {
                    res.partenaires[0].security = this.servicePouchdb.garderDeleteTrace(res.partenaires[0].security);
                    this.servicePouchdb.updateRelationalDoc(res.partenaires[0]).catch((err) => {
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
                  //this.partenairesData = this.removeMultipleElem(this.partenairesData, indexes);
                  this.selectedIndexes = [];
                }else{
                  this.partenairesData = [...this.removeMultipleElem(this.partenairesData, numeros)];
                  this.allPartenairesData = this.removeMultipleElem(this.allPartenairesData, numeros);
                  //if(this.action != 'infos'){
                    this.estModeCocherElemListe = false;
                    this.decocherTousElemListe();
                  //}
                  //this.action = this.cacheAction;

                  
                }

                
              }else{

                //suppresion multiple définitive
                for(let id of numeros){
                  //var p = this.partenairesData[i];
                  
                  this.servicePouchdb.findRelationalDocByID('partenaire', id).then((res) => {
                    this.servicePouchdb.deleteRelationalDocDefinitivement(res.partenaires[0]).catch((err) => {
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
                  //this.partenairesData = this.removeMultipleElem(this.partenairesData, indexes);
                  this.selectedIndexes = [];
                }else{
                  this.partenairesData = [...this.removeMultipleElem(this.partenairesData, numeros)];
                  this.allPartenairesData = [...this.removeMultipleElem(this.allPartenairesData, numeros)];

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

    async suppressionMultipleDefinitive(numeros) {
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
              for(let id of numeros){
                //var p = this.partenairesData[i];
                
                this.servicePouchdb.findRelationalDocByID('partenaire', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.partenaires[0]).catch((err) => {
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
                //this.partenairesData = this.removeMultipleElem(this.partenairesData, indexes);
                this.selectedIndexes = [];
              }else{
                this.partenairesData = [...this.removeMultipleElem(this.partenairesData, numeros)];
                this.allPartenairesData = this.removeMultipleElem(this.allPartenairesData, numeros);
                
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

    async restaurationMultiple(numeros) {
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
              for(let id of numeros){
                //var p = this.partenairesData[i];
                this.servicePouchdb.findRelationalDocByID('partenaire', id).then((res) => {
                  res.partenaires[0].security = this.servicePouchdb.garderRestaureTrace(res.partenaires[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.partenaires[0]).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_RESTAURATION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_RESTAURATION')+': '+err.toString());
                });//fin get
              }
    
              //sinion dans le tableau
              if(!this.mobile){
                this.dataTableRemoveRows();
                //this.partenairesData = this.removeMultipleElem(this.partenairesData, indexes);
                this.selectedIndexes = [];
              }else{
                this.partenairesData = [...this.removeMultipleElem(this.partenairesData, numeros)];
                this.allPartenairesData = this.removeMultipleElem(this.allPartenairesData, numeros);

                //if(this.action != 'infos'){
                  this.estModeCocherElemListe = false;
                  this.decocherTousElemListe();
                //}
                //this.action = this.cacheAction;
              }

              if(this.action == 'infos'){
                this.action = this.cacheAction;
              }
              //this.dataTableRemoveRows();
              
            }
          }
        ]
      });
  
      await alert.present();
    }


    removeMultipleElem(data, numeros){
      let codes = [];
      if(this.mobile && this.action == 'infos'){
        codes.push(this.unPartenaire.id);
      }else /*if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)*/{
        /*indexes.forEach((i) => {
          codes.push(data[i].numero);
        });*/

        codes = numeros;
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
        //this.actualiserTableau(this.partenairesData);
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
          this.partenairesData = [...this.partenairesData];
          this.rechargerListeMobile = false;
        }
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
            if(this.selectedIndexes.length == 1){
              this.infos(this.partenairesData[this.selectedIndexes[0]]);
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
              this.modifier(this.partenairesData[this.selectedIndexes[0]]);
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
        componentProps: {/*"id": "salu"*/
          idModele: 'partenaires'
        },
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
            this.infos(this.partenairesData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.partenairesData[this.selectedIndexes[0]]);
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
          idModele: 'partenaires', "action": this.action, "recherchePlus": this.recherchePlus, "filterAjouter": this.filterAjouter},
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
          this.getPartenairesByType('corbeille');
        } else if(dataReturned !== null && dataReturned.data == 'archives') {
          this.getPartenairesByType('archives');
        } else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getPartenairesByType('partages');
        } else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.getPartenaireWithConflicts();
        } else if(dataReturned !== null && dataReturned.data == 'liste') {
          this.getPartenairesByType('liste');
        } 

  
      });
      return await popover.present();
    }


    async selectionPopover(ev: any) {
      const popover = await this.popoverController.create({
        component: SelectionComponent,
        event: ev,
        translucent: true,
        componentProps: {/*"id": "salu"*/
          idModele: 'partenaires'
        },
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
        componentProps: {action: this.action, 
          idModele: 'partenaires'},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'listePrincipale') {
          this.getPartenairesByType('liste');
        }else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getPartenairesByType('partages');
        }else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.getPartenaireWithConflicts();
        }else if(dataReturned !== null && dataReturned.data == 'styleAffichage') {
          //this.action = this.cacheAction;
          this.changeStyle();
          //this.selectedIndexes = [];
          
        }
      });
      return await popover.present();
    }

    getPartenaireWithConflicts(event = null){
      this.loading = true;
      this.action = 'conflits';
      this.cacheAction = 'conflits';
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;

      this.servicePouchdb.findRelationalDocInConflict('partenaire').then((res) => {
        if(res){
          //this.partenairesData = [];
          let partenairesData = [];
          let paysIndex = [];
          let regionIndex = [];
          let departementIndex = [];
          let communeIndex = [];
          let localiteIndex = [];
          let idPays;
          let idRegion;
          let idDepartement;
          let idCommune;
          let idSiege;
          for(let p of res.partenaires){
            //supprimer l'historique de la liste
            delete p.security['shared_history'];

            this.translate.get('PARTENAIRE_PAGE.CATEGORIES.'+p.formData.categorie).subscribe((res: string) => {
              p.formData.categorie = res;
            });
      
            this.translate.get('PARTENAIRE_PAGE.SECTEURPUBLICS.'+p.formData.secteurPublic).subscribe((res: string) => {
              p.formData.secteurPublic = res;
            });
            
            /*this.translate.get('PARTENAIRE_PAGE.SECTEURACTIVITES.'+p.formData.secteurActivite).subscribe((res: string) => {
              p.formData.secteurActivite = res;
            });*/

            //chargement des relation localité
            if(isDefined(paysIndex[p.pays])){
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[paysIndex[p.pays]].formData.nom, 6);
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[paysIndex[p.pays]].formData.code, 7);
              idPays = res.pays[paysIndex[p.pays]].id;
            }else{
              for(let i=0; i < res.pays.length; i++){
                if(res.pays[i].id == p.pays){
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[i].formData.nom, 6);
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[i].formData.code, 7);
                  paysIndex[p.pays] = i;
                  idPays = res.pays[i].id;
                  break;
                }
              }
            }

            if(isDefined(regionIndex[p.region])){
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[regionIndex[p.region]].formData.nom, 8);
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[regionIndex[p.region]].formData.code, 9);
              idRegion = res.regions[regionIndex[p.region]].id;
            }else{
              for(let i=0; i < res.regions.length; i++){
                if(res.regions[i].id == p.region){
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[i].formData.code, 9);
                  regionIndex[p.region] = i;
                  idRegion = res.regions[i].id;
                  break;
                }
              }
            }

            
            if(isDefined(departementIndex[p.departement])){
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[departementIndex[p.departement]].formData.nom, 10);
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[departementIndex[p.departement]].formData.code, 11);
              idDepartement = res.departements[departementIndex[p.departement]].id;
            }else{
              for(let i=0; i < res.departements.length; i++){
                if(res.departements[i].id == p.departement){
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                  departementIndex[p.departement] = i;
                  idDepartement = res.departements[departementIndex[p.departement]].id;
                  break;
                }
              }
            }
            

            
            if(isDefined(communeIndex[p.commune])){
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[communeIndex[p.commune]].formData.nom, 12);
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[communeIndex[p.commune]].formData.code, 13);
              idCommune = res.communes[communeIndex[p.commune]].id;
            }else{
              for(let i=0; i < res.communes.length; i++){
                if(res.communes[i].id == p.commune){
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[i].formData.code, 13);
                  communeIndex[p.commune] = i;
                  idCommune = res.communes[i].id;
                  break;
                }
              }
            }
            
            
            if(isDefined(localiteIndex[p.localite])){
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[localiteIndex[p.localite]].formData.nom, 14);
              p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[localiteIndex[p.localite]].formData.code, 15);
              idSiege = res.localites[localiteIndex[p.localite]].id;
            }else{
              for(let i=0; i < res.localites.length; i++){
                if(res.localites[i].id == p.localite){
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                  p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[i].formData.code, 15);
                  localiteIndex[p.localite] = i;
                  idSiege = res.localites[i].id;
                  break;
                }
              }
            }
            
            partenairesData.push({id: p.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...p.formData, ...p.formioData, ...p.security});
          }

          this.loading = false;
          if(this.mobile){
            partenairesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
            this.partenairesData = [...partenairesData]
            this.allPartenairesData = [...partenairesData];
          } else {

          //si non mobile
          //if(this.partenairesData.length > 0){
            //$('#partenaire').ready(()=>{
              if(global.langue == 'en'){
                this.partenaireHTMLTable = createDataTable("partenaire", this.colonnes, partenairesData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.partenaireHTMLTable = createDataTable("partenaire", this.colonnes, partenairesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.attacheEventToDataTable(this.partenaireHTMLTable.datatable);
           // });
         // }
          }

        }

        if(event)
          event.target.complete();
      }).catch((err) => {
        this.loading = false;
        this.partenaires = [];
        this.partenairesData = [];
        console.log(err);
        if(event)
            event.target.complete();
      });
    }

    getPartenairesByType(type){
      this.action = type;
      this.cacheAction = type;
      this.getPartenaire();
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
        componentProps: {"action": this.action, "cacheAction": this.cacheAction, 
          idModele: 'partenaires'
        },
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
          if(this.cacheAction != 'corbeille'){
            this.suppressionMultiple(this.selectedIndexes);
          }else{
            this.suppressionMultipleDefinitive(this.selectedIndexes)
          }
        }
      });
      return await popover.present();
    }
    
    async presentDerniereModification(partenaire) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { 
          idModele: 'partenaires', _id: partenaire.id, _rev: partenaire.rev, security: partenaire.security },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      let id
      if(this.action == 'infos'){
        id = this.unPartenaire.id;
      }else{
        id = this.selectedIndexes[0];
      }

      if(id && id != ''){
        this.servicePouchdb.findRelationalDocByID('partenaire', id).then((res) => {
          if(res && res.partenaires[0]){
            if(this.estModeCocherElemListe){
              this.estModeCocherElemListe = false;
              this.decocherTousElemListe();
            }
            this.presentDerniereModification(res.partenaires[0]);
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
      var i = this.partenaireHTMLTable.datatable.row('.selected').index();

      if(this.partenaireHTMLTable.datatable.row(i).next()){
        this.next = true;
      }else{
        this.next = false;
      }

      if(this.partenaireHTMLTable.datatable.row(i).prev()){
        this.prev = true;
      }else{
        this.prev = false;
      }
    }

    datatableNextRow(){
      //datatable.row(this.selectedIndexes).next().data();
      var i = this.partenaireHTMLTable.datatable.row('.selected').index();
      if(this.partenaireHTMLTable.datatable.row(i).next()){
        //this.partenaireHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.partenaireHTMLTable.datatable.rows().deselect();
        this.partenaireHTMLTable.datatable.row(i).next().select();
        this.selectedItemInfo();
        
        if(this.partenaireHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }else{
        this.next = false;

        if(this.partenaireHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }
    }

    datatablePrevRow(){
      //datatable.row(this.selectedIndexes).prev().data();
      var i = this.partenaireHTMLTable.datatable.row('.selected').index();
      if(this.partenaireHTMLTable.datatable.row(i).prev()){
        //this.partenaireHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.partenaireHTMLTable.datatable.rows().deselect();
        this.partenaireHTMLTable.datatable.row(i).prev().select();
        this.selectedItemInfo();
        
        if(this.partenaireHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }else{
        this.prev = false;

        if(this.partenaireHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }
    }

    datatableDeselectMultipleSelectedItemForModification(){
      if(this.selectedIndexes.length > 1){
        var i = this.partenaireHTMLTable.datatable.row('.selected').index();
        this.partenaireHTMLTable.datatable.rows().deselect();
        this.partenaireHTMLTable.datatable.row(i).select();
      }
    }

    selectedItemInfo(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.partenaireHTMLTable.datatable.row('.selected').index();
      let data  = this.partenaireHTMLTable.datatable.row(row).data();
      this.infos(data);
      this.initDatatableNextPrevRow();


        //this.selectedIndexes = [];
      //}else{
      //  alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      //}
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.partenaireHTMLTable.datatable.row('.selected').index();
      let data  = this.partenaireHTMLTable.datatable.row(row).data();
      this.modifier(data);

      //this.selectedIndexes = [];
      //}else{
       // alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      //}
    }
  
  
    async openRelationPartenaire(ev: any/*, codePartenaire*/) {
      const popover = await this.popoverController.create({
        component: RelationsPartenaireComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'partenaires', "idPartenaire": this.unPartenaire.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'Unions') {
          this.presentUnion(this.unPartenaire.id);
        } else if(dataReturned !== null && dataReturned.data == 'OPs') {
          this.presentOP(this.unPartenaire.id);
        }else if(dataReturned !== null && dataReturned.data == 'personne') {
          this.presentPersonne(this.unPartenaire.id);
        }else if(dataReturned !== null && dataReturned.data == 'projet') {
          this.presentProjet(this.unPartenaire.id);
        }/*else if(dataReturned !== null && dataReturned.data == 'partenaire') {
          
        }else if(dataReturned !== null && dataReturned.data == 'partenaire') {
          
        } else if(dataReturned !== null && dataReturned.data == 'partenaire') {
          
        }*/
  
      });
      return await popover.present();
    }

    async openRelationPartenaireDepuisListe(ev: any/*, codePays*/) {
      const popover = await this.popoverController.create({
        component: RelationsPartenaireComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'partenaires', "idPartenaire": this.selectedIndexes[0]},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'Unions') {
          this.presentUnion(this.selectedIndexes[0]);
        }else if(dataReturned !== null && dataReturned.data == 'OPs') {
          this.presentOP(this.selectedIndexes[0]);
        }else if(dataReturned !== null && dataReturned.data == 'personne') {
          this.presentPersonne(this.selectedIndexes[0]);
        }else if(dataReturned !== null && dataReturned.data == 'projet') {
          this.presentProjet(this.selectedIndexes[0]);
        }
        /*if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.departementsData[this.selectedIndexes[0]].codeDepartement);
        } else if(dataReturned !== null && dataReturned.data == 'partenaire') {
          this.presentPartenaire(this.departementsData[this.selectedIndexes[0]].codeDepartement) 
        }*/
  
      });
      return await popover.present();
    }
  

    async openRelationPartenaireDepuisTableau(ev: any/*, codePays*/) {
      let row  = this.partenaireHTMLTable.datatable.row('.selected').index();
      let data  = this.partenaireHTMLTable.datatable.row(row).data();
      const popover = await this.popoverController.create({
        component: RelationsPartenaireComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'partenaires', "idPartenaire": data.id},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'Unions') {
          this.presentUnion(data.id);
        } else if(dataReturned !== null && dataReturned.data == 'OPs') {
          this.presentOP(data.id);
        } else if(dataReturned !== null && dataReturned.data == 'personne') {
          this.presentPersonne(data.id);
        }else if(dataReturned !== null && dataReturned.data == 'projet') {
          this.presentProjet(data.id);
        }
        /*if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.departementsData[this.selectedIndexes[0]].codeDepartement);
        } else if(dataReturned !== null && dataReturned.data == 'partenaire') {
          this.presentPartenaire(this.departementsData[this.selectedIndexes[0]].codeDepartement) 
        }*/
  
      });
      return await popover.present();
    }

    async presentUnion(idPartenaire){
      const modal = await this.modalController.create({
        component: UnionPage,
        componentProps: {
          idModele: 'partenaires', idPartenaire: idPartenaire },
        mode: 'ios',
        backdropDismiss: false,
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentOP(idPartenaire){
      const modal = await this.modalController.create({
        component: OpPage,
        componentProps: {
          idModele: 'partenaires', idPartenaire: idPartenaire },
        mode: 'ios',
        backdropDismiss: false,
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentPersonne(idPartenaire){
      const modal = await this.modalController.create({
        component: PersonnesPage,
        componentProps: {
          idModele: 'partenaires', idPartenaire: idPartenaire },
        mode: 'ios',
        backdropDismiss: false,
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async presentProjet(idPartenaire){
      const modal = await this.modalController.create({
        component: ProjetPage,
        componentProps: {
          idModele: 'partenaires', idPartenaire: idPartenaire },
        mode: 'ios',
        backdropDismiss: false,
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    onSubmit(){
      let formData = this.partenaireForm.value;
      let formioData = {};
      if(this.action === 'ajouter'){
        //créer un nouveau partenaire
      
        let partenaire: any = {
          //_id: 'fuma:partenaire:'+data.numero,
          //id: formData.numero,
          type: 'partenaire',
          pays: formData.idPays,
          region: formData.idRegion,
          departement: formData.idDepartement,
          commune: formData.idCommune,
          localite: formData.idSiege,
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

        partenaire.security = this.servicePouchdb.garderCreationTrace(partenaire.security);

        let doc = this.clone(partenaire);
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

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let partenaireData = {id: res.partenaires[0].id, ...partenaire.formData, ...partenaire.formioData, ...partenaire.security};
          //this.partenaires = partenaire;
          //partenaire._rev = res.rev;

          this.translate.get('PARTENAIRE_PAGE.CATEGORIES.'+partenaireData.categorie).subscribe((res: string) => {
            partenaireData.categorie = res;
          });
    
          this.translate.get('PARTENAIRE_PAGE.SECTEURPUBLICS.'+partenaireData.secteurPublic).subscribe((res: string) => {
            partenaireData.secteurPublic = res;
          });
          
          /*this.translate.get('PARTENAIRE_PAGE.SECTEURACTIVITES.'+partenaireData.secteurActivite).subscribe((res: string) => {
            partenaireData.secteurActivite = res;
          });*/

          //this.partenaires.push(partenaire);
          this.action = 'liste';
          //this.rechargerListeMobile = true;
          if (!this.mobile){
            //mode tableau, ajout d'un autre partenaire dans la liste
            this.dataTableAddRow(partenaireData)
          }else{
            //mobile, cache la liste des partenaire pour mettre à jour la base de données
            this.partenairesData.push(partenaireData);
            this.partenairesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.partenairesData = [...this.partenairesData];

            this.allPartenairesData.push(partenaireData);
            this.allPartenairesData.sort((a, b) => {
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

          //initialiser la liste des partenaires
          //this.creerPartenaire(partenaireData.codePartenaire);
          
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
        this.unPartenaireDoc.pays = formData.idPays,
        this.unPartenaireDoc.region = formData.idRegion,
        this.unPartenaireDoc.departement = formData.idDepartement,
        this.unPartenaireDoc.commune = formData.idCommune,
        this.unPartenaireDoc.localite = formData.idSiege,
        this.unPartenaireDoc.formData = formData;
        this.unPartenaireDoc.formioData = formioData;

        //this.unPartenaire = partenaireData;
        this.unPartenaireDoc.security.update_start = this.start;
        this.unPartenaireDoc.security.update_start = moment().toISOString();
        this.unPartenaireDoc.security = this.servicePouchdb.garderUpdateTrace(this.unPartenaireDoc.security);

        let doc = this.clone(this.unPartenaireDoc);

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
        this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
          //this.partenaires._rev = res.rev;
          //this.unPartenaireDoc._rev = res.partenaires[0].rev;
          let partenaireData = {id: this.unPartenaireDoc.id,...this.unPartenaireDoc.formData, ...this.unPartenaireDoc.formioData, ...this.unPartenaireDoc.security};

          this.translate.get('PARTENAIRE_PAGE.CATEGORIES.'+partenaireData.categorie).subscribe((res: string) => {
            partenaireData.categorie = res;
          });
    
          this.translate.get('PARTENAIRE_PAGE.SECTEURPUBLICS.'+partenaireData.secteurPublic).subscribe((res: string) => {
            partenaireData.secteurPublic = res;
          });
          
          /*this.translate.get('PARTENAIRE_PAGE.SECTEURACTIVITES.'+partenaireData.secteurActivite).subscribe((res: string) => {
            partenaireData.secteurActivite = res;
          });*/
          
          this.action = 'infos';
          this.infos(partenaireData);

          if(this.mobile){
            //mode liste
            //cache la liste pour le changement dans virtual Scroll
            //this.partenairesData = [...this.partenairesData];
            //mise à jour dans la liste
            for(let i = 0; i < this.partenairesData.length; i++){
              if(this.partenairesData[i].id == partenaireData.id){
                this.partenairesData[i] = partenaireData;
                break;
              }
            }

            this.partenairesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //mise à jour dans la liste cache
            for(let i = 0; i < this.allPartenairesData.length; i++){
              if(this.allPartenairesData[i].id == partenaireData.id){
                this.allPartenairesData[i] = partenaireData;
                break;
              }
            }

            this.allPartenairesData.sort((a, b) => {
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
            this.dataTableUpdateRow(partenaireData);
          }

          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
          this.communeData = [];
          this.localiteData = [];
          this.unPartenaireDoc = null;

        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
    
      }
    }
  
  
    actualiserTableau(data){
        if(data.length > 0 && !this.mobile){
          $('#partenaire').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.partenaireHTMLTable = createDataTable("partenaire", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.partenaireHTMLTable = createDataTable("partenaire", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              
              if(global.langue == 'en'){
                this.partenaireHTMLTable = createDataTable("partenaire", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.partenaireHTMLTable = createDataTable("partenaire", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.partenaireHTMLTable.datatable);
          });
        }
      
    }
  
    doRefresh(event) {
      let id = 'partenaire';
      if(this.filtrePartenaire){
        id = 'partenaire-relation';
      }

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

        this.servicePouchdb.findRelationalDocByType('partenaire', deleted, archived, shared).then((res) => {
          if(res && res.partenaires){
            this.partenairesData = [];
            let partenairesData = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let localiteIndex = [];
            let idPays;
            let idRegion;
            let idDepartement;
            let idCommune;
            let idSiege;

            //var datas = [];
            for(let p of res.partenaires){
              if(this.filtrePartenaire){
                //if(){
                if(this.filtrePartenaire.indexOf(p.id) === -1){

                  delete p.security['shared_history'];
                  this.translate.get('PARTENAIRE_PAGE.CATEGORIES.'+p.formData.categorie).subscribe((res: string) => {
                    p.formData.categorie = res;
                  });
            
                  this.translate.get('PARTENAIRE_PAGE.SECTEURPUBLICS.'+p.formData.secteurPublic).subscribe((res: string) => {
                    p.formData.secteurPublic = res;
                  });
                  
                  /*this.translate.get('PARTENAIRE_PAGE.SECTEURACTIVITES.'+p.formData.secteurActivite).subscribe((res: string) => {
                    p.formData.secteurActivite = res;
                  });*/
  
                  //chargement des relation localité
                  if(isDefined(paysIndex[p.pays])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[paysIndex[p.pays]].formData.nom, 6);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[paysIndex[p.pays]].formData.code, 7);
                    idPays = res.pays[paysIndex[p.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == p.pays){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[i].formData.nom, 6);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[i].formData.code, 7);
                        paysIndex[p.pays] = i;
                        idPays = res.pays[i].id;
                        break;
                      }
                    }
                  }
  
                  if(isDefined(regionIndex[p.region])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[regionIndex[p.region]].formData.nom, 8);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[regionIndex[p.region]].formData.code, 9);
                    idRegion = res.regions[regionIndex[p.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == p.region){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[i].formData.code, 9);
                        regionIndex[p.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }
  
                  
                  if(isDefined(departementIndex[p.departement])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[departementIndex[p.departement]].formData.nom, 10);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[departementIndex[p.departement]].formData.code, 11);
                    idDepartement = res.departements[departementIndex[p.departement]].id;
                  }else{
                    for(let i=0; i < res.departements.length; i++){
                      if(res.departements[i].id == p.departement){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                        departementIndex[p.departement] = i;
                        idDepartement = res.departements[departementIndex[p.departement]].id;
                        break;
                      }
                    }
                  }
                  
                  if(isDefined(communeIndex[p.commune])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[communeIndex[p.commune]].formData.nom, 12);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[communeIndex[p.commune]].formData.code, 13);
                    idCommune = res.communes[communeIndex[p.commune]].id;
                  }else{
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == p.commune){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[i].formData.code, 13);
                        communeIndex[p.commune] = i;
                        idCommune = res.communes[i].id;
                        break;
                      }
                    }
                  }
                  
                  
                  if(isDefined(localiteIndex[p.localite])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[localiteIndex[p.localite]].formData.nom, 14);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[localiteIndex[p.localite]].formData.code, 15);
                    idSiege = res.localites[localiteIndex[p.localite]].id;
                  }else{
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == p.localite){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[i].formData.code, 15);
                        localiteIndex[p.localite] = i;
                        idSiege = res.localites[i].id;
                        break;
                      }
                    }
                  }
                  
                  partenairesData.push({id: p.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...p.formData, ...p.formioData, ...p.security});
                
                }
              }else {
                if(!p.formData.monInstitution || (p.formData.monInstitution && this.action != 'liste')){

                  delete p.security['shared_history'];
                  this.translate.get('PARTENAIRE_PAGE.CATEGORIES.'+p.formData.categorie).subscribe((res: string) => {
                    p.formData.categorie = res;
                  });
            
                  this.translate.get('PARTENAIRE_PAGE.SECTEURPUBLICS.'+p.formData.secteurPublic).subscribe((res: string) => {
                    p.formData.secteurPublic = res;
                  });
                  
                  /*this.translate.get('PARTENAIRE_PAGE.SECTEURACTIVITES.'+p.formData.secteurActivite).subscribe((res: string) => {
                    p.formData.secteurActivite = res;
                  });*/
  
                  //chargement des relation localité
                  if(isDefined(paysIndex[p.pays])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[paysIndex[p.pays]].formData.nom, 6);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[paysIndex[p.pays]].formData.code, 7);
                    idPays = res.pays[paysIndex[p.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == p.pays){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[i].formData.nom, 6);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[i].formData.code, 7);
                        paysIndex[p.pays] = i;
                        idPays = res.pays[i].id;
                        break;
                      }
                    }
                  }
  
                  if(isDefined(regionIndex[p.region])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[regionIndex[p.region]].formData.nom, 8);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[regionIndex[p.region]].formData.code, 9);
                    idRegion = res.regions[regionIndex[p.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == p.region){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[i].formData.code, 9);
                        regionIndex[p.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }
  
                  
                  if(isDefined(departementIndex[p.departement])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[departementIndex[p.departement]].formData.nom, 10);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[departementIndex[p.departement]].formData.code, 11);
                    idDepartement = res.departements[departementIndex[p.departement]].id;
                  }else{
                    for(let i=0; i < res.departements.length; i++){
                      if(res.departements[i].id == p.departement){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                        departementIndex[p.departement] = i;
                        idDepartement = res.departements[departementIndex[p.departement]].id;
                        break;
                      }
                    }
                  }
                  
                  if(isDefined(communeIndex[p.commune])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[communeIndex[p.commune]].formData.nom, 12);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[communeIndex[p.commune]].formData.code, 13);
                    idCommune = res.communes[communeIndex[p.commune]].id;
                  }else{
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == p.commune){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[i].formData.code, 13);
                        communeIndex[p.commune] = i;
                        idCommune = res.communes[i].id;
                        break;
                      }
                    }
                  }
                  
                  
                  if(isDefined(localiteIndex[p.localite])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[localiteIndex[p.localite]].formData.nom, 14);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[localiteIndex[p.localite]].formData.code, 15);
                    idSiege = res.localites[localiteIndex[p.localite]].id;
                  }else{
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == p.localite){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[i].formData.code, 15);
                        localiteIndex[p.localite] = i;
                        idSiege = res.localites[i].id;
                        break;
                      }
                    }
                  }
                  
                  partenairesData.push({id: p.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...p.formData, ...p.formioData, ...p.security});
                
                }
              }
              
            }

          //si mobile
          if(this.mobile){
            this.partenairesData = partenairesData
            this.partenairesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.allPartenairesData = [...this.partenairesData]
          } else{
            //si non mobile 
            //if(this.partenairesData.length > 0){
              //$('#partenaire').ready(()=>{
                let expor = global.peutExporterDonnees;
                if(this.filtrePartenaire){
                  expor = false;
                }

                if(global.langue == 'en'){
                  this.partenaireHTMLTable = createDataTable(id, this.colonnes, partenairesData, null, this.translate, expor);
                }else{
                  this.partenaireHTMLTable = createDataTable(id, this.colonnes, partenairesData, global.dataTable_fr, this.translate, expor);
                }

                this.attacheEventToDataTable(this.partenaireHTMLTable.datatable);
              //});
           // }
          }
          
          this.selectedIndexes = [];
          if(event)
            event.target.complete();
        }else{
          this.partenaires = [];
          //if(this.mobile){
            this.partenairesData = [];
            this.allPartenairesData = [];
          //}
          this.selectedIndexes = [];
          if(event)
            event.target.complete();
        }
      }).catch((err) => {
        console.log('Erreur acces aux partenaires');
        console.log(err);
        this.partenaires = [];
        this.selectedIndexes = [];
        //if(this.mobile){
          this.partenairesData = [];
          this.allPartenairesData = [];
        //}
        if(event)
          event.target.complete();
      });
  
    }else{
      this.getPartenaireWithConflicts(event);
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
  
    }
  
    getPartenaire(){
      //tous les partenaires
      let id = 'partenaire';
      if(this.filtrePartenaire){
        id = 'partenaire-relation';
      }

      this.loading = true;

      if(this.idPartenaire && this.idPartenaire != ''){
        this.servicePouchdb.findRelationalDocByID('partenaire', this.idPartenaire).then((res) => {

          if(res && res.partenaires[0]){
            //this.unPartenaire = partenaire.data;
            this.translate.get('PARTENAIRE_PAGE.CATEGORIES.'+res.partenaires[0].formData.categorie).subscribe((res2: string) => {
              res.partenaires[0].formData.categorie = res2;
            });
      
            this.translate.get('PARTENAIRE_PAGE.SECTEURPUBLICS.'+res.partenaires[0].formData.secteurPublic).subscribe((res2: string) => {
              res.partenaires[0].formData.secteurPublic = res2;
            });
            
            /*this.translate.get('PARTENAIRE_PAGE.SECTEURACTIVITES.'+res.partenaires[0].formData.secteurActivite).subscribe((res2: string) => {
              res.partenaires[0].formData.secteurActivite = res2;
            });*/

            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'nomPays', res.pays[0].formData.nom, 6); 
            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'codePays', res.pays[0].formData.code, 7);   
            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'nomRegion', res.regions[0].formData.nom, 8); 
            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'codeRegion', res.regions[0].formData.code, 9);   
            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'nomDepartement', res.departements[0].formData.nom, 10); 
            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'codeDepartement', res.departements[0].formData.code, 11);  
            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'nomCommune', res.communes[0].formData.nom, 12); 
            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'codeCommune', res.communes[0].formData.code, 13);  
            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'nomSiege', res.localites[0].formData.nom, 14);  
            res.partenaires[0].formData = this.addItemToObjectAtSpecificPosition(res.partenaires[0].formData, 'codeSiege', res.localites[0].formData.code, 15);    

            this.loading = false;
            this.infos({id: res.partenaires[0].id, idPays: res.pays[0].id, idRegion: res.regions[0].id, idDepartement: res.departements[0].id, idCommune: res.communes[0].id, idSiege: res.localites[0].id, ...res.partenaires[0].formData}); 
          }else{
            this.loading = false;
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
            this.close();
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          console.log(err)
          this.close();
        });
      }else{
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

        this.servicePouchdb.findRelationalDocByType('partenaire', deleted, archived, shared).then((res) => {
          //console.log(res)
          if(res && res.partenaires){
            //this.partenaires = [...partenaires];
            //this.partenairesData = [];
            let partenairesData = []
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let localiteIndex = [];
            let idPays;
            let idRegion;
            let idDepartement;
            let idCommune;
            let idSiege;

            //var datas = [];
            for(let p of res.partenaires){

              if(this.filtrePartenaire){
                if(this.filtrePartenaire.indexOf(p.id) === -1){

                  delete p.security['shared_history'];
                  this.translate.get('PARTENAIRE_PAGE.CATEGORIES.'+p.formData.categorie).subscribe((res: string) => {
                    p.formData.categorie = res;
                  });
            
                  this.translate.get('PARTENAIRE_PAGE.SECTEURPUBLICS.'+p.formData.secteurPublic).subscribe((res: string) => {
                    p.formData.secteurPublic = res;
                  });
                  
                  /*this.translate.get('PARTENAIRE_PAGE.SECTEURACTIVITES.'+p.formData.secteurActivite).subscribe((res: string) => {
                    p.formData.secteurActivite = res;
                  });*/

                  //chargement des relation localité
                  if(isDefined(paysIndex[p.pays])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[paysIndex[p.pays]].formData.nom, 6);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[paysIndex[p.pays]].formData.code, 7);
                    idPays = res.pays[paysIndex[p.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == p.pays){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[i].formData.nom, 6);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[i].formData.code, 7);
                        paysIndex[p.pays] = i;
                        idPays = res.pays[i].id;
                        break;
                      }
                    }
                  }

                  if(isDefined(regionIndex[p.region])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[regionIndex[p.region]].formData.nom, 8);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[regionIndex[p.region]].formData.code, 9);
                    idRegion = res.regions[regionIndex[p.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == p.region){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[i].formData.code, 9);
                        regionIndex[p.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }

                  
                  if(isDefined(departementIndex[p.departement])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[departementIndex[p.departement]].formData.nom, 10);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[departementIndex[p.departement]].formData.code, 11);
                    idDepartement = res.departements[departementIndex[p.departement]].id;
                  }else{
                    for(let i=0; i < res.departements.length; i++){
                      if(res.departements[i].id == p.departement){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                        departementIndex[p.departement] = i;
                        idDepartement = res.departements[i].id;
                        break;
                      }
                    }
                  }
                  
                  if(isDefined(communeIndex[p.commune])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[communeIndex[p.commune]].formData.nom, 12);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[communeIndex[p.commune]].formData.code, 13);
                    idCommune = res.communes[communeIndex[p.commune]].id;
                  }else{
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == p.commune){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[i].formData.code, 13);
                        communeIndex[p.commune] = i;
                        idCommune = res.communes[i].id;
                        break;
                      }
                    }
                  }
                  
                  
                  if(isDefined(localiteIndex[p.localite])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[localiteIndex[p.localite]].formData.nom, 14);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[localiteIndex[p.localite]].formData.code, 15);
                    idSiege = res.localites[localiteIndex[p.localite]].id;
                  }else{
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == p.localite){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[i].formData.code, 15);
                        localiteIndex[p.localite] = i;
                        idSiege = res.localites[i].id;
                        break;
                      }
                    }
                  }
                  
                  partenairesData.push({id: p.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...p.formData, ...p.formioData, ...p.security});
                
                }
              }else{
                if(!p.formData.monInstitution || (p.formData.monInstitution && this.action != 'liste')){

                  delete p.security['shared_history'];
                  this.translate.get('PARTENAIRE_PAGE.CATEGORIES.'+p.formData.categorie).subscribe((res: string) => {
                    p.formData.categorie = res;
                  });
            
                  this.translate.get('PARTENAIRE_PAGE.SECTEURPUBLICS.'+p.formData.secteurPublic).subscribe((res: string) => {
                    p.formData.secteurPublic = res;
                  });
                  
                  /*this.translate.get('PARTENAIRE_PAGE.SECTEURACTIVITES.'+p.formData.secteurActivite).subscribe((res: string) => {
                    p.formData.secteurActivite = res;
                  });*/

                  //chargement des relation localité
                  if(isDefined(paysIndex[p.pays])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[paysIndex[p.pays]].formData.nom, 6);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[paysIndex[p.pays]].formData.code, 7);
                    idPays = res.pays[paysIndex[p.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == p.pays){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomPays', res.pays[i].formData.nom, 6);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codePays', res.pays[i].formData.code, 7);
                        paysIndex[p.pays] = i;
                        idPays = res.pays[i].id;
                        break;
                      }
                    }
                  }

                  if(isDefined(regionIndex[p.region])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[regionIndex[p.region]].formData.nom, 8);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[regionIndex[p.region]].formData.code, 9);
                    idRegion = res.regions[regionIndex[p.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == p.region){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomRegion', res.regions[i].formData.nom, 8);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeRegion', res.regions[i].formData.code, 9);
                        regionIndex[p.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }

                  
                  if(isDefined(departementIndex[p.departement])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[departementIndex[p.departement]].formData.nom, 10);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[departementIndex[p.departement]].formData.code, 11);
                    idDepartement = res.departements[departementIndex[p.departement]].id;
                  }else{
                    for(let i=0; i < res.departements.length; i++){
                      if(res.departements[i].id == p.departement){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomDepartement', res.departements[i].formData.nom, 10);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeDepartement', res.departements[i].formData.code, 11);
                        departementIndex[p.departement] = i;
                        idDepartement = res.departements[i].id;
                        break;
                      }
                    }
                  }
                  
                  if(isDefined(communeIndex[p.commune])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[communeIndex[p.commune]].formData.nom, 12);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[communeIndex[p.commune]].formData.code, 13);
                    idCommune = res.communes[communeIndex[p.commune]].id;
                  }else{
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == p.commune){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomCommune', res.communes[i].formData.nom, 12);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeCommune', res.communes[i].formData.code, 13);
                        communeIndex[p.commune] = i;
                        idCommune = res.communes[i].id;
                        break;
                      }
                    }
                  }
                  
                  
                  if(isDefined(localiteIndex[p.localite])){
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[localiteIndex[p.localite]].formData.nom, 14);
                    p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[localiteIndex[p.localite]].formData.code, 15);
                    idSiege = res.localites[localiteIndex[p.localite]].id;
                  }else{
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == p.localite){
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'nomSiege', res.localites[i].formData.nom, 14);
                        p.formData = this.addItemToObjectAtSpecificPosition(p.formData, 'codeSiege', res.localites[i].formData.code, 15);
                        localiteIndex[p.localite] = i;
                        idSiege = res.localites[i].id;
                        break;
                      }
                    }
                  }
                  
                  partenairesData.push({id: p.id, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...p.formData, ...p.formioData, ...p.security});
                
                }
              }
              
            }


            this.loading = false;
            if(this.mobile){
              partenairesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.partenairesData = [...partenairesData];
              this.allPartenairesData = [...partenairesData];
            } else{
               //this.partenairesData = [...datas];
  
              //si non mobile ou mobile + mode tableau et 
              //if(this.partenairesData.length > 0){
              //$('#partenaire').ready(()=>{
                let expor = global.peutExporterDonnees;
                if(this.filtrePartenaire){
                  expor = false;
                }

                if(global.langue == 'en'){
                  this.partenaireHTMLTable = createDataTable(id, this.colonnes, partenairesData, null, this.translate, expor);
                }else{
                  this.partenaireHTMLTable = createDataTable(id, this.colonnes, partenairesData, global.dataTable_fr, this.translate, expor);
                }

                this.attacheEventToDataTable(this.partenaireHTMLTable.datatable);
            // });
            // }
            }
           
          }
        }).catch((err) => {
          this.loading = false;
          this.partenaires = [];
          this.partenairesData = [];
          this.allPartenairesData = [];
          console.log('Erreur acces aux partenaires');
          console.log(err);
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
            this.setSelect2DefaultValue('idPays', this.unPartenaire.idPays);
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
            this.setSelect2DefaultValue('idRegion', this.unPartenaire.idRegion);
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
            this.setSelect2DefaultValue('idDepartement', this.unPartenaire.idDepartement);
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
            this.setSelect2DefaultValue('idCommune', this.unPartenaire.idCommune);
          }
        }
      }).catch((e) => {
        console.log('Commune erreur: '+e);
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
            this.setSelect2DefaultValue('idSiege', this.unPartenaire.idSiege);
          }
        }
      }).catch((e) => {
        console.log('vilage commune erreur: '+e);
        this.localiteData = [];
      });
    }

    setCodeAndNomPays(idPays){
      if(idPays && idPays != ''){
        for(let p of this.paysData){
          if(idPays == p.id){
            this.partenaireForm.controls.codePays.setValue(p.code);
            this.partenaireForm.controls.nomPays.setValue(p.nom);

            this.partenaireForm.controls.idRegion.setValue(null);
            this.partenaireForm.controls.codeRegion.setValue(null);
            this.partenaireForm.controls.nomRegion.setValue(null);

            this.departementData = [];
            this.partenaireForm.controls.idDepartement.setValue(null);
            this.partenaireForm.controls.codeDepartement.setValue(null);
            this.partenaireForm.controls.nomDepartement.setValue(null);

            this.communeData = [];
            this.partenaireForm.controls.idCommune.setValue(null);
            this.partenaireForm.controls.codeCommune.setValue(null);
            this.partenaireForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.partenaireForm.controls.idSiege.setValue(null);
            this.partenaireForm.controls.codeSiege.setValue(null);
            this.partenaireForm.controls.nomSiege.setValue(null);

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
            this.partenaireForm.controls.codeRegion.setValue(r.code);
            this.partenaireForm.controls.nomRegion.setValue(r.nom);

            this.partenaireForm.controls.idDepartement.setValue(null);
            this.partenaireForm.controls.codeDepartement.setValue(null);
            this.partenaireForm.controls.nomDepartement.setValue('');

            this.communeData = [];
            this.partenaireForm.controls.idCommune.setValue(null);
            this.partenaireForm.controls.codeCommune.setValue(null);
            this.partenaireForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.partenaireForm.controls.idSiege.setValue(null);
            this.partenaireForm.controls.codeSiege.setValue(null);
            this.partenaireForm.controls.nomSiege.setValue(null);

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
            this.partenaireForm.controls.codeDepartement.setValue(d.code);
            this.partenaireForm.controls.nomDepartement.setValue(d.nom);

            this.partenaireForm.controls.idCommune.setValue(null);
            this.partenaireForm.controls.codeCommune.setValue(null);
            this.partenaireForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.partenaireForm.controls.idSiege.setValue(null);
            this.partenaireForm.controls.codeSiege.setValue(null);
            this.partenaireForm.controls.nomSiege.setValue(null);

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
            this.partenaireForm.controls.codeCommune.setValue(c.code);
            this.partenaireForm.controls.nomCommune.setValue(c.nom);
            
            this.partenaireForm.controls.idSiege.setValue(null);
            this.partenaireForm.controls.codeSiege.setValue(null);
            this.partenaireForm.controls.nomSiege.setValue(null);
            this.getLocaliteParCommune(idCommune)
            break;
          }
        }
      }
    }

    setCodeAndNomLocalite(idLocalite){
      if(idLocalite && idLocalite != ''){
        for(let l of this.localiteData){
          if(idLocalite == l.id){
            this.partenaireForm.controls.codeSiege.setValue(l.code);
            this.partenaireForm.controls.nomSiege.setValue(l.nom);
            break;
          }
        }
      }
    }
  
    setIDCodeEtNomPays(paysData){
      this.partenaireForm.controls.idPays.setValue(paysData.id);
      this.partenaireForm.controls.codePays.setValue(paysData.code);
      this.partenaireForm.controls.nomPays.setValue(paysData.nom);
    }

    setIDCodeEtNomRegion(regionData){
      this.partenaireForm.controls.idRegion.setValue(regionData.id);
      this.partenaireForm.controls.codeRegion.setValue(regionData.code);
      this.partenaireForm.controls.nomRegion.setValue(regionData.nom);
    }

    setIDCodeEtNomDepartement(departementData){
      this.partenaireForm.controls.idDepartement.setValue(departementData.id);
      this.partenaireForm.controls.codeDepartement.setValue(departementData.code);
      this.partenaireForm.controls.nomDepartement.setValue(departementData.nom);
    }

    setIDCodeEtNomCommune(communeData){
      this.partenaireForm.controls.idCommune.setValue(communeData.id);
      this.partenaireForm.controls.codeCommune.setValue(communeData.code);
      this.partenaireForm.controls.nomCommune.setValue(communeData.nom);
    }

    setIDCodeEtNomLocalite(localiteData){
      this.partenaireForm.controls.idSiege.setValue(localiteData.id);
      this.partenaireForm.controls.codeSiege.setValue(localiteData.code);
      this.partenaireForm.controls.nomSiege.setValue(localiteData.nom);
    }



    attacheEventToDataTable(datatable){
      var self = this;
      var id = 'partenaire-datatable';
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
        console.log(this.partenaireHTMLTable.datatable.row(this).data());
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
      $('#'+id+' thead tr:eq(0) th:eq(6)').html(this.translate.instant('COMMUNE_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(7)').html(this.translate.instant('PARTENAIRE_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(8)').html(this.translate.instant('PARTENAIRE_PAGE.NUMERO'));
      $('#'+id+' thead tr:eq(0) th:eq(9)').html(this.translate.instant('PARTENAIRE_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(10)').html(this.translate.instant('PARTENAIRE_PAGE.CATEGORIE'));
      $('#'+id+' thead tr:eq(0) th:eq(11)').html(this.translate.instant('PARTENAIRE_PAGE.AUTRETYPE'));
      $('#'+id+' thead tr:eq(0) th:eq(12)').html(this.translate.instant('GENERAL.LATITUDE'));
      $('#'+id+' thead tr:eq(0) th:eq(13)').html(this.translate.instant('GENERAL.LONGITUDE'));
      */
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }

  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
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
       this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CATEGORIE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.categorie[0].message = res;
      });

       //autre type secteurPublic
       this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.SECTEURPUBLIC.REQUIRED').subscribe((res: string) => {
        this.messages_validation.secteurPublic[0].message = res;
      });

      //autre type secteurActivite
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.SECTEURACTIVITE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.secteurActivite[0].message = res;
      });

      //code pays
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPays[0].message = res;
      });


      //code région
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idRegion[0].message = res;
      });

       //code département
       this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idDepartement[0].message = res;
      });

      //code commune
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODECOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idCommune[0].message = res;
      });

      //code localité
      this.translate.get('PARTENAIRE_PAGE.MESSAGES_VALIDATION.CODESIEGE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idSiege[0].message = res;
      });
    }
  
    
    dataTableAddRow(rowData){
      /*let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });*/
  
      $('#partenaire-dataTable').ready(() => {
        this.partenaireHTMLTable.datatable.row.add(rowData).draw();
        //this.partenaireHTMLTable.datatable.row.add(data).draw();
      });
    }
  
    dataTableUpdateRow(/*index, */rowData){
      /*let data = [];
      Object.keys(rowData).forEach((key, index) => {
        data.push(rowData[key]);
      });*/
      $('#partenaire-dataTable').ready(() => {
        this.partenaireHTMLTable.datatable.row('.selected').data(rowData).draw();
        //this.partenaireHTMLTable.datatable.row('.selected').data(data).draw();
      })
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      $('#partenaire-dataTable').ready(() => {
        this.partenaireHTMLTable.datatable.rows('.selected').remove().draw();
      })
      
    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.partenaireHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.partenaireHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.partenaireHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    if(this.partenaireHTMLTable && this.partenaireHTMLTable.datatable){
      //var id = 'partenaire-datatable';

      var self = this;
      //$('#'+id+' thead tr:eq(1)').show();

      //$(self.partenaireHTMLTable.datatable.table().header()).children(1).show();
      $(self.partenaireHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
      this.recherchePlus = true;
    }
  }

  dataTableRemoveRechercheParColonne(){
    //var id = 'partenaire-datatable';
    var self = this;

    //$('#'+id+' thead tr:eq(1)').hide();
    //children(0).children(0)[1].firstChild.nodeValue
    //console.log($(self.partenaireHTMLTable.datatable.table().header()).children(1)[1])
    $(self.partenaireHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'partenaire-datatable';
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
      $( self.partenaireHTMLTable.datatable.table().footer() ).show();
      this.partenaireHTMLTable.datatable.columns().every( function () {
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
                  
                  var info = self.partenaireHTMLTable.datatable.page.info();
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

      this.partenaireHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
        if(!$('#'+id+colIdx).attr('style') && visibility){
            $('#'+id+colIdx).selectpicker();
              $('.ms-parent').removeAttr("style");
          }
      });

      this.filterAjouter = true;
      this.filterInitialiser = true;

    } else if(!this.filterAjouter && this.filterInitialiser){
      //$('#'+id+' tfoot').show();
      $( self.partenaireHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }

  dataTableRemoveCustomFiltre(){
    var id = 'partenaire-datatable';
    var self = this;
    //$('#'+id+' tfoot').hide();
    $( self.partenaireHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }


    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        //let p = [...this.partenairesData]
        this.partenairesData = this.allPartenairesData.filter((item) => {
          return item.numero.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || item.categorie.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.partenaireData = temp;
      
    }
    
    async close(){
      await this.modalController.dismiss({filtrePartenaire: this.filtrePartenaire});
    }

    async valider() {
      //this.filtrePartenaire = [];
      this.filtrePartenaire = this.filtrePartenaire.concat(this.selectedIndexes);

      await this.modalController.dismiss({filtrePartenaire: this.filtrePartenaire});
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
