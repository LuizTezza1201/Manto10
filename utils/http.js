function bodySeguro(req) {
    return req && req.body && typeof req.body === 'object' ? req.body : {};
}

function erroHttp(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

module.exports = { bodySeguro, erroHttp };
