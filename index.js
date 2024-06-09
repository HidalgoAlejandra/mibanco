//requerir al programa pg
const { Pool } = require("pg");

const config = {
  host: "localhost",
  database: "banco",
  user: "postgres",
  password: "postgres",
  port: 5432,
};

const pool = new Pool(config);

// funcion para capturar errores
const errores = (err) => {
  console.error("Especificacion del error: ", err.stack);
  console.error("Codigo del error: ", err.code);
  return "Error interno del servidor en la funcion";
};

const argumentos = process.argv.slice(2);

const funcion = argumentos[0];
const descripcion = argumentos[1];
const fecha = argumentos[2];
const monto = argumentos[3];
const cuenta_origen = argumentos[4];
const cuenta_destino = argumentos[5];

//Crear una función asíncrona que registre una nueva transferencia utilizando una transacción SQL

const transferencia = async ({
  descripcion,
  fecha,
  monto,
  cuenta_origen,
  cuenta_destino,
}) => {
  try {
    await pool.query("BEGIN");

    const resta = "update cuentas set saldo=saldo -$1 where id=$2 returning *";
    const res1 = await pool.query(resta, [monto, cuenta_origen]);
    console.log("Operacion de giro exitosa", res1.rows[0]);

    const suma = "update cuentas set saldo=saldo +$1 where id=$2 returning *";
    const res2 = await pool.query(suma, [monto, cuenta_destino]);
    console.log("Operacion de deposito exitosa", res2.rows[0]);

    // Debe mostrar por consola la última transferencia registrada.

    const transferencia =
      "INSERT INTO transferencias (descripcion, fecha, monto, cuenta_origen, cuenta_destino) VALUES($1, $2, $3, $4, $5) RETURNING *";
    const res3 = await pool.query(transferencia, [
      descripcion,
      fecha,
      monto,
      cuenta_origen,
      cuenta_destino,
    ]);
    console.log("Operacion de transferencia exitosa", res3.rows[0]);

    await pool.query("COMMIT");
  } catch (err) {
    /* catch (error) {
    const { code } = error;
    console.log(code); 
    }*/
    console.error("Codigo del error: ", err.code);
    console.error("Codigo del error: ", err.detail);
  }
};

/* Realizar una función asíncrona que consulte la tabla de transferencias y retorne los
últimos 10 registros de una cuenta en específico. */

const movimientos = async ({ id }) => {
  const busqueda =
    "select * from transferencias where cuenta_origen=$1 or cuenta_destino=$1";
  const res = await pool.query(busqueda, [id]);
  console.log("Consulta movimientos exitosa", res.rows[0]);
};

//Realizar una función asíncrona que consulte el saldo de una cuenta en específico.

const consulta = async ({ id }) => {
  const busqueda = "select * from cuentas where id=$1";
  const res = await pool.query(busqueda, [id]);
  console.log("Consulta cuenta exitosa", res.rows[0]);
  console.log([id]);
};

const funciones = {
  transferencia: transferencia,
  movimientos: movimientos,
  consulta: consulta,
};

const arreglo = Object.keys(funciones);

//ejecucion principal
(async () => {
  if (funcion == "transferencia") {
    transferencia({
      descripcion,
      fecha,
      monto,
      cuenta_origen,
      cuenta_destino,
    });
  } else if (funcion == "consulta") {
    const id = descripcion; //uso descripcion porque es el primer argumento, y paso el valor hay
    consulta({ id });
  } else if (funcion == "movimientos") {
    const id = descripcion; //uso descripcion porque es el primer argumento, y paso el valor hay
    movimientos({ id });
  }
  //pool.end();
})();

//Ejemplos
//node index transferencia "Pago mensualidad" "02/05/2024" 10000 1 2
//node index transferencia "Pago mensualidad" "02/05/2024" 10000 1 4
//node index consulta 1
//node index movimientos 1
