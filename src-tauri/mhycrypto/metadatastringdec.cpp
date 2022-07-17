#include "metadatastringdec.h"

#include <stdexcept>
#include <random>
#include <stdio.h>

struct m_header_fields {
    char filler1[0x18];
    uint32_t stringLiteralDataOffset; // 18
    uint32_t stringLiteralDataCount; // 1c
    uint32_t stringLiteralOffset; // 20
    uint32_t stringLiteralCount; // 24
    char filler2[0xd8 - 0x28];
    uint32_t stringOffset, stringCount;
};

struct m_literal {
    uint32_t offset, length;
};

void generate_key_for_global_metadata_header_string(uint8_t* data, size_t len, uint8_t* literal_dec_key) {
    if (len < sizeof(m_header_fields))
        throw std::out_of_range("data not big enough for global metadata header");

    uint32_t values[0x12] = {
            *(uint32_t *) (data + 0x60),
            *(uint32_t *) (data + 0x64),
            *(uint32_t *) (data + 0x68),
            *(uint32_t *) (data + 0x6c),
            *(uint32_t *) (data + 0x140),
            *(uint32_t *) (data + 0x144),
            *(uint32_t *) (data + 0x148),
            *(uint32_t *) (data + 0x14c),
            *(uint32_t *) (data + 0x100),
            *(uint32_t *) (data + 0x104),
            *(uint32_t *) (data + 0x108),
            *(uint32_t *) (data + 0x10c),
            *(uint32_t *) (data + 0xf0),
            *(uint32_t *) (data + 0xf4),
            *(uint32_t *) (data + 8),
            *(uint32_t *) (data + 0xc),
            *(uint32_t *) (data + 0x10),
            *(uint32_t *) (data + 0x14)
    };

    uint64_t seed = ((uint64_t) values[values[0] & 0xfu] << 0x20u) | values[(values[0x11] & 0xf) + 2];

    std::mt19937_64 rand (seed);

    for (int i = 0; i < 6; i++) // Skip
        rand();

    auto key64 = (uint64_t *) literal_dec_key;
    for (int i = 0; i < 0xa00; i++)
        key64[i] = rand();
}

void recrypt_global_metadata_header_string_fields(uint8_t *data, size_t len, uint8_t *literal_dec_key) {
    if (len < sizeof(m_header_fields))
        throw std::out_of_range("data not big enough for global metadata header");

    uint32_t values[0x12] = {
            *(uint32_t *) (data + 0x60),
            *(uint32_t *) (data + 0x64),
            *(uint32_t *) (data + 0x68),
            *(uint32_t *) (data + 0x6c),
            *(uint32_t *) (data + 0x140),
            *(uint32_t *) (data + 0x144),
            *(uint32_t *) (data + 0x148),
            *(uint32_t *) (data + 0x14c),
            *(uint32_t *) (data + 0x100),
            *(uint32_t *) (data + 0x104),
            *(uint32_t *) (data + 0x108),
            *(uint32_t *) (data + 0x10c),
            *(uint32_t *) (data + 0xf0),
            *(uint32_t *) (data + 0xf4),
            *(uint32_t *) (data + 8),
            *(uint32_t *) (data + 0xc),
            *(uint32_t *) (data + 0x10),
            *(uint32_t *) (data + 0x14)
    };

    uint64_t seed = ((uint64_t) values[values[0] & 0xfu] << 0x20u) | values[(values[0x11] & 0xf) + 2];

    std::mt19937_64 rand (seed);

    auto header = (m_header_fields *) data;
    header->stringCount ^= (uint32_t) rand();
    header->stringOffset ^= (uint32_t) rand();
    rand();
    header->stringLiteralOffset ^= (uint32_t) rand();
    header->stringLiteralDataCount ^= (uint32_t) rand();
    header->stringLiteralDataOffset ^= (uint32_t) rand();

    auto key64 = (uint64_t *) literal_dec_key;
    for (int i = 0; i < 0xa00; i++)
        key64[i] = rand();
}

void recrypt_global_metadata_header_string_literals(uint8_t *data, size_t len, uint8_t *literal_dec_key) {
    if (len < sizeof(m_header_fields))
        throw std::out_of_range("data not big enough for global metadata header");

    auto header = (m_header_fields *) data;
    if ((size_t) header->stringLiteralCount + header->stringLiteralOffset > len)
        throw std::out_of_range("file trimmed or string literal offset/count field invalid");

    auto literals = (m_literal *) (data + header->stringLiteralOffset);
    auto count = header->stringLiteralCount / sizeof(m_literal);
    for (size_t i = 0; i < count; i++) {
        auto slen = literals[i].length;
        uint8_t *str = data + header->stringLiteralDataOffset + literals[i].offset;
        uint8_t *okey = literal_dec_key + (i % 0x2800);

        if ((size_t) header->stringLiteralDataOffset + literals[i].offset + slen > len)
            throw std::out_of_range("file trimmed or contains invalid string entry");

        for (size_t j = 0; j < slen; j++)
            str[j] ^= literal_dec_key[(j + 0x1400u) % 0x5000u] ^ (okey[j % 0x2800u] + (uint8_t) j);
    }
}
