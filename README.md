# Pelada

App em Expo (React Native) para organizar futebol amador: agenda de jogos, chamada
com limite de vagas, sorteio de times (ordem de chegada, aleatório ou por nota),
cronômetro com fila de rodízio, avaliações estilo carta de FIFA e punição para quem
falta depois de confirmar presença.

## Rodando o projeto

```bash
npm install
npm run start   # abre o Metro/Expo Dev Tools (escaneie o QR code com o app Expo Go)
npm run web     # roda no navegador
npm run ios     # requer macOS + Xcode
npm run android # requer Android Studio / emulador
```

## Modo demonstração (sem backend)

Sem nenhuma configuração adicional, o app roda inteiro com **dados de exemplo**
(ver `src/lib/mockData.ts`) guardados no próprio aparelho via AsyncStorage
(`src/store/useAppStore.ts`, `src/store/useAuthStore.ts`). Isso permite testar todos
os fluxos — chamada, sorteio, cronômetro, avaliações, punições, admin — sem precisar
de internet ou conta em nenhum serviço.

Assim que o Supabase for configurado (próxima seção), a ideia é trocar as chamadas
das stores por queries reais ao Supabase (o cliente já está pronto em
`src/lib/supabase.ts`, exportando `isMockMode` para você saber qual modo está ativo).

## Configurando o Supabase (dados reais, multiusuário)

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e um novo projeto.
2. No **SQL Editor** do projeto, rode o conteúdo de `supabase/schema.sql` — ele cria
   todas as tabelas (jogadores, peladas, campos, agenda, jogos, chamada, times,
   avaliações, punições) já com Row Level Security configurada (cada pelada só é
   visível para quem faz parte dela; só admins editam configurações).
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
4. Crie um arquivo `.env` na raiz do projeto (veja `.env.example`):
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
   ```
5. Reinicie o `npm run start`. Com essas variáveis definidas, `isMockMode` vira
   `false` e o cliente Supabase (`src/lib/supabase.ts`) fica pronto para uso.
6. Em **Authentication**, habilite o provedor de e-mail/senha (ou o de sua
   preferência) para o cadastro de jogadores.

> Nesta primeira entrega, as telas continuam usando as stores mockadas mesmo com o
> Supabase configurado — o próximo passo é migrar cada ação das stores
> (`src/store/useAppStore.ts`) para chamadas reais via `supabase.from(...)`, e trocar
> o cronômetro/fila de rodízio para usar **Supabase Realtime** para sincronizar entre
> os aparelhos de todos os jogadores em tempo real.

## Estrutura do projeto

```
app/                        rotas (Expo Router)
  (auth)/                    login, cadastro
  (tabs)/                    agenda, jogadores, perfil, admin
  jogo/[id]/                 detalhe do jogo, sorteio, cronômetro, avaliar

src/
  types/                     modelo de dados (Player, Game, Attendance, Rating...)
  lib/
    teamDraft.ts              sorteio de times (chegada/aleatório/nota) + fila de rodízio
    punishment.ts             regras de punição por falta
    ratings.ts                cálculo da nota geral (carta estilo FIFA)
    schedule.ts                cálculo da próxima data de um jogo recorrente
    supabase.ts                cliente Supabase (ou null em modo mock)
    mockData.ts                dados de exemplo
  store/                      estado global (zustand + persistência local)
  components/                 componentes de UI reutilizáveis

supabase/schema.sql          schema completo + Row Level Security
```

## Como funcionam as regras principais

- **Sorteio de times** (`src/lib/teamDraft.ts`): recebe os confirmados e separa em
  times do tamanho configurado. Por nota, distribui em zig-zag (draft) para equilibrar
  a força dos times; por chegada, forma os times pela ordem de confirmação; aleatório
  embaralha. Goleiros são distribuídos um por time antes dos jogadores de linha.
- **Fila de rodízio**: os dois primeiros times da fila jogam; os demais ficam
  "de próximo". Quem vence fica esperando o próximo desafiante, quem perde vai para o
  fim da fila (empate: os dois saem e os dois próximos entram).
- **Punição** (`src/lib/punishment.ts`): confirmou presença e não foi = falta. A 1ª
  falta é só um aviso; a 2ª deixa o jogador de fora do próximo jogo; da 3ª em diante,
  fora dos 2 próximos jogos. O admin marca a falta na tela do jogo, depois de encerrado.
- **Nota geral / carta** (`src/lib/ratings.ts`): após cada jogo (ou ao entrar pela
  primeira vez), os jogadores avaliam quem jogou com eles (ataque, defesa,
  velocidade, de 1 a 5). A média vira a nota geral na escala 0-99, estilo carta de
  FIFA, com faixas de bronze/prata/ouro/especial.

## Próximos passos sugeridos

- Migrar as ações da store para Supabase (auth real, dados compartilhados entre
  jogadores) e ligar o Realtime no cronômetro/fila de rodízio.
- Notificações push (Expo Notifications) para lembrar da chamada e do resultado do
  sorteio.
- Convite de jogadores por link/WhatsApp para entrar numa pelada.
