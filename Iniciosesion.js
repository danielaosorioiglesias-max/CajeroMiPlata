
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


function convertirHexadecimal(bytes) {
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("")
}

async function generarHash(contrasena, salt) {
    const encoder = new TextEncoder()

    const clave = await crypto.subtle.importKey(
        "raw",
        encoder.encode(contrasena),
        "PBKDF2",
        false,
        ["deriveBits"]
    )

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: 310000,
            hash: "SHA-256"
        },
        clave,
        256
    )

    return convertirHexadecimal(new Uint8Array(bits))
}

export async function crearCredencial(contrasena) {
    Usuario.validarContrasena(contrasena)

    const salt = crypto.getRandomValues(new Uint8Array(16))
    const hash = await generarHash(contrasena, salt)

    return {
        salt: convertirHexadecimal(salt),
        hash
    }
}

async function verificarContrasena(contrasena, credencial) {
    if (!credencial || typeof contrasena !== "string") {
        return false
    }

    const salt = Uint8Array.from(
        credencial.salt.match(/.{2}/g),
        valor => parseInt(valor, 16)
    )

    const hashIngresado = await generarHash(contrasena, salt)

    return hashIngresado === credencial.hash
}

Autenticacion.iniciarSesion = async function(nombreUsuario, contrasena) {
    const usuario = Autenticacion.buscarUsuario(nombreUsuario)

    if (!usuario) {
        throw new Error("Usuario o contraseña incorrectos.")
    }

    const credenciales = cargarDatos(CREDENCIALES, {})
    const credencial = credenciales[usuario.id]

    if (!credencial) {
        throw new Error("Este usuario no tiene credenciales configuradas.")
    }

    const esValida = await verificarContrasena(
        contrasena,
        credencial
    )

    if (!esValida) {
        throw new Error("Usuario o contraseña incorrectos.")
    }

    sessionStorage.setItem(SESION, usuario.id)

    return usuario
}
