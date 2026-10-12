
export class Usuario {

    #id
    #identificacion
    #nombres
    #apellidos
    #celular
    #usuario

    constructor(
        identificacion,
        nombres,
        apellidos,
        celular,
        usuario,
        id = crypto.randomUUID()
    ) {
        if (typeof id !== "string" || id.trim() === "") {
            throw new Error("El ID interno no es válido.")
        }

        this.#id = id

        if (typeof identificacion !== "string") {
            throw new Error("La identificación debe ser un texto.")
        }

        const identificacionLimpia = identificacion.trim()

        if (!/^\d{5,12}$/.test(identificacionLimpia)) {
            throw new Error("La identificación debe tener entre 5 y 12 dígitos.")
        }

        this.#identificacion = identificacionLimpia

        this.#nombres = nombres
        this.#apellidos = apellidos
        this.#celular = celular
        this.#usuario = usuario
    }

    get id() {
        return this.#id
    }

    get identificacion() {
        return this.#identificacion
    }

    get nombres() {
        return this.#nombres
    }

    get apellidos() {
        return this.#apellidos
    }

    get celular() {
        return this.#celular
    }

    get usuario() {
        return this.#usuario
    }

    set nombres(nuevoNombre) {
        if (typeof nuevoNombre !== "string" || nuevoNombre.trim() === "") {
            throw new Error("El nombre no puede estar vacío")
        }

        this.#nombres = nuevoNombre.trim()
    }

    set apellidos(nuevosApellidos) {
        if (typeof nuevosApellidos !== "string" || nuevosApellidos.trim() === "") {
            throw new Error("Los apellidos no pueden estar vacíos")
        }

        this.#apellidos = nuevosApellidos.trim()
    }

    set celular(nuevoCelular) {
        if (typeof nuevoCelular !== "string") {
            throw new Error("El celular debe ser un texto")
        }

        const celularLimpio = nuevoCelular.trim()

        if (!/^3\d{9}$/.test(celularLimpio)) {
            throw new Error("Ingresa un celular válido de 10 dígitos")
        }

        this.#celular = celularLimpio
    }

    set usuario(nuevoUsuario) {
        if (typeof nuevoUsuario !== "string") {
            throw new Error("El usuario debe ser un texto.")
        }

        const usuarioLimpio = nuevoUsuario.trim().toLowerCase()

        const patron = /^[a-z][a-z0-9_]{3,19}$/

        if (!patron.test(usuarioLimpio)) {
            throw new Error("Nombre de usuario inválido")
        }

        this.#usuario = usuarioLimpio
    }

    static validarContrasena(contrasena) {
        if (typeof contrasena !== "string") {
            throw new Error("La contraseña debe ser un texto)")
        }

        if (contrasena.length < 12) {
            throw new Error("La contraseña debe tener al menos 12 caracteres")
        }

        if (contrasena.length > 25) {
            throw new Error("La contraseña no puede superar los 25 caracteres")
        }

        return true
    }

    toJSON() {
        return {
            id: this.#id,
            identificacion: this.#identificacion,
            nombres: this.#nombres,
            apellidos: this.#apellidos,
            celular: this.#celular,
            usuario: this.#usuario
        }
    }

    static desdeJSON(datos) {
        if (typeof datos?.id !== "string" || datos.id.trim() === "") {
            throw new Error("El usuario almacenado no tiene un ID válido.")
        }

        return new Usuario(
            datos.identificacion,
            datos.nombres,
            datos.apellidos,
            datos.celular,
            datos.usuario,
            datos.id
        )
    }
}
