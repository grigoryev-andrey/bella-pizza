import SuperTokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailPassword from 'supertokens-node/recipe/emailpassword';

export interface SuperTokensConfig {
  connectionURI: string;
  apiDomain: string;
  websiteDomain: string;
  apiKey: string;
  appName: string;
}

export function initSuperTokens(config: SuperTokensConfig) {
  SuperTokens.init({
    framework: 'express',
    supertokens: {
      connectionURI: config.connectionURI,
      apiKey: config.apiKey,
    },
    appInfo: {
      appName: config.appName,
      apiDomain: config.apiDomain,
      websiteDomain: config.websiteDomain,
      apiBasePath: '/api',
      websiteBasePath: '/auth',
    },
    recipeList: [
      Session.init({
        cookieSecure: false,
        cookieSameSite: 'lax',
        getTokenTransferMethod: () => 'cookie',
      }),
      EmailPassword.init(),
    ],
    // debug: true,
  });
}
