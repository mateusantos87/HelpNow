# Fluxos de Usuário - HelpNow MVP

## Visão Geral

Este documento descreve os principais fluxos de usuário do MVP do HelpNow.

---

## 1. Cadastro e Onboarding

### 1.1 Cliente - Primeiro Acesso

```
[Splash Screen]
    ↓
[Onboarding Slides] (3 slides explicando o app)
    ↓
[Escolher Tipo] → "Sou Cliente" | "Sou Profissional"
    ↓ (Cliente)
[Cadastro Cliente]
    - Nome completo
    - E-mail
    - Telefone
    - Senha
    - [Aceitar Termos]
    ↓
[Verificar E-mail] (enviar link de verificação)
    ↓
[Permissão de Localização] → Solicitar permissão
    ↓
[HomePage Cliente]
```

### 1.2 Profissional - Primeiro Acesso

```
[Escolher Tipo] → "Sou Profissional"
    ↓
[Cadastro Profissional]
    - Nome completo
    - E-mail
    - Telefone
    - Senha
    - [Aceitar Termos]
    ↓
[Perfil Profissional]
    - Bio
    - Categorias de serviço (multi-select)
    - Preço por hora
    - Upload foto de perfil
    ↓
[Verificação de Identidade]
    - Upload documento (RG/CNH)
    - Upload comprovante residência
    - [Enviar para aprovação]
    ↓
[Aguardando Aprovação]
    - Mensagem: "Analisaremos em até 48h"
    - [Explorar app enquanto espera]
    ↓
[Conectar Conta Bancária]
    - Integração Stripe Connect
    - Onboarding Stripe
    ↓
[HomePage Profissional]
```

---

## 2. Fluxo do Cliente

### 2.1 Buscar e Solicitar Serviço

```
[HomePage Cliente]
    ↓
[Buscar Profissional]
    - Opção 1: Selecionar categoria
    - Opção 2: Buscar no mapa
    - Opção 3: Buscar por nome
    ↓
[Lista de Profissionais]
    - Filtros: Distância, Preço, Avaliação
    - Ordenar por: Distância, Avaliação, Preço
    ↓
[Selecionar Profissional] → Ver perfil
    ↓
[Perfil do Profissional]
    - Foto, nome, bio
    - Avaliações (lista)
    - Preço/hora
    - Botão: [Solicitar Serviço]
    ↓
[Formulário de Solicitação]
    - Categoria (pré-selecionada)
    - Título do serviço
    - Descrição detalhada
    - Data/hora preferida
    - Endereço (autocomplete ou mapa)
    - Upload fotos (opcional)
    - [Ver estimativa de custo]
    - Botão: [Enviar Solicitação]
    ↓
[Confirmação]
    - "Solicitação enviada!"
    - "O profissional tem 24h para responder"
    ↓
[Aguardar Resposta]
    - Push notification quando aceito/recusado
```

### 2.2 Acompanhar Serviço

```
[Push Notification] → "João aceitou seu pedido!"
    ↓
[Detalhes da Solicitação]
    - Status: "Aceito"
    - Profissional confirmou para: [Data/Hora]
    - Botão: [Chat com profissional]
    - Botão: [Cancelar] (se ainda não iniciou)
    ↓
[Status: Em Andamento]
    - Push notification: "João iniciou o serviço"
    - Ver localização ao vivo (opcional MVP)
    ↓
[Status: Concluído]
    - Push notification: "Serviço concluído"
    - Botão: [Proceder para Pagamento]
```

### 2.3 Pagamento e Avaliação

```
[Tela de Pagamento]
    - Resumo do serviço
    - Valor: €XX.XX
    - Método de pagamento:
      * Cartão de crédito/débito
      * Apple Pay
      * Google Pay
    - Botão: [Pagar]
    ↓
[Processar Pagamento] → Stripe
    ↓
[Confirmação de Pagamento]
    - "Pagamento realizado com sucesso!"
    ↓
[Avaliar Profissional]
    - Estrelas (1-5)
    - Categorias:
      * Pontualidade
      * Qualidade
      * Comunicação
      * Limpeza
    - Comentário (opcional)
    - Upload fotos do resultado (opcional)
    - Botão: [Enviar Avaliação]
    ↓
[Obrigado!]
    - "Obrigado pela avaliação!"
    - Botão: [Ver Histórico]
    - Botão: [Solicitar Novo Serviço]
```

### 2.4 Chat com Profissional

