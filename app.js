//lectura sopa de letras
// http://trackmaze.blogspot.com/2013/01/resolver-una-sopa-de-letras-con-python.html
const hostname = '127.0.0.1';
const port = 3001;
const express = require('express')
const app = express()
const palabraBuscar = "OIE";

// Create HTTP error

function createError(status, message) {
	var err = new Error(message);
	err.status = status;
	return err;
}

app.param(['f', 'c'], function(req, res, next, value, name){
	req.params[name] = parseInt(value, 10);
	if( isNaN(req.params[name]) ){
		next(createError(400, 'failed to parseInt '+name+': '+value));
	} else {
		next();
	}
});

app.param('string', function(req, res, next, value){
	let array = value.split(",");
	if(array.length!=req.params['f']){
		next(createError(400, 'Cantidad de Filas incorrectas'));
	} else {
		if(array.some(element => element.length!=req.params['c']))
			next(createError(400, 'Cantidad de Columnas incorrectas'));
		else
		{
			req.arrayLetras = array;
			next();
		}
	}
});

app.get('/validar-sopa/:f/:c/:string', (req, res) => {
	let arrayLetras = req.arrayLetras;
	res.writeHead(200,{'Content-Type': 'text/html'});
	res.write('<html>');
	res.write('<head>');
	res.write('<title>Sopa de Letras y resultado</title>');
	res.write('<meta name="viewport" content="width=device-width, initial-scale=1">');
	res.write('</head>');
	res.write('<body>');
	res.write(`Sopa de Letras con ${req.params['f']} Filas y ${req.params['c']} Columnas`);
	res.write('</br>');
	req.arrayLetras.forEach((x,i) => {
		res.write(x);
		res.write('</br>');
	});
	res.write(`Cantidad de veces encontrada la palabra ${palabraBuscar}: ${buscarpalabraMatriz(req.arrayLetras, 0, req.params['f']*req.params['c'])}`);
	res.write('</br>');
	res.write('</body>');
	res.write('</html>');
	res.end();
});

function buscarpalabraMatriz(arrayLetras,resultados, limite) {
	let x = 0;
	let y = 0;
	for (let posletra = 0; posletra < limite; posletra++) {
		if (posletra%arrayLetras[x].length===0 && posletra!==0) {
			x++;
			y=0;
		}
		let letra = arrayLetras[x][y].toUpperCase();
		if (letra===palabraBuscar[0].toUpperCase()) {
			resultados = busqueda(arrayLetras, resultados,y,x,0,1);
			resultados = busqueda(arrayLetras, resultados,y,x,0,-1);
			resultados = busqueda(arrayLetras, resultados,y,x,1,0);
			resultados = busqueda(arrayLetras, resultados,y,x,-1,0);
			resultados = busqueda(arrayLetras, resultados,y,x,1,1);
			resultados = busqueda(arrayLetras, resultados,y,x,-1,-1);
			resultados = busqueda(arrayLetras, resultados,y,x,-1,1);
			resultados = busqueda(arrayLetras, resultados,y,x,-1,1);
		}
		y++;
	}
	return resultados;
}

function busqueda(arrayLetras, resultados, dy, dx, sumx, sumy) {
	let x= dx;
	for (let index = 0; (index < palabraBuscar.length && dy<arrayLetras[x].length  && dx<arrayLetras.length && dx>=0 && dy>=0); index++) {
		let letra = arrayLetras[dx][dy].toUpperCase();
		if (letra == palabraBuscar[index].toUpperCase() && index==2) {
			resultados++;
		}
		else if (letra != palabraBuscar[index].toUpperCase()) {
			index=palabraBuscar.length;
		}
		dx+=sumx;
		dy+=sumy;
	} 
	return resultados;
}

app.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});