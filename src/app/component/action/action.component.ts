import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import {global} from '../../globale/variable';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
})
export class ActionComponent implements OnInit {
  parager: boolean;
  idModele: any;
  global = global;

  constructor(private popoverController: PopoverController, private navParams: NavParams) {
    this.parager = this.navParams.data.parager;
    this.idModele = this.navParams.data.idModele;
   }

  ngOnInit() {}

  
  async ajouter() {
    await this.popoverController.dismiss("ajouter");
  }

  async infos() {
    await this.popoverController.dismiss('infos');
  }
  async modifier() {
    await this.popoverController.dismiss('modifier');
  }
  
  async partager() {
    await this.popoverController.dismiss('partager');
  }

  async supprimer() {
    await this.popoverController.dismiss('supprimer');
  }

}
