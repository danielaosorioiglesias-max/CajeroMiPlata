
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



class Cuenta {

    #saldo

    constructor(numeroCuenta, titularId, tipo, saldo = 0) {
        this.numeroCuenta = numeroCuenta
        this.titularId = titularId
        this.tipo = tipo
        this.#saldo = saldo
    }

    get saldo() {
        return this.#saldo
    }

    consultarSaldo() {
        return this.#saldo
    }

    consignar(monto) {
        if (!Number.isFinite(monto) || monto <= 0) {
            throw new Error("El monto debe ser mayor a cero.")
        }

        this.#saldo += monto
    }

    retirar(monto) {
        if (!Number.isFinite(monto) || monto <= 0) {
            throw new Error("El monto debe ser mayor a cero.")
        }

        if (monto > this.#saldo) {
            throw new Error("Saldo insuficiente.")
        }

        this.#saldo -= monto
    }

    toJSON() {
        return {
            numeroCuenta: this.numeroCuenta,
            titularId: this.titularId,
            tipo: this.tipo,
            saldo: this.#saldo
        }
    }
}

class CuentaAhorro extends Cuenta {
    constructor(numeroCuenta, titularId, saldo = 0) {
        super(numeroCuenta, titularId, "ahorros", saldo)
    }
}

class CuentaCorriente extends Cuenta {
    constructor(numeroCuenta, titularId, saldo = 0) {
        super(numeroCuenta, titularId, "corriente", saldo)
    }
}

class TarjetaCredito extends Cuenta {
    constructor(numeroCuenta, titularId, saldo = 0) {
        super(numeroCuenta, titularId, "credito", saldo)
    }
}

class UsuarioCliente extends Usuario {

    #productos

    constructor(datos, productos = []) {
        super(
            datos.identificacion,
            datos.nombres,
            datos.apellidos,
            datos.celular,
            datos.usuario,
            datos.id
        )

        this.#productos = productos
    }

    get productos() {
        return [...this.#productos]
    }
}

function reconstruirCuenta(datos) {
    switch (datos.tipo) {
        case "ahorros":
            return new CuentaAhorro(
                datos.numeroCuenta,
                datos.titularId,
                datos.saldo
            )

        case "corriente":
            return new CuentaCorriente(
                datos.numeroCuenta,
                datos.titularId,
                datos.saldo
            )

        case "credito":
            return new TarjetaCredito(
                datos.numeroCuenta,
                datos.titularId,
                datos.saldo
            )

        default:
            throw new Error("Tipo de producto desconocido.")
    }
}

function cargarCuentas() {
    return cargarDatos(CUENTAS, []).map(reconstruirCuenta)
}

function guardarCuentas(cuentas) {
    guardarDatos(CUENTAS, cuentas)
}

function obtenerProductos(usuario) {
    const cuentas = cargarCuentas()

    let productos = cuentas.filter(
        cuenta => cuenta.titularId === usuario.id
    )

    if (productos.length === 0) {
        productos = [
            new CuentaAhorro(crypto.randomUUID(), usuario.id),
            new CuentaCorriente(crypto.randomUUID(), usuario.id),
            new TarjetaCredito(crypto.randomUUID(), usuario.id)
        ]

        guardarCuentas([...cuentas, ...productos])
    }

    return productos
}

function mostrarProductos(datosUsuario) {
    const productos = obtenerProductos(datosUsuario)

    const cliente = new UsuarioCliente(datosUsuario, productos)

    const selector = document.getElementById("select-producto-activo")
    const selectorDestino = document.getElementById("select-producto-destino")

    const nombresProductos = {
        ahorros: "Cuenta de Ahorros",
        corriente: "Cuenta Corriente",
        credito: "Tarjeta de Crédito"
    }

    selector.replaceChildren()
    selectorDestino.replaceChildren()

    cliente.productos.forEach(producto => {
        const opcion = new Option(
            nombresProductos[producto.tipo],
            producto.numeroCuenta
        )

        selector.add(opcion)

        if (producto.tipo !== "credito") {
            selectorDestino.add(
                new Option(
                    nombresProductos[producto.tipo],
                    producto.numeroCuenta
                )
            )
        }
    })

    document.getElementById("cajero-nombre-cliente").textContent =
        `${cliente.nombres} ${cliente.apellidos}`

    document.getElementById("cajero-id-cliente").textContent =
        `ID: ${cliente.id}`

    mostrarSaldoActivo()
}

function mostrarSaldoActivo() {
    const usuario = Autenticacion.obtenerUsuarioActivo()

    if (!usuario) {
        return
    }

    const numeroCuenta = document.getElementById(
        "select-producto-activo"
    ).value

    const cuenta = cargarCuentas().find(
        cuenta =>
            cuenta.numeroCuenta === numeroCuenta &&
            cuenta.titularId === usuario.id
    )

    if (!cuenta) {
        return
    }

    document.getElementById("visor-saldo-principal").textContent =
        cuenta.consultarSaldo().toLocaleString("es-CO", {
            style: "currency",
            currency: "COP"
        })

    document.getElementById("saldo-numero-cuenta").textContent =
        `Producto: ${cuenta.numeroCuenta}`

    document.getElementById("saldo-tipo-cuenta").textContent =
        `Resumen de ${cuenta.tipo}`
}
