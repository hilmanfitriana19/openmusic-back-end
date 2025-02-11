# openmusic-openmusic-back-end

Repository aplikasi pada Submission Kelas [Dicoding Belajar Fundamental Aplikasi Back-End](https://www.dicoding.com/academies/271) .

# Quickstart

Clone Repository
```
git clone https://github.com/hilmanfitriana19/openmusic-back-end
```bash
cd openmusic-back-end
```

Install dependency
```bash
npm install
```

Membuat .env dengan referensi pada .env.example
```bash
# server configuration
HOST=host
PORT=port

# node-postgres configuration
PGUSER=pguser
PGHOST=pghost
PGPASSWORD=password
PGDATABASE=database_name
PGPORT=port

# security configuration
ACCESS_TOKEN_KEY=generated_token_secret_key
REFRESH_TOKEN_KEY=generated_refrech_token_key
ACCESS_TOKEN_AGE=angka

# Message broker
RABBITMQ_SERVER=amqp://localhost

# Redis
REDIS_SERVER=localhost

```

Start Project
```bash
npm run start
```
