import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, NavController } from '@ionic/angular';

@Component({
  selector: 'app-relations-pays',
  templateUrl: './relations-pays.component.html',
  styleUrls: ['./relations-pays.component.scss'],
})
export class RelationsPaysComponent implements OnInit {

  codePays: string;
  constructor(private popoverController: PopoverController, private navParams: NavParams, private navCtrl: NavController) { 
    this.codePays = this.navParams.data.codePays;
  }

  ngOnInit() {}

  async region() {
    
    this.navCtrl.navigateForward('/localite/regions/pays/'+this.codePays)
    await this.popoverController.dismiss(/*"region"*/);
  }

  async departement() {
    await this.popoverController.dismiss('departement');
  }
  async commune() {
    await this.popoverController.dismiss('commune');
  }
  async village() {
    await this.popoverController.dismiss('village');
  }

}
