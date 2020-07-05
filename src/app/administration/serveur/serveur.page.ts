import { Component, OnInit } from '@angular/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';

@Component({
  selector: 'app-serveur',
  templateUrl: './serveur.page.html',
  styleUrls: ['./serveur.page.scss'],
})
export class ServeurPage implements OnInit {

  constructor(private servicePouchdb: PouchdbService) { }

  ngOnInit() {
  }

  ajouterFiltre(){
    this.servicePouchdb.getRemoteDocById('_design/filtreDonnees').then((res) => {
      if(res){
        this.servicePouchdb.filtreDesignDoc(this.servicePouchdb.remoteDB, res._rev).then((res) => {
          console.log(res);
          alert('Filtre mis à jour avec succes')
        }).catch((err) => {
          console.log(err);
          alert('Erreur ajout filtre');
        })
      }else{
        this.servicePouchdb.filtreDesignDoc(this.servicePouchdb.remoteDB).then((res) => {
          console.log(res);
          alert('Filtre ajouté avec succes')
        }).catch((err) => {
          console.log(err);
          alert('Erreur ajout filtre');
        })
      }
    }).catch((err) => {
      console.log(err);
      this.servicePouchdb.filtreDesignDoc(this.servicePouchdb.remoteDB).then((res) => {
        console.log(res);
        alert('Filtre ajouté avec succes')
      }).catch((err) => {
        console.log(err);
        alert('Erreur ajout filtre');
      })
    })
    
  }
}
