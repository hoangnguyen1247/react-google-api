import React, { Component } from 'react';

import canUseDOM from './can-use-dom';
import GoogleApi from './GoogleApi';
import GoogleApiContext from './GoogleApiContext';

let gapi = null;

const propTypes = {
    onSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    clientId: PropTypes.string.isRequired,
    jsSrc: PropTypes.string,
    onRequest: PropTypes.func,
    buttonText: PropTypes.node,
    scope: PropTypes.string,
    className: PropTypes.string,
    redirectUri: PropTypes.string,
    cookiePolicy: PropTypes.string,
    loginHint: PropTypes.string,
    hostedDomain: PropTypes.string,
    children: PropTypes.node,
    disabledStyle: PropTypes.object,
    fetchBasicProfile: PropTypes.bool,
    prompt: PropTypes.string,
    tag: PropTypes.string,
    autoLoad: PropTypes.bool,
    disabled: PropTypes.bool,
    discoveryDocs: PropTypes.array,
    uxMode: PropTypes.string,
    isSignedIn: PropTypes.bool,
    responseType: PropTypes.string,
    type: PropTypes.string,
    accessType: PropTypes.string,
    render: PropTypes.func,
    theme: PropTypes.string,
    icon: PropTypes.bool
}

const defaultProps = {
    type: 'button',
    tag: 'button',
    buttonText: 'Sign in with Google',
    scope: 'profile email',
    accessType: 'online',
    prompt: '',
    cookiePolicy: 'single_host_origin',
    fetchBasicProfile: true,
    isSignedIn: false,
    uxMode: 'popup',
    disabledStyle: {
        opacity: 0.6
    },
    icon: true,
    theme: 'light',
    onRequest: () => { },
    jsSrc: 'https://apis.google.com/js/api.js'
}

export default class GoogleApiProvider extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    state = {
        isReady: false,
    };

    componentDidMount() {
        this.handleInit();
    }

    handleInit = async () => {
        // do not run if SSR
        if (!canUseDOM) {
            throw new Error('You can not use Google Api without DOM');
        }

        if (!gapi) {
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
            } = this.props

            gapi = new GoogleApi({
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
            });
        }

        await gapi.init();

        if (!this.state.isReady) {
            this.setState({
                isReady: true,
            });
        }

        return gapi;
    }

    render() {
        const { children } = this.props;
        const { isReady, error } = this.state;
        const { handleInit } = this;

        const value = {
            isReady,
            error,
            handleInit,
            gapi: isReady ? gapi.getGapi() : null,
        };

        return (
            <GoogleApiContext.Provider value={value}>
                {children}
            </GoogleApiContext.Provider>
        );
    }
}