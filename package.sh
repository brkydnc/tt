rm ./tt.xpi >> /dev/null 2>&1  
zip -r tt ./manifest.json ./popup ./content ./icons ./background.js ./browser-polyfill.min.js
mv ./tt.zip ./tt.xpi
