<?php
return ['table' => 'escribano_adjuntos', 'columns' => ['id' => 'bigint primary key', 'escribano_id' => 'bigint', 'nombre_original' => 'varchar(255)', 'checksum_sha256' => 'varchar(64)', 'cipher_blob' => 'bytea', 'nonce' => 'varchar(255)', 'auth_tag' => 'varchar(255)', 'key_version' => 'int']];
