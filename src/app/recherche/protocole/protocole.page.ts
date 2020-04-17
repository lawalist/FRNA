import { Component, OnInit, Input  } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsProtocoleComponent } from '../../component/relations-protocole/relations-protocole.component';
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
import '@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-editor-classic/classiceditor.css';
import '@ckeditor/ckeditor5-build-decoupled-document/build/translations/fr';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import * as moment from 'moment';

//import '../../../assets/external/bootstrap-4.4.1/custom.css'
//import '../../../assets/external/bootstrap-4.4.1/styles.css'
import { FormulaireProtocolePage } from '../formulaire-protocole/formulaire-protocole.page';
//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
//declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-protocole',
  templateUrl: './protocole.page.html',
  styleUrls: ['./protocole.page.scss'],
})
export class ProtocolePage implements OnInit {
  @Input() idProtocole: string;
  @Input() idPartenaire: string;
  @Input() idProjet: string;

  protocoleForm: FormGroup;
  action: string = 'liste';
  cacheAction: string = 'liste';
  protocoles: any = [];
  protocolesData: any = [];
  allProtocolesData: any = [];
  institutionData: any = [];
  projetData: any = [];
  secteurs = ['Privé', 'Etat', 'Sémi-privé'];
  domaines = ['Agronamie', 'Santé', 'Environement', 'Gouvernement'];
  unProtocole: any;
  unProtocoleDoc: any;
  protocoleHTMLTable: any;
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
  rev = 0;
  colonnes = ['nom', 'numero', 'dateDebut', 'dateFin', 'updateData', 'nomInstitution', 'numeroInstitution', 'nomProjet', 'numeroProjet']

  messages_validation = {
    'numero': [
      { type: 'required', message: '' },
      { type: 'uniqueNumeroProtocole', message: '' }
    ],
    'nom': [
      { type: 'required', message: '' }
    ],
    'idInstitution': [
      { type: 'required', message: '' }
    ],
    'idProjet': [
      { type: 'required', message: '' }
    ],
    'dateDebut': [
      { type: 'required', message: '' },
      { type: 'dateDebutInvalide', message: '' }
    ],  
    'dateFin': [
      { type: 'required', message: '' },
      { type: 'dateFinInvalide', message: '' }
    ] 
  }

  public Editor = DecoupledEditor;
  public editor = null;
  public config = {
    language: global.langue,
    placeholder: ''
  };

