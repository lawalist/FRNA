import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  constructor(public popoverController: PopoverController) { }

  ngOnInit() {}

  async close() {
    const onClosedData: string = "Wrapped Up!";
    await this.popoverController.dismiss(onClosedData);
  }
}
