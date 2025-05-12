import 'dotenv/config';
import express, { Request, Response } from 'express';
// import userRoutes from './routes/users';
import llmRoutes from './routes/llm';
import path from 'path';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(express.json());

// app.use('/api/users', userRoutes);
// 1) load your OpenAPI doc
const apiSpecPath = path.resolve(__dirname, '../src/api-docs.yaml');
const apiDoc = YAML.load(apiSpecPath) as Record<string, unknown>;

// serve Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDoc));

// 3) serve Swagger UI
app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(apiDoc)
);

// optional root endpoint
app.get('/', (_req, res) => {
    res.send('🚀 TypeScript backend running!');
});

app.use('/v1', llmRoutes);

const port = process.env.PORT ?? 3000;
app.listen(+port, () => {
    console.log(`Listening on http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/docs`);
});