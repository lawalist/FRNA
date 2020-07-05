import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular'
import {global} from '../../globale/variable';

@Component({
  selector: 'app-relations-union',
  templateUrl: './relations-union.component.html',
  styleUrls: ['./relations-union.component.scss'],
})
export class RelationsUnionComponent implements OnInit {
  idModele: any;
  global = global;

  constructor(public popoverController: PopoverController, public navP: NavParams) { 
    this.idModele = this.navP.data.idModele;
  }

  ngOnInit() {}

  async close(res) {
    await this.popoverController.dismiss(res);
  }
}
