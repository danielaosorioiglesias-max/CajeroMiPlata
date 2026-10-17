import { Usuario } from "./src/Usuario.js"
import { Cliente } from "./src/Cliente.js"

const USUARIOS = "usuariosBanco"
const CREDENCIALES = "credencialesBanco"
const SESION = "sesionBanco"
const INTENTOS = "intentosBanco"
const MAX_INTENTOS = 3

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

    // Los intentos se cuentan por nombre de usuario (exista o no) para no revelar qué usuarios existen
    static obtenerIntentos(nombreUsuario) {
        const intentos = cargarDatos(INTENTOS, {})

        return intentos[Autenticacion.normalizar(nombreUsuario)] ?? 0
    }

    static estaBloqueado(nombreUsuario) {
        return Autenticacion.obtenerIntentos(nombreUsuario) >= MAX_INTENTOS
    }

    static registrarIntentoFallido(nombreUsuario) {
        const intentos = cargarDatos(INTENTOS, {})
        const clave = Autenticacion.normalizar(nombreUsuario)

        intentos[clave] = (intentos[clave] ?? 0) + 1
        guardarDatos(INTENTOS, intentos)

        return intentos[clave]
    }

    static reiniciarIntentos(nombreUsuario) {
        const intentos = cargarDatos(INTENTOS, {})

        delete intentos[Autenticacion.normalizar(nombreUsuario)]
        guardarDatos(INTENTOS, intentos)
    }

    static normalizar(nombreUsuario) {
        return String(nombreUsuario ?? "").trim().toLowerCase()
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

export async function verificarContrasena(contrasena, credencial) {
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
    if (Autenticacion.estaBloqueado(nombreUsuario)) {
        throw new Error("Cuenta bloqueada por superar 3 intentos fallidos. Comunícate con el administrador.")
    }

    const usuario = Autenticacion.buscarUsuario(nombreUsuario)
    const credenciales = cargarDatos(CREDENCIALES, {})
    const credencial = usuario ? credenciales[usuario.id] : null

    const esValida = await verificarContrasena(
        contrasena,
        credencial
    )

    if (!esValida) {
        const intentos = Autenticacion.registrarIntentoFallido(nombreUsuario)

        if (intentos >= MAX_INTENTOS) {
            throw new Error("Cuenta bloqueada por superar 3 intentos fallidos. Comunícate con el administrador.")
        }

        throw new Error(`Usuario o contraseña incorrectos. Te quedan ${MAX_INTENTOS - intentos} intento(s).`)
    }

    Autenticacion.reiniciarIntentos(nombreUsuario)
    sessionStorage.setItem(SESION, usuario.id)

    return usuario
}

// Para el módulo de administración (CRUD): desbloquea una cuenta bloqueada por intentos fallidos
export function desbloquearUsuario(nombreUsuario) {
    Autenticacion.reiniciarIntentos(nombreUsuario)
}

function mostrarIntentos(nombreUsuario) {
    const intentos = Autenticacion.obtenerIntentos(nombreUsuario)
    const bloqueado = intentos >= MAX_INTENTOS
    const estado = document.getElementById("estado-bloqueo")

    document.getElementById("contador-intentos").textContent = intentos

    estado.textContent = bloqueado ? "Cuenta Bloqueada" : "Cuenta Activa"
    estado.style.color = bloqueado ? "var(--color-danger)" : ""

    document.getElementById("btn-submit-login").disabled = bloqueado
}

function mostrarMensaje(texto, tipo = "exito") {
    const alerta = document.getElementById("mensaje-feedback")
    const mensaje = document.getElementById("mensaje-texto")

    mensaje.textContent = texto
    alerta.className = `alerta alerta--${tipo}`
}

function mostrarVista(idVista) {
    document.querySelectorAll(".vista").forEach(
        vista => vista.classList.add("oculto")
    )

    document.getElementById(idVista).classList.remove("oculto")
}

document.getElementById("login-usuario")?.addEventListener("input", function() {
    mostrarIntentos(this.value)
})

document.getElementById("form-login")?.addEventListener("submit", async function(evento) {
    evento.preventDefault()

    const usuario = document.getElementById("login-usuario").value
    const contrasena = document.getElementById("login-pass").value

    try {
        const datosUsuario = await Autenticacion.iniciarSesion(usuario, contrasena)

        // Los productos (CuentaAhorros, CuentaCorriente, TarjetaCredito) los administra Banco.js
        Banco.cargar()
        Cajero.abrir(new Cliente(datosUsuario, Banco.productosDe(datosUsuario.id)))

        mostrarVista("vista-cajero")

        mostrarMensaje("Inicio de sesión exitoso.")
        this.reset()
        mostrarIntentos("")

    } catch (error) {
        mostrarMensaje(error.message, "error")
        mostrarIntentos(usuario)
    }
})


document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
    Autenticacion.cerrarSesion()
    Cajero.cerrar()
    mostrarVista("vista-inicio")
    mostrarMensaje("Sesión cerrada correctamente.")
})
