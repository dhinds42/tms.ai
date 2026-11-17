/**
 * Test stub for '@base44/sdk'.
 * The real SDK package ships ESM-only and cannot be loaded by jest's CJS
 * pipeline ("Unexpected token 'export'"), and unit tests must never make
 * live SDK calls anyway. Mirrors the global stub in jest.setup.cjs.
 */
const makeEntity = () => ({
  filter: async () => [],
  getById: async () => null,
  create: async (data) => ({ id: 'test-stub-id', ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async () => true,
});

const entitiesProxy = new Proxy({}, { get: () => makeEntity() });

const client = {
  entities: entitiesProxy,
  asServiceRole: { entities: entitiesProxy },
  auth: { getUserId: async () => null, getUser: async () => null },
};

module.exports = { base44: client, createClient: () => client, __esModule: true };
