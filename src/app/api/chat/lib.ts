import { createOpenAI } from "@ai-sdk/openai";
import { embed, tool, type EmbeddingModel } from "ai";
import { QdrantClient } from "@qdrant/js-client-rest";

import { z } from "zod/v4";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const QDRANT_COLLECTION_NAMES = {
  qna: "qna_chats",
};

export const IS_DEBUG = Boolean(process.env.VERBOSE);

const getInfoSchema = z.object({
  prompt: z.string().describe("A user prompt or search query"),
  searchStrategy: z
    .enum(["direct", "keywords", "synonyms", "technical", "simplified"])
    .optional()
    .describe("Search strategy to use"),
  attemptNumber: z.number().optional().describe("Current attempt number (1-4)"),
});

export const getInformationTool = tool({
  description:
    "Retrieve similar chats/information from the database. Use different search strategies if previous attempts didn't find relevant information. Try: direct quotes, key terms, synonyms, technical terms, or simplified language.",
  inputSchema: getInfoSchema,
  execute: async ({ prompt, searchStrategy = "direct", attemptNumber = 1 }) => {
    let searchQuery = prompt;

    // Generate different search queries based on strategy
    switch (searchStrategy) {
      case "keywords":
        // Extract key terms and remove common words for both English and Bahasa Indonesia
        searchQuery = prompt
          .toLowerCase()
          // Remove English stop words
          .replace(
            /\b(how|what|when|where|why|can|could|would|should|do|does|is|are|the|a|an|and|or|but|in|on|at|to|for|of|with|by|i|me|my|you|your|he|she|it|we|they|this|that|these|those|will|be|been|have|has|had)\b/g,
            "",
          )
          // Remove Bahasa Indonesia stop words
          .replace(
            /\b(apa|bagaimana|kapan|dimana|mengapa|kenapa|siapa|yang|ini|itu|dengan|untuk|dari|ke|di|pada|dalam|atau|dan|tetapi|tapi|adalah|akan|sudah|telah|sedang|saya|aku|kamu|anda|dia|mereka|kita|kami|bisa|dapat|harus|perlu|mau|ingin|seperti|jadi|juga|lagi|masih|belum)\b/g,
            "",
          )
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 2)
          .join(" ");
        break;
      case "synonyms":
        // Enhanced with Indonesian synonyms
        searchQuery = prompt
          // English synonyms
          .replace(
            /problem|issue/gi,
            "trouble difficulty error masalah kendala",
          )
          .replace(
            /fix|solve/gi,
            "repair resolve solution perbaiki selesaikan solusi",
          )
          .replace(/help|assist/gi, "support aid guidance bantuan dukungan")
          .replace(/question|ask/gi, "inquiry query pertanyaan tanya")
          // Indonesian synonyms
          .replace(/masalah|kendala/gi, "problem issue trouble kesulitan")
          .replace(/perbaiki|selesaikan/gi, "fix solve repair resolve")
          .replace(/bantuan|dukungan/gi, "help assist support aid")
          .replace(/pertanyaan|tanya/gi, "question ask inquiry")
          .replace(/bagaimana/gi, "how cara method")
          .replace(/dimana/gi, "where lokasi tempat");
        break;
      case "simplified":
        // Use simpler, more common terms for both languages
        searchQuery = prompt
          // English simplification
          .replace(/\b(?:utilize|implement|configure|initialize)\b/gi, "use")
          .replace(/\b(?:concerning|regarding|pertaining to)\b/gi, "about")
          .replace(/\b(?:assistance|support)\b/gi, "help")
          // Indonesian simplification
          .replace(/\b(?:menggunakan|memanfaatkan)\b/gi, "pakai")
          .replace(/\b(?:mengenai|berkaitan dengan|tentang)\b/gi, "soal")
          .replace(/\b(?:bantuan|dukungan)\b/gi, "tolong");
        break;
    }

    if (IS_DEBUG) {
      console.log(
        `Search attempt ${attemptNumber} using ${searchStrategy} strategy:`,
        searchQuery,
      );
    }

    const { embedding } = await getEmbeddings(searchQuery);
    const informations = await getTopKFromQnASnapshot(embedding);

    // Calculate relevance score (simple heuristic based on Qdrant scores)
    const relevanceThreshold = 0.6; // Adjust based on your data
    const relevantResults = informations.filter(
      (item) => (item.score || 0) > relevanceThreshold,
    );

    const result = {
      searchQuery,
      searchStrategy,
      attemptNumber,
      totalResults: informations.length,
      relevantResults: relevantResults.length,
      results: informations,
      hasRelevantInfo: relevantResults.length > 0,
      suggestions:
        attemptNumber < 4
          ? generateSearchSuggestions(prompt, searchStrategy)
          : [],
    };

    if (IS_DEBUG) {
      console.log(`Search result summary:`, {
        query: searchQuery,
        strategy: searchStrategy,
        attempt: attemptNumber,
        total: result.totalResults,
        relevant: result.relevantResults,
        hasRelevant: result.hasRelevantInfo,
      });
    }

    return result;
  },
});

