import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartenairePage } from './partenaire.page';

describe('PartenairePage', () => {
  let component: PartenairePage;
  let fixture: ComponentFixture<PartenairePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartenairePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartenairePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
