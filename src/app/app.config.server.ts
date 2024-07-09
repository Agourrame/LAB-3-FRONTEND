import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    HttpClient,
    BrowserModule
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
