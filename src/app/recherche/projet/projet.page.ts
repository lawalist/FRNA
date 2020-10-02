import { Component, OnInit, Input  } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
//import { projetValidator } from '../../validators/projet.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsProjetComponent } from '../../component/relations-projet/relations-projet.component';
import { global } from '../../../app/globale/variable';
import { ActionDatatableComponent } from 'src/app/component/action-datatable/action-datatable.component';
import { DatatableMoreComponent } from 'src/app/component/datatable-more/datatable-more.component';
import { DatatableConstructComponent } from 'src/app/component/datatable-construct/datatable-construct.component';
import { SelectionComponent } from 'src/app/component/selection/selection.component';
import { DerniereModificationComponent } from 'src/app/component/derniere-modification/derniere-modification.component';
import { ListeMoreComponent } from 'src/app/component/liste-more/liste-more.component';
import { ListeActionComponent } from 'src/app/component/liste-action/liste-action.component';
import { isObject } from 'util';
import { PartenairePage } from '../../institution/partenaire/partenaire.page';
import { isDefined } from '@angular/compiler/src/util';
import '@ckeditor/ckeditor5-build-decoupled-document/build/translations/fr';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import * as moment from 'moment';
import { ProtocolePage } from '../protocole/protocole.page';
import { EssaiPage } from '../essai/essai.page';

//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
//declare var reCreateTHMLTable: any;
declare var $: any;
declare var cordova: any;

@Component({
  selector: 'app-projet',
  templateUrl: './projet.page.html',
  styleUrls: ['./projet.page.scss'],
})
export class ProjetPage implements OnInit {
  @Input() idProjet: string;
  @Input() idPartenaire: string;
  @Input() filtreProjet: any;

  global = global;
  start: any;
  loading: boolean = false;
  moment = moment;
  projetForm: FormGroup;
  action: string = 'liste';
  cacheAction: string = 'liste';
  projets: any = [];
  projetsData: any = [];
  allProjetsData: any = [];
  institutionData: any = [];
  secteurs = ['Privé', 'Etat', 'Sémi-privé'];
  domaines = ['Agronamie', 'Santé', 'Environement', 'Gouvernement'];
  unProjet: any;
  unProjetDoc: any;
  projetHTMLTable: any;
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
  colonnes = ['nom', 'numero', 'dateDebut', 'dateFin', 'nomInstitution', 'numeroInstitution']

  messages_validation = {
    'numero': [
      { type: 'required', message: '' },
      { type: 'uniqueNumeroProjet', message: '' }
    ],
    'nom': [
      { type: 'required', message: '' }
    ],
    'idInstitution': [
      { type: 'required', message: '' }
    ],
    'dateDebut': [
      { type: 'required', message: '' },
    ],  
    'dateFin': [
      { type: 'required', message: '' }
    ] 
  };

  public Editor = DecoupledEditor;
  public editor = null;
  public config = {
    language: global.langue,
    placeholder: ''
  };

