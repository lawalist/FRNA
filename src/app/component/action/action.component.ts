import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
})
export class ActionComponent implements OnInit {

  constructor(private popoverController: PopoverController) { }

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
  async supprimer() {
    await this.popoverController.dismiss('supprimer');
  }

}
