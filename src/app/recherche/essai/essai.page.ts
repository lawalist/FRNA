import { Component, OnInit, Input  } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { global } from '../../../app/globale/variable';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { DatatableMoreComponent } from 'src/app/component/datatable-more/datatable-more.component';
import { DatatableConstructComponent } from 'src/app/component/datatable-construct/datatable-construct.component';
import { SelectionComponent } from 'src/app/component/selection/selection.component';
import { DerniereModificationComponent } from 'src/app/component/derniere-modification/derniere-modification.component';
import { ListeMoreComponent } from 'src/app/component/liste-more/liste-more.component';
import { ListeActionComponent } from 'src/app/component/liste-action/liste-action.component';
import { isObject } from 'util';
import { ProjetPage } from '../projet/projet.page';
import { isDefined } from '@angular/compiler/src/util';
import { PartenairePage } from '../../institution/partenaire/partenaire.page';
import * as moment from 'moment';
import { ProtocolePage } from '../protocole/protocole.page';

import {customAlphabet} from 'nanoid';
import { PersonnesPage } from 'src/app/institution/personnes/personnes.page';
import { ChampPage } from 'src/app/institution/champ/champ.page';
//Speed: 1000 IDs per hour/second
//~4 million years needed, in order to have a 1% probability of at least one collision.
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 16)
import * as keys from 'all-object-keys';
import { LocalitePage } from 'src/app/localite/localite/localite.page';
import { CommunePage } from 'src/app/localite/commune/commune.page';
import { DepartementPage } from 'src/app/localite/departement/departement.page';
import { RegionPage } from 'src/app/localite/region/region.page';
import { PaysPage } from 'src/app/localite/pays/pays.page';
var keysInObject = require('keys-in-object');

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
//declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;
declare var Formio;

@Component({
  selector: 'app-essai',
  templateUrl: './essai.page.html',
  styleUrls: ['./essai.page.scss'],
})
export class EssaiPage implements OnInit {

  @Input() idEssai: string;
  @Input() idPersonne: string;
  @Input() idPartenaire: string;
  @Input() idProjet: string;
  @Input() idProtocole: string;
  @Input() idChamp: string;
  @Input() idPays: string;
  @Input() idRegion: string;
  @Input() idDepartement: string;
  @Input() idCommune: string;
  @Input() idLocalite: string;
  @Input() idUnion: string;
  @Input() idOp: string;

  global = global;
  start: any;
  loading: boolean = false;
  moment = moment;
  essaiForm: FormGroup;
  action: string = 'liste';
  cacheAction: string = 'liste';
  essais: any = [];
  essaisData: any = [];
  allEssaisData: any = [];
  institutionData: any = [];
  projetData: any = [];
  protocoleData: any = [];
  personneData: any = [];
  champData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  communeData: any = [];
  localiteData: any = [];
  formulaireData: any = [];
  unionData: any = [];
  opData: any = [];
  secteurs = ['Privé', 'Etat', 'Sémi-privé'];
  domaines = ['Agronamie', 'Santé', 'Environement', 'Gouvernement'];
  unEssai: any;
  unEssaiDoc: any;
  essaiHTMLTable: any;
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
  formioForms = [];
  formioFormsData: any = {};
  hideData = false;
  init = false;
  selectedProtocoleID: any = null;
  formKeys: any = [];

  nbEtapes = 2;
  etapeCourante = 1;
  rev = 0;

  selectProjetData: any = [];
  selectProtocoleData: any = [];

tmpColonnes = ['numero', 'nomProjet', 'nomProtocole', 'dateCollecte', 'niveauCollecte', 'matriculePersonne', 'nomPersonne', 'prenomPersonne', 'nomUnion', 'numeroUnion', 'nomOP', 'numeroOP', 'nomChamp', 'nomSite', 'codeSite', 'nomLocalite', 'codeLocalite']
  colonnes = [];

  messages_validation = {
    'idInstitution': [
      { type: 'required', message: '' }
    ],
    'idProjet': [
      { type: 'required', message: '' }
    ],
    'idProtocole': [
      { type: 'required', message: '' }
    ],
    'idPersonne': [
      { type: 'required', message: '' }
    ],
    'idChamp': [
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
    'idLocalite': [
      { type: 'required', message: '' }
    ],'idUnion': [
      { type: 'required', message: '' }
    ],
    'idOp': [
      { type: 'required', message: '' }
    ]
  }

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la essai est en mode modal, on chercher info region
      this.translateLangue();
      if(!this.idProjet && !this.idProtocole){
        this.translate.get('GENERAL.PROJETS').subscribe((res: string) => {
          this.initSelect2('selectProjet', res, true);
        });
      }
      
      if(!this.idProtocole){
        this.translate.get('GENERAL.PROTOCOLES').subscribe((res: string) => {
          this.initSelect2('selectProtocole', res, true);
        });
      }else{
        this.getEssai();
      }
      
      if(!this.idProjet && !this.idProtocole){
        this.getProjetParDateCollecte(new Date(), true);
      }
      
      if(this.idProjet){
        this.getProtocoleParProjet(this.idProjet, true)
      }
      
  
      //
    }


    getFormKeys(idProtocole){
      this.formKeys = [];
      this.servicePouchdb.findRelationalDocOfTypeByPere('formulaireprotocole', 'protocole', idProtocole, false).then((res) => {
        //console.log(res)
        if(res && res['formulaireprotocoles']){
          
          for(let u of res['formulaireprotocoles']){
            var arrayOfKey = keysInObject(u.formioData.components, 'key');
            //let cols = [];
            for(let c of arrayOfKey){
              this.formKeys = Array.from(new Set(this.formKeys.concat(c)));
            }

            /*if(u.formData.keys && u.formData.keys.length > 0){
              this.formKeys = Array.from(new Set(this.formKeys.concat(u.formData.keys)));
            }else{
              var arrayOfKey = keysInObject(u.formioData.components, 'key');
              //let cols = [];
              for(let c of arrayOfKey){
                this.formKeys = Array.from(new Set(this.formKeys.concat(c)));
              }
            }*/
            
          }

          //console.log(this.formKeys);

        }
      }).catch((err) => {

        console.log(err)
      });
    }
    setLiDynamiqueWidth(){
      $("#msform").ready(function(){
        var lis = $("#progressbar li");
        for(let i = 0; i < lis.length; i++){
          lis[i].style.width = 100/lis.length +"%";
        }
      });
    }

