import { Component, OnInit, Input  } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
//import { opValidator } from '../../validators/membre.validator';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { AlertController, Platform, ToastController, ModalController, ActionSheetController, PopoverController } from '@ionic/angular';
import { ActionComponent } from '../../component/action/action.component';
import { RelationsMembreComponent } from '../../component/relations-membre/relations-membre.component';
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
import { CorpImageComponent } from 'src/app/component/corp-image/corp-image.component';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import JsBarcode from 'jsbarcode';
//import shortid from 'shortid';
import { Crop } from '@ionic-native/crop/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { OpPage } from '../op/op.page';
import { ActionAvatarComponent } from 'src/app/component/action-avatar/action-avatar.component';
import { CameraComponent } from 'src/app/component/camera/camera.component';

import {customAlphabet} from 'nanoid';
import { EssaiPage } from 'src/app/recherche/essai/essai.page';
import { ChampPage } from '../champ/champ.page';
//Speed: 1000 IDs per hour/second
//~919 years needed, in order to have a 1% probability of at least one collision.
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)


//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
declare var $: any;
declare var cordova: any;


@Component({
  selector: 'app-membre',
  templateUrl: './membre.page.html',
  styleUrls: ['./membre.page.scss'],
})
export class MembrePage implements OnInit {
  @Input() idMembre: string;
  @Input() idPartenaire: string;
  @Input() idUnion: string;
  @Input() idOp: string;

  membreForm: FormGroup;
  base64Image: any;
  imageProfile: any;
  photoSupprimer: boolean = false;
  action: string = 'liste';
  cacheAction: string = 'liste';
  membres: any = [];
  membresData: any = [];
  allMembresData: any = [];
  professionsData: any = [];
  ethniesData: any = [];
  paysData: any = [];
  regionData: any = [];
  departementData: any = [];
  communeData: any = [];
  localiteData: any = [];
  federationData: any = [];
  unionData: any = [];
  opData: any = [];
  niveauChoix: any = [];

  /**A completer */
  sexes: any = [];
  etatCivils: any = [];
  educations: any = [];

  unMembre: any;
  unMembreDoc: any;
  membreHTMLTable: any;
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
  age: any;

  colonnes = ['nom', 'prenom', 'matricule', 'surnom', 'dateNaissance', 'sexe', 'nomPays', 'codePays', 'nomRegion', 'codeRegion', 'nomDepartement', 'codeDepartement', 'nomCommune', 'codeCommune', 'nomLieuHabitation', 'codeLieuHabitation', 'etatCivil', 'ethnie', 'niveau','nomFederation', 'numeroFederation', 'nomUnion', 'numeroUnion', 'nomOp', 'numeroOp', 'profession', 'education', 'telephone', 'email']

  messages_validation = {
    'matricule': [
      { type: 'required', message: '' },
      { type: 'uniqueNumeroMembre', message: '' }
    ],
    'nom': [
      { type: 'required', message: '' }
    ],
    'prenom': [
      { type: 'required', message: '' }
    ],
    'sexe': [
      { type: 'required', message: '' }
    ],
    'etatCivil': [
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
    'idOp': [
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
    'idLieuHabitation': [
      { type: 'required', message: '' }
    ]
   
  }

  
    constructor(private formBuilder: FormBuilder, public sanitizer: DomSanitizer, private platform: Platform, private crop: Crop, private camera: Camera, private photoViewer: PhotoViewer, private modalController: ModalController, private geolocation: Geolocation, private file: File, private popoverController: PopoverController, private translate: TranslateService, private servicePouchdb: PouchdbService, public alertCtl: AlertController, private toastCtl: ToastController, public actionSheetCtl: ActionSheetController) {
      this.translate.setDefaultLang(global.langue);

    }
  
    ngOnInit() {
      //au cas où la membre est en mode modal, on chercher info region
      this.translateLangue();
      this.getMembre();
      this.translateChoixNiveau();
      this.translateSexe();
      this.translateEtatCivil();
      this.translateEducation();
    }


    onFileChange(event) {
      if(event.target.files && event.target.files.length > 0) {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if(file.type.indexOf('image') === -1){
            alert(this.translate.instant('GENERAL.MESSAGE_IMAGE_INVALIDE'))
            this.clearFile();
          }else{
            var avatar = document.getElementById('crop-avatar') as any;
            avatar.src = reader.result;
            $('#crop-avatar').attr('data-src', reader.result)
            this.getCrop(reader.result)
          }
        };
      }
    }
    clearFile() {
      var avatar = document.getElementById('crop-avatar') as HTMLImageElement;
      var fileInput = document.getElementById('fileInput') as HTMLInputElement;
      avatar.src = './assets/img/avatar_2x.png';
      $('#crop-avatar').attr('data-src', './assets/img/avatar_2x.png')
      fileInput.value = '';
      this.base64Image = null;
    }

    
    async avatarAction(ev: any/*, numeroMembre*/) {
      const popover = await this.popoverController.create({
        component: ActionAvatarComponent,
        event: ev,
        translucent: true,
        componentProps: {
          photo: this.unMembre.photo,
          b: this.base64Image,
          s: this.photoSupprimer,
        },
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'camera') {
          if(global.mobile){
            this.pickImage(this.camera.PictureSourceType.CAMERA);
          }else{
            this.getCamera();
          } 
        }else if(dataReturned !== null && dataReturned.data == 'gellerie') {
          if(global.mobile){
            this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
          }else{
            $("#fileInput").ready(() => {
              $("#fileInput").click();
            })
          }
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          this.supprimerAvatar();
          this.photoSupprimer = true;
        }
  
      });
      return await popover.present();
    }

