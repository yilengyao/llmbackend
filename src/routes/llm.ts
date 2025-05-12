import { Router, Request, Response, NextFunction } from 'express';
import { getModels, getCompletion, streamCompletion } from '../utils/llm_gateway_client';

const router = Router();

router.get(
  '/models',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const baseUrl = req.header('x-llm-base-url')!;
      const apiKey = req.header('x-llm-api-key')!;
      if (!baseUrl || !apiKey) {
        res.status(400).json({
          error: 'x-llm-base-url and x-llm-api-key headers are required'
        });
      }
      const models = await getModels(baseUrl, apiKey);
      res.json(models);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/completions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const baseUrl = req.header('x-llm-base-url')!;
      const apiKey = req.header('x-llm-api-key')!;
      if (!baseUrl || !apiKey) {
        res.status(400).json({
          error: 'x-llm-base-url and x-llm-api-key headers are required'
        });
      }
      const request = req.body;
      if (request.stream === true || request.stream === "true") {
        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.flushHeaders();
  
        for await (const chunk of streamCompletion(baseUrl, apiKey, request)) {
          res.write(chunk);
        }
        res.end();
      } else {
        const completion = await getCompletion(baseUrl, apiKey, request);
        res.json(completion);
      }
    } catch (err) {
      next(err);
    }
  }
);

export default router;