function generateSearchSuggestions(
  originalPrompt: string,
  currentStrategy: string,
): string[] {
  const strategies = [
    "direct",
    "keywords",
    "synonyms",
    "technical",
    "simplified",
  ];
  const unusedStrategies = strategies.filter((s) => s !== currentStrategy);

  const suggestions = [];

  if (unusedStrategies.includes("keywords")) {
    suggestions.push("Try searching with just the key terms");
  }
  if (unusedStrategies.includes("synonyms")) {
    suggestions.push("Try using alternative terms or synonyms");
  }
  if (
    unusedStrategies.includes("technical") &&
    /[A-Z]{2,}|\w*(?:API|SDK|URL|HTTP|JSON|XML|CSS|HTML|JS|TS)\w*/i.test(
      originalPrompt,
    )
  ) {
    suggestions.push("Focus on technical terms");
  }
  if (unusedStrategies.includes("simplified")) {
    suggestions.push("Try simpler, more common language");
  }

  return suggestions.slice(0, 2); // Return max 2 suggestions
}

export async function getEmbeddings(
  value: string,
  model: EmbeddingModel = openai.textEmbedding("text-embedding-3-small"),
) {
  const { embedding, usage } = await embed({
    model,
    value,
  });

  return { embedding, usage };
}

export async function getTopKFromQnASnapshot(
  embedding: Array<number>,
  limit: number = 3,
  dbClient: QdrantClient = qdrant,
) {
  const topK = await dbClient.search(QDRANT_COLLECTION_NAMES.qna, {
    vector: embedding,
    limit,
  });

  return topK;
}

