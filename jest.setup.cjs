/**
 * Jest test setup: stub the Base44 runtime global.
 * On the Base44 platform, server functions receive a global `base44` client
 * (auth context + asServiceRole). Unit tests run in plain Node, so we provide
 * a deterministic stub: filters return empty results, creates echo their data.
 * Tests that need real data should mock per-test; assertions on SDK data will
 * fail loudly rather than crash with ReferenceError.
 */
const makeEntity = () => ({
  filter: async () => [],
  getById: async () => null,
  create: async (data) => ({ id: 'test-stub-id', ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async () => true,
});

const entitiesProxy = new Proxy({}, { get: () => makeEntity() });

global.base44 = {
  entities: entitiesProxy,
  asServiceRole: { entities: entitiesProxy },
  auth: {
    getUserId: async () => null,
    getUser: async () => null,
  },
};
