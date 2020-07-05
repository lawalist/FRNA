import { Component, OnInit, Input  } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsOpComponent } from '../../component/relations-op/relations-op.component';
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
import { UnionPage } from '../union/union.page';
import { isDefined } from '@angular/compiler/src/util';
import { PartenairePage } from '../partenaire/partenaire.page';
import { PersonnesPage } from '../personnes/personnes.page';
import * as moment from 'moment';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
//declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-op',
  templateUrl: './op.page.html',
  styleUrls: ['./op.page.scss'],
})
export class OpPage implements OnInit {
  @Input() idOp: string;
  @Input() idPartenaire: string;
  @Input() idUnion: string;
  @Input() filtreOP: any;
  @Input() filtreUnions: any;

  global = global;
  start: any;
  opForm: FormGroup;
  action: string = 'liste';
  cacheAction: string = 'liste';
  ops: any = [];
  opsData: any = [];
  allOpsData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  communeData: any = [];
  localiteData: any = [];
  federationData: any = [];
  unionData: any = [];
  niveauChoix = [];
  secteurs = ['Privé', 'Etat', 'Sémi-privé'];
  domaines = ['Agronamie', 'Santé', 'Environement', 'Gouvernement'];
  uneOp: any;
  uneOpDoc: any;
  opHTMLTable: any;
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
  colonnes = ['nom', 'numero', 'niveau','nomFederation', 'numeroFederation', 'nomUnion', 'numeroUnion', 'dateCreation', 'telephone', 'email', 'nomPays', 'codePays', 'nomRegion', 'codeRegion', 'nomDepartement', 'codeDepartement', 'nomCommune', 'codeCommune', 'nomSiege', 'codeSiege', 'latitude', 'longitude']

