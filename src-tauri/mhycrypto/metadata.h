#ifndef METADATA_H
#define METADATA_H

#include <cstdint>
#include <cstdlib>

extern "C" int decrypt_global_metadata(uint8_t *data, size_t size);
extern "C" int encrypt_global_metadata(uint8_t *data, size_t size);

#endif //METADATA_H
