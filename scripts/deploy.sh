DIST_DIR=dist-demo
rm -rf $DIST_DIR
cp -R scripts/demo $DIST_DIR
cd $DIST_DIR
ln -s ../lib/plain.js .
git init
git add -A
git commit -m 'Auto deploy to GitHub pages'
git push -f git@github.com:gera2ld/marked-input.git master:gh-pages
