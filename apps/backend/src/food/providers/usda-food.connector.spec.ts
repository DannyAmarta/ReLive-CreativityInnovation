import { ConfigService } from '@nestjs/config';
import { UsdaFoodConnector } from './usda-food.connector';

describe('UsdaFoodConnector', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('maps USDA nutrients into the unified model', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        foods: [
          {
            fdcId: 123,
            description: 'Raw Apple',
            servingSize: 182,
            servingSizeUnit: 'g',
            foodNutrients: [
              { nutrientName: 'Energy', nutrientNumber: '1008', value: 95, unitName: 'KCAL' },
              { nutrientName: 'Protein', nutrientNumber: '1003', value: 0.5, unitName: 'G' },
              {
                nutrientName: 'Carbohydrate, by difference',
                nutrientNumber: '1005',
                value: 25.1,
                unitName: 'G',
              },
              { nutrientName: 'Total lipid (fat)', nutrientNumber: '1004', value: 0.3, unitName: 'G' },
              { nutrientName: 'Fiber, total dietary', nutrientNumber: '1079', value: 4.4, unitName: 'G' },
              { nutrientName: 'Sugars, total including NLEA', nutrientNumber: '2000', value: 18.9, unitName: 'G' },
              { nutrientName: 'Sodium, Na', nutrientNumber: '1093', value: 2, unitName: 'MG' },
            ],
          },
        ],
      }),
    }) as jest.Mock;

    const connector = new UsdaFoodConnector({
      get: jest.fn().mockReturnValue('test-key'),
    } as unknown as ConfigService);

    const result = await connector.searchFoods({
      query: 'apple',
      page: 1,
      pageSize: 10,
      servingSize: 100,
    });

    expect(result.items).toEqual([
      {
        id: 'usda:123',
        source: 'USDA',
        sourceId: '123',
        name: 'Raw Apple',
        description: 'Raw Apple',
        brand: null,
        referenceServingSize: 182,
        referenceServingUnit: 'g',
        servingSize: 100,
        servingUnit: 'g',
        per100gNutrients: {
          calories: 95,
          proteinGrams: 0.5,
          carbsGrams: 25.1,
          fatGrams: 0.3,
          fiberGrams: 4.4,
          sugarGrams: 18.9,
          sodiumMilligrams: 2,
        },
        nutrients: {
          calories: 95,
          proteinGrams: 0.5,
          carbsGrams: 25.1,
          fatGrams: 0.3,
          fiberGrams: 4.4,
          sugarGrams: 18.9,
          sodiumMilligrams: 2,
        },
      },
    ]);
  });
});
