import { Injectable } from '@angular/core';
import { global } from '../../globale/variable';
import PouchDB from 'pouchdb';
import { Storage } from '@ionic/storage';
import PouchdbFind from 'pouchdb-find';
import * as Relational from 'relational-pouch';
import PouchAuth from 'pouchdb-authentication';
import * as moment from 'moment';
import { ToastController } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';
import { Sim } from '@ionic-native/sim/ngx';


//var PouchDB = require('pouchdb')
//PouchDB.plugin(require('pouchdb-find'));
//PouchDB.plugin(require('relational-pouch'));

//PouchDB.plugin(require('pouch-resolve-conflicts'))
//PouchDB.plugin(require('pouchdb-find'));


@Injectable({
  providedIn: 'root'
})
export class PouchdbService {

  public remoteDB: any = null;

  public remoteDBOld: any = null;
  public localDB: any;
  public localDB_Back: any;
  //private isInstantiated: boolean;
  public  pouchOpts = {
        skip_setup: true
    };
  private  data: any;
  phonenumber: any = '';
  imei: any = '';

  constructor(private storage: Storage, private toastCtl: ToastController, private sim: Sim, private device: Device) {
    PouchDB.plugin(PouchAuth);
    PouchDB.plugin(Relational);
    PouchDB.plugin(PouchdbFind);

    this.localDB = new PouchDB('frna-db');
    //this.localDB_Back = new PouchDB('frna-db');
    this.localDB.setMaxListeners(100); // or 30 or 40 or however many you need, 
                                      //to prevent warning (node) warning: possible EventEmitter memory leak detected. 11 listeners added. 
                                      //Use emitter.setMaxListeners() to increase limit.
    //this.remoteDB = new PouchDB('http://localhost:5984/frna-v2');
    //this.remoteDBOld = new PouchDB('http://localhost:5984/frna_db');
    //this.sync();
    //this.localDB.sync(this.remoteDB, { live: true, retry: true }).on('error', console.log.bind(console));
    this.createDBSchema();
    this.creatDocByTypeSecondIndex();
    this.ajouterFiltre();
    this.getConfServeur();
    //this.createDBSchema(this.remoteDB);
   }


   ajouterFiltre(){
    this.getLocalDocById('_design/filtreDonnees').catch((err) => {
      console.log(err);
      this.filtreDesignDoc(this.localDB).then((res) => {
        //console.log(res);
        this.afficheMessage('Filtre ajouté avec succes')
      }).catch((err) => {
        console.log(err);
        this.afficheMessage('Erreur ajout filtre');
      })
    })
    
  }


   getInfoSimEmei(){
    this.sim.getSimInfo().then(
        (info) => {
          if(info.cards.length > 0){
            info.cards.forEach((infoCard) => {
              if(infoCard.phoneNumber){
                this.phonenumber = infoCard.phoneNumber;
              }
              if(infoCard.deviceId){
                this.imei = infoCard.deviceId;
              }
            })
          }else{
            this.phonenumber = info.phoneNumber;
            this.imei = info.deviceId;
          }

        },
        (err) => console.log('Unable to get sim info: ', err)
      );

  }

  getConfServeur(){
    this.storage.get('conf-serveur').then((res) => {
      //console.log(res)
      if(res && res != ''){
        global.conf_serveur = res;
        this.remoteDB = new PouchDB(global.conf_serveur.domaine+'/'+global.conf_serveur.bd, this.pouchOpts /*'http://localhost:5984/frna-v2', {skip_setup: true}*/);
        this.testerConnexion();
      }else{
        this.remoteDB = null;
      }
    }).catch((err) => {
      console.log(err)
      this.remoteDB = null;
    })

    /*this.storage.get('frna_v2_info_connexion').then((res) => {
      //console.log(res)
      if(res && res != ''){
        global.estConnecte = true;
      }
    })*/
  }

  

  testerConnexion(){
    this.getSessionUtilisateur().then((res1) => {
      if(res1.userCtx.name){
        global.estConnecte = true;
        global.info_user.name = res1.userCtx.name;
        global.info_user.roles = res1.userCtx.roles;
        //console.log(res1.userCtx.roles.indexOf('_admin'))
        if(res1.userCtx.roles.indexOf('_admin') === -1 && res1.userCtx.roles.indexOf('admin') === -1){
          //console.log('ici')
          this.getInfosUtilisateur(res1.userCtx.name).then((res2) => {
            global.info_user.groupes = res2.groupes;
            global.info_user.permissionsAccesModel = [];
            global.info_user.accessDonnes = res2.accessDonnes;
            this.sync();
            //console.log(global.info_user.groupes)
            this.getGroupes(res2.groupes).then((res3) => {
              if(res3){
                //console.log(res)
                res3.forEach((g) => {
                  g.formData.permissionAcces.forEach((p) => {
                    if(global.info_user.permissionsAccesModel.indexOf(p) === -1){
                      global.info_user.permissionsAccesModel.push(p)
                    }
                  })
                  
                });
                this.storage.set('frna_v2_info_user', global.info_user);
                //console.log(global.info_user.permissionsAccesDonnees)
              }
            })
          }).catch((err) => {
            if(err){
              console.log("Problème de réseau ou privilèges insuffisants ", err)
            }
          });
        }else{
          this.storage.set('frna_v2_info_user', global.info_user);
        }
        
      }else{
        //global.estConnecte = false;
        /*global.info_user.name = 'default';
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
        };*/
      }
    }).catch((err) => {
        console.log("Problème de réseau ", err)
        //global.estConnecte = false;
        /*global.info_user.name = 'default';
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
        };*/
    });
  }
  
