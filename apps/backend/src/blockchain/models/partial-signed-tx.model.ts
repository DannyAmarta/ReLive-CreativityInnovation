import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * The response from requestRelease / requestRefund mutations.
 * The frontend decodes serializedTx, has the user countersign it in
 * their Phantom/Solflare wallet, then broadcasts to Solana.
 * The user pays the network gas fee — not the platform.
 */
@ObjectType()
export class PartialSignedTx {
  @Field()
  serializedTx: string; // Base64-encoded partially-signed Solana transaction

  @Field(() => Int)
  bookingId: number;

  @Field()
  instruction: string; // 'release_funds' | 'refund_booking'

  @Field({ nullable: true })
  escrowAddress?: string;
}
