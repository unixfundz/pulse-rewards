# Monitoring

Pulse Rewards ships with a full observability stack: **Prometheus**, **Grafana**, and **Alertmanager**.

## Stack

| Component | Purpose | Default port |
|-----------|---------|-------------|
| Prometheus | Metrics collection & alerting rules | 9090 |
| Grafana | Dashboards & visualization | 3002 |
| Alertmanager | Alert routing (email, Slack, PagerDuty) | 9093 |

## Running locally

Add the monitoring stack to your Docker Compose run:

```bash
docker compose --profile monitoring up
```

Then open:
- Grafana: http://localhost:3002 (default login: admin / admin)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

## Alert routing

Edit `alertmanager/alertmanager.yml` to configure your notification channels.  
Required secrets (do not commit):
- `smtp_auth_password`
- PagerDuty `service_key`
- Slack webhook URL

## Adding dashboards

Drop dashboard JSON files into `grafana/dashboards/`. They are auto-provisioned on startup.  
Recommended community dashboards:
- Node Exporter Full: [grafana.com/dashboards/1860](https://grafana.com/grafana/dashboards/1860)
- PostgreSQL: [grafana.com/dashboards/9628](https://grafana.com/grafana/dashboards/9628)
- Redis: [grafana.com/dashboards/11835](https://grafana.com/grafana/dashboards/11835)
