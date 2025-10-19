```bash
# build web
npx expo export --platform web

# deploy preview version
eas deploy

# deploy production version
eas deploy --prod

# build and deploy production version
npx expo export --platform web && eas deploy --prod
```


Dashboard       https://expo.dev/projects/4954432f-f144-4b40-8022-0bcae52af3cc/hosting/deployments
Deployment URL  https://ezram-rn--ehviz9y9rr.expo.app
Production URL  https://ezram-rn.expo.app