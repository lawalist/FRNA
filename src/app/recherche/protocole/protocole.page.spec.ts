import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolePage } from './protocole.page';

describe('ProtocolePage', () => {
  let component: ProtocolePage;
  let fixture: ComponentFixture<ProtocolePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtocolePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
