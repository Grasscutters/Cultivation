#include "memecrypto.h"

#include <cstring>
#include <stdio.h>

extern "C" void oqs_mhy128_enc_c(const uint8_t *plaintext, const void *_schedule, uint8_t *ciphertext);
extern "C" void oqs_mhy128_dec_c(const uint8_t *ciphertext, const void *_schedule, uint8_t *plaintext);

static uint8_t dexor16(const uint8_t *c) {
    uint8_t ret = 0;
    for (int i = 0; i < 16; i++)
        ret ^= c[i];
    return ret;
}

void memecrypto_prepare_key(const uint8_t *in, uint8_t *out) {
    for (int i = 0; i < 0xB0; i++)
        out[i] = dexor16(&in[0x10 * i]);
}

void memecrypto_decrypt(const uint8_t *key, uint8_t *data) {
  uint8_t plaintext[16];
  oqs_mhy128_enc_c(data, key, plaintext);
  memcpy(data, plaintext, 16);
}

void memecrypto_encrypt(const uint8_t *key, uint8_t *data) {
  uint8_t ciphertext[16];
  oqs_mhy128_dec_c(data, key, ciphertext);
  memcpy(data, ciphertext, 16);
}