  public editorData = '';
  annee;
  projetDateDebut = null
  projetDateFin = null;
  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la protocole est en mode modal, on chercher info region
      this.translateLangue();
      this.getProtocole();
    }
  
    
    public onReady( editor ) {
      editor.ui.getEditableElement().parentElement.insertBefore(
          editor.ui.view.toolbar.element,
          editor.ui.getEditableElement()
      );
    }

    public onReadyInfo( editor ) {
      this.editor = editor;
      editor.ui.getEditableElement().parentElement.insertBefore(
          editor.ui.view.toolbar.element,
          editor.ui.getEditableElement()
      );

      $( ".ck.ck-toolbar" ).css( "display", "none" );
    }


    public onChange( { editor }: ChangeEvent ) {
      //const data = editor.getData();
      this.protocoleForm.controls.description.setValue(editor.getData())

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
        this.actualiserTableau(this.protocolesData);
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
      if(this.protocoleForm.get(filedName).errors && (this.protocoleForm.get(filedName).dirty || this.protocoleForm.get(filedName).touched)){
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
      if(this.protocoleForm.get(filedName).errors){
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
          self.annee = e.date.getFullYear();
          //console.log(new Date(new Date().getFullYear(), 0, 1))
          self.protocoleForm.controls.idProjet.setValue(null);
          self.protocoleForm.controls.numeroProjet.setValue(null);
          self.protocoleForm.controls.nomProjet.setValue(null);
          self.projetDateDebut = null;
          self.projetDateFin = null;
          //console.log(numeroInstitution)
          self.getProjetParInstitution(self.protocoleForm.controls.idInstitution.value);
          //$('#'+id+' input').datepicker('hide')
        });
      });
    }

    iniDateDabutDatePicker(id){
      var self = this;
      //let min = moment(this.projetDateDebut, 'DD-MM-YYYY');
        
      $(function () {
        
        $('#'+id+' input').datepicker({
          //minViewMode: 2,
          //viewMode: 'years',
          autoclose: true,
          //startDate: min.format('DD-MM-YYYY'),
          todayHighlight: true,
          format: 'dd-mm-yyyy',
          language: global.langue
        }).on('changeDate', function(e) {
          // `e` here contains the extra attributes
          //let min = new Date(e.date.toDateString());
          //min.setDate(min.getDate() + 1); //le jour suivant
          let newDate = moment(e.date)//.format('DD-MM-YYYY');
          let min = moment(newDate).add(1, 'days');//le jour suivant
          self.protocoleForm.controls.dateDebut.setValue(newDate.format('DD-MM-YYYY'));
          self.protocoleForm.controls.dateFin.setValue(null);
          $('#dateFin input').datepicker({'setDate': null})
          $('#dateFin input').datepicker('setStartDate', min.format('DD-MM-YYYY'));
          //$('#dateFin input').datepicker('setDate', '');
          //$('#'+id+' input').datepicker('hide')
        });
      });
    }


    iniDateFinDatePicker(id){
      var self = this;
      let min;
      if(this.unProtocole && this.unProtocole.dateDebut && this.unProtocole.dateDebut != ''){
        min = moment(this.unProtocole.dateDebut, 'DD-MM-YYYY');
        min = moment(min).add(1, 'days');
      }else{
        min = moment();
        min = moment(min).add(1, 'days');
      }

      $(function () {
        $('#'+id+' input').datepicker({
          //minViewMode: 2,
          //viewMode: 'years',
          autoclose: true,
          todayHighlight: true,
          startDate: min.format('DD-MM-YYYY'),
          format: 'dd-mm-yyyy',
          language: global.langue
        }).on('changeDate', function(e) {
          let newDate = moment(e.date)
          self.protocoleForm.controls.dateFin.setValue(newDate.format('DD-MM-YYYY'));
          /*console.log(e.date+ " ==>" + e.date.toDateString('d-M-yyyy')+ "--> "+Date.parse(e.date).toString())
          //self.annee = e.date.getFullYear();
          //new Date().toLocaleDateString()
          //console.log(new Date(new Date().getFullYear(), 0, 1))
          if((new Date(e.date.toDateString())) > (new Date(self.protocoleForm.controls.dateDebut.value))){
            self.protocoleForm.controls.dateFin.setValue(e.date.toDateString());
          }else{
            alert('Erreur la date de fin doit etre plus grande que la date de debut');
            $('#'+id+' input').value = '';
            self.protocoleForm.controls.dateFin.setValue(null);
          }*/
          
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
          self.protocoleForm.controls[id].setValue(e.params.data.id)
          if(id == 'idInstitution'){
            self.setNumeroAndNomInstitution(self.protocoleForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idProjet'){
            self.setNumeroAndNomProjet(self.protocoleForm.value[id]);
            self.setSelectRequredError(id, id)
          }          
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.protocoleForm.controls[id].setValue(null); 
          if(id == 'idInstitution'){
            self.protocoleForm.controls.idInstitution.setValue(null);
            self.protocoleForm.controls.numeroInstitution.setValue(null);
            self.protocoleForm.controls.nomInstitution.setValue(null);

            self.protocoleForm.controls.idProjet.setValue(null);
            self.protocoleForm.controls.numeroProjet.setValue(null);
            self.protocoleForm.controls.nomProjet.setValue(null);
            self.projetDateDebut = null;
            self.projetDateFin = null;
            //self.setSelect2DefaultValue('numeroProjet', null);
            self.projetData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'idProjet'){
            self.protocoleForm.controls.idProjet.setValue(null);
            self.protocoleForm.controls.numeroProjet.setValue(null);
            self.protocoleForm.controls.nomProjet.setValue(null);
            self.projetDateDebut = null;
            self.projetDateFin = null;
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
      //this.protocoleForm = null;
      this.protocoleForm = this.formBuilder.group({
        nom: [null, Validators.required],
        numero: [null, Validators.required],
        dateDebut : [null, Validators.required],
        dateFin : [null, Validators.required],
        updateData : [null],
        nomInstitution: [null, Validators.required],
        numeroInstitution: [null, Validators.required],
        idInstitution: [null, Validators.required],
        nomProjet: [null, Validators.required],
        numeroProjet: [null, Validators.required],
        idProjet: [null, Validators.required],
        dateCreation: [null],  
        description: [null], 
      });

      this.validerNumero();
    }
  
    editForm(oDoc){
      let protocole = oDoc.protocoles[0];
      let idInstitution;
      let numeroInstitution;
      let nomInstitution;
      let idProjet;
      let numeroProjet;
      let nomProjet;
      
      if(oDoc.partenaires && oDoc.partenaires[0]){
        idInstitution = oDoc.partenaires[0].id;
        numeroInstitution = oDoc.partenaires[0].formData.numero;
        nomInstitution = oDoc.partenaires[0].formData.nom;
      }

      if(oDoc.projets[0]){
        idProjet = oDoc.projets[0].id;
        numeroProjet = oDoc.projets[0].formData.numero;
        nomProjet = oDoc.projets[0].formData.nom;
        if(oDoc.projets[0].formData.dateDebut && oDoc.projets[0].formData.dateDebut != ''){
          this.projetDateDebut = new Date(oDoc.projets[0].formData.dateDebut);
        }
        
        if(oDoc.projets[0].formData.dateFin && oDoc.projets[0].formData.dateFin != ''){
          this.projetDateFin = new Date(oDoc.projets[0].formData.dateFin);
        }
        
      }

     
      //this.protocoleForm = null;
      let u = protocole.formData
      /*if(u.description){
        this.editorData = u.description;
      }else{
        this.editorData = '';
      }*/
      this.protocoleForm = this.formBuilder.group({
        nom: [u.nom, Validators.required],
        numero: [u.numero, Validators.required],
        dateDebut : [u.dateDebut, Validators.required],
        dateFin : [u.dateFin, Validators.required],
        updateData : [u.updateData],
        nomInstitution: [nomInstitution],
        numeroInstitution: [numeroInstitution],
        idInstitution: [idInstitution],
        nomProjet: [nomProjet], 
        numeroProjet: [numeroProjet],
        idProjet: [idProjet],
        dateCreation: [u.dateCreation],
        description: [u.description],
      });

      this.validerNumero();

    }

    validerNumero(){
      let numeroControl = this.protocoleForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndNumero('protocole', value).then((res) => {
          if(res && res.protocoles && res.protocoles[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.unProtocole.numero))){
            numeroControl.setErrors({uniqueNumeroProtocole: true});
          }
        });
      });
      
      //controle date debut et date fin
      let dateDebutControl = this.protocoleForm.controls['dateDebut'];
      let dateFinControl = this.protocoleForm.controls['dateFin'];

      //dateDebut doit etre > dateFin
      dateDebutControl.valueChanges.subscribe((value) => {
        if(!value || value == ''){
          dateDebutControl.setErrors({required: true});
          this.setInputRequredError('dateDebut', 'dateDebut');
        } else if(((new Date(value)) < (new Date(this.projetDateDebut))) || ((new Date(value)) > (new Date(this.projetDateFin)))){
          //la date de debut du protocole doit etre dans [dateDebutProjet, dateFinProjet]
          dateDebutControl.setErrors({dateDebutInvalide: true});
          this.setInputRequredError('dateDebut', 'dateDebut');
          //dateFinControl.enable();
        }else{
          this.setInputRequredError('dateDebut', 'dateDebut');
          //dateFinControl.enable();
        }
      });

      dateFinControl.valueChanges.subscribe((value) => {
        if(!value || value == ''){
          dateFinControl.setErrors({required: true});
          this.setInputRequredError('dateFin', 'dateFin');
        }else if(((new Date(value)) > (new Date(this.projetDateFin)))){
          //la date de fin du protocole ne doi pa etre supperieur a la date de fin du projet
          dateFinControl.setErrors({dateFinInvalide: true});
          this.setInputRequredError('dateFin', 'dateFin')
          //dateDebutControl.enable();
        }else{
          this.setInputRequredError('dateFin', 'dateFin');
          //dateDebutControl.enable();
        }
      });
    }
  
    ajouter(){
      this.doModification = false;
      this.projetDateDebut = null;
      this.projetDateFin = null;
      this.unProtocole = null;
      this.annee = (new Date).getFullYear();
      if(this.idProjet && this.idProjet != ''){
        if(this.protocoleHTMLTable && this.protocoleHTMLTable.datatable && this.protocoleHTMLTable.datatable.row(0) && this.protocoleHTMLTable.datatable.row(0).data()){
          this.idPartenaire = this.protocoleHTMLTable.datatable.row(0).data().numeroInstitution;
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
      this.iniDateDabutDatePicker('dateDebut');
      this.iniDateFinDatePicker('dateFin');
      this.initSelect2('idInstitution', this.translate.instant('PROJET_PAGE.SELECTIONINSTITUTION'));
      this.initSelect2('idProjet', this.translate.instant('PROTOCOLE_PAGE.SELECTIONPROJET'));
      //this.initSelect2('domaine', this.translate.instant('PROTOCOLE_PAGE.DOMAINE'));
      
      this.action = 'ajouter';
    }
  
    infos(u){
      if(!this.estModeCocherElemListe){
        this.unProtocole = u;

        this.unProtocoleDoc = null;

        let id;
        if(isObject(u)){
          id = u.id;
        }else{
          id = u;
        }

        this.action = 'infos';
        this.servicePouchdb.findRelationalDocByID('protocole', id).then((res) => {
          if(res && res.protocoles[0]){
            this.unProtocoleDoc = res;
            this.rev = res.protocoles[0].rev.substring(0, res.protocoles[0].rev.indexOf('-'));

          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
        })

        
      }
    }

  
    modifier(protocole){
      //console.log(protocole)
      let id;
      if(isObject(protocole)){
        id = protocole.id;
      }else{
        id = protocole;
      }

      this.doModification = true;
      this.projetDateDebut = null;
      this.projetDateFin = null;
      if(this.action == 'infos' && this.unProtocoleDoc){
        this.editForm(this.clone(this.unProtocoleDoc));
        this.unProtocoleDoc = this.unProtocoleDoc.protocoles[0];  
        
        this.getInstitution();

        //this.editForm(res);
        this.iniAnneDatePicker('annee');
        this.iniDateDabutDatePicker('dateDebut');
        this.iniDateFinDatePicker('dateFin');
        this.initSelect2('idInstitution', this.translate.instant('PROJET_PAGE.SELECTIONINSTITUTION'));
        this.initSelect2('idProjet', this.translate.instant('PROTOCOLE_PAGE.SELECTIONPROJET'));
        //this.initSelect2('domaine', this.translate.instant('PROTOCOLE_PAGE.DOMAINE'));
        /*$('#numero input').ready(()=>{
          $('#numero input').attr('disabled', true)
        });*/


        //this.setSelect2DefaultValue('numeroProjet', oDoc.formData.numeroProjet)
        //this.setSelect2DefaultValue('domaine', oDoc.formData.domaine)
        
        
       
        if(!isObject(protocole)){
          for(let u of this.protocolesData){
            if(u.id == id){
              this.unProtocole = u;
              break;
            }
          }
        }else{
          this.unProtocole = protocole;
        }

        this.action ='modifier';
      }else{
        this.unProtocoleDoc = null;
        this.servicePouchdb.findRelationalDocByID('protocole', id).then((res) => {
          if(res && res.protocoles[0]){
            let oDoc = res.protocoles[0];
            this.unProtocoleDoc = oDoc;
            this.getInstitution();
  
            this.editForm(res);
            this.iniAnneDatePicker('annee');
            this.iniDateDabutDatePicker('dateDebut');
            this.iniDateFinDatePicker('dateFin');
            this.initSelect2('idInstitution', this.translate.instant('PROJET_PAGE.SELECTIONINSTITUTION'));
            this.initSelect2('idProjet', this.translate.instant('PROTOCOLE_PAGE.SELECTIONPROJET'));
            //this.initSelect2('domaine', this.translate.instant('PROTOCOLE_PAGE.DOMAINE'));
            /*$('#numero input').ready(()=>{
              $('#numero input').attr('disabled', true)
            });*/
  
  
            //this.setSelect2DefaultValue('numeroProjet', oDoc.formData.numeroProjet)
            //this.setSelect2DefaultValue('domaine', oDoc.formData.domaine)
            
            
           
            if(!isObject(protocole)){
              for(let u of this.protocolesData){
                if(u.id == id){
                  this.unProtocole = u;
                  break;
                }
              }
            }else{
              this.unProtocole = protocole;
            }
  
            this.action ='modifier';
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
        })
      }
      
      
      
    }
  
    exportPDF(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('protocole-datatable').innerHTML], {
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

                this.servicePouchdb.findRelationalDocByID('protocole', u.id).then((res) => {
                  res.protocoles[0].security = this.servicePouchdb.garderDeleteTrace(res.protocoles[0].security);

                  this.servicePouchdb.updateRelationalDoc(res.protocoles[0]).then((res) => {
                    //mise à jour de la liste si mobile et mode liste
                    if(this.protocolesData.indexOf(u) !== -1){
                      this.protocolesData.splice(this.protocolesData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant')
                    }

                    this.action = 'liste';

                    if(!this.mobile){
                      //sinion dans le tableau
                      this.dataTableRemoveRows();
                    }else{
                      this.protocolesData = [...this.protocolesData];
                      if(this.allProtocolesData.indexOf(u) !== -1){
                        this.allProtocolesData.splice(this.allProtocolesData.indexOf(u), 1);
                      }else{
                        console.log('echec splice, index inexistant dans allProtocolesData')
                      }
                    }
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }else{

                this.servicePouchdb.findRelationalDocByID('protocole', u.id).then((res) => {
                 this.servicePouchdb.deleteRelationalDocDefinitivement(res.protocoles[0]).then((res) => {

                  //mise à jour de la liste si mobile et mode liste
                  if(this.protocolesData.indexOf(u) !== -1){
                    this.protocolesData.splice(this.protocolesData.indexOf(u), 1);
                  }else{
                    console.log('echec splice, index inexistant')
                  }

                  this.action = 'liste';
                  if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                    //sinion dans le tableau
                    this.dataTableRemoveRows();
                  }else{
                    this.protocolesData = [...this.protocolesData];
                    if(this.allProtocolesData.indexOf(u) !== -1){
                      this.allProtocolesData.splice(this.allProtocolesData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant dans allProtocolesData')
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
                //var u = this.protocolesData[i];
                this.servicePouchdb.findRelationalDocByID('protocole', id).then((res) => {
                  res.protocoles[0].security = this.servicePouchdb.garderArchivedTrace(res.protocoles[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.protocoles[0]).catch((err) => {
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
                this.protocolesData = [...this.removeMultipleElem(this.protocolesData, ids)];
                this.allProtocolesData = this.removeMultipleElem(this.allProtocolesData, ids);
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
                this.servicePouchdb.findRelationalDocByID('protocole', id).then((res) => {
                  res.protocoles[0].security = this.servicePouchdb.garderDesarchivedTrace(res.protocoles[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.protocoles[0]).catch((err) => {
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
                this.protocolesData = [...this.removeMultipleElem(this.protocolesData, ids)]; 
                this.allProtocolesData = this.removeMultipleElem(this.allProtocolesData, ids);
                
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
      this.protocolesData.forEach((u) => {
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
            "dataLength": this.protocolesData.length,
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
          this.getProtocolesByType('liste');
        }  else  if(dataReturned !== null && dataReturned.data == 'archives') {
          this.estModeCocherElemListe = false;
          this.getProtocolesByType('archives');
        }  else  if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.estModeCocherElemListe = false;
          this.getProtocolesByType('corbeille');
        }  else  if(dataReturned !== null && dataReturned.data == 'partages') {
          this.estModeCocherElemListe = false;
          this.getProtocolesByType('partages');
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
       let data = [...this.protocolesData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_PROTOCOLEs_'+date+'.xls', blob).then(()=> {
           alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
       }).catch(()=>{
           alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
       });
     }
   
     exportCSV(){
       let data = [...this.protocolesData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_PROTOCOLEs_'+date+'.csv', blob).then(()=> {
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
          //"dataLength": this.protocolesData.length,
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
            this.selectedIndexes.push(this.unProtocole.id);
          }
          this.modifier(this.selectedIndexes[0]);
          this.decocherTousElemListe();
          this.estModeCocherElemListe = false;
          //this.changerModeCocherElemListe();
        }else  if(dataReturned !== null && dataReturned.data == 'desarchiver') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unProtocole.id);
          }
          

          this.desarchivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else  if(dataReturned !== null && dataReturned.data == 'archiver') {
          if(this.action == 'infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unProtocole.id);
          }
          

          this.archivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        } else  if(dataReturned !== null && dataReturned.data == 'restaurer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unProtocole.id);
          }
          

          this.restaurationMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else if(dataReturned !== null && dataReturned.data == 'derniereModification') {
          this.selectedItemDerniereModification();          
        }else if(dataReturned !== null && dataReturned.data == 'partager') {
          //this.changeStyle();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unProtocole.id);
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
      if(this.protocolesData.length != this.selectedIndexes.length) {
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
                  this.servicePouchdb.findRelationalDocByID('protocole', id).then((res) => {
                    res.protocoles[0].security = this.servicePouchdb.garderDeleteTrace(res.protocoles[0].security);
                    this.servicePouchdb.updateRelationalDoc(res.protocoles[0]).catch((err) => {
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
                  this.protocolesData = [...this.removeMultipleElem(this.protocolesData, ids)];
                  this.allProtocolesData = this.removeMultipleElem(this.allProtocolesData, ids);
                  
                  //if(this.action != 'infos'){
                    this.estModeCocherElemListe = false;
                    this.decocherTousElemListe();
                  //}
                  //this.action = this.cacheAction;
                }
              }else{

                //suppresion multiple définitive
                for(let id of ids){
                  
                  this.servicePouchdb.findRelationalDocByID('protocole', id).then((res) => {
                    this.servicePouchdb.deleteRelationalDocDefinitivement(res.protocoles[0]).catch((err) => {
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
                  this.protocolesData = [...this.removeMultipleElem(this.protocolesData, ids)];
                  this.allProtocolesData = [...this.removeMultipleElem(this.allProtocolesData, ids)];

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
                
                this.servicePouchdb.findRelationalDocByID('protocole', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.protocoles[0]).catch((err) => {
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
                this.protocolesData = [...this.removeMultipleElem(this.protocolesData, ids)];
                this.allProtocolesData = this.removeMultipleElem(this.allProtocolesData, ids);
                
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
                
                this.servicePouchdb.findRelationalDocByID('protocole', id).then((res) => {
                  res.protocoles[0].security = this.servicePouchdb.garderRestaureTrace(res.protocoles[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.protocoles[0]).catch((err) => {
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
                this.protocolesData = [...this.removeMultipleElem(this.protocolesData, ids)];
                this.allProtocolesData = [...this.removeMultipleElem(this.allProtocolesData, ids)];
                
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
        codes.push(this.unProtocole.id);
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
        //this.actualiserTableau(this.protocolesData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        this.infos(this.unProtocole)
        //this.action = "infos";
      }else{
        //this.action = 'liste';
        this.action = this.cacheAction; 
        //recharger la liste
        if(this.rechargerListeMobile){
          this.protocolesData = [...this.protocolesData];
          this.rechargerListeMobile = false;
        }
        ///this.actualiserTableau(this.protocolesData);
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
              this.infos(this.protocolesData[this.selectedIndexes[0]]);
              //this.selectedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRPROTOCOLE'));
            }
          }
        }, {
          text: this.translate.instant('GENERAL.MODIFIER'),
          icon: 'create',
          handler: () => {
            if(this.selectedIndexes.length == 1){
              this.modifier(this.protocolesData[this.selectedIndexes[0]]);
              //this.selectedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRPROTOCOLE'))
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
            this.infos(this.protocolesData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRPROTOCOLE'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.protocolesData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRPROTOCOLE'))
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
          this.getProtocolesByType('corbeille');
        } else if(dataReturned !== null && dataReturned.data == 'archives') {
          this.getProtocolesByType('archives');
        } else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getProtocolesByType('partages');
        } else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          //this.getProtocolesByType('conflits');
        } else if(dataReturned !== null && dataReturned.data == 'liste') {
          this.getProtocolesByType('liste');
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
          this.getProtocolesByType('liste');
        }else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getProtocolesByType('partages');
        }else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          this.cacheAction = 'conflits';
          this.getProtocoleWithConflicts();
          //this.getProtocole();
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

    getProtocoleWithConflicts(event = null){
      this.action = 'conflits';
      this.cacheAction = 'conflits';
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;

      this.servicePouchdb.findRelationalDocInConflict('protocole').then((res) => {
        if(res){
          let protocolesData = [];
          let institutionIndex = [];
          let projetIndex = [];
          let idInstitution, idProjet;
          for(let u of res.protocoles){
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


            protocolesData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, ...u.formData, ...u.formioData, ...u.security});
          }

          if(this.mobile){
            this.protocolesData = protocolesData;
            this.protocolesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.allProtocolesData = [...this.allProtocolesData]
          } else{
            $('#protocole').ready(()=>{
              if(global.langue == 'en'){
                this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, protocolesData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, protocolesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.attacheEventToDataTable(this.protocoleHTMLTable.datatable);
            });
          }
        }
        if(event)
          event.target.complete();
      }).catch((err) => {
        this.protocoles = [];
        this.protocolesData = [];
        this.allProtocolesData = [];
        this.selectedIndexes = [];
        console.log(err)
        if(event)
          event.target.complete();
      });
    }

    getProtocolesByType(type){
      this.action = type;
      this.cacheAction = type;
      this.getProtocole();
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
    
    async presentDerniereModification(protocole) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { _id: protocole.id, _rev: protocole.rev, security: protocole.security },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      let id
      if(this.action == 'infos'){
        id = this.unProtocole.id;
      }else{
        id = this.selectedIndexes[0];
      }


      if(id && id != ''){
        this.servicePouchdb.findRelationalDocByID('protocole', id).then((res) => {
          if(res && res.protocoles[0]){
            if(this.estModeCocherElemListe){
              this.estModeCocherElemListe = false;
              this.decocherTousElemListe();
            }
            this.presentDerniereModification(res.protocoles[0]);
          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          }
        });
        //this.selectedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRPROTOCOLE'));
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
      var i = this.protocoleHTMLTable.datatable.row('.selected').index();

      if(this.protocoleHTMLTable.datatable.row(i).next()){
        this.next = true;
      }else{
        this.next = false;
      }

      if(this.protocoleHTMLTable.datatable.row(i).prev()){
        this.prev = true;
      }else{
        this.prev = false;
      }
    }

    datatableNextRow(){
      //datatable.row(this.selectedIndexes).next().data();
      var i = this.protocoleHTMLTable.datatable.row('.selected').index();
      if(this.protocoleHTMLTable.datatable.row(i).next()){
        //this.protocoleHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.protocoleHTMLTable.datatable.rows().deselect();
        this.protocoleHTMLTable.datatable.row(i).next().select();
        this.selectedItemInfo();
        
        if(this.protocoleHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }else{
        this.next = false;

        if(this.protocoleHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }
    }

    datatablePrevRow(){
      //datatable.row(this.selectedIndexes).prev().data();
      var i = this.protocoleHTMLTable.datatable.row('.selected').index();
      if(this.protocoleHTMLTable.datatable.row(i).prev()){
        //this.protocoleHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.protocoleHTMLTable.datatable.rows().deselect();
        this.protocoleHTMLTable.datatable.row(i).prev().select();
        this.selectedItemInfo();
        
        if(this.protocoleHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }else{
        this.prev = false;

        if(this.protocoleHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }
    }

    datatableDeselectMultipleSelectedItemForModification(){
      if(this.selectedIndexes.length > 1){
        var i = this.protocoleHTMLTable.datatable.row('.selected').index();
        this.protocoleHTMLTable.datatable.rows().deselect();
        this.protocoleHTMLTable.datatable.row(i).select();
      }
    }

    selectedItemInfo(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.protocoleHTMLTable.datatable.row('.selected').index();
      let data  = this.protocoleHTMLTable.datatable.row(row).data();

      this.infos(data);

      //mise à jour du ckeditor
      if(this.editor && this.editor.data){
        this.editor.data.set(data.description)
      }

      this.initDatatableNextPrevRow();
        //this.selectedIndexes = [];
      //}else{
      //  alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRPROTOCOLE'));
      //}
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.protocoleHTMLTable.datatable.row('.selected').index();
      let data  = this.protocoleHTMLTable.datatable.row(row).data();

      this.modifier(data);

        //this.selectedIndexes = [];
      //}else{
       // alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRPROTOCOLE'))
      //}
    }
  
  
    async openRelationProtocole(ev: any/*, numeroProtocole*/) {
      const popover = await this.popoverController.create({
        component: RelationsProtocoleComponent,
        event: ev,
        translucent: true,
        componentProps: {"idProtocole": this.unProtocole.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'Formulaire') {
          this.presentFormulaire(this.unProtocole.id)
        }/*else if(dataReturned !== null && dataReturned.data == 'protocole') {
          
        }else if(dataReturned !== null && dataReturned.data == 'protocole') {
          
        } else if(dataReturned !== null && dataReturned.data == 'protocole') {
          
        } */
  
      });
      return await popover.present();
    }

    async presentFormulaire(idProtocole) {
      const modal = await this.modalController.create({
        component: FormulaireProtocolePage,
        componentProps: { idProtocole: idProtocole },
        //backdropDismiss: false,
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async openRelationProtocoleDepuisListe(ev: any) {
      const popover = await this.popoverController.create({
        component: RelationsProtocoleComponent,
        event: ev,
        translucent: true,
        componentProps: {"idProtocole": this.selectedIndexes[0]},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'Formulaire') {
          this.presentFormulaire(this.selectedIndexes[0])
        } /*else if(dataReturned !== null && dataReturned.data == 'protocole') {
          this.presentProtocole(this.departementsData[this.selectedIndexes[0]].codeDepartement) 
        }*/
  
      });
      return await popover.present();
    }
  

    async openRelationProtocoleDepuisTableau(ev: any) {
      let row  = this.protocoleHTMLTable.datatable.row('.selected').index();
      let data  = this.protocoleHTMLTable.datatable.row(row).data();
      const popover = await this.popoverController.create({
        component: RelationsProtocoleComponent,
        event: ev,
        translucent: true,
        componentProps: {"idProtocole": data.id},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'Formulaire') {
          this.presentFormulaire(data.id)
        }/* else if(dataReturned !== null && dataReturned.data == 'protocole') {
          this.presentProtocole(this.departementsData[this.selectedIndexes[0]].codeDepartement) 
        }*/
  
      });
      return await popover.present();
    }
  
    onSubmit(){
      let formData = this.protocoleForm.value;
      let formioData = {};
      if(this.action === 'ajouter'){
        //créer un nouveau protocole
      
        let protocole: any = {
          //_id: 'fuma:protocole:'+data.numero,
          //id: formData.numero,
          type: 'protocole',
          projet: formData.idProjet,
          partenaire: formData.idInstitution, //relation avec la fédération
          formData: formData,
          //pour le customisation
          formioData: formioData,
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

        protocole.security = this.servicePouchdb.garderCreationTrace(protocole.security);

        //ne pas sauvegarder les information relative à la fédération dans l'objet protocole
        //relation-pour va faire le mapping à travers la propriété projet se trouvant dans l'objet protocole
        let doc = this.clone(protocole);
        delete doc.formData.idProjet;
        delete doc.formData.numeroProjet;
        delete doc.formData.nomProjet;
        delete doc.formData.idInstitution;
        delete doc.formData.numeroInstitution;
        delete doc.formData.nomInstitution;

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let protocoleData = {id: res.id,...protocole.formData, ...protocole.formioData, ...protocole.security};
          //this.protocoles = protocole;
          //protocole._rev = res.protocoles[0].rev;
          //this.protocoles.push(protocole);
          this.action = 'liste';
          //this.rechargerListeMobile = true;
          if(!this.mobile){
            //mode tableau, ajout d'un autre protocole dans la liste
            this.dataTableAddRow(protocoleData)
          }else{
            //mobile, cache la liste des protocole pour mettre à jour la base de données
            this.protocolesData.push(protocoleData);
            this.protocolesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.protocolesData = [...this.protocolesData];

            this.allProtocolesData.push(protocoleData);
            this.allProtocolesData.sort((a, b) => {
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

          //initialiser la liste des protocoles
          //this.creerProtocole(protocoleData.numeroProtocole);
          
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
  
      }else{
        //si modification
        this.unProtocoleDoc.projet = formData.idProjet;
        this.unProtocoleDoc.partenaire = formData.idInstitution;
        this.unProtocoleDoc.formData = formData;
        this.unProtocoleDoc.formioData = formioData;

        //this.unProtocole = protocoleData;
        this.unProtocoleDoc.security = this.servicePouchdb.garderUpdateTrace(this.unProtocoleDoc.security);

        let doc = this.clone(this.unProtocoleDoc);
        delete doc.formData.idProjet;
        delete doc.formData.numeroProjet;
        delete doc.formData.nomProjet;
        delete doc.formData.idInstitution;
        delete doc.formData.numeroInstitution;
        delete doc.formData.nomInstitution;

        this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
          //this.protocoles._rev = res.rev;
          //this.unProtocoleDoc._rev = res.rev;
          let protocoleData = {id: this.unProtocoleDoc.id, ...this.unProtocoleDoc.formData, ...this.unProtocoleDoc.formioData, ...this.unProtocoleDoc.security};

          //this.action = 'infos';
          this.infos(protocoleData);

          if(this.mobile){
            //mode liste
            //cache la liste pour le changement dans virtual Scroll
            //this.protocolesData = [...this.protocolesData];
            //mise à jour dans la liste
            for(let i = 0; i < this.protocolesData.length; i++){
              if(this.protocolesData[i].id == protocoleData.id){
                this.protocolesData[i] = protocoleData;
                break;
              }
            }

            this.protocolesData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //mise à jour dans la liste cache
            for(let i = 0; i < this.allProtocolesData.length; i++){
              if(this.allProtocolesData[i].id == protocoleData.id){
                this.allProtocolesData[i] = protocoleData;
                break;
              }
            }

            this.allProtocolesData.sort((a, b) => {
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
            this.dataTableUpdateRow(protocoleData);
          }

          this.unProtocoleDoc = null;

        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
      }
    }
  
  
    actualiserTableau(data){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#protocole').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.protocoleHTMLTable.datatable);
          });
        }
      
    }
  
    doRefresh(event) {
      if(this.action != 'conflits'){
        if((this.idProjet && this.idProjet != '') || (this.idPartenaire && this.idPartenaire != '')){
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
          
          if(this.idProjet){
            typePere = 'projet';
            idPere = this.idProjet;
          }else{
            typePere = 'partenaire';
            idPere = this.idPartenaire;
          }
          this.servicePouchdb.findRelationalDocOfTypeByPere('protocole', typePere, idPere, deleted, archived, shared).then((res) => {
            if(res && res.protocoles){
              //this.protocoles = [...protocoles];
              let protocolesData = [];
              //var datas = [];
              let institutionIndex = [];
              let projetIndex = [];
              let idInstitution, idProjet;
              for(let u of res.protocoles){
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

                protocolesData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, ...u.formData, ...u.formioData, ...u.security});
              }
  
              //this.protocolesData = [...datas];
    
              if(this.mobile){
                this.protocolesData = protocolesData;
                this.protocolesData.sort((a, b) => {
                  if (a.nom < b.nom) {
                    return -1;
                  }
                  if (a.nom > b.nom) {
                    return 1;
                  }
                  return 0;
                });
  
                this.allProtocolesData = [...this.protocolesData];
              } else{
                $('#protocole-relation').ready(()=>{
                  if(global.langue == 'en'){
                    this.protocoleHTMLTable = createDataTable("protocole-relation", this.colonnes, protocolesData, null, this.translate, global.peutExporterDonnees);
                  }else{
                    this.protocoleHTMLTable = createDataTable("protocole-relation", this.colonnes, protocolesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.protocoleHTMLTable.datatable);
                });
              }
              if(event)
              event.target.complete();
            }else{
              this.protocoles = [];
              //if(this.mobile){
              this.protocolesData = [];
              this.allProtocolesData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            this.protocoles = [];
            this.protocolesData = [];
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
  
          this.servicePouchdb.findRelationalDocByType('protocole', deleted, archived, shared).then((res) => {
            if(res && res.protocoles){
              let protocolesData = [];
                //var datas = [];
              let projetIndex = [];
              let institutionIndex = [];
              let idInstitution, idProjet;
              for(let u of res.protocoles){
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


                protocolesData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet,  ...u.formData, ...u.formioData, ...u.security});
              }
  
                //si mobile
            if(this.mobile){
              this.protocolesData = protocolesData;
              this.protocolesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              this.allProtocolesData = [...this.protocolesData]
            } else{
                $('#protocole').ready(()=>{
                  if(global.langue == 'en'){
                    this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, protocolesData, null, this.translate, global.peutExporterDonnees);
                  }else{
                    this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, protocolesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.protocoleHTMLTable.datatable);
                });
              }
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }else{
              this.protocoles = [];
              //if(this.mobile){
                this.protocolesData = [];
                this.allProtocolesData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            console.log('Erreur acces à la protocole ==> '+err)
            this.protocoles = [];
            //if(this.mobile){
              this.protocolesData = [];
              this.allProtocolesData = [];
            //}
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          });  
        }
      }else{
        this.getProtocoleWithConflicts(event);
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
  
    getProtocole(){
      //tous les departements
      if(this.idProtocole && this.idProtocole != ''){
        this.servicePouchdb.findRelationalDocByID('protocole', this.idProtocole).then((res) => {
          if(res && res.protocoles[0]){
            let f, u;
            //this.unProtocole = res && res.protocoles[0];


            if(res.partenaires && res.partenaires[0]){
              res.protocoles[0].formData = this.addItemToObjectAtSpecificPosition(res.protocoles[0].formData, 'numeroInstitution', res.partenaires[0].formData.numero, 2);
              res.protocoles[0].formData = this.addItemToObjectAtSpecificPosition(res.protocoles[0].formData, 'nomInstitution', res.partenaires[0].formData.nom, 3);  
              f = res.partenaires[0].id;
            }else{
              res.protocoles[0].formData = this.addItemToObjectAtSpecificPosition(res.protocoles[0].formData, 'numeroInstitution', null, 2);
              res.protocoles[0].formData = this.addItemToObjectAtSpecificPosition(res.protocoles[0].formData, 'nomInstitution', null, 3);
              f = null;
            }
            
            if(res.projets && res.projets[0]){
              res.protocoles[0].formData = this.addItemToObjectAtSpecificPosition(res.protocoles[0].formData, 'numeroProjet', res.projets[0].formData.numero, 4);
              res.protocoles[0].formData = this.addItemToObjectAtSpecificPosition(res.protocoles[0].formData, 'nomProjet', res.projets[0].formData.nom, 5); 
              u = res.projets[0].id; 
            }else{
              res.protocoles[0].formData = this.addItemToObjectAtSpecificPosition(res.protocoles[0].formData, 'numeroProjet', null, 4);
              res.protocoles[0].formData = this.addItemToObjectAtSpecificPosition(res.protocoles[0].formData, 'nomProjet', null, 5);
              u = null;
            }

            
            this.infos({id: res.partenaires[0].id, idInstitution: f, idProjet: u, ...res.protocoles[0].formData}); 
          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
            this.close();
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          console.log(err)
          this.close();
        });
      }else if((this.idProjet && this.idProjet != '') || this.idPartenaire && this.idPartenaire != ''){
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
        
        if(this.idProjet){
          typePere = 'projet';
          idPere = this.idProjet;
        }else{
          typePere = 'partenaire';
          idPere = this.idPartenaire;
        }
        this.servicePouchdb.findRelationalDocOfTypeByPere('protocole', typePere, idPere, deleted, archived, shared).then((res) => {
          if(res && res.protocoles){
            //this.protocoles = [...protocoles];
            let protocolesData = [];
            //var datas = [];
            let institutionIndex = [];
            let projetIndex = [];
            let idInstitution, idProjet;
            for(let u of res.protocoles){
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

              protocolesData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, ...u.formData, ...u.formioData, ...u.security});
            }

            //this.protocolesData = [...datas]; 
  
            if(this.mobile){
              this.protocolesData = protocolesData;
              this.protocolesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allProtocolesData = [...this.protocolesData];
            } else{
              $('#protocole-relation').ready(()=>{
                if(global.langue == 'en'){
                  this.protocoleHTMLTable = createDataTable("protocole-relation", this.colonnes, protocolesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.protocoleHTMLTable = createDataTable("protocole-relation", this.colonnes, protocolesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.protocoleHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.protocoles = [];
          this.protocolesData = [];
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
        this.servicePouchdb.findRelationalDocByType('protocole', deleted, archived, shared).then((res) => {
           //console.log(res)
          if(res && res.protocoles){
            //this.protocoles = [...protocoles];
            let protocolesData = [];
            //var datas = [];
            let projetIndex = [];
            let institutionIndex = [];
            let idInstitution, idProjet;
            for(let u of res.protocoles){
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


              protocolesData.push({id: u.id, idInstitution: idInstitution, idProjet: idProjet, ...u.formData, ...u.formioData, ...u.security});
            }

            //this.protocolesData = [...datas];
  
            //console.log(protocolesData)
            if(this.mobile){
              this.protocolesData = protocolesData;
              this.protocolesData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allProtocolesData = [...this.protocolesData];
            } else{
              $('#protocole').ready(()=>{
                if(global.langue == 'en'){
                  this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, protocolesData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.protocoleHTMLTable = createDataTable("protocole", this.colonnes, protocolesData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.protocoleHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.protocoles = [];
          this.protocolesData = [];
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
            this.setSelect2DefaultValue('idInstitution', this.unProtocole.idInstitution);
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
      //let now = moment();
      let now = moment()//.format('DD-MM-YYYY');

      let dateDebutProjet, dateFinProjet;
      if(idInstitution && idInstitution != ''){
        this.servicePouchdb.findRelationalDocHasMany('projet', 'partenaire', idInstitution).then((res) => {
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
              this.setSelect2DefaultValue('idProjet', this.unProtocole.idProjet);
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

    setNumeroAndNomInstitution(idInstitution){
      if(idInstitution && idInstitution != ''){
        for(let f of this.institutionData){
          if(idInstitution == f.id){
            this.protocoleForm.controls.numeroInstitution.setValue(f.numero);
            this.protocoleForm.controls.nomInstitution.setValue(f.nom);

            this.protocoleForm.controls.idProjet.setValue(null);
            this.protocoleForm.controls.numeroProjet.setValue(null);
            this.protocoleForm.controls.nomProjet.setValue(null);
            this.projetDateDebut = null;
            this.projetDateFin = null;
            //console.log(numeroInstitution)
            this.getProjetParInstitution(idInstitution);
            break;
          }
        }
      }else{
        this.protocoleForm.controls.numeroInstitution.setValue(null);
        this.protocoleForm.controls.nomInstitution.setValue(null);

        this.protocoleForm.controls.numeroProjet.setValue(null);
        this.protocoleForm.controls.nomProjet.setValue(null);
        this.projetDateDebut = null;
        this.projetDateFin = null;
        this.getProjetParInstitution(idInstitution)
      }
    }

    setNumeroAndNomProjet(idProjet){
      this.projetDateDebut = null;
      this.projetDateFin = null;
      if(idProjet && idProjet != ''){
        for(let u of this.projetData){
          if(idProjet == u.id){
            this.protocoleForm.controls.numeroProjet.setValue(u.numero);
            this.protocoleForm.controls.nomProjet.setValue(u.nom);
            this.projetDateDebut = u.dateDebut.format('DD-MM-YYYY');
            this.projetDateFin = u.dateFin.format('DD-MM-YYYY');

            let now = moment();
            //let min = moment(now).add(1, 'days').format('DD-MM-YYYY');//le jour suivant
            if(now >= u.dateDebut && now <= u.dateFin){
              this.protocoleForm.controls.dateDebut.setValue(now.format('DD-MM-YYYY'));
            }else{
              this.protocoleForm.controls.dateDebut.setValue(null);
            }

            this.protocoleForm.controls.dateFin.setValue(null);
            $('#dateFin input').datepicker({'setDate': null})
            $('#dateDebut input').datepicker('setStartDate',this.projetDateDebut);
            $('#dateDebut input').datepicker('setEndDate',this.projetDateFin);
            //$('#dateFin input').datepicker('setStartDate', now);
            $('#dateFin input').datepicker('setEndDate',this.projetDateFin);
            
            break;
          }
        }
      }else{
        this.protocoleForm.controls.nomProjet.setValue(null);
        this.protocoleForm.controls.numeroProjet.setValue(null);
      }
    }
  

    attacheEventToDataTable(datatable){
      var self = this;
      var id = 'protocole-datatable';
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
        console.log(this.protocoleHTMLTable.datatable.row(this).data());
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
      //numéro protocole
      this.translate.get('PROTOCOLE_PAGE.MESSAGES_VALIDATION.NUMERO.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numero[0].message = res;
      });
      
      this.translate.get('PROTOCOLE_PAGE.MESSAGES_VALIDATION.NUMERO.UNIQUENUMERPROTOCOLEARTENAIRE').subscribe((res: string) => {
        this.messages_validation.numero[1].message = res;
      });
  
      //nom protocole
      this.translate.get('PROTOCOLE_PAGE.MESSAGES_VALIDATION.NOM.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });


       //numero fédération
       this.translate.get('PROJET_PAGE.MESSAGES_VALIDATION.NUMERO_INSTITUTION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idInstitution[0].message = res;
      });

      //numero projet
       this.translate.get('PROTOCOLE_PAGE.MESSAGES_VALIDATION.NUMERO_PROJET.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idProjet[0].message = res;
      });

      this.translate.get('PROTOCOLE_PAGE.MESSAGES_VALIDATION.DATE_DEBUT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.dateDebut[0].message = res;
      });

      this.translate.get('PROTOCOLE_PAGE.MESSAGES_VALIDATION.DATE_DEBUT.DATEDEBUTINVALIDE').subscribe((res: string) => {
        this.messages_validation.dateDebut[1].message = res;
      });
      
      this.translate.get('PROTOCOLE_PAGE.MESSAGES_VALIDATION.DATE_FIN.REQUIRED').subscribe((res: string) => {
        this.messages_validation.dateFin[0].message = res;
      });

      this.translate.get('PROTOCOLE_PAGE.MESSAGES_VALIDATION.DATE_DEBUT.DATEFININVALIDE').subscribe((res: string) => {
        this.messages_validation.dateFin[1].message = res;
      });

      //autre type domaine
      /*this.translate.get('PROTOCOLE_PAGE.MESSAGES_VALIDATION.DOMAINE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.domaine[0].message = res;
      });*/
    }
  
    
    dataTableAddRow(rowData){

      $('#protocole-dataTable').ready(() => {
        this.protocoleHTMLTable.datatable.row.add(rowData).draw();
      });
      
    }
  
    dataTableUpdateRow(/*index, */rowData){

      $('#protocole-dataTable').ready(() => {
        this.protocoleHTMLTable.datatable.row('.selected').data(rowData).draw();
      });
      
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      $('#protocole-dataTable').ready(() => {
        this.protocoleHTMLTable.datatable.rows('.selected').remove().draw();
      });

    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.protocoleHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.protocoleHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.protocoleHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    if(this.protocoleHTMLTable && this.protocoleHTMLTable.datatable){
      //var id = 'protocole-datatable';

      var self = this;
      //$('#'+id+' thead tr:eq(1)').show();

      //$(self.protocoleHTMLTable.datatable.table().header() ).children(1).show();
      $(self.protocoleHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
      this.recherchePlus = true;
    }
  }

  dataTableRemoveRechercheParColonne(){
    //var id = 'protocole-datatable';
    var self = this;

    //$('#'+id+' thead tr:eq(1)').hide();
    //$(self.protocoleHTMLTable.datatable.table().header() ).children(1).hide();
    $(self.protocoleHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'protocole-datatable';
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
      $( self.protocoleHTMLTable.datatable.table().footer() ).show();
      this.protocoleHTMLTable.datatable.columns().every( function () {
          i = i +1;
          //console.log("data-header=" +$(self.protocoleHTMLTable.datatable.table().header()).children(0).children(0)[1].firstChild.nodeValue)
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
                  
                  var info = self.protocoleHTMLTable.datatable.page.info();
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
          /*$( self.protocoleHTMLTable.datatable.table().footer() ).children(0).each( function (i) {
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

      this.protocoleHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
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
      $( self.protocoleHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }

  dataTableRemoveCustomFiltre(){
    var id = 'protocole-datatable';
    var self = this;
    //$('#'+id+' tfoot').hide();
    $( self.protocoleHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }


    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        ///let u = [...this.protocolesData]
        this.protocolesData = this.allProtocolesData.filter((item) => {
          return item.numero.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.protocoleData = temp;
      
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
