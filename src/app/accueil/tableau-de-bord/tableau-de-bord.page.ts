import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { PopoverComponent } from '../../component/popover/popover.component';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { TranslateService } from '@ngx-translate/core';
import { global } from '../../globale/variable';
//import * as $  from 'jquery';
//import Form from 'formiojs/FormBuilder';

//formio importé dans index, il suffit de la déclarer en tant que variable globale
declare var Formio: any;
//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToTHMLTable: any;
declare var $: any;
//declare var parse_object: any;
//declare var CSV: any;
//declare var csvToTable: any;

@Component({
  selector: 'app-tableau-de-bord',
  templateUrl: './tableau-de-bord.page.html',
  styleUrls: ['./tableau-de-bord.page.scss'],
})
export class TableauDeBordPage implements OnInit {
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

    constructor(private popoverController: PopoverController, public modalController: ModalController, private servicePouchdb: PouchdbService, private translate: TranslateService) {
      
    }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {"id": "salu"},
      animated: true,
      showBackdrop: true,
      //mode: "ios"
    });

    popover.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        //alert('Modal Sent Data :'+ dataReturned.data);
      }
    });
    return await popover.present();
  }


  ionViewDidEnter(){ 
     var table;
    /*Formio.icons = 'fontawesome';
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
        }*****
      });*/

     var ss = [
        {
        "name": "Kitty",
        "species" : "cat",
        "foods": {
          "likes": ["fresh food"],
          "dislikes": ["stale food"]
        }
        },
        {
        "name": "Pupster",
        "species" : "dog",
        "foods": {
          "likes": ["tomatoes", "peas"],
          "dislikes": ["bread"]
        }
        },
        {
        "name": "Tux",
        "species" : "cat",
        "foods": "hahah"
        }
    ];
    if(global.langue == 'en'){
      table = JSONToTHMLTable(ss, "diva");
    }else{
      table = JSONToTHMLTable(ss, "diva", global.dataTable_fr);
    }
      
    /*table.on( 'select', function ( e, dt, type, indexes ) {
      var rowData = table.rows( indexes ).data().toArray();
      alert(rowData);
      //events.prepend( '<div><b>'+type+' selection</b> - '+JSON.stringify( rowData )+'</div>' );
  } )
  .on( 'deselect', function ( e, dt, type, indexes ) {
      var rowData = table.rows( indexes ).data().toArray();
      //events.prepend( '<div><b>'+type+' <i>de</i>selection</b> - '+JSON.stringify( rowData )+'</div>' );
  } );*/
  }
  
  
 /*runit(ss) {
  var s = JSON.stringify(ss);
  var delimiter = ",";
  var nobreaks  = false;
  var broke     = false;
  var brokeArray= "A";
  var A=null;
  if(s.trim()!="") {
    try {
     var inArray = [];
     inArray=arrayFrom(JSON.parse(s));
     var outArray = [];
     for (var row in inArray) {
      outArray[outArray.length] = parse_object(inArray[row]);
     }
     alert('ok')
     var options = {
      separator: '',
      headers: true,
      noBreaks: false
     };
     options.separator = delimiter;
     options.headers = true;
     options.noBreaks = nobreaks;
     var csv = $.csv.fromObjects(outArray,options);
     if(options.headers && (csv.charAt(0)==='\n'||csv.charAt(0)==='\r'))csv="Field1"+csv;
     var csvJson = csv;
     CSV.isFirstRowHeader = true;
     CSV.delimiter=delimiter;
     CSV.autodetect = false;
     CSV.parse(csvJson);
     var table = csvToTable(CSV, true, false,false);
     document.getElementById('diva').innerHTML = table;
     return;
    }
    catch (e) {
      ; 
    }
  }
  
}*/


  onChange(event) {
    this.jsonElement.nativeElement.innerHTML = '';
    this.jsonElement.nativeElement.appendChild(document.createTextNode(JSON.stringify(this.form, null, 4)));

    Formio.icons = 'fontawesome';
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
 

  ngOnInit() {
  }

}
