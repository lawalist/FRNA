import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { global } from '../../globale/variable';

@Component({
  selector: 'app-liste-more',
  templateUrl: './liste-more.component.html',
  styleUrls: ['./liste-more.component.scss'],
})
export class ListeMoreComponent implements OnInit {

  options = {};
  peutExporterDonnees = global.peutExporterDonnees;
  constructor(private popoverController: PopoverController, private navParams: NavParams) {
    this.options = this.navParams.data.options;
   }

  ngOnInit() {}

  async choix(c) {
    await this.popoverController.dismiss(c);
  }
}
