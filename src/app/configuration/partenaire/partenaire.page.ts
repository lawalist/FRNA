import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';

//formio importé dans index, il suffit de la déclarer en tant que variable globale
declare var Formio;
@Component({
  selector: 'app-partenaire',
  templateUrl: './partenaire.page.html',
  styleUrls: ['./partenaire.page.scss'],
})
export class PartenairePage implements OnInit {

  @ViewChild('json') jsonElement?: ElementRef;
  private formDoc: any;
  public form: Object = {
	  /*display: "wizard",*/
    components: [
      {
        type: 'textfield',
        key: 'firstName',
        label: 'First Name',
        placeholder: 'Enter your first name.',
        input: true
      },
      {
        type: 'textfield',
        key: 'lastName',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        input: true
      },
      {
        type: 'button',
        action: 'submit',
        label: 'Submit',
        theme: 'primary'
      }
    ]
  };
  formio: any;

  constructor(private servicePouchdb: PouchdbService) { }

  ngOnInit() {
    //this.getFormDoc();
    this.formBuider()
    //this.formRender(this.form)
  }

  formBuider(){
    var jsonElement = document.getElementById('json');
    var formElement = document.getElementById('formio');
    var subJSON = document.getElementById('subjson');
    //console.log(document.getElementById("builder"))
    var builder = new Formio.FormBuilder(document.getElementById("conf-builder"), {
      display: 'form',
      components: []/*,
      settings: {
        pdf: {
          "id": "1ec0f8ee-6685-5d98-a847-26f67b67d6f0",
          "src": "https://files.form.io/pdf/5692b91fd1028f01000407e3/file/1ec0f8ee-6685-5d98-a847-26f67b67d6f0"
        }
      }*/
    }/*, {
      baseUrl: 'https://examples.form.io'
    }*/);

    var onForm = function(form) {
      form.on('change', function() {
        subJSON.innerHTML = '';
        subJSON.appendChild(document.createTextNode(JSON.stringify(form.submission, null, 4)));
      });
    };

    var onBuild = function(build) {
      jsonElement.innerHTML = '';
      formElement.innerHTML = '';
      jsonElement.appendChild(document.createTextNode(JSON.stringify(builder.instance.schema, null, 4)));
      Formio.createForm(formElement, builder.instance.form).then(onForm);
    };

    var onReady = function() {
      var jsonElement = document.getElementById('json');
      var formElement = document.getElementById('formio');
      builder.instance.on('saveComponent', onBuild);
      builder.instance.on('editComponent', onBuild);
    };

    var setDisplay = function(display) {
      builder.setDisplay(display).then(onReady);
    };

    // Handle the form selection.
    var formSelect = <HTMLInputElement> document.getElementById('form-select');
    formSelect.addEventListener("change", function() {
      console.log(this.value)
      setDisplay(this.value);
    });

    builder.instance.ready.then(onReady);
  }

  ionViewDidEnter(){
    //this.getFormDoc();
    //this.formRender(this.form)
  }


  formBuilder(form){
    Formio.icons = 'fontawesome';
    Formio.builder(document.getElementById('partenaire-builder'), form, {});
    
  }

  formRender(form){
    Formio.icons = 'fontawesome';
    Formio.createForm(document.getElementById('partenaire-formio'), this.form, {language: "fr"});
  }

  saveForm(){
    if(!this.formDoc._rev){
      this.servicePouchdb.createLocalDoc(this.formDoc)
    }else{
      this.servicePouchdb.updateLocalDoc(this.formDoc)
    }
    
  }

  getFormDoc(){
    this.servicePouchdb.getLocalDocById('fuma:formulaire:partenaire').then((doc) => {
      if(doc){
        this.formDoc = doc;
        this.formBuilder(this.form);
        this.formRender(this.form)
      }else{
        this.initDoc();
      }
    }).catch((err) => {
      this.initDoc();
    })
  }

  initDoc(){
    this.formDoc = {
      _id: 'fuma:formulaire:partenaire',
      type: 'formulaire',
      form: this.form
    }
    //this.formDoc.;
    //this.formDoc.;
    this.formBuilder(this.formDoc.form);
    this.formRender(this.form)
  }
}
