import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular'
import {global} from '../../globale/variable';

@Component({
  selector: 'app-relations-partenaire',
  templateUrl: './relations-partenaire.component.html',
  styleUrls: ['./relations-partenaire.component.scss'],
})
export class RelationsPartenaireComponent implements OnInit {
  idModele: any;
  global = global;
  constructor(public popoverController: PopoverController, public navP: NavParams) { 
    this.idModele = this.navP.data.idModele;
  }

  ngOnInit() {}

  async choix(res) {
    await this.popoverController.dismiss(res);
  }
}
