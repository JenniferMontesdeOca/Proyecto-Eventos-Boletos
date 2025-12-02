CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre_rol TEXT UNIQUE NOT NULL
);
INSERT INTO roles (nombre_rol) VALUES ('cliente'), ('organizador'), ('administrador')
ON CONFLICT DO NOTHING;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol_id INT REFERENCES roles(id) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL
);

CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  ubicacion TEXT,
  capacidad_total INT NOT NULL CHECK (capacidad_total >= 0),
  boletos_disponibles INT NOT NULL CHECK (boletos_disponibles >= 0),
  organizador_id INT REFERENCES usuarios(id) NOT NULL,
  categoria_id INT REFERENCES categorias(id) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE imagenes_evento (
  id SERIAL PRIMARY KEY,
  evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
  url_imagen TEXT NOT NULL,
  nombre_archivo TEXT NOT NULL,
  es_principal BOOLEAN DEFAULT FALSE
);

CREATE TABLE boletos (
  id SERIAL PRIMARY KEY,
  evento_id INT REFERENCES eventos(id) NOT NULL,
  usuario_id INT REFERENCES usuarios(id) NOT NULL,
  fecha_compra TIMESTAMP NOT NULL DEFAULT NOW(),
  precio NUMERIC(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'comprado'
);

CREATE TABLE transacciones (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  evento_id INT REFERENCES eventos(id),
  monto NUMERIC(10,2) NOT NULL,
  tipo TEXT NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_eventos_categoria_fecha ON eventos(categoria_id, fecha);
CREATE INDEX idx_eventos_search ON eventos USING GIN (to_tsvector('spanish', coalesce(nombre,'') || ' ' || coalesce(descripcion,'')));
