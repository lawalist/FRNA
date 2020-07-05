import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import {global} from '../../globale/variable';

@Component({
  selector: 'app-liste-action',
  templateUrl: './liste-action.component.html',
  styleUrls: ['./liste-action.component.scss'],
})
export class ListeActionComponent implements OnInit {
  retournedAction: any;
  retournetLimite: any;
  monInstitution: any = false;
  localite: any;
  user: any = null;
  idModele: any;
  global = global;
  constructor(private popoverController: PopoverController, private navParams: NavParams) {
    this.retournedAction = this.navParams.data.action;
    this.retournetLimite = this.navParams.data.limite;
    this.monInstitution = this.navParams.data.monInstitution;
    this.localite = this.navParams.data.localite;
    this.user = this.navParams.data.user;
    this.idModele = this.navParams.data.idModele;
   }

  ngOnInit() {}

  async choix(c) {
    await this.popoverController.dismiss(c);
  }

}
