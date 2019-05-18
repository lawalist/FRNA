import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypologiePage } from './typologie.page';

describe('TypologiePage', () => {
  let component: TypologiePage;
  let fixture: ComponentFixture<TypologiePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypologiePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypologiePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
