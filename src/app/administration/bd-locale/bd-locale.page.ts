import { Component, OnInit } from '@angular/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';
import { global } from '../../globale/variable';
import { ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core'; 
import { from } from 'rxjs';
import { LoadLocalLocaliteComponent } from 'src/app/component/load-local-localite/load-local-localite.component';

import {customAlphabet} from 'nanoid';
//Speed: 1000 IDs per hour/second
//~919 years needed, in order to have a 1% probability of at least one collision.
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
import * as moment from 'moment';
import { isDefined } from '@angular/compiler/src/util';

@Component({
  selector: 'app-bd-locale',
  templateUrl: './bd-locale.page.html',
  styleUrls: ['./bd-locale.page.scss'],
})
export class BDLocalePage implements OnInit {

  global = global;
  constructor(private servicePouchdb: PouchdbService, private toastCtl: ToastController, private modalController: ModalController, private translate: TranslateService) { 
    this.translate.setDefaultLang(global.langue);
  }

  ngOnInit() {
    this.translateLangue();
  }

  translateLangue(){
    this.translate.use(global.langue);
    //this.translateMessagesValidation();
  }

  chec(){
    console.log(this.global.mobile)
    console.log(global.mobile)
  }

  ajouterFiltre(){
    this.servicePouchdb.getLocalDocById('_design/filtreDonnees').then((res) => {
      //console.log(res)
      if(res){
        this.servicePouchdb.filtreDesignDoc(this.servicePouchdb.localDB, res._rev).then((res) => {
          //console.log(res);
          alert('Filtre mis à jour avec succes')
        }).catch((err) => {
          console.log(err);
          alert('Erreur ajout filtre');
        })
      }else{
        this.servicePouchdb.filtreDesignDoc(this.servicePouchdb.localDB).then((res) => {
          //console.log(res);
          alert('Filtre ajouté avec succes')
        }).catch((err) => {
          console.log(err);
          alert('Erreur ajout filtre');
        })
      }
    }).catch((err) => {
      console.log(err);
      this.servicePouchdb.filtreDesignDoc(this.servicePouchdb.localDB).then((res) => {
        //console.log(res);
        alert('Filtre ajouté avec succes')
      }).catch((err) => {
        console.log(err);
        alert('Erreur ajout filtre');
      })
    })
    
  }


  async presentLoadLocalLocalite() {
    const modal = await this.modalController.create({
      component: LoadLocalLocaliteComponent,
      componentProps: { translate: this.translate },
      mode: 'ios',
      //cssClass: 'costom-modal',
    });

    /*modal.onWillDismiss().then((dataReturned) => {
      this.utilisateurForm.controls.accessDonnes = dataReturned.data.filtrePartenaire;
    });*/

    return await modal.present();
  }

  
  enLigne(){
    if(this.global.enLigne){
      alert("Mode en ligne activé");
      //this.servicePouchdb.localDB = null;
      console.log(this.servicePouchdb.remoteDB);
      this.servicePouchdb.localDB = this.servicePouchdb.remoteDB;
    }else{
      this.servicePouchdb.localDB = this.servicePouchdb.localDB_Back;
    }
  }

  chargerUnions(type){
    this.afficheMessage('Chargement: '+type.toLowerCase()+" en cours");
    this.getData(type.toLowerCase()).then(data => {
      data.forEach((d, index) => {
        //console.log(d)
        this.servicePouchdb.findRelationalDocByTypeAndCode('localite', d.newCode).then((res) => {

          let union: any = {
            //id: d.idPays,
            type: 'union',
            pays: res.localites[0].pays,
            region: res.localites[0].region,
            departement: res.localites[0].departement,
            commune: res.localites[0].commune,
            localite: res.localites[0].id,
            partenaire: 'EA33DF01-09C0-4199-B55F-BB6F72857A00',
            formData: {
              nom: d['Nom union'],
              numero: d['Numéro aggrément'],
              niveau: '1',
              dateCreation: null,
              telephone: null,
              email: null,
              latitude: null,
              longitude: null,
              adresse: null,
              code: d['Code union']
            },
            formioData: {},
            security: {
              creation_start: moment(d.start).toISOString(),
              creation_end: moment(d.end).toISOString(),
              created_by: d.created_by,
              created_at: moment(d.created_at).toISOString(),
              created_deviceid: d.deviceid,
              created_imei: d.imei,
              created_phonenumber: d.phonenumber,
              update_start: null,
              update_end: null,
              updated_by: d.updated_by,
              updated_at: moment(d.updated_at).toISOString(),
              updated_deviceid: d.updated_deviceid,
              updated_imei: d.updated_imei,
              updated_phonenumber: d.updated_phonenumber,
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
          //union.security = this.servicePouchdb.garderCreationTrace(union.security);
         
          this.servicePouchdb.createRelationalDoc(union).then((res) => {
            console.log("Union "+(index +1)+"/"+data.length+": --"+d['Nom union']+"-- ok");
              if(index === data.length -1){
                this.afficheMessage('Chargement: '+type.toLowerCase()+" terminé avec succès");
              }
          }).catch((err) => {
            alert("Union: --"+d['Nom union']+"-- existe déjà");
            console.log(err)
          });
        });
      });
      console.log('finish');
    });
  }


  chargrOPs(type){
    this.afficheMessage('Chargement: '+type.toLowerCase()+" en cours");
    this.getData(type.toLowerCase()).then(data => {
      data.forEach((d, index) => {
        //console.log(d)
        this.servicePouchdb.findRelationalDocByTypeAndCode('localite', d.newCode).then((res1) => {
          this.servicePouchdb.findRelationalDocByTypeAndCode('union', d['Code union']).then((res2) => {
            let op: any = {
              //id: d.idPays,
              type: 'op',
              pays: res1.localites[0].pays,
              region: res1.localites[0].region,
              departement: res1.localites[0].departement,
              commune: res1.localites[0].commune,
              localite: res1.localites[0].id,
              union: res2.unions[0].id,
              partenaire: res2.unions[0].partenaire,
              formData: {
                nom: d['Nom op'],
                numero: d['Numéro aggrément'],
                niveau: '1',
                dateCreation: null,
                telephone: null,
                email: null,
                latitude: null,
                longitude: null,
                adresse: null,
                code: d['Code op']
              },
              formioData: {},
              security: {
                creation_start: moment(d.start).toISOString(),
                creation_end: moment(d.end).toISOString(),
                created_by: d.created_by,
                created_at: moment(d.created_at).toISOString(),
                created_deviceid: d.deviceid,
                created_imei: d.imei,
                created_phonenumber: d.phonenumber,
                update_start: null,
                update_end: null,
                updated_by: d.updated_by,
                updated_at: moment(d.updated_at).toISOString(),
                updated_deviceid: d.updated_deviceid,
                updated_imei: d.updated_imei,
                updated_phonenumber: d.updated_phonenumber,
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
            //op.security = this.servicePouchdb.garderCreationTrace(op.security);
           
            this.servicePouchdb.createRelationalDoc(op).then((res) => {
              console.log("OP "+(index +1)+"/"+data.length+": --"+d['Nom op']+"-- ok");
                if(index === data.length -1){
                  this.afficheMessage('Chargement: '+type.toLowerCase()+" terminé avec succès");
                }
            }).catch((err) => {
              alert("OP: --"+d['Nom op']+"-- existe déjà");
              console.log(err)
            });
          });
        });
      });
      console.log('finish');
    });
  }

  chergerMembres(type){
    this.afficheMessage('Chargement: '+type.toLowerCase()+" en cours");
    this.getData(type.toLowerCase()).then(data => {
      data.forEach((d, index) => {
        //console.log(d)
        this.servicePouchdb.findRelationalDocByTypeAndCode('localite', d.newCode).then((res1) => {
          this.servicePouchdb.findRelationalDocByTypeAndCode('op', d['Code OP']).then((res2) => {
            let sexe = '1';
            if(d.Sex == 'Femme'){
              sexe = '2';
            }

            let dn = '';
            if(d['Date de naissance'] && d['Date de naissance'] != ''){
              dn = moment(d['Date de naissance']/*, 'DD/MM/YYYY'*/).toISOString();
            }

            let photo = './assets/img/avatar_2x.png';

            let membre: any = {
              //id: d.idPays,
              type: 'personne',
              pays: res1.localites[0].pays,
              region: res1.localites[0].region,
              departement: res1.localites[0].departement,
              commune: res1.localites[0].commune,
              localite: res1.localites[0].id,
              union: res2.ops[0].union,
              op: res2.ops[0].id,
              partenaire: res2.ops[0].partenaire,
              ethnie: '',
              profession: '',
              formData: {
                matricule: nanoid(),
                nom: d.Nom,
                prenom: '',
                surnom: d.Surnom,
                dateNaissance: dn,
                sexe: sexe,
                categorie: '1',

                etatCivil: '2',
                niveau: '1',
                education: null,
                telephone: null,
                email: null,
                adresse: null,
                code: d["Matricule"]
              },
              formioData: {},
              security: {
                creation_start: moment(d.start).toISOString(),
                creation_end: moment(d.end).toISOString(),
                created_by: d.created_by,
                created_at: moment(d.created_at).toISOString(),
                created_deviceid: d.deviceid,
                created_imei: d.imei,
                created_phonenumber: d.phonenumber,
                update_start: null,
                update_end: null,
                updated_by: d.updated_by,
                updated_at: moment(d.updated_at).toISOString(),
                updated_deviceid: d.updated_deviceid,
                updated_imei: d.updated_imei,
                updated_phonenumber: d.updated_phonenumber,
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
            //membre.security = this.servicePouchdb.garderCreationTrace(membre.security);
           
            //console.log(membre)
            this.servicePouchdb.createRelationalDoc(membre).then((res) => {
              console.log("Membre "+(index +1)+"/"+data.length+": --"+d['Nom']+"-- ok");
              if(d.photoID && d.photoID != ''){

                this.servicePouchdb.getMembreAttachment(d.photoID, d.photoID + '.jpeg').then((res2) => {  
                  // let attachement = this.base64Image.split(',')[1];
                  this.servicePouchdb.putRelationalDocAttachment(res.personnes[0].type, res.personnes[0].id, res.personnes[0].rev, 'avatar', res2, 'image/jpeg').then((res) => {
                    console.log("Membre "+(index +1)+"/"+data.length+": --"+d['Nom']+"-- photo ok");
                    if(index === data.length -1){
                      this.afficheMessage('Chargement: '+type.toLowerCase()+" terminé avec succès");
                    }
                    
                  }).catch((err) => {
                    alert(err);
                  });
                })
              }else{
                if(index === data.length -1){
                  this.afficheMessage('Chargement: '+type.toLowerCase()+" terminé avec succès");
                }
              }

              if(index === data.length -1){
                this.afficheMessage('Chargement: '+type.toLowerCase()+" terminé avec succès");
              }
            
            }).catch((err) => {
              alert("Membre: --"+d['Nom']+"-- existe déjà");
              console.log(err)
            });
          });
        });
      });
      console.log('finish');
    });
  }

  chargerChamps(type){
    this.afficheMessage('Chargement: '+type.toLowerCase()+" en cours");
    const nanoid2 = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 15)

    let o = 0;
    //let data = require('../../globale/'+type);
    //let personne = require('../../globale/personnes');
    //let personnneIndex = [];
    let personne = {
      personnes : []
    }
    this.getData(type.toLowerCase()).then(data => {
    data.forEach((d, index) => {
      //console.log(d)

      //this.servicePouchdb.findRelationalDocByTypeAndCode('personne', d.matricule).then((res) => {
        let typesole = '4FBA6C5D-0B97-8301-8F5C-CCE104424AD5';
        let appartenance = '7';

        if(d.typeSole == 'Jigawa'){
          typesole = '73439C16-C11A-9ED0-9F75-5A947DD057DA';
        }else if(d.typeSole == 'Damba'){
          typesole = '8DCFA970-2175-2F70-BD11-A8DAE5964456';
        }else if(d.typeSole == 'Jambali'){
          typesole = 'B1D2FC48-351B-50BD-9BF7-78F904BEA2F7';
        }else if(d.typeSole == 'Gueza' || d.typeSole == 'Geza'){
          typesole = '8149509B-180D-2AB2-814F-56D9E74724C7';
        }else if(d.typeSole == 'Guezami Guezami'){
          typesole = 'E062CCEB-EC2B-8C8F-BA00-CC3D4363EB8E';
        }


        if(d.Appartenance == 'Achât'){
          appartenance = '1';
        }else if(d.Appartenance == 'Donnation'){
          appartenance = '2';
        }else if(d.Appartenance == 'Gage'){
          appartenance = '3';
        }else if(d.Appartenance == 'Héritage'){
          appartenance = '4';
        }else if(d.Appartenance == 'Location'){
          appartenance = '5';
        }else if(d.Appartenance == 'Prêt'){
          appartenance = '6';
        }


        let champ: any = {
          //id: d.idPays,
          type: 'champ',
          pays: '',//res.personnes[0].pays,
          region: '',//res.personnes[0].region,
          departement: '',//res.personnes[0].departement,
          commune: '',//res.personnes[0].commune,
          localite: '',//res.personnes[0].localite,
          personne: '',//res.personnes[0].id,
          op: '',//res.personnes[0].op,
          union: '',//res.personnes[0].union,
          typesole: typesole,
          formData: {
            code: nanoid2(),
            nom: d.Nom,
            superficie: d.superficie,
            modeAcquisition: appartenance,
            dateAcquisition: null,
            numeroTitreFoncier: null,
            latitude: d.latitude,
            longitude: d.longitude,
            oldCode: d.Id
          },
          formioData: {},
          security: {
            creation_start: moment(d.start).toISOString(),
            creation_end: moment(d.end).toISOString(),
            created_by: d.created_by,
            created_at: moment(d.created_at).toISOString(),
            created_deviceid: d.deviceid,
            created_imei: d.imei,
            created_phonenumber: d.phonenumber,
            update_start: null,
            update_end: null,
            updated_by: d.updatet_by,
            updated_at: moment(d.updatet_at).toISOString(),
            updated_deviceid: d.updated_deviceid,
            updated_imei: d.updated_imei,
            updated_phonenumber: d.updated_phonenumber,
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

        

        /*if(isDefined(personnneIndex[d.matricule])){
          console.log('existe '+personnneIndex[d.matricule])
          champ.pays = personnneIndex[d.matricule].idPays;
          champ.region = personnneIndex[d.matricule].idRegion;
          champ.departement = personnneIndex[d.matricule].idDepartement;
          champ.commune = personnneIndex[d.matricule].idCommune;
          champ.localite = personnneIndex[d.matricule].idLocalite;
          champ.personne = personnneIndex[d.matricule].idPersonne;
          champ.op = personnneIndex[d.matricule].idOp;
          champ.union = personnneIndex[d.matricule].idUnion;
        }else{*/
          for(let i=0; i < personne.personnes.length; i++){
            //console.log(personne.personnes[i].matricule +' ==== '+d.matricule)
            if(personne.personnes[i].matricule === d.matricule){
              //console.log(personne.personnes[i].matricule +' ==== '+d.matricule)
              //console.log('not existe '+personne.personnes[i])
              champ.pays = personne.personnes[i].idPays;
              champ.region = personne.personnes[i].idRegion;
              champ.departement = personne.personnes[i].idDepartement;
              champ.commune = personne.personnes[i].idCommune;
              champ.localite = personne.personnes[i].idLieuHabitation;
              champ.personne = personne.personnes[i].idPersonne;
              champ.op = personne.personnes[i].idOp;
              champ.union = personne.personnes[i].idUnion;              

              /*personnneIndex[d.matricule] = {
                idPays: personne.personnes[i].idPays,
                idRegion: personne.personnes[i].idRegion,
                idDepartement: personne.personnes[i].idDepartement,
                idCommune: personne.personnes[i].idCommune,
                idLocalite: personne.personnes[i].idLocalite,
                idPersonne: personne.personnes[i].idPersonne,
                idOp: personne.personnes[i].idOp,
                idUnion: personne.personnes[i].idUnion,
              };*/
              break;
            }
          //}
        } 

        //console.log(champ)
        //champ.security = this.servicePouchdb.garderCreationTrace(champ.security);
        if(champ.personne != ''){
          //console.log(champ)
          this.servicePouchdb.createRelationalDoc(champ).then((res) => {
            console.log("Champ "+(index +1)+"/"+data.length+": --"+d['Nom']+"-- ok");
              if(index === data.length -1){
                this.afficheMessage('Chargement: '+type.toLowerCase()+" terminé avec succès");
              }
          }).catch((err) => {
            alert("Champ: --"+d['Nom']+"-- existe déjà");
            console.log(err)
          });
        }else{
          console.log("Champ no personne --"+o+"--: "+d.matricule);
          o++;
        }
        
     // });
    });
    console.log('finish');
   });
  }

  getData(type){
    return fetch('../../../assets/old/'+type+'.json').then(res => {
      return res.json();
    });
  }

  async afficheMessage(msg) {
    const toast = await this.toastCtl.create({
      message: msg,
      duration: 2000,
      position: 'top',
      buttons: [
        {
          icon: 'close',
          text: 'Fermer',//translate.instant('GENERAL.FERMER'),
          role: 'cancel',
          handler: () => {
            console.log('Fermer cliqué');
          }
        }
      ]
    });
    toast.present();
  }  
  

  destroyDBs(){
    this.servicePouchdb.deconnexion().then((res) => {
      global.estConnecte = false;
      global.info_user.name = 'default';
      global.info_user.roles = [];
      global.info_user.groupes = [];
      global.info_user.permissionsAccesModel = [];
      global.info_user.accessDonnes = {
        exporter: false,
        importer: false,
        inclureDonneesDependantes: false,
        pays: [],
        regions: [],
        departements: [],
        communes: [],
        partenaires: [],
        unions: [],
        ops: [],
        personnes: [],
        projets: [],
        protocoles: [],
        donneesUtilisateurs: [],
        stationMeteos: []
      };

      this.servicePouchdb.destroyDB().then((res) => {
        alert("BD réinitialisée avec succes")
        navigator['app'].exitApp();
      }).catch((err) => {
        alert('err suppression BD '+err)
      });
    }).catch((err) => {
      console.log('Erreur réseau ', err)
      this.servicePouchdb.destroyDB().then((res) => {
        alert("BD réinitialisée avec succes");
        navigator['app'].exitApp();
      }).catch((err) => {
        alert('err suppression BD '+err);
      });
    })
  }

}
