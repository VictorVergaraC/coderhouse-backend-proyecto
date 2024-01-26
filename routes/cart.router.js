import express from 'express';
import { CartManager } from '../cartManager.js';
import { findMissingAttributes, isValidObject } from '../helpers.js';
import { ProductManager } from '../productsManager.js';

const router = express.Router();

// ? Objeto para validar los parámetros
const expectedCart = { products: [] }
// ? Este objeto lo usaremos para copiar sus atributos por si thumbnail o status vienen sin algún valor previo.
const defaultProduct = { title: '', description: '', code: '', price: '', status: true, stock: 0, category: '', thumbnail: [] }
// ? Este arreglo contiene los atributos obligatorios.
// * Si un objeto no contiene alguno de ellos, retornamos un error.
const arrAttrRequired = ['title', 'description', 'code', 'price', 'stock', 'category'];

// ? Instancia a los objetos
const shoppingCart = new CartManager();
const ProdManager = new ProductManager();

// ? Crear un nuevo carrito: { id (automático: Number/String), products (un Array) }
router.post('/cart', async (req, res) => {

    const objectParam = req.body;

    const { products: cartProducts } = objectParam;
    if (cartProducts.length <= 0) {
        return res.status(400).send({ message: 'El carrito no puede estar vacío.' });
    }

    const promises = cartProducts.map(async prod => {
        const exist = await ProdManager.getProductById(parseInt(prod.id));
        if (!exist) {
            return prod;
        }
        return undefined;
    })

    const notExist = (await Promise.all(promises)).filter(prod => prod !== undefined);
    console.log('notExist:', notExist);

    if (notExist.length > 0) {
        return res.status(400).send({ message: 'Productos no existen', notFoundProducts: notExist });
    }

    const productsWithQuantity = cartProducts.map(prod => ({
        ...prod,
        quantity: prod.quantity >= 1 ? prod.quantity : 1
    }));

    const newCart = await shoppingCart.createCart({ products: productsWithQuantity });

    if (newCart) {
        return res.status(200).send({ message: "Carrito creado correctamente." });
    }
    return res.status(500).send({ message: "Ha ocurrido un error." });

});

// ? Listar los productos según arreglo
router.get('/cart/:cid', async (req, res) => {
    const cid = parseInt(req.params.cid);
    if (isNaN(cid)) {
        return res.status(400).send({ message: "El parámetro no es numérico." });
    }
    if (cid < 0) {
        return res.status(400).send({ message: "El parámetro no puede ser un número negativo." });
    }

    const objectCart = await shoppingCart.getCartById(cid);

    if (objectCart) {
        const { carrito } = objectCart;
        return res.status(200).json(carrito);
    }

    return res.status(404).send({ message: 'El carrito no existe en nuestros registros.' });
});

// ? Agrego el producto al carrito según sus respectivos IDs.
// * product: { id, quantity }
// ? Si el producto ya existe, modificar la cantidad.
router.post('/cart/:cid/product/:pid', async (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    const paramProduct = req.body || {};

    if (isNaN(cid)) {
        return res.status(400).send({ message: "El id del carrito no es numérico." });
    }
    if (cid < 0) {
        return res.status(400).send({ message: "El id del carrito no puede ser un número negativo." });
    }
    if (isNaN(pid)) {
        return res.status(400).send({ message: "El id del producto no es numérico." });
    }
    if (pid < 0) {
        return res.status(400).send({ message: "El id del producto no puede ser un número negativo." });
    }
    if (!isValidObject(paramProduct, ['quantity'])) {
        return res.status(400).send({ message: "Faltan atributos al objeto.", missingAttrs: ['quantity'] });
    }
    if (paramProduct?.quantity <= 0) {
        return res.status(400).send({ message: "La cantidad no puede ser en negativo." });
    }

    let cart = await shoppingCart.getCartById(cid);
    if (!cart) {
        return res.status(404).send({ message: 'El carrito no existe en nuestros registros.' });
    }
    let product = await ProdManager.getProductById(pid);
    if (!product) {
        return res.status(404).send({ message: 'El producto no existe en nuestros registros.' });
    }

    const productInCart = await shoppingCart.productInCart(cid, pid);

    if (productInCart) {

        // * Producto actual del carrito
        const { index, product: currentProduct } = productInCart;
        console.log('Producto actual:', currentProduct);

        const { quantity: currentQuantity } = currentProduct;

        const newQuantity = currentQuantity + parseInt(paramProduct.quantity);
        const updatedProduct = { ...currentProduct, quantity: newQuantity };

        console.log('Producto actualizado:', updatedProduct);

        const updated = await shoppingCart.updateCart(cid, index, updatedProduct);

        if (updated) {
            return res.status(200).send({ message: "Carrito actualizado correctamente." });
        }
        return res.status(500).send({ message: "Ha ocurrido un error." });
    }

    const inserted = await shoppingCart.updateCart(cid, null, { id: pid, quantity: paramProduct.quantity });
    if (inserted) {
        return res.status(200).send({ message: "Carrito actualizado correctamente." });
    }
    return res.status(500).send({ message: "Ha ocurrido un error." });

});

export default router;