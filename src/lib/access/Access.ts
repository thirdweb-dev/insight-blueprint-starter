import { serve } from "@hono/node-server";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { correlationId } from "../../middleware/correlation-id.js";
import { defaultLogger } from "../logger.js";
import { BlueprintAccessError } from "./Error.js";

type EndpointConfiguration<
  ParamsSchema extends z.AnyZodObject,
  QuerySchema extends z.AnyZodObject,
  BodySchema extends z.AnyZodObject,
  ResponseSchema extends z.ZodTypeAny = z.ZodUnknown,
> = {
  path: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  request?: {
    params?: ParamsSchema;
    query?: QuerySchema;
    body?: BodySchema;
  };
  response?: ResponseSchema;
  handler: (req: {
    params: z.infer<ParamsSchema>;
    query: z.infer<QuerySchema>;
    body: z.infer<BodySchema>;
  }) => Promise<z.infer<ResponseSchema>>;
};

/**
 * Defines the metadata for the API
 *
 * @title Title of the API
 * @version Version of the API
 * @description Metadata for the API
 */
type AccessMeta = {
  title?: string;
  version?: string;
  description?: string;
};

/**
 * Configuration options for the access layer
 *
 * @param port - The port to run the server on
 * @param meta - Metadata for the API
 */
type AccessInit = {
  port?: number;
  meta?: AccessMeta;
};

type ErrorResponseType = {
  error: string;
  correlationId?: string;
};

const ErrorResponseSchema = z.object({
  error: z.string(),
  correlationId: z.string().optional(),
});

export class Access {
  public app: OpenAPIHono;
  public port: number;

  constructor(init?: AccessInit) {
    this.port = init?.port || 3000;
    const app = new OpenAPIHono();

    // Add the correlationId middleware to all routes
    app.use("*", correlationId);

    app.get("/health", async (c) => {
      return c.json({
        status: "ok",
        correlationId: c.get("correlationId"),
      });
    });

    app.doc("/openapi.json", {
      openapi: "3.0.0",
      info: {
        title: init?.meta?.title || "Insight Blueprint",
        version: init?.meta?.version || "1.0.0",
        description: init?.meta?.description,
      },
    });

    // Error handling middleware
    app.onError((err, c) => {
      const _correlationId = c.get("correlationId");
      defaultLogger.error("Internal server error", err, {
        correlationId: _correlationId,
        status: c.res.status,
        method: c.req.method,
        path: c.req.path,
      });
      return c.json(
        { error: "Internal Server Error", correlationId: _correlationId },
        500,
      );
    });

    this.app = app;
  }

  public registerEndpoint<
    ParamsSchema extends z.AnyZodObject = z.ZodObject<
      Record<string, z.ZodTypeAny>
    >,
    QuerySchema extends z.AnyZodObject = z.ZodObject<
      Record<string, z.ZodTypeAny>
    >,
    BodySchema extends z.AnyZodObject = z.ZodObject<
      Record<string, z.ZodTypeAny>
    >,
    ResponseSchema extends z.ZodTypeAny = z.ZodTypeAny,
  >(
    route: EndpointConfiguration<
      ParamsSchema,
      QuerySchema,
      BodySchema,
      ResponseSchema
    >,
  ) {
    const openapiRoute = createRoute({
      path: route.path,
      method: route.method,
      request: {
        params: route.request?.params,
        query: route.request?.query,
        ...(route.request?.body && {
          body: {
            content: {
              "application/json": { schema: route.request.body },
            },
          },
        }),
      },
      responses: {
        ...(route.response && {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: route.response || z.unknown(),
              },
            },
          },
        }),
        400: {
          description: "Bad Request",
          content: {
            "application/json": {
              schema: ErrorResponseSchema,
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    });
    this.app.openapi(openapiRoute, async (c) => {
      try {
        const params = route.request?.params?.safeParse(c.req.param()) ?? {
          success: true,
          data: {},
        };
        if (!params.success) {
          return c.json<ErrorResponseType>(
            { error: params.error.message },
            400,
          );
        }

        const query = route.request?.query?.safeParse(c.req.query()) ?? {
          success: true,
          data: {},
        };
        if (!query.success) {
          return c.json<ErrorResponseType>({ error: query.error.message }, 400);
        }

        const body = route.request?.body?.safeParse(await c.req.json()) ?? {
          success: true,
          data: {},
        };
        if (!body.success) {
          return c.json<ErrorResponseType>({ error: body.error.message }, 400);
        }

        const result = await route.handler({
          params: params.data,
          query: query.data,
          body: body.data,
        });
        return c.json(result);
      } catch (err) {
        if (err instanceof BlueprintAccessError) {
          return c.json<ErrorResponseType>({ error: err.message }, err.status);
        }
        throw err;
      }
    });
  }

  public start() {
    serve({
      fetch: this.app.fetch,
      port: this.port,
    });
    defaultLogger.info(`Server running on port ${this.port}`);
  }
}
