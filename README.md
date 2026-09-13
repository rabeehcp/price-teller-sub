## Docker Compose

PriceTeller uses two Compose configurations.

### Production

```bash
docker compose -f docker-compose.yml up --build

The production configuration uses the normal Docker bridge network:

Frontend runs behind Nginx.
Nginx communicates with the backend using backend:5000.
Backend connects to the external Aiven PostgreSQL database.
Backend port 5000 is not publicly published.

Architecture:

Frontend/Nginx → backend:5000 → Aiven PostgreSQL

Codespaces Development

Codespaces uses an additional override:

docker compose -f docker-compose.yml -f compose.dev.yaml up --build

compose.dev.yaml exists because the Codespaces environment has a networking limitation with normal Docker bridge networks.

In Codespaces:

Backend uses host networking.
Frontend Nginx uses host.docker.internal:5000.
PostgreSQL remains external on Aiven.

Architecture:

Frontend/Nginx → host.docker.internal:5000 → Backend → Aiven PostgreSQL

Important

Do not use compose.dev.yaml as the production configuration.

It is specifically a development workaround for the Codespaces environment.