    async supprimerAvatar(){
      const alert = await this.alertCtl.create({
        header: this.translate.instant('GENERAL.ALERT_CONFIERMER'),
        message: this.translate.instant('GENERAL.ALERT_MESSAGE_PROFILE'),
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
              this.clearFile();
            }
          }
        ]
      });
  
      await alert.present();
    }

    async getCamera(){
      const modal = await this.modalController.create({
        component: CameraComponent,
        mode: 'ios',
        backdropDismiss: false
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((res : any) => {
        if(res.data && res.data != 'close'){
          var avatar = document.getElementById('crop-avatar') as any;
          avatar.src = res.data.imageBase64;
          $('#crop-avatar').attr('data-src', res.data.imageBase64);
          //this.base64Image = res.data.imageBase64;
          this.getCrop(res.data.imageBase64)
        }else{
          this.clearFile();
        }
      });

      return await modal.present();
    }

    photo(){
      var width = 320;    // We will scale the photo width to this
      var height = 0;     // This will be computed based on the input stream

      var streaming = false;

      var video = null;
      var canvas = null;
      //var photo = null;
      var startbutton = null;
      var self = this;
      video = document.getElementById('video');
      canvas = document.getElementById('canvas');
      //photo = document.getElementById('photo');
      startbutton = document.getElementById('startbutton');

      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(function(stream) {
          video.srcObject = stream;
          video.play();
      })
      .catch(function(err) {
          console.log("An error occurred: " + err);
      });

      video.addEventListener('canplay', function(ev){
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth/width);
        
          video.setAttribute('width', width);
          video.setAttribute('height', height);
          canvas.setAttribute('width', width);
          canvas.setAttribute('height', height);
          streaming = true;
        }
      }, false);
      
      startbutton.addEventListener('click', function(ev){
        var context = canvas.getContext('2d');
        if (width && height) {
          canvas.width = width;
          canvas.height = height;
          context.drawImage(video, 0, 0, width, height);
        
          var data = canvas.toDataURL(/*'image/png'*/);
          var avatar = document.getElementById('crop-avatar') as any;
          avatar.src = data;
          $('#crop-avatar').attr('data-src', data)
          self.getCrop(data)

          //photo.setAttribute('src', data);
          video.pause();
          video.src = "";
          video.srcObject.getTracks()[0].stop();
          canvas.src = "";
        } else {
          var context = canvas.getContext('2d');
          context.fillStyle = "#AAA";
          context.fillRect(0, 0, canvas.width, canvas.height);
      
          var data = canvas.toDataURL(/*'image/png'*/);

          var avatar = document.getElementById('crop-avatar') as any;
          avatar.src = data;
          $('#crop-avatar').attr('data-src', data)
          self.getCrop(data)

          //photo.setAttribute('src', data);
          video.pause();
          video.src = "";
          video.srcObject.getTracks()[0].stop();
          canvas.src = "";
        }
        ev.preventDefault();
      }, false);
      /*var video = document.getElementById('video');
      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', '');
      video.style.width = '200px';
      video.style.height = '200px';

      var facingMode = "user"; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
      var constraints = {
        audio: false,
        video: {
        facingMode: facingMode
        }
      };

      navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
        video.srcObject = stream;
      });*/
    }


    pickImage(sourceType) {
      //sourceType =
      //this.camera.PictureSourceType.PHOTOLIBRARY
      //this.camera.PictureSourceType.CAMERA
      const options: CameraOptions = {
        quality: 100,
        sourceType: sourceType,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }

      this.camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64 (DATA_URL):
        // let base64Image = 'data:image/jpeg;base64,' + imageData;
        this.cropMobleImage(imageData).then(
          newImage => {
            console.log('new image path is: ' + newImage);
            this.showCroppedImage(newImage.split('?')[0]);
          },
          error => console.error('Erreur croppage image', error)
        )
      }, (err) => {
        console.error('Erreur caméra', err)
      });
    }

    showCroppedImage(ImagePath) {
      //this.isLoading = true;
      var copyPath = ImagePath;
      var splitPath = copyPath.split('/');
      var imageName = splitPath[splitPath.length - 1];
      var filePath = ImagePath.split(imageName)[0];
  
      this.file.readAsDataURL(filePath, imageName).then(base64 => {
        var avatar = document.getElementById('crop-avatar') as any;
        avatar.src = base64;
        $('#crop-avatar').attr('data-src', base64);
        this.base64Image = base64;
        //this.isLoading = false;
      }, error => {
        alert('Erreur affichage image' + error);
        //this.isLoading = false;
      });
    }
  

    tackImage(){
      const options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }
      
      this.camera.getPicture(options).then((imageData) => {
       let base64Image = 'data:image/jpeg;base64,' + imageData;
      }, (err) => {
       console.log(err);
      });
    }

    viewPhoto(id){
      //if(!this.mobile){
        $('#'+id).lightGallery({selector: 'this'});
      /*}else{
        //'data:image/jpeg;base64,'
        var url;
        var avatar = document.getElementById(id) as HTMLImageElement;
        if(avatar.src.indexOf('blob:') !== -1){
          url = avatar.src.substring(avatar.src.indexOf(':') +1, avatar.src.length)
        }else{
          url = avatar.src
        }

        this.photoViewer.show(url, this.translate.instant('GENERAL.MESSAGE_PARTAGER_IMAGE'), {share: true, copyToReference: this.platform.is('ios')});
      }*/
    }

    async selectImage() {
      const actionSheet = await this.actionSheetCtl.create({
        header: "Select Image source",
        buttons: [{
          text: 'Load from Library',
          handler: () => {
            this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.pickImage(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
        ]
      });
      await actionSheet.present();
    }
  

    async getCrop(base64Image) {
      
      const modal = await this.modalController.create({
        component: CorpImageComponent,
        componentProps: { image: base64Image },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });

      modal.onWillDismiss().then((res : any) => {
        if(res.data && res.data != 'close'){
          var avatar = document.getElementById('crop-avatar') as any;
          avatar.src = res.data.cropURL;
          $('#crop-avatar').attr('data-src', res.data.cropURL);
          this.base64Image = res.data.cropURL;
          //console.log(this.base64Image)
          //avatar.attr ['data-src'] = res.data.cropURL;
        }else{
          this.clearFile();
        }
      });
      return await modal.present();
    }

    cropMobleImage(url){
      return this.crop.crop(url, { quality: 100});
    }

    
    translateChoixNiveau(){
      for(let i = 1; i <= 2; i++){
        this.translate.get('MEMBRE_PAGE.CHOIXNIVEAU.'+i).subscribe((res: string) => {
          this.niveauChoix.push({id: i, val: res});
        });
      }
    }

    translateSexe(){
      for(let i = 1; i <= 2; i++){
        this.translate.get('MEMBRE_PAGE.SEXES.'+i).subscribe((res: string) => {
          this.sexes.push({id: i, val: res});
        });
      }
    }

    translateEtatCivil(){
      for(let i = 1; i <= 6; i++){
        this.translate.get('MEMBRE_PAGE.ETATCIVILS.'+i).subscribe((res: string) => {
          this.etatCivils.push({id: i, val: res});
        });
      }
    }

    translateEducation(){
      for(let i = 1; i <= 8; i++){
        this.translate.get('MEMBRE_PAGE.EDUCATIONS.'+i).subscribe((res: string) => {
          this.educations.push({id: i, val: res});
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
        this.actualiserTableau(this.membresData);
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
      if(this.membreForm.get(filedName).errors && (this.membreForm.get(filedName).dirty || this.membreForm.get(filedName).touched)){
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
      if(this.membreForm.get(filedName).errors){
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
          self.membreForm.controls[id].setValue(e.params.data.id)
          if(id == 'idProfession'){
            self.setNomProfession(self.membreForm.value[id]);
          }else if(id == 'idEthnie'){
            self.setNomEthnie(self.membreForm.value[id]);
          }else if(id == 'idPays'){
            self.regionData = [];
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setCodeAndNomPays(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idRegion'){
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setCodeAndNomRegion(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idDepartement'){
            self.communeData = [];
            self.localiteData = [];
            self.setCodeAndNomDepartement(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idCommune'){
            self.localiteData = [];
            self.setCodeAndNomCommune(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idLieuHabitation'){  
            self.setCodeAndNomLocalite(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idFederation'){
            self.setNumeroAndNomFederation(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idUnion'){
            self.setNumeroAndNomUnion(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idOp'){
            self.setNumeroAndNomOp(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'niveau'){
            //self.setSelect2DefaultValue('numeroFederation', null);
            //self.setSelect2DefaultValue('numeroUnion', null);
            //self.setSelect2DefaultValue('idFederation', null);
            self.membreForm.controls.idFederation.setValue(null);
            self.membreForm.controls.numeroFederation.setValue(null);
            self.membreForm.controls.nomFederation.setValue(null);
            self.federationData = [];

            //self.setSelect2DefaultValue('idUnion', null);
            self.membreForm.controls.idUnion.setValue(null);
            self.membreForm.controls.numeroUnion.setValue(null);
            self.membreForm.controls.nomUnion.setValue(null);
            self.unionData = [];

            //self.setSelect2DefaultValue('idOp', null);
            self.membreForm.controls.idOp.setValue(null);
            self.membreForm.controls.numeroOp.setValue(null);
            self.membreForm.controls.nomOp.setValue(null);
            self.opData = [];

            //self.getFederation();


            if(self.membreForm.value[id] == 1/* && !self.federationData.length*/){
              self.getFederation();
              //self.getUnion();
            }/* else if(self.membreForm.value[id] == 2){
              self.federationData = [];
              self.unionData = [];
              self.opData = [];
              self.membreForm.controls.idFederation.setValue(null);
              self.membreForm.controls.numeroFederation.setValue(null);
              self.membreForm.controls.nomFederation.setValue(null);
              self.getUnionParFederation(null);
            }*/

            self.setSelectRequredError(id, id)
          }else if(id == 'sexe'){
            self.setSelectRequredError(id, id);
          }else if(id == 'etatCivil'){
            self.setSelectRequredError(id, id);
          }
          
        });

        $('#'+id+' select').on("select2:unselect", function (e) { 
          self.membreForm.controls[id].setValue(null); 
          if(id == 'idEthnie'){
            self.membreForm.controls.idEthnie.setValue(null);
            self.membreForm.controls.ethnie.setValue(null);
          }else if(id == 'idProfession'){
            self.membreForm.controls.idProfession.setValue(null);
            self.membreForm.controls.profession.setValue(null);
          }else if(id == 'idPays'){
            self.regionData = [];
            self.departementData = [];
            self.communeData = [];
            self.localiteData = [];
            self.setCodeAndNomPays(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
            self.membreForm.controls.idEthnie.setValue(null);
            self.membreForm.controls.ethnie.setValue(null);
          }else if(id == 'idRegion'){
            self.departementData = [];
            self.communeData = [];
            self.localiteData = []
            self.setCodeAndNomRegion(self.membreForm.value[id]);;
            self.setSelectRequredError(id, id)
          }else if(id == 'idDepartement'){
            self.communeData = [];
            self.localiteData = [];
            self.setCodeAndNomDepartement(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idCommune'){
            self.localiteData = [];
            self.setCodeAndNomCommune(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idLieuHabitation'){
            self.setCodeAndNomLocalite(self.membreForm.value[id]);
            self.setSelectRequredError(id, id)
          }else if(id == 'idFederation'){
            self.membreForm.controls.idFederation.setValue(null);
            self.membreForm.controls.numeroFederation.setValue(null);
            self.membreForm.controls.nomFederation.setValue(null);

            self.membreForm.controls.idUnion.setValue(null);
            self.membreForm.controls.numeroUnion.setValue(null);
            self.membreForm.controls.nomUnion.setValue(null);

            self.membreForm.controls.idOp.setValue(null);
            self.membreForm.controls.numeroOp.setValue(null);
            self.membreForm.controls.nomOp.setValue(null);
            //self.setSelect2DefaultValue('numeroUnion', null);
            self.unionData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'idUnion'){
            self.membreForm.controls.idUnion.setValue(null);
            self.membreForm.controls.numeroUnion.setValue(null);
            self.membreForm.controls.nomUnion.setValue(null);

            self.membreForm.controls.idOp.setValue(null);
            self.membreForm.controls.numeroOp.setValue(null);
            self.membreForm.controls.nomOp.setValue(null);
            self.setSelectRequredError(id, id);
          }else if(id == 'idOp'){
            self.membreForm.controls.idOp.setValue(null);
            self.membreForm.controls.numeroOp.setValue(null);
            self.membreForm.controls.nomOp.setValue(null);
            self.setSelectRequredError(id, id);
          }else if(id == 'niveau'){
            self.setSelect2DefaultValue('idFederation', null);
            self.membreForm.controls.idFederation.setValue(null);
            self.membreForm.controls.numeroFederation.setValue(null);
            self.membreForm.controls.nomFederation.setValue(null);
            self.federationData = [];

            self.setSelect2DefaultValue('idUnion', null);
            self.membreForm.controls.idUnion.setValue(null);
            self.membreForm.controls.numeroUnion.setValue(null);
            self.membreForm.controls.nomUnion.setValue(null);
            self.unionData = [];

            self.setSelect2DefaultValue('idOp', null);
            self.membreForm.controls.idOp.setValue(null);
            self.membreForm.controls.numeroOp.setValue(null);
            self.membreForm.controls.nomOp.setValue(null);
            self.opData = [];
            self.setSelectRequredError(id, id);
          }else if(id == 'sexe'){
            self.setSelectRequredError(id, id);
            //self.membreForm.controls.sexe.setValue(null);
          }else if(id == 'etatCivil'){
            self.setSelectRequredError(id, id);
            //self.membreForm.controls.etatCivil.setValue(null);
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
      //this.membreForm = null;
      this.membreForm = this.formBuilder.group({
        matricule: [nanoid(), Validators.required],
        nom: [null, Validators.required],
        prenom: [null, Validators.required],
        surnom: [null],
        dateNaissance: [null],
        age: [null],
        sexe: [null, Validators.required],

        //lieu d'abitation
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
        nomLieuHabitation: [null, Validators.required],
        codeLieuHabitation: [null, Validators.required],
        idLieuHabitation: [null, Validators.required],

        etatCivil: [null, Validators.required],
        ethnie: [null],
        idEthnie: [null],

        niveau: ['1', Validators.required],
        nomFederation: [null, Validators.required],
        numeroFederation: [null, Validators.required],
        idFederation: [null, Validators.required],
        nomUnion: [null, Validators.required],
        numeroUnion: [null, Validators.required],
        idUnion: [null, Validators.required],
        nomOp: [null, Validators.required],
        numeroOp: [null, Validators.required],
        idOp: [null, Validators.required],
        
        profession: [null],
        idProfession: [null],
        education: [null],
        telephone: [null],
        email: [null],
        adresse: [null],
      });

      this.validerNumero();
      //console.log(uniqid.time().toString())
      
      /*do{
        //exclure le _ et -
        this.membreForm.controls.matricule.setValue(shortid.generate());
      }while(this.membreForm.controls.matricule.value.indexOf('_') !== -1 || this.membreForm.controls.matricule.value.indexOf('-') !== -1)
      */

      $('#barcode').ready(() => {
        JsBarcode('#barcode', this.membreForm.controls.matricule.value, {height: 50});
      });

      /*this.membreForm.valueChanges.subscribe(change => {
        this.membreForm.get('matricule').setValidators([opValidator.uniqueNumeroMembre(this.membresData, 'ajouter'), Validators.required]);
      });

      this.membreForm.valueChanges.subscribe(change => {
        this.membreForm.get('numeroUnion').setValidators([opValidator.requireUnion(this.membreForm.controls.niveau.value)]);
      });*/
    }
  
    editForm(oDoc){
      let membre = oDoc.membres[0];
      let idFederation;
      let numeroFederation;
      let nomFederation;
      let idUnion;
      let numeroUnion;
      let nomUnion;
      let idOp;
      let numeroOp;
      let nomOp;
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
      let idLieuHabitation;
      let idProfession;
      let profession;
      let idEthnie;
      let ethnie;
      let codeLieuHabitation;
      let nomLieuHabitation;
      let age;

      if(oDoc.partenaires && oDoc.partenaires[0]){
        idFederation = oDoc.partenaires[0].id;
        numeroFederation = oDoc.partenaires[0].formData.numero;
        nomFederation = oDoc.partenaires[0].formData.nom;
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
        idLieuHabitation = oDoc.localites[0].id;
        codeLieuHabitation = oDoc.localites[0].formData.code;
        nomLieuHabitation = oDoc.localites[0].formData.nom;
      }

      if(oDoc.professions && oDoc.professions[0]){
        idProfession = oDoc.professions[0].id;
        profession = oDoc.professions[0].formData.nom;
      }

      if(oDoc.ethnies && oDoc.ethnies[0]){
        idEthnie = oDoc.ethnies[0].id;
        ethnie = oDoc.ethnies[0].formData.nom;
      }

      if(membre.formData.dateNaissance && membre.formData.dateNaissance != ''){
        let now =new Date();
        let date_naiss = new Date(membre.formData.dateNaissance);
        age = now.getFullYear() - date_naiss.getFullYear();
      }

      //this.membreForm = null;
      let u = membre.formData
      this.membreForm = this.formBuilder.group({
        matricule: [u.matricule, Validators.required],
        nom: [u.nom, Validators.required],
        prenom: [u.prenom, Validators.required],
        surnom: [u.surnom],
        dateNaissance: [u.dateNaissance],
        age: [age],
        sexe: [u.sexe, Validators.required],

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
        nomLieuHabitation: [nomLieuHabitation, Validators.required],
        codeLieuHabitation: [codeLieuHabitation, Validators.required],
        idLieuHabitation: [idLieuHabitation, Validators.required],

        etatCivil: [u.etatCivil, Validators.required],
        ethnie: [ethnie],
        idEthnie: [idEthnie],
        
        niveau: [u.niveau, Validators.required],
        nomFederation: [nomFederation],
        numeroFederation: [numeroFederation],
        idFederation: [idFederation],
        nomUnion: [nomUnion], 
        numeroUnion: [numeroUnion],
        idUnion: [idUnion],
        nomOp: [nomOp],
        numeroOp: [numeroOp],
        idOp: [idOp],  

        profession: [profession],
        idProfession: [idProfession],
        education: [u.education],
        telephone: [u.telephone],
        email: [u.email],
        adresse: [u.adresse],
        
        
      });

      this.validerNumero();
      $('#barcode').ready(() => {
        JsBarcode('#barcode', this.membreForm.controls.matricule.value, {height: 50});
      });

      $('#crop-avatar').ready(() => {
        $('#crop-avatar').attr('src', this.unMembre.photo);
        $('#crop-avatar').attr('data-src', this.unMembre.photo);
      });

      /*if(this.imageProfile && this.imageProfile != ''){
        $('#crop-avatar').ready(() => {
          $('#crop-avatar').attr('src', this.imageProfile);
          $('#crop-avatar').attr('data-src', this.imageProfile);
        });
      }else{
        this.servicePouchdb.getRelationalDocAttachment('membre', membre.id, 'avatar').then((res) => {
          if(res && res != ''){
            $('#crop-avatar').ready(() => {
              $('#crop-avatar').attr('src', res);
              $('#crop-avatar').attr('data-src', res);
            });
            this.imageProfile = res;
          }else{
            $('#crop-avatar').ready(() => {
              $('#crop-avatar').attr('src', './assets/img/avatar_2x.png');
              $('#crop-avatar').attr('data-src', './assets/img/avatar_2x.png');
            });

            this.imageProfile = null;
          }
        }).catch((err) => {
          $('#crop-avatar').ready(() => {
            $('#crop-avatar').attr('src', './assets/img/avatar_2x.png');
            $('#crop-avatar').attr('data-src', './assets/img/avatar_2x.png');
          });
          this.imageProfile = null;
          console.log(err)
        })
      }*/



      /*this.membreForm.valueChanges.subscribe(change => {
        this.membreForm.get('matricule').setValidators([opValidator.uniqueNumeroMembre(this.membresData, 'ajouter'), Validators.required]);
      });

      this.membreForm.valueChanges.subscribe(change => {
        this.membreForm.get('numeroUnion').setValidators([opValidator.requireUnion(this.membreForm.controls.niveau.value)]);
      });*/

    }

    validerNumero(){
      let numeroControl = this.membreForm.controls['matricule'];
      numeroControl.valueChanges.subscribe((value) => {
        this.servicePouchdb.findRelationalDocByTypeAndNumero('membre', value).then((res) => {
          if(res && res.membres && res.membres[0] && (this.action != 'modifier' || (this.action == 'modifier' && value != this.unMembre.matricule))){
            numeroControl.setErrors({uniqueNumeroMembre: true});
          }
        });
      });
/*
      let numeroUnionControl = this.membreForm.controls['numeroUnion'];
      numeroUnionControl.valueChanges.subscribe((value) => {
        if(this.membreForm.controls.niveau.value != '3' && (!numeroUnionControl.value || numeroUnionControl.value == '')){
          numeroUnionControl.setErrors({required: true})
        }
      });


      let numeroFederationControl = this.membreForm.controls['numeroFederation'];
      numeroFederationControl.valueChanges.subscribe((value) => {
        if(this.membreForm.controls.niveau.value == '1' && (!numeroFederationControl.value || numeroFederationControl.value == '')){
          numeroFederationControl.setErrors({required: true})
        }
      });

*/
      let idFederationControl = this.membreForm.controls['idFederation'];
      let idUnionControl = this.membreForm.controls['idUnion'];
      let idOpControl = this.membreForm.controls['idOp'];
      let niveauControl = this.membreForm.controls['niveau'];
      niveauControl.valueChanges.subscribe((value) => {
        if(value == 1 && ((!idFederationControl.value || idFederationControl.value == '') || (!idUnionControl.value || idUnionControl.value == '') || (!idOpControl.value || idOpControl.value == ''))){
          idFederationControl.setValidators(Validators.required);
          this.membreForm.controls['nomFederation'].setValidators(Validators.required);
          this.membreForm.controls['numeroFederation'].setValidators(Validators.required);

          idUnionControl.setValidators(Validators.required);
          this.membreForm.controls['nomUnion'].setValidators(Validators.required);
          this.membreForm.controls['numeroUnion'].setValidators(Validators.required);
          
          idOpControl.setValidators(Validators.required);
          this.membreForm.controls['nomOp'].setValidators(Validators.required);
          this.membreForm.controls['numeroOp'].setValidators(Validators.required);
        }else {
          idFederationControl.clearValidators();
          this.membreForm.controls['nomFederation'].clearValidators();
          this.membreForm.controls['numeroFederation'].clearValidators();

          idUnionControl.clearValidators();
          this.membreForm.controls['nomUnion'].clearValidators();
          this.membreForm.controls['numeroUnion'].clearValidators();

          idOpControl.clearValidators();
          this.membreForm.controls['nomOp'].clearValidators();
          this.membreForm.controls['numeroOp'].clearValidators();
        }
      });  
    }


    setDate(){
      if(this.membreForm.controls['age'].value && this.membreForm.controls['age'].value != ''){
        let age = this.membreForm.controls['age'].value;
        let now: Date = new Date();
        let annee = now.getFullYear() - age;
        this.membreForm.controls.dateNaissance.setValue(new Date(annee, 0, 2).toISOString().slice(0, 10));
      }else{
        this.membreForm.controls.dateNaissance.setValue(null);
      }
      
    }
  
    setAge(){
      if(this.membreForm.controls.dateNaissance.value && this.membreForm.controls.dateNaissance.value != ''){
        let now: Date = new Date();
        let date = new Date(this.membreForm.controls.dateNaissance.value)
        this.membreForm.controls['age'].setValue(now.getFullYear() - date.getFullYear());
      }else{
        this.membreForm.controls['age'].setValue(null);
      }
    }
  
    ajouter(){
      
      this.doModification = false;
      this.base64Image = null;
      if(this.idOp && this.idOp != ''){
        if(this.membreHTMLTable && this.membreHTMLTable.datatable && this.membreHTMLTable.datatable.row(0) && this.membreHTMLTable.datatable.row(0).data()){
          this.idPartenaire = this.membreHTMLTable.datatable.row(0).data().numeroFederation;
          this.idUnion = this.membreHTMLTable.datatable.row(0).data().numeroUnion;
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('op', this.idOp).then((res) => {
            if(res && res.ops){
              this.idPartenaire = res.ops[0].partenaire;
              this.idUnion = res.ops[0].union;
            }
          })
        }
      } else if(this.idUnion && this.idUnion != ''){
        if(this.membreHTMLTable && this.membreHTMLTable.datatable && this.membreHTMLTable.datatable.row(0) && this.membreHTMLTable.datatable.row(0).data()){
          this.idPartenaire = this.membreHTMLTable.datatable.row(0).data().numeroFederation;
        }else{
          this.servicePouchdb.findRelationalDocByTypeAndID('union', this.idUnion).then((res) => {
            if(res && res.unions){
              this.idPartenaire = res.unions[0].partenaire;
            }
          })
        }
      }
      this.getPays();
      this.getProfession();
      //this.getEthnie();
      //this.getFederation();
      //this.getUnion();
      this.initForm();
      this.initSelect2('sexe', this.translate.instant('MEMBRE_PAGE.SEXE'), true);
      this.initSelect2('etatCivil', this.translate.instant('MEMBRE_PAGE.ETATCIVIL'), true);
      this.initSelect2('idEthnie', this.translate.instant('MEMBRE_PAGE.ETHNIE'), true);
      this.initSelect2('idProfession', this.translate.instant('MEMBRE_PAGE.PROFESSION'), true);
      this.initSelect2('education', this.translate.instant('MEMBRE_PAGE.EDUCATION'), true);

      this.initSelect2('niveau', this.translate.instant('MEMBRE_PAGE.NIVEAU'), true);
      this.initSelect2('idFederation', this.translate.instant('UNION_PAGE.SELECTIONFEDERATION'));
      this.initSelect2('idUnion', this.translate.instant('MEMBRE_PAGE.SELECTIONUNION'));
      this.initSelect2('idOp', this.translate.instant('MEMBRE_PAGE.SELECTIONOP'));
      //this.initSelect2('domaine', this.translate.instant('MEMBRE_PAGE.DOMAINE'));
      this.initSelect2('idPays', this.translate.instant('MEMBRE_PAGE.SELECTIONPAYS'));
      this.initSelect2('idRegion', this.translate.instant('MEMBRE_PAGE.SELECTIONREGION'));
      this.initSelect2('idDepartement', this.translate.instant('MEMBRE_PAGE.SELECTIONDEPARTEMENT'));
      this.initSelect2('idCommune', this.translate.instant('MEMBRE_PAGE.SELECTIONCOMMUNE'));
      this.initSelect2('idLieuHabitation', this.translate.instant('MEMBRE_PAGE.SELECTIONLIEUHABITATION'));
      this.setSelect2DefaultValue('niveau', '1')
      
      this.action = 'ajouter';
    }
  
    infos(u){
      if(!this.estModeCocherElemListe){
        this.unMembre = u;
        if(this.unMembre.dateNaissance && this.unMembre.dateNaissance != ''){
          let now: Date = new Date();
          let date = new Date(this.unMembre.dateNaissance);
          this.age = now.getFullYear() - date.getFullYear();
        }else{
          this.age = '';
        }
        
        $('#barcode-infos').ready(() => {
          JsBarcode('#barcode-infos', u.matricule, {height: 50});
        });

        //console.log(u)
        $('#avatar-infos').ready(() => {
          //$('#avatar-infos').attr('src', '');
          //$('#avatar-infos').attr('data-src', '');
          $('#avatar-infos').attr('src', u.photo);
          $('#avatar-infos').attr('data-src', u.photo);
        });

        //si on vient de modofoer le membre le membre et modifier la photo
        /*if(this.imageProfile && this.imageProfile != ''){
          var self = this;
          $('#avatar-infos').ready(() => {
            //$('#avatar-infos').attr('src', '');
            //$('#avatar-infos').attr('data-src', '');
            $('#avatar-infos').attr('src', self.imageProfile);
            $('#avatar-infos').attr('data-src', self.imageProfile);
          });
        }else{
          this.servicePouchdb.getRelationalDocAttachment('membre', u.id, 'avatar').then((res) => {
            //console.log(res)
            if(res && res != ''){
              $('#avatar-infos').ready(() => {
                //$('#avatar-infos').attr('src', '');
                //$('#avatar-infos').attr('data-src', '');
                $('#avatar-infos').attr('src', res);
                $('#avatar-infos').attr('data-src', res);
              });
              //this.imageProfile = res;
            }else{
              $('#avatar-infos').ready(() => {
                $('#avatar-infos').attr('src', './assets/img/avatar_2x.png');
                $('#avatar-infos').attr('data-src', './assets/img/avatar_2x.png');
              });
  
              this.imageProfile = null;
            }
          }).catch((err) => {
            $('#avatar-infos').ready(() => {
              $('#avatar-infos').attr('src', './assets/img/avatar_2x.png');
              $('#avatar-infos').attr('data-src', './assets/img/avatar_2x.png');
            });
            this.imageProfile = null;
            console.log(err)
          })
        }*/
        this.action = 'infos';
      }
    }

  
    modifier(membre){
      //console.log(membre)
      let id;
      if(isObject(membre)){
        id = membre.id;
      }else{
        id = membre;
      }

      this.doModification = true;
      this.photoSupprimer = false;
      this.base64Image = null;
      this.servicePouchdb.findRelationalDocByID('membre', id).then((res) => {
        if(res && res.membres[0]){
          let oDoc = res.membres[0];
          this.getPays();
          this.getProfession();
          //this.getEthnie();
          if(oDoc.pays){
            this.getRegionParPays(oDoc.pays);
            this.getEthnie(oDoc.pays);
          }
    
          if(oDoc.region)
            this.getDepartementParRegion(oDoc.region);
          if(oDoc.departement)
            this.getCommuneParDepartement(oDoc.departement);
          if(oDoc.commune)
            this.getLocaliteParCommune(oDoc.commune);
          
          if(oDoc.formData.niveau == '1'){
            this.getFederation();
            this.getUnionParFederation(oDoc.partenaire)
            this.getOpParUnion(oDoc.union)
            //this.getUnionParFederation(oDoc.numeroFederation);
          }


          this.editForm(res);

          this.initSelect2('sexe', this.translate.instant('MEMBRE_PAGE.SEXE'));
          this.initSelect2('etatCivil', this.translate.instant('MEMBRE_PAGE.ETATCIVIL'));
          this.initSelect2('idEthnie', this.translate.instant('MEMBRE_PAGE.ETHNIE'));
          this.initSelect2('idProfession', this.translate.instant('MEMBRE_PAGE.PROFESSION'));
          this.initSelect2('education', this.translate.instant('MEMBRE_PAGE.EDUCATION'));
          this.initSelect2('niveau', this.translate.instant('MEMBRE_PAGE.NIVEAU'));
          this.initSelect2('idFederation', this.translate.instant('UNION_PAGE.SELECTIONFEDERATION'));
          this.initSelect2('idUnion', this.translate.instant('MEMBRE_PAGE.SELECTIONUNION'));
          this.initSelect2('idOp', this.translate.instant('MEMBRE_PAGE.SELECTIONOP'));
          //this.initSelect2('domaine', this.translate.instant('MEMBRE_PAGE.DOMAINE'));
          this.initSelect2('idPays', this.translate.instant('MEMBRE_PAGE.SELECTIONPAYS'));
          this.initSelect2('idRegion', this.translate.instant('MEMBRE_PAGE.SELECTIONREGION'));
          this.initSelect2('idDepartement', this.translate.instant('MEMBRE_PAGE.SELECTIONDEPARTEMENT'));
          this.initSelect2('idCommune', this.translate.instant('MEMBRE_PAGE.SELECTIONCOMMUNE'));
          this.initSelect2('idLieuHabitation', this.translate.instant('MEMBRE_PAGE.SELECTIONLIEUHABITATION'));
          
          this.setSelect2DefaultValue('niveau', oDoc.formData.niveau);
          this.setSelect2DefaultValue('etatCivil', oDoc.formData.etatCivil);
          this.setSelect2DefaultValue('sexe', oDoc.formData.sexe);
          this.setSelect2DefaultValue('education', oDoc.formData.education);
          /*$('#matricule input').ready(()=>{
            $('#matricule input').attr('disabled', true)
          });*/


          //this.setSelect2DefaultValue('numeroUnion', oDoc.formData.numeroUnion)
          //this.setSelect2DefaultValue('domaine', oDoc.formData.domaine)

          //this.setSelect2DefaultValue('codePays', membre.codePays)
          //this.setSelect2DefaultValue('codeRegion', membre.codeRegion)
          //this.setSelect2DefaultValue('codeDepartement', membre.codeDepartement)
          //this.setSelect2DefaultValue('codeCommune', membre.codeCommune)
          //this.setSelect2DefaultValue('codeLieuHabitation', membre.codeLieuHabitation)
          
          this.unMembreDoc = oDoc;
         
          if(!isObject(membre)){
            for(let u of this.membresData){
              if(u.id == id){
                this.unMembre = u;
                break;
              }
            }
          }else{
            this.unMembre = membre;
          }

          this.action ='modifier';
        }
      }).catch((err) => {
        alert(this.translate.instant('GENERAL.MODIFICATION_IMPOSSIBLE')+': '+err)
      })
      
    }

    getPosition(){
      this.afficheMessage(this.translate.instant('GENERAL.OBTENTION_COORDONNEES'));
      this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
        this.membreForm.controls.latitude.setValue(resp.coords.latitude);
        this.membreForm.controls.longitude.setValue(resp.coords.longitude);
        this.afficheMessage(this.translate.instant('GENERAL.COORDONNEES_OBTENUES'));
      }, err => {
        this.afficheMessage(this.translate.instant('GENERAL.ERREUR_COORDONNEES'));
          console.log(err)
      });
    }
  
    exportPDF(){
      let date =new Date().getTime();
      let blob = new Blob([document.getElementById('membre-datatable').innerHTML], {
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

                this.servicePouchdb.findRelationalDocByID('membre', u.id).then((res) => {
                  res.membres[0].security = this.servicePouchdb.garderDeleteTrace(res.membres[0].security);

                  this.servicePouchdb.updateRelationalDoc(res.membres[0]).then((res) => {
                    //mise à jour de la liste si mobile et mode liste
                    if(this.membresData.indexOf(u) !== -1){
                      this.membresData.splice(this.membresData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant')
                    }

                    this.action = 'liste';

                    if(!this.mobile){
                      //sinion dans le tableau
                      this.dataTableRemoveRows();
                    }else{
                      this.membresData = [...this.membresData];
                      if(this.allMembresData.indexOf(u) !== -1){
                        this.allMembresData.splice(this.allMembresData.indexOf(u), 1);
                      }else{
                        console.log('echec splice, index inexistant dans allMembresData')
                      }
                    }
                  }).catch((err) => {
                    this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                  });//fin update
                  
                }).catch((err) => {
                  this.afficheMessage(this.translate.instant('GENERAL.ALERT_ERREUR_SUPPRESSION')+': '+err.toString());
                });//fin get

              }else{

                this.servicePouchdb.findRelationalDocByID('membre', u.id).then((res) => {
                 this.servicePouchdb.deleteRelationalDocDefinitivement(res.membres[0]).then((res) => {

                  //mise à jour de la liste si mobile et mode liste
                  if(this.membresData.indexOf(u) !== -1){
                    this.membresData.splice(this.membresData.indexOf(u), 1);
                  }else{
                    console.log('echec splice, index inexistant')
                  }

                  this.action = 'liste';
                  if((this.mobile && this.styleAffichage == 'tableau') || !this.mobile){
                    //sinion dans le tableau
                    this.dataTableRemoveRows();
                  }else{
                    this.membresData = [...this.membresData];
                    if(this.allMembresData.indexOf(u) !== -1){
                      this.allMembresData.splice(this.allMembresData.indexOf(u), 1);
                    }else{
                      console.log('echec splice, index inexistant dans allMembresData')
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

    async presentOp(idOp) {
      const modal = await this.modalController.create({
        component: OpPage,
        componentProps: { idOp: idOp },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentUnion(idUnion) {
      const modal = await this.modalController.create({
        component: UnionPage,
        componentProps: { idUnion: idUnion },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async presentFederation(idFederation) {
      const modal = await this.modalController.create({
        component: PartenairePage,
        componentProps: { idPartenaire: idFederation },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    async presentEssais(idMembre){
      const modal = await this.modalController.create({
        component: EssaiPage,
        componentProps: { idMembre: idMembre },
        mode: 'ios',
        cssClass: 'costom-modal',
      });
      return await modal.present();
    }
  
    async presentChamps(idMembre){
      const modal = await this.modalController.create({
        component: ChampPage,
        componentProps: { idMembre: idMembre },
        mode: 'ios',
        cssClass: 'costom-modal',
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
                //var u = this.membresData[i];
                this.servicePouchdb.findRelationalDocByID('membre', id).then((res) => {
                  res.membres[0].security = this.servicePouchdb.garderArchivedTrace(res.membres[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.membres[0]).catch((err) => {
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
                this.membresData = [...this.removeMultipleElem(this.membresData, ids)];
                this.allMembresData = this.removeMultipleElem(this.allMembresData, ids);
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
                this.servicePouchdb.findRelationalDocByID('membre', id).then((res) => {
                  res.membres[0].security = this.servicePouchdb.garderDesarchivedTrace(res.membres[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.membres[0]).catch((err) => {
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
                this.membresData = [...this.removeMultipleElem(this.membresData, ids)]; 
                this.allMembresData = this.removeMultipleElem(this.allMembresData, ids);
                
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
      this.membresData.forEach((u) => {
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
          "estModeCocherElemListe": this.estModeCocherElemListe,
          "dataLength": this.membresData.length,
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
          this.getMembresByType('liste');
        }  else  if(dataReturned !== null && dataReturned.data == 'archives') {
          this.estModeCocherElemListe = false;
          this.getMembresByType('archives');
        }  else  if(dataReturned !== null && dataReturned.data == 'corbeille') {
          this.estModeCocherElemListe = false;
          this.getMembresByType('corbeille');
        }  else  if(dataReturned !== null && dataReturned.data == 'partages') {
          this.estModeCocherElemListe = false;
          this.getMembresByType('partages');
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
       let data = [...this.membresData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_MEMBREs_'+date+'.xls', blob).then(()=> {
           alert(this.translate.instant('GENERAL.ALERT_FICHIER_CREER')+": " + fileDestiny);
       }).catch(()=>{
           alert(this.translate.instant('GENERAL.ALERT_ERREUR_CREAION_FICHIER')+": " + fileDestiny);
       });
     }
   
     exportCSV(){
       let data = [...this.membresData];
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
       this.file.writeFile(fileDestiny, 'FRNA_Export_MEMBREs_'+date+'.csv', blob).then(()=> {
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
          //"dataLength": this.membresData.length,
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
            this.selectedIndexes.push(this.unMembre.id);
          }
          this.modifier(this.selectedIndexes[0]);
          this.decocherTousElemListe();
          this.estModeCocherElemListe = false;
          //this.changerModeCocherElemListe();
        }else  if(dataReturned !== null && dataReturned.data == 'desarchiver') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unMembre.id);
          }
          

          this.desarchivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else  if(dataReturned !== null && dataReturned.data == 'archiver') {
          if(this.action == 'infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unMembre.id);
          }
          

          this.archivageMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        } else  if(dataReturned !== null && dataReturned.data == 'restaurer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unMembre.id);
          }
          

          this.restaurationMultiple(this.selectedIndexes);
          //this.estModeCocherElemListe = false;

        }else if(dataReturned !== null && dataReturned.data == 'derniereModification') {
          this.selectedItemDerniereModification();          
        }else if(dataReturned !== null && dataReturned.data == 'partager') {
          //this.changeStyle();
        }else if(dataReturned !== null && dataReturned.data == 'supprimer') {
          if(this.action =='infos' && !this.selectedIndexes[0]){
            this.selectedIndexes.push(this.unMembre.id);
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
      if(this.membresData.length != this.selectedIndexes.length) {
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
                  this.servicePouchdb.findRelationalDocByID('membre', id).then((res) => {
                    res.membres[0].security = this.servicePouchdb.garderDeleteTrace(res.membres[0].security);
                    this.servicePouchdb.updateRelationalDoc(res.membres[0]).catch((err) => {
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
                  this.membresData = [...this.removeMultipleElem(this.membresData, ids)];
                  this.allMembresData = this.removeMultipleElem(this.allMembresData, ids);
                  
                  //if(this.action != 'infos'){
                    this.estModeCocherElemListe = false;
                    this.decocherTousElemListe();
                  //}
                  //this.action = this.cacheAction;
                }
              }else{

                //suppresion multiple définitive
                for(let id of ids){
                  
                  this.servicePouchdb.findRelationalDocByID('membre', id).then((res) => {
                    this.servicePouchdb.deleteRelationalDocDefinitivement(res.membres[0]).catch((err) => {
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
                  this.membresData = [...this.removeMultipleElem(this.membresData, ids)];
                  this.allMembresData = [...this.removeMultipleElem(this.allMembresData, ids)];

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
                
                this.servicePouchdb.findRelationalDocByID('membre', id).then((res) => {
                  this.servicePouchdb.deleteRelationalDocDefinitivement(res.membres[0]).catch((err) => {
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
                this.membresData = [...this.removeMultipleElem(this.membresData, ids)];
                this.allMembresData = this.removeMultipleElem(this.allMembresData, ids);
                
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
                
                this.servicePouchdb.findRelationalDocByID('membre', id).then((res) => {
                  res.membres[0].security = this.servicePouchdb.garderRestaureTrace(res.membres[0].security);
                  this.servicePouchdb.updateRelationalDoc(res.membres[0]).catch((err) => {
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
                this.membresData = [...this.removeMultipleElem(this.membresData, ids)];
                this.allMembresData = [...this.removeMultipleElem(this.allMembresData, ids)];
                
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
        codes.push(this.unMembre.id);
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
        //this.actualiserTableau(this.membresData);
      }
    }
  
    retour(){
      if(this.action === 'modifier'){
        this.infos(this.unMembre)
        /*this.action = "infos";

        //créer code bar et charger image profile
        $('#barcode-infos').ready(() => {
          JsBarcode('#barcode-infos', this.unMembre.matricule, {height: 50});
        });
        

        if(this.imageProfile && this.imageProfile != ''){
          $('#avatar-infos').ready(() => {
            $('#avatar-infos').attr('src', this.imageProfile);
            $('#avatar-infos').attr('data-src', this.imageProfile);
          });    
        }*/

      }else{
        //this.action = 'liste';
        this.imageProfile = null;
        this.action = this.cacheAction; 
        //recharger la liste
        if(this.rechargerListeMobile){
          this.membresData = [...this.membresData];
          this.rechargerListeMobile = false;
        }
        ///this.actualiserTableau(this.membresData);
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
              this.infos(this.membresData[this.selectedIndexes[0]]);
              //this.selectedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRMEMBRE'));
            }
          }
        }, {
          text: this.translate.instant('GENERAL.MODIFIER'),
          icon: 'create',
          handler: () => {
            if(this.selectedIndexes.length == 1){
              this.modifier(this.membresData[this.selectedIndexes[0]]);
              //this.selectedIndexes = [];
            }else{
              alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRMEMBRE'))
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
            this.infos(this.membresData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRMEMBRE'));
          }*/
        }else if(dataReturned !== null && dataReturned.data == 'modifier') {
          this.selectedItemModifier();
          /*if(this.selectedIndexes.length == 1){
            this.modifier(this.membresData[this.selectedIndexes[0]]);
            this.selectedIndexes = [];
          }else{
            alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRMEMBRE'))
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
          this.getMembresByType('corbeille');
        } else if(dataReturned !== null && dataReturned.data == 'archives') {
          this.getMembresByType('archives');
        } else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getMembresByType('partages');
        } else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          //this.getMembresByType('conflits');
        } else if(dataReturned !== null && dataReturned.data == 'liste') {
          this.getMembresByType('liste');
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
          this.getMembresByType('liste');
        }else if(dataReturned !== null && dataReturned.data == 'partages') {
          this.getMembresByType('partages');
        }else if(dataReturned !== null && dataReturned.data == 'conflits') {
          this.action = 'conflits';
          this.cacheAction = 'conflits';
          this.getMembreWithConflicts();
          //this.getMembre();
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

    getMembreWithConflicts(event = null){
      this.action = 'conflits';
      this.cacheAction = 'conflits';
      this.selectedIndexes = [];
      this.allSelected = false;
      this.recherchePlus = false;
      this.filterAjouter = false;

      this.servicePouchdb.findRelationalDocInConflict('membre').then((res) => {
        if(res){
          let membresData = [];
          let federationIndex = [];
          let unionIndex = [];
          let opIndex = [];
          let professionIndex = [];
          let ethnieIndex = [];
          let paysIndex = [];
          let regionIndex = [];
          let departementIndex = [];
          let communeIndex = [];
          let localiteIndex = [];
          let idFederation, idUnion, idOp, idPays, idRegion, idDepartement, idCommune, idLieuHabitation, idEthnie, idProfession;
          for(let u of res.membres){
            //supprimer l'historique de la liste
            delete u.security['shared_history'];

            this.translate.get('MEMBRE_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
              u.formData.niveau = res;
            });

            this.translate.get('MEMBRE_PAGE.SEXES.'+u.formData.sexe).subscribe((res2: string) => {
              u.formData.sexe = res2;
            });

            this.translate.get('MEMBRE_PAGE.ETATCIVILS.'+u.formData.etatCivil).subscribe((res2: string) => {
              u.formData.etatCivil = res2;
            });

            if(u.formData.education && u.formData.education != ''){
              this.translate.get('MEMBRE_PAGE.EDUCATIONS.'+u.formData.education).subscribe((res2: string) => {
                u.formData.education = res2;
              });
            }
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

            if(u.op && u.op != ''){
              if(isDefined(opIndex[u.op])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[opIndex[u.op]].formData.numero, 8);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[opIndex[u.op]].formData.nom, 9);
                idOp = res.ops[opIndex[u.op]].id;
              }else{
                for(let i=0; i < res.ops.length; i++){
                  if(res.ops[i].id == u.op){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[i].formData.numero, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[i].formData.nom, 9);
                    opIndex[u.op] = i;
                    idOp = res.ops[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', null, 8);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', null, 9);
              idOp = null;
            }

            //chargement des relation des localités
            if(isDefined(paysIndex[u.pays])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 10);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 11);
              idPays = res.pays[paysIndex[u.pays]].id;
            }else{
              for(let i=0; i < res.pays.length; i++){
                if(res.pays[i].id == u.pays){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 11);
                  idPays = res.pays[i].id;
                  paysIndex[u.pays] = i;
                  break;
                }
              }
            }

            if(isDefined(regionIndex[u.region])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 12);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 13);
              idRegion = res.regions[regionIndex[u.region]].id;
            }else{
              for(let i=0; i < res.regions.length; i++){
                if(res.regions[i].id == u.region){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 12);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 13);
                  regionIndex[u.region] = i;
                  idRegion = res.regions[i].id;
                  break;
                }
              }
            }
            
            if(isDefined(departementIndex[u.departement])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 14);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 15);
              idDepartement = res.departements[departementIndex[u.departement]].id;
            }else{
              for(let i=0; i < res.departements.length; i++){
                if(res.departements[i].id == u.departement){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 14);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 15);
                  departementIndex[u.departement] = i;
                  idDepartement = res.departements[i].id;
                  break;
                }
              }
            }
            

            if(isDefined(communeIndex[u.commune])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 16);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 17);
              idCommune = res.communes[communeIndex[u.commune]].id;
            }else{
              for(let i=0; i < res.communes.length; i++){
                if(res.communes[i].id == u.commune){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 16);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 17);
                  communeIndex[u.commune] = i;
                  idCommune = res.communes[i].id;
                  break;
                }
              }
            }

            if(isDefined(localiteIndex[u.localite])){
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[localiteIndex[u.localite]].formData.nom, 18);
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[localiteIndex[u.localite]].formData.code, 19);
              idLieuHabitation = res.localites[localiteIndex[u.localite]].id;
            }else{
              for(let i=0; i < res.localites.length; i++){
                if(res.localites[i].id == u.localite){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[i].formData.nom, 18);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[i].formData.code, 19);
                  localiteIndex[u.localite] = i;
                  idLieuHabitation = res.localites[i].id;
                  break;
                }
              }
            }

            if(u.ethnie && u.ethnie != ''){
              if(isDefined(ethnieIndex[u.ethnie])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[ethnieIndex[u.ethnie]].formData.nom, 20);
                idEthnie = res.ethnies[ethnieIndex[u.ethnie]].id;
              }else{
                for(let i=0; i < res.ethnies.length; i++){
                  if(res.ethnies[i].id == u.ethnie){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[i].formData.nom, 20);
                    ethnieIndex[u.ethnie] = i;
                    idEthnie = res.ethnies[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', null, 20);
              idEthnie = null;
            }
            
            if(u.profession && u.profession != ''){
              if(isDefined(professionIndex[u.profession])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[professionIndex[u.profession]].formData.nom, 21);
                idProfession = res.professions[professionIndex[u.profession]].id;
              }else{
                for(let i=0; i < res.professions.length; i++){
                  if(res.professions[i].id == u.profession){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[i].formData.nom, 21);
                    professionIndex[u.profession] = i;
                    idProfession = res.professions[i].id;
                    break;
                  }
                }
              }  
            }else{
              //collone vide
              u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', null, 21);
              idProfession = null;
            }

            membresData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idOp: idOp, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idLieuHabitation: idLieuHabitation, idEthnie: idEthnie, idProfession: idProfession, ...u.formData, ...u.formioData, ...u.security});
          }

          membresData.map((membre) => {
            this.getPhoto(membre)
          })

          if(this.mobile){
            this.membresData = membresData;
            this.membresData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.allMembresData = [...this.allMembresData]
          } else{
            $('#membre').ready(()=>{
              if(global.langue == 'en'){
                this.membreHTMLTable = createDataTable("membre", this.colonnes, membresData, null, this.translate, global.peutExporterDonnees);
              }else{
                this.membreHTMLTable = createDataTable("membre", this.colonnes, membresData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.attacheEventToDataTable(this.membreHTMLTable.datatable);
            });
          }
        }
        if(event)
          event.target.complete();
      }).catch((err) => {
        this.membres = [];
        this.membresData = [];
        this.allMembresData = [];
        this.selectedIndexes = [];
        console.log(err)
        if(event)
          event.target.complete();
      });
    }

    getMembresByType(type){
      this.action = type;
      this.cacheAction = type;
      this.getMembre();
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
    
    async presentDerniereModification(membre) {
      const modal = await this.modalController.create({
        component: DerniereModificationComponent,
        componentProps: { _id: membre.id, _rev: membre.rev, security: membre.security },
        mode: 'ios',
        //cssClass: 'costom-modal',
      });
      return await modal.present();
    }

    selectedItemDerniereModification(){
      let id
      if(this.action == 'infos'){
        id = this.unMembre.id;
      }else{
        id = this.selectedIndexes[0];
      }


      if(id && id != ''){
        this.servicePouchdb.findRelationalDocByID('membre', id).then((res) => {
          if(res && res.membres[0]){
            if(this.estModeCocherElemListe){
              this.estModeCocherElemListe = false;
              this.decocherTousElemListe();
            }
            this.presentDerniereModification(res.membres[0]);
          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          }
        });
        //this.selectedIndexes = [];
      }else{
        alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRMEMBRE'));
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
      var i = this.membreHTMLTable.datatable.row('.selected').index();

      if(this.membreHTMLTable.datatable.row(i).next()){
        this.next = true;
      }else{
        this.next = false;
      }

      if(this.membreHTMLTable.datatable.row(i).prev()){
        this.prev = true;
      }else{
        this.prev = false;
      }
    }

    datatableNextRow(){
      //datatable.row(this.selectedIndexes).next().data();
      var i = this.membreHTMLTable.datatable.row('.selected').index();
      if(this.membreHTMLTable.datatable.row(i).next()){
        //this.membreHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.membreHTMLTable.datatable.rows().deselect();
        this.membreHTMLTable.datatable.row(i).next().select();
        this.selectedItemInfo();
        
        if(this.membreHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }else{
        this.next = false;

        if(this.membreHTMLTable.datatable.row(i).prev()){
          this.prev = true;
        }else{
          this.prev = false;
        }
      }
    }

    datatablePrevRow(){
      //datatable.row(this.selectedIndexes).prev().data();
      var i = this.membreHTMLTable.datatable.row('.selected').index();
      if(this.membreHTMLTable.datatable.row(i).prev()){
        //this.membreHTMLTable.datatable.row(this.selectedIndexes).deselect();
        this.membreHTMLTable.datatable.rows().deselect();
        this.membreHTMLTable.datatable.row(i).prev().select();
        this.selectedItemInfo();
        
        if(this.membreHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }else{
        this.prev = false;

        if(this.membreHTMLTable.datatable.row(i).next()){
          this.next = true;
        }else{
          this.next = false;
        }
      }
    }

    datatableDeselectMultipleSelectedItemForModification(){
      if(this.selectedIndexes.length > 1){
        var i = this.membreHTMLTable.datatable.row('.selected').index();
        this.membreHTMLTable.datatable.rows().deselect();
        this.membreHTMLTable.datatable.row(i).select();
      }
    }

    selectedItemInfo(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.membreHTMLTable.datatable.row('.selected').index();
      let data  = this.membreHTMLTable.datatable.row(row).data();

      this.infos(data);
      this.initDatatableNextPrevRow();
        //this.selectedIndexes = [];
      //}else{
      //  alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRMEMBRE'));
      //}
    }
  
    selectedItemModifier(){
      //if(this.selectedIndexes.length == 1){
      let row  = this.membreHTMLTable.datatable.row('.selected').index();
      let data  = this.membreHTMLTable.datatable.row(row).data();

      this.modifier(data);

        //this.selectedIndexes = [];
      //}else{
       // alert(this.translate.instant('GENERAL.ALERT_ENREGISTREMENT_DE_TRMEMBRE'))
      //}
    }
  
  
    async openRelationMembre(ev: any/*, numeroMembre*/) {
      const popover = await this.popoverController.create({
        component: RelationsMembreComponent,
        event: ev,
        translucent: true,
        componentProps: {"idMembre": this.unMembre.id},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'essais') {
          this.presentEssais(this.unMembre.id);
        }else if(dataReturned !== null && dataReturned.data == 'champs') {
          this.presentChamps(this.unMembre.id);
        }
  
      });
      return await popover.present();
    }

    async openRelationMembreDepuisListe(ev: any/*, codePays*/) {
      const popover = await this.popoverController.create({
        component: RelationsMembreComponent,
        event: ev,
        translucent: true,
        componentProps: {"numeroMembre": this.selectedIndexes[0]},
        animated: true,
        showBackdrop: true,
        //mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'essais') {
          this.presentEssais(this.selectedIndexes[0]);
        } else if(dataReturned !== null && dataReturned.data == 'champs') {
          this.presentChamps(this.selectedIndexes[0]); 
        }
  
      });
      return await popover.present();
    }
  

    async openRelationMembreDepuisTableau(ev: any/*, codePays*/) {
      let row  = this.membreHTMLTable.datatable.row('.selected').index();
      let data  = this.membreHTMLTable.datatable.row(row).data();
      const popover = await this.popoverController.create({
        component: RelationsMembreComponent,
        event: ev,
        translucent: true,
        componentProps: {"idMembre": data.id},
        animated: true,
        showBackdrop: true,
        mode: "ios"
      });
  
      popover.onWillDismiss().then((dataReturned) => {
        if(dataReturned !== null && dataReturned.data == 'essais') {
          this.presentEssais(this.selectedIndexes[0]);
        } else if(dataReturned !== null && dataReturned.data == 'champs') {
          this.presentChamps(this.selectedIndexes[0]);
        }
  
      });
      return await popover.present();
    }
  
    onSubmit(){
      let formData = this.membreForm.value;
      let formioData = {};
      let photo = './assets/img/avatar_2x.png';
      if(this.action === 'ajouter'){
        //créer un nouveau membre
      
        let membre: any = {
          //_id: 'fuma:membre:'+data.matricule,
          //id: formData.matricule,
          type: 'membre',
          pays: formData.idPays,
          region: formData.idRegion,
          departement: formData.idDepartement,
          commune: formData.idCommune,
          localite: formData.idLieuHabitation,
          union: formData.idUnion,
          op: formData.idOp,
          partenaire: formData.idFederation, //relation avec la fédération
          ethnie: formData.idEthnie,
          profession: formData.idProfession,
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

        membre.security = this.servicePouchdb.garderCreationTrace(membre.security);

        //ne pas sauvegarder les information relative à la fédération dans l'objet membre
        //relation-pour va faire le mapping à travers la propriété union se trouvant dans l'objet membre
        let doc = this.clone(membre);
        delete doc.formData.age;
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
        delete doc.formData.idLieuHabitation;
        delete doc.formData.codeLieuHabitation;
        delete doc.formData.nomLieuHabitation;
        delete doc.formData.idOp;
        delete doc.formData.numeroOp;
        delete doc.formData.nomOp;
        delete doc.formData.idUnion;
        delete doc.formData.numeroUnion;
        delete doc.formData.nomUnion;
        delete doc.formData.idFederation;
        delete doc.formData.numeroFederation;
        delete doc.formData.nomFederation;
        delete doc.formData.idProfession;
        delete doc.formData.profession;
        delete doc.formData.idEthnie;
        delete doc.formData.ethnie;

        this.servicePouchdb.createRelationalDoc(doc).then((res) => {
          //fusionner les différend objets
          //console.log(res.membres)
          
          if(this.base64Image && this.base64Image != ''){
            photo = this.base64Image;
            var attachement;
            var extension;
            if(this.base64Image.indexOf(';base64') !== -1){
              extension = this.base64Image.substring(this.base64Image.indexOf('/') + 1, this.base64Image.indexOf(';'))
              attachement = this.base64Image.split(',')[1];
            }else{
              attachement = this.base64Image;
            }

            this.servicePouchdb.putRelationalDocAttachment(res.membres[0].type, res.membres[0].id, res.membres[0].rev, 'avatar', attachement, 'image/'+extension).then((res) => {
              //membreData.rev = res.rev;
              console.log('Attachement ajouté');
              this.base64Image = null;
            }).catch((err) => {
              alert(err);
            });
          }
          
          let membreData = {id: res.membres[0].id, photo: photo, ...membre.formData, ...membre.formioData, ...membre.security};
          
          //this.membres = membre;
          this.translate.get('MEMBRE_PAGE.CHOIXNIVEAU.'+membreData.niveau).subscribe((res2: string) => {
            membreData.niveau = res2;
          });
          
          this.translate.get('MEMBRE_PAGE.SEXES.'+membreData.sexe).subscribe((res2: string) => {
            membreData.sexe = res2;
          });

          this.translate.get('MEMBRE_PAGE.ETATCIVILS.'+membreData.etatCivil).subscribe((res2: string) => {
            membreData.etatCivil = res2;
          });

          if(membreData.education && membreData.education != ''){
            this.translate.get('MEMBRE_PAGE.EDUCATIONS.'+membreData.education).subscribe((res2: string) => {
              membreData.education = res2;
            });
          }
          //membre._rev = res.membres[0].rev;
          //this.membres.push(membre);
          this.action = 'liste';
          //this.rechargerListeMobile = true;
          if(!this.mobile){
            //mode tableau, ajout d'un autre membre dans la liste
            this.dataTableAddRow(membreData)
          }else{
            //mobile, cache la liste des membre pour mettre à jour la base de données
            this.membresData.push(membreData);
            this.membresData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            this.membresData = [...this.membresData];

            this.allMembresData.push(membreData);
            this.allMembresData.sort((a, b) => {
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

          //initialiser la liste des membres
          //this.creerMembre(membreData.numeroMembre);
          
          //libérer la mémoire occupée par la liste des pays
          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
          this.communeData = [];
          this.localiteData = [];
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          this.base64Image = null;
          this.action = 'liste';
        });
  
      }else{
        //si modification
        this.unMembreDoc.pays = formData.idPays;
        this.unMembreDoc.region = formData.idRegion;
        this.unMembreDoc.departement = formData.idDepartement;
        this.unMembreDoc.commune = formData.idCommune;
        this.unMembreDoc.localite = formData.idLieuHabitation;
        this.unMembreDoc.union = formData.idUnion;
        this.unMembreDoc.op = formData.idOp;
        this.unMembreDoc.partenaire = formData.idFederation;
        this.unMembreDoc.profession = formData.idProfession;
        this.unMembreDoc.ethnie = formData.idEthnie;
        this.unMembreDoc.formData = formData;
        this.unMembreDoc.formioData = formioData;

        //this.unMembre = membreData;
        this.unMembreDoc.security = this.servicePouchdb.garderUpdateTrace(this.unMembreDoc.security);

        let doc = this.clone(this.unMembreDoc);
        delete doc.formData.age;
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
        delete doc.formData.idLieuHabitation;
        delete doc.formData.codeLieuHabitation;
        delete doc.formData.nomLieuHabitation;
        delete doc.formData.idOp;
        delete doc.formData.numeroOp;
        delete doc.formData.nomOp;
        delete doc.formData.idUnion;
        delete doc.formData.numeroUnion;
        delete doc.formData.nomUnion;
        delete doc.formData.idFederation;
        delete doc.formData.numeroFederation;
        delete doc.formData.nomFederation;
        delete doc.formData.idEthnie;
        delete doc.formData.ethnie;
        delete doc.formData.idProfession;
        delete doc.formData.profession;

        this.servicePouchdb.updateRelationalDoc(doc).then((res) => {
          //this.membres._rev = res.rev;
          //this.unMembreDoc._rev = res.rev;
          let membreData = {id: this.unMembreDoc.id, photo: this.unMembre.photo, ...this.unMembreDoc.formData, ...this.unMembreDoc.formioData, ...this.unMembreDoc.security};

          this.translate.get('MEMBRE_PAGE.CHOIXNIVEAU.'+membreData.niveau).subscribe((res2: string) => {
            membreData.niveau = res2;
          });

          this.translate.get('MEMBRE_PAGE.SEXES.'+membreData.sexe).subscribe((res2: string) => {
            membreData.sexe = res2;
          });

          this.translate.get('MEMBRE_PAGE.ETATCIVILS.'+membreData.etatCivil).subscribe((res2: string) => {
            membreData.etatCivil = res2;
          });

          if(membreData.education && membreData.education != ''){
            this.translate.get('MEMBRE_PAGE.EDUCATIONS.'+membreData.education).subscribe((res2: string) => {
              membreData.education = res2;
            });
          }

          if(this.base64Image && this.base64Image != ''){
            photo = this.base64Image;
            var attachement;
            var extension;
            if(this.base64Image.indexOf(';base64') !== -1){
              extension = this.base64Image.substring(this.base64Image.indexOf('/') + 1, this.base64Image.indexOf(';'))
              attachement = this.base64Image.split(',')[1];
            }else{
              attachement = this.base64Image;
            }
            
            this.servicePouchdb.putRelationalDocAttachment(res.membres[0].type, res.membres[0].id, res.membres[0].rev, 'avatar', attachement, 'image/'+extension).then((res) => {
              //membreData.rev = res.rev;
              console.log('Attachement mise à jour');
              //this.action = 'infos';
              //this.imageProfile = this.clone(this.base64Image);
              membreData.photo = photo;
              this.infos(membreData);
              this.base64Image = null;
            }).catch((err) => {
              alert('erreur enregistrement photo: '+err);
              //this.action = 'infos';
              //membreData.photo = photo;
              this.infos(membreData);
              this.base64Image = null;
            });
          }else if(this.photoSupprimer){
            this.servicePouchdb.removeRelationalDocAttachment(res.membres[0], 'avatar').then((res) => {
              console.log('Attachement supprimé');
              //this.action = 'infos';
              membreData.photo = photo;
              //console.log(membreData.photo)
              this.infos(membreData);
              this.imageProfile = null;
              
            }).catch((err) => {
              alert('erreur suppresion photo: '+err);
              //this.action = 'infos';
              this.infos(membreData);
              this.imageProfile = null;
              
            })
            
          }else{
            this.infos(membreData);
          }


          if(this.mobile){
            //mode liste
            //cache la liste pour le changement dans virtual Scroll
            //this.membresData = [...this.membresData];
            //mise à jour dans la liste
            for(let i = 0; i < this.membresData.length; i++){
              if(this.membresData[i].id == membreData.id){
                this.membresData[i] = membreData;
                break;
              }
            }

            this.membresData.sort((a, b) => {
              if (a.nom < b.nom) {
                return -1;
              }
              if (a.nom > b.nom) {
                return 1;
              }
              return 0;
            });

            //mise à jour dans la liste cache
            for(let i = 0; i < this.allMembresData.length; i++){
              if(this.allMembresData[i].id == membreData.id){
                this.allMembresData[i] = membreData;
                break;
              }
            }

            this.allMembresData.sort((a, b) => {
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
            this.dataTableUpdateRow(membreData);
          }

          this.paysData = [];
          this.regionData = [];
          this.departementData = [];
          this.communeData = [];
          this.localiteData = [];
          this.unMembreDoc = null;

        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ALERT_ERREUR_SAUVEGARDE')+': '+err.toString());
          this.base64Image = null;
          this.action = 'liste';
        });
      }
    }
  
  
    actualiserTableau(data){
        if(data.length > 0 && ((this.mobile && this.styleAffichage == 'tableau') || !this.mobile)){
          $('#membre').ready(()=>{
            if(this.htmlTableAction && this.htmlTableAction != '' && this.htmlTableAction == 'recharger'){
              //si modification des données (ajout, modification, suppression), générer une nouvelle table avec les données à jour
              if(global.langue == 'en'){
                this.membreHTMLTable = createDataTable("membre", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.membreHTMLTable = createDataTable("membre", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              
              this.htmlTableAction = null;
            }else{
              //sinon pas de modification des données (ajout, modification, suppression), utiliser l'ancienne table déjà créée
              if(global.langue == 'en'){
                this.membreHTMLTable = createDataTable("membre", this.colonnes, data, null, this.translate, global.peutExporterDonnees);
              }else{
                this.membreHTMLTable = createDataTable("membre", this.colonnes, data, global.dataTable_fr, this.translate, global.peutExporterDonnees);
              }
              this.htmlTableAction = null;
            }
            
            this.attacheEventToDataTable(this.membreHTMLTable.datatable);
          });
        }
      
    }
  
    doRefresh(event) {
      if(this.action != 'conflits'){
        if((this.idOp && this.idOp != '') || (this.idUnion && this.idUnion != '') || (this.idPartenaire && this.idPartenaire != '')){
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
          
          if(this.idOp){
            typePere = 'op';
            idPere = this.idOp;
          }else if(this.idUnion){
            typePere = 'union';
            idPere = this.idUnion;
          }else{
            typePere = 'partenaire';
            idPere = this.idPartenaire;
          }
          this.servicePouchdb.findRelationalDocOfTypeByPere('membre', typePere, idPere, deleted, archived, shared).then((res) => {
            if(res && res.membres){
              let membresData = [];
              let federationIndex = [];
              let unionIndex = [];
              let opIndex = [];
              let professionIndex = [];
              let ethnieIndex = [];
              let paysIndex = [];
              let regionIndex = [];
              let departementIndex = [];
              let communeIndex = [];
              let localiteIndex = [];
              let idFederation, idUnion, idOp, idPays, idRegion, idDepartement, idCommune, idLieuHabitation, idEthnie, idProfession;
              for(let u of res.membres){
                //supprimer l'historique de la liste
                delete u.security['shared_history'];

                this.translate.get('MEMBRE_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                  u.formData.niveau = res;
                });

                this.translate.get('MEMBRE_PAGE.SEXES.'+u.formData.sexe).subscribe((res2: string) => {
                  u.formData.sexe = res2;
                });

                this.translate.get('MEMBRE_PAGE.ETATCIVILS.'+u.formData.etatCivil).subscribe((res2: string) => {
                  u.formData.etatCivil = res2;
                });

                if(u.formData.education && u.formData.education != ''){
                  this.translate.get('MEMBRE_PAGE.EDUCATIONS.'+u.formData.education).subscribe((res2: string) => {
                    u.formData.education = res2;
                  });
                }
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

                if(u.op && u.op != ''){
                  if(isDefined(opIndex[u.op])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[opIndex[u.op]].formData.numero, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[opIndex[u.op]].formData.nom, 9);
                    idOp = res.ops[opIndex[u.op]].id;
                  }else{
                    for(let i=0; i < res.ops.length; i++){
                      if(res.ops[i].id == u.op){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[i].formData.numero, 8);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[i].formData.nom, 9);
                        opIndex[u.op] = i;
                        idOp = res.ops[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', null, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', null, 9);
                  idOp = null;
                }

                //chargement des relation des localités
                if(isDefined(paysIndex[u.pays])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 11);
                  idPays = res.pays[paysIndex[u.pays]].id;
                }else{
                  for(let i=0; i < res.pays.length; i++){
                    if(res.pays[i].id == u.pays){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 11);
                      idPays = res.pays[i].id;
                      paysIndex[u.pays] = i;
                      break;
                    }
                  }
                }

                if(isDefined(regionIndex[u.region])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 12);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 13);
                  idRegion = res.regions[regionIndex[u.region]].id;
                }else{
                  for(let i=0; i < res.regions.length; i++){
                    if(res.regions[i].id == u.region){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 12);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 13);
                      regionIndex[u.region] = i;
                      idRegion = res.regions[i].id;
                      break;
                    }
                  }
                }
                
                if(isDefined(departementIndex[u.departement])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 14);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 15);
                  idDepartement = res.departements[departementIndex[u.departement]].id;
                }else{
                  for(let i=0; i < res.departements.length; i++){
                    if(res.departements[i].id == u.departement){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 14);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 15);
                      departementIndex[u.departement] = i;
                      idDepartement = res.departements[i].id;
                      break;
                    }
                  }
                }
                

                if(isDefined(communeIndex[u.commune])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 16);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 17);
                  idCommune = res.communes[communeIndex[u.commune]].id;
                }else{
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == u.commune){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 16);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 17);
                      communeIndex[u.commune] = i;
                      idCommune = res.communes[i].id;
                      break;
                    }
                  }
                }

                if(isDefined(localiteIndex[u.localite])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[localiteIndex[u.localite]].formData.nom, 18);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[localiteIndex[u.localite]].formData.code, 19);
                  idLieuHabitation = res.localites[localiteIndex[u.localite]].id;
                }else{
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == u.localite){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[i].formData.nom, 18);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[i].formData.code, 19);
                      localiteIndex[u.localite] = i;
                      idLieuHabitation = res.localites[i].id;
                      break;
                    }
                  }
                }

                if(u.ethnie && u.ethnie != ''){
                  if(isDefined(ethnieIndex[u.ethnie])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[ethnieIndex[u.ethnie]].formData.nom, 20);
                    idEthnie = res.ethnies[ethnieIndex[u.ethnie]].id;
                  }else{
                    for(let i=0; i < res.ethnies.length; i++){
                      if(res.ethnies[i].id == u.ethnie){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[i].formData.nom, 20);
                        ethnieIndex[u.ethnie] = i;
                        idEthnie = res.ethnies[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', null, 20);
                  idEthnie = null;
                }
                
                if(u.profession && u.profession != ''){
                  if(isDefined(professionIndex[u.profession])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[professionIndex[u.profession]].formData.nom, 21);
                    idProfession = res.professions[professionIndex[u.profession]].id;
                  }else{
                    for(let i=0; i < res.professions.length; i++){
                      if(res.professions[i].id == u.profession){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[i].formData.nom, 21);
                        professionIndex[u.profession] = i;
                        idProfession = res.professions[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', null, 21);
                  idProfession = null;
                }

                membresData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idOp: idOp, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idLieuHabitation: idLieuHabitation, idEthnie: idEthnie, idProfession: idProfession, ...u.formData, ...u.formioData, ...u.security});
              }

              membresData.map((membre) => {
                this.getPhoto(membre)
              })

  
              //this.membresData = [...datas];
    
              if(this.mobile){
                this.membresData = membresData;
                this.membresData.sort((a, b) => {
                  if (a.nom < b.nom) {
                    return -1;
                  }
                  if (a.nom > b.nom) {
                    return 1;
                  }
                  return 0;
                });
  
                this.allMembresData = [...this.membresData];
              } else{
                $('#membre-relation').ready(()=>{
                  if(global.langue == 'en'){
                    this.membreHTMLTable = createDataTable("membre-relation", this.colonnes, membresData, null, this.translate, global.peutExporterDonnees);
                  }else{
                    this.membreHTMLTable = createDataTable("membre-relation", this.colonnes, membresData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.membreHTMLTable.datatable);
                });
              }
              if(event)
              event.target.complete();
            }else{
              this.membres = [];
              //if(this.mobile){
              this.membresData = [];
              this.allMembresData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            this.membres = [];
            this.membresData = [];
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
  
          this.servicePouchdb.findRelationalDocByType('membre', deleted, archived, shared).then((res) => {
            if(res && res.membres){
              let membresData = [];
              let federationIndex = [];
              let unionIndex = [];
              let opIndex = [];
              let professionIndex = [];
              let ethnieIndex = [];
              let paysIndex = [];
              let regionIndex = [];
              let departementIndex = [];
              let communeIndex = [];
              let localiteIndex = [];
              let idFederation, idUnion, idOp, idPays, idRegion, idDepartement, idCommune, idLieuHabitation, idEthnie, idProfession;
              for(let u of res.membres){
                //supprimer l'historique de la liste
                delete u.security['shared_history'];

                this.translate.get('MEMBRE_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                  u.formData.niveau = res;
                });

                this.translate.get('MEMBRE_PAGE.SEXES.'+u.formData.sexe).subscribe((res2: string) => {
                  u.formData.sexe = res2;
                });

                this.translate.get('MEMBRE_PAGE.ETATCIVILS.'+u.formData.etatCivil).subscribe((res2: string) => {
                  u.formData.etatCivil = res2;
                });

                if(u.formData.education && u.formData.education != ''){
                  this.translate.get('MEMBRE_PAGE.EDUCATIONS.'+u.formData.education).subscribe((res2: string) => {
                    u.formData.education = res2;
                  });
                }
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

                if(u.op && u.op != ''){
                  if(isDefined(opIndex[u.op])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[opIndex[u.op]].formData.numero, 8);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[opIndex[u.op]].formData.nom, 9);
                    idOp = res.ops[opIndex[u.op]].id;
                  }else{
                    for(let i=0; i < res.ops.length; i++){
                      if(res.ops[i].id == u.op){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[i].formData.numero, 8);
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[i].formData.nom, 9);
                        opIndex[u.op] = i;
                        idOp = res.ops[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', null, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', null, 9);
                  idOp = null;
                }

                //chargement des relation des localités
                if(isDefined(paysIndex[u.pays])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 10);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 11);
                  idPays = res.pays[paysIndex[u.pays]].id;
                }else{
                  for(let i=0; i < res.pays.length; i++){
                    if(res.pays[i].id == u.pays){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 10);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 11);
                      idPays = res.pays[i].id;
                      paysIndex[u.pays] = i;
                      break;
                    }
                  }
                }

                if(isDefined(regionIndex[u.region])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 12);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 13);
                  idRegion = res.regions[regionIndex[u.region]].id;
                }else{
                  for(let i=0; i < res.regions.length; i++){
                    if(res.regions[i].id == u.region){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 12);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 13);
                      regionIndex[u.region] = i;
                      idRegion = res.regions[i].id;
                      break;
                    }
                  }
                }
                
                if(isDefined(departementIndex[u.departement])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 14);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 15);
                  idDepartement = res.departements[departementIndex[u.departement]].id;
                }else{
                  for(let i=0; i < res.departements.length; i++){
                    if(res.departements[i].id == u.departement){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 14);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 15);
                      departementIndex[u.departement] = i;
                      idDepartement = res.departements[i].id;
                      break;
                    }
                  }
                }
                

                if(isDefined(communeIndex[u.commune])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 16);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 17);
                  idCommune = res.communes[communeIndex[u.commune]].id;
                }else{
                  for(let i=0; i < res.communes.length; i++){
                    if(res.communes[i].id == u.commune){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 16);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 17);
                      communeIndex[u.commune] = i;
                      idCommune = res.communes[i].id;
                      break;
                    }
                  }
                }

                if(isDefined(localiteIndex[u.localite])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[localiteIndex[u.localite]].formData.nom, 18);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[localiteIndex[u.localite]].formData.code, 19);
                  idLieuHabitation = res.localites[localiteIndex[u.localite]].id;
                }else{
                  for(let i=0; i < res.localites.length; i++){
                    if(res.localites[i].id == u.localite){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[i].formData.nom, 18);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[i].formData.code, 19);
                      localiteIndex[u.localite] = i;
                      idLieuHabitation = res.localites[i].id;
                      break;
                    }
                  }
                }

                if(u.ethnie && u.ethnie != ''){
                  if(isDefined(ethnieIndex[u.ethnie])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[ethnieIndex[u.ethnie]].formData.nom, 20);
                    idEthnie = res.ethnies[ethnieIndex[u.ethnie]].id;
                  }else{
                    for(let i=0; i < res.ethnies.length; i++){
                      if(res.ethnies[i].id == u.ethnie){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[i].formData.nom, 20);
                        ethnieIndex[u.ethnie] = i;
                        idEthnie = res.ethnies[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', null, 20);
                  idEthnie = null;
                }
                
                if(u.profession && u.profession != ''){
                  if(isDefined(professionIndex[u.profession])){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[professionIndex[u.profession]].formData.nom, 21);
                    idProfession = res.professions[professionIndex[u.profession]].id;
                  }else{
                    for(let i=0; i < res.professions.length; i++){
                      if(res.professions[i].id == u.profession){
                        u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[i].formData.nom, 21);
                        professionIndex[u.profession] = i;
                        idProfession = res.professions[i].id;
                        break;
                      }
                    }
                  }  
                }else{
                  //collone vide
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', null, 21);
                  idProfession = null;
                }

                membresData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idOp: idOp, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idLieuHabitation: idLieuHabitation, idEthnie: idEthnie, idProfession: idProfession, ...u.formData, ...u.formioData, ...u.security});
              }

              membresData.map((membre) => {
                this.getPhoto(membre)
              })
  
                //si mobile
            if(this.mobile){
              this.membresData = membresData;
              this.membresData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });
  
              this.allMembresData = [...this.membresData]
            } else{
                $('#membre').ready(()=>{
                  if(global.langue == 'en'){
                    this.membreHTMLTable = createDataTable("membre", this.colonnes, membresData, null, this.translate, global.peutExporterDonnees);
                  }else{
                    this.membreHTMLTable = createDataTable("membre", this.colonnes, membresData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                  }
                  this.attacheEventToDataTable(this.membreHTMLTable.datatable);
                });
              }
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }else{
              this.membres = [];
              //if(this.mobile){
                this.membresData = [];
                this.allMembresData = [];
              //}
              this.selectedIndexes = [];
              if(event)
                event.target.complete();
            }
          }).catch((err) => {
            console.log('Erreur acces à la membre ==> '+err)
            this.membres = [];
            //if(this.mobile){
              this.membresData = [];
              this.allMembresData = [];
            //}
            this.selectedIndexes = [];
            if(event)
              event.target.complete();
          });  
        }
      }else{
        this.getMembreWithConflicts(event);
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
  
    getMembre(){
      //tous les departements
      if(this.idMembre && this.idMembre != ''){
        this.servicePouchdb.findRelationalDocByID('membre', this.idMembre).then((res) => {
          if(res && res.membres[0]){
            let f, u, op, et, pro;
            //this.unMembre = res && res.membres[0];
            this.translate.get('MEMBRE_PAGE.CHOIXNIVEAU.'+res.membres[0].formData.niveau).subscribe((res2: string) => {
              res.membres[0].formData.niveau = res2;
            });

            this.translate.get('MEMBRE_PAGE.SEXES.'+res.membres[0].formData.sexe).subscribe((res2: string) => {
              res.membres[0].formData.sexe = res2;
            });

            this.translate.get('MEMBRE_PAGE.ETATCIVILS.'+res.membres[0].formData.etatCivil).subscribe((res2: string) => {
              res.membres[0].formData.etatCivil = res2;
            });

            if(res.membres[0].formData.education && res.membres[0].formData.education != ''){
              this.translate.get('MEMBRE_PAGE.EDUCATIONS.'+res.membres[0].formData.education).subscribe((res2: string) => {
                res.membres[0].formData.education = res2;
              });
            }
            

            if(res.partenaires && res.partenaires[0]){
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'numeroFederation', res.partenaires[0].formData.numero, 4);
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomFederation', res.partenaires[0].formData.nom, 5);  
              f = res.partenaires[0].id;
            }else{
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'numeroFederation', null, 4);
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomFederation', null, 5);
              f = null;
            }
            
            if(res.unions && res.unions[0]){
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'numeroUnion', res.unions[0].formData.numero, 6);
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomUnion', res.unions[0].formData.nom, 7); 
              u = res.unions[0].id; 
            }else{
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'numeroUnion', null, 6);
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomUnion', null, 7);
              u = null;
            }

            if(res.ops && res.ops[0]){
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'numeroOp', res.ops[0].formData.numero, 8);
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomOp', res.ops[0].formData.nom, 9); 
              op = res.ops[0].id; 
            }else{
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'numeroOp', null, 8);
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomOp', null, 9);
              op = null;
            }

            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomPays', res.pays[0].formData.nom, 10); 
            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'codePays', res.pays[0].formData.code, 11);   
            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomRegion', res.regions[0].formData.nom, 12); 
            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'codeRegion', res.regions[0].formData.code, 13);   
            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomDepartement', res.departements[0].formData.nom, 14);
            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'codeDepartement', res.departements[0].formData.code, 15);  
            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomCommune', res.communes[0].formData.nom, 16);  
            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'codeCommune', res.communes[0].formData.code, 17);   
            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'nomLieuHabitation', res.localites[0].formData.nom, 18);  
            res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'codeLieuHabitation', res.localites[0].formData.code, 19);   
            
            if(res.ethnies && res.ethnies[0]){
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'ethnie', res.ethnies[0].formData.nom, 20);
              et = res.ethnies[0].id;
            }else{
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'ethnie', null, 20);
              et = null;
            }

            if(res.profession && res.professions[0]){
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'profession', res.professions[0].formData.nom, 21);
              pro = res.profession[0].id;
            }else{
              res.membres[0].formData = this.addItemToObjectAtSpecificPosition(res.membres[0].formData, 'profession', null, 21);
              pro = null;
            }

            //console.log(res)
            //this.infos({id: res.membres[0].id, idFederation: f, idUnion: u, idOp: op, idPays: res.pays[0].id, idRegion: res.regions[0].id, idDepartement: res.departements[0].id, idCommune: res.communes[0].id, idLieuHabitation: res.localites[0].id, idEthnie: et, idProfession: pro,...res.membres[0].formData}); 
          
            let membre = {id: res.membres[0].id, idFederation: f, idUnion: u, idOp: op, idPays: res.pays[0].id, idRegion: res.regions[0].id, idDepartement: res.departements[0].id, idCommune: res.communes[0].id, idLieuHabitation: res.localites[0].id, idEthnie: et, idProfession: pro,...res.membres[0].formData};
            
            this.getPhoto(membre)
            this.infos(membre);

          }else{
            alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
            this.close();
          }
        }).catch((err) => {
          alert(this.translate.instant('GENERAL.ENREGISTREMENT_NOT_FOUND'));
          console.log(err)
          this.close();
        });
      }else if((this.idOp && this.idOp != '') || (this.idUnion && this.idUnion != '') || this.idPartenaire && this.idPartenaire != ''){
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
        
        if(this.idOp){
          typePere = 'op';
          idPere = this.idOp;
        }else if(this.idUnion){
          typePere = 'union';
          idPere = this.idUnion;
        }else{
          typePere = 'partenaire';
          idPere = this.idPartenaire;
        }

        
        this.servicePouchdb.findRelationalDocOfTypeByPere('membre', typePere, idPere, deleted, archived, shared).then((res) => {
          //console.log(res)
          if(res && res.membres){
            let membresData = [];
            let federationIndex = [];
            let unionIndex = [];
            let opIndex = [];
            let professionIndex = [];
            let ethnieIndex = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let localiteIndex = [];
            let idFederation, idUnion, idOp, idPays, idRegion, idDepartement, idCommune, idLieuHabitation, idEthnie, idProfession;
            for(let u of res.membres){
              //supprimer l'historique de la liste
              delete u.security['shared_history'];

              this.translate.get('MEMBRE_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                u.formData.niveau = res;
              });

              this.translate.get('MEMBRE_PAGE.SEXES.'+u.formData.sexe).subscribe((res2: string) => {
                u.formData.sexe = res2;
              });

              this.translate.get('MEMBRE_PAGE.ETATCIVILS.'+u.formData.etatCivil).subscribe((res2: string) => {
                u.formData.etatCivil = res2;
              });

              if(u.formData.education && u.formData.education != ''){
                this.translate.get('MEMBRE_PAGE.EDUCATIONS.'+u.formData.education).subscribe((res2: string) => {
                  u.formData.education = res2;
                });
              }
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

              if(u.op && u.op != ''){
                if(isDefined(opIndex[u.op])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[opIndex[u.op]].formData.numero, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[opIndex[u.op]].formData.nom, 9);
                  idOp = res.ops[opIndex[u.op]].id;
                }else{
                  for(let i=0; i < res.ops.length; i++){
                    if(res.ops[i].id == u.op){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[i].formData.numero, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[i].formData.nom, 9);
                      opIndex[u.op] = i;
                      idOp = res.ops[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', null, 8);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', null, 9);
                idOp = null;
              }

              //chargement des relation des localités
              if(isDefined(paysIndex[u.pays])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 10);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 11);
                idPays = res.pays[paysIndex[u.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == u.pays){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 11);
                    idPays = res.pays[i].id;
                    paysIndex[u.pays] = i;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[u.region])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 12);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 13);
                idRegion = res.regions[regionIndex[u.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == u.region){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 12);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 13);
                    regionIndex[u.region] = i;
                    idRegion = res.regions[i].id;
                    break;
                  }
                }
              }
              
              if(isDefined(departementIndex[u.departement])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 14);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 15);
                idDepartement = res.departements[departementIndex[u.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == u.departement){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 14);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 15);
                    departementIndex[u.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }
              

              if(isDefined(communeIndex[u.commune])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 16);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 17);
                idCommune = res.communes[communeIndex[u.commune]].id;
              }else{
                for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == u.commune){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 16);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 17);
                    communeIndex[u.commune] = i;
                    idCommune = res.communes[i].id;
                    break;
                  }
                }
              }

              if(isDefined(localiteIndex[u.localite])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[localiteIndex[u.localite]].formData.nom, 18);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[localiteIndex[u.localite]].formData.code, 19);
                idLieuHabitation = res.localites[localiteIndex[u.localite]].id;
              }else{
                for(let i=0; i < res.localites.length; i++){
                  if(res.localites[i].id == u.localite){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[i].formData.nom, 18);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[i].formData.code, 19);
                    localiteIndex[u.localite] = i;
                    idLieuHabitation = res.localites[i].id;
                    break;
                  }
                }
              }

              if(u.ethnie && u.ethnie != ''){
                if(isDefined(ethnieIndex[u.ethnie])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[ethnieIndex[u.ethnie]].formData.nom, 20);
                  idEthnie = res.ethnies[ethnieIndex[u.ethnie]].id;
                }else{
                  for(let i=0; i < res.ethnies.length; i++){
                    if(res.ethnies[i].id == u.ethnie){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[i].formData.nom, 20);
                      ethnieIndex[u.ethnie] = i;
                      idEthnie = res.ethnies[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', null, 20);
                idEthnie = null;
              }
              
              if(u.profession && u.profession != ''){
                if(isDefined(professionIndex[u.profession])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[professionIndex[u.profession]].formData.nom, 21);
                  idProfession = res.professions[professionIndex[u.profession]].id;
                }else{
                  for(let i=0; i < res.professions.length; i++){
                    if(res.professions[i].id == u.profession){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[i].formData.nom, 21);
                      professionIndex[u.profession] = i;
                      idProfession = res.professions[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', null, 21);
                idProfession = null;
              }

              membresData.push({id: u.id, idFederation: idFederation, idUnion: idUnion, idOp: idOp, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idLieuHabitation: idLieuHabitation, idEthnie: idEthnie, idProfession: idProfession, ...u.formData, ...u.formioData, ...u.security});
            }

            membresData.map((membre) => {
              this.getPhoto(membre)
            })

            //this.membresData = [...datas]; 
  
            if(this.mobile){
              this.membresData = membresData;
              this.membresData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allMembresData = [...this.membresData];
            } else{
              $('#membre-relation').ready(()=>{
                if(global.langue == 'en'){
                  this.membreHTMLTable = createDataTable("membre-relation", this.colonnes, membresData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.membreHTMLTable = createDataTable("membre-relation", this.colonnes, membresData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.membreHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.membres = [];
          this.membresData = [];
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
        this.servicePouchdb.findRelationalDocByType('membre', deleted, archived, shared).then((res) => {
          //console.log(res)
          if(res && res.membres){
            let membresData = [];
            let federationIndex = [];
            let unionIndex = [];
            let opIndex = [];
            let professionIndex = [];
            let ethnieIndex = [];
            let paysIndex = [];
            let regionIndex = [];
            let departementIndex = [];
            let communeIndex = [];
            let localiteIndex = [];
            let idFederation, idUnion, idOp, idPays, idRegion, idDepartement, idCommune, idLieuHabitation, idEthnie, idProfession;
            for(let u of res.membres){
              //supprimer l'historique de la liste
              delete u.security['shared_history'];

            //  var p = this.getPhoto(u)
              

              //console.log(u);

              this.translate.get('MEMBRE_PAGE.CHOIXNIVEAU.'+u.formData.niveau).subscribe((res: string) => {
                u.formData.niveau = res;
              });

              this.translate.get('MEMBRE_PAGE.SEXES.'+u.formData.sexe).subscribe((res2: string) => {
                //console.log(res2)
                u.formData.sexe = res2;
              });

              this.translate.get('MEMBRE_PAGE.ETATCIVILS.'+u.formData.etatCivil).subscribe((res2: string) => {
                u.formData.etatCivil = res2;
              });

              if(u.formData.education && u.formData.education != ''){
                this.translate.get('MEMBRE_PAGE.EDUCATIONS.'+u.formData.education).subscribe((res2: string) => {
                  u.formData.education = res2;
                });
              }
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

              if(u.op && u.op != ''){
                if(isDefined(opIndex[u.op])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[opIndex[u.op]].formData.numero, 8);
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[opIndex[u.op]].formData.nom, 9);
                  idOp = res.ops[opIndex[u.op]].id;
                }else{
                  for(let i=0; i < res.ops.length; i++){
                    if(res.ops[i].id == u.op){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', res.ops[i].formData.numero, 8);
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', res.ops[i].formData.nom, 9);
                      opIndex[u.op] = i;
                      idOp = res.ops[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'numeroOp', null, 8);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomOp', null, 9);
                idOp = null;
              }

              //chargement des relation des localités
              if(isDefined(paysIndex[u.pays])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[paysIndex[u.pays]].formData.nom, 10);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[paysIndex[u.pays]].formData.code, 11);
                idPays = res.pays[paysIndex[u.pays]].id;
              }else{
                for(let i=0; i < res.pays.length; i++){
                  if(res.pays[i].id == u.pays){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomPays', res.pays[i].formData.nom, 10);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codePays', res.pays[i].formData.code, 11);
                    idPays = res.pays[i].id;
                    paysIndex[u.pays] = i;
                    break;
                  }
                }
              }

              if(isDefined(regionIndex[u.region])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[regionIndex[u.region]].formData.nom, 12);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[regionIndex[u.region]].formData.code, 13);
                idRegion = res.regions[regionIndex[u.region]].id;
              }else{
                for(let i=0; i < res.regions.length; i++){
                  if(res.regions[i].id == u.region){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomRegion', res.regions[i].formData.nom, 12);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeRegion', res.regions[i].formData.code, 13);
                    regionIndex[u.region] = i;
                    idRegion = res.regions[i].id;
                    break;
                  }
                }
              }
              
              if(isDefined(departementIndex[u.departement])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[departementIndex[u.departement]].formData.nom, 14);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[departementIndex[u.departement]].formData.code, 15);
                idDepartement = res.departements[departementIndex[u.departement]].id;
              }else{
                for(let i=0; i < res.departements.length; i++){
                  if(res.departements[i].id == u.departement){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomDepartement', res.departements[i].formData.nom, 14);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeDepartement', res.departements[i].formData.code, 15);
                    departementIndex[u.departement] = i;
                    idDepartement = res.departements[i].id;
                    break;
                  }
                }
              }
              

              if(isDefined(communeIndex[u.commune])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[communeIndex[u.commune]].formData.nom, 16);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[communeIndex[u.commune]].formData.code, 17);
                idCommune = res.communes[communeIndex[u.commune]].id;
              }else{
                for(let i=0; i < res.communes.length; i++){
                  if(res.communes[i].id == u.commune){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomCommune', res.communes[i].formData.nom, 16);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeCommune', res.communes[i].formData.code, 17);
                    communeIndex[u.commune] = i;
                    idCommune = res.communes[i].id;
                    break;
                  }
                }
              }

              if(isDefined(localiteIndex[u.localite])){
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[localiteIndex[u.localite]].formData.nom, 18);
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[localiteIndex[u.localite]].formData.code, 19);
                idLieuHabitation = res.localites[localiteIndex[u.localite]].id;
              }else{
                for(let i=0; i < res.localites.length; i++){
                  if(res.localites[i].id == u.localite){
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'nomLieuHabitation', res.localites[i].formData.nom, 18);
                    u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'codeLieuHabitation', res.localites[i].formData.code, 19);
                    localiteIndex[u.localite] = i;
                    idLieuHabitation = res.localites[i].id;
                    break;
                  }
                }
              }

              if(u.ethnie && u.ethnie != ''){
                if(isDefined(ethnieIndex[u.ethnie])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[ethnieIndex[u.ethnie]].formData.nom, 20);
                  idEthnie = res.ethnies[ethnieIndex[u.ethnie]].id;
                }else{
                  for(let i=0; i < res.ethnies.length; i++){
                    if(res.ethnies[i].id == u.ethnie){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', res.ethnies[i].formData.nom, 20);
                      ethnieIndex[u.ethnie] = i;
                      idEthnie = res.ethnies[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'ethnie', null, 20);
                idEthnie = null;
              }
              
              if(u.profession && u.profession != ''){
                if(isDefined(professionIndex[u.profession])){
                  u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[professionIndex[u.profession]].formData.nom, 21);
                  idProfession = res.professions[professionIndex[u.profession]].id;
                }else{
                  for(let i=0; i < res.professions.length; i++){
                    if(res.professions[i].id == u.profession){
                      u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', res.professions[i].formData.nom, 21);
                      professionIndex[u.profession] = i;
                      idProfession = res.professions[i].id;
                      break;
                    }
                  }
                }  
              }else{
                //collone vide
                u.formData = this.addItemToObjectAtSpecificPosition(u.formData, 'profession', null, 21);
                idProfession = null;
              }

              
              /*Promise.all(promises).then(
                res => {
                    this.membres = res
                    this.allMembres=[...res]
                    this.rechercher = false;
                    if(this.refresher !== ''){
                      this.refresher.complete();
                    }
                 
                }
              )*/
              //console.log(u);
              //let formData = u.formData
              //console.log(formData);
              membresData.push({id: u.id, photo: u.photo, idFederation: idFederation, idUnion: idUnion, idOp: idOp, idPays: idPays, idRegion: idRegion, idDepartement: idDepartement, idCommune: idCommune, idLieuHabitation: idLieuHabitation, idEthnie: idEthnie, idProfession: idProfession, ...u.formData, ...u.formioData, ...u.security});
            }

            membresData.map((membre) => {
              this.getPhoto(membre)
            })
            

            //this.membresData = [...datas];
  
            //console.log(membresData)
            if(this.mobile){
              this.membresData = membresData;
              this.membresData.sort((a, b) => {
                if (a.nom < b.nom) {
                  return -1;
                }
                if (a.nom > b.nom) {
                  return 1;
                }
                return 0;
              });

              this.allMembresData = [...this.membresData];
            } else{
              $('#membre').ready(()=>{
                if(global.langue == 'en'){
                  this.membreHTMLTable = createDataTable("membre", this.colonnes, membresData, null, this.translate, global.peutExporterDonnees);
                }else{
                  this.membreHTMLTable = createDataTable("membre", this.colonnes, membresData, global.dataTable_fr, this.translate, global.peutExporterDonnees);
                }
                this.attacheEventToDataTable(this.membreHTMLTable.datatable);
              });
            }
          }
        }).catch((err) => {
          this.membres = [];
          this.membresData = [];
          console.log(err)
        });
      }
      
    }



    getPhoto(membre) {
//      return new Promise((resolve, reject) => {  

        return this.servicePouchdb.getRelationalDocAttachment('membre', membre.id, 'avatar').then((res) => {
          //console.log(res)
          if(res && res != ''){
            membre.photo = res;
            //resolve(membre)
          }else{
            membre.photo = './assets/img/avatar_2x.png';
            //resolve(membre)
          }
        }).catch((err) => {
          
          membre.photo = './assets/img/avatar_2x.png';
          //resolve(membre)
          //console.log(err)
        });
      //});
    }
  
  
    getProfession(){
      this.professionsData = [];
      this.servicePouchdb.findAllRelationalDocByType('profession').then((res) => {
        if(res && res.professions){
          //this.pays = [...pays];
          this.professionsData = [];
          //var datas = [];
          for(let p of res.professions){
            this.professionsData.push({id: p.id, ...p.formData});
          }

          this.professionsData.sort((a, b) => {
            if (a.nom < b.nom) {
              return -1;
            }
            if (a.nom > b.nom) {
              return 1;
            }
            return 0;
          });

          if(this.doModification){
            this.setSelect2DefaultValue('idProfession', this.unMembre.idProfession);
          }
        }
      }).catch((e) => {
        console.log('profession erreur: '+e);
        this.professionsData = [];
      });

    }
    
    getEthnie(idPays){
      this.ethniesData = [];
      this.servicePouchdb.findRelationalDocHasMany('ethnie', 'pays', idPays).then((res) => {
        if(res && res.ethnies){
          //this.pays = [...pays];
          this.ethniesData = [];
          //var datas = [];
          for(let p of res.ethnies){
            this.ethniesData.push({id: p.id, ...p.formData});
          }

          this.ethniesData.sort((a, b) => {
            if (a.nom < b.nom) {
              return -1;
            }
            if (a.nom > b.nom) {
              return 1;
            }
            return 0;
          });

          if(this.doModification){
            this.setSelect2DefaultValue('idEthnie', this.unMembre.idEthnie);
          }
        }else{
          this.membreForm.controls.idEthnie.setValue(null);
          this.membreForm.controls.ethnie.setValue(null);
          this.ethniesData = [];
        }
      }).catch((e) => {
        console.log('ethnie erreur: '+e);
        this.ethniesData = [];
        this.membreForm.controls.idEthnie.setValue(null);
        this.membreForm.controls.ethnie.setValue(null);
      });

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
            this.setSelect2DefaultValue('idPays', this.unMembre.idPays);
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
            this.setSelect2DefaultValue('idRegion', this.unMembre.idRegion);
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
            this.setSelect2DefaultValue('idDepartement', this.unMembre.idDepartement);
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
            this.setSelect2DefaultValue('idCommune', this.unMembre.idCommune);
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
            this.setSelect2DefaultValue('idLieuHabitation', this.unMembre.idLieuHabitation);
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
            this.setSelect2DefaultValue('idFederation', this.unMembre.idFederation);
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
              this.setSelect2DefaultValue('idUnion', this.unMembre.idUnion);
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
              this.setSelect2DefaultValue('idUnion', this.unMembre.idUnion);
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

    getOpParUnion(idUnion){
      this.opData = [];
      if(idUnion && idUnion != ''){
        this.servicePouchdb.findRelationalDocHasMany('op', 'union', idUnion).then((res) => {
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
              this.setSelect2DefaultValue('idOp', this.unMembre.idOp);
            }else if(this.idOp){
              this.setSelect2DefaultValue('idOp', this.idOp);
              $('#idOp select').ready(()=>{
                $('#idOp select').attr('disabled', true)
              });
            }
            
          }
        }).catch((err) => {
          this.opData = [];
          console.log(err)
        });
      }else{
        //get les ops indépendantes
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
              this.setSelect2DefaultValue('idOp', this.unMembre.idOp);
            }else if(this.idOp){
              this.setSelect2DefaultValue('idOp', this.idOp);
              $('#idOp select').ready(()=>{
                $('#idOp select').attr('disabled', true)
              });
            }
            
          }
        }).catch((err) => {
          this.opData = [];
          console.log(err)
        });
      }
      
    }


    setNomEthnie(idEthnie){
      if(idEthnie && idEthnie != ''){
        for(let e of this.ethniesData){
          if(idEthnie == e.id){
            this.membreForm.controls.ethnie.setValue(e.nom);
            break;
          }
        }
      }
    }

    setNomProfession(idProfession){
      if(idProfession && idProfession != ''){
        for(let p of this.professionsData){
          if(idProfession == p.id){
            this.membreForm.controls.profession.setValue(p.nom);
            break;
          }
        }
      }
    }


    setCodeAndNomPays(idPays){
      if(idPays && idPays != ''){
        for(let p of this.paysData){
          if(idPays == p.id){
            this.membreForm.controls.codePays.setValue(p.code);
            this.membreForm.controls.nomPays.setValue(p.nom);

            this.membreForm.controls.idRegion.setValue(null);
            this.membreForm.controls.codeRegion.setValue(null);
            this.membreForm.controls.nomRegion.setValue(null);

            this.departementData = [];
            this.membreForm.controls.idDepartement.setValue(null);
            this.membreForm.controls.codeDepartement.setValue(null);
            this.membreForm.controls.nomDepartement.setValue(null);

            this.communeData = [];
            this.membreForm.controls.idCommune.setValue(null);
            this.membreForm.controls.codeCommune.setValue(null);
            this.membreForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.membreForm.controls.idLieuHabitation.setValue(null);
            this.membreForm.controls.codeLieuHabitation.setValue(null);
            this.membreForm.controls.nomLieuHabitation.setValue(null);

            this.getRegionParPays(idPays)
            this.getEthnie(idPays);
            break;
          }
        }
      }
    }

    setCodeAndNomRegion(idRegion){
      if(idRegion && idRegion != ''){
        for(let r of this.regionData){
          if(idRegion == r.id){
            this.membreForm.controls.codeRegion.setValue(r.code);
            this.membreForm.controls.nomRegion.setValue(r.nom);

            this.membreForm.controls.idDepartement.setValue(null);
            this.membreForm.controls.codeDepartement.setValue(null);
            this.membreForm.controls.nomDepartement.setValue(null);

            this.communeData = [];
            this.membreForm.controls.idCommune.setValue(null);
            this.membreForm.controls.codeCommune.setValue(null);
            this.membreForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.membreForm.controls.idLieuHabitation.setValue(null);
            this.membreForm.controls.codeLieuHabitation.setValue(null);
            this.membreForm.controls.nomLieuHabitation.setValue(null);

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
            this.membreForm.controls.codeDepartement.setValue(d.code);
            this.membreForm.controls.nomDepartement.setValue(d.nom);

            this.membreForm.controls.idCommune.setValue(null);
            this.membreForm.controls.codeCommune.setValue(null);
            this.membreForm.controls.nomCommune.setValue(null);

            this.localiteData = [];
            this.membreForm.controls.idLieuHabitation.setValue(null);
            this.membreForm.controls.codeLieuHabitation.setValue(null);
            this.membreForm.controls.nomLieuHabitation.setValue(null);

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
            this.membreForm.controls.codeCommune.setValue(c.code);
            this.membreForm.controls.nomCommune.setValue(c.nom);
            
            this.membreForm.controls.idLieuHabitation.setValue(null);
            this.membreForm.controls.codeLieuHabitation.setValue(null);
            this.membreForm.controls.nomLieuHabitation.setValue(null);
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
            this.membreForm.controls.codeLieuHabitation.setValue(l.code);
            this.membreForm.controls.nomLieuHabitation.setValue(l.nom);
            break;
          }
        }
      }
    }

    setNumeroAndNomFederation(idFederation){
      if(idFederation && idFederation != ''){
        for(let f of this.federationData){
          if(idFederation == f.id){
            this.membreForm.controls.numeroFederation.setValue(f.numero);
            this.membreForm.controls.nomFederation.setValue(f.nom);

            this.membreForm.controls.idUnion.setValue(null);
            this.membreForm.controls.numeroUnion.setValue(null);
            this.membreForm.controls.nomUnion.setValue(null);

            this.membreForm.controls.idOp.setValue(null);
            this.membreForm.controls.numeroOp.setValue(null);
            this.membreForm.controls.nomOp.setValue(null);
            //console.log(numeroFederation)
            this.getUnionParFederation(idFederation)
            break;
          }
        }
      }else{
        this.membreForm.controls.numeroFederation.setValue(null);
        this.membreForm.controls.nomFederation.setValue(null);

        this.membreForm.controls.numeroUnion.setValue(null);
        this.membreForm.controls.nomUnion.setValue(null);

        this.membreForm.controls.numeroOp.setValue(null);
        this.membreForm.controls.nomOp.setValue(null);
        this.getUnionParFederation(idFederation)
      }
    }

    setNumeroAndNomUnion(idUnion){
      if(idUnion && idUnion != ''){
        for(let u of this.unionData){
          if(idUnion == u.id){
            this.membreForm.controls.numeroUnion.setValue(u.numero);
            this.membreForm.controls.nomUnion.setValue(u.nom);

            this.membreForm.controls.idOp.setValue(null);
            this.membreForm.controls.numeroOp.setValue(null);
            this.membreForm.controls.nomOp.setValue(null);
            //console.log(numeroFederation)
            this.getOpParUnion(idUnion)
            break;
          }
        }
      }else{
        this.membreForm.controls.nomUnion.setValue(null);
        this.membreForm.controls.numeroUnion.setValue(null);

        this.membreForm.controls.numeroOp.setValue(null);
        this.membreForm.controls.nomOp.setValue(null);
        this.getOpParUnion(idUnion)
      }
    }

    setNumeroAndNomOp(idOp){
      if(idOp && idOp != ''){
        for(let o of this.opData){
          if(idOp == o.id){
            this.membreForm.controls.numeroOp.setValue(o.numero);
            this.membreForm.controls.nomOp.setValue(o.nom);
            break;
          }
        }
      }else{
        this.membreForm.controls.nomOp.setValue(null);
        this.membreForm.controls.numeroOp.setValue(null);

      }
    }
  
    setIDCodeEtNomPays(paysData){
      this.membreForm.controls.idPays.setValue(paysData.id);
      this.membreForm.controls.codePays.setValue(paysData.code);
      this.membreForm.controls.nomPays.setValue(paysData.nom);
    }

    setIDCodeEtNomRegion(regionData){
      this.membreForm.controls.idRegion.setValue(regionData.id);
      this.membreForm.controls.codeRegion.setValue(regionData.code);
      this.membreForm.controls.nomRegion.setValue(regionData.nom);
    }

    setIDCodeEtNomDepartement(departementData){
      this.membreForm.controls.idDepartement.setValue(departementData.id);
      this.membreForm.controls.codeDepartement.setValue(departementData.code);
      this.membreForm.controls.nomDepartement.setValue(departementData.nom);
    }

    setIDCodeEtNomCommune(communeData){
      this.membreForm.controls.idCommune.setValue(communeData.id);
      this.membreForm.controls.codeCommune.setValue(communeData.code);
      this.membreForm.controls.nomCommune.setValue(communeData.nom);
    }

    setIDCodeEtNomLocalite(localiteData){
      this.membreForm.controls.idLieuHabitation.setValue(localiteData.id);
      this.membreForm.controls.codeLieuHabitation.setValue(localiteData.code);
      this.membreForm.controls.nomLieuHabitation.setValue(localiteData.nom);
    }



    attacheEventToDataTable(datatable){
      var self = this;
      var id = 'membre-datatable';
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
        console.log(this.membreHTMLTable.datatable.row(this).data());
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
        id = 'membre-pays-datatable';
      }else{ 
        id = 'membre-datatable';
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
      $('#'+id+' thead tr:eq(0) th:eq(10)').html(this.translate.instant('MEMBRE_PAGE.CODE'));
      $('#'+id+' thead tr:eq(0) th:eq(11)').html(this.translate.instant('MEMBRE_PAGE.NUMERO'));
      $('#'+id+' thead tr:eq(0) th:eq(12)').html(this.translate.instant('MEMBRE_PAGE.NOM'));
      $('#'+id+' thead tr:eq(0) th:eq(13)').html(this.translate.instant('MEMBRE_PAGE.NIVEAU'));
      $('#'+id+' thead tr:eq(0) th:eq(14)').html(this.translate.instant('MEMBRE_PAGE.AUTRETYPE'));
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
      //numéro membre
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.NUMERO.REQUIRED').subscribe((res: string) => {
        this.messages_validation.matricule[0].message = res;
      });
      
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.NUMERO.UNIQUENUMERMEMBREARTENAIRE').subscribe((res: string) => {
        this.messages_validation.matricule[1].message = res;
      });
  
      //nom membre
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.NOM.REQUIRED').subscribe((res: string) => {
        this.messages_validation.nom[0].message = res;
      });

      //prenom
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.PRENOM.REQUIRED').subscribe((res: string) => {
        this.messages_validation.prenom[0].message = res;
      });

      //sexe
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.SEXE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.sexe[0].message = res;
      });

      //état civil
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.ETATCIVIL.REQUIRED').subscribe((res: string) => {
        this.messages_validation.etatCivil[0].message = res;
      });

       //niveau
       this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.NIVEAU.REQUIRED').subscribe((res: string) => {
        this.messages_validation.niveau[0].message = res;
      });

       //numero fédération
       this.translate.get('UNION_PAGE.MESSAGES_VALIDATION.NUMERO_FEDERATION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idFederation[0].message = res;
      });

      //numero union
       this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.NUMERO_UNION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idUnion[0].message = res;
      });

       //numero op
       this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.NUMERO_OP.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idOp[0].message = res;
      });


      //autre type domaine
      /*this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.DOMAINE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.domaine[0].message = res;
      });*/

      //code pays
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.CODEPAYS.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idPays[0].message = res;
      });


      //code région
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.CODEREGION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idRegion[0].message = res;
      });

       //code département
       this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.CODEDEPARTEMENT.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idDepartement[0].message = res;
      });

      //code commune
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.CODECOMMUNE.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idCommune[0].message = res;
      });

      //code localité
      this.translate.get('MEMBRE_PAGE.MESSAGES_VALIDATION.CODELIEUHABITATION.REQUIRED').subscribe((res: string) => {
        this.messages_validation.idLieuHabitation[0].message = res;
      });
    }
  
    
    dataTableAddRow(rowData){

      $('#membre-dataTable').ready(() => {
        this.membreHTMLTable.datatable.row.add(rowData).draw();
      });
      
    }
  
    dataTableUpdateRow(/*index, */rowData){

      $('#membre-dataTable').ready(() => {
        this.membreHTMLTable.datatable.row('.selected').data(rowData).draw();
      });
      
    }
  
    dataTableRemoveRows(){
      //datatable.row(index).remove().draw();
      $('#membre-dataTable').ready(() => {
        this.membreHTMLTable.datatable.rows('.selected').remove().draw();
      });

    }
  
    
  dataTableSelectAll(){
    this.selectedIndexes = [];
    this.membreHTMLTable.datatable.rows( { search: 'applied' } ).select();
    var info = this.membreHTMLTable.datatable.page.info();
    if(info.recordsDisplay == this.selectedIndexes.length){
      this.allSelected = true;
    }else{
      this.allSelected = false;
    }
  }

  dataTableSelectNon(){
    this.membreHTMLTable.datatable.rows().deselect();
    this.selectedIndexes = [];
    this.allSelected = false;
  }

  dataTableAddRechercheParColonne(){
    if(this.membreHTMLTable && this.membreHTMLTable.datatable){
      //var id = 'membre-datatable';

      var self = this;
      //$('#'+id+' thead tr:eq(1)').show();

      //$(self.membreHTMLTable.datatable.table().header() ).children(1).show();
      $(self.membreHTMLTable.datatable.table().header()).children(1)[1].hidden = false;
      this.recherchePlus = true;
    }
  }

  dataTableRemoveRechercheParColonne(){
    //var id = 'membre-datatable';
    var self = this;

    //$('#'+id+' thead tr:eq(1)').hide();
    //$(self.membreHTMLTable.datatable.table().header() ).children(1).hide();
    $(self.membreHTMLTable.datatable.table().header()).children(1)[1].hidden = true;
    this.recherchePlus = false;
  }

  dataTableAddCustomFiltre(){
    //.initComplete = function () {
    var id = 'membre-datatable';
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
      $( self.membreHTMLTable.datatable.table().footer() ).show();
      this.membreHTMLTable.datatable.columns().every( function () {
          i = i +1;
          //console.log("data-header=" +$(self.membreHTMLTable.datatable.table().header()).children(0).children(0)[1].firstChild.nodeValue)
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
                  
                  var info = self.membreHTMLTable.datatable.page.info();
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
          /*$( self.membreHTMLTable.datatable.table().footer() ).children(0).each( function (i) {
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

      this.membreHTMLTable.datatable.on('column-visibility', function ( e, settings, colIdx, visibility ){
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
      $( self.membreHTMLTable.datatable.table().footer() ).show();
      //$('#'+id+' tfoot').removeAttr("style");
      this.filterAjouter = true;
    }
   // }              
  }

  dataTableRemoveCustomFiltre(){
    var id = 'membre-datatable';
    var self = this;
    //$('#'+id+' tfoot').hide();
    $( self.membreHTMLTable.datatable.table().footer() ).hide();
    this.filterAjouter = false;
  }


    filter(event) {
      const val = event.target.value.toLowerCase();
    
      // filter our data
      //if(val && val.trim() != '' && val.trim().length > 1){
        ///let u = [...this.membresData]
        this.membresData = this.allMembresData.filter((item) => {
          return item.matricule.toLowerCase().indexOf(val) !== -1 || item.nom.toLowerCase().indexOf(val) !== -1 || item.niveau.toLowerCase().indexOf(val) !== -1 || !val;
        });
      //}
      
    
      // update the rows
      //this.membreData = temp;
      
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
