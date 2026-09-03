const multer =
    require('multer');

const path =
    require('path');

const fs =
    require('fs');

const crypto =
    require('crypto');

// ======================================================
// PASTA DOS UPLOADS
// ======================================================

const pastaUploads =
    path.join(
        __dirname,
        '..',
        'public',
        'images',
        'produtos',
        'uploads'
    );

fs.mkdirSync(
    pastaUploads,
    {
        recursive: true
    }
);

// ======================================================
// TIPOS PERMITIDOS
// ======================================================

const extensoesPermitidas = {

    'image/jpeg':
        '.jpg',

    'image/png':
        '.png',

    'image/webp':
        '.webp'

};

// ======================================================
// ARMAZENAMENTO
// ======================================================

const storage =
    multer.diskStorage({

        destination(
            req,
            file,
            callback
        ) {

            callback(
                null,
                pastaUploads
            );
        },

        filename(
            req,
            file,
            callback
        ) {

            const extensao =
                extensoesPermitidas[
                    file.mimetype
                ];

            const identificador =
                crypto
                    .randomBytes(10)
                    .toString('hex');

            const nomeArquivo =
                `${Date.now()}-${identificador}${extensao}`;

            callback(
                null,
                nomeArquivo
            );
        }

    });

// ======================================================
// MULTER
// ======================================================

const upload =
    multer({

        storage,

        limits: {

            fileSize:
                5 * 1024 * 1024

        },

        fileFilter(
            req,
            file,
            callback
        ) {

            if (
                !extensoesPermitidas[
                    file.mimetype
                ]
            ) {

                return callback(
                    new Error(
                        'Formato de imagem inválido. Use JPG, PNG ou WEBP.'
                    )
                );
            }

            return callback(
                null,
                true
            );
        }

    });

// ======================================================
// MIDDLEWARE
// ======================================================

function uploadImagemProduto(
    req,
    res,
    next
) {

    upload.single(
        'imagem'
    )(
        req,
        res,
        (erro) => {

            if (!erro) {

                return next();
            }

            if (
                erro instanceof
                multer.MulterError
            ) {

                if (
                    erro.code ===
                    'LIMIT_FILE_SIZE'
                ) {

                    return res
                        .status(400)
                        .send(
                            'A imagem deve ter no máximo 5 MB.'
                        );
                }

                return res
                    .status(400)
                    .send(
                        'Não foi possível enviar a imagem.'
                    );
            }

            return res
                .status(400)
                .send(
                    erro.message ||
                    'Imagem inválida.'
                );
        }
    );
}

module.exports =
    uploadImagemProduto;