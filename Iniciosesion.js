
import { Usuario } from "./src/Usuario.js"

const USUARIOS = "usuariosBanco"
const CREDENCIALES = "credencialesBanco"
const CUENTAS = "cuentasBanco"
const MOVIMIENTOS = "movimientosBanco"
const SESION = "sesionBanco"

function cargarDatos(clave, valorInicial) {
    const datos = localStorage.getItem(clave)

    if (datos === null) {
        return valorInicial
    }

    return JSON.parse(datos)
}

function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos))
}

class Autenticacion {

    static buscarUsuario(nombreUsuario) {
        if (typeof nombreUsuario !== "string") {
            return null
        }

        const usuarios = cargarDatos(USUARIOS, [])
        const nombreBuscado = nombreUsuario.trim().toLowerCase()

        return usuarios.find(
            usuario => usuario.usuario === nombreBuscado
        ) ?? null
    }

    static obtenerUsuarioActivo() {
        const id = sessionStorage.getItem(SESION)

        if (!id) {
            return null
        }

        const usuarios = cargarDatos(USUARIOS, [])

        return usuarios.find(
            usuario => usuario.id === id
        ) ?? null
    }

    static cerrarSesion() {
        sessionStorage.removeItem(SESION)
    }
}
