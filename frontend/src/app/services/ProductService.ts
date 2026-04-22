import {Injectable} from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import Product from '../models/Product';
import ProductWithDetails from '../models/ProductWithDetails';


@Injectable({
  providedIn: 'root'
})
export default class ProductService {
  private apiUrl = 'http://localhost:3000/Product';

  constructor(private http: HttpClient) {
  }

   uploadProductImage(file: File):Observable<any> {
    const formData = new FormData();
    formData.append('productImage', file);
    return this.http.post(`http://localhost:3000/Uploads/product-image`,formData).pipe(
      tap((response)=>{
        return response;
      }),catchError((error)=>{
        console.log(error);
        return throwError(()=>error.message);
      })
    )

  }


  getAllProductsWithDetails(): Observable<ProductWithDetails[]> {

    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return this.http.get<ProductWithDetails[]>(`${this.apiUrl}/getALL`, { headers }).pipe(

      tap((response) => {

        response.forEach(product => {
          if(product.imageUrl){
            product.imageUrl = `http://localhost:3000${product.imageUrl}`;
          }
        })
        console.log("here is products in inventory", response);
        return response;

      }),catchError((error)=>{

        console.error(error);
        return throwError(() => error.message);

      })
    );
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);

  }

  getProductBySupplier(supplier: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/getBySupplierId/${supplier}`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/getByProductId/${id}`);
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);

  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(this.apiUrl, product);
  }

  updateProductAmount(id: number, newAmount: number): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/decreaseAmount/${id}`, {amount:newAmount}).pipe(
      tap((response) => {
        console.log("successfully updated product amount in service", response);
      }), catchError((error) => {
        console.error(error);
        return throwError(() => error.message);

      })
    );
  }

  deleteProduct(id: number): Observable<Object> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
