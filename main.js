
import { Usuario } from "./src/Usuario.js"
import { registrarUsuario } from "./registro.js"

const formulario = document.getElementById("form-registro")
const mensajeFeedback = document.getElementById("mensaje-feedback")
const mensajeTexto = document.getElementById("mensaje-texto")

formulario.addEventListener("submit", function(evento) {

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

        registrarUsuario(nuevoUsuario)

        mensajeTexto.textContent = "Usuario registrado correctamente."
        mensajeFeedback.className = "alerta alerta--exito"

        formulario.reset()

    } catch (error) {

        mensajeTexto.textContent = error.message
        mensajeFeedback.className = "alerta alerta--error"

    }

})
