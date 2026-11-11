
import { Usuario } from "./Usuario.js"

// HERENCIA: un Cliente es un Usuario que además tiene productos bancarios
export class Cliente extends Usuario {

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
