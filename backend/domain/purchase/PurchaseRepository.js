import {pool} from "../../infrastructure/dbc.js";
import purchaseFactory from "./PurchaseFactory.js";
import {Purchase, PurchasedProduct} from "./Purchase.js";

export default class PurchaseRepository {

    //creating purchase
     async createPurchase(purchase) {
        try {
            const sql = 'INSERT INTO purchase (userId,totalAmount) VALUES (?,?)';
            const [result] = await pool.query(sql, [purchase.userId, purchase.totalAmount]);
            return new Purchase(result.insertId, purchase.userId, [], purchase.totalAmount, purchase.date,);

        } catch (err) {
            console.log(err);
            throw err;
        }
    }

//get purchases by user id ascending or descending order
     async getPurchaseByUserId(userId, order = 'desc') {
        try {
            const orderClause = order === 'asc' ? 'ORDER BY date ASC' : 'ORDER BY date DESC';

            const sql = `SELECT * FROM purchase WHERE userId = ? ${orderClause}`;

            const [result] = await pool.query(sql, [userId]);

            return result.map((purchase) => new Purchase(
                purchase.id,
                purchase.userId,
                [],
                purchase.totalAmount,
                purchase.date
            ))
        } catch (err) {
            console.log(err);
            throw err;
        }


    }


    //getting purchases by user id in ascending order
         async getPurchasesByUserIdInAscendingOrder(userId) {
            try {
                const sql = 'SELECT * FROM purchase WHERE userId = ? ORDER BY DATE ASC ';
                const [result] = await pool.query(sql, [userId]);
                return result.map((purchase) => new Purchase(
                    purchase.id,
                    purchase.userId,
                    [],
                    purchase.totalAmount,
                    purchase.date
                ));
            } catch (err) {
                console.log(err);
                throw err;
            }
        }

    //getting purchases by user id in descending order
         async getPurchasesByUserIdInDescendingOrder(userId) {
            try {
                const sql = 'SELECT * FROM purchase WHERE userId = ? ORDER BY DATE DESC ';
                const [result] = await pool.query(sql, [userId]);
                return result.map((purchase) => new Purchase(
                    purchase.id,
                    purchase.userId,
                    [],
                    purchase.totalAmount,
                    purchase.date
                ))
                    ;
            } catch (err) {
                console.log(err);
                throw err;
            }
        }

    //get purchasedProducts by purchase id
     async getPurchasedProductsByPurchaseId(purchaseId) {
        try {
            const sql = `
                SELECT bought.id,
                       bought.purchaseId,
                       bought.productId,
                       bought.quantity,
                       bought.price as purchasePrice,
                       item.id      as originalProductId,
                       item.name    as productName,
                       item.amount  as stockAmount,
                       item.price   as currentPrice
                FROM purchasedProduct bought
                         INNER JOIN products item ON bought.productId = item.id
                WHERE bought.purchaseId = ?
            `;
            const purchasedProducts = await pool.query(sql, [purchaseId]);

            console.log('🔍 DAO: Raw SQL result:', purchasedProducts);
            console.log('🔍 DAO: Result type:', typeof purchasedProducts);
            console.log('🔍 DAO: Is array?', Array.isArray(purchasedProducts));
            console.log('🔍 DAO: Length:', purchasedProducts?.length);

            return purchasedProducts[0];


        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    //get purchase with items
     async getPurchaseWithItems(purchaseId) {
        try {
            const sql = `
                SELECT p.id  as purchaseId,
                       p.userId,
                       p.totalAmount,
                       p.date,
                       pp.id as id,
                       pp.productId,
                       pp.quantity,
                       pp.price
                FROM purchase p
                         LEFT JOIN purchasedProduct pp ON p.id = pp.purchaseId
                WHERE p.id = ?
            `;

            const [rows] = await pool.query(sql, [purchaseId]);

            if (rows.length === 0) {
                return null; // Purchase not found
            }


            const purchaseData = rows[0];


            const purchase = await purchaseFactory.createPurchaseFromDB(purchaseData);

            purchase.products = rows.filter(row => row.id !== null)
                .map(row => new PurchasedProduct(
                    row.id,
                    purchaseData.purchaseId,
                    row.productId,
                    row.quantity,
                    row.price
                ));

            return purchase;


        } catch (err) {
            console.log(err);
            throw err;
        }
    }

     async addProductToPurchasedProduct(purchasedProduct) {
        try {
            const sql = 'insert into purchasedProduct ( purchaseId, productId, quantity, price) values (?,?,?,?) ';
            const [result] = await pool.query(sql, [
                purchasedProduct.purchaseId,
                purchasedProduct.productId,
                purchasedProduct.quantity,
                purchasedProduct.price
            ]);

            return new PurchasedProduct(
                result.insertId,
                purchasedProduct.purchaseId,
                purchasedProduct.productId,
                purchasedProduct.quantity,
                purchasedProduct.price
            );

        } catch (err) {
            console.log(err);
            throw err;

        }
    }

    async getAllPurchase(){
         try{
             const sql =`SELECT * FROM purchase`;
             const [result] = await pool.query(sql);
             return result;

         }catch(err){
             console.log(err);
             throw err;
         }
    }
}
