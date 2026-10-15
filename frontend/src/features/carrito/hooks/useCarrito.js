import { useState, useEffect } from 'react'
import { obtenerSesion } from '../../auth/authService'
import { buscarAccesorio } from '../../catalogo/servicios/accesorioService'

// El carrito se guarda por usuario: cada cuenta ve el suyo y se conserva al cerrar sesión y volver a ingresar
function claveCarrito() {
    const sesion = obtenerSesion();
    return sesion ? `carrito_${sesion.id}` : 'carrito_anonimo';
}

export function useCarrito() {
    const [clave] = useState(claveCarrito);

    // 1. Inicializamos desde localStorage para conservar el estado tras recargar
    const [carrito, setCarrito] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(clave)) || [];
        } catch {
            return [];
        }
    });

    // 2. Efecto para sincronizar los cambios en localStorage
    useEffect(() => {
        localStorage.setItem(clave, JSON.stringify(carrito));
    }, [clave, carrito]);

    // 3. Función para agregar un producto evaluando talle e ID
    function agregarProducto(nuevoProducto) {
        setCarrito((prevCarrito) => {
            const existe = prevCarrito.find(
                (item) => item.id === nuevoProducto.id && item.talle === nuevoProducto.talle
            );

            if (existe) {
                return prevCarrito.map((item) =>
                    item.id === nuevoProducto.id && item.talle === nuevoProducto.talle
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }

            return [...prevCarrito, { ...nuevoProducto, cantidad: 1 }];
        });
    }

    // 4. Función para eliminar un producto (útil para la vista del carrito)
    function eliminarProducto(id, talle) {
        setCarrito((prevCarrito) =>
            prevCarrito.filter((item) => !(item.id === id && item.talle === talle))
        );
    }

    // 5. Sumar o restar unidades de un ítem (nunca baja de 1 ni supera el stock del accesorio)
    function cambiarCantidad(id, talle, delta) {
        setCarrito((prevCarrito) =>
            prevCarrito.map((item) => {
                if (!(item.id === id && item.talle === talle)) return item;
                const stock = buscarAccesorio(id)?.stock ?? item.cantidad;
                const cantidad = Math.min(Math.max(1, item.cantidad + delta), Math.max(1, stock));
                return { ...item, cantidad };
            })
        );
    }

    // 6. Función para vaciar el carrito
    function vaciarCarrito() {
        setCarrito([]);
    }

    // Calculamos el total de ítems
    const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    return {
        carrito,
        agregarProducto,
        eliminarProducto,
        cambiarCantidad,
        vaciarCarrito,
        cantidadTotal
    };
}
