DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY NOT NULL,
  notification_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  message VARCHAR(300) NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  to_uid UUID NOT NULL,
  from_uid UUID NOT NULL,
  payload UUID NOT NULL,  -- (e.g system_uid for request tobe admin system or user_uid request tobe superadmin)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (to_uid) REFERENCES users (user_uid),
  FOREIGN KEY (from_uid) REFERENCES users (user_uid)
);