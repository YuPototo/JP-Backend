import crypto from 'crypto'

export function decipherGCM(
    ciphertext: string,
    key: string,
    nonce: string,
    associatedData: string,
) {
    const encrypted = Buffer.from(ciphertext, 'base64')
    const decipher = crypto.createDecipheriv('AES-256-GCM', key, nonce)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: decipher 没有 setAuthTag 的 typing
    decipher.setAuthTag(encrypted.slice(-16))

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore：decipher 没有 setAAD 的 typing
    decipher.setAAD(Buffer.from(associatedData))

    const output = Buffer.concat([
        decipher.update(encrypted.slice(0, -16)),
        decipher.final(),
    ])

    return output.toString()
}
