require('dotenv').config();
const fs = require('fs');
const getOciMultipartId = require('../oci/helper/initMultipart');
const oci = require('../oci/client/ociClient');
const ociCommitPart= require('../oci/helper/commitMultipart');
const generatePAR = require('../oci/helper/generatePAR');

module.exports = async function StreamData(client, target, fileName, job, { user_id }) {
  try {
    // buffer download for small files
    // const buffer = await client.downloadMedia(event.message.media||event.message.file, {
    //         workers: 1,
    //     });

    // FetchMultipart OCI ID
    const uploadId = await getOciMultipartId(fileName);
    if(!uploadId) throw new Error('cannot find multipartId please Check OCI');
    const parts = [];
    let partNum = 1;
    await job.updateProgress({ user_id, progress: 'Upload Started' });
    for await (const chunk of client.iterDownload({
      file: target,
      requestSize: 1 * 1024 * 1024,   // define chunk you want
    })) {
      // fs.appendFileSync(`img${Date.now()}.jpeg`, chunk);    if you want write directly to disk 
      // iterfetch and upload
      const res = await oci.getClient().uploadPart({
        namespaceName: process.env.OCI_NAMESPACE,
        bucketName: process.env.OCI_BUCKETNAME,
        objectName: fileName,
        uploadId,
        uploadPartNum: partNum,
        uploadPartBody: chunk
      });
      parts.push({ partNum, etag: res.eTag });
      console.log("uploaded :", partNum);
      partNum++;
    }
    //committing all parts
    await ociCommitPart(fileName, uploadId, parts);

    await job.updateProgress({ user_id, progress: 'Upload Complete And Generating Link' });
    // generate PAR
    const par = await generatePAR(fileName);
    return `${process.env.OCI_BASE_PAR_URL}${par.preauthenticatedRequest.accessUri}`;
  } catch (error) {
    console.log("error in file stream", error);
    process.exit(1);
  }
}