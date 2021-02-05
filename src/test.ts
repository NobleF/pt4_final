// fichier requit par karma.conf.js. charge récursivement tout les fichiers .spec et framework

import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// pas de type pour la variable `__karma__`. on la déclare en any.
declare const __karma__: any;
declare const require: any;

// on empêche karma de se lancer trop tôt
__karma__.loaded = function () {};

// initialisation de l'environnement de test d'Angular
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// on trouve les tests.
const context = require.context('./', true, /\.spec\.ts$/);
// on charge les modules.
context.keys().map(context);
// on lance karma pour faire les tests.
__karma__.start();