   createDBSchema(db = this.localDB){
    //une fédération peut avoir plusieurs union
    db.setSchema([
      {
        singular: 'collectedonnee',
        plural: 'collectedonnees',
        relations: {
          'protocole': {belongsTo: 'protocole'},
          'personne': {belongsTo: 'personne'},
          'champ': {belongsTo: 'champ'}
        }
      },
      {
        singular: 'projet',
        plural: 'projets',
        relations: {
          'partenaire': {belongsTo: 'partenaire'}
        }
      },
      {
        singular: 'protocole',
        plural: 'protocoles',
        relations: {
          'projet': {belongsTo: 'projet'},
          //'partenaire': {belongsTo: 'partenaire'}
        }
      },
      {
        singular: 'formulaireprotocole',
        plural: 'formulaireprotocoles',
        relations: {
          'protocole': {belongsTo: 'protocole'}
        }
      },
      {
        singular: 'profession',
        plural: 'professions'
      },
      {
        singular: 'ethnie',
        plural: 'ethnies',
        relations: {
          'pays': {belongsTo: 'pays'},
        }
      },
      //relation pays
      {
        singular: 'pays',
        plural: 'pays'
        //relations: {
          //regions: {hasMany: {type: 'region', options: {queryInverse: 'pays'}}},
          //departements: {hasMany: {type: 'departement', options: {queryInverse: 'pays'}}},
          //communes: {hasMany: {type: 'commune', options: {queryInverse: 'pays'}}},
          //localites: {hasMany: {type: 'localite', options: {queryInverse: 'pays'}}}
       // }
      },
      //relation region
      {
        singular: 'region',
        plural: 'regions',
        relations: {
          'pays': {belongsTo: 'pays'},
          //departements: {hasMany: {type: 'departement', options: {queryInverse: 'region'}}},
          //communes: {hasMany: {type: 'commune', options: {queryInverse: 'region'}}},
          //localites: {hasMany: {type: 'localite', options: {queryInverse: 'region'}}}
        }
      },
      //relation departement
      {
        singular: 'departement',
        plural: 'departements',
        relations: {
          'pays': {belongsTo: 'pays'},
          'region': {belongsTo: 'region'},
          
          
          //communes: {hasMany: {type: 'commune', options: {queryInverse: 'departement'}}},
          //localites: {hasMany: {type: 'localite', options: {queryInverse: 'departement'}}}
        }
      },
      //relation commune
      {
        singular: 'commune',
        plural: 'communes',
        relations: {
          'pays': {belongsTo: 'pays'},
          'region': {belongsTo: 'region'},
          'departement': {belongsTo: 'departement'},
          
          
          //localites: {hasMany: {type: 'localite', options: {/*async: true, */queryInverse: 'commune'}}}
        }
      },
      //relation localite
      {
        singular: 'localite',
        plural: 'localites',
        relations: {
          'pays': {belongsTo: 'pays'},
          'region': {belongsTo: 'region'},
          'departement': {belongsTo: 'departement'},
          'commune': {belongsTo: 'commune'},
          
          
          //partenaires: {hasMany: {type: 'partenaire', options: {/*async: true, */queryInverse: 'localite'}}}
        }
      },
      //relation partenaire
      {
        singular: 'partenaire',
        plural: 'partenaires',
        relations: {
         'pays': {belongsTo: 'pays'},
         'region': {belongsTo: 'region'},
         'departement': {belongsTo: 'departement'},
         'commune': {belongsTo: 'commune'},
         'localite': {belongsTo: 'localite'},
          
         
         //unions: {hasMany: {type: 'union', options: {/*async: true, */queryInverse: 'partenaire'}}}
        }
      },
      //relation union
      {
        singular: 'union',
        plural: 'unions',
        relations: {
          'pays': {belongsTo: 'pays'},
          'region': {belongsTo: 'region'},
          'departement': {belongsTo: 'departement'},
          'commune': {belongsTo: 'commune'},
          'localite': {belongsTo: 'localite'},
          'partenaire': {belongsTo: 'partenaire'}
        },
      },
      {
        singular: 'op',
        plural: 'ops',
        relations: {
          'pays': {belongsTo: 'pays'},
          'region': {belongsTo: 'region'},
          'departement': {belongsTo: 'departement'},
          'commune': {belongsTo: 'commune'},
          'localite': {belongsTo: 'localite'},
          'partenaire': {belongsTo: 'partenaire'},
          'union': {belongsTo: 'union'}
        }
      },
      {
        singular: 'personne',
        plural: 'personnes',
        relations: {
          'pays': {belongsTo: 'pays'},
          'region': {belongsTo: 'region'},
          'departement': {belongsTo: 'departement'},
          'commune': {belongsTo: 'commune'},
          'localite': {belongsTo: 'localite'},
          'partenaire': {belongsTo: 'partenaire'},
          'union': {belongsTo: 'union'},
          'op': {belongsTo: 'op'},
          'profession': {belongsTo: 'profession'},
          'ethnie': {belongsTo: 'ethnie'}
        }
      },
      {
        singular: 'typesole',
        plural: 'typesoles'
      },
      {
        singular: 'groupe',
        plural: 'groupes'
      },
      {
        singular: 'utilisateur',
        plural: 'utilisateurs'
      },
      {
        singular: 'champ',
        plural: 'champs',
        relations: {
          'localite': {belongsTo: 'localite'},
          'personne': {belongsTo: 'personne'},
          'typesole': {belongsTo: 'typesole'}
        }
      },{
        singular: 'stationmeteo',
        plural: 'stationmeteos',
        relations: {
         'localite': {belongsTo: 'localite'},
        }
      },{
        singular: 'pluviometrie',
        plural: 'pluviometries',
        relations: {
         'stationmeteo': {belongsTo: 'stationmeteo'},
        }
      }
    ])/*.then((res) => {
      console.log('DBSchema ok');
      console.log('DBSchema ok');
    });*/
   }

  relationalMakeId(type, id){
    return this.localDB.rel.makeDocID({ "type": type, "id": id });;
  }

  createRelationalDoc(doc){
    return this.localDB.rel.save(doc.type, doc);
  }

  putRelationalDocAttachment(docType, docId, docRev, fileName = 'avatar', attachment, contentType = 'text/plain'){
    return this.localDB.rel.putAttachment(docType,  {id: docId, rev: docRev}, fileName, attachment, contentType);
  }

  getRelationalDocAttachment(docType, docId, fileName = 'avatar'){
    return this.localDB.rel.getAttachment(docType, docId, fileName).then((attachment) => {
      // convert the Blob into an object URL and show it in an image tag
      if(attachment && attachment != ''){
        return URL.createObjectURL(attachment);
      }else{
        return null;
      }
    });
  }

  public getMembreAttachment(id,filename) {
    return this.remoteDBOld.getAttachment(id, filename)
  }

  removeRelationalDocAttachment(doc, fileName = 'avatar'){
    return this.localDB.rel.removeAttachment(doc.type, doc, fileName);
  }

  updateRelationalDoc(doc){
    return this.localDB.rel.save(doc.type, doc);
  }

  deleteRelationalDocDefinitivement(doc){
    return this.localDB.rel.del(doc.type, doc);
  }

  findRelationalDocByID(type, id){
    return this.localDB.rel.find(type,id);
  }

  

  findRelationalDocByTypeAndID(type, id){
    return this.localDB.rel.find(type,id);
  }

  findDocByTypePere(type, typePere, idPere){
    //console.log(idPere)
    /*return new Promise ( resolve => {*/
      let s: any = {
        "data.type": type,
        "data.security.deleted": false,
      }
      s['data.'+typePere] = idPere
    return  this.localDB.find({
      selector: s
    })  
  }


  findRelationalDocByTypeAndCode(type, code){
    /*return new Promise ( resolve => {*/
    return  this.localDB.find({
      selector: {
        "data.type": type,
        "data.formData.code": code,
      }}).then((data) => {

        return this.localDB.rel.parseRelDocs(type, data.docs);
    });    
  }

