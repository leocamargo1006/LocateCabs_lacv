var app    = require('express')();
var server = require('http').createServer(app);

const port = 3000
var DatosGPS;
var Datatotalgps
var udp = require('dgram');

var dir = __dirname;

app.get('/', function(req, res) {
    res.sendfile(dir + '/index.html');
});



var io = require('socket.io')(server);

server.listen(port, function(error) {
    if (error) {
        console.log('Hay un error', error)
    } else {
        console.log('El servidor esta escuchando el puerto ' + port)
    }
})

//Variables de entorno
dotenv = require('dotenv')

const entvar = dotenv.config()

if (entvar.error) {
  throw result.error
}

console.log(entvar.parsed)


const mysql = require('mysql')
var data;

var con = mysql.createConnection({
    host: entvar.parsed.DB_HOST,
    user: entvar.parsed.DB_USER,
    password: entvar.parsed.DB_PASS,
    database: 'locatecabs'
})   

con.connect((err) =>{
    if(err) {
        console.log('hay un error de conexión con la base de datos')
    }else{
        console.log('la conexión con la base de datos funciona')
    } 
})

var Imysql = "INSERT INTO gps (Usuario, Latitud, Longitud, Fecha, Hora) VALUES ?";
var values = [
    ["-","-","-","-","-"],
  ];
con.query(Imysql, [values], function (err) {
if (err) throw err;
});

// creating a udp server
var serverudp = udp.createSocket('udp4');

// emits when any error occurs
serverudp.on('error',function(error){
  console.log('Error: ' + error);
  serverudp.close();
});

// emits on new datagram msg
serverudp.on('message',function(msg,info){ 
  console.log('Data received from client : ' + msg.toString());
  console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
//sending msg
serverudp.send(msg,info.port,'localhost',function(error){
  if(error){
    client.close();
  }else{
    console.log('Data sent !!!');
  }
});

DatosGPS = msg.toString().split(";")
 


// 
    Datatotalgps = parseFloat(DatosGPS[3])
    let unix_timestamp = Datatotalgps
    var date = new Date(unix_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var month = months[date.getMonth()];
    var hours = date.toLocaleTimeString('en-GB',{timeZone:'America/Bogota'});
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var formattedTime = hours.substr(0,2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    var tot1 = formattedTime.toString() ; 
    var tot2 =  date.getDate().toString()+"/"+  month.toString()+"/"+date.getFullYear().toString() ; 

//




var Imysql = "INSERT INTO gps (Usuario, Latitud, Longitud, Fecha, Hora) VALUES ?";
var values = [
    [DatosGPS[0],DatosGPS[1], DatosGPS[2],tot2,tot1],];
con.query(Imysql, [values], function (err, result) {
if (err) throw err;
console.log("Records inserted: " + result.affectedRows);

});
});
//emits after the socket is closed using socket.close();
serverudp.on('close',function(){
  console.log('Socket is closed !');
});

serverudp.bind(3020);

setTimeout(function(){
serverudp.close();
},999999999);

setInterval(function(){
con.query('SELECT * FROM gps ORDER BY idGPS DESC LIMIT 1', function(err, rows) {
  if(err) throw err;
  data = JSON.parse(JSON.stringify(rows))
  var dataGPS = Object.values(data[0])
  var DataUsu = dataGPS[1]
  var DataLat = dataGPS[2]
  var DataLong = dataGPS[3]
  var DataFecha = dataGPS[4]
  var DataHora = dataGPS[5]

  io.emit('change', {
      DataUsu :DataUsu, 
      DataLat: DataLat,
      DataLong: DataLong,
      DataFecha: DataFecha,
      DataHora: DataHora

      
  });

io.on('connection', function(socket) {
  socket.emit('change', {
    DataUsu :DataUsu, 
      DataLat: DataLat,
      DataLong: DataLong,
      DataFecha: DataFecha,
      DataHora: DataHora 
  });


  


});
});
},3000);