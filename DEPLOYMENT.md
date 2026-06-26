# Deployment Guide

## Testnet

1. Update `Clarinet.toml` to use testnet configuration
2. Run `clarinet test --net=testnet`
3. Run `clarinet deploy --net=testnet`

## Mainnet

1. Update `Clarinet.toml` to use mainnet configuration
2. Run `clarinet check`
3. Run `clarinet test`
4. Deploy via Hiro wallet or Clarinet

## Upgradability

After initial deployment, upgrades are handled via:

```clarity
(upgrade-implementation new-impl-principal)
```

Only the owner can call this function.
