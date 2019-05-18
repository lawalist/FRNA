import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VillagePage } from './village.page';

describe('VillagePage', () => {
  let component: VillagePage;
  let fixture: ComponentFixture<VillagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VillagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VillagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
