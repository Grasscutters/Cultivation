#ifndef MEMECRYPTO_H
#define MEMECRYPTO_H

#include <cstdint>

void memecrypto_prepare_key(const uint8_t *in, uint8_t *out);

void memecrypto_decrypt(const uint8_t *key, uint8_t *data);

void memecrypto_encrypt(const uint8_t *key, uint8_t *data);

#endif //MEMECRYPTO_H