```
[Detalhes da Solicitação] → Botão [Chat]
    ↓
[Tela de Chat]
    - Mensagens em tempo real
    - Input de texto
    - Botão enviar foto (opcional MVP)
    - Push notification para mensagens
```

---

## 3. Fluxo do Profissional

### 3.1 Receber e Aceitar Pedido

```
[HomePage Profissional]
    ↓
[Push Notification] → "Novo pedido próximo a você!"
    ↓
[Lista de Pedidos Pendentes]
    - Card com:
      * Nome do cliente
      * Categoria
      * Distância
      * Data/hora preferida
      * Preço estimado
      * Botões: [Ver Detalhes] [Aceitar] [Recusar]
    ↓
[Ver Detalhes do Pedido]
    - Título e descrição completa
    - Endereço (mapa)
    - Fotos (se houver)
    - Perfil do cliente
    - Botões: [Aceitar] [Recusar]
    ↓
[Aceitar Pedido]
    - Confirmar data/hora
    - Confirmar preço
    - Botão: [Confirmar Aceitação]
    ↓
[Pedido Aceito]
    - Notificação enviada ao cliente
    - Status: "Agendado"
    - Adicionar ao calendário
```

### 3.2 Executar Serviço

```
[Meus Serviços] → Tab "Agendados"
    ↓
[Dia do Serviço]
    - Botão: [Iniciar Serviço]
    ↓
[Serviço em Andamento]
    - Status: "Em andamento"
    - Timer (opcional)
    - Botão: [Chat com cliente]
    - Botão: [Concluir Serviço]
    ↓
[Concluir Serviço]
    - Confirmar conclusão
    - Adicionar observações (opcional)
    - Botão: [Marcar como Concluído]
    ↓
[Aguardar Pagamento]
    - Cliente é notificado
    - Status: "Aguardando pagamento"
```

### 3.3 Receber Pagamento

```
[Push Notification] → "Pagamento recebido!"
    ↓
[Detalhes do Pagamento]
    - Valor do serviço: €XX
    - Taxa da plataforma (15%): €XX
    - Taxa Stripe (1.4% + €0.25): €X.XX
    - Você recebe: €XX.XX
    - Previsão de transferência: 2-7 dias úteis
    ↓
[Solicitar Avaliação]
    - "Por favor, peça ao cliente para avaliar"
    - Botão: [Ver Avaliação] (quando disponível)
```

### 3.4 Gerenciar Disponibilidade

```
[Perfil Profissional] → Tab "Disponibilidade"
    ↓
[Configurar Horários]
    - Toggle por dia da semana
    - Hora início / Hora fim
    - Botão: [Salvar]
    ↓
[Toggle Geral]
    - "Aceitando novos jobs"
    - ON/OFF (desativa temporariamente)
```

### 3.5 Ver Ganhos e Histórico

```
[HomePage Profissional] → Tab "Ganhos"
    ↓
[Dashboard Financeiro]
    - Card: "Este mês" → €XXX
    - Card: "Pendente" → €XX
    - Card: "Total ganho" → €XXXX
    - Gráfico mensal (opcional MVP)
    ↓
[Histórico de Serviços]
    - Lista de serviços concluídos
    - Filtro por período
    - Status de pagamento
```

---

## 4. Fluxo do Admin

### 4.1 Aprovar Profissional

```
[Admin Dashboard] → Tab "Profissionais Pendentes"
    ↓
[Lista de Profissionais Aguardando Aprovação]
    - Nome, e-mail, categoria
    - Botão: [Ver Detalhes]
    ↓
[Detalhes do Profissional]
    - Perfil completo
    - Documentos enviados (view)
    - Histórico (se houver)
    - Botões: [Aprovar] [Reprovar]
    ↓
[Aprovar]
    - Confirmar aprovação
    - Profissional é notificado
    - Status → "Ativo"
    ↓
[Reprovar]
    - Motivo da reprovação (dropdown)
    - Mensagem personalizada (opcional)
    - Profissional é notificado
```

### 4.2 Monitorar Serviços

```
[Admin Dashboard] → Tab "Serviços"
    ↓
[Lista de Serviços]
    - Filtros: Status, Data, Categoria
    - Busca por cliente/profissional
    ↓
[Ver Detalhes de Serviço]
    - Cliente e profissional envolvidos
    - Status atual
    - Timeline de eventos
    - Pagamento
    - Chat (visível para admin)
    - Botões: [Cancelar] [Reembolsar] (em casos de disputa)
```

### 4.3 Monitorar Pagamentos

