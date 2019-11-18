import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-relations-departement',
  templateUrl: './relations-departement.component.html',
  styleUrls: ['./relations-departement.component.scss'],
})
export class RelationsDepartementComponent implements OnInit {

  codeDepartement: string;
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
}
