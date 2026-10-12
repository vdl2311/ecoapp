import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // Real EcoIA Chat Endpoint powered by Gemini 3.8 Flash
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, neighborhood, history } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Mensagem obrigatória' });
        return;
      }

      if (!ai) {
        res.status(503).json({
          error: 'Chave da API Gemini não configurada no servidor',
          reply: 'A assistente EcoIA está operando em modo offline temporário.',
        });
        return;
      }

      const systemInstruction = `Você é a EcoIA, a inteligência artificial oficial de sustentabilidade urbana, ecopontos e gestão comunitária de resíduos de Ipatinga - MG (Vale do Aço).
Sua missão é responder com empatia, linguagem natural, conhecimento técnico preciso e dicas práticas para moradores de Ipatinga.

Localização do morador: ${neighborhood || 'Ipatinga, MG'}.

Base de conhecimento local de Ipatinga:
1. Ecopontos Municipais Oficiais (SESUMA Ipatinga):
   - Ecoponto Cidade Nobre (id: 'eco-01'): Av. Carlos Chagas esq. com Graciliano Ramos. Aceita sofás/móveis, entulho residencial até 1m³ ensacado, podas e eletrônicos.
   - Ecoponto Bethânia/Canaã (id: 'eco-06'): Av. Selim José de Sales, 1850. Móveis, entulho, podas, eletrônicos.
   - Ecoponto Nova Esperança (id: 'eco-07'): Av. Alberto Giovanini. Entulho, podas e volumosos para região do Esperança e Bom Jardim.
2. Cooperativa COOPERCAVA (id: 'eco-02'): Rua José Teófilo, 280, Planalto/Limoeiro. Catadores locais de materiais recicláveis (papelão, latinhas de alumínio, plásticos duros, PET, eletrônicos limpos).
3. Medicamentos Vencidos e Cartelas (id: 'eco-03'): Devem ser entregues exclusivamente nos Totens Verdes em drogarias (ex: Av. Castelo Branco no Horto) ou Unidades Básicas de Saúde (UBS). Nunca jogar no vaso ou ralo para não contaminar o Ribeirão Ipanema.
4. Óleo de Cozinha Usado (id: 'eco-04'): NUNCA descartar na pia ou vaso. Deixar esfriar, coar e armazenar em garrafa PET transparente e levar a pontos de coleta (ex: Hipermercado Iguaçu, na Av. Brasil). Rende EcoPontos no app.
5. Ponto Ecológico Parque Ipanema (id: 'eco-05'): Recicláveis secos e totem para pilhas/baterias próximo à guarita.
6. APAE Ipatinga (id: 'eco-08'): Doações de roupas, agasalhos, livros, móveis e eletrodomésticos em bom estado para o bazar beneficente.
7. Caminhão Cata-Treco (SESUMA): Serviço público gratuito que recolhe móveis velhos, sofás e eletrodomésticos na calçada mediante agendamento prévio.
8. Regras Ambientais: Queima de lixo, folhas ou podas em quintais é infração grave e crime ambiental em Ipatinga. Descarte em encostas ou margens do Ribeirão Ipanema é estritamente proibido.

Diretrizes de resposta:
- Responda em português brasileiro de forma acolhedora, objetiva e útil.
- Seja realista, natural e conversacional (nunca pareça um robô com respostas prontas ou genéricas).
- Se o usuário perguntar sobre itens inusitados (ex: espelho quebrado, restos de tinta, pneus, pilhas, tecidos, restos de comida/compostagem), explique a melhor destinação e medidas de segurança.`;

      // Build conversation turns if history exists
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          if (item.sender === 'user' && item.text) {
            contents.push({ role: 'user', parts: [{ text: item.text }] });
          } else if (item.sender === 'ai' && item.text) {
            contents.push({ role: 'model', parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents as any,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Direct conversational, empathetic, detailed and helpful response in Portuguese.',
              },
              preparationTip: {
                type: Type.STRING,
                description: 'Short practical step-by-step tip on how to handle, wrap, clean or store the item before disposal (if applicable).',
              },
              suggestSchedule: {
                type: Type.BOOLEAN,
                description: 'True if this is a bulky item (furniture, sofa, large appliances) that can be scheduled for Cata-Treco free collection.',
              },
              recommendedPointIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'IDs of 1 to 2 best matching locations from: eco-01, eco-02, eco-03, eco-04, eco-05, eco-06, eco-07, eco-08.',
              },
            },
            required: ['reply'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Resposta vazia retornada pelo modelo Gemini');
      }

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Erro na rota /api/chat:', err);
      res.status(500).json({
        error: 'Falha ao consultar a EcoIA',
        details: err?.message || 'Erro interno',
        reply:
          'Tive uma pequena oscilação na conexão com a rede municipal. Para descarte imediato em Ipatinga, você pode levar ao Ecoponto Cidade Nobre ou agendar o Cata-Treco da SESUMA.',
        recommendedPointIds: ['eco-01'],
      });
    }
  });

  // Setup Vite in Dev or Serve Static in Prod
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoApp Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Erro fatal ao iniciar servidor:', err);
  process.exit(1);
});
