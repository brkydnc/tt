rm ./tt.xpi >> /dev/null 2>&1  
zip -r tt ./manifest.json ./popup ./icons ./background.js
mv ./tt.zip ./tt.xpi