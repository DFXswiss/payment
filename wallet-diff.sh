# Script to compare the list of files copied from wallet with the
# originals.
#
#!/bin/bash

if [ $# -le 0 ] ; then
  echo "Usage: $0 <wallet-path>" ;
  exit 1
fi

WALLET_ROOT=$1
SKIP=0            # number of skipped local files (e.g. *~)
NOTEXIST=0        # number of non-existing wallet files
CDIFF=0           # number of diffs

# Enable ** pathname pattern expansion
shopt -s globstar

for i in `cat ./wallet-filemap.txt | grep -E -v '^#'` ; do
  WALLET_PATH=${WALLET_ROOT}/mobile-app/${i} ;

  if [ -f $i ] ; then
    if [ -f $WALLET_PATH ] ; then
      # Both files exist and are regular files => print the diff.
      diff -NaurEb $WALLET_PATH $i ;
      CDIFF=$((CDIFF+1))
    else
      # The wallet file does not exist.
      case $i in
        # Emacs backup file or similar? Just skip.
        *~) SKIP=$((SKIP+1)) ;;
        # No matching wallet file? Report it.
        *)  echo "File does not exist: $WALLET_PATH" >&2 ; NOTEXIST=$((NOTEXIST+1)) ;;
      esac
    fi
  fi
done

echo "Compared $CDIFF file pairs." >&2
echo "$NOTEXIST corresponding wallet files were missing." >&2
echo "Skipped $SKIP backup files." >&2
