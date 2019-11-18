import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CorpImageComponent } from './corp-image.component';

describe('CorpImageComponent', () => {
  let component: CorpImageComponent;
  let fixture: ComponentFixture<CorpImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorpImageComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CorpImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
