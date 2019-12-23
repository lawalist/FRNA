import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { PopoverComponent } from '../../component/popover/popover.component';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { TranslateService } from '@ngx-translate/core';
import { global } from '../../globale/variable';
//import * as $  from 'jquery';
//import Form from 'formiojs/FormBuilder';
import { IonicSelectableComponent } from 'ionic-selectable';
import Cropper from 'cropperjs';

//formio importé dans index, il suffit de la déclarer en tant que variable globale
declare var Formio: any;
//JSONToTHMLTable importé dans index, il suffit de la déclarer en tant que variable globale
declare var JSONToTHMLTable: any;
declare var $: any;
//declare var parse_object: any;
//declare var CSV: any;
//declare var csvToTable: any;
class Port {
  public id: number;
  public name: string
}

@Component({
  selector: 'app-tableau-de-bord',
  templateUrl: './tableau-de-bord.page.html',
  styleUrls: ['./tableau-de-bord.page.scss'],
})
export class TableauDeBordPage implements OnInit {
  @ViewChild('json') jsonElement?: ElementRef;
  ports: Port[];
  port: Port;
  table: any;
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
      this.ports = [
        { id: 1, name: 'Tokai' },
        { id: 2, name: 'Vladivostok' },
        { id: 3, name: 'Navlakhi' }
      ];
    }

    portChange(event: {
      component: IonicSelectableComponent,
      value: any 
    }) {
      console.log('port:', event.value);
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

  pressed(){
    console.log('pressed');
  }

  active(){
    console.log('active');
  }

  released(){
    console.log('released')
  }
  initSelect2(){
    $(function () {
      $('.select2').each(function () {
        $(this).select2({
          theme: 'bootstrap4',
          width: 'style',
          placeholder: $(this).attr('placeholder'),
          allowClear: Boolean($(this).data('allow-clear')),
        });
      });
    });
  }


  add(){
    this.table.datatable.row.add({
      "nom": "Moussa",
      "prenom" : "Idi"
      }).draw();
    console.log('ok')
  }

  up(){
    let i = 0;
    this.table.datatable.row('.selected').data({
      "nom": "Ada",
      "prenom" : "Soli"
      }).draw();
      i++;
  }

  createEmptyHtmlTableWithColumns(id, cols){
    //let cols = ['non', 'prenom', 'genre']
    let dtId = id +'-datatable'
    var html = '<table id='+dtId+' class="table table-hover table-bordered"  cellspacing="0" width="100%">\n';
    html += "<thead><tr class='thead-light'>";
    cols.forEach((c) => {
      html += '<th>'+c+'</th>';
    });
    html += '</tr></thead>';
    html += "<tbody>";
    html += "</tbody>";
    html += "<tfoot><tr>";
    cols.forEach((c) => {
      html += '<th>'+c+'</th>';
    });

    html += "</tr></tfoot>\n"
    html += "</table>";
    document.getElementById(id).innerHTML = html;
  }
       
  ionViewDidEnter(){ 
    /*$( document ).ready(function() {
      var avatar = document.getElementById('avatar');
      var image = document.getElementById('image');
      var input = document.getElementById('input');
      var $progress = $('.progress');
      var $progressBar = $('.progress-bar');
      var $alert = $('.alert');
      var $modal = $('#modal');
      var cropper;

      $('[data-toggle="tooltip"]').tooltip();

      input.addEventListener('change', function (e) {
        console.log('load');
        var files = e.target.files;
        var done = function (url) {
          input.value = '';
          image.src = url;
          $alert.hide();
          $modal.modal('show');
        };
        var reader;
        var file;
        var url;

        if (files && files.length > 0) {
          file = files[0];

          if (URL) {
            done(URL.createObjectURL(file));
          } else if (FileReader) {
            reader = new FileReader();
            reader.onload = function (e) {
              done(reader.result);
            };
            reader.readAsDataURL(file);
          }
        }
      });

      $modal.on('shown.bs.modal', function () {
        console.log('crop');
        cropper = new Cropper(image, {
          aspectRatio: 1,
          viewMode: 3,
        });
      }).on('hidden.bs.modal', function () {
        cropper.destroy();
        cropper = null;
      });

      document.getElementById('crop').addEventListener('click', function () {
        var initialAvatarURL;
        var canvas;

        $modal.modal('hide');

        if (cropper) {
          canvas = cropper.getCroppedCanvas({
            width: 160,
            height: 160,
          });
          initialAvatarURL = avatar.src;
          avatar.src = canvas.toDataURL();
          $progress.show();
          $alert.removeClass('alert-success alert-warning');
          canvas.toBlob(function (blob) {
            var formData = new FormData();

            formData.append('avatar', blob, 'avatar.jpg');
            $.ajax('https://jsonplaceholder.typicode.com/posts', {
              method: 'POST',
              data: formData,
              processData: false,
              contentType: false,

              xhr: function () {
                var xhr = new XMLHttpRequest();

                xhr.upload.onprogress = function (e) {
                  var percent = '0';
                  var percentage = '0%';

                  if (e.lengthComputable) {
                    percent = Math.round((e.loaded / e.total) * 100);
                    percentage = percent + '%';
                    $progressBar.width(percentage).attr('aria-valuenow', percent).text(percentage);
                  }
                };

                return xhr;
              },

              success: function () {
                $alert.show().addClass('alert-success').text('Upload success');
              },

              error: function () {
                avatar.src = initialAvatarURL;
                $alert.show().addClass('alert-warning').text('Upload error');
              },

              complete: function () {
                $progress.hide();
              },
            });
          });
        }
      });
    });*/
    
    //this.createEmptyHtmlTableWithColumns('tt', ['non', 'prenom', 'genre'])

   // document.getElementById('tt').innerHTML = html;

    this.initSelect2();
    let data = [{
      "nom": "sani",
      "prenom" : "Ali"
      }];
    var ss1 = {
      "nom": null,
      "prenom" : null
      };

    //this.table = JSONToTHMLTable(ss1, "ex1", null, false , this.translate, global.peutExporterDonnees, data);

  
    $(document).ready(function() {

      /*this.table = $('#example').DataTable( {
        "data": [
          {
            "id": "1",
            "name": "Tiger Nixon",
            "position": "System Architect",
            "salary": "$320,800",
            "start_date": "2011/04/25",
            "office": "Edinburgh",
            "extn": "5421"
          },
          {
            "id": "2",
            "name": "Garrett Winters",
            "position": "Accountant",
            "salary": "$170,750",
            "start_date": "2011/07/25",
            "office": "Tokyo",
            "extn": "8422"
          }
        ],
          "columns": [
              { "data": "name" },
              { "data": "position" },
              { "data": "office" },
              { "data": "extn" },
              { "data": "start_date" },
              { "data": "salary" }
          ]
      } );*/
  } );
    //this.servicePouchdb.relationalPouchFinDoc('partenaire', true, false, false);
    /*this.servicePouchdb.findRelationalDocByType('union', {$ne: null}).then((res) => {
      console.log(res)
    })
    /*$('select').each(function () {
      $(this).select2({
        theme: 'bootstrap4',
        width: 'style',
        placeholder: $(this).attr('placeholder'),
        allowClear: Boolean($(this).data('allow-clear')),
      });
  });*/
    /*this.servicePouchdb.creatDocByTypeIndex().then((res) => {
      console.log(res);
      if(res){*/
        /*this.servicePouchdb.getDocByType('partenaire').then((res) => {
          console.log(res);
        }).catch((err) => {
          console.log(err)
        })*/
     /* }
    }).catch((err) => {
      console.log('err index: '+err)
    })*/
   // $('#dtBasicExample').ready(() => {
     // $('#dtBasicExample').DataTables();
   // })
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
        },
        "created_at": "2019-06-12T17:02:51.371Z",
        "created_by": "default",
        "updatet_at": "2019-06-12T17:02:51.371Z",
        "updated_by": "default",
        "deleted": false,
        "deleted_at": "",
        "deleted_by": ""
        },
        {
        "name": "Pupster",
        "species" : "dog",
        "foods": {
          "likes": ["tomatoes", "peas"],
          "dislikes": ["bread"]
        },
        "created_at": "2019-06-12T17:02:51.371Z",
        "created_by": "default",
        "updatet_at": "2019-06-12T17:02:51.371Z",
        "updated_by": "default",
        "deleted": false,
        "deleted_at": "",
        "deleted_by": ""
        },
        {
        "name": "Tux",
        "species" : "cat",
        "foods": "hahah"
        }
    ];
    if(global.langue == 'en'){
      table = JSONToTHMLTable(ss, "diva", null, false, this.translate);
    }else{
      table = JSONToTHMLTable(ss, "diva", global.dataTable_fr, false, this.translate);
    }

    //this.initMultipleSelect(this.translate);
   // $('#diva-datatable thead tr:eq(0) th:eq(0)').html('new');
    

      
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

    let formio = new Formio(this.form);
    formio.loadForm((form) => {
      console.log(form);
      formio.saveSubmission({data: {
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@example.com'
      }}).then((submission) => {
        console.log(submission);
      });
    });

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



  initMultipleSelect(t){
    $(function () {
      var self = this;
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
