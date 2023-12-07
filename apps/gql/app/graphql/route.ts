import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createSchema, createYoga } from "graphql-yoga";

import { createActions } from "~/actions";
import { createClients } from "~/clients";
import { createLoaders } from "~/loaders";
import { resolvers } from "~/schema/resolvers";
import { type KampusGQLContext } from "~/schema/types";

const typeDefs = readFileSync(join(process.cwd(), "schema/schema.graphql"), "utf8").toString();
const clients = createClients();

const { handleRequest } = createYoga<KampusGQLContext>({
  schema: createSchema<KampusGQLContext>({ typeDefs, resolvers }),
  logging: "debug",
  graphiql: true,
  context: () => {
    const loaders = createLoaders(clients);
    const actions = createActions(clients);

    return {
      loaders,
      actions,
      pasaport: {
        session: null,
      },
    } satisfies KampusGQLContext;
  },

  fetchAPI: {
    Response,
    Request,
  },
});

export { handleRequest as GET, handleRequest as POST };
