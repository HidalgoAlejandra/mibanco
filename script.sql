create database banco;
\c banco

CREATE TABLE transferencias
(
id serial primary key,
descripcion varchar(50), 
fecha varchar(10), 
monto DECIMAL,
cuenta_origen INT, 
cuenta_destino INT,
foreign key (cuenta_origen) references cuentas(id),
foreign key (cuenta_destino) references cuentas(id)
);
CREATE TABLE cuentas (
id INT unique, 
saldo DECIMAL CHECK (saldo >= 0) 
);
INSERT INTO cuentas values (1, 20000);
INSERT INTO cuentas values (2, 10000);