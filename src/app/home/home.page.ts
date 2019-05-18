import { Component, ViewChild, ElementRef } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from '../component/popover/popover.component';
import { PouchdbService } from '../services/pouchdb/pouchdb.service';
//import Form from 'formiojs/FormBuilder';

//formio importé dans index, il suffit de la déclarer en tant que variable globale
declare var Formio: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('json') jsonElement?: ElementRef;
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
  constructor(private popoverController: PopoverController, private servicePouchdb: PouchdbService) {}

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {"id": "salu"},
      animated: true,
      showBackdrop: true,
      mode: "ios"
    });

    popover.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        //alert('Modal Sent Data :'+ dataReturned.data);
      }
    });
    return await popover.present();
  }

  ionViewDidEnter(){
      Formio.builder(document.getElementById('builder'), this.form, {
        language: 'fr',
        /*i18n: {
          fr: {
            'Submit': 'Complete'
          },
          sp: {
            'Submit': 'Enviar',
            'Please correct all errors before submitting.': 'Por favor, corrija todos los errores antes de enviar.',
            'My custom error message' : 'Mi mensaje de error personalizado',
            required : '{{field}} es requerido.',
            invalid_email: '{{field}} debe ser un correo electrónico válido.',
            error : 'Por favor, corrija los siguientes errores antes de enviar.',
          }
        }*/
      });
  }
  

  onChange(event) {
    this.jsonElement.nativeElement.innerHTML = '';
    this.jsonElement.nativeElement.appendChild(document.createTextNode(JSON.stringify(this.form, null, 4)));

    Formio.createForm(document.getElementById('formio'), this.form, {language: "fr"}).then((form) => {
      form.submission = {
        data: {
          firstName: 'Joe',
          lastName: 'Smith'
        }
      };

      form.on('submit', (submission) => {
        
        this.jsonElement.nativeElement.innerHTML = '';
        this.jsonElement.nativeElement.appendChild(document.createTextNode(JSON.stringify(submission)));

      });
      form.on('error', (errors) => {
        alert('We have errors!');
      })
    })
    

  }

  load(){
    alert("ok")
    this.formio.loadProject((form) => {
      console.log(form);
      alert("ok   "+form)
      /*this.formio.saveSubmission({data: {
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@example.com'
      }}).then((submission) => {
        console.log(submission);
      });*/
  })
}
  
}
