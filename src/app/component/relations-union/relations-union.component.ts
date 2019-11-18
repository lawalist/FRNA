import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular'

@Component({
  selector: 'app-relations-union',
  templateUrl: './relations-union.component.html',
  styleUrls: ['./relations-union.component.scss'],
})
export class RelationsUnionComponent implements OnInit {

  constructor(public popoverController: PopoverController) { }

  ngOnInit() {}

  async close(res) {
    await this.popoverController.dismiss(res);
  }
}