  public editorData = '';

  
    constructor(private formBuilder: FormBuilder, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la projet est en mode modal, on chercher info region
      this.translateLangue();
      this.getProjet();
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
      this.projetForm.controls.description.setValue(editor.getData())

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
        this.actualiserTableau(this.projetsData);
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
      if(this.projetForm.get(filedName).errors && (this.projetForm.get(filedName).dirty || this.projetForm.get(filedName).touched)){
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
      if(this.projetForm.get(filedName).errors){
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

    iniDateDabutDatePicker(id){
      var self = this;

      $(function () {
        
        $('#'+id+' input').datepicker({
          autoclose: true,
          todayHighlight: true,
          format: 'dd-mm-yyyy',
          language: global.langue
        }).on('changeDate', function(e) {
          self.projetForm.controls.dateDebut.setValue(e.date.toISOString());
          self.projetForm.controls.dateFin.setValue(null);
          $('#dateFin input').datepicker({'setDate': null})
          $('#dateFin input').datepicker('setStartDate', moment(e.date).format('DD-MM-YYYY'));
          /*
          let newDate = moment(e.date)//.format('DD-MM-YYYY');
          let min = moment(newDate).add(1, 'days');//le jour suivant
          self.projetForm.controls.dateDebut.setValue(newDate.format('DD-MM-YYYY'));
          self.projetForm.controls.dateFin.setValue(null);
          $('#dateFin input').datepicker({'setDate': null})
          $('#dateFin input').datepicker('setStartDate', min.format('DD-MM-YYYY'));*/
        });
      });
    }


    iniDateFinDatePicker(id){
      var self = this;
      let min;
      if(this.unProjet && this.unProjet.dateDebut && this.unProjet.dateDebut != ''){
        min = moment(this.unProjet.dateDebut);
        //min = moment(min).add(1, 'days');
      }else{
        min = moment();
        //min = moment(min).add(1, 'days');
      }
      //console.log(min.format('DD-MM-YYYY'))
      $('#'+id+' input').ready(() => {
        $('#'+id+' input').datepicker({
          autoclose: true,
          todayHighlight: true,
          startDate: min.format('DD-MM-YYYY'),
          format: 'dd-mm-yyyy',
          language: global.langue
        }).on('changeDate', function(e) {
          //let newDate = moment(e.date)
          //console.log(e)
          self.projetForm.controls.dateFin.setValue(e.date.toISOString()/*newDate.format('DD-MM-YYYY')*/);
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
          self.projetForm.controls[id].setValue(e.params.data.id)
          if(id == 'idInstitution'){
            self.setCodeAndNomInstitution(self.projetForm.value[id]);
            self.setSelectRequredError(id, id)
          }
          
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.projetForm.controls[id].setValue(null); 
          if(id == 'idInstitution'){
            self.projetForm.controls.idInstitution.setValue(null);
            self.projetForm.controls.numeroInstitution.setValue(null);
            self.projetForm.controls.nomInstitution.setValue(null);
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
      //this.projetForm = null;
      this.projetForm = this.formBuilder.group({
        nom: [null, Validators.required],
        numero: [null, Validators.required],
        dateDebut : [null, Validators.required],
        dateFin : [null, Validators.required],
        nomInstitution: [null, Validators.required],
        numeroInstitution: [null, Validators.required],
        idInstitution: [null, Validators.required],
        description: [null],  
      });

      this.validerNumero();
    }
  
    editForm(uDoc){
      let projet = uDoc.projets[0];
      let idInstitution;
      let numeroInstitution;
      let nomInstitution;
      
      

      if(uDoc.partenaires[0]){
        idInstitution = uDoc.partenaires[0].id;
        numeroInstitution = uDoc.partenaires[0].formData.numero;
        nomInstitution = uDoc.partenaires[0].formData.nom;
      }

      
      //this.projetForm = null;
      let u = projet.formData

      /*if(u.description){
        this.editorData = u.description;
      }else{
        this.editorData = '';
      }*/

      this.projetForm = this.formBuilder.group({
        nom: [u.nom, Validators.required],
        numero: [u.numero, Validators.required],
        dateDebut : [u.dateDebut, Validators.required],
        dateFin : [u.dateFin, Validators.required],
        nomInstitution: [nomInstitution, Validators.required], 
        numeroInstitution: [numeroInstitution, Validators.required],
        idInstitution: [idInstitution, Validators.required],
        description: [u.description],
        
      });

      this.validerNumero();

    }


    validerNumero(){
      let numeroControl = this.projetForm.controls['numero'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndNumero('projet', value).then((res) => {
          if(res && res.projets && res.projets[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.unProjet.numero))){
            numeroControl.setErrors({uniqueNumeroProjet: true});
          }
        });
      });

      //controle date debut et date fin
      let dateDebutControl = this.projetForm.controls['dateDebut'];
      let dateFinControl = this.projetForm.controls['dateFin'];

      //dateDebut doit etre > dateFin
      dateDebutControl.valueChanges.subscribe((value) => {
        if(!value || value == ''){
          dateDebutControl.setErrors({required: true});
          this.setInputRequredError('dateDebut', 'dateDebut');
        } else{
          this.setInputRequredError('dateDebut', 'dateDebut');
        }
      });

      dateFinControl.valueChanges.subscribe((value) => {
        if(!value || value == ''){
          dateFinControl.setErrors({required: true});
          this.setInputRequredError('dateFin', 'dateFin');
        }else{
          this.setInputRequredError('dateFin', 'dateFin');
        }
      });
    }

  
    ajouter(){
      this.doModification = false;
      this.start = moment().toISOString();
      this.unProjet = null;
      this.getInstitution();
      this.editorData = '';
      this.initForm();
      this.iniDateDabutDatePicker('dateDebut');
      this.iniDateFinDatePicker('dateFin');
      this.initSelect2('idInstitution', this.translate.instant('PROJET_PAGE.SELECTIONINSTITUTION'));
      //this.initSelect2('domaine', this.translate.instant('PROJET_PAGE.DOMAINE'));
      
      this.action = 'ajouter';
    }
  
    infos(u){
      if(global.controlAccesModele('projets', 'lecture')){
        if(!this.estModeCocherElemListe){
          this.unProjet = u;
          this.unProjetDoc = null;
  
          let id;
          if(isObject(u)){
            id = u.id;
          }else{
            id = u;
          }
  
          this.action = 'infos';
          this.servicePouchdb.findRelationalDocByID('projet', id).then((res) => {
            if(res && res.projets[0]){
              this.unProjetDoc = res;
  
              this.rev = res.projets[0].rev.substring(0, res.projets[0].rev.indexOf('-'));
            }
          }).catch((err) => {
            alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
          })
        }
      }
      
    }

  
    modifier(projet){
      //console.log(projet)
      if(!this.filtreProjet){
        if(global.controlAccesModele('projets', 'modification')){
          let id;
          if(isObject(projet)){
            id = projet.id;
          }else{
            id = projet;
          }
    
          this.doModification = true;
          this.start = moment().toISOString();
          if(this.action == 'infos' && this.unProjetDoc){
            this.editForm(this.clone(this.unProjetDoc));
    
            this.unProjetDoc = this.unProjetDoc.projets[0];  
            this.getInstitution();
    
            this.iniDateDabutDatePicker('dateDebut');
            this.iniDateFinDatePicker('dateFin');
            this.initSelect2('idInstitution', this.translate.instant('PROJET_PAGE.SELECTIONINSTITUTION'));
            //this.initSelect2('domaine', this.translate.instant('PROJET_PAGE.DOMAINE'));
            
            /*$('#numero input').ready(()=>{
              $('#numero input').attr('disabled', true)
            });*/
            //this.setSelect2DefaultValue('numeroInstitution', uDoc.formData.numeroInstitution)
            //this.setSelect2DefaultValue('domaine', uDoc.formData.domaine)
            
            
           
            if(!isObject(projet)){
              for(let u of this.projetsData){
                if(u.id == id){
                  this.unProjet = u;
                  break;
                }
              }
            }else{
              this.unProjet = projet;
            }
    
            this.action ='modifier';
          }else{
            this.unProjetDoc = null;
            this.servicePouchdb.findRelationalDocByID('projet', id).then((res) => {
              if(res && res.projets[0]){
                let uDoc = res.projets[0];
                
                this.getInstitution();
      
                this.editForm(res);
      
                this.iniDateDabutDatePicker('dateDebut');
                this.iniDateFinDatePicker('dateFin');
                this.initSelect2('idInstitution', this.translate.instant('PROJET_PAGE.SELECTIONINSTITUTION'));
                //this.initSelect2('domaine', this.translate.instant('PROJET_PAGE.DOMAINE'));
                
                /*$('#numero input').ready(()=>{
                  $('#numero input').attr('disabled', true)
                });*/
                //this.setSelect2DefaultValue('numeroInstitution', uDoc.formData.numeroInstitution)
                //this.setSelect2DefaultValue('domaine', uDoc.formData.domaine)
                
                this.unProjetDoc = uDoc;
               
                if(!isObject(projet)){
                  for(let u of this.projetsData){
                    if(u.id == id){
                      this.unProjet = u;
                      break;
                    }
                  }
                }else{
                  this.unProjet = projet;
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
    
    exportPDF(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('projet-datatable').innerHTML], {
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

                this.servicePouchdb.findRelationalDocByID('projet', u.id).then((res) => {
                  res.projets[0].security = this.servicePouchdb.garderDeleteTrace(res.projets[0].security);

                  this.servicePouchdb.updateRelationalDoc(res.projets[0]).then((res) => {
                    //mise à jour de la liste si mobile et mode liste
                    if(this.projetsData.indexOf(u) !== -1){
                      this.projetsData.splice(this.projetsData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant')
                    }

                    this.action = 'liste';

                    if(!this.mobile){
                      //sinion dans le tableau
                      this.dataTableRemoveRows();
                    }else{
                      this.projetsData = [...this.projetsData];
                      if(this.allProjetsData.indexOf(u) !== -1){
                        this.allProjetsData.splice(this.allProjetsData.indexOf(u), 1);
                      }else{
                        console.log('echec splice, index inexistant dans allProjetsData')
                      }
                    }
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }else{

                this.servicePouchdb.findRelationalDocByID('projet', u.id).then((res) => {
                 this.servicePouchdb.deleteRelationalDocDefinitivement(res.projets[0]).then((res) => {

                  //mise à jour de la liste si mobile et mode liste
                  if(this.projetsData.indexOf(u) !== -1){
                    this.projetsData.splice(this.projetsData.indexOf(u), 1);
                  }else{
                    console.log('echec splice, index inexistant')
                  }

                  this.action = 'liste';
                  if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                    //sinion dans le tableau
                    this.dataTableRemoveRows();
                  }else{
                    this.projetsData = [...this.projetsData];
                    if(this.allProjetsData.indexOf(u) !== -1){
                      this.allProjetsData.splice(this.allProjetsData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant dans allProjetsData')
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
  
    
    async presentInstitution(idPartenaire) {
      const modal = await this.modalController.create({
        component: PartenairePage,
        componentProps: { 
          idModele: 'projets', idPartenaire: idPartenaire },
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
                //var u = this.projetsData[i];
                this.servicePouchdb.findRelationalDocByID('projet', id).then((res) => {
                  res.projets[0].security = this.servicePouchdb.garderArchivedTrace(res.projets[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.projets[0]).catch((err) => {
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
                this.projetsData = [...this.removeMultipleElem(this.projetsData, numeros)];
                this.allProjetsData = this.removeMultipleElem(this.allProjetsData, numeros);
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
                //var u = this.projetsData[i];
                this.servicePouchdb.findRelationalDocByID('projet', id).then((res) => {
                  res.projets[0].security = this.servicePouchdb.garderDesarchivedTrace(res.projets[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.projets[0]).catch((err) => {
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
                this.projetsData = [...this.removeMultipleElem(this.projetsData, ids)]; 
                this.allProjetsData = this.removeMultipleElem(this.allProjetsData, ids);
                
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
      this.projetsData.forEach((u) => {
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
          idModele: 'projets', 
          "estModeCocherElemListe": this.estModeCocherElemListe,
          "dataLength": this.projetsData.length,
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
          this.getProjetsByType('liste');
        }  else  if(dataReturned !== null && dataReturned.data == 'archives') {
          this.estModeCocherElemListe = false;
          this.getProjetsByType('archives');
        }  else  if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.estModeCocherElemListe = false;
          this.getProjetsByType('corbeille');
        }  else  if(dataReturned !== null && dataReturned.data == 'partages') {
          this.estModeCocherElemListe = false;
          this.getProjetsByType('partages');
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
       let data = [...this.projetsData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_Projets_'+date+'.xls', blob).then(()=> {
           alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
       }).catch(()=>{
           alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
       });
     }
   
     exportCSV(){
       let data = [...this.projetsData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_Projets_'+date+'.csv', blob).then(()=> {
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
          //"dataLength": this.projetsData.length,
          //"selectedIndexesLength": this.selectedIndexes.length,
          //"styleAffichage": this.styleAffichage,
          idModele: 'projets', 
          "action": this.cacheAction
      /*}*/},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'modifier') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unProjet.id);
          }

          this.modifier(this.selectedIndexes[0]);
          this.decocherTousElemListe();
          this.estModeCocherElemListe = false;
          //this.changerModeCocherElemListe();
        }else  if(dataReturned !== null && dataReturned.data == 'desarchiver') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unProjet.id);
          }
         

          this.desarchivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else  if(dataReturned !== null && dataReturned.data == 'archiver') {
          if(this.action == 'infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unProjet.id);
          }

          this.archivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        } else  if(dataReturned !== null && dataReturned.data == 'restaurer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unProjet.id);
          }

          this.restaurationMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else if(dataReturned !== null && dataReturned.data == 'derniereModification') {
          this.selectedItemDerniereModification();          
        }else if(dataReturned !== null && dataReturned.data == 'partager') {
          //this.changeStyle();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unProjet.id);
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
      if(this.projetsData.length != this.selectedIndexes.length) {
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
                  //var u = this.projetsData[i];
                  this.servicePouchdb.findRelationalDocByID('projet', id).then((res) => {
                    res.projets[0].security = this.servicePouchdb.garderDeleteTrace(res.projets[0].security);
                    this.servicePouchdb.updateRelationalDoc(res.projets[0]).catch((err) => {
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
                  this.projetsData = [...this.removeMultipleElem(this.projetsData, ids)];
                  this.allProjetsData = this.removeMultipleElem(this.allProjetsData, ids);
                  
                  //if(this.action != 'infos'){
                    this.estModeCocherElemListe = false;
                    this.decocherTousElemListe();
                  //}
                  //this.action = this.cacheAction;
                }
              }else{

                //suppresion multiple définitive
                for(let id of ids){
                  //var u = this.projetsData[i];
                  
                  this.servicePouchdb.findRelationalDocByID('projet', id).then((res) => {
                    this.servicePouchdb.deleteRelationalDocDefinitivement(res.projets[0]).catch((err) => {
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
                  this.projetsData = [...this.removeMultipleElem(this.projetsData, ids)];
                  this.allProjetsData = [...this.removeMultipleElem(this.allProjetsData, ids)];

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
                //var u = this.projetsData[i];
                
                this.servicePouchdb.findRelationalDocByID('projet', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.projets[0]).catch((err) => {
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
                this.projetsData = [...this.removeMultipleElem(this.projetsData, ids)];
                this.allProjetsData = this.removeMultipleElem(this.allProjetsData, ids);
                
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
                //var u = this.projetsData[i];
                this.servicePouchdb.findRelationalDocByID('projet', id).then((res) => {
                  res.projets[0].security = this.servicePouchdb.garderRestaureTrace(res.projets[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.projets[0]).catch((err) => {
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
                this.projetsData = [...this.removeMultipleElem(this.projetsData, ids)];
                this.allProjetsData = [...this.removeMultipleElem(this.allProjetsData, ids)];
                
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
        codes.push(this.unProjet.id);
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
        //this.actualiserTableau(this.projetsData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        //this.action = "infos";
        this.infos(this.unProjet)
      }else{
        //this.action = 'liste';
        this.action = this.cacheAction; 
        //recharger la liste
        if(this.rechargerListeMobile){
          this.projetsData = [...this.projetsData];
          this.rechargerListeMobile = false;
        }
        ///this.actualiserTableau(this.projetsData);
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
              this.infos(this.projetsData[this.selectedIndexes[0]]);
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
              this.modifier(this.projetsData[this.selectedIndexes[0]]);
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
          idModele: 'projets'},
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
            this.infos(this.projetsData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.projetsData[this.selectedIndexes[0]]);
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
          idModele: 'projets', "action": this.action, "recherchePlus": this.recherchePlus, "filterAjouter": this.filterAjouter},
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
          this.getProjetsByType('corbeille');
        } else if(dataReturned !== null && dataReturned.data == 'archives') {
          this.getProjetsByType('archives');
        } else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getProjetsByType('partages');
        } else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          //this.getProjetsByType('conflits');
        } else if(dataReturned !== null && dataReturned.data == 'liste') {
          this.getProjetsByType('liste');
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
          idModele: 'projets'},
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
          idModele: 'projets', action: this.action},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'listePrincipale') {
          this.getProjetsByType('liste');
        }else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getProjetsByType('partages');
        }else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          this.cacheAction = 'conflits';
          this.getProjetWithConflicts();
          //this.getProjet();
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

    getProjetWithConflicts(event = null){
      this.action = 'conflits';
      this.cacheAction = 'conflits';
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;

      this.servicePouchdb.findRelationalDocInConflict('projet').then((res) => {
        if(res){
          //this.projetsData = [];
          let projetsData = [];
          let partenaireIndex = [];
          let idInstitution;

          for(let u of res.projets){
            //supprimer l'historique de la liste
            delete u.security['shared_history'];


            if(u.partenaire && u.partenaire != ''){
              if(isDefined(partenaireIndex[u.partenaire])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 2);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 3);
                idInstitution = res.partenaires[partenaireIndex[u.partenaire]].id;
              }else{
                for(let i=0; i < res.partenaires.length; i++){
                  if(res.partenaires[i].id == u.partenaire){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                    partenaireIndex[u.partenaire] = i;
                    idInstitution = res.partenaires[i].id;
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

            projetsData.push({id: u.id, idInstitution: idInstitution, ...u.formData, ...u.formioData, ...u.security});
          }

          if(this.mobile){
            this.projetsData = projetsData;
            this.projetsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.allProjetsData = [...this.allProjetsData];

          } else{
            $('#projet').ready(()=>{
              if(global.langue == 'en'){
                this.projetHTMLTable = createDataTable("projet", this.colonnes, projetsData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.projetHTMLTable = createDataTable("projet", this.colonnes, projetsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.attacheEventToDataTable(this.projetHTMLTable.datatable);
            });
          }
        }
        if(event)
          event.target.complete();
      }).catch((err) => {
        this.projets = [];
        this.projetsData = [];
        this.allProjetsData = [];
        console.log(err)
        if(event)
          event.target.complete();
      });
    }

    getProjetsByType(type){
      this.action = type;
      this.cacheAction = type;
      this.getProjet();
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
          idModele: 'projets', "action": this.action, "cacheAction": this.cacheAction},
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
    
    async presentDerniereModification(projet) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { 
          idModele: 'projets', _id: projet.id, _rev: projet.rev, security: projet.security },
        mode: 'ios',
        backdropDismiss: false,
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      let id
      if(this.action == 'infos'){
        id = this.unProjet.id;
      }else{
        id = this.selectedIndexes[0];
      }

      if(id && id != ''){
        this.servicePouchdb.findRelationalDocByID('projet', id).then((res) => {
          if(res && res.projets[0]){
            if(this.estModeCocherElemListe){
              this.estModeCocherElemListe = false;
              this.decocherTousElemListe();
            }
            this.presentDerniereModification(res.projets[0]);
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
      var i = this.projetHTMLTable.datatable.row('.selected').index();

      if(this.projetHTMLTable.datatable.row(i).next()){
        this.next = true;
      }else{
        this.next = false;
      }

      if(this.projetHTMLTable.datatable.row(i).prev()){
        this.prev = true;
      }else{
        this.prev = false;
      }
    }

    datatableNextRow(){
      //datatable.row(this.selectedIndexes).next().data();
      var i = this.projetHTMLTable.datatable.row('.selected').index();
      if(this.projetHTMLTable.datatable.row(i).next()){
        //this.projetHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.projetHTMLTable.datatable.rows().deselect();
        this.projetHTMLTable.datatable.row(i).next().select();
        this.selectedItemInfo();
        
        if(this.projetHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }else{
        this.next = false;

        if(this.projetHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }
    }

    datatablePrevRow(){
      //datatable.row(this.selectedIndexes).prev().data();
      var i = this.projetHTMLTable.datatable.row('.selected').index();
      if(this.projetHTMLTable.datatable.row(i).prev()){
        //this.projetHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.projetHTMLTable.datatable.rows().deselect();
        this.projetHTMLTable.datatable.row(i).prev().select();
        this.selectedItemInfo();
        
        if(this.projetHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }else{
        this.prev = false;

        if(this.projetHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }
    }

    datatableDeselectMultipleSelectedItemForModification(){
      if(this.selectedIndexes.length > 1){
        var i = this.projetHTMLTable.datatable.row('.selected').index();
        this.projetHTMLTable.datatable.rows().deselect();
        this.projetHTMLTable.datatable.row(i).select();
      }
    }

    selectedItemInfo(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.projetHTMLTable.datatable.row('.selected').index();
      let data  = this.projetHTMLTable.datatable.row(row).data();
      this.infos(data);
      
      //mise à jour du ckeditor
      if(this.editor && this.editor.data){
        this.editor.data.set(data.description)
      }
      
      this.initDatatableNextPrevRow();
        //this.selectedIndexes = [];
      //}else{
      //  alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'));
      //}
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
        let row  = this.projetHTMLTable.datatable.row('.selected').index();
        let data  = this.projetHTMLTable.datatable.row(row).data();
        this.modifier(data);

        //this.selectedIndexes = [];
      //}else{
       // alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TROP'))
      //}
    }
  
  
    async openRelationProjet(ev: any/*, numeroProjet*/) {
      const popover = await this.popoverController.create({
        component: RelationsProjetComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'projets', "idProjet": this.unProjet.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'protocole') {
          this.presentProtocole(this.unProjet.id);
        }else if(dataReturned !== null && dataReturned.data == 'essais') {
          this.presentEssai(this.unProjet.id);
        }/*else if(dataReturned !== null && dataReturned.data == 'projet') {
          
        }else if(dataReturned !== null && dataReturned.data == 'projet') {
          
        } else if(dataReturned !== null && dataReturned.data == 'projet') {
          
        }*/
  
      });
      return await popover.present();
    }

    async openRelationProjetDepuisListe(ev: any) {
      const popover = await this.popoverController.create({
        component: RelationsProjetComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'projets', "idProjet": this.selectedIndexes[0]},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'protocole') {
          this.presentProtocole(this.selectedIndexes[0]);
        }else if(dataReturned !== null && dataReturned.data == 'essais') {
          this.presentEssai(this.selectedIndexes[0]);
        }
        /*if(dataReturned !== null && dataReturned.data == 'commune') {
          this.presentCommune(this.departementsData[this.selectedIndexes[0]].codeDepartement);
        } else if(dataReturned !== null && dataReturned.data == 'projet') {
          this.presentProjet(this.departementsData[this.selectedIndexes[0]].codeDepartement) 
        }*/
  
      });
      return await popover.present();
    }
  

    async openRelationProjetDepuisTableau(ev: any) {
      //let row  = this.projetHTMLTable.datatable.row('.selected').index();
      //let data  = this.projetHTMLTable.datatable.row(row).data();
      const popover = await this.popoverController.create({
        component: RelationsProjetComponent,
        event: ev,
        translucent: true,
        componentProps: {
          idModele: 'projets', "idProjet": this.selectedIndexes[0]/*data.numero*/},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'protocole') {
          this.presentProtocole(this.selectedIndexes[0]);
        }else if(dataReturned !== null && dataReturned.data == 'essais') {
          this.presentEssai(this.selectedIndexes[0]);
        }
  
      });
      return await popover.present();
    }

    async presentProtocole(idProjet){
      const modal = await this.modalController.create({
        component: ProtocolePage,
        componentProps: { 
          idModele: 'projets', idProjet: idProjet },
        mode: 'ios',
        backdropDismiss: false,
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentEssai(idProjet){
      const modal = await this.modalController.create({
        component: EssaiPage,
        componentProps: { 
          idModele: 'projets', idProjet: idProjet },
        mode: 'ios',
        backdropDismiss: false,
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
 
    onSubmit(){
      let formData = this.projetForm.value;
      //formData.description = this.editorData;
      let formioData = {};
      if(this.action === 'ajouter'){
        //créer un nouveau projet
      
        let projet: any = {
          //_id: 'fuma:projet:'+data.numero,
          //id: formData.numero,
          type: 'projet',
          partenaire: formData.idInstitution, //relation avec la fédération
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

        projet.security = this.servicePouchdb.garderCreationTrace(projet.security);

        //ne pas sauvegarder les information relative à la fédération dans l'objet projet
        //relation-pour va faire le mapping à travers la propriété institution se trouvant dans l'objet projet
        let doc = this.clone(projet);
        delete doc.formData.idInstitution;
        delete doc.formData.numeroInstitution;
        delete doc.formData.nomInstitution;

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          let projetData = {id: res.projets[0].id, ...projet.formData, ...projet.formioData, ...projet.security};
          //this.projets = projet;
          
          //projet._rev = res.projets[0].rev;
          //this.projets.push(projet);
          this.action = 'liste';
          //this.rechargerListeMobile = true;
          if(!this.mobile){
            //mode tableau, ajout d'un autre projet dans la liste
            this.dataTableAddRow(projetData)
          }else{
            //mobile, cache la liste des projet pour mettre à jour la base de données
            this.projetsData.push(projetData);
            this.projetsData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.projetsData = [...this.projetsData];

            this.allProjetsData.push(projetData);
            this.allProjetsData.sort((a, b) => {
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

          //initialiser la liste des projets
          //this.creerProjet(projetData.numeroProjet);
          
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
        });
  
      }else{
        //si modification
          this.unProjetDoc.partenaire = formData.idInstitution
          this.unProjetDoc.formData = formData;
          this.unProjetDoc.formioData = formioData;

          //this.unProjet = projetData;
          this.unProjetDoc.security.update_start = this.start;
          this.unProjetDoc.security.update_start = moment().toISOString();
          this.unProjetDoc.security = this.servicePouchdb.garderUpdateTrace(this.unProjetDoc.security);

          let doc = this.clone(this.unProjetDoc);
          delete doc.formData.idInstitution;
          delete doc.formData.numeroInstitution;
          delete doc.formData.nomInstitution;

          this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
            //this.projets._rev = res.rev;
            //this.unProjetDoc._rev = res.rev;
            let projetData = {id: this.unProjetDoc.id, ...this.unProjetDoc.formData, ...this.unProjetDoc.formioData, ...this.unProjetDoc.security};

            //this.action = 'infos';
            this.infos(projetData);

            
            if(this.mobile){
              //mode liste
              //cache la liste pour le changement dans virtual Scroll
              //this.projetsData = [...this.projetsData];
              
              //mise à jour dans la liste
              for(let i = 0; i < this.projetsData.length; i++){
                if(this.projetsData[i].id == projetData.id){
                  this.projetsData[i] = projetData;
                  break;
                }
              }


              this.projetsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              //mise à jour dans la liste cache
              for(let i = 0; i < this.allProjetsData.length; i++){
                if(this.allProjetsData[i].id == projetData.id){
                  this.allProjetsData[i] = projetData;
                  break;
                }
              }

              this.allProjetsData.sort((a, b) => {
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
              this.dataTableUpdateRow(projetData);
            }

          }).catch((err) => {
            alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          });
      }
    }
  
  
    actualiserTableau(data){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#projet').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.projetHTMLTable = createDataTable("projet", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.projetHTMLTable = createDataTable("projet", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.projetHTMLTable = createDataTable("projet", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.projetHTMLTable = createDataTable("projet", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.projetHTMLTable.datatable);
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

        if((this.idPartenaire && this.idPartenaire != '')  || this.filtreProjet){
          this.servicePouchdb.findRelationalDocOfTypeByPere('projet', 'partenaire', this.idPartenaire, deleted, archived, shared).then((res) => {
            if(res && res.projets){
              let projetsData = [];
                //var datas = [];
              let partenaireIndex = [];
              let idInstitution;
  
              for(let u of res.projets){
                //supprimer l'historique de la liste
                if(this.filtreProjet){
                  if(this.filtreProjet.indexOf(u.id) === -1){
                    delete u.security['shared_history'];
    
                    if(u.partenaire && u.partenaire != ''){
                      if(isDefined(partenaireIndex[u.partenaire])){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 2);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 3);
                        idInstitution = res.partenaires[partenaireIndex[u.partenaire]].id;
                      }else{
                        for(let i=0; i < res.partenaires.length; i++){
                          if(res.partenaires[i].id == u.partenaire){
                            u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                            u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                            partenaireIndex[u.partenaire] = i;
                            idInstitution = res.partenaires[i].id;
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
        
                    projetsData.push({id: u.id, idInstitution: idInstitution, ...u.formData, ...u.formioData, ...u.security});
                  }
                }else{
                  delete u.security['shared_history'];
    
                  if(u.partenaire && u.partenaire != ''){
                    if(isDefined(partenaireIndex[u.partenaire])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 2);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 3);
                      idInstitution = res.partenaires[partenaireIndex[u.partenaire]].id;
                    }else{
                      for(let i=0; i < res.partenaires.length; i++){
                        if(res.partenaires[i].id == u.partenaire){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                          partenaireIndex[u.partenaire] = i;
                          idInstitution = res.partenaires[i].id;
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
      
                  projetsData.push({id: u.id, idInstitution: idInstitution, ...u.formData, ...u.formioData, ...u.security});
                }
                
              }
    
            //si mobile
            if(this.mobile){
              this.projetsData = projetsData;
              this.projetsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              this.allProjetsData = [...this.projetsData]
            } else{
              let expor = global.peutExporterDonnees;
                if(this.filtreProjet){
                  expor = false;
                }
                $('#projet-partenaire').ready(()=>{
                  if(global.langue == 'en'){
                    this.projetHTMLTable = createDataTable("projet-partenaire", this.colonnes, projetsData, null, this.translate, expor);
                  }else{
                    this.projetHTMLTable = createDataTable("projet-partenaire", this.colonnes, projetsData, global.dataTable_fr, this.translate, expor);
                  }
                  this.attacheEventToDataTable(this.projetHTMLTable.datatable);
                });
              }
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }else{
              this.projets = [];
              //if(this.mobile){
                this.projetsData = [];
                this.allProjetsData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            console.log('Erreur acces à la projet ==> '+err)
            this.projets = [];
            //if(this.mobile){
              this.projetsData = [];
              this.allProjetsData = [];
            //}
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          });  
        }else{
          this.servicePouchdb.findRelationalDocByType('projet', deleted, archived, shared).then((res) => {
            if(res && res.projets){
              let projetsData = [];
                //var datas = [];
              let partenaireIndex = [];
              let idInstitution;
  
              for(let u of res.projets){
                //supprimer l'historique de la liste
                delete u.security['shared_history'];
    
                if(u.partenaire && u.partenaire != ''){
                  if(isDefined(partenaireIndex[u.partenaire])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 2);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 3);
                    idInstitution = res.partenaires[partenaireIndex[u.partenaire]].id;
                  }else{
                    for(let i=0; i < res.partenaires.length; i++){
                      if(res.partenaires[i].id == u.partenaire){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                        partenaireIndex[u.partenaire] = i;
                        idInstitution = res.partenaires[i].id;
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
    
                projetsData.push({id: u.id, idInstitution: idInstitution, ...u.formData, ...u.formioData, ...u.security});
              }
    
            //si mobile
            if(this.mobile){
              this.projetsData = projetsData;
              this.projetsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              this.allProjetsData = [...this.projetsData]
            } else{
                $('#projet').ready(()=>{
                  if(global.langue == 'en'){
                    this.projetHTMLTable = createDataTable("projet", this.colonnes, projetsData, null, this.translate, global.peutExporterDonnees);
                  }else{
                    this.projetHTMLTable = createDataTable("projet", this.colonnes, projetsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.projetHTMLTable.datatable);
                });
              }
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }else{
              this.projets = [];
              //if(this.mobile){
                this.projetsData = [];
                this.allProjetsData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            console.log('Erreur acces à la projet ==> '+err)
            this.projets = [];
            //if(this.mobile){
              this.projetsData = [];
              this.allProjetsData = [];
            //}
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          });  
        }

      }else{
        this.getProjetWithConflicts(event);
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
  
    getProjet(){
      //tous les departements
      this.loading = true;
      if(this.idProjet && this.idProjet != ''){
        this.servicePouchdb.findRelationalDocByID('projet', this.idProjet).then((res) => {
          if(res && res.projets[0]){
            let f = null;
            //this.unProjet = res && res.projets[0];

            if(res.partenaires && res.partenaires[0]){
              res.projets[0].formData = this.addItemToObjectAtSpecificPosition(res.projets[0].formData, 'numeroInstitution', res.partenaires[0].formData.numero, 2);
              res.projets[0].formData = this.addItemToObjectAtSpecificPosition(res.projets[0].formData, 'nomInstitution', res.partenaires[0].formData.nom, 3); 
              f = res.partenaires[0].id;
            }else{
              res.projets[0].formData = this.addItemToObjectAtSpecificPosition(res.projets[0].formData, 'numeroInstitution', null, 2);
              res.projets[0].formData = this.addItemToObjectAtSpecificPosition(res.projets[0].formData, 'nomInstitution', null, 3);
            }
            this.loading = false;

            this.infos({id: res.projets[0].id, idInstitution: f,  ...res.projets[0].formData}); 
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
      }else if((this.idPartenaire && this.idPartenaire != '')  || this.filtreProjet){
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
        this.servicePouchdb.findRelationalDocOfTypeByPere('projet', 'partenaire', this.idPartenaire, deleted, archived, shared).then((res) => {
          if(res && res.projets){
            //this.projets = [...projets];
            //this.projetsData = [];
            let projetsData = [];
            //var datas = [];
            let partenaireIndex = [];
            let idInstitution;

            for(let u of res.projets){
              //supprimer l'historique de la liste
              if(this.filtreProjet){
                if(this.filtreProjet.indexOf(u.id) === -1){
                  delete u.security['shared_history'];

                  if(u.partenaire && u.partenaire != ''){
                    if(isDefined(partenaireIndex[u.partenaire])){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 2);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 3);
                      idInstitution = res.partenaires[partenaireIndex[u.partenaire]].id;
                    }else{
                      for(let i=0; i < res.partenaires.length; i++){
                        if(res.partenaires[i].id == u.partenaire){
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                          u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                          partenaireIndex[u.partenaire] = i;
                          idInstitution = res.partenaires[i].id;
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
      
      
                  projetsData.push({id: u.id, idInstitution: idInstitution, ...u.formData, ...u.formioData, ...u.security});
    
                }
              }else{
                delete u.security['shared_history'];

                if(u.partenaire && u.partenaire != ''){
                  if(isDefined(partenaireIndex[u.partenaire])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 2);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 3);
                    idInstitution = res.partenaires[partenaireIndex[u.partenaire]].id;
                  }else{
                    for(let i=0; i < res.partenaires.length; i++){
                      if(res.partenaires[i].id == u.partenaire){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                        partenaireIndex[u.partenaire] = i;
                        idInstitution = res.partenaires[i].id;
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
    
    
                projetsData.push({id: u.id, idInstitution: idInstitution, ...u.formData, ...u.formioData, ...u.security});
  
              }
            }
  
            //this.projetsData = [...datas];
  
            this.loading = false;
            if(this.mobile){
              this.projetsData = projetsData;
              this.projetsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allProjetsData = [...this.projetsData];

            } else {
              //si non mobile ou mobile + mode tableau et 
              let expor = global.peutExporterDonnees;
                if(this.filtreProjet){
                  expor = false;
                }
              $('#projet-partenaire').ready(()=>{
                if(global.langue == 'en'){
                  this.projetHTMLTable = createDataTable("projet-partenaire", this.colonnes, projetsData, null, this.translate, expor);
                }else{
                  this.projetHTMLTable = createDataTable("projet-partenaire", this.colonnes, projetsData, global.dataTable_fr, this.translate, expor);
                }
                this.attacheEventToDataTable(this.projetHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.loading = false;
          this.projets = [];
          this.projetsData = [];
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
        this.servicePouchdb.findRelationalDocByType('projet', deleted, archived, shared).then((res) => {
          //console.log(res)
          if(res && res.projets){
            //this.projets = [...projets];
            //this.projetsData = [];
            let projetsData = [];
            //var datas = [];
            let partenaireIndex = [];
            let idInstitution;

            for(let u of res.projets){
              //supprimer l'historique de la liste
              delete u.security['shared_history'];
  
              if(u.partenaire && u.partenaire != ''){
                if(isDefined(partenaireIndex[u.partenaire])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.numero, 2);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[partenaireIndex[u.partenaire]].formData.nom, 3);
                  idInstitution = res.partenaires[partenaireIndex[u.partenaire]].id;
                }else{
                  for(let i=0; i < res.partenaires.length; i++){
                    if(res.partenaires[i].id == u.partenaire){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroInstitution', res.partenaires[i].formData.numero, 2);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomInstitution', res.partenaires[i].formData.nom, 3);
                      partenaireIndex[u.partenaire] = i;
                      idInstitution = res.partenaires[i].id;
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
  
  
              projetsData.push({id: u.id, idInstitution: idInstitution, ...u.formData, ...u.formioData, ...u.security});
            }  

            //this.projetsData = [...datas];
  
            this.loading = false;
            if(this.mobile){
              this.projetsData = projetsData;
              this.projetsData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allProjetsData = [...this.projetsData];
            } else {
              //si non mobile ou mobile + mode tableau et 
              $('#projet').ready(()=>{
                if(global.langue == 'en'){
                  this.projetHTMLTable = createDataTable("projet", this.colonnes, projetsData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.projetHTMLTable = createDataTable("projet", this.colonnes, projetsData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.projetHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.loading = false;
          this.projets = [];
          this.projetsData = [];
          console.log(err)
        });
      }
      
    }
  
    

    getInstitution(){
      this.servicePouchdb.findRelationalDocByTypeAndDeleted('partenaire', false).then((res) => {
        if(res && res.partenaires){
          //this.partenaires = [...partenaires];
          this.institutionData = [];
          //var datas = [];
          for(let f of res.partenaires){
            //set mon institution par defaut si ajout
            this.institutionData.push({id: f.id, numero: f.formData.numero, nom: f.formData.nom});

            if(!this.doModification && !this.idPartenaire && f.formData.monInstitution){
              this.setSelect2DefaultValue('idInstitution', f.id);
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

          if(this.doModification){
            this.setSelect2DefaultValue('idInstitution', this.unProjet.idInstitution);
          }else if(this.idPartenaire){
            this.setSelect2DefaultValue('idInstitution', this.idPartenaire);
            $('#idInstitution select').ready(()=>{
              $('#idInstitution select').attr('disabled', true)
            });
          }
          
        }
      }).catch((err) => {
        this.institutionData = [];
        console.log(err)
      });
    }

    setCodeAndNomInstitution(idInstitution){
      if(idInstitution && idInstitution != ''){
        for(let f of this.institutionData){
          if(idInstitution == f.id){
            this.projetForm.controls.numeroInstitution.setValue(f.numero);
            this.projetForm.controls.nomInstitution.setValue(f.nom);
            break;
          }
        }
      }else{
        this.projetForm.controls.numeroInstitution.setValue(null);
        this.projetForm.controls.nomInstitution.setValue(null);
      }
    }
  
   

    attacheEventToDataTable(datatable){
      var self = this;
      var id = 'projet-datatable';
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
        console.log(this.projetHTMLTable.datatable.row(this).data());
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
      //numéro projet
      this.translate.get('PROJET_PAGE.MESSAGES_VALIDATION.NUMERO.REQUIRED').subscribe((res: string) => {
        this.messages_validation.numero[0].message = res;
      });
      
      this.translate.get('PROJET_PAGE.MESSAGES_VALIDATION.NUMERO.UNIQUENUMEROPARTENAIRE').subscribe((res: string) => {
        this.messages_validation.numero[1].message = res;
      });
  
      //nom projet
      this.translate.get('PROJET_PAGE.MESSAGES_VALIDATION.NOM.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });


       //numero fédération
       this.translate.get('PROJET_PAGE.MESSAGES_VALIDATION.NUMERO_INSTITUTION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idInstitution[0].message = res;
      });

      this.translate.get('PROJET_PAGE.MESSAGES_VALIDATION.DATE_DEBUT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.dateDebut[0].message = res;
      });
      

      this.translate.get('PROJET_PAGE.MESSAGES_VALIDATION.DATE_FIN.REQUIRED').subscribe((res: string) => {
        this.messages_validation.dateFin[0].message = res;
      });

      //autre type domaine
      /*this.translate.get('PROJET_PAGE.MESSAGES_VALIDATION.DOMAINE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.domaine[0].message = res;
      });*/

    }
  
    
    dataTableAddRow(rowData){
 
      $('#projet-dataTable').ready(() => {
        this.projetHTMLTable.datatable.row.add(rowData).draw();
      });
      
    }
  
    dataTableUpdateRow(/*index, */rowData){

      $('#projet-dataTable').ready(() => {
        this.projetHTMLTable.datatable.row('.selected').data(rowData).draw();
      });
      
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      $('#projet-dataTable').ready(() => {
        this.projetHTMLTable.datatable.rows('.selected').remove().draw();
      });

    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.projetHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.projetHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.projetHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    if(this.projetHTMLTable && this.projetHTMLTable.datatable){
      //var id = 'projet-datatable';

      var self = this;
      //$('#'+id+' thead tr:eq(1)').show();

      //$(self.projetHTMLTable.datatable.table().header() ).children(1).show();
      $(self.projetHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
      this.recherchePlus = true;
    }
  }

  dataTableRemoveRechercheParColonne(){
    //var id = 'projet-datatable';
    var self = this;

    //$('#'+id+' thead tr:eq(1)').hide();
    //$(self.projetHTMLTable.datatable.table().header() ).children(1).hide();
    $(self.projetHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'projet-datatable';
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
      $( self.projetHTMLTable.datatable.table().footer() ).show();
      this.projetHTMLTable.datatable.columns().every( function () {
          i = i +1;
          //console.log("data-header=" +$(self.projetHTMLTable.datatable.table().header()).children(0).children(0)[1].firstChild.nodeValue)
          var column = this;
          //console.log($(column.header())[0].firstChild.nodeValue)
          var select = $('<select id="'+id+i+'" data-header="'+$(column.header())[0].firstChild.nodeValue+'" placeholder="'+self.translate.instant('GENERAL.FILTRER')+'" class="form-control form-control-sm" multiple data-language="'+lang+'" data-selected-text-format="count" data-width="100%" data-live-search="true" data-size="3" data-actions-box="true" data-container="body"></select>')
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
                  
                  var info = self.projetHTMLTable.datatable.page.info();
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
          /*$( self.projetHTMLTable.datatable.table().footer() ).children(0).each( function (i) {
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

      this.projetHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
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
      $( self.projetHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }

  dataTableRemoveCustomFiltre(){
    var id = 'projet-datatable';
    var self = this;
    //$('#'+id+' tfoot').hide();
    $( self.projetHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }


    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        ///let u = [...this.projetsData]
        this.projetsData = this.allProjetsData.filter((item) => {
          return item.numero.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.projetData = temp;
      
    }
    
    /*async close(){
      await this.modalController.dismiss();
    }*/
    
    async close(){
      await this.modalController.dismiss({filtreProjet: this.filtreProjet});
    }

    async valider() {
      //this.filtreProjet = [];
      this.filtreProjet = this.filtreProjet.concat(this.selectedIndexes);

      await this.modalController.dismiss({filtreProjet: this.filtreProjet});
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
