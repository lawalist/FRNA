import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
 
@Component({
  selector: 'app-relations-commune',
  templateUrl: './relations-commune.component.html',
  styleUrls: ['./relations-commune.component.scss'],
})
export class RelationsCommuneComponent implements OnInit {

  codeCommune: string;
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
}
