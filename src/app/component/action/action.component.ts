import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
})
export class ActionComponent implements OnInit {
  parager: boolean;

  constructor(private popoverController: PopoverController, private navParams: NavParams) {
    this.parager = this.navParams.data.parager;
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
