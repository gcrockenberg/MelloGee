param profiles_cdn_me_dev_name string = 'cdn-me-dev'

resource profiles_cdn_me_dev_name_me_cdn 'Microsoft.Cdn/profiles/endpoints@2022-11-01-preview' = {
  name: '${profiles_cdn_me_dev_name}/me-cdn'
  location: 'Global'
  properties: {
    originHostHeader: 'stmedev.blob.core.windows.net'
    contentTypesToCompress: [
      'application/eot'
      'application/font'
      'application/font-sfnt'
      'application/javascript'
      'application/json'
      'application/opentype'
      'application/otf'
      'application/pkcs7-mime'
      'application/truetype'
      'application/ttf'
      'application/vnd.ms-fontobject'
      'application/xhtml+xml'
      'application/xml'
      'application/xml+rss'
      'application/x-font-opentype'
      'application/x-font-truetype'
      'application/x-font-ttf'
      'application/x-httpd-cgi'
      'application/x-javascript'
      'application/x-mpegurl'
      'application/x-opentype'
      'application/x-otf'
      'application/x-perl'
      'application/x-ttf'
      'font/eot'
      'font/ttf'
      'font/otf'
      'font/opentype'
      'image/svg+xml'
      'text/css'
      'text/csv'
      'text/html'
      'text/javascript'
      'text/js'
      'text/plain'
      'text/richtext'
      'text/tab-separated-values'
      'text/xml'
      'text/x-script'
      'text/x-component'
      'text/x-java-source'
    ]
    isCompressionEnabled: true
    isHttpAllowed: true
    isHttpsAllowed: true
    queryStringCachingBehavior: 'BypassCaching'
    origins: [
      {
        name: 'stmedev-blob-core-windows-net'
        properties: {
          hostName: 'stmedev.blob.core.windows.net'
          httpPort: 80
          httpsPort: 443
          originHostHeader: 'stmedev.blob.core.windows.net'
          priority: 1
          weight: 1000
          enabled: true
        }
      }
    ]
    originGroups: []
    geoFilters: []
    deliveryPolicy: {
      rules: [
        {
          name: 'CORS'
          order: 1
          conditions: [
            {
              name: 'RequestHeader'
              parameters: {
                typeName: 'DeliveryRuleRequestHeaderConditionParameters'
                operator: 'Equal'
                selector: 'Origin'
                negateCondition: false
                matchValues: [
                  'https://stmedev.z13.web.core.windows.net'
                ]
                transforms: []
              }
            }
          ]
          actions: [
            {
              name: 'ModifyResponseHeader'
              parameters: {
                typeName: 'DeliveryRuleHeaderActionParameters'
                headerAction: 'Overwrite'
                headerName: 'Access-Control-Allow-Origin'
                value: '*'
              }
            }
          ]
        }
        {
          name: 'CORSLocal'
          order: 2
          conditions: [
            {
              name: 'RequestHeader'
              parameters: {
                typeName: 'DeliveryRuleRequestHeaderConditionParameters'
                operator: 'Equal'
                selector: 'Origin'
                negateCondition: false
                matchValues: [
                  'http://localhost:9000'
                ]
                transforms: []
              }
            }
          ]
          actions: [
            {
              name: 'ModifyResponseHeader'
              parameters: {
                typeName: 'DeliveryRuleHeaderActionParameters'
                headerAction: 'Overwrite'
                headerName: 'Access-Control-Allow-Origin'
                value: '*'
              }
            }
          ]
        }
      ]
    }
  }
}

resource profiles_cdn_me_dev_name_me_cdn_stmedev_blob_core_windows_net 'Microsoft.Cdn/profiles/endpoints/origins@2022-11-01-preview' = {
  parent: profiles_cdn_me_dev_name_me_cdn
  name: 'stmedev-blob-core-windows-net'
  properties: {
    hostName: 'stmedev.blob.core.windows.net'
    httpPort: 80
    httpsPort: 443
    originHostHeader: 'stmedev.blob.core.windows.net'
    priority: 1
    weight: 1000
    enabled: true
  }
}
