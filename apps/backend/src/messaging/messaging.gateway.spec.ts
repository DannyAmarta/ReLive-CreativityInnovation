import { MessagingGateway } from './messaging.gateway';

describe('MessagingGateway', () => {
  const messagingService = {
    getConversationById: jest.fn(),
    saveMessage: jest.fn(),
    markAsRead: jest.fn(),
  };

  let gateway: MessagingGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new MessagingGateway(messagingService as any);
    const targetedEmit = jest.fn();
    gateway.server = {
      emit: jest.fn(),
      to: jest.fn().mockReturnValue({ emit: targetedEmit }),
    } as any;
  });

  it('broadcasts a saved message to the room and alerts all active recipient sockets', async () => {
    messagingService.getConversationById.mockResolvedValue({
      trainerUserId: 2,
      clientUserId: 1,
    });
    messagingService.saveMessage.mockResolvedValue({
      id: 55,
      sender: { name: 'Client One' },
    });
    (gateway as any).activeUsers.set(2, new Set(['sock-a', 'sock-b']));

    const client = {
      data: { userId: 1 },
    } as any;

    await gateway.handleMessage(client, {
      conversationId: 77,
      content: 'Hello coach',
    });

    expect(messagingService.saveMessage).toHaveBeenCalledWith(77, 1, 'Hello coach');
    expect(gateway.server.to).toHaveBeenNthCalledWith(1, 'conv:77');
    expect(gateway.server.to).toHaveBeenNthCalledWith(2, 'sock-a');
    expect(gateway.server.to).toHaveBeenNthCalledWith(3, 'sock-b');
    const emit = (gateway.server.to as jest.Mock).mock.results[0].value.emit as jest.Mock;
    expect(emit).toHaveBeenCalledWith(
      'new_message',
      expect.objectContaining({ id: 55 }),
    );
    expect(emit).toHaveBeenCalledWith(
      'new_message_alert',
      expect.objectContaining({
        conversationId: 77,
        messageId: 55,
        senderId: 1,
        content: 'Hello coach',
      }),
    );
  });

  it('drops unauthorized room joins', async () => {
    messagingService.getConversationById.mockResolvedValue({
      trainerUserId: 9,
      clientUserId: 8,
    });
    const client = {
      data: { userId: 1 },
      join: jest.fn(),
    } as any;

    await gateway.handleJoinRoom(client, 77);

    expect(client.join).not.toHaveBeenCalled();
  });
});
