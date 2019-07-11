import { Injectable } from '@angular/core';
import { global } from '../../globale/variable';
import PouchDB from 'pouchdb';
import { Storage } from '@ionic/storage';
import PouchdbFind from 'pouchdb-find';
//PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('relational-pouch'));
PouchDB.plugin(PouchdbFind);
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
    
    this.localDB = new PouchDB('frna-local-db');
    this.localDB.setMaxListeners(20); // or 30 or 40 or however many you need, 
                                      //to prevent warning (node) warning: possible EventEmitter memory leak detected. 11 listeners added. 
                                      //Use emitter.setMaxListeners() to increase limit.
    //this.remoteDB = new PouchDB('http://localhost:5984/frna-v2');
    //this.sync();
    this.localDB.sync('http://localhost:5984/frna-v2', { live: true, retry: true });
    this.creatDocByTypeIndex();
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

  getDocByType(type, deleted = false/* , sort = true*/){
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
        "type": type,
        "security.deleted": deleted,
      }});
  }

  creatDocByTypeIndex(){
    this.localDB.createIndex({
      index: {
        fields: ['type', 'security.deleted']
      }
    }).then((res) => {
      console.log('creatDocByTypeIndex: '+JSON.stringify(res));
    }).catch((err) => {
      console.log('creatDocByTypeIndex err: '+JSON.stringify(err));
    });
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
    doc.data.updatet_at = dat.toJSON();
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
    
    return this.localDB.put(doc);
  }

  garderCreationTrace(doc){
    let dat = new Date();
    doc.created_at = dat.toJSON();
    doc.updatet_at = dat.toJSON();
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
    
    return doc;
  }

  createLocalite(doc){
    let dat = new Date();
    doc.created_at = dat.toJSON();
    doc.updatet_at = dat.toJSON();
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
    doc.security.updatet_at = dat.toJSON();
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
    doc.data.updatet_at = dat.toJSON();
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
    
    return this.remoteDB.put(doc);
  }


   updateLocalDoc(doc){
    let dat = new Date();
    doc.data.updatet_at = dat.toJSON();
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    
    doc.data.deleted = false;
    
    return this.localDB.put(doc);
  }

  garderUpdateTrace(doc){
    let dat = new Date();
    doc.updatet_at = dat.toJSON();
    if(global.info_user !== null){
      doc.updated_by = global.info_user.name;
    }else{
      doc.updated_by = '';
    }
    
    doc.deleted = false;
    
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
    doc.updatet_at = dat.toJSON();
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
    doc.updatet_at = dat.toJSON();
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
    doc.data.updatet_at = dat.toJSON();
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

  generateId(operation, pays, region, departement, commune, village){
    var pays = pays||'XX'
    var region = region||'XX'
    var department = departement || 'XX'
    var commune = commune || 'XX'
    var village = village || 'XX'
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
    var Id= ':'+operation+':'+pays+'-'+region+'-'+department+'-'+commune +'-'+ village+ '-'+randomString 
    return Id
  }

  generateId1(operation, village/*, departement, commune, village*/){
    //var pays = pays||'XX'
    //var region = region||'XX'
    //var department = departement || 'XX'
    //var commune = commune || 'XX'
    var village = village || 'XX'
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
    var Id= operation+':'+village+/*'-'+department+'-'+commune +'-'+ village+*/ '-'+randomString 
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
