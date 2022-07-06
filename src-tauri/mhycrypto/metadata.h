#ifndef METADATA_H
#define METADATA_H

#include <cstdint>
#include <cstdlib>

extern "C" void decrypt_global_metadata(uint8_t *data, size_t size);
extern "C" void encrypt_global_metadata(uint8_t *data, size_t size);

#endif //METADATA_H
