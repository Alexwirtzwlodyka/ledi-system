<?php
return ['table' => 'users', 'columns' => ['id' => 'bigint primary key', 'username' => 'varchar(50) unique', 'email' => 'varchar(190) unique', 'password_hash' => 'varchar(255)', 'role' => 'varchar(30)', 'is_active' => 'boolean default true']];
