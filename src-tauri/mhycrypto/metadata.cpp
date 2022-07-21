#include "metadata.h"

#include <cstring>
#include <random>
#include <stdio.h>

#include "memecrypto.h"
#include "metadatastringdec.h"

unsigned char initial_prev_xor[] = { 0xad, 0x2f, 0x42, 0x30, 0x67, 0x04, 0xb0, 0x9c, 0x9d, 0x2a, 0xc0, 0xba, 0x0e, 0xbf, 0xa5, 0x68 };

bool get_global_metadata_keys(uint8_t *src, size_t srcn, uint8_t *longkey, uint8_t *shortkey) {
    if (srcn != 0x4000)
        return false;

    if (*(uint16_t *) (src + 0xc8) != 0xfc2e || *(uint16_t *) (src + 0xca) != 0x2cfe)
        return true;

    auto offB00 = *(uint16_t *) (src + 0xd2);

    for (size_t i = 0; i < 16; i++)
        shortkey[i] = src[offB00 + i] ^ src[0x3000 + i];

    for (size_t i = 0; i < 0xb00; i++)
        longkey[i] = src[offB00 + 0x10 + i] ^ src[0x3000 + 0x10 + i] ^ shortkey[i % 16];

    return true;
}

bool gen_global_metadata_key(uint8_t* src, size_t srcn) {
    if (srcn != 0x4000)
        return false;
    
    #if 0
        std::vector<uint8_t> read_file(const char* n);
        auto data = read_file("xorpad.bin");
        memcpy(src, data.data(), 0x4000);

        return false;
    #endif

    std::mt19937_64 rand (0xDEADBEEF);

    uint64_t* key = (uint64_t*)src;

    for (size_t i = 0; i < srcn / sizeof(uint64_t); i++)
        key[i] = rand();

    *(uint16_t *) (src + 0xc8) = 0xfc2e; // Magic
    *(uint16_t *) (src + 0xca) = 0x2cfe; // Magic
    *(uint16_t *) (src + 0xd2) = rand() & 0x1FFFu; // Just some random value

    return true;
}

void decrypt_global_metadata_inner(uint8_t *data, size_t size) {
    uint8_t longkey[0xB00];
    uint8_t longkeyp[0xB0];
    uint8_t shortkey[16];
    get_global_metadata_keys(data + size - 0x4000, 0x4000, longkey, shortkey);
    for (int i = 0; i < 16; i++)
        shortkey[i] ^= initial_prev_xor[i];
    memecrypto_prepare_key(longkey, longkeyp);

    auto perentry = (uint32_t) (size / 0x100 / 0x40);
    for (int i = 0; i < 0x100; i++) {
        auto off = (0x40u * perentry) * i;

        uint8_t prev[16];
        memcpy(prev, shortkey, 16);
        for (int j = 0; j < 4; j++) {
            uint8_t curr[16];
            memcpy(curr, &data[off + j * 0x10], 16);

            memecrypto_decrypt(longkeyp, curr);

            for (int k = 0; k < 16; k++)
                curr[k] ^= prev[k];

            memcpy(prev, &data[off + j * 0x10], 16);
            memcpy(&data[off + j * 0x10], curr, 16);
        }
    }

    uint8_t literal_dec_key[0x5000];
    recrypt_global_metadata_header_string_fields(data, size, literal_dec_key);
    recrypt_global_metadata_header_string_literals(data, size, literal_dec_key);
}

extern "C" int decrypt_global_metadata(uint8_t *data, size_t size) {
    try {
        decrypt_global_metadata_inner(data, size);
        return 0;
    } catch (...) {
        return -1;
    }
}

void encrypt_global_metadata_inner(uint8_t* data, size_t size) {
    uint8_t literal_dec_key[0x5000];

    gen_global_metadata_key(data + size - 0x4000, 0x4000);

    generate_key_for_global_metadata_header_string(data, size, literal_dec_key);

    recrypt_global_metadata_header_string_literals(data, size, literal_dec_key);
    recrypt_global_metadata_header_string_fields(data, size, literal_dec_key);

    uint8_t longkey[0xB00];
    uint8_t longkeyp[0xB0];
    uint8_t shortkey[16];

    get_global_metadata_keys(data + size - 0x4000, 0x4000, longkey, shortkey);
    for (int i = 0; i < 16; i++)
        shortkey[i] ^= initial_prev_xor[i];
    memecrypto_prepare_key(longkey, longkeyp);

    auto perentry = (uint32_t) (size / 0x100 / 0x40);
    for (int i = 0; i < 0x100; i++) {
        auto off = (0x40u * perentry) * i;

        uint8_t prev[16];
        memcpy(prev, shortkey, 16);
        for (int j = 0; j < 4; j++) {
            uint8_t curr[16];
            memcpy(curr, &data[off + j * 0x10], 16);

            for (int k = 0; k < 16; k++)
                curr[k] ^= prev[k];

            memecrypto_encrypt(longkeyp, curr);

            memcpy(prev, curr, 16);
            memcpy(&data[off + j * 0x10], curr, 16);
        }
    }
}

extern "C" int encrypt_global_metadata(uint8_t* data, size_t size) {
    try {
        encrypt_global_metadata_inner(data, size);
        return 0;
    } catch (...) {
        return -1;
    }
}
