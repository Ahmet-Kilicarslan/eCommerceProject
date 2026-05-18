import express from 'express';
import SupplierRepository from '../domain/supplier/SupplierRepository.js';
import SupplierService from "../domain/supplier/SupplierService.js";
import SupplierApplication from "../application/SupplierApplication.js";

const router = express.Router();
const supplierRepository = new SupplierRepository();
const supplierService = new SupplierService(supplierRepository);
const supplierApplication = new SupplierApplication(supplierRepository, supplierService);

// Create new supplier
router.post('/', async (req, res) => {
    try {
        const newSupplier = await supplierApplication.createSupplier(req.body);
        res.json(newSupplier);
    } catch (error) {
        console.error('Failed to create supplier', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            error: 'Failed to create supplier',
            message: error.message
        });
    }
});

// Get all suppliers
router.get('/', async (req, res) => {
    const allSuppliers = await supplierApplication.getAllSuppliers();
    res.json(allSuppliers);
});

// Get one supplier by ID
router.get('/:id', async (req, res) => {
    const supplier = await supplierRepository.getSupplier(req.params.id);
    res.json(supplier);
});


router.put('/', async (req, res) => {
    const updatedSupplier = await supplierRepository.updateSupplier( req.body);
    res.json(updatedSupplier);
});

// Delete supplier by ID
router.delete('/:id', async (req, res) => {
    const result = await supplierRepository.deleteSupplier(req.params.id);
    res.json(result);
});

export default router;
