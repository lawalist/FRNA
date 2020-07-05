import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular'
import {global} from '../../globale/variable';

@Component({
  selector: 'app-relations-op',
  templateUrl: './relations-op.component.html',
  styleUrls: ['./relations-op.component.scss'],
})
export class RelationsOpComponent implements OnInit {
  idModele: any;
  global = global;

  constructor(public popoverController: PopoverController, public navParams: NavParams) {
    this.idModele = this.navParams.data.idModele;
   }

  ngOnInit() {}

  async choix(res) {
    await this.popoverController.dismiss(res);
  }

}
