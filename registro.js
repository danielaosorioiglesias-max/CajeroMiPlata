
import { Usuario } from "./src/Usuario.js"
import { crearCredencial } from "./Iniciosesion.js"

const USUARIOS = "usuariosBanco"
const CREDENCIALES = "credencialesBanco"

function guardarUsuarios(usuarios) {
    localStorage.setItem(
        USUARIOS,
        JSON.stringify(usuarios)
    )
}

function cargarUsuarios() {
    const datos = localStorage.getItem(USUARIOS)

    if (datos === null) {
        return []
    }

    const usuarios = JSON.parse(datos)

    return usuarios.map(
        datosUsuario => Usuario.desdeJSON(datosUsuario)
    )
}

function guardarCredencial(idUsuario, credencial) {
    const credenciales = JSON.parse(
        localStorage.getItem(CREDENCIALES) || "{}"
    )

    credenciales[idUsuario] = credencial

    localStorage.setItem(
        CREDENCIALES,
        JSON.stringify(credenciales)
    )
}

export function registrarUsuario(nuevoUsuario) {

    if (!(nuevoUsuario instanceof Usuario)) {
        throw new Error("Debes proporcionar un objeto Usuario.")
    }

    const usuarios = cargarUsuarios()

    const usuarioExiste = usuarios.some(
        usuario => usuario.usuario === nuevoUsuario.usuario
    )

    if (usuarioExiste) {
        throw new Error("El nombre de usuario ya está registrado.")
    }

    const identificacionExiste = usuarios.some(
        usuario => usuario.identificacion === nuevoUsuario.identificacion
    )

    if (identificacionExiste) {
        throw new Error("La identificación ya está registrada.")
    }

    const idExiste = usuarios.some(
        usuario => usuario.id === nuevoUsuario.id
    )

    if (idExiste) {
        throw new Error("El identificador interno ya existe.")
    }

    usuarios.push(nuevoUsuario)

    guardarUsuarios(usuarios)

    return nuevoUsuario
}

const formulario = document.getElementById("form-registro")
const mensajeFeedback = document.getElementById("mensaje-feedback")
const mensajeTexto = document.getElementById("mensaje-texto")

formulario?.addEventListener("submit", async function(evento) {

    evento.preventDefault()

    const identificacion = document.getElementById("reg-id").value
    const nombres = document.getElementById("reg-nombres").value
    const apellidos = document.getElementById("reg-apellidos").value
    const celular = document.getElementById("reg-celular").value
    const nombreUsuario = document.getElementById("reg-usuario").value
    const contrasena = document.getElementById("reg-pass").value
    const confirmarContrasena = document.getElementById("reg-pass-confirm").value

    try {

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

        // La credencial se genera antes de guardar para no dejar un usuario sin contraseña
        const credencial = await crearCredencial(contrasena)

        registrarUsuario(nuevoUsuario)
        guardarCredencial(nuevoUsuario.id, credencial)

        formulario.reset()

        // Flujo: registro → inicio de sesión
        document.getElementById("btn-nav-login").click()

        mensajeTexto.textContent = "Usuario registrado correctamente. Ya puedes iniciar sesión."
        mensajeFeedback.className = "alerta alerta--exito"

    } catch (error) {

        mensajeTexto.textContent = error.message
        mensajeFeedback.className = "alerta alerta--error"

    }

})
