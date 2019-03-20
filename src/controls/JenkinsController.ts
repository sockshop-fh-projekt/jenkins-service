import 'reflect-metadata';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  httpDelete,
  interfaces,
} from 'inversify-express-utils';
import {
  ApiOperationGet,
  ApiOperationPost,
  ApiOperationDelete,
  ApiPath,
  SwaggerDefinitionConstant,
} from 'swagger-express-ts';

import { JenkinsService } from '../services/JenkinsService';

import { CloudEvent } from 'cloudevent';

@ApiPath({
  name: 'Jenkins',
  path: '/',
  security: { apiKeyHeader: [] },
})
@controller('/')
export class JenkinsController implements interfaces.Controller {

  constructor() { }

  @ApiOperationPost({
    description: 'Handle channel events',
    parameters: {
      body: {
        description: 'Handle channel events',
        model: '',
        required: true,
      },
    },
    responses: {
      200: {
      },
    },
    summary: 'Handle channel events',
  })
  @httpPost('/')
  public async handleEvent(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ): Promise<void> {

    if (request.body.type) {
      const cloudEvent : CloudEvent = request.body;
      const jenkinsSvc : JenkinsService = await JenkinsService.getInstance();

      if (request.body.type == 'sh.keptn.events.new-artefact') {

        console.log('[jenkins-service]: Trigger new artefact.');
        await jenkinsSvc.newArtefact(cloudEvent.data);

      } else if (request.body.type == 'sh.keptn.events.configuration-changed') {

        console.log('[jenkins-service]: Trigger service deployment.');
        await jenkinsSvc.deployService(cloudEvent.data);

      } else if (request.body.type == 'sh.keptn.events.deployment-finished') {

        console.log('[jenkins-service]: Trigger service testing.');
        await jenkinsSvc.startTests(cloudEvent.data);

      } else if (request.body.type == 'sh.keptn.events.tests-finished') {

        console.log('[jenkins-service]: Trigger test evaluation.');
        await jenkinsSvc.evaluateTests(cloudEvent.data);

      } else {
        console.log(`[jenkins]: This service does not handle the event type ${request.body.type}.`);
      }
    }

    const result = {
      result: 'success',
    };

    response.send(result);
  }
}
