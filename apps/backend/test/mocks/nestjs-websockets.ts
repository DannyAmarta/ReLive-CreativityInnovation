const identityDecorator =
  () =>
  (..._args: unknown[]) =>
    undefined;

export const WebSocketGateway = identityDecorator;
export const WebSocketServer = identityDecorator;
export const SubscribeMessage = identityDecorator;
export const ConnectedSocket = identityDecorator;
export const MessageBody = identityDecorator;

export class WsException extends Error {}
