import express from 'express';
import { CartManager } from '../cartManager.js';

const router = express.Router();

// ? Crear un nuevo carrito: { id (automático: Number/String), products (un Array) }
router.post('/cart', async (req, res) => {

});

// ? Listar los productos según arreglo
router.get('/cart/:cid', async (req, res) => {

});

// ? Agrego el producto al carrito según sus respectivos IDs.
// * product: { id, quantity }
// ? Si el producto ya existe, modificar la cantidad.
router.post('/:cid/product/:pid', async (req, res) => {

});

export default router;