    wizarAction(){
      var self = this;
      $("#msform").ready(function(){
        self.setLiDynamiqueWidth();
        var current_fs, next_fs, previous_fs; //fieldsets
        var opacity;
        var current = 1;
        var steps = $("fieldset").length - 1;
        
        setProgressBar(current);
        self.etapeCourante = current;
        $(".next").click(function(){
        /*if(current > 1){
          console.log(self.formioForms[self.formulaireData[0].formData.code])
          self.formioForms[self.formulaireData[0].formData.code].submit().then((cc) => {
            console.log(cc)
          }).catch((err) => {
            console.log(err)
          })
        }*/
        current_fs = $(this).parent();
        next_fs = $(this).parent().next();
        //Add Class Active
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
        
        //show the next fieldset
        next_fs.show();
        //hide the current fieldset with style
        current_fs.animate({opacity: 0}, {
        step: function(now) {
        // for making fielset appear animation
        opacity = 1 - now;
        
        current_fs.css({
        'display': 'none',
        'position': 'relative'
        });
        next_fs.css({'opacity': opacity});
        },
        duration: 500
        });
        setProgressBar(++current);
        
        });
        
        $(".previous").click(function(){
        
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();
        //Remove class active
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
        
        //show the previous fieldset
        previous_fs.show();
        
        //hide the current fieldset with style
        current_fs.animate({opacity: 0}, {
        step: function(now) {
        // for making fielset appear animation
        opacity = 1 - now;
        
        current_fs.css({
        'display': 'none',
        'position': 'relative'
        });
        previous_fs.css({'opacity': opacity});
        },
        duration: 500
        });
        setProgressBar(--current);
        });
        
        function setProgressBar(curStep){
          self.etapeCourante = curStep;
          var percent: any = /*parseFloat*/(100 / steps) * curStep;
          percent = percent.toFixed();
          $(".progress-bar")
          .css("width",percent+"%")
        }
        
        $(".submit").click(function(){
        return false;
        })
        
        });
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
        this.actualiserTableau(this.essaisData);
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
      if(this.essaiForm.get(filedName).errors && (this.essaiForm.get(filedName).dirty || this.essaiForm.get(filedName).touched)){
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
      if(this.essaiForm.get(filedName).errors){
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

    iniDateCollectePicker(id){
      var self = this;
      $(function () {
        
        $('#'+id+' input').datepicker({
          //minViewMode: 2,
          autoclose: true,
          todayHighlight: true,
          format: 'dd-mm-yyyy',
          language: global.langue
        }).on('changeDate', function(e) {
          // `e` here contains the extra attributes
          //console.log(e.date)
          //console.log(e.date.toISOString())
          //console.log(new Date(new Date().getFullYear(), 0, 1))
          //let newDate = moment(e.date)
          self.essaiForm.controls.dateCollecte.setValue(e.date.toISOString());
          
          self.essaiForm.controls.idInstitution.setValue(null);

          self.essaiForm.controls.idProjet.setValue(null);
          self.essaiForm.controls.numeroProjet.setValue(null);
          self.essaiForm.controls.nomProjet.setValue(null);

          self.essaiForm.controls.idProtocole.setValue(null);
          self.essaiForm.controls.numeroProtocole.setValue(null);
          self.essaiForm.controls.nomProtocole.setValue(null);
          self.essaiForm.controls.niveauCollecte.setValue(null);
          
          //self.getProjetParInstitution(self.essaiForm.controls.idInstitution.value);
          self.getProjetParDateCollecte(e.date.toISOString());
          /*self.servicePouchdb.findRelationalDocProjetAndProtocoleForDataCollect('projet', null, e.date.toISOString(), false, false).then((res) => {
            console.log(res)
          })*/
          //recuper les protocole dont la dateDebut <= dateCollecte et dateFin >= dateCollecte
          //$('#'+id+' input').datepicker('hide')
        });
      });
    }

    initSelect2(id, placeholder, noSearch = false){
      var self = this;
      var infinity = null;
      if(noSearch){
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
          //var data = e.params.data;
          
          if(self.essaiForm && self.essaiForm.controls[id]){
            self.essaiForm.controls[id].setValue(e.params.data.id)
          }
          
          if(id == 'selectProjet'){
            self.getProtocoleParProjet(e.params.data.id, true)
          }else if(id == 'selectProtocole'){
            self.hideData = false;
            self.selectedProtocoleID = e.params.data.id;
            self.getFormKeys(e.params.data.id);
            self.getEssai(e.params.data.id);
          }else if(id == 'idInstitution'){
            self.setNumeroAndNomInstitution(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idProjet'){
            //console.log('idProjet')
            self.setNumeroAndNomProjet(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          } else if(id == 'idProtocole'){
            self.setNumeroAndNomProtocole(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          } else if(id == 'idPersonne'){
            self.setNumeroAndNomPersonne(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          } else if(id == 'idChamp'){
            self.setNumeroAndNomChamp(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          } else if(id == 'idPays'){
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setCodeAndNomPays(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idRegion'){
            self.communeData = [];
            self.localiteData = [];
            self.setCodeAndNomRegion(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idDepartement'){
            self.localiteData = [];
            self.setCodeAndNomDepartement(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idCommune'){
            self.setCodeAndNomCommune(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idLocalite'){
            self.setCodeAndNomLocalite(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idUnion'){
            self.setNumeroAndNomUnion(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
            self.opData = [];
          }else if(id == 'idOp'){
            self.setNumeroAndNomOp(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }
          
         
        });

        $('#'+id+' select').on("select2:unselect", function (e) {
          if(self.essaiForm && self.essaiForm.controls && self.essaiForm.controls[id]) {
            self.essaiForm.controls[id].setValue(null);
          }
           
          if(id == 'selectProjet'){
            self.hideData = true;
            //console.log(self.hideData)
          }else if(id == 'selectProtocole'){
            self.hideData = true;
            self.selectedProtocoleID = null;
          }else if(id == 'idInstitution'){
            self.essaiForm.controls.idInstitution.setValue(null);
            self.essaiForm.controls.numeroInstitution.setValue(null);
            self.essaiForm.controls.nomInstitution.setValue(null);

            self.essaiForm.controls.idProjet.setValue(null);
            self.essaiForm.controls.numeroProjet.setValue(null);
            self.essaiForm.controls.nomProjet.setValue(null);

            self.essaiForm.controls.idProtocole.setValue(null);
            self.essaiForm.controls.numeroProtocole.setValue(null);
            self.essaiForm.controls.nomProtocole.setValue(null);
            self.essaiForm.controls.niveauCollecte.setValue(null);
            //self.setSelect2DefaultValue('numeroProjet', null);
            self.projetData = [];
            self.protocoleData = [];
            self.formulaireData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'idProjet'){
            self.essaiForm.controls.idProjet.setValue(null);
            self.essaiForm.controls.numeroProjet.setValue(null);
            self.essaiForm.controls.nomProjet.setValue(null);

            self.essaiForm.controls.idProtocole.setValue(null);
            self.essaiForm.controls.numeroProtocole.setValue(null);
            self.essaiForm.controls.nomProtocole.setValue(null);
            self.essaiForm.controls.niveauCollecte.setValue(null);
            self.protocoleData = [];
            self.formulaireData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'idProtocole'){
            self.essaiForm.controls.idProtocole.setValue(null);
            self.essaiForm.controls.numeroProtocole.setValue(null);
            self.essaiForm.controls.nomProtocole.setValue(null);
            self.essaiForm.controls.niveauCollecte.setValue(null);
            self.formulaireData = [];
            self.setSelectRequredError(id, id);
            self.nbEtapes = 2;
            self.wizarAction();
          }else if(id == 'idPersonne'){
            self.essaiForm.controls.idPersonne.setValue(null);
            self.essaiForm.controls.matriculePersonne.setValue(null);
            self.essaiForm.controls.nomPersonne.setValue(null);

            self.essaiForm.controls.idChamp.setValue(null);
            self.essaiForm.controls.codeChamp.setValue(null);
            self.essaiForm.controls.nomChamp.setValue(null);
            
            self.champData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'idChamp'){
            self.essaiForm.controls.idChamp.setValue(null);
            self.essaiForm.controls.codeChamp.setValue(null);
            self.essaiForm.controls.nomChamp.setValue(null);
            //self.champData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'idPays'){
            self.setCodeAndNomPays(self.essaiForm.value[id]);
            self.regionData = [];
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idRegion'){
            self.setCodeAndNomRegion(self.essaiForm.value[id]);
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idDepartement'){
            self.setCodeAndNomDepartement(self.essaiForm.value[id]);
            self.communeData = [];
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idCommune'){
            self.setCodeAndNomCommune(self.essaiForm.value[id]);
            self.localiteData = [];
            self.setSelectRequredError(id, id)
          }else if(id == 'idLocalite'){
            self.setCodeAndNomLocalite(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idUnion'){
            self.essaiForm.controls.idUnion.setValue(null);
            self.essaiForm.controls.numeroUnion.setValue(null);
            self.essaiForm.controls.nomUnion.setValue(null);

            self.essaiForm.controls.idOp.setValue(null);
            self.essaiForm.controls.numeroOp.setValue(null);
            self.essaiForm.controls.nomOp.setValue(null);
            self.setSelectRequredError(id, id);
          }else if(id == 'idOp'){
            self.essaiForm.controls.idOp.setValue(null);
            self.essaiForm.controls.numeroOp.setValue(null);
            self.essaiForm.controls.nomOp.setValue(null);
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
  

    selectChange(e) {
      console.log(e);
    }
  
    initForm(){
      //this.essaiForm = null;
      this.essaiForm = this.formBuilder.group({
        numero: ['DC-'+nanoid(), Validators.required],
        dateCollecte: [moment().toISOString()],
        //nomInstitution: [null, Validators.required],
        //numeroInstitution: [null, Validators.required],
        idInstitution: [null, Validators.required],
        nomProjet: [null, Validators.required],
        numeroProjet: [null, Validators.required],
        idProjet: [null, Validators.required], 
        nomProtocole: [null, Validators.required],
        niveauCollecte: [null, Validators.required],
        numeroProtocole: [null, Validators.required],
        idProtocole: [null, Validators.required],
        nomUnion: [null, Validators.required],
        numeroUnion: [null, Validators.required],
        idUnion: [null, Validators.required],
        nomOp: [null, Validators.required],
        numeroOp: [null, Validators.required],
        idOp: [null, Validators.required],
        nomPersonne: [null, Validators.required],
        matriculePersonne: [null, Validators.required],
        idPersonne: [null, Validators.required],
        nomChamp: [null, Validators.required],
        codeChamp: [null, Validators.required],
        idChamp: [null, Validators.required],
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
        nomLocalite: [null, Validators.required],
        codeLocalite: [null, Validators.required],
        idLocalite: [null, Validators.required]
      });

      this.validerNumero();
    }
  
    editForm(oDoc){
      let essai = oDoc.collectedonnees[0];
      let idInstitution;
      //let numeroInstitution;
      //let nomInstitution;
      let idProjet;
      let numeroProjet;
      let nomProjet;
      let idProtocole;
      let numeroProtocole;
      let nomProtocole;

      let idPersonne;
      let matriculePersonne;
      let nomPersonne;
      let idChamp;
      let codeChamp;
      let nomChamp;

      let idPays, codePays, nomPays;
      let idRegion, codeRegion, nomRegion;
      let idDepartement, codeDepartement, nomDepartement;
      let idCommune, codeCommune, nomCommune;
      let codeLocalite, idLocalite, nomLocalite;
      let idUnion, numeroUnion, nomUnion;
      let idOp, numeroOp, nomOp;

      
      if(oDoc.partenaires && oDoc.partenaires[0]){
        idInstitution = oDoc.partenaires[0].id;
        //numeroInstitution = oDoc.partenaires[0].formData.numero;
        //nomInstitution = oDoc.partenaires[0].formData.nom;
      }

      if(oDoc.projets[0]){
        idProjet = oDoc.projets[0].id;
        numeroProjet = oDoc.projets[0].formData.numero;
        nomProjet = oDoc.projets[0].formData.nom;        
      }

      if(oDoc.protocoles[0]){
        idProtocole = oDoc.protocoles[0].id;
        numeroProtocole = oDoc.protocoles[0].formData.numero;
        nomProtocole = oDoc.protocoles[0].formData.nom;        
      }

      if(oDoc.unions && oDoc.unions[0]){
        idUnion = oDoc.unions[0].id;
        numeroUnion = oDoc.unions[0].formData.numero;
        nomUnion = oDoc.unions[0].formData.nom;
      }

      if(oDoc.ops && oDoc.ops[0]){
        idOp = oDoc.ops[0].id;
        numeroOp = oDoc.ops[0].formData.numero;
        nomOp = oDoc.ops[0].formData.nom;
      }

      if(oDoc.personnes[0]){
        idPersonne = oDoc.personnes[0].id;
        matriculePersonne = oDoc.personnes[0].formData.matricule;
        nomPersonne = oDoc.personnes[0].formData.nom;        
      }

      if(oDoc.champs[0]){
        idChamp = oDoc.champs[0].id;
        codeChamp = oDoc.champs[0].formData.code;
        nomChamp = oDoc.champs[0].formData.nom;        
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
        idLocalite = oDoc.localites[0].id;
        codeLocalite = oDoc.localites[0].formData.code;
        nomLocalite = oDoc.localites[0].formData.nom;
      }

     
      //this.essaiForm = null;
      let u = essai.formData

      this.essaiForm = this.formBuilder.group({
        numero: [u.numero, Validators.required],
        dateCollecte: [u.dateCollecte/*, Validators.required*/],
        //nomInstitution: [nomInstitution, Validators.required],
        //numeroInstitution: [numeroInstitution, Validators.required],
        niveauCollecte: [u.niveauCollecte, Validators.required], 
        idInstitution: [idInstitution, Validators.required],
        nomProjet: [nomProjet, Validators.required], 
        numeroProjet: [numeroProjet, Validators.required],
        idProjet: [idProjet, Validators.required],
        nomProtocole: [nomProtocole, Validators.required], 
        numeroProtocole: [numeroProtocole, Validators.required],
        idProtocole: [idProtocole, Validators.required],
        nomUnion: [nomUnion], 
        numeroUnion: [numeroUnion],
        idUnion: [idUnion],
        nomOp: [nomOp],
        numeroOp: [numeroOp],
        idOp: [idOp],  
        nomPersonne: [nomPersonne, Validators.required], 
        matriculePersonne: [matriculePersonne, Validators.required],
        idPersonne: [idPersonne, Validators.required],
        nomChamp: [nomChamp, Validators.required], 
        codeChamp: [codeChamp, Validators.required],
        idChamp: [idChamp, Validators.required],
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
        nomLocalite: [nomLocalite, Validators.required],
        codeLocalite: [codeLocalite, Validators.required],
        idLocalite: [idLocalite, Validators.required]
      });

      this.initRequired(u.niveauCollecte);

      //console.log(this.essaiForm.value)
      this.validerNumero();

    }

    validerNumero(){
      let niveauCollecteControl = this.essaiForm.controls['niveauCollecte'];
      niveauCollecteControl.valueChanges.subscribe((value) => {
        if(value && value != '' ){
          if(value == 'union'){
            this.essaiForm.controls['numeroUnion'].setValidators(Validators.required);
            this.essaiForm.controls['nomUnion'].setValidators(Validators.required);
            this.essaiForm.controls['idUnion'].setValidators(Validators.required);

            this.essaiForm.controls['numeroOp'].clearValidators();
            this.essaiForm.controls['nomOp'].clearValidators();
            this.essaiForm.controls['idOp'].clearValidators();

            this.essaiForm.controls['matriculePersonne'].clearValidators();
            this.essaiForm.controls['nomPersonne'].clearValidators();
            this.essaiForm.controls['idPersonne'].clearValidators();

            this.essaiForm.controls['nomChamp'].clearValidators();
            this.essaiForm.controls['idChamp'].clearValidators();
            this.essaiForm.controls['codeChamp'].clearValidators();
            this.essaiForm.controls['idPays'].clearValidators();
            this.essaiForm.controls['nomPays'].clearValidators();
            this.essaiForm.controls['codePays'].clearValidators();
            this.essaiForm.controls['nomRegion'].clearValidators();
            this.essaiForm.controls['codeRegion'].clearValidators();
            this.essaiForm.controls['idRegion'].clearValidators();
            this.essaiForm.controls['nomDepartement'].clearValidators();
            this.essaiForm.controls['codeDepartement'].clearValidators();
            this.essaiForm.controls['idDepartement'].clearValidators();
            this.essaiForm.controls['nomCommune'].clearValidators();
            this.essaiForm.controls['codeCommune'].clearValidators();
            this.essaiForm.controls['idCommune'].clearValidators();
            this.essaiForm.controls['nomLocalite'].clearValidators();
            this.essaiForm.controls['codeLocalite'].clearValidators();
            this.essaiForm.controls['idLocalite'].clearValidators();

          }else if(value == 'op'){
            this.essaiForm.controls['numeroUnion'].clearValidators();
            this.essaiForm.controls['nomUnion'].clearValidators();
            this.essaiForm.controls['idUnion'].clearValidators();

            this.essaiForm.controls['numeroOp'].setValidators(Validators.required);
            this.essaiForm.controls['nomOp'].setValidators(Validators.required);
            this.essaiForm.controls['idOp'].setValidators(Validators.required);

            this.essaiForm.controls['matriculePersonne'].clearValidators();
            this.essaiForm.controls['nomPersonne'].clearValidators();
            this.essaiForm.controls['idPersonne'].clearValidators();

            this.essaiForm.controls['nomChamp'].clearValidators();
            this.essaiForm.controls['idChamp'].clearValidators();
            this.essaiForm.controls['codeChamp'].clearValidators();
            this.essaiForm.controls['idPays'].clearValidators();
            this.essaiForm.controls['nomPays'].clearValidators();
            this.essaiForm.controls['codePays'].clearValidators();
            this.essaiForm.controls['nomRegion'].clearValidators();
            this.essaiForm.controls['codeRegion'].clearValidators();
            this.essaiForm.controls['idRegion'].clearValidators();
            this.essaiForm.controls['nomDepartement'].clearValidators();
            this.essaiForm.controls['codeDepartement'].clearValidators();
            this.essaiForm.controls['idDepartement'].clearValidators();
            this.essaiForm.controls['nomCommune'].clearValidators();
            this.essaiForm.controls['codeCommune'].clearValidators();
            this.essaiForm.controls['idCommune'].clearValidators();
            this.essaiForm.controls['nomLocalite'].clearValidators();
            this.essaiForm.controls['codeLocalite'].clearValidators();
            this.essaiForm.controls['idLocalite'].clearValidators();
          }else if(value == 'personne'){
            this.essaiForm.controls['numeroUnion'].clearValidators();
            this.essaiForm.controls['nomUnion'].clearValidators();
            this.essaiForm.controls['idUnion'].clearValidators();

            this.essaiForm.controls['numeroOp'].clearValidators();
            this.essaiForm.controls['nomOp'].clearValidators();
            this.essaiForm.controls['idOp'].clearValidators();

            this.essaiForm.controls['matriculePersonne'].setValidators(Validators.required);
            this.essaiForm.controls['nomPersonne'].setValidators(Validators.required);
            this.essaiForm.controls['idPersonne'].setValidators(Validators.required);

            this.essaiForm.controls['nomChamp'].clearValidators();
            this.essaiForm.controls['idChamp'].clearValidators();
            this.essaiForm.controls['codeChamp'].clearValidators();
            this.essaiForm.controls['idPays'].clearValidators();
            this.essaiForm.controls['nomPays'].clearValidators();
            this.essaiForm.controls['codePays'].clearValidators();
            this.essaiForm.controls['nomRegion'].clearValidators();
            this.essaiForm.controls['codeRegion'].clearValidators();
            this.essaiForm.controls['idRegion'].clearValidators();
            this.essaiForm.controls['nomDepartement'].clearValidators();
            this.essaiForm.controls['codeDepartement'].clearValidators();
            this.essaiForm.controls['idDepartement'].clearValidators();
            this.essaiForm.controls['nomCommune'].clearValidators();
            this.essaiForm.controls['codeCommune'].clearValidators();
            this.essaiForm.controls['idCommune'].clearValidators();
            this.essaiForm.controls['nomLocalite'].clearValidators();
            this.essaiForm.controls['codeLocalite'].clearValidators();
            this.essaiForm.controls['idLocalite'].clearValidators();
            console.log(this.essaiForm.value)
          } else if(value == 'champ'){
            this.essaiForm.controls['numeroUnion'].clearValidators();
            this.essaiForm.controls['nomUnion'].clearValidators();
            this.essaiForm.controls['idUnion'].clearValidators();

            this.essaiForm.controls['numeroOp'].clearValidators();
            this.essaiForm.controls['nomOp'].clearValidators();
            this.essaiForm.controls['idOp'].clearValidators();

            this.essaiForm.controls['matriculePersonne'].setValidators(Validators.required);
            this.essaiForm.controls['nomPersonne'].setValidators(Validators.required);
            this.essaiForm.controls['idPersonne'].setValidators(Validators.required);
            this.essaiForm.controls['nomChamp'].setValidators(Validators.required);
            this.essaiForm.controls['idChamp'].setValidators(Validators.required);
            this.essaiForm.controls['codeChamp'].setValidators(Validators.required);

            this.essaiForm.controls['idPays'].clearValidators();
            this.essaiForm.controls['nomPays'].clearValidators();
            this.essaiForm.controls['codePays'].clearValidators();
            this.essaiForm.controls['nomRegion'].clearValidators();
            this.essaiForm.controls['codeRegion'].clearValidators();
            this.essaiForm.controls['idRegion'].clearValidators();
            this.essaiForm.controls['nomDepartement'].clearValidators();
            this.essaiForm.controls['codeDepartement'].clearValidators();
            this.essaiForm.controls['idDepartement'].clearValidators();
            this.essaiForm.controls['nomCommune'].clearValidators();
            this.essaiForm.controls['codeCommune'].clearValidators();
            this.essaiForm.controls['idCommune'].clearValidators();
            this.essaiForm.controls['nomLocalite'].clearValidators();
            this.essaiForm.controls['codeLocalite'].clearValidators();
            this.essaiForm.controls['idLocalite'].clearValidators();
          }else if(value == 'pays'){
            this.essaiForm.controls['numeroUnion'].clearValidators();
            this.essaiForm.controls['nomUnion'].clearValidators();
            this.essaiForm.controls['idUnion'].clearValidators();

            this.essaiForm.controls['numeroOp'].clearValidators();
            this.essaiForm.controls['nomOp'].clearValidators();
            this.essaiForm.controls['idOp'].clearValidators();

            this.essaiForm.controls['matriculePersonne'].clearValidators();
            this.essaiForm.controls['nomPersonne'].clearValidators();
            this.essaiForm.controls['idPersonne'].clearValidators();
            this.essaiForm.controls['nomChamp'].clearValidators();
            this.essaiForm.controls['idChamp'].clearValidators();
            this.essaiForm.controls['codeChamp'].clearValidators();

            this.essaiForm.controls['idPays'].setValidators(Validators.required);
            this.essaiForm.controls['nomPays'].setValidators(Validators.required);
            this.essaiForm.controls['codePays'].setValidators(Validators.required);

            this.essaiForm.controls['nomRegion'].clearValidators();
            this.essaiForm.controls['codeRegion'].clearValidators();
            this.essaiForm.controls['idRegion'].clearValidators();
            this.essaiForm.controls['nomDepartement'].clearValidators();
            this.essaiForm.controls['codeDepartement'].clearValidators();
            this.essaiForm.controls['idDepartement'].clearValidators();
            this.essaiForm.controls['nomCommune'].clearValidators();
            this.essaiForm.controls['codeCommune'].clearValidators();
            this.essaiForm.controls['idCommune'].clearValidators();
            this.essaiForm.controls['nomLocalite'].clearValidators();
            this.essaiForm.controls['codeLocalite'].clearValidators();
            this.essaiForm.controls['idLocalite'].clearValidators();
          }else if(value == 'region'){
            this.essaiForm.controls['numeroUnion'].clearValidators();
            this.essaiForm.controls['nomUnion'].clearValidators();
            this.essaiForm.controls['idUnion'].clearValidators();

            this.essaiForm.controls['numeroOp'].clearValidators();
            this.essaiForm.controls['nomOp'].clearValidators();
            this.essaiForm.controls['idOp'].clearValidators();

            this.essaiForm.controls['matriculePersonne'].clearValidators();
            this.essaiForm.controls['nomPersonne'].clearValidators();
            this.essaiForm.controls['idPersonne'].clearValidators();
            this.essaiForm.controls['nomChamp'].clearValidators();
            this.essaiForm.controls['idChamp'].clearValidators();
            this.essaiForm.controls['codeChamp'].clearValidators();

            this.essaiForm.controls['idPays'].setValidators(Validators.required);
            this.essaiForm.controls['nomPays'].setValidators(Validators.required);
            this.essaiForm.controls['codePays'].setValidators(Validators.required);
            
            this.essaiForm.controls['nomRegion'].setValidators(Validators.required);
            this.essaiForm.controls['codeRegion'].setValidators(Validators.required);
            this.essaiForm.controls['idRegion'].setValidators(Validators.required);

            this.essaiForm.controls['nomDepartement'].clearValidators();
            this.essaiForm.controls['codeDepartement'].clearValidators();
            this.essaiForm.controls['idDepartement'].clearValidators();
            this.essaiForm.controls['nomCommune'].clearValidators();
            this.essaiForm.controls['codeCommune'].clearValidators();
            this.essaiForm.controls['idCommune'].clearValidators();
            this.essaiForm.controls['nomLocalite'].clearValidators();
            this.essaiForm.controls['codeLocalite'].clearValidators();
            this.essaiForm.controls['idLocalite'].clearValidators();
          }else if(value == 'departement'){
            this.essaiForm.controls['numeroUnion'].clearValidators();
            this.essaiForm.controls['nomUnion'].clearValidators();
            this.essaiForm.controls['idUnion'].clearValidators();

            this.essaiForm.controls['numeroOp'].clearValidators();
            this.essaiForm.controls['nomOp'].clearValidators();
            this.essaiForm.controls['idOp'].clearValidators();

            this.essaiForm.controls['matriculePersonne'].clearValidators();
            this.essaiForm.controls['nomPersonne'].clearValidators();
            this.essaiForm.controls['idPersonne'].clearValidators();
            this.essaiForm.controls['nomChamp'].clearValidators();
            this.essaiForm.controls['idChamp'].clearValidators();
            this.essaiForm.controls['codeChamp'].clearValidators();

            this.essaiForm.controls['idPays'].setValidators(Validators.required);
            this.essaiForm.controls['nomPays'].setValidators(Validators.required);
            this.essaiForm.controls['codePays'].setValidators(Validators.required);
            
            this.essaiForm.controls['nomRegion'].setValidators(Validators.required);
            this.essaiForm.controls['codeRegion'].setValidators(Validators.required);
            this.essaiForm.controls['idRegion'].setValidators(Validators.required);

            this.essaiForm.controls['nomDepartement'].setValidators(Validators.required);
            this.essaiForm.controls['codeDepartement'].setValidators(Validators.required);
            this.essaiForm.controls['idDepartement'].setValidators(Validators.required);

            this.essaiForm.controls['nomCommune'].clearValidators();
            this.essaiForm.controls['codeCommune'].clearValidators();
            this.essaiForm.controls['idCommune'].clearValidators();
            this.essaiForm.controls['nomLocalite'].clearValidators();
            this.essaiForm.controls['codeLocalite'].clearValidators();
            this.essaiForm.controls['idLocalite'].clearValidators();
          }else if(value == 'commune'){
            this.essaiForm.controls['numeroUnion'].clearValidators();
            this.essaiForm.controls['nomUnion'].clearValidators();
            this.essaiForm.controls['idUnion'].clearValidators();

            this.essaiForm.controls['numeroOp'].clearValidators();
            this.essaiForm.controls['nomOp'].clearValidators();
            this.essaiForm.controls['idOp'].clearValidators();

            this.essaiForm.controls['matriculePersonne'].clearValidators();
            this.essaiForm.controls['nomPersonne'].clearValidators();
            this.essaiForm.controls['idPersonne'].clearValidators();
            this.essaiForm.controls['nomChamp'].clearValidators();
            this.essaiForm.controls['idChamp'].clearValidators();
            this.essaiForm.controls['codeChamp'].clearValidators();

            this.essaiForm.controls['idPays'].setValidators(Validators.required);
            this.essaiForm.controls['nomPays'].setValidators(Validators.required);
            this.essaiForm.controls['codePays'].setValidators(Validators.required);
            
            this.essaiForm.controls['nomRegion'].setValidators(Validators.required);
            this.essaiForm.controls['codeRegion'].setValidators(Validators.required);
            this.essaiForm.controls['idRegion'].setValidators(Validators.required);
            
            this.essaiForm.controls['nomDepartement'].setValidators(Validators.required);
            this.essaiForm.controls['codeDepartement'].setValidators(Validators.required);
            this.essaiForm.controls['idDepartement'].setValidators(Validators.required);

            this.essaiForm.controls['nomCommune'].setValidators(Validators.required);
            this.essaiForm.controls['codeCommune'].setValidators(Validators.required);
            this.essaiForm.controls['idCommune'].setValidators(Validators.required);

            this.essaiForm.controls['nomLocalite'].clearValidators();
            this.essaiForm.controls['codeLocalite'].clearValidators();
            this.essaiForm.controls['idLocalite'].clearValidators();
          }else{
            this.essaiForm.controls['numeroUnion'].clearValidators();
            this.essaiForm.controls['nomUnion'].clearValidators();
            this.essaiForm.controls['idUnion'].clearValidators();

            this.essaiForm.controls['numeroOp'].clearValidators();
            this.essaiForm.controls['nomOp'].clearValidators();
            this.essaiForm.controls['idOp'].clearValidators();

            this.essaiForm.controls['matriculePersonne'].clearValidators();
            this.essaiForm.controls['nomPersonne'].clearValidators();
            this.essaiForm.controls['idPersonne'].clearValidators();
            this.essaiForm.controls['nomChamp'].clearValidators();
            this.essaiForm.controls['idChamp'].clearValidators();
            this.essaiForm.controls['codeChamp'].clearValidators();

            this.essaiForm.controls['idPays'].setValidators(Validators.required);
            this.essaiForm.controls['nomPays'].setValidators(Validators.required);
            this.essaiForm.controls['codePays'].setValidators(Validators.required);
            
            this.essaiForm.controls['nomRegion'].setValidators(Validators.required);
            this.essaiForm.controls['codeRegion'].setValidators(Validators.required);
            this.essaiForm.controls['idRegion'].setValidators(Validators.required);
            
            this.essaiForm.controls['nomDepartement'].setValidators(Validators.required);
            this.essaiForm.controls['codeDepartement'].setValidators(Validators.required);
            this.essaiForm.controls['idDepartement'].setValidators(Validators.required);

            this.essaiForm.controls['nomCommune'].setValidators(Validators.required);
            this.essaiForm.controls['codeCommune'].setValidators(Validators.required);
            this.essaiForm.controls['idCommune'].setValidators(Validators.required);
            
            this.essaiForm.controls['nomLocalite'].setValidators(Validators.required);
            this.essaiForm.controls['codeLocalite'].setValidators(Validators.required);
            this.essaiForm.controls['idLocalite'].setValidators(Validators.required);
          }
        }else {
          this.essaiForm.controls['numeroUnion'].setValidators(Validators.required);
          this.essaiForm.controls['nomUnion'].setValidators(Validators.required);
          this.essaiForm.controls['idUnion'].setValidators(Validators.required);

          this.essaiForm.controls['numeroOp'].setValidators(Validators.required);
          this.essaiForm.controls['nomOp'].setValidators(Validators.required);
          this.essaiForm.controls['idOp'].setValidators(Validators.required);

          this.essaiForm.controls['matriculePersonne'].setValidators(Validators.required);
          this.essaiForm.controls['nomPersonne'].setValidators(Validators.required);
          this.essaiForm.controls['idPersonne'].setValidators(Validators.required);

          this.essaiForm.controls['nomChamp'].setValidators(Validators.required);
          this.essaiForm.controls['codeChamp'].setValidators(Validators.required);
          this.essaiForm.controls['idChamp'].setValidators(Validators.required);

          this.essaiForm.controls['idPays'].setValidators(Validators.required);
          this.essaiForm.controls['nomPays'].setValidators(Validators.required);
          this.essaiForm.controls['codePays'].setValidators(Validators.required);
          
          this.essaiForm.controls['nomRegion'].setValidators(Validators.required);
          this.essaiForm.controls['codeRegion'].setValidators(Validators.required);
          this.essaiForm.controls['idRegion'].setValidators(Validators.required);
          
          this.essaiForm.controls['nomDepartement'].setValidators(Validators.required);
          this.essaiForm.controls['codeDepartement'].setValidators(Validators.required);
          this.essaiForm.controls['idDepartement'].setValidators(Validators.required);

          this.essaiForm.controls['nomCommune'].setValidators(Validators.required);
          this.essaiForm.controls['codeCommune'].setValidators(Validators.required);
          this.essaiForm.controls['idCommune'].setValidators(Validators.required);
          
          this.essaiForm.controls['nomLocalite'].setValidators(Validators.required);
          this.essaiForm.controls['codeLocalite'].setValidators(Validators.required);
          this.essaiForm.controls['idLocalite'].setValidators(Validators.required);
        }

        //console.log
      });
    }


    initRequired(value){
      if(value == 'union'){
        this.essaiForm.controls['numeroUnion'].setValidators(Validators.required);
        this.essaiForm.controls['nomUnion'].setValidators(Validators.required);
        this.essaiForm.controls['idUnion'].setValidators(Validators.required);

        this.essaiForm.controls['numeroOp'].clearValidators();
        this.essaiForm.controls['nomOp'].clearValidators();
        this.essaiForm.controls['idOp'].clearValidators();

        this.essaiForm.controls['matriculePersonne'].clearValidators();
        this.essaiForm.controls['nomPersonne'].clearValidators();
        this.essaiForm.controls['idPersonne'].clearValidators();

        this.essaiForm.controls['nomChamp'].clearValidators();
        this.essaiForm.controls['idChamp'].clearValidators();
        this.essaiForm.controls['codeChamp'].clearValidators();
        this.essaiForm.controls['idPays'].clearValidators();
        this.essaiForm.controls['nomPays'].clearValidators();
        this.essaiForm.controls['codePays'].clearValidators();
        this.essaiForm.controls['nomRegion'].clearValidators();
        this.essaiForm.controls['codeRegion'].clearValidators();
        this.essaiForm.controls['idRegion'].clearValidators();
        this.essaiForm.controls['nomDepartement'].clearValidators();
        this.essaiForm.controls['codeDepartement'].clearValidators();
        this.essaiForm.controls['idDepartement'].clearValidators();
        this.essaiForm.controls['nomCommune'].clearValidators();
        this.essaiForm.controls['codeCommune'].clearValidators();
        this.essaiForm.controls['idCommune'].clearValidators();
        this.essaiForm.controls['nomLocalite'].clearValidators();
        this.essaiForm.controls['codeLocalite'].clearValidators();
        this.essaiForm.controls['idLocalite'].clearValidators();

      }else if(value == 'op'){
        this.essaiForm.controls['numeroUnion'].clearValidators();
        this.essaiForm.controls['nomUnion'].clearValidators();
        this.essaiForm.controls['idUnion'].clearValidators();

        this.essaiForm.controls['numeroOp'].setValidators(Validators.required);
        this.essaiForm.controls['nomOp'].setValidators(Validators.required);
        this.essaiForm.controls['idOp'].setValidators(Validators.required);

        this.essaiForm.controls['matriculePersonne'].clearValidators();
        this.essaiForm.controls['nomPersonne'].clearValidators();
        this.essaiForm.controls['idPersonne'].clearValidators();

        this.essaiForm.controls['nomChamp'].clearValidators();
        this.essaiForm.controls['idChamp'].clearValidators();
        this.essaiForm.controls['codeChamp'].clearValidators();
        this.essaiForm.controls['idPays'].clearValidators();
        this.essaiForm.controls['nomPays'].clearValidators();
        this.essaiForm.controls['codePays'].clearValidators();
        this.essaiForm.controls['nomRegion'].clearValidators();
        this.essaiForm.controls['codeRegion'].clearValidators();
        this.essaiForm.controls['idRegion'].clearValidators();
        this.essaiForm.controls['nomDepartement'].clearValidators();
        this.essaiForm.controls['codeDepartement'].clearValidators();
        this.essaiForm.controls['idDepartement'].clearValidators();
        this.essaiForm.controls['nomCommune'].clearValidators();
        this.essaiForm.controls['codeCommune'].clearValidators();
        this.essaiForm.controls['idCommune'].clearValidators();
        this.essaiForm.controls['nomLocalite'].clearValidators();
        this.essaiForm.controls['codeLocalite'].clearValidators();
        this.essaiForm.controls['idLocalite'].clearValidators();
      }else if(value == 'personne'){
        this.essaiForm.controls['numeroUnion'].clearValidators();
        this.essaiForm.controls['nomUnion'].clearValidators();
        this.essaiForm.controls['idUnion'].clearValidators();

        this.essaiForm.controls['numeroOp'].clearValidators();
        this.essaiForm.controls['nomOp'].clearValidators();
        this.essaiForm.controls['idOp'].clearValidators();

        this.essaiForm.controls['matriculePersonne'].setValidators(Validators.required);
        this.essaiForm.controls['nomPersonne'].setValidators(Validators.required);
        this.essaiForm.controls['idPersonne'].setValidators(Validators.required);

        this.essaiForm.controls['nomChamp'].clearValidators();
        this.essaiForm.controls['idChamp'].clearValidators();
        this.essaiForm.controls['codeChamp'].clearValidators();
        this.essaiForm.controls['idPays'].clearValidators();
        this.essaiForm.controls['nomPays'].clearValidators();
        this.essaiForm.controls['codePays'].clearValidators();
        this.essaiForm.controls['nomRegion'].clearValidators();
        this.essaiForm.controls['codeRegion'].clearValidators();
        this.essaiForm.controls['idRegion'].clearValidators();
        this.essaiForm.controls['nomDepartement'].clearValidators();
        this.essaiForm.controls['codeDepartement'].clearValidators();
        this.essaiForm.controls['idDepartement'].clearValidators();
        this.essaiForm.controls['nomCommune'].clearValidators();
        this.essaiForm.controls['codeCommune'].clearValidators();
        this.essaiForm.controls['idCommune'].clearValidators();
        this.essaiForm.controls['nomLocalite'].clearValidators();
        this.essaiForm.controls['codeLocalite'].clearValidators();
        this.essaiForm.controls['idLocalite'].clearValidators();
        //console.log(this.essaiForm.value)
      } else if(value == 'champ'){
        this.essaiForm.controls['numeroUnion'].clearValidators();
        this.essaiForm.controls['nomUnion'].clearValidators();
        this.essaiForm.controls['idUnion'].clearValidators();

        this.essaiForm.controls['numeroOp'].clearValidators();
        this.essaiForm.controls['nomOp'].clearValidators();
        this.essaiForm.controls['idOp'].clearValidators();

        this.essaiForm.controls['matriculePersonne'].setValidators(Validators.required);
        this.essaiForm.controls['nomPersonne'].setValidators(Validators.required);
        this.essaiForm.controls['idPersonne'].setValidators(Validators.required);
        this.essaiForm.controls['nomChamp'].setValidators(Validators.required);
        this.essaiForm.controls['idChamp'].setValidators(Validators.required);
        this.essaiForm.controls['codeChamp'].setValidators(Validators.required);

        this.essaiForm.controls['idPays'].clearValidators();
        this.essaiForm.controls['nomPays'].clearValidators();
        this.essaiForm.controls['codePays'].clearValidators();
        this.essaiForm.controls['nomRegion'].clearValidators();
        this.essaiForm.controls['codeRegion'].clearValidators();
        this.essaiForm.controls['idRegion'].clearValidators();
        this.essaiForm.controls['nomDepartement'].clearValidators();
        this.essaiForm.controls['codeDepartement'].clearValidators();
        this.essaiForm.controls['idDepartement'].clearValidators();
        this.essaiForm.controls['nomCommune'].clearValidators();
        this.essaiForm.controls['codeCommune'].clearValidators();
        this.essaiForm.controls['idCommune'].clearValidators();
        this.essaiForm.controls['nomLocalite'].clearValidators();
        this.essaiForm.controls['codeLocalite'].clearValidators();
        this.essaiForm.controls['idLocalite'].clearValidators();
      }else if(value == 'pays'){
        this.essaiForm.controls['numeroUnion'].clearValidators();
        this.essaiForm.controls['nomUnion'].clearValidators();
        this.essaiForm.controls['idUnion'].clearValidators();

        this.essaiForm.controls['numeroOp'].clearValidators();
        this.essaiForm.controls['nomOp'].clearValidators();
        this.essaiForm.controls['idOp'].clearValidators();

        this.essaiForm.controls['matriculePersonne'].clearValidators();
        this.essaiForm.controls['nomPersonne'].clearValidators();
        this.essaiForm.controls['idPersonne'].clearValidators();
        this.essaiForm.controls['nomChamp'].clearValidators();
        this.essaiForm.controls['idChamp'].clearValidators();
        this.essaiForm.controls['codeChamp'].clearValidators();

        this.essaiForm.controls['idPays'].setValidators(Validators.required);
        this.essaiForm.controls['nomPays'].setValidators(Validators.required);
        this.essaiForm.controls['codePays'].setValidators(Validators.required);

        this.essaiForm.controls['nomRegion'].clearValidators();
        this.essaiForm.controls['codeRegion'].clearValidators();
        this.essaiForm.controls['idRegion'].clearValidators();
        this.essaiForm.controls['nomDepartement'].clearValidators();
        this.essaiForm.controls['codeDepartement'].clearValidators();
        this.essaiForm.controls['idDepartement'].clearValidators();
        this.essaiForm.controls['nomCommune'].clearValidators();
        this.essaiForm.controls['codeCommune'].clearValidators();
        this.essaiForm.controls['idCommune'].clearValidators();
        this.essaiForm.controls['nomLocalite'].clearValidators();
        this.essaiForm.controls['codeLocalite'].clearValidators();
        this.essaiForm.controls['idLocalite'].clearValidators();
      }else if(value == 'region'){
        this.essaiForm.controls['numeroUnion'].clearValidators();
        this.essaiForm.controls['nomUnion'].clearValidators();
        this.essaiForm.controls['idUnion'].clearValidators();

        this.essaiForm.controls['numeroOp'].clearValidators();
        this.essaiForm.controls['nomOp'].clearValidators();
        this.essaiForm.controls['idOp'].clearValidators();

        this.essaiForm.controls['matriculePersonne'].clearValidators();
        this.essaiForm.controls['nomPersonne'].clearValidators();
        this.essaiForm.controls['idPersonne'].clearValidators();
        this.essaiForm.controls['nomChamp'].clearValidators();
        this.essaiForm.controls['idChamp'].clearValidators();
        this.essaiForm.controls['codeChamp'].clearValidators();

        this.essaiForm.controls['idPays'].setValidators(Validators.required);
        this.essaiForm.controls['nomPays'].setValidators(Validators.required);
        this.essaiForm.controls['codePays'].setValidators(Validators.required);
        
        this.essaiForm.controls['nomRegion'].setValidators(Validators.required);
        this.essaiForm.controls['codeRegion'].setValidators(Validators.required);
        this.essaiForm.controls['idRegion'].setValidators(Validators.required);

        this.essaiForm.controls['nomDepartement'].clearValidators();
        this.essaiForm.controls['codeDepartement'].clearValidators();
        this.essaiForm.controls['idDepartement'].clearValidators();
        this.essaiForm.controls['nomCommune'].clearValidators();
        this.essaiForm.controls['codeCommune'].clearValidators();
        this.essaiForm.controls['idCommune'].clearValidators();
        this.essaiForm.controls['nomLocalite'].clearValidators();
        this.essaiForm.controls['codeLocalite'].clearValidators();
        this.essaiForm.controls['idLocalite'].clearValidators();
      }else if(value == 'departement'){
        this.essaiForm.controls['numeroUnion'].clearValidators();
        this.essaiForm.controls['nomUnion'].clearValidators();
        this.essaiForm.controls['idUnion'].clearValidators();

        this.essaiForm.controls['numeroOp'].clearValidators();
        this.essaiForm.controls['nomOp'].clearValidators();
        this.essaiForm.controls['idOp'].clearValidators();

        this.essaiForm.controls['matriculePersonne'].clearValidators();
        this.essaiForm.controls['nomPersonne'].clearValidators();
        this.essaiForm.controls['idPersonne'].clearValidators();
        this.essaiForm.controls['nomChamp'].clearValidators();
        this.essaiForm.controls['idChamp'].clearValidators();
        this.essaiForm.controls['codeChamp'].clearValidators();

        this.essaiForm.controls['idPays'].setValidators(Validators.required);
        this.essaiForm.controls['nomPays'].setValidators(Validators.required);
        this.essaiForm.controls['codePays'].setValidators(Validators.required);
        
        this.essaiForm.controls['nomRegion'].setValidators(Validators.required);
        this.essaiForm.controls['codeRegion'].setValidators(Validators.required);
        this.essaiForm.controls['idRegion'].setValidators(Validators.required);

        this.essaiForm.controls['nomDepartement'].setValidators(Validators.required);
        this.essaiForm.controls['codeDepartement'].setValidators(Validators.required);
        this.essaiForm.controls['idDepartement'].setValidators(Validators.required);

        this.essaiForm.controls['nomCommune'].clearValidators();
        this.essaiForm.controls['codeCommune'].clearValidators();
        this.essaiForm.controls['idCommune'].clearValidators();
        this.essaiForm.controls['nomLocalite'].clearValidators();
        this.essaiForm.controls['codeLocalite'].clearValidators();
        this.essaiForm.controls['idLocalite'].clearValidators();
      }else if(value == 'commune'){
        this.essaiForm.controls['numeroUnion'].clearValidators();
        this.essaiForm.controls['nomUnion'].clearValidators();
        this.essaiForm.controls['idUnion'].clearValidators();

        this.essaiForm.controls['numeroOp'].clearValidators();
        this.essaiForm.controls['nomOp'].clearValidators();
        this.essaiForm.controls['idOp'].clearValidators();

        this.essaiForm.controls['matriculePersonne'].clearValidators();
        this.essaiForm.controls['nomPersonne'].clearValidators();
        this.essaiForm.controls['idPersonne'].clearValidators();
        this.essaiForm.controls['nomChamp'].clearValidators();
        this.essaiForm.controls['idChamp'].clearValidators();
        this.essaiForm.controls['codeChamp'].clearValidators();

        this.essaiForm.controls['idPays'].setValidators(Validators.required);
        this.essaiForm.controls['nomPays'].setValidators(Validators.required);
        this.essaiForm.controls['codePays'].setValidators(Validators.required);
        
        this.essaiForm.controls['nomRegion'].setValidators(Validators.required);
        this.essaiForm.controls['codeRegion'].setValidators(Validators.required);
        this.essaiForm.controls['idRegion'].setValidators(Validators.required);
        
        this.essaiForm.controls['nomDepartement'].setValidators(Validators.required);
        this.essaiForm.controls['codeDepartement'].setValidators(Validators.required);
        this.essaiForm.controls['idDepartement'].setValidators(Validators.required);

        this.essaiForm.controls['nomCommune'].setValidators(Validators.required);
        this.essaiForm.controls['codeCommune'].setValidators(Validators.required);
        this.essaiForm.controls['idCommune'].setValidators(Validators.required);

        this.essaiForm.controls['nomLocalite'].clearValidators();
        this.essaiForm.controls['codeLocalite'].clearValidators();
        this.essaiForm.controls['idLocalite'].clearValidators();
      }else{
        this.essaiForm.controls['numeroUnion'].clearValidators();
        this.essaiForm.controls['nomUnion'].clearValidators();
        this.essaiForm.controls['idUnion'].clearValidators();

        this.essaiForm.controls['numeroOp'].clearValidators();
        this.essaiForm.controls['nomOp'].clearValidators();
        this.essaiForm.controls['idOp'].clearValidators();

        this.essaiForm.controls['matriculePersonne'].clearValidators();
        this.essaiForm.controls['nomPersonne'].clearValidators();
        this.essaiForm.controls['idPersonne'].clearValidators();
        this.essaiForm.controls['nomChamp'].clearValidators();
        this.essaiForm.controls['idChamp'].clearValidators();
        this.essaiForm.controls['codeChamp'].clearValidators();

        this.essaiForm.controls['idPays'].setValidators(Validators.required);
        this.essaiForm.controls['nomPays'].setValidators(Validators.required);
        this.essaiForm.controls['codePays'].setValidators(Validators.required);
        
        this.essaiForm.controls['nomRegion'].setValidators(Validators.required);
        this.essaiForm.controls['codeRegion'].setValidators(Validators.required);
        this.essaiForm.controls['idRegion'].setValidators(Validators.required);
        
        this.essaiForm.controls['nomDepartement'].setValidators(Validators.required);
        this.essaiForm.controls['codeDepartement'].setValidators(Validators.required);
        this.essaiForm.controls['idDepartement'].setValidators(Validators.required);

        this.essaiForm.controls['nomCommune'].setValidators(Validators.required);
        this.essaiForm.controls['codeCommune'].setValidators(Validators.required);
        this.essaiForm.controls['idCommune'].setValidators(Validators.required);
        
        this.essaiForm.controls['nomLocalite'].setValidators(Validators.required);
        this.essaiForm.controls['codeLocalite'].setValidators(Validators.required);
        this.essaiForm.controls['idLocalite'].setValidators(Validators.required);
      }
    
    }
    contunier(e, target){
      console.log(target)
      e.preventDefault();
      $('#myTab a[href="#'+target+'"]').tab('show');
    }

    showFormioData(idProtocole, data){
      this.formulaireData = [];

      if(idProtocole && idProtocole != ''){
        this.servicePouchdb.findRelationalDocHasMany('formulaireprotocole', 'protocole', idProtocole).then((res) => {
          if(res && res['formulaireprotocoles']){
            for(let f of res['formulaireprotocoles']){
              if(!f.security.deleted){
                this.formulaireData.push(f);
              }
            }
            
            this.formulaireData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            for(let i=0; i < this.formulaireData.length; i++){
              this.showForm(this.formulaireData[i].formData.code, this.formulaireData[i].formioData, data.formioData[this.formulaireData[i].formData.code]);
            }
            
          }
        }).catch((err) => {
          this.formulaireData = [];
          console.log(err)
        });
      }else {
        this.formulaireData = [];
      }
      
    }

  
    ajouter(){
      this.unEssai = null;
      this.nbEtapes = 2;
      this.formulaireData = [];
      this.doModification = false;
      this.start = moment().toISOString();
      
      if(this.idChamp && this.idChamp != ''){
        if(this.essaiHTMLTable && this.essaiHTMLTable.datatable && this.essaiHTMLTable.datatable.row(0) && this.essaiHTMLTable.datatable.row(0).data()){
          this.idPersonne = this.essaiHTMLTable.datatable.row(0).data().idPersonne;
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('champ', this.idChamp).then((res) => {
            if(res && res.champs){
              this.idPersonne = res.champs[0].personne;
            }
          })
        }
      }else if(this.idProtocole && this.idProtocole != ''){
        if(this.essaiHTMLTable && this.essaiHTMLTable.datatable && this.essaiHTMLTable.datatable.row(0) && this.essaiHTMLTable.datatable.row(0).data()){
          this.idPartenaire = this.essaiHTMLTable.datatable.row(0).data().idInstitution;
          this.idProjet = this.essaiHTMLTable.datatable.row(0).data().numeroProjet;
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('protocole', this.idProtocole).then((res) => {
            if(res && res.protocoles){
              this.idPartenaire = res.protocoles[0].partenaire;
              this.idProjet = res.protocoles[0].projet;
            }
          })
        }
      }else if(this.idProjet && this.idProjet != ''){
        if(this.essaiHTMLTable && this.essaiHTMLTable.datatable && this.essaiHTMLTable.datatable.row(0) && this.essaiHTMLTable.datatable.row(0).data()){
          this.idPartenaire = this.essaiHTMLTable.datatable.row(0).data().idInstitution;
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('projet', this.idProjet).then((res) => {
            if(res && res.projets){
              this.idPartenaire = res.projets[0].partenaire;
            }
          })
        }
      }
  
      //this.getInstitution();
      this.getProjetParDateCollecte(moment().toISOString());
      
      //this.getProjet();
      this.initForm();
      this.iniDateCollectePicker('dateCollecte');
      this.initSelect2('idInstitution', this.translate.instant('ESSAI_PAGE.SELECTIONINSTITUTION'));
      this.initSelect2('idProjet', this.translate.instant('ESSAI_PAGE.SELECTIONPROJET'));
      this.initSelect2('idProtocole', this.translate.instant('ESSAI_PAGE.SELECTIONPROTOCOLE'));
      //this.initSelect2('idPersonne', this.translate.instant('ESSAI_PAGE.SELECTIONPERSONNE'));
      //this.initSelect2('idChamp', this.translate.instant('ESSAI_PAGE.SELECTIONCHAMP'));
      
      /*this.initSelect2('idPays', this.translate.instant('ESSAI_PAGE.SELECTIONPAYS'));
      this.initSelect2('idRegion', this.translate.instant('ESSAI_PAGE.SELECTIONREGION'));
      this.initSelect2('idDepartement', this.translate.instant('ESSAI_PAGE.SELECTIONDEPARTEMENT'));
      this.initSelect2('idCommune', this.translate.instant('ESSAI_PAGE.SELECTIONCOMMUNE'));
      this.initSelect2('idLocalite', this.translate.instant('ESSAI_PAGE.SELECTIONLOCALITE'));
      */
      //this.initSelect2('domaine', this.translate.instant('ESSAI_PAGE.DOMAINE'));
      
      this.action = 'ajouter';
      this.wizarAction();
    }
  
    infos(u){
      if(global.controlAccesModele('essais', 'lecture')){
        if(!this.estModeCocherElemListe){
          this.unEssaiDoc = null;
          this.unEssai = u;
          let id;
          
          if(isObject(u)){
            id = u.id;
          }else{
            id = u;
          }
  
          this.action = 'infos';
          this.servicePouchdb.findRelationalDocByID('collectedonnee', id).then((res) => {
            
            if(res && res.collectedonnees[0]){
              this.unEssaiDoc = res;
              this.rev = res.collectedonnees[0].rev.substring(0, res.collectedonnees[0].rev.indexOf('-'));
              //console.log(this.unEssaiDoc.collectedonnees[0])
              this.showFormioData(res.collectedonnees[0].protocole, res.collectedonnees[0])
            }
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
          });
            
        }
      }
      
    }

  
    modifier(essai){
      //console.log(essai)
      if(global.controlAccesModele('essais', 'modification')){
        this.nbEtapes = 2;
        let id;
        if(isObject(essai)){
          id = essai.id;
        }else{
          id = essai;
        }
  
        this.doModification = true;
        this.start = moment().toISOString();
        //si l'utilisateur est passé par infos pour faire la modificatin
        if(this.action == 'infos' && this.unEssaiDoc){
            this.editForm(this.clone(this.unEssaiDoc));
            this.unEssaiDoc = this.unEssaiDoc.collectedonnees[0];
  
            //this.getInstitution();
  
            //this.getProjetParInstitution(this.unEssaiDoc.partenaire);
            this.getProjetParDateCollecte(this.unEssaiDoc.formData.dateCollecte)
            this.getProtocoleParProjet(this.unEssaiDoc.projet);
            this.getPersonne();
            this.getChampParPersonne(this.unEssaiDoc.personne);


            this.getPays();
              //console.log(pDoc)
            if(this.unEssaiDoc.pays)
              this.getRegionParPays(this.unEssaiDoc.pays);
            if(this.unEssaiDoc.region)
              this.getDepartementParRegion(this.unEssaiDoc.region);
            if(this.unEssaiDoc.departement)
              this.getCommuneParDepartement(this.unEssaiDoc.departement);
            if(this.unEssaiDoc.commune)
              this.getLocaliteParCommune(this.unEssaiDoc.commune);
            

            //this.getFormulaireParProtocole(this.unEssaiDoc.protocole);
            this.initFormioFromShow();
  
            //this.editForm(res);
            this.iniDateCollectePicker('dateCollecte');
            this.initSelect2('idInstitution', this.translate.instant('ESSAI_PAGE.SELECTIONINSTITUTION'));
            this.initSelect2('idProjet', this.translate.instant('ESSAI_PAGE.SELECTIONPROJET'));
            this.initSelect2('idProtocole', this.translate.instant('ESSAI_PAGE.SELECTIONPROTOCOLE'));   
            this.initSelect2('idPersonne', this.translate.instant('ESSAI_PAGE.SELECTIONPERSONNE'));
            this.initSelect2('idChamp', this.translate.instant('ESSAI_PAGE.SELECTIONCHAMP'));       
           
            this.initSelect2('idPays', this.translate.instant('ESSAI_PAGE.SELECTIONPAYS'));
            this.initSelect2('idRegion', this.translate.instant('ESSAI_PAGE.SELECTIONREGION'));
            this.initSelect2('idDepartement', this.translate.instant('ESSAI_PAGE.SELECTIONDEPARTEMENT'));
            this.initSelect2('idCommune', this.translate.instant('ESSAI_PAGE.SELECTIONCOMMUNE'));
            this.initSelect2('idLocalite', this.translate.instant('ESSAI_PAGE.SELECTIONLOCALITE'));
  
            this.action ='modifier';
            this.wizarAction();
        }else{
          this.unEssaiDoc = null;
          this.servicePouchdb.findRelationalDocByID('collectedonnee', id).then((res) => {
          
            if(res && res.collectedonnees[0]){
              let oDoc = res.collectedonnees[0];
              this.unEssaiDoc = oDoc;
              this.editForm(res);
              //this.getInstitution();
    
              //this.getProjetParInstitution(this.unEssaiDoc.partenaire);
              this.getProjetParDateCollecte(this.unEssaiDoc.formData.dateCollecte)
              this.getProtocoleParProjet(this.unEssaiDoc.projet);
              this.getFormulaireParProtocole(this.unEssaiDoc.protocole);
              this.getPersonne();
              this.getChampParPersonne(this.unEssaiDoc.personne);
              
              this.getPays();
              //console.log(pDoc)
              if(this.unEssaiDoc.pays)
                this.getRegionParPays(this.unEssaiDoc.pays);
              if(this.unEssaiDoc.region)
                this.getDepartementParRegion(this.unEssaiDoc.region);
              if(this.unEssaiDoc.departement)
                this.getCommuneParDepartement(this.unEssaiDoc.departement);
              if(this.unEssaiDoc.commune)
                this.getLocaliteParCommune(this.unEssaiDoc.commune);
              

              this.iniDateCollectePicker('dateCollecte');
              this.initSelect2('idInstitution', this.translate.instant('ESSAI_PAGE.SELECTIONINSTITUTION'));
              this.initSelect2('idProjet', this.translate.instant('ESSAI_PAGE.SELECTIONPROJET'));
              this.initSelect2('idProtocole', this.translate.instant('ESSAI_PAGE.SELECTIONPROTOCOLE'));          
              this.initSelect2('idPersonne', this.translate.instant('ESSAI_PAGE.SELECTIONPERSONNE'));
              this.initSelect2('idChamp', this.translate.instant('ESSAI_PAGE.SELECTIONCHAMP'));       
             

              this.initSelect2('idPays', this.translate.instant('ESSAI_PAGE.SELECTIONPAYS'));
              this.initSelect2('idRegion', this.translate.instant('ESSAI_PAGE.SELECTIONREGION'));
              this.initSelect2('idDepartement', this.translate.instant('ESSAI_PAGE.SELECTIONDEPARTEMENT'));
              this.initSelect2('idCommune', this.translate.instant('ESSAI_PAGE.SELECTIONCOMMUNE'));
              this.initSelect2('idLocalite', this.translate.instant('ESSAI_PAGE.SELECTIONLOCALITE'));
  
              if(!isObject(essai)){
                for(let u of this.essaisData){
                  if(u.id == id){
                    this.unEssai = u;
                    break;
                  }
                }
              }else{
                this.unEssai = essai;
              }
    
              this.action ='modifier';
              this.wizarAction();
            }
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
          })
        }
        
      }
      
    }

    showForm(id, form, data){
      $('#show-'+id).ready(() => {
        var formElement = document.getElementById('show-'+id);
        var opts = {
          readOnly: true,
          language: global.langue,
          i18n: {
            fr: global.formio_fr
          }
        };

        if(formElement){
          formElement.innerHTML = '';
        }
        
        Formio.createForm(formElement, form, opts).then((form) => {
          //charger les données
          form.submission = {
            data: data
          };
        });
        
      })
    }
   

    renderFormulaireProtocole(id, form, data = {}){
      var self = this;
      //this.formioForms = [];
      //this.formioFormsData = {};
      $('#'+id).ready(() => {
        var formElement = document.getElementById(id);
        var opts = {
          language: global.langue,
          i18n: {
            fr: global.formio_fr
          }
        };

        formElement.innerHTML = '';
        Formio.createForm(formElement, form, opts).then((form) => {
          //charger les données
          form.submission = {
            data: data
          };

          //gestion des evènement
          form.on('submit', (submission) => {
            submission.data.submit = true;
            self.formioFormsData[id] = submission.data;
            //console.log(self.formioForms);
            //console.log(submission.data);
          });

          form.on('change', (c) => {
            if(self.formioFormsData[id] && self.formioFormsData[id].submit){
              self.formioFormsData[id].submit = false;
            }
            //console.log('ch '+ c);
          })

          self.formioForms[id] = form;
        });
      })
    }
  
    exportPDF(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('essai-datatable').innerHTML], {
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
    if ((!index || i === index) && key/* && value*/) {
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

                this.servicePouchdb.findRelationalDocByID('collectedonnee', u.id).then((res) => {
                  res.collectedonnees[0].security = this.servicePouchdb.garderDeleteTrace(res.collectedonnees[0].security);

                  this.servicePouchdb.updateRelationalDoc(res.collectedonnees[0]).then((res) => {
                    //mise à jour de la liste si mobile et mode liste
                    if(this.essaisData.indexOf(u) !== -1){
                      this.essaisData.splice(this.essaisData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant')
                    }

                    this.action = 'liste';

                    if(!this.mobile){
                      //sinion dans le tableau
                      this.dataTableRemoveRows();
                    }else{
                      this.essaisData = [...this.essaisData];
                      if(this.allEssaisData.indexOf(u) !== -1){
                        this.allEssaisData.splice(this.allEssaisData.indexOf(u), 1);
                      }else{
                        console.log('echec splice, index inexistant dans allEssaisData')
                      }
                    }
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }else{

                this.servicePouchdb.findRelationalDocByID('collectedonnee', u.id).then((res) => {
                 this.servicePouchdb.deleteRelationalDocDefinitivement(res.collectedonnees[0]).then((res) => {

                  //mise à jour de la liste si mobile et mode liste
                  if(this.essaisData.indexOf(u) !== -1){
                    this.essaisData.splice(this.essaisData.indexOf(u), 1);
                  }else{
                    console.log('echec splice, index inexistant')
                  }

                  this.action = 'liste';
                  if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                    //sinion dans le tableau
                    this.dataTableRemoveRows();
                  }else{
                    this.essaisData = [...this.essaisData];
                    if(this.allEssaisData.indexOf(u) !== -1){
                      this.allEssaisData.splice(this.allEssaisData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant dans allEssaisData')
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
  
    
    async presentProtocole(idProtocole) {
      const modal = await this.modalController.create({
        component: ProtocolePage,
        componentProps: { 
          idModele: 'essais', idProtocole: idProtocole },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async presentProjet(idProjet) {
      const modal = await this.modalController.create({
        component: ProjetPage,
        componentProps: { 
          idModele: 'essais', idProjet: idProjet },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async presentInstitution(idPartenaire) {
      const modal = await this.modalController.create({
        component: PartenairePage,
        componentProps: { 
          idModele: 'essais', idPartenaire: idPartenaire },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentPersonne(idPersonne) {
      const modal = await this.modalController.create({
        component: PersonnesPage,
        componentProps: {
          idModele: 'essais', idPersonne: idPersonne },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentChamp(idChamp) {
      const modal = await this.modalController.create({
        component: ChampPage,
        componentProps: { 
          idModele: 'essais', idChamp: idChamp },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
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
                //var u = this.essaisData[i];
                this.servicePouchdb.findRelationalDocByID('collectedonnee', id).then((res) => {
                  res.collectedonnees[0].security = this.servicePouchdb.garderArchivedTrace(res.collectedonnees[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.collectedonnees[0]).catch((err) => {
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
                this.essaisData = [...this.removeMultipleElem(this.essaisData, ids)];
                this.allEssaisData = this.removeMultipleElem(this.allEssaisData, ids);
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
                this.servicePouchdb.findRelationalDocByID('collectedonnee', id).then((res) => {
                  res.collectedonnees[0].security = this.servicePouchdb.garderDesarchivedTrace(res.collectedonnees[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.collectedonnees[0]).catch((err) => {
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
                this.essaisData = [...this.removeMultipleElem(this.essaisData, ids)]; 
                this.allEssaisData = this.removeMultipleElem(this.allEssaisData, ids);
                
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
      this.essaisData.forEach((u) => {
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
        componentProps: {
          "options": {
            idModele: 'essais', 
            "estModeCocherElemListe": this.estModeCocherElemListe,
            "dataLength": this.essaisData.length,
            "selectedIndexesLength": this.selectedIndexes.length,
            "styleAffichage": this.styleAffichage,
            "action": this.action
          }
        },
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
          this.getEssaisByType('liste');
        }  else  if(dataReturned !== null && dataReturned.data == 'archives') {
          this.estModeCocherElemListe = false;
          this.getEssaisByType('archives');
        }  else  if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.estModeCocherElemListe = false;
          this.getEssaisByType('corbeille');
        }  else  if(dataReturned !== null && dataReturned.data == 'partages') {
          this.estModeCocherElemListe = false;
          this.getEssaisByType('partages');
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
       let data = [...this.essaisData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_ESSAIs_'+date+'.xls', blob).then(()=> {
           alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
       }).catch(()=>{
           alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
       });
     }
   
     exportCSV(){
       let data = [...this.essaisData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_ESSAIs_'+date+'.csv', blob).then(()=> {
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
          //"dataLength": this.essaisData.length,
          //"selectedIndexesLength": this.selectedIndexes.length,
          //"styleAffichage": this.styleAffichage,
          idModele: 'essais', 
          "action": this.cacheAction
      /*}*/},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'modifier') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unEssai.id);
          }
          this.modifier(this.selectedIndexes[0]);
          this.decocherTousElemListe();
          this.estModeCocherElemListe = false;
          //this.changerModeCocherElemListe();
        }else  if(dataReturned !== null && dataReturned.data == 'desarchiver') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unEssai.id);
          }
          

          this.desarchivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else  if(dataReturned !== null && dataReturned.data == 'archiver') {
          if(this.action == 'infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unEssai.id);
          }
          

          this.archivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        } else  if(dataReturned !== null && dataReturned.data == 'restaurer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unEssai.id);
          }
          

          this.restaurationMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else if(dataReturned !== null && dataReturned.data == 'derniereModification') {
          this.selectedItemDerniereModification();          
        }else if(dataReturned !== null && dataReturned.data == 'partager') {
          //this.changeStyle();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unEssai.id);
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
      if(this.essaisData.length != this.selectedIndexes.length) {
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
                  this.servicePouchdb.findRelationalDocByID('collectedonnee', id).then((res) => {
                    res.collectedonnees[0].security = this.servicePouchdb.garderDeleteTrace(res.collectedonnees[0].security);
                    this.servicePouchdb.updateRelationalDoc(res.collectedonnees[0]).catch((err) => {
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
                  this.essaisData = [...this.removeMultipleElem(this.essaisData, ids)];
                  this.allEssaisData = this.removeMultipleElem(this.allEssaisData, ids);
                  
                  //if(this.action != 'infos'){
                    this.estModeCocherElemListe = false;
                    this.decocherTousElemListe();
                  //}
                  //this.action = this.cacheAction;
                }
              }else{

                //suppresion multiple définitive
                for(let id of ids){
                  
                  this.servicePouchdb.findRelationalDocByID('collectedonnee', id).then((res) => {
                    this.servicePouchdb.deleteRelationalDocDefinitivement(res.collectedonnees[0]).catch((err) => {
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
                  this.essaisData = [...this.removeMultipleElem(this.essaisData, ids)];
                  this.allEssaisData = [...this.removeMultipleElem(this.allEssaisData, ids)];

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
                
                this.servicePouchdb.findRelationalDocByID('collectedonnee', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.collectedonnees[0]).catch((err) => {
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
                this.essaisData = [...this.removeMultipleElem(this.essaisData, ids)];
                this.allEssaisData = this.removeMultipleElem(this.allEssaisData, ids);
                
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
                
                this.servicePouchdb.findRelationalDocByID('collectedonnee', id).then((res) => {
                  res.collectedonnees[0].security = this.servicePouchdb.garderRestaureTrace(res.collectedonnees[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.collectedonnees[0]).catch((err) => {
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
                this.essaisData = [...this.removeMultipleElem(this.essaisData, ids)];
                this.allEssaisData = [...this.removeMultipleElem(this.allEssaisData, ids)];
                
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
        codes.push(this.unEssai.id);
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
        //this.action = "infos";
        this.infos(this.unEssai)
      }else{
        this.action = 'liste';
        //this.actualiserTableau(this.essaisData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        //this.action = "infos";
        this.infos(this.unEssai)
      }else{
        //this.action = 'liste';
        this.action = this.cacheAction; 
        //recharger la liste
        if(this.rechargerListeMobile){
          this.essaisData = [...this.essaisData];
          this.rechargerListeMobile = false;
        }
        ///this.actualiserTableau(this.essaisData);
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
              this.infos(this.essaisData[this.selectedIndexes[0]]);
              //this.selectedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRESSAI'));
            }
          }
        }, {
          text: this.translate.instant('GENERAL.MODIFIER'),
          icon: 'create',
          handler: () => {
            if(this.selectedIndexes.length == 1){
              this.modifier(this.essaisData[this.selectedIndexes[0]]);
              //this.selectedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRESSAI'))
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
          idModele: 'essais'},
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
            this.infos(this.essaisData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRESSAI'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.essaisData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRESSAI'))
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
          idModele: 'essais', "action": this.action, "recherchePlus": this.recherchePlus, "filterAjouter": this.filterAjouter},
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
          this.getEssaisByType('corbeille');
        } else if(dataReturned !== null && dataReturned.data == 'archives') {
          this.getEssaisByType('archives');
        } else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getEssaisByType('partages');
        } else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          //this.getEssaisByType('conflits');
        } else if(dataReturned !== null && dataReturned.data == 'liste') {
          this.getEssaisByType('liste');
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
          idModele: 'essais'},
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
          idModele: 'essais', action: this.action},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'listePrincipale') {
          this.getEssaisByType('liste');
        }else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getEssaisByType('partages');
        }else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          this.cacheAction = 'conflits';
          this.getEssaiWithConflicts();
          //this.getEssai();
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

    getEssaiWithConflicts(event = null){
      this.action = 'conflits';
      this.cacheAction = 'conflits';
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;
      let cols = [];
      this.colonnes = [];

      this.servicePouchdb.findRelationalDocInConflict('collectedonnee').then((res) => {
        if(res){
          let essaisData = [];
          let institutionIndex = [];
          let projetIndex = [];
          let protocoleIndex = [];
          let personneIndex = [];
          let champIndex = [];
          let idInstitution, idProjet, idProtocole, idPersonne, idChamp;
          for(let u of res.collectedonnees){
            //supprimer l'historique de la liste
            delete u.security['shared_history'];

            if(u.partenaire && u.partenaire != ''){
              if(isDefined(institutionIndex[u.partenaire])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.numero, 2);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.nom, 3);
                idInstitution = res.partenaires[institutionIndex[u.partenaire]].id;
              }else{
                for(let i=0; i < res.partenaires.length; i++){
                  if(res.partenaires[i].id == u.partenaire){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                    institutionIndex[u.partenaire] = i;
                    idInstitution =  res.partenaires[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', null, 2);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', null, 3);
              idInstitution = null;
            }

            if(u.projet && u.projet != ''){
              if(isDefined(projetIndex[u.projet])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[projetIndex[u.projet]].formData.numero, 4);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[projetIndex[u.projet]].formData.nom, 5);
                idProjet = res.projets[projetIndex[u.projet]].id;
              }else{
                for(let i=0; i < res.projets.length; i++){
                  if(res.projets[i].id == u.projet){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[i].formData.numero, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[i].formData.nom, 5);
                    projetIndex[u.projet] = i;
                    idProjet = res.projets[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', null, 4);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', null, 5);
              idProjet = null;
            }

            if(u.protocole && u.protocole != ''){
              if(isDefined(protocoleIndex[u.projet])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.numero, 6);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.nom, 7);
                idProtocole = res.protocoles[protocoleIndex[u.protocole]].id;
              }else{
                for(let i=0; i < res.protocoles.length; i++){
                  if(res.protocoles[i].id == u.protocole){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[i].formData.numero, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[i].formData.nom, 7);
                    protocoleIndex[u.protocole] = i;
                    idProtocole = res.protocoles[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', null, 6);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', null, 7);
              idProtocole = null;
            }

            if(u.personne && u.personne != ''){
              if(isDefined(personneIndex[u.personne])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[personneIndex[u.personne]].formData.matricule, 8);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[personneIndex[u.personne]].formData.nom, 9);
                u.formData.prenomPersonne = res.personnes[personneIndex[u.personne]].formData.prenom
                idPersonne = res.personnes[personneIndex[u.personne]].id;
              }else{
                for(let i=0; i < res.personnes.length; i++){
                  if(res.personnes[i].id == u.personne){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[i].formData.matricule, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[i].formData.nom, 9);
                    u.formData.prenomPersonne = res.personnes[i].formData.prenom
                    personneIndex[u.personne] = i;
                    idPersonne = res.personnes[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', null, 8);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', null, 9);
              u.formData.prenomPersonne = null;
              idPersonne = null;
            }

            if(u.champ && u.champ != ''){
              if(isDefined(champIndex[u.champ])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[champIndex[u.champ]].formData.code, 10);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[champIndex[u.champ]].formData.nom, 11);
                idChamp = res.champs[champIndex[u.champ]].id;
              }else{
                for(let i=0; i < res.champs.length; i++){
                  if(res.champs[i].id == u.champ){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[i].formData.code, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[i].formData.nom, 11);
                    champIndex[u.champ] = i;
                    idChamp = res.champs[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', null, 10);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', null, 11);
              idChamp = null;
            }

            //union
            if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].union){
              for(let i=0; i < res.unions.length; i++){
                if(res.unions[i].id == res.personnes[personneIndex[u.personne]].union){
                  u.formData.numeroUnion = res.unions[i].formData.numero
                  u.formData.nomUnion = res.unions[i].formData.nom
                  break;
                }
              }
            }

            //op
            if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].op){
              for(let i=0; i < res.ops.length; i++){
                if(res.ops[i].id == res.personnes[personneIndex[u.personne]].op){
                  u.formData.numeroOP = res.ops[i].formData.numero
                  u.formData.nomOP = res.ops[i].formData.nom
                  break;
                }
              }
            }
            

            //communes
            if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].commune){
              for(let i=0; i < res.communes.length; i++){
                if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                  u.formData.codeSite = res.communes[i].formData.code
                  u.formData.nomSite = res.communes[i].formData.nom
                  break;
                }
              }
            }
            
            //localité
            if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].localite){
              for(let i=0; i < res.localites.length; i++){
                if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                  u.formData.codeLocalite = res.localites[i].formData.code
                  u.formData.nomLocalite = res.localites[i].formData.nom
                  break;
                }
              }
            }
            
            /*for(let i=0; i < res.communes.length; i++){
              if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                u.formData.codeSite = res.communes[i].formData.code
                u.formData.nomSite = res.communes[i].formData.nom
                //champIndex[u.champ] = i;
                //idChamp = res.champs[i].id;
                break;
              }
            }

            //localité
            for(let i=0; i < res.localites.length; i++){
              if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                u.formData.codeLocalite = res.localites[i].formData.code
                u.formData.nomLocalite = res.localites[i].formData.nom
                //champIndex[u.champ] = i;
                //idChamp = res.champs[i].id;
                break;
              }
            }*/
            
              
              /*//communes
              if(res.champs[champIndex[u.champ]].commune && res.champs[champIndex[u.champ]].commune != ''){
                /*if(isDefined(communeIndex[res.champs[champIndex[u.champ]].commune])){
                  u.formData.codeSite = res.champs[champIndex[u.champ]].formData.code
                  u.formData.nomSite = res.champs[champIndex[u.champ]].formData.nom
                }else{*****
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                      u.formData.codeSite = res.communes[i].formData.code
                      u.formData.nomSite = res.communes[i].formData.nom
                      //champIndex[u.champ] = i;
                      //idChamp = res.champs[i].id;
                      break;
                    }
                  }
               // }  
              }else{
                //collone vide
                u.formData.codeSite = null
                u.formData.nomSite = null
              }

              if(res.champs[champIndex[u.champ]].localite && res.champs[champIndex[u.champ]].localite != ''){
                /*if(isDefined(localiteIndex[res.champs[champIndex[u.champ]].localite])){
                  u.formData.codeLocalite = res.champs[champIndex[u.champ]].formData.code
                  u.formData.nomLocalite = res.champs[champIndex[u.champ]].formData.nom
                }else{***
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                      u.formData.codeLocalite = res.localites[i].formData.code
                      u.formData.nomLocalite = res.localites[i].formData.nom
                      //champIndex[u.champ] = i;
                      //idChamp = res.champs[i].id;
                      break;
                    }
                  }
               // }  
              }else{
                //collone vide
                u.formData.codeLocalite = null
                u.formData.nomLocalite = null
              }*/


            essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, idPersonne: idPersonne, idChamp: idChamp, ...u.formData, ...u.formioData[Object.keys(u.formioData)[0]], ...u.security});
            cols = Array.from(new Set(cols.concat(keys(u.formioData[Object.keys(u.formioData)[0]]))));
          }

          cols.sort((a, b) => {
            return this.formKeys.indexOf(a) - this.formKeys.indexOf(b)
            /*if (a < b) {
              return -1;
            }
            if (a > b) {
              return 1;
            }
            return 0;*/
          });

          this.colonnes = this.tmpColonnes.concat(cols);

          if(this.mobile){
            this.essaisData = essaisData;
            if(this.essaisData[0].parcelle){
              this.essaisData.sort((a, b) => {
                if (a.parcelle < b.parcelle) {
                  return -1;
                }
                if (a.parcelle > b.parcelle) {
                  return 1;
                }
                return 0;
              });
            }else if(this.essaisData[0].variete){
              this.essaisData.sort((a, b) => {
                if (a.variete < b.variete) {
                  return -1;
                }
                if (a.variete > b.variete) {
                  return 1;
                }
                return 0;
              });
            }else{
              this.essaisData.sort((a, b) => {
                if (a.nomPersonne < b.nomPersonne) {
                  return -1;
                }
                if (a.nomPersonne > b.nomPersonne) {
                  return 1;
                }
                return 0;
              });
            }
            

            this.allEssaisData = [...this.allEssaisData]
          } else{
            $('#essai').ready(()=>{
              if(global.langue == 'en'){
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
              }else{
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
              }
              this.attacheEventToDataTable(this.essaiHTMLTable.datatable, 'essai');
            });
          }
        }
        if(event)
          event.target.complete();
      }).catch((err) => {
        this.essais = [];
        this.essaisData = [];
        this.allEssaisData = [];
        this.selectedIndexes = [];
        console.log(err)
        if(event)
          event.target.complete();
      });
    }

    getEssaisByType(type){
      this.action = type;
      this.cacheAction = type;
      this.getEssai();
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
          idModele: 'essais', "action": this.action, "cacheAction": this.cacheAction},
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
    
    async presentDerniereModification(essai) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { 
          idModele: 'essais', _id: essai.id, _rev: essai.rev, security: essai.security },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      let id
      if(this.action == 'infos'){
        id = this.unEssai.id;
      }else{
        id = this.selectedIndexes[0];
      }


      if(id && id != ''){
        this.servicePouchdb.findRelationalDocByID('collectedonnee', id).then((res) => {
          if(res && res.collectedonnees[0]){
            if(this.estModeCocherElemListe){
              this.estModeCocherElemListe = false;
              this.decocherTousElemListe();
            }
            this.presentDerniereModification(res.collectedonnees[0]);
          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          }
        });
        //this.selectedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRESSAI'));
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
      var i = this.essaiHTMLTable.datatable.row('.selected').index();

      if(this.essaiHTMLTable.datatable.row(i).next()){
        this.next = true;
      }else{
        this.next = false;
      }

      if(this.essaiHTMLTable.datatable.row(i).prev()){
        this.prev = true;
      }else{
        this.prev = false;
      }
    }

    datatableNextRow(){
      //datatable.row(this.selectedIndexes).next().data();
      var i = this.essaiHTMLTable.datatable.row('.selected').index();
      if(this.essaiHTMLTable.datatable.row(i).next()){
        //this.essaiHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.essaiHTMLTable.datatable.rows().deselect();
        this.essaiHTMLTable.datatable.row(i).next().select();
        this.selectedItemInfo();
        
        if(this.essaiHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }else{
        this.next = false;

        if(this.essaiHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }
    }

    datatablePrevRow(){
      //datatable.row(this.selectedIndexes).prev().data();
      var i = this.essaiHTMLTable.datatable.row('.selected').index();
      if(this.essaiHTMLTable.datatable.row(i).prev()){
        //this.essaiHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.essaiHTMLTable.datatable.rows().deselect();
        this.essaiHTMLTable.datatable.row(i).prev().select();
        this.selectedItemInfo();
        
        if(this.essaiHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }else{
        this.prev = false;

        if(this.essaiHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }
    }

    datatableDeselectMultipleSelectedItemForModification(){
      if(this.selectedIndexes.length > 1){
        var i = this.essaiHTMLTable.datatable.row('.selected').index();
        this.essaiHTMLTable.datatable.rows().deselect();
        this.essaiHTMLTable.datatable.row(i).select();
      }
    }

    selectedItemInfo(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.essaiHTMLTable.datatable.row('.selected').index();
      let data  = this.essaiHTMLTable.datatable.row(row).data();

      this.infos(data);
      this.initDatatableNextPrevRow();
        //this.selectedIndexes = [];
      //}else{
      //  alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRESSAI'));
      //}
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.essaiHTMLTable.datatable.row('.selected').index();
      let data  = this.essaiHTMLTable.datatable.row(row).data();

      this.modifier(data);

        //this.selectedIndexes = [];
      //}else{
       // alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRESSAI'))
      //}
    }
  
  
    onSubmit(){
      let formData = this.essaiForm.value;
      //let formioData = {};
      for(let id of Object.keys(this.formioFormsData)){
        delete this.formioFormsData[id].submit
      }
      if(this.action === 'ajouter'){
        //créer un nouveau essai
      
        let essai: any = {
          //_id: 'fuma:essai:'+data.numero,
          //id: formData.numero,
          type: 'collectedonnee',
          partenaire: formData.idInstitution, //relation avec la fédération
          projet: formData.idProjet,
          protocole: formData.idProtocole,
          personne: formData.idPersonne,
          champ: formData.idChamp,
          union: formData.idUnion,
          op: formData.idOp,

          pays: formData.idPays,
          region: formData.idRegion,
          departement: formData.idDepartement,
          commune: formData.idCommune,
          localite: formData.idLocalite,
  
          formData: formData,
          //pour le customisation
          formioData: this.formioFormsData,
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

        essai.security = this.servicePouchdb.garderCreationTrace(essai.security);

        //ne pas sauvegarder les information relative à la fédération dans l'objet essai
        //relation-pour va faire le mapping à travers la propriété projet se trouvant dans l'objet essai
        let doc = this.clone(essai);
        delete doc.formData.idProtocole;
        delete doc.formData.numeroProtocole;
        delete doc.formData.nomProtocole;
        delete doc.formData.idProjet;
        delete doc.formData.numeroProjet;
        delete doc.formData.nomProjet;
        delete doc.formData.idInstitution;
        delete doc.formData.numeroInstitution;
        delete doc.formData.nomInstitution;
        delete doc.formData.idPersonne;
        delete doc.formData.matriculePersonne;
        delete doc.formData.nomPersonne;
        delete doc.formData.idChamp;
        delete doc.formData.codeChamp;
        delete doc.formData.nomChamp;

        delete doc.formData.idOp;
        delete doc.formData.numeroOp;
        delete doc.formData.nomOp;
        delete doc.formData.idUnion;
        delete doc.formData.numeroUnion;
        delete doc.formData.nomUnion;

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
        delete doc.formData.idLocalite;
        delete doc.formData.codeLocalite;
        delete doc.formData.nomLocalite;
        

        //console.log(doc)

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let essaiData = {id: res.collectedonnees[0].id,...essai.formData, ...essai.formioData, ...essai.security};
          //this.essais = essai;
          //essai._rev = res.collectedonnees[0].rev;
          //this.essais.push(essai);
          this.action = 'liste';
          //this.rechargerListeMobile = true;
          if(!this.mobile){
            //mode tableau, ajout d'un autre essai dans la liste
            this.dataTableAddRow(essaiData)
          }else{
            //mobile, cache la liste des essai pour mettre à jour la base de données
            this.essaisData.push(essaiData);
            if(this.essaisData[0].parcelle){
              this.essaisData.sort((a, b) => {
                if (a.parcelle < b.parcelle) {
                  return -1;
                }
                if (a.parcelle > b.parcelle) {
                  return 1;
                }
                return 0;
              });
            }else if(this.essaisData[0].variete){
              this.essaisData.sort((a, b) => {
                if (a.variete < b.variete) {
                  return -1;
                }
                if (a.variete > b.variete) {
                  return 1;
                }
                return 0;
              });
            }else{
              this.essaisData.sort((a, b) => {
                if (a.nomPersonne < b.nomPersonne) {
                  return -1;
                }
                if (a.nomPersonne > b.nomPersonne) {
                  return 1;
                }
                return 0;
              });
            }

            this.essaisData = [...this.essaisData];

            this.allEssaisData.push(essaiData);
            if(this.allEssaisData[0].parcelle){
              this.allEssaisData.sort((a, b) => {
                if (a.parcelle < b.parcelle) {
                  return -1;
                }
                if (a.parcelle > b.parcelle) {
                  return 1;
                }
                return 0;
              });
            }else if(this.allEssaisData[0].variete){
              this.allEssaisData.sort((a, b) => {
                if (a.variete < b.variete) {
                  return -1;
                }
                if (a.variete > b.variete) {
                  return 1;
                }
                return 0;
              });
            }else{
              this.allEssaisData.sort((a, b) => {
                if (a.nomPersonne < b.nomPersonne) {
                  return -1;
                }
                if (a.nomPersonne > b.nomPersonne) {
                  return 1;
                }
                return 0;
              });
            }

          }
          //this.htmlTableAction = 'recharger';

          //initialiser la liste des essais
          //this.creerEssai(essaiData.numeroEssai);
          
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
  
      }else{
        //si modification
        this.unEssaiDoc.protocole = formData.idProtocole;
        this.unEssaiDoc.projet = formData.idProjet;
        this.unEssaiDoc.partenaire = formData.idInstitution;
        this.unEssaiDoc.personne = formData.idPersonne;
        this.unEssaiDoc.champ = formData.idChamp;

        this.unEssaiDoc.union = formData.idUnion;
        this.unEssaiDoc.op = formData.idOp;

        this.unEssaiDoc.pays = formData.idPays;
        this.unEssaiDoc.region = formData.idRegion;
        this.unEssaiDoc.departement = formData.idDepartement;
        this.unEssaiDoc.commune = formData.idCommune;
        this.unEssaiDoc.localite = formData.idLocalite;
        
        this.unEssaiDoc.formData = formData;
        this.unEssaiDoc.formioData = this.formioFormsData;

        //this.unEssai = essaiData;
        this.unEssaiDoc.security.update_start = this.start;
        this.unEssaiDoc.security.update_start = moment().toISOString();
        this.unEssaiDoc.security = this.servicePouchdb.garderUpdateTrace(this.unEssaiDoc.security);

        let doc = this.clone(this.unEssaiDoc);
        delete doc.formData.idProtocole;
        delete doc.formData.numeroProtocole;
        delete doc.formData.nomProtocole;
        delete doc.formData.idProjet;
        delete doc.formData.numeroProjet;
        delete doc.formData.nomProjet;
        delete doc.formData.idInstitution;
        delete doc.formData.numeroInstitution;
        delete doc.formData.nomInstitution;
        delete doc.formData.idPersonne;
        delete doc.formData.matriculePersonne;
        delete doc.formData.nomPersonne;
        delete doc.formData.idChamp;
        delete doc.formData.codeChamp;
        delete doc.formData.nomChamp;

        delete doc.formData.idOp;
        delete doc.formData.numeroOp;
        delete doc.formData.nomOp;
        delete doc.formData.idUnion;
        delete doc.formData.numeroUnion;
        delete doc.formData.nomUnion;

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
        delete doc.formData.idLocalite;
        delete doc.formData.codeLocalite;
        delete doc.formData.nomLocalite;
        

        this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
          //this.essais._rev = res.rev;
          //this.unEssaiDoc._rev = res.rev;
          let essaiData = {id: this.unEssaiDoc.id, ...this.unEssaiDoc.formData, ...this.unEssaiDoc.formioData, ...this.unEssaiDoc.security};

          //this.action = 'infos';
          this.infos(essaiData);

          if(this.mobile){
            //mode liste
            //cache la liste pour le changement dans virtual Scroll
            //this.essaisData = [...this.essaisData];
            //mise à jour dans la liste
            for(let i = 0; i < this.essaisData.length; i++){
              if(this.essaisData[i].id == essaiData.id){
                this.essaisData[i] = essaiData;
                break;
              }
            }

            if(this.essaisData[0].parcelle){
              this.essaisData.sort((a, b) => {
                if (a.parcelle < b.parcelle) {
                  return -1;
                }
                if (a.parcelle > b.parcelle) {
                  return 1;
                }
                return 0;
              });
            }else if(this.essaisData[0].variete){
              this.essaisData.sort((a, b) => {
                if (a.variete < b.variete) {
                  return -1;
                }
                if (a.variete > b.variete) {
                  return 1;
                }
                return 0;
              });
            }else{
              this.essaisData.sort((a, b) => {
                if (a.nomPersonne < b.nomPersonne) {
                  return -1;
                }
                if (a.nomPersonne > b.nomPersonne) {
                  return 1;
                }
                return 0;
              });
            }
            //mise à jour dans la liste cache
            for(let i = 0; i < this.allEssaisData.length; i++){
              if(this.allEssaisData[i].id == essaiData.id){
                this.allEssaisData[i] = essaiData;
                break;
              }
            }

            if(this.allEssaisData[0].parcelle){
              this.allEssaisData.sort((a, b) => {
                if (a.parcelle < b.parcelle) {
                  return -1;
                }
                if (a.parcelle > b.parcelle) {
                  return 1;
                }
                return 0;
              });
            }else if(this.allEssaisData[0].variete){
              this.allEssaisData.sort((a, b) => {
                if (a.variete < b.variete) {
                  return -1;
                }
                if (a.variete > b.variete) {
                  return 1;
                }
                return 0;
              });
            }else{
              this.allEssaisData.sort((a, b) => {
                if (a.nomPersonne < b.nomPersonne) {
                  return -1;
                }
                if (a.nomPersonne > b.nomPersonne) {
                  return 1;
                }
                return 0;
              });
            }

            this.rechargerListeMobile = true;
          }else{
            //mode tableau
            //deselect multiple items selected
            this.datatableDeselectMultipleSelectedItemForModification();
            this.dataTableUpdateRow(essaiData);
          }

          this.unEssaiDoc = null;

        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }
    }
  
  
    actualiserTableau(data){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#essai').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, data, null, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
              }else{
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, data, null, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
              }else{
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.essaiHTMLTable.datatable, 'essai');
          });
        }
      
    }
  
    doRefresh(event) {
      let cols = [];
      this.colonnes = [];
      if(this.action != 'conflits'){
        if((this.selectedProtocoleID && this.selectedProtocoleID != '') || (this.idChamp && this.idChamp != '') || (this.idPersonne && this.idPersonne != '') || (this.idProtocole && this.idProtocole != '') || (this.idProjet && this.idProjet != '') || (this.idPartenaire && this.idPartenaire != '')){
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
          }else if(this.idOp){
            typePere = 'op';
            idPere = this.idOp;
          }else if(this.idPays){
            typePere = 'pays';
            idPere = this.idPays;
          }else if(this.idRegion){
            typePere = 'region';
            idPere = this.idRegion;
          }else if(this.idDepartement){
            typePere = 'departement';
            idPere = this.idDepartement;
          }else if(this.idCommune){
            typePere = 'commune';
            idPere = this.idCommune;
          }else if(this.idLocalite){
            typePere = 'localite';
            idPere = this.idLocalite;
          }else if(this.idChamp){
            typePere = 'champ';
            idPere = this.idChamp;
          }else if(this.idPersonne){
            typePere = 'personne';
            idPere = this.idPersonne;
          }else if(this.idProtocole){
            typePere = 'protocole';
            idPere = this.idProtocole;
          }else if(this.selectedProtocoleID && !this.idChamp && !this.idPersonne && !this.idProtocole && !this.idProjet && !this.idPartenaire){
            typePere = 'protocole';
            idPere = this.selectedProtocoleID;
            this.getFormKeys(idPere);
            this.init = true;
          }else if(this.idProjet){
            typePere = 'projet';
            idPere = this.idProjet;
          }else{
            typePere = 'partenaire';
            idPere = this.idPartenaire;
          }
  
          //console.log('2071234A-896E-8541-9990-C4B2F748417E => '+idPere)
          //'5E9861AB-CEFE-C83F-BFD6-FB75D7E125DF'
          this.servicePouchdb.findRelationalDocOfTypeByPere('collectedonnee', typePere, idPere, deleted, archived, shared).then((res) => {
            //console.log(res)
            if(res && res.collectedonnees){
              //this.essais = [...essais];
              let essaisData = [];
              //var datas = [];
              let institutionIndex = [];
              let projetIndex = [];
              let protocoleIndex = [];
              let personneIndex = [];
              let champIndex = [];
              let communeIndex = [];
              let localiteIndex = [];
              let idInstitution, idProjet, idProtocole, idPersonne, idChamp, idCommune, idLocalite;
              for(let u of res.collectedonnees){
                //supprimer l'historique de la liste
                if((idPere != this.selectedProtocoleID && u.protocole == this.selectedProtocoleID) || (idPere == this.selectedProtocoleID)){
                  delete u.security['shared_history'];
  

                  if(u.partenaire && u.partenaire != ''){
                    if(isDefined(institutionIndex[u.partenaire])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.numero, 2);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.nom, 3);
                      idInstitution = res.partenaires[institutionIndex[u.partenaire]].id;
                    }else{
                      for(let i=0; i < res.partenaires.length; i++){
                        if(res.partenaires[i].id == u.partenaire){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                          institutionIndex[u.partenaire] = i;
                          idInstitution =  res.partenaires[i].id;
                          break;
                        }
                      }
                    }  
                  }else{
                    //collone vide
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', null, 2);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', null, 3);
                    idInstitution = null;
                  }
    
                  if(u.projet && u.projet != ''){
                    if(isDefined(projetIndex[u.projet])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[projetIndex[u.projet]].formData.numero, 4);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[projetIndex[u.projet]].formData.nom, 5);
                      idProjet = res.projets[projetIndex[u.projet]].id;
                    }else{
                      for(let i=0; i < res.projets.length; i++){
                        if(res.projets[i].id == u.projet){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[i].formData.numero, 4);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[i].formData.nom, 5);
                          projetIndex[u.projet] = i;
                          idProjet = res.projets[i].id;
                          break;
                        }
                      }
                    }  
                  }else{
                    //collone vide
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', null, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', null, 5);
                    idProjet = null;
                  }
    
                  if(u.protocole && u.protocole != ''){
                    if(isDefined(protocoleIndex[u.projet])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.numero, 6);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.nom, 7);
                      idProtocole = res.protocoles[protocoleIndex[u.protocole]].id;
                    }else{
                      for(let i=0; i < res.protocoles.length; i++){
                        if(res.protocoles[i].id == u.protocole){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[i].formData.numero, 6);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[i].formData.nom, 7);
                          protocoleIndex[u.protocole] = i;
                          idProtocole = res.protocoles[i].id;
                          break;
                        }
                      }
                    }  
                  }else{
                    //collone vide
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', null, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', null, 7);
                    idProtocole = null;
                  }
    
                  if(u.personne && u.personne != ''){
                    if(isDefined(personneIndex[u.personne])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[personneIndex[u.personne]].formData.matricule, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[personneIndex[u.personne]].formData.nom, 9);
                      u.formData.prenomPersonne = res.personnes[personneIndex[u.personne]].formData.prenom;
                      idPersonne = res.personnes[personneIndex[u.personne]].id;
                    }else{
                      for(let i=0; i < res.personnes.length; i++){
                        if(res.personnes[i].id == u.personne){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[i].formData.matricule, 8);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[i].formData.nom, 9);
                          u.formData.prenomPersonne = res.personnes[i].formData.prenom;
                          personneIndex[u.personne] = i;
                          idPersonne = res.personnes[i].id;
                          break;
                        }
                      }
                    }  
                  }else{
                    //collone vide
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', null, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', null, 9);
                    u.formData.prenomPersonne = null;
                    idPersonne = null;
                  }
    
                  if(u.champ && u.champ != ''){
                    if(isDefined(champIndex[u.champ])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[champIndex[u.champ]].formData.code, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[champIndex[u.champ]].formData.nom, 11);
                      idChamp = res.champs[champIndex[u.champ]].id;
                    }else{
                      for(let i=0; i < res.champs.length; i++){
                        if(res.champs[i].id == u.champ){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[i].formData.code, 10);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[i].formData.nom, 11);
                          champIndex[u.champ] = i;
                          idChamp = res.champs[i].id;
                          break;
                        }
                      }
                    }  
                  }else{
                    //collone vide
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', null, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', null, 11);
                    idChamp = null;
                  }
    
                  //union
                  if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].union){
                    for(let i=0; i < res.unions.length; i++){
                      if(res.unions[i].id == res.personnes[personneIndex[u.personne]].union){
                        u.formData.numeroUnion = res.unions[i].formData.numero
                        u.formData.nomUnion = res.unions[i].formData.nom
                        break;
                      }
                    }
                  }
    
                  //op
                  if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].op){
                    for(let i=0; i < res.ops.length; i++){
                      if(res.ops[i].id == res.personnes[personneIndex[u.personne]].op){
                        u.formData.numeroOP = res.ops[i].formData.numero
                        u.formData.nomOP = res.ops[i].formData.nom
                        break;
                      }
                    }
                  }
                  
                  //communes
                  if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].commune){
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                        u.formData.codeSite = res.communes[i].formData.code
                        u.formData.nomSite = res.communes[i].formData.nom
                        break;
                      }
                    }
                  }
                  
                  //localité
                  if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].localite){
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                        u.formData.codeLocalite = res.localites[i].formData.code
                        u.formData.nomLocalite = res.localites[i].formData.nom
                        break;
                      }
                    }
                  }
                  
                  
                  /*//communes
                  if(res.champs[champIndex[u.champ]].commune && res.champs[champIndex[u.champ]].commune != ''){
                    /*if(isDefined(communeIndex[res.champs[champIndex[u.champ]].commune])){
                      u.formData.codeSite = res.champs[champIndex[u.champ]].formData.code
                      u.formData.nomSite = res.champs[champIndex[u.champ]].formData.nom
                    }else{*****
                      for(let i=0; i < res.communes.length; i++){
                        if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                          u.formData.codeSite = res.communes[i].formData.code
                          u.formData.nomSite = res.communes[i].formData.nom
                          //champIndex[u.champ] = i;
                          //idChamp = res.champs[i].id;
                          break;
                        }
                      }
                   // }  
                  }else{
                    //collone vide
                    u.formData.codeSite = null
                    u.formData.nomSite = null
                  }
    
                  if(res.champs[champIndex[u.champ]].localite && res.champs[champIndex[u.champ]].localite != ''){
                    /*if(isDefined(localiteIndex[res.champs[champIndex[u.champ]].localite])){
                      u.formData.codeLocalite = res.champs[champIndex[u.champ]].formData.code
                      u.formData.nomLocalite = res.champs[champIndex[u.champ]].formData.nom
                    }else{***
                      for(let i=0; i < res.localites.length; i++){
                        if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                          u.formData.codeLocalite = res.localites[i].formData.code
                          u.formData.nomLocalite = res.localites[i].formData.nom
                          //champIndex[u.champ] = i;
                          //idChamp = res.champs[i].id;
                          break;
                        }
                      }
                   // }  
                  }else{
                    //collone vide
                    u.formData.codeLocalite = null
                    u.formData.nomLocalite = null
                  }*/
    
                  essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, idPersonne: idPersonne, idChamp: idChamp, ...u.formData, ...u.formioData[Object.keys(u.formioData)[0]], ...u.security});
                  cols = Array.from(new Set(cols.concat(keys(u.formioData[Object.keys(u.formioData)[0]]))));
                }
                
              }
  
              cols.sort((a, b) => {
                return this.formKeys.indexOf(a) - this.formKeys.indexOf(b)
                /*if (a < b) {
                  return -1;
                }
                if (a > b) {
                  return 1;
                }
                return 0;*/
              });
  
              this.colonnes = this.tmpColonnes.concat(cols);
  
              //this.essaisData = [...datas]; 
    
              //this.loading = false;
              if(this.mobile){
                this.essaisData = essaisData;
                if(this.essaisData[0].parcelle){
                  this.essaisData.sort((a, b) => {
                    if (a.parcelle < b.parcelle) {
                      return -1;
                    }
                    if (a.parcelle > b.parcelle) {
                      return 1;
                    }
                    return 0;
                  });
                }else if(this.essaisData[0].variete){
                  this.essaisData.sort((a, b) => {
                    if (a.variete < b.variete) {
                      return -1;
                    }
                    if (a.variete > b.variete) {
                      return 1;
                    }
                    return 0;
                  });
                }else{
                  this.essaisData.sort((a, b) => {
                    if (a.nomPersonne < b.nomPersonne) {
                      return -1;
                    }
                    if (a.nomPersonne > b.nomPersonne) {
                      return 1;
                    }
                    return 0;
                  });
                }
  
                this.allEssaisData = [...this.essaisData];
              } else{
                $('#essai-relation').ready(()=>{
                  if(global.langue == 'en'){
                    this.essaiHTMLTable = createDataTable("essai-relation", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
                  }else{
                    this.essaiHTMLTable = createDataTable("essai-relation", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
                  }
                  this.attacheEventToDataTable(this.essaiHTMLTable.datatable, 'essai-relation');
                });
              }

              if(event)
              event.target.complete();
            }else{
              this.loading = false
              this.essais = [];
              //if(this.mobile){
              this.essaisData = [];
              this.allEssaisData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            this.loading = false;
            this.essais = [];
            this.essaisData = [];
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
  
          this.servicePouchdb.findRelationalDocByType('collectedonnee', deleted, archived, shared).then((res) => {
            if(res && res.collectedonnees){
              //this.essais = [...essais];
              let essaisData = [];
              let institutionIndex = [];
              let projetIndex = [];
              let protocoleIndex = [];
              let personneIndex = [];
              let champIndex = [];
              let idInstitution, idProjet, idProtocole, idPersonne, idChamp;
              for(let u of res.collectedonnees){
                //supprimer l'historique de la liste
                delete u.security['shared_history'];
  
                if(u.partenaire && u.partenaire != ''){
                  if(isDefined(institutionIndex[u.partenaire])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.numero, 2);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.nom, 3);
                    idInstitution = res.partenaires[institutionIndex[u.partenaire]].id;
                  }else{
                    for(let i=0; i < res.partenaires.length; i++){
                      if(res.partenaires[i].id == u.partenaire){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                        institutionIndex[u.partenaire] = i;
                        idInstitution =  res.partenaires[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', null, 2);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', null, 3);
                  idInstitution = null;
                }
  
                if(u.projet && u.projet != ''){
                  if(isDefined(projetIndex[u.projet])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[projetIndex[u.projet]].formData.numero, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[projetIndex[u.projet]].formData.nom, 5);
                    idProjet = res.projets[projetIndex[u.projet]].id;
                  }else{
                    for(let i=0; i < res.projets.length; i++){
                      if(res.projets[i].id == u.projet){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[i].formData.numero, 4);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[i].formData.nom, 5);
                        projetIndex[u.projet] = i;
                        idProjet = res.projets[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', null, 4);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', null, 5);
                  idProjet = null;
                }
  
                if(u.protocole && u.protocole != ''){
                  if(isDefined(protocoleIndex[u.projet])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.numero, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.nom, 7);
                    idProtocole = res.protocoles[protocoleIndex[u.protocole]].id;
                  }else{
                    for(let i=0; i < res.protocoles.length; i++){
                      if(res.protocoles[i].id == u.protocole){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[i].formData.numero, 6);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[i].formData.nom, 7);
                        protocoleIndex[u.protocole] = i;
                        idProtocole = res.protocoles[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', null, 6);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', null, 7);
                  idProtocole = null;
                }
  
                if(u.personne && u.personne != ''){
                  if(isDefined(personneIndex[u.personne])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[personneIndex[u.personne]].formData.matricule, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[personneIndex[u.personne]].formData.nom, 9);
                    u.formData.prenomPersonne = res.personnes[personneIndex[u.personne]].formData.prenom
                    idPersonne = res.personnes[personneIndex[u.personne]].id;
                  }else{
                    for(let i=0; i < res.personnes.length; i++){
                      if(res.personnes[i].id == u.personne){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[i].formData.matricule, 8);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[i].formData.nom, 9);
                        u.formData.prenomPersonne = res.personnes[i].formData.prenom;
                        personneIndex[u.personne] = i;
                        idPersonne = res.personnes[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', null, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', null, 9);
                  u.formData.prenomPersonne = null;
                  idPersonne = null;
                }
  
                if(u.champ && u.champ != ''){
                  if(isDefined(champIndex[u.champ])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[champIndex[u.champ]].formData.code, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[champIndex[u.champ]].formData.nom, 11);
                    idChamp = res.champs[champIndex[u.champ]].id;
                  }else{
                    for(let i=0; i < res.champs.length; i++){
                      if(res.champs[i].id == u.champ){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[i].formData.code, 10);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[i].formData.nom, 11);
                        champIndex[u.champ] = i;
                        idChamp = res.champs[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', null, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', null, 11);
                  idChamp = null;
                }
  
                //union
                if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].union){
                  for(let i=0; i < res.unions.length; i++){
                    if(res.unions[i].id == res.personnes[personneIndex[u.personne]].union){
                      u.formData.numeroUnion = res.unions[i].formData.numero
                      u.formData.nomUnion = res.unions[i].formData.nom
                      break;
                    }
                  }
                }
  
                //op
                if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].op){
                  for(let i=0; i < res.ops.length; i++){
                    if(res.ops[i].id == res.personnes[personneIndex[u.personne]].op){
                      u.formData.numeroOP = res.ops[i].formData.numero
                      u.formData.nomOP = res.ops[i].formData.nom
                      break;
                    }
                  }
                }
  
                //communes
                if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].commune){
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                      u.formData.codeSite = res.communes[i].formData.code
                      u.formData.nomSite = res.communes[i].formData.nom
                      break;
                    }
                  }
                }
                
                //localité
                if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].localite){
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                      u.formData.codeLocalite = res.localites[i].formData.code
                      u.formData.nomLocalite = res.localites[i].formData.nom
                      break;
                    }
                  }
                }
                
                /*for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                    u.formData.codeSite = res.communes[i].formData.code
                    u.formData.nomSite = res.communes[i].formData.nom
                    //champIndex[u.champ] = i;
                    //idChamp = res.champs[i].id;
                    break;
                  }
                }
  
                //localité
                for(let i=0; i < res.localites.length; i++){
                  if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                    u.formData.codeLocalite = res.localites[i].formData.code
                    u.formData.nomLocalite = res.localites[i].formData.nom
                    //champIndex[u.champ] = i;
                    //idChamp = res.champs[i].id;
                    break;
                  }
                }*/
                
                /*//communes
                if(res.champs[champIndex[u.champ]].commune && res.champs[champIndex[u.champ]].commune != ''){
                  /*if(isDefined(communeIndex[res.champs[champIndex[u.champ]].commune])){
                    u.formData.codeSite = res.champs[champIndex[u.champ]].formData.code
                    u.formData.nomSite = res.champs[champIndex[u.champ]].formData.nom
                  }else{*****
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                        u.formData.codeSite = res.communes[i].formData.code
                        u.formData.nomSite = res.communes[i].formData.nom
                        //champIndex[u.champ] = i;
                        //idChamp = res.champs[i].id;
                        break;
                      }
                    }
                 // }  
                }else{
                  //collone vide
                  u.formData.codeSite = null
                  u.formData.nomSite = null
                }
  
                if(res.champs[champIndex[u.champ]].localite && res.champs[champIndex[u.champ]].localite != ''){
                  /*if(isDefined(localiteIndex[res.champs[champIndex[u.champ]].localite])){
                    u.formData.codeLocalite = res.champs[champIndex[u.champ]].formData.code
                    u.formData.nomLocalite = res.champs[champIndex[u.champ]].formData.nom
                  }else{***
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                        u.formData.codeLocalite = res.localites[i].formData.code
                        u.formData.nomLocalite = res.localites[i].formData.nom
                        //champIndex[u.champ] = i;
                        //idChamp = res.champs[i].id;
                        break;
                      }
                    }
                 // }  
                }else{
                  //collone vide
                  u.formData.codeLocalite = null
                  u.formData.nomLocalite = null
                }*/
  
  
                essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, idPersonne: idPersonne, idChamp: idChamp, ...u.formData, ...u.formioData[Object.keys(u.formioData)[0]], ...u.security});
                
                cols = Array.from(new Set(cols.concat(keys(u.formioData[Object.keys(u.formioData)[0]]))));
              }
  
              cols.sort((a, b) => {
                return this.formKeys.indexOf(a) - this.formKeys.indexOf(b)
                /*if (a < b) {
                  return -1;
                }
                if (a > b) {
                  return 1;
                }
                return 0;*/
              });
  
              this.colonnes = this.tmpColonnes.concat(cols);
  
  
              //this.essaisData = [...datas];
    
              //this.loading = false;  
                //si mobile
            if(this.mobile){
              this.essaisData = essaisData;
              if(this.essaisData[0].parcelle){
                this.essaisData.sort((a, b) => {
                  if (a.parcelle < b.parcelle) {
                    return -1;
                  }
                  if (a.parcelle > b.parcelle) {
                    return 1;
                  }
                  return 0;
                });
              }else if(this.essaisData[0].variete){
                this.essaisData.sort((a, b) => {
                  if (a.variete < b.variete) {
                    return -1;
                  }
                  if (a.variete > b.variete) {
                    return 1;
                  }
                  return 0;
                });
              }else{
                this.essaisData.sort((a, b) => {
                  if (a.nomPersonne < b.nomPersonne) {
                    return -1;
                  }
                  if (a.nomPersonne > b.nomPersonne) {
                    return 1;
                  }
                  return 0;
                });
              }

              this.allEssaisData = [...this.essaisData]
            } else{
                $('#essai').ready(()=>{
                  if(global.langue == 'en'){
                    this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
                  }else{
                    this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
                  }
                  this.attacheEventToDataTable(this.essaiHTMLTable.datatable, 'essai');
                });
              }
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }else{
              this.essais = [];
              //if(this.mobile){
                this.essaisData = [];
                this.allEssaisData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            console.log('Erreur acces à la essai ==> '+err)
            this.essais = [];
            //if(this.mobile){
              this.essaisData = [];
              this.allEssaisData = [];
            //}
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          });  
        }
      }else{
        this.getEssaiWithConflicts(event);
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
  
    getEssai(init: any = null){
      //tous les departements
      this.loading = true;
      let cols = [];
      this.colonnes = [];
      if(this.idEssai && this.idEssai != ''){
        this.servicePouchdb.findRelationalDocByID('collectedonnee', this.idEssai).then((res) => {
          if(res && res.collectedonnees[0]){
            let f, proj, proto, memb, champ;
            //this.unEssai = res && res.collectedonnees[0];


            if(res.partenaires && res.partenaires[0]){
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'numeroInstitution', res.partenaires[0].formData.numero, 2);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomInstitution', res.partenaires[0].formData.nom, 3);  
              f = res.partenaires[0].id;
            }else{
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'numeroInstitution', null, 2);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomInstitution', null, 3);
              f = null;
            }
            
            if(res.projets && res.projets[0]){
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'numeroProjet', res.projets[0].formData.numero, 4);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomProjet', res.projets[0].formData.nom, 5); 
              proj = res.projets[0].id; 
            }else{
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'numeroProjet', null, 4);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomProjet', null, 5);
              proj = null;
            }

            if(res.protocoles && res.protocoles[0]){
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'numeroProtocole', res.protocoles[0].formData.numero, 6);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomProtocole', res.protocoles[0].formData.nom, 7); 
              proto = res.protocoles[0].id; 
            }else{
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'numeroProtocole', null, 6);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomProtocole', null, 7);
              proto = null;
            }

            if(res.personnes && res.personnes[0]){
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'matriculePersonne', res.personnes[0].formData.matricule, 8);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomPersonne', res.personnes[0].formData.nom, 9); 
              memb = res.personnes[0].id; 
            }else{
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'matriculePersonne', null, 8);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomPersonne', null, 9);
              memb = null;
            }

            if(res.champs && res.champs[0]){
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'codeChamp', res.champs[0].formData.code, 10);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomChamp', res.champs[0].formData.nom, 11); 
              champ = res.champs[0].id; 
            }else{
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'codeChamp', null, 10);
              res.collectedonnees[0].formData = this.addItemToObjectAtSpecificPosition(res.collectedonnees[0].formData, 'nomChamp', null, 11);
              champ = null;
            }
            
            this.loading = false;
            this.infos({id: res.partenaires[0].id, idInstitution: f, idProjet: proj, idProtocole: proto, idPersonne: memb, idChamp: champ, ...res.collectedonnees[0].formData}); 
          }else{
            this.loading = false;
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
            this.close();
          }
        }).catch((err) => {
          this.loading = false;
          alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          console.log(err)
          this.close();
        });
      }else if((init && init != '' && !this.idChamp && !this.idPersonne && !this.idProtocole && !this.idProjet && !this.idPartenaire) || (this.idChamp && this.idChamp != '') || (this.idPersonne && this.idPersonne != '') || (this.idProtocole && this.idProtocole != '') || (this.idProjet && this.idProjet != '') || (this.idPartenaire && this.idPartenaire != '')){
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
        }else if(this.idOp){
          typePere = 'op';
          idPere = this.idOp;
        }else if(this.idPays){
          typePere = 'pays';
          idPere = this.idPays;
        }else if(this.idRegion){
          typePere = 'region';
          idPere = this.idRegion;
        }else if(this.idDepartement){
          typePere = 'departement';
          idPere = this.idDepartement;
        }else if(this.idCommune){
          typePere = 'commune';
          idPere = this.idCommune;
        }else if(this.idLocalite){
          typePere = 'localite';
          idPere = this.idLocalite;
        }else if(this.idChamp){
          typePere = 'champ';
          idPere = this.idChamp;
        }else if(this.idPersonne){
          typePere = 'personne';
          idPere = this.idPersonne;
        }else if(this.idProtocole){
          typePere = 'protocole';
          idPere = this.idProtocole;
        }else if(init && !this.idChamp && !this.idPersonne && !this.idProtocole && !this.idProjet && !this.idPartenaire){
          typePere = 'protocole';
          idPere = init;
          this.init = true;
        }else if(this.idProjet){
          typePere = 'projet';
          idPere = this.idProjet;
        }else{
          typePere = 'partenaire';
          idPere = this.idPartenaire;
        }

        //console.log(idPere+'=='+init)

        //console.log('2071234A-896E-8541-9990-C4B2F748417E => '+idPere)
        //'5E9861AB-CEFE-C83F-BFD6-FB75D7E125DF'
        this.servicePouchdb.findRelationalDocOfTypeByPere('collectedonnee', typePere, idPere, deleted, archived, shared).then((res) => {
          //console.log(res)
          if(res && res.collectedonnees){
            //this.essais = [...essais];
            let essaisData = [];
            //var datas = [];
            let institutionIndex = [];
            let projetIndex = [];
            let protocoleIndex = [];
            let personneIndex = [];
            let champIndex = [];
            let communeIndex = [];
            let localiteIndex = [];
            let idInstitution, idProjet, idProtocole, idPersonne, idChamp, idCommune, idLocalite;
            for(let u of res.collectedonnees){
              //supprimer l'historique de la liste
              delete u.security['shared_history'];
              if((idPere != init && u.protocole == init) || (idPere == init)){
                if(u.partenaire && u.partenaire != ''){
                  if(isDefined(institutionIndex[u.partenaire])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.numero, 2);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.nom, 3);
                    idInstitution = res.partenaires[institutionIndex[u.partenaire]].id;
                  }else{
                    for(let i=0; i < res.partenaires.length; i++){
                      if(res.partenaires[i].id == u.partenaire){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                        institutionIndex[u.partenaire] = i;
                        idInstitution =  res.partenaires[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', null, 2);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', null, 3);
                  idInstitution = null;
                }
  
                if(u.projet && u.projet != ''){
                  if(isDefined(projetIndex[u.projet])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[projetIndex[u.projet]].formData.numero, 4);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[projetIndex[u.projet]].formData.nom, 5);
                    idProjet = res.projets[projetIndex[u.projet]].id;
                  }else{
                    for(let i=0; i < res.projets.length; i++){
                      if(res.projets[i].id == u.projet){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[i].formData.numero, 4);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[i].formData.nom, 5);
                        projetIndex[u.projet] = i;
                        idProjet = res.projets[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', null, 4);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', null, 5);
                  idProjet = null;
                }
  
                if(u.protocole && u.protocole != ''){
                  if(isDefined(protocoleIndex[u.projet])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.numero, 6);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.nom, 7);
                    idProtocole = res.protocoles[protocoleIndex[u.protocole]].id;
                  }else{
                    for(let i=0; i < res.protocoles.length; i++){
                      if(res.protocoles[i].id == u.protocole){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[i].formData.numero, 6);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[i].formData.nom, 7);
                        protocoleIndex[u.protocole] = i;
                        idProtocole = res.protocoles[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', null, 6);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', null, 7);
                  idProtocole = null;
                }
  
                if(u.personne && u.personne != ''){
                  if(isDefined(personneIndex[u.personne])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[personneIndex[u.personne]].formData.matricule, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[personneIndex[u.personne]].formData.nom, 9);
                    u.formData.prenomPersonne = res.personnes[personneIndex[u.personne]].formData.prenom;
                    idPersonne = res.personnes[personneIndex[u.personne]].id;
                  }else{
                    for(let i=0; i < res.personnes.length; i++){
                      if(res.personnes[i].id == u.personne){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[i].formData.matricule, 8);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[i].formData.nom, 9);
                        u.formData.prenomPersonne = res.personnes[i].formData.prenom;
                        personneIndex[u.personne] = i;
                        idPersonne = res.personnes[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', null, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', null, 9);
                  u.formData.prenomPersonne = null;
                  idPersonne = null;
                }
  
                if(u.champ && u.champ != ''){
                  if(isDefined(champIndex[u.champ])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[champIndex[u.champ]].formData.code, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[champIndex[u.champ]].formData.nom, 11);
                    idChamp = res.champs[champIndex[u.champ]].id;
                  }else{
                    for(let i=0; i < res.champs.length; i++){
                      if(res.champs[i].id == u.champ){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[i].formData.code, 10);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[i].formData.nom, 11);
                        champIndex[u.champ] = i;
                        idChamp = res.champs[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', null, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', null, 11);
                  idChamp = null;
                }
  
                //union
                if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].union){
                  for(let i=0; i < res.unions.length; i++){
                    if(res.unions[i].id == res.personnes[personneIndex[u.personne]].union){
                      u.formData.numeroUnion = res.unions[i].formData.numero
                      u.formData.nomUnion = res.unions[i].formData.nom
                      break;
                    }
                  }
                }
  
                //op
                if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].op){
                  for(let i=0; i < res.ops.length; i++){
                    if(res.ops[i].id == res.personnes[personneIndex[u.personne]].op){
                      u.formData.numeroOP = res.ops[i].formData.numero
                      u.formData.nomOP = res.ops[i].formData.nom
                      break;
                    }
                  }
                }
                
                //communes
                if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].commune){
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                      u.formData.codeSite = res.communes[i].formData.code
                      u.formData.nomSite = res.communes[i].formData.nom
                      break;
                    }
                  }
                }
                
                //localité
                if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].localite){
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                      u.formData.codeLocalite = res.localites[i].formData.code
                      u.formData.nomLocalite = res.localites[i].formData.nom
                      break;
                    }
                  }
                }
                
                
                /*//communes
                if(res.champs[champIndex[u.champ]].commune && res.champs[champIndex[u.champ]].commune != ''){
                  /*if(isDefined(communeIndex[res.champs[champIndex[u.champ]].commune])){
                    u.formData.codeSite = res.champs[champIndex[u.champ]].formData.code
                    u.formData.nomSite = res.champs[champIndex[u.champ]].formData.nom
                  }else{*****
                    for(let i=0; i < res.communes.length; i++){
                      if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                        u.formData.codeSite = res.communes[i].formData.code
                        u.formData.nomSite = res.communes[i].formData.nom
                        //champIndex[u.champ] = i;
                        //idChamp = res.champs[i].id;
                        break;
                      }
                    }
                 // }  
                }else{
                  //collone vide
                  u.formData.codeSite = null
                  u.formData.nomSite = null
                }
  
                if(res.champs[champIndex[u.champ]].localite && res.champs[champIndex[u.champ]].localite != ''){
                  /*if(isDefined(localiteIndex[res.champs[champIndex[u.champ]].localite])){
                    u.formData.codeLocalite = res.champs[champIndex[u.champ]].formData.code
                    u.formData.nomLocalite = res.champs[champIndex[u.champ]].formData.nom
                  }else{***
                    for(let i=0; i < res.localites.length; i++){
                      if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                        u.formData.codeLocalite = res.localites[i].formData.code
                        u.formData.nomLocalite = res.localites[i].formData.nom
                        //champIndex[u.champ] = i;
                        //idChamp = res.champs[i].id;
                        break;
                      }
                    }
                 // }  
                }else{
                  //collone vide
                  u.formData.codeLocalite = null
                  u.formData.nomLocalite = null
                }*/
  
                /*console.log(u.id)
                console.log(Object.keys(u.formioData))
                console.log(Object.keys(u.formioData)[0])
                console.log(u.formioData[Object.keys(u.formioData)[0]])
                console.log(keys(u.formioData[Object.keys(u.formioData)[0]]))*/

                essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, idPersonne: idPersonne, idChamp: idChamp, ...u.formData, ...u.formioData[Object.keys(u.formioData)[0]], ...u.security});
                if(u.formioData && Object.keys(u.formioData) && Object.keys(u.formioData)[0] && keys(u.formioData[Object.keys(u.formioData)[0]])){
                  cols = Array.from(new Set(cols.concat(keys(u.formioData[Object.keys(u.formioData)[0]]))));
                  /*if(keys(u.formioData[Object.keys(u.formioData)[0]]).indexOf('FOEssai') !== -1){
                    console.log(u.id)
                    console.log(u.formData.numero)
                  }*/
                }else{
                  console.log('Erreur: données formulaire vide ou invalid. Id_collecte = '+ u.id)
                }
                
                //break              
              }

            
            }

            cols.sort((a, b) => {
              return this.formKeys.indexOf(a) - this.formKeys.indexOf(b)
              /*if (a < b) {
                return -1;
              }
              if (a > b) {
                return 1;
              }
              return 0;*/
            });

            this.colonnes = this.tmpColonnes.concat(cols);

            //this.essaisData = [...datas]; 
  
            this.loading = false;
            if(this.mobile){
              this.essaisData = essaisData;
              if(this.essaisData[0].parcelle){
              this.essaisData.sort((a, b) => {
                if (a.parcelle < b.parcelle) {
                  return -1;
                }
                if (a.parcelle > b.parcelle) {
                  return 1;
                }
                return 0;
              });
            }else if(this.essaisData[0].variete){
              this.essaisData.sort((a, b) => {
                if (a.variete < b.variete) {
                  return -1;
                }
                if (a.variete > b.variete) {
                  return 1;
                }
                return 0;
              });
            }else{
              this.essaisData.sort((a, b) => {
                if (a.nomPersonne < b.nomPersonne) {
                  return -1;
                }
                if (a.nomPersonne > b.nomPersonne) {
                  return 1;
                }
                return 0;
              });
            }

              this.allEssaisData = [...this.essaisData];
            } else{
              $('#essai-relation').ready(()=>{
                if(global.langue == 'en'){
                  this.essaiHTMLTable = createDataTable("essai-relation", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
                }else{
                  this.essaiHTMLTable = createDataTable("essai-relation", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
                }
                this.attacheEventToDataTable(this.essaiHTMLTable.datatable, 'essai-relation');
              });
            }
          }
        }).catch((err) => {
          this.loading = false;
          this.essais = [];
          this.essaisData = [];
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
        this.servicePouchdb.findRelationalDocByType('collectedonnee', deleted, archived, shared).then((res) => {
           //console.log(res)
          if(res && res.collectedonnees){
            //this.essais = [...essais];
            let essaisData = [];
            let institutionIndex = [];
            let projetIndex = [];
            let protocoleIndex = [];
            let personneIndex = [];
            let champIndex = [];
            let idInstitution, idProjet, idProtocole, idPersonne, idChamp;
            for(let u of res.collectedonnees){
              //supprimer l'historique de la liste
              delete u.security['shared_history'];

              if(u.partenaire && u.partenaire != ''){
                if(isDefined(institutionIndex[u.partenaire])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.numero, 2);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[institutionIndex[u.partenaire]].formData.nom, 3);
                  idInstitution = res.partenaires[institutionIndex[u.partenaire]].id;
                }else{
                  for(let i=0; i < res.partenaires.length; i++){
                    if(res.partenaires[i].id == u.partenaire){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                      institutionIndex[u.partenaire] = i;
                      idInstitution =  res.partenaires[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', null, 2);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', null, 3);
                idInstitution = null;
              }

              if(u.projet && u.projet != ''){
                if(isDefined(projetIndex[u.projet])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[projetIndex[u.projet]].formData.numero, 4);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[projetIndex[u.projet]].formData.nom, 5);
                  idProjet = res.projets[projetIndex[u.projet]].id;
                }else{
                  for(let i=0; i < res.projets.length; i++){
                    if(res.projets[i].id == u.projet){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', res.projets[i].formData.numero, 4);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', res.projets[i].formData.nom, 5);
                      projetIndex[u.projet] = i;
                      idProjet = res.projets[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProjet', null, 4);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProjet', null, 5);
                idProjet = null;
              }

              if(u.protocole && u.protocole != ''){
                if(isDefined(protocoleIndex[u.projet])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.numero, 6);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[protocoleIndex[u.protocole]].formData.nom, 7);
                  idProtocole = res.protocoles[protocoleIndex[u.protocole]].id;
                }else{
                  for(let i=0; i < res.protocoles.length; i++){
                    if(res.protocoles[i].id == u.protocole){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', res.protocoles[i].formData.numero, 6);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', res.protocoles[i].formData.nom, 7);
                      protocoleIndex[u.protocole] = i;
                      idProtocole = res.protocoles[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroProtocole', null, 6);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomProtocole', null, 7);
                idProtocole = null;
              }

              if(u.personne && u.personne != ''){
                if(isDefined(personneIndex[u.personne])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[personneIndex[u.personne]].formData.matricule, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[personneIndex[u.personne]].formData.nom, 9);
                  u.formData.prenomPersonne = res.personnes[personneIndex[u.personne]].formData.prenom;
                  idPersonne = res.personnes[personneIndex[u.personne]].id;
                }else{
                  for(let i=0; i < res.personnes.length; i++){
                    if(res.personnes[i].id == u.personne){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', res.personnes[i].formData.matricule, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', res.personnes[i].formData.nom, 9);
                      u.formData.prenomPersonne = res.personnes[i].formData.prenom;
                      personneIndex[u.personne] = i;
                      idPersonne = res.personnes[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'matriculePersonne', null, 8);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPersonne', null, 9);
                u.formData.prenomPersonne = null;
                idPersonne = null;
              }

              if(u.champ && u.champ != ''){
                if(isDefined(champIndex[u.champ])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[champIndex[u.champ]].formData.code, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[champIndex[u.champ]].formData.nom, 11);
                  idChamp = res.champs[champIndex[u.champ]].id;
                }else{
                  for(let i=0; i < res.champs.length; i++){
                    if(res.champs[i].id == u.champ){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', res.champs[i].formData.code, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', res.champs[i].formData.nom, 11);
                      champIndex[u.champ] = i;
                      idChamp = res.champs[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeChamp', null, 10);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomChamp', null, 11);
                idChamp = null;
              }

              //union
              if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].union){
                for(let i=0; i < res.unions.length; i++){
                  if(res.unions[i].id == res.personnes[personneIndex[u.personne]].union){
                    u.formData.numeroUnion = res.unions[i].formData.numero
                    u.formData.nomUnion = res.unions[i].formData.nom
                    break;
                  }
                }
              }

              //op
              if(res.personnes.length > 0 && res.personnes[personneIndex[u.personne]] && res.personnes[personneIndex[u.personne]].op){
                for(let i=0; i < res.ops.length; i++){
                  if(res.ops[i].id == res.personnes[personneIndex[u.personne]].op){
                    u.formData.numeroOP = res.ops[i].formData.numero
                    u.formData.nomOP = res.ops[i].formData.nom
                    break;
                  }
                }
              }

              //communes
              if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].commune){
                for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                    u.formData.codeSite = res.communes[i].formData.code
                    u.formData.nomSite = res.communes[i].formData.nom
                    break;
                  }
                }
              }
              
              //localité
              if(res.champs.length > 0 && res.champs[champIndex[u.champ]] && res.champs[champIndex[u.champ]].localite){
                for(let i=0; i < res.localites.length; i++){
                  if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                    u.formData.codeLocalite = res.localites[i].formData.code
                    u.formData.nomLocalite = res.localites[i].formData.nom
                    break;
                  }
                }
              }
              /*for(let i=0; i < res.communes.length; i++){
                if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                  u.formData.codeSite = res.communes[i].formData.code
                  u.formData.nomSite = res.communes[i].formData.nom
                  //champIndex[u.champ] = i;
                  //idChamp = res.champs[i].id;
                  break;
                }
              }
              

              //localité
              for(let i=0; i < res.localites.length; i++){
                if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                  u.formData.codeLocalite = res.localites[i].formData.code
                  u.formData.nomLocalite = res.localites[i].formData.nom
                  //champIndex[u.champ] = i;
                  //idChamp = res.champs[i].id;
                  break;
                }
              }*/
              
              /*//communes
              if(res.champs[champIndex[u.champ]].commune && res.champs[champIndex[u.champ]].commune != ''){
                /*if(isDefined(communeIndex[res.champs[champIndex[u.champ]].commune])){
                  u.formData.codeSite = res.champs[champIndex[u.champ]].formData.code
                  u.formData.nomSite = res.champs[champIndex[u.champ]].formData.nom
                }else{*****
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == res.champs[champIndex[u.champ]].commune){
                      u.formData.codeSite = res.communes[i].formData.code
                      u.formData.nomSite = res.communes[i].formData.nom
                      //champIndex[u.champ] = i;
                      //idChamp = res.champs[i].id;
                      break;
                    }
                  }
               // }  
              }else{
                //collone vide
                u.formData.codeSite = null
                u.formData.nomSite = null
              }

              if(res.champs[champIndex[u.champ]].localite && res.champs[champIndex[u.champ]].localite != ''){
                /*if(isDefined(localiteIndex[res.champs[champIndex[u.champ]].localite])){
                  u.formData.codeLocalite = res.champs[champIndex[u.champ]].formData.code
                  u.formData.nomLocalite = res.champs[champIndex[u.champ]].formData.nom
                }else{***
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == res.champs[champIndex[u.champ]].localite){
                      u.formData.codeLocalite = res.localites[i].formData.code
                      u.formData.nomLocalite = res.localites[i].formData.nom
                      //champIndex[u.champ] = i;
                      //idChamp = res.champs[i].id;
                      break;
                    }
                  }
               // }  
              }else{
                //collone vide
                u.formData.codeLocalite = null
                u.formData.nomLocalite = null
              }*/


              essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, idPersonne: idPersonne, idChamp: idChamp, ...u.formData, ...u.formioData[Object.keys(u.formioData)[0]], ...u.security});
              
              cols = Array.from(new Set(cols.concat(keys(u.formioData[Object.keys(u.formioData)[0]]))));
            
            }

            cols.sort((a, b) => {
              return this.formKeys.indexOf(a) - this.formKeys.indexOf(b)
              /*if (a < b) {
                return -1;
              }
              if (a > b) {
                return 1;
              }
              return 0;*/
            });

            this.colonnes = this.tmpColonnes.concat(cols);


            //this.essaisData = [...datas];
  
            this.loading = false;
            if(this.mobile){
              this.essaisData = essaisData;
              if(this.essaisData[0].parcelle){
                this.essaisData.sort((a, b) => {
                  if (a.parcelle < b.parcelle) {
                    return -1;
                  }
                  if (a.parcelle > b.parcelle) {
                    return 1;
                  }
                  return 0;
                });
              }else if(this.essaisData[0].variete){
                this.essaisData.sort((a, b) => {
                  if (a.variete < b.variete) {
                    return -1;
                  }
                  if (a.variete > b.variete) {
                    return 1;
                  }
                  return 0;
                });
              }else{
                this.essaisData.sort((a, b) => {
                  if (a.nomPersonne < b.nomPersonne) {
                    return -1;
                  }
                  if (a.nomPersonne > b.nomPersonne) {
                    return 1;
                  }
                  return 0;
                });
              }
              this.allEssaisData = [...this.essaisData];
            } else{
              $('#essai').ready(()=>{
                if(global.langue == 'en'){
                  this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
                }else{
                  this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees, this.translate.instant('ESSAI_PAGE.TITRE_LISTE'));
                }
                this.attacheEventToDataTable(this.essaiHTMLTable.datatable, 'essai');
              });
            }
          }
        }).catch((err) => {
          this.loading = false;
          this.essais = [];
          this.essaisData = [];
          console.log(err)
        });
      }
      
    }
  
    
    
    getInstitution(){
      this.institutionData = [];
      let monInstitution;
      this.servicePouchdb.findRelationalDocByTypeAndDeleted('partenaire', false).then((res) => {
        if(res && res.partenaires){
          //this.partenaires = [...partenaires];
          
          //var datas = [];
          for(let f of res.partenaires){
            this.institutionData.push({id: f.id, numero: f.formData.numero, nom: f.formData.nom});
            //set mon institution par defaut si ajout
            if(!this.doModification && !this.idPartenaire && f.formData.monInstitution && !monInstitution){
              monInstitution = f.id;
            }
          }

          this.institutionData.sort((a, b) => {
            if (a.nom < b.nom) {
              return -1;
            }
            if (a.nom > b.nom) {
              return 1;
            }
            return 0;
          });

          //this.institutionData.push({numero: null, nom: 'Indépendant'});

          if(this.doModification){
            this.setSelect2DefaultValue('idInstitution', this.unEssai.idInstitution);
          }else if(this.idPartenaire){
            this.setSelect2DefaultValue('idInstitution', this.idPartenaire);
          }else{
            this.setSelect2DefaultValue('idInstitution', monInstitution);
          }
          
        }
      }).catch((err) => {
        this.institutionData = [];
        console.log(err)
      });
    }

    getProjetParDateCollecte(dateCollecte, init = false){
      if(init){
        this.loading = true;
        this.selectProjetData = [];
        this.selectProtocoleData = [];
        this.init = true;
        this.servicePouchdb.findRelationalDocProjetAndProtocoleForDataCollect('projet', null, dateCollecte, false, false).then((res) => {
          if(res && res.docs){
            for(let p of res.docs){
              this.selectProjetData.push({id: p._id.substring(p._id.lastIndexOf('_') + 1, p._id.length), idPartenaire: p.data.partenaire, numero: p.data.formData.numero, nom: p.data.formData.nom});
            }
            
            this.selectProjetData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            if(this.selectProjetData.length > 0){
              //console.log(this.selectProjetData[0].id)
              this.setSelect2DefaultValue('selectProjet', this.selectProjetData[0].id);
              //this.getProtocoleParProjet(this.selectProjetData[0].id, true)
            }else{
              this.loading = false;
            }
          }else{
            this.loading = false;
          }

        }).catch((err) => {
          this.loading = false;
          this.selectProjetData = [];
          this.selectProtocoleData = [];
          console.log(err)
        });
      
      }else{
        this.projetData = [];
        this.protocoleData = [];
        this.servicePouchdb.findRelationalDocProjetAndProtocoleForDataCollect('projet', null, dateCollecte, false, false).then((res) => {
          if(res && res.docs){
            if(init){
              for(let p of res.docs){
                this.selectProjetData.push({id: p._id.substring(p._id.lastIndexOf('_') + 1, p._id.length), idPartenaire: p.data.partenaire, numero: p.data.formData.numero, nom: p.data.formData.nom});
              }
             
              this.selectProjetData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
            }else{
              for(let p of res.docs){
  
                if(this.idPartenaire && this.idPartenaire != ''){
                  if(p.data.partenaire == this.idPartenaire){
                    this.projetData.push({id: p._id.substring(p._id.lastIndexOf('_') + 1, p._id.length), idPartenaire: p.data.partenaire, numero: p.data.formData.numero, nom: p.data.formData.nom, dateDebut: p.data.dateDebut, dateFin: p.data.dateFin});
                  }
                }else{
                  this.projetData.push({id: p._id.substring(p._id.lastIndexOf('_') + 1, p._id.length), idPartenaire: p.data.partenaire, numero: p.data.formData.numero, nom: p.data.formData.nom, dateDebut: p.data.dateDebut, dateFin: p.data.dateFin});
                }
              }
              //console.log(this.projetData)
    
              this.projetData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
    
              if(this.doModification){
                this.setSelect2DefaultValue('idProjet', this.unEssai.idProjet);
              }else if(this.idProjet){
                this.setSelect2DefaultValue('idProjet', this.idProjet);
              }
              
            }
            
          }
        }).catch((err) => {
          this.projetData = [];
          console.log(err)
        });
      
      }
      
      
    }


    getProjetParInstitution(idInstitution){
      this.projetData = [];
      this.protocoleData = [];
      //let now = moment();
      let now = moment()//.format('DD-MM-YYYY');

      let dateDebutProjet, dateFinProjet;
      if(idInstitution && idInstitution != ''){
        this.servicePouchdb.findRelationalDocHasMany('projet', 'partenaire', idInstitution).then((res) => {
          //console.log(res)
          if(res && res.projets){
            //this.projets = [...projets];
            //var datas = [];
            for(let u of res.projets){

              dateDebutProjet = moment(u.formData.dateDebut, 'DD-MM-YYYY')//.format('DD-MM-YYYY'); 
              
             dateFinProjet = moment(u.formData.dateFin, 'DD-MM-YYYY')//.format('DD-MM-YYYY');
              
              //ne charger que les projet qui ne sont pa terminés
              /*if(!u.security.deleted && dateDebutProjet <= now && (!dateFinProjet || (dateFinProjet && dateFinProjet >= now))){
                this.projetData.push({id: u.id, numero: u.formData.numero, nom: u.formData.nom, dateDebut: dateDebutProjet, dateFin: dateFinProjet});
              }*/

              if(!u.security.deleted && dateFinProjet >= now){
                this.projetData.push({id: u.id, numero: u.formData.numero, nom: u.formData.nom, dateDebut: dateDebutProjet, dateFin: dateFinProjet});
              }
            }
  
            this.projetData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            if(this.doModification){
              this.setSelect2DefaultValue('idProjet', this.unEssai.idProjet);
            }else if(this.idProjet){
              this.setSelect2DefaultValue('idProjet', this.idProjet);
            }
            
          }
        }).catch((err) => {
          this.projetData = [];
          console.log(err)
        });
      }else {
        this.projetData = [];
      }
      
    }

    
    getProtocoleParProjet(idProjet, init = false){
      if(init){
        //console.log('proto')
        this.loading = true;
        this.init = true;
        this.selectProtocoleData = [];
        this.servicePouchdb.findDocByTypePere('protocole', 'projet', idProjet).then((res) => {
          //console.log(res)
          if(res.docs){
            for(let doc of res.docs){
              let p = doc.data;
              //let id = doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length);
              //if(!p.security.deleted){
                this.selectProtocoleData.push({id: doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length), numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
              //}
            }

            this.selectProtocoleData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //console.log(this.selectProtocoleData)
            if(this.selectProtocoleData.length > 0){
              //console.log(this.selectProtocoleData[0].id)
              //this.selectProtocole = this.selectProtocoleData[0].id;
              this.setSelect2DefaultValue('selectProtocole', this.selectProtocoleData[0].id);
            }else{
              this.loading = false;
            }
              
          }else{
            this.loading = false;
          }
          
        }).catch((err)=>{
          this.loading = false;
          this.selectProtocoleData = [];
          console.log(err)
        })

      }else{
        this.protocoleData = [];

        if(this.idProtocole){
          this.servicePouchdb.getLocalDocById('protocole_2_'+ this.idProtocole).then((protocole) => {
            if(protocole){
              //filtrer au cas ou un racoursi a été utilisé
              //let p = res.protocoles[0];
              this.protocoleData.push({id: protocole._id.substring(protocole._id.lastIndexOf('_') + 1, protocole._id.length), numero: protocole.data.formData.numero, nom: protocole.data.formData.nom, niveauCollecte: protocole.data.formData.niveauCollecte});
  
              if(this.doModification){
                this.setSelect2DefaultValue('idProtocole', this.unEssai.idProtocole);
              }else{
                this.setSelect2DefaultValue('idProtocole', this.idProtocole);
              }
            }
          }).catch((err) => {
            this.protocoleData = [];
            console.log(err)
          });
          this.servicePouchdb.findRelationalDocByID('protocole', this.idProtocole).then((res) => {
            if(res && res.protocoles && res.protocoles[0]){
                  //filtrer au cas ou un racoursi a été utilisé
              let p = res.protocoles[0];
              this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
  
              if(this.doModification){
                this.setSelect2DefaultValue('idProtocole', this.unEssai.idProtocole);
              }else{
                this.setSelect2DefaultValue('idProtocole', this.idProtocole);
              }
              
            }
          }).catch((err) => {
            this.protocoleData = [];
            console.log(err)
          });
        }else if(idProjet && idProjet != ''){
          //console.log('ici')
          this.servicePouchdb.findDocByTypePere('protocole', 'projet', idProjet).then((res) => {
            //console.log(res)
            if(res.docs){
              for(let doc of res.docs){
                let p = doc.data;
                let id = doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length);
                if(!p.security.deleted && !p.security.archived && p.formData.dateDebut <= this.essaiForm.controls.dateCollecte.value && p.formData.dateFin >= this.essaiForm.controls.dateCollecte.value){
  
                  //filtrer au cas ou un racoursi a été utilisé
                  if(this.idUnion && this.idUnion != '' && (p.formData.niveauCollecte == 'union' || p.formData.niveauCollecte == 'op')){
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idOp && this.idOp != '' && p.formData.niveauCollecte == 'op'){
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idPays && this.idPays != '' && (p.formData.niveauCollecte == 'pays' || p.formData.niveauCollecte == 'region' || p.formData.niveauCollecte == 'departement' || p.formData.niveauCollecte == 'commune' || p.formData.niveauCollecte == 'localite')){
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idRegion && this.idRegion != '' && (p.formData.niveauCollecte == 'region' || p.formData.niveauCollecte == 'departement' || p.formData.niveauCollecte == 'commune' || p.formData.niveauCollecte == 'localite')){
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idDepartement && this.idDepartement != '' && (p.formData.niveauCollecte == 'departement' || p.formData.niveauCollecte == 'commune' || p.formData.niveauCollecte == 'localite')){
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idCommune && this.idCommune != '' && (p.formData.niveauCollecte == 'commune' || p.formData.niveauCollecte == 'localite')){
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idLocalite && this.idLocalite != '' && p.formData.niveauCollecte == 'localite'){
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idChamp && this.idChamp != '' && (p.formData.niveauCollecte == 'champ')){
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idPersonne && this.idPersonne != '' && (p.formData.niveauCollecte == 'personne' || p.formData.niveauCollecte == 'champ')){
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else {
                    this.protocoleData.push({id: id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }
                }
              }
  
              //console.log(this.protocoleData)
    
              this.protocoleData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
    
              if(this.doModification){
                this.setSelect2DefaultValue('idProtocole', this.unEssai.idProtocole);
              }else if(this.idProtocole){
                this.setSelect2DefaultValue('idProtocole', this.idProtocole);
              }
              
            }
            
          }).catch((err)=>{
            this.protocoleData = [];
            console.log(err)
          })
  
         /* this.servicePouchdb.findRelationalDocHasMany('protocole', 'projet', idProjet).then((res) => {
            if(res && res.protocoles){
              for(let p of res.protocoles){
                if(!p.security.deleted && !p.security.archived && p.formData.dateDebut <= this.essaiForm.controls.dateCollecte.value && p.formData.dateFin >= this.essaiForm.controls.dateCollecte.value){
  
                  //filtrer au cas ou un racoursi a été utilisé
                  if(this.idUnion && this.idUnion != '' && (p.formData.niveauCollecte == 'union' || p.formData.niveauCollecte == 'op')){
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idOp && this.idOp != '' && p.formData.niveauCollecte == 'op'){
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idPays && this.idPays != '' && (p.formData.niveauCollecte == 'pays' || p.formData.niveauCollecte == 'region' || p.formData.niveauCollecte == 'departement' || p.formData.niveauCollecte == 'commune' || p.formData.niveauCollecte == 'localite')){
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idRegion && this.idRegion != '' && (p.formData.niveauCollecte == 'region' || p.formData.niveauCollecte == 'departement' || p.formData.niveauCollecte == 'commune' || p.formData.niveauCollecte == 'localite')){
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idDepartement && this.idDepartement != '' && (p.formData.niveauCollecte == 'departement' || p.formData.niveauCollecte == 'commune' || p.formData.niveauCollecte == 'localite')){
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idCommune && this.idCommune != '' && (p.formData.niveauCollecte == 'commune' || p.formData.niveauCollecte == 'localite')){
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idLocalite && this.idLocalite != '' && p.formData.niveauCollecte == 'localite'){
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idChamp && this.idChamp != '' && (p.formData.niveauCollecte == 'champ')){
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else if(this.idPersonne && this.idPersonne != '' && (p.formData.niveauCollecte == 'personne' || p.formData.niveauCollecte == 'champ')){
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }else {
                    this.protocoleData.push({id: p.id, numero: p.formData.numero, nom: p.formData.nom, niveauCollecte: p.formData.niveauCollecte});
                  }
                }
              }
    
              this.protocoleData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
    
              if(this.doModification){
                this.setSelect2DefaultValue('idProtocole', this.unEssai.idProtocole);
              }else if(this.idProtocole){
                this.setSelect2DefaultValue('idProtocole', this.idProtocole);
              }
              
            }
          }).catch((err) => {
            this.protocoleData = [];
            console.log(err)
          });*/
          
        }else {
          this.protocoleData = [];
        }
        
      }
      
    }


    getPersonne(){
      this.personneData = [];
      if(this.idPersonne){
        this.servicePouchdb.getLocalDocById('personne_2_'+ this.idPersonne).then((personne) => {
          //console.log(personne)
          if(personne){
            this.personneData.push({id: personne._id.substring(personne._id.lastIndexOf('_') + 1, personne._id.length), matricule: personne.data.formData.matricule, nom: personne.data.formData.nom});
  
            if(this.doModification){
              this.setSelect2DefaultValue('idPersonne', this.unEssai.idPersonne);
            }else{
              this.setSelect2DefaultValue('idPersonne', this.idPersonne);
            }
            
          }
        }).catch((err) => {
          this.personneData = [];
          console.log(err)
        });

        /*this.servicePouchdb.findRelationalDocByID('personne', this.idPersonne).then((res) => {
          if(res && res.personnes && res.personnes[0]){
            this.personneData.push({id: res.personnes[0].id, matricule: res.personnes[0].formData.matricule, nom: res.personnes[0].formData.nom});
  
            if(this.doModification){
              this.setSelect2DefaultValue('idPersonne', this.unEssai.idPersonne);
            }else{
              this.setSelect2DefaultValue('idPersonne', this.idPersonne);
            }
            
          }
        }).catch((err) => {
          this.personneData = [];
          console.log(err)
        });*/
      }else{
        this.servicePouchdb.findDocByTypeAndDeleted('personne', false).then((res) => {
          if(res){
            for(let doc of res.docs){
              this.personneData.push({id: doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length), matricule: doc.data.formData.matricule, nom: doc.data.formData.nom});
            }
  
            this.personneData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            if(this.doModification){
              this.setSelect2DefaultValue('idPersonne', this.unEssai.idPersonne);
            }/*else if(this.idPersonne){
              this.setSelect2DefaultValue('idPersonne', this.idPersonne);
            }*/
            
          }
        }).catch((err) => {
          this.personneData = [];
          console.log(err)
        });
      }
      
    }


    getChampParPersonne(idPersonne){
      this.champData = [];

      if(this.idChamp){
        this.servicePouchdb.getLocalDocById('champ_2_'+ this.idChamp).then((champ) => {
          if(champ){
            this.champData.push({id: champ._id.substring(champ._id.lastIndexOf('_') + 1, champ._id.length), nom: champ.data.formData.nom, code: champ.data.formData.code});
            //console.log(this.unEssai)
            if(this.doModification){
              this.setSelect2DefaultValue('idChamp', this.unEssai.idChamp);
            }else{
              this.setSelect2DefaultValue('idChamp', this.idChamp);
            }
            
          }
        }).catch((err) => {
          this.champData = [];
          console.log(err)
        });

        /*this.servicePouchdb.findRelationalDocByID('champ', this.idChamp).then((res) => {
          if(res && res.champs && res.champs[0]){
            this.champData.push({id: res.champs[0].id, nom: res.champs[0].formData.nom});
            //console.log(this.unEssai)
            if(this.doModification){
              this.setSelect2DefaultValue('idChamp', this.unEssai.idChamp);
            }else{
              this.setSelect2DefaultValue('idChamp', this.idChamp);
            }
            
          }
        }).catch((err) => {
          this.champData = [];
          console.log(err)
        });*/
      }else if(idPersonne && idPersonne != ''){
        this.servicePouchdb.findDocByTypePere('champ', 'personne', idPersonne).then((res) => {
          if(res.docs){
            for(let doc of res.docs){
              //if(!doc.data.security.deleted){
                this.champData.push({id: doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length), nom: doc.data.formData.nom, code: doc.data.formData.code});
              //}
            }

            this.champData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            //console.log(this.unEssai)
            if(this.doModification){
              this.setSelect2DefaultValue('idChamp', this.unEssai.idChamp);
            }else if(this.idChamp){
              this.setSelect2DefaultValue('idChamp', this.idChamp);
            }
          }
        }).catch((err) => {
          this.champData = [];
          console.log(err)
        });

        /*this.servicePouchdb.findRelationalDocHasMany('champ', 'personne', idPersonne).then((res) => {
          if(res && res.champs){
            for(let c of res.champs){
              if(!c.security.deleted){
                this.champData.push({id: c.id, nom: c.formData.nom});
              }
            }
  
            this.champData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            //console.log(this.unEssai)
            if(this.doModification){
              this.setSelect2DefaultValue('idChamp', this.unEssai.idChamp);
            }else if(this.idChamp){
              this.setSelect2DefaultValue('idChamp', this.idChamp);
            }
            
          }
        }).catch((err) => {
          this.champData = [];
          console.log(err)
        });*/
      }else {
        this.champData = [];
      }
      
    }


    initFormioFromShow(){
      if(this.formulaireData.length > 0){
        this.nbEtapes = 2 + this.formulaireData.length;
      }else{
        this.nbEtapes = 2;
      }

      this.wizarAction();
      this.formioForms = [];
      this.formioFormsData = {};
      for(let i=0; i < this.formulaireData.length; i++){
        this.renderFormulaireProtocole(this.formulaireData[i].formData.code, this.formulaireData[i].formioData, this.unEssaiDoc.formioData[this.formulaireData[i].formData.code]);
      }

    }

    getFormulaireParProtocole(idProtocole){
      this.formulaireData = [];

      if(idProtocole && idProtocole != ''){
        this.servicePouchdb.findDocByTypePere('formulaireprotocole', 'protocole', idProtocole).then((res) => {
          if(res.docs){
            for(let doc of res.docs){
              //let f = doc.data;
              //if(!f.security.deleted){
                this.formulaireData.push({id: doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length), ...doc.data});
              //}

              if(this.formulaireData.length > 0){
                this.nbEtapes = 2 + this.formulaireData.length;
              }else{
                this.nbEtapes = 2;
              }
              
              this.formulaireData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              //console.log(this.formulaireData)
  
              //this.setLiDynamiqueWidth();
              this.wizarAction();
              this.formioForms = [];
              this.formioFormsData = {};
              if(this.doModification){
                for(let i=0; i < this.formulaireData.length; i++){
                  this.renderFormulaireProtocole(this.formulaireData[i].formData.code, this.formulaireData[i].formioData, this.unEssaiDoc.formioData[this.formulaireData[i].formData.code]);
                }
              }else{
                for(let i=0; i < this.formulaireData.length; i++){
                  this.renderFormulaireProtocole(this.formulaireData[i].formData.code, this.formulaireData[i].formioData);
                }
             }
            }
          }
        }).catch((err) => {
          this.formulaireData = [];
          this.nbEtapes = 2;
          console.log(err)
        });

        /*this.servicePouchdb.findRelationalDocHasMany('formulaireprotocole', 'protocole', idProtocole).then((res) => {
          if(res && res['formulaireprotocoles']){
            for(let f of res['formulaireprotocoles']){
              if(!f.security.deleted){
                this.formulaireData.push(f);
              }
            }
  
            if(this.formulaireData.length > 0){
              this.nbEtapes = 2 + this.formulaireData.length;
            }else{
              this.nbEtapes = 2;
            }
            
            this.formulaireData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //console.log(this.formulaireData)

            //this.setLiDynamiqueWidth();
            this.wizarAction();
            this.formioForms = [];
            this.formioFormsData = {};
            if(this.doModification){
              for(let i=0; i < this.formulaireData.length; i++){
                this.renderFormulaireProtocole(this.formulaireData[i].formData.code, this.formulaireData[i].formioData, this.unEssaiDoc.formioData[this.formulaireData[i].formData.code]);
              }
            }else{
              for(let i=0; i < this.formulaireData.length; i++){
                this.renderFormulaireProtocole(this.formulaireData[i].formData.code, this.formulaireData[i].formioData);
              }
           }
            
  
            /*if(this.doModification){
              this.setSelect2DefaultValue('idProtocole', this.unEssai.idProtocole);
            }else if(this.idProtocole){
              this.setSelect2DefaultValue('idProtocole', this.idProtocole);
            }********
            
          }
        }).catch((err) => {
          this.formulaireData = [];
          this.nbEtapes = 2;
          console.log(err)
        });*/
      }else {
        this.formulaireData = [];
      }
      
    }


    //getChampParPersonne
    getChampsParPersonne(idPersonne){
      this.champData = [];
      if(this.idChamp){
        this.servicePouchdb.getLocalDocById('champ_2_'+ this.idChamp).then((champ) => {
          if(champ){
            this.champData.push({id: champ._id.substring(champ._id.lastIndexOf('_') + 1, champ._id.length), code: champ.data.formData.code, nom: champ.data.formData.nom});

            if(this.doModification){
              this.setSelect2DefaultValue('idChamp', this.unEssai.idChamp);
            }else{
              this.setSelect2DefaultValue('idChamp', this.idChamp);
            }
          }
        }).catch((err) => {
          this.champData = [];
          this.nbEtapes = 2;
          console.log(err)
        });
         /* this.servicePouchdb.findRelationalDocByID('champ', this.idChamp).then((res) => {
            if(res && res.champs && res.champs[0]){
              this.champData.push({id: res.champs[0].id, code: res.champs[0].formData.code, nom: res.champs[0].formData.nom});

              if(this.doModification){
                this.setSelect2DefaultValue('idChamp', this.unEssai.idChamp);
              }else{
                this.setSelect2DefaultValue('idChamp', this.idChamp);
              }
            }
          }).catch((err) => {
            this.champData = [];
            this.nbEtapes = 2;
            console.log(err)
          });*/
      }else if(idPersonne && idPersonne != ''){
        this.servicePouchdb.findDocByTypePere('champ', 'personne', idPersonne).then((res) => {
          if(res.docs){
            for(let doc of res.docs){
              //if(!doc.data.security.deleted){
                this.champData.push({id: doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length), code: doc.data.formData.code, nom: doc.data.formData.nom});
                //}
            }

            this.champData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            if(this.doModification){
              this.setSelect2DefaultValue('idChamp', this.unEssai.idChamp);
            }else if(this.idChamp){
              this.setSelect2DefaultValue('idChamp', this.idChamp);
            }

          }
        }).catch((err) => {
          this.champData = [];
          this.nbEtapes = 2;
          console.log(err)
        });
/*
          this.servicePouchdb.findRelationalDocHasMany('champ', 'personne', idPersonne).then((res) => {
            if(res && res.champs){
              for(let c of res.champs){
                if(!c.security.deleted){
                  this.champData.push({id: c.id, code: c.formData.code, nom: c.formData.nom});
  
                }
              }
              
              this.champData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              if(this.doModification){
                this.setSelect2DefaultValue('idChamp', this.unEssai.idChamp);
              }else if(this.idChamp){
                this.setSelect2DefaultValue('idChamp', this.idChamp);
              }
  
            }
          }).catch((err) => {
            this.champData = [];
            this.nbEtapes = 2;
            console.log(err)
          });
          */  
      }else {
        this.champData = [];
      }
    }


    setNumeroAndNomInstitution(idInstitution){
      if(idInstitution && idInstitution != ''){
        for(let f of this.institutionData){
          if(idInstitution == f.id){
            this.essaiForm.controls.numeroInstitution.setValue(f.numero);
            this.essaiForm.controls.nomInstitution.setValue(f.nom);

            this.essaiForm.controls.idProjet.setValue(null);
            this.essaiForm.controls.numeroProjet.setValue(null);
            this.essaiForm.controls.nomProjet.setValue(null);

            this.essaiForm.controls.idProtocole.setValue(null);
            this.essaiForm.controls.numeroProtocole.setValue(null);
            this.essaiForm.controls.nomProtocole.setValue(null);
            this.essaiForm.controls.niveauCollecte.setValue(null);
            //console.log(numeroInstitution)
            this.getProjetParInstitution(idInstitution);
            break;
          }
        }
      }else{
        this.essaiForm.controls.numeroInstitution.setValue(null);
        this.essaiForm.controls.nomInstitution.setValue(null);

        this.essaiForm.controls.numeroProjet.setValue(null);
        this.essaiForm.controls.nomProjet.setValue(null);

        this.essaiForm.controls.numeroProtocole.setValue(null);
        this.essaiForm.controls.nomProtocole.setValue(null);
        this.essaiForm.controls.niveauCollecte.setValue(null);
        this.getProjetParInstitution(idInstitution)
      }
    }

    setNumeroAndNomProjet(idProjet){
      //console.log(idProjet)
      if(idProjet && idProjet != ''){
        for(let u of this.projetData){
          if(idProjet == u.id){
            this.essaiForm.controls.idInstitution.setValue(u.idPartenaire)
            this.essaiForm.controls.numeroProjet.setValue(u.numero);
            this.essaiForm.controls.nomProjet.setValue(u.nom);
            
            this.essaiForm.controls.numeroProtocole.setValue(null);
            this.essaiForm.controls.nomProtocole.setValue(null);
            this.essaiForm.controls.niveauCollecte.setValue(null);
            
            //console.log(idProjet)
            this.getProtocoleParProjet(idProjet);
            
            break;
          }
        }
      }else{
        this.essaiForm.controls.idInstitution.setValue(null)
            
        this.essaiForm.controls.nomProjet.setValue(null);
        this.essaiForm.controls.numeroProjet.setValue(null);
        
        this.essaiForm.controls.niveauCollecte.setValue(null);
        this.essaiForm.controls.nomProtocole.setValue(null);
        this.essaiForm.controls.numeroProtocole.setValue(null);
        
        this.getProtocoleParProjet(idProjet);
      }

      //console.log(this.essaiForm.value)
    }

    
    setNumeroAndNomProtocole(idProtocole){
      this.paysData = [];
      this.regionData = [];
      this.departementData = [];
      this.communeData = [];
      this.localiteData = [];
      this.personneData = [];
      this.champData= [];
      this.unionData = [];
      this.unionData = [];
      this.opData = [];
      if(idProtocole && idProtocole != ''){
        for(let u of this.protocoleData){
          if(idProtocole == u.id){
            this.essaiForm.controls.numeroProtocole.setValue(u.numero);
            this.essaiForm.controls.nomProtocole.setValue(u.nom);
            this.essaiForm.controls.niveauCollecte.setValue(u.niveauCollecte);
            this.getFormulaireParProtocole(idProtocole)

            this.essaiForm.controls['numeroUnion'].setValue(null);
            this.essaiForm.controls['nomUnion'].setValue(null);
            this.essaiForm.controls['idUnion'].setValue(null);
            this.essaiForm.controls['numeroOp'].setValue(null);
            this.essaiForm.controls['nomOp'].setValue(null);
            this.essaiForm.controls['idOp'].setValue(null);
            this.essaiForm.controls['matriculePersonne'].setValue(null);
            this.essaiForm.controls['nomPersonne'].setValue(null);
            this.essaiForm.controls['idPersonne'].setValue(null);
            this.essaiForm.controls['nomChamp'].setValue(null);
            this.essaiForm.controls['idChamp'].setValue(null);
            this.essaiForm.controls['codeChamp'].setValue(null);
            this.essaiForm.controls['idPays'].setValue(null);
            this.essaiForm.controls['nomPays'].setValue(null);
            this.essaiForm.controls['codePays'].setValue(null);
            this.essaiForm.controls['nomRegion'].setValue(null);
            this.essaiForm.controls['codeRegion'].setValue(null);
            this.essaiForm.controls['idRegion'].setValue(null);
            this.essaiForm.controls['nomDepartement'].setValue(null);
            this.essaiForm.controls['codeDepartement'].setValue(null);
            this.essaiForm.controls['idDepartement'].setValue(null);
            this.essaiForm.controls['nomCommune'].setValue(null);
            this.essaiForm.controls['codeCommune'].setValue(null);
            this.essaiForm.controls['idCommune'].setValue(null);
            this.essaiForm.controls['nomLocalite'].setValue(null);
            this.essaiForm.controls['codeLocalite'].setValue(null);
            this.essaiForm.controls['idLocalite'].setValue(null);

            if(this.essaiForm.controls.niveauCollecte.value == 'union'){
              this.getUnion();
              this.initSelect2('idUnion', this.translate.instant('ESSAI_PAGE.SELECTIONUNION'));            
            }else if(this.essaiForm.controls.niveauCollecte.value == 'op'){
              this.getUnion();
              this.initSelect2('idUnion', this.translate.instant('ESSAI_PAGE.SELECTIONUNION'));
              this.initSelect2('idOp', this.translate.instant('ESSAI_PAGE.SELECTIONOP'));            
            }else if(this.essaiForm.controls.niveauCollecte.value == 'personne'){
              this.getPersonne();
              this.initSelect2('idPersonne', this.translate.instant('ESSAI_PAGE.SELECTIONPERSONNE'));            
            } else if(this.essaiForm.controls.niveauCollecte.value == 'champ'){
              this.getPersonne();
              this.initSelect2('idPersonne', this.translate.instant('ESSAI_PAGE.SELECTIONPERSONNE'));
              this.initSelect2('idChamp', this.translate.instant('ESSAI_PAGE.SELECTIONCHAMP'));
            }else if(this.essaiForm.controls.niveauCollecte.value == 'pays'){
              this.getPays();
              this.initSelect2('idPays', this.translate.instant('ESSAI_PAGE.SELECTIONPAYS'));
            }else if(this.essaiForm.controls.niveauCollecte.value == 'region'){
              this.getPays();
              this.initSelect2('idPays', this.translate.instant('ESSAI_PAGE.SELECTIONPAYS'));
              this.initSelect2('idRegion', this.translate.instant('ESSAI_PAGE.SELECTIONREGION'));
            }else if(this.essaiForm.controls.niveauCollecte.value == 'departement'){
              this.getPays();
              this.initSelect2('idPays', this.translate.instant('ESSAI_PAGE.SELECTIONPAYS'));
              this.initSelect2('idRegion', this.translate.instant('ESSAI_PAGE.SELECTIONREGION'));
              this.initSelect2('idDepartement', this.translate.instant('ESSAI_PAGE.SELECTIONDEPARTEMENT'));
            }else if(this.essaiForm.controls.niveauCollecte.value == 'commune'){
              this.getPays();
              this.initSelect2('idPays', this.translate.instant('ESSAI_PAGE.SELECTIONPAYS'));
              this.initSelect2('idRegion', this.translate.instant('ESSAI_PAGE.SELECTIONREGION'));
              this.initSelect2('idDepartement', this.translate.instant('ESSAI_PAGE.SELECTIONDEPARTEMENT'));
              this.initSelect2('idCommune', this.translate.instant('ESSAI_PAGE.SELECTIONCOMMUNE'));
            }else{
              this.getPays();
              this.initSelect2('idPays', this.translate.instant('ESSAI_PAGE.SELECTIONPAYS'));
              this.initSelect2('idRegion', this.translate.instant('ESSAI_PAGE.SELECTIONREGION'));
              this.initSelect2('idDepartement', this.translate.instant('ESSAI_PAGE.SELECTIONDEPARTEMENT'));
              this.initSelect2('idCommune', this.translate.instant('ESSAI_PAGE.SELECTIONCOMMUNE'));
              this.initSelect2('idLocalite', this.translate.instant('ESSAI_PAGE.SELECTIONLOCALITE'));
            }
                  
            break;
          }
        }
      }else{
        this.essaiForm.controls.niveauCollecte.setValue(null);
        this.essaiForm.controls.nomProtocole.setValue(null);
        this.essaiForm.controls.numeroProtocole.setValue(null);

        this.essaiForm.controls['numeroUnion'].setValue(null);
        this.essaiForm.controls['nomUnion'].setValue(null);
        this.essaiForm.controls['idUnion'].setValue(null);
        this.essaiForm.controls['numeroOp'].setValue(null);
        this.essaiForm.controls['nomOp'].setValue(null);
        this.essaiForm.controls['idOp'].setValue(null);
        this.essaiForm.controls['matriculePersonne'].setValue(null);
        this.essaiForm.controls['nomPersonne'].setValue(null);
        this.essaiForm.controls['idPersonne'].setValue(null);
        this.essaiForm.controls['nomChamp'].setValue(null);
        this.essaiForm.controls['idChamp'].setValue(null);
        this.essaiForm.controls['codeChamp'].setValue(null);
        this.essaiForm.controls['idPays'].setValue(null);
        this.essaiForm.controls['nomPays'].setValue(null);
        this.essaiForm.controls['codePays'].setValue(null);
        this.essaiForm.controls['nomRegion'].setValue(null);
        this.essaiForm.controls['codeRegion'].setValue(null);
        this.essaiForm.controls['idRegion'].setValue(null);
        this.essaiForm.controls['nomDepartement'].setValue(null);
        this.essaiForm.controls['codeDepartement'].setValue(null);
        this.essaiForm.controls['idDepartement'].setValue(null);
        this.essaiForm.controls['nomCommune'].setValue(null);
        this.essaiForm.controls['codeCommune'].setValue(null);
        this.essaiForm.controls['idCommune'].setValue(null);
        this.essaiForm.controls['nomLocalite'].setValue(null);
        this.essaiForm.controls['codeLocalite'].setValue(null);
        this.essaiForm.controls['idLocalite'].setValue(null);

        this.getFormulaireParProtocole(idProtocole)
      }

      //console.log(this.essaiForm.value)
    }

    setNumeroAndNomPersonne(idPersonne){
      if(idPersonne && idPersonne != ''){
        for(let m of this.personneData){
          if(idPersonne == m.id){
            this.essaiForm.controls.matriculePersonne.setValue(m.matricule);
            this.essaiForm.controls.nomPersonne.setValue(m.nom);

            this.essaiForm.controls.nomChamp.setValue(null);
            this.essaiForm.controls.codeChamp.setValue(null);
            
            this.getChampsParPersonne(idPersonne)
            break;
          }
        }
      }else{
        this.essaiForm.controls.nomPersonne.setValue(null);
        this.essaiForm.controls.matriculePersonne.setValue(null);

        this.essaiForm.controls.nomChamp.setValue(null);
        this.essaiForm.controls.codeChamp.setValue(null);
            
        this.getChampsParPersonne(idPersonne)
      }

      //console.log(this.essaiForm.value)
    }


    setNumeroAndNomChamp(idChamp){
      if(idChamp && idChamp != ''){
        for(let c of this.champData){
          if(idChamp == c.id){
            //console.log(c)
            this.essaiForm.controls.nomChamp.setValue(c.nom);
            this.essaiForm.controls.codeChamp.setValue(c.code);
            //console.log(this.essaiForm.controls.codeChamp.value)
            //console.log(this.essaiForm.controls.nomChamp.value)
            break;
          }
        }
      }else{
        this.essaiForm.controls.nomChamp.setValue(null);
        this.essaiForm.controls.codeChamp.setValue(null);
      }

     // console.log(this.essaiForm.value)
    }
  
    getUnion(){
      if(this.idUnion){
        this.servicePouchdb.getLocalDocById('union_2_'+ this.idUnion).then((union) => {
          if(union){
            this.unionData.push({id: union._id.substring(union._id.lastIndexOf('_') + 1, union._id.length), numero: union.data.formData.numero, nom: union.data.formData.nom});

            if(this.doModification){
              this.setSelect2DefaultValue('idUnion', this.unEssai.idUnion);
            }else{
              this.setSelect2DefaultValue('idUnion', this.idUnion);
              /*$('#idUnion select').ready(()=>{
                $('#idUnion select').attr('disabled', true)
              });*/
            }
          }
        }).catch((err) => {
          this.unionData = [];
          console.log(err)
        });

        /*this.servicePouchdb.findRelationalDocByID('union', this.idUnion).then((res) => {
          if(res && res.unions && res.unions[0]){
              this.unionData.push({id: res.unions[0].id, numero: res.unions[0].formData.numero, nom: res.unions[0].formData.nom});

            if(this.doModification){
              this.setSelect2DefaultValue('idUnion', this.unEssai.idUnion);
            }else{
              this.setSelect2DefaultValue('idUnion', this.idUnion);
              /*$('#idUnion select').ready(()=>{
                $('#idUnion select').attr('disabled', true)
              });****
            }
            
          }
        }).catch((err) => {
          this.unionData = [];
          console.log(err)
        });*/
      }else {
        this.servicePouchdb.findDocByTypeAndDeleted('union', false).then((res) => {
          if(res && res.docs){
            for(let u of res.docs){
                this.unionData.push({id: u._id.substring(u._id.lastIndexOf('_') + 1, u._id.length), numero: u.data.formData.numero, nom: u.data.formData.nom});
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
              this.setSelect2DefaultValue('idUnion', this.unEssai.idUnion);
            }/*else if(this.idUnion){
              this.setSelect2DefaultValue('idUnion', this.idUnion);
              $('#idUnion select').ready(()=>{
                $('#idUnion select').attr('disabled', true)
              });
            }*/
            
          }
        }).catch((err) => {
          this.unionData = [];
          console.log(err)
        });

        /*this.servicePouchdb.findRelationalDocByTypeAndDeleted('union', false).then((res) => {
          if(res && res.unions){
            for(let u of res.unions){
                this.unionData.push({id: u.id, numero: u.formData.numero, nom: u.formData.nom});
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
              this.setSelect2DefaultValue('idUnion', this.unEssai.idUnion);
            }/*else if(this.idUnion){
              this.setSelect2DefaultValue('idUnion', this.idUnion);
              $('#idUnion select').ready(()=>{
                $('#idUnion select').attr('disabled', true)
              });
            }****
            
          }
        }).catch((err) => {
          this.unionData = [];
          console.log(err)
        });*/
      }
      
    }

    getOpParUnion(idUnion){
      this.opData = [];
      if(this.idOp){
        this.servicePouchdb.getLocalDocById('op_2_'+ this.idOp).then((op) => {
          if(op){
            this.opData.push({id: op._id.substring(op._id.lastIndexOf('_') + 1, op._id.length), numero: op.data.formData.numero, nom: op.data.formData.nom});
  
            if(this.doModification){
              this.setSelect2DefaultValue('idOp', this.unEssai.idOp);
            }else {
              this.setSelect2DefaultValue('idOp', this.idOp);
              /*$('#idOp select').ready(()=>{
                $('#idOp select').attr('disabled', true)
              });*/
            }
          }
        }).catch((err) => {
          this.opData = [];
          console.log(err)
        });

        /*this.servicePouchdb.findRelationalDocByID('op', this.idOp).then((res) => {
          if(res && res.ops && res.ops[0]){
            this.opData.push({id: res.ops[0].id, numero: res.ops[0].formData.numero, nom: res.ops[0].formData.nom});
  
            if(this.doModification){
              this.setSelect2DefaultValue('idOp', this.unEssai.idOp);
            }else {
              this.setSelect2DefaultValue('idOp', this.idOp);
              /*$('#idOp select').ready(()=>{
                $('#idOp select').attr('disabled', true)
              });*****
            }
            
          }
        }).catch((err) => {
          this.opData = [];
          console.log(err)
        });*/
      }else if(idUnion && idUnion != ''){

        this.servicePouchdb.findDocByTypePere('op', 'union', idUnion).then((res) => {
          if(res.docs){
            for(let doc of res.docs){
              //if(!doc.data.security.deleted){
                this.opData.push({id: doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length), numero: doc.data.formData.numero, nom: doc.data.formData.nom});
              //}
            }

            this.opData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            if(this.doModification){
              this.setSelect2DefaultValue('idOp', this.unEssai.idOp);
            }else if(this.idOp){
              this.setSelect2DefaultValue('idOp', this.idOp);
              /*$('#idOp select').ready(()=>{
                $('#idOp select').attr('disabled', true)
              });*/
            }
            
          }
        }).catch((err) => {
          this.opData = [];
          console.log(err)
        });

        /*this.servicePouchdb.findRelationalDocHasMany('op', 'union', idUnion).then((res) => {
          if(res && res.ops){
            for(let u of res.ops){
              if(!u.security.deleted){
                this.opData.push({id: u.id, numero: u.formData.numero, nom: u.formData.nom});
              }
            }
  
            this.opData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            if(this.doModification){
              this.setSelect2DefaultValue('idOp', this.unEssai.idOp);
            }else if(this.idOp){
              this.setSelect2DefaultValue('idOp', this.idOp);
              /*$('#idOp select').ready(()=>{
                $('#idOp select').attr('disabled', true)
              });***
            }
            
          }
        }).catch((err) => {
          this.opData = [];
          console.log(err)
        });*/
      }else{
        //get les ops indépendantes
        //get les ops indépendantes
        this.servicePouchdb.findDocByTypeNiveauAndDeleted('op', '3', false).then((res) => {
          if(res && res.docs){
            //this.unions = [...unions];
            this.opData = [];
            //var datas = [];
            for(let u of res.docs){
              //if(f.data.formData.categorie == 'Fédération'){
                this.opData.push({id: u._id.substring(u._id.lastIndexOf('_') + 1, u._id.length), numero: u.data.formData.numero, nom: u.data.formData.nom});
              //}
            }
  
            this.opData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            if(this.doModification){
              this.setSelect2DefaultValue('idOp', this.unEssai.idOp);
            }else if(this.idOp){
              this.setSelect2DefaultValue('idOp', this.idOp);
              /*$('#idOp select').ready(()=>{
                $('#idOp select').attr('disabled', true)
              });*/
            }
            
          }
        }).catch((err) => {
          this.opData = [];
          console.log(err)
        });
      }
      /*

        this.servicePouchdb.findRelationalDocByTypeNiveauAndDeleted('op', '3', false).then((res) => {
          if(res && res.ops){
            //this.unions = [...unions];
            this.opData = [];
            //var datas = [];
            for(let u of res.ops){
              //if(f.data.formData.categorie == 'Fédération'){
                this.opData.push({id: u.id, numero: u.formData.numero, nom: u.formData.nom});
              //}
            }
  
            this.opData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });
  
            if(this.doModification){
              this.setSelect2DefaultValue('idOp', this.unEssai.idOp);
            }else if(this.idOp){
              this.setSelect2DefaultValue('idOp', this.idOp);
              /*$('#idOp select').ready(()=>{
                $('#idOp select').attr('disabled', true)
              });******
            }
            
          }
        }).catch((err) => {
          this.opData = [];
          console.log(err)
        });
      }*/
      
    }


    setNumeroAndNomUnion(idUnion){
      if(idUnion && idUnion != ''){
        for(let u of this.unionData){
          if(idUnion == u.id){
            this.essaiForm.controls.numeroUnion.setValue(u.numero);
            this.essaiForm.controls.nomUnion.setValue(u.nom);

            this.essaiForm.controls.idOp.setValue(null);
            this.essaiForm.controls.numeroOp.setValue(null);
            this.essaiForm.controls.nomOp.setValue(null);
            //console.log(numeroFederation)
            this.getOpParUnion(idUnion)
            break;
          }
        }
      }else{
        this.essaiForm.controls.nomUnion.setValue(null);
        this.essaiForm.controls.numeroUnion.setValue(null);

        this.essaiForm.controls.numeroOp.setValue(null);
        this.essaiForm.controls.nomOp.setValue(null);
        this.getOpParUnion(idUnion)
      }

      //console.log(this.essaiForm.controls)
    }

    setNumeroAndNomOp(idOp){
      if(idOp && idOp != ''){
        for(let o of this.opData){
          if(idOp == o.id){
            this.essaiForm.controls.numeroOp.setValue(o.numero);
            this.essaiForm.controls.nomOp.setValue(o.nom);
            break;
          }
        }
      }else{
        this.essaiForm.controls.nomOp.setValue(null);
        this.essaiForm.controls.numeroOp.setValue(null);

      }

      //console.log(this.essaiForm.controls)
    }
  


    getPays(){
      this.paysData = [];
      if(this.idPays){
        this.servicePouchdb.findRelationalDocByID('pays', this.idPays).then((res) => {
          if(res && res.pays && res.pays[0]){
            this.paysData.push({id: res.pays[0].id, ...res.pays[0].formData});
  
            if(this.doModification){
              this.setSelect2DefaultValue('idPays', this.unEssai.idPays);
            }else{
              this.setSelect2DefaultValue('idPays', this.idPays);
            }
          }
        }).catch((e) => {
          console.log('pays erreur: '+e);
          this.paysData = [];
        });
  
      }else{
        this.servicePouchdb.findAllRelationalDocByType('pays').then((res) => {
          if(res && res.pays){
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
              this.setSelect2DefaultValue('idPays', this.unEssai.idPays);
            }/*else if(this.idPays){
              this.setSelect2DefaultValue('idPays', this.idPays);
            }*/
          }
        }).catch((e) => {
          console.log('pays erreur: '+e);
          this.paysData = [];
        });  
      }
    }

    getRegionParPays(idPays){
      this.regionData = [];
      if(this.idRegion){
        this.servicePouchdb.findRelationalDocByID('region', this.idRegion).then((res) => {
          if(res && res.regions && res.regions[0]){
              
            this.regionData.push({id: res.regions[0].id, ...res.regions[0].formData});
  
            if(this.doModification){
              this.setSelect2DefaultValue('idRegion', this.unEssai.idRegion);
            }else {
              this.setSelect2DefaultValue('idRegion', this.idRegion);
            }
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
              this.setSelect2DefaultValue('idRegion', this.unEssai.idRegion);
            }/*else if(this.idRegion){
              this.setSelect2DefaultValue('idRegion', this.idRegion);
            }*/
          }
        }).catch((e) => {
          console.log('region erreur: '+e);
          this.regionData = [];
        });  
      }
      
    }

    getDepartementParRegion(idRegion){
      this.departementData = [];
      if(this.idDepartement){
        this.servicePouchdb.findRelationalDocByID('departement', this.idDepartement).then((res) => {
          if(res && res.departements && res.departements[0]){
            this.departementData.push({id: res.departements[0].id, ...res.departements[0].formData});

            if(this.doModification){
              this.setSelect2DefaultValue('idDepartement', this.unEssai.idDepartement);
            }else{
              this.setSelect2DefaultValue('idDepartement', this.idDepartement);
            }
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
              this.setSelect2DefaultValue('idDepartement', this.unEssai.idDepartement);
            }/*else if(this.idDepartement){
              this.setSelect2DefaultValue('idDepartement', this.idDepartement);
            }*/
          }
        }).catch((e) => {
          console.log('departement erreur: '+e);
          this.departementData = [];
        });  
      }
      
      
    }

    getCommuneParDepartement(idDepartement){
      this.communeData = [];
      if(this.idCommune){
        this.servicePouchdb.findRelationalDocByID('commune', this.idChamp).then((res) => {
          if(res && res.communes && res.communes[0]){
            this.communeData.push({id: res.communes[0].id, ...res.communes[0].formData});
  
            if(this.doModification){
              this.setSelect2DefaultValue('idCommune', this.unEssai.idCommune);
            }else{
              this.setSelect2DefaultValue('idCommune', this.idCommune);
            }
          }
        }).catch((e) => {
          console.log('Commune erreur: '+e);
          this.communeData = [];
        });  
      }else {
        this.servicePouchdb.findRelationalDocHasMany('commune', 'departement', idDepartement).then((res) => {
          if(res && res.communes){
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
              this.setSelect2DefaultValue('idCommune', this.unEssai.idCommune);
            }/*else if(this.idCommune){
              this.setSelect2DefaultValue('idCommune', this.idCommune);
            }*/
          }
        }).catch((e) => {
          console.log('Commune erreur: '+e);
          this.communeData = [];
        });  
      }
      
    }

    
    getLocaliteParCommune(idCommune){
      this.localiteData = [];
      if(this.idLocalite){
        this.servicePouchdb.findRelationalDocByID('localite', this.idLocalite).then((res) => {
          if(res && res.localites && res.localites[0]){
            this.localiteData.push({id: res.localites[0].id, ...res.localites[0].formData});
            
            if(this.doModification){
              this.setSelect2DefaultValue('idLocalite', this.unEssai.idLocalite);
            }else {
              this.setSelect2DefaultValue('idLocalite', this.idLocalite);
            }
          }
        }).catch((e) => {
          console.log('vilage commune erreur: '+e);
          this.localiteData = [];
        });
      }else{
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
              this.setSelect2DefaultValue('idLocalite', this.unEssai.idLocalite);
            }/*else if(this.idLocalite){
              this.setSelect2DefaultValue('idLocalite', this.idLocalite);
            }*/
          }
        }).catch((e) => {
          console.log('vilage commune erreur: '+e);
          this.localiteData = [];
        });
      }
      
    }

    setCodeAndNomPays(idPays){
      if(idPays && idPays != ''){
        for(let p of this.paysData){
          if(idPays == p.id){
            this.essaiForm.controls.codePays.setValue(p.code);
            this.essaiForm.controls.nomPays.setValue(p.nom);

            this.essaiForm.controls.idRegion.setValue(null);
            this.essaiForm.controls.codeRegion.setValue(null);
            this.essaiForm.controls.nomRegion.setValue(null);

            this.departementData = [];
            this.essaiForm.controls.idDepartement.setValue(null);
            this.essaiForm.controls.codeDepartement.setValue(null);
            this.essaiForm.controls.nomDepartement.setValue(null);

            this.communeData = [];
            this.essaiForm.controls.idCommune.setValue(null);
            this.essaiForm.controls.codeCommune.setValue(null);
            this.essaiForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.essaiForm.controls.idLocalite.setValue(null);
            this.essaiForm.controls.codeLocalite.setValue(null);
            this.essaiForm.controls.nomLocalite.setValue(null);

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
            this.essaiForm.controls.codeRegion.setValue(r.code);
            this.essaiForm.controls.nomRegion.setValue(r.nom);

            this.essaiForm.controls.idDepartement.setValue(null);
            this.essaiForm.controls.codeDepartement.setValue(null);
            this.essaiForm.controls.nomDepartement.setValue('');

            this.communeData = [];
            this.essaiForm.controls.idCommune.setValue(null);
            this.essaiForm.controls.codeCommune.setValue(null);
            this.essaiForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.essaiForm.controls.idLocalite.setValue(null);
            this.essaiForm.controls.codeLocalite.setValue(null);
            this.essaiForm.controls.nomLocalite.setValue(null);

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
            this.essaiForm.controls.codeDepartement.setValue(d.code);
            this.essaiForm.controls.nomDepartement.setValue(d.nom);

            this.essaiForm.controls.idCommune.setValue(null);
            this.essaiForm.controls.codeCommune.setValue(null);
            this.essaiForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.essaiForm.controls.idLocalite.setValue(null);
            this.essaiForm.controls.codeLocalite.setValue(null);
            this.essaiForm.controls.nomLocalite.setValue(null);

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
            this.essaiForm.controls.codeCommune.setValue(c.code);
            this.essaiForm.controls.nomCommune.setValue(c.nom);
            
            this.essaiForm.controls.idLocalite.setValue(null);
            this.essaiForm.controls.codeLocalite.setValue(null);
            this.essaiForm.controls.nomLocalite.setValue(null);
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
            this.essaiForm.controls.codeLocalite.setValue(l.code);
            this.essaiForm.controls.nomLocalite.setValue(l.nom);
            break;
          }
        }
      }
    }
  
    setIDCodeEtNomPays(paysData){
      this.essaiForm.controls.idPays.setValue(paysData.id);
      this.essaiForm.controls.codePays.setValue(paysData.code);
      this.essaiForm.controls.nomPays.setValue(paysData.nom);
    }

    setIDCodeEtNomRegion(regionData){
      this.essaiForm.controls.idRegion.setValue(regionData.id);
      this.essaiForm.controls.codeRegion.setValue(regionData.code);
      this.essaiForm.controls.nomRegion.setValue(regionData.nom);
    }

    setIDCodeEtNomDepartement(departementData){
      this.essaiForm.controls.idDepartement.setValue(departementData.id);
      this.essaiForm.controls.codeDepartement.setValue(departementData.code);
      this.essaiForm.controls.nomDepartement.setValue(departementData.nom);
    }

    setIDCodeEtNomCommune(communeData){
      this.essaiForm.controls.idCommune.setValue(communeData.id);
      this.essaiForm.controls.codeCommune.setValue(communeData.code);
      this.essaiForm.controls.nomCommune.setValue(communeData.nom);
    }

    setIDCodeEtNomLocalite(localiteData){
      this.essaiForm.controls.idLocalite.setValue(localiteData.id);
      this.essaiForm.controls.codeLocalite.setValue(localiteData.code);
      this.essaiForm.controls.nomLocalite.setValue(localiteData.nom);
    }

  

    attacheEventToDataTable(datatable, id){
      var self = this;
      //var id = 'essai-datatable';
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
        console.log(this.essaiHTMLTable.datatable.row(this).data());
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
      
    }

  
    translateLangue(){
      this.translate.use(global.langue);
      this.translateMessagesValidation();
    }
    
    translateMessagesValidation(){
       //numero fédération
       this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.NUMERO_INSTITUTION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idInstitution[0].message = res;
      });

      //numero projet
       this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.NUMERO_PROJET.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idProjet[0].message = res;
      });

      //numero protocole
      this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.NUMERO_PROTOCOLE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idProtocole[0].message = res;
      });

      //numero personne
      this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.MATRICULE_PERSONNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPersonne[0].message = res;
      });

      //numero champ
      this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.CODE_CHAMP.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idChamp[0].message = res;
      });

      
      //code pays
      this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPays[0].message = res;
      });


      //code région
      this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idRegion[0].message = res;
      });

       //code département
       this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idDepartement[0].message = res;
      });

      //code commune
      this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.CODECOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idCommune[0].message = res;
      });

      //code localité
      this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.CODELOCALITE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idLocalite[0].message = res;
      });

      //numero union
      this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.NUMERO_UNION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idUnion[0].message = res;
      });

       //numero op
       this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.NUMERO_OP.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idOp[0].message = res;
      });

      //autre type domaine
      /*this.translate.get('ESSAI_PAGE.MESSAGES_VALIDATION.DOMAINE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.domaine[0].message = res;
      });*/
    }
  
    
    dataTableAddRow(rowData){

      $('#essai-dataTable').ready(() => {
        this.essaiHTMLTable.datatable.row.add(rowData).draw();
      });
      
    }
  
    dataTableUpdateRow(/*index, */rowData){

      $('#essai-dataTable').ready(() => {
        this.essaiHTMLTable.datatable.row('.selected').data(rowData).draw();
      });
      
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      $('#essai-dataTable').ready(() => {
        this.essaiHTMLTable.datatable.rows('.selected').remove().draw();
      });

    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.essaiHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.essaiHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.essaiHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    if(this.essaiHTMLTable && this.essaiHTMLTable.datatable){
      //var id = 'essai-datatable';

      var self = this;
      //$('#'+id+' thead tr:eq(1)').show();

      //$(self.essaiHTMLTable.datatable.table().header() ).children(1).show();
      $(self.essaiHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
      this.recherchePlus = true;
    }
  }

  dataTableRemoveRechercheParColonne(){
    //var id = 'essai-datatable';
    var self = this;

    //$('#'+id+' thead tr:eq(1)').hide();
    //$(self.essaiHTMLTable.datatable.table().header() ).children(1).hide();
    $(self.essaiHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'essai-datatable';
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
      $( self.essaiHTMLTable.datatable.table().footer() ).show();
      this.essaiHTMLTable.datatable.columns().every( function () {
          i = i +1;
          //console.log("data-header=" +$(self.essaiHTMLTable.datatable.table().header()).children(0).children(0)[1].firstChild.nodeValue)
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
                  
                  var info = self.essaiHTMLTable.datatable.page.info();
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
          /*$( self.essaiHTMLTable.datatable.table().footer() ).children(0).each( function (i) {
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

      this.essaiHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
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
      $( self.essaiHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }

  dataTableRemoveCustomFiltre(){
    var id = 'essai-datatable';
    var self = this;
    //$('#'+id+' tfoot').hide();
    $( self.essaiHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }


    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        ///let u = [...this.essaisData]
        this.essaisData = this.allEssaisData.filter((item) => {
          return item.numero.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.essaiData = temp;
      
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