  findRelationalDocByTypeAndNumero(type, numero){
    /*return new Promise ( resolve => {*/
    return  this.localDB.find({
      selector: {
        "data.type": type,
        "data.formData.numero": numero,
      }}).then((data) => {

        return this.localDB.rel.parseRelDocs(type, data.docs);
    });    
  }

  findRelationalDocByTypeAndNom(type, nom){
    /*return new Promise ( resolve => {*/
    return  this.localDB.find({
      selector: {
        "data.type": type,
        "data.formData.nom": nom,
      }}).then((data) => {

        return this.localDB.rel.parseRelDocs(type, data.docs);
    });    
  }


  existRelationalDocByTypeAndID(type, id){
    return this.localDB.rel.find(type,id).then((res) => {
      return true
    }).catch((err) => {
      return false;
    });
  }

  findAllRelationalDocByType(type){
    return this.localDB.rel.find(type);
  }

  findRelationalDocByTypeAndOptions(type, options){
    return this.localDB.rel.find(type, options);
  }

  findAllRelationalDocByTypeAndIDs(type, ids){
    return this.localDB.rel.find(type, ids);
  }
  

  findRelationalDocHasMany(type, belongsToKey, belongsToId){
    return this.localDB.rel.findHasMany(type, belongsToKey, belongsToId);
  }
  

  findRelationalDocByType(type, deleted: any = false, archived : any = {$ne: null}, shared: any = {$ne: null}){
    /*return new Promise ( resolve => {*/
    return  this.localDB.find({
      selector: {
        "data.type": type,
        "data.security.deleted": deleted,
        "data.security.archived": archived,
        "data.security.shared": shared,
      }}).then((data) => {
        //console.log(data)
        //resolve(this.localDB.rel.parseRelDocs(type, data.docs));
        return this.localDB.rel.parseRelDocs(type, data.docs);
    })
  /*  });*/
    
  }

  findRelationalDocByTypeAndDeleted(type, deleted: any = false){
    /*return new Promise ( resolve => {*/
    return  this.localDB.find({
      selector: {
        "data.type": type,
        "data.security.deleted": deleted,
      }}).then((data) => {
        //console.log(data)
        //resolve(this.localDB.rel.parseRelDocs(type, data.docs));
        return this.localDB.rel.parseRelDocs(type, data.docs);
    })
  /*  });*/
    
  }

  findDocByTypeAndDeleted(type, deleted: any = false){
    return  this.localDB.find({
      selector: {
        "data.type": type,
        "data.security.deleted": deleted,
      }})
    
  }

  findRelationalDocOfPartenaireByType(type, partenaire, deleted: any = false, archived : any = {$ne: null}, shared: any = {$ne: null}){
    /*return new Promise ( resolve => {*/
    return  this.localDB.find({
      selector: {
        "data.type": type,
        "data.partenaire": partenaire,
        "data.security.deleted": deleted,
        "data.security.archived": archived,
        "data.security.shared": shared,
      }}).then((data) => {
        //console.log(data)
        //resolve(this.localDB.rel.parseRelDocs(type, data.docs));
        return this.localDB.rel.parseRelDocs(type, data.docs);
    })
  /*  });*/
    
  }

  findRelationalDocOfUnionByType(type, union, deleted: any = false, archived : any = {$ne: null}, shared: any = {$ne: null}){
    /*return new Promise ( resolve => {*/
    return  this.localDB.find({
      selector: {
        "data.type": type,
        "data.union": union,
        "data.security.deleted": deleted,
        "data.security.archived": archived,
        "data.security.shared": shared,
      }}).then((data) => {
        //console.log(data)
        //resolve(this.localDB.rel.parseRelDocs(type, data.docs));
        return this.localDB.rel.parseRelDocs(type, data.docs);
    })
  /*  });*/
    
  }

  findRelationalDocOfTypeByPere(type, typePere, idPere, deleted: any = false, archived : any = {$ne: null}, shared: any = {$ne: null}){
    let sel = {
      "data.type": type,
      //"data.+'type": union,
      "data.security.deleted": deleted,
      "data.security.archived": archived,
      "data.security.shared": shared,
    }

    sel["data."+typePere] = idPere;
    return  this.localDB.find({
      selector: sel
    }).then((data) => {
        //console.log(data)
        //resolve(this.localDB.rel.parseRelDocs(type, data.docs));
        return this.localDB.rel.parseRelDocs(type, data.docs);
    })    
  }

  findRelationalDocProjetAndProtocoleForDataCollect(type, projet, dateCollecte, deleted: any = false, archived : any = {$ne: null}, shared: any = {$ne: null}){
    /*return new Promise ( resolve => {*/
      //console.log(dateCollecte)
    return  this.localDB.find({
      selector: {
        "data.type": type,
        //"data.projet": projet,
        "data.formData.dateDebut": {$lte: dateCollecte},
        "data.formData.dateFin": {$gt: dateCollecte},
        "data.security.deleted": deleted,
        "data.security.archived": archived,
        "data.security.shared": shared,
      }})/*.then((data) => {
        //console.log(data)
        //resolve(this.localDB.rel.parseRelDocs(type, data.docs));
        return this.localDB.rel.parseRelDocs(type, data.docs);
    })*/
  /*  });*/
    
  }


