import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
//import {RegionPage} from '../../localite/region/region.page'

@Component({
  selector: 'app-relations-pays',
  templateUrl: './relations-pays.component.html',
  styleUrls: ['./relations-pays.component.scss'],
})
export class RelationsPaysComponent implements OnInit {

  codePays: string;
  constructor(private popoverController: PopoverController, private modalController: ModalController, private router: Router, private navParams: NavParams, private navCtrl: NavController) { 
    this.codePays = this.navParams.data.codePays;
  }

  ngOnInit() {}

  async region() {
    
    
    //this.router.navigateByUrl('/localite/regions/pays/'+this.codePays);
    await this.popoverController.dismiss("region");
    //this.presentModal(this.codePays)
  }

  /*async presentModal(codePays) {
    const modal = await this.modalController.create({
      component: RegionPage,
      componentProps: { codePays: codePays }
    });
    return await modal.present();
  }*/

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
