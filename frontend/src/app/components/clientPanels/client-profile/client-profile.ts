import {Component, OnChanges, OnInit, SimpleChanges,Input} from '@angular/core';
import userService from '../../../services/UserService';
import purchaseService from '../../../services/PurchaseService';
import {purchasedProduct, Purchase, PurchasedProductWithDetails} from '../../../models/Purchase'
import {User} from '../../../models/User';
import {CommonModule, DatePipe} from '@angular/common';
import ProductComponent from '../../adminPanels/Product/add-editProduct/Product.component';
import profileEditModal from '../client-profile-edit/client-profile-edit';
import utilService from '../../../services/UtilsService';

@Component({
  selector: 'app-client-profile',
  imports: [
    CommonModule,
    profileEditModal
  ],
  templateUrl: './client-profile.html',
  styleUrl: './client-profile.css',

})
export default class ClientProfile implements OnInit  {


  constructor(private userService: userService,
              private purchaseService: purchaseService,
              private utilService: utilService,
  ) {
  }

currentUser: any = null;

  error = '';
  isLoading = false;
  purchaseLog: Purchase[] = [];
  purchasedProducts: PurchasedProductWithDetails[] = [];

  expandedPurchaseId: number | null = null;

  newestFirst: boolean = false;

 async ngOnInit() {
     this.loadUserProfile();

  }



    loadUserProfile() {

    this.currentUser =   this.userService.getCurrentUser();

    console.log('📋 Showing cached user data:', this.currentUser);

    if (this.currentUser) {
      this.loadPurchaseLogInAscendingOrder(); // Load with cached data first in ascending order

    } else {

      this.fetchFreshProfile();
    }
  }
  isSorting = false;

  async toggleSort() {
    this.isSorting = true;

    // Optional: small delay for UX
    await new Promise(resolve => setTimeout(resolve, 100));

    if (this.newestFirst) {
      await this.loadPurchaseLogInDescendingOrder();
    } else {
      await this.loadPurchaseLogInAscendingOrder();
    }

    this.isSorting = false;
  }


  trackByPurchaseId(index: number, purchase: any): any {
    return purchase.id;
  }

  /*toggleSort() {

    this.newestFirst ?
      this.loadPurchaseLogInDescendingOrder()
      : this.loadPurchaseLogInAscendingOrder();

  }*/

  getSortType(): String {
    return this.newestFirst ? "newest First" : "Oldest First";
    //return this.newestFirst? "chevron-double-down " : "chevron-double-up";
  }

  loadPurchaseLogInDescendingOrder() {
    this.error = '';

    if (!this.currentUser || !this.currentUser.id) {
      console.warn(' No user available for purchase log');
      return;
    }
    this.isLoading = true;

    this.purchaseService.getPurchasesByUserIdInDescendingOrder(this.currentUser.id).subscribe({
      next: (purchaseData: Purchase[]) => {

        console.log('✅ Purchase data received in descending order:', purchaseData);
        console.log('✅ Number of purchases:', purchaseData?.length);

        this.purchaseLog = purchaseData;

        console.log('✅ purchaseLog updated in descending order:', this.purchaseLog);
        console.log('✅ purchaseLog length:', this.purchaseLog.length);

        this.isLoading = false;
        this.newestFirst = false;

      }, error: (error: any) => {
        console.error('❌ Failed to fetch purchase log in Descending order:', error);
        this.error = 'Failed load purchase log in Descending order';
      }
    })

  }

  loadPurchaseLogInAscendingOrder() {
    this.error = '';

    if (!this.currentUser || !this.currentUser.id) {
      console.warn(' No user available for purchase log');
      return;
    }
    this.isLoading = true;

    this.purchaseService.getPurchasesByUserIdInAscendingOrder(this.currentUser.id).subscribe({
      next: (purchaseData: Purchase[]) => {

        console.log('✅ Purchase data received:', purchaseData);
        console.log('✅ Number of purchases:', purchaseData?.length);

        this.purchaseLog = purchaseData;

        console.log('✅ purchaseLog updated:', this.purchaseLog);
        console.log('✅ purchaseLog length:', this.purchaseLog.length);

        this.isLoading = false;
        this.newestFirst = true;//prepare boolean value 'newestFirst' for toggling
      }, error: (error: any) => {
        console.error('❌ Failed to fetch purchase log :', error);
        this.error = 'Failed load purchase log';
      }
    })

  }


  fetchFreshProfile() {
    this.isLoading = true;
    this.error = '';

    this.userService.getProfile().subscribe({
      next: (response: User) => {
        console.log('🔄 Fresh profile data received:', response);

        this.currentUser = (response as any).user || response;
        if (this.currentUser) {
          this.loadPurchaseLogInAscendingOrder();
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Failed to fetch fresh profile:', error);
        this.error = 'Failed to load latest profile data';
        this.isLoading = false;


        if (!this.currentUser) {
          this.currentUser = this.userService.getCurrentUser();
        }
      }, complete: () => {
        this.isLoading = false;

      }
    });
  }


  togglePurchasedProducts(purchaseId: number) {
    if (this.expandedPurchaseId === purchaseId) {

      this.expandedPurchaseId = null;

      this.purchasedProducts = [];
    } else {

      this.expandedPurchaseId = purchaseId;
      this.loadItemsByPurchaseId(purchaseId);

    }

  }

  loadItemsByPurchaseId(purchaseId: number) {
    this.error = '';


    this.purchaseService.getItemsByPurchaseId(purchaseId).subscribe({
      next: (purchaseData: PurchasedProductWithDetails[]) => {

        console.log('✅ Purchased products  received:', purchaseData);
        this.purchasedProducts = purchaseData;
        console.log('✅ purchase data length:', this.purchasedProducts.length);

      },
      error: (error: any) => {
        console.error('❌ Failed to fetch purchased products :', error);
        this.error = 'Failed load purchase log';
      }
    })

  }

  getIcon(purchaseId: number): string {
    return this.isExpanded(purchaseId) ? 'bi-chevron-up' : 'bi-chevron-down';

  }

  isExpanded(purchaseId: number): boolean {
    return this.expandedPurchaseId == purchaseId;

  }

  handleOpenEditModal(): void {
    this.utilService.openModal('editProfileModal');

  }

 handleSave(updatedUser: Partial<User>): void {
    this.error = '';
    const userToUpdate = {...this.currentUser, ...updatedUser};


    this.userService.updateUser(userToUpdate).subscribe({
      next: (response: User) => {



        console.log('Successfully updated user : ', response);
        this.utilService.closeModal('editProfileModal');
        console.log('Successfully updated user:', response);
        console.log('Response type:', typeof response);
        console.log('Username specifically:', response.username);
        console.log('Full response structure:', JSON.stringify(response, null, 2));
        this.currentUser = response;
        this.fetchFreshProfile();

      }, error: (error: any) => {

        console.error('❌ Failed to update user:', error);
        this.error = 'Failed to update user';

      }
    });

  }

  handleCancel(): void {
    this.utilService.closeModal('editProfileModal');


  }


}