  messages_validation = {
    'numero': [
      { type: 'required', message: '' },
      { type: 'uniqueNumeroOp', message: '' }
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
    'idUnion': [
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
      //au cas où la op est en mode modal, on chercher info region
      this.translateLangue();
      this.getOp();
      this.translateChoixNiveau();
    }
  
    translateChoixNiveau(){
      for(let i = 1; i <= 3; i++){
        this.translate.get('OP_PAGE.CHOIXNIVEAU.'+i).subscribe((res: string) => {
          this.niveauChoix.push({id: i, val: res});
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
        this.actualiserTableau(this.opsData);
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
      if(this.opForm.get(filedName).errors && (this.opForm.get(filedName).dirty || this.opForm.get(filedName).touched)){
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
      if(this.opForm.get(filedName).errors){
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
          self.opForm.controls[id].setValue(e.params.data.id)
          if(id == 'idPays'){
            self.setCodeAndNomPays(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
            self.regionData = [];
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
            //self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
            //self.communeData = [];
            self.localiteData = [];
          }else if(id == 'idCommune'){
            //self.localiteData = [];
            self.setCodeAndNomCommune(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idSiege'){
            self.setCodeAndNomLocalite(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idFederation'){
            self.setNumeroAndNomFederation(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idUnion'){
            self.setNumeroAndNomUnion(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'niveau'){
            //self.setSelect2DefaultValue('numeroFederation', null);
            //self.setSelect2DefaultValue('numeroUnion', null);
            self.opForm.controls.idFederation.setValue(null);
            self.opForm.controls.numeroFederation.setValue(null);
            self.opForm.controls.nomFederation.setValue(null);
            self.opForm.controls.idUnion.setValue(null);
            self.opForm.controls.numeroUnion.setValue(null);
            self.opForm.controls.nomUnion.setValue(null);
            if(self.opForm.value[id] == 1 && !self.federationData.length){
              self.getFederation();
              //self.getUnion();
            } else if(self.opForm.value[id] == 2){
              self.federationData = [];
              self.opForm.controls.idFederation.setValue(null);
              self.opForm.controls.numeroFederation.setValue(null);
              self.opForm.controls.nomFederation.setValue(null);
              self.getUnionParFederation(null);
            }/*else{
              self.opForm.controls.idFederation.setValue(null);
              self.opForm.controls.numeroFederation.setValue(null);
              self.opForm.controls.nomFederation.setValue(null);
              self.opForm.controls.idUnion.setValue(null);
              self.opForm.controls.numeroUnion.setValue(null);
              self.opForm.controls.nomUnion.setValue(null);
            }*/

            self.setSelectRequredError(id, id)
          }
          
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.opForm.controls[id].setValue(null); 
          if(id == 'idPays'){
            self.regionData = [];
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setCodeAndNomPays(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idRegion'){
            self.departementData = [];
            self.communeData = [];
            self.localiteData = []
            self.setCodeAndNomRegion(self.opForm.value[id]);;
            self.setSelectRequredError(id, id)
          }else if(id == 'idDepartement'){
            self.communeData = [];
            self.localiteData = [];
            self.setCodeAndNomDepartement(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idCommune'){
            self.localiteData = [];
            self.setCodeAndNomCommune(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idSiege'){
            self.setCodeAndNomLocalite(self.opForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idFederation'){
            self.opForm.controls.idFederation.setValue(null);
            self.opForm.controls.numeroFederation.setValue(null);
            self.opForm.controls.nomFederation.setValue(null);

            self.opForm.controls.idUnion.setValue(null);
            self.opForm.controls.numeroUnion.setValue(null);
            self.opForm.controls.nomUnion.setValue(null);
            //self.setSelect2DefaultValue('numeroUnion', null);
            self.unionData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'idUnion'){
            self.opForm.controls.idUnion.setValue(null);
            self.opForm.controls.numeroUnion.setValue(null);
            self.opForm.controls.nomUnion.setValue(null);
            self.setSelectRequredError(id, id);
          }else if(id == 'niveau'){
            self.setSelect2DefaultValue('idFederation', null);
            self.opForm.controls.idFederation.setValue(null);
            self.opForm.controls.numeroFederation.setValue(null);
            self.opForm.controls.nomFederation.setValue(null);
            self.federationData = [];

            self.setSelect2DefaultValue('idUnion', null);
            self.opForm.controls.idUnion.setValue(null);
            self.opForm.controls.numeroUnion.setValue(null);
            self.opForm.controls.nomUnion.setValue(null);
            self.unionData = [];
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
      //this.opForm = null;
      this.opForm = this.formBuilder.group({
        nom: [null, Validators.required],
        numero: [null, Validators.required],
        niveau: ['1', Validators.required],
        nomFederation: [null, Validators.required],
        numeroFederation: [null, Validators.required],
        idFederation: [null, Validators.required],
        nomUnion: [null, Validators.required],
        numeroUnion: [null, Validators.required],
        idUnion: [null, Validators.required],
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

      /*this.opForm.valueChanges.subscribe(change => {
        this.opForm.get('numero').setValidators([opValidator.uniqueNumeroOp(this.opsData, 'ajouter'), Validators.required]);
      });

      this.opForm.valueChanges.subscribe(change => {
        this.opForm.get('numeroUnion').setValidators([opValidator.requireUnion(this.opForm.controls.niveau.value)]);
      });*/
    }
  
    editForm(oDoc){
      let op = oDoc.ops[0];
      let idFederation;
      let numeroFederation;
      let nomFederation;
      let idUnion;
      let numeroUnion;
      let nomUnion;
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

      if(oDoc.partenaires && oDoc.partenaires[0]){
        idFederation = oDoc.partenaires[0].id;
        numeroFederation = oDoc.partenaires[0].formData.numero;
        nomFederation = oDoc.partenaires[0].formData.nom;
      }

      if(oDoc.unions[0]){
        idUnion = oDoc.unions[0].id;
        numeroUnion = oDoc.unions[0].formData.numero;
        nomUnion = oDoc.unions[0].formData.nom;
      }

      if(oDoc.pays[0]){
        idPays = oDoc.pays[0].id;
        codePays = oDoc.pays[0].formData.code;
        nomPays = oDoc.pays[0].formData.nom;
      }

      if(oDoc.regions[0]){
        idRegion = oDoc.regions[0].id;
        codeRegion = oDoc.regions[0].formData.code;
        nomRegion = oDoc.regions[0].formData.nom;
      }

      if(oDoc.departements[0]){
        idDepartement = oDoc.departements[0].id;
        codeDepartement = oDoc.departements[0].formData.code;
        nomDepartement = oDoc.departements[0].formData.nom;
      }

      if(oDoc.communes[0]){
        idCommune = oDoc.communes[0].id;
        codeCommune = oDoc.communes[0].formData.code;
        nomCommune = oDoc.communes[0].formData.nom;
      }

      if(oDoc.localites[0]){
        idSiege = oDoc.localites[0].id;
        codeSiege = oDoc.localites[0].formData.code;
        nomSiege = oDoc.localites[0].formData.nom;
      }

      //this.opForm = null;
      let u = op.formData
      this.opForm = this.formBuilder.group({
        nom: [u.nom, Validators.required],
        numero: [u.numero, Validators.required],
        niveau: [u.niveau, Validators.required],
        nomFederation: [nomFederation],
        numeroFederation: [numeroFederation],
        idFederation: [idFederation],
        nomUnion: [nomUnion], 
        numeroUnion: [numeroUnion],
        idUnion: [idUnion],
        dateCreation: [u.dateCreation],  
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
        latitude: [u.latitude],
        longitude: [u.latitude],
        telephone: [u.telephone],
        email: [u.email],
        adresse: [u.adresse],
        
      });

      this.validerNumero();
      /*this.opForm.valueChanges.subscribe(change => {
        this.opForm.get('numero').setValidators([opValidator.uniqueNumeroOp(this.opsData, 'ajouter'), Validators.required]);
      });

      this.opForm.valueChanges.subscribe(change => {
        this.opForm.get('numeroUnion').setValidators([opValidator.requireUnion(this.opForm.controls.niveau.value)]);
      });*/

    }

    validerNumero(){
      let numeroControl = this.opForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndNumero('op', value).then((res) => {
          if(res && res.ops && res.ops[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.uneOp.numero))){
            numeroControl.setErrors({uniqueNumeroOp: true});
          }
        });
      });
/*
      let numeroUnionControl = this.opForm.controls['numeroUnion'];
      numeroUnionControl.valueChanges.subscribe((value) => {
        if(this.opForm.controls.niveau.value != '3' && (!numeroUnionControl.value || numeroUnionControl.value == '')){
          numeroUnionControl.setErrors({required: true})
        }
      });


      let numeroFederationControl = this.opForm.controls['numeroFederation'];
      numeroFederationControl.valueChanges.subscribe((value) => {
        if(this.opForm.controls.niveau.value == '1' && (!numeroFederationControl.value || numeroFederationControl.value == '')){
          numeroFederationControl.setErrors({required: true})
        }
      });

*/
      let idFederationControl = this.opForm.controls['idFederation'];
      let idUnionControl = this.opForm.controls['idUnion'];
      let niveauControl = this.opForm.controls['niveau'];
      niveauControl.valueChanges.subscribe((value) => {
        if(value == 1 && ((!idFederationControl.value || idFederationControl.value == '') || (!idUnionControl.value || idUnionControl.value == ''))){
          idFederationControl.setValidators(Validators.required);
          this.opForm.controls['nomFederation'].setValidators(Validators.required);
          this.opForm.controls['numeroFederation'].setValidators(Validators.required);

          idUnionControl.setValidators(Validators.required);
          this.opForm.controls['nomUnion'].setValidators(Validators.required);
          this.opForm.controls['numeroUnion'].setValidators(Validators.required);
        }else if(value == 2 && (!idUnionControl.value || idUnionControl.value == '')){
          idFederationControl.clearValidators();
          this.opForm.controls['nomFederation'].clearValidators();
          this.opForm.controls['numeroFederation'].clearValidators();

          idUnionControl.setValidators(Validators.required);
          this.opForm.controls['nomUnion'].setValidators(Validators.required);
          this.opForm.controls['numeroUnion'].setValidators(Validators.required);
        } else {
          idFederationControl.clearValidators();
          this.opForm.controls['nomFederation'].clearValidators();
          this.opForm.controls['numeroFederation'].clearValidators();

          idUnionControl.clearValidators();
          this.opForm.controls['nomUnion'].clearValidators();
          this.opForm.controls['numeroUnion'].clearValidators();
          //idFederationControl.reset(null);
        }
      });  
    }
  
    ajouter(){
      this.doModification = false;
      this.start = moment().toISOString();
      if(this.idUnion && this.idUnion != ''){
        if(this.opHTMLTable && this.opHTMLTable.datatable && this.opHTMLTable.datatable.row(0) && this.opHTMLTable.datatable.row(0).data()){
          this.idPartenaire = this.opHTMLTable.datatable.row(0).data().numeroFederation;
          //this.getPays();
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('union', this.idUnion).then((res) => {
            if(res && res.unions){
              this.idPartenaire = res.unions[0].partenaire;
              //this.getPays();
            }
          })
        }
      }
      this.getPays();
      //this.getFederation();
      //this.getUnion();
      this.initForm();
      this.initSelect2('niveau', this.translate.instant('OP_PAGE.NIVEAU'), true);
      this.initSelect2('idFederation', this.translate.instant('UNION_PAGE.SELECTIONFEDERATION'));
      this.initSelect2('idUnion', this.translate.instant('OP_PAGE.SELECTIONUNION'));
      //this.initSelect2('domaine', this.translate.instant('OP_PAGE.DOMAINE'));
      this.initSelect2('idPays', this.translate.instant('OP_PAGE.SELECTIONPAYS'));
      this.initSelect2('idRegion', this.translate.instant('OP_PAGE.SELECTIONREGION'));
      this.initSelect2('idDepartement', this.translate.instant('OP_PAGE.SELECTIONDEPARTEMENT'));
      this.initSelect2('idCommune', this.translate.instant('OP_PAGE.SELECTIONCOMMUNE'));
      this.initSelect2('idSiege', this.translate.instant('OP_PAGE.SELECTIONSIEGE'));
      this.setSelect2DefaultValue('niveau', '1')
      
      this.action = 'ajouter';
    }
  
    infos(u){
      if(global.controlAccesModele('ops', 'lecture')){
        if(!this.estModeCocherElemListe){
          this.uneOp = u;
          this.action = 'infos';
        }
      }
    }

  
    modifier(op){
      //console.log(op)
      if(!this.filtreOP){
        if(global.controlAccesModele('ops', 'modification')){
          let id;
          if(isObject(op)){
            id = op.id;
          }else{
            id = op;
          }
    
          this.doModification = true;
          this.start = moment().toISOString();
          this.servicePouchdb.findRelationalDocByID('op', id).then((res) => {
            if(res && res.ops[0]){
              let oDoc = res.ops[0];
              this.getPays();
              if(oDoc.pays)
                this.getRegionParPays(oDoc.pays);
              if(oDoc.region)
                this.getDepartementParRegion(oDoc.region);
              if(oDoc.departement)
                this.getCommuneParDepartement(oDoc.departement);
              if(oDoc.commune)
                this.getLocaliteParCommune(oDoc.commune);
              
              if(oDoc.formData.niveau == '1'){
                this.getFederation();
                //this.getUnionParFederation(oDoc.numeroFederation);
              }
    
    
              this.editForm(res);
    
              this.initSelect2('niveau', this.translate.instant('OP_PAGE.NIVEAU'));
              this.initSelect2('idFederation', this.translate.instant('UNION_PAGE.SELECTIONFEDERATION'));
              this.initSelect2('idUnion', this.translate.instant('OP_PAGE.SELECTIONUNION'));
              //this.initSelect2('domaine', this.translate.instant('OP_PAGE.DOMAINE'));
              this.initSelect2('idPays', this.translate.instant('OP_PAGE.SELECTIONPAYS'));
              this.initSelect2('idRegion', this.translate.instant('OP_PAGE.SELECTIONREGION'));
              this.initSelect2('idDepartement', this.translate.instant('OP_PAGE.SELECTIONDEPARTEMENT'));
              this.initSelect2('idCommune', this.translate.instant('OP_PAGE.SELECTIONCOMMUNE'));
              this.initSelect2('idSiege', this.translate.instant('OP_PAGE.SELECTIONSIEGE'));
              
              this.setSelect2DefaultValue('niveau', oDoc.formData.niveau);
              /*$('#numero input').ready(()=>{
                $('#numero input').attr('disabled', true)
              });*/
    
    
              //this.setSelect2DefaultValue('numeroUnion', oDoc.formData.numeroUnion)
              //this.setSelect2DefaultValue('domaine', oDoc.formData.domaine)
    
              //this.setSelect2DefaultValue('codePays', op.codePays)
              //this.setSelect2DefaultValue('codeRegion', op.codeRegion)
              //this.setSelect2DefaultValue('codeDepartement', op.codeDepartement)
              //this.setSelect2DefaultValue('codeCommune', op.codeCommune)
              //this.setSelect2DefaultValue('codeSiege', op.codeSiege)
              
              this.uneOpDoc = oDoc;
             
              if(!isObject(op)){
                for(let u of this.opsData){
                  if(u.id == id){
                    this.uneOp = u;
                    break;
                  }
                }
              }else{
                this.uneOp = op;
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
        this.opForm.controls.latitude.setValue(resp.coords.latitude);
        this.opForm.controls.longitude.setValue(resp.coords.longitude);
        this.afficheMessage(this.translate.instant('GENERAL.COORDONNEES_OBTENUES'));
      }, err => {
        this.afficheMessage(this.translate.instant('GENERAL.ERREUR_COORDONNEES'));
          console.log(err)
      });
    }
  
    exportPDF(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('op-datatable').innerHTML], {
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-10"
        type: "text/plain;charset=utf-10"
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-10"
        //type: 'application/vnd.ms-excel;charset=utf-10'
        //type: "application/vnd.ms-excel;charset=utf-10"
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

                this.servicePouchdb.findRelationalDocByID('op', u.id).then((res) => {
                  res.ops[0].security = this.servicePouchdb.garderDeleteTrace(res.ops[0].security);

                  this.servicePouchdb.updateRelationalDoc(res.ops[0]).then((res) => {
                    //mise à jour de la liste si mobile et mode liste
                    if(this.opsData.indexOf(u) !== -1){
                      this.opsData.splice(this.opsData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant')
                    }

                    this.action = 'liste';

                    if(!this.mobile){
                      //sinion dans le tableau
                      this.dataTableRemoveRows();
                    }else{
                      this.opsData = [...this.opsData];
                      if(this.allOpsData.indexOf(u) !== -1){
                        this.allOpsData.splice(this.allOpsData.indexOf(u), 1);
                      }else{
                        console.log('echec splice, index inexistant dans allOpsData')
                      }
                    }
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }else{

                this.servicePouchdb.findRelationalDocByID('op', u.id).then((res) => {
                 this.servicePouchdb.deleteRelationalDocDefinitivement(res.ops[0]).then((res) => {

                  //mise à jour de la liste si mobile et mode liste
                  if(this.opsData.indexOf(u) !== -1){
                    this.opsData.splice(this.opsData.indexOf(u), 1);
                  }else{
                    console.log('echec splice, index inexistant')
                  }

                  this.action = 'liste';
                  if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                    //sinion dans le tableau
                    this.dataTableRemoveRows();
                  }else{
                    this.opsData = [...this.opsData];
                    if(this.allOpsData.indexOf(u) !== -1){
                      this.allOpsData.splice(this.allOpsData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant dans allOpsData')
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

    async presentUnion(idUnion) {
      const modal = await this.modalController.create({
        component: UnionPage,
        componentProps: {
          idModele: 'ops',  idUnion: idUnion },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async presentFederation(idFederation) {
      const modal = await this.modalController.create({
        component: PartenairePage,
        componentProps: {
          idModele: 'ops', idPartenaire: idFederation },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async archivageMultiple(ids) {
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
              for(let id of ids){
                //var u = this.opsData[i];
                this.servicePouchdb.findRelationalDocByID('op', id).then((res) => {
                  res.ops[0].security = this.servicePouchdb.garderArchivedTrace(res.ops[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.ops[0]).catch((err) => {
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
                this.opsData = [...this.removeMultipleElem(this.opsData, ids)];
                this.allOpsData = this.removeMultipleElem(this.allOpsData, ids);
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
                this.servicePouchdb.findRelationalDocByID('op', id).then((res) => {
                  res.ops[0].security = this.servicePouchdb.garderDesarchivedTrace(res.ops[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.ops[0]).catch((err) => {
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
                this.opsData = [...this.removeMultipleElem(this.opsData, ids)]; 
                this.allOpsData = this.removeMultipleElem(this.allOpsData, ids);
                
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
      this.opsData.forEach((u) => {
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
          idModele: 'ops', 
          "estModeCocherElemListe": this.estModeCocherElemListe,
          "dataLength": this.opsData.length,
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
          this.getOpsByType('liste');
        }  else  if(dataReturned !== null && dataReturned.data == 'archives') {
          this.estModeCocherElemListe = false;
          this.getOpsByType('archives');
        }  else  if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.estModeCocherElemListe = false;
          this.getOpsByType('corbeille');
        }  else  if(dataReturned !== null && dataReturned.data == 'partages') {
          this.estModeCocherElemListe = false;
          this.getOpsByType('partages');
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
       let data = [...this.opsData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_OPs_'+date+'.xls', blob).then(()=> {
           alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
       }).catch(()=>{
           alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
       });
     }
   
     exportCSV(){
       let data = [...this.opsData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_OPs_'+date+'.csv', blob).then(()=> {
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
          //"dataLength": this.opsData.length,
          //"selectedIndexesLength": this.selectedIndexes.length,
          //"styleAffichage": this.styleAffichage,
          idModele: 'ops',  
          "action": this.cacheAction
      /*}*/},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'modifier') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneOp.id);
          }
          this.modifier(this.selectedIndexes[0]);
          this.decocherTousElemListe();
          this.estModeCocherElemListe = false;
          //this.changerModeCocherElemListe();
        }else  if(dataReturned !== null && dataReturned.data == 'desarchiver') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneOp.id);
          }
          

          this.desarchivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else  if(dataReturned !== null && dataReturned.data == 'archiver') {
          if(this.action == 'infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneOp.id);
          }
          

          this.archivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        } else  if(dataReturned !== null && dataReturned.data == 'restaurer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneOp.id);
          }
          

          this.restaurationMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else if(dataReturned !== null && dataReturned.data == 'derniereModification') {
          this.selectedItemDerniereModification();          
        }else if(dataReturned !== null && dataReturned.data == 'partager') {
          //this.changeStyle();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.uneOp.id);
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
      if(this.opsData.length != this.selectedIndexes.length) {
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
                  this.servicePouchdb.findRelationalDocByID('op', id).then((res) => {
                    res.ops[0].security = this.servicePouchdb.garderDeleteTrace(res.ops[0].security);
                    this.servicePouchdb.updateRelationalDoc(res.ops[0]).catch((err) => {
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
                  this.opsData = [...this.removeMultipleElem(this.opsData, ids)];
                  this.allOpsData = this.removeMultipleElem(this.allOpsData, ids);
                  
                  //if(this.action != 'infos'){
                    this.estModeCocherElemListe = false;
                    this.decocherTousElemListe();
                  //}
                  //this.action = this.cacheAction;
                }
              }else{

                //suppresion multiple définitive
                for(let id of ids){
                  
                  this.servicePouchdb.findRelationalDocByID('op', id).then((res) => {
                    this.servicePouchdb.deleteRelationalDocDefinitivement(res.ops[0]).catch((err) => {
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
                  this.opsData = [...this.removeMultipleElem(this.opsData, ids)];
                  this.allOpsData = [...this.removeMultipleElem(this.allOpsData, ids)];

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
                
                this.servicePouchdb.findRelationalDocByID('op', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.ops[0]).catch((err) => {
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
                this.opsData = [...this.removeMultipleElem(this.opsData, ids)];
                this.allOpsData = this.removeMultipleElem(this.allOpsData, ids);
                
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
                
                this.servicePouchdb.findRelationalDocByID('op', id).then((res) => {
                  res.ops[0].security = this.servicePouchdb.garderRestaureTrace(res.ops[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.ops[0]).catch((err) => {
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
                this.opsData = [...this.removeMultipleElem(this.opsData, ids)];
                this.allOpsData = [...this.removeMultipleElem(this.allOpsData, ids)];
                
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
        codes.push(this.uneOp.id);
      }else /*if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)*/{
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
        //this.actualiserTableau(this.opsData);
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
          this.opsData = [...this.opsData];
          this.rechargerListeMobile = false;
        }
        ///this.actualiserTableau(this.opsData);
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
              this.infos(this.opsData[this.selectedIndexes[0]]);
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
              this.modifier(this.opsData[this.selectedIndexes[0]]);
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
          idModele: 'ops'},
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
            this.infos(this.opsData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.opsData[this.selectedIndexes[0]]);
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
          idModele: 'ops', "action": this.action, "recherchePlus": this.recherchePlus, "filterAjouter": this.filterAjouter},
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
          this.getOpsByType('corbeille');
        } else if(dataReturned !== null && dataReturned.data == 'archives') {
          this.getOpsByType('archives');
        } else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getOpsByType('partages');
        } else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          //this.getOpsByType('conflits');
        } else if(dataReturned !== null && dataReturned.data == 'liste') {
          this.getOpsByType('liste');
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
          idModele: 'ops'},
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
          idModele: 'ops', action: this.action},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'listePrincipale') {
          this.getOpsByType('liste');
        }else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getOpsByType('partages');
        }else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          this.cacheAction = 'conflits';
          this.getOpWithConflicts();
          //this.getOp();
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

    getOpWithConflicts(event = null){
      this.action = 'conflits';
      this.cacheAction = 'conflits';
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;

      this.servicePouchdb.findRelationalDocInConflict('op').then((res) => {
        if(res){
          let opsData = [];
          let federationIndex = [];
          let unionIndex = [];
          let paysIndex = [];
          let regionIndex = [];
          let departementIndex = [];
          let communeIndex = [];
          let localiteIndex = [];
          let idFederation, idUnion, idPays, idRegion, idDepartement, idCommune, idSiege;
          for(let u of res.ops){
            //supprimer l'historique de la liste
            delete u.security['shared_history'];

            this.translate.get('OP_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
              u.formData.niveau = res;
            });

            //charger la relation avec le partenaire si non niveaue
            if(u.partenaire && u.partenaire != ''){
              if(isDefined(federationIndex[u.partenaire])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[federationIndex[u.partenaire]].formData.numero, 4);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[federationIndex[u.partenaire]].formData.nom, 5);
                idFederation = res.partenaires[federationIndex[u.partenaire]].id;
              }else{
                for(let i=0; i < res.partenaires.length; i++){
                  if(res.partenaires[i].id == u.partenaire){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                    federationIndex[u.partenaire] = i;
                    idFederation =  res.partenaires[i].id;
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

            if(u.union && u.union != ''){
              if(isDefined(unionIndex[u.union])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[unionIndex[u.union]].formData.numero, 6);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[unionIndex[u.union]].formData.nom, 7);
                idUnion = res.unions[unionIndex[u.union]].id;
              }else{
                for(let i=0; i < res.unions.length; i++){
                  if(res.unions[i].id == u.union){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[i].formData.numero, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[i].formData.nom, 7);
                    unionIndex[u.union] = i;
                    idUnion = res.unions[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', null, 6);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', null, 7);
              idUnion = null;
            }


            //chargement des relation des localités
            if(isDefined(paysIndex[u.pays])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 8);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 9);
              idPays = res.pays[paysIndex[u.pays]].id;
            }else{
              for(let i=0; i < res.pays.length; i++){
                if(res.pays[i].id == u.pays){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 9);
                  idPays = res.pays[i].id;
                  paysIndex[u.pays] = i;
                  break;
                }
              }
            }

            if(isDefined(regionIndex[u.region])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 10);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 11);
              idRegion = res.regions[regionIndex[u.region]].id;
            }else{
              for(let i=0; i < res.regions.length; i++){
                if(res.regions[i].id == u.region){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 11);
                  regionIndex[u.region] = i;
                  idRegion = res.regions[i].id;
                  break;
                }
              }
            }
            
            if(isDefined(departementIndex[u.departement])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 12);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 13);
              idDepartement = res.departements[departementIndex[u.departement]].id;
            }else{
              for(let i=0; i < res.departements.length; i++){
                if(res.departements[i].id == u.departement){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 12);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 13);
                  departementIndex[u.departement] = i;
                  idDepartement = res.departements[i].id;
                  break;
                }
              }
            }
            

            if(isDefined(communeIndex[u.commune])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 14);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 15);
              idCommune = res.communes[communeIndex[u.commune]].id;
            }else{
              for(let i=0; i < res.communes.length; i++){
                if(res.communes[i].id == u.commune){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 14);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 15);
                  communeIndex[u.commune] = i;
                  idCommune = res.communes[i].id;
                  break;
                }
                }
            }

            if(isDefined(localiteIndex[u.localite])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 16);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 17);
              idSiege = res.localites[localiteIndex[u.localite]].id;
            }else{
              for(let i=0; i < res.localites.length; i++){
                if(res.localites[i].id == u.localite){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 16);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 17);
                  localiteIndex[u.localite] = i;
                  idSiege = res.localites[i].id;
                  break;
                }
              }
            }
            

            opsData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});
          }

          if(this.mobile){
            this.opsData = opsData;
            this.opsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.allOpsData = [...this.allOpsData]
          } else{
            $('#op').ready(()=>{
              if(global.langue == 'en'){
                this.opHTMLTable = createDataTable("op", this.colonnes, opsData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.opHTMLTable = createDataTable("op", this.colonnes, opsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.attacheEventToDataTable(this.opHTMLTable.datatable);
            });
          }
        }
        if(event)
          event.target.complete();
      }).catch((err) => {
        this.ops = [];
        this.opsData = [];
        this.allOpsData = [];
        this.selectedIndexes = [];
        console.log(err)
        if(event)
          event.target.complete();
      });
    }

    getOpsByType(type){
      this.action = type;
      this.cacheAction = type;
      this.getOp();
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
          idModele: 'ops', "action": this.action, "cacheAction": this.cacheAction},
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
    
    async presentDerniereModification(op) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: {
          idModele: 'ops', _id: op.id, _rev: op.rev, security: op.security },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      let id
      if(this.action == 'infos'){
        id = this.uneOp.id;
      }else{
        id = this.selectedIndexes[0];
      }


      if(id && id != ''){
        this.servicePouchdb.findRelationalDocByID('op', id).then((res) => {
          if(res && res.ops[0]){
            if(this.estModeCocherElemListe){
              this.estModeCocherElemListe = false;
              this.decocherTousElemListe();
            }
            this.presentDerniereModification(res.ops[0]);
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
      var i = this.opHTMLTable.datatable.row('.selected').index();

      if(this.opHTMLTable.datatable.row(i).next()){
        this.next = true;
      }else{
        this.next = false;
      }

      if(this.opHTMLTable.datatable.row(i).prev()){
        this.prev = true;
      }else{
        this.prev = false;
      }
    }

    datatableNextRow(){
      //datatable.row(this.selectedIndexes).next().data();
      var i = this.opHTMLTable.datatable.row('.selected').index();
      if(this.opHTMLTable.datatable.row(i).next()){
        //this.opHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.opHTMLTable.datatable.rows().deselect();
        this.opHTMLTable.datatable.row(i).next().select();
        this.selectedItemInfo();
        
        if(this.opHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }else{
        this.next = false;

        if(this.opHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }
    }

    datatablePrevRow(){
      //datatable.row(this.selectedIndexes).prev().data();
      var i = this.opHTMLTable.datatable.row('.selected').index();
      if(this.opHTMLTable.datatable.row(i).prev()){
        //this.opHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.opHTMLTable.datatable.rows().deselect();
        this.opHTMLTable.datatable.row(i).prev().select();
        this.selectedItemInfo();
        
        if(this.opHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }else{
        this.prev = false;

        if(this.opHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }
    }

    datatableDeselectMultipleSelectedItemForModification(){
      if(this.selectedIndexes.length > 1){
        var i = this.opHTMLTable.datatable.row('.selected').index();
        this.opHTMLTable.datatable.rows().deselect();
        this.opHTMLTable.datatable.row(i).select();
      }
    }

    selectedItemInfo(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.opHTMLTable.datatable.row('.selected').index();
      let data  = this.opHTMLTable.datatable.row(row).data();

      this.infos(data);
      this.initDatatableNextPrevRow();
        //this.selectedIndexes = [];
      //}else{
      //  alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      //}
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.opHTMLTable.datatable.row('.selected').index();
      let data  = this.opHTMLTable.datatable.row(row).data();

      this.modifier(data);

        //this.selectedIndexes = [];
      //}else{
       // alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      //}
    }
  
  
    async openRelationOp(ev: any/*, numeroOp*/) {
      const popover = await this.popoverController.create({
        component: RelationsOpComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'ops', "idOp": this.uneOp.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'personne') {
          this.presentPersonne(this.uneOp.id);
        }
  
      });
      return await popover.present();
    }

    async openRelationOpDepuisListe(ev: any/*, codePays*/) {
      const popover = await this.popoverController.create({
        component: RelationsOpComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'ops', "numeroOp": this.selectedIndexes[0]},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'personne') {
          this.presentPersonne(this.selectedIndexes[0]);
        } 
  
      });
      return await popover.present();
    }
  

    async openRelationOpDepuisTableau(ev: any/*, codePays*/) {
      let row  = this.opHTMLTable.datatable.row('.selected').index();
      let data  = this.opHTMLTable.datatable.row(row).data();
      const popover = await this.popoverController.create({
        component: RelationsOpComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'ops', "idOp": data.id},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'personne') {
          this.presentPersonne(this.selectedIndexes[0]);
        } 
  
      });
      return await popover.present();
    }

    async presentPersonne(idOp){
      const modal = await this.modalController.create({
        component: PersonnesPage,
        componentProps: {
          idModele: 'ops',  idOp: idOp },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    onSubmit(){
      let formData = this.opForm.value;
      let formioData = {};
      if(this.action === 'ajouter'){
        //créer un nouveau op
      
        let op: any = {
          //_id: 'fuma:op:'+data.numero,
          //id: formData.numero,
          type: 'op',
          pays: formData.idPays,
          region: formData.idRegion,
          departement: formData.idDepartement,
          commune: formData.idCommune,
          localite: formData.idSiege,
          union: formData.idUnion,
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

        op.security = this.servicePouchdb.garderCreationTrace(op.security);

        //ne pas sauvegarder les information relative à la fédération dans l'objet op
        //relation-pour va faire le mapping à travers la propriété union se trouvant dans l'objet op
        let doc = this.clone(op);
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
        delete doc.formData.idUnion;
        delete doc.formData.numeroUnion;
        delete doc.formData.nomUnion;
        delete doc.formData.idFederation;
        delete doc.formData.numeroFederation;
        delete doc.formData.nomFederation;

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let opData = {id: res.ops[0].id,...op.formData, ...op.formioData, ...op.security};
          //this.ops = op;
          this.translate.get('OP_PAGE.CHOIXNIVEAU.'+opData.niveau).subscribe((res2: string) => {
            opData.niveau = res2;
          });
          //op._rev = res.ops[0].rev;
          //this.ops.push(op);
          this.action = 'liste';
          //this.rechargerListeMobile = true;
          if(!this.mobile){
            //mode tableau, ajout d'un autre op dans la liste
            this.dataTableAddRow(opData)
          }else{
            //mobile, cache la liste des op pour mettre à jour la base de données
            this.opsData.push(opData);
            this.opsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.opsData = [...this.opsData];

            this.allOpsData.push(opData);
            this.allOpsData.sort((a, b) => {
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

          //initialiser la liste des ops
          //this.creerOp(opData.numeroOp);
          
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
        this.uneOpDoc.pays = formData.idPays;
        this.uneOpDoc.region = formData.idRegion;
        this.uneOpDoc.departement = formData.idDepartement;
        this.uneOpDoc.commune = formData.idCommune;
        this.uneOpDoc.localite = formData.idSiege;
        this.uneOpDoc.union = formData.idUnion;
        this.uneOpDoc.partenaire = formData.idFederation;
        this.uneOpDoc.formData = formData;
        this.uneOpDoc.formioData = formioData;

        //this.uneOp = opData;
        this.uneOpDoc.security.update_start = this.start;
        this.uneOpDoc.security.update_start = moment().toISOString();
        this.uneOpDoc.security = this.servicePouchdb.garderUpdateTrace(this.uneOpDoc.security);

        let doc = this.clone(this.uneOpDoc);
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
        delete doc.formData.idUnion;
        delete doc.formData.numeroUnion;
        delete doc.formData.nomUnion;
        delete doc.formData.idFederation;
        delete doc.formData.numeroFederation;
        delete doc.formData.nomFederation;

        this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
          //this.ops._rev = res.rev;
          //this.uneOpDoc._rev = res.rev;
          let opData = {id: this.uneOpDoc.id, ...this.uneOpDoc.formData, ...this.uneOpDoc.formioData, ...this.uneOpDoc.security};

          this.translate.get('OP_PAGE.CHOIXNIVEAU.'+opData.niveau).subscribe((res2: string) => {
            opData.niveau = res2;
          });

          this.action = 'infos';
          this.infos(opData);

          if(this.mobile){
            //mode liste
            //cache la liste pour le changement dans virtual Scroll
            //this.opsData = [...this.opsData];
            //mise à jour dans la liste
            for(let i = 0; i < this.opsData.length; i++){
              if(this.opsData[i].id == opData.id){
                this.opsData[i] = opData;
                break;
              }
            }

            this.opsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //mise à jour dans la liste cache
            for(let i = 0; i < this.allOpsData.length; i++){
              if(this.allOpsData[i].id == opData.id){
                this.allOpsData[i] = opData;
                break;
              }
            }

            this.allOpsData.sort((a, b) => {
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
            this.dataTableUpdateRow(opData);
          }

          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
          this.communeData = [];
          this.localiteData = [];
          this.uneOpDoc = null;

        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }
    }
  
  
    actualiserTableau(data){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#op').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.opHTMLTable = createDataTable("op", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.opHTMLTable = createDataTable("op", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.opHTMLTable = createDataTable("op", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.opHTMLTable = createDataTable("op", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.opHTMLTable.datatable);
          });
        }
      
    }
  
    doRefresh(event) {
      if(this.action != 'conflits'){
        if((this.idUnion && this.idUnion != '') || (this.idPartenaire && this.idPartenaire != '') || this.filtreOP){
          var deleted: any;
          var archived: any;
          var shared: any;
          var typePere, idPere;
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
          
          if(this.idUnion){
            typePere = 'union';
            idPere = this.idUnion;
          }else{
            typePere = 'partenaire';
            idPere = this.idPartenaire;
          }
          this.servicePouchdb.findRelationalDocOfTypeByPere('op', typePere, idPere, deleted, archived, shared).then((res) => {
            if(res && res.ops){
              //this.ops = [...ops];
              let opsData = [];
              //var datas = [];
              let federationIndex = [];
              let unionIndex = [];
              let paysIndex = [];
              let regionIndex = [];
              let departementIndex = [];
              let communeIndex = [];
              let localiteIndex = [];
              let idFederation, idUnion, idPays, idRegion, idDepartement, idCommune, idSiege;
              for(let u of res.ops){
                //supprimer l'historique de la liste
                if(this.filtreOP){
                  if((this.filtreOP.indexOf(u.id) === -1) && ((this.filtreUnions.indexOf(u.union) || u.formData.niveau == '3'))){
                    delete u.security['shared_history'];

                    this.translate.get('OP_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                      u.formData.niveau = res;
                    });
    
                    //charger la relation avec le partenaire si non niveaue
                    if(u.partenaire && u.partenaire != ''){
                      if(isDefined(federationIndex[u.partenaire])){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[federationIndex[u.partenaire]].formData.numero, 4);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[federationIndex[u.partenaire]].formData.nom, 5);
                        idFederation = res.partenaires[federationIndex[u.partenaire]].id;
                      }else{
                        for(let i=0; i < res.partenaires.length; i++){
                          if(res.partenaires[i].id == u.partenaire){
                            u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                            u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                            federationIndex[u.partenaire] = i;
                            idFederation =  res.partenaires[i].id;
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
    
                    if(u.union && u.union != ''){
                      if(isDefined(unionIndex[u.union])){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[unionIndex[u.union]].formData.numero, 6);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[unionIndex[u.union]].formData.nom, 7);
                        idUnion = res.unions[unionIndex[u.union]].id;
                      }else{
                        for(let i=0; i < res.unions.length; i++){
                          if(res.unions[i].id == u.union){
                            u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[i].formData.numero, 6);
                            u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[i].formData.nom, 7);
                            unionIndex[u.union] = i;
                            idUnion = res.unions[i].id;
                            break;
                          }
                        }
                      }  
                    }else{
                      //collone vide
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', null, 6);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', null, 7);
                      idUnion = null;
                    }
    
    
                    //chargement des relation des localités
                    if(isDefined(paysIndex[u.pays])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 9);
                      idPays = res.pays[paysIndex[u.pays]].id;
                    }else{
                      for(let i=0; i < res.pays.length; i++){
                        if(res.pays[i].id == u.pays){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 8);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 9);
                          idPays = res.pays[i].id;
                          paysIndex[u.pays] = i;
                          break;
                        }
                      }
                    }
    
                    if(isDefined(regionIndex[u.region])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 11);
                      idRegion = res.regions[regionIndex[u.region]].id;
                    }else{
                      for(let i=0; i < res.regions.length; i++){
                        if(res.regions[i].id == u.region){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 10);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 11);
                          regionIndex[u.region] = i;
                          idRegion = res.regions[i].id;
                          break;
                        }
                      }
                    }
                    
                    if(isDefined(departementIndex[u.departement])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 12);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 13);
                      idDepartement = res.departements[departementIndex[u.departement]].id;
                    }else{
                      for(let i=0; i < res.departements.length; i++){
                        if(res.departements[i].id == u.departement){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 12);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 13);
                          departementIndex[u.departement] = i;
                          idDepartement = res.departements[i].id;
                          break;
                        }
                      }
                    }
                    
    
                    if(isDefined(communeIndex[u.commune])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 14);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 15);
                      idCommune = res.communes[communeIndex[u.commune]].id;
                    }else{
                      for(let i=0; i < res.communes.length; i++){
                        if(res.communes[i].id == u.commune){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 14);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 15);
                          communeIndex[u.commune] = i;
                          idCommune = res.communes[i].id;
                          break;
                        }
                        }
                    }
    
                    if(isDefined(localiteIndex[u.localite])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 16);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 17);
                      idSiege = res.localites[localiteIndex[u.localite]].id;
                    }else{
                      for(let i=0; i < res.localites.length; i++){
                        if(res.localites[i].id == u.localite){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 16);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 17);
                          localiteIndex[u.localite] = i;
                          idSiege = res.localites[i].id;
                          break;
                        }
                      }
                    }
                    
    
                    opsData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});    
                  }
                }else{
                  delete u.security['shared_history'];

                  this.translate.get('OP_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                    u.formData.niveau = res;
                  });
  
                  //charger la relation avec le partenaire si non niveaue
                  if(u.partenaire && u.partenaire != ''){
                    if(isDefined(federationIndex[u.partenaire])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[federationIndex[u.partenaire]].formData.numero, 4);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[federationIndex[u.partenaire]].formData.nom, 5);
                      idFederation = res.partenaires[federationIndex[u.partenaire]].id;
                    }else{
                      for(let i=0; i < res.partenaires.length; i++){
                        if(res.partenaires[i].id == u.partenaire){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                          federationIndex[u.partenaire] = i;
                          idFederation =  res.partenaires[i].id;
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
  
                  if(u.union && u.union != ''){
                    if(isDefined(unionIndex[u.union])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[unionIndex[u.union]].formData.numero, 6);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[unionIndex[u.union]].formData.nom, 7);
                      idUnion = res.unions[unionIndex[u.union]].id;
                    }else{
                      for(let i=0; i < res.unions.length; i++){
                        if(res.unions[i].id == u.union){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[i].formData.numero, 6);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[i].formData.nom, 7);
                          unionIndex[u.union] = i;
                          idUnion = res.unions[i].id;
                          break;
                        }
                      }
                    }  
                  }else{
                    //collone vide
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', null, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', null, 7);
                    idUnion = null;
                  }
  
  
                  //chargement des relation des localités
                  if(isDefined(paysIndex[u.pays])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 9);
                    idPays = res.pays[paysIndex[u.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == u.pays){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 8);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 9);
                        idPays = res.pays[i].id;
                        paysIndex[u.pays] = i;
                        break;
                      }
                    }
                  }
  
                  if(isDefined(regionIndex[u.region])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 11);
                    idRegion = res.regions[regionIndex[u.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == u.region){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 10);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 11);
                        regionIndex[u.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }
                  
                  if(isDefined(departementIndex[u.departement])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 12);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 13);
                    idDepartement = res.departements[departementIndex[u.departement]].id;
                  }else{
                    for(let i=0; i < res.departements.length; i++){
                      if(res.departements[i].id == u.departement){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 12);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 13);
                        departementIndex[u.departement] = i;
                        idDepartement = res.departements[i].id;
                        break;
                      }
                    }
                  }
                  
  
                  if(isDefined(communeIndex[u.commune])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 14);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 15);
                    idCommune = res.communes[communeIndex[u.commune]].id;
                  }else{
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == u.commune){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 14);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 15);
                        communeIndex[u.commune] = i;
                        idCommune = res.communes[i].id;
                        break;
                      }
                      }
                  }
  
                  if(isDefined(localiteIndex[u.localite])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 16);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 17);
                    idSiege = res.localites[localiteIndex[u.localite]].id;
                  }else{
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == u.localite){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 16);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 17);
                        localiteIndex[u.localite] = i;
                        idSiege = res.localites[i].id;
                        break;
                      }
                    }
                  }
                  
  
                  opsData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});
  
                }
              }
  
              //this.opsData = [...datas];
    
              if(this.mobile){
                this.opsData = opsData;
                this.opsData.sort((a, b) => {
                  if (a.nom < b.nom) {
                    return -1;
                  }
                  if (a.nom > b.nom) {
                    return 1;
                  }
                  return 0;
                });
  
                this.allOpsData = [...this.opsData];
              } else{
                let expor = global.peutExporterDonnees;
                if(this.filtreOP){
                  expor = false;
                }

                $('#op-relation').ready(()=>{
                  if(global.langue == 'en'){
                    this.opHTMLTable = createDataTable("op-relation", this.colonnes, opsData, null, this.translate, expor);
                  }else{
                    this.opHTMLTable = createDataTable("op-relation", this.colonnes, opsData, global.dataTable_fr, this.translate, expor);
                  }
                  this.attacheEventToDataTable(this.opHTMLTable.datatable);
                });
              }
              if(event)
              event.target.complete();
            }else{
              this.ops = [];
              //if(this.mobile){
              this.opsData = [];
              this.allOpsData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            this.ops = [];
            this.opsData = [];
            this.selectedIndexes = [];
            if(event)
                event.target.complete();
            console.log(err)
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
  
          this.servicePouchdb.findRelationalDocByType('op', deleted, archived, shared).then((res) => {
            if(res && res.ops){
              let opsData = [];
                //var datas = [];
              let unionIndex = [];
              let federationIndex = [];
              let paysIndex = [];
              let regionIndex = [];
              let departementIndex = [];
              let communeIndex = [];
              let localiteIndex = [];
              let idFederation, idUnion, idPays, idRegion, idDepartement, idCommune, idSiege;
              for(let u of res.ops){
                //supprimer l'historique de la liste
                delete u.security['shared_history'];

                this.translate.get('OP_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                  u.formData.niveau = res;
                });

                //charger la relation avec le partenaire si non niveaue
                if(u.partenaire && u.partenaire != ''){
                  if(isDefined(federationIndex[u.partenaire])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[federationIndex[u.partenaire]].formData.numero, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[federationIndex[u.partenaire]].formData.nom, 5);
                    idFederation = res.partenaires[federationIndex[u.partenaire]].id;
                  }else{
                    for(let i=0; i < res.partenaires.length; i++){
                      if(res.partenaires[i].id == u.partenaire){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                        federationIndex[u.partenaire] = i;
                        idFederation =  res.partenaires[i].id;
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

                if(u.union && u.union != ''){
                  if(isDefined(unionIndex[u.union])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[unionIndex[u.union]].formData.numero, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[unionIndex[u.union]].formData.nom, 7);
                    idUnion = res.unions[unionIndex[u.union]].id;
                  }else{
                    for(let i=0; i < res.unions.length; i++){
                      if(res.unions[i].id == u.union){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[i].formData.numero, 6);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[i].formData.nom, 7);
                        unionIndex[u.union] = i;
                        idUnion = res.unions[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', null, 6);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', null, 7);
                  idUnion = null;
                }


                //chargement des relation des localités
                if(isDefined(paysIndex[u.pays])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 9);
                  idPays = res.pays[paysIndex[u.pays]].id;
                }else{
                  for(let i=0; i < res.pays.length; i++){
                    if(res.pays[i].id == u.pays){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 9);
                      idPays = res.pays[i].id;
                      paysIndex[u.pays] = i;
                      break;
                    }
                  }
                }

                if(isDefined(regionIndex[u.region])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 11);
                  idRegion = res.regions[regionIndex[u.region]].id;
                }else{
                  for(let i=0; i < res.regions.length; i++){
                    if(res.regions[i].id == u.region){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 11);
                      regionIndex[u.region] = i;
                      idRegion = res.regions[i].id;
                      break;
                    }
                  }
                }
                
                if(isDefined(departementIndex[u.departement])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 12);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 13);
                  idDepartement = res.departements[departementIndex[u.departement]].id;
                }else{
                  for(let i=0; i < res.departements.length; i++){
                    if(res.departements[i].id == u.departement){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 12);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 13);
                      departementIndex[u.departement] = i;
                      idDepartement = res.departements[i].id;
                      break;
                    }
                  }
                }
                

                if(isDefined(communeIndex[u.commune])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 14);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 15);
                  idCommune = res.communes[communeIndex[u.commune]].id;
                }else{
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == u.commune){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 14);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 15);
                      communeIndex[u.commune] = i;
                      idCommune = res.communes[i].id;
                      break;
                    }
                    }
                }

                if(isDefined(localiteIndex[u.localite])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 16);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 17);
                  idSiege = res.localites[localiteIndex[u.localite]].id;
                }else{
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == u.localite){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 16);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 17);
                      localiteIndex[u.localite] = i;
                      idSiege = res.localites[i].id;
                      break;
                    }
                  }
                }
                

                opsData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});
              }
  
                //si mobile
            if(this.mobile){
              this.opsData = opsData;
              this.opsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              this.allOpsData = [...this.opsData]
            } else{
                $('#op').ready(()=>{
                  if(global.langue == 'en'){
                    this.opHTMLTable = createDataTable("op", this.colonnes, opsData, null, this.translate, global.peutExporterDonnees);
                  }else{
                    this.opHTMLTable = createDataTable("op", this.colonnes, opsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.opHTMLTable.datatable);
                });
              }
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }else{
              this.ops = [];
              //if(this.mobile){
                this.opsData = [];
                this.allOpsData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            console.log('Erreur acces à la op ==> '+err)
            this.ops = [];
            //if(this.mobile){
              this.opsData = [];
              this.allOpsData = [];
            //}
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          });  
        }
      }else{
        this.getOpWithConflicts(event);
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
  
    getOp(){
      //tous les departements
      if(this.idOp && this.idOp != ''){
        this.servicePouchdb.findRelationalDocByID('op', this.idOp).then((res) => {
          if(res && res.ops[0]){
            let f, u;
            //this.uneOp = res && res.ops[0];
            this.translate.get('OP_PAGE.CHOIXNIVEAU.'+res.ops[0].formData.niveau).subscribe((res2: string) => {
              res.ops[0].formData.niveau = res2;
            });

            if(res.partenaires && res.partenaires[0]){
              res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'numeroFederation', res.partenaires[0].formData.numero, 4);
              res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'nomFederation', res.partenaires[0].formData.nom, 5);  
              f = res.partenaires[0].id;
            }else{
              res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'numeroFederation', null, 4);
              res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'nomFederation', null, 5);
              f = null;
            }
            
            if(res.unions && res.unions[0]){
              res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'numeroUnion', res.unions[0].formData.numero, 6);
              res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'nomUnion', res.unions[0].formData.nom, 7); 
              u = res.unions[0].id; 
            }else{
              res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'numeroUnion', null, 6);
              res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'nomUnion', null, 7);
              u = null;
            }

            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'nomPays', res.pays[0].formData.nom, 8); 
            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'codePays', res.pays[0].formData.code, 9);   
            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'nomRegion', res.regions[0].formData.nom, 10); 
            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'codeRegion', res.regions[0].formData.code, 11);   
            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'nomDepartement', res.departements[0].formData.nom, 12);
            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'codeDepartement', res.departements[0].formData.code, 13);  
            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'nomCommune', res.communes[0].formData.nom, 14);  
            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'codeCommune', res.communes[0].formData.code, 15);   
            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'nomSiege', res.localites[0].formData.nom, 16);  
            res.ops[0].formData = this.addItemToObjectAtSpecificPosition(res.ops[0].formData, 'codeSiege', res.localites[0].formData.code, 17);   
            
            this.infos({id: res.partenaires[0].id, idFederation: f, idUnion: u, idPays: res.pays[0].id, idRegion: res.regions[0].id, idDepartement: res.departements[0].id, idCommune: res.communes[0].id, idSiege: res.localites[0].id, ...res.ops[0].formData}); 
          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
            this.close();
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          console.log(err)
          this.close();
        });
      }else if((this.idUnion && this.idUnion != '') || (this.idPartenaire && this.idPartenaire != '') || this.filtreOP){
        var deleted: any;
        var archived: any;
        var shared: any;
        var typePere, idPere;
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
        
        if(this.idUnion){
          typePere = 'union';
          idPere = this.idUnion;
        }else{
          typePere = 'partenaire';
          idPere = this.idPartenaire;
        }
        this.servicePouchdb.findRelationalDocOfTypeByPere('op', typePere, idPere, deleted, archived, shared).then((res) => {
          if(res && res.ops){
            //this.ops = [...ops];
            let opsData = [];
            //var datas = [];
            let federationIndex = [];
            let unionIndex = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let localiteIndex = [];
            let idFederation, idUnion, idPays, idRegion, idDepartement, idCommune, idSiege;
            for(let u of res.ops){
              //supprimer l'historique de la liste
              if(this.filtreOP){
                if((this.filtreOP.indexOf(u.id) === -1) && ((this.filtreUnions.indexOf(u.union) || u.formData.niveau == '3'))){
                  delete u.security['shared_history'];

                  this.translate.get('OP_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                    u.formData.niveau = res;
                  });
    
                  //charger la relation avec le partenaire si non niveaue
                  if(u.partenaire && u.partenaire != ''){
                    if(isDefined(federationIndex[u.partenaire])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[federationIndex[u.partenaire]].formData.numero, 4);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[federationIndex[u.partenaire]].formData.nom, 5);
                      idFederation = res.partenaires[federationIndex[u.partenaire]].id;
                    }else{
                      for(let i=0; i < res.partenaires.length; i++){
                        if(res.partenaires[i].id == u.partenaire){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                          federationIndex[u.partenaire] = i;
                          idFederation =  res.partenaires[i].id;
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
    
                  if(u.union && u.union != ''){
                    if(isDefined(unionIndex[u.union])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[unionIndex[u.union]].formData.numero, 6);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[unionIndex[u.union]].formData.nom, 7);
                      idUnion = res.unions[unionIndex[u.union]].id;
                    }else{
                      for(let i=0; i < res.unions.length; i++){
                        if(res.unions[i].id == u.union){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[i].formData.numero, 6);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[i].formData.nom, 7);
                          unionIndex[u.union] = i;
                          idUnion = res.unions[i].id;
                          break;
                        }
                      }
                    }  
                  }else{
                    //collone vide
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', null, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', null, 7);
                    idUnion = null;
                  }
    
    
                  //chargement des relation des localités
                  if(isDefined(paysIndex[u.pays])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 9);
                    idPays = res.pays[paysIndex[u.pays]].id;
                  }else{
                    for(let i=0; i < res.pays.length; i++){
                      if(res.pays[i].id == u.pays){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 8);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 9);
                        idPays = res.pays[i].id;
                        paysIndex[u.pays] = i;
                        break;
                      }
                    }
                  }
    
                  if(isDefined(regionIndex[u.region])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 11);
                    idRegion = res.regions[regionIndex[u.region]].id;
                  }else{
                    for(let i=0; i < res.regions.length; i++){
                      if(res.regions[i].id == u.region){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 10);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 11);
                        regionIndex[u.region] = i;
                        idRegion = res.regions[i].id;
                        break;
                      }
                    }
                  }
                  
                  if(isDefined(departementIndex[u.departement])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 12);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 13);
                    idDepartement = res.departements[departementIndex[u.departement]].id;
                  }else{
                    for(let i=0; i < res.departements.length; i++){
                      if(res.departements[i].id == u.departement){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 12);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 13);
                        departementIndex[u.departement] = i;
                        idDepartement = res.departements[i].id;
                        break;
                      }
                    }
                  }
                  
    
                  if(isDefined(communeIndex[u.commune])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 14);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 15);
                    idCommune = res.communes[communeIndex[u.commune]].id;
                  }else{
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == u.commune){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 14);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 15);
                        communeIndex[u.commune] = i;
                        idCommune = res.communes[i].id;
                        break;
                      }
                      }
                  }
    
                  if(isDefined(localiteIndex[u.localite])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 16);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 17);
                    idSiege = res.localites[localiteIndex[u.localite]].id;
                  }else{
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == u.localite){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 16);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 17);
                        localiteIndex[u.localite] = i;
                        idSiege = res.localites[i].id;
                        break;
                      }
                    }
                  }
                  
    
                  opsData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});    
                }
              }else{
                delete u.security['shared_history'];

                this.translate.get('OP_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                  u.formData.niveau = res;
                });
  
                //charger la relation avec le partenaire si non niveaue
                if(u.partenaire && u.partenaire != ''){
                  if(isDefined(federationIndex[u.partenaire])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[federationIndex[u.partenaire]].formData.numero, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[federationIndex[u.partenaire]].formData.nom, 5);
                    idFederation = res.partenaires[federationIndex[u.partenaire]].id;
                  }else{
                    for(let i=0; i < res.partenaires.length; i++){
                      if(res.partenaires[i].id == u.partenaire){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                        federationIndex[u.partenaire] = i;
                        idFederation =  res.partenaires[i].id;
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
  
                if(u.union && u.union != ''){
                  if(isDefined(unionIndex[u.union])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[unionIndex[u.union]].formData.numero, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[unionIndex[u.union]].formData.nom, 7);
                    idUnion = res.unions[unionIndex[u.union]].id;
                  }else{
                    for(let i=0; i < res.unions.length; i++){
                      if(res.unions[i].id == u.union){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[i].formData.numero, 6);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[i].formData.nom, 7);
                        unionIndex[u.union] = i;
                        idUnion = res.unions[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', null, 6);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', null, 7);
                  idUnion = null;
                }
  
  
                //chargement des relation des localités
                if(isDefined(paysIndex[u.pays])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 9);
                  idPays = res.pays[paysIndex[u.pays]].id;
                }else{
                  for(let i=0; i < res.pays.length; i++){
                    if(res.pays[i].id == u.pays){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 9);
                      idPays = res.pays[i].id;
                      paysIndex[u.pays] = i;
                      break;
                    }
                  }
                }
  
                if(isDefined(regionIndex[u.region])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 11);
                  idRegion = res.regions[regionIndex[u.region]].id;
                }else{
                  for(let i=0; i < res.regions.length; i++){
                    if(res.regions[i].id == u.region){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 11);
                      regionIndex[u.region] = i;
                      idRegion = res.regions[i].id;
                      break;
                    }
                  }
                }
                
                if(isDefined(departementIndex[u.departement])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 12);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 13);
                  idDepartement = res.departements[departementIndex[u.departement]].id;
                }else{
                  for(let i=0; i < res.departements.length; i++){
                    if(res.departements[i].id == u.departement){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 12);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 13);
                      departementIndex[u.departement] = i;
                      idDepartement = res.departements[i].id;
                      break;
                    }
                  }
                }
                
  
                if(isDefined(communeIndex[u.commune])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 14);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 15);
                  idCommune = res.communes[communeIndex[u.commune]].id;
                }else{
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == u.commune){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 14);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 15);
                      communeIndex[u.commune] = i;
                      idCommune = res.communes[i].id;
                      break;
                    }
                    }
                }
  
                if(isDefined(localiteIndex[u.localite])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 16);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 17);
                  idSiege = res.localites[localiteIndex[u.localite]].id;
                }else{
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == u.localite){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 16);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 17);
                      localiteIndex[u.localite] = i;
                      idSiege = res.localites[i].id;
                      break;
                    }
                  }
                }
                
  
                opsData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});  
              }
            }

            //this.opsData = [...datas]; 
  
            if(this.mobile){
              this.opsData = opsData;
              this.opsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allOpsData = [...this.opsData];
            } else{
              let expor = global.peutExporterDonnees;
              if(this.filtreOP){
                expor = false;
              }

              $('#op-relation').ready(()=>{
                if(global.langue == 'en'){
                  this.opHTMLTable = createDataTable("op-relation", this.colonnes, opsData, null, this.translate, expor);
                }else{
                  this.opHTMLTable = createDataTable("op-relation", this.colonnes, opsData, global.dataTable_fr, this.translate, expor);
                }
                this.attacheEventToDataTable(this.opHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.ops = [];
          this.opsData = [];
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
        this.servicePouchdb.findRelationalDocByType('op', deleted, archived, shared).then((res) => {
          // console.log(res)
          if(res && res.ops){
            //this.ops = [...ops];
            let opsData = [];
            //var datas = [];
            let unionIndex = [];
            let federationIndex = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let localiteIndex = [];
            let idFederation, idUnion, idPays, idRegion, idDepartement, idCommune, idSiege;
            for(let u of res.ops){
              //supprimer l'historique de la liste
              delete u.security['shared_history'];

              this.translate.get('OP_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                u.formData.niveau = res;
              });

              //charger la relation avec le partenaire si non niveaue
              if(u.partenaire && u.partenaire != ''){
                if(isDefined(federationIndex[u.partenaire])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[federationIndex[u.partenaire]].formData.numero, 4);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[federationIndex[u.partenaire]].formData.nom, 5);
                  idFederation = res.partenaires[federationIndex[u.partenaire]].id;
                }else{
                  for(let i=0; i < res.partenaires.length; i++){
                    if(res.partenaires[i].id == u.partenaire){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroFederation', res.partenaires[i].formData.numero, 4);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomFederation', res.partenaires[i].formData.nom, 5);
                      federationIndex[u.partenaire] = i;
                      idFederation =  res.partenaires[i].id;
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

              if(u.union && u.union != ''){
                if(isDefined(unionIndex[u.union])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[unionIndex[u.union]].formData.numero, 6);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[unionIndex[u.union]].formData.nom, 7);
                  idUnion = res.unions[unionIndex[u.union]].id;
                }else{
                  for(let i=0; i < res.unions.length; i++){
                    if(res.unions[i].id == u.union){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', res.unions[i].formData.numero, 6);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', res.unions[i].formData.nom, 7);
                      unionIndex[u.union] = i;
                      idUnion = res.unions[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroUnion', null, 6);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomUnion', null, 7);
                idUnion = null;
              }


              //chargement des relation des localités
              if(isDefined(paysIndex[u.pays])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 8);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 9);
                idPays = res.pays[paysIndex[u.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == u.pays){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 9);
                    idPays = res.pays[i].id;
                    paysIndex[u.pays] = i;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[u.region])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 10);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 11);
                idRegion = res.regions[regionIndex[u.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == u.region){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 11);
                    regionIndex[u.region] = i;
                    idRegion = res.regions[i].id;
                    break;
                  }
                }
              }
              
              if(isDefined(departementIndex[u.departement])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 12);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 13);
                idDepartement = res.departements[departementIndex[u.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == u.departement){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 12);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 13);
                    departementIndex[u.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }
              

              if(isDefined(communeIndex[u.commune])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 14);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 15);
                idCommune = res.communes[communeIndex[u.commune]].id;
              }else{
                for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == u.commune){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 14);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 15);
                    communeIndex[u.commune] = i;
                    idCommune = res.communes[i].id;
                    break;
                  }
                  }
              }

              if(isDefined(localiteIndex[u.localite])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[localiteIndex[u.localite]].formData.nom, 16);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[localiteIndex[u.localite]].formData.code, 17);
                idSiege = res.localites[localiteIndex[u.localite]].id;
              }else{
                for(let i=0; i < res.localites.length; i++){
                  if(res.localites[i].id == u.localite){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomSiege', res.localites[i].formData.nom, 16);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeSiege', res.localites[i].formData.code, 17);
                    localiteIndex[u.localite] = i;
                    idSiege = res.localites[i].id;
                    break;
                  }
                }
              }
              

              opsData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idSiege: idSiege, ...u.formData, ...u.formioData, ...u.security});
            }

            //this.opsData = [...datas];
  
            //console.log(opsData)
            if(this.mobile){
              this.opsData = opsData;
              this.opsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allOpsData = [...this.opsData];
            } else{
              $('#op').ready(()=>{
                if(global.langue == 'en'){
                  this.opHTMLTable = createDataTable("op", this.colonnes, opsData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.opHTMLTable = createDataTable("op", this.colonnes, opsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.opHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.ops = [];
          this.opsData = [];
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
            this.setSelect2DefaultValue('idPays', this.uneOp.idPays);
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
            this.setSelect2DefaultValue('idRegion', this.uneOp.idRegion);
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
            this.setSelect2DefaultValue('idDepartement', this.uneOp.idDepartement);
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
            this.setSelect2DefaultValue('idCommune', this.uneOp.idCommune);
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
            this.setSelect2DefaultValue('idSiege', this.uneOp.idSiege);
          }
        }
      }).catch((e) => {
        console.log('vilage commune erreur: '+e);
        this.localiteData = [];
      });
    }

    
    getFederation(){
      this.federationData = [];
      let monInstitution;
      this.servicePouchdb.findRelationalDocByTypeAndDeleted('partenaire', false).then((res) => {
        if(res && res.partenaires){
          //this.partenaires = [...partenaires];
          
          //var datas = [];
          for(let f of res.partenaires){
            if(f.formData.categorie == '1'){
              this.federationData.push({id: f.id, numero: f.formData.numero, nom: f.formData.nom});
              
              if(!this.doModification && !this.idPartenaire && f.formData.monInstitution && !monInstitution){
                monInstitution = f.id;
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

          //this.federationData.push({numero: null, nom: 'Indépendant'});

          if(this.doModification){
            this.setSelect2DefaultValue('idFederation', this.uneOp.idFederation);
          }else if(this.idPartenaire){
            this.setSelect2DefaultValue('idFederation', this.idPartenaire);

            $('#idFederation select').ready(()=>{
              $('#idFederation select').attr('disabled', true)
            });
          }else{
            this.setSelect2DefaultValue('idFederation', monInstitution);
          }
          
        }
      }).catch((err) => {
        this.federationData = [];
        console.log(err)
      });
    }


    getUnionParFederation(idFederation){
      this.unionData = [];
      if(idFederation && idFederation != ''){
        this.servicePouchdb.findRelationalDocHasMany('union', 'partenaire', idFederation).then((res) => {
          if(res && res.unions){
            //this.unions = [...unions];
            //var datas = [];
            for(let u of res.unions){
              if(!u.security.deleted){
                this.unionData.push({id: u.id, numero: u.formData.numero, nom: u.formData.nom});
              }
            }
  
            this.unionData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            if(this.doModification){
              this.setSelect2DefaultValue('idUnion', this.uneOp.idUnion);
            }else if(this.idUnion){
              this.setSelect2DefaultValue('idUnion', this.idUnion);
              
              $('#idUnion select').ready(()=>{
                $('#idUnion select').attr('disabled', true)
              });
            }
            
          }
        }).catch((err) => {
          this.unionData = [];
          console.log(err)
        });
      }else{
        //get les unions indépendantes
        this.servicePouchdb.findRelationalDocByTypeNiveauAndDeleted('union', '2', false).then((res) => {
          if(res && res.unions){
            //this.unions = [...unions];
            this.unionData = [];
            //var datas = [];
            for(let u of res.unions){
              //if(f.data.formData.categorie == 'Fédération'){
                this.unionData.push({id: u.id, numero: u.formData.numero, nom: u.formData.nom});
              //}
            }
  
            this.unionData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            if(this.doModification){
              this.setSelect2DefaultValue('idUnion', this.uneOp.idUnion);
            }else if(this.idUnion){
              this.setSelect2DefaultValue('idUnion', this.idUnion);
              $('#idUnion select').ready(()=>{
                $('#idUnion select').attr('disabled', true)
              });
            }
            
          }
        }).catch((err) => {
          this.unionData = [];
          console.log(err)
        });
      }
      
    }

    setCodeAndNomPays(idPays){
      if(idPays && idPays != ''){
        for(let p of this.paysData){
          if(idPays == p.id){
            this.opForm.controls.codePays.setValue(p.code);
            this.opForm.controls.nomPays.setValue(p.nom);

            this.opForm.controls.idRegion.setValue(null);
            this.opForm.controls.codeRegion.setValue(null);
            this.opForm.controls.nomRegion.setValue(null);

            this.departementData = [];
            this.opForm.controls.idDepartement.setValue(null);
            this.opForm.controls.codeDepartement.setValue(null);
            this.opForm.controls.nomDepartement.setValue(null);

            this.communeData = [];
            this.opForm.controls.idCommune.setValue(null);
            this.opForm.controls.codeCommune.setValue(null);
            this.opForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.opForm.controls.idSiege.setValue(null);
            this.opForm.controls.codeSiege.setValue(null);
            this.opForm.controls.nomSiege.setValue(null);

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
            this.opForm.controls.codeRegion.setValue(r.code);
            this.opForm.controls.nomRegion.setValue(r.nom);

            this.opForm.controls.idDepartement.setValue(null);
            this.opForm.controls.codeDepartement.setValue(null);
            this.opForm.controls.nomDepartement.setValue(null);

            this.communeData = [];
            this.opForm.controls.idCommune.setValue(null);
            this.opForm.controls.codeCommune.setValue(null);
            this.opForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.opForm.controls.idSiege.setValue(null);
            this.opForm.controls.codeSiege.setValue(null);
            this.opForm.controls.nomSiege.setValue(null);

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
            this.opForm.controls.codeDepartement.setValue(d.code);
            this.opForm.controls.nomDepartement.setValue(d.nom);

            this.opForm.controls.idCommune.setValue(null);
            this.opForm.controls.codeCommune.setValue(null);
            this.opForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.opForm.controls.idSiege.setValue(null);
            this.opForm.controls.codeSiege.setValue(null);
            this.opForm.controls.nomSiege.setValue(null);

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
            this.opForm.controls.codeCommune.setValue(c.code);
            this.opForm.controls.nomCommune.setValue(c.nom);
            
            this.opForm.controls.idSiege.setValue(null);
            this.opForm.controls.codeSiege.setValue(null);
            this.opForm.controls.nomSiege.setValue(null);
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
            this.opForm.controls.codeSiege.setValue(l.code);
            this.opForm.controls.nomSiege.setValue(l.nom);
            break;
          }
        }
      }
    }

    setNumeroAndNomFederation(idFederation){
      if(idFederation && idFederation != ''){
        for(let f of this.federationData){
          if(idFederation == f.id){
            this.opForm.controls.numeroFederation.setValue(f.numero);
            this.opForm.controls.nomFederation.setValue(f.nom);

            this.opForm.controls.idUnion.setValue(null);
            this.opForm.controls.numeroUnion.setValue(null);
            this.opForm.controls.nomUnion.setValue(null);
            //console.log(numeroFederation)
            this.getUnionParFederation(idFederation)
            break;
          }
        }
      }else{
        this.opForm.controls.numeroFederation.setValue(null);
        this.opForm.controls.nomFederation.setValue(null);

        this.opForm.controls.numeroUnion.setValue(null);
        this.opForm.controls.nomUnion.setValue(null);
        this.getUnionParFederation(idFederation)
      }
    }

    setNumeroAndNomUnion(idUnion){
      if(idUnion && idUnion != ''){
        for(let u of this.unionData){
          if(idUnion == u.id){
            this.opForm.controls.numeroUnion.setValue(u.numero);
            this.opForm.controls.nomUnion.setValue(u.nom);
            break;
          }
        }
      }else{
        this.opForm.controls.nomUnion.setValue(null);
        this.opForm.controls.numeroUnion.setValue(null);
      }
    }
  
    setIDCodeEtNomPays(paysData){
      this.opForm.controls.idPays.setValue(paysData.id);
      this.opForm.controls.codePays.setValue(paysData.code);
      this.opForm.controls.nomPays.setValue(paysData.nom);
    }

    setIDCodeEtNomRegion(regionData){
      this.opForm.controls.idRegion.setValue(regionData.id);
      this.opForm.controls.codeRegion.setValue(regionData.code);
      this.opForm.controls.nomRegion.setValue(regionData.nom);
    }

    setIDCodeEtNomDepartement(departementData){
      this.opForm.controls.idDepartement.setValue(departementData.id);
      this.opForm.controls.codeDepartement.setValue(departementData.code);
      this.opForm.controls.nomDepartement.setValue(departementData.nom);
    }

    setIDCodeEtNomCommune(communeData){
      this.opForm.controls.idCommune.setValue(communeData.id);
      this.opForm.controls.codeCommune.setValue(communeData.code);
      this.opForm.controls.nomCommune.setValue(communeData.nom);
    }

    setIDCodeEtNomLocalite(localiteData){
      this.opForm.controls.idSiege.setValue(localiteData.id);
      this.opForm.controls.codeSiege.setValue(localiteData.code);
      this.opForm.controls.nomSiege.setValue(localiteData.nom);
    }



    attacheEventToDataTable(datatable){
      var self = this;
      var id = 'op-datatable';
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
        console.log(this.opHTMLTable.datatable.row(this).data());
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
        id = 'op-pays-datatable';
      }else{ 
        id = 'op-datatable';
      }


      $('#'+id+' thead tr:eq(0) th:eq(0)').html(this.translate.instant('PAYS_PAGE.CODEPAYS'));
      //$('#'+id+' thead tr:eq(0) th:eq(0)').attr({'title': this.translate.instant('PAYS_PAGE.CODEPAYS')});
      $('#'+id+' thead tr:eq(0) th:eq(1)').html(this.translate.instant('PAYS_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(2)').html(this.translate.instant('REGION_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(3)').html(this.translate.instant('REGION_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(6)').html(this.translate.instant('DEPARTEMENT_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(7)').html(this.translate.instant('DEPARTEMENT_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(8)').html(this.translate.instant('COMMUNE_PAGE.CODE'));    
      $('#'+id+' thead tr:eq(0) th:eq(9)').html(this.translate.instant('COMMUNE_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(10)').html(this.translate.instant('OP_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(11)').html(this.translate.instant('OP_PAGE.NUMERO'));
      $('#'+id+' thead tr:eq(0) th:eq(12)').html(this.translate.instant('OP_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(13)').html(this.translate.instant('OP_PAGE.NIVEAU'));
      $('#'+id+' thead tr:eq(0) th:eq(14)').html(this.translate.instant('OP_PAGE.AUTRETYPE'));
      $('#'+id+' thead tr:eq(0) th:eq(15)').html(this.translate.instant('GENERAL.LATITUDE'));
      $('#'+id+' thead tr:eq(0) th:eq(16)').html(this.translate.instant('GENERAL.LONGITUDE'));
      */
      //$('#pays-datatable thead tr:eq(1) th:eq(0) input').attr("placeholder", this.translate.instant('GENERAL.RECHERCHER'));
    }

  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
      //numéro op
      this.translate.get('OP_PAGE.MESSAGES_VALIDATION.NUMERO.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numero[0].message = res;
      });
      
      this.translate.get('OP_PAGE.MESSAGES_VALIDATION.NUMERO.UNIQUENUMEROPARTENAIRE').subscribe((res: string) => {
        this.messages_validation.numero[1].message = res;
      });
  
      //nom op
      this.translate.get('OP_PAGE.MESSAGES_VALIDATION.NOM.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });

       //niveau
       this.translate.get('OP_PAGE.MESSAGES_VALIDATION.NIVEAU.REQUIRED').subscribe((res: string) => {
        this.messages_validation.niveau[0].message = res;
      });

       //numero fédération
       this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.NUMERO_FEDERATION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idFederation[0].message = res;
      });

      //numero union
       this.translate.get('OP_PAGE.MESSAGES_VALIDATION.NUMERO_UNION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idUnion[0].message = res;
      });


      //autre type domaine
      /*this.translate.get('OP_PAGE.MESSAGES_VALIDATION.DOMAINE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.domaine[0].message = res;
      });*/

      //code pays
      this.translate.get('OP_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPays[0].message = res;
      });


      //code région
      this.translate.get('OP_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idRegion[0].message = res;
      });

       //code département
       this.translate.get('OP_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idDepartement[0].message = res;
      });

      //code commune
      this.translate.get('OP_PAGE.MESSAGES_VALIDATION.CODECOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idCommune[0].message = res;
      });

      //code localité
      this.translate.get('OP_PAGE.MESSAGES_VALIDATION.CODESIEGE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idSiege[0].message = res;
      });
    }
  
    
    dataTableAddRow(rowData){

      $('#op-dataTable').ready(() => {
        this.opHTMLTable.datatable.row.add(rowData).draw();
      });
      
    }
  
    dataTableUpdateRow(/*index, */rowData){

      $('#op-dataTable').ready(() => {
        this.opHTMLTable.datatable.row('.selected').data(rowData).draw();
      });
      
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      $('#op-dataTable').ready(() => {
        this.opHTMLTable.datatable.rows('.selected').remove().draw();
      });

    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.opHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.opHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.opHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    if(this.opHTMLTable && this.opHTMLTable.datatable){
      //var id = 'op-datatable';

      var self = this;
      //$('#'+id+' thead tr:eq(1)').show();

      //$(self.opHTMLTable.datatable.table().header() ).children(1).show();
      $(self.opHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
      this.recherchePlus = true;
    }
  }

  dataTableRemoveRechercheParColonne(){
    //var id = 'op-datatable';
    var self = this;

    //$('#'+id+' thead tr:eq(1)').hide();
    //$(self.opHTMLTable.datatable.table().header() ).children(1).hide();
    $(self.opHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'op-datatable';
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
      $( self.opHTMLTable.datatable.table().footer() ).show();
      this.opHTMLTable.datatable.columns().every( function () {
          i = i +1;
          //console.log("data-header=" +$(self.opHTMLTable.datatable.table().header()).children(0).children(0)[1].firstChild.nodeValue)
          var column = this;
          //console.log($(column.header())[0].firstChild.nodeValue)
          var select = $('<select id="'+id+i+'" data-header="'+$(column.header())[0].firstChild.nodeValue+'" placeholder="'+self.translate.instant('GENERAL.FILTRER')+'" class="form-control form-control-sm" multiple data-language="'+lang+'" data-selected-text-format="count" data-width="100%" data-live-search="true" data-size="7" data-actions-box="true" data-container="body"></select>')
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
                  
                  var info = self.opHTMLTable.datatable.page.info();
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
          /*$( self.opHTMLTable.datatable.table().footer() ).children(0).each( function (i) {
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

      this.opHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
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
      $( self.opHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }

  dataTableRemoveCustomFiltre(){
    var id = 'op-datatable';
    var self = this;
    //$('#'+id+' tfoot').hide();
    $( self.opHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }


    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        ///let u = [...this.opsData]
        this.opsData = this.allOpsData.filter((item) => {
          return item.numero.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || item.niveau.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.opData = temp;
      
    }
    
    /*async close(){
      await this.modalController.dismiss();
    }*/

    async close(){
      await this.modalController.dismiss({filtreOP: this.filtreOP});
    }

    async valider() {
      //this.filtreOP = [];
      this.filtreOP = this.filtreOP.concat(this.selectedIndexes);

      await this.modalController.dismiss({filtreOP: this.filtreOP});
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
