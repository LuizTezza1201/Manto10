USE manto10;

-- ============================================================
-- INTEGRAÇÃO MANTO 10 + WOOCOMMERCE
-- ============================================================

ALTER TABLE produtos
ADD COLUMN woocommerce_product_id BIGINT UNSIGNED NULL
AFTER tipo_camisa;

ALTER TABLE produto_tamanhos
ADD COLUMN woocommerce_variation_id BIGINT UNSIGNED NULL
AFTER tamanho_id;

CREATE INDEX idx_produtos_woocommerce
ON produtos (
    woocommerce_product_id
);

CREATE INDEX idx_tamanhos_woocommerce
ON produto_tamanhos (
    woocommerce_variation_id
);