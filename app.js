const debug = require('debug')('app:inicio'); //eliminar errores
//const dbDebug = require('debug')('app:db'); //en proyectos grande se recomiendo dividur la depuracion 
const express = require('express');
const config = require('config');
//importamos logger
//const logger = require('./logger');
//importamos middleware de terceros reemplaza a logger
const morgan = require('morgan');
const Joi = require('@hapi/joi');
//Instanciar express: 
const app = express();

//los middleware van primero

//función middleware que nos permite recibir peticiones (datos) en formato json del body
app.use(express.json());

//función middleware para envio de usuarios por formulario
app.use(express.urlencoded({ extended:true }));

//función middleware para envio de archivos estaticos como imagenes a servidor estatico
app.use(express.static('public'));

//Configuración de entornos - por default esta en modo desarrollo, para cambiar a modo producción hay que poner en la terminal powershell $env:NODE_ENV="production" (o "development" para volver a desarrollo)
console.log('Aplicación: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));


//Uso de middleware de terceros para mostrar en terminas los logs HTTP
if(app.get('env') === 'development'){ //solo se va a ejecutar morgan cuando este en modo de desarrollo
    app.use(morgan('tiny')); //se le da el formato tiny
    //console.log('Morgan habilitado...')
    debug('Morgan habilitado...');  //para iniciar la depuracion $env:DEBUG="app:inicio"
};

//Trabajos con la base de datos
debug('Conectando con la base de datos...')

//se llama a la funcion middleware logger (fue reemplazada por morgan)
//app.use(logger);
 

// app.get(); petición
// app.post(); envío datos
// app.put(); actualización
// app.delete(); eliminación


//Petición GET 
//creamos los usuarios
const usuarios = [
    {id:1, name: 'Grover'},
    {id:2, name: 'Pablo'},
    {id:3, name: 'Ana'}
];


//Crea rutas del servidor web
app.get('/', (req, res) => {
    res.send('Hola mundo desde Express.');
    //Response, metodo send envia información al cliente
}); 
app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});
//parametros en las rutas
app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);
});


//Petición POST, uso de POSTMAN
app.post('/api/usuarios', (req, res) => {
  
    const {error, value} = validarUsuario( req.body.name);
    if(!error) {
        const usuario = {
            id: usuarios.length + 1,
            name: value.name
        };
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const message = error.details[0].message;
        res.status(400).send(message);
    }
    
});


//Petición PUT
//En la ruta se le pone un parametro, que seria el ID para saber que dato se va a modificar
app.put('/api/usuarios/:id', (req, res) => {
    //Encontrar si existe el objeto usuario
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    };
  
    const {error, value} = validarUsuario(req.body.name);
    if(error) {
        const message = error.details[0].message;
        res.status(400).send(message);
        return;
    }

    usuario.name = value.name;
    res.send(usuario);
});


//Petición DELETE
app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);

    res.send(usuario);
});




//variable de entorno, cambias el puerto desde terminal comando $env:PORT=
const port = process.env.PORT || 3001;
//Se le indica que puerto va a escuchar el servidor web
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`);
});




//Creamos modulo para comprobar si existe el usuario
function existeUsuario(id){
    //.find funcion que te permite buscar en un array el valor que le indicamos
    return(usuarios.find(u => u.id === parseInt(id)));
};

//Creamos módulo para comprobar si es correcto el usuario
function validarUsuario(n){
    //Usamos modulo Joi para validaciones
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate({ name: n });
}