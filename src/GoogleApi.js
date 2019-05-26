
export default class GoogleApi {
  constructor(options = {}) {
    this.options = {
      ...options,
    };

    if (!this.options.apiKey) {
      throw new Error('You need to set apiKey');
    }

    if (!this.options.clientId) {
      throw new Error('You need to set clientId');
    }

    if (!this.options.wait) {
      this.init();
    }
  }

  getAppId() {
    return this.options.appId;
  }

  async init() {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve) => {
      const {
        apiKey,
        clientId,
        cookiePolicy,
        loginHint,
        hostedDomain,
        autoLoad,
        isSignedIn,
        fetchBasicProfile,
        redirectUri,
        discoveryDocs,
        onFailure,
        uxMode,
        scope,
        accessType,
        responseType,
        jsSrc
      } = this.options;

      if (window.document.getElementById('google-jssdk')) {
        resolve(window.gapi);
      }

      loadScript(jsSrc, () => {
        const params = {
          client_id: clientId,
          cookie_policy: cookiePolicy,
          login_hint: loginHint,
          hosted_domain: hostedDomain,
          fetch_basic_profile: fetchBasicProfile,
          discoveryDocs,
          ux_mode: uxMode,
          redirect_uri: redirectUri,
          scope,
          access_type: accessType,
        }

        if (responseType === 'code') {
          params.access_type = 'offline';
        }

        window.gapi.load('client:auth2', () => {
          window.gapi.client.init(
            {
              apiKey: apiKey,
              clientId: clientId,
              discoveryDocs: discoveryDocs,
              scope: scope
            })
            .then(
              res => {
                // window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
                resolve(window.gapi);
              },
              err => {
                reject(err);
              }
            );
        })
      })
    });

    return this.loadingPromise;
  }

  loadScript = async(jsSrc, cb) => {
    const js = window.document.createElement('script');
    js.id = 'google-jssdk';
    js.async = true;
    js.defer = true;
    js.src = jsSrc;
    js.onload = cb;

    window.document.body.appendChild(js);
  }

  getGapi = async () => {
    return await this.init();
  }

  getAuthInstance = async () => {
    const gapi = await this.init();
    return gapi.auth2.getAuthInstance();
  }

  getCurrentUser = async () => {
    const gapi = await this.init();
    if (gapi.isSignedIn.get()) {
      return gapi.currentUser.get();
    }
    return null;
  }

  parseCurrentUser(currentUser) {
    const basicProfile = currentUser.getBasicProfile()
    const authResponse = currentUser.getAuthResponse()
    currentUser.googleId = basicProfile.getId()
    currentUser.tokenObj = authResponse
    currentUser.tokenId = authResponse.id_token
    currentUser.accessToken = authResponse.access_token
    currentUser.profileObj = {
      googleId: basicProfile.getId(),
      imageUrl: basicProfile.getImageUrl(),
      email: basicProfile.getEmail(),
      name: basicProfile.getName(),
      givenName: basicProfile.getGivenName(),
      familyName: basicProfile.getFamilyName()
    }

    return currentUser;
  }
}
