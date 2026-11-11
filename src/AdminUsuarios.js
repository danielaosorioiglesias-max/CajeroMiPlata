import { Usuario } from "./Usuario.js"
import {
    Autenticacion,
    crearCredencial,
    desbloquearUsuario,
    USUARIO_ADMIN
} from "../Iniciosesion.js"
import { registrarUsuario } from "../registro.js"

const USUARIOS = "usuariosBanco"
const CREDENCIALES = "credencialesBanco"

const formulario = document.getElementById("form-crud-editar")
const botonNuevo = document.getElementById("btn-crud-nuevo")
const botonCancelar = document.getElementById("btn-crud-cancelar")
const tablaUsuarios = document.getElementById("tabla-usuarios-body")
const credencialesForm = document.getElementById("crud-credenciales")
const tituloFormulario = document.getElementById("titulo-form-crud")
const botonGuardar = formulario.querySelector('[type="submit"]')

let idUsuarioEditando = null

function cargarUsuarios() {
    const datos = localStorage.getItem(USUARIOS)

    if (datos === null) {
        return []
    }

    return JSON.parse(datos).map(
        datosUsuario => Usuario.desdeJSON(datosUsuario)
    )
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(USUARIOS, JSON.stringify(usuarios))
}

function guardarCredencial(idUsuario, credencial) {
    const credenciales = JSON.parse(
        localStorage.getItem(CREDENCIALES) || "{}"
    )

    credenciales[idUsuario] = credencial
    localStorage.setItem(CREDENCIALES, JSON.stringify(credenciales))
}

function mostrarMensaje(texto, tipo = "exito") {
    const alerta = document.getElementById("mensaje-feedback")
    document.getElementById("mensaje-texto").textContent = texto
    alerta.className = `alerta alerta--${tipo}`
}

function agregarCelda(fila, texto) {
    const celda = document.createElement("td")
    celda.textContent = texto
    fila.append(celda)
}

function agregarBotonAccion(fila, texto, accion, idUsuario) {
    const boton = document.createElement("button")
    boton.type = "button"
    boton.className = "btn btn--outline"
    boton.textContent = texto
    boton.dataset.accion = accion
    boton.dataset.usuarioId = idUsuario

    const celda = fila.lastElementChild
    celda.append(boton)
}

function actualizarTabla() {
    const usuarios = cargarUsuarios()
    tablaUsuarios.replaceChildren()

    if (usuarios.length === 0) {
        const fila = document.createElement("tr")
        const celda = document.createElement("td")
        celda.colSpan = 6
        celda.className = "text-center"
        celda.textContent = "No hay clientes registrados en el sistema."
        fila.append(celda)
        tablaUsuarios.append(fila)
        return
    }

    usuarios.forEach(usuario => {
        const fila = document.createElement("tr")
        agregarCelda(fila, usuario.identificacion)
        agregarCelda(fila, `${usuario.nombres} ${usuario.apellidos}`)
        agregarCelda(fila, usuario.celular)
        agregarCelda(fila, usuario.usuario)
        agregarCelda(
            fila,
            Autenticacion.estaBloqueado(usuario.usuario) ? "Bloqueado" : "Activo"
        )
        fila.append(document.createElement("td"))
        agregarBotonAccion(fila, "Editar", "editar", usuario.id)
        agregarBotonAccion(fila, "Desbloquear", "desbloquear", usuario.id)
        agregarBotonAccion(fila, "Eliminar", "eliminar", usuario.id)
        tablaUsuarios.append(fila)
    })
}

function alternarCamposCredenciales(mostrar) {
    credencialesForm.classList.toggle("oculto", !mostrar)
    document.getElementById("crud-pass").required = mostrar
    document.getElementById("crud-pass-confirm").required = mostrar
}

function abrirFormularioNuevo() {
    idUsuarioEditando = null
    formulario.reset()
    tituloFormulario.textContent = "Nuevo Cliente"
    botonGuardar.textContent = "Crear Cliente"
    alternarCamposCredenciales(true)
    formulario.classList.remove("oculto")
}

function abrirFormularioEdicion(usuario) {
    idUsuarioEditando = usuario.id
    formulario.reset()
    document.getElementById("crud-id").value = usuario.identificacion
    document.getElementById("crud-nombres").value = usuario.nombres
    document.getElementById("crud-apellidos").value = usuario.apellidos
    document.getElementById("crud-celular").value = usuario.celular
    document.getElementById("crud-usuario").value = usuario.usuario
    tituloFormulario.textContent = "Editar Cliente"
    botonGuardar.textContent = "Guardar Cambios"
    alternarCamposCredenciales(false)
    formulario.classList.remove("oculto")
}

