import { useState, useEffect } from 'react'

export function useCarrito() {
    // 1. Inicializamos desde localStorage para conservar el estado tras recargar
    const [carrito, setCarrito] = useState(() => {
        const guardado = localStorage.getItem('carrito');
        return guardado ? JSON.parse(guardado) : [];
    });

    // 2. Efecto para sincronizar los cambios en localStorage
    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }, [carrito]);

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

    // 5. Función para vaciar el carrito
    function vaciarCarrito() {
        setCarrito([]);
    }

    // Calculamos el total de ítems
    const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    return {
        carrito,
        agregarProducto,
        eliminarProducto,
        vaciarCarrito,
        cantidadTotal
    };
}