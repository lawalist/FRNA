import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import {global} from '../../globale/variable';

@Component({
  selector: 'app-datatable-construct',
  templateUrl: './datatable-construct.component.html',
  styleUrls: ['./datatable-construct.component.scss'],
})
export class DatatableConstructComponent implements OnInit {

  retournedAction: any;
  cacheAction: any;
  limite: any;
  localite: any;
  user: any = null;
  idModele: any;
  global = global;


  constructor(private popoverController: PopoverController, private navParams: NavParams) {
    this.retournedAction = this.navParams.data.action;
    this.cacheAction = this.navParams.data.cacheAction;
    this.limite = this.navParams.data.limite;
    this.localite = this.navParams.data.localite;
    this.user = this.navParams.data.user;
    this.idModele = this.navParams.data.idModele;
   }

  ngOnInit() {}

  async choix(c) {
    await this.popoverController.dismiss(c);
  }
}
