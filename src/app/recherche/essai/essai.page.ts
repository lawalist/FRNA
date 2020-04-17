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
//Speed: 1000 IDs per hour/second
//~4 million years needed, in order to have a 1% probability of at least one collision.
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 16)

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
  @Input() idPartenaire: string;
  @Input() idProjet: string;
  @Input() idProtocole: string;

  essaiForm: FormGroup;
  action: string = 'liste';
  cacheAction: string = 'liste';
  essais: any = [];
  essaisData: any = [];
  allEssaisData: any = [];
  institutionData: any = [];
  projetData: any = [];
  protocoleData: any = [];
  formulaireData: any = [];
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

  nbEtapes = 2;
  etapeCourante = 1;
  rev = 0;

  colonnes = ['numero', 'annee', 'nomInstitution', 'numeroInstitution', 'nomProjet', 'numeroProjet', 'nomProtocole', 'numeroProtocole']

  messages_validation = {
    'idInstitution': [
      { type: 'required', message: '' }
    ],
    'idProjet': [
      { type: 'required', message: '' }
    ],
    'idProtocole': [
      { type: 'required', message: '' }
    ]
  }

  annee;

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la essai est en mode modal, on chercher info region
      this.translateLangue();
      this.getEssai();
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
        var steps = $("fieldset").length;
        
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

    iniAnneDatePicker(id){
      var self = this;

      $(function () {
        
        $('#'+id+' input').datepicker({
          minViewMode: 2,
          autoclose: true,
          //viewMode: 'years',
          format: 'yyyy',
          language: global.langue
        }).on('changeDate', function(e) {
          // `e` here contains the extra attributes
          //console.log(e.date)
          //console.log(new Date(new Date().getFullYear(), 0, 1))
          self.annee = e.date.getFullYear();
          self.essaiForm.controls.annee.setValue(e.date.getFullYear());
          self.essaiForm.controls.idProjet.setValue(null);
          self.essaiForm.controls.numeroProjet.setValue(null);
          self.essaiForm.controls.nomProjet.setValue(null);

          self.essaiForm.controls.idProtocole.setValue(null);
          self.essaiForm.controls.numeroProtocole.setValue(null);
          self.essaiForm.controls.nomProtocole.setValue(null);
          //console.log(numeroInstitution)
          self.getProjetParInstitution(self.essaiForm.controls.idInstitution.value);
          //$('#'+id+' input').datepicker('hide')
        });
      });
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
          self.essaiForm.controls[id].setValue(e.params.data.id)
          if(id == 'idInstitution'){
            self.setNumeroAndNomInstitution(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idProjet'){
            self.setNumeroAndNomProjet(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          } else if(id == 'idProtocole'){
            self.setNumeroAndNomProtocole(self.essaiForm.value[id]);
            self.setSelectRequredError(id, id)
          }          
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.essaiForm.controls[id].setValue(null); 
          if(id == 'idInstitution'){
            self.essaiForm.controls.idInstitution.setValue(null);
            self.essaiForm.controls.numeroInstitution.setValue(null);
            self.essaiForm.controls.nomInstitution.setValue(null);

            self.essaiForm.controls.idProjet.setValue(null);
            self.essaiForm.controls.numeroProjet.setValue(null);
            self.essaiForm.controls.nomProjet.setValue(null);

            self.essaiForm.controls.idProtocole.setValue(null);
            self.essaiForm.controls.numeroProtocole.setValue(null);
            self.essaiForm.controls.nomProtocole.setValue(null);
            //self.setSelect2DefaultValue('numeroProjet', null);
            self.projetData = [];
            self.protocoleData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'idProjet'){
            self.essaiForm.controls.idProjet.setValue(null);
            self.essaiForm.controls.numeroProjet.setValue(null);
            self.essaiForm.controls.nomProjet.setValue(null);

            self.essaiForm.controls.idProtocole.setValue(null);
            self.essaiForm.controls.numeroProtocole.setValue(null);
            self.essaiForm.controls.nomProtocole.setValue(null);
            self.protocoleData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'idProtocole'){
            self.essaiForm.controls.idProtocole.setValue(null);
            self.essaiForm.controls.numeroProtocole.setValue(null);
            self.essaiForm.controls.nomProtocole.setValue(null);
            self.formulaireData = [];
            self.setSelectRequredError(id, id);
            self.nbEtapes = 2;
            self.wizarAction();
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
        numero: [nanoid(), Validators.required],
        annee: [""],
        nomInstitution: [null, Validators.required],
        numeroInstitution: [null, Validators.required],
        idInstitution: [null, Validators.required],
        nomProjet: [null, Validators.required],
        numeroProjet: [null, Validators.required],
        idProjet: [null, Validators.required], 
        nomProtocole: [null, Validators.required],
        numeroProtocole: [null/*, Validators.required*/],
        idProtocole: [null, Validators.required], 
      });

      this.validerNumero();
    }
  
    editForm(oDoc){
      let essai = oDoc.essais[0];
      let idInstitution;
      let numeroInstitution;
      let nomInstitution;
      let idProjet;
      let numeroProjet;
      let nomProjet;
      let idProtocole;
      let numeroProtocole;
      let nomProtocole;
      
      if(oDoc.partenaires && oDoc.partenaires[0]){
        idInstitution = oDoc.partenaires[0].id;
        numeroInstitution = oDoc.partenaires[0].formData.numero;
        nomInstitution = oDoc.partenaires[0].formData.nom;
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
     
      //this.essaiForm = null;
      let u = essai.formData

      this.essaiForm = this.formBuilder.group({
        numero: [u.numero],
        annee: [u.annee],
        nomInstitution: [nomInstitution],
        numeroInstitution: [numeroInstitution],
        idInstitution: [idInstitution],
        nomProjet: [nomProjet], 
        numeroProjet: [numeroProjet],
        idProjet: [idProjet],
        nomProtocole: [nomProtocole], 
        numeroProtocole: [numeroProtocole],
        idProtocole: [idProtocole]
      });

      this.validerNumero();

    }

    validerNumero(){
      let numeroControl = this.essaiForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndNumero('essai', value).then((res) => {
          if(res && res.essais && res.essais[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.unEssai.numero))){
            numeroControl.setErrors({uniqueNumeroEssai: true});
          }
        });
      });      
    
    }

    contunier(e, target){
      console.log(target)
      e.preventDefault();
      $('#myTab a[href="#'+target+'"]').tab('show');
    }

    showFormioData(idProtocole, data){
      this.formulaireData = [];

      if(idProtocole && idProtocole != ''){
        this.servicePouchdb.findRelationalDocHasMany('formulaire-protocole', 'protocole', idProtocole).then((res) => {
          if(res && res['formulaire-protocoles']){
            for(let f of res['formulaire-protocoles']){
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
      this.annee = (new Date).getFullYear();
      if(this.idProtocole && this.idProtocole != ''){
        if(this.essaiHTMLTable && this.essaiHTMLTable.datatable && this.essaiHTMLTable.datatable.row(0) && this.essaiHTMLTable.datatable.row(0).data()){
          this.idPartenaire = this.essaiHTMLTable.datatable.row(0).data().numeroInstitution;
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
          this.idPartenaire = this.essaiHTMLTable.datatable.row(0).data().numeroInstitution;
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('projet', this.idProjet).then((res) => {
            if(res && res.projets){
              this.idPartenaire = res.projets[0].partenaire;
            }
          })
        }
      }
  
      this.getInstitution();
      //this.getProjet();
      this.initForm();
      this.iniAnneDatePicker('annee');
      this.initSelect2('idInstitution', this.translate.instant('ESSAi_PAGE.SELECTIONINSTITUTION'));
      this.initSelect2('idProjet', this.translate.instant('ESSAI_PAGE.SELECTIONPROJET'));
      this.initSelect2('idProtocole', this.translate.instant('ESSAI_PAGE.SELECTIONPROTOCOLE'));
      //this.initSelect2('domaine', this.translate.instant('ESSAI_PAGE.DOMAINE'));
      
      this.action = 'ajouter';
      this.wizarAction();
    }
  
    infos(u){
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
        this.servicePouchdb.findRelationalDocByID('essai', id).then((res) => {
          
          if(res && res.essais[0]){
            this.unEssaiDoc = res;
            this.rev = res.essais[0].rev.substring(0, res.essais[0].rev.indexOf('-'));
            //console.log(this.unEssaiDoc.essais[0])
            this.showFormioData(res.essais[0].protocole, res.essais[0])
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
        });
          
      }
    }

  
    modifier(essai){
      //console.log(essai)
      this.nbEtapes = 2;
      let id;
      if(isObject(essai)){
        id = essai.id;
      }else{
        id = essai;
      }

      this.doModification = true;
      //si l'utilisateur est passé par infos pour faire la modificatin
      if(this.action == 'infos' && this.unEssaiDoc){
          this.editForm(this.clone(this.unEssaiDoc));
          this.unEssaiDoc = this.unEssaiDoc.essais[0];

          this.getInstitution();

          this.getProjetParInstitution(this.unEssaiDoc.partenaire);
          this.getProtocoleParProjet(this.unEssaiDoc.projet);
          //this.getFormulaireParProtocole(this.unEssaiDoc.protocole);
          this.initFormioFromShow();

          //this.editForm(res);
          this.iniAnneDatePicker('annee');
          this.initSelect2('idInstitution', this.translate.instant('ESSAi_PAGE.SELECTIONINSTITUTION'));
          this.initSelect2('idProjet', this.translate.instant('ESSAI_PAGE.SELECTIONPROJET'));
          this.initSelect2('idProtocole', this.translate.instant('ESSAI_PAGE.SELECTIONPROTOCOLE'));          
         
          this.action ='modifier';
          this.wizarAction();
      }else{
        this.unEssaiDoc = null;
        this.servicePouchdb.findRelationalDocByID('essai', id).then((res) => {
        
          if(res && res.essais[0]){
            let oDoc = res.essais[0];
            this.unEssaiDoc = oDoc;
            this.editForm(res);
            this.getInstitution();
  
            this.getProjetParInstitution(this.unEssaiDoc.partenaire);
            this.getProtocoleParProjet(this.unEssaiDoc.projet);
            this.getFormulaireParProtocole(this.unEssaiDoc.protocole);
            
            this.iniAnneDatePicker('annee');
            this.initSelect2('idInstitution', this.translate.instant('ESSAi_PAGE.SELECTIONINSTITUTION'));
            this.initSelect2('idProjet', this.translate.instant('ESSAI_PAGE.SELECTIONPROJET'));
            this.initSelect2('idProtocole', this.translate.instant('ESSAI_PAGE.SELECTIONPROTOCOLE'));          
           
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

        formElement.innerHTML = '';
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

                this.servicePouchdb.findRelationalDocByID('essai', u.id).then((res) => {
                  res.essais[0].security = this.servicePouchdb.garderDeleteTrace(res.essais[0].security);

                  this.servicePouchdb.updateRelationalDoc(res.essais[0]).then((res) => {
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

                this.servicePouchdb.findRelationalDocByID('essai', u.id).then((res) => {
                 this.servicePouchdb.deleteRelationalDocDefinitivement(res.essais[0]).then((res) => {

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
        componentProps: { idProtocole: idProtocole },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async presentProjet(idProjet) {
      const modal = await this.modalController.create({
        component: ProjetPage,
        componentProps: { idProjet: idProjet },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async presentInstitution(idPartenaire) {
      const modal = await this.modalController.create({
        component: PartenairePage,
        componentProps: { idPartenaire: idPartenaire },
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
                this.servicePouchdb.findRelationalDocByID('essai', id).then((res) => {
                  res.essais[0].security = this.servicePouchdb.garderArchivedTrace(res.essais[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.essais[0]).catch((err) => {
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
                this.servicePouchdb.findRelationalDocByID('essai', id).then((res) => {
                  res.essais[0].security = this.servicePouchdb.garderDesarchivedTrace(res.essais[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.essais[0]).catch((err) => {
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
                  this.servicePouchdb.findRelationalDocByID('essai', id).then((res) => {
                    res.essais[0].security = this.servicePouchdb.garderDeleteTrace(res.essais[0].security);
                    this.servicePouchdb.updateRelationalDoc(res.essais[0]).catch((err) => {
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
                  
                  this.servicePouchdb.findRelationalDocByID('essai', id).then((res) => {
                    this.servicePouchdb.deleteRelationalDocDefinitivement(res.essais[0]).catch((err) => {
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
                
                this.servicePouchdb.findRelationalDocByID('essai', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.essais[0]).catch((err) => {
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
                
                this.servicePouchdb.findRelationalDocByID('essai', id).then((res) => {
                  res.essais[0].security = this.servicePouchdb.garderRestaureTrace(res.essais[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.essais[0]).catch((err) => {
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
        this.action = "infos";
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
        componentProps: {"action": this.action, "recherchePlus": this.recherchePlus, "filterAjouter": this.filterAjouter},
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
        //componentProps: {"id": "salu"},
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
        componentProps: {action: this.action},
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

      this.servicePouchdb.findRelationalDocInConflict('essai').then((res) => {
        if(res){
          let essaisData = [];
          let institutionIndex = [];
          let projetIndex = [];
          let protocoleIndex = [];
          let idInstitution, idProjet, idProtocole;
          for(let u of res.essais){
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
              if(isDefined(protocoleIndex[u.protocole])){
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


            essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, ...u.formData, ...u.formioData, ...u.security});
          }

          if(this.mobile){
            this.essaisData = essaisData;
            this.essaisData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.allEssaisData = [...this.allEssaisData]
          } else{
            $('#essai').ready(()=>{
              if(global.langue == 'en'){
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.attacheEventToDataTable(this.essaiHTMLTable.datatable);
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
        componentProps: {"action": this.action, "cacheAction": this.cacheAction},
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
        componentProps: { _id: essai.id, _rev: essai.rev, security: essai.security },
        mode: 'ios',
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
        this.servicePouchdb.findRelationalDocByID('essai', id).then((res) => {
          if(res && res.essais[0]){
            if(this.estModeCocherElemListe){
              this.estModeCocherElemListe = false;
              this.decocherTousElemListe();
            }
            this.presentDerniereModification(res.essais[0]);
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
          type: 'essai',
          partenaire: formData.idInstitution, //relation avec la fédération
          projet: formData.idProjet,
          protocole: formData.idProtocole,
          formData: formData,
          //pour le customisation
          formioData: this.formioFormsData,
          //pour garder les traces
          security: {
            created_by: null,
            created_at: null,
            updated_by: null,
            updated_at: null,
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

        //console.log(doc)

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let essaiData = {id: res.id,...essai.formData, ...essai.formioData, ...essai.security};
          //this.essais = essai;
          //essai._rev = res.essais[0].rev;
          //this.essais.push(essai);
          this.action = 'liste';
          //this.rechargerListeMobile = true;
          if(!this.mobile){
            //mode tableau, ajout d'un autre essai dans la liste
            this.dataTableAddRow(essaiData)
          }else{
            //mobile, cache la liste des essai pour mettre à jour la base de données
            this.essaisData.push(essaiData);
            this.essaisData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.essaisData = [...this.essaisData];

            this.allEssaisData.push(essaiData);
            this.allEssaisData.sort((a, b) => {
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
        this.unEssaiDoc.formData = formData;
        this.unEssaiDoc.formioData = this.formioFormsData;

        //this.unEssai = essaiData;
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

            this.essaisData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //mise à jour dans la liste cache
            for(let i = 0; i < this.allEssaisData.length; i++){
              if(this.allEssaisData[i].id == essaiData.id){
                this.allEssaisData[i] = essaiData;
                break;
              }
            }

            this.allEssaisData.sort((a, b) => {
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
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.essaiHTMLTable = createDataTable("essai", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.essaiHTMLTable.datatable);
          });
        }
      
    }
  
    doRefresh(event) {
      if(this.action != 'conflits'){
        if((this.idProtocole && this.idProtocole!= '') || (this.idProjet && this.idProjet != '') || (this.idPartenaire && this.idPartenaire != '')){
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
          
          if(this.idProtocole){
            typePere = 'protocole';
            idPere = this.idProtocole;
          }else if(this.idProjet){
            typePere = 'projet';
            idPere = this.idProjet;
          }else{
            typePere = 'partenaire';
            idPere = this.idPartenaire;
          }
          this.servicePouchdb.findRelationalDocOfTypeByPere('essai', typePere, idPere, deleted, archived, shared).then((res) => {
            if(res && res.essais){
              //this.essais = [...essais];
              let essaisData = [];
              //var datas = [];
              let institutionIndex = [];
              let projetIndex = [];
              let protocoleIndex = [];
              let idInstitution, idProjet, idProtocole;
              for(let u of res.essais){
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
                essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, ...u.formData, ...u.formioData, ...u.security});
              }
  
              //this.essaisData = [...datas];
    
              if(this.mobile){
                this.essaisData = essaisData;
                this.essaisData.sort((a, b) => {
                  if (a.nom < b.nom) {
                    return -1;
                  }
                  if (a.nom > b.nom) {
                    return 1;
                  }
                  return 0;
                });
  
                this.allEssaisData = [...this.essaisData];
              } else{
                $('#essai-relation').ready(()=>{
                  if(global.langue == 'en'){
                    this.essaiHTMLTable = createDataTable("essai-relation", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees);
                  }else{
                    this.essaiHTMLTable = createDataTable("essai-relation", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.essaiHTMLTable.datatable);
                });
              }
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
  
          this.servicePouchdb.findRelationalDocByType('essai', deleted, archived, shared).then((res) => {
            if(res && res.essais){
              let essaisData = [];
              //var datas = [];
              let institutionIndex = [];
              let projetIndex = [];
              let protocoleIndex = [];
              let idInstitution, idProjet, idProtocole;
              for(let u of res.essais){
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
                essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, ...u.formData, ...u.formioData, ...u.security});
              }
  
                //si mobile
            if(this.mobile){
              this.essaisData = essaisData;
              this.essaisData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              this.allEssaisData = [...this.essaisData]
            } else{
                $('#essai').ready(()=>{
                  if(global.langue == 'en'){
                    this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees);
                  }else{
                    this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.essaiHTMLTable.datatable);
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
  
    getEssai(){
      //tous les departements
      if(this.idEssai && this.idEssai != ''){
        this.servicePouchdb.findRelationalDocByID('essai', this.idEssai).then((res) => {
          if(res && res.essais[0]){
            let f, proj, proto;
            //this.unEssai = res && res.essais[0];


            if(res.partenaires && res.partenaires[0]){
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'numeroInstitution', res.partenaires[0].formData.numero, 2);
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'nomInstitution', res.partenaires[0].formData.nom, 3);  
              f = res.partenaires[0].id;
            }else{
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'numeroInstitution', null, 2);
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'nomInstitution', null, 3);
              f = null;
            }
            
            if(res.projets && res.projets[0]){
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'numeroProjet', res.projets[0].formData.numero, 4);
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'nomProjet', res.projets[0].formData.nom, 5); 
              proj = res.projets[0].id; 
            }else{
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'numeroProjet', null, 4);
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'nomProjet', null, 5);
              proj = null;
            }

            if(res.protocoles && res.protocoles[0]){
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'numeroProjet', res.protocoles[0].formData.numero, 6);
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'nomProjet', res.protocoles[0].formData.nom, 7); 
              proto = res.projets[0].id; 
            }else{
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'numeroProjet', null, 6);
              res.essais[0].formData = this.addItemToObjectAtSpecificPosition(res.essais[0].formData, 'nomProjet', null, 7);
              proto = null;
            }

            
            this.infos({id: res.partenaires[0].id, idInstitution: f, idProjet: proj, idProtocole: proto, ...res.essais[0].formData}); 
          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
            this.close();
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          console.log(err)
          this.close();
        });
      }else if((this.idProtocole && this.idProtocole != '') || (this.idProjet && this.idProjet != '') || this.idPartenaire && this.idPartenaire != ''){
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
        
        if(this.idProtocole){
          typePere = 'protocole';
          idPere = this.idProtocole;
        }else if(this.idProjet){
          typePere = 'projet';
          idPere = this.idProjet;
        }else{
          typePere = 'partenaire';
          idPere = this.idPartenaire;
        }
        this.servicePouchdb.findRelationalDocOfTypeByPere('essai', typePere, idPere, deleted, archived, shared).then((res) => {
          if(res && res.essais){
            //this.essais = [...essais];
            let essaisData = [];
            //var datas = [];
            let institutionIndex = [];
            let projetIndex = [];
            let protocoleIndex = [];
            let idInstitution, idProjet, idProtocole;
            for(let u of res.essais){
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
                      projetIndex[u.projet] = i;
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
              essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, ...u.formData, ...u.formioData, ...u.security});
            }

            //this.essaisData = [...datas]; 
  
            if(this.mobile){
              this.essaisData = essaisData;
              this.essaisData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allEssaisData = [...this.essaisData];
            } else{
              $('#essai-relation').ready(()=>{
                if(global.langue == 'en'){
                  this.essaiHTMLTable = createDataTable("essai-relation", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.essaiHTMLTable = createDataTable("essai-relation", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.essaiHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
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
        this.servicePouchdb.findRelationalDocByType('essai', deleted, archived, shared).then((res) => {
           //console.log(res)
          if(res && res.essais){
            //this.essais = [...essais];
            let essaisData = [];
            //var datas = [];
            let institutionIndex = [];
            let projetIndex = [];
            let protocoleIndex = [];
            let idInstitution, idProjet, idProtocole;
            for(let u of res.essais){
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
              essaisData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, idProtocole: idProtocole, ...u.formData, ...u.formioData, ...u.security});
            }


            //this.essaisData = [...datas];
  
            if(this.mobile){
              this.essaisData = essaisData;
              this.essaisData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allEssaisData = [...this.essaisData];
            } else{
              $('#essai').ready(()=>{
                if(global.langue == 'en'){
                  this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.essaiHTMLTable = createDataTable("essai", this.colonnes, essaisData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.essaiHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
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

    
    getProtocoleParProjet(idProjet){
      this.protocoleData = [];

      if(idProjet && idProjet != ''){
        this.servicePouchdb.findRelationalDocHasMany('protocole', 'projet', idProjet).then((res) => {
          if(res && res.protocoles){
            for(let u of res.protocoles){
              if(!u.security.deleted){
                this.protocoleData.push({id: u.id, nom: u.formData.nom});
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
        });
      }else {
        this.protocoleData = [];
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
        this.servicePouchdb.findRelationalDocHasMany('formulaire-protocole', 'protocole', idProtocole).then((res) => {
          if(res && res['formulaire-protocoles']){
            for(let f of res['formulaire-protocoles']){
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
            }*/
            
          }
        }).catch((err) => {
          this.formulaireData = [];
          this.nbEtapes = 2;
          console.log(err)
        });
      }else {
        this.formulaireData = [];
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
        this.getProjetParInstitution(idInstitution)
      }
    }

    setNumeroAndNomProjet(idProjet){
      if(idProjet && idProjet != ''){
        for(let u of this.projetData){
          if(idProjet == u.id){
            this.essaiForm.controls.numeroProjet.setValue(u.numero);
            this.essaiForm.controls.nomProjet.setValue(u.nom);
            
            this.essaiForm.controls.numeroProtocole.setValue(null);
            this.essaiForm.controls.nomProtocole.setValue(null);
            
            this.getProtocoleParProjet(idProjet);
            break;
          }
        }
      }else{
        this.essaiForm.controls.nomProjet.setValue(null);
        this.essaiForm.controls.numeroProjet.setValue(null);
        
        this.essaiForm.controls.nomProtocole.setValue(null);
        this.essaiForm.controls.numeroProtocole.setValue(null);
        
        this.getProtocoleParProjet(idProjet);
      }
    }

    
    setNumeroAndNomProtocole(idProtocole){
      if(idProtocole && idProtocole != ''){
        for(let u of this.protocoleData){
          if(idProtocole == u.id){
            this.essaiForm.controls.numeroProtocole.setValue(u.numero);
            this.essaiForm.controls.nomProtocole.setValue(u.nom);
            
            this.getFormulaireParProtocole(idProtocole)
            break;
          }
        }
      }else{
        this.essaiForm.controls.nomProtocole.setValue(null);
        this.essaiForm.controls.numeroProtocole.setValue(null);

        this.getFormulaireParProtocole(idProtocole)
      }

    }
  

    attacheEventToDataTable(datatable){
      var self = this;
      var id = 'essai-datatable';
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

