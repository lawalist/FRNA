import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, NavController } from '@ionic/angular';

@Component({
  selector: 'app-relations-region',
  templateUrl: './relations-region.component.html',
  styleUrls: ['./relations-region.component.scss'],
})
export class RelationsRegionComponent implements OnInit {

  
  codeRegion: string;
  constructor(private popoverController: PopoverController, private navParams: NavParams, private navCtrl: NavController) { 
    this.codeRegion = this.navParams.data.codeRegion;
  }

  ngOnInit() {}

  async departement() {
    await this.popoverController.dismiss('departement');
  }
  async commune() {
    await this.popoverController.dismiss('commune');
  }
  async localite() {
    await this.popoverController.dismiss('localite');
  }


}
