import { Logger, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule, AuthService } from '@thallesp/nestjs-better-auth';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { PrismaService } from './modules/prisma/prisma.service';
import { HealthModule } from './modules/health/health.module';
import { HouseholdModule } from './modules/household/household.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PubSubModule } from './common/pubsub';
import { createAuth } from './lib/auth';
import type { Auth } from './lib/auth';

const wsLogger = new Logger('GraphQL-WS');

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      guard: { mount: true },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    PrismaModule,
    PubSubModule,
    AuthModule.forRootAsync({
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({
        auth: createAuth(prisma.bypassHouseholdFilter()),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [AuthService],
      useFactory: (authService: AuthService<Auth>) => ({
        autoSchemaFile: join(process.cwd(), 'schema.gql'),
        sortSchema: true,
        subscriptions: {
          'graphql-ws': {
            onConnect: async (ctx) => {
              const token = ctx.connectionParams?.['token'];
              if (!token || typeof token !== 'string') {
                wsLogger.warn('WebSocket connection rejected: no token');
                return false;
              }

              const session = await authService.api.getSession({
                headers: new Headers({ authorization: `Bearer ${token}` }),
              });

              if (!session) {
                wsLogger.warn('WebSocket connection rejected: invalid token');
                return false;
              }

              (ctx.extra as Record<string, unknown>)['session'] = session;
              return true;
            },
          },
        },
        context: ({
          req,
          extra,
        }: {
          req?: { session?: unknown };
          extra?: Record<string, unknown>;
        }) => {
          // WebSocket connections carry session in extra (set by onConnect)
          // HTTP connections carry session in req (set by auth middleware)
          if (extra?.['session']) {
            return { req: { session: extra['session'] } };
          }
          return { req };
        },
      }),
    }),
    HealthModule,
    HouseholdModule,
  ],
})
export class AppModule {}
