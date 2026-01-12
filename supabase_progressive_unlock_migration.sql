-- Adicionar coluna para rastrear data de início da assinatura
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;

-- Criar índice para melhorar performance nas consultas por data
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_started_at ON profiles(subscription_started_at);

-- Comentário explicativo
COMMENT ON COLUMN profiles.subscription_started_at IS 'Data em que o usuário iniciou a assinatura paga (Standard/Premium). Usado para liberar conteúdo progressivamente a cada 7 dias.';
