all: mcl_c.js mcl_c_nowasm.js

EMCC_OPT=-I ./mcl/include -I ./mcl/src -Wall -Wextra
EMCC_OPT+=-DNDEBUG
EMCC_OPT+=-DMCL_SIZEOF_UNIT=4
EMCC_OPT+=-s NO_EXIT_RUNTIME=1 -s NODEJS_CATCH_EXIT=0 -s NODEJS_CATCH_REJECTION=0
EMCC_OPT+=-s STRICT_JS=1
EMCC_OPT+=-s SINGLE_FILE=1
EMCC_OPT+=--minify 0
EMCC_OPT+=-DCYBOZU_MINIMUM_EXCEPTION
EMCC_OPT+=-s ABORTING_MALLOC=0

mcl_c.js:
	emcc -o $@ mcl/src/fp.cpp mcl/src/bn_c384_256.cpp $(EMCC_OPT) -O3 -s MODULARIZE=1 -s WASM=1 -DMCL_MAX_BIT_SIZE=384 -DMCL_USE_WEB_CRYPTO_API -s DISABLE_EXCEPTION_CATCHING=1 -DCYBOZU_DONT_USE_EXCEPTION -DCYBOZU_DONT_USE_STRING -fno-exceptions
	# disable require fs, path
	perl -i -pe 's@(.* = require\(.*)@//\1@' mcl_c.js

mcl_c_nowasm.js:
	emcc -o $@ mcl/src/fp.cpp mcl/src/bn_c384_256.cpp $(EMCC_OPT) -O3 -s MODULARIZE=1 -s WASM=0 -DMCL_MAX_BIT_SIZE=384 -DMCL_USE_WEB_CRYPTO_API -s DISABLE_EXCEPTION_CATCHING=1 -DCYBOZU_DONT_USE_EXCEPTION -DCYBOZU_DONT_USE_STRING -fno-exceptions
	# disable require fs, path
	perl -i -pe 's@(.* = require\(.*)@//\1@' mcl_c_nowasm.js

clean:
	rm -rf mcl_c.js
	rm -rf mcl_c_nowasm.js

.PHONY: clean mcl_c.js

