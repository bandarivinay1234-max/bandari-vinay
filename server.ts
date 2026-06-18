import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure it in your Settings > Secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Check if Gemini is configured (for UX prompts/alerts)
  app.get("/api/config", (req, res) => {
    res.json({
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  const TOPIC_GUIDES: Record<string, { label: string; Q1_Focus: string; Q2_Focus: string; Q3_Focus: string; syllabus: string }> = {
    python: {
      label: "Python",
      Q1_Focus: "Python core memory management and mutability vs immutability (e.g., list side effects, passing references, ID allocation, mutating default arguments). Scenario: debugging a thread-unsafe background worker with mutable object accumulators.",
      Q2_Focus: "Memory and processing efficiency using generators vs list comprehensions (e.g., yield keyword, lazy evaluation, memory footprints when processing massive multi-gigabyte log streams in real-time).",
      Q3_Focus: "Custom Decorators and Context Managers (implementing custom decorators for API retry loops/execution timelines, or writing a custom context manager in standard Python to handle locked files).",
      syllabus: "Core performance, memory references, lazy execution stream parsing, and advanced functional metaprogramming techniques."
    },
    pandas: {
      label: "Pandas",
      Q1_Focus: "Vectorized data transformations versus traditional row iteration (e.g., why to avoid df.iterrows() or df.apply() in production, using built-in backend vector operations or mapped groups). Scenario: accelerating a 10-million row financial transaction dataset.",
      Q2_Focus: "High-performance indexing, merging, and grouping (e.g., MultiIndex alignments, categorical types, memory footprint overhead on high-cardinality split operations, joins with mismatched categories).",
      Q3_Focus: "Out-of-core and memory scale optimizations (e.g., loading and analyzing massive .csv databases in custom chunks, down-casting numeric formats, garbage collection trigger points).",
      syllabus: "Vectorization paradigms, high cardinality split-apply-combine, space complexity profiling, and memory-constrained streaming chunks."
    },
    numpy: {
      label: "NumPy",
      Q1_Focus: "Broadcasting mechanics, matrix alignment, and dimension mismatch operations (e.g., operations on different dimension shapes, array reshaping, matrix multipliers in neural tensor layers without loops).",
      Q2_Focus: "Array Slices: Views vs Deep Copies and memory shares (modifying slices, checking memory reference shares with np.shares_memory, avoiding silent copy overflows).",
      Q3_Focus: "Fancy indexing, logical boolean masking, and fast manual vector alignment (applying complex condition formulas across multi-column tables, boolean grids, fast pre-allocated vector updates).",
      syllabus: "Broadcasting dimension alignments, memory allocation arrays (slices vs copies), and boolean vector mask arrays."
    },
    machineLearning: {
      label: "Machine Learning",
      Q1_Focus: "Feature engineering hazards and multicollinearity reduction in linear/logistic paradigms (correlation matrices, Variance Inflation Factors (VIF), Lasso L1/Ridge L2 regularization, and PCA decomposition).",
      Q2_Focus: "Hyperparameter search optimization methodologies and severe data leakage (GridSearch vs Bayesian optimization, custom cross-validation splits, leakage of scalable properties during pre-split transformations).",
      Q3_Focus: "Decision boundary metrics and boosting tree split implementations in gradient boosting trees (e.g., XGBoost vs Random Forest gini splits vs residual learning rate tree weights).",
      syllabus: "Multicollinearity shrinkage, target & split validation leaks, and gradient expansion convergence estimators."
    },
    dl: {
      label: "Deep Learning",
      Q1_Focus: "Mitigating vanishing and exploding gradients in deep neural architectures (He/Xavier initializations, batch normalization layers, residual bypass connection mechanisms).",
      Q2_Focus: "Regularization mechanics during active training vs testing phases (Dropout scaling behavior, learning rate dynamic decay scheduling, weight decay/L2 layer constraints).",
      Q3_Focus: "Attention architecture bottlenecks (e.g., compute complexity of standard self-attention QKV, key-value caches in inference, or FlashAttention scaling).",
      syllabus: "Optimization optimization (norms & weights), training-time active layers, and dense calculation complexity patterns."
    },
    nlp: {
      label: "Natural Language Processing (NLP)",
      Q1_Focus: "Tokenization limits and sub-word vocabulary issues (BPE subwords, handling out-of-vocabulary terms in domain-specific lexicons, and token length limitations).",
      Q2_Focus: "Dense vectors, context embeddings, and semantic drift under fine-tuning (TF-IDF sparse vs dynamic embeddings, cosine distance index tradeoffs, fine-tuning drift).",
      Q3_Focus: "Causal language model parsing vs token probability decoding (e.g., temperature scaling, top-k/top-p decoding, and how decoding structures influence hallucination rates).",
      syllabus: "Token alignment strategies, embedding index trade-offs, and causal model probability sampler effects."
    },
    genai: {
      label: "Generative AI",
      Q1_Focus: "Retrieval-Augmented Generation (RAG) system issues (dynamic metadata filtering, chunking strategies, vector search indices, and lost-in-the-middle context window degradation).",
      Q2_Focus: "Parameter-efficient fine-tuning (LoRA / QLoRA adapters, ranks & alphas scaling, memory footprints during backpropagation).",
      Q3_Focus: "Safety guardrails and structural formats (prompt-injection bypass prevention, direct system alignment using DPO vs RLHF metrics).",
      syllabus: "RAG dense context retrievers, adapter weights optimization, and model alignment guardrail verification."
    }
  };

  // API Route: Start interview (Gen Q1)
  app.post("/api/interview/start", async (req, res) => {
    try {
      const { topic, round } = req.body;
      const ai = getAI();
      
      const guide = TOPIC_GUIDES[topic] || { label: topic.toUpperCase(), Q1_Focus: `Ask a general technical question on ${topic}`, syllabus: "Engineering overview" };
      const prompt = `You are an expert AI Technical Interviewer at a prestigious tech academy.
You are conducting a strict, highly practical, and real-world scenario-based technical interview of a student on: '${guide.label}'.
This is Question 1 of 3.

The focus of this specific question MUST be exactly on: ${guide.Q1_Focus}.

Your instructions:
1. Introduce yourself briefly (max 1 short sentence, e.g. "Welcome, I am Vinay. Let's start with your technical evaluation.")
2. Ask a highly practical, scenario-based question representing a production or real-world industrial engineering problem.
3. Be professional and concise. Do NOT give hints, code answers, or options. Ask the question directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ question: response.text });
    } catch (error: any) {
      console.error("Error in /api/interview/start:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: Next Question / Progress check
  app.post("/api/interview/next", async (req, res) => {
    try {
      const { topic, history, studentAnswer } = req.body;
      const ai = getAI();

      const historyStr = history
        .map((t: any) => `${t.role === "agent" ? "Interviewer" : "Student"}: ${t.text}`)
        .join("\n");

      const guide = TOPIC_GUIDES[topic] || { label: topic.toUpperCase(), Q1_Focus: "Q1", Q2_Focus: "Q2", Q3_Focus: "Q3" };

      // Calculate how many agent questions have been asked so far
      const agentQuestions = history.filter((t: any) => t.role === "agent");
      const questionCountAsked = agentQuestions.length;

      let nextFocus = "";
      let isCompleted = false;

      if (questionCountAsked === 1) {
        nextFocus = guide.Q2_Focus;
      } else if (questionCountAsked === 2) {
        nextFocus = guide.Q3_Focus;
      } else {
        isCompleted = true;
      }

      const prompt = `You are an expert AI Technical Interviewer. You are conducting an interview on: '${guide.label}'.
Here is the previous transcript of the conversation so far:
${historyStr}

The student just submitted their answer to your last question: "${studentAnswer}".

Your tasks:
1. Provide a direct, short (1 sentence) constructive feedback or acknowledgment on the student's response.
2. Formulate the "correctBenchmarkAnswer". This is the ideal, expert-level, validated correct benchmark response to the question they *just* answered. It must represent standard optimal industry practices, complete with explanation and proper API/library conventions. Ensure it is robust, detailed, and clear for study.
3. If isCompleted is true, set isCompleted to true and set nextQuestion to "".
4. Otherwise (we need to ask the next question), formulate the Next Question (Question ${questionCountAsked + 1} of 3).
   The focus of this next question MUST be strictly on: ${nextFocus}.
   Make sure it is based on a distinct real-world production scenario and has ZERO overlap with prior questions asked.

Return your response in JSON format matching the requested schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedback: {
                type: Type.STRING,
                description: "Constructive feedback on the student's last response (1 short, encourage-focused sentence).",
              },
              correctBenchmarkAnswer: {
                type: Type.STRING,
                description: "The ideal, correct benchmark answer key in the real-world for the question just answered.",
              },
              nextQuestion: {
                type: Type.STRING,
                description: "The next single interview question to ask. If isCompleted is true, this should be empty.",
              },
              isCompleted: {
                type: Type.BOOLEAN,
                description: "Whether the interview is complete (we have gathered 3 answers).",
              },
            },
            required: ["feedback", "correctBenchmarkAnswer", "nextQuestion", "isCompleted"],
          },
        },
      });

      if (!response.text) {
        throw new Error("No response from Gemini API");
      }

      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      console.error("Error in /api/interview/next:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: Final Evaluation / Grading
  app.post("/api/interview/evaluate", async (req, res) => {
    try {
      const { topic, history } = req.body;
      const ai = getAI();

      const historyStr = history
        .map((t: any) => `${t.role === "agent" ? "Interviewer" : "Student"}: ${t.text}`)
        .join("\n");

      const guide = TOPIC_GUIDES[topic] || { label: topic.toUpperCase() };
      const prompt = `You are a strict, objective, and expert AI Grading Panel.
You are evaluating the student's completed technical interview on the subject: '${guide.label}'.
Here is the complete transcript of the 3 questions and answers:
${historyStr}

Review the student's technical depth, accuracy, logic, and completeness of answers for each question on the topic '${guide.label}'.
Assign an overall score from 0 to 100 representing their technical mastery level. Be objective and strictly professional:
- A score of 60 or above qualifies the student to pass the interview.
- If answers are thin, generic, copying/restating the questions, or highly inaccurate, cardinally score below 60.

Provide:
1. An overall general feedback summary (2-3 sentences).
2. A bulleted list of 2-3 specific technical strengths demonstrated.
3. A bulleted list of 2-3 technical areas of improvement / recommendations.
4. A systematic, question-by-question detailedReview array of all 3 questions. For each element, include the question text asked, the student's answer, the correct validated benchmark answer in the real-world for that question, and a short comparison alignment evaluation.

Return your evaluation strictly in JSON format matching the requested schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: "The overall grade score between 0 and 100.",
              },
              passed: {
                type: Type.BOOLEAN,
                description: "True if score is >= 60, false otherwise.",
              },
              generalFeedback: {
                type: Type.STRING,
                description: "An expert summary review feedback (2-3 sentences).",
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 technical strengths shown.",
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 technical areas of improvement.",
              },
              detailedReview: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNum: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    studentAnswer: { type: Type.STRING },
                    correctBenchmarkAnswer: { type: Type.STRING },
                    evaluation: { type: Type.STRING, description: "Detailed 1-2 sentence comparison and score alignment evaluation." }
                  },
                  required: ["questionNum", "questionText", "studentAnswer", "correctBenchmarkAnswer", "evaluation"]
                },
                description: "The question-by-question comparative breakdown."
              }
            },
            required: ["score", "passed", "generalFeedback", "strengths", "improvements", "detailedReview"],
          },
        },
      });

      if (!response.text) {
        throw new Error("No response from Gemini API during evaluation");
      }

      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      console.error("Error in /api/interview/evaluate:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
