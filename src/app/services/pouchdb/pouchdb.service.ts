import { Injectable } from '@angular/core';
import { global } from '../../globale/variable';
import PouchDB from 'pouchdb';
import { Storage } from '@ionic/storage';
import PouchdbFind from 'pouchdb-find';
import * as Relational from 'relational-pouch';
import { DepartementPage } from 'src/app/localite/departement/departement.page';

//var PouchDB = require('pouchdb')
//PouchDB.plugin(require('pouchdb-find'));
//PouchDB.plugin(require('relational-pouch'));

//PouchDB.plugin(require('pouch-resolve-conflicts'))
//PouchDB.plugin(require('pouchdb-find'));


@Injectable({
  providedIn: 'root'
})
export class PouchdbService {

  public remoteDB: any;
  public localDB: any;
  private isInstantiated: boolean;
  private  pouchOpts = {
        skip_setup: true
    };
  private  data: any;

  constructor(private storage: Storage) {
    PouchDB.plugin(Relational);
    PouchDB.plugin(PouchdbFind);

    this.localDB = new PouchDB('frna-local-db');
    this.localDB.setMaxListeners(20); // or 30 or 40 or however many you need, 
                                      //to prevent warning (node) warning: possible EventEmitter memory leak detected. 11 listeners added. 
                                      //Use emitter.setMaxListeners() to increase limit.
    //this.remoteDB = new PouchDB('http://localhost:5984/frna-v2');
    //this.sync();
    this.localDB.sync('http://localhost:5984/frna-v2', { live: true, retry: true });
    this.creatDocByTypeSecondIndex();
    this.createDBSchema();
   }

   createDBSchema(){
    //une fédération peut avoir plusieurs union
    this.localDB.setSchema([
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
        singular: 'membre',
        plural: 'membres',
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
      }
    ]);
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
    PouchDB.sync(this.localDB, this.remoteDB);
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
    let dat = new Date();
    doc.data.created_at = dat.toJSON();
    doc.data.updated_at = dat.toJSON();
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
    let dat = new Date();
    doc.created_at = dat.toJSON();
    doc.updated_at = dat.toJSON();
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
    let dat = new Date();
    doc.created_at = dat.toJSON();
    doc.updated_at = dat.toJSON();
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
    let dat = new Date();
    doc.data.created_at = dat.toJSON();
    doc.data.updated_at = dat.toJSON();
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
    let dat = new Date();
    doc.data.updated_at = dat.toJSON();
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    
    //doc.data.deleted = false;
    
    return this.localDB.put(doc);
  }

  garderUpdateTrace(doc){
    let dat = new Date();
    doc.updated_at = dat.toJSON();
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
    let dat = new Date();
    doc.deleted_at = dat.toJSON();
    if(global.info_user !== null){
      doc.deleted_by = global.info_user.name;
    }else{
      doc.deleted_by = '';
    }
    doc.deleted = true;
    return doc;
  }

  garderRestaureTrace(doc){
    let dat = new Date();
    doc.deleted_at = dat.toJSON();
    if(global.info_user !== null){
      doc.deleted_by = global.info_user.name;
    }else{
      doc.deleted_by = '';
    }
    doc.deleted = false;
    return doc;
  }

  garderArchivedTrace(doc){
    let dat = new Date();
    doc.archived_at = dat.toJSON();
    if(global.info_user !== null){
      doc.archived_by = global.info_user.name;
    }else{
      doc.archived_by = '';
    }
    doc.archived = true;
    return doc;
  }

  garderDesarchivedTrace(doc){
    let dat = new Date();
    doc.archived_at = dat.toJSON();
    if(global.info_user !== null){
      doc.archived_by = global.info_user.name;
    }else{
      doc.archived_by = '';
    }
    doc.archived = false;
    return doc;
  }

  garderSharedTrace(doc, url){
    let dat = new Date();
    doc.shared_at = dat.toJSON();
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
    let dat = new Date();
    doc.deleted_at = dat.toJSON();
    if(global.info_user !== null){
      doc.deleted_by = global.info_user.name;
    }else{
      doc.deleted_by = '';
    }
    doc.deleted = true;
    this.localDB.put(doc);
  }

  deleteLocaliteDefinitivement(doc){
    let dat = new Date();
    doc.deleted_at = dat.toJSON();
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
    let dat = new Date();
    doc.updated_at = dat.toJSON();
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
    let dat = new Date();
    doc.data.updated_at = dat.toJSON();
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
    let dat = new Date();
    doc.data.deleted_at = dat.toJSON();
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
    let dat = new Date();
    doc.data.deleted_at = dat.toJSON();
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


}
