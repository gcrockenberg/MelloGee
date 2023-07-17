import { ConfigurationService } from './configuration.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
import config from 'src/assets.dev/config.me.json';
import { asyncData } from 'src/app/testing/async-observable-helpers';

describe('ConfigurationService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let configurationService: ConfigurationService;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    // Simulate http serialization
    httpClientSpy.get.and.returnValue(
      asyncData(JSON.parse(JSON.stringify(config)))
    );
    // Gets data on load
    configurationService = new ConfigurationService(httpClientSpy, new StorageService());
  });

  it('should be created', () => {
    expect(configurationService).toBeTruthy();
  });

  it('should return expected configuration (HttpClient called once)', (done: DoneFn) => {
    configurationService.settingsLoaded$.subscribe({
      next: result => {
        expect(result)
          .withContext('expected configuration')
          .toEqual(config);

        expect(configurationService.isReady)
          .withContext('expected configuration service is ready')
          .toEqual(true);

        expect(configurationService.serverSettings.identityUrl)
          .withContext('expected configuration value')
          .toBeDefined()

        done();
      },
      error: done.fail
    });

    expect(httpClientSpy.get.calls.count())
      .withContext('one call')
      .toBe(1);
  });

});