  findRelationalDocInConflict(type){
    let data: any;
    if(data){
      return data
    }

    return new Promise ( resolve => {
      this.localDB.rel.find(type, {conflicts: true}).then((result) => {
        data = [];
        result[type+'s'].map((row) => {
          if(row.conflicts && row.security.deleted == false){
            data.push(row);
          } 
        });

        result[type+'s'] = data

        resolve(result);

        //this.localDB.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }

   sync(){
    //PouchDB.sync(this.localDB, this.remoteDB);
    //this.localDB.sync(this.remoteDB, { live: true, retry: true }).on('error', console.log.bind(console));
    //var url = 'http://localhost:5984/mydb';
    var opts = { 
      live: true, 
      retry: true, 
      filter: 'filtreDonnees/filtrer',
      query_params: {
        pays: global.info_user.accessDonnes.pays,
        regions: global.info_user.accessDonnes.regions,
        departements: global.info_user.accessDonnes.departements,
        communes: global.info_user.accessDonnes.communes,
        partenaires: global.info_user.accessDonnes.partenaires,
        unions: global.info_user.accessDonnes.unions,
        ops: global.info_user.accessDonnes.ops,
        projets: global.info_user.accessDonnes.projets,
        protocoles: global.info_user.accessDonnes.protocoles,
        donneesUtilisateurs: global.info_user.accessDonnes.donneesUtilisateurs,
        stationMeteos: global.info_user.accessDonnes.stationMeteos,
        roles: global.info_user.roles
      } 
    };
    
    // do one way, one-off sync from the server until completion
    //console.log('sync en cours')
    this.localDB.replicate.from(this.remoteDB, {
      filter: 'filtreDonnees/filtrer',
      query_params: {
        pays: global.info_user.accessDonnes.pays,
        regions: global.info_user.accessDonnes.regions,
        departements: global.info_user.accessDonnes.departements,
        communes: global.info_user.accessDonnes.communes,
        partenaires: global.info_user.accessDonnes.partenaires,
        unions: global.info_user.accessDonnes.unions,
        ops: global.info_user.accessDonnes.ops,
        projets: global.info_user.accessDonnes.projets,
        protocoles: global.info_user.accessDonnes.protocoles,
        donneesUtilisateurs: global.info_user.accessDonnes.donneesUtilisateurs,
        stationMeteos: global.info_user.accessDonnes.stationMeteos,
        roles: global.info_user.roles
      }
    }).on('complete', (info) => {
      // then two-way, continuous, retriable sync
      //this.afficheMessage('commplete')
      this.localDB.sync(this.remoteDB, opts)
        .on('change', (err) => {
          // a document failed to replicate (e.g. due to permissions)
        })
        .on('paused', (err) => {
          // replication paused (e.g. replication up to date, user went offline)
        })
        .on('error', (err) => {
          // handle error
          console.log(err)
          this.afficheMessage('Erreur replication: '+ err);
        });
    }).on('error', (err) => {
      // handle error
      console.log(err)
      this.afficheMessage('Erreur replication');
    });
  }

   replicationFromServerToLocal(){
    //console.log(global.info_user)
    this.remoteDB.replicate.to(this.localDB, {
      filter: 'filtreDonnees/filtrer',
      query_params: {
        pays: global.info_user.accessDonnes.pays,
        regions: global.info_user.accessDonnes.regions,
        departements: global.info_user.accessDonnes.departements,
        communes: global.info_user.accessDonnes.communes,
        partenaires: global.info_user.accessDonnes.partenaires,
        unions: global.info_user.accessDonnes.unions,
        ops: global.info_user.accessDonnes.ops,
        projets: global.info_user.accessDonnes.projets,
        protocoles: global.info_user.accessDonnes.protocoles,
        donneesUtilisateurs: global.info_user.accessDonnes.donneesUtilisateurs,
        stationMeteos: global.info_user.accessDonnes.stationMeteos,
        roles: global.info_user.roles
      }
    }).on('change', (info) => {
      // handle change
    }).on('paused', (err) => {
      // replication paused (e.g. replication up to date, user went offline)
    }).on('active', () => {
      // replicate resumed (e.g. new changes replicating, user went back online)
      //alert('Synchronisation des données en cours')
      this.afficheMessage('Replication des données depuis le serveur en cours');
    }).on('denied', (err) => {
      // a document failed to replicate (e.g. due to permissions)
    }).on('complete', (info) => {
      this.afficheMessage('Replication des données depuis le serveur terminée avec succes');
    }).on('error', (err) => {
      // handle error
      console.log(err)
      this.afficheMessage('Erreur replication');
    });
   }

   replicationFromLocalToServer(){
    this.localDB.replicate.to(this.remoteDB, {
      filter: 'filtreDonnees/filtrer',
      query_params: {
        pays: global.info_user.accessDonnes.pays,
        regions: global.info_user.accessDonnes.regions,
        departements: global.info_user.accessDonnes.departements,
        communes: global.info_user.accessDonnes.communes,
        partenaires: global.info_user.accessDonnes.partenaires,
        unions: global.info_user.accessDonnes.unions,
        ops: global.info_user.accessDonnes.ops,
        projets: global.info_user.accessDonnes.projets,
        protocoles: global.info_user.accessDonnes.protocoles,
        donneesUtilisateurs: global.info_user.accessDonnes.donneesUtilisateurs,
        stationMeteos: global.info_user.accessDonnes.stationMeteos,
        roles: global.info_user.roles
      }
    }).on('change', (info) => {
      // handle change
    }).on('paused', (err) => {
      // replication paused (e.g. replication up to date, user went offline)
    }).on('active', () => {
      // replicate resumed (e.g. new changes replicating, user went back online)
      this.afficheMessage('Replication vers le serveur en cours')
    }).on('denied', (err) => {
      // a document failed to replicate (e.g. due to permissions)
    }).on('complete', (info) => {
      this.afficheMessage('Replication des données vers le serveur terminée avec succes');
    }).on('error', (err) => {
      // handle error
      console.log(err)
      this.afficheMessage('Erreur replication');
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

  iniServerConnexion(){
    this.remoteDB = new PouchDB(global.conf_serveur.domaine+'/'+global.conf_serveur.bd, this.pouchOpts /*'http://localhost:5984/frna-v2', {skip_setup: true}*/);
  }

   filtreDesignDoc(db, rev = null){
    let doc2: any = {
      _id: '_design/filtreDonnees',
      filters: {
        filtrer: function (doc, req) {
          /*var filtrableDocType = ['union', 'op', 'personnes', 'projet', 'protocole', 'collectedonnee'];
          if(filtrableDocType.indexOf(doc.type) === -1){
            return 1;
          }else{*/
            if(/*doc._id === '_design/filtreDonnees' || */doc._id.indexOf('_design') !== -1 || req.query.roles.indexOf('_admin') !== -1 ||  (doc.data && (doc.data.type === 'ethnie' || doc.data.type === 'profession' || doc.data.type === 'typesole' || doc.data.type === 'groupe'))){
              return 1;
            }else if(doc.data && doc.data.type === 'pays' && req.query.pays){
              return req.query.pays.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
            }else if(doc.data && doc.data.type === 'region' && req.query.regions){
              return req.query.regions.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
            }else if(doc.data && doc.data.type === 'departement' && req.query.departements){
              return req.query.departements.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
            }else if(doc.data && doc.data.type === 'commune'){
              return req.query.communes.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
            }else if(doc.data && doc.data.type === 'localite' && req.query.communes){
              return req.query.communes.indexOf(doc.data.commune) !== -1;
            }else if(doc.data && doc.data.type === 'partenaire' && req.query.partenaires){
              return req.query.partenaires.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
            }else if(doc.data && doc.data.type === 'union'){
              if(doc.data.formData.niveau !== '2' && req.query.unions){
                return req.query.unions.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
              }else if(doc.data.formData.niveau === '2' && req.query.communes){
                return req.query.communes.indexOf(doc.data.commune) !== -1;
              } 
            }else if(doc.data && doc.data.type === 'op'){
              if(doc.data.formData.niveau !== '3' && req.query.ops){
                return req.query.ops.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
              }else if(doc.data.formData.niveau === '3' && req.query.communes){
                return req.query.communes.indexOf(doc.data.commune) !== -1;
              } 
            }else if(doc.data && doc.data.type === 'personne'){
              if(doc.data.formData.niveau !== '2' && req.query.ops){
                return req.query.ops.indexOf(doc.data.op) !== -1;
              }else if(doc.data.formData.niveau === '2' && req.query.communes){
                return req.query.communes.indexOf(doc.data.commune) !== -1;
              }
            }else if(doc.data && doc.data.type === 'champ'){
              if(req.query.ops){
                return req.query.ops.indexOf(doc.data.op) !== -1;
              }else if(req.query.communes){
                return req.query.communes.indexOf(doc.data.commune) !== -1;
              }
            }else if(doc.data && doc.data.type === 'stationmeteo' && req.query.stationMeteos){
              return req.query.stationMeteos.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
            }else if(doc.data && doc.data.type === 'pluviometrie' && req.query.stationMeteos){
              return req.query.stationMeteos.indexOf(doc.data.stationmeteo) !== -1;
            }else if(doc.data && doc.data.type === 'projet' && req.query.projets){
              return req.query.projets.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
            }else if(doc.data && doc.data.type === 'protocole' && req.query.protocoles){
              return req.query.protocoles.indexOf(doc._id.substring(doc._id.lastIndexOf('_') + 1, doc._id.length)) !== -1;
            }else if(doc.data && doc.data.type === 'formulaireprotocole' && req.query.protocoles){
              return req.query.protocoles.indexOf(doc.data.protocole) !== -1;
            }else if(doc.data && doc.data.type === 'collectedonnee' && req.query.protocoles && req.query.donneesUtilisateurs){
              return (req.query.protocoles.indexOf(doc.data.protocole) !== -1 && req.query.donneesUtilisateurs.indexOf(doc.data.security.created_by) !== -1);
            }
            
            
            
            /*else {
              return 1;
            }*/
          //}
        }.toString()
      }
    }

    if(rev && rev != ''){
      doc2._rev = rev;
    }

    return db.put(doc2);


   }
   
  public getDB() {
    if (!this.localDB) {
      throw (new Error("La base de données n'est pas valable - veuillez configurer une instance s'il vous plait!"));
    }
    return (this.localDB);
  }

  public closeDB(){
    if (!this.localDB) {
      return;
    }

    this.localDB.close();
    //this.localDatabase = null;
  }

  getLocalDocById(id){
    return this.localDB.get(id);
  }

  

  find(){
    return this.localDB.find({
      selector: {
        deleted: false
      }
    });
    
  }

  getDocByType(type, deleted = false, archived : any = {$ne: null}, shared: any = {$ne: null}/* , sort = true*/){
    /*let options: any = {
      selector: {
        "type": type,
        "security.deleted": deleted,
        //'ecurity.created_at': {'$gt': null}
      }  
    }*/

    /*if(sort){
      options.sort = [{_id: 'desc'}]
    }*/
    
    return this.localDB.find( {
      selector: {
        "data.type": type,
        "data.security.deleted": deleted,
        "data.security.archived": archived,
        "data.security.shared": shared,
      }});
  }

  findDocByTypeNiveauAndDeleted(type, niveau, deleted = false/* , sort = true*/){  
    return this.localDB.find( {
      selector: {
        "data.type": type,
        "data.formData.niveau": niveau,
        "data.security.deleted": deleted,
      }})
      
  }

  findRelationalDocByTypeNiveauAndDeleted(type, niveau, deleted = false/* , sort = true*/){  
    return this.localDB.find( {
      selector: {
        "data.type": type,
        "data.formData.niveau": niveau,
        "data.security.deleted": deleted,
      }}).then((data) => {
        return this.localDB.rel.parseRelDocs(type, data.docs);
      });
  }
  getMonInstitution(type, monInstitution,  deleted: any = false, archived : any = {$ne: null}, shared: any = {$ne: null}){  
    return  this.localDB.find({
      selector: {
        "data.type": type,
        "data.formData.monInstitution": monInstitution,
        "data.security.deleted": deleted,
        "data.security.archived": archived,
        "data.security.shared": shared,
      }}).then((data) => {
        //console.log(data)
        //resolve(this.localDB.rel.parseRelDocs(type, data.docs));
        return this.localDB.rel.parseRelDocs(type, data.docs);
    })
  }

  
  findelationalPouchFinDoc(type, deleted, archived, shared){

    //si null implique tout
    if(deleted != null){
      deleted = !deleted
    }

    if(archived != null){
      archived = !archived
    }

    if(shared != null){
      shared = !shared
    }

    let data: any;
    if(data){
      return data
    }

    return new Promise ( resolve => {
      this.localDB.rel.find(type).then((result) => {
        data = [];
        result[type+'s'].map((row) => {
          if(row.security.deleted != deleted && row.security.archived != archived && row.security.shared != shared){
            data.push(row);
          } 
        });

        result[type+'s'] = data

        resolve(result);

        this.localDB.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }


  cre(){
    this.localDB
  // Lets have a conflict
  .bulkDocs({
    docs: [
      { _id: 'mydoc', _rev: '1-tree', foo: 'tree' },
      { _id: 'mydoc', _rev: '1-quatre', bar: 'quatre' }
    ],
    new_edits: false
  })
  }
  creatDocByTypeIndex(){
    this.localDB.createIndex({
      index: {
        fields: ['type', 'security.deleted', 'security.archived', 'security.shared']
      }
    }).then((res) => {
      console.log('creatDocByTypeIndex: '+JSON.stringify(res));
    }).catch((err) => {
      console.log('creatDocByTypeIndex err: '+JSON.stringify(err));
    });
  }

  creatDocByTypeSecondIndex(){
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.security.deleted', 'data.security.archived', 'data.security.shared']
      }
    })/*.then((res) => {
      console.log('creatDocByTypeIndex: '+JSON.stringify(res));
    }).catch((err) => {
      console.log('creatDocByTypeIndex err: '+JSON.stringify(err));
    });*/

    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.security.deleted']
      }
    })

    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.formData.niveau', 'data.security.deleted']
      }
    })

    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.formData.monInstitution', 'data.security.deleted', 'data.security.archived', 'data.security.shared']
      }
    })

    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.partenaire', 'data.security.deleted', 'data.security.archived', 'data.security.shared']
      }
    });

    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.union', 'data.security.deleted', 'data.security.archived', 'data.security.shared']
      }
    });

    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.op', 'data.security.deleted', 'data.security.archived', 'data.security.shared']
      }
    });

    //index pour collecte de données: projet et protocole
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.formData.dateDebut', 'data.formData.dateFin', 'data.security.deleted', 'data.security.archived', 'data.security.shared']
      }
    });

    //pour recherche par code et type
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.formData.code']
      }
    })

    //pour recherche par numéro et type
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.formData.numero']
      }
    })

    //pour recherche par nom et type
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.formData.nom']
      }
    })


    //pour recherche par type et pays
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.pays', 'data.security.deleted']
      }
    })

    //pour recherche par type et region
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.region', 'data.security.deleted']
      }
    })

    //pour recherche par type et departement
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.departement', 'data.security.deleted']
      }
    })

    //pour recherche par type et commune
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.commune', 'data.security.deleted']
      }
    })

    //pour recherche par type et localite
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.localite', 'data.security.deleted']
      }
    })

    //pour recherche par type et père projet
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.projet', 'data.security.deleted']
      }
    })

    //pour recherche par type et père union
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.union', 'data.security.deleted']
      }
    })

    //pour recherche par type et père op
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.op', 'data.security.deleted']
      }
    })

    //pour recherche par type et père partenaire
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.partenaire', 'data.security.deleted']
      }
    })

    //pour recherche par type et père personne
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.personne', 'data.security.deleted']
      }
    })

    //pour recherche par type et père champ
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.champ', 'data.security.deleted']
      }
    })

    //pour recherche par type et père satation meteo
    this.localDB.createIndex({
      index: {
        fields: ['data.type', 'data.stationmeteo', 'data.security.deleted']
      }
    })

    //db.createIndex({index: { fields: ['data.author', '_id'] }});
    this.localDB.createIndex({index: { fields: ['data.type', '_id'] }});
  }

  getRemoteDocById(id){
    return this.remoteDB.get(id);
  }

  deleteLocalDoc(doc){
    doc._deleted = true;
    return this.localDB.put(doc);
  }

  deleteLocalie(doc){
    doc._deleted = true;
    return doc;
  }

  deleteRemoteDoc(doc){
    doc._deleted = true;
    return this.remoteDB.put(doc);
  }

  put(doc){    
    return this.localDB.put(doc);
  }

  createLocalDoc(doc){
    //let dat = new Date();
    let mom = moment().toISOString();
    doc.data.created_at = mom;//dat.toJSON();
    doc.data.updated_at = mom; //dat.toJSON();
    if(global.info_user !== null){
      doc.data.created_by = global.info_user.name;
    }else{
      doc.data.created_by = '';
    }
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    
    doc.data.deleted = false;
    doc.data.archived = false;
    doc.data.shared = false;
    
    return this.localDB.put(doc);
  }

  garderCreationTrace(doc){
    //let dat = new Date();
    let mom = moment().toISOString();
    doc.created_at = mom;//dat.toJSON();
    doc.created_deviceid = this.device.uuid;
    doc.created_imei = this.imei;
    doc.created_phonenumber = this.phonenumber;
    doc.updated_at = mom;//dat.toJSON();
    doc.updated_deviceid = this.device.uuid;
    doc.updated_imei = this.imei;
    doc.updated_phonenumber = this.phonenumber;
    if(global.info_user !== null){
      doc.created_by = global.info_user.name;
    }else{
      doc.created_by = '';
    }
    if(global.info_user !== null){
      doc.updated_by = global.info_user.name;
    }else{
      doc.updated_by = '';
    }
    doc.deleted = false;
    doc.archived = false;
    
    return doc;
  }

  createLocalite(doc){
    //let dat = new Date();
    let mom = moment().toISOString();
    doc.created_at = mom;//dat.toJSON();
    doc.updated_at = mom;//dat.toJSON();
    doc.updated_deviceid = this.device.uuid;
    doc.updated_imei = this.imei;
    doc.updated_phonenumber = this.phonenumber;
    if(global.info_user !== null){
      doc.created_by = global.info_user.name;
    }else{
      doc.created_by = '';
    }
    if(global.info_user !== null){
      doc.updated_by = global.info_user.name;
    }else{
      doc.updated_by = '';
    }
    doc.deleted = false;
    
    return this.localDB.put(doc);
  }

  //supprimer définitivement
  deleteDocDefinitivement(doc){
    doc._deleted = true;

    return this.localDB.put(doc);
  }

  createDoc(doc){
    /*let dat = new Date();
    doc.security.created_at = dat.toJSON();
    doc.security.updated_at = dat.toJSON();
    if(global.info_user !== null){
      doc.security.created_by = global.info_user.name;
    }else{
      doc.security.created_by = '';
    }
    if(global.info_user !== null){
      doc.security.updated_by = global.info_user.name;
    }else{
      doc.security.updated_by = '';
    }
    doc.security.deleted = false;
    */
    return this.localDB.put(doc);
  }

  
  createRemoteDoc(doc){
    //let dat = new Date();
    let mom = moment().toISOString();
    doc.data.created_at = mom;//dat.toJSON();
    doc.data.updated_at = mom;//dat.toJSON();
    if(global.info_user !== null){
      doc.data.created_by = global.info_user.name;
    }else{
      doc.data.created_by = '';
    }
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    doc.data.deleted = false;
    doc.data.archived = false;
    doc.data.shared = false;
    
    return this.remoteDB.put(doc);
  }


   updateLocalDoc(doc){
    //let dat = new Date();
    doc.data.updated_at = moment().toISOString();//dat.toJSON();
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    
    //doc.data.deleted = false;
    
    return this.localDB.put(doc);
  }

  garderUpdateTrace(doc){
    //let dat = new Date();
    doc.updated_at = moment().toISOString();//dat.toJSON();
    doc.updated_deviceid = this.device.uuid;
    doc.updated_imei = this.imei;
    doc.updated_phonenumber = this.phonenumber;
    if(global.info_user !== null){
      doc.updated_by = global.info_user.name;
    }else{
      doc.updated_by = '';
    }
    
    //doc.deleted = false;
    //doc.archived = false;
    
    return doc;
  }

  garderDeleteTrace(doc){
    //let dat = new Date();
    doc.deleted_at = moment().toISOString();//dat.toJSON();
    doc.updated_deviceid = this.device.uuid;
    doc.updated_imei = this.imei;
    doc.updated_phonenumber = this.phonenumber;
    if(global.info_user !== null){
      doc.deleted_by = global.info_user.name;
    }else{
      doc.deleted_by = '';
    }
    doc.deleted = true;
    return doc;
  }

  garderRestaureTrace(doc){
    //let dat = new Date();
    doc.deleted_at = moment().toISOString();//dat.toJSON();
    doc.updated_deviceid = this.device.uuid;
    doc.updated_imei = this.imei;
    doc.updated_phonenumber = this.phonenumber;
    if(global.info_user !== null){
      doc.deleted_by = global.info_user.name;
    }else{
      doc.deleted_by = '';
    }
    doc.deleted = false;
    return doc;
  }

  garderArchivedTrace(doc){
    //let dat = new Date();
    doc.archived_at = moment().toISOString();//dat.toJSON();
    doc.updated_deviceid = this.device.uuid;
    doc.updated_imei = this.imei;
    doc.updated_phonenumber = this.phonenumber;
    if(global.info_user !== null){
      doc.archived_by = global.info_user.name;
    }else{
      doc.archived_by = '';
    }
    doc.archived = true;
    return doc;
  }

  garderDesarchivedTrace(doc){
    //let dat = new Date();
    doc.archived_at = moment().toISOString();//dat.toJSON();
    doc.updated_deviceid = this.device.uuid;
    doc.updated_imei = this.imei;
    doc.updated_phonenumber = this.phonenumber;
    if(global.info_user !== null){
      doc.archived_by = global.info_user.name;
    }else{
      doc.archived_by = '';
    }
    doc.archived = false;
    return doc;
  }

  garderSharedTrace(doc, url){
    //let dat = new Date();
    doc.shared_at = moment().toISOString();//dat.toJSON();
    doc.updated_deviceid = this.device.uuid;
    doc.updated_imei = this.imei;
    doc.updated_phonenumber = this.phonenumber;
    if(global.info_user !== null){
      doc.shared_by = global.info_user.name;
    }else{
      doc.shared_by = '';
    }
    doc.shared = true;
    let history= {
      shared_at: doc.shared_at,
      shared_by: doc.shared_by,
      shared_url: url
    }
    doc.shared_history.push(history);
    return doc;
  }
  deleteLocalite(doc){
    //let dat = new Date();
    doc.deleted_at = moment().toISOString();//dat.toJSON();
    if(global.info_user !== null){
      doc.deleted_by = global.info_user.name;
    }else{
      doc.deleted_by = '';
    }
    doc.deleted = true;
    this.localDB.put(doc);
  }

  deleteLocaliteDefinitivement(doc){
    //let dat = new Date();
    doc.deleted_at = moment().toISOString();//dat.toJSON();
    if(global.info_user !== null){
      doc.deleted_by = global.info_user.name;
    }else{
      doc.deleted_by = '';
    }
    doc.deleted = true;
    doc._deleted = true;
    this.localDB.put(doc);
  }




  updateLocalite(doc){
    //let dat = new Date();
    doc.updated_at = moment().toISOString();//dat.toJSON();
    if(global.info_user !== null){
      doc.updated_by = global.info_user.name;
    }else{
      doc.updated_by = '';
    }
    
    doc.deleted = false;
    
    return this.localDB.put(doc);
  }


  updateDoc(doc){
    /*let dat = new Date();
    doc.updated_at = dat.toJSON();
    if(global.info_user !== null){
      doc.updated_by = global.info_user.name;
    }else{
      doc.updated_by = '';
    }
    
    doc.deleted = false;
    */
    return this.localDB.put(doc);
  }


  updateRemoteDoc(doc){
    //let dat = new Date();
    doc.data.updated_at = moment().toISOString();//dat.toJSON();
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    
    doc.data.deleted = false;
    
    return this.remoteDB.put(doc);
  }


  getLocalitePlageDocs(startkey, endkey){
    //si non vide
    let data: any;
    if(data){
      return data
    }

    
    return new Promise ( resolve => {
      this.localDB.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey
      }).then((result) => {
        //data = result.rows;
        data = [];
        let doc = result.rows.map((row) => {
          if(!row.doc.deleted){
            data.push(row.doc);
          }
            
        });

        
        resolve(data);

        this.localDB.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }


  getConflictsDocs(startkey, endkey){
    //si non vide
    let data: any;
    if(data){
      return data
    }

    
    return new Promise ( resolve => {
      this.localDB.allDocs({
        include_docs: true,
        conflicts: true,
        startkey: startkey,
        endkey: endkey
      }).then((result) => {
        //data = result.rows;
        data = [];
        result.rows.map((row) => {
          if(row.doc._conflicts){
            data.push(row.doc);
          }    
        });

        
        resolve(data);

        //this.localDB.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }

  getPlageDocs(startkey, endkey){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.localDB.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey
      }).then((result) => {
        data = [];
        let doc = result.rows.map((row) => {
           if(!row.doc.security.deleted){
            //data.push(row);
            data.push(row.doc);
          }
            
        });

        resolve(data);

        this.localDB.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }

  getPlageDocsRapide(startkey, endkey){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.localDB.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey
      }).then((result) => {
        //data = result.rows;
        data = [];
        let doc = result.rows.map((row) => {
          if(!row.doc.data.deleted){
            data.push(row);
          }
            
        });

        
        resolve(data);

        this.localDB.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }


  
  getPlagePhotoRapide(startkey, endkey){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.localDB.allDocs({
        include_docs: true,
        attachments: true,
        startkey: startkey,
        endkey: endkey
      }).then((result) => {
        //data = result.rows;
        data = [];
        let doc = result.rows.map((row) => {
          data.push(row);
      
            
        });

        
        resolve(data);

        this.localDB.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }


   getPlageDocsAvecLimit(startkey, endkey, limit){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.localDB.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey,
        limit: limit,
      }).then((result) => {
        data = [];
        let doc = result.rows.map((row) => {
          if(!row.doc.data.deleted){
            //data.push(row);
            data.push(row.doc);
          }
            //data.push(row.doc);
        });

        resolve(data);

        this.localDB.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }

   getPlageDocsRapideAvecLimit(startkey, endkey, limit){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.localDB.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey,
        limit: limit,
      }).then((result) => {
        data = [];
        //data = result.rows;

        let doc = result.rows.map((row) => {
          if(!row.doc.data.deleted){
            data.push(row);
          }
            
        });

        resolve(data);

        this.localDB.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }


  deleteDoc(doc){
    //let dat = new Date();
    doc.data.deleted_at = moment().toISOString();//dat.toJSON();
    if(global.info_user !== null){
      doc.data.deleted_by = global.info_user.name;
    }else{
      doc.data.deleted_by = '';
    }
    doc.data.deleted = true;
   // this.localDB.put(doc).catch((err) => console.log(err));
    /*let dat = new Date();
    doc.deleted_at = dat.toJSON();
    //doc.deleted_by = '';
    //doc._deleted = true;
    doc.supprime = true;
    doc.annuler_at = '';
    doc.annuler_by = '';
    doc.annuler = false;
    this.storage.get('gerant').then((gerant) => {
      if(gerant){
        //doc.created_by = gerant.name;
        doc.deleted_by = gerant.name;
        this.db.put(doc).catch((err) => console.log(err)); 
      }else{
       // doc.created_by = '';
        doc.deleted_by = '';
        this.db.put(doc).catch((err) => console.log(err)); 
      }
       
    });*/
    //this.localDB.remove(doc).catch((err) => console.log(err));
    this.localDB.put(doc);//this.localDB.remove(doc);//.catch((err) => console.log(err));
    //this.db.put(doc).catch((err) => console.log(err));
  }

  deleteDocReturn(doc){
    //let dat = new Date();
    doc.data.deleted_at = moment().toISOString();//dat.toJSON();
    if(global.info_user !== null){
      doc.data.deleted_by = global.info_user.name;
    }else{
      doc.data.deleted_by = '';
    }
    doc.data.deleted = true;
    //let newDoc: any = {};
    //newDoc.data = doc.data;
    //newDoc._id = 'deleted:doc:'+doc._id;

    //newDoc._rev = doc._rev;
    //this.localDB.put(newDoc);
    return  this.localDB.put(doc);//this.localDB.remove(doc);//.catch((err) => console.log(err));
  }


  handleChange(change){
    let changeDoc = null;
    let changeIndex = null;

    if(this.data){
      this.data.forEach((doc, index) => {
        if(doc._id === change.id){
          changeDoc = doc;
          changeIndex = index;
        }
      });
    }
    

    //le document a ete supprime

    if(change.delete && this.data){
      this.data.splice(changeIndex, 1);
    }else{
      //mise a jour
      if(changeDoc && this.data){
        this.data[changeIndex] = change.doc;
      }
      //ajout
      else{
        if(this.data)
          this.data.push(change.doc);
      }
    }
  }

  generateId(operation, pays, region, departement, commune, localite){
    var pays = pays||'XX'
    var region = region||'XX'
    var department = departement || 'XX'
    var commune = commune || 'XX'
    var localite = localite || 'XX'
    //select 3 random numbers and random letter for up to 25,000 unique per department
    var chars='ABCDEFGHIJKLMNPQRSTUVWYZ'
    var numbers='0123456789'
    var randomArray=[]
    for(let i=0;i<3;i++){
      var rand = Math.floor(Math.random()*10)
      randomArray.push(numbers[rand])
    }
    randomArray.push('-')
    var rand = Math.floor(Math.random()*24)
    randomArray.push(chars[rand])
    var randomString=randomArray.join("");
    var Id= ':'+operation+':'+pays+'-'+region+'-'+department+'-'+commune +'-'+ localite+ '-'+randomString 
    return Id
  }

  generateId1(operation, localite/*, departement, commune, localite*/){
    //var pays = pays||'XX'
    //var region = region||'XX'
    //var department = departement || 'XX'
    //var commune = commune || 'XX'
    var localite = localite || 'XX'
    //select 3 random numbers and random letter for up to 25,000 unique per department
    //var chars='ABCDEFGHIJKLMNPQRSTUVWYZ'
    var numbers='0123456789ABCDEFGHIJKLMNPQRSTUVWYZ'
    var randomArray=[]
    for(let i=0;i<20;i++){
      var rand = Math.floor(Math.random()*34)
      randomArray.push(numbers[rand])
    }
    //randomArray.push('-')
    //var rand = Math.floor(Math.random()*24)
    //randomArray.push(chars[rand])
    var randomString=randomArray.join("");
    var Id= operation+':'+localite+/*'-'+department+'-'+commune +'-'+ localite+*/ '-'+randomString 
    return Id
  }
    generateOderId(operation){
    var chars='ABCDEFGHIJKLMNPQRSTUVWYZ'
    var numbers='0123456789'
    var randomArray=[]
    for(let i=0;i<15;i++){
      var rand = Math.floor(Math.random()*10)
      var rand = Math.floor(Math.random()*24)
      randomArray.push(numbers[rand])
      randomArray.push(chars[rand])
    }
    //randomArray.push('-')
    //var rand = Math.floor(Math.random()*24)
    //randomArray.push(chars[rand])
    var randomString=randomArray.join("");
    var Id= ':'+operation+':'+randomString;
    return Id
  }

  destroyDB(){
    return this.localDB.destroy()
  }


  /********************************* Sécurité *********************************************/
  creerUtilisateur(username, passwd, metata = {}){
    return this.remoteDB.signUp(username, passwd, {
      metadata : metata
    });
  }

  connexion(username, passwd){
    return this.remoteDB.logIn(username, passwd);
  }

  deconnexion(){
    return this.remoteDB.logOut();
  }

  getSessionUtilisateur(){
    return this.remoteDB.getSession();
  }

  getInfosUtilisateur(username){
    return this.remoteDB.getUser(username);
  }

  updateInfoUtilisateur(username, metadata){
    return this.remoteDB.putUser(username, {
      metadata : metadata
    });
  }

  supprimerUtilisateur(username){
    return this.remoteDB.deleteUser(username);
  }

  changerMdPass(username, newPaswd){
    return this.remoteDB.changePassword(username, newPaswd);
  }

  changerNomutilisateur(oldUsername, newUsername){
    return this.remoteDB.changeUsername(oldUsername, newUsername);
  }

  creerAdmin(username, passwd){
    return this.remoteDB.signUpAdmin(username, passwd);
  }

  supprimerAdmin(username){
    return this.remoteDB.deleteAdmin(username);
  } 
  

  

  getGroupes(groupes){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.remoteDB.allDocs({
        include_docs: true,
        startkey: 'groupe',
        endkey: 'groupe_\uffff'
      }).then((result) => {
        //console.log(result)
        data = [];
        let doc = result.rows.map((row) => {
           if(groupes.indexOf(row.doc._id.substring(row.doc._id.lastIndexOf('_') + 1, row.doc._id.length)) !== -1){
            //data.push(row);
            data.push(row.doc.data);
          }
        });

        //console.log(data)
        resolve(data);

        }).catch((err) => {
          //console.log('err edd')
          console.log(err)
        });
    } );
  }

  
  getAllUsers(){
    var users_db = new PouchDB(global.conf_serveur.domaine+/*'http://localhost:5984'+*/'/_users'/*, {
      auth: {
        username: username,
        password: pass
      }*
    }*/);

    return users_db.allDocs({
      include_docs: true,
      startkey: 'org.couchdb.user',
      endkey: 'org.couchdb.user:\uffff'
    })

    //si non vide
    /*let data: any;
    if(data){
      return data
    }
    
    return new Promise ( resolve => {
      users_db.allDocs({
        include_docs: true,
        startkey: 'org.couchdb.user',
        endkey: 'org.couchdb.user:\uffff'
      }).then((result) => {
        data = [];
        let d:any = result
        d.rows.map((row) => {
          //if(row.doc.db === 'frna'){
            data.push(row.doc);
          //}
        });
        resolve(data);
      })//.catch((err) => console.log(err));
    });*/
  }



}
