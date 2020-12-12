import 'qunit-dom';

import Application from 'ember-app/app';
import config from 'ember-app/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

start();
