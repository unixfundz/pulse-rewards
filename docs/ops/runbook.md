# Operations Runbook

## Service health checks

```bash
# Backend
curl https://api.pulse-rewards.io/health

# Kubernetes pods
kubectl get pods -n pulse-rewards

# DB connectivity (from backend pod)
kubectl exec -it deploy/pulse-backend -- node -e "require('./backend/dist/db/client').db.raw('SELECT 1').then(() => console.log('DB OK'))"
```

## Deploy a new version

1. Tag the release: `git tag v1.x.x && git push --tags`
2. CI/CD builds and pushes Docker images to GHCR.
3. Update image tags in Helm values or K8s manifests.
4. Apply: `helm upgrade pulse-rewards k8s/helm --values k8s/helm/values.yaml`
5. Verify rollout: `kubectl rollout status deployment/pulse-backend`

## Rollback

```bash
helm rollback pulse-rewards 1  # roll back to previous revision
```

## Database migrations

```bash
# Run pending migrations
kubectl exec -it deploy/pulse-backend -- node backend/dist/db/migrate.js

# Rollback last migration
kubectl exec -it deploy/pulse-backend -- node backend/dist/db/migrate.js rollback
```

## Rotate JWT keys

1. Generate new keys: `node pulseRewards/backend/scripts/generate-jwt-keys.js`
2. Update `jwt-private-key` and `jwt-public-key` in Kubernetes secrets.
3. Restart backend: `kubectl rollout restart deployment/pulse-backend`
4. All existing access tokens become invalid; users must re-login.

## Rotate Stellar distribution keypair

1. Generate new keypair at [laboratory.stellar.org](https://laboratory.stellar.org).
2. Fund it from existing distribution account (keep enough for open transactions).
3. Update `stellar-distribution-secret` and `stellar-distribution-public` in K8s secrets.
4. Restart backend.

## Common incidents

### Backend pods crash-looping

```bash
kubectl logs deploy/pulse-backend --previous
```

Common causes:
- Missing env variable — check secrets are mounted.
- DB connection failure — verify `DATABASE_URL` and SG rules.
- Redis unreachable — verify `REDIS_URL`.

### Rewards stuck in `pending`

The async Stellar transfer failed silently. Check backend logs for `PULSE transfer` errors:
```bash
kubectl logs deploy/pulse-backend | grep "PULSE transfer"
```
Re-trigger by querying pending rewards older than 10 min and retrying via `StellarService.transferPulseToken`.

### High error rate alert

```bash
# Check recent errors
kubectl logs deploy/pulse-backend --since=10m | grep '"status":5'
```

If Horizon is unreachable, the app falls back to returning 502 on wallet endpoints. Reward claims still create DB records (pending) and will be processed when Horizon recovers.
