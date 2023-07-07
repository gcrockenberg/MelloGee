import { Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { BrowserConfiguration, InteractionType } from '@azure/msal-browser';

import { AppComponent } from './app.component';
import { MSALInstanceFactory } from './config.auth';

describe('Sanitize the configuration object', () => {
    let msalConfig: BrowserConfiguration;
    beforeEach(() => { msalConfig = MSALInstanceFactory().getConfiguration() });

    it('should define the config object', () => {
        expect(msalConfig).toBeDefined();
        expect(msalConfig.auth.clientId).toBeDefined();
        expect(msalConfig.auth.authority).toBeDefined();
        expect(msalConfig.auth.redirectUri).toBeDefined();
    });

    it('should contain credentials', () => {
        const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(regexGuid.test(msalConfig.auth.clientId)).toBe(true);
    });

    it('should contain authority uri', () => {
        const regexUri = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        expect(regexUri.test(msalConfig.auth.authority!)).toBe(true);
    });
});

