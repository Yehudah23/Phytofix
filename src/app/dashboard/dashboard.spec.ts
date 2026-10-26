import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { provideRouter } from '@angular/router';
import { AuthService } from '../auth.service';
import { OrderService } from '../order.service';
import { NewsService } from '../news.service';
import { RoutineService } from '../routine.service';
import { UserProductService } from '../user-product.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => null } },
        { provide: OrderService, useValue: { myViews: () => [] } },
        { provide: NewsService, useValue: { latest: () => () => [] } },
        { provide: RoutineService, useValue: { prescribedForUser: () => [] } },
        { provide: UserProductService, useValue: { myTrackedProducts: () => [] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
