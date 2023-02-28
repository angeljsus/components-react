CREATE TABLE IF NOT EXISTS tbl_usuario (
 cveoper_usuario VARCHAR(10) NOT NULL,
 cuenta_usuario VARCHAR(250),
 nombre_usuario VARCHAR(250),
 paterno_usuario VARCHAR(250),
 materno_usuario VARCHAR(250),
 password_usuario VARCHAR(500),
 nivel_usuario INT,
 PRIMARY KEY (cveoper_usuario)
);`