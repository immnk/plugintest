import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OAuthService } from 'angular-oauth2-oidc';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public oAuthService: OAuthService, private iab: InAppBrowser) {

  }

  public login() {
    // this.oAuthService.initImplicitFlow();
    this.oktaLogin().then(success => {
      console.log(success);
      // localStorage.setItem('access_token', success.access_token);
      this.oAuthService.processIdToken(success.id_token, success.access_token);
      // this.navCtrl.push(TabsPage);
    }, (error) => {
      // this.error = error;
    });
  }

  oktaLogin(): Promise<any> {
    return this.oAuthService.createAndSaveNonce().then(nonce => {
      let state: string = Math.floor(Math.random() * 1000000000).toString();
      if (window.crypto) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        state = array.join().toString();
      }
      return new Promise((resolve, reject) => {
        const oauthUrl = this.buildOAuthUrl(state, nonce);
        const browser = this.iab.create(oauthUrl, '_blank',
          'location=no,clearsessioncache=yes,clearcache=yes');
        browser.on('loadstart').toPromise().then((event) => {
          if ((event.url).indexOf('http://localhost:8100') === 0) {
            // browser.removeEventListener('exit', () => { });
            browser.close();
            const responseParameters = ((event.url).split('#')[1]).split('&');
            const parsedResponse = {};
            for (let i = 0; i < responseParameters.length; i++) {
              parsedResponse[responseParameters[i].split('=')[0]] =
                responseParameters[i].split('=')[1];
            }
            const defaultError = 'Problem authenticating with Okta';
            if (parsedResponse['state'] !== state) {
              reject(defaultError);
            } else if (parsedResponse['access_token'] !== undefined &&
              parsedResponse['access_token'] !== null) {
              resolve(parsedResponse);
            } else {
              reject(defaultError);
            }
          }
        });
        browser.on('exit').toPromise().then((event) => {
          reject('The Okta sign in flow was canceled');
        });
      });
    });
  }

  buildOAuthUrl(state, nonce): string {
    return this.oAuthService.issuer + '/v1/authorize?' +
      'client_id=' + this.oAuthService.clientId + '&' +
      'redirect_uri=' + this.oAuthService.redirectUri + '&' +
      'response_type=id_token%20token&' +
      'scope=' + encodeURI(this.oAuthService.scope) + '&' +
      'state=' + state + '&nonce=' + nonce;
  }

  public logoff() {
    this.oAuthService.logOut();
  }

  public get name() {
    let claims = this.oAuthService.getIdentityClaims();
    if (!claims) return null;
    return claims["given_name"];
  }

}
