import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {

  // Url of the Identity Provider
  issuer: 'https://fssfed.stage.ge.com/fss',

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + "/index.html",

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: 'GEDIG_DavisVision_Stage_client',

  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  scope: 'openid profile email',
}
