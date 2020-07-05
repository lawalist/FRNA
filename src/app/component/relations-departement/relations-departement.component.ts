import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { global } from '../../globale/variable';

@Component({
  selector: 'app-relations-departement',
  templateUrl: './relations-departement.component.html',
  styleUrls: ['./relations-departement.component.scss'],
})
export class RelationsDepartementComponent implements OnInit {

  codeDepartement: string;
  global = global;
  constructor(private navParams: NavParams, private popoverController: PopoverController) { 
    this.codeDepartement = this.navParams.data.codeDepartement;
  }

  ngOnInit() {}

  async commune() {
    await this.popoverController.dismiss('commune');
  }
  async localite() {
    await this.popoverController.dismiss('localite');
  }

  async choix(c) {
    await this.popoverController.dismiss(c);
  }
}
