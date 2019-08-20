//==============
//PUERTO
//==============

/**Variable de Prod */
process.env.PORT = process.env.PORT || 3000;




//==============
//ENTORNO
//==============

/** Variable de Prod */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//=====================
//Vencimiento del token
//=====================
// 60 * 60 * 24 *30

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 *30


//=====================
//SEED de autenticación
//=====================


process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'seed-desarrollo'



//====================
//Base de datos
//====================

let urlDB;


if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
    console.log(urlDB);
}else{
    urlDB = process.env.MONGO_URI;
    console.log(urlDB);
}

process.env.urlDB = urlDB;

//=====================
//Google Client ID
//=====================


process.env.CLIENT_ID = process.env.CLIENT_ID || '29827501574-5n2akknjamg7bf75m5brdnlvvq7cj9le.apps.googleusercontent.com'