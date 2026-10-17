
import { Usuario } from "./src/Usuario.js"

function guardarUsuarios(usuarios) {
    localStorage.setItem(
        "usuariosBanco",
        JSON.stringify(usuarios)
    )
}

function cargarUsuarios() {
    const datos = localStorage.getItem("usuariosBanco")

    if (datos === null) {
        return []
    }

    const usuarios = JSON.parse(datos)

    return usuarios.map(
        datosUsuario => Usuario.desdeJSON(datosUsuario)
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
