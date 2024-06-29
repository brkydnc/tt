rm ./tt.xpi >> /dev/null 2>&1  
zip -r tt ./manifest.json ./icons ./src/* ./out/*
mv ./tt.zip ./tt.xpi
