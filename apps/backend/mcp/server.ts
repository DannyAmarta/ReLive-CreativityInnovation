import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import z from 'zod/v4';

const featureInventory = [
  {
    area: 'authentication',
    summary:
      'Email registration, JWT login, Google OAuth handoff, password reset, email change, and account deletion flows.',
    status: 'implemented',
  },
  {
    area: 'profiles',
    summary:
      'Profile view/update, avatar upload, and OpenRouter BYOK connection management.',
    status: 'implemented',
  },
  {
    area: 'set_tracking',
    summary:
      'Exercise catalog sync, strength/cardio set calculation, workout set logging, and analytics snapshots.',
    status: 'implemented',
  },
  {
    area: 'recommendations',
    summary:
      'Workout plan generation with server-key, BYOK, and deterministic fallback paths.',
    status: 'implemented',
  },
  {
    area: 'nutrition',
    summary:
      'Food and recipe search with layered cache/provider fallback and cache warmers.',
    status: 'implemented',
  },
  {
    area: 'trainer_marketplace',
    summary:
      'Trainer profiles, fiat registration, services, availability, bookings, reviews, and notification hooks.',
    status: 'implemented',
  },
  {
    area: 'fiat_payments',
    summary:
      'Duitku deposit, webhook handling, trainer ledger crediting, and withdrawal flow.',
    status: 'implemented',
  },
  {
    area: 'messaging',
    summary:
      'Socket.IO chat, presence, typing indicators, read receipts, and cross-room alerts.',
    status: 'implemented',
  },
  {
    area: 'solana',
    summary:
      'Escrow builders and indexer exist, but the path is intentionally incomplete and should be excluded from readiness gating.',
    status: 'partial',
  },
];

const testRecommendations = {
  authentication: [
    'Unit test all token-purpose flows and unhappy-path verification.',
    'Add resolver/controller integration coverage for login, forgot password, and email change handoff.',
  ],
  trainer_marketplace: [
    'Cover service pricing validation, booking RBAC transitions, reschedule flow, cancellation flow, and review eligibility.',
    'Exercise notification hooks with explicit assertions on recipient and message intent.',
  ],
  messaging: [
    'Cover authorized room joins, room broadcast, recipient push alert, status updates, typing events, and read receipts.',
  ],
  nutrition: [
    'Keep cache-hit, provider-fallback, and quota-failure tests for both food and recipe search.',
  ],
  set_tracking: [
    'Cover strength normalization, cardio validation, logging persistence, and analytics invocation.',
  ],
};

function toText(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

async function main() {
  const server = new McpServer({
    name: 'relive-backend',
    version: '1.0.0',
  });

  server.registerTool(
    'backend_feature_inventory',
    {
      title: 'Backend Feature Inventory',
      description:
        'Returns the major backend feature areas and notes which areas are implemented versus intentionally partial.',
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: toText(featureInventory),
        },
      ],
      structuredContent: {
        features: featureInventory,
      },
    }),
  );

  server.registerTool(
    'backend_test_recommendations',
    {
      title: 'Backend Test Recommendations',
      description:
        'Returns reusable test recommendations for a backend feature area, or all default recommendations when no area is provided.',
      inputSchema: {
        area: z.string().optional(),
      },
    },
    async ({ area }) => {
      const normalizedArea = area?.trim().toLowerCase() ?? null;
      const payload = normalizedArea
        ? {
            area: normalizedArea,
            recommendations:
              testRecommendations[normalizedArea as keyof typeof testRecommendations] ??
              ['No specific recommendation set is registered for that area yet.'],
          }
        : testRecommendations;

      return {
        content: [
          {
            type: 'text',
            text: toText(payload),
          },
        ],
        structuredContent: payload,
      };
    },
  );

  server.registerTool(
    'backend_release_scope',
    {
      title: 'Backend Release Scope',
      description:
        'Summarizes which backend areas should count toward release readiness and which areas are currently excluded.',
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: toText({
            includeInReadiness: featureInventory
              .filter((feature) => feature.status === 'implemented')
              .map((feature) => feature.area),
            excludedForNow: featureInventory
              .filter((feature) => feature.status !== 'implemented')
              .map((feature) => ({
                area: feature.area,
                reason: feature.summary,
              })),
          }),
        },
      ],
    }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
