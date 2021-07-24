DROP TABLE IF EXISTS speeds1;

CREATE TABLE speeds1 (
  id SERIAL PRIMARY KEY NOT NULL,
  speeds1_uid UUID NOT NULL UNIQUE,
  iot_token VARCHAR(300) NOT NULL,
  speed INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (iot_token) REFERENCES systems (iot_token)
)