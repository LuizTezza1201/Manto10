const PREFERENCIA_BOX_ESTRANGEIROS = 'Apenas times estrangeiros e seleções';
const CATEGORIA_BOX_MISTERIOSAS = 'box-misteriosas';
const LIGA_BRASILEIRAO = 'brasileirao';

function limitePedidosPendentes() {
    const limite = Number(process.env.LIMITE_PEDIDOS_PENDENTES || 3);
    return Number.isInteger(limite) && limite > 0 ? limite : 3;
}

module.exports = {
    PREFERENCIA_BOX_ESTRANGEIROS,
    CATEGORIA_BOX_MISTERIOSAS,
    LIGA_BRASILEIRAO,
    limitePedidosPendentes
};
