import { TestBed } from '@angular/core/testing';

import { ConfigurationService } from './configuration.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
import config from '../../../../config.me.json';
import { asyncData } from 'src/app/testing/async-observable-helpers';

describe('ConfigurationService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let storageService: StorageService;
  let configurationService: ConfigurationService;

  beforeEach(() => {
    // TestBed.configureTestingModule(
    //   {
    //     imports: [HttpClientTestingModule],
    //     providers:
    //       [
    //         StorageService
    //       ]
    //   });
    // TestBed.inject(HttpClient);
    // service = TestBed.inject(ConfigurationService);

    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    configurationService = new ConfigurationService(httpClientSpy, new StorageService());
  });

  it('should be created', () => {
    expect(configurationService).toBeTruthy();
  });

  it('should return expected configuration (HttpClient called once)', (done: DoneFn) => {
    httpClientSpy.get.and.returnValue(asyncData(config))

    configurationService.load().subscribe({
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
