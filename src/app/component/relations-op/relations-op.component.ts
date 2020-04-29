import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular'

@Component({
  selector: 'app-relations-op',
  templateUrl: './relations-op.component.html',
  styleUrls: ['./relations-op.component.scss'],
})
export class RelationsOpComponent implements OnInit {

  constructor(public popoverController: PopoverController) { }

  ngOnInit() {}

  async choix(res) {
    await this.popoverController.dismiss(res);
  }

}
