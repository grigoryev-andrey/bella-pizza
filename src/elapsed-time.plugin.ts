import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContextWillSendResponse,
} from '@apollo/server';

export function ElapsedTimePlugin(): ApolloServerPlugin {
  return {
    async requestDidStart(): Promise<GraphQLRequestListener<any>> {
      const start = performance.now();

      return {
        async willSendResponse(
          requestContext: GraphQLRequestContextWillSendResponse<{
            res?: { setHeader?: (name: string, value: string) => void };
          }>,
        ): Promise<void> {
          const elapsed = performance.now() - start;
          requestContext.contextValue.res?.setHeader?.(
            'X-Elapsed-Time',
            `${elapsed}ms`,
          );
        },
      };
    },
  };
}
