import { Component, OnInit } from '@angular/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb.service';

@Component({
  selector: 'app-bd-locale',
  templateUrl: './bd-locale.page.html',
  styleUrls: ['./bd-locale.page.scss'],
})
export class BDLocalePage implements OnInit {

  constructor(private servicePouchdb: PouchdbService) { }

  ngOnInit() {
  }

  destroyDBs(){
    this.servicePouchdb.destroyDB().then((res) => {
      alert("BD réinitialisée avec succes")
    }).catch((err) => {
      alert('err suppression BD '+err)
    });
  }

}
