const hostname = '127.0.0.1';
const port = 3001;
const express = require('express')
const app = express()
const palabraBuscar = "OIE";
const allOrientations = ['horizontal','horizontalBack','vertical','verticalUp',
						'diagonal','diagonalUp','diagonalBack','diagonalUpBack'];

var orientations = {
	horizontal:     function(x,y,i) { return {x: x+i, y: y  }; },
	horizontalBack: function(x,y,i) { return {x: x-i, y: y  }; },
	vertical:       function(x,y,i) { return {x: x,   y: y+i}; },
	verticalUp:     function(x,y,i) { return {x: x,   y: y-i}; },
	diagonal:       function(x,y,i) { return {x: x+i, y: y+i}; },
	diagonalBack:   function(x,y,i) { return {x: x-i, y: y+i}; },
	diagonalUp:     function(x,y,i) { return {x: x+i, y: y-i}; },
	diagonalUpBack: function(x,y,i) { return {x: x-i, y: y-i}; }
};
var checkOrientations = {
	horizontal:     function(x,y,h,w,l) { return w >= x + l; },
	horizontalBack: function(x,y,h,w,l) { return x + 1 >= l; },
	vertical:       function(x,y,h,w,l) { return h >= y + l; },
	verticalUp:     function(x,y,h,w,l) { return y + 1 >= l; },
	diagonal:       function(x,y,h,w,l) { return (w >= x + l) && (h >= y + l); },
	diagonalBack:   function(x,y,h,w,l) { return (x + 1 >= l) && (h >= y + l); },
	diagonalUp:     function(x,y,h,w,l) { return (w >= x + l) && (y + 1 >= l); },
	diagonalUpBack: function(x,y,h,w,l) { return (x + 1 >= l) && (y + 1 >= l); }
};
var skipOrientations = {
	horizontal:     function(x,y,l) { return {x: 0,   y: y+1  }; },
	horizontalBack: function(x,y,l) { return {x: l-1, y: y    }; },
	vertical:       function(x,y,l) { return {x: 0,   y: y+100}; },
	verticalUp:     function(x,y,l) { return {x: 0,   y: l-1  }; },
	diagonal:       function(x,y,l) { return {x: 0,   y: y+1  }; },
	diagonalBack:   function(x,y,l) { return {x: l-1, y: x>=l-1?y+1:y    }; },
	diagonalUp:     function(x,y,l) { return {x: 0,   y: y<l-1?l-1:y+1  }; },
	diagonalUpBack: function(x,y,l) { return {x: l-1, y: x>=l-1?y+1:y  }; }
};

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
			resultados = horizontal(arrayLetras, resultados,y,x,1);
			resultados = horizontal(arrayLetras, resultados,y,x,-1);
			resultados = vertical(arrayLetras, resultados,y,x,1);
			resultados = vertical(arrayLetras, resultados,y,x,-1);
			resultados = diagonal(arrayLetras, resultados,y,x,1);
			resultados = diagonal(arrayLetras, resultados,y,x,-1);
			resultados = diagonalInverso(arrayLetras, resultados,y,x,1,-1);
			resultados = diagonalInverso(arrayLetras, resultados,y,x,-1,1);
		}
		y++;
	}
	return resultados;
}


function horizontal(arrayLetras, resultados, dy, dx,sum) {
	let x= dx;
	for (let index = 0; (index < palabraBuscar.length && dy<arrayLetras[x].length && dy>=0 ); index++) {
		let letra = arrayLetras[dx][dy].toUpperCase();
		if (letra == palabraBuscar[index].toUpperCase() && index==2) {
			resultados++;
		}
		else if (letra != palabraBuscar[index].toUpperCase()) {
			index=palabraBuscar.length;
		}
			
		dy+=sum;
	}
	return resultados;
}

function vertical(arrayLetras, resultados, dy, dx, sum) {
	for (let index = 0; (index < palabraBuscar.length && dx<arrayLetras.length && dx>=0); index++) {
		let letra = arrayLetras[dx][dy].toUpperCase();
		if (letra == palabraBuscar[index].toUpperCase() && index==2) {
			resultados++;
		}
		else if (letra != palabraBuscar[index].toUpperCase()) {
			index=palabraBuscar.length;
		}
		dx+=sum;
	}
	return resultados;
}

function diagonal(arrayLetras, resultados, dy, dx, sum) {
	let x= dx;
	for (let index = 0; (index < palabraBuscar.length && dy<arrayLetras[x].length  && dx<arrayLetras.length && dx>=0 && dy>=0); index++) {
		let letra = arrayLetras[dx][dy].toUpperCase();
		if (letra == palabraBuscar[index].toUpperCase() && index==2) {
			resultados++;
		}
		else if (letra != palabraBuscar[index].toUpperCase()) {
			index=palabraBuscar.length;
		}
		dx+=sum;
		dy+=sum;
	}
	return resultados;
}

function diagonalInverso(arrayLetras, resultados, dy, dx, sumx, sumy) {
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