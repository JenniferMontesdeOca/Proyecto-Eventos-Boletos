CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol_id INT NOT NULL DEFAULT 1,  -- 1=user, 2=organizador, 3=admin
    fecha_registro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora TIME,
    ubicacion VARCHAR(255),
    capacidad_total INT NOT NULL,
    boletos_disponibles INT NOT NULL,
    categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
    precio_base NUMERIC(10,2),
    localidad_principal VARCHAR(255),
    organizador_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE imagenes_evento (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE
);

CREATE TABLE localidades_evento (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    capacidad INT NOT NULL,
    boletos_disponibles INT NOT NULL
);


CREATE TABLE boletos (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    localidad_id INT REFERENCES localidades_evento(id),
    fecha_compra TIMESTAMP DEFAULT NOW(),
    precio NUMERIC(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'comprado'
);

CREATE TABLE transacciones (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
    monto NUMERIC(10,2) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'compra', 'reembolso', etc.
    fecha TIMESTAMP DEFAULT NOW()
);

