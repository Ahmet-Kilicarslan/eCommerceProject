import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import App from '../app';
import LoginComponent from '../components/Login/login-component/login-component';
import ProductComponent from '../components/adminPanels/Product/add-editProduct/Product.component';
import Cart from '../components/clientPanels/cart/cart';
import Product from '../models/Product';
import ProductService from '../services/ProductService';
import PurchaseService from '../services/PurchaseService';
import SupplierService from '../services/SupplierService';
import UserService from '../services/UserService';

describe('Frontend unit tests', () => {
  describe('App', () => {
    let userServiceSpy: jasmine.SpyObj<UserService>;

    beforeEach(async () => {
      userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
        'initiateAuth',
        'checkAuthStatus',
        'getCurrentUser',
        'isAuthenticated',
        'isAdmin',
        'isClient',
      ]);

      userServiceSpy.initiateAuth.and.returnValue(Promise.resolve());
      userServiceSpy.checkAuthStatus.and.returnValue(of({ isAuthenticated: false }));
      userServiceSpy.getCurrentUser.and.returnValue(null);
      userServiceSpy.isAuthenticated.and.returnValue(false);
      userServiceSpy.isAdmin.and.returnValue(false);
      userServiceSpy.isClient.and.returnValue(false);

      await TestBed.configureTestingModule({
        imports: [App],
        providers: [
          provideRouter([]),
          { provide: UserService, useValue: userServiceSpy },
        ],
      }).compileComponents();
    });

    it('should create the app', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;

      expect(app).toBeTruthy();
    });

    it('should render the application layout', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('.app-container')).toBeTruthy();
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });
  });

  describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
      userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
        'checkAuthStatus',
        'login',
        'register',
        'getAllUsers',
      ]);
      routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

      userServiceSpy.checkAuthStatus.and.returnValue(throwError(() => 'not authenticated'));
      userServiceSpy.getAllUsers.and.returnValue(of([]));
      routerSpy.navigate.and.returnValue(Promise.resolve(true));

      await TestBed.configureTestingModule({
        imports: [LoginComponent],
        providers: [
          { provide: UserService, useValue: userServiceSpy },
          { provide: Router, useValue: routerSpy },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show an error when login username is empty', () => {
      component.loginData = { username: '', password: '123456' };

      component.handleLogin();

      expect(component.loginError).toBe('Username is required');
      expect(component.isLoginLoading).toBeFalse();
      expect(userServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should show an error when login password is empty', () => {
      component.loginData = { username: 'merve', password: '' };

      component.handleLogin();

      expect(component.loginError).toBe('Password is required');
      expect(component.isLoginLoading).toBeFalse();
      expect(userServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should call login service and navigate admin users to dashboard', () => {
      userServiceSpy.login.and.returnValue(of({
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@test.com',
          role: 'admin',
        },
        token: 'token',
      }));
      component.loginData = { username: 'admin', password: '123456' };

      component.handleLogin();

      expect(userServiceSpy.login).toHaveBeenCalledWith(component.loginData);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/Dashboard']);
      expect(component.isLoginLoading).toBeFalse();
    });

    it('should reject register form when email format is invalid', async () => {
      component.registerData = {
        username: 'newuser',
        password: '123456',
        email: 'wrong-email',
      };

      await component.handleRegister();

      expect(component.registerError).toBe('Valid Email is required');
      expect(component.isRegisterLoading).toBeFalse();
      expect(userServiceSpy.register).not.toHaveBeenCalled();
    });

    it('should reject register form when username already exists', async () => {
      userServiceSpy.getAllUsers.and.returnValue(of([
        {
          id: 1,
          username: 'merve',
          password: 'secret',
          role: 'user',
          email: 'merve@test.com',
        },
      ]));
      component.registerData = {
        username: 'Merve',
        password: '123456',
        email: 'merve2@test.com',
      };

      await component.handleRegister();

      expect(component.registerError).toBe('This username already exists');
      expect(userServiceSpy.register).not.toHaveBeenCalled();
    });
  });

  describe('Cart', () => {
    let component: Cart;
    let fixture: ComponentFixture<Cart>;

    const product: Product = {
      id: 10,
      name: 'Laptop',
      amount: 5,
      price: 1200,
      supplier: 1,
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [Cart],
        providers: [
          { provide: PurchaseService, useValue: {} },
          { provide: ProductService, useValue: {} },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(Cart);
      component = fixture.componentInstance;
    });

    it('should show empty cart message when there are no items', () => {
      component.cartItems = [];
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Your cart is empty');
    });

    it('should render product rows and total amount', () => {
      component.cartItems = [{ product, quantity: 2 }];
      component.totalAmount = 2400;

      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Laptop');
      expect(text).toContain('Stock: 5');
      expect(text).toContain('Total:');
      expect(text).toContain('2400');
    });

    it('should emit onBuy when buy button is clicked', () => {
      spyOn(component.onBuy, 'emit');
      component.cartItems = [{ product, quantity: 1 }];

      fixture.detectChanges();
      fixture.nativeElement.querySelector('.btn-success').click();

      expect(component.onBuy.emit).toHaveBeenCalled();
    });

    it('should emit product id when removing an item', () => {
      spyOn(component.onRemove, 'emit');

      component.removeItem(product.id);

      expect(component.onRemove.emit).toHaveBeenCalledWith(10);
    });

    it('should emit updated quantity with product id', () => {
      spyOn(component.onUpdate, 'emit');

      component.updateQuantity({ product, quantity: 2 }, 3);

      expect(component.onUpdate.emit).toHaveBeenCalledWith({
        productId: 10,
        newQuantity: 3,
      });
    });
  });

  describe('ProductComponent', () => {
    let component: ProductComponent;
    let fixture: ComponentFixture<ProductComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ProductComponent],
        providers: [
          { provide: SupplierService, useValue: {} },
          { provide: ProductService, useValue: jasmine.createSpyObj('ProductService', ['uploadProductImage']) },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ProductComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should reset to an empty product in create mode', () => {
      component.isEditMode = false;
      component.productData = null;

      component.resetForm();

      expect(component.product).toEqual({
        id: null,
        name: '',
        amount: 0,
        price: 0,
        supplier: 0,
        supplierName: '',
        imageUrl: '',
      });
    });

    it('should fill product values in edit mode', () => {
      component.isEditMode = true;
      component.productData = {
        id: 1,
        name: 'Keyboard',
        amount: 8,
        price: 350,
        supplier: 2,
        supplierName: 'Tech Supplier',
        imageUrl: '/uploads/keyboard.jpg',
      };

      component.ngOnChanges({
        productData: new SimpleChange(null, component.productData, false),
      });

      expect(component.product.name).toBe('Keyboard');
      expect(component.typedSupplier).toBe('Tech Supplier');
      expect(component.selectedSupplierId).toBe(2);
    });

    it('should filter suppliers by typed text', () => {
      component.suppliers = [
        { id: 1, name: 'Tech Supplier', contact: 'tech@test.com' },
        { id: 2, name: 'Office Store', contact: 'office@test.com' },
      ];
      component.typedSupplier = 'tech';

      component.onSupplierInputChange();

      expect(component.filteredSuppliers.length).toBe(1);
      expect(component.filteredSuppliers[0].name).toBe('Tech Supplier');
      expect(component.showDropdown).toBeTrue();
    });

    it('should set selected supplier from dropdown', () => {
      const supplier = { id: 3, name: 'Main Supplier', contact: 'main@test.com' };

      component.selectSupplier(supplier);

      expect(component.typedSupplier).toBe('Main Supplier');
      expect(component.selectedSupplierId).toBe(3);
      expect(component.product.supplier).toBe(3);
      expect(component.showDropdown).toBeFalse();
    });

    it('should not save when supplier is not selected', () => {
      spyOn(window, 'alert');
      spyOn(component.onSave, 'emit');
      component.selectedSupplierId = 0;

      component.onSubmit();

      expect(window.alert).toHaveBeenCalledWith('Please select a valid supplier');
      expect(component.onSave.emit).not.toHaveBeenCalled();
    });

    it('should emit product when form is valid and supplier is selected', () => {
      spyOn(component.onSave, 'emit');
      component.selectedSupplierId = 4;
      component.product = {
        id: null,
        name: 'Mouse',
        amount: 12,
        price: 200,
        supplier: 0,
        supplierName: 'Accessory Supplier',
        imageUrl: '',
      };

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      spyOn(form, 'checkValidity').and.returnValue(true);

      component.onSubmit();

      expect(component.product.supplier).toBe(4);
      expect(component.onSave.emit).toHaveBeenCalledWith(component.product);
    });
  });
});
