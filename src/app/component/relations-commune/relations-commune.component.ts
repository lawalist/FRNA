import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { global } from '../../globale/variable';
 
@Component({
  selector: 'app-relations-commune',
  templateUrl: './relations-commune.component.html',
  styleUrls: ['./relations-commune.component.scss'],
})
export class RelationsCommuneComponent implements OnInit {

  codeCommune: string;
  global = global;
  constructor(private navParams: NavParams, private popoverController: PopoverController) { 
    this.codeCommune = this.navParams.data.codeCommune;
  }

  ngOnInit() {}

  async localite() {
    await this.popoverController.dismiss('localite');
  }


  async crop(){
    await this.popoverController.dismiss('crop');
  }

  async choix(c) {
    await this.popoverController.dismiss(c);
  }
}
