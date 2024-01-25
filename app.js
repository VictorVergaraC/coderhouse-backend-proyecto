import express from 'express';
import productRouter from './routes/products.router.js';
import cartRouter from './routes/cart.router.js';

const app = express();
const PORT = 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ? Para la persistencia de los datos: productos.json y carrito.json

// Rutas
app.use("/", productRouter);
app.use("/", cartRouter);


app.listen(PORT, () => console.log(`Servidor escuchando en el puerto: ${PORT}`));