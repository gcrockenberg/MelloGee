global using Microsoft.AspNetCore.Mvc;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Design;
global using Microsoft.Extensions.Options;
global using Polly;
global using Polly.Retry;
global using System.Data.Common;
global using System.Data.SqlClient;
global using System.Globalization;
global using System.IO.Compression;
global using System.Text.RegularExpressions;


global using Me.Services.Catalog.API;
global using Me.Services.Catalog.API.Data;
global using Me.Services.Catalog.API.Data.EntityConfigurations;
global using Me.Services.Catalog.API.Extensions;
global using Me.Services.Catalog.API.IntegrationEvents;
global using Me.Services.Catalog.API.IntegrationEvents.EventHandlers;
global using Me.Services.Catalog.API.IntegrationEvents.Events;
global using Me.Services.Catalog.API.Model;
global using Me.Services.Catalog.API.ViewModel;
global using Me.Services.EventBus.Events;
global using Me.Services.EventBus.Abstractions;
global using Me.Services.EventBus.IntegrationEventLogEF;
global using Me.Services.EventBus.IntegrationEventLogEF.Services;
global using Me.Services.EventBus.IntegrationEventLogEF.Utilities;

global using Me.Services.Common;
