import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  DEFAULT_LAMBDA,
  DEFAULT_THETA_BLOCK,
  DEFAULT_THETA_REVIEW,
  EXAMPLE_PROMPTS,
  PIAGUARD_CANARY,
  TABLE_1_BASELINES,
  TABLE_3_FAMILY_RECALL,
  TABLE_4_LATENCY
} from "./src/lib/constants";
import { defaultEngine, PIAGuardEngine } from "./src/lib/piaguard-engine";

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic rate-limiting map (in-memory for research demo)
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000;
  const RATE_LIMIT_MAX = 60;

  app.use(express.json({ limit: "1mb" }));

  // Custom rate-limiting middleware
  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith("/api/")) {
      const clientIp = req.ip || req.headers["x-forwarded-for"] || "local";
      const ipKey = String(clientIp);
      const now = Date.now();
      const record = rateLimitMap.get(ipKey);

      if (!record || now > record.resetTime) {
        rateLimitMap.set(ipKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      } else {
        record.count++;
        if (record.count > RATE_LIMIT_MAX) {
          return res.status(429).json({
            error: "Too Many Requests",
            message: "Rate limit exceeded. Research demo is limited to 60 requests/minute."
          });
        }
      }
    }
    next();
  });

  // Health check
  app.get(["/api/health", "/api/v1/health"], (req: Request, res: Response) => {
    res.json({
      status: "ok",
      system: "PIAGuard Research Platform",
      version: "1.0.0-pbl",
      scoring_model: "MockCausalLM / GPT-2 Emulated",
      canary_configured: PIAGUARD_CANARY,
      layers_active: ["L1_Sanitizer", "L2_LossShiftDetector", "L3_DecisionGate", "L4_OutputValidator"]
    });
  });

  // Public Configuration
  app.get("/api/v1/config", (req: Request, res: Response) => {
    res.json({
      theta_block: DEFAULT_THETA_BLOCK,
      theta_review: DEFAULT_THETA_REVIEW,
      lambda_weight: DEFAULT_LAMBDA,
      canary_token: PIAGUARD_CANARY,
      primary_aggregation: "topk_mean",
      top_k: 3,
      window_sizes: [1, 3],
      max_positions: 96,
      model_supported: ["gpt2", "gpt2-medium", "MockCausalLM"]
    });
  });

  // Example Prompts
  app.get("/api/v1/examples", (req: Request, res: Response) => {
    res.json({
      examples: EXAMPLE_PROMPTS
    });
  });

  // Evaluation Results
  app.get("/api/v1/evaluation/results", (req: Request, res: Response) => {
    res.json({
      table1_baselines: TABLE_1_BASELINES,
      table3_family_recall: TABLE_3_FAMILY_RECALL,
      table4_latency: TABLE_4_LATENCY,
      dataset_size: 88,
      calibration_prompts_count: 18,
      test_prompts_count: 70,
      test_attacks_count: 43,
      test_clean_count: 27,
      headline: {
        fused_auroc: 0.928,
        rule_only_auroc: 0.849,
        loss_shift_only_auroc: 0.690,
        perplexity_auroc: 0.732,
        fpr: 0.000,
        tpr_at_1_fpr: 0.767
      }
    });
  });

  // Dynamic Calibration Endpoint
  app.post("/api/v1/calibrate", (req: Request, res: Response) => {
    const { clean_prompts, target_fpr = 0.01, review_quantile = 0.85 } = req.body;

    if (!Array.isArray(clean_prompts) || clean_prompts.length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "clean_prompts must be a non-empty array of strings."
      });
    }

    const fusedScores: number[] = [];
    for (const prompt of clean_prompts) {
      const sanitized = defaultEngine.sanitize(prompt);
      const detector = defaultEngine.detect(sanitized.sanitized_prompt);
      const fused = detector.anomaly_score + DEFAULT_LAMBDA * sanitized.risk_score;
      fusedScores.push(fused);
    }

    fusedScores.sort((a, b) => a - b);
    const blockIdx = Math.min(
      fusedScores.length - 1,
      Math.floor((1 - target_fpr) * (fusedScores.length - 1))
    );
    const reviewIdx = Math.min(
      fusedScores.length - 1,
      Math.floor(review_quantile * (fusedScores.length - 1))
    );

    const thetaBlock = Number(fusedScores[blockIdx].toFixed(4));
    const thetaReview = Number(fusedScores[reviewIdx].toFixed(4));

    res.json({
      clean_prompts_evaluated: clean_prompts.length,
      target_fpr,
      review_quantile,
      derived_theta_block: thetaBlock,
      derived_theta_review: thetaReview,
      scores_distribution: fusedScores
    });
  });

  // Primary Analysis Endpoint: POST /api/v1/analyze
  app.post("/api/v1/analyze", (req: Request, res: Response) => {
    try {
      const {
        prompt,
        simulated_output,
        aggregation = "topk_mean",
        windows = [1, 3],
        theta_block = DEFAULT_THETA_BLOCK,
        theta_review = DEFAULT_THETA_REVIEW
      } = req.body;

      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return res.status(400).json({
          error: "Validation Error",
          message: "A non-empty 'prompt' string is required."
        });
      }

      if (prompt.length > 4096) {
        return res.status(400).json({
          error: "Payload Too Large",
          message: "Prompt exceeds maximum allowed length of 4096 characters."
        });
      }

      const engine = new PIAGuardEngine(theta_block, theta_review, DEFAULT_LAMBDA);
      const result = engine.analyze(prompt, simulated_output, {
        aggregation: aggregation === "robust_z" ? "robust_z" : "topk_mean",
        windows: Array.isArray(windows) ? windows : [1, 3]
      });

      return res.json(result);
    } catch (err: any) {
      console.error("PIAGuard Analysis Error:", err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while executing the PIAGuard pipeline."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PIAGuard Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
