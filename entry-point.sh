#!/bin/bash
# echo $TOKEN
# echo $WMTS_LINK_WITH_TOKEN
# echo $LAYER_NAME 
replace-text.sh ./build REPLACE_ME_1 $TOKEN
replace-text.sh ./build REPLACE_ME_2 $WMTS_LINK_WITH_TOKEN
replace-text.sh ./build REPLACE_ME_3 $LAYER_NAME
exec "$@"