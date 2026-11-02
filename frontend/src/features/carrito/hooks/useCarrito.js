import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router'
import { obtenerSesion } from '../../auth/authService'
import {
    obtenerCarrito,
    agregarAlCarrito,
    cambiarCantidadItem,
    quitarDelCarrito,
} from '../carritoService'

// El carrito vive en la base de datos (uno por cliente): acá solo se guarda una copia para mostrarlo.
// Las acciones devuelven { ok: true } o { ok: false, error } y siempre vuelven a leer el carrito de la API.
export function useCarrito() {
    const [items, setItems] = useState([])
    // useLocation hace que el hook se vuelva a evaluar al navegar (por ejemplo, justo después de iniciar sesión)
    useLocation()
    const sesion = obtenerSesion()
    const esCliente = sesion?.rol === 'cliente'
    const idSesion = sesion?.id
    // Sin sesión de cliente no hay carrito (la API responde 401/403)
    const carrito = esCliente ? items : []

    const recargar = useCallback(async () => {
        if (!esCliente) return
        const r = await obtenerCarrito()
        setItems(r.ok ? r.items : [])
    }, [esCliente])

    // Se vuelve a leer al entrar o al cambiar de cuenta
    useEffect(() => {
        if (!esCliente) return
        obtenerCarrito().then((r) => setItems(r.ok ? r.items : []))
    }, [esCliente, idSesion])

    // Ejecuta una acción sobre el carrito y refresca la copia local
    async function ejecutar(accion) {
        const r = await accion()
        await recargar()
        return r
    }

    function agregarProducto(producto) {
        if (!esCliente) return Promise.resolve({ ok: false, error: 'Para comprar accesorios tenés que ingresar con una cuenta de cliente.' })
        return ejecutar(() => agregarAlCarrito(producto.id, 1))
    }

    // El carrito de la API tiene un solo renglón por accesorio, por eso alcanza con el id
    function eliminarProducto(id) {
        const item = carrito.find((i) => i.id === id)
        if (!item) return Promise.resolve({ ok: false, error: 'El producto ya no está en el carrito.' })
        return ejecutar(() => quitarDelCarrito(item.idItem))
    }

    // Sumar o restar unidades (nunca baja de 1: la API valida el stock)
    function cambiarCantidad(id, talle, delta) {
        const item = carrito.find((i) => i.id === id)
        if (!item) return Promise.resolve({ ok: false, error: 'El producto ya no está en el carrito.' })
        const cantidad = Math.max(1, item.cantidad + delta)
        if (cantidad === item.cantidad) return Promise.resolve({ ok: true })
        return ejecutar(() => cambiarCantidadItem(item.idItem, cantidad))
    }

    // La API no tiene un endpoint para vaciar: se quitan los ítems de a uno
    async function vaciarCarrito() {
        await Promise.all(carrito.map((i) => quitarDelCarrito(i.idItem)))
        await recargar()
    }

    const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0)

    return {
        carrito,
        agregarProducto,
        eliminarProducto,
        cambiarCantidad,
        vaciarCarrito,
        recargarCarrito: recargar,
        cantidadTotal,
    }
}
