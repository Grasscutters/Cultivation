#ifndef METADATASTRINGDEC_H
#define METADATASTRINGDEC_H

#include <cstdint>
#include <cstdlib>

void recrypt_global_metadata_header_string_fields(uint8_t *data, size_t len, uint8_t *literal_dec_key);

void recrypt_global_metadata_header_string_literals(uint8_t *data, size_t len, uint8_t *literal_dec_key);

void generate_key_for_global_metadata_header_string(uint8_t* data, size_t len, uint8_t* literal_dec_key);

#endif //METADATASTRINGDEC_H
