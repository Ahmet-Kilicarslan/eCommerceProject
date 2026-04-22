


export default class ProductApplication {


    constructor(productRepository, productService) {
        this.productRepository = productRepository;
        this.productService = productService;

    }

    async createProduct(product) {
        try {
            return  await this.productService.createProduct(product);

        } catch (err) {
            throw err;
        }
    }

    async updateProduct(product) {
        try {
            return  await this.productService.updateProduct(product);
        } catch (err) {
            throw err;
        }
    }

    async updateAmount(id, amount) {
        try{
            return  await this.productService.updateAmount(id, amount);
        }catch (error) {
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            return  await this.productService.deleteProduct(id);
        } catch (err) {
            throw err
        }
    }

    async getProductById(id) {
    try {
        return  await this.productService.getProductById(id);
    }catch(err) {
        throw err;
    }

    }

      async getProductByAmount(amount) {
        try {
            return await this.productService.getProductByAmount(amount);
        }catch(err) {
            throw err;
        }
    }

    async getProductsBySupplier(id) {
        try{
            return  await this.productService.getProductsBySupplier(id);
        }catch (error) {
            throw error;
        }
    }

    async getAllProducts() {
        try{
         return    await this.productService.getAllProducts();
        }catch(err) {
            throw err;

        }
    }

    async getAllProductsWithDetails() {
        try{

             return await this.productService.getAllProductsWithDetails();
        }catch(err) {
            throw err;

        }
    }

}