
import { Usuario } from "./src/Usuario.js"
import { crearCredencial, verificarContrasena } from "./Iniciosesion.js"

const USUARIOS = "usuariosBanco"
const CREDENCIALES = "credencialesBanco"
const SESION = "sesionBanco"

function validarNuevaContrasena(contrasena) {

    Usuario.validarContrasena(contrasena)

    const tieneMayuscula = /[A-Z]/.test(contrasena)
    const tieneEspecial = /[^a-zA-Z0-9]/.test(contrasena)

    if (!tieneMayuscula) {
        throw new Error("La contraseña debe contener al menos una mayúscula.")
    }

    if (!tieneEspecial) {
        throw new Error("La contraseña debe contener al menos un carácter especial.")
    }

    return true
}


function confirmarNuevaContrasena(contrasena, confirmacion) {

    validarNuevaContrasena(contrasena)

    if (contrasena !== confirmacion) {
        throw new Error("Las contraseñas no coinciden.")
    }

    return true
}


async function actualizarContrasena(
    nombreUsuario,
    contrasenaActual,
    nuevaContrasena,
    confirmarContrasena
) {

    const idActivo = sessionStorage.getItem(SESION)

    if (!idActivo) {
        throw new Error("Debes iniciar sesión para cambiar tu contraseña.")
    }

    const usuarios = JSON.parse(
        localStorage.getItem(USUARIOS) || "[]"
    )

    const usuario = usuarios.find(
        usuario => usuario.id === idActivo
    )

    if (!usuario) {
        throw new Error("No se encontró el usuario activo.")
    }

    if (usuario.usuario !== nombreUsuario.trim().toLowerCase()) {
        throw new Error("El nombre de usuario no corresponde a la sesión activa.")
    }

    confirmarNuevaContrasena(nuevaContrasena, confirmarContrasena)

    const credenciales = JSON.parse(
        localStorage.getItem(CREDENCIALES) || "{}"
    )

    const credencialActual = credenciales[usuario.id]

    if (!credencialActual) {
        throw new Error("El usuario no tiene credenciales registradas.")
    }

    const contrasenaCorrecta = await verificarContrasena(
        contrasenaActual,
        credencialActual
    )

    if (!contrasenaCorrecta) {
        throw new Error("La contraseña actual es incorrecta.")
    }

    if (nuevaContrasena === contrasenaActual) {
        throw new Error("La nueva contraseña debe ser diferente a la anterior.")
    }

    credenciales[usuario.id] = await crearCredencial(nuevaContrasena)

    localStorage.setItem(
        CREDENCIALES,
        JSON.stringify(credenciales)
    )

    return true
}

const formularioCambio = document.getElementById("form-cambiar-pass")

formularioCambio?.addEventListener("submit", async function(evento) {

    evento.preventDefault()

    const usuario = document.getElementById("pass-usuario").value
    const actual = document.getElementById("pass-actual").value
    const nueva = document.getElementById("pass-nueva").value
    const confirmar = document.getElementById("pass-confirmar").value

    const alerta = document.getElementById("mensaje-feedback")
    const mensaje = document.getElementById("mensaje-texto")

    try {

        await actualizarContrasena(
            usuario,
            actual,
            nueva,
            confirmar
        )

        mensaje.textContent = "Contraseña actualizada correctamente."
        alerta.className = "alerta alerta--exito"

        formularioCambio.reset()

    } catch (error) {

        mensaje.textContent = error.message
        alerta.className = "alerta alerta--error"

    }
})
