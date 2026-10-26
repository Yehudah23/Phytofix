import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Products } from './products';
import { provideRouter } from '@angular/router';
import { ProductService } from '../product.service';
import { AuthService } from '../auth.service';
import { CartService } from '../cart.service';
import { UserProductService } from '../user-product.service';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: { products: () => [], error: () => null } },
        { provide: AuthService, useValue: { currentUser: () => null } },
        { provide: CartService, useValue: {} },
        { provide: UserProductService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
