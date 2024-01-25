import express from 'express';
import { ProductManager } from '../productsManager.js';
import { findMissingAttributes, isValidObject } from '../helpers.js';

const router = express.Router();
const ProdManager = new ProductManager();

// ? Este arreglo contiene los atributos obligatorios.
// * Si un objeto no contiene alguno de ellos, retornamos un error.
const arrAttrRequired = ['title', 'description', 'code', 'price', 'stock', 'category'];

// ? Este objeto lo usaremos para copiar sus atributos por si thumbnail o status vienen sin algún valor previo.
const defaultProduct = { title: '', description: '', code: '', price: '', status: true, stock: 0, category: '', thumbnail: [] }

// ? Agregar nuevo producto
// * { id (automático: number/string), title, description, code, price, status (true por defecto), stock, category, thumbnail (No es obligatorio, Array de string con las rutas de las img) }
router.post('/products', async (req, res) => {

    const objectParam = req.body || {};

    if (!isValidObject(objectParam, arrAttrRequired)) {
        return res.status(400).send({ message: 'Faltan atributos al objeto.', missingAttrs: findMissingAttributes(objectParam, arrAttrRequired) });
    }

    const newObject = {
        ...defaultProduct,
        ...objectParam
    }

    const created = await ProdManager.addProduct(newObject);

    if (created) {
        return res.status(200).send({ message: "Producto creado correctamente." });
    }
    return res.status(500).send({ message: "Ha ocurrido un error." });

});

// ? Actualizar el producto
router.put('/products/:pid', async (req, res) => {
    const pid = parseInt(req.params.pid);
    if (isNaN(pid)) {
        return res.status(400).send({ message: "El parámetro no es numérico." });
    }
    if (pid < 0) {
        return res.status(400).send({ message: "El parámetro no puede ser un número negativo." });
    }
    const paramsProduct = req.body;

    if (!isValidObject(paramsProduct, arrAttrRequired)) {
        return res.status(400).send({ message: 'Faltan atributos al objeto.', missingAttrs: findMissingAttributes(paramsProduct, arrAttrRequired) });
    }

    const currentProduct = await ProdManager.getProductById(pid);
    if (!currentProduct) {
        return res.status(404).send({ message: 'El producto no existe en nuestros registros.' });
    }

    const { id: currentId } = currentProduct;

    const updatedProduct = {
        ...currentProduct,
        ...paramsProduct,
        id: currentId
    }

    const updated = await ProdManager.updateProduct(pid, updatedProduct);
    if (updated) {
        return res.status(200).send({ message: "Producto actualizado correctamente." });
    }
    return res.status(500).send({ message: "Ha ocurrido un error al intentar actualizar el producto." });

});

// ? Eliminar el producto
router.delete('/products/:pid', async (req, res) => {
    const pid = parseInt(req.params.pid);
    if (isNaN(pid)) {
        return res.status(400).send({ message: "El parámetro no es numérico." });
    }
    if (pid < 0) {
        return res.status(400).send({ message: "El parámetro no puede ser un número negativo." });
    }

    const currentProduct = await ProdManager.getProductById(pid);

    if (currentProduct) {
        const deleted = await ProdManager.deleteProduct(pid);
        if (deleted) {
            return res.status(200).send({ message: "Producto eliminado correctamente." });
        }
        return res.status(500).send({ message: "Ha ocurrido un error al intentar eliminar el producto." });
    }

    return res.status(404).send({ message: 'El producto no existe en nuestros registros.' });

});

// ? Listar todos los productos (con LIMIT)
router.get('/products', async (req, res) => {
    const arrData = await ProdManager.getProducts() || [];

    if (arrData.length <= 0) {
        return res.send({ message: "No se encontraron productos!" });
    }

    const limit = parseInt(req.query.limit) || arrData.length;
    const response = arrData.slice(0, limit);

    return res.json(response);

});

// ? Traer sólo el producto seleccionado
router.get('/products/:pid', async (req, res) => {
    const pid = parseInt(req.params.pid);
    if (isNaN(pid)) {
        return res.status(400).send({ message: "El parámetro no es numérico." });
    }
    if (pid < 0) {
        return res.status(400).send({ message: "El parámetro no puede ser un número negativo." });
    }

    const currentProduct = await ProdManager.getProductById(pid);
    if (currentProduct) {
        return res.status(200).json(currentProduct);
    }
    return res.status(404).send({ message: 'El producto no existe en nuestros registros.' });

});

export default router;