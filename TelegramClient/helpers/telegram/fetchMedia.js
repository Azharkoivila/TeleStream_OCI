module.exports=async (messages)=>{
          if (messages && messages.length > 0) {
            const [message] = messages;
            if (message.media || message.media?.document) {
              let fileName = null;
              const fetchFileName = message.media.document?.attributes;
              fetchFileName ? fetchFileName.forEach((obj) => {
                if (obj.fileName) {
                  fileName = obj.fileName;
                } else {
                  fileName = 'file.bin';
                }
              }) : fileName = `photo${Date.now()}.jpeg`
              console.log(fileName);
              return {fileName,target:message.media || message.media?.document}
            }
          }
}