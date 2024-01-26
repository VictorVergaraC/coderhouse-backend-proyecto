import fs from 'fs';

export class CartManager {
    constructor() {
        this.path = "carrito.json";
    }

    async getCartById(idCart) {
        const arrData = await this._getCarts();
        const cart = arrData.find(c => c.id === idCart);

        return cart ? cart : false;
    }

    async updateCart(idCart, indexProduct = null, objProduct) {
        const arrData = await this._getCarts();
        const cartIndex = arrData.findIndex(cart => cart.id === idCart);

        if (indexProduct !== null) {
            arrData[cartIndex].products[indexProduct].quantity = objProduct.quantity;
        } else {
            arrData[cartIndex].products.push(objProduct);
        }

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(arrData));
            console.log("Carrito actualizado correctamente!", arrData);
            return true;
        } catch (error) {
            console.error("Error al actualizar el carrito:", error);
            return false;
        }
    }

    async productInCart(idCart, idProduct) {
        const cart = await this.getCartById(idCart);
        const productIndex = cart.products.findIndex(obj => obj && obj.id === idProduct);
        return productIndex !== -1 ? { index: productIndex, product: cart.products[productIndex] } : false;
    }

    async createCart(objCart) {
        const id = await this._getLastId();
        const newCart = {
            id,
            ...objCart
        }

        let currentData = await this._getCarts();
        currentData = [...currentData, newCart];

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(currentData));
            console.log("Carrito creado correctamente!", newCart);
            return true;
        } catch (error) {
            console.error("Error al crear el carrito:", error);
            return false;
        }
    }

    async _getCarts() {
        try {
            const fileExist = await this._fileExist(this.path);

            if (!fileExist) {
                const created = await this._createFile(this.path, "[]");
                if (!created) {
                    throw error;
                    return;
                }
            }

            const data = await fs.promises.readFile(this.path, "utf8");
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error al leer el archivo:", error);
            return [];
        }
    }

    async _getLastId() {
        const arrData = await this._getCarts() || []
        return arrData.length + 1
    }

    async _fileExist(strFile) {
        try {
            await fs.promises.access(strFile, fs.constants.F_OK);
            return true;
        } catch (error) {
            return false;
        }
    }

    async _createFile(strName, data) {
        try {
            fs.writeFileSync(strName, data);
            return true;

        } catch (error) {
            console.error("Error al crear el archivo", error);
            return false;
        }
    }
}