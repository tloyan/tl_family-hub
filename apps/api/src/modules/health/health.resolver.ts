import { Resolver, Query } from '@nestjs/graphql';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { HealthStatus } from './health.model';

@AllowAnonymous()
@Resolver(() => HealthStatus)
export class HealthResolver {
  @Query(() => HealthStatus)
  health(): HealthStatus {
    return {
      status: 'ok',
      version: process.env['npm_package_version'] ?? '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }
}