```
[Admin Dashboard] → Tab "Pagamentos"
    ↓
[Resumo Financeiro]
    - Total processado hoje/mês
    - Taxas recebidas
    - Pendentes de transferência
    ↓
[Lista de Pagamentos]
    - Filtros: Status, Data, Método
    - Detalhes: Serviço, valores, taxas
    ↓
[Processar Reembolso] (se necessário)
    - Motivo
    - Valor (total ou parcial)
    - Confirmar
    ↓
[Stripe Dashboard]
    - Ver detalhes completos no Stripe
```

---

## 5. Fluxos Especiais

### 5.1 Cancelamento de Serviço

#### Cancelamento pelo Cliente (antes de iniciar):

```
[Detalhes da Solicitação]
    ↓
[Cancelar] → Confirmar cancelamento
    ↓
[Motivo do Cancelamento] (opcional)
    ↓
[Política de Cancelamento]
    - Gratuito até 2h antes
    - 50% de taxa < 2h
    ↓
[Profissional é Notificado]
    - Status → "Cancelado"
```

#### Cancelamento pelo Profissional:

```
[Meus Serviços] → Selecionar
    ↓
[Cancelar] → Motivo obrigatório
    ↓
[Confirmação]
    ↓
[Cliente é Notificado]
    - Oferecido profissional alternativo (futuro)
```

### 5.2 Disputa / Problema

```
[Serviço Concluído] → Cliente insatisfeito
    ↓
[Reportar Problema]
    - Categoria do problema
    - Descrição
    - Fotos (evidências)
    - Botão: [Enviar]
    ↓
[Admin é Notificado]
    - Status → "Em disputa"
    ↓
[Admin Analisa]
    - Ver evidências
    - Contatar cliente/profissional
    - Decisão: Reembolso / Resolver / Rejeitar
    ↓
[Resolução]
    - Ambos são notificados
    - Ações tomadas (reembolso, advertência)
```

### 5.3 Recuperação de Senha

```
[Login] → "Esqueci a senha"
    ↓
[Recuperar Senha]
    - Inserir e-mail
    - Botão: [Enviar]
    ↓
[E-mail Enviado]
    - Link de redefinição (Firebase Auth)
    ↓
[Clicar no Link]
    ↓
[Criar Nova Senha]
    - Nova senha
    - Confirmar senha
    - Botão: [Redefinir]
    ↓
[Login com Nova Senha]
```

---

## 6. Notificações Push

### Cliente:

1. **Profissional aceitou pedido**
2. **Profissional iniciou serviço**
3. **Serviço concluído** (solicitar pagamento)
4. **Pagamento confirmado**
5. **Nova mensagem no chat**
6. **Lembrete de avaliação**

### Profissional:

1. **Novo pedido próximo**
2. **Cliente enviou mensagem**
3. **Pagamento recebido**
4. **Nova avaliação recebida**
5. **Lembrete de serviço agendado** (1h antes)
6. **Conta aprovada pelo admin**

### Admin:

1. **Novo profissional aguardando aprovação**
2. **Disputa aberta**
3. **Pagamento falhado**

---

## 7. Estados dos Serviços

```
[pending] → Aguardando aceitação do profissional
    ↓
[accepted] → Profissional aceitou
    ↓
[scheduled] → Agendado para data/hora específica
    ↓
[in_progress] → Serviço em andamento
    ↓
[completed] → Serviço concluído, aguardando pagamento
    ↓
[paid] → Pagamento realizado
    ↓
[reviewed] → Cliente avaliou (final)

Estados alternativos:
[declined] → Profissional recusou
[cancelled] → Cancelado por cliente ou profissional
[disputed] → Em disputa
[refunded] → Reembolsado
```

---

## 8. Prioridades para MVP

### Fase 1 (Crítico):
- ✅ Cadastro cliente/profissional
- ✅ Busca de profissionais
- ✅ Solicitar serviço
- ✅ Aceitar/recusar pedido
- ✅ Pagamento básico
- ✅ Avaliações simples

### Fase 2 (Importante):
- ✅ Chat básico
- ✅ Notificações push
- ✅ Histórico de serviços
- ⏳ Dashboard admin

### Fase 3 (Desejável):
- ⏳ Cancelamento com política
- ⏳ Sistema de disputa
- ⏳ Relatórios financeiros
- ⏳ Profissionais favoritos

### Futuro (Pós-MVP):
- ❌ Agendamento recorrente
- ❌ Cupons e promoções
- ❌ Chat com fotos/documentos
- ❌ Sistema de referência
- ❌ Subscrição premium

---

**Última atualização:** 2025-12-11
