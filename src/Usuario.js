export default class Usuario{
    //Se crean las propiedades:
    #identificacion;
    #nombreCompleto;
    #celular;
    #nombreUsuario;
    #contrasena;
    #intentosFallidos;
    #bloqueada

    constructor(identificacion, nombreCompleto, celular, nombreUsuario, contrasena){
    this.#identificacion=identificacion;
    this.#nombreCompleto=nombreCompleto;
    this.#celular=celular;
    this.#nombreUsuario=nombreUsuario;
    this.#contrasena=contrasena;
    }
    
    get identificacion(){return this.#identificacion};
    get nombreCompleto(){return this.#nombreCompleto};
    get celular(){return this.#celular};
    get nombreUsuario(){return this.#nombreUsuario};
    get contrasena(){return this.#contrasena};

    
    
    
}



