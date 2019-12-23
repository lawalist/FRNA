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
    this.getFormDoc();
    //this.formRender(this.form)
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
