rm ./tt.xpi >> /dev/null 2>&1  
zip -r tt ./manifest.json ./icons ./src/*
mv ./tt.zip ./tt.xpi
