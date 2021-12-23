//En proyectos grandes los middleware van a parte del archivo app

function log(req, res, next) {
    console.log('Logging...');
    next();
}



//se exporta
module.exports = log;