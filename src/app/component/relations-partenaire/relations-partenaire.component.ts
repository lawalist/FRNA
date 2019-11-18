import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular'

@Component({
  selector: 'app-relations-partenaire',
  templateUrl: './relations-partenaire.component.html',
  styleUrls: ['./relations-partenaire.component.scss'],
})
export class RelationsPartenaireComponent implements OnInit {

  constructor(public popoverController: PopoverController) { }

  ngOnInit() {}

  async choix(res) {
    await this.popoverController.dismiss(res);
  }
}
