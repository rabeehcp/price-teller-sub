## Docker Compose with Aiven PostgreSQL

The production stack uses the normal Docker bridge network:

`Frontend/Nginx -> backend:5000 -> Aiven PostgreSQL`

1. On the Docker host, create the environment file:

	```bash
	cp .env.example .env
	```

2. Set `DATABASE_URL` in `.env` to the connection string copied from Aiven. Keep `sslmode=require`.
3. Allow the Docker host's public IP in the Aiven service's trusted sources/firewall settings.
4. Start the stack:

	```bash
	docker compose -f docker-compose.yml up -d --build
	```

Open `http://localhost:8080`. The frontend proxies `/api` to the backend container. The backend port is intentionally not published publicly.

Do not use `compose.dev.yaml` for a normal Docker host. It is only a Codespaces development workaround.