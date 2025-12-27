# DigitalOcean Deployment

This project is configured for deployment on DigitalOcean App Platform.

## Quick Deploy

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/abhijitho2011/drive-certified/tree/main)

## Manual Deployment

### Prerequisites

1. DigitalOcean account with $200 credit
2. GitHub repository
3. PostgreSQL database cluster created

### Steps

1. **Create PostgreSQL Database**
   - Go to DigitalOcean → Databases
   - Create PostgreSQL 15 cluster
   - Name: `drive-certified-db`
   - Plan: Basic ($15/month)

2. **Deploy App**
   - Go to DigitalOcean → Apps
   - Create App from GitHub
   - Select this repository
   - Use `.do/app.yaml` for configuration

3. **Configure Environment Variables**
   - Backend:
     - `DATABASE_URL`: From database connection details
     - `JWT_SECRET`: Generate strong secret (32+ characters)
     - `JWT_EXPIRATION`: `7d`
     - `NODE_ENV`: `production`
   - Frontend:
     - `VITE_API_URL`: Backend URL + `/api`
     - `VITE_WS_URL`: Backend WebSocket URL

4. **Run Migrations**
   ```bash
   # From App Platform console or locally
   npx prisma migrate deploy
   ```

## Configuration

The app is configured via `.do/app.yaml`:

- **Backend**: NestJS API on port 3001
- **Frontend**: React SPA served as static site
- **Database**: PostgreSQL 15 managed database

## Costs

- PostgreSQL: $15/month
- Backend: $12/month
- Frontend: $5/month
- **Total**: $32/month

**First 60 days FREE** with $200 credit!

## Monitoring

- View logs: App Platform → Runtime Logs
- Metrics: App Platform → Insights
- Database: Database Cluster → Metrics

## Support

- [DigitalOcean Docs](https://docs.digitalocean.com)
- [App Platform Guide](https://docs.digitalocean.com/products/app-platform/)
- [Community Forums](https://www.digitalocean.com/community)