function cancelarFormulario() {
    formulario.reset()
    formulario.classList.add("oculto")
    idUsuarioEditando = null
    alternarCamposCredenciales(false)
}

botonNuevo.addEventListener("click", abrirFormularioNuevo)
botonCancelar.addEventListener("click", cancelarFormulario)

formulario.addEventListener("submit", async evento => {
    evento.preventDefault()
    const esEdicion = idUsuarioEditando !== null

    try {
        const identificacion = document.getElementById("crud-id").value
        const nombres = document.getElementById("crud-nombres").value
        const apellidos = document.getElementById("crud-apellidos").value
        const celular = document.getElementById("crud-celular").value
        const nombreUsuario = document.getElementById("crud-usuario").value

        if (idUsuarioEditando === null) {
            const contrasena = document.getElementById("crud-pass").value
            const confirmarContrasena = document.getElementById("crud-pass-confirm").value

            if (contrasena !== confirmarContrasena) {
                throw new Error("Las contraseñas no coinciden.")
            }

            Usuario.validarContrasena(contrasena)
            const nuevoUsuario = new Usuario(
                identificacion,
                nombres,
                apellidos,
                celular,
                nombreUsuario
            )
            const credencial = await crearCredencial(contrasena)
            registrarUsuario(nuevoUsuario)
            guardarCredencial(nuevoUsuario.id, credencial)
        } else {
            const usuarios = cargarUsuarios()
            const usuario = usuarios.find(
                elemento => elemento.id === idUsuarioEditando
            )

            if (!usuario) {
                throw new Error("No se encontró el cliente que intentas editar.")
            }

            const usuarioNormalizado = nombreUsuario.trim().toLowerCase()

            if (usuarioNormalizado === USUARIO_ADMIN) {
                throw new Error("Ese nombre de usuario está reservado para la cuenta administradora.")
            }

            const duplicado = usuarios.some(elemento =>
                elemento.id !== idUsuarioEditando
                && (
                    elemento.usuario === usuarioNormalizado
                    || elemento.identificacion === identificacion.trim()
                )
            )

            if (duplicado) {
                throw new Error("El usuario o la identificación ya están registrados.")
            }

            const usuarioActualizado = new Usuario(
                identificacion,
                nombres,
                apellidos,
                celular,
                nombreUsuario,
                usuario.id
            )
            guardarUsuarios(usuarios.map(elemento =>
                elemento.id === idUsuarioEditando
                    ? usuarioActualizado
                    : elemento
            ))
        }

        cancelarFormulario()
        actualizarTabla()
        mostrarMensaje(
            esEdicion ? "Cliente actualizado correctamente." : "Cliente creado correctamente."
        )
    } catch (error) {
        mostrarMensaje(error.message, "error")
    }
})

tablaUsuarios.addEventListener("click", evento => {
    const boton = evento.target.closest("button[data-accion]")

    if (!boton) {
        return
    }

    const usuarios = cargarUsuarios()
    const usuario = usuarios.find(
        elemento => elemento.id === boton.dataset.usuarioId
    )

    if (!usuario) {
        mostrarMensaje("No se encontró el cliente seleccionado.", "error")
        actualizarTabla()
        return
    }

    if (boton.dataset.accion === "editar") {
        abrirFormularioEdicion(usuario)
        return
    }

    if (boton.dataset.accion === "desbloquear") {
        desbloquearUsuario(usuario.usuario)
        actualizarTabla()
        mostrarMensaje("Cliente desbloqueado correctamente.")
        return
    }

    if (boton.dataset.accion === "eliminar") {
        const credenciales = JSON.parse(
            localStorage.getItem(CREDENCIALES) || "{}"
        )
        delete credenciales[usuario.id]
        localStorage.setItem(CREDENCIALES, JSON.stringify(credenciales))
        guardarUsuarios(usuarios.filter(
            elemento => elemento.id !== usuario.id
        ))
        actualizarTabla()
        mostrarMensaje("Cliente eliminado correctamente.")
    }
})

window.addEventListener("admin:actualizar", actualizarTabla)