// Mock implementation for development/testing
export function mockStreamResponse() {
  const encoder = new TextEncoder();

  const mockMessages = [
    "I understand you're looking for information about KDEI Taipei. Let me search our database for you.",
    "\n\nBased on my search through our comprehensive knowledge base, I found several relevant pieces of information that might help answer your question.",
    "\n\n**Programs and Services:**\n- Language Exchange Programs: We offer weekly Indonesian-Mandarin language exchange sessions every Thursday from 6-8 PM at our main office.",
    "\n- Cultural Workshops: Monthly batik painting, traditional dance, and cooking classes are available for the Taiwanese community.",
    "\n- Business Networking: Quarterly business forums connecting Indonesian entrepreneurs with local Taiwanese businesses.",
    "\n\n**Contact Information:**\n- Address: 台北市信義區基隆路一段180號3樓 (3F, No. 180, Sec. 1, Keelung Rd., Xinyi Dist., Taipei City)",
    "\n- Phone: +886-2-2720-0200",
    "\n- Email: info@kdei-taipei.org.tw",
    "\n- Operating Hours: Monday-Friday 9:00 AM - 5:00 PM, Saturday 9:00 AM - 1:00 PM",
    "\n\n**Recent Updates:**\n- New visa application procedures have been streamlined as of January 2024",
    "\n- Digital services portal launched for faster document processing",
    "\n- Emergency hotline available 24/7 for Indonesian citizens: +886-900-123-456",
    "\n\n**Community Events:**\n- Independence Day celebration scheduled for August 17th at Taipei Main Station",
    "\n- Eid celebration community gathering at Da'an Forest Park",
    "\n- Traditional music performances every first Saturday of the month",
    "\n\n**Educational Support:**\n- Scholarship information for Indonesian students studying in Taiwan",
    "\n- Academic credential verification services",
    "\n- University application assistance program",
    "\n\n**Healthcare Services:**\n- Partnership with Taipei Medical University Hospital for Indonesian community",
    "\n- Mental health support services in Bahasa Indonesia",
    "\n- Health insurance guidance and enrollment assistance",
    "\n\n**Legal Assistance:**\n- Free legal consultation every Wednesday 2-4 PM",
    "\n- Labor rights advocacy and support",
    "\n- Immigration law guidance and documentation help",
    "\n\n**Trade and Investment:**\n- Indonesia-Taiwan trade promotion activities",
    "\n- Investment opportunity seminars",
    "\n- Export-import documentation assistance",
    "\n- Market research support for Indonesian businesses",
    "\n\n**Cultural Exchange:**\n- Sister city relationships between Indonesian and Taiwanese cities",
    "\n- Student exchange program coordination",
    "\n- Artist residency programs",
    "\n- Traditional craft exhibitions and demonstrations",
    "\n\n**Emergency Services:**\n- 24/7 emergency response for Indonesian citizens",
    "\n- Natural disaster assistance and coordination",
    "\n- Repatriation services when needed",
    "\n- Crisis communication with families in Indonesia",
    "\n\n**Digital Services:**\n- Online appointment booking system",
    "\n- Digital document submission portal",
    "\n- Virtual consultation services",
    "\n- Mobile app for community updates and services",
    "\n\n**Partnerships:**\n- Collaboration with Taipei City Government",
    "\n- Partnership with Indonesian business associations",
    "\n- Cooperation with local universities and research institutions",
    "\n- Alliance with other ASEAN representative offices",
    "\n\n**Special Programs:**\n- Indonesian language classes for Taiwanese citizens",
    "\n- Cultural sensitivity training for local businesses",
    "\n- Internship programs for Indonesian students",
    "\n- Professional development workshops",
    "\n\n**Media and Communications:**\n- Monthly newsletter in Indonesian and Chinese",
    "\n- Social media channels for community updates",
    "\n- Press releases and media coordination",
    "\n- Community bulletin board services",
    "\n\nI hope this comprehensive information helps answer your questions about KDEI Taipei. If you need specific details about any of these services or have other questions, please feel free to ask!",
  ];

  // Scripted mock with a tool call, matching UI Message Stream
  const toolCallId = "call_oW7H7fWxCFljHvDbogowUp03";
  // const fullText = mockMessages.join("");
  // Prebuilt mock tool output resembling a search result array
  const sampleResults = [
    {
      id: 695,
      version: 6,
      score: 0.70186156,
      payload: {
        pair: "[q] (orang) mau tanya di kdei bisa legalisir ijazah sama transkrip nilai s2 gak ya atau harus kampus nya sendiri kalo kampus yang legalisir di akui gak ya di indonesia buat lanjut kuliah atau buat jadi dosen gitu [a] untuk pelegalisasian dokumen di kdei taipei anda dapat datang ke lt 2 kdei taipei pelayanan endorsment di loket nomor 2 mengenai jam operasi pelayanan endorsmen kdei senin s/d jumat -penerimaan dokumen dari jam 09 00 s/d 11 30 loker nomor 2 -pengambilan dokumen dari jam 13 30 s/d 15 30 loket nomor 3 dokumen pelengkap yang dibutuhkan dalam melegalisasi surat ijazah/transkrip nilai di bidang endorsment kdei antara lain 1 ijazah dan transkrip nilai berbahasa inggris yang selesai di legalisasi oleh deplu taiwan atau notaris taiwan pilih satu instansi taiwan boleh di siapkan masing-masing 4 rangkap legalisasi paling banyak dari kami maksimal 8 rangkap 2 foto copy dari paspor arc kartu pelajar yang bersangkutan 3 foto copy dari ijazah dan transkrip nilai 4 legalisasi terkait ijazah tidak dikenakan biaya apapun pengurusan boleh diurus oleh pemohon sendiri atau diwakilkan oleh ybs semoga informasinya bermanfaat",
        turns: 1,
        chat_id: 826,
      },
    },
    {
      id: 1417,
      version: 14,
      score: 0.6994894,
      payload: {
        pair: "[q] pagi min mau tanya mengenai penyetaraan ijazah bener disini ya kalau penyetaraan ijazah di kbri taipei hasilanya sama kaya yg dikeluarin dikti di indo kan ya min [a] mohon ijin untuk melaporkan terkait penyetaraan ijazah akademi taiwan tetap harus melaporkan diri beserta dokumen yang sudah di legalisasi oleh kdei taipei kepada dikti indonesia terkait legalisasi ijazah dengan maksud penyetaraan di kdei ada 2 langkah 1 ijazah dan transkip nilai yang diberikan dari kampus taiwan harus dalam bahasa inggris dan selesai di legalisasi oleh deplu taiwan atau notaris taiwan pilih satu 2 setelah di legalisasi oleh bidang endorsement kdei taipei departemen luar negeri kdei akan memberikan surat keterangan dengan kop surat kdei taipei berikut semua dokumen yang ada akan di bawa ke dikti indonesia untuk di lakukan penyetaraan untuk pelegalisasian dokumen di kdei taipei silakan datang ke lt 2 kdei taipei pelayanan endorsment di loket nomor 2 dokumen pelengkap yang dibutuhkan dalam melegalisasi surat ijazah/transkrip nilai di bidang endorsment kdei antara lain 1 ijazah dan transkrip nilai berbahasa inggris yang selesai di legalisasi oleh deplu taiwan atau notaris taiwan pilih satu instansi taiwan boleh di siapkan masing-masing 4 rangkap legalisasi paling banyak dari kami maksimal 8 rangkap 2 foto copy dari paspor arc kartu pelajar yang bersangkutan 3 foto copy dari ijazah dan transkrip nilai 4 legalisasi terkait ijazah tidak dikenakan biaya apapun pengurusan boleh diurus oleh pemohon sendiri atau diwakilkan oleh ybs mengenai jam operasi pelayanan endorsement kdei senin s/d jumat -penerimaan dokumen 09 00 s/d 11 30 loket nomor 2 -pengambilan dokumen 13 30 s/d 15 30 loket nomor 3 tanpa revisi/janji waktu proses legalisasi dapat selesai kurang dari satu hari pagi diajukan jika dokumen tidak ada masalah siang hari itu juga jam pengambilan sudah bisa diambil kembali [q] jd dokumen2 dalam persyaratan khusus ini tetap hrs dilampirkan ya min seperti final project pengesahannya student handbook letter of acceptance dll [a] terkait hal ini silakan untuk menghubungi dikti indonesia kami hanya dapat membantu melegalisasi ijazah/transkip nilai yang dikeluarkan oleh sekolah taiwan untuk surat pernyataan/rekomen silakan untuk menghubungi bidang pwni sesuai dengan informasi yang kami jabarkan diatas",
        turns: 2,
        chat_id: 1823,
      },
    },
    {
      id: 1170,
      version: 11,
      score: 0.6994163,
      payload: {
        pair: "[q] (orang) ingin tanya kalau untuk penyetaraan ijazah syaratnya apa aja ya [a] mohon ijin untuk melaporkan terkait penyetaraan ijazah akademi taiwan tetap harus melaporkan diri beserta dokumen yang sudah di legalisasi oleh kdei taipei kepada dikti indonesia jika dirasa dibutuhkan legalisasi ijazah/transkrip nilai dari kdei berikut informasi mengenai persyaratan legalisasi ijazah/transkip nilai 1 ijazah dan transkrip nilai berbahasa inggris yang selesai di legalisasi oleh deplu taiwan atau notaris taiwan pilih satu instansi taiwan boleh di siapkan masing-masing 4 rangkap legalisasi paling banyak dari kami maksimal 8 rangkap 2 foto copy dari paspor arc kartu pelajar yang bersangkutan 3 foto copy dari ijazah dan transkrip nilai 4 legalisasi terkait ijazah tidak dikenakan biaya apapun pengurusan boleh diurus oleh pemohon sendiri atau diwakilkan untuk pelegalisasian dokumen di kdei taipei silakan datang ke lt 2 kdei taipei pelayanan endorsment di loket nomor 2 mengenai jam operasi pelayanan endorsement kdei -penerimaan dokumen dari jam 09 00 s/d 11 30 loker nomor 2 -pengambilan dokumen dari jam 13 30 s/d 15 30 loket nomor 3",
        turns: 1,
        chat_id: 1415,
      },
    },
  ];

  let isClosed = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stepIndex = 0;

  const stream = new ReadableStream({
    start(controller) {
      // Helper to send SSE JSON event
      const sendEvent = (obj: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(obj)}\n\n`),
          );
        } catch {
          isClosed = true;
          if (timer) clearTimeout(timer);
        }
      };

      // Global start of assistant message
      sendEvent({ type: "start" });
      // Start a step (tool invocation stage)
      sendEvent({ type: "start-step" });

      // Build a sequence of timed steps to emulate model + tool behavior
      type Step = () => void;
      const steps: Step[] = [];

      // 1) Tool call only (no reasoning, no assistant text), with ultra-fine/randomized input deltas

      // Small helper to split strings into randomized tiny chunks (inclusive bounds)
      const splitRandomChunks = (text: string, min = 1, max = 4) => {
        const chunks: string[] = [];
        let i = 0;
        while (i < text.length) {
          const size = Math.min(
            max,
            Math.max(min, Math.floor(Math.random() * (max - min + 1)) + min),
          );
          chunks.push(text.slice(i, i + size));
          i += size;
        }
        return chunks;
      };

      // 2) Tool call (input streaming, then available)
      const toolInputPrompt = "legalisir ijazah biaya dan cara di KDEI Taipei";
      const toolInputJson = JSON.stringify({ prompt: toolInputPrompt });
      const toolInputTokens = splitRandomChunks(toolInputJson, 1, 5);
      steps.push(() =>
        sendEvent({
          type: "tool-input-start",
          toolCallId: toolCallId,
          toolName: "getInformationTool",
        }),
      );
      // stream the JSON input as tiny token deltas
      for (const inputTextDelta of toolInputTokens) {
        steps.push(() =>
          sendEvent({
            type: "tool-input-delta",
            toolCallId: toolCallId,
            inputTextDelta,
          }),
        );
      }
      // final parsed input becomes available
      steps.push(() =>
        sendEvent({
          type: "tool-input-available",
          toolCallId: toolCallId,
          toolName: "getInformationTool",
          input: { prompt: toolInputPrompt },
        }),
      );

      // 3) Tool output available
      steps.push(() =>
        sendEvent({
          type: "tool-output-available",
          toolCallId: toolCallId,
          output: sampleResults,
        }),
      );

      // 4) Finish the step
      steps.push(() => sendEvent({ type: "finish-step" }));

      // 5) Stream assistant text from mockMessages as many small text parts
      // Each original mock message becomes its own text part, randomized per 1-4 chars
      for (let m = 0; m < mockMessages.length; m++) {
        const partId = `text-${m + 1}`;
        const msg = mockMessages[m];
        steps.push(() => sendEvent({ type: "text-start", id: partId }));
        const textChunks = splitRandomChunks(msg, 1, 4);
        for (const delta of textChunks) {
          steps.push(() =>
            sendEvent({ type: "text-delta", id: partId, delta }),
          );
        }
        steps.push(() => sendEvent({ type: "text-end", id: partId }));
      }

      // 6) Finish the message
      steps.push(() => sendEvent({ type: "finish" }));

      const runNext = () => {
        if (isClosed) return;
        if (stepIndex >= steps.length) {
          try {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch {}
          isClosed = true;
          if (timer) clearTimeout(timer);
          controller.close();
          return;
        }
        // Execute this step
        try {
          steps[stepIndex++]();
        } catch {
          // ignore
        }
        // Randomized ultra-tight scheduling: prefer microtasks, sometimes tiny timeouts (0-3ms)
        const gi = globalThis as typeof globalThis & {
          setImmediate?: (callback: () => void) => void;
        };
        const p = Math.random();
        if (typeof queueMicrotask === "function" && p < 0.65) {
          queueMicrotask(runNext);
        } else if (typeof gi.setImmediate === "function" && p < 0.9) {
          gi.setImmediate(runNext);
        } else {
          const delay = Math.floor(Math.random() * 4); // 0-3 ms
          timer = setTimeout(runNext, delay);
        }
      };

      runNext();
    },
    cancel() {
      isClosed = true;
      if (timer) clearTimeout(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "x-vercel-ai-ui-message-stream": "v1",
      "X-Accel-Buffering": "no",
    },
  });
}
